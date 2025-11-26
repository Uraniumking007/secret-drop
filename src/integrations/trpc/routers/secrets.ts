import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { and, desc, eq, gte, inArray, isNull, or } from 'drizzle-orm'
import { protectedProcedure, publicProcedure } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'
import type { EncryptionLibrary } from '@/lib/encryption'
import type { ExpirationOption } from '@/lib/secret-utils'
import { db } from '@/db'
import {
  organizationMembers,
  organizations,
  secretAccessLogs,
  secrets,
  teamMembers,
  teams,
} from '@/db/schema'
import {
  decrypt,
  encrypt,
  generateEncryptionKey,
  generateSalt,
  hashEncryptionKey,
  hashPassword,
  verifyPassword,
} from '@/lib/encryption'
import { calculateExpiration, canViewSecret } from '@/lib/secret-utils'
import { extractRequestMetadata } from '@/lib/request-metadata'

const getRequestMetadata = (request?: Request | null) =>
  extractRequestMetadata(request)

const createSecretSchema = z.object({
  orgId: z.string(),
  teamId: z.string().nullable().optional(),
  name: z.string().min(1),
  data: z.string().min(1), // Plain text secret data
  encryptionLibrary: z
    .enum(['webcrypto', 'crypto-js', 'noble'])
    .default('webcrypto'),
  expiration: z.enum(['1h', '1d', '7d', '30d', 'never']).optional(),
  maxViews: z.number().positive().nullable().optional(),
  password: z.string().optional(),
  burnOnRead: z.boolean().default(false),
})

const updateSecretSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  data: z.string().min(1).optional(),
  encryptionLibrary: z.enum(['webcrypto', 'crypto-js', 'noble']).optional(),
  expiration: z.enum(['1h', '1d', '7d', '30d', 'never']).optional(),
  maxViews: z.number().positive().nullable().optional(),
  password: z.string().nullable().optional(),
  burnOnRead: z.boolean().optional(),
})

export const secretsRouter = {
  // Create a new secret
  create: protectedProcedure
    .input(createSecretSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user has access to organization
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, input.orgId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .limit(1)

      if (orgMember.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this organization',
        })
      }

      // Verify team access if teamId is provided
      if (input.teamId) {
        // TODO: Add team membership check when teams router is created
      }

      // Generate encryption key
      const encryptionKey = await generateEncryptionKey(
        input.encryptionLibrary as EncryptionLibrary,
      )

      // Encrypt the data
      const encrypted = await encrypt(
        input.data,
        encryptionKey,
        input.encryptionLibrary as EncryptionLibrary,
      )

      // Hash the encryption key for verification
      const keyHash = await hashEncryptionKey(
        encryptionKey,
        input.encryptionLibrary as EncryptionLibrary,
      )

      // Hash password if provided
      let passwordHash: string | null = null
      if (input.password) {
        const salt = await generateSalt()
        passwordHash = await hashPassword(
          input.password,
          salt,
          input.encryptionLibrary as EncryptionLibrary,
        )
        // Store salt with password hash (format: salt:hash)
        passwordHash = `${salt}:${passwordHash}`
      }

      // Calculate expiration
      const expiresAt = input.expiration
        ? calculateExpiration(input.expiration as ExpirationOption)
        : null

      // Create secret in database
      const [newSecret] = await db
        .insert(secrets)
        .values({
          orgId: input.orgId,
          teamId: input.teamId || null,
          name: input.name,
          encryptedData: JSON.stringify({
            data: encrypted.encryptedData,
            iv: encrypted.iv,
          }),
          encryptionKeyHash: keyHash,
          passwordHash,
          maxViews: input.maxViews || null,
          viewCount: 0,
          expiresAt,
          burnOnRead: input.burnOnRead,
          createdBy: userId,
        })
        .returning()

      // Log access
      await db.insert(secretAccessLogs).values({
        secretId: newSecret.id,
        userId,
        action: 'view',
        ipAddress: null, // TODO: Extract from request
        userAgent: null, // TODO: Extract from request
      })

      // Return secret metadata (NOT the encryption key or decrypted data)
      // Note: Encryption key should be stored client-side only
      // For now, we return it hex-encoded, but in production this should be handled differently
      return {
        id: newSecret.id,
        name: newSecret.name,
        orgId: newSecret.orgId,
        teamId: newSecret.teamId,
        createdAt: newSecret.createdAt,
        expiresAt: newSecret.expiresAt,
        maxViews: newSecret.maxViews,
        viewCount: newSecret.viewCount,
        burnOnRead: newSecret.burnOnRead,
        // Return encryption key ONLY on creation (client must store it securely)
        // Hex encoded for transport - client should store this in memory/sessionStorage
        encryptionKey: Array.from(encryptionKey)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(''),
      }
    }),

  // Get a secret (requires encryption key from client)
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        encryptionKey: z.string(), // Hex encoded encryption key
        password: z.string().optional(),
        encryptionLibrary: z
          .enum(['webcrypto', 'crypto-js', 'noble'])
          .default('webcrypto'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id
      const metadata = getRequestMetadata(ctx.request)

      // Get secret
      const secretsList = await db
        .select()
        .from(secrets)
        .where(and(eq(secrets.id, input.id), isNull(secrets.deletedAt)))
        .limit(1)

      if (secretsList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret not found',
        })
      }

      const secret = secretsList[0]

      // Verify user has access to organization
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, secret.orgId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .limit(1)

      if (orgMember.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this secret',
        })
      }

      // Check if secret can be viewed
      const canView = canViewSecret(
        secret.viewCount,
        secret.maxViews,
        secret.expiresAt,
        secret.burnOnRead,
        secret.viewCount > 0,
      )

      if (!canView.canView) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: canView.reason || 'Cannot view secret',
        })
      }

      // Verify password if required
      if (secret.passwordHash) {
        if (!input.password) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Password required to access this secret',
          })
        }

        const [salt, hash] = secret.passwordHash.split(':')
        const isValid = await verifyPassword(
          input.password,
          salt,
          hash,
          input.encryptionLibrary as EncryptionLibrary,
        )

        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid password',
          })
        }
      }

      // Convert hex key back to Uint8Array
      const encryptionKey = Uint8Array.from(
        input.encryptionKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
      )

      // Verify key hash
      const keyHash = await hashEncryptionKey(
        encryptionKey,
        input.encryptionLibrary as EncryptionLibrary,
      )

      if (keyHash !== secret.encryptionKeyHash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid encryption key',
        })
      }

      // Decrypt the data
      const encryptedData = JSON.parse(secret.encryptedData)
      const decrypted = await decrypt(
        encryptedData.data,
        encryptedData.iv,
        encryptionKey,
        input.encryptionLibrary as EncryptionLibrary,
      )

      // Increment view count
      await db
        .update(secrets)
        .set({
          viewCount: secret.viewCount + 1,
          // Delete if burn-on-read
          deletedAt: secret.burnOnRead ? new Date() : null,
        })
        .where(eq(secrets.id, secret.id))

      // Log access
      await db.insert(secretAccessLogs).values({
        secretId: secret.id,
        secretName: secret.name,
        secretOwnerId: secret.createdBy,
        userId,
        action: 'view',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      })

      return {
        id: secret.id,
        name: secret.name,
        data: decrypted.decryptedData,
        orgId: secret.orgId,
        teamId: secret.teamId,
        createdAt: secret.createdAt,
        expiresAt: secret.expiresAt,
        maxViews: secret.maxViews,
        viewCount: secret.viewCount + 1,
        burnOnRead: secret.burnOnRead,
      }
    }),
  // Public secret view (no auth)
  publicView: publicProcedure
    .input(
      z.object({
        id: z.string(),
        encryptionKey: z.string(),
        password: z.string().optional(),
        encryptionLibrary: z
          .enum(['webcrypto', 'crypto-js', 'noble'])
          .default('webcrypto'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const metadata = getRequestMetadata(ctx.request)

      const secretsList = await db
        .select()
        .from(secrets)
        .where(and(eq(secrets.id, input.id), isNull(secrets.deletedAt)))
        .limit(1)

      if (secretsList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret not found',
        })
      }

      const secret = secretsList[0]

      const canView = canViewSecret(
        secret.viewCount,
        secret.maxViews,
        secret.expiresAt,
        secret.burnOnRead,
        secret.viewCount > 0,
      )

      if (!canView.canView) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: canView.reason || 'Cannot view secret',
        })
      }

      if (secret.passwordHash) {
        if (!input.password) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Password required to access this secret',
          })
        }

        const [salt, hash] = secret.passwordHash.split(':')
        const isValid = await verifyPassword(
          input.password,
          salt,
          hash,
          input.encryptionLibrary as EncryptionLibrary,
        )

        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid password',
          })
        }
      }

      const encryptionKey = Uint8Array.from(
        input.encryptionKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
      )

      const keyHash = await hashEncryptionKey(
        encryptionKey,
        input.encryptionLibrary as EncryptionLibrary,
      )

      if (keyHash !== secret.encryptionKeyHash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid encryption key',
        })
      }

      const encryptedData = JSON.parse(secret.encryptedData)
      const decrypted = await decrypt(
        encryptedData.data,
        encryptedData.iv,
        encryptionKey,
        input.encryptionLibrary as EncryptionLibrary,
      )

      await db
        .update(secrets)
        .set({
          viewCount: secret.viewCount + 1,
          deletedAt: secret.burnOnRead ? new Date() : null,
        })
        .where(eq(secrets.id, secret.id))

      await db.insert(secretAccessLogs).values({
        secretId: secret.id,
        secretName: secret.name,
        secretOwnerId: secret.createdBy,
        userId: null,
        action: 'view',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      })

      return {
        id: secret.id,
        name: secret.name,
        data: decrypted.decryptedData,
        createdAt: secret.createdAt,
        expiresAt: secret.expiresAt,
        maxViews: secret.maxViews,
        viewCount: secret.viewCount + 1,
        burnOnRead: secret.burnOnRead,
      }
    }),

  // List secrets for an organization
  list: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        teamId: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user has access to organization
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, input.orgId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .limit(1)

      if (orgMember.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this organization',
        })
      }

      const role = orgMember[0].role

      // Get user's teams in this org
      const userTeams = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .innerJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(
          and(eq(teamMembers.userId, userId), eq(teams.orgId, input.orgId)),
        )

      const userTeamIds = userTeams.map((t) => t.teamId)

      // Build conditions
      const conditions = [
        eq(secrets.orgId, input.orgId),
        isNull(secrets.deletedAt),
      ]

      if (input.teamId) {
        conditions.push(eq(secrets.teamId, input.teamId))
      }

      // Access control filter
      if (role !== 'owner' && role !== 'admin') {
        // Regular member: can see own secrets OR secrets shared with their teams
        const accessCondition = or(
          eq(secrets.createdBy, userId),
          userTeamIds.length > 0
            ? inArray(secrets.teamId, userTeamIds)
            : undefined,
        )
        if (accessCondition) {
          conditions.push(accessCondition)
        }
      }

      // Get secrets
      const secretList = await db
        .select({
          id: secrets.id,
          name: secrets.name,
          orgId: secrets.orgId,
          teamId: secrets.teamId,
          maxViews: secrets.maxViews,
          viewCount: secrets.viewCount,
          expiresAt: secrets.expiresAt,
          burnOnRead: secrets.burnOnRead,
          createdAt: secrets.createdAt,
          createdBy: secrets.createdBy,
        })
        .from(secrets)
        .where(and(...conditions))
        .orderBy(desc(secrets.createdAt))

      return secretList
    }),

  // Update a secret
  update: protectedProcedure
    .input(updateSecretSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id
      const { id, ...updates } = input

      // Get existing secret
      const secretsList = await db
        .select()
        .from(secrets)
        .where(and(eq(secrets.id, id), isNull(secrets.deletedAt)))
        .limit(1)

      if (secretsList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret not found',
        })
      }

      const secret = secretsList[0]

      // Verify user has access (must be owner or admin)
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, secret.orgId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .limit(1)

      if (orgMember.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this secret',
        })
      }

      // Check if user is owner or admin (or created the secret)
      const canEdit =
        orgMember[0].role === 'owner' ||
        orgMember[0].role === 'admin' ||
        secret.createdBy === userId

      if (!canEdit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this secret',
        })
      }

      const updateData: Partial<typeof secrets.$inferInsert> = {}

      if (updates.name) {
        updateData.name = updates.name
      }

      if (updates.data) {
        // Re-encrypt with new data
        const encryptionLibrary = (updates.encryptionLibrary ||
          'webcrypto') as EncryptionLibrary
        const encryptionKey = await generateEncryptionKey(encryptionLibrary)
        const encrypted = await encrypt(
          updates.data,
          encryptionKey,
          encryptionLibrary,
        )
        const keyHash = await hashEncryptionKey(
          encryptionKey,
          encryptionLibrary,
        )

        updateData.encryptedData = JSON.stringify({
          data: encrypted.encryptedData,
          iv: encrypted.iv,
        })
        updateData.encryptionKeyHash = keyHash
      }

      if (updates.expiration !== undefined) {
        updateData.expiresAt = calculateExpiration(
          updates.expiration as ExpirationOption,
        )
      }

      if (updates.maxViews !== undefined) {
        updateData.maxViews = updates.maxViews
      }

      if (updates.password !== undefined) {
        if (updates.password === null) {
          updateData.passwordHash = null
        } else {
          const salt = await generateSalt()
          const passwordHash = await hashPassword(
            updates.password,
            salt,
            (updates.encryptionLibrary || 'webcrypto') as EncryptionLibrary,
          )
          updateData.passwordHash = `${salt}:${passwordHash}`
        }
      }

      if (updates.burnOnRead !== undefined) {
        updateData.burnOnRead = updates.burnOnRead
      }

      updateData.updatedAt = new Date()

      const [updated] = await db
        .update(secrets)
        .set(updateData)
        .where(eq(secrets.id, id))
        .returning()

      // Log access
      await db.insert(secretAccessLogs).values({
        secretId: id,
        userId,
        action: 'edit',
        ipAddress: null,
        userAgent: null,
      })

      return {
        id: updated.id,
        name: updated.name,
        orgId: updated.orgId,
        teamId: updated.teamId,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        expiresAt: updated.expiresAt,
        maxViews: updated.maxViews,
        viewCount: updated.viewCount,
        burnOnRead: updated.burnOnRead,
      }
    }),

  // Delete a secret
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Get existing secret
      const secretsList = await db
        .select()
        .from(secrets)
        .where(and(eq(secrets.id, input.id), isNull(secrets.deletedAt)))
        .limit(1)

      if (secretsList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret not found',
        })
      }

      const secret = secretsList[0]

      // Verify user has access
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, secret.orgId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .limit(1)

      if (orgMember.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this secret',
        })
      }

      // Check if user is owner or admin (or created the secret)
      const canDelete =
        orgMember[0].role === 'owner' ||
        orgMember[0].role === 'admin' ||
        secret.createdBy === userId

      if (!canDelete) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this secret',
        })
      }

      // Soft delete
      await db
        .update(secrets)
        .set({ deletedAt: new Date() })
        .where(eq(secrets.id, input.id))

      // Log access
      await db.insert(secretAccessLogs).values({
        secretId: input.id,
        userId,
        action: 'delete',
        ipAddress: null,
        userAgent: null,
      })

      return { success: true }
    }),

  // Get activity logs for a secret
  getActivityLogs: protectedProcedure
    .input(
      z.object({
        secretId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Get secret to verify access
      const secretsList = await db
        .select()
        .from(secrets)
        .where(eq(secrets.id, input.secretId))
        .limit(1)

      if (secretsList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secret not found',
        })
      }

      const secret = secretsList[0]

      // Verify user has access
      const orgMember = await db
        .select({
          role: organizationMembers.role,
          organization: {
            tier: organizations.tier,
          },
        })
        .from(organizationMembers)
        .innerJoin(
          organizations,
          eq(organizationMembers.orgId, organizations.id),
        )
        .where(
          and(
            eq(organizationMembers.orgId, secret.orgId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .limit(1)

      if (orgMember.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this secret',
        })
      }

      // Get logs
      let timeFilter = undefined
      if (orgMember[0].organization.tier === 'free') {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        timeFilter = gte(secretAccessLogs.accessedAt, twentyFourHoursAgo)
      } else if (orgMember[0].organization.tier === 'pro_team') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        timeFilter = gte(secretAccessLogs.accessedAt, thirtyDaysAgo)
      }

      const logs = await db
        .select()
        .from(secretAccessLogs)
        .where(and(eq(secretAccessLogs.secretId, input.secretId), timeFilter))
        .orderBy(desc(secretAccessLogs.accessedAt))
        .limit(input.limit)

      return {
        logs,
        tier: orgMember[0].organization.tier,
      }
    }),
} satisfies TRPCRouterRecord

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { and, desc, eq, gte, inArray, isNull } from 'drizzle-orm'
import { protectedProcedure, publicProcedure } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'
import { db } from '@/db'
import {
  apiTokens,
  organizationMembers,
  organizations,
  secretAccessLogs,
  secrets,
  session,
  twoFactor,
  user,
  userPreferences,
  verification,
} from '@/db/schema'

export const usersRouter = {
  // Get dashboard statistics
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    // Get all org IDs user is member of
    const userOrgs = await db
      .select({ orgId: organizationMembers.orgId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))

    const orgIds = userOrgs.map((o) => o.orgId)

    if (orgIds.length === 0) {
      return {
        totalSecrets: 0,
        totalOrganizations: 0,
        recentActivityCount: 0,
        apiTokensCount: 0,
      }
    }

    // Count total secrets (non-deleted)
    const secretsList = await db
      .select()
      .from(secrets)
      .where(and(inArray(secrets.orgId, orgIds), isNull(secrets.deletedAt)))
    const secretsCount = { count: secretsList.length }

    // Count organizations
    const totalOrgs = orgIds.length

    // Count recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get secret IDs for user's orgs
    const userSecretIds = await db
      .select({ id: secrets.id })
      .from(secrets)
      .where(and(inArray(secrets.orgId, orgIds), isNull(secrets.deletedAt)))
    const secretIds = userSecretIds.map((s) => s.id)

    const activityList =
      secretIds.length > 0
        ? await db
            .select()
            .from(secretAccessLogs)
            .where(
              and(
                inArray(secretAccessLogs.secretId, secretIds),
                gte(secretAccessLogs.accessedAt, sevenDaysAgo),
              ),
            )
        : []
    const activityCount = { count: activityList.length }

    // Count API tokens
    const tokensList = await db
      .select()
      .from(apiTokens)
      .where(eq(apiTokens.userId, userId))
    const tokensCount = { count: tokensList.length }

    return {
      totalSecrets: Number(secretsCount.count || 0),
      totalOrganizations: totalOrgs,
      recentActivityCount: Number(activityCount.count || 0),
      apiTokensCount: Number(tokensCount.count || 0),
    }
  }),

  // Get recent secrets across all organizations
  getRecentSecrets: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Get all org IDs user is member of
      const userOrgs = await db
        .select({ orgId: organizationMembers.orgId })
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, userId))

      const orgIds = userOrgs.map((o) => o.orgId)

      if (orgIds.length === 0) {
        return []
      }

      // Get recent secrets
      const recentSecrets = await db
        .select({
          id: secrets.id,
          name: secrets.name,
          orgId: secrets.orgId,
          orgName: organizations.name,
          viewCount: secrets.viewCount,
          maxViews: secrets.maxViews,
          expiresAt: secrets.expiresAt,
          burnOnRead: secrets.burnOnRead,
          createdAt: secrets.createdAt,
        })
        .from(secrets)
        .innerJoin(organizations, eq(secrets.orgId, organizations.id))
        .where(and(inArray(secrets.orgId, orgIds), isNull(secrets.deletedAt)))
        .orderBy(desc(secrets.createdAt))
        .limit(input.limit)

      return recentSecrets
    }),

  // Get recent activity
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Get all org IDs user is member of
      const userOrgs = await db
        .select({ orgId: organizationMembers.orgId })
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, userId))

      const orgIds = userOrgs.map((o) => o.orgId)

      if (orgIds.length === 0) {
        return []
      }

      // Get secret IDs for user's orgs
      const userSecretIds = await db
        .select({ id: secrets.id })
        .from(secrets)
        .where(and(inArray(secrets.orgId, orgIds), isNull(secrets.deletedAt)))
      const secretIds = userSecretIds.map((s) => s.id)

      // Get recent activity
      const recentActivity =
        secretIds.length > 0
          ? await db
              .select({
                id: secretAccessLogs.id,
                secretId: secretAccessLogs.secretId,
                secretName: secrets.name,
                action: secretAccessLogs.action,
                ipAddress: secretAccessLogs.ipAddress,
                accessedAt: secretAccessLogs.accessedAt,
              })
              .from(secretAccessLogs)
              .innerJoin(secrets, eq(secretAccessLogs.secretId, secrets.id))
              .where(inArray(secretAccessLogs.secretId, secretIds))
              .orderBy(desc(secretAccessLogs.accessedAt))
              .limit(input.limit)
          : []

      return recentActivity
    }),

  // Get user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    const userList = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (userList.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    const userData = userList[0]

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      emailVerified: userData.emailVerified,
      image: userData.image,
      bio: userData.bio,
      createdAt: userData.createdAt,
    }
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        bio: z.string().nullable().optional(),
        image: z.string().url().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      const updateData: {
        name?: string
        bio?: string | null
        image?: string | null
        updatedAt: Date
      } = {
        updatedAt: new Date(),
      }

      if (input.name !== undefined) {
        updateData.name = input.name
      }
      if (input.bio !== undefined) {
        updateData.bio = input.bio
      }
      if (input.image !== undefined) {
        updateData.image = input.image
      }

      const updatedList = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, userId))
        .returning()

      if (updatedList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const updated = updatedList[0]

      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
        bio: updated.bio,
      }
    }),

  // Get user preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    const prefsList = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1)

    const prefs = prefsList[0]

    // Return defaults if no preferences exist
    if (prefsList.length === 0) {
      return {
        timezone: 'UTC',
        language: 'en',
        emailNotifications: true,
        theme: null,
      }
    }

    return {
      timezone: prefs.timezone || 'UTC',
      language: prefs.language || 'en',
      emailNotifications: prefs.emailNotifications,
      theme: prefs.theme,
    }
  }),

  // Update user preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        timezone: z.string().optional(),
        language: z.string().optional(),
        emailNotifications: z.boolean().optional(),
        theme: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Check if preferences exist
      const existingList = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1)

      if (existingList.length > 0) {
        // Update existing
        const updateData: {
          timezone?: string
          language?: string
          emailNotifications?: boolean
          theme?: string | null
          updatedAt: Date
        } = {
          updatedAt: new Date(),
        }

        if (input.timezone !== undefined) {
          updateData.timezone = input.timezone
        }
        if (input.language !== undefined) {
          updateData.language = input.language
        }
        if (input.emailNotifications !== undefined) {
          updateData.emailNotifications = input.emailNotifications
        }
        if (input.theme !== undefined) {
          updateData.theme = input.theme
        }

        const [updated] = await db
          .update(userPreferences)
          .set(updateData)
          .where(eq(userPreferences.userId, userId))
          .returning()

        return {
          timezone: updated.timezone || 'UTC',
          language: updated.language || 'en',
          emailNotifications: updated.emailNotifications,
          theme: updated.theme,
        }
      } else {
        // Create new preferences
        const [newPrefs] = await db
          .insert(userPreferences)
          .values({
            userId,
            timezone: input.timezone || 'UTC',
            language: input.language || 'en',
            emailNotifications: input.emailNotifications ?? true,
            theme: input.theme || null,
          })
          .returning()

        return {
          timezone: newPrefs.timezone || 'UTC',
          language: newPrefs.language || 'en',
          emailNotifications: newPrefs.emailNotifications,
          theme: newPrefs.theme,
        }
      }
    }),

  // Get active sessions
  getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    const sessions = await db
      .select({
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      })
      .from(session)
      .where(
        and(eq(session.userId, userId), gte(session.expiresAt, new Date())),
      )
      .orderBy(desc(session.createdAt))

    return sessions
  }),

  // Revoke a session
  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify ownership
      const sessionDataList = await db
        .select()
        .from(session)
        .where(and(eq(session.id, input.sessionId), eq(session.userId, userId)))
        .limit(1)

      if (sessionDataList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      // Delete session
      await db.delete(session).where(eq(session.id, input.sessionId))

      return { success: true }
    }),

  // Verify email with token (public - doesn't require login)
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      // Find verification token
      const verificationDataList = await db
        .select()
        .from(verification)
        .where(eq(verification.value, input.token))
        .limit(1)

      if (verificationDataList.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid verification token',
        })
      }

      const verificationData = verificationDataList[0]

      // Check if token is expired
      if (new Date() > verificationData.expiresAt) {
        // Delete expired token
        await db
          .delete(verification)
          .where(eq(verification.id, verificationData.id))

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Verification token has expired. Please request a new one.',
        })
      }

      // Find user by email (from verification identifier)
      const userDataList = await db
        .select()
        .from(user)
        .where(eq(user.email, verificationData.identifier))
        .limit(1)

      if (userDataList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const userData = userDataList[0]

      if (userData.emailVerified) {
        // Delete token even if already verified
        await db
          .delete(verification)
          .where(eq(verification.id, verificationData.id))

        return { success: true, message: 'Email already verified' }
      }

      // Update user's emailVerified status
      await db
        .update(user)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(user.email, verificationData.identifier))

      // Delete the verification token (one-time use)
      await db
        .delete(verification)
        .where(eq(verification.id, verificationData.id))

      return { success: true, message: 'Email verified successfully' }
    }),

  // Send email verification
  sendVerificationEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id

    // Get user email
    const userDataList = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (userDataList.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    const userData = userDataList[0]

    if (userData.emailVerified) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Email already verified',
      })
    }

    // Generate a verification token
    const { randomBytes } = await import('node:crypto')
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Delete any existing verification tokens for this email
    await db
      .delete(verification)
      .where(eq(verification.identifier, userData.email))

    // Insert new verification token
    await db.insert(verification).values({
      id: randomBytes(16).toString('hex'),
      identifier: userData.email,
      value: token,
      expiresAt,
    })

    // Send verification email
    const { sendVerificationEmail } = await import('@/lib/email')
    const emailResult = await sendVerificationEmail(userData.email, token)

    if (!emailResult.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: emailResult.error || 'Failed to send verification email',
      })
    }

    return { success: true, message: 'Verification email sent' }
  }),

  // Get 2FA status
  getTwoFactorStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    const twoFactorDataList = await db
      .select()
      .from(twoFactor)
      .where(eq(twoFactor.userId, userId))
      .limit(1)

    const twoFactorData = twoFactorDataList[0]

    return {
      enabled: twoFactorData.enabled || false,
      hasSecret: !!twoFactorData.secret,
    }
  }),

  // Generate 2FA setup (secret and QR code)
  generateTwoFactorSetup: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id

    // Get user email for QR code
    const userDataList = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (userDataList.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    const userData = userDataList[0]

    // Check if 2FA is already enabled
    const existingList = await db
      .select()
      .from(twoFactor)
      .where(eq(twoFactor.userId, userId))
      .limit(1)

    if (existingList.length > 0 && existingList[0].enabled) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: '2FA is already enabled',
      })
    }

    // Generate secret and backup codes
    const { generateTOTPSecret, generateBackupCodes, getQRCodeURL } =
      await import('@/lib/two-factor')
    const secret = generateTOTPSecret()
    const backupCodes = generateBackupCodes(10)
    const qrCodeURL = getQRCodeURL(secret, userData.email)

    // Store temporarily (not enabled yet - user needs to verify first)
    if (existingList.length > 0) {
      await db
        .update(twoFactor)
        .set({
          secret,
          backupCodes: JSON.stringify(
            backupCodes.map((code) =>
              require('node:crypto')
                .createHash('sha256')
                .update(code)
                .digest('hex'),
            ),
          ),
          updatedAt: new Date(),
        })
        .where(eq(twoFactor.userId, userId))
    } else {
      await db.insert(twoFactor).values({
        userId,
        secret,
        enabled: false,
        backupCodes: JSON.stringify(
          backupCodes.map((code) =>
            require('node:crypto')
              .createHash('sha256')
              .update(code)
              .digest('hex'),
          ),
        ),
      })
    }

    return {
      secret,
      qrCodeURL,
      backupCodes, // Only returned once during setup
    }
  }),

  // Verify and enable 2FA
  enableTwoFactor: protectedProcedure
    .input(z.object({ token: z.string().length(6) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Get user and 2FA data
      const userDataList = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

      const twoFactorDataList = await db
        .select()
        .from(twoFactor)
        .where(eq(twoFactor.userId, userId))
        .limit(1)

      if (userDataList.length === 0 || twoFactorDataList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '2FA setup not found. Please generate a new setup first.',
        })
      }

      const userData = userDataList[0]
      const twoFactorData = twoFactorDataList[0]

      if (!twoFactorData.secret) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '2FA setup not found. Please generate a new setup first.',
        })
      }

      // Verify token
      const { verifyTOTP } = await import('@/lib/two-factor')
      const isValid = verifyTOTP(
        twoFactorData.secret,
        input.token,
        userData.email,
      )

      if (!isValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid verification code',
        })
      }

      // Enable 2FA
      await db
        .update(twoFactor)
        .set({
          enabled: true,
          updatedAt: new Date(),
        })
        .where(eq(twoFactor.userId, userId))

      return { success: true }
    }),

  // Disable 2FA
  disableTwoFactor: protectedProcedure
    .input(z.object({ token: z.string().length(6) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Get user and 2FA data
      const userDataList = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

      const twoFactorDataList = await db
        .select()
        .from(twoFactor)
        .where(eq(twoFactor.userId, userId))
        .limit(1)

      if (userDataList.length === 0 || twoFactorDataList.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '2FA is not enabled',
        })
      }

      const userData = userDataList[0]
      const twoFactorData = twoFactorDataList[0]

      if (!twoFactorData.enabled) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '2FA is not enabled',
        })
      }

      // Verify token before disabling
      const { verifyTOTP } = await import('@/lib/two-factor')
      const isValid = verifyTOTP(
        twoFactorData.secret,
        input.token,
        userData.email,
      )

      if (!isValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid verification code',
        })
      }

      // Disable 2FA
      await db
        .update(twoFactor)
        .set({
          enabled: false,
          updatedAt: new Date(),
        })
        .where(eq(twoFactor.userId, userId))

      return { success: true }
    }),

  // Get ImageKit authentication parameters for client-side upload
  getImageKitAuth: protectedProcedure.query(async () => {
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ImageKit is not configured',
      })
    }

    // Generate authentication token for ImageKit
    const ImageKit = (await import('imagekit')).default
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    })

    // Generate authentication parameters
    const authenticationParameters = imagekit.getAuthenticationParameters()

    return {
      token: authenticationParameters.token,
      signature: authenticationParameters.signature,
      expire: authenticationParameters.expire,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    }
  }),
} satisfies TRPCRouterRecord

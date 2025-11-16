import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { eq, and, isNull, desc, sql, gte, inArray } from 'drizzle-orm'
import { db } from '@/db'
import {
  user,
  userPreferences,
  organizations,
  organizationMembers,
  secrets,
  secretAccessLogs,
  apiTokens,
  session,
} from '@/db/schema'
import { protectedProcedure, createTRPCRouter } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'

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
      .where(
        and(
          inArray(secrets.orgId, orgIds),
          isNull(secrets.deletedAt)
        )
      )
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
      .where(
        and(
          inArray(secrets.orgId, orgIds),
          isNull(secrets.deletedAt)
        )
      )
    const secretIds = userSecretIds.map((s) => s.id)

    const activityList = secretIds.length > 0
      ? await db
          .select()
          .from(secretAccessLogs)
          .where(
            and(
              inArray(secretAccessLogs.secretId, secretIds),
              gte(secretAccessLogs.accessedAt, sevenDaysAgo)
            )
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
      totalSecrets: Number(secretsCount?.count || 0),
      totalOrganizations: totalOrgs,
      recentActivityCount: Number(activityCount?.count || 0),
      apiTokensCount: Number(tokensCount?.count || 0),
    }
  }),

  // Get recent secrets across all organizations
  getRecentSecrets: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
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
        .where(
          and(
            inArray(secrets.orgId, orgIds),
            isNull(secrets.deletedAt)
          )
        )
        .orderBy(desc(secrets.createdAt))
        .limit(input.limit)

      return recentSecrets
    }),

  // Get recent activity
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
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
        .where(
          and(
            inArray(secrets.orgId, orgIds),
            isNull(secrets.deletedAt)
          )
        )
      const secretIds = userSecretIds.map((s) => s.id)

      // Get recent activity
      const recentActivity = secretIds.length > 0
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

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!userData) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

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
      })
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

      const [updated] = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, userId))
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

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

    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1)

    // Return defaults if no preferences exist
    if (!prefs) {
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Check if preferences exist
      const [existing] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1)

      if (existing) {
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
        and(
          eq(session.userId, userId),
          gte(session.expiresAt, new Date())
        )
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
      const [sessionData] = await db
        .select()
        .from(session)
        .where(
          and(
            eq(session.id, input.sessionId),
            eq(session.userId, userId)
          )
        )
        .limit(1)

      if (!sessionData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      // Delete session
      await db.delete(session).where(eq(session.id, input.sessionId))

      return { success: true }
    }),
} satisfies TRPCRouterRecord


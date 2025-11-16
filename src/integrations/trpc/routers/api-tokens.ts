import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import {
  apiTokens,
  organizationMembers,
} from '@/db/schema'
import { protectedProcedure, createTRPCRouter } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'
import {
  generateApiToken,
  hashApiToken,
  formatApiToken,
} from '@/lib/api-tokens'

export const apiTokensRouter = {
  // Create a new API token
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        orgId: z.number().optional(),
        teamId: z.number().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify org access if orgId provided
      if (input.orgId) {
        const orgMember = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.orgId, input.orgId),
              eq(organizationMembers.userId, userId)
            )
          )
          .limit(1)

        if (orgMember.length === 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this organization',
          })
        }
      }

      // Generate token
      const token = generateApiToken()
      const tokenHash = hashApiToken(token)

      // Store in database
      const [newToken] = await db
        .insert(apiTokens)
        .values({
          userId,
          orgId: input.orgId || null,
          teamId: input.teamId || null,
          tokenHash,
          name: input.name,
          expiresAt: input.expiresAt || null,
        })
        .returning()

      // Return token (only shown once)
      return {
        id: newToken.id,
        name: newToken.name,
        token, // Only returned on creation
        formatted: formatApiToken(token),
        createdAt: newToken.createdAt,
        expiresAt: newToken.expiresAt,
      }
    }),

  // List API tokens
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    const tokens = await db
      .select({
        id: apiTokens.id,
        name: apiTokens.name,
        orgId: apiTokens.orgId,
        teamId: apiTokens.teamId,
        lastUsedAt: apiTokens.lastUsedAt,
        expiresAt: apiTokens.expiresAt,
        createdAt: apiTokens.createdAt,
      })
      .from(apiTokens)
      .where(eq(apiTokens.userId, userId))

    return tokens
  }),

  // Delete API token
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify ownership
      const [token] = await db
        .select()
        .from(apiTokens)
        .where(
          and(eq(apiTokens.id, input.id), eq(apiTokens.userId, userId))
        )
        .limit(1)

      if (!token) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API token not found',
        })
      }

      // Delete token
      await db.delete(apiTokens).where(eq(apiTokens.id, input.id))

      return { success: true }
    }),

  // Verify API token (for CLI/API use)
  verify: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const tokenHash = hashApiToken(input.token)

      const [token] = await db
        .select()
        .from(apiTokens)
        .where(eq(apiTokens.tokenHash, tokenHash))
        .limit(1)

      if (!token) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid API token',
        })
      }

      // Check expiration
      if (token.expiresAt && new Date() > token.expiresAt) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'API token has expired',
        })
      }

      // Update last used
      await db
        .update(apiTokens)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiTokens.id, token.id))

      return {
        userId: token.userId,
        orgId: token.orgId,
        teamId: token.teamId,
      }
    }),
} satisfies TRPCRouterRecord


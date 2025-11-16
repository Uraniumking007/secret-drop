import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import {
  organizations,
  organizationMembers,
} from '@/db/schema'
import { protectedProcedure, createTRPCRouter } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'

export const organizationsRouter = {
  // Create a new organization (personal workspace for free tier)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Check if slug is already taken
      const existing = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, input.slug))
        .limit(1)

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Organization slug already exists',
        })
      }

      // Create organization
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: input.name,
          slug: input.slug,
          tier: 'free',
          ownerId: userId,
        })
        .returning()

      // Add creator as owner
      await db.insert(organizationMembers).values({
        userId,
        orgId: newOrg.id,
        role: 'owner',
      })

      return newOrg
    }),

  // Get user's organizations
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    const orgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        tier: organizations.tier,
        createdAt: organizations.createdAt,
        role: organizationMembers.role,
      })
      .from(organizations)
      .innerJoin(
        organizationMembers,
        eq(organizationMembers.orgId, organizations.id)
      )
      .where(eq(organizationMembers.userId, userId))

    return orgs
  }),

  // Get organization by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user has access
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, input.id),
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

      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.id))
        .limit(1)

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      return {
        ...org,
        role: orgMember[0].role,
      }
    }),

  // Get or create personal workspace (default org for free tier)
  getOrCreatePersonal: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id

    // Check if user already has a personal workspace
    const existing = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        tier: organizations.tier,
        createdAt: organizations.createdAt,
        role: organizationMembers.role,
      })
      .from(organizations)
      .innerJoin(
        organizationMembers,
        eq(organizationMembers.orgId, organizations.id)
      )
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.role, 'owner'),
          eq(organizations.tier, 'free')
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return existing[0]
    }

    // Create personal workspace
    const slug = `user-${userId.slice(0, 8)}`
    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: 'Personal Workspace',
        slug,
        tier: 'free',
        ownerId: userId,
      })
      .returning()

    await db.insert(organizationMembers).values({
      userId,
      orgId: newOrg.id,
      role: 'owner',
    })

    return {
      id: newOrg.id,
      name: newOrg.name,
      slug: newOrg.slug,
      tier: newOrg.tier,
      createdAt: newOrg.createdAt,
      role: 'owner' as const,
    }
  }),
} satisfies TRPCRouterRecord


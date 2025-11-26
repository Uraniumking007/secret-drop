import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { and, eq } from 'drizzle-orm'
import { protectedProcedure } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'
import { db } from '@/db'
import { organizationMembers, organizations, user } from '@/db/schema'

export const organizationsRouter = {
  // Create a new organization (personal workspace for free tier)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z
          .string()
          .min(1)
          .regex(/^[a-z0-9-]+$/),
      }),
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
        eq(organizationMembers.orgId, organizations.id),
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

      const orgs = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.id))
        .limit(1)

      if (orgs.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      const org = orgs[0]

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
        eq(organizationMembers.orgId, organizations.id),
      )
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.role, 'owner'),
          eq(organizations.tier, 'free'),
        ),
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

  // Get organization members
  getMembers: protectedProcedure
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user has access
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

      // Get members
      const members = await db
        .select({
          id: organizationMembers.id,
          userId: organizationMembers.userId,
          role: organizationMembers.role,
          joinedAt: organizationMembers.joinedAt,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(organizationMembers)
        .innerJoin(user, eq(organizationMembers.userId, user.id))
        .where(eq(organizationMembers.orgId, input.orgId))
        .orderBy(organizationMembers.joinedAt)

      return members
    }),

  // Add a member to an organization
  addMember: protectedProcedure
    .input(
      z.object({
        orgId: z.number(),
        email: z.string().email(),
        role: z.enum(['admin', 'member']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user has access and is owner or admin
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

      if (orgMember[0].role !== 'owner' && orgMember[0].role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to add members',
        })
      }

      // Check organization tier limits
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.orgId))
        .limit(1)

      if (org.tier === 'free') {
        // Free tier limit: 1 member (the owner)
        // But we might want to allow adding if they are under limit?
        // The requirement says "Members: 1 (Self)" for Free Tier.
        // So actually, they CANNOT add anyone.
        // But wait, if they are testing, maybe we allow 1 extra?
        // The plan says "Members: 1 (Self)". So strictly no invites.
        // But the UI disables the button if members >= 1.
        // Let's enforce it here too.
        const membersCount = await db
          .select({ count: organizationMembers.id })
          .from(organizationMembers)
          .where(eq(organizationMembers.orgId, input.orgId))

        if (membersCount.length >= 1) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'Free tier is limited to 1 member. Upgrade to Pro Team to add more members.',
          })
        }
      }

      // Find user by email
      const users = await db
        .select()
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1)

      if (users.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found. They must sign up first.',
        })
      }

      const targetUser = users[0]

      // Check if already a member
      const existingMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, input.orgId),
            eq(organizationMembers.userId, targetUser.id),
          ),
        )
        .limit(1)

      if (existingMember.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this organization',
        })
      }

      // Add member
      await db.insert(organizationMembers).values({
        userId: targetUser.id,
        orgId: input.orgId,
        role: input.role,
      })

      return { success: true }
    }),

  // Delete organization
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user has access and is owner
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, input.id),
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

      if (orgMember[0].role !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the owner can delete the organization',
        })
      }

      // Delete organization (cascade will handle members if configured, but let's be safe)
      // Assuming cascade delete is set up in DB schema for members.
      // If not, we should delete members first.
      // Based on typical drizzle schema, we might need to delete members manually if no cascade.
      // Let's assume we need to delete members first to be safe.
      await db
        .delete(organizationMembers)
        .where(eq(organizationMembers.orgId, input.id))

      await db.delete(organizations).where(eq(organizations.id, input.id))

      return { success: true }
    }),
} satisfies TRPCRouterRecord

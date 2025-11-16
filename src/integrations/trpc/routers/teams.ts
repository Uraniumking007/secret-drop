import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import {
  teams,
  teamMembers,
  organizationMembers,
} from '@/db/schema'
import { protectedProcedure, createTRPCRouter } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'
import { canPerformAction } from '@/lib/rbac'

export const teamsRouter = {
  // Create a new team
  create: protectedProcedure
    .input(
      z.object({
        orgId: z.number(),
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user has access to organization and can manage teams
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

      if (!canPerformAction(orgMember[0].role, 'canManageTeams')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create teams',
        })
      }

      // Check if slug is already taken in this org
      const existing = await db
        .select()
        .from(teams)
        .where(
          and(
            eq(teams.orgId, input.orgId),
            eq(teams.slug, input.slug)
          )
        )
        .limit(1)

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Team slug already exists in this organization',
        })
      }

      // Create team
      const [newTeam] = await db
        .insert(teams)
        .values({
          orgId: input.orgId,
          name: input.name,
          slug: input.slug,
        })
        .returning()

      // Add creator as team member
      await db.insert(teamMembers).values({
        userId,
        teamId: newTeam.id,
      })

      return newTeam
    }),

  // List teams in an organization
  list: protectedProcedure
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user has access to organization
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

      // Get teams
      const teamList = await db
        .select({
          id: teams.id,
          name: teams.name,
          slug: teams.slug,
          orgId: teams.orgId,
          createdAt: teams.createdAt,
        })
        .from(teams)
        .where(eq(teams.orgId, input.orgId))

      return teamList
    }),

  // Get team by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Get team
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.id))
        .limit(1)

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        })
      }

      // Verify user has access to organization
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, team.orgId),
            eq(organizationMembers.userId, userId)
          )
        )
        .limit(1)

      if (orgMember.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this team',
        })
      }

      // Get team members
      const members = await db
        .select({
          userId: teamMembers.userId,
          joinedAt: teamMembers.joinedAt,
        })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, input.id))

      return {
        ...team,
        members,
      }
    }),

  // Add member to team
  addMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const currentUserId = ctx.user.id

      // Get team
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.teamId))
        .limit(1)

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        })
      }

      // Verify user has permission to manage teams
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, team.orgId),
            eq(organizationMembers.userId, currentUserId)
          )
        )
        .limit(1)

      if (orgMember.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this organization',
        })
      }

      if (!canPerformAction(orgMember[0].role, 'canManageTeams')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to manage team members',
        })
      }

      // Verify target user is in the organization
      const targetOrgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, team.orgId),
            eq(organizationMembers.userId, input.userId)
          )
        )
        .limit(1)

      if (targetOrgMember.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is not a member of this organization',
        })
      }

      // Check if already a member
      const existing = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, input.teamId),
            eq(teamMembers.userId, input.userId)
          )
        )
        .limit(1)

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this team',
        })
      }

      // Add member
      await db.insert(teamMembers).values({
        userId: input.userId,
        teamId: input.teamId,
      })

      return { success: true }
    }),

  // Remove member from team
  removeMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const currentUserId = ctx.user.id

      // Get team
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.teamId))
        .limit(1)

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        })
      }

      // Verify user has permission (or is removing themselves)
      if (input.userId !== currentUserId) {
        const orgMember = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.orgId, team.orgId),
              eq(organizationMembers.userId, currentUserId)
            )
          )
          .limit(1)

        if (orgMember.length === 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this organization',
          })
        }

        if (!canPerformAction(orgMember[0].role, 'canManageTeams')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to manage team members',
          })
        }
      }

      // Remove member
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, input.teamId),
            eq(teamMembers.userId, input.userId)
          )
        )

      return { success: true }
    }),

  // Delete team
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Get team
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.id))
        .limit(1)

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        })
      }

      // Verify user has permission
      const orgMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.orgId, team.orgId),
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

      if (!canPerformAction(orgMember[0].role, 'canManageTeams')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete teams',
        })
      }

      // Delete team (cascade will handle team members)
      await db.delete(teams).where(eq(teams.id, input.id))

      return { success: true }
    }),
} satisfies TRPCRouterRecord


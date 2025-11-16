import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import {
  organizations,
  organizationMembers,
  subscriptions,
} from '@/db/schema'
import { protectedProcedure, createTRPCRouter } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'
import {
  createCheckoutSession,
  getOrCreateCustomer,
  cancelSubscription as cancelStripeSubscription,
  updateSubscriptionTier as updateStripeSubscriptionTier,
} from '@/lib/stripe'
import { canPerformAction } from '@/lib/rbac'

export const billingRouter = {
  // Create checkout session for subscription
  createCheckout: protectedProcedure
    .input(
      z.object({
        orgId: z.number(),
        tier: z.enum(['pro_team', 'business']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user is owner or admin
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

      if (!canPerformAction(orgMember[0].role, 'canManageSettings')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owners can manage subscriptions',
        })
      }

      // Get organization
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.orgId))
        .limit(1)

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      // Get or create Stripe customer
      const customer = await getOrCreateCustomer(
        ctx.user.email || '',
        ctx.user.name || undefined
      )

      // Create checkout session
      const session = await createCheckoutSession(
        customer.id,
        input.tier,
        input.orgId,
        `${process.env.SERVER_URL || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        `${process.env.SERVER_URL || 'http://localhost:3000'}/billing/cancel`
      )

      return {
        url: session.url,
        sessionId: session.id,
      }
    }),

  // Get subscription status
  getSubscription: protectedProcedure
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

      // Get subscription
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.orgId, input.orgId))
        .limit(1)

      return subscription || null
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({ orgId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Verify user is owner
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

      if (orgMember.length === 0 || orgMember[0].role !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owners can cancel subscriptions',
        })
      }

      // Get subscription
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.orgId, input.orgId))
        .limit(1)

      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active subscription found',
        })
      }

      // Cancel in Stripe
      await cancelStripeSubscription(subscription.stripeSubscriptionId)

      // Update in database
      await db
        .update(subscriptions)
        .set({
          status: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id))

      // Downgrade organization tier
      await db
        .update(organizations)
        .set({ tier: 'free' })
        .where(eq(organizations.id, input.orgId))

      return { success: true }
    }),
} satisfies TRPCRouterRecord


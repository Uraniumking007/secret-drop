import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { and, eq } from 'drizzle-orm'
import { protectedProcedure } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'
import { db } from '@/db'
import { organizationMembers, organizations, subscriptions } from '@/db/schema'
import {
  cancelSubscription as cancelDodoSubscription,
  createCheckoutSession,
  getOrCreateCustomer,
} from '@/lib/dodopayments'
import { canPerformAction } from '@/lib/rbac'

export const billingRouter = {
  // Create checkout session for subscription
  createCheckout: protectedProcedure
    .input(
      z.object({
        orgId: z.number().optional(),
        tier: z.enum(['pro_team', 'business']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      if (input.orgId) {
        // Verify user is owner or admin
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

        if (!canPerformAction(orgMember[0].role, 'canManageSettings')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only owners can manage subscriptions',
          })
        }

        // Get organization
        const orgs = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, input.orgId))
          .limit(1)

        if (orgs.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Organization not found',
          })
        }
      }

      // Get or create Dodo Payments customer
      const customer = await getOrCreateCustomer(
        ctx.user.email || '',
        ctx.user.name || undefined,
      )

      // Create checkout session
      const session = await createCheckoutSession(
        customer.id,
        input.tier,
        input.orgId,
        `${process.env.SERVER_URL || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        `${process.env.SERVER_URL || 'http://localhost:3000'}/billing/cancel`,
      )

      return {
        url: session.url,
        sessionId: session.id,
      }
    }),

  // Get subscription status
  getSubscription: protectedProcedure
    .input(z.object({ orgId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id

      if (input.orgId) {
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

        // Get subscription
        const subscriptionsList = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.orgId, input.orgId))
          .limit(1)

        return subscriptionsList[0] || null
      } else {
        // Get personal subscription
        const subscriptionsList = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .limit(1)

        return subscriptionsList[0] || null
      }
    }),

  // Cancel subscription
  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({ orgId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id
      let subscription

      if (input.orgId) {
        // Verify user is owner
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

        if (orgMember.length === 0 || orgMember[0].role !== 'owner') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only owners can cancel subscriptions',
          })
        }

        // Get subscription
        const subs = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.orgId, input.orgId))
          .limit(1)

        if (subs.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No active subscription found',
          })
        }
        subscription = subs[0]
      } else {
        // Get personal subscription
        const subs = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .limit(1)

        if (subs.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No active subscription found',
          })
        }
        subscription = subs[0]
      }

      if (!subscription.stripeSubscriptionId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active subscription found',
        })
      }

      // Cancel in Dodo Payments
      // Note: We are using the existing stripeSubscriptionId column to store Dodo subscription ID
      await cancelDodoSubscription(subscription.stripeSubscriptionId)

      // Update in database
      await db
        .update(subscriptions)
        .set({
          status: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id))

      if (input.orgId) {
        // Downgrade organization tier
        await db
          .update(organizations)
          .set({ tier: 'free' })
          .where(eq(organizations.id, input.orgId))
      }

      return { success: true }
    }),
  // Verify checkout session and activate subscription
  verifySession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id

      // Get session details from Dodo Payments
      // We need to import verifySession from lib/dodopayments
      const { verifySession } = await import('@/lib/dodopayments')
      const session = await verifySession(input.sessionId)

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      const orgId = session.metadata?.orgId
        ? parseInt(session.metadata.orgId)
        : undefined
      const tier = session.metadata?.tier as 'pro_team' | 'business'
      const subscriptionId = session.subscription_id

      if (!subscriptionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No subscription ID found in session',
        })
      }

      // Update or create subscription in database
      if (orgId) {
        // Organization subscription
        const existingSubs = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.orgId, orgId))
          .limit(1)

        const existingSub = existingSubs[0]

        if (existingSubs.length > 0) {
          await db
            .update(subscriptions)
            .set({
              tier,
              status: 'active',
              stripeSubscriptionId: subscriptionId,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSub.id))
        } else {
          await db.insert(subscriptions).values({
            orgId,
            tier,
            status: 'active',
            stripeSubscriptionId: subscriptionId,
          })
        }

        // Update organization tier
        await db
          .update(organizations)
          .set({ tier })
          .where(eq(organizations.id, orgId))
      } else {
        // Personal subscription
        const existingSubs = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .limit(1)

        const existingSub = existingSubs[0]

        if (existingSubs.length > 0) {
          await db
            .update(subscriptions)
            .set({
              tier,
              status: 'active',
              stripeSubscriptionId: subscriptionId,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSub.id))
        } else {
          await db.insert(subscriptions).values({
            userId,
            tier,
            status: 'active',
            stripeSubscriptionId: subscriptionId,
          })
        }
      }

      return { success: true }
    }),
} satisfies TRPCRouterRecord

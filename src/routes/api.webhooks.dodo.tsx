import { createFileRoute } from '@tanstack/react-router'
import { Webhook } from 'standardwebhooks'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { organizations, subscriptions } from '@/db/schema'
import { env } from '@/env'

// Define webhook payload types based on Dodo docs
type WebhookPayload = {
  type: string
  data: any
}

export const Route = createFileRoute('/api/webhooks/dodo')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const webhookKey = env.DODO_PAYMENTS_WEBHOOK_KEY
        if (!webhookKey) {
          console.error('DODO_PAYMENTS_WEBHOOK_KEY is not set')
          return new Response('Webhook key not configured', { status: 500 })
        }

        const webhook = new Webhook(webhookKey)
        const headersList = request.headers
        const rawBody = await request.text()

        const webhookHeaders = {
          'webhook-id': headersList.get('webhook-id') || '',
          'webhook-signature': headersList.get('webhook-signature') || '',
          'webhook-timestamp': headersList.get('webhook-timestamp') || '',
        }

        try {
          await webhook.verify(rawBody, webhookHeaders)
        } catch (err) {
          console.error('Webhook verification failed:', err)
          return new Response('Invalid signature', { status: 401 })
        }

        const payload = JSON.parse(rawBody) as WebhookPayload
        const { type, data } = payload

        console.log(`[Dodo Webhook] Received event: ${type}`)

        try {
          switch (type) {
            case 'subscription.active':
            case 'subscription.renewed':
              await handleSubscriptionActive(data)
              break
            case 'subscription.on_hold':
              await handleSubscriptionOnHold(data)
              break
            case 'subscription.failed':
            case 'subscription.cancelled':
              await handleSubscriptionCancelled(data)
              break
            default:
              console.log(`[Dodo Webhook] Unhandled event type: ${type}`)
          }
        } catch (error) {
          console.error(`[Dodo Webhook] Error processing event ${type}:`, error)
          return new Response('Error processing webhook', { status: 500 })
        }

        return new Response('OK', { status: 200 })
      },
    },
  },
})

async function handleSubscriptionActive(data: any) {
  const subscriptionId = data.subscription_id
  const customerId = data.customer.customer_id
  const metadata = data.metadata || {}

  // Determine tier from product_id or metadata
  // We might need to map product_id to tier if metadata isn't present in this payload
  // For now, let's assume metadata is passed through or we can infer it
  let tier = metadata.tier as 'pro_team' | 'business' | undefined

  if (!tier) {
    // Fallback: try to match product ID
    if (data.product_id === env.DODO_PRO_TEAM_PRODUCT_ID) {
      tier = 'pro_team'
    } else if (data.product_id === env.DODO_BUSINESS_PRODUCT_ID) {
      tier = 'business'
    }
  }

  if (!tier) {
    console.warn(
      `[Dodo Webhook] Could not determine tier for subscription ${subscriptionId}`,
    )
    return
  }

  const orgId = metadata.orgId ? String(metadata.orgId) : undefined

  // Update subscription in DB
  // We search by stripeSubscriptionId (which we use for Dodo ID)
  const [existingSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
    .limit(1)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (existingSub) {
    await db
      .update(subscriptions)
      .set({
        status: 'active',
        tier,
        updatedAt: new Date(),
        // Update currentPeriodEnd if available in data
        currentPeriodEnd: data.next_billing_date
          ? new Date(data.next_billing_date)
          : undefined,
      })
      .where(eq(subscriptions.id, existingSub.id))
  } else {
    // If it doesn't exist, we might need to create it, but we need userId or orgId
    // If orgId is in metadata, we can create it.
    // If not, and we have customer_id, we might need to look up user by customer_id if we stored it (we don't yet).
    // So we rely on metadata.

    if (orgId) {
      await db.insert(subscriptions).values({
        orgId,
        tier,
        status: 'active',
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        currentPeriodEnd: data.next_billing_date
          ? new Date(data.next_billing_date)
          : undefined,
      })

      // Update org tier
      await db
        .update(organizations)
        .set({ tier })
        .where(eq(organizations.id, orgId))
    } else {
      // Personal subscription - we need userId.
      // If we don't have userId in metadata, we can't easily link it unless we search by email (if provided in customer object)
      // data.customer.email might be available
      const email = data.customer.email
      if (email) {
        // Find user by email
        // This requires importing 'user' table
        const { user } = await import('@/db/schema')
        const [u] = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1)
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (u) {
          await db.insert(subscriptions).values({
            userId: u.id,
            tier,
            status: 'active',
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            currentPeriodEnd: data.next_billing_date
              ? new Date(data.next_billing_date)
              : undefined,
          })
        } else {
          console.warn(`[Dodo Webhook] User not found for email ${email}`)
        }
      } else {
        console.warn(
          `[Dodo Webhook] Cannot create subscription: missing orgId and email`,
        )
      }
    }
  }

  // If orgId is present, ensure org tier is updated
  if (orgId) {
    await db
      .update(organizations)
      .set({ tier })
      .where(eq(organizations.id, orgId))
  }
}

async function handleSubscriptionOnHold(data: any) {
  const subscriptionId = data.subscription_id
  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
}

async function handleSubscriptionCancelled(data: any) {
  const subscriptionId = data.subscription_id

  // Get subscription to find orgId
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
    .limit(1)

  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (sub && sub.orgId) {
    // Downgrade org to free
    await db
      .update(organizations)
      .set({ tier: 'free' })
      .where(eq(organizations.id, sub.orgId))
  }
}

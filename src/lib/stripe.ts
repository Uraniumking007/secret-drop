/**
 * Stripe integration for subscription management
 */

import Stripe from 'stripe'
import { env } from '@/env'

if (!env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set - Stripe features will be disabled')
}

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string | null,
  tier: 'pro_team' | 'business',
  orgId: number,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const priceIds = {
    pro_team: process.env.STRIPE_PRO_TEAM_PRICE_ID || '',
    business: process.env.STRIPE_BUSINESS_PRICE_ID || '',
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId || undefined,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceIds[tier],
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orgId: orgId.toString(),
      tier,
    },
    subscription_data: {
      metadata: {
        orgId: orgId.toString(),
        tier,
      },
    },
  })

  return session
}

/**
 * Create or retrieve Stripe customer
 */
export async function getOrCreateCustomer(
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
  })
}

/**
 * Get subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    return null
  }

  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    return null
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  return await stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Update subscription tier
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newTier: 'pro_team' | 'business'
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceIds = {
    pro_team: process.env.STRIPE_PRO_TEAM_PRICE_ID || '',
    business: process.env.STRIPE_BUSINESS_PRICE_ID || '',
  }

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceIds[newTier],
      },
    ],
    metadata: {
      ...subscription.metadata,
      tier: newTier,
    },
  })
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return null
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return null
  }
}


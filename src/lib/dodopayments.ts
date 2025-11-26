/**
 * Dodo Payments integration for subscription management
 */

import DodoPayments from 'dodopayments'
import { env } from '@/env'

if (!env.DODO_PAYMENTS_API_KEY) {
  console.warn(
    'DODO_PAYMENTS_API_KEY not set - Dodo Payments features will be disabled',
  )
}

export const dodo = env.DODO_PAYMENTS_API_KEY
  ? new DodoPayments({
      bearerToken: env.DODO_PAYMENTS_API_KEY,
      environment: env.VITE_ENV === 'production' ? 'live_mode' : 'test_mode',
    })
  : null

if (dodo) {
  const mode = env.VITE_ENV === 'production' ? 'LIVE' : 'TEST'
  const keyPrefix = env.DODO_PAYMENTS_API_KEY?.substring(0, 8)
  console.log(`[Dodo] Initialized in ${mode} mode`)
  console.log(`[Dodo] API Key prefix: ${keyPrefix}...`)
  console.log(`[Dodo] Pro Product ID: ${env.DODO_PRO_TEAM_PRODUCT_ID}`)
}

/**
 * Create a Dodo Payments checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string | null,
  tier: 'pro_team' | 'business',
  orgId: string | undefined,
  successUrl: string,
  cancelUrl: string,
): Promise<{ url: string; id: string }> {
  if (!dodo) {
    throw new Error('Dodo Payments is not configured')
  }

  const productIds = {
    pro_team: process.env.DODO_PRO_TEAM_PRODUCT_ID || '',
    business: process.env.DODO_BUSINESS_PRODUCT_ID || '',
  }

  if (!customerId) {
    throw new Error('Customer ID is required')
  }

  const metadata: Record<string, string> = {
    tier,
    cancelUrl,
  }

  if (orgId) {
    metadata.orgId = orgId
  }

  try {
    const session = await dodo.checkoutSessions.create({
      customer: {
        customer_id: customerId,
      },
      product_cart: [
        {
          product_id: productIds[tier],
          quantity: 1,
        },
      ],
      return_url: successUrl,
      metadata,
    })

    return {
      url: session.checkout_url,
      id: session.session_id,
    }
  } catch (error) {
    console.error('[Dodo] Checkout creation failed:', error)
    throw error
  }
}

/**
 * Create or retrieve Dodo Payments customer
 */
export async function getOrCreateCustomer(
  email: string,
  name?: string,
): Promise<{ id: string }> {
  if (!dodo) {
    throw new Error('Dodo Payments is not configured')
  }

  // Note: Dodo Payments might not have a direct "list customers by email" API in the same way Stripe does
  // or it might be different. For now, we'll assume we create a new one or use an existing ID if stored.
  // Since we don't store Dodo Customer ID yet, we might need to just create one or rely on email matching if supported.

  // Checking documentation or types would be ideal.
  // Assuming a simple create for now as per typical flow, or searching if possible.
  // Dodo's Node SDK usually has a customers.create method.

  // Let's try to create a customer. If it fails or duplicates, we might need to handle it.
  // However, Dodo often handles customer creation during checkout if passed.
  // But to get an ID beforehand:

  const customer = await dodo.customers.create({
    email,
    name: name || email.split('@')[0],
  })

  return { id: customer.customer_id }
}

/**
 * Get subscription by ID
 */
export async function getSubscription(
  subscriptionId: string,
): Promise<any | null> {
  if (!dodo) {
    return null
  }

  try {
    return await dodo.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    return null
  }
}

/**
 * Cancel subscription
 */
/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<void> {
  if (!dodo) {
    throw new Error('Dodo Payments is not configured')
  }

  // Using update to cancel if cancel method doesn't exist
  await dodo.subscriptions.update(subscriptionId, {
    status: 'cancelled',
  })
}

/**
 * Verify checkout session
 */
export async function verifySession(sessionId: string): Promise<any> {
  if (!dodo) {
    throw new Error('Dodo Payments is not configured')
  }

  try {
    console.log(`[Dodo] Verifying ID: ${sessionId}`)

    if (sessionId.startsWith('pay_')) {
      console.log('[Dodo] ID looks like a Payment ID. Fetching payment...')
      const payment = await dodo.payments.retrieve(sessionId)
      return {
        ...payment,
        metadata: payment.metadata,
        subscription_id: payment.subscription_id,
      }
    } else if (sessionId.startsWith('cks_')) {
      console.log(
        '[Dodo] ID looks like a Checkout Session ID. Fetching session...',
      )
      return await dodo.checkoutSessions.retrieve(sessionId)
    } else {
      console.log('[Dodo] Unknown ID format. Trying as Payment first...')
      try {
        const payment = await dodo.payments.retrieve(sessionId)
        return {
          ...payment,
          metadata: payment.metadata,
          subscription_id: payment.subscription_id,
        }
      } catch (err) {
        console.log('[Dodo] Not a payment. Trying as session...')
        return await dodo.checkoutSessions.retrieve(sessionId)
      }
    }
  } catch (error) {
    console.error(`[Dodo] Verification failed for ID ${sessionId}:`, error)
    throw error
  }
}

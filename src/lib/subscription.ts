/**
 * Subscription tier utilities and feature gating
 */

import { getTierLimits } from './secret-utils'

export type SubscriptionTier = 'free' | 'pro_team' | 'business'

/**
 * Check if tier has access to a feature
 */
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: keyof ReturnType<typeof getTierLimits>,
): boolean {
  const limits = getTierLimits(tier)
  const featureValue = limits[feature]

  // For boolean features, return the value
  if (typeof featureValue === 'boolean') {
    return featureValue
  }

  // For numeric/null features, null means unlimited/available
  if (featureValue === null) {
    return true
  }

  // For numeric features, any number > 0 means available
  return featureValue > 0
}

/**
 * Check if tier can use burn-on-read
 */
export function canUseBurnOnRead(tier: SubscriptionTier): boolean {
  return tier === 'pro_team' || tier === 'business'
}

/**
 * Check if tier has permanent audit logs
 */
export function hasPermanentAuditLogs(tier: SubscriptionTier): boolean {
  return tier === 'business'
}

/**
 * Check if tier can use SSO
 */
export function canUseSSO(tier: SubscriptionTier): boolean {
  return tier === 'business'
}

/**
 * Check if tier can use IP allowlisting
 */
export function canUseIPAllowlisting(tier: SubscriptionTier): boolean {
  return tier === 'business'
}

/**
 * Check if tier can use secret recovery (trash bin)
 */
export function canUseSecretRecovery(tier: SubscriptionTier): boolean {
  return tier === 'business'
}

/**
 * Get max views for tier
 */
export function getMaxViews(tier: SubscriptionTier): number | null {
  const limits = getTierLimits(tier)
  return limits.maxViews
}

/**
 * Get audit log retention days for tier
 */
export function getAuditLogDays(tier: SubscriptionTier): number | null {
  const limits = getTierLimits(tier)
  return limits.auditLogDays
}

/**
 * Validate feature usage against tier limits
 */
export function validateFeatureUsage(
  tier: SubscriptionTier,
  feature: string,
  value?: any,
): { valid: boolean; message?: string } {
  switch (feature) {
    case 'burnOnRead':
      if (value && !canUseBurnOnRead(tier)) {
        return {
          valid: false,
          message:
            'Burn-on-read is only available for Pro Team and Business tiers',
        }
      }
      break

    case 'maxViews': {
      const maxViews = getMaxViews(tier)
      if (maxViews !== null && value && value > maxViews) {
        return {
          valid: false,
          message: `Free tier is limited to ${maxViews} views per secret`,
        }
      }
      break
    }

    case 'organizations':
      if (tier === 'free' && value && value > 1) {
        return {
          valid: false,
          message: 'Free tier is limited to 1 personal workspace',
        }
      }
      break

    case 'teams':
      if (tier === 'free' && value && value > 0) {
        return {
          valid: false,
          message: 'Teams are only available for Pro Team and Business tiers',
        }
      }
      break
  }

  return { valid: true }
}

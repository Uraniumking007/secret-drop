/**
 * Utility functions for secret management
 * Handles expiration, view limits, password protection, etc.
 */

export type ExpirationOption = '1h' | '1d' | '7d' | '30d' | 'never'

export interface SecretOptions {
  expiration?: ExpirationOption
  maxViews?: number
  password?: string
  burnOnRead?: boolean
}

/**
 * Calculate expiration timestamp from option
 */
export function calculateExpiration(option: ExpirationOption): Date | null {
  if (option === 'never') {
    return null
  }

  const now = new Date()
  const hours = {
    '1h': 1,
    '1d': 24,
    '7d': 168,
    '30d': 720,
  }[option]

  if (!hours) {
    return null
  }

  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}

/**
 * Check if secret has expired
 */
export function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    return false
  }
  return new Date() > expiresAt
}

/**
 * Check if secret has reached view limit
 */
export function hasReachedViewLimit(
  viewCount: number,
  maxViews: number | null,
): boolean {
  if (maxViews === null || maxViews === 0) {
    return false
  }
  return viewCount >= maxViews
}

/**
 * Check if secret can be viewed
 */
export function canViewSecret(
  viewCount: number,
  maxViews: number | null,
  expiresAt: Date | null,
  burnOnRead: boolean,
  alreadyViewed: boolean,
): { canView: boolean; reason?: string } {
  if (isExpired(expiresAt)) {
    return { canView: false, reason: 'Secret has expired' }
  }

  if (hasReachedViewLimit(viewCount, maxViews)) {
    return { canView: false, reason: 'Maximum view limit reached' }
  }

  if (burnOnRead && alreadyViewed) {
    return { canView: false, reason: 'Secret was deleted after first view' }
  }

  return { canView: true }
}

/**
 * Generate a share token (64 character random string)
 */
export async function generateShareToken(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  const array = new Uint8Array(48) // 48 bytes = 64 base64 chars

  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else {
    // Node.js fallback
    const nodeCrypto = await import('node:crypto')
    const randomBytes = nodeCrypto.randomBytes(48)
    array.set(randomBytes)
  }

  for (let i = 0; i < array.length; i++) {
    token += chars[array[i] % chars.length]
  }

  return token
}

/**
 * Format expiration time for display
 */
export function formatExpiration(expiresAt: Date | null): string {
  if (!expiresAt) {
    return 'Never'
  }

  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()

  if (diff < 0) {
    return 'Expired'
  }

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
}

/**
 * Get free tier limits
 */
export const FREE_TIER_LIMITS = {
  maxViews: 10,
  activityLogDays: 1,
  maxSecrets: null, // Unlimited
  maxOrganizations: 1, // Personal workspace only
  maxTeams: 0,
  burnOnRead: false,
  auditLogDays: 1,
}

/**
 * Get Pro Team tier limits
 */
export const PRO_TEAM_TIER_LIMITS = {
  maxViews: null, // Unlimited
  activityLogDays: 30,
  maxSecrets: null, // Unlimited
  maxOrganizations: null, // Unlimited
  maxTeams: null, // Unlimited
  burnOnRead: true,
  auditLogDays: 30,
}

/**
 * Get Business tier limits
 */
export const BUSINESS_TIER_LIMITS = {
  maxViews: null, // Unlimited
  activityLogDays: null, // Permanent
  maxSecrets: null, // Unlimited
  maxOrganizations: null, // Unlimited
  maxTeams: null, // Unlimited
  burnOnRead: true,
  auditLogDays: null, // Permanent
}

/**
 * Get tier limits
 */
export function getTierLimits(tier: 'free' | 'pro_team' | 'business') {
  switch (tier) {
    case 'free':
      return FREE_TIER_LIMITS
    case 'pro_team':
      return PRO_TEAM_TIER_LIMITS
    case 'business':
      return BUSINESS_TIER_LIMITS
    default:
      return FREE_TIER_LIMITS
  }
}

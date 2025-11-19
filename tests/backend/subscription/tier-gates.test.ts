import { describe, expect, it } from 'vitest'
import {
  canUseBurnOnRead,
  canUseIPAllowlisting,
  canUseSecretRecovery,
  canUseSSO,
  getAuditLogDays,
  getMaxViews,
  hasFeatureAccess,
  hasPermanentAuditLogs,
  validateFeatureUsage,
} from '@/lib/subscription'

describe('subscription tier gates', () => {
  it('derives feature access from tier limits', () => {
    expect(hasFeatureAccess('free', 'burnOnRead')).toBe(false)
    expect(hasFeatureAccess('pro_team', 'burnOnRead')).toBe(true)
    expect(hasFeatureAccess('business', 'maxOrganizations')).toBe(true)
  })

  it('maps helpers to correct tiers', () => {
    expect(canUseBurnOnRead('free')).toBe(false)
    expect(canUseBurnOnRead('pro_team')).toBe(true)
    expect(hasPermanentAuditLogs('business')).toBe(true)
    expect(canUseSSO('business')).toBe(true)
    expect(canUseIPAllowlisting('business')).toBe(true)
    expect(canUseSecretRecovery('business')).toBe(true)
  })

  it('returns tier-specific numeric limits', () => {
    expect(getMaxViews('free')).toBe(10)
    expect(getMaxViews('pro_team')).toBeNull()
    expect(getAuditLogDays('free')).toBe(1)
    expect(getAuditLogDays('business')).toBeNull()
  })

  it('validates feature usage against tier', () => {
    expect(validateFeatureUsage('free', 'burnOnRead', true)).toEqual({
      valid: false,
      message: 'Burn-on-read is only available for Pro Team and Business tiers',
    })

    expect(validateFeatureUsage('free', 'maxViews', 11)).toEqual({
      valid: false,
      message: 'Free tier is limited to 10 views per secret',
    })

    expect(validateFeatureUsage('free', 'organizations', 2).valid).toBe(false)
    expect(validateFeatureUsage('pro_team', 'maxViews', 50).valid).toBe(true)
  })
})


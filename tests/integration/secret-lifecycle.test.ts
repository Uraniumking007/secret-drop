import { describe, expect, it, vi } from 'vitest'
import {
  calculateExpiration,
  canViewSecret,
  hasReachedViewLimit,
} from '@/lib/secret-utils'
import { validateFeatureUsage } from '@/lib/subscription'

describe('secret lifecycle integration', () => {
  it('enforces tier rules then allows viewing after upgrade', () => {
    // Free tier cannot enable burn-on-read
    const freeValidation = validateFeatureUsage('free', 'burnOnRead', true)
    expect(freeValidation.valid).toBe(false)

    // Upgrade to Pro Team unlocks feature
    const proValidation = validateFeatureUsage('pro_team', 'burnOnRead', true)
    expect(proValidation.valid).toBe(true)

    // After creation, enforce expiration/view rules
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-05-01T00:00:00Z'))
    const expiration = calculateExpiration('1h')
    expect(expiration).not.toBeNull()

    const viewState = canViewSecret(0, 5, expiration, false, false)
    expect(viewState.canView).toBe(true)

    // Simulate reaching limit via webhook/log processing
    expect(hasReachedViewLimit(5, 5)).toBe(true)
    const deniedState = canViewSecret(5, 5, expiration, false, false)
    expect(deniedState.canView).toBe(false)

    vi.useRealTimers()
  })
})


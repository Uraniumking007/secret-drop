import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  calculateExpiration,
  canViewSecret,
  hasReachedViewLimit,
  isExpired,
} from '@/lib/secret-utils'

describe('secret-utils view logic', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('calculates expiration windows', () => {
    const oneHour = calculateExpiration('1h')
    expect(oneHour?.getTime()).toEqual(
      new Date('2024-01-01T01:00:00Z').getTime(),
    )

    const sevenDays = calculateExpiration('7d')
    expect(sevenDays?.getUTCDate()).toEqual(8)

    expect(calculateExpiration('never')).toBeNull()
  })

  it('detects expiration and view limits', () => {
    const expiresSoon = new Date('2023-12-31T23:00:00Z')
    expect(isExpired(expiresSoon)).toBe(true)
    expect(hasReachedViewLimit(10, 10)).toBe(true)
    expect(hasReachedViewLimit(3, null)).toBe(false)
  })

  it('prevents viewing when constraints violated', () => {
    const expired = canViewSecret(
      0,
      null,
      new Date('2023-12-31T23:59:00Z'),
      false,
      false,
    )
    expect(expired).toEqual({ canView: false, reason: 'Secret has expired' })

    const overLimit = canViewSecret(5, 5, null, false, false)
    expect(overLimit).toEqual({
      canView: false,
      reason: 'Maximum view limit reached',
    })

    const burnOnRead = canViewSecret(1, null, null, true, true)
    expect(burnOnRead).toEqual({
      canView: false,
      reason: 'Secret was deleted after first view',
    })

    const ok = canViewSecret(0, 10, null, false, false)
    expect(ok.canView).toBe(true)
  })
})

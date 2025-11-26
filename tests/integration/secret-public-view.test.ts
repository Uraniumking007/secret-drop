import { describe, expect, it } from 'vitest'
import { canViewSecret } from '@/lib/secret-utils'

describe('public secret view flow', () => {
  it('denies access when max view threshold reached', () => {
    const result = canViewSecret(5, 5, null, false, true)
    expect(result.canView).toBe(false)
    expect(result.reason).toContain('Maximum view limit')
  })

  it('permits access right before the max limit', () => {
    const result = canViewSecret(4, 5, null, false, true)
    expect(result.canView).toBe(true)
  })

  it('blocks second view for burn-on-read secrets', () => {
    const firstView = canViewSecret(0, null, null, true, false)
    expect(firstView.canView).toBe(true)

    const secondView = canViewSecret(1, null, null, true, true)
    expect(secondView.canView).toBe(false)
    expect(secondView.reason).toContain('deleted after first view')
  })
})


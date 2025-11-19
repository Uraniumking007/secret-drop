import { describe, expect, it } from 'vitest'
import { formatApiToken, generateApiToken, hashApiToken, verifyApiToken } from '@/lib/api-tokens'

describe('API token helpers', () => {
  it('generates url-safe tokens', () => {
    const token = generateApiToken()
    expect(token).toHaveLength(43) // base64url 32 bytes without padding
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('hashes and verifies tokens with SHA-256', () => {
    const token = 'sample-token'
    const hash = hashApiToken(token)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(verifyApiToken(token, hash)).toBe(true)
    expect(verifyApiToken('other', hash)).toBe(false)
  })

  it('formats tokens for display', () => {
    const token = 'abcdefghijklmnopqrstuvwx'
    expect(formatApiToken(token)).toEqual('abcdefgh...uvwx')
  })
})


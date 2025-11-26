import { describe, expect, it } from 'vitest'
import { extractRequestMetadata } from '@/lib/request-metadata'

describe('extractRequestMetadata', () => {
  it('prefers direct CDN headers when available', () => {
    const request = new Request('https://example.com', {
      headers: {
        'cf-connecting-ip': '203.0.113.1',
        'user-agent': 'SecretDropTest/1.0',
      },
    })

    const metadata = extractRequestMetadata(request)

    expect(metadata).toEqual({
      ipAddress: '203.0.113.1',
      userAgent: 'SecretDropTest/1.0',
    })
  })

  it('falls back to x-forwarded-for lists', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '198.51.100.5, 198.51.100.6',
        'user-agent': 'curl/8.0',
      },
    })

    const metadata = extractRequestMetadata(request)

    expect(metadata.ipAddress).toBe('198.51.100.5')
    expect(metadata.userAgent).toBe('curl/8.0')
  })

  it('handles forwarded header syntax', () => {
    const request = new Request('https://example.com', {
      headers: {
        forwarded: 'for=192.0.2.60;proto=https;by=203.0.113.43',
        'user-agent': 'bun-test',
      },
    })

    const metadata = extractRequestMetadata(request)

    expect(metadata.ipAddress).toBe('192.0.2.60')
  })

  it('returns null metadata when request is missing', () => {
    expect(extractRequestMetadata()).toEqual({
      ipAddress: null,
      userAgent: null,
    })
  })
})

/**
 * API token management for CLI and CI/CD
 */

import { createHash, randomBytes  } from 'node:crypto'

/**
 * Generate a new API token
 */
export function generateApiToken(): string {
  // Generate 32 bytes of random data, encode as base64url
  const bytes = randomBytes(32)
  return bytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Hash API token for storage (SHA-256)
 */
export function hashApiToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Verify API token against hash
 */
export function verifyApiToken(token: string, hash: string): boolean {
  const tokenHash = hashApiToken(token)
  return tokenHash === hash
}

/**
 * Format API token for display (show first 8 chars)
 */
export function formatApiToken(token: string): string {
  return `${token.slice(0, 8)}...${token.slice(-4)}`
}

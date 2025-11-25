import { createHash, randomBytes } from 'node:crypto'
import { Secret, TOTP } from 'otpauth'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { twoFactor } from '@/db/schema'

/**
 * Generate a TOTP secret for a user
 */
export function generateTOTPSecret(): string {
  return new Secret({ buffer: randomBytes(20).buffer }).base32
}

/**
 * Create a TOTP instance
 */
export function createTOTP(secret: string, email: string): TOTP {
  return new TOTP({
    issuer: 'SecretDrop',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  })
}

/**
 * Generate QR code URL for authenticator app
 */
export function getQRCodeURL(secret: string, email: string): string {
  const totp = createTOTP(secret, email)
  return totp.toString()
}

/**
 * Verify a TOTP token
 */
export function verifyTOTP(
  secret: string,
  token: string,
  email: string,
): boolean {
  try {
    const totp = createTOTP(secret, email)
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  } catch (error) {
    return false
  }
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 10): Array<string> {
  const codes: Array<string> = []
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase()
    codes.push(code)
  }
  return codes
}

/**
 * Hash a backup code for storage
 */
export function hashBackupCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

/**
 * Verify a backup code
 */
export function verifyBackupCode(
  code: string,
  hashedCodes: Array<string>,
): boolean {
  const hashed = hashBackupCode(code)
  return hashedCodes.includes(hashed)
}

/**
 * Get user's 2FA status
 */
export async function getTwoFactorStatus(userId: string) {
  const results = await db
    .select()
    .from(twoFactor)
    .where(eq(twoFactor.userId, userId))
    .limit(1)

  return results[0] || null
}

/**
 * Enable 2FA for a user
 */
export async function enableTwoFactor(
  userId: string,
  secret: string,
  backupCodes: Array<string>,
) {
  const hashedBackupCodes = backupCodes.map(hashBackupCode)

  const existingList = await db
    .select()
    .from(twoFactor)
    .where(eq(twoFactor.userId, userId))
    .limit(1)

  if (existingList.length > 0) {
    // Update existing
    const [updated] = await db
      .update(twoFactor)
      .set({
        secret,
        enabled: true,
        backupCodes: JSON.stringify(hashedBackupCodes),
        updatedAt: new Date(),
      })
      .where(eq(twoFactor.userId, userId))
      .returning()

    return updated
  } else {
    // Create new
    const [created] = await db
      .insert(twoFactor)
      .values({
        userId,
        secret,
        enabled: true,
        backupCodes: JSON.stringify(hashedBackupCodes),
      })
      .returning()

    return created
  }
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactor(userId: string) {
  await db
    .update(twoFactor)
    .set({
      enabled: false,
      updatedAt: new Date(),
    })
    .where(eq(twoFactor.userId, userId))
}

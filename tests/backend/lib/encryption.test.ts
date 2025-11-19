import { describe, expect, it } from 'vitest'
import {
  encrypt,
  decrypt,
  generateEncryptionKey,
  hashPassword,
  verifyPassword,
  generateSalt,
} from '@/lib/encryption'

describe('encryption utilities', () => {
  it('generates a 32-byte AES key by default', async () => {
    const key = await generateEncryptionKey()
    expect(key).toBeInstanceOf(Uint8Array)
    expect(key).toHaveLength(32)
  })

  it('round-trips plaintext through encrypt/decrypt', async () => {
    const key = await generateEncryptionKey()
    const plaintext = 'secretdrop::roundtrip'

    const encrypted = await encrypt(plaintext, key)
    expect(encrypted.encryptedData).toBeTypeOf('string')
    expect(encrypted.iv).toBeTypeOf('string')
    expect(encrypted.keyHash).toBeTypeOf('string')

    const result = await decrypt(encrypted.encryptedData, encrypted.iv, key)
    expect(result.decryptedData).toEqual(plaintext)
  })

  it('hashes and verifies passwords with PBKDF2', async () => {
    const salt = await generateSalt()
    const password = 'correct horse battery staple'

    const hash = await hashPassword(password, salt)
    expect(hash).toBeTypeOf('string')
    expect(await verifyPassword(password, salt, hash)).toBe(true)
    expect(await verifyPassword('wrong', salt, hash)).toBe(false)
  })
})


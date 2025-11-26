import { describe, expect, it } from 'bun:test'
import {
  decryptSecretWithPassword,
  encryptSecretWithPassword,
} from '@/lib/client-secret-crypto'

describe('client secret crypto helpers', () => {
  it('round-trips plaintext with password-derived key', async () => {
    const plaintext = 'super-secret-value'
    const password = 'correct horse battery staple'

    const encrypted = await encryptSecretWithPassword(plaintext, password)
    const decrypted = await decryptSecretWithPassword({
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      salt: encrypted.salt,
      password,
    })

    expect(decrypted).toBe(plaintext)
  })
})

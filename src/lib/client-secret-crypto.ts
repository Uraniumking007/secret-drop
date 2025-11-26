const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const toBase64 = (bytes: Uint8Array) => {
  if (typeof window === 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

const fromBase64 = (value: string) => {
  if (typeof window === 'undefined') {
    return Uint8Array.from(Buffer.from(value, 'base64'))
  }
  const binary = atob(value)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return array
}

async function deriveAesKey(password: string, salt: Uint8Array) {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey', 'deriveBits'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 150_000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
}

async function exportRawKey(key: CryptoKey) {
  const raw = await crypto.subtle.exportKey('raw', key)
  return new Uint8Array(raw)
}

export async function encryptSecretWithPassword(
  secret: string,
  password: string,
) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const aesKey = await deriveAesKey(password, salt)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    textEncoder.encode(secret),
  )
  const keyBytes = await exportRawKey(aesKey)
  const keyHash = await crypto.subtle.digest('SHA-256', keyBytes)

  return {
    ciphertext: toBase64(new Uint8Array(encrypted)),
    iv: toBase64(iv),
    salt: toBase64(salt),
    keyHash: toBase64(new Uint8Array(keyHash)),
  }
}

export async function decryptSecretWithPassword(options: {
  ciphertext: string
  iv: string
  salt: string
  password: string
}) {
  const saltBytes = fromBase64(options.salt)
  const ivBytes = fromBase64(options.iv)
  const aesKey = await deriveAesKey(options.password, saltBytes)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    aesKey,
    fromBase64(options.ciphertext),
  )

  return textDecoder.decode(decrypted)
}

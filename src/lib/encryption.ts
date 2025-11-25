/**
 * Encryption utilities for client-side AES-256 encryption
 * Supports multiple encryption libraries: Web Crypto API, crypto-js, @noble/ciphers
 */

export type EncryptionLibrary = 'webcrypto' | 'crypto-js' | 'noble'

export interface EncryptionResult {
  encryptedData: string // Base64 encoded
  iv: string // Base64 encoded initialization vector
  keyHash: string // SHA-256 hash of the encryption key for verification
}

export interface DecryptionResult {
  decryptedData: string
}

/**
 * Generate a random encryption key (32 bytes for AES-256)
 */
export async function generateEncryptionKey(
  library: EncryptionLibrary = 'webcrypto',
): Promise<Uint8Array> {
  if (library === 'webcrypto') {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    )
    const exported = await crypto.subtle.exportKey('raw', key)
    return new Uint8Array(exported)
  }

  // For other libraries, generate random bytes
  const key = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(key)
  } else {
    // Node.js fallback
    const nodeCrypto = await import('node:crypto')
    const randomBytes = nodeCrypto.randomBytes(32)
    key.set(randomBytes)
  }
  return key
}

/**
 * Derive encryption key from password using PBKDF2
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: string,
  library: EncryptionLibrary = 'webcrypto',
): Promise<Uint8Array> {
  if (library === 'webcrypto') {
    const encoder = new TextEncoder()
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    )

    const saltBuffer = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0))

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )

    const exported = await crypto.subtle.exportKey('raw', derivedKey)
    return new Uint8Array(exported)
  }

  if (library === 'crypto-js') {
    const CryptoJSModule = await import('crypto-js')
    const CryptoJS = CryptoJSModule.default || CryptoJSModule
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 100000,
    })
    const hexString = key.toString(CryptoJS.enc.Hex)
    return new Uint8Array(
      hexString.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
    )
  }

  // @noble/ciphers
  const { pbkdf2 } = await import('@noble/hashes/pbkdf2.js')
  const { sha256 } = await import('@noble/hashes/sha2.js')
  const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0))
  const key = pbkdf2(sha256, password, saltBytes, {
    c: 100000,
    dkLen: 32,
  })
  return key
}

/**
 * Hash encryption key for verification (SHA-256)
 */
export async function hashEncryptionKey(
  key: Uint8Array,
  library: EncryptionLibrary = 'webcrypto',
): Promise<string> {
  if (library === 'webcrypto') {
    const keyBuffer = new Uint8Array(key).buffer
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer)
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
  }

  if (library === 'crypto-js') {
    const CryptoJSModule = await import('crypto-js')
    const CryptoJS = CryptoJSModule.default || CryptoJSModule
    const keyWordArray = CryptoJS.lib.WordArray.create(key)
    const hash = CryptoJS.SHA256(keyWordArray)
    return hash.toString(CryptoJS.enc.Base64)
  }

  // @noble/ciphers
  const { sha256 } = await import('@noble/hashes/sha2.js')
  const hash = sha256(key)
  return btoa(String.fromCharCode(...hash))
}

/**
 * Encrypt data using AES-256-GCM
 */
export async function encrypt(
  data: string,
  key: Uint8Array,
  library: EncryptionLibrary = 'webcrypto',
): Promise<EncryptionResult> {
  const dataBytes = new TextEncoder().encode(data)

  if (library === 'webcrypto') {
    // Generate IV (12 bytes for GCM)
    const iv = new Uint8Array(12)
    crypto.getRandomValues(iv)

    const keyBuffer = new Uint8Array(key).buffer
    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      'AES-GCM',
      false,
      ['encrypt'],
    )

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      importedKey,
      dataBytes,
    )

    const encryptedArray = new Uint8Array(encrypted)
    const keyHash = await hashEncryptionKey(key, library)

    return {
      encryptedData: btoa(String.fromCharCode(...encryptedArray)),
      iv: btoa(String.fromCharCode(...iv)),
      keyHash,
    }
  }

  if (library === 'crypto-js') {
    const CryptoJSModule = await import('crypto-js')
    const CryptoJS = CryptoJSModule.default || CryptoJSModule
    const iv = CryptoJS.lib.WordArray.random(12)
    const keyWordArray = CryptoJS.lib.WordArray.create(key)
    const dataWordArray = CryptoJS.lib.WordArray.create(dataBytes)

    const encrypted = CryptoJS.AES.encrypt(dataWordArray, keyWordArray, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    const keyHash = await hashEncryptionKey(key, library)

    return {
      encryptedData: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
      iv: iv.toString(CryptoJS.enc.Base64),
      keyHash,
    }
  }

  // @noble/ciphers
  const { gcm } = await import('@noble/ciphers/aes.js')
  const { randomBytes } = await import('@noble/ciphers/utils.js')
  const iv = randomBytes(12)
  const cipher = gcm(key, iv)
  const encrypted = cipher.encrypt(dataBytes)
  const keyHash = await hashEncryptionKey(key, library)

  return {
    encryptedData: btoa(String.fromCharCode(...encrypted)),
    iv: btoa(String.fromCharCode(...iv)),
    keyHash,
  }
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decrypt(
  encryptedData: string,
  iv: string,
  key: Uint8Array,
  library: EncryptionLibrary = 'webcrypto',
): Promise<DecryptionResult> {
  const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) =>
    c.charCodeAt(0),
  )
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0))

  if (library === 'webcrypto') {
    const keyBuffer = new Uint8Array(key).buffer
    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      'AES-GCM',
      false,
      ['decrypt'],
    )

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
      },
      importedKey,
      encryptedBytes,
    )

    const decryptedArray = new Uint8Array(decrypted)
    return {
      decryptedData: new TextDecoder().decode(decryptedArray),
    }
  }

  if (library === 'crypto-js') {
    const CryptoJSModule = await import('crypto-js')
    const CryptoJS = CryptoJSModule.default || CryptoJSModule
    const keyWordArray = CryptoJS.lib.WordArray.create(key)
    const ivWordArray = CryptoJS.lib.WordArray.create(ivBytes)
    const encryptedWordArray = CryptoJS.lib.WordArray.create(encryptedBytes)

    const decrypted = CryptoJS.AES.decrypt(
      {
        ciphertext: encryptedWordArray,
      } as any,
      keyWordArray,
      {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    )

    return {
      decryptedData: decrypted.toString(CryptoJS.enc.Utf8),
    }
  }

  // @noble/ciphers
  const { gcm } = await import('@noble/ciphers/aes.js')
  const cipher = gcm(key, ivBytes)
  const decrypted = cipher.decrypt(encryptedBytes)
  return {
    decryptedData: new TextDecoder().decode(decrypted),
  }
}

/**
 * Hash password using PBKDF2 (for password-protected shares)
 */
export async function hashPassword(
  password: string,
  salt: string,
  library: EncryptionLibrary = 'webcrypto',
): Promise<string> {
  const key = await deriveKeyFromPassword(password, salt, library)
  return btoa(String.fromCharCode(...key))
}

/**
 * Verify password hash
 */
export async function verifyPassword(
  password: string,
  salt: string,
  hash: string,
  library: EncryptionLibrary = 'webcrypto',
): Promise<boolean> {
  const derivedHash = await hashPassword(password, salt, library)
  return derivedHash === hash
}

/**
 * Generate a random salt (base64 encoded)
 */
export async function generateSalt(): Promise<string> {
  const salt = new Uint8Array(16)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(salt)
  } else {
    // Node.js fallback
    const nodeCrypto = await import('node:crypto')
    const randomBytes = nodeCrypto.randomBytes(16)
    salt.set(randomBytes)
  }
  return btoa(String.fromCharCode(...salt))
}

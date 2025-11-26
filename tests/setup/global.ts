import { webcrypto } from 'node:crypto'
import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

expect.extend(matchers)

// Ensure global crypto + subtle are available for Node test envs

// Ensure global crypto + subtle are available for Node test envs
if (!globalThis.crypto?.subtle) {
  Object.assign(globalThis.crypto, webcrypto)
}

// Polyfill atob/btoa for Node
if (typeof globalThis.atob === 'undefined') {
  globalThis.atob = (input: string) =>
    Buffer.from(input, 'base64').toString('binary')
}

if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = (input: string) =>
    Buffer.from(input, 'binary').toString('base64')
}

// Helper to mock matchMedia in jsdom suites
if (typeof globalThis.matchMedia === 'undefined') {
  globalThis.matchMedia = () =>
    ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}


import { describe, it, expect } from 'vitest'

describe('CryptoJS Import', () => {
    it('should import crypto-js correctly', async () => {
        const CryptoJS = await import('crypto-js')
        console.log('CryptoJS keys:', Object.keys(CryptoJS))
        if (CryptoJS.default) {
            console.log('CryptoJS.default keys:', Object.keys(CryptoJS.default))
        }

        try {
            const iv = CryptoJS.lib.WordArray.random(12)
            console.log('CryptoJS.lib works')
        } catch (e) {
            console.log('CryptoJS.lib failed:', e.message)
        }

        try {
            const iv = CryptoJS.default.lib.WordArray.random(12)
            console.log('CryptoJS.default.lib works')
        } catch (e) {
            console.log('CryptoJS.default.lib failed:', e.message)
        }
    })
})

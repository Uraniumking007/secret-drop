import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  plugins: [
    devtools(),
    netlify(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  optimizeDeps: {
    include: [
      '@noble/hashes/pbkdf2.js',
      '@noble/hashes/sha2.js',
      '@noble/ciphers/aes.js',
      '@noble/ciphers/utils.js',
    ],
  },
  ssr: {
    noExternal: ['@noble/hashes', '@noble/ciphers'],
  },
})

export default config

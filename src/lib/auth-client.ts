import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.SERVER_URL || 'http://localhost:3000',
  basePath: '/api/auth',
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient


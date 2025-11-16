import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Allow login without email verification
  },
  baseURL: process.env.SERVER_URL || 'http://localhost:3000',
  basePath: '/api/auth',
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      // Use our custom email service
      const { sendVerificationEmail } = await import('./email')
      await sendVerificationEmail(user.email, token)
    },
  },
})


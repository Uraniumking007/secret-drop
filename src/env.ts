import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional(),
    DATABASE_URL: z
      .string()
      .url()
      .default('postgresql://localhost:5432/secretdrop'),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    ENCRYPTION_SALT: z.string().min(16).optional(),
    SSO_GOOGLE_CLIENT_ID: z.string().optional(),
    SSO_GOOGLE_CLIENT_SECRET: z.string().optional(),
    SSO_OKTA_CLIENT_ID: z.string().optional(),
    SSO_OKTA_CLIENT_SECRET: z.string().optional(),
    SSO_AZURE_CLIENT_ID: z.string().optional(),
    SSO_AZURE_CLIENT_SECRET: z.string().optional(),
    // SMTP Configuration for Zoho
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().email().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM_EMAIL: z.string().email().optional(),
    SMTP_FROM_NAME: z.string().optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: import.meta.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})

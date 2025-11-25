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
    // Host: smtp.zoho.com
    // Port: 587 (TLS) or 465 (SSL)
    SMTP_HOST: z.string().default('smtp.zoho.com'),
    SMTP_PORT: z.string().default('587'), // 587 for TLS, 465 for SSL
    SMTP_USER: z.string().email().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM_EMAIL: z.string().email().optional(),
    SMTP_FROM_NAME: z.string().optional(),
    // ImageKit Configuration
    IMAGEKIT_PUBLIC_KEY: z.string().optional(),
    IMAGEKIT_PRIVATE_KEY: z.string().optional(),
    IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
    // Dodo Payments Configuration
    DODO_PAYMENTS_API_KEY: z.string().optional(),
    DODO_PRO_TEAM_PRODUCT_ID: z.string().optional(),
    DODO_BUSINESS_PRODUCT_ID: z.string().optional(),
    DODO_PAYMENTS_WEBHOOK_KEY: z.string().optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_ENV: z.string().optional().default('production'),
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    VITE_IMAGEKIT_PUBLIC_KEY: z.string().optional(),
    VITE_IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    ...import.meta.env,
    DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY,
    DODO_PRO_TEAM_PRODUCT_ID: process.env.DODO_PRO_TEAM_PRODUCT_ID,
    DODO_BUSINESS_PRODUCT_ID: process.env.DODO_BUSINESS_PRODUCT_ID,
    DODO_PAYMENTS_WEBHOOK_KEY: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
  },

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

import { betterAuth } from 'better-auth'
import { Pool } from 'pg'
import { sso } from '@better-auth/sso'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

export const auth = betterAuth({
  plugins: [sso()],
  database: pool,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Allow login without email verification
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const { db } = await import('@/db')
          const { organizations, organizationMembers } = await import(
            '@/db/schema'
          )

          const [newOrg] = await db
            .insert(organizations)
            .values({
              name: `${user.name}'s Organization`,
              slug: `${user.name.toLowerCase().replace(/\s/g, '-')}-org`,
              tier: 'free',
              ownerId: user.id,
            })
            .returning()

          await db.insert(organizationMembers).values({
            orgId: newOrg.id,
            userId: user.id,
            role: 'owner',
          })
        },
      },
    },
    session: {
      create: {
        before: async (sessionData) => {
          if (sessionData.activeOrgId) {
            return
          }

          const [{ db }, { organizationMembers }] = await Promise.all([
            import('@/db'),
            import('@/db/schema'),
          ])
          const { eq, asc } = await import('drizzle-orm')

          const [membership] = await db
            .select({
              orgId: organizationMembers.orgId,
            })
            .from(organizationMembers)
            .where(eq(organizationMembers.userId, sessionData.userId))
            .orderBy(asc(organizationMembers.joinedAt))
            .limit(1)

          if (membership && membership.orgId) {
            return {
              data: {
                activeOrgId: membership.orgId,
              },
            }
          }
        },
      },
    },
  },
  baseURL: process.env.SERVER_URL || 'http://localhost:3000',
  basePath: '/api/auth',
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      // Use our custom email service
      const { sendVerificationEmail } = await import('./email')
      await sendVerificationEmail(user.email, token)
    },
  },
})

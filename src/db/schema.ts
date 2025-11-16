import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  varchar,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

// Enums
export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'free',
  'pro_team',
  'business',
])

export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'admin',
  'member',
])

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'past_due',
  'trialing',
])

export const accessActionEnum = pgEnum('access_action', [
  'view',
  'edit',
  'delete',
  'share',
])

export const ssoProviderTypeEnum = pgEnum('sso_provider_type', [
  'google',
  'okta',
  'azure',
  'generic_oauth2',
])

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  bio: text('bio'),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', {
    withTimezone: true,
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Two-factor authentication (TOTP)
export const twoFactor = pgTable(
  'two_factor',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    secret: text('secret').notNull(), // Encrypted TOTP secret
    enabled: boolean('enabled').default(false).notNull(),
    backupCodes: text('backup_codes'), // JSON array of hashed backup codes
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('two_factor_user_id_idx').on(table.userId),
  })
)

// Organizations table
export const organizations = pgTable(
  'organizations',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    tier: subscriptionTierEnum('tier').default('free').notNull(),
    ownerId: text('owner_id').notNull(), // References better-auth user.id
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('organizations_slug_idx').on(table.slug),
    ownerIdx: index('organizations_owner_id_idx').on(table.ownerId),
  })
)

// Organization members (RBAC)
export const organizationMembers = pgTable(
  'organization_members',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(), // References better-auth user.id
    orgId: integer('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').default('member').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    userOrgIdx: unique('organization_members_user_org_unique').on(
      table.userId,
      table.orgId
    ),
    orgIdx: index('organization_members_org_id_idx').on(table.orgId),
    userIdx: index('organization_members_user_id_idx').on(table.userId),
  })
)

// Teams (sub-groups within organizations)
export const teams = pgTable(
  'teams',
  {
    id: serial('id').primaryKey(),
    orgId: integer('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgSlugIdx: unique('teams_org_slug_unique').on(table.orgId, table.slug),
    orgIdx: index('teams_org_id_idx').on(table.orgId),
  })
)

// Team members
export const teamMembers = pgTable(
  'team_members',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(), // References better-auth user.id
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    userTeamIdx: unique('team_members_user_team_unique').on(
      table.userId,
      table.teamId
    ),
    teamIdx: index('team_members_team_id_idx').on(table.teamId),
    userIdx: index('team_members_user_id_idx').on(table.userId),
  })
)

// Secrets table
export const secrets = pgTable(
  'secrets',
  {
    id: serial('id').primaryKey(),
    orgId: integer('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    teamId: integer('team_id').references(() => teams.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    encryptedData: text('encrypted_data').notNull(), // Base64 encoded encrypted blob
    encryptionKeyHash: text('encryption_key_hash').notNull(), // Hash of encryption key for verification
    passwordHash: text('password_hash'), // Optional password protection (PBKDF2 hash)
    maxViews: integer('max_views'), // Null = unlimited
    viewCount: integer('view_count').default(0).notNull(),
    expiresAt: timestamp('expires_at'), // Null = never expires
    burnOnRead: boolean('burn_on_read').default(false).notNull(),
    createdBy: text('created_by').notNull(), // References better-auth user.id
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'), // Soft delete
  },
  (table) => ({
    orgIdx: index('secrets_org_id_idx').on(table.orgId),
    teamIdx: index('secrets_team_id_idx').on(table.teamId),
    createdByIdx: index('secrets_created_by_idx').on(table.createdBy),
    deletedAtIdx: index('secrets_deleted_at_idx').on(table.deletedAt),
  })
)

// Secret access logs (audit trail)
export const secretAccessLogs = pgTable(
  'secret_access_logs',
  {
    id: serial('id').primaryKey(),
    secretId: integer('secret_id')
      .notNull()
      .references(() => secrets.id, { onDelete: 'cascade' }),
    userId: text('user_id'), // Null for anonymous access via share link
    action: accessActionEnum('action').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    accessedAt: timestamp('accessed_at').defaultNow().notNull(),
  },
  (table) => ({
    secretIdx: index('secret_access_logs_secret_id_idx').on(table.secretId),
    userIdIdx: index('secret_access_logs_user_id_idx').on(table.userId),
    accessedAtIdx: index('secret_access_logs_accessed_at_idx').on(
      table.accessedAt
    ),
  })
)

// Secret shares (shareable links)
export const secretShares = pgTable(
  'secret_shares',
  {
    id: serial('id').primaryKey(),
    secretId: integer('secret_id')
      .notNull()
      .references(() => secrets.id, { onDelete: 'cascade' }),
    shareToken: varchar('share_token', { length: 64 }).notNull().unique(),
    passwordHash: text('password_hash'), // Optional password protection
    expiresAt: timestamp('expires_at'),
    maxViews: integer('max_views'),
    viewCount: integer('view_count').default(0).notNull(),
    createdBy: text('created_by').notNull(), // References better-auth user.id
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: index('secret_shares_token_idx').on(table.shareToken),
    secretIdx: index('secret_shares_secret_id_idx').on(table.secretId),
  })
)

// Subscriptions
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id'), // For personal subscriptions
    orgId: integer('org_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }), // For org subscriptions
    tier: subscriptionTierEnum('tier').notNull(),
    status: subscriptionStatusEnum('status').notNull(),
    stripeSubscriptionId: varchar('stripe_subscription_id', {
      length: 255,
    }).unique(),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    currentPeriodEnd: timestamp('current_period_end'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
    orgIdIdx: index('subscriptions_org_id_idx').on(table.orgId),
    stripeSubIdx: index('subscriptions_stripe_subscription_id_idx').on(
      table.stripeSubscriptionId
    ),
  })
)

// IP allowlist (Business tier)
export const ipAllowlist = pgTable(
  'ip_allowlist',
  {
    id: serial('id').primaryKey(),
    orgId: integer('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    ipAddress: text('ip_address').notNull(), // Can be CIDR notation
    cidr: integer('cidr'), // CIDR prefix length if applicable
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('ip_allowlist_org_id_idx').on(table.orgId),
  })
)

// SSO providers
export const ssoProviders = pgTable(
  'sso_providers',
  {
    id: serial('id').primaryKey(),
    orgId: integer('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    providerType: ssoProviderTypeEnum('provider_type').notNull(),
    clientId: text('client_id').notNull(),
    clientSecretEncrypted: text('client_secret_encrypted').notNull(), // Encrypted client secret
    authorizationUrl: text('authorization_url'), // OAuth 2.0 authorization endpoint
    tokenUrl: text('token_url'), // OAuth 2.0 token endpoint
    userInfoUrl: text('user_info_url'), // OAuth 2.0 user info endpoint
    scopes: text('scopes'), // Comma-separated scopes
    enabled: boolean('enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('sso_providers_org_id_idx').on(table.orgId),
  })
)

// Trash bin (soft-deleted secrets for recovery)
export const trashBin = pgTable(
  'trash_bin',
  {
    id: serial('id').primaryKey(),
    secretId: integer('secret_id')
      .notNull()
      .references(() => secrets.id, { onDelete: 'cascade' }),
    orgId: integer('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    deletedBy: text('deleted_by').notNull(), // References better-auth user.id
    deletedAt: timestamp('deleted_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(), // 30 days from deletion
  },
  (table) => ({
    orgIdx: index('trash_bin_org_id_idx').on(table.orgId),
    secretIdx: index('trash_bin_secret_id_idx').on(table.secretId),
    expiresAtIdx: index('trash_bin_expires_at_idx').on(table.expiresAt),
  })
)

// API tokens for CLI/CI-CD
export const apiTokens = pgTable(
  'api_tokens',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(), // References better-auth user.id
    orgId: integer('org_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    teamId: integer('team_id').references(() => teams.id, {
      onDelete: 'cascade',
    }),
    tokenHash: text('token_hash').notNull().unique(), // Hashed API token
    name: text('name').notNull(), // User-friendly name for the token
    lastUsedAt: timestamp('last_used_at'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tokenHashIdx: index('api_tokens_token_hash_idx').on(table.tokenHash),
    userIdIdx: index('api_tokens_user_id_idx').on(table.userId),
    orgIdx: index('api_tokens_org_id_idx').on(table.orgId),
  })
)

// Relations (for Drizzle queries)
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  teams: many(teams),
  secrets: many(secrets),
  subscriptions: many(subscriptions),
  ipAllowlist: many(ipAllowlist),
  ssoProviders: many(ssoProviders),
  trashBin: many(trashBin),
}))

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.orgId],
      references: [organizations.id],
    }),
  })
)

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.orgId],
    references: [organizations.id],
  }),
  members: many(teamMembers),
  secrets: many(secrets),
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}))

export const secretsRelations = relations(secrets, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [secrets.orgId],
    references: [organizations.id],
  }),
  team: one(teams, {
    fields: [secrets.teamId],
    references: [teams.id],
  }),
  accessLogs: many(secretAccessLogs),
  shares: many(secretShares),
}))

export const secretAccessLogsRelations = relations(
  secretAccessLogs,
  ({ one }) => ({
    secret: one(secrets, {
      fields: [secretAccessLogs.secretId],
      references: [secrets.id],
    }),
  })
)

export const secretSharesRelations = relations(secretShares, ({ one }) => ({
  secret: one(secrets, {
    fields: [secretShares.secretId],
    references: [secrets.id],
  }),
}))

// User preferences
export const userPreferences = pgTable(
  'user_preferences',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    timezone: text('timezone').default('UTC'),
    language: text('language').default('en'),
    emailNotifications: boolean('email_notifications')
      .default(true)
      .notNull(),
    theme: text('theme'), // 'light', 'dark', 'system' - may be redundant with existing theme system
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('user_preferences_user_id_idx').on(table.userId),
  })
)

// Keep todos table for backward compatibility (can be removed later)
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

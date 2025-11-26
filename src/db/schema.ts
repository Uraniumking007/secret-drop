import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

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
  activeOrgId: uuid('activeOrgId').references(() => organizations.id, {
    onDelete: 'set null',
  }),
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
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

// Domain tables
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tier: subscriptionTierEnum('tier').default('free').notNull(),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(), // References better-auth user.id
    role: memberRoleEnum('role').default('member').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    userOrgIdx: unique('organization_members_user_org_unique').on(
      table.userId,
      table.orgId,
    ),
    orgIdx: index('organization_members_org_id_idx').on(table.orgId),
    userIdx: index('organization_members_user_id_idx').on(table.userId),
  }),
)

export const teams = pgTable(
  'teams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('teams_org_id_idx').on(table.orgId),
  }),
)

export const teamMembers = pgTable(
  'team_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(), // References better-auth user.id
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    userTeamIdx: unique('team_members_user_team_unique').on(
      table.userId,
      table.teamId,
    ),
    teamIdx: index('team_members_team_id_idx').on(table.teamId),
    userIdx: index('team_members_user_id_idx').on(table.userId),
  }),
)

// Secrets table
export const secrets = pgTable(
  'secrets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id').references(() => teams.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    encryptedData: text('encrypted_data').notNull(), // Base64 encoded encrypted blob
    encryptedEncryptionKey: text('encrypted_encryption_key'), // Encrypted encryption key (using master key or client password)
    encryptionKeyHash: text('encryption_key_hash').notNull(), // Hash of encryption key for verification
    encryptionSalt: text('encryption_salt'), // PBKDF2 salt for password-derived encryption keys
    encryptionVersion: text('encryption_version')
      .default('server_managed')
      .notNull(), // server_managed | password_derived
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
  }),
)

// Secret access logs (audit trail)
export const secretAccessLogs = pgTable(
  'secret_access_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    secretId: uuid('secret_id').references(() => secrets.id, {
      onDelete: 'set null',
    }),
    secretName: text('secret_name'), // Snapshot of secret name for audit
    secretOwnerId: text('secret_owner_id'), // Snapshot of secret owner for audit
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
      table.accessedAt,
    ),
  }),
)

// Secret shares (shareable links)
export const secretShares = pgTable(
  'secret_shares',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    secretId: uuid('secret_id').references(() => secrets.id, {
      onDelete: 'set null',
    }),
    secretName: text('secret_name'), // Snapshot of secret name for audit
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
  }),
)

// Subscriptions
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id'), // For personal subscriptions
    orgId: uuid('org_id').references(() => organizations.id, {
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
    userOrgIdx: index('subscriptions_user_id_org_id_idx').on(
      table.userId,
      table.orgId,
    ),
    stripeSubIdx: index('subscriptions_stripe_subscription_id_idx').on(
      table.stripeSubscriptionId,
    ),
  }),
)

// User preferences
export const userPreferences = pgTable(
  'user_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    theme: varchar('theme', { length: 20 }).default('system'),
    defaultOrgId: uuid('default_org_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: unique('user_preferences_user_id_idx').on(table.userId),
  }),
)

// API Tokens
export const apiTokens = pgTable(
  'api_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    tokenHash: text('token_hash').notNull(), // SHA-256 hash of the token
    prefix: varchar('prefix', { length: 8 }).notNull(), // First 8 chars for display
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    lastUsedAt: timestamp('last_used_at'),
    expiresAt: timestamp('expires_at'), // Optional expiration
    createdAt: timestamp('created_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'),
  },
  (table) => ({
    userIdx: index('api_tokens_user_id_idx').on(table.userId),
    tokenHashIdx: index('api_tokens_token_hash_idx').on(table.tokenHash),
    prefixIdx: index('api_tokens_prefix_idx').on(table.prefix),
  }),
)

// SSO Providers (for organization-level SSO)
export const ssoProviders = pgTable(
  'sso_providers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    type: ssoProviderTypeEnum('type').notNull(),
    name: text('name').notNull(), // e.g. "Corporate Okta"
    clientId: text('client_id').notNull(),
    clientSecret: text('client_secret').notNull(), // Encrypted at rest
    issuerUrl: text('issuer_url'), // For OIDC
    authorizationUrl: text('authorization_url'), // For OAuth2
    tokenUrl: text('token_url'), // For OAuth2
    userInfoUrl: text('user_info_url'), // For OAuth2
    isEnabled: boolean('is_enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('sso_providers_org_id_idx').on(table.orgId),
  }),
)

// Two Factor Authentication
export const twoFactor = pgTable(
  'two_factor',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    secret: text('secret').notNull(), // TOTP secret (encrypted)
    backupCodes: text('backup_codes').notNull(), // JSON array of hashed backup codes
    isEnabled: boolean('is_enabled').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: unique('two_factor_user_id_idx').on(table.userId),
  }),
)

// IP Allowlist
export const ipAllowlist = pgTable(
  'ip_allowlist',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    cidr: varchar('cidr', { length: 45 }).notNull(), // IPv4 or IPv6 CIDR
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('ip_allowlist_org_id_idx').on(table.orgId),
  }),
)

// Trash Bin (Soft deleted items)
export const trashBin = pgTable(
  'trash_bin',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    itemType: varchar('item_type', { length: 50 }).notNull(), // 'secret', 'team', etc.
    itemId: uuid('item_id').notNull(),
    originalData: text('original_data').notNull(), // JSON string of deleted data
    deletedBy: text('deleted_by').notNull(), // User ID
    deletedAt: timestamp('deleted_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('trash_bin_org_id_idx').on(table.orgId),
    deletedAtIdx: index('trash_bin_deleted_at_idx').on(table.deletedAt),
    itemIdx: index('trash_bin_item_idx').on(table.itemType, table.itemId),
  }),
)

// Relations
export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  organizationMemberships: many(organizationMembers),
  teamMemberships: many(teamMembers),
  createdSecrets: many(secrets),
  preferences: one(userPreferences),
  apiTokens: many(apiTokens),
  twoFactor: one(twoFactor),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  teams: many(teams),
  secrets: many(secrets),
  subscriptions: many(subscriptions),
  ssoProviders: many(ssoProviders),
  ipAllowlist: many(ipAllowlist),
  trashBin: many(trashBin),
}))

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.orgId],
      references: [organizations.id],
    }),
    user: one(user, {
      fields: [organizationMembers.userId],
      references: [user.id],
    }),
  }),
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
  user: one(user, {
    fields: [teamMembers.userId],
    references: [user.id],
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
  author: one(user, {
    fields: [secrets.createdBy],
    references: [user.id],
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
  }),
)

export const secretSharesRelations = relations(secretShares, ({ one }) => ({
  secret: one(secrets, {
    fields: [secretShares.secretId],
    references: [secrets.id],
  }),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.orgId],
    references: [organizations.id],
  }),
}))

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userPreferences.userId],
      references: [user.id],
    }),
  }),
)

export const apiTokensRelations = relations(apiTokens, ({ one }) => ({
  user: one(user, {
    fields: [apiTokens.userId],
    references: [user.id],
  }),
}))

export const ssoProvidersRelations = relations(ssoProviders, ({ one }) => ({
  organization: one(organizations, {
    fields: [ssoProviders.orgId],
    references: [organizations.id],
  }),
}))

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}))

export const ipAllowlistRelations = relations(ipAllowlist, ({ one }) => ({
  organization: one(organizations, {
    fields: [ipAllowlist.orgId],
    references: [organizations.id],
  }),
}))

export const trashBinRelations = relations(trashBin, ({ one }) => ({
  organization: one(organizations, {
    fields: [trashBin.orgId],
    references: [organizations.id],
  }),
}))

// Sample TODOS schema (to be removed/replaced)
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  content: text('content'),
  completed: boolean('completed'),
})

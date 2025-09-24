import { pgTable, text, timestamp, uniqueIndex, boolean, foreignKey, index, varchar, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ precision: 3, mode: "date" }).notNull(),
  createdAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().default(false).notNull(),
    image: text(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    username: text(),
    displayUsername: text(),
    /** Whether two factor authentication is enabled for the user */
    twoFactorEnabled: boolean().default(false),
  },
  (table) => [
    uniqueIndex("user_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("user_username_key").using(
      "btree",
      table.username.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text().notNull(),
  },
  (table) => [
    uniqueIndex("session_token_key").using(
      "btree",
      table.token.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ precision: 3, mode: "date" }),
    refreshTokenExpiresAt: timestamp({ precision: 3, mode: "date" }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const environment = pgTable(
  "environment",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    variables: text().notNull(),
    variablesPassword: text("variables_password"),
    variablesHint: text("variables_hint"),
    ownerId: text("owner_id"),
    isPublic: boolean("is_public").notNull(),
    expiresAt: timestamp("expires_at", { precision: 6, mode: "string" }),
    isExpiring: boolean("is_expiring").notNull(),
    deletedAt: timestamp("deleted_at", { precision: 6, mode: "string" }),
    createdAt: timestamp("created_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("env_owner_idx").using(
      "btree",
      table.ownerId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [user.id],
      name: "environment_owner_id_user_id_fk",
    }).onDelete("cascade"),
  ]
);

export const environmentOrg = pgTable(
  "environment_org",
  {
    id: text().primaryKey().notNull(),
    environmentId: text("environment_id").notNull(),
    orgId: text("org_id").notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.environmentId],
      foreignColumns: [environment.id],
      name: "environment_org_environment_id_environment_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "environment_org_org_id_orgs_id_fk",
    }).onDelete("cascade"),
  ]
);

export const orgs = pgTable(
  "orgs",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    ownerId: text("owner_id").notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [user.id],
      name: "orgs_owner_id_user_id_fk",
    }).onDelete("cascade"),
  ]
);

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar({ length: 36 }).primaryKey().notNull(),
  checksum: varchar({ length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text(),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const environmentTeam = pgTable(
  "environment_team",
  {
    id: text().primaryKey().notNull(),
    environmentId: text("environment_id").notNull(),
    teamId: text("team_id").notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.environmentId],
      foreignColumns: [environment.id],
      name: "environment_team_environment_id_environment_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "environment_team_team_id_teams_id_fk",
    }).onDelete("cascade"),
  ]
);

export const teams = pgTable(
  "teams",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    orgId: text("org_id"),
    ownerId: text("owner_id").notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "teams_org_id_orgs_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [user.id],
      name: "teams_owner_id_user_id_fk",
    }).onDelete("cascade"),
  ]
);

export const orgTeams = pgTable(
  "org_teams",
  {
    id: text().primaryKey().notNull(),
    orgId: text("org_id").notNull(),
    teamId: text("team_id").notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [orgs.id],
      name: "org_teams_org_id_orgs_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "org_teams_team_id_teams_id_fk",
    }).onDelete("cascade"),
  ]
);

export const teamMembers = pgTable(
  "team_members",
  {
    id: text().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    teamId: text("team_id").notNull(),
    role: text().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: "team_members_team_id_teams_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "team_members_user_id_user_id_fk",
    }).onDelete("cascade"),
  ]
);

// Two-Factor Authentication table as required by Better Auth twoFactor plugin
export const twoFactor = pgTable(
  "twoFactor",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    secret: text(),
    backupCodes: text(),
    createdAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "two_factor_user_id_user_id_fk",
    }).onDelete("cascade"),
  ]
);

// View tracking table to monitor secret access
export const secretView = pgTable(
  "secret_view",
  {
    id: text().primaryKey().notNull(),
    environmentId: text("environment_id").notNull(),
    userId: text("user_id"), // Optional - null for anonymous views
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    viewedAt: timestamp("viewed_at", { precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("secret_view_environment_idx").using(
      "btree",
      table.environmentId.asc().nullsLast().op("text_ops")
    ),
    index("secret_view_user_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops")
    ),
    index("secret_view_viewed_at_idx").using(
      "btree",
      table.viewedAt.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.environmentId],
      foreignColumns: [environment.id],
      name: "secret_view_environment_id_environment_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "secret_view_user_id_user_id_fk",
    }).onDelete("set null"), // Set to null if user is deleted, preserve view history
  ]
);

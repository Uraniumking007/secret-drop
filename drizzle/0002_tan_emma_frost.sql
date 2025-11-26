CREATE EXTENSION IF NOT EXISTS "uuid-ossp";--> statement-breakpoint
ALTER TABLE "api_tokens" DROP CONSTRAINT IF EXISTS "api_tokens_org_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "api_tokens" DROP CONSTRAINT IF EXISTS "api_tokens_team_id_teams_id_fk";--> statement-breakpoint
ALTER TABLE "ip_allowlist" DROP CONSTRAINT IF EXISTS "ip_allowlist_org_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "organization_members" DROP CONSTRAINT IF EXISTS "organization_members_org_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "secret_access_logs" DROP CONSTRAINT IF EXISTS "secret_access_logs_secret_id_secrets_id_fk";--> statement-breakpoint
ALTER TABLE "secret_shares" DROP CONSTRAINT IF EXISTS "secret_shares_secret_id_secrets_id_fk";--> statement-breakpoint
ALTER TABLE "secrets" DROP CONSTRAINT IF EXISTS "secrets_org_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "secrets" DROP CONSTRAINT IF EXISTS "secrets_team_id_teams_id_fk";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_activeOrgId_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "sso_providers" DROP CONSTRAINT IF EXISTS "sso_providers_org_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_org_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_team_id_teams_id_fk";--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "teams_org_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "trash_bin" DROP CONSTRAINT IF EXISTS "trash_bin_secret_id_secrets_id_fk";--> statement-breakpoint
ALTER TABLE "trash_bin" DROP CONSTRAINT IF EXISTS "trash_bin_org_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "api_tokens" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "api_tokens" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "api_tokens" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "api_tokens" ALTER COLUMN "org_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "org_id"::text);--> statement-breakpoint
ALTER TABLE "api_tokens" ALTER COLUMN "team_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "team_id"::text);--> statement-breakpoint
ALTER TABLE "ip_allowlist" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ip_allowlist" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "ip_allowlist" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "ip_allowlist" ALTER COLUMN "org_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "org_id"::text);--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "org_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "org_id"::text);--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "secret_access_logs" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "secret_access_logs" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "secret_access_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "secret_access_logs" ALTER COLUMN "secret_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "secret_id"::text);--> statement-breakpoint
ALTER TABLE "trash_bin" ALTER COLUMN "secret_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "secret_id"::text);--> statement-breakpoint
ALTER TABLE "secret_shares" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "secret_shares" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "secret_shares" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "secret_shares" ALTER COLUMN "secret_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "secret_id"::text);--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "org_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "org_id"::text);--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "team_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "team_id"::text);--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "activeOrgId" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "activeOrgId"::text);--> statement-breakpoint
ALTER TABLE "sso_providers" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sso_providers" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "sso_providers" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sso_providers" ALTER COLUMN "org_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "org_id"::text);--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "org_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "org_id"::text);--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "team_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "team_id"::text);--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "org_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "org_id"::text);--> statement-breakpoint
ALTER TABLE "trash_bin" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "trash_bin" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "trash_bin" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "trash_bin" ALTER COLUMN "org_id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "org_id"::text);--> statement-breakpoint
ALTER TABLE "two_factor" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "two_factor" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "two_factor" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, "id"::text);--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
--> statement-breakpoint
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_allowlist" ADD CONSTRAINT "ip_allowlist_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_access_logs" ADD CONSTRAINT "secret_access_logs_secret_id_secrets_id_fk" FOREIGN KEY ("secret_id") REFERENCES "public"."secrets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_shares" ADD CONSTRAINT "secret_shares_secret_id_secrets_id_fk" FOREIGN KEY ("secret_id") REFERENCES "public"."secrets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_activeOrgId_organizations_id_fk" FOREIGN KEY ("activeOrgId") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sso_providers" ADD CONSTRAINT "sso_providers_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trash_bin" ADD CONSTRAINT "trash_bin_secret_id_secrets_id_fk" FOREIGN KEY ("secret_id") REFERENCES "public"."secrets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trash_bin" ADD CONSTRAINT "trash_bin_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
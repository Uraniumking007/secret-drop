ALTER TABLE "sso_providers" RENAME COLUMN "provider_type" TO "type";--> statement-breakpoint
ALTER TABLE "api_tokens" DROP CONSTRAINT "api_tokens_token_hash_unique";--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_org_slug_unique";--> statement-breakpoint
ALTER TABLE "two_factor" DROP CONSTRAINT "two_factor_user_id_unique";--> statement-breakpoint
ALTER TABLE "user_preferences" DROP CONSTRAINT "user_preferences_user_id_unique";--> statement-breakpoint
ALTER TABLE "api_tokens" DROP CONSTRAINT "api_tokens_org_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "api_tokens" DROP CONSTRAINT "api_tokens_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "trash_bin" DROP CONSTRAINT "trash_bin_secret_id_secrets_id_fk";
--> statement-breakpoint
DROP INDEX "api_tokens_org_id_idx";--> statement-breakpoint
DROP INDEX "organizations_slug_idx";--> statement-breakpoint
DROP INDEX "organizations_owner_id_idx";--> statement-breakpoint
DROP INDEX "subscriptions_user_id_idx";--> statement-breakpoint
DROP INDEX "subscriptions_org_id_idx";--> statement-breakpoint
DROP INDEX "trash_bin_secret_id_idx";--> statement-breakpoint
DROP INDEX "trash_bin_expires_at_idx";--> statement-breakpoint
DROP INDEX "two_factor_user_id_idx";--> statement-breakpoint
DROP INDEX "user_preferences_user_id_idx";--> statement-breakpoint
ALTER TABLE "ip_allowlist" ALTER COLUMN "cidr" SET DATA TYPE varchar(45);--> statement-breakpoint
ALTER TABLE "ip_allowlist" ALTER COLUMN "cidr" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "slug" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "two_factor" ALTER COLUMN "backup_codes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "theme" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "theme" SET DEFAULT 'system';--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updatedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "api_tokens" ADD COLUMN "prefix" varchar(8) NOT NULL;--> statement-breakpoint
ALTER TABLE "api_tokens" ADD COLUMN "revoked_at" timestamp;--> statement-breakpoint
ALTER TABLE "ip_allowlist" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "secrets" ADD COLUMN "encrypted_encryption_key" text;--> statement-breakpoint
ALTER TABLE "secrets" ADD COLUMN "encryption_salt" text;--> statement-breakpoint
ALTER TABLE "secrets" ADD COLUMN "encryption_version" text DEFAULT 'server_managed' NOT NULL;--> statement-breakpoint
ALTER TABLE "sso_providers" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sso_providers" ADD COLUMN "client_secret" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sso_providers" ADD COLUMN "issuer_url" text;--> statement-breakpoint
ALTER TABLE "sso_providers" ADD COLUMN "is_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "completed" boolean;--> statement-breakpoint
ALTER TABLE "trash_bin" ADD COLUMN "item_type" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "trash_bin" ADD COLUMN "item_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "trash_bin" ADD COLUMN "original_data" text NOT NULL;--> statement-breakpoint
ALTER TABLE "two_factor" ADD COLUMN "is_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "default_org_id" uuid;--> statement-breakpoint
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_default_org_id_organizations_id_fk" FOREIGN KEY ("default_org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_tokens_prefix_idx" ON "api_tokens" USING btree ("prefix");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_org_id_idx" ON "subscriptions" USING btree ("user_id","org_id");--> statement-breakpoint
CREATE INDEX "trash_bin_deleted_at_idx" ON "trash_bin" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "trash_bin_item_idx" ON "trash_bin" USING btree ("item_type","item_id");--> statement-breakpoint
ALTER TABLE "api_tokens" DROP COLUMN "org_id";--> statement-breakpoint
ALTER TABLE "api_tokens" DROP COLUMN "team_id";--> statement-breakpoint
ALTER TABLE "ip_allowlist" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "owner_id";--> statement-breakpoint
ALTER TABLE "sso_providers" DROP COLUMN "client_secret_encrypted";--> statement-breakpoint
ALTER TABLE "sso_providers" DROP COLUMN "scopes";--> statement-breakpoint
ALTER TABLE "sso_providers" DROP COLUMN "enabled";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "trash_bin" DROP COLUMN "secret_id";--> statement-breakpoint
ALTER TABLE "trash_bin" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "two_factor" DROP COLUMN "enabled";--> statement-breakpoint
ALTER TABLE "user_preferences" DROP COLUMN "timezone";--> statement-breakpoint
ALTER TABLE "user_preferences" DROP COLUMN "language";--> statement-breakpoint
ALTER TABLE "user_preferences" DROP COLUMN "email_notifications";--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_idx" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_idx" UNIQUE("user_id");
ALTER TABLE "secret_access_logs" DROP CONSTRAINT "secret_access_logs_secret_id_secrets_id_fk";
--> statement-breakpoint
ALTER TABLE "secret_shares" DROP CONSTRAINT "secret_shares_secret_id_secrets_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_active_org_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "secret_access_logs" ALTER COLUMN "secret_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "secret_shares" ALTER COLUMN "secret_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "secret_access_logs" ADD COLUMN "secret_name" text;--> statement-breakpoint
ALTER TABLE "secret_access_logs" ADD COLUMN "secret_owner_id" text;--> statement-breakpoint
ALTER TABLE "secret_shares" ADD COLUMN "secret_name" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "activeOrgId" integer;--> statement-breakpoint
ALTER TABLE "secret_access_logs" ADD CONSTRAINT "secret_access_logs_secret_id_secrets_id_fk" FOREIGN KEY ("secret_id") REFERENCES "public"."secrets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_shares" ADD CONSTRAINT "secret_shares_secret_id_secrets_id_fk" FOREIGN KEY ("secret_id") REFERENCES "public"."secrets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_activeOrgId_organizations_id_fk" FOREIGN KEY ("activeOrgId") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "active_org_id";
ALTER TABLE "environment" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "environment" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "environment_org" ALTER COLUMN "created_at" SET DEFAULT now();
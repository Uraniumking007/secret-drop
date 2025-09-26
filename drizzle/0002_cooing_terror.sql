ALTER TABLE "environment" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "environment" ADD CONSTRAINT "environment_slug_unique" UNIQUE("slug");
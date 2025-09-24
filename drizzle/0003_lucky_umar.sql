DROP INDEX "secret_view_viewed_at_idx";--> statement-breakpoint
CREATE INDEX "secret_view_viewed_at_idx" ON "secret_view" USING btree ("viewed_at");
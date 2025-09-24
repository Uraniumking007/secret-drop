CREATE TABLE "secret_view" (
	"id" text PRIMARY KEY NOT NULL,
	"environment_id" text NOT NULL,
	"user_id" text,
	"ip_address" text,
	"user_agent" text,
	"viewed_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "secret_view" ADD CONSTRAINT "secret_view_environment_id_environment_id_fk" FOREIGN KEY ("environment_id") REFERENCES "public"."environment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_view" ADD CONSTRAINT "secret_view_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "secret_view_environment_idx" ON "secret_view" USING btree ("environment_id" text_ops);--> statement-breakpoint
CREATE INDEX "secret_view_user_idx" ON "secret_view" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "secret_view_viewed_at_idx" ON "secret_view" USING btree ("viewed_at");
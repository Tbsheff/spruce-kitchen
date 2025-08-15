ALTER TABLE "audit_log" ADD COLUMN "contentHash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "previousHash" text;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "signature" text;--> statement-breakpoint
CREATE INDEX "idx_audit_log_content_hash" ON "audit_log" USING btree ("contentHash");

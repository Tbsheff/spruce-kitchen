-- Add rate limiting table for security
CREATE TABLE IF NOT EXISTS "rate_limit_record" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "action" text NOT NULL,
    "windowStart" timestamp NOT NULL,
    "requestCount" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS "idx_rate_limit_identifier_action" ON "rate_limit_record" ("identifier", "action");
CREATE INDEX IF NOT EXISTS "idx_rate_limit_window_start" ON "rate_limit_record" ("windowStart");

-- Add comment explaining the table purpose
COMMENT ON TABLE "rate_limit_record" IS 'Database-backed rate limiting for security - tracks request counts per identifier and action within time windows';
COMMENT ON COLUMN "rate_limit_record"."identifier" IS 'IP address (ip:x.x.x.x) or user ID (user:uuid) making the request';
COMMENT ON COLUMN "rate_limit_record"."action" IS 'Action being rate limited (auth:login, api:general, etc.)';
COMMENT ON COLUMN "rate_limit_record"."windowStart" IS 'Start time of the rate limiting window';
COMMENT ON COLUMN "rate_limit_record"."requestCount" IS 'Number of requests made in this window';

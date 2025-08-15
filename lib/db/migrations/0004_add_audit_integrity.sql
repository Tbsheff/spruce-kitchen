-- Add integrity protection fields to audit_log table
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "contentHash" text NOT NULL DEFAULT '';
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "previousHash" text;
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "signature" text;

-- Create index for efficient content hash lookups
CREATE INDEX IF NOT EXISTS "idx_audit_log_content_hash" ON "audit_log" ("contentHash");

-- Add comments explaining the integrity protection fields
COMMENT ON COLUMN "audit_log"."contentHash" IS 'SHA-256 hash of log content for tamper detection';
COMMENT ON COLUMN "audit_log"."previousHash" IS 'Hash of previous log entry for chain integrity verification';
COMMENT ON COLUMN "audit_log"."signature" IS 'Optional digital signature for high-security environments';

-- Create a function to validate audit log integrity (optional, can be called from application)
-- This is a PostgreSQL stored procedure that can verify log integrity at the database level
CREATE OR REPLACE FUNCTION validate_audit_log_chain()
RETURNS TABLE(
    log_id text,
    is_valid boolean,
    error_message text
) AS $$
DECLARE
    prev_hash text := NULL;
    current_log RECORD;
BEGIN
    -- Iterate through audit logs in chronological order
    FOR current_log IN 
        SELECT id, "contentHash", "previousHash", "createdAt"
        FROM audit_log 
        ORDER BY "createdAt" ASC
    LOOP
        -- Check if previousHash matches the previous log's contentHash
        IF prev_hash IS NOT NULL AND current_log."previousHash" != prev_hash THEN
            log_id := current_log.id;
            is_valid := false;
            error_message := 'Chain integrity violation: previousHash does not match expected value';
            RETURN NEXT;
        ELSE
            log_id := current_log.id;
            is_valid := true;
            error_message := NULL;
            RETURN NEXT;
        END IF;
        
        -- Update prev_hash for next iteration
        prev_hash := current_log."contentHash";
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add a constraint to ensure contentHash is never empty (security requirement)
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_content_hash_not_empty" 
    CHECK ("contentHash" != '' AND "contentHash" IS NOT NULL);

-- Create a view for audit logs with integrity status (for easy querying)
CREATE OR REPLACE VIEW audit_log_with_integrity AS
SELECT 
    al.*,
    CASE 
        WHEN al."contentHash" = '' OR al."contentHash" IS NULL THEN 'missing_hash'
        WHEN prev_al."contentHash" IS NOT NULL AND al."previousHash" != prev_al."contentHash" THEN 'chain_broken'
        ELSE 'valid'
    END as integrity_status
FROM audit_log al
LEFT JOIN audit_log prev_al ON prev_al."createdAt" < al."createdAt"
WHERE prev_al."createdAt" = (
    SELECT MAX("createdAt") 
    FROM audit_log 
    WHERE "createdAt" < al."createdAt"
)
OR prev_al."createdAt" IS NULL;

-- Add comment to the view
COMMENT ON VIEW audit_log_with_integrity IS 'Audit logs with computed integrity status for tamper detection';

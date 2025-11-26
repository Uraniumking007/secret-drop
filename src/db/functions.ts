import { sql } from 'drizzle-orm'

export const deleteExpiredSecretsFunc = sql`
CREATE OR REPLACE FUNCTION delete_expired_secrets() RETURNS trigger AS $$
BEGIN
  -- Delete secrets that have expired by time
  DELETE FROM secrets 
  WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();

  -- Delete secrets that have exceeded their max views
  DELETE FROM secrets
  WHERE max_views IS NOT NULL 
  AND view_count >= max_views;

  -- Delete secrets marked as burn-on-read that have been viewed
  DELETE FROM secrets
  WHERE burn_on_read = true
  AND view_count >= 1;

  -- NOTE: We do NOT delete from secret_shares here anymore, 
  -- because we want to keep the audit trail of shares even if they expired.
  -- The application must check expires_at/max_views for validity.
  
  -- Permanently delete secrets that were trashed more than 30 days ago
  DELETE FROM secrets
  WHERE id IN (
    SELECT item_id
    FROM trash_bin
    WHERE item_type = 'secret'
      AND deleted_at < NOW() - INTERVAL '30 days'
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
`

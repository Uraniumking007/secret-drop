import { sql } from 'drizzle-orm'

export const deleteExpiredSecretsTrigger = sql`
DROP TRIGGER IF EXISTS trigger_delete_expired_secrets ON secret_access_logs;

CREATE TRIGGER trigger_delete_expired_secrets
AFTER INSERT ON secret_access_logs
FOR EACH STATEMENT
EXECUTE FUNCTION delete_expired_secrets();
`

export const deleteExpiredSecretsOnInsertTrigger = sql`
DROP TRIGGER IF EXISTS trigger_delete_expired_secrets_insert ON secrets;

CREATE TRIGGER trigger_delete_expired_secrets_insert
AFTER INSERT ON secrets
FOR EACH STATEMENT
EXECUTE FUNCTION delete_expired_secrets();
`

export const populateSecretDetailsTrigger = sql`
CREATE OR REPLACE FUNCTION populate_secret_details() RETURNS trigger AS $$
BEGIN
  IF NEW.secret_id IS NOT NULL THEN
    SELECT name, created_by INTO NEW.secret_name, NEW.secret_owner_id
    FROM secrets
    WHERE id = NEW.secret_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_secret_details_logs ON secret_access_logs;
CREATE TRIGGER trigger_populate_secret_details_logs
BEFORE INSERT ON secret_access_logs
FOR EACH ROW
EXECUTE FUNCTION populate_secret_details();
`

export const populateShareDetailsTrigger = sql`
CREATE OR REPLACE FUNCTION populate_share_details() RETURNS trigger AS $$
BEGIN
  IF NEW.secret_id IS NOT NULL THEN
    SELECT name INTO NEW.secret_name
    FROM secrets
    WHERE id = NEW.secret_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_share_details ON secret_shares;
CREATE TRIGGER trigger_populate_share_details
BEFORE INSERT ON secret_shares
FOR EACH ROW
EXECUTE FUNCTION populate_share_details();
`

-- Update verification table columns to timestamp(3) to accept Date objects
ALTER TABLE "verification"
  ALTER COLUMN "expiresAt" TYPE timestamp(3) USING ("expiresAt"::timestamp(3)),
  ALTER COLUMN "createdAt" TYPE timestamp(3) USING ("createdAt"::timestamp(3)),
  ALTER COLUMN "updatedAt" TYPE timestamp(3) USING ("updatedAt"::timestamp(3));

ALTER TABLE "verification"
  ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;



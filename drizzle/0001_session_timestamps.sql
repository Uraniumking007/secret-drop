-- Align session timestamp columns with app expectations (Date objects)
ALTER TABLE "session" ALTER COLUMN "expiresAt" TYPE timestamp(3) USING "expiresAt"::timestamp(3);
ALTER TABLE "session" ALTER COLUMN "createdAt" TYPE timestamp(3) USING "createdAt"::timestamp(3);
ALTER TABLE "session" ALTER COLUMN "updatedAt" TYPE timestamp(3) USING "updatedAt"::timestamp(3);



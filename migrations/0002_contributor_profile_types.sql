-- Keep the database enum in sync with the contributor types accepted by the app.
ALTER TYPE "contributor_type" ADD VALUE IF NOT EXISTS 'PROFESSIONAL';
ALTER TYPE "contributor_type" ADD VALUE IF NOT EXISTS 'ORGANIZATION';
ALTER TYPE "contributor_type" ADD VALUE IF NOT EXISTS 'INDEPENDENT';

-- Migration: add brand identity / contact fields to brands table
-- Safe to run multiple times (uses IF NOT EXISTS / DO NOTHING pattern)

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS tagline       TEXT,
  ADD COLUMN IF NOT EXISTS website       TEXT,
  ADD COLUMN IF NOT EXISTS phone         TEXT,
  ADD COLUMN IF NOT EXISTS address       TEXT,
  ADD COLUMN IF NOT EXISTS logo_url      TEXT;

-- Do not index logo_url: values may be large base64 data URLs, which exceed btree index
-- tuple size limits (~8KB) and cause INSERT/UPDATE failures.
DROP INDEX IF EXISTS idx_brands_logo_url;

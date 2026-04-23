-- Migration: add brand identity / contact fields to brands table
-- Safe to run multiple times (uses IF NOT EXISTS / DO NOTHING pattern)

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS tagline       TEXT,
  ADD COLUMN IF NOT EXISTS website       TEXT,
  ADD COLUMN IF NOT EXISTS phone         TEXT,
  ADD COLUMN IF NOT EXISTS address       TEXT,
  ADD COLUMN IF NOT EXISTS logo_url      TEXT;

-- Index for logo_url lookups (optional but handy)
CREATE INDEX IF NOT EXISTS idx_brands_logo_url ON brands(logo_url) WHERE logo_url IS NOT NULL;

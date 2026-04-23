/**
 * Migration: Add brand_products table
 * Run: node src/db/migrations/add-brand-products.js
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SQL = /* sql */ `
-- ── Brand Products ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id            UUID REFERENCES brands(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  price               TEXT,
  category            TEXT,
  tags                TEXT[]   DEFAULT '{}',
  images              TEXT[]   DEFAULT '{}',   -- URLs or base64 (stored in Storage)
  visual_description  TEXT,                    -- AI-extracted via Gemini Vision
  use_in              TEXT[]   DEFAULT '{"calendar","image_generation"}',
  is_primary          BOOLEAN  DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_products_user_id  ON brand_products(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_products_brand_id ON brand_products(brand_id);

DO $$ BEGIN
  CREATE TRIGGER trg_brand_products_updated_at
    BEFORE UPDATE ON brand_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

async function run() {
  console.log('🔄  Running brand_products migration...');
  const client = await pool.connect();
  try {
    await client.query(SQL);
    console.log('✅  brand_products table created / verified.');
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();

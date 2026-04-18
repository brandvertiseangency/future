/**
 * Additive migration — safely adds missing columns and tables to an existing DB.
 * Safe to run multiple times (all ALTER TABLE ... ADD COLUMN IF NOT EXISTS).
 *
 * Usage:  node src/db/migrate-additive.js
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const MIGRATION = /* sql */ `
-- ── Users: add missing columns ───────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name         TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url            TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website              TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_started_at     TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete  BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id   TEXT;

-- Rename old column if it exists (name → display_name)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='display_name'
  ) THEN
    ALTER TABLE users RENAME COLUMN name TO display_name;
  END IF;
END$$;

-- ── Brands: add missing columns ──────────────────────────────────────
ALTER TABLE brands ADD COLUMN IF NOT EXISTS description         TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS styles              TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS audience_age_min    INTEGER DEFAULT 18;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS audience_age_max    INTEGER DEFAULT 65;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS audience_gender     TEXT DEFAULT 'mixed';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS audience_location   TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS audience_interests  TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS platforms           TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS goals               TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_default          BOOLEAN DEFAULT TRUE;

-- ── Notifications: add message column (routes use it instead of title/body) ─
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;

-- Backfill message from title+body if table existed without it
UPDATE notifications SET message = COALESCE(title, '') || CASE WHEN body IS NOT NULL AND body != '' THEN ' — ' || body ELSE '' END WHERE message IS NULL;

-- ── Notifications: ensure all expected columns exist ─────────────────
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title  TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body   TEXT;

-- ── Add updated_at to users if missing ───────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Re-create auto-update triggers safely ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Create user_preferences if missing ───────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id                UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_post_reminder    BOOLEAN DEFAULT TRUE,
  email_credit_warning   BOOLEAN DEFAULT TRUE,
  email_weekly_digest    BOOLEAN DEFAULT TRUE,
  email_product_updates  BOOLEAN DEFAULT FALSE,
  inapp_post_reminder    BOOLEAN DEFAULT TRUE,
  inapp_credit_warning   BOOLEAN DEFAULT TRUE,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Create credit_transactions if missing ────────────────────────────
CREATE TABLE IF NOT EXISTS credit_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount              INTEGER NOT NULL,
  type                TEXT CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
  description         TEXT,
  stripe_payment_id   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Assets: add missing columns ─────────────────────────────────────
ALTER TABLE assets ADD COLUMN IF NOT EXISTS post_id    UUID REFERENCES posts(id) ON DELETE SET NULL;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS platform   TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_size  BIGINT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS mime_type  TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Indexes ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_brands_user_id        ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_is_default     ON brands(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_posts_user_id         ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at    ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_status          ON posts(status);
CREATE INDEX IF NOT EXISTS idx_assets_user_id        ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_user_id     ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read    ON notifications(user_id, is_read);
`;

async function migrate() {
  console.log('🔄  Running additive migration on Neon PostgreSQL...');
  const client = await pool.connect();
  try {
    await client.query(MIGRATION);
    console.log('✅  Migration complete. All missing columns and tables added.');

    // Verify key columns
    const checks = [
      "SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position",
      "SELECT column_name FROM information_schema.columns WHERE table_name='brands' ORDER BY ordinal_position",
    ];
    for (const q of checks) {
      const { rows } = await client.query(q);
      const table = q.includes("'users'") ? 'users' : 'brands';
      console.log(`  ${table}: ${rows.map((r) => r.column_name).join(', ')}`);
    }
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

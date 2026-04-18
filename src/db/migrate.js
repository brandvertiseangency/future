/**
 * Database Schema — Brandvertise AI
 * Run once to create all tables in Neon PostgreSQL.
 *
 * Usage:  node src/db/migrate.js
 */
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SCHEMA = /* sql */ `
-- ── Users ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid         TEXT UNIQUE NOT NULL,
  email                TEXT NOT NULL,
  display_name         TEXT,
  photo_url            TEXT,
  website              TEXT,
  plan                 TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  credits              INTEGER DEFAULT 500,
  trial_started_at     TIMESTAMPTZ DEFAULT NOW(),
  onboarding_complete  BOOLEAN DEFAULT FALSE,
  stripe_customer_id   TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Brands ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  description          TEXT,
  industry             TEXT,
  tone                 INTEGER DEFAULT 50,
  styles               TEXT[] DEFAULT '{}',
  audience_age_min     INTEGER DEFAULT 18,
  audience_age_max     INTEGER DEFAULT 65,
  audience_gender      TEXT DEFAULT 'mixed',
  audience_location    TEXT,
  audience_interests   TEXT[] DEFAULT '{}',
  platforms            TEXT[] DEFAULT '{}',
  goals                TEXT[] DEFAULT '{}',
  is_default           BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Generated Posts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id             UUID REFERENCES brands(id) ON DELETE CASCADE,
  platform             TEXT NOT NULL,
  content_type         TEXT DEFAULT 'post',
  caption              TEXT,
  image_url            TEXT,
  hashtags             TEXT[] DEFAULT '{}',
  status               TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at         TIMESTAMPTZ,
  published_at         TIMESTAMPTZ,
  is_ai_generated      BOOLEAN DEFAULT TRUE,
  generation_prompt    TEXT,
  feedback             INTEGER,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Assets ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id       UUID REFERENCES posts(id) ON DELETE SET NULL,
  type          TEXT CHECK (type IN ('image', 'video', 'text')),
  url           TEXT NOT NULL,
  platform      TEXT,
  file_size     INTEGER,
  mime_type     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Credit Transactions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount              INTEGER NOT NULL,
  type                TEXT CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
  description         TEXT,
  stripe_payment_id   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User Preferences ─────────────────────────────────────────────────
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

-- ── Notifications ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  action_url  TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_brands_user_id          ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id           ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at      ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_status            ON posts(status);
CREATE INDEX IF NOT EXISTS idx_assets_user_id          ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_user_id       ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read   ON notifications(user_id, is_read);

-- ── Auto-update updated_at ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at  BEFORE UPDATE ON users  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_posts_updated_at  BEFORE UPDATE ON posts  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

async function migrate() {
  console.log("🔄  Running migrations on Neon PostgreSQL...");
  const client = await pool.connect();
  try {
    await client.query(SCHEMA);
    console.log("✅  Schema created / verified successfully.");
  } catch (err) {
    console.error("❌  Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

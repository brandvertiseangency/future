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
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid  TEXT UNIQUE,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',       -- free | standard | premium
  credits       INTEGER NOT NULL DEFAULT 10,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Brands ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  industry      TEXT,
  tone          TEXT,
  colors        JSONB,          -- ["#hex1", "#hex2"]
  logo_url      TEXT,
  guidelines    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Generated Posts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id      UUID REFERENCES brands(id) ON DELETE SET NULL,
  caption       TEXT,
  image_url     TEXT,
  platform      TEXT,           -- instagram | facebook | twitter | linkedin
  status        TEXT NOT NULL DEFAULT 'draft',  -- draft | scheduled | published | failed
  scheduled_at  TIMESTAMPTZ,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Content Calendar ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id      UUID REFERENCES brands(id) ON DELETE SET NULL,
  post_id       UUID REFERENCES posts(id) ON DELETE SET NULL,
  title         TEXT,
  platform      TEXT,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Assets ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id      UUID REFERENCES brands(id) ON DELETE SET NULL,
  type          TEXT,           -- image | video | template
  url           TEXT NOT NULL,
  name          TEXT,
  size_bytes    INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Credit Transactions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,  -- debit | credit
  amount        INTEGER NOT NULL,
  reason        TEXT,
  balance_after INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Payments ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount_paise     INTEGER,     -- in paise (INR)
  currency         TEXT DEFAULT 'INR',
  plan             TEXT,
  status           TEXT NOT NULL DEFAULT 'created',  -- created | paid | failed
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_brands_user_id          ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id           ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at      ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_calendar_user_id        ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id          ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_user_id       ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id        ON payments(user_id);

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

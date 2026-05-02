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

-- ── Brand intelligence v2 columns on brands ─────────────────────────
ALTER TABLE brands ADD COLUMN IF NOT EXISTS color_primary       TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS color_secondary     TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS color_accent        TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS font_mood           TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS visual_style        TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS industry_subtype    TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS price_segment       TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS posting_frequency   INTEGER DEFAULT 4;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS content_mix         JSONB DEFAULT '{"promotional":30,"educational":25,"testimonial":20,"bts":15,"festive":10}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS platform_priority   TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS onboarding_version  INTEGER DEFAULT 1;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS usp_keywords        TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS tagline             TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS website             TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS phone               TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS address             TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url            TEXT;

-- ── Posts: add missing columns ───────────────────────────────────────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approval_status  TEXT DEFAULT 'pending';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approved_at      TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS version_number   INTEGER DEFAULT 1;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS product_id       UUID;

-- Widen status CHECK to include 'approved'
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts ADD CONSTRAINT posts_status_check
  CHECK (status IN ('draft','scheduled','published','failed','approved'));

-- ── Brand products ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id             UUID REFERENCES brands(id) ON DELETE SET NULL,
  name                 TEXT NOT NULL,
  description          TEXT,
  price                TEXT,
  category             TEXT,
  tags                 TEXT[] DEFAULT '{}',
  images               TEXT[] DEFAULT '{}',
  visual_description   TEXT,
  use_in               TEXT[] DEFAULT '{calendar,image_generation}',
  is_primary           BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_brand_products_user   ON brand_products(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_products_brand  ON brand_products(brand_id);

-- ── Brand style profiles (Gemini Vision extracted) ────────────────────
CREATE TABLE IF NOT EXISTS brand_style_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id              UUID REFERENCES brands(id) ON DELETE CASCADE,
  extracted_colors      TEXT[]    DEFAULT '{}',
  font_mood_detected    TEXT,
  layout_style          TEXT,
  photography_style     TEXT,
  mood_keywords         TEXT[]    DEFAULT '{}',
  composition_style     TEXT,
  text_density          TEXT,
  dominant_aesthetic    TEXT,
  reference_image_urls  TEXT[]    DEFAULT '{}',
  raw_vision_response   JSONB,
  analysed_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id)
);

-- ── Industry-specific config ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_industry_configs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id            UUID REFERENCES brands(id) ON DELETE CASCADE,
  industry            TEXT NOT NULL,
  subtype             TEXT,
  price_segment       TEXT,
  audience_lifestyle  TEXT[]  DEFAULT '{}',
  usp_keywords        TEXT[]  DEFAULT '{}',
  special_flags       JSONB   DEFAULT '{}',
  industry_answers    JSONB   DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id)
);

-- ── Content calendar preferences ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_calendar_preferences (
  brand_id                UUID PRIMARY KEY REFERENCES brands(id) ON DELETE CASCADE,
  weekly_post_count       INTEGER DEFAULT 4,
  content_type_mix        JSONB DEFAULT '{"promotional":30,"educational":25,"testimonial":20,"bts":15,"festive":10}',
  auto_schedule           BOOLEAN DEFAULT FALSE,
  preferred_posting_times TEXT[]  DEFAULT '{"09:00","12:00","18:00","20:00"}',
  active_platforms        TEXT[]  DEFAULT '{}',
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_style_profiles_brand  ON brand_style_profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_industry_configs_brand ON brand_industry_configs(brand_id);
CREATE INDEX IF NOT EXISTS idx_calendar_prefs_brand  ON content_calendar_preferences(brand_id);

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

-- logo_url may contain huge base64 data URLs; btree index on that column exceeds PG index row limits.
DROP INDEX IF EXISTS idx_brands_logo_url;
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

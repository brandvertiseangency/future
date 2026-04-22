-- Brandvertise AI — Brand Intelligence Schema Migration
-- Run: psql $DATABASE_URL -f backend/migrations/brand-intelligence.sql
-- This is ADDITIVE — does not drop or modify existing columns.

-- ── Extend brands table with visual identity fields ───────────────────────────
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS color_primary    TEXT,
  ADD COLUMN IF NOT EXISTS color_secondary  TEXT,
  ADD COLUMN IF NOT EXISTS color_accent     TEXT,
  ADD COLUMN IF NOT EXISTS font_mood        TEXT,
  ADD COLUMN IF NOT EXISTS visual_style     TEXT,
  ADD COLUMN IF NOT EXISTS industry_subtype TEXT,
  ADD COLUMN IF NOT EXISTS price_segment    TEXT,
  ADD COLUMN IF NOT EXISTS posting_frequency INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS content_mix      JSONB DEFAULT '{"promotional":30,"educational":25,"testimonial":20,"bts":15,"festive":10}',
  ADD COLUMN IF NOT EXISTS platform_priority TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_version INTEGER DEFAULT 1;

-- ── Brand visual style profile — extracted from reference images by Gemini Vision ──
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

-- ── Industry-specific configuration per brand ──────────────────────────────────
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

-- ── Content calendar preferences ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_calendar_preferences (
  brand_id                UUID PRIMARY KEY REFERENCES brands(id) ON DELETE CASCADE,
  weekly_post_count       INTEGER DEFAULT 4,
  content_type_mix        JSONB DEFAULT '{"promotional":30,"educational":25,"testimonial":20,"bts":15,"festive":10}',
  auto_schedule           BOOLEAN DEFAULT FALSE,
  preferred_posting_times TEXT[]  DEFAULT '{"09:00","12:00","18:00","20:00"}',
  active_platforms        TEXT[]  DEFAULT '{}',
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes for fast lookups ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_style_profiles_brand ON brand_style_profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_industry_configs_brand ON brand_industry_configs(brand_id);
CREATE INDEX IF NOT EXISTS idx_calendar_prefs_brand ON content_calendar_preferences(brand_id);

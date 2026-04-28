-- workflow.sql — Content pipeline tables
-- Run: psql $DATABASE_URL -f src/db/migrations/workflow.sql

CREATE TABLE IF NOT EXISTS content_plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id         UUID REFERENCES brands(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  month            TEXT NOT NULL,
  year             INTEGER NOT NULL,
  total_posts      INTEGER DEFAULT 0,
  credits_required INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','approved','generating','complete')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  approved_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS calendar_slots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id          UUID REFERENCES content_plans(id) ON DELETE CASCADE,
  brand_id         UUID REFERENCES brands(id) ON DELETE CASCADE,
  slot_date        DATE NOT NULL,
  day_of_week      TEXT,
  content_type     TEXT NOT NULL CHECK (content_type IN ('post','reel','carousel','story')),
  content_category TEXT,
  post_idea        TEXT,
  creative_brief   TEXT,
  caption_draft    TEXT,
  platform         TEXT NOT NULL,
  status           TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','generating','generated','failed','rejected')),
  post_id          UUID REFERENCES posts(id) ON DELETE SET NULL,
  sort_order       INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Additive: extend existing installs
ALTER TABLE calendar_slots
  ADD COLUMN IF NOT EXISTS creative_brief TEXT;

CREATE TABLE IF NOT EXISTS post_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id          UUID REFERENCES posts(id) ON DELETE CASCADE,
  version_number   INTEGER NOT NULL DEFAULT 1,
  caption          TEXT,
  image_url        TEXT,
  hashtags         TEXT[],
  generation_prompt TEXT,
  feedback_note    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id          UUID REFERENCES content_plans(id) ON DELETE CASCADE,
  brand_id         UUID REFERENCES brands(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  total_slots      INTEGER NOT NULL,
  completed_slots  INTEGER DEFAULT 0,
  failed_slots     INTEGER DEFAULT 0,
  current_slot_id  UUID REFERENCES calendar_slots(id),
  status           TEXT DEFAULT 'queued'
    CHECK (status IN ('queued','running','paused','complete','failed')),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id   UUID REFERENCES brands(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_slots_plan  ON calendar_slots(plan_id);
CREATE INDEX IF NOT EXISTS idx_calendar_slots_date  ON calendar_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_post_versions_post   ON post_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_gen_jobs_brand       ON generation_jobs(brand_id);
CREATE INDEX IF NOT EXISTS idx_gen_jobs_user        ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_brand  ON brand_chat_messages(brand_id);

-- Extend posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approved_at       TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approval_status   TEXT DEFAULT 'pending'
  CHECK (approval_status IN ('pending','approved','rejected'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slot_id           UUID REFERENCES calendar_slots(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS version_number    INTEGER DEFAULT 1;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS generation_job_id UUID REFERENCES generation_jobs(id);

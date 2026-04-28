-- Launch hardening migration: calendar slot schema, job debug fields, and constraints.

ALTER TABLE generation_jobs
  ADD COLUMN IF NOT EXISTS last_error TEXT;

ALTER TABLE calendar_slots
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS format TEXT,
  ADD COLUMN IF NOT EXISTS creative_copy TEXT,
  ADD COLUMN IF NOT EXISTS hashtags_draft TEXT[];

ALTER TABLE calendar_slots
  DROP CONSTRAINT IF EXISTS calendar_slots_status_check;

ALTER TABLE calendar_slots
  ADD CONSTRAINT calendar_slots_status_check
  CHECK (status IN ('pending','approved','generating','generated','failed','rejected'));

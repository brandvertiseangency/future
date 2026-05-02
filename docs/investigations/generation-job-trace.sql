-- Read-only trace: latest generation jobs → slots → posts → versions → brand refs
-- Replace placeholders after picking JOB_ID / PLAN_ID / BRAND_ID from step 1.

-- 1) Recent jobs (pick latest failed or suspicious)
SELECT id, plan_id, brand_id, user_id, status, total_slots, completed_slots, failed_slots,
       current_slot_id, last_error, created_at, started_at, completed_at
FROM generation_jobs
ORDER BY created_at DESC
LIMIT 10;

-- 2) Slots for the job's plan (use plan_id from step 1)
 SELECT id, plan_id, status, post_idea, caption_draft, creative_brief, creative_copy, topic,
        format, hashtags_draft, error_message, post_id, platform, content_type, sort_order, updated_at
 FROM calendar_slots
 WHERE plan_id = '<PLAN_ID>'
 ORDER BY sort_order ASC, slot_date ASC;

-- 3) Posts created for that job
 SELECT id, slot_id, generation_job_id, status, approval_status, caption, image_url,
        generation_prompt, created_at
 FROM posts
 WHERE generation_job_id = '<JOB_ID>'
 ORDER BY created_at;

-- 4) Version rows for those posts
 SELECT id, post_id, version_number, caption, image_url, generation_prompt, created_at
 FROM post_versions
 WHERE post_id IN (SELECT id FROM posts WHERE generation_job_id = '<JOB_ID>')
 ORDER BY post_id, version_number;

-- 5) Brand + style profile (use brand_id from step 1)
SELECT b.id, b.name, b.logo_url, b.color_primary, b.color_secondary, b.color_accent,
        bsp.reference_image_urls, bsp.dominant_aesthetic, bsp.photography_style, bsp.mood_keywords
 FROM brands b
 LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
 WHERE b.id = '<BRAND_ID>';

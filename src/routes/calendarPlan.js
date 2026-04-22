/**
 * Calendar Plan Routes — New content pipeline
 *
 * POST   /api/calendar/generate-plan          → generate content plan + slots
 * GET    /api/calendar/plans/:planId           → get plan + all slots (review page)
 * POST   /api/calendar/plans/:planId/approve  → approve selected slots, start generation job
 * GET    /api/calendar/jobs/:jobId            → poll generation job + slot statuses
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');
const { buildSystemPrompt, buildUserPrompt } = require('../lib/prompt-engine');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserWithBrand = async (uid) => {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.credits,
            b.id AS brand_id, b.name AS brand_name, b.description, b.industry,
            b.tone, b.styles, b.goals, b.platforms,
            b.audience_age_min, b.audience_age_max, b.audience_gender, b.audience_interests,
            b.brand_colors, b.font_mood, b.visual_vibes, b.visual_dna,
            b.usp, b.mission, b.words_to_use, b.words_to_avoid, b.brand_persona,
            b.calendar_prefs,
            b.color_primary, b.color_secondary, b.color_accent,
            b.industry_subtype, b.price_segment, b.posting_frequency, b.content_mix,
            bic.usp_keywords, bic.industry_answers,
            bsp.dominant_aesthetic, bsp.mood_keywords, bsp.photography_style,
            bsp.layout_style, bsp.font_mood_detected,
            ccp.weekly_post_count AS pref_weekly_posts, ccp.content_type_mix AS pref_content_mix
     FROM users u
     LEFT JOIN brands b ON b.user_id = u.id AND b.is_default = TRUE
     LEFT JOIN brand_industry_configs bic ON bic.brand_id = b.id
     LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
     LEFT JOIN content_calendar_preferences ccp ON ccp.brand_id = b.id
     WHERE u.firebase_uid = $1 LIMIT 1`,
    [uid]
  );
  return rows[0] || null;
};

const callAI = async (prompt) => {
  if (process.env.GOOGLE_AI_API_KEY) {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text;
  }
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content;
  }
  throw new Error('No AI provider configured.');
};

const generateImage = async (imagePrompt) => {
  if (!process.env.GOOGLE_AI_API_KEY) return null;
  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt: imagePrompt,
      config: { numberOfImages: 1, aspectRatio: '1:1', outputMimeType: 'image/jpeg' },
    });
    const b64 = response?.generatedImages?.[0]?.image?.imageBytes;
    return b64 ? `data:image/jpeg;base64,${b64}` : null;
  } catch (err) {
    logger.warn('Imagen generation failed', { error: err.message });
    return null;
  }
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Build evenly-distributed post dates for a given month */
const buildPostDates = (monthStr, postCount) => {
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const step = daysInMonth / postCount;
  const dates = [];
  for (let i = 0; i < postCount; i++) {
    const day = Math.min(Math.round(step * i + step / 2), daysInMonth);
    const d = new Date(year, month - 1, day);
    dates.push({ date: d.toISOString().split('T')[0], dayOfWeek: DAYS[d.getDay()] });
  }
  return dates;
};

/** Expand mix preferences into array of categories (length = postCount) */
const expandMix = (mix, postCount) => {
  const result = [];
  const entries = Object.entries(mix);
  let total = entries.reduce((s, [, v]) => s + v, 0) || 100;
  for (const [key, pct] of entries) {
    const count = Math.round((pct / total) * postCount);
    for (let i = 0; i < count; i++) result.push(key);
  }
  while (result.length < postCount) result.push(entries[0][0]);
  return result.slice(0, postCount);
};

const CONTENT_TYPE_MAP = {
  promotional: 'post',
  educational: 'carousel',
  testimonial: 'post',
  bts: 'reel',
  festive: 'post',
};

// ─── POST /api/calendar/generate-plan ────────────────────────────────────────

router.post('/generate-plan', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });

  const { month, postCount = 16, mixPreferences = {} } = req.body;
  if (!month) return res.status(400).json({ error: 'month is required (YYYY-MM)' });

  const user = await getUserWithBrand(req.user.uid);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (!user.brand_id) return res.status(400).json({ error: 'No brand found. Complete onboarding first.' });

  const creditsRequired = postCount * 2;
  if ((user.credits || 0) < creditsRequired) {
    return res.status(402).json({ error: 'insufficient_credits', creditsRequired, creditsAvailable: user.credits });
  }

  const [year, monthNum] = month.split('-').map(Number);

  try {
    // 1. Build AI prompt to generate slot ideas
    const categories = expandMix(mixPreferences, postCount);
    const brand = {
      name: user.brand_name || 'Brand',
      industry: user.industry || 'general',
      industrySubtype: user.industry_subtype || '',
      description: user.description || '',
      tone: user.tone || 50,
      styles: user.styles || [],
      goals: user.goals || [],
      platforms: user.platforms || ['instagram'],
      audienceAgeMin: user.audience_age_min || 18,
      audienceAgeMax: user.audience_age_max || 65,
      audienceGender: user.audience_gender || 'mixed',
      audienceInterests: user.audience_interests || [],
      usp: user.usp || (user.usp_keywords && user.usp_keywords.length ? user.usp_keywords.join(', ') : ''),
      mission: user.mission || '',
      priceSegment: user.price_segment || '',
      brandPersona: user.brand_persona || '',
      wordsToUse: user.words_to_use || [],
      wordsToAvoid: user.words_to_avoid || [],
      dominantAesthetic: user.dominant_aesthetic || '',
      moodKeywords: user.mood_keywords || [],
      photographyStyle: user.photography_style || '',
      layoutStyle: user.layout_style || '',
      industryAnswers: user.industry_answers ? JSON.stringify(user.industry_answers) : '',
    };
    const platforms = brand.platforms.length ? brand.platforms : ['instagram'];
    const toneLabel = brand.tone <= 25 ? 'Casual' : brand.tone <= 50 ? 'Conversational' : brand.tone <= 74 ? 'Balanced' : 'Professional';

    const brandContext = [
      `Brand: ${brand.name}`,
      `Industry: ${brand.industry}${brand.industrySubtype ? ` (${brand.industrySubtype})` : ''}`,
      `Description: ${brand.description}`,
      brand.mission ? `Mission: ${brand.mission}` : '',
      brand.usp ? `USP / Key differentiators: ${brand.usp}` : '',
      brand.priceSegment ? `Price segment: ${brand.priceSegment}` : '',
      brand.brandPersona ? `Brand persona: ${brand.brandPersona}` : '',
      `Tone: ${toneLabel}`,
      brand.styles && brand.styles.length ? `Personality styles: ${brand.styles.join(', ')}` : '',
      brand.wordsToUse && brand.wordsToUse.length ? `Words to use: ${brand.wordsToUse.join(', ')}` : '',
      brand.wordsToAvoid && brand.wordsToAvoid.length ? `Words to avoid: ${brand.wordsToAvoid.join(', ')}` : '',
      `Platforms: ${platforms.join(', ')}`,
      `Target Audience: ${brand.audienceAgeMin}–${brand.audienceAgeMax} yrs, ${brand.audienceGender}, interests: ${(brand.audienceInterests || []).join(', ') || 'general'}`,
      `Goals: ${(brand.goals || []).join(', ') || 'awareness'}`,
      brand.dominantAesthetic ? `Visual aesthetic: ${brand.dominantAesthetic}` : '',
      brand.moodKeywords && brand.moodKeywords.length ? `Visual mood: ${brand.moodKeywords.join(', ')}` : '',
      brand.photographyStyle ? `Photography style: ${brand.photographyStyle}` : '',
      brand.industryAnswers && brand.industryAnswers !== '{}' ? `Industry-specific context: ${brand.industryAnswers}` : '',
    ].filter(Boolean).join('\n');

    const aiPrompt = `You are a senior social media strategist. Generate a ${postCount}-post content calendar for the following brand.

${brandContext}
Content Categories: ${categories.join(', ')}

Return a JSON object: { "posts": [ ...array of ${postCount} objects... ] }
Each object must have:
{
  "category": "promotional|educational|testimonial|bts|festive",
  "content_type": "post|reel|carousel|story",
  "platform": "${platforms[0]}",
  "post_idea": "One-sentence creative concept",
  "caption_draft": "Full caption with emojis and hashtags ready to post"
}

Rules:
- Match content_type to category: educational→carousel, bts→reel, others→post or mix
- Captions must feel natural, on-brand, and directly reflect the brand's tone, mission, and USP
- Each post should be distinct and build campaign cohesion
- Distribute platforms across ${platforms.join(', ')} evenly if multiple
- Use the brand's vocabulary and avoid flagged words if provided
- Return ONLY valid JSON, no markdown`;

    const raw = await callAI(aiPrompt);
    let slots;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);
      slots = parsed.posts || parsed.slots || [];
    } catch {
      return res.status(500).json({ error: 'AI returned invalid response. Please try again.' });
    }

    if (!slots.length) return res.status(500).json({ error: 'AI returned no slots.' });
    slots = slots.slice(0, postCount);

    // 2. Assign dates
    const dates = buildPostDates(month, slots.length);

    // 3. Persist content_plan + calendar_slots
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: planRows } = await client.query(
        `INSERT INTO content_plans (brand_id, user_id, month, year, total_posts, credits_required, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'draft') RETURNING *`,
        [user.brand_id, user.id, month, year, slots.length, creditsRequired]
      );
      const plan = planRows[0];

      const insertedSlots = [];
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        const d = dates[i];
        const contentType = s.content_type || CONTENT_TYPE_MAP[s.category] || 'post';
        const { rows: slotRows } = await client.query(
          `INSERT INTO calendar_slots (plan_id, brand_id, slot_date, day_of_week, content_type, content_category, post_idea, caption_draft, platform, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [plan.id, user.brand_id, d.date, d.dayOfWeek, contentType, s.category || 'promotional', s.post_idea, s.caption_draft || '', s.platform || platforms[0], i]
        );
        insertedSlots.push(slotRows[0]);
      }

      await client.query('COMMIT');
      logger.info('Content plan generated', { planId: plan.id, slots: insertedSlots.length });
      res.status(201).json({ planId: plan.id, plan, slots: insertedSlots });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error('generate-plan failed', { error: err.message });
    res.status(500).json({ error: 'Failed to generate plan.', details: err.message });
  }
});

// ─── GET /api/calendar/plans/:planId ─────────────────────────────────────────

router.get('/plans/:planId', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  try {
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [req.user.uid]);
    const userId = userRows[0]?.id;
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const { rows: planRows } = await pool.query(
      'SELECT * FROM content_plans WHERE id=$1 AND user_id=$2',
      [req.params.planId, userId]
    );
    if (!planRows[0]) return res.status(404).json({ error: 'Plan not found.' });

    const { rows: slots } = await pool.query(
      'SELECT * FROM calendar_slots WHERE plan_id=$1 ORDER BY sort_order ASC, slot_date ASC',
      [req.params.planId]
    );

    res.json({ plan: planRows[0], slots });
  } catch (err) {
    logger.error('get plan failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch plan.' });
  }
});

// ─── POST /api/calendar/plans/:planId/approve ─────────────────────────────────

router.post('/plans/:planId/approve', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });

  const { selectedSlotIds, slotEdits = {} } = req.body;
  // selectedSlotIds: string[] — slots to approve and generate
  // slotEdits: { [slotId]: { post_idea?, caption_draft? } }

  if (!Array.isArray(selectedSlotIds) || !selectedSlotIds.length) {
    return res.status(400).json({ error: 'selectedSlotIds must be a non-empty array.' });
  }

  const client = await pool.connect();
  try {
    const { rows: userRows } = await client.query('SELECT id FROM users WHERE firebase_uid=$1', [req.user.uid]);
    const userId = userRows[0]?.id;
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const { rows: planRows } = await client.query(
      'SELECT * FROM content_plans WHERE id=$1 AND user_id=$2',
      [req.params.planId, userId]
    );
    if (!planRows[0]) return res.status(404).json({ error: 'Plan not found.' });
    const plan = planRows[0];

    await client.query('BEGIN');

    // Apply any edits to slots
    for (const [slotId, edits] of Object.entries(slotEdits)) {
      if (edits.post_idea !== undefined || edits.caption_draft !== undefined) {
        await client.query(
          `UPDATE calendar_slots SET post_idea=COALESCE($1, post_idea), caption_draft=COALESCE($2, caption_draft) WHERE id=$3 AND plan_id=$4`,
          [edits.post_idea || null, edits.caption_draft || null, slotId, plan.id]
        );
      }
    }

    // Mark selected slots as approved
    await client.query(
      `UPDATE calendar_slots SET status='approved' WHERE id=ANY($1::uuid[]) AND plan_id=$2`,
      [selectedSlotIds, plan.id]
    );

    // Mark unselected slots as rejected
    await client.query(
      `UPDATE calendar_slots SET status='rejected' WHERE plan_id=$1 AND id!=ALL($2::uuid[]) AND status='pending'`,
      [plan.id, selectedSlotIds]
    );

    // Update plan status
    await client.query(
      `UPDATE content_plans SET status='approved', approved_at=NOW() WHERE id=$1`,
      [plan.id]
    );

    // Create generation job
    const { rows: jobRows } = await client.query(
      `INSERT INTO generation_jobs (plan_id, brand_id, user_id, total_slots, status)
       VALUES ($1, $2, $3, $4, 'queued') RETURNING *`,
      [plan.id, plan.brand_id, userId, selectedSlotIds.length]
    );
    const job = jobRows[0];

    await client.query('COMMIT');

    logger.info('Plan approved, job created', { planId: plan.id, jobId: job.id, slots: selectedSlotIds.length });

    // Start generation in background
    setImmediate(() => runGenerationJob(job.id, selectedSlotIds, pool));

    res.json({ jobId: job.id, totalSlots: selectedSlotIds.length });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('plan approve failed', { error: err.message });
    res.status(500).json({ error: 'Failed to approve plan.', details: err.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/calendar/jobs/:jobId ───────────────────────────────────────────

router.get('/jobs/:jobId', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  try {
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [req.user.uid]);
    const userId = userRows[0]?.id;
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const { rows: jobRows } = await pool.query(
      'SELECT * FROM generation_jobs WHERE id=$1 AND user_id=$2',
      [req.params.jobId, userId]
    );
    if (!jobRows[0]) return res.status(404).json({ error: 'Job not found.' });

    const { rows: slots } = await pool.query(
      `SELECT cs.id, cs.post_idea, cs.content_type, cs.platform, cs.status,
              p.id AS post_id, p.image_url
       FROM calendar_slots cs
       LEFT JOIN posts p ON p.slot_id = cs.id AND p.id = cs.post_id
       WHERE cs.plan_id = $1 AND cs.status IN ('approved','generating','generated','rejected')
       ORDER BY cs.sort_order ASC, cs.slot_date ASC`,
      [jobRows[0].plan_id]
    );

    res.json({ job: jobRows[0], slots });
  } catch (err) {
    logger.error('get job failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch job.' });
  }
});

// ─── Background generation runner ────────────────────────────────────────────

async function runGenerationJob(jobId, slotIds, pool) {
  try {
    // Mark job as running
    await pool.query(`UPDATE generation_jobs SET status='running', started_at=NOW() WHERE id=$1`, [jobId]);

    const { rows: jobRows } = await pool.query('SELECT * FROM generation_jobs WHERE id=$1', [jobId]);
    const job = jobRows[0];
    if (!job) return;

    // Get brand data
    const { rows: brandRows } = await pool.query(
      `SELECT b.*, u.id AS user_id, u.credits
       FROM brands b
       JOIN users u ON u.id = b.user_id
       WHERE b.id = $1 LIMIT 1`,
      [job.brand_id]
    );
    const brand = brandRows[0];
    if (!brand) {
      await pool.query(`UPDATE generation_jobs SET status='failed' WHERE id=$1`, [jobId]);
      return;
    }

    // Build system prompt once for this brand
    let sysPrompt;
    try {
      sysPrompt = buildSystemPrompt({
        name: brand.name, industry: brand.industry, description: brand.description,
        tone: brand.tone || 50, styles: brand.styles || [], goals: brand.goals || [],
        audienceAgeMin: brand.audience_age_min, audienceAgeMax: brand.audience_age_max,
        audienceGender: brand.audience_gender, audienceInterests: brand.audience_interests || [],
        audienceLocation: '', platforms: brand.platforms || [],
        brandColors: brand.brand_colors, fontMood: brand.font_mood,
        visualVibes: brand.visual_vibes, visualDNA: brand.visual_dna,
        usp: brand.usp, mission: brand.mission,
        wordsToUse: brand.words_to_use, wordsToAvoid: brand.words_to_avoid,
        persona: brand.brand_persona,
      });
    } catch {
      sysPrompt = `You are a social media expert for ${brand.name}. Return valid JSON only: { "caption": "...", "hashtags": ["..."], "imagePrompt": "..." }`;
    }

    let completed = 0;
    let failed = 0;

    for (const slotId of slotIds) {
      try {
        // Mark slot as generating
        await pool.query(`UPDATE calendar_slots SET status='generating' WHERE id=$1`, [slotId]);
        await pool.query(`UPDATE generation_jobs SET current_slot_id=$1 WHERE id=$2`, [slotId, jobId]);

        const { rows: slotRows } = await pool.query('SELECT * FROM calendar_slots WHERE id=$1', [slotId]);
        const slot = slotRows[0];
        if (!slot) { failed++; continue; }

        // Build per-slot user prompt
        let userPrompt;
        try {
          userPrompt = buildUserPrompt(
            { platform: slot.platform, contentType: slot.content_type, brief: slot.post_idea, mood: slot.content_category },
            { name: brand.name }
          );
        } catch {
          userPrompt = `Create a ${slot.content_type} for ${slot.platform} about: ${slot.post_idea}. Return JSON: { "caption": "...", "hashtags": ["..."], "imagePrompt": "..." }`;
        }

        const raw = await callAI(sysPrompt + '\n\n' + userPrompt);

        let caption = '', hashtags = [], imagePrompt = '';
        try {
          const match = raw.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(match ? match[0] : raw);
          caption = parsed.caption || slot.post_idea;
          hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];
          imagePrompt = parsed.imagePrompt || `Professional social media ${slot.content_type} for ${brand.name}`;
        } catch {
          caption = slot.post_idea;
        }

        // Generate image
        const fullImagePrompt = `${imagePrompt}. Brand: ${brand.name}. Style: professional social media ${slot.content_type} for ${slot.platform}. High quality, no text overlays.`;
        const imageUrl = await generateImage(fullImagePrompt);

        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          // Deduct credits
          await client.query('UPDATE users SET credits=credits-2, updated_at=NOW() WHERE id=$1', [brand.user_id]);
          try {
            await client.query(
              `INSERT INTO credit_transactions (user_id,amount,type,description) VALUES ($1,-2,'usage',$2)`,
              [brand.user_id, `Generated ${slot.content_type} for ${slot.platform}`]
            );
          } catch {
            await client.query(
              `INSERT INTO credit_transactions (user_id,amount,type,reason) VALUES ($1,-2,'usage',$2)`,
              [brand.user_id, `Generated ${slot.content_type} for ${slot.platform}`]
            );
          }

          // Insert post
          const { rows: postRows } = await client.query(
            `INSERT INTO posts (user_id, brand_id, platform, content_type, caption, hashtags, status, is_ai_generated, generation_prompt, image_url, slot_id, generation_job_id, approval_status, version_number)
             VALUES ($1,$2,$3,$4,$5,$6,'draft',TRUE,$7,$8,$9,$10,'pending',1) RETURNING *`,
            [brand.user_id, brand.id, slot.platform, slot.content_type, caption, hashtags,
             JSON.stringify({ brief: slot.post_idea, imagePrompt }), imageUrl,
             slot.id, jobId]
          );
          const post = postRows[0];

          // Insert version record
          await client.query(
            `INSERT INTO post_versions (post_id, version_number, caption, image_url, hashtags, generation_prompt)
             VALUES ($1,1,$2,$3,$4,$5)`,
            [post.id, caption, imageUrl, hashtags, JSON.stringify({ brief: slot.post_idea, imagePrompt })]
          );

          // Update slot with post reference
          await client.query(
            `UPDATE calendar_slots SET status='generated', post_id=$1 WHERE id=$2`,
            [post.id, slotId]
          );

          await client.query('COMMIT');
          completed++;
        } catch (err) {
          await client.query('ROLLBACK').catch(() => {});
          throw err;
        } finally {
          client.release();
        }

        // Update job progress
        await pool.query(
          `UPDATE generation_jobs SET completed_slots=$1 WHERE id=$2`,
          [completed, jobId]
        );
      } catch (err) {
        logger.error('Slot generation failed', { slotId, error: err.message });
        failed++;
        await pool.query(
          `UPDATE calendar_slots SET status='rejected' WHERE id=$1`,
          [slotId]
        );
        await pool.query(
          `UPDATE generation_jobs SET failed_slots=$1 WHERE id=$2`,
          [failed, jobId]
        );
      }
    }

    // Mark job complete
    await pool.query(
      `UPDATE generation_jobs SET status='complete', completed_at=NOW(), current_slot_id=NULL, completed_slots=$1, failed_slots=$2 WHERE id=$3`,
      [completed, failed, jobId]
    );
    logger.info('Generation job complete', { jobId, completed, failed });
  } catch (err) {
    logger.error('runGenerationJob fatal', { jobId, error: err.message });
    await pool.query(`UPDATE generation_jobs SET status='failed' WHERE id=$1`, [jobId]).catch(() => {});
  }
}

module.exports = router;

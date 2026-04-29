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
const { persistGeneratedImageToStorage, stringifyPromptPayload } = require('../lib/generatedImageStore');
const { deductByUserIdAndLog } = require('../services/creditService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function hasColumn(pool, tableName, columnName) {
  const { rows } = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1 AND column_name=$2
     LIMIT 1`,
    [tableName, columnName]
  );
  return !!rows[0];
}

let generationDebugColumnsReady = false;
let calendarDraftColumnsReady = false;
const activeGenerationJobs = new Set();
async function ensureGenerationDebugColumns(pool) {
  if (generationDebugColumnsReady) return;
  // DDL moved to tracked SQL migrations.
  generationDebugColumnsReady = true;
}

async function ensureCalendarDraftColumns(pool) {
  if (calendarDraftColumnsReady) return;
  // DDL moved to tracked SQL migrations.
  calendarDraftColumnsReady = true;
}

async function reconcileStalledJob(pool, job) {
  if (!job) return job;
  const hasNoRemaining = (job.completed_slots + job.failed_slots) >= job.total_slots;

  // Self-heal inconsistent states: if all slots are accounted for, force complete.
  if (hasNoRemaining && job.status !== 'complete') {
    await pool.query(
      `UPDATE generation_jobs
       SET status='complete',
           completed_at=COALESCE(completed_at, NOW()),
           current_slot_id=NULL
       WHERE id=$1`,
      [job.id]
    );
    const { rows } = await pool.query(`SELECT * FROM generation_jobs WHERE id=$1`, [job.id]);
    return rows[0] || job;
  }

  if (job.status !== 'running' || !job.started_at) return job;
  const startedAt = new Date(job.started_at).getTime();
  const ageMs = Date.now() - startedAt;
  const STALE_MS = 10 * 60 * 1000; // 10 minutes
  const hasWorkRemaining = (job.completed_slots + job.failed_slots) < job.total_slots;
  if (!hasWorkRemaining || ageMs < STALE_MS) return job;

  // Try self-recovery before marking failed: restart remaining approved/generating slots.
  const { rows: resumableSlots } = await pool.query(
    `SELECT id
     FROM calendar_slots
     WHERE plan_id=$1 AND status IN ('approved','generating')
     ORDER BY sort_order ASC, slot_date ASC`,
    [job.plan_id]
  );
  const resumableSlotIds = resumableSlots.map((s) => s.id);
  if (resumableSlotIds.length && !activeGenerationJobs.has(job.id)) {
    await pool.query(
      `UPDATE generation_jobs
       SET status='queued',
           current_slot_id=NULL,
           last_error=COALESCE(last_error, 'Auto-resuming stalled generation job.')
       WHERE id=$1`,
      [job.id]
    );
    queueGenerationJob(job.id, resumableSlotIds, pool);
    const { rows: restarted } = await pool.query(`SELECT * FROM generation_jobs WHERE id=$1`, [job.id]);
    return restarted[0] || job;
  }

  const lastError = `Generation timed out after ${Math.round(ageMs / 1000)}s. Worker likely interrupted; please retry.`;
  if (job.current_slot_id) {
    await pool.query(
      `UPDATE calendar_slots
       SET status='failed',
           error_message=COALESCE(error_message, $2)
       WHERE id=$1 AND status='generating'`,
      [job.current_slot_id, lastError]
    );
  }
  await pool.query(
    `UPDATE generation_jobs
     SET status='failed',
         failed_slots=GREATEST(failed_slots, total_slots - completed_slots),
         completed_at=NOW(),
         current_slot_id=NULL,
         last_error=$2
     WHERE id=$1`,
    [job.id, lastError]
  );
  const { rows } = await pool.query(`SELECT * FROM generation_jobs WHERE id=$1`, [job.id]);
  return rows[0] || job;
}

function queueGenerationJob(jobId, slotIds, pool) {
  if (!jobId || !Array.isArray(slotIds) || !slotIds.length) return false;
  if (activeGenerationJobs.has(jobId)) return false;
  activeGenerationJobs.add(jobId);
  setImmediate(async () => {
    try {
      await runGenerationJob(jobId, slotIds, pool);
    } finally {
      activeGenerationJobs.delete(jobId);
    }
  });
  return true;
}

async function getBrandProducts(pool, userId, brandId) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, price, category, tags, images, visual_description, use_in, is_primary
       FROM brand_products
       WHERE user_id=$1 AND ($2::uuid IS NULL OR brand_id=$2 OR brand_id IS NULL)
       ORDER BY is_primary DESC, created_at ASC
       LIMIT 20`,
      [userId, brandId || null]
    );
    return rows || [];
  } catch {
    // brand_products table might not exist in older installs
    return [];
  }
}

function pickPrimaryProduct(products, useInKey) {
  const filtered = (products || []).filter((p) => {
    const useIn = Array.isArray(p.use_in) ? p.use_in : [];
    return useInKey ? useIn.includes(useInKey) : true;
  });
  return filtered.find((p) => p.is_primary) || filtered[0] || null;
}

function summarizeProducts(products, max = 5) {
  const list = (products || []).slice(0, max);
  if (!list.length) return '';
  return list.map((p) => {
    const bits = [
      `- ${p.name}`,
      p.category ? `category: ${p.category}` : '',
      p.price ? `price/offer: ${p.price}` : '',
      p.description ? `desc: ${p.description}` : '',
      p.visual_description ? `visual: ${p.visual_description}` : '',
      Array.isArray(p.tags) && p.tags.length ? `tags: ${p.tags.join(', ')}` : '',
    ].filter(Boolean).join(' | ');
    return bits;
  }).join('\n');
}

const getUserWithBrand = async (uid) => {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.credits,
            b.id AS brand_id, b.name AS brand_name, b.description, b.industry,
            b.tone, b.styles, b.goals, b.platforms,
            b.audience_age_min, b.audience_age_max, b.audience_gender, b.audience_interests,
            b.font_mood,
            b.color_primary, b.color_secondary, b.color_accent,
            b.industry_subtype, b.price_segment, b.posting_frequency, b.content_mix,
            bic.usp_keywords, bic.industry_answers,
            bsp.dominant_aesthetic, bsp.mood_keywords, bsp.photography_style,
            bsp.layout_style, bsp.font_mood_detected,
            ccp.weekly_post_count AS pref_weekly_posts, ccp.content_type_mix AS pref_content_mix
     FROM users u
     LEFT JOIN LATERAL (
       SELECT b1.*
       FROM brands b1
       WHERE b1.user_id = u.id
       ORDER BY b1.is_default DESC, b1.created_at ASC
       LIMIT 1
     ) b ON TRUE
     LEFT JOIN brand_industry_configs bic ON bic.brand_id = b.id
     LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
     LEFT JOIN content_calendar_preferences ccp ON ccp.brand_id = b.id
     WHERE u.firebase_uid = $1 LIMIT 1`,
    [uid]
  );
  return rows[0] || null;
};

const { callAI, generateImageDetailed } = require('../lib/ai');

const AI_TIMEOUT_MS = 45_000;

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

const GENERIC_PHRASES = [
  'elevate your brand',
  'unlock potential',
  'game changer',
  'we are excited',
  'discover now',
];

function enforceSlotQuality(slot, fallbackPlatform) {
  const cleaned = { ...slot };
  cleaned.post_idea = String(cleaned.post_idea || '').trim();
  cleaned.caption_draft = String(cleaned.caption_draft || '').trim();
  cleaned.creative_brief = String(cleaned.creative_brief || '').trim();
  cleaned.platform = String(cleaned.platform || fallbackPlatform || 'instagram').toLowerCase();

  // Reject generic ideas by replacing with a more specific fallback derived from category.
  const ideaLower = cleaned.post_idea.toLowerCase();
  if (!cleaned.post_idea || GENERIC_PHRASES.some((p) => ideaLower.includes(p)) || cleaned.post_idea.length < 24) {
    const category = String(cleaned.category || 'promotional');
    cleaned.post_idea = `Create a ${category} ${cleaned.content_type || 'post'} showing a real use-case, concrete customer benefit, and a specific visual scene for ${cleaned.platform}.`;
  }

  if (!cleaned.creative_brief || !cleaned.creative_brief.includes('Goal')) {
    cleaned.creative_brief = [
      'Goal: Drive clear intent for this post objective.',
      'Key message: One concrete value proposition tied to audience pain point.',
      'Visual concept: Realistic scene with subject, environment, and brand/product context.',
      'Composition: Foreground/background hierarchy, camera angle, focal point.',
      'Lighting: Explicit lighting style with shadow mood.',
      'Product placement: Explicit placement or N/A.',
    ].join('\n');
  }

  if (!cleaned.caption_draft || cleaned.caption_draft.length < 40) {
    cleaned.caption_draft = `${cleaned.post_idea}\n\nHighlight one practical takeaway.\nInvite action with a direct CTA.`;
  }

  return cleaned;
}

// ─── POST /api/calendar/generate-plan ────────────────────────────────────────

router.post('/generate-plan', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });

    const { month, postCount, mixPreferences = {} } = req.body;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'month is required (YYYY-MM)' });
    }

  const user = await getUserWithBrand(req.user.uid);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (!user.brand_id) return res.status(400).json({ error: 'No brand found. Complete onboarding first.' });

  const resolvedPostCount =
    Number.isFinite(Number(postCount)) && Number(postCount) > 0
      ? Number(postCount)
      : Math.max(4, (Number(user.pref_weekly_posts) || 4) * 4);
  const resolvedMixPreferences =
    mixPreferences && Object.keys(mixPreferences).length
      ? mixPreferences
      : (user.pref_content_mix || { promotional: 30, educational: 25, testimonial: 20, bts: 15, festive: 10 });
  const mixValues = Object.values(resolvedMixPreferences).map((v) => Number(v) || 0);
  const mixTotal = mixValues.reduce((a, b) => a + b, 0);
  if (mixTotal <= 0 || mixTotal > 200) {
    return res.status(400).json({ error: 'mixPreferences looks invalid.' });
  }

  const creditsRequired = resolvedPostCount * 2;
  if ((user.credits || 0) < creditsRequired) {
    return res.status(402).json({ error: 'insufficient_credits', creditsRequired, creditsAvailable: user.credits });
  }

  const [year] = month.split('-').map(Number);

  try {
    // 1. Build AI prompt to generate slot ideas
    const categories = expandMix(resolvedMixPreferences, resolvedPostCount);
    const brand = {
      name: user.brand_name || 'Brand',
      industry: user.industry || 'general',
      industrySubtype: user.industry_subtype || '',
      description: user.description || '',
      tone: user.tone || 50,
      styles: user.styles || [],
      goals: user.goals || [],
      platforms: (user.active_platforms && user.active_platforms.length) ? user.active_platforms : (user.platforms || ['instagram']),
      audienceAgeMin: user.audience_age_min || 18,
      audienceAgeMax: user.audience_age_max || 65,
      audienceGender: user.audience_gender || 'mixed',
      audienceInterests: user.audience_interests || [],
      usp: user.usp_keywords && user.usp_keywords.length ? user.usp_keywords.join(', ') : '',
      mission: '',
      priceSegment: user.price_segment || '',
      brandPersona: '',
      wordsToUse: [],
      wordsToAvoid: [],
      dominantAesthetic: user.dominant_aesthetic || '',
      moodKeywords: user.mood_keywords || [],
      photographyStyle: user.photography_style || '',
      layoutStyle: user.layout_style || '',
      industryAnswers: user.industry_answers ? JSON.stringify(user.industry_answers) : '',
    };
    const platforms = brand.platforms.length ? brand.platforms : ['instagram'];
    const toneLabel = brand.tone <= 25 ? 'Casual' : brand.tone <= 50 ? 'Conversational' : brand.tone <= 74 ? 'Balanced' : 'Professional';

    // Pull products to influence calendar plan (optional)
    const products = await getBrandProducts(pool, user.id, user.brand_id);
    const calendarProducts = (products || []).filter((p) => (Array.isArray(p.use_in) ? p.use_in : []).includes('calendar'));
    const primaryCalendarProduct = pickPrimaryProduct(calendarProducts, 'calendar');
    const productsSummary = summarizeProducts(calendarProducts, 6);

    // Prefer the canonical prompt engine's system context to avoid drift.
    let systemPrompt = '';
    try {
      systemPrompt = buildSystemPrompt({
        name: brand.name,
        industry: brand.industry,
        description: brand.description,
        tone: brand.tone,
        styles: brand.styles,
        goals: brand.goals,
        audienceAgeMin: brand.audienceAgeMin,
        audienceAgeMax: brand.audienceAgeMax,
        audienceGender: brand.audienceGender,
        audienceInterests: brand.audienceInterests,
        audienceLocation: '',
        platforms,
        brandColors: [user.color_primary, user.color_secondary, user.color_accent].filter(Boolean),
        fontMood: user.font_mood || user.font_mood_detected,
        visualDNA: (user.dominant_aesthetic || user.mood_keywords?.length || user.extracted_colors?.length) ? {
          colorPalette: user.extracted_colors || [],
          aestheticStyle: user.dominant_aesthetic || null,
          moodKeywords: user.mood_keywords || [],
          designElements: user.layout_style ? [user.layout_style] : [],
          contentStyle: user.photography_style || null,
        } : null,
        industryConfig: user.industry_answers || null,
        usp: user.usp_keywords || [],
        calendarPrefs: user.pref_weekly_posts ? {
          postsPerWeek: user.pref_weekly_posts,
          contentMix: user.pref_content_mix || {},
          primaryPlatforms: platforms,
        } : null,
      });
    } catch {
      // Fallback to lightweight context below.
      systemPrompt = '';
    }

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

    const userPrompt = `You are a senior social media strategist and creative director.
Generate a ${resolvedPostCount}-post monthly content plan for the following brand. The plan must be specific, on-brand, and non-generic.

${brandContext}

${productsSummary ? `PRODUCT_LIBRARY (real offerings — use when relevant):\n${productsSummary}\n` : ''}
${primaryCalendarProduct ? `PRIMARY_PRODUCT_TO_FEATURE: ${primaryCalendarProduct.name}\n` : ''}

CONTENT_CATEGORIES_SEQUENCE:
${categories.join(', ')}

Return ONLY valid JSON (no markdown) in this exact shape:
{ "posts": [ ...${resolvedPostCount} items... ] }

Each item MUST have:
{
  "topic": "short campaign/topic title",
  "category": "promotional|educational|testimonial|bts|festive",
  "content_type": "post|reel|carousel|story",
  "format": "single_image|carousel|video|story_card",
  "platform": "${platforms.join('|')}",
  "post_idea": "ONE sentence concept (not generic)",
  "creative_copy": "hook + key narrative copy in 2-5 lines",
  "creative_brief": "4-6 bullet lines. Must include: Goal, Key message, Visual concept, Composition, Lighting, Product placement (or 'N/A')",
  "caption_draft": "Caption only (no hashtags). Must follow: Hook → Value → CTA. Match tone. 2-6 lines with line breaks.",
  "hashtags_draft": ["3-8 relevant hashtags without # prefix"]
}

Rules:
- Match content_type to category: educational→carousel, bts→reel, others→post or mix
- Captions must be human, specific, and use the brand's vocabulary. Avoid generic marketing clichés.
- Every post must be distinct. No repeating the same idea with different words.
- Build cohesion across the month (themes that evolve), but keep each post standalone.
- Distribute platforms across ${platforms.join(', ')} evenly if multiple.
- creative_brief must be actionable for an image generator (clear composition + lighting + subject).
- Avoid any generic promise language; each post_idea must mention a concrete scenario, audience pain point, or product context.
${productsSummary ? `- When category is promotional or testimonial, try to feature a real product/service from PRODUCT_LIBRARY in the idea and creative_brief (product placement must be explicit).\n` : ''}

Anti-patterns to avoid:
- “Elevate your brand”, “unlock potential”, “game-changer”, “we’re excited”, vague superlatives without proof
- Generic prompts like “professional social media image” without describing the scene
- Captions that start with the brand name

Return ONLY JSON.`;

    const raw = await callAI(
      systemPrompt
        ? { system: systemPrompt, user: userPrompt }
        : userPrompt,
      { maxTokens: 4096, timeoutMs: AI_TIMEOUT_MS }
    );
    let slots;
    try {
      // Strip markdown fences Gemini sometimes wraps around JSON
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : cleaned);
      slots = parsed.posts || parsed.slots || [];
    } catch {
      logger.error('AI plan parse failed', { raw: raw.slice(0, 300) });
      return res.status(500).json({ error: 'AI returned invalid response. Please try again.' });
    }

    if (!slots.length) return res.status(500).json({ error: 'AI returned no slots.' });
    slots = slots.slice(0, resolvedPostCount);

    // 2. Assign dates
    const dates = buildPostDates(month, slots.length);

    // 3. Persist content_plan + calendar_slots
    await ensureCalendarDraftColumns(pool);
    const canStoreCreativeBrief = await hasColumn(pool, 'calendar_slots', 'creative_brief');
    const canStoreTopic = await hasColumn(pool, 'calendar_slots', 'topic');
    const canStoreFormat = await hasColumn(pool, 'calendar_slots', 'format');
    const canStoreCreativeCopy = await hasColumn(pool, 'calendar_slots', 'creative_copy');
    const canStoreHashtagsDraft = await hasColumn(pool, 'calendar_slots', 'hashtags_draft');
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
        const s = enforceSlotQuality(slots[i], platforms[i % platforms.length] || platforms[0]);
        const d = dates[i];
        const contentType = s.content_type || CONTENT_TYPE_MAP[s.category] || 'post';
        const platform = s.platform || platforms[i % platforms.length] || platforms[0];
        const postIdea = (s.post_idea || '').toString().trim();
        const captionDraft = (s.caption_draft || '').toString().trim();
        const creativeBrief = (s.creative_brief || '').toString().trim();
        const topic = (s.topic || postIdea || '').toString().trim().slice(0, 140);
        const format = (s.format || (contentType === 'carousel' ? 'carousel' : contentType === 'reel' ? 'video' : 'single_image')).toString().trim();
        const creativeCopy = (s.creative_copy || captionDraft || postIdea || '').toString().trim();
        const hashtagsDraft = Array.isArray(s.hashtags_draft)
          ? s.hashtags_draft.map((h) => String(h || '').replace(/^#/, '').trim()).filter(Boolean).slice(0, 10)
          : [];

        const canStoreFullSocialCalendar = canStoreCreativeBrief && canStoreTopic && canStoreFormat && canStoreCreativeCopy && canStoreHashtagsDraft;
        const { rows: slotRows } = await (canStoreFullSocialCalendar
          ? client.query(
              `INSERT INTO calendar_slots (plan_id, brand_id, slot_date, day_of_week, topic, content_type, format, content_category, post_idea, creative_copy, creative_brief, caption_draft, hashtags_draft, platform, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
              [
                plan.id,
                user.brand_id,
                d.date,
                d.dayOfWeek,
                topic || postIdea,
                contentType,
                format,
                s.category || 'promotional',
                postIdea,
                creativeCopy || null,
                creativeBrief || null,
                captionDraft,
                hashtagsDraft,
                platform,
                i,
              ]
            )
          : (canStoreCreativeBrief
          ? client.query(
              `INSERT INTO calendar_slots (plan_id, brand_id, slot_date, day_of_week, content_type, content_category, post_idea, creative_brief, caption_draft, platform, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
              [
                plan.id,
                user.brand_id,
                d.date,
                d.dayOfWeek,
                contentType,
                s.category || 'promotional',
                postIdea,
                creativeBrief || null,
                captionDraft,
                platform,
                i,
              ]
            )
          : client.query(
              `INSERT INTO calendar_slots (plan_id, brand_id, slot_date, day_of_week, content_type, content_category, post_idea, caption_draft, platform, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
              [
                plan.id,
                user.brand_id,
                d.date,
                d.dayOfWeek,
                contentType,
                s.category || 'promotional',
                postIdea,
                captionDraft,
                platform,
                i,
              ]
            ))
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
    if (err.message === 'AI_TIMEOUT') return res.status(503).json({ error: 'Generation timed out. The AI is busy — please try again.' });
    res.status(500).json({ error: 'Failed to generate plan.', details: err.message });
  }
});

// ─── GET /api/calendar/plans/:planId ─────────────────────────────────────────

router.get('/plans/:planId', authMiddleware, async (req, res, next) => {
  if (req.params.planId === 'latest') return next();
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

router.get('/plans', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  try {
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [req.user.uid]);
    const userId = userRows[0]?.id;
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const { rows } = await pool.query(
      `SELECT id, month, year, status, total_posts, created_at
       FROM content_plans
       WHERE user_id=$1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json({ plans: rows });
  } catch (err) {
    logger.error('get plans failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch plans.' });
  }
});

router.get('/plans/latest', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  try {
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [req.user.uid]);
    const userId = userRows[0]?.id;
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const { rows: planRows } = await pool.query(
      `SELECT * FROM content_plans
       WHERE user_id=$1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    const plan = planRows[0] || null;
    if (!plan) return res.json({ plan: null, slots: [] });

    const { rows: slots } = await pool.query(
      'SELECT * FROM calendar_slots WHERE plan_id=$1 ORDER BY sort_order ASC, slot_date ASC',
      [plan.id]
    );
    res.json({ plan, slots });
  } catch (err) {
    logger.error('get latest plan failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch latest plan.' });
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
  if (!selectedSlotIds.every((id) => typeof id === 'string' && id.length > 10)) {
    return res.status(400).json({ error: 'selectedSlotIds must contain valid slot ids.' });
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
      const canEditCreativeBrief = await hasColumn(pool, 'calendar_slots', 'creative_brief');
      if (
        edits.post_idea !== undefined ||
        edits.caption_draft !== undefined ||
        edits.creative_brief !== undefined
      ) {
        if (canEditCreativeBrief) {
          await client.query(
            `UPDATE calendar_slots
             SET post_idea=COALESCE($1, post_idea),
                 caption_draft=COALESCE($2, caption_draft),
                 creative_brief=COALESCE($3, creative_brief)
             WHERE id=$4 AND plan_id=$5`,
            [
              edits.post_idea || null,
              edits.caption_draft || null,
              edits.creative_brief || null,
              slotId,
              plan.id,
            ]
          );
        } else {
          await client.query(
            `UPDATE calendar_slots
             SET post_idea=COALESCE($1, post_idea),
                 caption_draft=COALESCE($2, caption_draft)
             WHERE id=$3 AND plan_id=$4`,
            [
              edits.post_idea || null,
              edits.caption_draft || null,
              slotId,
              plan.id,
            ]
          );
        }
      }
    }

    // Mark selected slots as approved
    await client.query(
      `UPDATE calendar_slots SET status='approved' WHERE id=ANY($1::uuid[]) AND plan_id=$2`,
      [selectedSlotIds, plan.id]
    );

    // Keep unselected slots pending so queue/progress only reflects selected slots.
    await client.query(
      `UPDATE calendar_slots SET status='pending' WHERE plan_id=$1 AND id!=ALL($2::uuid[]) AND status='pending'`,
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

    // Start generation in background, with durable sweeper fallback.
    queueGenerationJob(job.id, selectedSlotIds, pool);

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

router.get('/jobs/recent', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.json({ jobs: [] });
  try {
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [req.user.uid]);
    const userId = userRows[0]?.id;
    if (!userId) return res.json({ jobs: [] });

    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const { rows } = await pool.query(
      `SELECT * FROM generation_jobs WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    const normalized = [];
    for (const job of rows) {
      normalized.push(await reconcileStalledJob(pool, job));
    }
    res.json({ jobs: normalized });
  } catch (err) {
    logger.error('recent jobs failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch recent jobs.' });
  }
});

router.get('/jobs/:jobId', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  try {
    await ensureGenerationDebugColumns(pool);
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [req.user.uid]);
    const userId = userRows[0]?.id;
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const { rows: jobRows } = await pool.query(
      'SELECT * FROM generation_jobs WHERE id=$1 AND user_id=$2',
      [req.params.jobId, userId]
    );
    if (!jobRows[0]) return res.status(404).json({ error: 'Job not found.' });
    const job = await reconcileStalledJob(pool, jobRows[0]);

    const { rows: slots } = await pool.query(
      `SELECT cs.id, cs.post_idea, cs.content_type, cs.platform, cs.status, cs.error_message,
              p.id AS post_id, p.image_url
       FROM calendar_slots cs
       LEFT JOIN posts p ON p.slot_id = cs.id AND p.id = cs.post_id
       WHERE cs.plan_id = $1 AND cs.status IN ('approved','generating','generated','failed')
       ORDER BY cs.sort_order ASC, cs.slot_date ASC`,
      [job.plan_id]
    );

    res.json({ job, slots });
  } catch (err) {
    logger.error('get job failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch job.' });
  }
});

// ─── Background generation runner ────────────────────────────────────────────

async function runGenerationJob(jobId, slotIds, pool) {
  try {
    await ensureGenerationDebugColumns(pool);
    // Mark job as running
    await pool.query(`UPDATE generation_jobs SET status='running', started_at=NOW(), last_error=NULL WHERE id=$1`, [jobId]);

    const { rows: jobRows } = await pool.query('SELECT * FROM generation_jobs WHERE id=$1', [jobId]);
    const job = jobRows[0];
    if (!job) return;

    // Get brand data
    const { rows: brandRows } = await pool.query(
      `SELECT b.*, u.id AS user_id, u.credits,
              bsp.extracted_colors, bsp.font_mood_detected, bsp.layout_style,
              bsp.photography_style, bsp.mood_keywords, bsp.composition_style,
              bsp.text_density, bsp.dominant_aesthetic, bsp.reference_image_urls,
              bic.usp_keywords AS industry_usp, bic.industry_answers,
              ccp.weekly_post_count, ccp.content_type_mix, ccp.active_platforms
       FROM brands b
       JOIN users u ON u.id = b.user_id
       LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
       LEFT JOIN brand_industry_configs bic ON bic.brand_id = b.id
       LEFT JOIN content_calendar_preferences ccp ON ccp.brand_id = b.id
       WHERE b.id = $1
       LIMIT 1`,
      [job.brand_id]
    );
    const brand = brandRows[0];
    if (!brand) {
      await pool.query(`UPDATE generation_jobs SET status='failed', last_error=$2 WHERE id=$1`, [jobId, 'Brand not found for generation job']);
      return;
    }

    // Products (optional) for image/caption generation
    const products = await getBrandProducts(pool, brand.user_id, brand.id);
    const imageProducts = (products || []).filter((p) => (Array.isArray(p.use_in) ? p.use_in : []).includes('image_generation'));
    const primaryImageProduct = pickPrimaryProduct(imageProducts, 'image_generation');
    const fallbackReferenceImages = [
      ...(Array.isArray(primaryImageProduct?.images) ? primaryImageProduct.images : []),
      ...imageProducts.flatMap((p) => (Array.isArray(p.images) ? p.images.slice(0, 1) : [])),
    ].filter(Boolean).slice(0, 3);

    const brandColors = [brand.color_primary, brand.color_secondary, brand.color_accent].filter(Boolean);
    const brandVisualNotes = [
      brandColors.length ? `Brand colors: ${brandColors.join(', ')}` : '',
      brand.font_mood ? `Typography mood: ${brand.font_mood}` : '',
      brand.font_mood_detected ? `Detected font mood: ${brand.font_mood_detected}` : '',
      brand.dominant_aesthetic ? `Aesthetic: ${brand.dominant_aesthetic}` : '',
      brand.mood_keywords?.length ? `Mood keywords: ${brand.mood_keywords.join(', ')}` : '',
      brand.photography_style ? `Photography style: ${brand.photography_style}` : '',
      brand.layout_style ? `Layout style: ${brand.layout_style}` : '',
      brand.extracted_colors?.length ? `Detected palette: ${brand.extracted_colors.join(', ')}` : '',
    ].filter(Boolean);

    const productContextBlock = (() => {
      if (!primaryImageProduct) return '';
      const bits = [
        `Primary product: ${primaryImageProduct.name}`,
        primaryImageProduct.category ? `Category: ${primaryImageProduct.category}` : '',
        primaryImageProduct.price ? `Price/offer: ${primaryImageProduct.price}` : '',
        primaryImageProduct.description ? `Description: ${primaryImageProduct.description}` : '',
        primaryImageProduct.visual_description ? `Visual reference: ${primaryImageProduct.visual_description}` : '',
        Array.isArray(primaryImageProduct.tags) && primaryImageProduct.tags.length ? `Tags: ${primaryImageProduct.tags.join(', ')}` : '',
      ].filter(Boolean);
      return bits.length ? `PRODUCT_CONTEXT:\n${bits.join('\n')}` : '';
    })();

    // Build system prompt once for this brand
    let sysPrompt;
    try {
      sysPrompt = buildSystemPrompt({
        name: brand.name, industry: brand.industry, description: brand.description,
        tone: brand.tone || 50, styles: brand.styles || [], goals: brand.goals || [],
        audienceAgeMin: brand.audience_age_min, audienceAgeMax: brand.audience_age_max,
        audienceGender: brand.audience_gender, audienceInterests: brand.audience_interests || [],
        audienceLocation: '', platforms: brand.platforms || [],
        brandColors,
        fontMood: brand.font_mood || brand.font_mood_detected,
        usp: (brand.industry_usp && brand.industry_usp.length)
          ? brand.industry_usp.join(', ')
          : (brand.usp_keywords && brand.usp_keywords.length ? brand.usp_keywords.join(', ') : ''),
        mission: '',
        wordsToUse: [], wordsToAvoid: [],
        persona: '',
      });
    } catch {
      sysPrompt = `You are a social media expert for ${brand.name}. Return valid JSON only: { "caption": "...", "hashtags": ["..."], "imagePrompt": "..." }`;
    }

    let completed = 0;
    let failed = 0;

    for (const slotId of slotIds) {
      try {
        // Mark slot as generating
        await pool.query(`UPDATE calendar_slots SET status='generating', error_message=NULL WHERE id=$1`, [slotId]);
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

        const creativeBrief = (slot.creative_brief || '').toString().trim();
        const productPlacementRule = primaryImageProduct
          ? `\n\nPRODUCT PLACEMENT RULE:\nIf the slot is promotional/testimonial or naturally fits, include "${primaryImageProduct.name}" in the imagePrompt with explicit placement (foreground/background, scale, angle).`
          : '';

        const expandedUserPrompt = [
          userPrompt,
          creativeBrief ? `\n\nSLOT_CREATIVE_BRIEF (must follow):\n${creativeBrief}` : '',
          productContextBlock ? `\n\n${productContextBlock}` : '',
          productPlacementRule,
        ].filter(Boolean).join('');

        const raw = await callAI(sysPrompt + '\n\n' + expandedUserPrompt, { maxTokens: 1400, timeoutMs: AI_TIMEOUT_MS });

        let caption = '', hashtags = [], imagePrompt = '';
        try {
          const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
          const match = cleaned.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(match ? match[0] : cleaned);
          caption = parsed.caption || slot.caption_draft || slot.post_idea;
          hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];
          imagePrompt = parsed.imagePrompt || `${slot.post_idea}. ${creativeBrief || 'Premium product-focused composition.'}`;
        } catch {
          caption = slot.caption_draft || slot.post_idea;
          imagePrompt = `${slot.post_idea}. ${creativeBrief || 'Premium social media visual, specific composition and lighting.'}`;
        }

        // Generate image (art-directed using Brand DNA + slot creative brief)
        const aspectRatio =
          slot.content_type === 'reel' || slot.content_type === 'story'
            ? '9:16'
            : (slot.content_type === 'carousel' ? '4:5' : '1:1');

        const artDirection = [
          `FORMAT: ${slot.platform} ${slot.content_type}. Aspect ratio ${aspectRatio}.`,
          brandVisualNotes.length ? `BRAND_VISUAL_IDENTITY:\n${brandVisualNotes.join('\n')}` : '',
          productContextBlock ? productContextBlock : '',
          creativeBrief ? `SLOT_CREATIVE_BRIEF:\n${creativeBrief}` : '',
          'COMPOSITION_RULES: specify subject, environment, camera angle, lens feel, depth-of-field, and focal point.',
          'LIGHTING_RULES: specify lighting (golden hour / softbox / moody low-key / bright airy) and shadows.',
          'QUALITY: premium, high-end, photorealistic, detailed textures.',
          'RESTRICTIONS: no text overlays, no logos, no watermarks.',
          'AVOID: flat stock photo look, generic \"professional social media\" phrasing.',
        ].filter(Boolean).join('\n\n');

        const fullImagePrompt = `${imagePrompt}\n\n${artDirection}`;
        const imageResult = await generateImageDetailed(fullImagePrompt, {
          aspectRatio,
          referenceImageUrls: fallbackReferenceImages,
        });
        const rawImage = imageResult?.imageData || null;
        if (!rawImage) {
          const reason = imageResult?.error || 'unknown_provider_failure';
          const provider = imageResult?.provider || 'unknown_provider';
          throw new Error(`IMAGE_GENERATION_FAILED: ${provider} - ${reason}`);
        }
        const imageUrl = await persistGeneratedImageToStorage({
          imageData: rawImage,
          userId: brand.user_id,
          brandId: brand.id,
          traceId: slotId,
        });
        if (!imageUrl) {
          throw new Error('IMAGE_PERSIST_FAILED');
        }

        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          // Deduct credits atomically (prevents negative balances on concurrent workers)
          await deductByUserIdAndLog(
            client,
            brand.user_id,
            2,
            `Generated ${slot.content_type} for ${slot.platform}`
          );

          // Insert post
          const generationPromptPayload = stringifyPromptPayload({
            brief: slot.post_idea,
            captionDraft: slot.caption_draft,
            creativeBrief,
            imagePrompt,
            artDirection,
          });
          const { rows: postRows } = await client.query(
            `INSERT INTO posts (user_id, brand_id, platform, content_type, caption, hashtags, status, is_ai_generated, generation_prompt, image_url, slot_id, generation_job_id, approval_status, version_number)
             VALUES ($1,$2,$3,$4,$5,$6,'draft',TRUE,$7,$8,$9,$10,'pending',1) RETURNING *`,
            [brand.user_id, brand.id, slot.platform, slot.content_type, caption, hashtags,
             generationPromptPayload, imageUrl,
             slot.id, jobId]
          );
          const post = postRows[0];

          // Insert version record
          await client.query(
            `INSERT INTO post_versions (post_id, version_number, caption, image_url, hashtags, generation_prompt)
             VALUES ($1,1,$2,$3,$4,$5)`,
            [post.id, caption, imageUrl, hashtags, stringifyPromptPayload({ brief: slot.post_idea, imagePrompt, creativeBrief })]
          );

          // Update slot with post reference
          await client.query(
          `UPDATE calendar_slots SET status='generated', post_id=$1, error_message=NULL WHERE id=$2`,
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
        const safeError = String(err?.message || 'Unknown generation error').slice(0, 1000);
        logger.error('Slot generation failed', { slotId, error: safeError, stack: err?.stack });
        failed++;
        await pool.query(
          `UPDATE calendar_slots SET status='failed', error_message=$2 WHERE id=$1`,
          [slotId, safeError]
        );
        await pool.query(
          `UPDATE generation_jobs SET failed_slots=$1, last_error=$3 WHERE id=$2`,
          [failed, jobId, `slot ${slotId}: ${safeError}`]
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
    const safeError = String(err?.message || 'Unknown fatal generation error').slice(0, 1000);
    logger.error('runGenerationJob fatal', { jobId, error: safeError, stack: err?.stack });
    await pool.query(`UPDATE generation_jobs SET status='failed', last_error=$2 WHERE id=$1`, [jobId, safeError]).catch(() => {});
  }
}

let sweepInProgress = false;
const RUNNABLE_STATUSES = ['queued', 'running'];
async function sweepQueuedGenerationJobs() {
  if (sweepInProgress) return;
  const pool = getPool();
  if (!pool) return;
  sweepInProgress = true;
  try {
    const { rows: jobs } = await pool.query(
      `SELECT id, plan_id, status
       FROM generation_jobs
       WHERE status = ANY($1::text[])
       ORDER BY created_at ASC
       LIMIT 3`,
      [RUNNABLE_STATUSES]
    );
    for (const job of jobs) {
      const { rows: slotRows } = await pool.query(
        `SELECT id
         FROM calendar_slots
         WHERE plan_id=$1 AND status IN ('approved','generating')
         ORDER BY sort_order ASC, slot_date ASC`,
        [job.plan_id]
      );
      const slotIds = slotRows.map((r) => r.id);
      if (!slotIds.length) {
        await pool.query(
          `UPDATE generation_jobs
           SET status='complete',
               completed_at=COALESCE(completed_at, NOW()),
               current_slot_id=NULL
           WHERE id=$1`,
          [job.id]
        );
        continue;
      }
      queueGenerationJob(job.id, slotIds, pool);
    }
  } catch (err) {
    logger.error('generation sweeper failed', { error: err.message });
  } finally {
    sweepInProgress = false;
  }
}

const SWEEP_MS = 15_000;
if (!global.__brandvertiseGenerationSweeper) {
  global.__brandvertiseGenerationSweeper = setInterval(() => {
    sweepQueuedGenerationJobs().catch(() => {});
  }, SWEEP_MS);
}

module.exports = router;

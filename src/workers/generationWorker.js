/**
 * Generation Worker — Postgres-based job queue (no Redis required).
 * Run separately: npm run worker
 */
require("dotenv").config();

const { startWorker } = require("../queues/pgQueue");
const { JOB_TYPE } = require("../queues/generationQueue");
const { db, initialized } = require("../config/firebase");
const { query } = require("../config/postgres");
const { buildPrompt } = require("../services/promptService");
const { buildSystemPrompt, buildUserPrompt } = require("../lib/prompt-engine");
const { generateImage } = require("../services/imageService");
const creditService = require("../services/creditService");
const notificationService = require("../services/notificationService");
const logger = require("../utils/logger");

/**
 * Enrich brand object with brand_style_profiles + brand_industry_configs from Postgres.
 */
async function enrichBrandFromDB(brandId) {
  try {
    const [styleRes, configRes, prefRes] = await Promise.all([
      query(`SELECT * FROM brand_style_profiles WHERE brand_id = $1 LIMIT 1`, [brandId]),
      query(`SELECT * FROM brand_industry_configs WHERE brand_id = $1 LIMIT 1`, [brandId]),
      query(`SELECT * FROM content_calendar_preferences WHERE brand_id = $1 LIMIT 1`, [brandId]),
    ]);
    const style = styleRes.rows[0] || {};
    const config = configRes.rows[0] || {};
    const prefs = prefRes.rows[0] || {};
    return {
      visualDNA: (style.dominant_aesthetic || style.mood_keywords?.length || style.extracted_colors?.length) ? {
        colorPalette: style.extracted_colors || [],
        aestheticStyle: style.dominant_aesthetic || null,
        moodKeywords: style.mood_keywords || [],
        designElements: style.layout_style ? [style.layout_style] : [],
        contentStyle: style.photography_style || null,
      } : null,
      industryConfig: config.industry_answers || null,
      calendarPrefs: prefs.weekly_post_count ? {
        postsPerWeek: prefs.weekly_post_count,
        primaryPlatforms: prefs.active_platforms || [],
        contentMix: prefs.content_type_mix || {},
      } : null,
      usp: config.usp_keywords || [],
    };
  } catch (err) {
    logger.warn("Failed to enrich brand from DB", { brandId, error: err.message });
    return {};
  }
}

/**
 * Main job handler — called for each dequeued job.
 */
async function handleGenerationJob(job) {
  const { userId, calendarId, postId, post, brand, assets } = job.payload;

  logger.info("Worker processing job", { id: job.id, postId, attempt: job.attempts });

  // Enrich brand with style profiles + industry config from Postgres
  const enriched = brand.id ? await enrichBrandFromDB(brand.id) : {};
  const enrichedBrand = { ...brand, ...enriched };

  // Step 1: Build prompt using enriched brand intelligence
  const prompt = buildPrompt(post, enrichedBrand, assets || []);

  // Step 2: Generate image
  const result = await generateImage(
    prompt,
    userId,
    brand.id || "unknown",
    postId,
    1
  );

  // Step 3: Update post status in Postgres
  const outputUrl = result.cloudUrl || result.localPath || null;
  await query(
    `UPDATE posts SET status = 'generated', image_url = $2, scheduled_at = NOW() WHERE id = $1`,
    [postId, outputUrl]
  );

  // Step 3b: Also update Firestore if available
  if (initialized && db) {
    await db.collection("posts").doc(postId).update({
      prompt,
      output_urls: outputUrl ? [outputUrl] : [],
      status: "generated",
      generated_at: new Date().toISOString(),
    }).catch(() => {}); // non-fatal
  }

  // Step 4: Deduct credits
  await creditService.deductAndLog(userId, "generate", {
    post_id: postId,
    calendar_id: calendarId,
    job_id: job.id,
  });

  // Step 5: Check calendar completion
  await checkCalendarCompletion(userId, calendarId);

  logger.info("Job completed", { id: job.id, postId, outputUrl });

  return { postId, status: "generated", outputUrl };
}

/**
 * Check if all posts in a calendar are done and notify the user.
 */
async function checkCalendarCompletion(userId, calendarId) {
  if (!calendarId) return;
  try {
    const res = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'generated') AS generated,
         COUNT(*) FILTER (WHERE status = 'failed')    AS failed,
         COUNT(*)                                      AS total
       FROM posts WHERE calendar_id = $1`,
      [calendarId]
    );
    const { generated, failed, total } = res.rows[0];
    if (parseInt(generated) + parseInt(failed) === parseInt(total) && parseInt(total) > 0) {
      const userRes = await query("SELECT email, name FROM users WHERE id = $1", [userId]);
      const user = userRes.rows[0] || { email: null };
      await notificationService.notifyGenerationComplete(
        user, calendarId, parseInt(total), parseInt(generated), parseInt(failed)
      ).catch(() => {});
      logger.info("Calendar generation complete", { calendarId, generated, failed });
    }
  } catch (err) {
    logger.error("Calendar completion check failed", { error: err.message });
  }
}

// Start the polling worker (polls every 3s)
startWorker(JOB_TYPE, handleGenerationJob, 3000);

logger.info("🔧 Generation worker started (Postgres queue — no Redis needed)");

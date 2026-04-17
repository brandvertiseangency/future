/**
 * Creative Generation Routes — queue-based async generation + legacy endpoints.
 */
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const creditCheck = require("../middleware/creditCheck");
const schemas = require("../validators/schemas");

const { db, initialized } = require("../config/firebase");
const { getCalendar } = require("../services/calendarService");
const { buildPrompt } = require("../services/promptService");
const { generateImage, generateAndSaveImage } = require("../services/imageService");
const { queueCalendarGeneration, getQueueStatus } = require("../queues/generationQueue");
const creditService = require("../services/creditService");
const { saveSession, loadSession, updateSessionPost } = require("../utils/sessionStore");
const logger = require("../utils/logger");

// ─────────────────────────────────────────────
// POST /generate — Queue-based async generation
// ─────────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  validate(schemas.generateCreatives),
  creditCheck("generate"),
  async (req, res) => {
    try {
      const { calendar_id } = req.body;
      const uid = req.user.uid;

      // Fetch calendar
      const calendar = await getCalendar(calendar_id, uid);
      if (!calendar) {
        return res.status(404).json({ error: "Calendar not found." });
      }

      if (!calendar.approved && initialized) {
        return res.status(400).json({
          error: "Calendar must be approved before generation.",
          hint: "Call POST /calendar/update with approved: true",
        });
      }

      // Fetch brand data
      let brand = {};
      let assets = [];
      if (initialized) {
        const brandDoc = await db.collection("brands").doc(calendar.brand_id).get();
        if (brandDoc.exists) brand = { id: brandDoc.id, ...brandDoc.data() };

        const assetsSnap = await db
          .collection("assets")
          .where("brand_id", "==", calendar.brand_id)
          .get();
        assets = assetsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      // Queue all posts for generation
      const pendingPosts = calendar.posts.filter(
        (p) => p.status === "pending" || p.status === "failed"
      );

      if (pendingPosts.length === 0) {
        return res.json({
          message: "All posts already generated.",
          calendar_id,
          total_posts: calendar.posts.length,
        });
      }

      const jobs = await queueCalendarGeneration(
        uid,
        calendar_id,
        pendingPosts,
        brand,
        assets
      );

      // If queue is unavailable, process synchronously
      const queuedCount = jobs.filter((j) => j && j.jobId).length;

      if (queuedCount === 0) {
        logger.info("Queue unavailable — processing synchronously");
        return await processSynchronously(
          uid,
          calendar_id,
          pendingPosts,
          brand,
          assets,
          res
        );
      }

      res.status(202).json({
        message: "Creative generation started.",
        calendar_id,
        total_jobs: jobs.length,
        queued: queuedCount,
        status: "Processing asynchronously. You will be notified when complete.",
      });
    } catch (err) {
      logger.error("Generate failed", { error: err.message });
      res.status(500).json({ error: "Generation failed.", details: err.message });
    }
  }
);

/**
 * Synchronous fallback when Redis/Queue is unavailable.
 */
async function processSynchronously(uid, calendarId, posts, brand, assets, res) {
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const post of posts) {
    try {
      const prompt = buildPrompt(post, brand, assets);
      const result = await generateImage(
        prompt,
        uid,
        brand.id || "unknown",
        post.id || `post_${posts.indexOf(post) + 1}`,
        1
      );

      // Update Firestore
      if (initialized) {
        await db.collection("posts").doc(post.id).update({
          prompt,
          output_urls: [result.cloudUrl || result.localPath],
          status: "generated",
          generated_at: new Date().toISOString(),
        });
      }

      await creditService.deductAndLog(uid, "generate", {
        post_id: post.id,
        calendar_id: calendarId,
      });

      results.push({
        post_id: post.id,
        status: "generated",
        output_url: result.cloudUrl || result.localPath,
      });
      successCount++;
    } catch (err) {
      logger.error(`Post generation failed`, {
        postId: post.id,
        error: err.message,
      });
      results.push({ post_id: post.id, status: "failed", error: err.message });
      failCount++;
    }
  }

  res.json({
    message: "Creative generation complete (sync mode).",
    calendar_id: calendarId,
    total: posts.length,
    success: successCount,
    failed: failCount,
    results,
  });
}

// ─────────────────────────────────────────────
// GET /generate/status — Queue status
// ─────────────────────────────────────────────
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const status = await getQueueStatus();
    res.json({ queue: status });
  } catch (err) {
    res.status(500).json({ error: "Failed to get queue status." });
  }
});

// ─────────────────────────────────────────────
// Legacy: POST /generate/legacy — Original endpoint
// ─────────────────────────────────────────────
router.post("/legacy", async (req, res) => {
  const {
    brand_name,
    industry,
    target_audience,
    goals,
    num_posts = 5,
    references = [],
    product_images = [],
  } = req.body;

  if (!brand_name || !industry || !target_audience || !goals) {
    return res.status(400).json({
      error: "Missing required fields: brand_name, industry, target_audience, goals",
    });
  }

  logger.info("=== /generate/legacy request ===", { brand_name, num_posts });

  try {
    const OpenAI = require("openai");
    const config = require("../config");
    const openai = new OpenAI({ apiKey: config.openai.apiKey });

    // Generate calendar via OpenAI
    const calResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a social media strategist. Respond with valid JSON only.`,
        },
        {
          role: "user",
          content: `Create ${num_posts} posts for ${brand_name} (${industry}). Target: ${target_audience}. Goals: ${goals}. Return JSON array with: day, post_type, idea, caption, visual_direction`,
        },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    let calendar;
    const parsed = JSON.parse(calResponse.choices[0].message.content);
    calendar = Array.isArray(parsed)
      ? parsed
      : Object.values(parsed).find((v) => Array.isArray(v)) || [parsed];

    // Generate images
    const { buildImagePrompt } = require("../services/promptService");
    const imagePaths = [];
    const imageErrors = [];

    for (let i = 0; i < calendar.length; i++) {
      const post = calendar[i];
      const prompt = buildImagePrompt(
        { brand_name, industry, target_audience, references, product_images },
        post
      );

      try {
        const imagePath = await generateAndSaveImage(prompt, i + 1);
        imagePaths.push(imagePath);
      } catch (imgErr) {
        imagePaths.push(null);
        imageErrors.push({ post_index: i + 1, error: imgErr.message });
      }
    }

    saveSession({
      input: { brand_name, industry, target_audience, references, product_images },
      calendar,
      prompts: calendar.map((p) =>
        buildImagePrompt(
          { brand_name, industry, target_audience, references, product_images },
          p
        )
      ),
      imagePaths,
    });

    const response = { calendar, generated_images: imagePaths };
    if (imageErrors.length) {
      response.image_errors = imageErrors;
      response.warning = "Some images failed.";
    }

    res.json(response);
  } catch (err) {
    logger.error("/generate/legacy failed", { error: err.message });
    res.status(500).json({ error: "Generation failed.", details: err.message });
  }
});

// ─────────────────────────────────────────────
// Legacy: POST /regenerate/legacy
// ─────────────────────────────────────────────
router.post("/regenerate-legacy", async (req, res) => {
  const { post_index, feedback } = req.body;
  if (post_index === undefined) {
    return res.status(400).json({ error: "post_index is required." });
  }
  if (!feedback) {
    return res.status(400).json({ error: "feedback is required." });
  }

  const session = loadSession();
  if (!session) {
    return res.status(404).json({ error: "No active session. Call /generate/legacy first." });
  }

  const idx = post_index - 1;
  if (idx < 0 || idx >= session.calendar.length) {
    return res.status(400).json({ error: `post_index out of range: 1–${session.calendar.length}` });
  }

  try {
    const { buildImagePrompt } = require("../services/promptService");
    const newPrompt = buildImagePrompt(session.input, session.calendar[idx], feedback);
    const newPath = await generateAndSaveImage(newPrompt, post_index);

    updateSessionPost(idx, newPrompt, newPath);

    res.json({
      message: `Post ${post_index} regenerated.`,
      regenerated_image: newPath,
      updated_prompt: newPrompt,
    });
  } catch (err) {
    logger.error("/regenerate-legacy failed", { error: err.message });
    res.status(500).json({ error: "Regeneration failed.", details: err.message });
  }
});

module.exports = router;

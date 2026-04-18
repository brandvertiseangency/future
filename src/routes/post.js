/**
 * Post Routes — regeneration, status updates, multi-platform generation.
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");
const { regeneratePost } = require("../services/regenerationService");
const { getPool } = require("../config/postgres");
const logger = require("../utils/logger");
const { buildSystemPrompt: buildEngineSystemPrompt, buildUserPrompt: buildEngineUserPrompt } = require("../lib/prompt-engine");

// ── In-memory job store (TTL 10 min) — no Redis needed ──────────────
const jobs = new Map();
const JOB_TTL = 10 * 60 * 1000;

// Helpers shared with generateContent.js
const getUserWithBrand = async (uid) => {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.credits, b.id AS brand_id, b.name AS brand_name, b.description,
            b.industry, b.tone, b.styles, b.audience_age_min, b.audience_age_max,
            b.audience_gender, b.audience_interests, b.platforms, b.goals
     FROM users u
     LEFT JOIN brands b ON b.user_id = u.id AND b.is_default = TRUE
     WHERE u.firebase_uid = $1 LIMIT 1`,
    [uid]
  );
  return rows[0] || null;
};

const toneDescriptor = (tone) =>
  tone <= 25 ? 'Casual' : tone <= 50 ? 'Conversational' : tone <= 74 ? 'Balanced' : 'Professional';

const buildSystemPrompt = (user) => {
  // Use the full prompt engine if brand data is available
  try {
    return buildEngineSystemPrompt({
      name: user.brand_name || 'Brand',
      description: user.description || '',
      industry: user.industry || 'general',
      tone: user.tone || 50,
      styles: user.styles || [],
      audienceAgeMin: user.audience_age_min || 18,
      audienceAgeMax: user.audience_age_max || 65,
      audienceGender: user.audience_gender || 'mixed',
      audienceLocation: '',
      audienceInterests: user.audience_interests || [],
      platforms: user.platforms || [],
      goals: user.goals || [],
    });
  } catch {
    // Fallback to simple prompt
    const interests = (user.audience_interests || []).join(', ') || 'general topics';
    const styles = (user.styles || []).join(', ') || 'modern';
    const goals = (user.goals || []).join(', ') || 'growth';
    return `You are a social media expert for ${user.brand_name || 'a brand'}, a ${user.industry || 'general'} brand.\nVoice: ${toneDescriptor(user.tone || 50)}\nStyle: ${styles}\nAudience: ${user.audience_age_min || 18}–${user.audience_age_max || 65}, ${user.audience_gender || 'mixed'}, interested in ${interests}\nGoals: ${goals}\nRespond ONLY with valid JSON: { "caption": "...", "hashtags": ["..."], "imagePrompt": "..." }`;
  }
};

const buildUserPrompt = ({ platform, contentType, brief, mood }, user) => {
  try {
    return buildEngineUserPrompt(
      { platform, contentType: contentType || 'post', brief, mood },
      {
        name: user?.brand_name || 'Brand',
        description: user?.description || '',
        industry: user?.industry || 'general',
        tone: user?.tone || 50,
        styles: user?.styles || [],
        audienceAgeMin: user?.audience_age_min || 18,
        audienceAgeMax: user?.audience_age_max || 65,
        audienceGender: user?.audience_gender || 'mixed',
        audienceLocation: '',
        audienceInterests: user?.audience_interests || [],
        platforms: user?.platforms || [],
        goals: user?.goals || [],
      }
    );
  } catch {
    return `Create a ${contentType || 'post'} for ${platform}. Brief: ${brief}.${mood ? ` Mood: ${mood}.` : ''} Return valid JSON only.`;
  }
};

const callAI = async (systemPrompt, userPrompt) => {
  if (process.env.GOOGLE_AI_API_KEY) {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
    });
    return response.text;
  }
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    });
    return completion.choices[0].message.content;
  }
  // Fallback placeholder
  return JSON.stringify({
    caption: `✨ Exciting content — stay tuned for more from us!`,
    hashtags: ['#brand', '#content', '#marketing'],
    imagePrompt: `Professional social media image`,
  });
};

/**
 * Generate an image using Google Imagen 3 (nano) via the GenAI SDK.
 * Returns a base64 data URL string, or null if generation fails.
 */
const generateImage = async (imagePrompt) => {
  if (!process.env.GOOGLE_AI_API_KEY) return null;
  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg',
      },
    });
    const b64 = response?.generatedImages?.[0]?.image?.imageBytes;
    if (!b64) return null;
    return `data:image/jpeg;base64,${b64}`;
  } catch (err) {
    logger.warn('Imagen generation failed', { error: err.message });
    return null;
  }
};

const parseAIResponse = (raw) => {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw);
    return {
      caption: parsed.caption || '',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      imagePrompt: parsed.imagePrompt || '',
    };
  } catch {
    return { caption: raw.slice(0, 500), hashtags: [], imagePrompt: '' };
  }
};

/**
 * POST /api/post/generate
 * Multi-platform content generation.
 * Accepts: { platforms[], contentType, brief, mood, fontStyle, textOverlay }
 * Returns:  { jobId }  — poll /api/post/status/:jobId for results
 */
router.post('/generate', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });

  const { platforms = [], contentType = 'post', brief, mood } = req.body;
  if (!brief?.trim()) return res.status(400).json({ error: 'brief is required' });
  if (!platforms.length) return res.status(400).json({ error: 'At least one platform is required' });

  const user = await getUserWithBrand(req.user.uid);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const creditCost = platforms.length * 2;
  if (user.credits < creditCost) {
    return res.status(402).json({ error: 'insufficient_credits', creditsRequired: creditCost, creditsAvailable: user.credits });
  }

  // Create job immediately and start async generation
  const jobId = require('crypto').randomUUID();
  jobs.set(jobId, { status: 'processing', outputs: [], createdAt: Date.now() });
  setTimeout(() => jobs.delete(jobId), JOB_TTL);

  res.json({ jobId });

  // Fire-and-forget generation
  (async () => {
    const client = await pool.connect();
    try {
      const systemPrompt = buildSystemPrompt(user);
      const outputs = [];

      for (const platform of platforms) {
        const userPrompt = buildUserPrompt({ platform, contentType, brief, mood }, user);
        const raw = await callAI(systemPrompt, userPrompt);
        const { caption, hashtags, imagePrompt } = parseAIResponse(raw);

        // Generate image with Imagen 3 nano
        const imageUrl = await generateImage(
          `${imagePrompt}. Style: social media ${contentType} for ${platform}. Brand: ${user.brand_name || 'modern brand'}. High quality, professional, no text overlays.`
        );

        await client.query('BEGIN');
        await client.query('UPDATE users SET credits=credits-2, updated_at=NOW() WHERE id=$1', [user.id]);
        // Insert credit transaction — handle both old (reason) and new (description) schema
        try {
          await client.query(
            `INSERT INTO credit_transactions (user_id,amount,type,description) VALUES ($1,-2,'usage',$2)`,
            [user.id, `Generated ${contentType} for ${platform}`]
          );
        } catch {
          await client.query(
            `INSERT INTO credit_transactions (user_id,amount,type,reason) VALUES ($1,-2,'usage',$2)`,
            [user.id, `Generated ${contentType} for ${platform}`]
          );
        }
        const { rows } = await client.query(
          `INSERT INTO posts (user_id,brand_id,platform,content_type,caption,hashtags,status,is_ai_generated,generation_prompt,image_url)
           VALUES ($1,$2,$3,$4,$5,$6,'draft',TRUE,$7,$8) RETURNING *`,
          [user.id, user.brand_id || null, platform, contentType, caption, hashtags,
           JSON.stringify({ brief, mood, imagePrompt }), imageUrl]
        );
        await client.query('COMMIT');

        outputs.push({
          id: rows[0].id,
          platform,
          caption,
          hashtags,
          imageUrl,
          imagePrompt,
          status: 'new',
        });

        // Update job progress after each platform
        const job = jobs.get(jobId);
        if (job) job.outputs = [...outputs];
      }

      const job = jobs.get(jobId);
      if (job) { job.status = 'complete'; job.outputs = outputs; }
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      logger.error('Multi-platform generation failed', { error: err.message });
      const job = jobs.get(jobId);
      if (job) { job.status = 'error'; job.error = err.message; }
    } finally {
      client.release();
    }
  })();
});

/**
 * GET /api/post/status/:jobId
 * Poll generation job status.
 */
router.get('/status/:jobId', authMiddleware, (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found or expired.' });
  res.json({ status: job.status, outputs: job.outputs || [], error: job.error });
});



/**
 * POST /post/regenerate
 * Regenerate a single post with feedback.
 */
router.post(
  "/regenerate",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await regeneratePost(req.user.uid, req.body.post_id, req.body.feedback);
      res.json({ message: "Post regenerated successfully.", ...result });
    } catch (err) {
      logger.error("Regeneration failed", { error: err.message });
      res.status(500).json({ error: "Regeneration failed.", details: err.message });
    }
  }
);

/**
 * GET /post/:id  — get a single post from PostgreSQL
 */
router.get("/:id", authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  try {
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [req.user.uid]);
    const userId = userRows[0]?.id;
    if (!userId) return res.status(404).json({ error: 'User not found.' });
    const { rows } = await pool.query('SELECT * FROM posts WHERE id=$1 AND user_id=$2', [req.params.id, userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post: rows[0] });
  } catch (err) {
    logger.error("Get post failed", { error: err.message });
    res.status(500).json({ error: "Failed to fetch post." });
  }
});

/**
 * PATCH /post/:id/status
 */
router.patch("/:id/status", authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  const allowed = ["draft", "scheduled", "published", "failed"];
  const { status } = req.body;
  if (!allowed.includes(status)) return res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` });
  try {
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [req.user.uid]);
    const userId = userRows[0]?.id;
    if (!userId) return res.status(404).json({ error: 'User not found.' });
    const { rows } = await pool.query(
      'UPDATE posts SET status=$1, updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING *',
      [status, req.params.id, userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });
    res.json({ message: "Post status updated.", post: rows[0] });
  } catch (err) {
    logger.error("Post status update failed", { error: err.message });
    res.status(500).json({ error: "Failed to update post status." });
  }
});

module.exports = router;

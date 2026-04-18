/**
 * AI Content Generation Route — POST /api/generate-content
 * Separate from the legacy queue-based generate.js
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

const getUserWithBrand = async (uid) => {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query(
    `SELECT u.*, b.id AS brand_id, b.name AS brand_name, b.description, b.industry,
            b.tone, b.styles, b.audience_age_min, b.audience_age_max,
            b.audience_gender, b.audience_interests, b.platforms, b.goals
     FROM users u
     LEFT JOIN brands b ON b.user_id = u.id AND b.is_default = TRUE
     WHERE u.firebase_uid = $1 LIMIT 1`,
    [uid]
  );
  return rows[0] || null;
};

const toneDescriptor = (tone) => {
  if (tone <= 25) return 'Casual';
  if (tone <= 50) return 'Conversational';
  if (tone <= 74) return 'Balanced';
  return 'Professional';
};

const buildSystemPrompt = (user) => {
  const interests = (user.audience_interests || []).join(', ') || 'general topics';
  const styles = (user.styles || []).join(', ') || 'modern';
  const goals = (user.goals || []).join(', ') || 'growth';
  return `You are a social media content expert for ${user.brand_name || 'a brand'}, a ${user.industry || 'general'} brand.\n\nBrand voice: ${toneDescriptor(user.tone || 50)} (${user.tone || 50}/100 on casual-to-professional scale)\nStyle: ${styles}\nTarget audience: ${user.audience_age_min || 18}–${user.audience_age_max || 65} year olds, ${user.audience_gender || 'mixed'}, interested in ${interests}\nGoals: ${goals}\n\nGenerate content that is authentic to this brand, uses natural language for the platform, includes relevant hashtags (5–10), and has a clear call-to-action.\n\nAlways respond in valid JSON only, no markdown: { "caption": "...", "hashtags": ["..."], "imagePrompt": "..." }`;
};

const buildUserPrompt = ({ platform, contentType, brief, mood }) =>
  `Create a ${contentType || 'post'} for ${platform}.\nBrief: ${brief || 'General brand content'}\n${mood ? `Mood: ${mood}` : ''}\nPlatform-specific: write in the native style of ${platform} users.\nReturn valid JSON only.`;

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
      model: 'gpt-4o', max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
    });
    return completion.choices[0].message.content;
  }
  throw new Error('No AI provider configured. Set GOOGLE_AI_API_KEY or OPENAI_API_KEY.');
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
    if (!b64) return null;
    return `data:image/jpeg;base64,${b64}`;
  } catch (err) {
    logger.warn('Imagen generation failed', { error: err.message });
    return null;
  }
};

const parseAIResponse = (raw) => {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    return { caption: parsed.caption || '', hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [], imagePrompt: parsed.imagePrompt || '' };
  } catch {
    return { caption: raw.slice(0, 500), hashtags: [], imagePrompt: '' };
  }
};

/** POST /api/generate-content */
router.post('/', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  const client = await pool.connect();
  try {
    const { platform, contentType, brief, mood } = req.body;
    if (!platform) return res.status(400).json({ error: 'platform is required' });
    if (!brief) return res.status(400).json({ error: 'brief is required' });

    const user = await getUserWithBrand(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.credits < 2) {
      return res.status(402).json({ error: 'insufficient_credits', creditsRequired: 2, creditsAvailable: user.credits });
    }

    const systemPrompt = buildSystemPrompt(user);
    const userPrompt = buildUserPrompt({ platform, contentType, brief, mood });
    const raw = await callAI(systemPrompt, userPrompt);
    const { caption, hashtags, imagePrompt } = parseAIResponse(raw);

    // Generate image with Imagen 3 nano
    const imageUrl = await generateImage(
      `${imagePrompt}. Style: social media ${contentType||'post'} for ${platform}. Brand: ${user.brand_name || 'modern brand'}. High quality, professional, no text overlays.`
    );

    await client.query('BEGIN');
    await client.query('UPDATE users SET credits=credits-2, updated_at=NOW() WHERE id=$1', [user.id]);
    try {
      await client.query(
        `INSERT INTO credit_transactions (user_id,amount,type,description) VALUES ($1,-2,'usage',$2)`,
        [user.id, `Generated ${contentType||'post'} for ${platform}`]
      );
    } catch {
      await client.query(
        `INSERT INTO credit_transactions (user_id,amount,type,reason) VALUES ($1,-2,'usage',$2)`,
        [user.id, `Generated ${contentType||'post'} for ${platform}`]
      );
    }
    const { rows: postRows } = await client.query(
      `INSERT INTO posts (user_id,brand_id,platform,content_type,caption,hashtags,status,is_ai_generated,generation_prompt,image_url)
       VALUES ($1,$2,$3,$4,$5,$6,'draft',TRUE,$7,$8) RETURNING *`,
      [user.id, user.brand_id||null, platform, contentType||'post', caption, hashtags,
       JSON.stringify({ brief, mood, imagePrompt }), imageUrl]
    );
    await client.query('COMMIT');

    const { rows: updatedUser } = await pool.query('SELECT credits FROM users WHERE id=$1', [user.id]);
    res.json({ post: postRows[0], creditsRemaining: updatedUser[0]?.credits ?? user.credits - 2, imagePrompt, imageUrl });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('Generate content failed', { error: err.message });
    if (err.message.includes('insufficient_credits')) return res.status(402).json({ error: 'insufficient_credits' });
    res.status(500).json({ error: err.message || 'Content generation failed.' });
  } finally {
    client.release();
  }
});

module.exports = router;

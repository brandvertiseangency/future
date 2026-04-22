/**
 * Brand Chat Route — POST /api/chat/brand
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const { buildSystemPrompt } = require('../lib/prompt-engine');
const logger = require('../utils/logger');

const CHAT_SUFFIX = `

You are this brand's dedicated AI assistant with full knowledge of the brand DNA.
You can: suggest post ideas, write caption hooks, answer strategy questions, recommend content mix, analyse competitors.
You CANNOT generate images directly — direct users to the Generate or Calendar features for that.
Keep responses concise and actionable. When suggesting post ideas give 2–3 specific ready-to-use hooks.
Format lists with line breaks. Never say "as an AI" — you have full brand context.`;

async function getBrandForUser(uid, pool) {
  const { rows } = await pool.query(
    `SELECT b.*, u.id as user_db_id FROM brands b
     JOIN users u ON u.id = b.user_id
     WHERE u.firebase_uid = $1 AND b.is_default = TRUE LIMIT 1`,
    [uid]
  );
  if (!rows[0]) return null;
  const b = rows[0];
  return {
    id: b.id,
    name: b.name,
    industry: b.industry,
    description: b.description,
    tone: b.tone ?? 50,
    styles: b.styles ?? [],
    goals: b.goals ?? [],
    audienceAgeMin: b.audience_age_min,
    audienceAgeMax: b.audience_age_max,
    audienceGender: b.audience_gender,
    audienceInterests: b.audience_interests,
    brandColors: b.brand_colors,
    fontMood: b.font_mood,
    visualVibes: b.visual_vibes,
    visualDNA: b.visual_dna,
    industryConfig: b.industry_config,
    calendarPrefs: b.calendar_prefs,
    usp: b.usp,
    mission: b.mission,
    wordsToUse: b.words_to_use,
    wordsToAvoid: b.words_to_avoid,
    persona: b.brand_persona,
    userDbId: b.user_db_id,
  };
}

async function callGemini(systemPrompt, messages) {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: { systemInstruction: systemPrompt, temperature: 0.8, maxOutputTokens: 600 },
  });
  return result.candidates[0].content.parts[0].text;
}

router.post('/brand', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable' });

  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'No messages provided' });

    const brand = await getBrandForUser(req.user.uid, pool);
    if (!brand) {
      return res.json({ response: "I don't see a brand set up yet. Complete your brand setup to unlock Brand AI!" });
    }

    const systemPrompt = buildSystemPrompt(brand) + CHAT_SUFFIX;
    const response = await callGemini(systemPrompt, messages);

    // Save async (non-blocking)
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
    pool.query(
      `INSERT INTO brand_chat_messages (brand_id, user_id, role, content)
       VALUES ($1,$2,'user',$3),($1,$2,'assistant',$4)`,
      [brand.id, brand.userDbId, lastUserMsg, response]
    ).catch(() => {});

    res.json({ response });
  } catch (err) {
    logger.error('Brand chat error', { error: err.message });
    res.status(500).json({ error: 'chat_failed', message: err.message });
  }
});

module.exports = router;

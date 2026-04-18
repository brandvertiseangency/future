/**
 * Onboarding Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

/** POST /api/onboarding/preview-caption */
router.post('/preview-caption', authMiddleware, async (req, res) => {
  try {
    const { tone, styles, industry } = req.body;
    const toneDescriptor =
      tone <= 25 ? 'Casual' : tone <= 50 ? 'Conversational' : tone <= 74 ? 'Balanced' : 'Professional';

    let caption = '';
    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 200,
        messages: [{ role: 'user', content: `Write a single short social media caption (2-3 sentences, no hashtags) for a ${industry || 'general'} brand with a ${toneDescriptor} tone and ${(styles || []).join(', ')} style. Return only the caption text.` }]
      });
      caption = msg.content[0].text.trim();
    } else if (process.env.OPENAI_API_KEY) {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const comp = await openai.chat.completions.create({
        model: 'gpt-4o', max_tokens: 150,
        messages: [{ role: 'user', content: `Write a single short social media caption (2-3 sentences, no hashtags) for a ${industry || 'general'} brand with a ${toneDescriptor} tone and ${(styles || []).join(', ')} style. Return only the caption text.` }]
      });
      caption = comp.choices[0].message.content.trim();
    } else {
      const samples = { 'Tech & SaaS': "The future isn't coming — it's already here. Building tools that help you move faster, work smarter, and grow without limits.", 'Fashion': "Style is a conversation without words. This season, we're rewriting the rules — one look at a time.", 'Food & Beverage': "Every bite tells a story. We source the finest ingredients so your table becomes a destination.", default: "We believe in doing things differently. Because good enough was never good enough for us — or for you." };
      caption = samples[industry] || samples.default;
    }
    res.json({ caption });
  } catch (err) {
    logger.error('Preview caption failed', { error: err.message });
    res.status(500).json({ error: 'Failed to generate preview caption.' });
  }
});

/** POST /api/onboarding/complete */
router.post('/complete', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  const client = await pool.connect();
  try {
    const { brandName, description, industry, tone, styles, audienceAgeMin, audienceAgeMax,
            audienceGender, audienceLocation, audienceInterests, platforms, goals } = req.body;
    await client.query('BEGIN');
    const { rows: userRows } = await client.query(
      `INSERT INTO users (firebase_uid, email, onboarding_complete, trial_started_at) VALUES ($1,$2,TRUE,NOW())
       ON CONFLICT (firebase_uid) DO UPDATE SET onboarding_complete=TRUE, email=EXCLUDED.email, updated_at=NOW()
       RETURNING *`,
      [req.user.uid, req.user.email]
    );
    const user = userRows[0];
    const { rows: brandRows } = await client.query(
      `INSERT INTO brands (user_id,name,description,industry,tone,styles,audience_age_min,audience_age_max,
         audience_gender,audience_location,audience_interests,platforms,goals,is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE) RETURNING *`,
      [user.id, brandName||'My Brand', description||'', industry||'', tone??50, styles||[],
       audienceAgeMin||18, audienceAgeMax||65, audienceGender||'mixed', audienceLocation||'',
       audienceInterests||[], platforms||[], goals||[]]
    );
    await client.query(`INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);
    await client.query('COMMIT');
    res.json({ user, brand: brandRows[0] });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('Onboarding complete failed', { error: err.message });
    res.status(500).json({ error: 'Failed to save onboarding data.', details: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

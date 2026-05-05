/**
 * Agents — POST /api/agents/generate
 * Text prompts only (no image generation).
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');
const { callAI } = require('../lib/ai');

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many agent generations. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});

async function getBrandContext(pool, firebaseUid) {
  const { rows } = await pool.query(
    `SELECT b.name, b.description, b.industry, b.goals, b.tone, b.styles,
            b.font_mood, b.color_primary, b.color_secondary, b.color_accent, b.tagline
     FROM users u
     JOIN brands b ON b.user_id = u.id AND b.is_default = TRUE
     WHERE u.firebase_uid = $1
     LIMIT 1`,
    [firebaseUid]
  );
  return rows[0] || null;
}

function brandBlock(b) {
  if (!b) return 'No brand record.';
  return [
    `Name: ${b.name || ''}`,
    `Industry: ${b.industry || ''}`,
    `Tagline: ${b.tagline || ''}`,
    `Description: ${b.description || ''}`,
    `Tone (0-100): ${b.tone ?? ''}`,
    `Styles: ${Array.isArray(b.styles) ? b.styles.join(', ') : ''}`,
    `Font mood: ${b.font_mood || ''}`,
    `Colours: ${[b.color_primary, b.color_secondary, b.color_accent].filter(Boolean).join(', ')}`,
    `Goals: ${Array.isArray(b.goals) ? b.goals.join(', ') : ''}`,
  ].join('\n');
}

const SYSTEM =
  'You write structured creative briefs and prompts for humans to paste into external tools. ' +
  'Be specific and actionable. Do not claim you generated images or final designs. ' +
  'Use markdown headings where helpful. No JSON wrapper around the full answer.';

function buildUserPrompt(agentType, brand, body) {
  const b = brandBlock(brand);
  if (agentType === 'website-builder') {
    const goal = body.websiteGoal || 'Showcase the brand and drive enquiries';
    const sections = Array.isArray(body.websiteSections) && body.websiteSections.length
      ? body.websiteSections.join(', ')
      : 'Hero, value props, social proof, features, FAQ, primary CTA';
    return `${b}\n\n---\nTask: Landing page / site copy structure.\nPrimary goal: ${goal}\nSections to cover: ${sections}\n\nProduce ONE long prompt a user can paste into Framer AI, Webflow, or similar: include IA outline, section headlines, microcopy notes, CTA strategy, and mobile considerations.`;
  }
  if (agentType === 'branding-kit') {
    const format = body.brandingFormat || 'poster';
    const occasion = body.brandingOccasion || '';
    const extra = body.brandingText || '';
    return `${b}\n\n---\nTask: Branding asset brief.\nFormat: ${format}\nOccasion or campaign: ${occasion}\nText to include on artwork (if any): ${extra}\n\nProduce a detailed image-generation style prompt (for tools like Midjourney / Firefly / Imagen-style briefs) plus short headline and subcopy suggestions. Specify layout, palette from brand, typography mood, and print/digital constraints.`;
  }
  if (agentType === 'presentations') {
    const purpose = body.presentationPurpose || 'company profile';
    const audience = body.presentationAudience || 'business stakeholders';
    const highlights = body.presentationHighlights || '';
    const deck = body.deckType || 'company-profile';
    return `${b}\n\n---\nTask: Presentation / deck outline.\nDeck type: ${deck}\nPurpose: ${purpose}\nAudience: ${audience}\nKey points to stress: ${highlights}\n\nReturn slide-by-slide outline (10–14 slides). For each slide: title, 2–4 bullet speaker notes, and visual direction. End with a one-paragraph AI prompt to expand slide 1 body copy.`;
  }
  return null;
}

router.post('/generate', authMiddleware, generateLimiter, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  try {
    const { agentType } = req.body || {};
    const allowed = ['website-builder', 'branding-kit', 'presentations'];
    if (!allowed.includes(String(agentType))) {
      return res.status(400).json({ error: 'agentType is invalid' });
    }
    const brand = await getBrandContext(pool, req.user.uid);
    if (!brand) {
      return res.status(404).json({ error: 'no_brand', message: 'Complete brand setup before using agents.' });
    }
    const userPrompt = buildUserPrompt(agentType, brand, req.body);
    if (!userPrompt) {
      return res.status(400).json({ error: 'invalid_agent_type' });
    }
    const prompt = await callAI({ system: SYSTEM, user: userPrompt }, { maxTokens: 2500, timeoutMs: 120_000 });
    const text = String(prompt || '').trim();
    if (!text) {
      return res.status(503).json({ error: 'empty_response', message: 'AI returned no text. Try again.' });
    }
    res.json({ prompt: text });
  } catch (err) {
    logger.error('Agent generate failed', { error: err.message, agentType: req.body?.agentType });
    if (err.message === 'AI_TIMEOUT') {
      return res.status(503).json({ error: 'AI_TIMEOUT', message: 'Generation timed out. Please try again.' });
    }
    res.status(500).json({ error: 'agent_generate_failed', message: err.message });
  }
});

module.exports = router;

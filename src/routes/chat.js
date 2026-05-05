/**
 * Brand Chat Route — POST /api/chat/brand
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const { callAI } = require('../lib/ai');
const { buildSystemPrompt } = require('../lib/prompt-engine');
const logger = require('../utils/logger');

const CHAT_SUFFIX = `

You are this brand's dedicated AI assistant with full knowledge of the brand DNA.
You can: suggest post ideas, write caption hooks, answer strategy questions, recommend content mix, analyse competitors.
You CANNOT generate images directly — direct users to the Generate or Calendar features for that.
Keep responses concise and actionable. When suggesting post ideas give 2–3 specific ready-to-use hooks.
Format lists with line breaks. Never say "as an AI" — you have full brand context.`;

function removeJsonOnlyDirectives(systemPrompt) {
  if (!systemPrompt) return '';
  return systemPrompt
    .replace(/- Always respond with valid JSON only[^\n]*\n?/gi, '')
    .replace(/- JSON format:[^\n]*\n?/gi, '')
    .trim();
}

function normalizeChatResponse(raw) {
  if (raw && typeof raw === 'object') {
    const parsed = raw;
    if (Array.isArray(parsed)) return parsed.map((x) => `- ${String(x)}`).join('\n');
    if (parsed.postIdeas && Array.isArray(parsed.postIdeas)) {
      const lines = parsed.postIdeas.slice(0, 3).map((p, i) => {
        const caption = p.caption || p.idea || p.post_idea || 'Post idea';
        return `${i + 1}. ${caption}`;
      });
      return `Here are strong options:\n${lines.join('\n')}`;
    }
    if (parsed.caption || parsed.imagePrompt) {
      return [parsed.caption ? `Caption: ${parsed.caption}` : '', parsed.imagePrompt ? `Visual direction: ${parsed.imagePrompt}` : '']
        .filter(Boolean)
        .join('\n');
    }
    return 'I generated a structured response. Tell me if you want ideas, captions, or a monthly plan and I will format it conversationally.';
  }

  const text = String(raw || '').trim();
  if (!(text.startsWith('{') || text.startsWith('['))) return text;
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((x) => `- ${String(x)}`).join('\n');
    if (parsed.postIdeas && Array.isArray(parsed.postIdeas)) {
      const lines = parsed.postIdeas.slice(0, 3).map((p, i) => {
        const caption = p.caption || p.idea || p.post_idea || 'Post idea';
        return `${i + 1}. ${caption}`;
      });
      return `Here are strong options:\n${lines.join('\n')}`;
    }
    if (parsed.caption || parsed.imagePrompt) {
      return [parsed.caption ? `Caption: ${parsed.caption}` : '', parsed.imagePrompt ? `Visual direction: ${parsed.imagePrompt}` : '']
        .filter(Boolean)
        .join('\n');
    }
    return 'I generated a structured response. Tell me if you want ideas, captions, or a monthly plan and I will format it conversationally.';
  } catch {
    return text;
  }
}

async function getBrandForUser(uid, pool) {
  const { rows } = await pool.query(
    `SELECT b.*, u.id as user_db_id,
            bsp.extracted_colors, bsp.font_mood_detected, bsp.layout_style,
            bsp.photography_style, bsp.mood_keywords, bsp.composition_style,
            bsp.dominant_aesthetic, bsp.reference_image_urls,
            bic.industry_answers AS bic_industry_answers,
            ccp.weekly_post_count, ccp.content_type_mix, ccp.active_platforms, ccp.preferred_posting_times
     FROM brands b
     JOIN users u ON u.id = b.user_id
     LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
     LEFT JOIN brand_industry_configs bic ON bic.brand_id = b.id
     LEFT JOIN content_calendar_preferences ccp ON ccp.brand_id = b.id
     WHERE u.firebase_uid = $1 AND b.is_default = TRUE LIMIT 1`,
    [uid]
  );
  if (!rows[0]) return null;
  const b = rows[0];
  const industryAnswers =
    b.bic_industry_answers &&
    typeof b.bic_industry_answers === 'object' &&
    !Array.isArray(b.bic_industry_answers)
      ? b.bic_industry_answers
      : null;
  const visualDNA =
    b.dominant_aesthetic ||
    (b.mood_keywords && b.mood_keywords.length) ||
    (b.extracted_colors && b.extracted_colors.length) ||
    b.photography_style
      ? {
          colorPalette: Array.isArray(b.extracted_colors) ? b.extracted_colors : [],
          aestheticStyle: b.dominant_aesthetic || undefined,
          moodKeywords: Array.isArray(b.mood_keywords) ? b.mood_keywords : [],
          contentStyle: b.photography_style || undefined,
          designElements: [b.layout_style, b.composition_style].filter(Boolean),
        }
      : null;
  const calendarPrefs =
    b.weekly_post_count != null || b.content_type_mix || (b.active_platforms && b.active_platforms.length)
      ? {
          postsPerWeek: b.weekly_post_count,
          contentMix: b.content_type_mix,
          primaryPlatforms: b.active_platforms,
          bestTimes: b.preferred_posting_times,
        }
      : null;
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
    audienceLocation: b.audience_location,
    brandColors: [b.color_primary, b.color_secondary, b.color_accent].filter(Boolean),
    fontMood: b.font_mood || b.font_mood_detected,
    usp: b.usp_keywords,
    wordsToAvoid: b.words_to_avoid,
    wordsToUse: b.words_to_use,
    persona: b.brand_persona,
    mission: b.brand_mission || b.mission,
    competitors: b.competitor_brands || b.competitors,
    painPoints: b.pain_points,
    motivations: b.audience_motivations || b.motivations,
    userDbId: b.user_db_id,
    visualDNA,
    industryConfig: industryAnswers,
    calendarPrefs,
  };
}

async function callClaude(systemPrompt, messages) {
  const { callAI } = require('../lib/ai');
  const history = messages.slice(0, -1).map(m => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`).join('\n');
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const userContent = history ? `${history}\nUser: ${lastUserMsg}` : lastUserMsg;
  return callAI({ system: systemPrompt, user: userContent }, { maxTokens: 600 });
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

    const systemPrompt = `${removeJsonOnlyDirectives(buildSystemPrompt(brand))}\n\n${CHAT_SUFFIX}`;
    const response = normalizeChatResponse(await callClaude(systemPrompt, messages));

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

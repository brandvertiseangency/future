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
    `SELECT u.*, 
            b.id AS brand_id, b.name AS brand_name, b.description, b.industry,
            b.tone, b.styles, b.audience_age_min, b.audience_age_max,
            b.audience_gender, b.audience_interests, b.audience_location,
            b.platforms, b.goals,
            b.color_primary, b.color_secondary, b.color_accent, b.font_mood,
            b.industry_subtype, b.price_segment,
            b.usp_keywords,
            -- brand style profile (from vision-analysed reference images)
            bsp.extracted_colors, bsp.font_mood_detected, bsp.layout_style,
            bsp.photography_style, bsp.mood_keywords, bsp.composition_style,
            bsp.dominant_aesthetic, bsp.reference_image_urls,
            -- industry config
            bic.usp_keywords AS industry_usp, bic.industry_answers,
            -- calendar prefs
            ccp.weekly_post_count, ccp.content_type_mix, ccp.active_platforms
     FROM users u
     LEFT JOIN brands b ON b.user_id = u.id AND b.is_default = TRUE
     LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
     LEFT JOIN brand_industry_configs bic ON bic.brand_id = b.id
     LEFT JOIN content_calendar_preferences ccp ON ccp.brand_id = b.id
     WHERE u.firebase_uid = $1 LIMIT 1`,
    [uid]
  );
  return rows[0] || null;
};

const { buildSystemPrompt: buildSystemPromptV2, buildUserPrompt: buildUserPromptV2, getToneTemperature } = require('../lib/prompt-engine');

const toneDescriptor = (tone) => {
  if (tone <= 25) return 'Casual';
  if (tone <= 50) return 'Conversational';
  if (tone <= 74) return 'Balanced';
  return 'Professional';
};

const buildSystemPrompt = (user) => {
  // Map flat DB row → full brand intelligence shape expected by prompt-engine.js
  const brand = {
    name: user.brand_name,
    industry: user.industry,
    description: user.description,
    tone: user.tone || 50,
    styles: user.styles || [],
    goals: user.goals || [],
    // Audience
    audienceAgeMin: user.audience_age_min,
    audienceAgeMax: user.audience_age_max,
    audienceGender: user.audience_gender,
    audienceInterests: user.audience_interests,
    audienceLocation: user.audience_location,
    // Visual identity — from onboarding
    brandColors: [user.color_primary, user.color_secondary, user.color_accent].filter(Boolean),
    fontMood: user.font_mood,
    // Visual DNA — from Gemini Vision analysis of reference images
    visualDNA: (user.dominant_aesthetic || user.mood_keywords?.length || user.extracted_colors?.length) ? {
      colorPalette: user.extracted_colors || [],
      aestheticStyle: user.dominant_aesthetic || null,
      moodKeywords: user.mood_keywords || [],
      designElements: user.layout_style ? [user.layout_style] : [],
      contentStyle: user.photography_style || null,
    } : null,
    // Industry config
    usp: user.usp_keywords || user.industry_usp,
    industrySubtype: user.industry_subtype,
    priceSegment: user.price_segment,
    // Calendar prefs
    calendarPrefs: user.weekly_post_count ? {
      postsPerWeek: user.weekly_post_count,
      primaryPlatforms: user.active_platforms || [],
      contentMix: user.content_type_mix || {},
    } : null,
  };
  return buildSystemPromptV2(brand);
};

const { callAI, generateImage } = require('../lib/ai');

const buildUserPrompt = ({ platform, contentType, brief, mood, theme, campaign }, brand) =>
  buildUserPromptV2({ platform, contentType, brief, mood, theme, campaign }, brand || {});

const callAIWrapped = async (systemPrompt, userPrompt) => {
  return callAI({ system: systemPrompt, user: userPrompt }, { maxTokens: 1400 });
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
    const { platform, contentType, brief, mood, theme, campaign, ratio } = req.body;
    if (!platform) return res.status(400).json({ error: 'platform is required' });
    if (!brief) return res.status(400).json({ error: 'brief is required' });

    const user = await getUserWithBrand(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.credits < 2) {
      return res.status(402).json({ error: 'insufficient_credits', creditsRequired: 2, creditsAvailable: user.credits });
    }

    const systemPrompt = buildSystemPrompt(user);
    const brand = {
      name: user.brand_name, industry: user.industry, goals: user.goals || [],
      tone: user.tone || 50, styles: user.styles || [],
    };
    const userPrompt = buildUserPrompt({ platform, contentType, brief, mood, theme, campaign }, brand);
    let raw;
    try {
      raw = await callAIWrapped(systemPrompt, userPrompt);
    } catch (aiErr) {
      logger.error('AI call failed in generate-content', { error: aiErr.message });
      if (aiErr.message === 'AI_TIMEOUT') return res.status(503).json({ error: 'Generation timed out. The AI is busy — please try again.' });
      return res.status(503).json({ error: 'AI service unavailable. Please try again shortly.' });
    }
    const { caption, hashtags, imagePrompt } = parseAIResponse(raw);

    // Build a rich image prompt using brand visual DNA + AI-generated imagePrompt
    const brandColors = [user.color_primary, user.color_secondary, user.color_accent].filter(Boolean);
    const visualDNAParts = [];
    if (brandColors.length) visualDNAParts.push(`Brand color palette: ${brandColors.join(', ')}`);
    if (user.font_mood) visualDNAParts.push(`Typography mood: ${user.font_mood}`);
    if (user.dominant_aesthetic) visualDNAParts.push(`Aesthetic: ${user.dominant_aesthetic}`);
    if (user.photography_style) visualDNAParts.push(`Photography style: ${user.photography_style}`);
    if (user.mood_keywords?.length) visualDNAParts.push(`Mood: ${user.mood_keywords.join(', ')}`);
    if (user.extracted_colors?.length) visualDNAParts.push(`Detected palette: ${user.extracted_colors.join(', ')}`);

    const baseImagePrompt = imagePrompt || `${brief} — ${contentType || 'post'} for ${user.brand_name || 'brand'} on ${platform}`;

    const enrichedImagePrompt = [
      baseImagePrompt,
      visualDNAParts.length ? `\nBRAND VISUAL IDENTITY:\n${visualDNAParts.join('. ')}` : '',
      `\nFormat: social media ${contentType || 'post'} for ${platform}.`,
      `Brand: ${user.brand_name || 'modern brand'}.`,
      'High quality, professional, photorealistic, no text overlays, no watermarks.',
    ].filter(Boolean).join(' ');

    // Generate image — use ratio from request, fallback to content-type logic
    const aspectRatio = ratio || (contentType === 'reel' || contentType === 'story' ? '9:16' : '1:1');
    const imageUrl = await generateImage(enrichedImagePrompt, { aspectRatio });

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
    if (err.message === 'AI_TIMEOUT') return res.status(503).json({ error: 'Generation timed out. The AI is busy — please try again.' });
    if (err.message.includes('insufficient_credits')) return res.status(402).json({ error: 'insufficient_credits' });
    res.status(500).json({ error: err.message || 'Content generation failed.' });
  } finally {
    client.release();
  }
});

module.exports = router;

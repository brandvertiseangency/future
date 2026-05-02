/**
 * Onboarding Routes — v2
 * Includes: preview-caption, vision analysis, and complete onboarding
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');
const { analyseReferenceImages } = require('../lib/vision-analyser');
const { sanitizeLogoUrlForDb } = require('../utils/sanitizeLogoUrl');

/** POST /api/onboarding/preview-caption */
router.post('/preview-caption', authMiddleware, async (req, res) => {
  try {
    const { tone, styles, industry } = req.body;
    const toneDescriptor =
      tone <= 20 ? 'Very casual, like texting a friend' :
      tone <= 40 ? 'Conversational and warm' :
      tone <= 60 ? 'Balanced — friendly but credible' :
      tone <= 80 ? 'Professional and authoritative' : 'Very professional and formal';

    const promptText = `Write a single short social media caption (2-3 sentences, no hashtags) for a ${industry || 'general'} brand with a ${toneDescriptor} tone and ${(styles || []).join(', ') || 'professional'} personality. Return only the caption text.`;

    let caption = '';
    const { callAI } = require('../lib/ai');
    caption = (await callAI(promptText, { maxTokens: 150 })).trim();
    res.json({ caption });
  } catch (err) {
    logger.error('Preview caption failed', { error: err.message });
    res.status(500).json({ error: 'Failed to generate preview caption.' });
  }
});

/** POST /api/onboarding/vision/analyse-references */
router.post('/vision/analyse-references', authMiddleware, async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }
    const styleProfile = await analyseReferenceImages(images);
    res.json({ styleProfile });
  } catch (err) {
    logger.error('Vision analysis error', { error: err.message });
    res.status(500).json({ error: 'Analysis failed', message: err.message });
  }
});

/** POST /api/onboarding/complete — v2 with brand intelligence tables */
router.post('/complete', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  const client = await pool.connect();
  try {
    const {
      brandName, description, industry, industryLabel, tone, styles,
      audienceAgeMin, audienceAgeMax, audienceGender, audienceLocation,
      audienceInterests, platforms, goals,
      // brand info fields
      tagline, website, phone, address, logoUrl,
      // v2 fields
      colorPrimary, colorSecondary, colorAccent, fontMood,
      priceSegment, industrySubtype, uspKeywords, industryAnswers,
      weeklyPostCount, contentMix, preferredPostingTimes, activePlatforms, autoSchedule,
      extractedStyleProfile, referenceImageUrls,
    } = req.body;

    if (!brandName || !String(brandName).trim()) {
      return res.status(400).json({ error: 'brandName is required.' });
    }
    if (!industry || !String(industry).trim()) {
      return res.status(400).json({ error: 'industry is required.' });
    }
    const normalizedPlatforms = Array.isArray(activePlatforms) && activePlatforms.length
      ? activePlatforms
      : (Array.isArray(platforms) ? platforms : []);
    const normalizedPostingTimes = Array.isArray(preferredPostingTimes)
      ? preferredPostingTimes
      : ['09:00', '18:00'];
    const mixTotal = contentMix && typeof contentMix === 'object'
      ? Object.values(contentMix).reduce((sum, value) => sum + (Number(value) || 0), 0)
      : 0;
    const missingBySection = {
      brand: [
        !brandName || !String(brandName).trim() ? 'brandName' : null,
        !description || String(description).trim().length < 10 ? 'description' : null,
      ].filter(Boolean),
      personality: [
        !Array.isArray(styles) || styles.length === 0 ? 'styles' : null,
        Number(tone) < 0 || Number(tone) > 100 ? 'tone' : null,
      ].filter(Boolean),
      audience: [
        !audienceLocation || !String(audienceLocation).trim() ? 'audienceLocation' : null,
        !Array.isArray(audienceInterests) || audienceInterests.length === 0 ? 'audienceInterests' : null,
      ].filter(Boolean),
      goals: [
        !Array.isArray(goals) || goals.length === 0 ? 'goals' : null,
      ].filter(Boolean),
      industryConfig: [
        !industry || !String(industry).trim() ? 'industry' : null,
        !industryAnswers || Object.keys(industryAnswers).length === 0 ? 'industryAnswers' : null,
      ].filter(Boolean),
      calendar: [
        !Array.isArray(normalizedPlatforms) || normalizedPlatforms.length === 0 ? 'activePlatforms' : null,
        mixTotal !== 100 ? 'contentMix' : null,
      ].filter(Boolean),
    };
    const hasMissing = Object.values(missingBySection).some((fields) => fields.length > 0);
    if (hasMissing) {
      return res.status(422).json({
        error: 'ONBOARDING_INCOMPLETE',
        message: 'Complete required onboarding sections before generation.',
        missingBySection,
      });
    }

    await client.query('BEGIN');

    // Upsert user
    const { rows: userRows } = await client.query(
      `INSERT INTO users (firebase_uid, email, onboarding_complete, trial_started_at) VALUES ($1,$2,TRUE,NOW())
       ON CONFLICT (firebase_uid) DO UPDATE SET onboarding_complete=TRUE, email=EXCLUDED.email, updated_at=NOW()
       RETURNING *`,
      [req.user.uid, req.user.email]
    );
    const user = userRows[0];

    // Upsert brand with v2 columns
    const { rows: brandRows } = await client.query(
      `INSERT INTO brands (user_id, name, description, industry, tone, styles,
         audience_age_min, audience_age_max, audience_gender, audience_location,
         audience_interests, platforms, goals, is_default,
         color_primary, color_secondary, color_accent, font_mood,
         industry_subtype, price_segment, posting_frequency, content_mix,
         platform_priority, onboarding_version,
         tagline, website, phone, address, logo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE,$14,$15,$16,$17,$18,$19,$20,$21,$22,2,$23,$24,$25,$26,$27)
       ON CONFLICT (user_id) WHERE is_default = TRUE
       DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description, industry = EXCLUDED.industry,
         tone = EXCLUDED.tone, styles = EXCLUDED.styles,
         audience_age_min = EXCLUDED.audience_age_min, audience_age_max = EXCLUDED.audience_age_max,
         audience_gender = EXCLUDED.audience_gender, audience_location = EXCLUDED.audience_location,
         audience_interests = EXCLUDED.audience_interests, platforms = EXCLUDED.platforms,
         goals = EXCLUDED.goals,
         color_primary = EXCLUDED.color_primary, color_secondary = EXCLUDED.color_secondary,
         color_accent = EXCLUDED.color_accent, font_mood = EXCLUDED.font_mood,
         industry_subtype = EXCLUDED.industry_subtype, price_segment = EXCLUDED.price_segment,
         posting_frequency = EXCLUDED.posting_frequency, content_mix = EXCLUDED.content_mix,
         platform_priority = EXCLUDED.platform_priority, onboarding_version = 2,
         tagline = EXCLUDED.tagline, website = EXCLUDED.website,
         phone = EXCLUDED.phone, address = EXCLUDED.address,
         logo_url = COALESCE(EXCLUDED.logo_url, brands.logo_url),
         updated_at = NOW()
       RETURNING *`,
      [
        user.id, brandName || 'My Brand', description || '', industry || '', tone ?? 50,
        styles || [], audienceAgeMin || 22, audienceAgeMax || 45,
        audienceGender || 'mixed', audienceLocation || '',
        audienceInterests || [], normalizedPlatforms, goals || [],
        colorPrimary || null, colorSecondary || null, colorAccent || null, fontMood || null,
        industrySubtype || null, priceSegment || null, weeklyPostCount || 4,
        contentMix ? JSON.stringify(contentMix) : null,
        normalizedPlatforms,
        tagline || null, website || null, phone || null, address || null, sanitizeLogoUrlForDb(logoUrl),
      ]
    );
    const brand = brandRows[0];

    // Save brand style profile if we have extracted data
    if (extractedStyleProfile && brand) {
      await client.query(
        `INSERT INTO brand_style_profiles (brand_id, extracted_colors, font_mood_detected,
           layout_style, photography_style, mood_keywords, composition_style,
           text_density, dominant_aesthetic, reference_image_urls, raw_vision_response)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (brand_id) DO UPDATE SET
           extracted_colors = EXCLUDED.extracted_colors,
           font_mood_detected = EXCLUDED.font_mood_detected,
           layout_style = EXCLUDED.layout_style,
           photography_style = EXCLUDED.photography_style,
           mood_keywords = EXCLUDED.mood_keywords,
           composition_style = EXCLUDED.composition_style,
           text_density = EXCLUDED.text_density,
           dominant_aesthetic = EXCLUDED.dominant_aesthetic,
           reference_image_urls = EXCLUDED.reference_image_urls,
           raw_vision_response = EXCLUDED.raw_vision_response,
           analysed_at = NOW()`,
        [
          brand.id,
          extractedStyleProfile.extractedColors || [],
          extractedStyleProfile.fontMoodDetected || null,
          extractedStyleProfile.layoutStyle || null,
          extractedStyleProfile.photographyStyle || null,
          extractedStyleProfile.moodKeywords || [],
          extractedStyleProfile.compositionStyle || null,
          extractedStyleProfile.textDensity || null,
          extractedStyleProfile.dominantAesthetic || null,
          referenceImageUrls || [],
          JSON.stringify(extractedStyleProfile),
        ]
      );
    }

    // Save industry config
    if (industry && brand) {
      await client.query(
        `INSERT INTO brand_industry_configs (brand_id, industry, subtype, price_segment,
           usp_keywords, industry_answers)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (brand_id) DO UPDATE SET
           industry = EXCLUDED.industry, subtype = EXCLUDED.subtype,
           price_segment = EXCLUDED.price_segment, usp_keywords = EXCLUDED.usp_keywords,
           industry_answers = EXCLUDED.industry_answers, updated_at = NOW()`,
        [
          brand.id, industry, industrySubtype || null, priceSegment || null,
          uspKeywords || [], JSON.stringify(industryAnswers || {}),
        ]
      );
    }

    // Save calendar preferences
    if (brand) {
      await client.query(
        `INSERT INTO content_calendar_preferences (brand_id, weekly_post_count, content_type_mix,
           auto_schedule, active_platforms, preferred_posting_times)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (brand_id) DO UPDATE SET
           weekly_post_count = EXCLUDED.weekly_post_count,
           content_type_mix = EXCLUDED.content_type_mix,
           auto_schedule = EXCLUDED.auto_schedule,
           active_platforms = EXCLUDED.active_platforms,
           preferred_posting_times = EXCLUDED.preferred_posting_times,
           updated_at = NOW()`,
        [
          brand.id, weeklyPostCount || 4,
          contentMix ? JSON.stringify(contentMix) : JSON.stringify({ promotional: 30, educational: 25, testimonial: 20, bts: 15, festive: 10 }),
          autoSchedule || false,
          normalizedPlatforms,
          normalizedPostingTimes,
        ]
      );
    }

    await client.query(`INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);
    await client.query('COMMIT');
    res.json({ user, brand, success: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('Onboarding complete failed', { error: err.message });
    res.status(500).json({ error: 'Failed to save onboarding data.', details: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

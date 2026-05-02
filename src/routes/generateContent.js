/**
 * AI Content Generation Route — POST /api/generate-content
 * Separate from the legacy queue-based generate.js
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');
const { persistGeneratedImageToStorage, stringifyPromptPayload } = require('../lib/generatedImageStore');
const { deductByUserIdAndLog } = require('../services/creditService');

const getUserWithBrand = async (uid) => {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query(
    `SELECT u.*, 
            b.id AS brand_id, b.name AS brand_name, b.description, b.industry,
            b.logo_url, b.website, b.phone, b.address,
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

const getPrimaryProductReferenceImages = async (pool, userId, brandId) => {
  try {
    const { rows } = await pool.query(
      `SELECT images, is_primary
       FROM brand_products
       WHERE user_id=$1 AND ($2::uuid IS NULL OR brand_id=$2 OR brand_id IS NULL)
       ORDER BY is_primary DESC, created_at ASC
       LIMIT 5`,
      [userId, brandId || null]
    );
    const images = [];
    for (const row of rows || []) {
      if (Array.isArray(row.images)) images.push(...row.images.slice(0, 1));
    }
    return images.filter(Boolean).slice(0, 3);
  } catch {
    return [];
  }
};

const getProductById = async (pool, userId, brandId, productId) => {
  if (!productId) return null;
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, price, category, tags, images, visual_description
       FROM brand_products
       WHERE id=$1 AND user_id=$2 AND ($3::uuid IS NULL OR brand_id=$3 OR brand_id IS NULL)
       LIMIT 1`,
      [productId, userId, brandId || null]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
};

const getBrandReferenceImages = async (pool, userId, brandId) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.logo_url, bsp.reference_image_urls
       FROM brands b
       LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
       WHERE b.user_id=$1 AND ($2::uuid IS NULL OR b.id=$2)
       ORDER BY b.is_default DESC, b.created_at ASC
       LIMIT 1`,
      [userId, brandId || null]
    );
    const row = rows[0];
    if (!row) return [];
    const refs = [];
    if (row.logo_url) refs.push(row.logo_url);
    if (Array.isArray(row.reference_image_urls)) refs.push(...row.reference_image_urls.filter(Boolean));
    return refs.slice(0, 3);
  } catch {
    return [];
  }
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

const { callAI, generateImageDetailed, parseAiJsonLoose } = require('../lib/ai');

const buildUserPrompt = ({ platform, contentType, brief, mood, theme, campaign }, brand) =>
  buildUserPromptV2({ platform, contentType, brief, mood, theme, campaign }, brand || {});

const callAIWrapped = async (systemPrompt, userPrompt) => {
  return callAI({ system: systemPrompt, user: userPrompt }, { maxTokens: 1400 });
};

const parseAIResponse = (raw) => {
  try {
    const parsed = parseAiJsonLoose(raw);
    return {
      caption: parsed.caption || parsed.caption_draft || parsed.copy || parsed.text || '',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      imagePrompt: parsed.imagePrompt || parsed.image_prompt || parsed.visualPrompt || '',
    };
  } catch {
    return { caption: raw.slice(0, 500), hashtags: [], imagePrompt: '' };
  }
};

const isWeakImagePrompt = (text = '') => {
  const t = String(text || '').toLowerCase().trim();
  if (!t || t.length < 40) return true;
  const genericSignals = [
    'professional social media image',
    'create an image',
    'high quality image',
    'post for',
    'for instagram',
    'for linkedin',
    'slot_creative',
    'user_approved',
    'product_context',
    'creative_brief',
    'placeholder',
    '_brief',
    'lot_creative',
  ];
  return genericSignals.some((s) => t.includes(s));
};

/** POST /api/generate-content */
router.post('/', authMiddleware, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
  const client = await pool.connect();
  try {
    const { platform, contentType, brief, mood, theme, campaign, ratio, selectedProductId } = req.body;
    const allowedPlatforms = ['instagram', 'facebook', 'linkedin', 'x', 'twitter', 'tiktok', 'youtube', 'pinterest'];
    const allowedContentTypes = ['post', 'reel', 'carousel', 'story'];
    const allowedRatios = ['1:1', '4:5', '9:16', '16:9'];
    if (!platform || !allowedPlatforms.includes(String(platform).toLowerCase())) {
      return res.status(400).json({ error: 'platform is invalid' });
    }
    if (!brief || String(brief).trim().length < 8) {
      return res.status(400).json({ error: 'brief must be at least 8 characters' });
    }
    if (contentType && !allowedContentTypes.includes(String(contentType).toLowerCase())) {
      return res.status(400).json({ error: 'contentType is invalid' });
    }
    if (ratio && !allowedRatios.includes(String(ratio))) {
      return res.status(400).json({ error: 'ratio is invalid' });
    }

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
    const parsed = parseAIResponse(raw);
    const caption = String(parsed.caption || '').trim() || String(brief || '').trim() || 'New post idea';
    const hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];
    const imagePrompt = parsed.imagePrompt;

    // Build a rich image prompt using brand visual DNA + AI-generated imagePrompt
    const brandColors = [user.color_primary, user.color_secondary, user.color_accent].filter(Boolean);
    const visualDNAParts = [];
    if (brandColors.length) visualDNAParts.push(`Brand color palette: ${brandColors.join(', ')}`);
    if (user.font_mood) visualDNAParts.push(`Typography mood: ${user.font_mood}`);
    if (user.dominant_aesthetic) visualDNAParts.push(`Aesthetic: ${user.dominant_aesthetic}`);
    if (user.photography_style) visualDNAParts.push(`Photography style: ${user.photography_style}`);
    if (user.mood_keywords?.length) visualDNAParts.push(`Mood: ${user.mood_keywords.join(', ')}`);
    if (user.extracted_colors?.length) visualDNAParts.push(`Detected palette: ${user.extracted_colors.join(', ')}`);

    const selectedProduct = await getProductById(pool, user.id, user.brand_id || null, selectedProductId || null);
    const selectedProductBlock = selectedProduct ? [
      `Selected product (must match exact look): ${selectedProduct.name}`,
      selectedProduct.description ? `Description: ${selectedProduct.description}` : '',
      selectedProduct.visual_description ? `Visual details to preserve: ${selectedProduct.visual_description}` : '',
      selectedProduct.category ? `Category: ${selectedProduct.category}` : '',
      selectedProduct.price ? `Price: ${selectedProduct.price}` : '',
    ].filter(Boolean).join('\n') : '';

    const captionDrivenPrompt = [
      `SCENE TO VISUALIZE (anchor strictly to this caption): ${caption}`,
      'Render a concrete real-world scene that directly matches the hook, value, and CTA context.',
      'Do not drift to unrelated lifestyle imagery.',
    ].join(' ');

    const baseImagePrompt = !isWeakImagePrompt(imagePrompt)
      ? imagePrompt
      : `${captionDrivenPrompt} Brief context: ${brief}. Format: ${contentType || 'post'} on ${platform}.`;

    const primaryRefs = await getPrimaryProductReferenceImages(pool, user.id, user.brand_id || null);
    const brandRefs = await getBrandReferenceImages(pool, user.id, user.brand_id || null);
    const selectedRefs = Array.isArray(selectedProduct?.images) ? selectedProduct.images.filter(Boolean).slice(0, 3) : [];
    const referenceImageUrls = [...selectedRefs, ...brandRefs, ...primaryRefs].filter(Boolean).slice(0, 3);

    const enrichedImagePrompt = [
      baseImagePrompt,
      visualDNAParts.length ? `\nBRAND VISUAL IDENTITY:\n${visualDNAParts.join('. ')}` : '',
      user.website ? `\nBrand website: ${user.website}` : '',
      user.phone ? `\nBrand phone: ${user.phone}` : '',
      user.address ? `\nBrand address: ${user.address}` : '',
      selectedProductBlock ? `\nPRODUCT TO FEATURE:\n${selectedProductBlock}` : '',
      `\nFormat: social media ${contentType || 'post'} for ${platform}.`,
      `Brand: ${user.brand_name || 'modern brand'}.`,
      selectedProductBlock
        ? 'Use the provided product reference image(s) and preserve the same shape, material, color palette, and signature details.'
        : '',
      selectedProductBlock
        ? 'Maintain exact product identity: preserve garment silhouette, embroidery pattern, cuffs/placket details, and realistic fabric drape.'
        : '',
      'High quality, professional, photorealistic output.',
      'OUTPUT_FORM: single full-bleed photorealistic photograph only. No simulated social media UI, no Instagram/Facebook/TikTok mock layouts, no phone frames, no avatar strips, no overlay quote cards, no hashtags or captions rendered inside the image.',
      referenceImageUrls.length
        ? 'Brand mark rule: if a real logo/mark is present in provided references, keep it authentic and subtle only on product/packaging/signage; do not invent new text.'
        : '',
      'Hard restrictions: absolutely no random text/letters/numbers, no fake logos, no UI cards, no social app frames, no watermarks.',
    ].filter(Boolean).join(' ');

    // Generate image — use ratio from request, fallback to content-type logic
    const aspectRatio = ratio || (contentType === 'reel' || contentType === 'story' ? '9:16' : '1:1');
    const imageResult = await generateImageDetailed(enrichedImagePrompt, {
      aspectRatio,
      referenceImageUrls,
      timeoutMs: 120_000,
    });
    const rawImage = imageResult?.imageData || null;
    if (!rawImage) {
      logger.error('Image generation failed in generate-content', {
        provider: imageResult?.provider || 'unknown',
        reason: imageResult?.error || 'unknown',
      });
      return res.status(503).json({
        error: 'image_generation_failed',
        message: 'Image generation failed.',
        reason: imageResult?.error || 'Unknown provider failure',
        provider: imageResult?.provider || 'unknown',
      });
    }
    const imageUrl = await persistGeneratedImageToStorage({
      imageData: rawImage,
      userId: user.id,
      brandId: user.brand_id || null,
      traceId: `${platform}-${Date.now()}`,
    });
    if (!imageUrl) {
      return res.status(503).json({ error: 'image_persist_failed', message: 'Image could not be persisted. Please retry.' });
    }

    await client.query('BEGIN');
    const remainingCredits = await deductByUserIdAndLog(
      client,
      user.id,
      2,
      `Generated ${contentType || 'post'} for ${platform}`
    );
    const { rows: postRows } = await client.query(
      `INSERT INTO posts (user_id,brand_id,platform,content_type,caption,hashtags,status,is_ai_generated,generation_prompt,image_url)
       VALUES ($1,$2,$3,$4,$5,$6,'draft',TRUE,$7,$8) RETURNING *`,
      [user.id, user.brand_id||null, platform, contentType||'post', caption, hashtags,
       stringifyPromptPayload({
         brief,
         mood,
         theme,
         campaign,
         imagePrompt,
         enrichedImagePrompt,
         imageProvider: imageResult?.provider || 'unknown',
         imageModel: imageResult?.model || 'unknown',
       }), imageUrl]
    );
    await client.query('COMMIT');

    res.json({ post: postRows[0], creditsRemaining: remainingCredits, imagePrompt, imageUrl });
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

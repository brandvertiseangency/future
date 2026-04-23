/**
 * Brand Products API — /api/brand-products
 * CRUD for brand product library + Vision AI analysis per product image
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserAndBrand = async (uid) => {
  const pool = getPool();
  if (!pool) return {};
  const { rows: uRows } = await pool.query(
    'SELECT id FROM users WHERE firebase_uid=$1', [uid]
  );
  if (!uRows.length) return {};
  const userId = uRows[0].id;
  const { rows: bRows } = await pool.query(
    'SELECT id FROM brands WHERE user_id=$1 AND is_default=TRUE LIMIT 1', [userId]
  );
  const brandId = bRows[0]?.id || null;
  return { pool, userId, brandId };
};

// ─── GET /api/brand-products ──────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { pool, userId } = await getUserAndBrand(req.user.uid);
    if (!pool || !userId) return res.json({ products: [] });

    const { rows } = await pool.query(
      `SELECT * FROM brand_products WHERE user_id=$1 ORDER BY is_primary DESC, created_at ASC`,
      [userId]
    );
    res.json({ products: rows });
  } catch (err) {
    logger.error('Get brand products failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// ─── POST /api/brand-products ─────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { pool, userId, brandId } = await getUserAndBrand(req.user.uid);
    if (!pool || !userId) return res.status(404).json({ error: 'User not found.' });

    const { name, description, price, category, tags, images, visualDescription, useIn, isPrimary } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Product name is required.' });

    // If setting as primary, clear existing primary
    if (isPrimary) {
      await pool.query('UPDATE brand_products SET is_primary=FALSE WHERE user_id=$1', [userId]);
    }

    const { rows } = await pool.query(
      `INSERT INTO brand_products
        (user_id, brand_id, name, description, price, category, tags, images, visual_description, use_in, is_primary)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        userId, brandId || null,
        name.trim(),
        description || null,
        price || null,
        category || null,
        tags || [],
        images || [],
        visualDescription || null,
        useIn || ['calendar', 'image_generation'],
        isPrimary || false,
      ]
    );
    res.status(201).json({ product: rows[0] });
  } catch (err) {
    logger.error('Create brand product failed', { error: err.message });
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// ─── PUT /api/brand-products/:id ──────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { pool, userId } = await getUserAndBrand(req.user.uid);
    if (!pool || !userId) return res.status(404).json({ error: 'User not found.' });

    const { name, description, price, category, tags, images, visualDescription, useIn, isPrimary } = req.body;

    if (isPrimary) {
      await pool.query('UPDATE brand_products SET is_primary=FALSE WHERE user_id=$1', [userId]);
    }

    const { rows } = await pool.query(
      `UPDATE brand_products SET
        name=$1, description=$2, price=$3, category=$4, tags=$5,
        images=$6, visual_description=$7, use_in=$8, is_primary=$9
       WHERE id=$10 AND user_id=$11
       RETURNING *`,
      [
        name, description || null, price || null, category || null,
        tags || [], images || [], visualDescription || null,
        useIn || ['calendar', 'image_generation'],
        isPrimary || false,
        req.params.id, userId,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: rows[0] });
  } catch (err) {
    logger.error('Update brand product failed', { error: err.message });
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// ─── DELETE /api/brand-products/:id ──────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { pool, userId } = await getUserAndBrand(req.user.uid);
    if (!pool || !userId) return res.status(404).json({ error: 'User not found.' });
    await pool.query('DELETE FROM brand_products WHERE id=$1 AND user_id=$2', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) {
    logger.error('Delete brand product failed', { error: err.message });
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// ─── POST /api/brand-products/analyse-image ───────────────────────────────────
// Vision AI: given a product image (base64), returns a visual description string
router.post('/analyse-image', authMiddleware, async (req, res) => {
  try {
    const { image, productName } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided.' });

    let visualDescription = '';

    if (process.env.GOOGLE_AI_API_KEY) {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

      // Strip data URI prefix if present
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = image.startsWith('data:image/png') ? 'image/png'
                     : image.startsWith('data:image/webp') ? 'image/webp'
                     : 'image/jpeg';

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [
            {
              inlineData: { mimeType, data: base64Data },
            },
            {
              text: `Describe this product image in 1-2 concise sentences that an AI image generator can use as a reference.
Focus on: the exact product appearance, colours, textures, style, and any key visual features.
Product name: "${productName || 'unknown'}".
Return ONLY the description text, no markdown, no prefix.`,
            },
          ],
        }],
        config: { temperature: 0.3, maxOutputTokens: 120 },
      });

      visualDescription = response.text?.trim() || '';
    } else {
      // Fallback when no Vision API key
      visualDescription = `${productName || 'Product'} — a clearly branded item with distinctive visual characteristics`;
    }

    res.json({ visualDescription });
  } catch (err) {
    logger.error('Product image analysis failed', { error: err.message });
    res.status(500).json({ error: 'Analysis failed.', message: err.message });
  }
});

// ─── POST /api/brand-products/sync-from-onboarding ───────────────────────────
// Called after onboarding completes — syncs products saved in local store to DB
router.post('/sync-from-onboarding', authMiddleware, async (req, res) => {
  try {
    const { pool, userId, brandId } = await getUserAndBrand(req.user.uid);
    if (!pool || !userId) return res.status(404).json({ error: 'User not found.' });

    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.json({ synced: 0 });
    }

    let synced = 0;
    for (const p of products) {
      if (!p.name?.trim()) continue;
      if (p.isPrimary) {
        await pool.query('UPDATE brand_products SET is_primary=FALSE WHERE user_id=$1', [userId]);
      }
      await pool.query(
        `INSERT INTO brand_products
          (user_id, brand_id, name, description, price, category, tags, images, visual_description, use_in, is_primary)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT DO NOTHING`,
        [
          userId, brandId || null,
          p.name.trim(), p.description || null, p.price || null, p.category || null,
          p.tags || [], p.images || [], p.visualDescription || null,
          p.useIn || ['calendar', 'image_generation'], p.isPrimary || false,
        ]
      );
      synced++;
    }

    logger.info(`Synced ${synced} products from onboarding`, { userId });
    res.json({ synced });
  } catch (err) {
    logger.error('Sync products from onboarding failed', { error: err.message });
    res.status(500).json({ error: 'Failed to sync products.' });
  }
});

module.exports = router;

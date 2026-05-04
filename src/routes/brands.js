/**
 * Brands API (new schema) — /api/brands
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');
const { previewBrandFromUrl } = require('../services/brandSiteImport');

const getUserId = async (uid) => {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [uid]);
  return rows[0]?.id || null;
};

/** GET /api/brands/count */
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ count: 0 });
    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM brands WHERE user_id=$1', [userId]);
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count brands.' });
  }
});

/** GET /api/brands/current */
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ brand: null });
    const { rows } = await pool.query(
      'SELECT * FROM brands WHERE user_id=$1 AND is_default=TRUE ORDER BY created_at ASC LIMIT 1',
      [userId]
    );
    // Return null brand instead of 404 — dashboard handles the empty state gracefully
    res.json({ brand: rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get brand.' });
  }
});

/** POST /api/brands */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.status(404).json({ error: 'User not found.' });
    const { name, description, industry, tone, styles, audienceAgeMin, audienceAgeMax,
            audienceGender, audienceLocation, audienceInterests, platforms, goals } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO brands (user_id,name,description,industry,tone,styles,audience_age_min,
         audience_age_max,audience_gender,audience_location,audience_interests,platforms,goals,is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,FALSE) RETURNING *`,
      [userId, name, description, industry, tone??50, styles||[],
       audienceAgeMin||18, audienceAgeMax||65, audienceGender||'mixed',
       audienceLocation||'', audienceInterests||[], platforms||[], goals||[]]
    );
    res.status(201).json({ brand: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create brand.' });
  }
});

/** POST /api/brands/import-site-preview — extract OG/meta for onboarding (no DB write) */
router.post('/import-site-preview', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body || {};
    const preview = await previewBrandFromUrl(url);
    res.json({ preview });
  } catch (err) {
    logger.warn('Brand site import preview failed', { error: err.message });
    res.status(400).json({ error: 'import_failed', message: err.message || 'Could not read that URL.' });
  }
});

/** PUT /api/brands/:id */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const userId = await getUserId(req.user.uid);
    const { name, description, industry, tone, styles, audienceAgeMin, audienceAgeMax,
            audienceGender, audienceLocation, audienceInterests, platforms, goals } = req.body;
    const { rows } = await pool.query(
      `UPDATE brands SET name=COALESCE($1,name), description=COALESCE($2,description),
       industry=COALESCE($3,industry), tone=COALESCE($4,tone), styles=COALESCE($5,styles),
       audience_age_min=COALESCE($6,audience_age_min), audience_age_max=COALESCE($7,audience_age_max),
       audience_gender=COALESCE($8,audience_gender), audience_location=COALESCE($9,audience_location),
       audience_interests=COALESCE($10,audience_interests), platforms=COALESCE($11,platforms),
       goals=COALESCE($12,goals), updated_at=NOW()
       WHERE id=$13 AND user_id=$14 RETURNING *`,
      [name, description, industry, tone, styles, audienceAgeMin, audienceAgeMax,
       audienceGender, audienceLocation, audienceInterests, platforms, goals,
       req.params.id, userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Brand not found.' });
    res.json({ brand: rows[0] });
  } catch (err) {
    logger.error('Update brand failed', { error: err.message });
    res.status(500).json({ error: 'Failed to update brand.' });
  }
});

module.exports = router;

/**
 * Assets API — /api/assets
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

const getUserId = async (uid) => {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [uid]);
  return rows[0]?.id || null;
};

/** GET /api/assets */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ assets: [], total: 0, hasMore: false });

    const { platform, q, page = 1, limit = 24 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [userId];
    const conditions = ['a.user_id = $1'];

    if (platform && platform !== 'all') {
      params.push(platform);
      conditions.push(`a.platform = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(p.caption ILIKE $${params.length})`);
    }

    const whereClause = conditions.join(' AND ');
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM assets a LEFT JOIN posts p ON p.id = a.post_id WHERE ${whereClause}`,
      params
    );
    params.push(parseInt(limit));
    params.push(offset);
    const { rows } = await pool.query(
      `SELECT a.*, p.caption, p.content_type, p.is_ai_generated FROM assets a
       LEFT JOIN posts p ON p.id = a.post_id WHERE ${whereClause}
       ORDER BY a.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    const total = parseInt(countRows[0].count);
    res.json({ assets: rows, total, hasMore: offset + rows.length < total });
  } catch (err) {
    logger.error('Assets fetch failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch assets.' });
  }
});

/** POST /api/assets */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.status(404).json({ error: 'User not found.' });
    const { url, type, platform, fileSize, mimeType, postId } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO assets (user_id,post_id,type,url,platform,file_size,mime_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, postId||null, type||'image', url, platform||null, fileSize||null, mimeType||null]
    );
    res.status(201).json({ asset: rows[0] });
  } catch (err) {
    logger.error('Create asset failed', { error: err.message });
    res.status(500).json({ error: 'Failed to save asset.' });
  }
});

/** DELETE /api/assets/:id */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const { rowCount } = await pool.query('DELETE FROM assets WHERE id=$1 AND user_id=$2', [req.params.id, userId]);
    if (!rowCount) return res.status(404).json({ error: 'Asset not found.' });
    res.json({ success: true });
  } catch (err) {
    logger.error('Delete asset failed', { error: err.message });
    res.status(500).json({ error: 'Failed to delete asset.' });
  }
});

module.exports = router;

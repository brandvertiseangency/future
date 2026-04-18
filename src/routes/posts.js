/**
 * Posts Routes — CRUD + stats + scheduled publishing
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

/** GET /api/posts/stats */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ total: 0 });
    const { rows } = await pool.query('SELECT COUNT(*) AS total FROM posts WHERE user_id=$1', [userId]);
    res.json({ total: parseInt(rows[0].total) });
  } catch (err) {
    logger.error('Posts stats failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch post stats.' });
  }
});

/** GET /api/posts/recent?limit=6 */
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ posts: [] });
    const limit = Math.min(parseInt(req.query.limit) || 6, 50);
    const { rows } = await pool.query(
      `SELECT * FROM posts WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    res.json({ posts: rows });
  } catch (err) {
    logger.error('Recent posts failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch recent posts.' });
  }
});

/** GET /api/posts/scheduled?week=current OR ?month=YYYY-MM */
router.get('/scheduled', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ posts: [] });

    let startDate, endDate;
    if (req.query.week === 'current') {
      const now = new Date();
      const dow = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dow + 6) % 7));
      monday.setHours(0,0,0,0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23,59,59,999);
      startDate = monday; endDate = sunday;
    } else if (req.query.year && req.query.month) {
      // Accept ?year=YYYY&month=M (from calendar frontend)
      const year = parseInt(req.query.year);
      const month = parseInt(req.query.month);
      if (isNaN(year) || isNaN(month)) return res.status(400).json({ error: 'Invalid year or month' });
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (req.query.month) {
      // Accept ?month=YYYY-MM
      const [year, month] = req.query.month.split('-').map(Number);
      if (isNaN(year) || isNaN(month)) return res.status(400).json({ error: 'Invalid month format, use YYYY-MM' });
      startDate = new Date(year, month-1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      return res.status(400).json({ error: 'Provide week=current, month=YYYY-MM, or year=YYYY&month=M' });
    }

    const { rows } = await pool.query(
      `SELECT * FROM posts WHERE user_id=$1 AND status IN ('scheduled','published')
       AND scheduled_at BETWEEN $2 AND $3 ORDER BY scheduled_at ASC`,
      [userId, startDate, endDate]
    );
    res.json({ posts: rows });
  } catch (err) {
    logger.error('Scheduled posts failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch scheduled posts.' });
  }
});

/** PUT /api/posts/:id */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const userId = await getUserId(req.user.uid);
    const { caption, scheduledAt, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE posts SET caption=COALESCE($1,caption), scheduled_at=COALESCE($2,scheduled_at),
       status=COALESCE($3,status), updated_at=NOW()
       WHERE id=$4 AND user_id=$5 RETURNING *`,
      [caption, scheduledAt, status, req.params.id, userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post.' });
  }
});

/** POST /api/posts/:id/publish */
router.post('/:id/publish', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const userId = await getUserId(req.user.uid);
    const { rows } = await pool.query(
      `UPDATE posts SET status='published', published_at=NOW(), updated_at=NOW()
       WHERE id=$1 AND user_id=$2 RETURNING *`,
      [req.params.id, userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish post.' });
  }
});

/** DELETE /api/posts/:id */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const userId = await getUserId(req.user.uid);
    const { rowCount } = await pool.query(
      'DELETE FROM posts WHERE id=$1 AND user_id=$2', [req.params.id, userId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Post not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

/** POST /api/posts/feedback */
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const userId = await getUserId(req.user.uid);
    const { postId, rating } = req.body;
    await pool.query('UPDATE posts SET feedback=$1 WHERE id=$2 AND user_id=$3', [rating, postId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save feedback.' });
  }
});

module.exports = router;

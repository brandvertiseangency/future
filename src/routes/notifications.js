/**
 * Notifications Routes
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

/** GET /api/notifications */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ notifications: [], unread: 0 });
    const { rows } = await pool.query(
      'SELECT id, type, message, is_read as read, created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30',
      [userId]
    );
    const unread = rows.filter((n) => !n.read).length;
    res.json({ notifications: rows, unread });
  } catch (err) {
    logger.error('Notifications fetch failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

/** POST /api/notifications/read-all */
router.post('/read-all', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ success: true });
    await pool.query('UPDATE notifications SET is_read=TRUE WHERE user_id=$1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
});

/** PUT /api/notifications/read-all (legacy) */
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ success: true });
    await pool.query('UPDATE notifications SET is_read=TRUE WHERE user_id=$1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
});

/** POST /api/notifications/:id/read */
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ success: true });
    await pool.query(
      'UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2',
      [req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

module.exports = router;

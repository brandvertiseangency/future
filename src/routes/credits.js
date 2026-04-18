/**
 * Credits Routes — balance, transactions
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

/** GET /api/credits/balance */
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.json({ balance: 0, plan: 'free' });
    const { rows } = await pool.query('SELECT credits, plan FROM users WHERE firebase_uid=$1', [req.user.uid]);
    if (!rows[0]) return res.json({ balance: 0, plan: 'free' });
    res.json({ balance: rows[0].credits, plan: rows[0].plan });
  } catch (err) {
    logger.error('Credits balance failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch credits.' });
  }
});

module.exports = router;

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
    if (!pool) return res.json({ balance: 0, plan: 'trial' });
    const { rows } = await pool.query(
      'SELECT credits, plan, trial_started_at, created_at FROM users WHERE firebase_uid=$1',
      [req.user.uid]
    );
    if (!rows[0]) return res.json({ balance: 0, plan: 'trial' });

    const row = rows[0];
    const plan = row.plan || 'trial';
    const balance = row.credits || 0;

    // Calculate trial days remaining
    let trial_days_left = null;
    if (plan === 'trial') {
      const startDate = row.trial_started_at || row.created_at || new Date();
      const msPerDay = 1000 * 60 * 60 * 24;
      const elapsed = Math.floor((Date.now() - new Date(startDate).getTime()) / msPerDay);
      trial_days_left = Math.max(0, 14 - elapsed);
    }

    res.json({ balance, plan, trial_days_left });
  } catch (err) {
    logger.error('Credits balance failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch credits.' });
  }
});

module.exports = router;

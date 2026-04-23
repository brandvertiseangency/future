/**
 * Credit check middleware — ensures user has enough credits for the operation.
 * Reads from PostgreSQL (single source of truth for credits).
 */
const { getPool } = require('../config/postgres');
const config = require('../config');
const logger = require('../utils/logger');

function creditCheck(costType = 'generate') {
  return async (req, res, next) => {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized.' });

    const cost =
      costType === 'regenerate'
        ? config.credits.costRegenerate
        : config.credits.costGenerate;

    try {
      const pool = getPool();
      if (!pool) {
        logger.warn('Credit check skipped — PostgreSQL not available');
        return next();
      }

      const { rows } = await pool.query(
        'SELECT id, credits, plan FROM users WHERE firebase_uid = $1',
        [uid]
      );

      if (!rows[0]) {
        return res.status(404).json({ error: 'User profile not found.' });
      }

      const user = rows[0];
      const currentCredits = user.credits || 0;

      if (currentCredits < cost) {
        return res.status(402).json({
          error: 'Insufficient credits.',
          credits_available: currentCredits,
          credits_required: cost,
          plan: user.plan,
        });
      }

      // Attach for downstream use
      req.userPlan = user.plan || 'trial';
      req.userCredits = currentCredits;
      req.userId = user.id;
      next();
    } catch (err) {
      logger.error('Credit check failed', { error: err.message, uid });
      return res.status(500).json({ error: 'Failed to verify credits.' });
    }
  };
}

module.exports = creditCheck;

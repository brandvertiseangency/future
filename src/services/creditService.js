/**
 * Credit & Usage Control Service.
 * Reads/writes from PostgreSQL — single source of truth for credits.
 */
const { getPool } = require('../config/postgres');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Check if a user can perform an action based on credits.
 */
async function canPerform(uid, action = 'generate') {
  const pool = getPool();
  if (!pool) return { allowed: true, credits: 999 };

  const cost =
    action === 'regenerate'
      ? config.credits.costRegenerate
      : config.credits.costGenerate;

  const { rows } = await pool.query(
    'SELECT id, credits, plan FROM users WHERE firebase_uid = $1',
    [uid]
  );

  if (!rows[0]) return { allowed: false, reason: 'User not found' };

  const user = rows[0];
  const currentCredits = user.credits || 0;

  if (currentCredits < cost) {
    return {
      allowed: false,
      reason: 'Insufficient credits',
      credits: currentCredits,
      cost,
      plan: user.plan,
    };
  }

  return { allowed: true, credits: currentCredits, cost, plan: user.plan, userId: user.id };
}

/**
 * Deduct credits and log usage in PostgreSQL.
 */
async function deductAndLog(uid, action, metadata = {}) {
  const pool = getPool();
  if (!pool) {
    logger.warn('Credit deduction skipped — PostgreSQL not available');
    return { success: true, remaining: 999 };
  }

  const cost =
    action === 'regenerate'
      ? config.credits.costRegenerate
      : config.credits.costGenerate;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT id, credits FROM users WHERE firebase_uid = $1 FOR UPDATE',
      [uid]
    );
    if (!rows[0]) throw new Error('User not found');

    const current = rows[0].credits || 0;
    if (current < cost) throw new Error('Insufficient credits');

    const updated = current - cost;
    await client.query(
      'UPDATE users SET credits = $1, updated_at = NOW() WHERE firebase_uid = $2',
      [updated, uid]
    );

    // Log to credit_transactions if table exists
    try {
      await client.query(
        `INSERT INTO credit_transactions (user_id, type, amount, description, metadata)
         VALUES ($1, 'debit', $2, $3, $4)`,
        [rows[0].id, cost, action, JSON.stringify(metadata)]
      );
    } catch { /* table may not exist yet — non-fatal */ }

    await client.query('COMMIT');
    logger.info('Credit deducted', { uid, action, cost, remaining: updated });
    return { success: true, remaining: updated };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('Credit deduction failed', { error: err.message, uid });
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Check regeneration limit based on plan.
 */
async function checkRegenLimit(uid, postId) {
  const pool = getPool();
  if (!pool) return { allowed: true };

  const { rows: userRows } = await pool.query(
    'SELECT plan FROM users WHERE firebase_uid = $1',
    [uid]
  );
  if (!userRows[0]) return { allowed: false, reason: 'User not found' };

  const plan = userRows[0].plan || 'trial';
  const maxRegen = config.plans[plan]?.maxRegenerations ?? config.plans['free']?.maxRegenerations ?? 2;

  const { rows: postRows } = await pool.query(
    'SELECT regeneration_count FROM posts WHERE id = $1',
    [postId]
  );
  if (!postRows[0]) return { allowed: false, reason: 'Post not found' };

  const regenCount = postRows[0].regeneration_count || 0;

  if (regenCount >= maxRegen) {
    return {
      allowed: false,
      reason: `Regeneration limit reached (${maxRegen} per post on ${plan} plan)`,
      regeneration_count: regenCount,
      max_allowed: maxRegen,
      plan,
    };
  }

  return { allowed: true, regeneration_count: regenCount, max_allowed: maxRegen };
}

/**
 * Get usage history for a user.
 */
async function getUsageHistory(uid, limit = 50) {
  const pool = getPool();
  if (!pool) return [];

  try {
    const { rows } = await pool.query(
      `SELECT ct.* FROM credit_transactions ct
       JOIN users u ON u.id = ct.user_id
       WHERE u.firebase_uid = $1
       ORDER BY ct.created_at DESC LIMIT $2`,
      [uid, limit]
    );
    return rows;
  } catch {
    return [];
  }
}

module.exports = {
  canPerform,
  deductAndLog,
  checkRegenLimit,
  getUsageHistory,
};

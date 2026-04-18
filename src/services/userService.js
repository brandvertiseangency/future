/**
 * User & Subscription Service — PostgreSQL
 */
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

/**
 * Create or update a user profile after Firebase Auth sign-up.
 */
async function createUser(uid, email, plan = 'free') {
  const pool = getPool();
  if (!pool) {
    logger.warn('createUser skipped — DB offline');
    return { firebase_uid: uid, email, plan, credits: 100 };
  }

  const creditMap = { free: 100, starter: 1000, pro: 5000, agency: 10000 };
  const credits = creditMap[plan] ?? 100;

  const { rows } = await pool.query(
    `INSERT INTO users (firebase_uid, email, plan, credits)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (firebase_uid) DO UPDATE
       SET email = EXCLUDED.email, updated_at = NOW()
     RETURNING *`,
    [uid, email, plan, credits]
  );
  logger.info('User created/updated', { uid, plan });
  return rows[0];
}

/**
 * Get user profile by UID.
 */
async function getUser(uid) {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query('SELECT * FROM users WHERE firebase_uid=$1', [uid]);
  return rows[0] || null;
}

/**
 * Deduct credits from a user. Throws if insufficient.
 */
async function deductCredits(uid, amount) {
  const pool = getPool();
  if (!pool) { logger.warn('deductCredits skipped — DB offline'); return 999; }

  const { rows } = await pool.query(
    `UPDATE users SET credits = credits - $1, updated_at = NOW()
     WHERE firebase_uid = $2 AND credits >= $1
     RETURNING credits`,
    [amount, uid]
  );
  if (!rows[0]) throw new Error('Insufficient credits');
  return rows[0].credits;
}

/**
 * Add credits to a user.
 */
async function addCredits(uid, amount) {
  const pool = getPool();
  if (!pool) return;
  const { rows } = await pool.query(
    `UPDATE users SET credits = credits + $1, updated_at = NOW()
     WHERE firebase_uid = $2 RETURNING credits`,
    [amount, uid]
  );
  return rows[0]?.credits;
}

/**
 * Update user plan.
 */
async function updatePlan(uid, plan) {
  const pool = getPool();
  if (!pool) return;
  const creditMap = { free: 100, starter: 1000, pro: 5000, agency: 10000 };
  const { rows } = await pool.query(
    `UPDATE users SET plan=$1, credits=credits+$2, updated_at=NOW()
     WHERE firebase_uid=$3 RETURNING *`,
    [plan, creditMap[plan] ?? 0, uid]
  );
  return rows[0];
}

/**
 * Update display name / profile fields.
 */
async function updateProfile(uid, fields) {
  const pool = getPool();
  if (!pool) return;
  const { display_name, website, photo_url } = fields;
  const { rows } = await pool.query(
    `UPDATE users SET
       display_name = COALESCE($1, display_name),
       website      = COALESCE($2, website),
       photo_url    = COALESCE($3, photo_url),
       updated_at   = NOW()
     WHERE firebase_uid=$4 RETURNING *`,
    [display_name, website, photo_url, uid]
  );
  return rows[0];
}

module.exports = { createUser, getUser, deductCredits, addCredits, updatePlan, updateProfile };

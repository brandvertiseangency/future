/**
 * Users /me API — profile, preferences, account management
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

const getUserRow = async (uid) => {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query('SELECT * FROM users WHERE firebase_uid=$1', [uid]);
  return rows[0] || null;
};

const ensureUser = async (uid, email) => {
  const pool = getPool();
  if (!pool) throw new Error('Database unavailable');
  const { rows } = await pool.query(
    `INSERT INTO users (firebase_uid, email)
     VALUES ($1, $2)
     ON CONFLICT (firebase_uid) DO UPDATE SET email=EXCLUDED.email, updated_at=NOW()
     RETURNING *`,
    [uid, email]
  );
  return rows[0];
};

/** GET /api/users/me */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await ensureUser(req.user.uid, req.user.email);
    res.json({ user });
  } catch (err) {
    logger.error('Get user failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

/** PUT /api/users/me */
router.put('/me', authMiddleware, async (req, res) => {
  return patchMe(req, res);
});

/** PATCH /api/users/me — preferred by frontend settings page */
router.patch('/me', authMiddleware, async (req, res) => {
  return patchMe(req, res);
});

async function patchMe(req, res) {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    // Accept both camelCase (frontend PUT) and snake_case (frontend PATCH)
    const displayName = req.body.displayName ?? req.body.display_name;
    const website = req.body.website;
    const photoUrl = req.body.photoUrl ?? req.body.photo_url;
    const acceptContentPolicy =
      req.body.acceptContentPolicy === true || req.body.accept_content_policy === true;
    const contentPolicyVersionRaw =
      req.body.contentPolicyVersion ?? req.body.content_policy_version ?? '';
    const contentPolicyVersion = String(contentPolicyVersionRaw).trim().slice(0, 128);

    if (acceptContentPolicy && !contentPolicyVersion) {
      return res.status(400).json({
        error: 'content_policy_version_required',
        message: 'content_policy_version is required when accepting the content policy.',
      });
    }

    let sql;
    let params;
    if (acceptContentPolicy && contentPolicyVersion) {
      sql = `UPDATE users SET display_name=COALESCE($1,display_name), website=COALESCE($2,website),
       photo_url=COALESCE($3,photo_url), content_policy_version=$5, content_policy_accepted_at=NOW(),
       updated_at=NOW()
       WHERE firebase_uid=$4 RETURNING *`;
      params = [displayName, website, photoUrl, req.user.uid, contentPolicyVersion];
    } else {
      sql = `UPDATE users SET display_name=COALESCE($1,display_name), website=COALESCE($2,website),
       photo_url=COALESCE($3,photo_url), updated_at=NOW()
       WHERE firebase_uid=$4 RETURNING *`;
      params = [displayName, website, photoUrl, req.user.uid];
    }

    const { rows } = await pool.query(sql, params);
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) {
    logger.error('Update user failed', { error: err.message });
    res.status(500).json({ error: 'Failed to update user.' });
  }
}

/** GET /api/users/me/preferences */
router.get('/me/preferences', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const user = await getUserRow(req.user.uid);
    if (!user || !pool) return res.json({ preferences: null });
    const { rows } = await pool.query('SELECT * FROM user_preferences WHERE user_id=$1', [user.id]);
    if (!rows[0]) {
      const { rows: created } = await pool.query('INSERT INTO user_preferences (user_id) VALUES ($1) RETURNING *', [user.id]);
      return res.json({ preferences: created[0] });
    }
    res.json({ preferences: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preferences.' });
  }
});

/** PUT /api/users/me/preferences */
router.put('/me/preferences', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const user = await getUserRow(req.user.uid);
    if (!user || !pool) return res.status(404).json({ error: 'User not found.' });
    const { emailPostReminder, emailCreditWarning, emailWeeklyDigest,
            emailProductUpdates, inappPostReminder, inappCreditWarning } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO user_preferences (user_id,email_post_reminder,email_credit_warning,
         email_weekly_digest,email_product_updates,inapp_post_reminder,inapp_credit_warning,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         email_post_reminder=COALESCE($2,user_preferences.email_post_reminder),
         email_credit_warning=COALESCE($3,user_preferences.email_credit_warning),
         email_weekly_digest=COALESCE($4,user_preferences.email_weekly_digest),
         email_product_updates=COALESCE($5,user_preferences.email_product_updates),
         inapp_post_reminder=COALESCE($6,user_preferences.inapp_post_reminder),
         inapp_credit_warning=COALESCE($7,user_preferences.inapp_credit_warning),
         updated_at=NOW()
       RETURNING *`,
      [user.id, emailPostReminder, emailCreditWarning, emailWeeklyDigest,
       emailProductUpdates, inappPostReminder, inappCreditWarning]
    );
    res.json({ preferences: rows[0] });
  } catch (err) {
    logger.error('Update preferences failed', { error: err.message });
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

/** DELETE /api/users/me */
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    await pool.query(
      `UPDATE users SET email=$1, display_name=NULL, onboarding_complete=FALSE, updated_at=NOW()
       WHERE firebase_uid=$2`,
      [`deleted_${req.user.uid}@deleted.invalid`, req.user.uid]
    );
    res.json({ success: true });
  } catch (err) {
    logger.error('Delete account failed', { error: err.message });
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

module.exports = router;

/**
 * Posts Routes — CRUD + stats + scheduled publishing
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');
const { persistGeneratedImageToStorage, stringifyPromptPayload } = require('../lib/generatedImageStore');
const { deductByUserIdAndLog } = require('../services/creditService');

const purgePromptArtifactsForPost = async (pool, postId, userId) => {
  await pool.query(
    `UPDATE posts
     SET generation_prompt=NULL, updated_at=NOW()
     WHERE id=$1 AND user_id=$2`,
    [postId, userId]
  );
  try {
    await pool.query(
      `UPDATE post_versions
       SET generation_prompt=NULL
       WHERE post_id=$1`,
      [postId]
    );
  } catch {
    // post_versions table may not exist in older setups
  }
};


const getUserId = async (uid) => {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query('SELECT id FROM users WHERE firebase_uid=$1', [uid]);
  return rows[0]?.id || null;
};

/** GET /api/posts?limit=6&status=approved&offset=0 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ posts: [] });

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status; // optional filter

    let query, params;
    if (status === 'approved') {
      query = `SELECT * FROM posts
               WHERE user_id=$1 AND (status='approved' OR approval_status='approved')
               ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params = [userId, limit, offset];
    } else if (status) {
      query = `SELECT * FROM posts WHERE user_id=$1 AND status=$2 ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
      params = [userId, status, limit, offset];
    } else {
      query = `SELECT * FROM posts WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params = [userId, limit, offset];
    }

    const { rows } = await pool.query(query, params);
    res.json({ posts: rows });
  } catch (err) {
    logger.error('List posts failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});

/** GET /api/posts/stats */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const userId = await getUserId(req.user.uid);
    if (!userId || !pool) return res.json({ total: 0, draft: 0, scheduled: 0, published: 0, approved: 0 });
    const { rows } = await pool.query(
      `SELECT status, COUNT(*) AS count FROM posts WHERE user_id=$1 GROUP BY status`,
      [userId]
    );
    const approvedRes = await pool.query(
      `SELECT COUNT(*) AS count FROM posts WHERE user_id=$1 AND (status='approved' OR approval_status='approved')`,
      [userId]
    );
    const counts = {};
    let total = 0;
    for (const r of rows) { counts[r.status] = parseInt(r.count); total += parseInt(r.count); }
    res.json({
      total,
      draft: counts.draft || 0,
      scheduled: counts.scheduled || 0,
      published: counts.published || 0,
      approved: parseInt(approvedRes.rows[0]?.count || 0, 10),
    });
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

/** PATCH /api/posts/:id — partial update (caption, status, approval_status, scheduled_at) */
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const userId = await getUserId(req.user.uid);
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const allowed = ['caption', 'status', 'approval_status', 'scheduled_at'];
    const sets = [];
    const vals = [];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        sets.push(`${key}=$${vals.length + 1}`);
        vals.push(req.body[key]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update.' });
    sets.push('updated_at=NOW()');
    vals.push(req.params.id, userId);

    const { rows } = await pool.query(
      `UPDATE posts SET ${sets.join(',')} WHERE id=$${vals.length - 1} AND user_id=$${vals.length} RETURNING *`,
      vals
    );
    if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });
    if (rows[0].status === 'approved' || rows[0].status === 'scheduled' || rows[0].approval_status === 'approved') {
      await purgePromptArtifactsForPost(pool, rows[0].id, userId);
    }
    res.json({ post: rows[0] });
  } catch (err) {
    logger.error('Patch post failed', { error: err.message });
    res.status(500).json({ error: 'Failed to update post.' });
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

/** GET /api/posts/:id — get post with versions */
router.get('/:id', authMiddleware, async (req, res) => {  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const userId = await getUserId(req.user.uid);
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const { rows } = await pool.query('SELECT * FROM posts WHERE id=$1 AND user_id=$2', [req.params.id, userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });

    // Fetch versions if table exists
    let versions = [];
    try {
      const { rows: vRows } = await pool.query(
        'SELECT * FROM post_versions WHERE post_id=$1 ORDER BY version_number ASC',
        [req.params.id]
      );
      versions = vRows;
    } catch { /* post_versions table may not exist yet */ }

    res.json({ post: rows[0], versions });
  } catch (err) {
    logger.error('Get post failed', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
});

/** POST /api/posts/:id/approve — approve a post */
router.post('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const userId = await getUserId(req.user.uid);
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const { rows } = await pool.query(
      `UPDATE posts SET approval_status='approved', approved_at=NOW(), updated_at=NOW()
       WHERE id=$1 AND user_id=$2 RETURNING *`,
      [req.params.id, userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });
    await purgePromptArtifactsForPost(pool, req.params.id, userId);
    res.json({ post: rows[0] });
  } catch (err) {
    logger.error('Post approve failed', { error: err.message });
    res.status(500).json({ error: 'Failed to approve post.' });
  }
});

/** POST /api/posts/:id/regenerate — regenerate with feedback */
router.post('/:id/regenerate', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: 'Database unavailable.' });
    const userId = await getUserId(req.user.uid);
    if (!userId) return res.status(404).json({ error: 'User not found.' });

    const { feedback = '' } = req.body;
    const { rows: postRows } = await pool.query(
      'SELECT * FROM posts WHERE id=$1 AND user_id=$2',
      [req.params.id, userId]
    );
    if (!postRows[0]) return res.status(404).json({ error: 'Post not found.' });
    const post = postRows[0];

    // Check credits
    const { rows: userRows } = await pool.query('SELECT id, credits FROM users WHERE id=$1', [userId]);
    const user = userRows[0];
    if (!user || user.credits < 2) {
      return res.status(402).json({ error: 'insufficient_credits', creditsRequired: 2, creditsAvailable: user?.credits ?? 0 });
    }

    // Get brand
    const { rows: brandRows } = await pool.query('SELECT * FROM brands WHERE id=$1', [post.brand_id]);
    const brand = brandRows[0];

    // Build AI prompts
    const { buildSystemPrompt, buildUserPrompt } = require('../lib/prompt-engine');
    let sysPrompt, userPrompt;
    try {
      sysPrompt = buildSystemPrompt({
        name: brand?.name || 'Brand', industry: brand?.industry || 'general',
        description: brand?.description || '', tone: brand?.tone || 50,
        styles: brand?.styles || [], goals: brand?.goals || [],
        audienceAgeMin: brand?.audience_age_min, audienceAgeMax: brand?.audience_age_max,
        audienceGender: brand?.audience_gender, audienceInterests: brand?.audience_interests || [],
        audienceLocation: '', platforms: brand?.platforms || [],
      });
      userPrompt = buildUserPrompt(
        { platform: post.platform, contentType: post.content_type, brief: feedback || post.caption, mood: '' },
        {}
      );
    } catch {
      sysPrompt = `You are a social media expert. Return valid JSON: { "caption": "...", "hashtags": ["..."], "imagePrompt": "..." }`;
      userPrompt = `Regenerate this ${post.content_type} for ${post.platform}. Feedback: ${feedback}. Original: ${post.caption}`;
    }

    // Call AI
    const newVersion = (post.version_number || 1) + 1;
    let caption = post.caption, hashtags = post.hashtags || [], imagePrompt = '';
    let imageProvider = 'unknown';
    let imageModel = 'unknown';
    let imageUrl = post.image_url;
    try {
      const { callAI, generateImageDetailed } = require('../lib/ai');
      const raw = await callAI({ system: sysPrompt, user: userPrompt }, { maxTokens: 1024 });
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);
      caption = parsed.caption || caption;
      hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : hashtags;
      imagePrompt = parsed.imagePrompt || '';

      // Generate new image if we have a prompt
      if (imagePrompt) {
        const imageResult = await generateImageDetailed(
          `${imagePrompt}. Brand: ${brand?.name || 'brand'}. Professional social media image. No text/letters/numbers/logos/UI elements/watermarks.`,
          { aspectRatio: post.content_type === 'reel' || post.content_type === 'story' ? '9:16' : '1:1' }
        );
        const newImg = imageResult?.imageData || null;
        if (newImg) {
          const persisted = await persistGeneratedImageToStorage({
            imageData: newImg,
            userId,
            brandId: post.brand_id,
            traceId: `${post.id}-${newVersion}`,
          });
          if (persisted) imageUrl = persisted;
          imageProvider = imageResult?.provider || 'unknown';
          imageModel = imageResult?.model || 'unknown';
        }
      }
    } catch (e) {
      logger.warn('AI regen failed, keeping original', { error: e.message });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await deductByUserIdAndLog(client, userId, 2, `Regenerated ${post.content_type}`);
      const { rows: updated } = await client.query(
        `UPDATE posts SET caption=$1, hashtags=$2, image_url=$3, version_number=$4, approval_status='pending', updated_at=NOW()
         WHERE id=$5 RETURNING *`,
        [caption, hashtags, imageUrl, newVersion, req.params.id]
      );
      try {
        await client.query(
          `INSERT INTO post_versions (post_id, version_number, caption, image_url, hashtags, generation_prompt, feedback_note)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [req.params.id, newVersion, caption, imageUrl, hashtags, stringifyPromptPayload({ imagePrompt, imageProvider, imageModel }), feedback]
        );
        // Keep only latest 3 versions per post to control storage bloat.
        await client.query(
          `DELETE FROM post_versions
           WHERE post_id=$1
             AND id IN (
               SELECT id FROM post_versions
               WHERE post_id=$1
               ORDER BY version_number DESC
               OFFSET 3
             )`,
          [req.params.id]
        );
      } catch { /* post_versions may not exist */ }
      await client.query('COMMIT');
      res.json({ post: updated[0], version: newVersion });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error('Post regenerate failed', { error: err.message });
    res.status(500).json({ error: 'Failed to regenerate post.', details: err.message });
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

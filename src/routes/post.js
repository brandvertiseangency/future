/**
 * Post Routes — regeneration, status updates.
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const creditCheck = require("../middleware/creditCheck");
const schemas = require("../validators/schemas");
const { regeneratePost } = require("../services/regenerationService");
const { db, initialized } = require("../config/firebase");
const logger = require("../utils/logger");

/**
 * POST /post/regenerate
 * Regenerate a single post with feedback.
 */
router.post(
  "/regenerate",
  authMiddleware,
  validate(schemas.postRegenerate),
  creditCheck("regenerate"),
  async (req, res) => {
    try {
      const { post_id, feedback } = req.body;
      const result = await regeneratePost(req.user.uid, post_id, feedback);

      res.json({
        message: "Post regenerated successfully.",
        ...result,
      });
    } catch (err) {
      logger.error("Regeneration failed", { error: err.message });

      const status = err.message.includes("limit") ? 429 : 500;
      res.status(status).json({
        error: "Regeneration failed.",
        details: err.message,
      });
    }
  }
);

/**
 * GET /post/:id
 * Get a single post with all versions.
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!initialized) {
      return res.status(503).json({ error: "Firestore not available." });
    }

    const doc = await db.collection("posts").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Post not found." });
    }

    const post = { id: doc.id, ...doc.data() };

    // Verify ownership through calendar
    const calDoc = await db
      .collection("content_calendars")
      .doc(post.calendar_id)
      .get();

    if (!calDoc.exists || calDoc.data().user_id !== req.user.uid) {
      return res.status(404).json({ error: "Post not found." });
    }

    res.json({ post });
  } catch (err) {
    logger.error("Get post failed", { error: err.message });
    res.status(500).json({ error: "Failed to fetch post." });
  }
});

/**
 * PATCH /post/:id/status
 * Update post status (approve, etc.)
 */
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (!initialized) {
      return res.status(503).json({ error: "Firestore not available." });
    }

    const { status } = req.body;
    const allowed = ["pending", "generated", "approved"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${allowed.join(", ")}` });
    }

    const doc = await db.collection("posts").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Verify ownership
    const calDoc = await db
      .collection("content_calendars")
      .doc(doc.data().calendar_id)
      .get();

    if (!calDoc.exists || calDoc.data().user_id !== req.user.uid) {
      return res.status(404).json({ error: "Post not found." });
    }

    await db.collection("posts").doc(req.params.id).update({ status });

    res.json({ message: "Post status updated.", post_id: req.params.id, status });
  } catch (err) {
    logger.error("Post status update failed", { error: err.message });
    res.status(500).json({ error: "Failed to update post status." });
  }
});

module.exports = router;

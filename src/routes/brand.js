/**
 * Brand Routes — CRUD for brand profiles.
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");
const brandService = require("../services/brandService");
const logger = require("../utils/logger");
const { getPool } = require("../config/postgres");

/**
 * POST /brand/create
 * Create a new brand profile.
 */
router.post(
  "/create",
  authMiddleware,
  validate(schemas.brandCreate),
  async (req, res) => {
    try {
      const brand = await brandService.createBrand(req.user.uid, req.body);
      res.status(201).json({ message: "Brand created.", brand });
    } catch (err) {
      logger.error("Brand creation failed", { error: err.message });
      res.status(500).json({ error: "Failed to create brand.", details: err.message });
    }
  }
);

/**
 * GET /brand/list
 * List all brands for the current user.
 */
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const brands = await brandService.listBrands(req.user.uid);
    res.json({ brands });
  } catch (err) {
    logger.error("Brand list failed", { error: err.message });
    res.status(500).json({ error: "Failed to list brands." });
  }
});

/**
 * GET /brand/me
 * Get the current user's default brand with all intelligence fields.
 * Must be defined BEFORE /:id to prevent "me" being treated as an id.
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: "Database unavailable." });
    const { rows } = await pool.query(
      `SELECT b.*,
              bsp.extracted_colors, bsp.photography_style, bsp.dominant_aesthetic,
              bsp.mood_keywords, bsp.layout_style, bsp.font_mood_detected,
              bic.usp_keywords AS industry_usp, bic.industry_answers,
              ccp.weekly_post_count, ccp.content_type_mix, ccp.active_platforms, ccp.auto_schedule
       FROM brands b
       LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
       LEFT JOIN brand_industry_configs bic ON bic.brand_id = b.id
       LEFT JOIN content_calendar_preferences ccp ON ccp.brand_id = b.id
       JOIN users u ON u.id = b.user_id
       WHERE u.firebase_uid = $1
       ORDER BY b.is_default DESC, b.created_at ASC
       LIMIT 1`,
      [req.user.uid]
    );
    if (!rows[0]) return res.status(404).json({ error: "Brand not found." });
    res.json({ brand: rows[0] });
  } catch (err) {
    logger.error("Get brand/me failed", { error: err.message });
    res.status(500).json({ error: "Failed to get brand." });
  }
});

/**
 * PATCH /brand/me
 * Update the current user's default brand info fields.
 */
router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (!pool) return res.status(503).json({ error: "Database unavailable." });

    const allowed = [
      "name", "description", "tagline", "website", "phone", "address", "logo_url",
      "industry", "tone", "styles", "goals", "platforms",
      "color_primary", "color_secondary", "color_accent", "font_mood",
      "audience_age_min", "audience_age_max", "audience_gender",
      "audience_location", "audience_interests",
      "industry_subtype", "price_segment", "usp_keywords",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No updatable fields provided." });
    }

    const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 1}`);
    const values = Object.values(updates);

    const { rows } = await pool.query(
      `UPDATE brands SET ${setClauses.join(", ")}, updated_at = NOW()
       WHERE id = (
         SELECT b2.id
         FROM brands b2
         JOIN users u2 ON u2.id = b2.user_id
         WHERE u2.firebase_uid = $${values.length + 1}
         ORDER BY b2.is_default DESC, b2.created_at ASC
         LIMIT 1
       )
       RETURNING *`,
      [...values, req.user.uid]
    );

    if (!rows[0]) return res.status(404).json({ error: "Brand not found." });
    res.json({ brand: rows[0] });
  } catch (err) {
    logger.error("PATCH brand/me failed", { error: err.message });
    res.status(500).json({ error: "Failed to update brand.", details: err.message });
  }
});

/**
 * GET /brand/:id
 * Get a specific brand.
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const brand = await brandService.getBrand(req.params.id, req.user.uid);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found." });
    }
    res.json({ brand });
  } catch (err) {
    logger.error("Get brand failed", { error: err.message });
    res.status(500).json({ error: "Failed to get brand." });
  }
});

/**
 * PUT /brand/:id
 * Update a brand.
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const brand = await brandService.updateBrand(
      req.params.id,
      req.user.uid,
      req.body
    );
    if (!brand) {
      return res.status(404).json({ error: "Brand not found." });
    }
    res.json({ message: "Brand updated.", brand });
  } catch (err) {
    logger.error("Brand update failed", { error: err.message });
    res.status(500).json({ error: "Failed to update brand.", details: err.message });
  }
});

module.exports = router;

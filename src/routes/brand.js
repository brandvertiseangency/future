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
const { sanitizeLogoUrlForDb } = require("../utils/sanitizeLogoUrl");
const multer = require("multer");
const path = require("path");
const { uploadBuffer, buildPath } = require("../services/storageService");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

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

    const brandAllowed = [
      "name", "description", "tagline", "website", "phone", "address", "logo_url",
      "industry", "tone", "styles", "goals", "platforms",
      "color_primary", "color_secondary", "color_accent", "font_mood",
      "audience_age_min", "audience_age_max", "audience_gender",
      "audience_location", "audience_interests",
      "industry_subtype", "price_segment",
    ];

    const updates = {};
    for (const key of brandAllowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    if (updates.logo_url !== undefined) {
      updates.logo_url = sanitizeLogoUrlForDb(updates.logo_url);
    }

    const industryConfigPatch = {};
    if (req.body.industry !== undefined) industryConfigPatch.industry = req.body.industry;
    if (req.body.industry_subtype !== undefined) industryConfigPatch.subtype = req.body.industry_subtype;
    if (req.body.price_segment !== undefined) industryConfigPatch.price_segment = req.body.price_segment;
    if (req.body.usp_keywords !== undefined) industryConfigPatch.usp_keywords = req.body.usp_keywords;
    if (req.body.industry_answers !== undefined) industryConfigPatch.industry_answers = req.body.industry_answers;

    const calendarPrefPatch = {};
    if (req.body.weekly_post_count !== undefined) calendarPrefPatch.weekly_post_count = req.body.weekly_post_count;
    if (req.body.content_type_mix !== undefined) calendarPrefPatch.content_type_mix = req.body.content_type_mix;
    if (req.body.auto_schedule !== undefined) calendarPrefPatch.auto_schedule = req.body.auto_schedule;
    if (req.body.active_platforms !== undefined) calendarPrefPatch.active_platforms = req.body.active_platforms;

    if (
      Object.keys(updates).length === 0 &&
      Object.keys(industryConfigPatch).length === 0 &&
      Object.keys(calendarPrefPatch).length === 0
    ) {
      return res.status(400).json({ error: "No updatable fields provided." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: brandTargetRows } = await client.query(
        `SELECT b.id
         FROM brands b
         JOIN users u ON u.id = b.user_id
         WHERE u.firebase_uid = $1
         ORDER BY b.is_default DESC, b.created_at ASC
         LIMIT 1`,
        [req.user.uid]
      );
      const brandId = brandTargetRows[0]?.id;
      if (!brandId) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Brand not found." });
      }

      if (Object.keys(updates).length > 0) {
        const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 1}`);
        const values = Object.values(updates);
        await client.query(
          `UPDATE brands
           SET ${setClauses.join(", ")}, updated_at = NOW()
           WHERE id = $${values.length + 1}`,
          [...values, brandId]
        );
      }

      if (Object.keys(industryConfigPatch).length > 0) {
        await client.query(
          `INSERT INTO brand_industry_configs
             (brand_id, industry, subtype, price_segment, usp_keywords, industry_answers)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (brand_id) DO UPDATE SET
             industry = COALESCE(EXCLUDED.industry, brand_industry_configs.industry),
             subtype = COALESCE(EXCLUDED.subtype, brand_industry_configs.subtype),
             price_segment = COALESCE(EXCLUDED.price_segment, brand_industry_configs.price_segment),
             usp_keywords = COALESCE(EXCLUDED.usp_keywords, brand_industry_configs.usp_keywords),
             industry_answers = COALESCE(EXCLUDED.industry_answers, brand_industry_configs.industry_answers),
             updated_at = NOW()`,
          [
            brandId,
            industryConfigPatch.industry ?? null,
            industryConfigPatch.subtype ?? null,
            industryConfigPatch.price_segment ?? null,
            industryConfigPatch.usp_keywords ?? null,
            industryConfigPatch.industry_answers ?? null,
          ]
        );
      }

      if (Object.keys(calendarPrefPatch).length > 0) {
        await client.query(
          `INSERT INTO content_calendar_preferences
             (brand_id, weekly_post_count, content_type_mix, auto_schedule, active_platforms)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (brand_id) DO UPDATE SET
             weekly_post_count = COALESCE(EXCLUDED.weekly_post_count, content_calendar_preferences.weekly_post_count),
             content_type_mix = COALESCE(EXCLUDED.content_type_mix, content_calendar_preferences.content_type_mix),
             auto_schedule = COALESCE(EXCLUDED.auto_schedule, content_calendar_preferences.auto_schedule),
             active_platforms = COALESCE(EXCLUDED.active_platforms, content_calendar_preferences.active_platforms),
             updated_at = NOW()`,
          [
            brandId,
            calendarPrefPatch.weekly_post_count ?? null,
            calendarPrefPatch.content_type_mix ?? null,
            calendarPrefPatch.auto_schedule ?? null,
            calendarPrefPatch.active_platforms ?? null,
          ]
        );
      }

      const { rows } = await client.query(
        `SELECT b.*,
                bsp.extracted_colors, bsp.photography_style, bsp.dominant_aesthetic,
                bsp.mood_keywords, bsp.layout_style, bsp.font_mood_detected,
                bic.usp_keywords AS industry_usp, bic.industry_answers,
                ccp.weekly_post_count, ccp.content_type_mix, ccp.active_platforms, ccp.auto_schedule
         FROM brands b
         LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
         LEFT JOIN brand_industry_configs bic ON bic.brand_id = b.id
         LEFT JOIN content_calendar_preferences ccp ON ccp.brand_id = b.id
         WHERE b.id = $1
         LIMIT 1`,
        [brandId]
      );

      await client.query("COMMIT");
      res.json({ brand: rows[0] });
    } catch (innerErr) {
      await client.query("ROLLBACK").catch(() => {});
      throw innerErr;
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error("PATCH brand/me failed", { error: err.message });
    res.status(500).json({ error: "Failed to update brand.", details: err.message });
  }
});

/**
 * POST /brand/me/logo
 * Upload logo to cloud storage and persist public URL on the default brand.
 */
router.post("/me/logo", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No logo file provided." });
    if (!req.file.mimetype?.startsWith("image/")) {
      return res.status(400).json({ error: "Only image files are allowed for logos." });
    }

    const pool = getPool();
    if (!pool) return res.status(503).json({ error: "Database unavailable." });

    const { rows: targetRows } = await pool.query(
      `SELECT u.id AS user_id, b.id AS brand_id
       FROM users u
       JOIN brands b ON b.user_id = u.id
       WHERE u.firebase_uid = $1
       ORDER BY b.is_default DESC, b.created_at ASC
       LIMIT 1`,
      [req.user.uid]
    );
    const target = targetRows[0];
    if (!target) return res.status(404).json({ error: "Brand not found." });

    const ext = (path.extname(req.file.originalname || "") || ".png").replace(/[^.\w]/g, "");
    const filename = `logo-${Date.now()}${ext}`;
    const gcsPath = buildPath(String(target.user_id), String(target.brand_id), "brand-logo", filename);
    const uploadedUrl = await uploadBuffer(req.file.buffer, gcsPath, req.file.mimetype || "image/png");
    if (!uploadedUrl) {
      return res.status(503).json({ error: "Logo upload failed. Cloud storage unavailable." });
    }

    const safeLogoUrl = sanitizeLogoUrlForDb(uploadedUrl);
    const { rows } = await pool.query(
      `UPDATE brands
       SET logo_url=$1, updated_at=NOW()
       WHERE id=$2
       RETURNING *`,
      [safeLogoUrl, target.brand_id]
    );
    res.json({ logoUrl: safeLogoUrl, brand: rows[0] || null });
  } catch (err) {
    logger.error("POST brand/me/logo failed", { error: err.message });
    res.status(500).json({ error: "Failed to upload brand logo.", details: err.message });
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

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

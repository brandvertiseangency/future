/**
 * Asset Routes — file upload & management.
 */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const assetService = require("../services/assetService");
const logger = require("../utils/logger");

// Configure multer for memory storage (files go to GCS, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "application/pdf",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

/**
 * POST /assets/upload
 * Upload a brand asset.
 */
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided." });
      }

      const { brand_id, type = "reference", tags = "" } = req.body;
      if (!brand_id) {
        return res.status(400).json({ error: "brand_id is required." });
      }

      if (!["logo", "product", "reference"].includes(type)) {
        return res
          .status(400)
          .json({ error: "type must be logo, product, or reference." });
      }

      const asset = await assetService.uploadAsset(
        req.user.uid,
        brand_id,
        type,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        tags
      );

      res.status(201).json({ message: "Asset uploaded.", asset });
    } catch (err) {
      logger.error("Asset upload failed", { error: err.message });
      res
        .status(500)
        .json({ error: "Failed to upload asset.", details: err.message });
    }
  }
);

/**
 * GET /assets/:brand_id
 * Get all assets for a brand.
 */
router.get("/:brand_id", authMiddleware, async (req, res) => {
  try {
    const assets = await assetService.getAssets(
      req.user.uid,
      req.params.brand_id
    );
    res.json({ assets });
  } catch (err) {
    logger.error("Get assets failed", { error: err.message });
    res.status(500).json({ error: "Failed to fetch assets." });
  }
});

/**
 * DELETE /assets/:asset_id
 * Delete an asset.
 */
router.delete("/:asset_id", authMiddleware, async (req, res) => {
  try {
    const deleted = await assetService.deleteAsset(
      req.params.asset_id,
      req.user.uid
    );
    if (!deleted) {
      return res.status(404).json({ error: "Asset not found." });
    }
    res.json({ message: "Asset deleted." });
  } catch (err) {
    logger.error("Asset delete failed", { error: err.message });
    res.status(500).json({ error: "Failed to delete asset." });
  }
});

module.exports = router;

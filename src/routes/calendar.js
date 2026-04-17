/**
 * Calendar Routes — generate, view, update content calendars.
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const creditCheck = require("../middleware/creditCheck");
const schemas = require("../validators/schemas");
const { generateCalendar, getCalendar, updateCalendar } = require("../services/calendarService");
const logger = require("../utils/logger");

/**
 * POST /calendar/generate
 * Generate a new content calendar for a brand.
 */
router.post(
  "/generate",
  authMiddleware,
  validate(schemas.calendarGenerate),
  creditCheck("generate"),
  async (req, res) => {
    try {
      const { brand_id, plan_type } = req.body;
      const result = await generateCalendar(req.user.uid, brand_id, plan_type);

      res.status(201).json({
        message: "Content calendar generated.",
        ...result,
      });
    } catch (err) {
      logger.error("Calendar generation failed", { error: err.message });
      res.status(500).json({
        error: "Failed to generate calendar.",
        details: err.message,
      });
    }
  }
);

/**
 * GET /calendar/:id
 * Get a calendar with its posts.
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const calendar = await getCalendar(req.params.id, req.user.uid);
    if (!calendar) {
      return res.status(404).json({ error: "Calendar not found." });
    }
    res.json({ calendar });
  } catch (err) {
    logger.error("Get calendar failed", { error: err.message });
    res.status(500).json({ error: "Failed to fetch calendar." });
  }
});

/**
 * POST /calendar/update
 * Approve or edit a calendar and its posts.
 */
router.post(
  "/update",
  authMiddleware,
  validate(schemas.calendarUpdate),
  async (req, res) => {
    try {
      const { calendar_id, ...updates } = req.body;
      const calendar = await updateCalendar(calendar_id, req.user.uid, updates);

      if (!calendar) {
        return res.status(404).json({ error: "Calendar not found." });
      }

      res.json({ message: "Calendar updated.", calendar });
    } catch (err) {
      logger.error("Calendar update failed", { error: err.message });
      res.status(500).json({
        error: "Failed to update calendar.",
        details: err.message,
      });
    }
  }
);

module.exports = router;

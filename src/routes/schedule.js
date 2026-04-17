/**
 * Scheduling Routes — Buffer API integration.
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");
const schedulingService = require("../services/schedulingService");
const { getCalendar } = require("../services/calendarService");
const logger = require("../utils/logger");

/**
 * GET /schedule/profiles
 * Get connected Buffer profiles.
 */
router.get("/profiles", authMiddleware, async (req, res) => {
  try {
    const profiles = await schedulingService.getProfiles();
    res.json({ profiles });
  } catch (err) {
    logger.error("Get profiles failed", { error: err.message });
    res.status(500).json({ error: "Failed to fetch profiles.", details: err.message });
  }
});

/**
 * POST /schedule
 * Schedule all approved posts from a calendar.
 */
router.post(
  "/",
  authMiddleware,
  validate(schemas.schedulePosts),
  async (req, res) => {
    try {
      const { calendar_id, profile_ids, schedule_times = {} } = req.body;

      // Fetch calendar with posts
      const calendar = await getCalendar(calendar_id, req.user.uid);
      if (!calendar) {
        return res.status(404).json({ error: "Calendar not found." });
      }

      // Schedule posts
      const results = await schedulingService.scheduleCalendar(
        calendar.posts,
        profile_ids,
        schedule_times
      );

      const scheduled = results.filter((r) => r.scheduled).length;
      const failed = results.filter((r) => !r.scheduled && !r.skipped).length;
      const skipped = results.filter((r) => r.skipped).length;

      res.json({
        message: `Scheduling complete: ${scheduled} scheduled, ${skipped} skipped, ${failed} failed.`,
        calendar_id,
        results,
        summary: { scheduled, skipped, failed },
      });
    } catch (err) {
      logger.error("Scheduling failed", { error: err.message });
      res.status(500).json({ error: "Scheduling failed.", details: err.message });
    }
  }
);

module.exports = router;

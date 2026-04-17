/**
 * User Routes — registration, profile, credits.
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const userService = require("../services/userService");
const creditService = require("../services/creditService");
const logger = require("../utils/logger");

/**
 * POST /user/register
 * Register/sync user after Firebase Auth sign-up.
 */
router.post("/register", authMiddleware, async (req, res) => {
  try {
    const { plan = "free" } = req.body;
    const user = await userService.createUser(req.user.uid, req.user.email, plan);
    res.status(201).json({ message: "User registered successfully.", user });
  } catch (err) {
    logger.error("User registration failed", { error: err.message });
    res.status(500).json({ error: "Registration failed.", details: err.message });
  }
});

/**
 * GET /user/profile
 * Get current user's profile.
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await userService.getUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user });
  } catch (err) {
    logger.error("Get profile failed", { error: err.message });
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

/**
 * GET /user/credits
 * Get credit balance and usage history.
 */
router.get("/credits", authMiddleware, async (req, res) => {
  try {
    const user = await userService.getUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const usage = await creditService.getUsageHistory(req.user.uid, 20);

    res.json({
      credits: user.credits,
      plan: user.plan,
      usage_history: usage,
    });
  } catch (err) {
    logger.error("Get credits failed", { error: err.message });
    res.status(500).json({ error: "Failed to fetch credits." });
  }
});

module.exports = router;

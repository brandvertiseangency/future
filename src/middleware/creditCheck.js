/**
 * Credit check middleware — ensures user has enough credits for the operation.
 */
const { db, initialized } = require("../config/firebase");
const config = require("../config");
const logger = require("../utils/logger");

function creditCheck(costType = "generate") {
  return async (req, res, next) => {
    if (!initialized) {
      logger.warn("Credit check skipped — Firebase not initialized");
      return next();
    }

    const uid = req.user.uid;
    const cost =
      costType === "regenerate"
        ? config.credits.costRegenerate
        : config.credits.costGenerate;

    try {
      const userDoc = await db.collection("users").doc(uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User profile not found." });
      }

      const userData = userDoc.data();
      const currentCredits = userData.credits || 0;

      if (currentCredits < cost) {
        return res.status(402).json({
          error: "Insufficient credits.",
          credits_available: currentCredits,
          credits_required: cost,
          plan: userData.plan,
        });
      }

      // Attach for downstream use
      req.userPlan = userData.plan || "free";
      req.userCredits = currentCredits;
      next();
    } catch (err) {
      logger.error("Credit check failed", { error: err.message, uid });
      return res.status(500).json({ error: "Failed to verify credits." });
    }
  };
}

module.exports = creditCheck;

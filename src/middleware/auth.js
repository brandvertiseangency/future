/**
 * Firebase Auth middleware — verifies ID token from Authorization header.
 * Attaches decoded user to req.user.
 */
const { auth, initialized } = require("../config/firebase");
const logger = require("../utils/logger");

// TEMPORARY: demo bypass to share app without login.
const DEMO_AUTH_BYPASS = true;

async function authMiddleware(req, res, next) {
  if (DEMO_AUTH_BYPASS) {
    req.user = { uid: "demo-user", email: "demo@brandvertise.ai" };
    return next();
  }

  // Skip auth in development if Firebase is not configured
  if (!initialized) {
    if (process.env.NODE_ENV === "development") {
      logger.warn("Auth middleware skipped — Firebase not initialized (development only)");
      req.user = { uid: "dev-user", email: "dev@brandvertise.ai" };
      return next();
    }
    return res.status(503).json({ error: "Authentication is not configured for this environment." });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header." });
  }

  const idToken = header.split("Bearer ")[1];

  try {
    const decoded = await auth.verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error("Auth token verification failed", { error: err.message });
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = authMiddleware;

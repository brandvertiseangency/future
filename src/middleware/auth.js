/**
 * Firebase Auth middleware — verifies ID token from Authorization header.
 * Attaches decoded user to req.user.
 */
const { auth, initialized } = require("../config/firebase");
const logger = require("../utils/logger");

async function authMiddleware(req, res, next) {
  // Skip auth in development if Firebase is not configured
  if (!initialized) {
    logger.warn("Auth middleware skipped — Firebase not initialized");
    req.user = { uid: "dev-user", email: "dev@brandvertise.ai" };
    return next();
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

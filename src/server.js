/**
 * Brandvertise AI Design Hub — Main Server
 * Production-ready Express application with modular architecture.
 */
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const logger = require("./utils/logger");
const { testConnection } = require("./config/postgres");
const { testBucketConnection } = require("./services/storageService");

// ─── Route imports ───────────────────────────
const userRoutes = require("./routes/user");
const usersMeRoutes = require("./routes/usersMe");
const brandRoutes = require("./routes/brand");
const brandsRoutes = require("./routes/brands");
const assetRoutes = require("./routes/assets");
const assetsNewRoutes = require("./routes/assetsNew");
const calendarRoutes = require("./routes/calendar");
const generateRoutes = require("./routes/generate");
const generateContentRoutes = require("./routes/generateContent");
const postRoutes = require("./routes/post");
const postsRoutes = require("./routes/posts");
const scheduleRoutes = require("./routes/schedule");
const paymentRoutes = require("./routes/payment");
const onboardingRoutes = require("./routes/onboarding");
const creditsRoutes = require("./routes/credits");
const notificationsRoutes = require("./routes/notifications");
const calendarPlanRoutes = require("./routes/calendarPlan");
const chatRoutes = require("./routes/chat");
const brandProductsRoutes = require("./routes/brandProducts");

const app = express();

// ─── Security & global middleware ─────────────
app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = [
  "https://future-gilt-psi.vercel.app",
  "https://future-lcbe.vercel.app",
  "http://localhost:3000",
  "http://localhost:4000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4000",
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// Handle preflight for all routes
app.options("*", cors());
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);
const expensiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many generation requests. Please try again shortly." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/calendar/generate-plan", expensiveLimiter);
app.use("/api/calendar/plans", expensiveLimiter);
app.use("/api/generate-content", expensiveLimiter);
app.use("/api/generate", expensiveLimiter);

// ─── Static files (outputs only — prototype removed) ──
app.use("/outputs", express.static(path.join(__dirname, "../outputs")));

// ─── Request logger ───────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    body_keys: Object.keys(req.body || {}),
    ip: req.ip,
  });
  next();
});

// ─── API Routes ───────────────────────────────
app.use("/api/user", userRoutes);
app.use("/api/users", usersMeRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/assets", assetsNewRoutes);
app.use("/api/assets-legacy", assetRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/generate-content", generateContentRoutes);
app.use("/api/post", postRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/credits", creditsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/calendar", calendarPlanRoutes);  // new content pipeline (generate-plan, plans/, jobs/)
app.use("/api/chat", chatRoutes);
app.use("/api/brand-products", brandProductsRoutes);

// ─── Legacy routes (backward compatibility) ───
app.post("/generate", (req, res) => res.redirect(307, "/api/generate/legacy"));
app.post("/regenerate", (req, res) => res.redirect(307, "/api/generate/regenerate-legacy"));

// ─── Health check ─────────────────────────────
app.get("/health", async (req, res) => {
  const { initialized } = require("./config/firebase");
  const { getPool } = require("./config/postgres");

  res.json({
    status: "ok",
    service: "Brandvertise AI Design Hub",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    environment: config.env,
    modules: {
      firebase: initialized ? "connected" : "offline",
      postgres: getPool() ? "configured" : "not configured",
      gcs_bucket: process.env.GCS_BUCKET_NAME || "not configured",
      openai: config.openai.apiKey ? "configured" : "not configured",
      google_ai: config.googleAI.apiKey ? "configured" : "not configured",
      redis: (!config.redis.disabled) ? "enabled" : "disabled",
      razorpay: config.razorpay.keyId ? "configured" : "not configured",
      buffer: config.buffer.accessToken ? "configured" : "not configured",
      email: config.email.user ? "configured" : "not configured",
      twilio: config.twilio.accountSid ? "configured" : "not configured",
    },
  });
});

// ─── 404 handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found.`,
    hint: "All API routes are prefixed with /api/",
  });
});

// ─── Global error handler ─────────────────────
app.use((err, req, res, next) => {
  logger.error("Unhandled server error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });
  res.status(500).json({
    error: "Internal server error.",
    details: config.env === "development" ? err.message : undefined,
  });
});

// ─── Start server (only when run directly, not on Vercel) ───
if (require.main === module && !process.env.VERCEL) {
  const PORT = config.port;
  app.listen(PORT, async () => {
    logger.info(`🚀 Brandvertise AI Design Hub v2.0 running on port ${PORT}`);
    logger.info(`Environment: ${config.env}`);
    await testConnection();        // verify Neon DB on startup
    await testBucketConnection();  // verify GCS bucket on startup
    logger.info(`─── API Endpoints ───`);
    logger.info(`  POST   /api/user/register`);
    logger.info(`  GET    /api/user/profile`);
    logger.info(`  GET    /api/user/credits`);
    logger.info(`  POST   /api/brand/create`);
    logger.info(`  GET    /api/brand/list`);
    logger.info(`  GET    /api/brand/:id`);
    logger.info(`  PUT    /api/brand/:id`);
    logger.info(`  POST   /api/assets/upload`);
    logger.info(`  GET    /api/assets/:brand_id`);
    logger.info(`  POST   /api/calendar/generate`);
    logger.info(`  GET    /api/calendar/:id`);
    logger.info(`  POST   /api/calendar/update`);
    logger.info(`  POST   /api/generate`);
    logger.info(`  GET    /api/generate/status`);
    logger.info(`  POST   /api/post/regenerate`);
    logger.info(`  GET    /api/post/:id`);
    logger.info(`  POST   /api/schedule`);
    logger.info(`  GET    /api/schedule/profiles`);
    logger.info(`  POST   /api/payment/create-order`);
    logger.info(`  POST   /api/payment/verify`);
    logger.info(`  GET    /api/payment/plans`);
    logger.info(`  GET    /health`);
    logger.info(`─── Legacy Endpoints ───`);
    logger.info(`  POST   /generate → /api/generate/legacy`);
    logger.info(`  POST   /regenerate → /api/generate/regenerate-legacy`);
  });
}

module.exports = app;

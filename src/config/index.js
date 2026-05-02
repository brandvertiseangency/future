/**
 * Centralized configuration — reads from environment and exposes typed values.
 */
require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || "development",

  // Firebase
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  },

  // Google Cloud Storage
  gcs: {
    bucketName: process.env.GCS_BUCKET_NAME || "design-brandvertiseagency",
    projectId: process.env.GCS_PROJECT_ID || "future-brandvertise-agency",
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // Google AI Studio / Vertex AI
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
    imageModel:
      process.env.GOOGLE_NATIVE_IMAGE_MODEL ||
      process.env.GOOGLE_IMAGEN_MODEL ||
      "gemini-3-pro-image-preview",
    cloudProject: process.env.GOOGLE_CLOUD_PROJECT || "gen-lang-client-0561139131",
    cloudProjectNumber: process.env.GOOGLE_CLOUD_PROJECT_NUMBER || "457787227878",
    cloudLocation: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    disabled: process.env.REDIS_DISABLED === "true",
  },

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  // Buffer
  buffer: {
    accessToken: process.env.BUFFER_ACCESS_TOKEN,
  },

  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || "Brandvertise AI <noreply@brandvertise.ai>",
  },

  // Auth
  auth: {
    jwtSecret: process.env.JWT_SECRET || "",
    sessionSecret: process.env.SESSION_SECRET || "",
  },

  // PostgreSQL
  postgres: {
    url: process.env.DATABASE_URL,
  },

  // Credit system
  credits: {
    free: parseInt(process.env.CREDITS_FREE, 10) || 10,
    standard: parseInt(process.env.CREDITS_STANDARD, 10) || 100,
    premium: parseInt(process.env.CREDITS_PREMIUM, 10) || 500,
    costGenerate: parseInt(process.env.CREDIT_COST_GENERATE, 10) || 1,
    costRegenerate: parseInt(process.env.CREDIT_COST_REGENERATE, 10) || 1,
  },

  // Plan limits for regeneration
  plans: {
    free: { maxRegenerations: 2, maxBrands: 1, calendarPosts: 7 },
    standard: { maxRegenerations: 5, maxBrands: 5, calendarPosts: 15 },
    premium: { maxRegenerations: 10, maxBrands: 20, calendarPosts: 30 },
  },
};

if (config.env === "production") {
  const required = [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["JWT_SECRET", process.env.JWT_SECRET],
    ["SESSION_SECRET", process.env.SESSION_SECRET],
    ["RAZORPAY_WEBHOOK_SECRET", process.env.RAZORPAY_WEBHOOK_SECRET],
  ].filter(([, value]) => !value);
  if (required.length) {
    throw new Error(`Missing required production env vars: ${required.map(([k]) => k).join(", ")}`);
  }
}

module.exports = config;

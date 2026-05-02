/**
 * Creative Generation Engine — Image/Video Service
 * Generates images via Google Gemini / Imagen and manages local + cloud storage.
 */
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const storageService = require("./storageService");
const { generateImageDetailed } = require("../lib/ai");

const IMAGE_MODEL_LOG =
  process.env.GOOGLE_NATIVE_IMAGE_MODEL || "gemini-3-pro-image-preview";

const OUTPUT_DIR = path.join(__dirname, "../../outputs");

/**
 * Generate an image from a prompt and save it.
 *
 * @param {string} prompt     - Detailed generation prompt
 * @param {string} userId     - User ID for storage path
 * @param {string} brandId    - Brand ID for storage path
 * @param {string} postId     - Post ID for filename
 * @param {number} version    - Version number (for regeneration)
 * @returns {Promise<{localPath: string, cloudUrl: string|null}>}
 */
async function generateImage(prompt, userId, brandId, postId, version = 1) {
  const filename = `${postId}_v${version}.jpg`;
  const localDir = path.join(OUTPUT_DIR, userId, brandId);
  const localPath = path.join(localDir, filename);

  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  logger.info(`Generating image [${IMAGE_MODEL_LOG}]`, {
    postId,
    version,
    prompt_preview: prompt.substring(0, 150) + "...",
  });

  try {
    const imageBase64 = await callImageAPI(prompt);

    // Save locally
    const imageBuffer = Buffer.from(imageBase64, "base64");
    fs.writeFileSync(localPath, imageBuffer);

    logger.info(`Image saved locally: ${localPath}`, {
      size_kb: Math.round(imageBuffer.length / 1024),
    });

    // Upload to Google Cloud Storage
    let cloudUrl = null;
    try {
      const gcsPath = `${userId}/${brandId}/posts/${postId}/v${version}.jpg`;
      cloudUrl = await storageService.uploadBuffer(imageBuffer, gcsPath, "image/jpeg");
      logger.info("Image uploaded to GCS", { cloudUrl });
    } catch (gcsErr) {
      logger.warn("GCS upload failed — local copy preserved", {
        error: gcsErr.message,
      });
    }

    return { localPath, cloudUrl };
  } catch (err) {
    logger.error("Image generation failed", {
      postId,
      error: err.message,
    });
    throw err;
  }
}

/**
 * Generate image via shared AI helper (Google Gemini / Imagen).
 */
async function callImageAPI(prompt) {
  const imageResult = await generateImageDetailed(prompt, {
    aspectRatio: "1:1",
    timeoutMs: 120_000,
  });
  const imageData = imageResult?.imageData || "";
  const match = imageData.match(/^data:[^;]+;base64,(.+)$/);
  if (!match?.[1]) {
    throw new Error(imageResult?.error || "Image generation returned no base64 payload");
  }
  return match[1];
}

/**
 * Legacy function for backward compatibility.
 */
async function generateAndSaveImage(prompt, postIndex) {
  const filename = `post_${postIndex}.jpg`;
  const filePath = path.join(OUTPUT_DIR, filename);
  const relativePath = `outputs/${filename}`;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const imageBase64 = await callImageAPI(prompt);
  const imageBuffer = Buffer.from(imageBase64, "base64");
  fs.writeFileSync(filePath, imageBuffer);

  logger.info(`Image saved: ${relativePath}`, {
    model: IMAGE_MODEL_LOG,
    size_kb: Math.round(imageBuffer.length / 1024),
  });

  return relativePath;
}

module.exports = { generateImage, generateAndSaveImage };

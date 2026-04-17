/**
 * Creative Generation Engine — Image/Video Service
 * Generates images via Google AI Studio and manages local + cloud storage.
 */
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const logger = require("../utils/logger");
const storageService = require("./storageService");

const IMAGE_MODEL = config.googleAI.imageModel;

const IMAGEN_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict";
const NANO_BANANA_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent";

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

  logger.info(`Generating image [${IMAGE_MODEL}]`, {
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
 * Call the appropriate Google AI image generation API.
 */
async function callImageAPI(prompt) {
  const apiKey = config.googleAI.apiKey;

  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }

  let imageBase64;

  if (IMAGE_MODEL === "nano-banana") {
    const response = await axios.post(
      `${NANO_BANANA_URL}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      },
      { headers: { "Content-Type": "application/json" }, timeout: 180000 }
    );

    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData);
    if (!imgPart) {
      throw new Error("Google AI returned no image data");
    }
    imageBase64 = imgPart.inlineData.data;
  } else {
    // Imagen 4 Fast
    const response = await axios.post(
      `${IMAGEN_URL}?key=${apiKey}`,
      {
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: "1:1" },
      },
      { headers: { "Content-Type": "application/json" }, timeout: 180000 }
    );

    const predictions = response.data?.predictions;
    if (!predictions || predictions.length === 0) {
      throw new Error("Imagen returned no predictions");
    }
    imageBase64 = predictions[0].bytesBase64Encoded;
    if (!imageBase64) {
      throw new Error("Imagen prediction missing image data");
    }
  }

  return imageBase64;
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
    model: IMAGE_MODEL,
    size_kb: Math.round(imageBuffer.length / 1024),
  });

  return relativePath;
}

module.exports = { generateImage, generateAndSaveImage };

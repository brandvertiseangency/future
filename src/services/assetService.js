/**
 * Asset Service — manages brand assets (logos, product images, references).
 */
const { db, initialized } = require("../config/firebase");
const storageService = require("./storageService");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const COLLECTION = "assets";

/**
 * Upload and register a brand asset.
 * @param {string} userId
 * @param {string} brandId
 * @param {string} type        - "logo" | "product" | "reference"
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @param {string} mimeType
 * @param {string} tags
 * @returns {Promise<object>}
 */
async function uploadAsset(userId, brandId, type, fileBuffer, originalName, mimeType, tags = "") {
  const ext = originalName.split(".").pop() || "jpg";
  const filename = `${uuidv4()}.${ext}`;
  const gcsPath = storageService.buildPath(userId, brandId, "assets", filename);

  // Upload to GCS
  let fileUrl = null;
  try {
    fileUrl = await storageService.uploadBuffer(fileBuffer, gcsPath, mimeType);
  } catch (err) {
    logger.warn("GCS upload failed for asset", { error: err.message });
  }

  // Store metadata in Firestore
  const assetData = {
    user_id: userId,
    brand_id: brandId,
    type,
    file_url: fileUrl || `local://${gcsPath}`,
    tags,
    original_name: originalName,
    mime_type: mimeType,
    created_at: new Date().toISOString(),
  };

  if (initialized) {
    const docRef = await db.collection(COLLECTION).add(assetData);
    logger.info("Asset uploaded", { id: docRef.id, type, brandId });
    return { id: docRef.id, ...assetData };
  }

  const id = uuidv4();
  logger.info("Asset uploaded (offline)", { id, type });
  return { id, ...assetData };
}

/**
 * Get all assets for a brand.
 */
async function getAssets(userId, brandId) {
  if (!initialized) return [];

  const snap = await db
    .collection(COLLECTION)
    .where("user_id", "==", userId)
    .where("brand_id", "==", brandId)
    .orderBy("created_at", "desc")
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get assets by type for a brand.
 */
async function getAssetsByType(userId, brandId, type) {
  if (!initialized) return [];

  const snap = await db
    .collection(COLLECTION)
    .where("user_id", "==", userId)
    .where("brand_id", "==", brandId)
    .where("type", "==", type)
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Delete an asset.
 */
async function deleteAsset(assetId, userId) {
  if (!initialized) return false;

  const doc = await db.collection(COLLECTION).doc(assetId).get();
  if (!doc.exists) return false;

  const data = doc.data();
  if (data.user_id !== userId) return false;

  // Delete from GCS if possible
  if (data.file_url && data.file_url.startsWith("https://")) {
    const gcsPath = data.file_url.split(`${process.env.GCS_BUCKET_NAME}/`)[1];
    if (gcsPath) await storageService.deleteFile(gcsPath);
  }

  await db.collection(COLLECTION).doc(assetId).delete();
  logger.info("Asset deleted", { assetId });
  return true;
}

module.exports = {
  uploadAsset,
  getAssets,
  getAssetsByType,
  deleteAsset,
};

/**
 * Storage Module — Google Cloud Storage integration.
 * Uses @google-cloud/storage directly with the Firebase service account
 * so it works regardless of which GCP project the bucket lives in.
 */
const { Storage } = require("@google-cloud/storage");
const logger = require("../utils/logger");

// Initialise GCS client from the Firebase service account JSON
let _bucket = null;

function getBucket() {
  if (_bucket) return _bucket;

  const bucketName = process.env.GCS_BUCKET_NAME;
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!bucketName || !saJson) {
    logger.warn("GCS not configured — GCS_BUCKET_NAME or FIREBASE_SERVICE_ACCOUNT_JSON missing");
    return null;
  }

  try {
    const credentials = JSON.parse(saJson);
    const storage = new Storage({ credentials, projectId: credentials.project_id });
    _bucket = storage.bucket(bucketName);
    logger.info("GCS client initialised", { bucket: bucketName });
  } catch (err) {
    logger.error("GCS client init failed", { error: err.message });
    return null;
  }

  return _bucket;
}

/**
 * Upload a buffer to GCS.
 * @param {Buffer} buffer   - File buffer
 * @param {string} gcsPath  - Path inside bucket (e.g., userId/brandId/assets/file.jpg)
 * @param {string} mimeType - MIME type
 * @returns {Promise<string>} Public URL
 */
async function uploadBuffer(buffer, gcsPath, mimeType = "image/jpeg") {
  const bucket = getBucket();
  if (!bucket) {
    logger.warn("GCS upload skipped — bucket not configured");
    return null;
  }

  const file = bucket.file(gcsPath);
  await file.save(buffer, {
    metadata: { contentType: mimeType, cacheControl: "public, max-age=31536000" },
    resumable: false,
  });
  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsPath}`;
  logger.info("File uploaded to GCS", { gcsPath, publicUrl });
  return publicUrl;
}

/**
 * Upload a local file to GCS.
 * @param {string} localPath  - Local file path
 * @param {string} gcsPath    - Destination path in bucket
 * @param {string} mimeType   - MIME type
 * @returns {Promise<string>} Public URL
 */
async function uploadFile(localPath, gcsPath, mimeType) {
  const bucket = getBucket();
  if (!bucket) {
    logger.warn("GCS upload skipped — bucket not configured");
    return null;
  }

  await bucket.upload(localPath, {
    destination: gcsPath,
    metadata: { contentType: mimeType, cacheControl: "public, max-age=31536000" },
  });
  await bucket.file(gcsPath).makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsPath}`;
  logger.info("File uploaded to GCS", { localPath, publicUrl });
  return publicUrl;
}

/**
 * Generate a signed URL for temporary access.
 * @param {string} gcsPath   - Path in bucket
 * @param {number} expiresIn - Expiry in minutes (default 60)
 * @returns {Promise<string>}
 */
async function getSignedUrl(gcsPath, expiresIn = 60) {
  const bucket = getBucket();
  if (!bucket) return null;

  const [url] = await bucket.file(gcsPath).getSignedUrl({
    action: "read",
    expires: Date.now() + expiresIn * 60 * 1000,
  });
  return url;
}

/**
 * Delete a file from GCS.
 * @param {string} gcsPath
 */
async function deleteFile(gcsPath) {
  const bucket = getBucket();
  if (!bucket) return;

  try {
    await bucket.file(gcsPath).delete();
    logger.info("File deleted from GCS", { gcsPath });
  } catch (err) {
    logger.warn("GCS delete failed", { gcsPath, error: err.message });
  }
}

/**
 * Build the standard storage path.
 */
function buildPath(userId, brandId, category, filename) {
  return `${userId}/${brandId}/${category}/${filename}`;
}

/**
 * Test bucket connectivity — called on server start.
 */
async function testBucketConnection() {
  const bucket = getBucket();
  if (!bucket) return false;
  try {
    const [meta] = await bucket.getMetadata();
    logger.info("GCS bucket connected", { name: meta.name, location: meta.location });
    return true;
  } catch (err) {
    logger.error("GCS bucket connection failed", { error: err.message });
    return false;
  }
}

module.exports = { uploadBuffer, uploadFile, getSignedUrl, deleteFile, buildPath, testBucketConnection, getBucket };

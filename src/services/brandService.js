/**
 * Brand Intelligence Service
 * CRUD for brand profiles in Firestore.
 */
const { db, initialized } = require("../config/firebase");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const COLLECTION = "brands";

/**
 * Create a new brand profile.
 */
async function createBrand(userId, data) {
  const brand = {
    user_id: userId,
    brand_name: data.brand_name,
    industry: data.industry,
    target_audience: data.target_audience,
    goals: data.goals,
    tone: data.tone || "professional and engaging",
    color_style: data.color_style || "",
    design_preference: data.design_preference || "modern and minimal",
    competitor_data: data.competitor_data || "",
    created_at: new Date().toISOString(),
  };

  if (!initialized) {
    const id = uuidv4();
    logger.info("Brand created (offline)", { id, brand_name: brand.brand_name });
    return { id, ...brand };
  }

  const docRef = await db.collection(COLLECTION).add(brand);
  logger.info("Brand created", { id: docRef.id, brand_name: brand.brand_name });
  return { id: docRef.id, ...brand };
}

/**
 * Get a brand by ID — verifies ownership.
 */
async function getBrand(brandId, userId) {
  if (!initialized) return null;

  const doc = await db.collection(COLLECTION).doc(brandId).get();
  if (!doc.exists) return null;

  const data = doc.data();
  if (data.user_id !== userId) return null; // ownership check

  return { id: doc.id, ...data };
}

/**
 * List all brands for a user.
 */
async function listBrands(userId) {
  if (!initialized) return [];

  const snap = await db
    .collection(COLLECTION)
    .where("user_id", "==", userId)
    .orderBy("created_at", "desc")
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Update brand fields.
 */
async function updateBrand(brandId, userId, updates) {
  if (!initialized) return null;

  const brand = await getBrand(brandId, userId);
  if (!brand) return null;

  const allowedFields = [
    "brand_name",
    "industry",
    "target_audience",
    "goals",
    "tone",
    "color_style",
    "design_preference",
    "competitor_data",
  ];

  const filtered = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }

  await db.collection(COLLECTION).doc(brandId).update(filtered);
  logger.info("Brand updated", { brandId });
  return { id: brandId, ...brand, ...filtered };
}

module.exports = {
  createBrand,
  getBrand,
  listBrands,
  updateBrand,
};

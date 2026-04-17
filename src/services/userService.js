/**
 * User & Subscription Service
 * Manages user profiles, plans, and credits in Firestore.
 */
const { db, initialized } = require("../config/firebase");
const config = require("../config");
const logger = require("../utils/logger");

const COLLECTION = "users";

/**
 * Create or update a user profile after Firebase Auth sign-up.
 */
async function createUser(uid, email, plan = "free") {
  if (!initialized) {
    logger.warn("createUser skipped — Firestore offline");
    return { id: uid, email, plan, credits: config.credits[plan] };
  }

  const creditMap = {
    free: config.credits.free,
    standard: config.credits.standard,
    premium: config.credits.premium,
  };

  const userData = {
    email,
    plan,
    credits: creditMap[plan] || creditMap.free,
    created_at: new Date().toISOString(),
  };

  await db.collection(COLLECTION).doc(uid).set(userData, { merge: true });
  logger.info("User created/updated", { uid, plan });
  return { id: uid, ...userData };
}

/**
 * Get user profile by UID.
 */
async function getUser(uid) {
  if (!initialized) return null;
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Deduct credits from a user.
 * Returns updated credit balance or throws if insufficient.
 */
async function deductCredits(uid, amount) {
  if (!initialized) {
    logger.warn("deductCredits skipped — Firestore offline");
    return 999;
  }

  const userRef = db.collection(COLLECTION).doc(uid);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);
    if (!doc.exists) throw new Error("User not found");

    const current = doc.data().credits || 0;
    if (current < amount) {
      throw new Error(`Insufficient credits. Have ${current}, need ${amount}.`);
    }

    const updated = current - amount;
    tx.update(userRef, { credits: updated });
    logger.info("Credits deducted", { uid, deducted: amount, remaining: updated });
    return updated;
  });
}

/**
 * Add credits to a user (e.g., after payment).
 */
async function addCredits(uid, amount) {
  if (!initialized) return;

  const userRef = db.collection(COLLECTION).doc(uid);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);
    if (!doc.exists) throw new Error("User not found");

    const current = doc.data().credits || 0;
    const updated = current + amount;
    tx.update(userRef, { credits: updated, plan: getPlanForCredits(updated) });
    logger.info("Credits added", { uid, added: amount, total: updated });
    return updated;
  });
}

/**
 * Upgrade user plan.
 */
async function upgradePlan(uid, plan) {
  if (!initialized) return;

  const creditMap = {
    free: config.credits.free,
    standard: config.credits.standard,
    premium: config.credits.premium,
  };

  await db.collection(COLLECTION).doc(uid).update({
    plan,
    credits: creditMap[plan] || creditMap.free,
  });

  logger.info("Plan upgraded", { uid, plan });
}

function getPlanForCredits(credits) {
  if (credits >= config.credits.premium) return "premium";
  if (credits >= config.credits.standard) return "standard";
  return "free";
}

module.exports = {
  createUser,
  getUser,
  deductCredits,
  addCredits,
  upgradePlan,
};

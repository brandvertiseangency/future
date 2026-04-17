/**
 * Credit & Usage Control Service.
 * Manages credit deductions, usage tracking, and plan enforcement.
 */
const { db, initialized } = require("../config/firebase");
const config = require("../config");
const logger = require("../utils/logger");

const USAGE_COLLECTION = "credit_usage";

/**
 * Check if a user can perform an action based on credits and plan limits.
 */
async function canPerform(uid, action = "generate") {
  if (!initialized) return { allowed: true, credits: 999 };

  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return { allowed: false, reason: "User not found" };

  const user = userDoc.data();
  const cost =
    action === "regenerate"
      ? config.credits.costRegenerate
      : config.credits.costGenerate;

  if ((user.credits || 0) < cost) {
    return {
      allowed: false,
      reason: "Insufficient credits",
      credits: user.credits,
      cost,
      plan: user.plan,
    };
  }

  return { allowed: true, credits: user.credits, cost, plan: user.plan };
}

/**
 * Deduct credits and log usage.
 */
async function deductAndLog(uid, action, metadata = {}) {
  if (!initialized) {
    logger.warn("Credit deduction skipped — Firestore offline");
    return { success: true, remaining: 999 };
  }

  const cost =
    action === "regenerate"
      ? config.credits.costRegenerate
      : config.credits.costGenerate;

  const userRef = db.collection("users").doc(uid);

  const remaining = await db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);
    if (!doc.exists) throw new Error("User not found");

    const current = doc.data().credits || 0;
    if (current < cost) throw new Error("Insufficient credits");

    const updated = current - cost;
    tx.update(userRef, { credits: updated });
    return updated;
  });

  // Log usage
  await db.collection(USAGE_COLLECTION).add({
    user_id: uid,
    action,
    cost,
    remaining,
    metadata,
    created_at: new Date().toISOString(),
  });

  logger.info("Credit deducted", { uid, action, cost, remaining });
  return { success: true, remaining };
}

/**
 * Check regeneration limit based on plan.
 */
async function checkRegenLimit(uid, postId) {
  if (!initialized) return { allowed: true };

  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return { allowed: false, reason: "User not found" };

  const plan = userDoc.data().plan || "free";
  const maxRegen = config.plans[plan]?.maxRegenerations || 2;

  const postDoc = await db.collection("posts").doc(postId).get();
  if (!postDoc.exists) return { allowed: false, reason: "Post not found" };

  const regenCount = postDoc.data().regeneration_count || 0;

  if (regenCount >= maxRegen) {
    return {
      allowed: false,
      reason: `Regeneration limit reached (${maxRegen} per post on ${plan} plan)`,
      regeneration_count: regenCount,
      max_allowed: maxRegen,
      plan,
    };
  }

  return { allowed: true, regeneration_count: regenCount, max_allowed: maxRegen };
}

/**
 * Get usage history for a user.
 */
async function getUsageHistory(uid, limit = 50) {
  if (!initialized) return [];

  const snap = await db
    .collection(USAGE_COLLECTION)
    .where("user_id", "==", uid)
    .orderBy("created_at", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

module.exports = {
  canPerform,
  deductAndLog,
  checkRegenLimit,
  getUsageHistory,
};

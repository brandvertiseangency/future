/**
 * Regeneration Service — handles post regeneration with feedback.
 */
const { db, initialized } = require("../config/firebase");
const config = require("../config");
const logger = require("../utils/logger");
const { buildPrompt } = require("./promptService");
const { generateImage } = require("./imageService");
const creditService = require("./creditService");

/**
 * Regenerate a single post with feedback.
 *
 * @param {string} uid      - User ID
 * @param {string} postId   - Post document ID
 * @param {string} feedback - User feedback for regeneration
 * @returns {Promise<object>}
 */
async function regeneratePost(uid, postId, feedback) {
  // 1. Check regeneration limit
  const limitCheck = await creditService.checkRegenLimit(uid, postId);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.reason);
  }

  // 2. Check credits
  const creditCheck = await creditService.canPerform(uid, "regenerate");
  if (!creditCheck.allowed) {
    throw new Error(creditCheck.reason);
  }

  // 3. Fetch post and related data
  let post, brand, assets;

  if (initialized) {
    const postDoc = await db.collection("posts").doc(postId).get();
    if (!postDoc.exists) throw new Error("Post not found");
    post = { id: postDoc.id, ...postDoc.data() };

    // Get calendar to find brand
    const calDoc = await db
      .collection("content_calendars")
      .doc(post.calendar_id)
      .get();
    if (!calDoc.exists) throw new Error("Calendar not found");
    const cal = calDoc.data();

    if (cal.user_id !== uid) throw new Error("Unauthorized");

    // Get brand
    const brandDoc = await db.collection("brands").doc(cal.brand_id).get();
    brand = brandDoc.exists ? { id: brandDoc.id, ...brandDoc.data() } : {};

    // Get assets
    const assetsSnap = await db
      .collection("assets")
      .where("brand_id", "==", cal.brand_id)
      .get();
    assets = assetsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // 4. Build new prompt with feedback
    const newPrompt = buildPrompt(post, brand, assets, feedback);

    // 5. Generate new image
    const version = (post.regeneration_count || 0) + 2; // v1 is original, v2+ are regens
    const result = await generateImage(
      newPrompt,
      uid,
      cal.brand_id,
      postId,
      version
    );

    // 6. Update post in Firestore
    const outputUrls = [...(post.output_urls || [])];
    if (result.cloudUrl) outputUrls.push(result.cloudUrl);
    else if (result.localPath) outputUrls.push(result.localPath);

    await db.collection("posts").doc(postId).update({
      prompt: newPrompt,
      output_urls: outputUrls,
      regeneration_count: (post.regeneration_count || 0) + 1,
      status: "generated",
      last_regenerated_at: new Date().toISOString(),
    });

    // 7. Deduct credits
    await creditService.deductAndLog(uid, "regenerate", {
      post_id: postId,
      feedback,
    });

    logger.info("Post regenerated", {
      postId,
      version,
      regeneration_count: (post.regeneration_count || 0) + 1,
    });

    return {
      post_id: postId,
      version,
      regeneration_count: (post.regeneration_count || 0) + 1,
      output_url: result.cloudUrl || result.localPath,
      prompt: newPrompt,
      feedback_applied: feedback,
    };
  } else {
    // Offline mode for development
    logger.info("Regeneration in offline mode", { postId, feedback });
    return {
      post_id: postId,
      version: 2,
      regeneration_count: 1,
      output_url: null,
      prompt: "offline-prompt",
      feedback_applied: feedback,
    };
  }
}

module.exports = { regeneratePost };

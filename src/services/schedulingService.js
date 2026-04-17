/**
 * Scheduling Service — Buffer API integration for post scheduling.
 */
const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");

const BUFFER_API_BASE = "https://api.bufferapp.com/1";

/**
 * Get connected Buffer profiles.
 */
async function getProfiles() {
  if (!config.buffer.accessToken) {
    logger.warn("Buffer not configured");
    return [];
  }

  try {
    const response = await axios.get(
      `${BUFFER_API_BASE}/profiles.json?access_token=${config.buffer.accessToken}`
    );
    return response.data.map((p) => ({
      id: p.id,
      service: p.service,
      service_username: p.service_username,
      formatted_service: p.formatted_service,
      avatar: p.avatar,
    }));
  } catch (err) {
    logger.error("Buffer getProfiles failed", { error: err.message });
    throw new Error("Failed to fetch Buffer profiles");
  }
}

/**
 * Schedule a single post to Buffer.
 * @param {object} options
 * @param {string[]} options.profile_ids - Buffer profile IDs to post to
 * @param {string} options.text         - Post text / caption
 * @param {string} [options.media_url]  - Image URL (must be publicly accessible)
 * @param {string} [options.scheduled_at] - ISO 8601 timestamp for scheduling
 * @returns {Promise<object>}
 */
async function schedulePost({ profile_ids, text, media_url, scheduled_at }) {
  if (!config.buffer.accessToken) {
    logger.warn("Buffer not configured — scheduling logged only");
    return { scheduled: false, logged: true };
  }

  try {
    const body = {
      access_token: config.buffer.accessToken,
      profile_ids,
      text,
      now: !scheduled_at,
    };

    if (media_url) {
      body.media = { photo: media_url };
    }

    if (scheduled_at) {
      body.scheduled_at = scheduled_at;
    }

    const response = await axios.post(
      `${BUFFER_API_BASE}/updates/create.json`,
      null,
      { params: body }
    );

    logger.info("Post scheduled via Buffer", {
      success: response.data.success,
      id: response.data.updates?.[0]?.id,
    });

    return {
      scheduled: true,
      buffer_update_id: response.data.updates?.[0]?.id,
      message: response.data.message,
    };
  } catch (err) {
    logger.error("Buffer schedule failed", { error: err.message });
    throw new Error(`Buffer scheduling failed: ${err.message}`);
  }
}

/**
 * Schedule all approved posts from a calendar.
 * @param {object[]} posts      - Array of post objects with captions and output_urls
 * @param {string[]} profileIds - Buffer profile IDs
 * @param {object} scheduleTimes - Map of postId → ISO timestamp (optional)
 * @returns {Promise<object[]>}
 */
async function scheduleCalendar(posts, profileIds, scheduleTimes = {}) {
  const results = [];

  for (const post of posts) {
    if (post.status !== "generated" && post.status !== "approved") {
      results.push({ post_id: post.id, skipped: true, reason: "Not generated/approved" });
      continue;
    }

    const imageUrl =
      post.output_urls && post.output_urls.length > 0
        ? post.output_urls[post.output_urls.length - 1] // latest version
        : null;

    try {
      const result = await schedulePost({
        profile_ids: profileIds,
        text: post.caption || post.idea,
        media_url: imageUrl,
        scheduled_at: scheduleTimes[post.id] || null,
      });

      results.push({ post_id: post.id, ...result });
    } catch (err) {
      results.push({ post_id: post.id, scheduled: false, error: err.message });
    }
  }

  logger.info("Calendar scheduling complete", {
    total: posts.length,
    scheduled: results.filter((r) => r.scheduled).length,
    skipped: results.filter((r) => r.skipped).length,
    failed: results.filter((r) => !r.scheduled && !r.skipped).length,
  });

  return results;
}

module.exports = {
  getProfiles,
  schedulePost,
  scheduleCalendar,
};

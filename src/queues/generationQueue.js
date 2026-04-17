/**
 * Generation Queue — Postgres-based (replaces BullMQ/Redis).
 */
const { enqueue, getJob } = require("./pgQueue");
const logger = require("../utils/logger");

const JOB_TYPE = "generate_creative";

/**
 * Add a generation job to the Postgres queue.
 * @param {object} data - { userId, calendarId, postId, post, brand, assets }
 */
async function addGenerationJob(data) {
  try {
    const jobId = await enqueue(JOB_TYPE, data);
    logger.info("Generation job enqueued", { jobId, postId: data.postId });
    return { jobId, postId: data.postId };
  } catch (err) {
    logger.error("Failed to enqueue generation job", { error: err.message });
    return null;
  }
}

/**
 * Get job status by ID.
 */
async function getJobStatus(jobId) {
  return getJob(jobId);
}

module.exports = { addGenerationJob, getJobStatus, JOB_TYPE };

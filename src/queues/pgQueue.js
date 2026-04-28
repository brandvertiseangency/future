/**
 * Postgres Job Queue — replaces Redis/BullMQ entirely.
 * Uses SELECT … FOR UPDATE SKIP LOCKED for safe concurrent workers.
 */
const { query, getPool } = require("../config/postgres");
const logger = require("../utils/logger");
let lastCleanupAt = 0;
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

const trimText = (value, maxLen = 1200) => {
  if (!value) return "";
  const s = String(value);
  return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
};

async function cleanupOldJobs() {
  try {
    await query(
      `DELETE FROM job_queue
       WHERE status IN ('completed','failed')
         AND COALESCE(completed_at, updated_at, created_at) < NOW() - INTERVAL '7 days'`
    );
  } catch (err) {
    logger.warn("Job queue cleanup failed", { error: err.message });
  }
}

/**
 * Add a job to the queue.
 * @param {string} type     — job type, e.g. "generate_post"
 * @param {object} payload  — data passed to the worker
 * @param {number} [delaySecs=0] — delay before the job becomes runnable
 */
async function enqueue(type, payload = {}, delaySecs = 0) {
  if (Date.now() - lastCleanupAt > CLEANUP_INTERVAL_MS) {
    lastCleanupAt = Date.now();
    cleanupOldJobs();
  }
  const res = await query(
    `INSERT INTO job_queue (type, payload, run_at)
     VALUES ($1, $2, NOW() + ($3 || ' seconds')::interval)
     RETURNING id`,
    [type, JSON.stringify(payload), delaySecs]
  );
  const jobId = res.rows[0].id;
  logger.info("Job enqueued", { id: jobId, type });
  return jobId;
}

/**
 * Claim the next available job of a given type (or any type if omitted).
 * Uses SKIP LOCKED so multiple workers don't clash.
 */
async function dequeue(type = null) {
  const pool = getPool();
  if (!pool) return null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const typeFilter = type ? "AND type = $2" : "";
    const params = type ? ["pending", type] : ["pending"];

    const res = await client.query(
      `SELECT * FROM job_queue
       WHERE status = $1 ${typeFilter} AND run_at <= NOW()
       ORDER BY run_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
      params
    );

    if (res.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const job = res.rows[0];
    await client.query(
      `UPDATE job_queue SET status = 'processing', started_at = NOW(), attempts = attempts + 1 WHERE id = $1`,
      [job.id]
    );

    await client.query("COMMIT");
    return job;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Mark a job as completed.
 */
async function complete(jobId, result = {}) {
  const safeResult = trimText(JSON.stringify(result || {}), 2000);
  await query(
    `UPDATE job_queue SET status = 'completed', result = $2, completed_at = NOW() WHERE id = $1`,
    [jobId, safeResult]
  );
  logger.info("Job completed", { id: jobId });
}

/**
 * Mark a job as failed. Retries if under max_attempts.
 */
async function fail(jobId, errorMessage, retryDelaySecs = 30) {
  const safeError = trimText(errorMessage, 1000);
  const res = await query(
    `UPDATE job_queue
     SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'pending' END,
         error  = $2,
         run_at = CASE WHEN attempts >= max_attempts THEN run_at ELSE NOW() + ($3 || ' seconds')::interval END
     WHERE id = $1
     RETURNING status, attempts, max_attempts`,
    [jobId, safeError, retryDelaySecs]
  );
  const row = res.rows[0];
  logger.warn("Job failed", { id: jobId, status: row?.status, attempts: row?.attempts });
}

/**
 * Get job status by ID.
 */
async function getJob(jobId) {
  const res = await query("SELECT * FROM job_queue WHERE id = $1", [jobId]);
  return res.rows[0] || null;
}

/**
 * Simple polling worker — calls handler(job) for each job of given type.
 * @param {string}   type        — job type to handle
 * @param {Function} handler     — async (job) => result
 * @param {number}   [pollMs=3000] — polling interval in ms
 */
function startWorker(type, handler, pollMs = 3000) {
  logger.info(`Worker started for job type: "${type}" (polling every ${pollMs}ms)`);

  const tick = async () => {
    try {
      const job = await dequeue(type);
      if (job) {
        logger.info("Processing job", { id: job.id, type: job.type });
        try {
          const result = await handler(job);
          await complete(job.id, result || {});
        } catch (err) {
          logger.error("Job handler error", { id: job.id, error: err.message });
          await fail(job.id, err.message);
        }
      }
    } catch (err) {
      logger.error("Worker tick error", { type, error: err.message });
    }
    setTimeout(tick, pollMs);
  };

  tick();
}

module.exports = { enqueue, dequeue, complete, fail, getJob, startWorker };

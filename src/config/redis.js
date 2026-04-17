/**
 * Redis connection for BullMQ.
 * Gracefully degrades when Redis is not available — the app runs without queues.
 */
const config = require("./index");
const logger = require("../utils/logger");

let connection = null;
let redisAvailable = false;
let errorLogged = false;

function getRedisConnection() {
  if (connection) return redisAvailable ? connection : null;

  // Don't even try if no Redis is expected (e.g. env flag)
  if (config.redis.disabled) {
    logger.info("Redis disabled via config — queue system off");
    return null;
  }

  try {
    const IORedis = require("ioredis");

    connection = new IORedis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null, // required by BullMQ
      enableReadyCheck: false,
      retryStrategy(times) {
        // Stop retrying after 3 attempts — don't spam logs
        if (times > 3) {
          if (!errorLogged) {
            logger.warn(
              "Redis unreachable after 3 attempts — queue system disabled. App continues without it."
            );
            errorLogged = true;
          }
          return null; // stop reconnecting
        }
        return Math.min(times * 500, 2000);
      },
      lazyConnect: true, // don't connect until we actually need it
    });

    connection.on("connect", () => {
      redisAvailable = true;
      logger.info("Redis connected");
    });

    connection.on("error", (err) => {
      if (!errorLogged) {
        logger.warn("Redis connection error — queue system disabled", {
          error: err.message,
        });
        errorLogged = true;
      }
      redisAvailable = false;
    });

    connection.on("close", () => {
      redisAvailable = false;
    });

    // Attempt a non-blocking connect
    connection.connect().catch(() => {
      redisAvailable = false;
    });

    return connection;
  } catch (err) {
    logger.warn("Redis not available — queue system disabled", {
      error: err.message,
    });
    return null;
  }
}

module.exports = { getRedisConnection };

/**
 * PostgreSQL (Neon) connection pool.
 * Uses the pooled DATABASE_URL for all standard queries.
 * Use DATABASE_URL_UNPOOLED for migrations / DDL statements.
 */
require("dotenv").config();
const { Pool } = require("pg");
const logger = require("../utils/logger");

let pool = null;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    logger.warn("DATABASE_URL not set — PostgreSQL unavailable");
    return null;
  }

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    // Suppress pg SSL mode warning — we're locked to verify-full via Neon
    ...(connectionString.includes("sslmode=require") && {
      connectionString: connectionString.replace("sslmode=require", "sslmode=verify-full"),
    }),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  pool.on("connect", () => logger.info("PostgreSQL pool: new client connected"));
  pool.on("error", (err) => logger.error("PostgreSQL pool error", { error: err.message }));

  return pool;
}

/**
 * Execute a parameterised query.
 * @param {string} text   — SQL string with $1, $2 … placeholders
 * @param {Array}  params — bound parameter values
 */
async function query(text, params = []) {
  const p = getPool();
  if (!p) throw new Error("PostgreSQL not configured");
  const start = Date.now();
  const res = await p.query(text, params);
  logger.debug("PG query", { text, duration: Date.now() - start, rows: res.rowCount });
  return res;
}

/**
 * Test the connection — called on server start.
 */
async function testConnection() {
  try {
    const res = await query("SELECT NOW() AS now");
    logger.info("PostgreSQL connected", { serverTime: res.rows[0].now });
    return true;
  } catch (err) {
    logger.error("PostgreSQL connection failed", { error: err.message });
    return false;
  }
}

module.exports = { getPool, query, testConnection };

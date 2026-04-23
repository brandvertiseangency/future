/**
 * Migration: Add partial unique index on brands(user_id) WHERE is_default = TRUE
 * Fixes: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
 */
const { getPool } = require('../../config/postgres');
const logger = require('../../utils/logger');

async function run() {
  const pool = getPool();
  if (!pool) {
    console.error('No DB pool available');
    process.exit(1);
  }
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS brands_user_id_is_default_unique
      ON brands (user_id)
      WHERE is_default = TRUE;
    `);
    console.log('✅ Partial unique index brands_user_id_is_default_unique created (or already exists).');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();

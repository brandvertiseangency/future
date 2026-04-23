/**
 * Migration: Add brand info fields — logo_url, tagline, website, phone, address
 * Run with: node src/db/migrations/add-brand-info-fields.js
 */
const { getPool } = require('../../config/postgres');
const logger = require('../../utils/logger');

async function migrate() {
  const pool = getPool();
  if (!pool) { console.error('No DB connection'); process.exit(1); }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cols = [
      `ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url TEXT`,
      `ALTER TABLE brands ADD COLUMN IF NOT EXISTS tagline TEXT`,
      `ALTER TABLE brands ADD COLUMN IF NOT EXISTS website TEXT`,
      `ALTER TABLE brands ADD COLUMN IF NOT EXISTS phone TEXT`,
      `ALTER TABLE brands ADD COLUMN IF NOT EXISTS address TEXT`,
    ];
    for (const sql of cols) {
      await client.query(sql);
      console.log('✓', sql);
    }

    await client.query('COMMIT');
    console.log('\n✅ Migration complete — brand info fields added.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();

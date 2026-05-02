require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inDollar = false;
  let dollarTag = '';

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    const next2 = sql.slice(i, i + 2);

    if (!inSingle && !inDouble && ch === '$') {
      const m = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
      if (m) {
        const tag = m[0];
        if (!inDollar) {
          inDollar = true;
          dollarTag = tag;
        } else if (dollarTag === tag) {
          inDollar = false;
          dollarTag = '';
        }
        current += tag;
        i += tag.length - 1;
        continue;
      }
    }

    if (!inDouble && !inDollar && ch === '\'' && sql[i - 1] !== '\\') inSingle = !inSingle;
    else if (!inSingle && !inDollar && ch === '"' && sql[i - 1] !== '\\') inDouble = !inDouble;

    if (!inSingle && !inDouble && !inDollar && next2 === '--') {
      const nl = sql.indexOf('\n', i + 2);
      if (nl === -1) break;
      current += sql.slice(i, nl + 1);
      i = nl;
      continue;
    }

    if (!inSingle && !inDouble && !inDollar && ch === ';') {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id BIGSERIAL PRIMARY KEY,
        file_name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) =>
        f.endsWith('.sql') &&
        !f.startsWith('.') &&
        !f.startsWith('._')
      )
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM schema_migrations WHERE file_name=$1 LIMIT 1',
        [file]
      );
      if (rows[0]) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = splitSqlStatements(sql);
      console.log(`Applying migration: ${file} (${statements.length} statements)`);
      await client.query('BEGIN');
      try {
        for (let i = 0; i < statements.length; i += 1) {
          await client.query(statements[i]);
        }
        await client.query(
          'INSERT INTO schema_migrations (file_name) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`Applied migration: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed migration file: ${file}`);
        console.error('Error code:', err.code || 'n/a');
        console.error('Error detail:', err.detail || 'n/a');
        throw err;
      }
    }
    console.log('Migration files are up to date.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration runner failed:', err.message);
  process.exit(1);
});

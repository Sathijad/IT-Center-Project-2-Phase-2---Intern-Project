const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'itcenter_auth',
  user: process.env.DB_USER || 'itcenter',
  password: process.env.DB_PASSWORD || 'password',
});

const migrationsDir = path.join(__dirname, '../migrations');
const seedFile = 'seed_leave_policies.sql';
const seedPath = path.join(migrationsDir, seedFile);

async function runSeed() {
  console.log(`Running seed: ${seedFile}`);

  try {
    const sql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(sql);
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();


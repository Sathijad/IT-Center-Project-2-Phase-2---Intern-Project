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

async function runMigrations() {
  const direction = process.argv[2] || 'up';
  const migrationFile = direction === 'up' ? 'v2__leave_attendance.sql' : 'v2__leave_attendance_down.sql';
  const migrationPath = path.join(migrationsDir, migrationFile);

  console.log(`Running ${direction} migration: ${migrationFile}`);

  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();


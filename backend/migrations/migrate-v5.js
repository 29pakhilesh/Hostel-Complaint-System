import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Add short tracking_code column for public complaint tracking
    await client.query(`
      ALTER TABLE complaints
      ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(10) UNIQUE;
    `);

    // Backfill tracking_code for existing complaints that don't have one
    // Note: simple random 6-digit codes; collisions are unlikely for small datasets
    await client.query(`
      UPDATE complaints
      SET tracking_code = LPAD((FLOOR(random() * 1000000))::text, 6, '0')
      WHERE tracking_code IS NULL;
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration v5 completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration v5 failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => {
    console.log('Migration v5 process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration v5 process failed:', error);
    process.exit(1);
  });


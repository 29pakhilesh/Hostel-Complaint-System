import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Add rejected to complaint_status enum (same pattern as migrate-v4)
    await client.query(`
      DO $$ BEGIN
        ALTER TYPE complaint_status ADD VALUE 'rejected';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration v6 completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration v6 failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => {
    console.log('Migration v6 process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration v6 process failed:', error);
    process.exit(1);
  });

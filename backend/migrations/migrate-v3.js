import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Add hostel / room information columns to complaints
    await client.query(`
      ALTER TABLE complaints
      ADD COLUMN IF NOT EXISTS hostel_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS block VARCHAR(10),
      ADD COLUMN IF NOT EXISTS room_number VARCHAR(20),
      ADD COLUMN IF NOT EXISTS image_paths TEXT[];
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration v3 completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration v3 failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => {
    console.log('Migration v3 process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration v3 process failed:', error);
    process.exit(1);
  });


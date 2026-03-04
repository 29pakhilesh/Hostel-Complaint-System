import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Add contact info columns to complaints for student phone/email
    await client.query(`
      ALTER TABLE complaints
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration v7 (contact_phone, contact_email) completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration v7 failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => {
    console.log('Migration v7 process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration v7 process failed:', error);
    process.exit(1);
  });


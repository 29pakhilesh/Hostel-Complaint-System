import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE complaints
      ADD COLUMN IF NOT EXISTS spam_score INTEGER;
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration v10 (spam_score on complaints) completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration v10 failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => {
    console.log('Migration v10 process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration v10 process failed:', error);
    process.exit(1);
  });


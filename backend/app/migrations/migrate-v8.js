import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create complaint_reports table to track department flags on complaints
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
        department_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration v8 (complaint_reports) completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration v8 failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => {
    console.log('Migration v8 process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration v8 process failed:', error);
    process.exit(1);
  });


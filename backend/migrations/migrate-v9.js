import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        original_complaint_id UUID,
        tracking_code VARCHAR(10),
        title TEXT,
        status VARCHAR(20),
        category_name TEXT,
        hostel_name TEXT,
        block TEXT,
        room_number TEXT,
        created_at TIMESTAMP,
        resolved_at TIMESTAMP,
        deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
        deletion_reason VARCHAR(50),
        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration v9 (complaint_history) completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration v9 failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => {
    console.log('Migration v9 process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration v9 process failed:', error);
    process.exit(1);
  });


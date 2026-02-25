import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create ENUM types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('student', 'warden', 'super_admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE complaint_status AS ENUM ('pending', 'resolved');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Complaints table
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status complaint_status NOT NULL DEFAULT 'pending',
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_category_id ON complaints(category_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    `);

    // Insert default categories if they don't exist
    await client.query(`
      INSERT INTO categories (name) VALUES 
        ('Electrical'),
        ('Plumbing'),
        ('Carpentry'),
        ('Cleaning'),
        ('Security'),
        ('Internet'),
        ('Other')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Create a default super_admin user (password: admin123)
    // Password hash for 'admin123' using bcrypt with salt rounds 10
    const bcrypt = await import('bcrypt');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (email, password_hash, full_name, role) VALUES 
        ('admin@hostel.com', $1, 'Super Admin', 'super_admin')
      ON CONFLICT (email) DO NOTHING;
    `, [adminPasswordHash]);

    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });

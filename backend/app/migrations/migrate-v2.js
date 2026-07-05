import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  const client = await pool.connect();
  
  try {
    // First, add enum value in a separate transaction
    try {
      await client.query(`
        DO $$ BEGIN
          ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'department';
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      await client.query('COMMIT');
      await client.query('BEGIN');
    } catch (e) {
      // If enum already exists, continue
      await client.query('BEGIN');
    }

    // Add category_id column to users table for department users
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    `);

    // Make user_id nullable in complaints table (for public submissions)
    await client.query(`
      ALTER TABLE complaints 
      ALTER COLUMN user_id DROP NOT NULL;
    `);

    // Update foreign key constraint to allow NULL
    await client.query(`
      ALTER TABLE complaints 
      DROP CONSTRAINT IF EXISTS complaints_user_id_fkey;
    `);

    await client.query(`
      ALTER TABLE complaints 
      ADD CONSTRAINT complaints_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    `);

    // Get all categories
    const categoriesResult = await client.query('SELECT id, name FROM categories');
    const categories = categoriesResult.rows;

    // Create department users for each category
    const bcrypt = await import('bcrypt');
    const defaultPassword = 'dept123'; // Default password for all departments
    const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);

    for (const category of categories) {
      const email = `${category.name.toLowerCase().replace(/\s+/g, '')}@hostel.com`;
      const fullName = `${category.name} Department`;
      
      await client.query(`
        INSERT INTO users (email, password_hash, full_name, role, category_id) 
        VALUES ($1, $2, $3, 'department', $4)
        ON CONFLICT (email) DO UPDATE 
        SET category_id = EXCLUDED.category_id, role = 'department';
      `, [email, defaultPasswordHash, fullName, category.id]);
    }

    await client.query('COMMIT');
    console.log('✅ Database migration v2 completed successfully!');
    console.log('📋 Department logins created:');
    categories.forEach(cat => {
      const email = `${cat.name.toLowerCase().replace(/\s+/g, '')}@hostel.com`;
      console.log(`   ${cat.name}: ${email} / ${defaultPassword}`);
    });
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

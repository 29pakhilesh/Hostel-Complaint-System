import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const createUser = async (email, password, fullName, role = 'student') => {
  const client = await pool.connect();
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role`,
      [email.toLowerCase(), passwordHash, fullName, role]
    );

    console.log('✅ User created successfully:');
    console.log(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      console.error('❌ Error: User with this email already exists');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

// Get arguments from command line
const [,, email, password, fullName, role] = process.argv;

if (!email || !password || !fullName) {
  console.log('Usage: node create-user.js <email> <password> <fullName> [role]');
  console.log('Example: node create-user.js student@hostel.com password123 "John Doe" student');
  process.exit(1);
}

createUser(email, password, fullName, role || 'student');

import pool from '../config/database.js';

export async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, email, password_hash, full_name, role, category_id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0] ?? null;
}

export async function findUserById(userId) {
  const result = await pool.query(
    'SELECT id, email, full_name, role, category_id FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] ?? null;
}

export async function createStudentUser({ email, passwordHash, fullName }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'student')
     RETURNING id, email, full_name, role`,
    [email.toLowerCase(), passwordHash, fullName.trim()]
  );
  return result.rows[0];
}

export async function listDepartmentUsers() {
  const result = await pool.query(
    `SELECT id, email, full_name, role, category_id
     FROM users
     WHERE role = 'department'
     ORDER BY email`
  );
  return result.rows;
}

export async function updateUserPassword(userId, passwordHash) {
  const result = await pool.query(
    `UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, email, role`,
    [passwordHash, userId]
  );
  return result.rows[0] ?? null;
}

export async function resetSuperAdminPassword(passwordHash) {
  const result = await pool.query(
    `UPDATE users SET password_hash = $1 WHERE role = 'super_admin' RETURNING id, email`,
    [passwordHash]
  );
  return result.rows[0] ?? null;
}

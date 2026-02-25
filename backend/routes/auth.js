import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin privileges required' });
  }
  next();
};

// Student registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new student user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id, email, full_name, role`,
      [email.toLowerCase(), passwordHash, full_name.trim()]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, category_id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, categoryId: user.category_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        category_id: user.category_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List department users (super admin only)
router.get('/admin/departments', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, category_id
       FROM users
       WHERE role = 'department'
       ORDER BY email`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('List departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password for any user (super admin only)
router.put('/admin/users/:id/password', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2
       RETURNING id, email, role`,
      [passwordHash, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update user password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Secret super admin password reset using reset key
router.post('/admin/reset-super', async (req, res) => {
  try {
    const { reset_key, new_password } = req.body;

    if (!reset_key || !new_password) {
      return res.status(400).json({ error: 'reset_key and new_password are required' });
    }

    if (reset_key !== process.env.SUPER_ADMIN_RESET_KEY) {
      return res.status(403).json({ error: 'Invalid reset key' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE role = 'super_admin'
       RETURNING id, email`,
      [passwordHash]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Super admin user not found' });
    }

    res.json({ message: 'Super admin password reset successfully' });
  } catch (error) {
    console.error('Reset super admin password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

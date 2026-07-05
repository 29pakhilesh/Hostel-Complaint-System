import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as userRepository from '../repositories/userRepository.js';
import {
  createAuthToken,
  hashPassword,
  isValidEmail,
  toPublicUser,
  verifyPassword,
} from '../services/authService.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin privileges required' });
  }
  next();
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.createStudentUser({
      email,
      passwordHash,
      fullName: full_name,
    });

    res.status(201).json({
      token: createAuthToken(user),
      user: toPublicUser(user),
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

    const user = await userRepository.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      token: createAuthToken(user),
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/admin/departments', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    res.json(await userRepository.listDepartmentUsers());
  } catch (error) {
    console.error('List departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/admin/users/:id/password', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const passwordHash = await hashPassword(new_password);
    const updated = await userRepository.updateUserPassword(req.params.id, passwordHash);

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update user password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

    const passwordHash = await hashPassword(new_password);
    const updated = await userRepository.resetSuperAdminPassword(passwordHash);

    if (!updated) {
      return res.status(404).json({ error: 'Super admin user not found' });
    }

    res.json({ message: 'Super admin password reset successfully' });
  } catch (error) {
    console.error('Reset super admin password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

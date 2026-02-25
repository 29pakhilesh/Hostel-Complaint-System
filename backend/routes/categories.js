import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all categories (PUBLIC - no authentication required)
router.get('/', async (req, res) => {
  console.log('Categories route hit - PUBLIC endpoint');
  try {
    const result = await pool.query(
      'SELECT id, name FROM categories ORDER BY name'
    );
    console.log('Categories fetched:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

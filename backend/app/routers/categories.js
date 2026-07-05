import express from 'express';
import * as categoryRepository from '../repositories/categoryRepository.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await categoryRepository.findAllCategories());
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import express from 'express';
import { translateText } from '../adapters/translateAdapter.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, source = 'en', target = 'hi' } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    const translatedText = await translateText(text, source, target);
    return res.json({ translatedText });
  } catch (error) {
    console.error('Translate route error:', error);
    return res.status(500).json({ error: 'Failed to translate text' });
  }
});

export default router;

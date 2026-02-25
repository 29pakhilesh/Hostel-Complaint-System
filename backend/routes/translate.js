import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, source = 'en', target = 'hi' } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', source);
    url.searchParams.set('tl', target);
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', text);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error('Translate API error:', response.status, await response.text());
      return res.status(500).json({ error: 'Translation service error' });
    }

    const data = await response.json();
    const translatedText = (data[0] || [])
      .map((part) => (Array.isArray(part) ? part[0] : ''))
      .join('');

    return res.json({ translatedText });
  } catch (error) {
    console.error('Translate route error:', error);
    return res.status(500).json({ error: 'Failed to translate text' });
  }
});

export default router;


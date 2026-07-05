export function computeSpamScore(title, description, contactPhone, contactEmail) {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  const desc = (description || '').trim();
  const titleText = (title || '').trim();
  let score = 0;

  if (!description || description.trim().length < 25) {
    score += 25;
  }

  const descWords = desc ? desc.split(/\s+/).filter(Boolean) : [];
  if (desc && descWords.length <= 3 && desc.length < 40) {
    score += 20;
  }
  const titleWords = titleText ? titleText.split(/\s+/).filter(Boolean) : [];
  if (titleText && titleWords.length <= 3 && titleText.length < 30) {
    score += 10;
  }

  const urlRegex = /(https?:\/\/|www\.)/gi;
  if (urlRegex.test(text)) {
    score += 35;
  }

  const spamPhrases = [
    'win money',
    'lottery',
    'click here',
    'offer',
    'discount',
    'limited time',
    'free gift',
    'subscribe',
    'follow me',
  ];
  if (spamPhrases.some((p) => text.includes(p))) {
    score += 25;
  }

  const vulgarWords = [
    'fuck',
    'f***',
    'shit',
    'bitch',
    'bastard',
    'asshole',
    'dick',
    'slut',
    'chutiya',
    'chutiye',
    'madarchod',
    'bhosdike',
    'bsdk',
    'gaand',
    'randi',
    'bhenchod',
    'चूतिया',
    'चुतिया',
    'मादरचोद',
    'बहनचोद',
    'गांड',
    'रंडी',
  ];
  if (vulgarWords.some((w) => text.includes(w))) {
    score += 40;
  }

  const compact = text.replace(/\s+/g, '');
  if (
    compact.length >= 5 &&
    compact.length <= 20 &&
    /[a-z]/.test(compact) &&
    /\d/.test(compact)
  ) {
    score += 15;
  }

  if (/(.)\1{4,}/.test(text)) {
    score += 10;
  }

  const words = description ? description.toLowerCase().split(/\s+/).filter(Boolean) : [];
  if (words.length > 0) {
    const uniqueWords = new Set(words);
    const ratio = uniqueWords.size / words.length;
    if (ratio < 0.5) {
      score += 10;
    }
  }

  const meta = `${contactPhone || ''} ${contactEmail || ''}`.toLowerCase();
  if (/(promo|marketing|business)/.test(meta)) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

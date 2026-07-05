export async function translateText(text, source = 'en', target = 'hi') {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', source);
  url.searchParams.set('tl', target);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Translation service error: ${response.status} ${body}`);
  }

  const data = await response.json();
  return (data[0] || [])
    .map((part) => (Array.isArray(part) ? part[0] : ''))
    .join('');
}

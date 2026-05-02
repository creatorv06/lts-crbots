export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, token } = req.body;

  if (!slug || !token) {
    return res.status(400).json({ success: false, error: 'Missing slug or token' });
  }

  // 1. Verify Cloudflare Turnstile token
  const verifyRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      }),
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData.success) {
    return res.status(403).json({ success: false, error: 'Captcha verification failed' });
  }

  // 2. Look up the destination URL for this slug
  const links = JSON.parse(process.env.LINKS || '{}');
  const destination = links[slug];

  if (!destination) {
    return res.status(404).json({ success: false, error: 'Link not found' });
  }

  // 3. Return the destination URL
  return res.status(200).json({ success: true, url: destination });
}

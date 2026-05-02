export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, cfToken } = req.body;

  if (!token || !cfToken) {
    return res.status(400).json({ success: false, error: 'Missing token' });
  }

  const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: cfToken,
      remoteip: req.headers['x-forwarded-for'] || ''
    })
  });

  const cfData = await cfRes.json();

  if (!cfData.success) {
    return res.status(403).json({ success: false, error: 'Cloudflare verification failed' });
  }

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    new URL(decoded);
    return res.status(200).json({ success: true, url: decoded });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid link token' });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  const adminKey = req.headers['x-admin-key'];

  // Validate admin key
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: 'Missing url' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Step 1: Create a short link via lksfy.com API (auto alias)
    const lksfyRes = await fetch(
      `https://lksfy.com/api?api=${process.env.LKSFY_API_KEY}&url=${encodeURIComponent(url)}`
    );
    const lksfyData = await lksfyRes.json();

    // lksfy returns { status: "success", shortenedUrl: "https://lksfy.com/xxx" }
    if (lksfyData.status !== 'success' || !lksfyData.shortenedUrl) {
      return res.status(500).json({ error: 'Failed to create short link', details: lksfyData });
    }

    const shortUrl = lksfyData.shortenedUrl;

    // Step 2: Encode the short link into a protection token
    const encoded = Buffer.from(shortUrl).toString('base64url');
    const protectedUrl = `${process.env.SITE_URL}/token/${encoded}`;

    return res.status(200).json({
      success: true,
      original_url: url,
      short_url: shortUrl,
      protected_url: protectedUrl
    });

  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
}

import crypto from "crypto";

function sign(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;
  const adminKey = req.headers["x-admin-key"];

  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!url) {
    return res.status(400).json({ error: "Missing url" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    // Shorten URL
    const shortRes = await fetch(
      `https://linkshortify.com/api?api=${process.env.LKSFY_API_KEY}&url=${encodeURIComponent(url)}`
    );

    const shortData = await shortRes.json();

    if (shortData.status !== "success") {
      return res.status(500).json({ error: "Short link failed" });
    }

    const shortUrl = shortData.shortenedUrl;

    // Create signed token
    const payload = Buffer.from(shortUrl).toString("base64url");
    const signature = sign(payload, process.env.TOKEN_SECRET);

    const token = `${payload}.${signature}`;
    const protectedUrl = `${process.env.SITE_URL}/token/${token}`;

    return res.status(200).json({
      success: true,
      short_url: shortUrl,
      protected_url: protectedUrl
    });

  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}

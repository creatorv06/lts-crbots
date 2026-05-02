import crypto from "crypto";

function sign(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, cfToken } = req.body;

  if (!token || !cfToken) {
    return res.status(400).json({ error: "Missing data" });
  }

  // Verify Turnstile
  const cfRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: cfToken
      })
    }
  );

  const cfData = await cfRes.json();

  if (!cfData.success) {
    return res.status(403).json({ error: "Verification failed" });
  }

  try {
    const [payload, signature] = token.split(".");

    const expectedSig = sign(payload, process.env.TOKEN_SECRET);

    if (signature !== expectedSig) {
      return res.status(403).json({ error: "Invalid token" });
    }

    const decoded = Buffer.from(payload, "base64url").toString("utf-8");

    new URL(decoded);

    return res.status(200).json({
      success: true,
      url: decoded
    });

  } catch {
    return res.status(400).json({ error: "Invalid token" });
  }
}

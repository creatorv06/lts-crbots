# 🛡️ Protected Links — Vercel Deployment Guide

A bot-protected link shortener with Cloudflare Turnstile CAPTCHA verification.

---

## 📁 File Structure

```
protected-links/
├── api/
│   └── verify.js       ← Backend: verifies captcha & returns redirect URL
├── public/
│   └── index.html      ← Frontend: the verification page users see
├── vercel.json         ← Vercel routing config
└── README.md
```

---

## 🚀 Step-by-Step Deployment

### STEP 1 — Get Cloudflare Turnstile Keys (Free)

1. Go to https://dash.cloudflare.com
2. Sign up / log in (free account works)
3. In the left sidebar, click **Turnstile**
4. Click **Add Site**
5. Enter your site name (e.g. "My Link Shortener")
6. For **Widget Type** choose **Managed**
7. Click **Create**
8. Copy your **Site Key** and **Secret Key** — you'll need both

---

### STEP 2 — Add Your Site Key to index.html

Open `public/index.html` and find this line:

```html
data-sitekey="YOUR_TURNSTILE_SITE_KEY"
```

Replace `YOUR_TURNSTILE_SITE_KEY` with the Site Key you copied from Cloudflare.

---

### STEP 3 — Push to GitHub

1. Go to https://github.com and create a **New Repository**
2. Name it `protected-links` (or anything you like)
3. Keep it **Public** or **Private** (both work with Vercel)
4. Upload all files maintaining the folder structure:
   - `api/verify.js`
   - `public/index.html`
   - `vercel.json`
5. Commit and push

---

### STEP 4 — Deploy to Vercel

1. Go to https://vercel.com and sign up / log in
2. Click **Add New Project**
3. Click **Import Git Repository** and connect your GitHub
4. Select your `protected-links` repo
5. Click **Deploy** — Vercel auto-detects the config

---

### STEP 5 — Set Environment Variables in Vercel

This is where you put your secret keys and your links list.

1. In your Vercel project dashboard, go to **Settings → Environment Variables**
2. Add these three variables:

| Name | Value |
|------|-------|
| `TURNSTILE_SECRET_KEY` | Your Secret Key from Cloudflare |
| `LINKS` | JSON object of your links (see below) |

**LINKS format** — paste this as the value (edit the slugs and URLs):
```json
{"abc123":"https://google.com","mylink":"https://youtube.com","promo":"https://yoursite.com/offer"}
```

Each entry is `"slug": "destination_url"`.
Add as many as you want in the same JSON object.

3. Click **Save**
4. Go to **Deployments** → click **Redeploy** so the new env vars take effect

---

### STEP 6 — Test Your Links

Your verification page URL format is:

```
https://your-project.vercel.app/?slug=YOURSLUG
```

**Examples:**
- `https://your-project.vercel.app/?slug=abc123` → redirects to Google
- `https://your-project.vercel.app/?slug=mylink` → redirects to YouTube

Share these links anywhere. Users must pass the CAPTCHA to get redirected!

---

## ➕ Adding New Links

To add more links later:

1. Go to Vercel → **Settings → Environment Variables**
2. Edit the `LINKS` variable and add your new slug+URL pair
3. Redeploy

Example with more links:
```json
{
  "abc123": "https://google.com",
  "mylink": "https://youtube.com",
  "promo": "https://yoursite.com/offer",
  "newlink": "https://example.com"
}
```

---

## 🔒 How It Works

```
User visits  →  Sees CAPTCHA  →  Passes CAPTCHA  →  /api/verify checks token  →  Redirects
your link        (Turnstile)       (gets token)       with Cloudflare + looks       to destination
                                                       up slug in LINKS env var
```

1. User visits `yoursite.vercel.app/?slug=abc123`
2. They see the verification page and complete the Turnstile CAPTCHA
3. On submit, the frontend sends the slug + token to `/api/verify`
4. The backend verifies the token with Cloudflare's API
5. If valid, it looks up the slug in your `LINKS` env variable
6. Returns the destination URL → user gets redirected

Bots cannot pass the Turnstile challenge, so they can never get the destination URL.

---

## ❓ Troubleshooting

| Problem | Fix |
|---------|-----|
| CAPTCHA not showing | Check your Site Key is correct in index.html |
| "Link not found" error | Make sure slug in URL matches key in LINKS env var exactly |
| Verification always fails | Check TURNSTILE_SECRET_KEY is set correctly in Vercel env vars |
| Changes not working | Always Redeploy after changing environment variables |

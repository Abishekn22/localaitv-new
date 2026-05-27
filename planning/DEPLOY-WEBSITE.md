# Deploy the LocalAI TV Marketing Website

A separate landing page (NOT the React app) lives in `website/`. It is the public
"marketing site" — what press, partners, and first-time visitors see before they
download the app.

## What's in `website/`

| File | What it is |
|---|---|
| `index.html` | Landing page — hero, channels, features, screenshots, CTA, footer |
| `about.html` | Company story |
| `contact.html` | 6 contact channels (general / grievance / press / reporters / ads / partners) |
| `advertise.html` | Ad packages + media-kit request |
| `channelpartner.html` | District TV / cable / publisher partnership tiers |
| `grievance.html` | IT Rules 2021 grievance officer page |
| `copyright.html` | DMCA-style takedown procedure |
| `privacy.html` | Same privacy policy used inside the app |
| `terms.html` | Same terms used inside the app |
| `style.css` | All styling for `index.html` + sub-pages |
| `script.js` | Smooth scroll, fade-in, screenshot auto-carousel |
| `manifest.webmanifest` | PWA manifest |
| `sitemap.xml` + `robots.txt` | SEO |
| `og-share-image.png` | 1200×630 share preview for WhatsApp/Twitter/Facebook |
| `icon-32 / 180 / 192 / 512` + `apple-touch-icon.png` | Favicons |
| `screenshots/` | 12 phone screenshots used across the page |

Everything is static. There is **no build step** — drag and deploy.

## Option 1 — Netlify Drop (recommended, 30 seconds)

1. Open https://app.netlify.com/drop
2. Drag `website-deploy-20260513.zip` (in the kit root) into the browser drop zone
3. Netlify gives you a URL like `https://something-cute-12345.netlify.app`
4. **Important:** to update later, open that site in the dashboard → "Deploys" → "Deploy manually" — drag a new zip there to keep the same URL.

## Option 2 — Custom domain (`localaitv.com`)

After the Drop deploy works:

1. In Netlify → **Domain settings** → **Add custom domain** → `localaitv.com`
2. Netlify shows you the DNS records to set with your registrar (GoDaddy / Namecheap / etc.)
3. Add the `A` record + `CNAME` for `www`. Propagation = 5 min – 2 hr.
4. Netlify auto-provisions SSL (Let's Encrypt) within 24h. Free.

## Option 3 — Netlify Git (best for ongoing edits)

If you want to edit the site from your Mac and have it auto-deploy:

```bash
cd ~/Desktop/localaitv-submission-kit/website
git init
git add .
git commit -m "Initial website"
gh repo create localaitv-website --public --source=. --push    # if you have gh CLI
# OR push to GitHub manually, then in Netlify → "Import from Git"
```

Netlify then deploys every push automatically.

## Test it locally first

```bash
cd ~/Desktop/localaitv-submission-kit/website
python3 -m http.server 8765
# open http://localhost:8765 in any browser
```

## Things to update before going live

1. **Email addresses** — `hello@`, `grievance@`, `press@`, `reporters@`, `advertise@`,
   `partners@`, `copyright@` at `localaitv.com`. Set up these aliases with your
   email provider, or change them to a single working address using find/replace
   across the `.html` files.
2. **Grievance Officer name + phone** on `grievance.html` (currently placeholder).
3. **Twitter / Facebook / Instagram / YouTube / Telegram URLs** in the footer of
   `index.html` (currently `@localaitv` everywhere — change to real handles).
4. The hero "Open Web App" button links to
   `https://monumental-banoffee-3562b0.netlify.app` — that's your current app
   URL. Change it to `https://app.localaitv.com` once you set up that subdomain.

## Previews

Visual confirmation of the rendered site is in `website/_previews/` — desktop full
page, mobile, channels, features, reporter, download, and each sub-page. These are
for your inspection only; you don't need to deploy them.

## Once deployed

- Submit the site to Google Search Console at https://search.google.com/search-console
- Submit `sitemap.xml` inside Search Console for faster indexing
- Verify the share preview by pasting the URL into WhatsApp / Twitter — the
  `og-share-image.png` should show up
- Check the page on Lighthouse (DevTools → Lighthouse). It should score 90+
  across Performance, Accessibility, Best Practices, SEO.

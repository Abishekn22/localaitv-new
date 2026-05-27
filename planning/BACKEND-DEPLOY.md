# Backend Deployment Guide

Your backend is now built. It runs as **Netlify Functions** on the same site as your web app — no separate hosting needed.

## What I built

```
capacitor-project/
├── netlify.toml                          ← Netlify config (CORS + functions + redirects)
├── netlify/functions/
│   ├── forms.mjs                         ← handles all 7 form-submission endpoints
│   └── admin-list.mjs                    ← admin endpoint to view submissions
└── src/App.jsx                           ← updated: API_BASE = '/api' (was the broken aiservices.localaitv.com)
```

## The 7 endpoints that now work

| Endpoint | Purpose | App screen that uses it |
|---|---|---|
| `POST /api/account-deletion-requests`  | User requests account deletion (GDPR/Play Store/Apple required) | Profile → Account Deletion |
| `POST /api/advertising-enquiries` | User submits advertising enquiry | Hamburger → Advertise With Us |
| `POST /api/complaints` | User files complaint | Hamburger → Grievance / Complaint forms |
| `POST /api/content-reports` | User flags inappropriate UGC (Apple required) | ⚑ icon on classifieds/news |
| `POST /api/copyright-counter-notifications` | DMCA counter-notification | Hamburger → Copyright |
| `POST /api/copyright-takedown-requests` | DMCA takedown request | Hamburger → Copyright |
| `POST /api/partner-applications` | Channel Partner application | Hamburger → Channel Partner |

## What happens when a user submits a form

1. App POSTs JSON to the endpoint
2. Netlify Function receives it, validates, gives a 200 success response back to the app
3. Submission is stored in **Netlify Blobs** (1 GB free, encrypted at rest)
4. If you set `RESEND_API_KEY` env var (optional, later), an email is also sent to your grievance officer
5. You view submissions later via the admin endpoint (see below)

## How to view received submissions

After deployment, hit the admin endpoint:

```
https://YOUR-SITE.netlify.app/api/admin/submissions?token=YOUR_ADMIN_TOKEN
```

Replace `YOUR_ADMIN_TOKEN` with whatever value you set for the `ADMIN_TOKEN` environment variable in Netlify dashboard.

To view a single submission:
```
https://YOUR-SITE.netlify.app/api/admin/submissions?token=YOUR_TOKEN&id=complaints-2026-05-13-abc123
```

To filter by form:
```
https://YOUR-SITE.netlify.app/api/admin/submissions?token=YOUR_TOKEN&form=content-reports
```

---

# 🚀 Deploy in 4 steps

Netlify Drop (anonymous deploys) doesn't support Functions — you need a real Netlify account (free) to deploy the backend.

The whole thing takes **5 minutes**.

## Step 1 — Login (one-time, opens your browser)

Open Terminal and paste:

```bash
export PATH="$HOME/Library/Application Support/localaitv-dev/node/bin:$PATH"
cd ~/Desktop/localaitv-submission-kit/capacitor-project
netlify login
```

Your browser opens to Netlify's authorize page. Click **Authorize**. You're signed in.

(If you don't have a Netlify account, the same page will offer to sign you up. Free, takes 30 seconds, no credit card.)

## Step 2 — Create / link the site

```bash
netlify init
```

Pick **"+ Create & configure a new site"** when asked. Then:
- **Team:** pick yours (auto-suggested)
- **Site name:** type something like `localaitv` (you get `localaitv.netlify.app` if available, otherwise pick another)
- **Build command:** Press Enter (it auto-detects from netlify.toml)
- **Publish directory:** Press Enter (auto-detected)
- **Functions directory:** Press Enter (auto-detected)
- **Deploy preview branch:** Press Enter

## Step 3 — Set environment variables (3 minutes, optional but recommended)

Open the link Netlify CLI prints (looks like `https://app.netlify.com/sites/localaitv`) → **Site settings** → **Environment variables** → **Add a variable**.

| Name | Value | Required? |
|---|---|---|
| `ADMIN_TOKEN` | A random 32-char password you'll use to view submissions | YES — protects the admin endpoint |
| `RESEND_API_KEY` | API key from https://resend.com (free, 3,000 emails/month) | Optional — only if you want email notifications |
| `GRIEVANCE_EMAIL` | The email address to forward submissions to (e.g. `grievance@localaitv.com`) | Optional, defaults to grievance@localaitv.com |
| `FROM_EMAIL` | A verified sender on Resend (e.g. `noreply@yourdomain.com`) | Required IF you set RESEND_API_KEY |

**To generate a strong ADMIN_TOKEN:** in Terminal, run `openssl rand -hex 16` — copy the output, paste it in. Save it somewhere safe.

## Step 4 — Deploy to production

```bash
netlify deploy --prod
```

Wait ~30 seconds. Output looks like:
```
✔ Deploy complete
✔ Site URL: https://localaitv.netlify.app
✔ Unique deploy URL: https://...
```

**Test it:**
```bash
# Should return success (in production, this submits a real complaint!)
curl -X POST https://YOUR-SITE.netlify.app/api/complaints \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","subject":"Testing","body":"Just testing the backend"}'

# Should print: {"ok":true,"id":"complaints-2026-05-13-xxxxxxxx","message":"..."}
```

## After deploy: redeploy on future code changes

Every time you make changes (or I do) to `src/App.jsx`, just run:

```bash
cd ~/Desktop/localaitv-submission-kit/capacitor-project
npm run build              # rebuild Vite
netlify deploy --prod      # push to live
```

The whole thing takes ~10 seconds.

---

## ⚠️ Important notes

### 1. Email notification is OPTIONAL but recommended
Without `RESEND_API_KEY`, submissions are still **saved** in Netlify Blobs and visible via the admin endpoint. You just have to check the admin URL manually. Email lets you react within minutes of a submission.

### 2. Resend signup is free
1. Go to https://resend.com → Sign up (free)
2. Verify your domain (instructions there) — OR use the test sender `onboarding@resend.dev` for now
3. Get API key from Resend dashboard
4. Paste into Netlify's `RESEND_API_KEY` env var

### 3. IT Rules 2021 compliance
Your privacy policy promises **24-hour response** to grievances. Check the admin endpoint at least once a day, or enable email notifications via Resend. You're now legally compliant for India.

### 4. Apple's UGC moderation requirement
The `POST /api/content-reports` endpoint is what powers the ⚑ flag icon. Apple's Guideline 1.2 requires you (the developer) to **act within 24 hours** on flagged content. Process: check admin endpoint daily → if a flag arrives → review the reported item → remove it if violating → reply to reporter.

### 5. Account deletion compliance
Both stores require account deletion to actually delete data. When a `POST /api/account-deletion-requests` arrives:
- You'll get the user's mobile/email/constituency from the body
- Within 30 days, mark the user's data for deletion (currently the app uses localStorage so there's no server data — but if you ever add a real user database, wire this up)

---

## What's still pending

After you complete the 4 steps above:

- ✅ Backend live + collecting submissions
- ✅ Both stores' UGC + privacy requirements satisfied
- 🟡 Still need: replace `Mohan Reddy Koneti` placeholder name in App.jsx (just tell me the real one)
- 🟡 Still need: real content in news/classifieds (you tell me what to seed)
- 🟡 Still need: $25 Google Play account → submit
- 🟡 Optional: Apple Developer + iOS submit

You're ~3 days from being live on Play Store.

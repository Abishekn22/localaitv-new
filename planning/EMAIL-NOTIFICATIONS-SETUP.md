# Email Notifications Setup (10 minutes, FREE)

When users submit complaints, content reports, grievances, etc., you'll automatically receive an email. Free 3,000 emails/month — way more than you'll ever need.

## Why bother?

| Without email | With email |
|---|---|
| You manually check `admin.html` daily | Email arrives within seconds |
| Risk of missing a complaint past 24h SLA | India IT Rules 2021 compliant by default |
| Apple may reject for slow UGC response | Apple sees a working moderation pipeline |

## Setup — 4 steps

### Step 1 — Sign up for Resend (free)

1. Go to **https://resend.com**
2. Click **Sign up** (top-right)
3. Use your real email (you'll receive their welcome email)
4. **No credit card required** for the free tier

### Step 2 — Verify a sender

You have two choices: use Resend's test domain OR verify your own.

**Option A — Quick (use Resend's test sender)**

Skip domain verification. Use this sender:
```
onboarding@resend.dev
```

⚠ Emails will come from `onboarding@resend.dev` — not ideal but works for testing.
⚠ Some inbox providers (Gmail) mark these as "promotional" or even spam.

**Option B — Professional (verify your domain)**

After signing up:
1. **Domains** → **Add Domain** → type `localaitv.com` (or your real domain)
2. Resend shows DNS records you need to add. Three records typically:
   - `TXT` for `_dmarc`
   - `TXT` for SPF
   - `CNAME` for DKIM
3. Go to your DNS provider (Namecheap, GoDaddy, Netlify DNS, etc.)
4. Add the records exactly as shown
5. Wait 5-30 minutes for DNS propagation
6. Click **Verify** in Resend
7. Once verified, you can send from `noreply@localaitv.com` (or `grievance@localaitv.com` etc.)

### Step 3 — Get the API key

1. Resend dashboard → **API Keys**
2. **+ Create API Key**
3. **Name**: `LocalAI TV production`
4. **Permission**: Full Access
5. Click **Add**
6. **Copy the API key** (starts with `re_`) — you can only see it once

### Step 4 — Add to Netlify

After you deploy your backend via `netlify init`:

1. Open the Netlify dashboard → your site → **Site settings** → **Environment variables**
2. **Add a variable** — repeat for each of these:

| Variable | Value | Notes |
|---|---|---|
| `RESEND_API_KEY` | `re_...` (the key you just copied) | Required |
| `GRIEVANCE_EMAIL` | The email YOU want to receive notifications at (your gmail is fine) | Required |
| `FROM_EMAIL` | `onboarding@resend.dev` (Option A) or `noreply@yourdomain` (Option B) | Required |
| `ADMIN_TOKEN` | Random 32-char password (run `openssl rand -hex 16` to generate) | Required for admin.html |

3. After saving env vars, you need to redeploy for them to take effect:
   ```bash
   cd ~/Desktop/localaitv-submission-kit/capacitor-project
   netlify deploy --prod
   ```

## Test it

After deploy, in Terminal:

```bash
curl -X POST https://YOUR-SITE.netlify.app/api/complaints \
  -H "Content-Type: application/json" \
  -d '{"name":"Email Test","email":"test@test.com","subject":"Testing email notifications","body":"Please ignore — testing the backend"}'
```

You should:
- Get a `{"ok":true,...}` JSON response
- Receive an email within 30 seconds at the address you set as `GRIEVANCE_EMAIL`
- See the submission in the admin.html dashboard (https://YOUR-SITE.netlify.app/admin.html)

## What the email looks like

Subject: `[LocalAI TV] Complaint`

Body:
```
LocalAI TV — Complaint

Submitted: 13 May 2026, 02:45 AM IST
From IP: 103.18.92.x

Form data:
{
  "name": "Email Test",
  "email": "test@test.com",
  "subject": "Testing email notifications",
  "body": "Please ignore — testing the backend"
}

Reference ID: complaints-2026-05-13-abcd1234
```

## How many emails will I get?

Realistic estimates for a Telugu hyperlocal app in its first year:

| Form type | Expected /month |
|---|---|
| Complaints | 1-5 |
| Content Reports (UGC flags) | 5-30 |
| Account Deletion | 1-3 |
| Advertising Enquiries | 5-20 |
| Partner Applications | 3-10 |
| Copyright Takedowns | 0-2 |
| Total | ~20-70/month |

Well within Resend's 3,000/month free tier. You'd need 50,000+ users before you'd consider upgrading.

## Troubleshooting

### "No email arrived after submitting"

1. Check **Resend dashboard → Logs** — did Resend receive the API call?
2. If "delivered" but no email → check spam folder
3. If "failed" → click for error details. Usually means `FROM_EMAIL` isn't from a verified domain
4. If Resend never received the call → check Netlify function logs at:
   `https://app.netlify.com/sites/YOUR-SITE/functions/forms`

### "API key is invalid"

The key in Netlify env must match the key you generated. If you accidentally deleted the key in Resend, generate a new one and update Netlify.

### "Domain verification stuck"

DNS propagation can take 1-30 minutes. Use https://dnschecker.org to confirm the records are visible from multiple locations. If the records are correct and visible after 1 hour, contact Resend support.

## Want to disable emails (for now)?

Just don't set `RESEND_API_KEY`. The backend will skip email sending and only log submissions to admin.html. No errors.

---

## Alternative: SendGrid, Postmark, Mailgun

If you prefer another email provider, you can use any service that has a REST API. The function code in `netlify/functions/forms.mjs` has a clear `if (RESEND_KEY)` block — modify it to call your preferred provider's API instead. Each has similar free tiers.

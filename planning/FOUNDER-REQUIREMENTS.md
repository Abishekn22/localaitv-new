# What I Need From You — Founder Setup & Registration Guide
## LocalAI TV · Accounts, Services & Access · v1.3-aligned

**To:** Koneti Mohan Reddy (Founder & CEO)
**From:** LocalAI TV Architecture Team
**Date:** 16 May 2026
**Purpose:** Every account, service and access the team needs from you to start work — where to register, how, which plan, what it costs, and exactly what to hand the dev team. Written for a non-technical reader.

---

## 0. Read This First — 5 Rules

1. **You own every account.** All accounts are created by **you** (or someone you trust), under **your** email and billing. Never let anyone else create them in their name — you must own the company's infrastructure.
2. **I (the AI assistant) cannot and will not create accounts or take your passwords.** I do not register services, enter card details, or receive credentials. This guide tells *you* what to do; the dev team uses what you provide.
3. **Share secrets only through a password vault** (Section 4) — **never** over WhatsApp, email, chat, or this assistant. API keys and passwords sent over chat/email are a security risk.
4. **Turn on 2-Factor Authentication (2FA)** on every account the moment you create it.
5. **Register in two stages.** **Phase 0 = only AWS, now.** Everything else (**Phase 1**) you register **only after** the Phase 0 Validation Gate passes and you say "start." This protects you from paying for services months before they are used.

---

## 1. The 60-Second Summary

| Stage | When | What you register | Rough monthly cost |
|---|---|---|---|
| **Phase 0** | **Now** — to start work & prove the system | **AWS** (1 account) + confirm you control the domain + confirm Hostinger VPS access | **~₹2,000–₹30,000** (mostly the GPU server; cheaper if run only for tests) |
| **Phase 1** | **Only after** the gate passes & you say "start" | Supabase, Cloudflare, Google Cloud, Firebase, Sentry, Better Stack, PostHog, OpenAI, Sarvam, YouTube API, password vault, GitHub | **~₹6,000–₹12,000 fixed** + usage-based AI (scales with channels) |

**Do not register Phase 1 services yet.** You would be paying for idle services. Phase 0 is enough to begin and to clear the validation gate.

---

## 2. Things You LIKELY ALREADY HAVE — Just Confirm & Hand Over

These exist from earlier work. Don't re-register — just confirm and provide access via the vault (Section 4):

| Item | Status | What to provide the team |
|---|---|---|
| **Hostinger VPS** | The AI pipeline runs here today | SSH login (host, username, password/key) |
| **Domain `localaitv.com`** | In use (`aiservices.localaitv.com`, marketing site) | Login to the **domain registrar** (where you bought the domain) — needed to point DNS later |
| **2Factor.in (SMS OTP)** | Already registered | `TWOFACTOR_API_KEY`; also confirm **DLT registration** (sender ID + template approval) is complete |
| **Google Cloud (Gemini + Telugu Text-to-Speech)** | Pipeline already uses these | Confirm the existing GCP project + billing is active; provide the service-account key file |
| **GitHub** | Account `nagarjunak-pixel` exists | You'll create one new private repo + invite the team (Section 3) |

If any of the above is *not* actually set up, treat it as a Phase 1 item below.

---

## 3. The Services — Where, How, Which Plan, What to Hand Over

### PHASE 0 — Register NOW (needed to start work and clear the gate)

#### 3.1 AWS (Amazon Web Services) — the only must-have to start

- **What it is / why:** The GPU server (EC2) that makes video generation fast, and the storage (S3) where finished videos live. This is the heart of Phase 0.
- **Where:** `https://aws.amazon.com` → "Create an AWS Account."
- **How to register:**
  1. Sign up with your business email.
  2. Add a credit/debit card (AWS does a small ~₹2 verification).
  3. Verify phone (OTP).
  4. Choose the **Basic (free) support plan**.
  5. Turn on **2FA** (IAM → your user → security).
  6. Set a **Billing Budget alert** (Billing → Budgets → e.g. alert at ₹35,000/mo) so there are no surprises.
- **Region to choose everywhere:** **Asia Pacific (Mumbai) — `ap-south-1`**. Use this and nothing else.
- **What the team needs you to create (you click; they guide if needed — over a call, not by you sending passwords):**
  - An **IAM user** for the dev team with **programmatic access** (an *Access Key ID* + *Secret Access Key*) limited to S3 + EC2 — **not** your root login.
  - One **S3 bucket**: `localaitv-content-mumbai` (region ap-south-1).
- **Plan/cost:** Pay-as-you-go. The GPU server (g4dn.xlarge) is ~₹30,000/month if left running 24×7 — in Phase 0 it can be **started only for tests**, costing far less. S3 storage for test files is negligible (a few rupees).
- **Hand to team (via vault):** IAM Access Key ID + Secret, region `ap-south-1`, bucket name. **Never the root email/password.**
- ☐ Account created ☐ 2FA on ☐ Budget alert set ☐ IAM key created ☐ S3 bucket created ☐ Shared via vault

#### 3.2 Domain DNS access (you likely already own the domain)

- **Why:** To later point `content.localaitv.com`, `pipeline.localaitv.com`, `api.localaitv.com` to the servers.
- **Action now:** Just **locate and confirm your domain registrar login** (where `localaitv.com` was purchased — e.g. GoDaddy/Hostinger/BigRock). No changes yet.
- **Cost:** Already paid (annual ~₹900). Nothing new.
- ☐ Registrar login located ☐ Noted for the team

> **Phase 0 stops here.** With AWS + the existing VPS + domain confirmed, the team can run Phase 0 and the Validation Gate. **Do not proceed to Phase 1 until the gate passes and you say "start."**

---

### PHASE 1 — Register ONLY AFTER the gate passes and you say "start"

For each: what it is → where → plan → what to hand over.

#### 3.3 Supabase — Admin Dashboard database + login system
- **Why:** Stores moderation data and admin logins for the Admin Dashboard.
- **Where:** `https://supabase.com` → sign up (GitHub or email) → New Project → **Region: Mumbai (ap-south-1)**.
- **Plan:** **Pro** — about **$25/month (~₹2,100)**.
- **Hand over:** Project URL, API keys (anon + service), database connection string.
- ☐ Done ☐ 2FA ☐ Vault

#### 3.4 Cloudflare — CDN, security (WAF), bot protection (Turnstile)
- **Why:** Makes video delivery fast and cheap worldwide and protects against attacks.
- **Where:** `https://www.cloudflare.com` → sign up → "Add a site" → enter `localaitv.com` → it will give you 2 nameservers to set at your domain registrar.
- **Plan:** **Free** to start (enough for CDN + basic WAF + Turnstile). Pro ($20/mo ~₹1,700) only later if needed.
- **Hand over:** Cloudflare account access for DNS setup (the team will guide the DNS records on a call).
- ☐ Done ☐ 2FA ☐ Vault

#### 3.5 Google Cloud — Gemini (script writing) + Telugu Text-to-Speech
- **Why:** Writes the news script and converts it to a Telugu voice. **Likely already set up** (the pipeline uses it) — confirm billing is active.
- **Where:** `https://console.cloud.google.com` → confirm project + Billing enabled → APIs: "Generative Language / Vertex AI" + "Cloud Text-to-Speech".
- **Plan:** Pay-per-use. Set a **Budget alert** (Billing → Budgets). Telugu voice ≈ usage-based; low at small scale.
- **Hand over:** Service-account JSON key file (via vault).
- ☐ Confirmed ☐ Budget alert ☐ Vault

#### 3.6 Firebase (Google) — push notifications
- **Why:** "Your content is live / airs in 10 min" phone notifications.
- **Where:** `https://console.firebase.google.com` → Add project (can reuse the Google Cloud project).
- **Plan:** **Free** (Spark) is enough.
- **Hand over:** Firebase config + server key.
- ☐ Done ☐ Vault

#### 3.7 OpenAI — backup script engine (only used if Gemini fails)
- **Where:** `https://platform.openai.com` → sign up → Billing → add small credit → create API key.
- **Plan:** Pay-as-you-go; fallback only, so low cost.
- **Hand over:** API key.
- ☐ Done ☐ 2FA ☐ Vault

#### 3.8 Sarvam AI — backup Telugu voice (only used if Google TTS fails)
- **Where:** `https://www.sarvam.ai` → sign up → API key.
- **Plan:** Pay-as-you-go; fallback only.
- **Hand over:** API key.
- ☐ Done ☐ Vault

#### 3.9 YouTube Data API — live channel integration
- **Why:** For the LIVE TV channels.
- **Where:** In the same Google Cloud Console → enable "YouTube Data API v3"; have a YouTube/Brand channel ready.
- **Plan:** Free quota (sufficient initially).
- **Hand over:** API key / OAuth client (via vault).
- ☐ Done ☐ Vault

#### 3.10 Monitoring — Sentry + Better Stack + PostHog
- **Sentry** (error alerts): `https://sentry.io` — **Free** tier fine to start; Team ~$26/mo later.
- **Better Stack** (is the site up? logs): `https://betterstack.com` — **Free** tier to start.
- **PostHog** (usage analytics): `https://posthog.com` — **Free** (1M events/mo).
- **Hand over:** Each project's key (via vault).
- ☐ Sentry ☐ Better Stack ☐ PostHog ☐ Vault

#### 3.11 Password Vault — Bitwarden or 1Password (set this up EARLY in Phase 1)
- **Why:** The single safe way to give the dev team all the keys above.
- **Where:** `https://bitwarden.com` (**Free**, works well) or `https://1password.com` (~$3/user/mo).
- **How:** Create an organization → one shared "LocalAI TV" vault → invite **Sameer** and **Gnana** → put every key/credential there.
- ☐ Vault created ☐ Team invited

#### 3.12 GitHub — code repository + team access
- **Why:** Where the Admin Dashboard code lives.
- **Where:** `https://github.com` (you have `nagarjunak-pixel`). Create a **new private repo** (e.g. `localaitv-admin-dashboard`) → Settings → Collaborators → invite Sameer & Gnana.
- **Plan:** **Free** is enough for private repos.
- ☐ Repo created ☐ Team invited

#### 3.13 2Factor.in — SMS OTP (already registered — just confirm)
- **Confirm:** `TWOFACTOR_API_KEY` is available, SMS credit balance is topped up, and **DLT registration** (sender ID + message templates) is approved (mandatory in India).
- **Hand over:** API key (via vault) + DLT status.
- ☐ Key ready ☐ DLT confirmed ☐ Vault

---

## 4. The Secure Hand-Over Procedure (do this exactly)

1. Create each account **yourself**, under your business email.
2. Turn on **2FA** immediately on each.
3. Put each credential (API key, access key, connection string) into the **shared password vault** (Section 3.11).
4. Invite **only Sheikh Sameer and Gnana Rajnan** to that vault.
5. **Never** paste any key into WhatsApp, email, this chat, or a document.
6. For anything needing screen-sharing (e.g. AWS IAM setup), do it on a **live call** with the team — you click, they guide. You never reveal a password on screen.

---

## 5. Cost Summary (approximate, INR/month)

| Service | Phase 0 (now) | Phase 1 (after gate) | Notes |
|---|---|---|---|
| AWS EC2 GPU | ₹2,000–₹30,000 | scales with channels | Less in Phase 0 if started only for tests |
| AWS S3 storage | ~₹0 (test) | grows with content | Cheap per-GB; CDN cuts delivery cost |
| Supabase | — | ~₹2,100 | Pro plan |
| Cloudflare | — | ₹0 (Free) | Pro only if needed later |
| Google Cloud (Gemini+TTS) | — | usage-based | Set a budget alert |
| Firebase / PostHog / Better Stack / Sentry | — | ₹0 (free tiers) | Paid only at scale |
| OpenAI / Sarvam | — | low (fallback only) | Used rarely |
| Password vault | — | ₹0 (Bitwarden) | Or 1Password paid |
| GitHub / 2Factor | — | ₹0 / already paid | — |
| **Rough total** | **₹2K–₹30K** | **~₹6K–₹12K fixed + AI usage** | Big scale economics are in Plan v1.3 §19 |

These are onboarding/registration costs. The full scale economics (300 → 3,000 channels) are already in **Plan v1.3 §19** — not repeated here.

---

## 6. Your Action Checklist (in order)

**Now (Phase 0):**
- ☐ Create AWS account, enable 2FA, set budget alert
- ☐ Create IAM key (S3+EC2 only) + S3 bucket `localaitv-content-mumbai` (ap-south-1)
- ☐ Confirm Hostinger VPS access
- ☐ Locate domain registrar login
- ☐ Put the AWS IAM key + VPS access in a vault (set up Bitwarden now if easier) and share with Sameer & Gnana
- ☐ Tell the team "Phase 0 access ready"

**Later (only after the gate passes AND you say "start"):**
- ☐ Work down Section 3.3 → 3.13, one per row, each into the vault

---

## 7. What Happens Next

1. You complete the **Phase 0** checklist (just AWS + confirmations).
2. The team runs Phase 0 and the Validation Gate (their work, not yours).
3. Gate numbers come back → you review → you say "start."
4. **Only then** you work the Phase 1 list above, and coding begins.

You do **not** need to do anything technical — just create accounts, enable 2FA, and place keys in the vault. The team does the rest with what you provide. I will never ask you for a password or create an account on your behalf.

---

**LocalAI TV Architecture Team**
LocalAI Media Network Pvt Ltd · CIN: U63910KA2025PTC212593 · Hyderabad, India

*Phase 0 = AWS only, now. Phase 1 = everything else, only after the gate passes and you say "start." Nothing here changes Plan v1.3.*

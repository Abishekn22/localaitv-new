# LocalAI TV — Database & System Flow, Explained Simply (v2.0)
## How content moves, where it is stored, who reviews it, and how it reaches the live screen — updated for Phase 0 completion and the new Pending Review workflow

**Prepared for:** Koneti Mohan Reddy (Managing Director)
**Prepared by:** LocalAI TV Architecture Team
**Date:** 23 May 2026
**Supersedes:** v1.3 / v1.4 of *LOCALAITV-DATA-STORAGE-FLOW-EXPLAINED* (dated 18 May 2026)
**Reading level:** No coding knowledge needed. Technical names are shown only so your AI team recognises them; every one is explained in plain words.

---

## 0. What changed since v1.3 — the short list

This update folds in everything you've reviewed and approved since 18 May, plus the two major operational decisions that came out of the dashboard review:

| Topic | v1.3 (18 May) | v2.0 (this document) |
|---|---|---|
| Project phase | Phase-0 gate held | ✅ **Phase 0 complete** · 🟡 **Phase 1 nearing final completion** |
| Admin Dashboard | Visual demo only | Visual demo **plus the operational Pending Review workflow** is now defined and built in the demo (approve / modify+approve / reject / escalate, atomic claim, role-scoped queues) |
| Roles | Super / Master / Admin defined | Same — now with **explicit state-wise restrictions per role** and an enforced **DB row-level security policy** (§5) |
| Pending Review queue | Mentioned in passing | **Now a first-class section** — its own table, locking, escalation, and live multi-admin sync (§4) |
| Categories | 8 | **10** — added Obituaries, Marriage Events (renamed), Local Advertisements (separate from Shopping) |
| Storage layout | One bucket, 4-level address | Same backbone — added **rejected-archive**, **advertisements**, **public-notices**, **legal-hold**, **exports** folders (the §7.1 items you accepted) |
| Storage tier | AWS S3 + CloudFront, Mumbai | Same — now in production for staging (per Phase-0 runbook completion) |
| Multi-admin synchronisation | Implied | **Now spelled out** with the exact concurrency mechanism (§6) |
| Hyperlocal scalability | Generic note | **Dedicated section** for 9 → 300 → 3,000+ channel expansion path (§12) |

Everything else from v1.3 still stands. If you want the v1.3 wording preserved alongside, it remains in `planning/LOCALAITV-DATA-STORAGE-FLOW-EXPLAINED.md`.

---

## 1. Where the system stands today (honest status)

| Part | Status |
|---|---|
| Mobile app (10 upload forms, 9 channels, local pages, intro auto-start) | ✅ **Live** — Pro plan, auto-deploying to Netlify on every approved change |
| The 9 constituency channels (Kurnool, Tirupati, Guntur, Nellore, Kakinada · Khammam, Karimnagar, Warangal, Nalgonda) | ✅ **Live** via YouTube live streams (per-channel IDs now stored in app config) |
| Admin Dashboard — design and clickable demo | ✅ **Live as in-app demo** · all 15 modules visible · drill-downs working · **Pending Reviews workflow fully clickable** |
| Pending Review queue (real backend) | 🟡 **Specified — implementation in Phase 1** (this document is the spec) |
| Two databases + AWS S3 + CloudFront | 🟢 **Phase-0 build complete in staging** · production cut-over scheduled in Phase 1 |
| AI pipeline migration (Google Cloud → AWS) | 🟢 **Phase-0 lift-and-shift completed** · validation running |
| Phase-1 production traffic | 🟡 Nearing final completion — pending Pending-Review backend, HA pair on AI DB, and CDN cache rules final pass |

> This document is the **target architecture as of 23 May 2026**. The implementation that is in flight (Phase 1) follows this design directly. Anything marked 🟡 is being built but not yet on production traffic.

---

## 2. The 30-second picture

```
                         ┌──────────────────────────────────────────────┐
                         │  CITIZEN REPORTER · ordinary citizen · admin │
                         │  via the LocalAI TV mobile app (10 forms)    │
                         └────────────────┬─────────────────────────────┘
                                          │ upload (1–3 media + form)
                                          ▼
                         ┌──────────────────────────────────────────────┐
   automatic safety ──►  │  CLOUDFLARE TURNSTILE · CLAM-AV · SHA-256    │
   (no admin yet)        │  DUPLICATE · NSFW / OBSCENITY DETECTOR       │
                         └────────────────┬─────────────────────────────┘
                                          ▼ status = pending
                                ┌─────────────────────┐
                                │  PENDING REVIEW     │ ←── Admin / Master / Super
                                │  QUEUE (DB-locked)  │     atomic claim · role-scoped
                                └──────┬──────────────┘     by state · category filter
                                       │ admin clicks Review
                          approve ▼    │    ▼ modify+approve   reject ▼    escalate ▼
                ┌──────────────────────┴──────────────────────────────────────────┐
                │                                                                 │
                ▼                                                                 ▼
        ┌───────────────┐   ┌────────────────┐    ┌──────────────┐    ┌────────────────────┐
        │ APPROVED      │   │ EDITED+APPROVED│    │ REJECTED     │    │ ESCALATED          │
        │ → AI pipeline │   │ → AI pipeline  │    │ → archive    │    │ → next-tier queue  │
        └───────┬───────┘   └────────┬───────┘    └──────────────┘    └────────────────────┘
                │ webhook (HMAC, retried)
                ▼
                         ┌──────────────────────────────────────────────┐
                         │  AI PIPELINE (FastAPI · Celery · GPU EC2)    │
                         │  Gemini Flash → Google TTS → FFmpeg/NVENC    │
                         │  output to S3 ai-processed/<address>/        │
                         └────────────────┬─────────────────────────────┘
                                          │ callback (HMAC)
                                          ▼ status = ready_for_bulletin
                         ┌──────────────────────────────────────────────┐
                         │  SCHEDULER (pg_cron + advisory lock)         │
                         │  5 daily slots / channel · birthdays on date │
                         └────────────────┬─────────────────────────────┘
                                          ▼ status = published
                                  LIVE on channel · viewers watch
                                  · uploader receives 10-min push notice
```

Two databases hold all of this state — **decisions** on one side, **production** on the other — linked by a single `content_id`. The next sections explain each block.

---

## 3. The two databases — unchanged backbone, now with concrete schemas

LocalAI TV deliberately keeps **two separate PostgreSQL databases**. Nothing about that has changed since v1.3 — and we are not collapsing them. What v2.0 adds is the **explicit table list** that Phase 1 builds.

### NOTEBOOK 1 — Admin / Decisions Database
*Supabase Postgres · Mumbai region · owned by the moderation team*

| Table | What it holds | Why it matters |
|---|---|---|
| `users` | every reporter, admin, citizen — name, mobile, role, assigned states, login security | Source of truth for **who** and **what they can do** |
| `content` | every submission — uploader, address (state/district/constituency/category), headline, description, media keys, current status | Source of truth for **what was submitted and where it stands** |
| `content_pending` | live queue index — only rows with status ∈ {pending, under_review, escalated} | The Pending Review table reads from here (kept small for speed) |
| `content_audit_log` | every approve/edit/reject/escalate action — who, when, before/after diff | The **review history** Mohan asked for — append-only |
| `content_reviews` | per-decision record — reviewer id, action, time taken, reason text, edited fields | Lets us measure reviewer throughput and quality |
| `escalations` | one row per escalation — from tier, to tier, reason, target admin | Drives the escalation queue |
| `webhook_deliveries` | log of every webhook sent to the AI pipeline + delivery proof | The reliability layer (§7) |
| `notifications` | every message sent to a user — approval, rejection, re-upload, reward, etc. | The notifications log shown in the dashboard |
| `content_filter_counts` | pre-computed per-(state, district, constituency, category) counts | What keeps analytics fast at 3,000-channel scale |

### NOTEBOOK 2 — AI Pipeline / Production Database
*Postgres on AWS Mumbai (migrated in Phase 0) · owned by the AI team*

| Table | What it holds |
|---|---|
| `ai_processing_jobs` | every job — queued → processing → done/failed, attempts, last error |
| `content_assets` | one row **per stored file** (input image, generated voice, final video, thumbnail, manifest) with checksum + storage URI |
| `content_collections` | logical groupings (e.g. "Kurnool birthdays", "Tirupati news bulletin") so the scheduler asks for content **by meaning**, never by hunting through folders |
| `schedule_slots` | the channel programme — 5 daily slots per channel + the per-event override |
| `schedule_overrides` | manual schedule overrides made by admins (with audit trail) |
| `channel_config` | per-channel rules (filters, language, YouTube live ID, auto-expiry policy) |
| `display_rules` | category-wise display rules (birthday: on date, marriage: 7d/3d/0d, classifieds: rotation, etc.) |
| `ai_callbacks_outbox` | callback dead-letter — items whose result couldn't be delivered to the Admin DB (re-driven by reconciler) |
| `content_rotation_state` | rotation cursor per (channel, category) so feeds stay fresh |

**One link, one direction:** `content_id` (UUID v4) is created in DB 1 and follows the content into DB 2 and back. **No foreign keys cross databases** — that boundary is what gives us the "one DB can fail without taking the other down" property.

---

## 4. Pending Review workflow — the operational heart of the platform

This is the section you specifically asked to be made first-class. The Pending Review workflow now has its own table, its own concurrency story, and its own UI (the orange tile on the dashboard).

### 4.1 The lifecycle of a single review

```
content uploaded
       │ status = pending
       ▼
PENDING REVIEW TABLE (state-scoped per admin)
       │
       │ Admin clicks "Review" on a row
       ▼  → ATOMIC CLAIM (UPDATE content
       │      SET status='under_review',
       │          claimed_by = me,
       │          claim_expires_at = now() + 30min
       │      WHERE id = X AND status='pending')
       │
       │  1 row updated = I own it · 0 rows = someone else got it first
       ▼
DETAIL PAGE (everything from the upload form rendered exactly as submitted)
       │
       │  Admin verifies: relevant? · abusive? · fake/spam? · corrections?
       ▼
       ┌──────────────┬──────────────────┬─────────────┬───────────────────┐
       │   ✅ Approve │ ✏️ Modify+Approve │ ❌ Reject   │ ↗ Escalate         │
       └──────┬───────┴────────┬─────────┴──────┬──────┴────────┬──────────┘
              │                │                │               │
              ▼                ▼                ▼               ▼
       status='approved'   modified copy   status='rejected'  status='escalated'
       webhook to AI       + status=        kept 30d in       row appears in
       pipeline            'approved'       rejected-archive  next tier's queue
              │                │                                │
              └──────┬─────────┘                                │
                     ▼                                          │
              AI processing                                     │
                     │                                          │
                     ▼                                          ▼
              published                                Master / Super queue
```

### 4.2 The pending-review table (DB-level)

```sql
-- Notebook 1 / Admin DB
CREATE TABLE content (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by       uuid REFERENCES users(id),
    state_code         text NOT NULL,           -- 'AP' | 'TG' | 'KA' | …
    district           text NOT NULL,
    constituency       text NOT NULL,
    category           text NOT NULL CHECK (category IN (
                          'News','Events','Jobs','Shopping','Birthdays',
                          'Car Sales','House Rent','Marriage Events',
                          'Obituaries','Local Advertisements')),
    headline           text NOT NULL,
    description        text,
    media_keys         jsonb NOT NULL,          -- S3 keys for the uploaded files
    status             text NOT NULL CHECK (status IN (
                          'pending','under_review','approved','rejected',
                          'escalated','ready_for_bulletin','scheduled',
                          'published','failed_retryable','failed_final',
                          'callback_lost','archived')),
    claimed_by         uuid REFERENCES users(id),
    claim_expires_at   timestamptz,
    escalated_to_tier  text,                    -- 'master' | 'super' | null
    created_at         timestamptz DEFAULT now(),
    updated_at         timestamptz DEFAULT now()
);

CREATE INDEX content_pending_idx
    ON content (state_code, district, constituency, category, created_at)
    WHERE status IN ('pending','under_review','escalated');
```

### 4.3 The four decision actions — what each one writes

| Action | DB writes (Admin DB) | Downstream effect |
|---|---|---|
| **Approve** | `content.status='approved'` · `content_reviews` row · `content_audit_log` row | Webhook fired to AI pipeline · `webhook_deliveries` row inserted |
| **Modify & Approve** | Same as Approve **plus** an `original_snapshot` row keeps the unedited submission read-only | Edited copy goes to AI pipeline; original is retained for audit |
| **Reject** | `content.status='rejected'` · review row with `reason_code` + `reason_text` | Notification to citizen reporter · media moved to `rejected-archive/` (30 days then auto-delete) |
| **Escalate** | `content.status='escalated'` · `content.escalated_to_tier=<next>` · `escalations` row created | Item disappears from current tier's queue and appears in the next tier's queue |

### 4.4 The Pending Reviews table the admin sees

Columns (matching your spec exactly):

```
| #  | Photo | Name              | Upload time         | State | Constituency | Category    | Action  |
|----|-------|-------------------|---------------------|-------|--------------|-------------|---------|
|  1 |  🟣   | Ravi Kumar        | Today 09:42         | AP    | Kurnool      | News        | Review ›|
|  2 |  🔵   | Lakshmi Devi      | Today 11:18         | AP    | Guntur       | Birthdays   | Review ›|
| …  | …     | …                 | …                   | …     | …            | …           | …       |
```

This view is **always** filtered by:
1. The current admin's role-scope (§5),
2. The category filter chip selected at the top,
3. Items with status ∈ {pending, under_review (claimed by *me* only)}.

---

## 5. Role hierarchy & state-wise restrictions

The three-tier system from v1.3 stays — what v2.0 adds is the **explicit DB enforcement** so a buggy frontend can never leak data outside an admin's scope.

| Tier | Pending queue scope | Other powers |
|---|---|---|
| **Admin** | Items in **assigned state(s) only** (1 row in `admin_state_grants`) | Approve / modify+approve / reject / escalate **up to Master** |
| **Master Admin** | Items in **multiple assigned states** (typically a language region — e.g. Telugu = AP+TG) | All of Admin **+** can create/suspend Admins · escalate **to Super** · all-India analytics |
| **Super Admin** | **All states** | All of Master **+** create Master Admins · force-release stuck slots · access secrets/infra · audit all admins |

### 5.1 How the scope is enforced (the safety belt)

Two layers — both required:

1. **Frontend filter** (the dashboard) — only shows in-scope items. *Fast, but can be bypassed by a malicious client.*
2. **Database Row-Level Security (Postgres RLS)** — every SELECT/UPDATE against `content` is rewritten by Postgres to add a `WHERE state_code = ANY (allowed_states_for_current_user)` clause. *Cannot be bypassed.*

```sql
-- Admin DB (illustrative)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_scope ON content
  USING (
    current_user_role() = 'super'
    OR state_code = ANY (current_user_states())
  );
```

`current_user_role()` and `current_user_states()` read the JWT issued at login — so the rule travels with every query.

### 5.2 State grants table

```sql
CREATE TABLE admin_state_grants (
    user_id     uuid REFERENCES users(id),
    state_code  text,                 -- 'AP', 'TG', 'KA' …
    granted_at  timestamptz DEFAULT now(),
    granted_by  uuid REFERENCES users(id),
    PRIMARY KEY (user_id, state_code)
);
```

In the live dashboard demo today:
- **Admin** = AP
- **Master** = AP, TG
- **Super** = AP, TG, KA, TN (all four pilot states)

These rows are seeded in staging and are editable from the Users module by Super Admin.

---

## 6. Multi-admin synchronisation — the no-duplicate-review guarantee

You explicitly called this out: "If multiple admins are working simultaneously, once one admin processes a review, it should instantly disappear from other admins' pending lists as well." Here is how that is engineered:

### 6.1 The "atomic claim" pattern

```sql
-- On clicking "Review" — runs in 1 round-trip, fully atomic
UPDATE content
   SET status = 'under_review',
       claimed_by = $admin_id,
       claim_expires_at = now() + interval '30 minutes',
       updated_at = now()
 WHERE id = $content_id
   AND status = 'pending'
RETURNING *;
```

- If the row is updated (1 row returned) → **I own it** → open the detail page.
- If 0 rows returned → **someone else already claimed it** → the UI shows "Already claimed by Lakshmi · refreshing list" and re-loads the queue.

This pattern is **race-free** because Postgres serialises the UPDATE on the row. It needs no extra locks, queues, or coordinators.

### 6.2 Live UI propagation (everyone sees the change immediately)

The dashboard subscribes to **Postgres `LISTEN/NOTIFY`** on the `content_changed` channel (or via Supabase Realtime, which uses the same mechanism). When any row changes:

```
Postgres ─NOTIFY content_changed─►  WebSocket fan-out  ─►  every open dashboard
                                                            removes/updates the row
                                                            in its visible queue
```

In practice: an admin clicks Approve → the row's status changes → within ~200 ms every other admin's queue removes that row from view. No polling, no race.

### 6.3 The 30-minute auto-release safety

If an admin claims a row and disappears (closes the browser, loses signal), the row would be stuck. So:

- The `claim_expires_at` field is set to `now() + 30 min` on every claim.
- A background job (`pg_cron`, runs every minute) releases any row where the claim has expired:

```sql
UPDATE content
   SET status='pending', claimed_by=NULL, claim_expires_at=NULL
 WHERE status='under_review' AND claim_expires_at < now();
```

So no item can be "stuck" longer than 30 minutes.

### 6.4 Escalation flow — the same pattern, one tier up

```
Admin clicks Escalate
       │
       ▼
   UPDATE content SET status='escalated', escalated_to_tier='master'
   INSERT into escalations (content_id, from_tier='admin', to_tier='master',
                            from_user, reason, created_at=now())
       │
       ▼
   NOTIFY content_changed
       │
       │   → disappears from Admin queues
       │   → appears in every Master Admin's queue (matching state scope)
       ▼
   Master reviews → can Approve / Reject / Escalate-to-Super (same four actions)
   If Master escalates → row appears in Super's queue (which has all states).
```

Super has no further tier; the "Escalate" button is disabled at that level (already implemented in the demo).

### 6.5 What every admin sees in their queue

Items they see → items in their scope AND in one of:
- `status='pending'` (unclaimed), **or**
- `status='under_review' AND claimed_by = me` (own active review), **or**
- `status='escalated' AND escalated_to_tier ≤ my_tier` (escalations that reached or surpassed their tier).

Items they don't see:
- Anything claimed by another admin (so two people can't open the same item).
- Anything outside their state scope (enforced by RLS in the DB, not just the UI).

---

## 7. Webhooks & callbacks — the reliability layer (unchanged from v1.3, restated)

| Direction | Mechanism | Retries |
|---|---|---|
| Admin → AI pipeline (approval) | `pg_boss` enqueues a webhook → HTTP POST signed with HMAC-SHA256 + `idempotency_key` | 1s → 5s → 30s → 5min → 30min, then dead-letter |
| AI pipeline → Admin (done) | HTTP POST to `/api/webhook/ai-processed` signed with HMAC | 5xx = retry · 4xx = dead-letter (Sentry alerted) |
| Watchdog | `pg_cron` job sweeps content stuck > 30 min waiting for callback → marks `callback_lost`, escalates to Super | — |

Both directions are **idempotent**: the same payload arriving twice never causes a double-process, double-publish, or double-notify.

---

## 8. Categories — now 10, all on the same rails

Same 4-level address (`state → district → constituency → category`) — only the category list grew. Storage path, scheduling rules, and admin workflow remain identical for every category; only the *display rule* differs.

| # | Category | Path leaf | Display rule |
|---|---|---|---|
| 1 | News | `news/` | News bulletin slot · 24-hour freshness preference |
| 2 | Events | `live_event/` | Shown 2 days, 1 day, day-of · auto-expires after event date |
| 3 | Jobs | `classified/job/` | Local classifieds · 7-day rotation · auto-expires |
| 4 | Shopping | `shopping/` | Promo rotation · 7-day visibility (renewable) |
| 5 | Birthdays | `birthday/` | **Auto-scheduled to slot nearest 9 AM on exact date** · auto-expires next day |
| 6 | Car Sales | `car_sale/` | Classifieds · auto-expires per configured window |
| 7 | House Rent | `classified/rent/` | Classifieds · auto-expires per configured window |
| 8 | Marriage Events | `marriage/` | Shown 7d, 3d, day-of · auto-expires after event |
| 9 | **Obituaries** *(new)* | `obituary/` | Same-day high priority · 30-day archive · special "remembrance" rotation |
| 10 | **Local Advertisements** *(new — separate from organic Shopping)* | `advertisements/` | Paid · billed separately · own rotation rule · ends at campaign expiry |

Public Notices ride the `news/` rail with a `public_notice=true` collection tag, so they retain bulletin priority without inventing a new category.

---

## 9. Citizen reporter upload flow — step by step (updated)

```
1. SUBMIT
   Citizen / reporter fills one of the 10 forms in the app.
   → A unique content_id is created (UUID v4).
   → Files uploaded to S3 citizen-uploads/pending/<content_id>/.
   → Automatic checks: Cloudflare Turnstile · ClamAV virus scan ·
     SHA-256 dedup (catches the same file uploaded twice) ·
     NSFW / obscenity classifier (flags risky items in red for priority review).
   → Row inserted in `content` with status='pending'.
   → Pushed via NOTIFY → every in-scope admin's queue updates instantly.

2. WAITS IN THE PENDING-REVIEW TABLE
   Filed by state/district/constituency/category address.
   Sorted by oldest-first by default (configurable per admin).

3. AN ADMIN CLAIMS IT (atomic — §6.1)
   30-minute lock prevents double-review.

4. ADMIN DECIDES — four actions (§4.3)

5. (Only if approved or modified+approved) HANDED TO AI PIPELINE
   pg_boss enqueues a webhook · HMAC-signed · retried per §7.

6. AI PIPELINE PROCESSES
   Gemini Flash summary → Google TTS Telugu voice → FFmpeg/NVENC video
   → output to s3://localaitv-content-mumbai/ai-processed/<address>/

7. PIPELINE CALLS BACK
   POST /api/webhook/ai-processed → status='ready_for_bulletin' + thumbnail URL.

8. SCHEDULED & BROADCAST
   pg_cron + advisory lock places the item in a daily slot (5 slots/channel
   by default, plus on-date for birthdays / marriages / obituaries).
   10-minute pre-broadcast push to uploader.

9. AUDIT
   Every step writes to content_audit_log (append-only) with timestamp,
   actor, before/after snapshot for edits. This is what powers the
   review-history view in the dashboard.
```

---

## 10. Storage architecture — same backbone, refined folders

Still **one AWS S3 bucket in Mumbai** (`localaitv-content-mumbai`) fronted by **CloudFront**.

```
s3://localaitv-content-mumbai/
│
├── citizen-uploads/
│   ├── pending/        ← just uploaded, awaiting admin review
│   └── approved/       ← admin-approved, queued for AI pipeline
│
├── admin-direct-uploads/   ← reporter / team raw video (fast track, still audited)
│
├── notebooklm/             ← long-form / explainer source material
│   ├── individual-news/<state>/<district>/<constituency>/
│   ├── bulletins/ (district / state / national)
│   └── debates/<level>/<state>/<district>/<constituency>/
│
├── ai-processed/           ← FINISHED individual items
│   └── <state>/<district>/<constituency>/<category>/<content_id>/
│         final.mp4
│         headline.mp3
│         thumb.jpg
│         meta.json
│
├── ai-processed-bulletins/ ← FINISHED full bulletins
│   └── <state>/<district>/<constituency>/bul_<date_time>/
│         final_bulletin.mp4
│         bulletin_manifest.json
│         thumbnail.jpg
│         segments/  (item_001.mp4 … item_NNN.mp4)
│         metadata.json
│
├── rejected-archive/       ← rejected items, kept 30 days for dispute/audit
│   └── <state>/<district>/<constituency>/<content_id>/
│
├── advertisements/         ← paid ads, tracked separately from Shopping
│   └── <campaign_id>/<state>/<district>/<constituency>/<content_id>/
│
├── public-notices/         ← government / official notices
│   └── <state>/<district>/<constituency>/<content_id>/
│
├── legal-hold/             ← protected area — nothing auto-deletes here
│
└── exports/                ← analytics, billing, audit exports (not media)
    └── reports/
```

### 10.1 Cost-saving lifecycle (S3 lifecycle rules — set once, then automatic)

| Age | Storage class | ~Cost saving |
|---|---|---|
| 0–7 days | S3 Standard | baseline |
| 8–30 days | S3 Standard-IA | ~50% |
| 31–90 days | S3 Glacier Instant Retrieval | ~75% |
| 91+ days | S3 Glacier Deep Archive | ~95% |

Manifests (`*.json`) **never auto-archive** — they stay in Standard so history queries are instant even when old videos sit in Deep Archive.

### 10.2 CDN cache rules (CloudFront)

| Asset | TTL | Reason |
|---|---|---|
| `thumb.jpg` | 7 days | Cheap, rarely changes |
| `final.mp4` (AI output) | 30 days | Heaviest by volume — keep cached |
| `final_bulletin.mp4` | 24 hours | Refreshes daily |
| `headline.mp3` | 30 days | Cheap, very stable |

> The CDN deflects ~90% of plays from ever touching S3, which is what prevents the "₹5–10 Cr/month egress" worst case at scale.

---

## 11. Review logs, audit history, and notifications

### 11.1 What's recorded for every reviewed item

```
content_audit_log
  ├── action: claimed | approved | modified+approved | rejected | escalated | reassigned | force-released
  ├── actor:  user_id (+ role at the time)
  ├── before / after JSON diff (for modify+approve)
  ├── reason text (mandatory on reject / escalate)
  └── created_at
```

This is the table the dashboard's Audit Log module reads, **filtered by viewer role** (Admin sees only their own actions, Master sees their team, Super sees all).

### 11.2 Notifications fired per action

| Trigger | Audience | Channel | Template |
|---|---|---|---|
| Approved | Citizen / Uploader | FCM push + in-app | ✅ Approval template |
| Rejected | Citizen | FCM push + in-app | ❌ Rejection template (reason included) |
| Re-upload requested (modify path) | Uploader | FCM push + in-app | 🔁 Re-upload template |
| Need more info | Uploader | FCM push + in-app | ℹ️ More-info template |
| Escalated | Target reviewer / target tier | FCM push + dashboard inbox | ↗ Escalation template |
| Reward earned | Citizen | FCM push + in-app | 🎁 Reward template |
| Pre-broadcast (10-min) | Uploader | FCM push | ⏰ Pre-broadcast template |
| Published | Uploader · viewers (optional) | FCM push + channel update | 🎉 Published template |
| Admin remark | Admin / Master | Dashboard inbox | 📝 Admin remark |

All sends are logged in `notifications` — that's the table the Notifications module renders.

---

## 12. Hyperlocal scalability — the 9 → 300 → 3,000+ channel path

You called this out explicitly. Here is the concrete plan, by phase:

### 12.1 Capacity targets

| Milestone | Channels | Uploads / day | Videos / day | Peak concurrent reviewers |
|---|---|---|---|---|
| Today | 9 (AP 5 + TG 4) | ~5,000 | ~3,000 | ~10 |
| Month 1 (Phase 1 cut-over) | 300 (all AP + TG districts) | ~50,000 | ~30,000 | ~50 |
| Month 6 (pan-India hyperlocal) | 3,000 | ~600,000 | ~400,000 | ~200 |
| Year 2 | 10,000 (mandal-level) | ~2 million | ~1.5 million | ~500 |

### 12.2 What scales horizontally without redesign

| Layer | How it scales |
|---|---|
| **Admin DB (Postgres)** | Read replicas for analytics · partition `content` by `state_code` · pg_boss workers scale by adding processes |
| **AI DB (Postgres on AWS)** | HA primary + replica (Phase-1 commit) · partition `ai_processing_jobs` by month |
| **AI pipeline (FastAPI + Celery)** | Add worker pods · GPU EC2 fleet auto-scales · model is stateless |
| **S3** | No limit — just keep paying for storage tiers; lifecycle rules eat the cost |
| **CloudFront** | Edge locations absorb traffic — adding regions is a setting |
| **Pending Review UI** | Already paginated · realtime via NOTIFY scales to thousands of admins on Supabase Realtime |

### 12.3 What needs an explicit upgrade between milestones

| At | Upgrade |
|---|---|
| 300 channels | Promote AI DB to HA pair · enable read replicas on Admin DB · add CDN log shipping for billing |
| 3,000 channels | Partition `content` by state · move analytics to a separate OLAP store (BigQuery or ClickHouse) so live queries stay fast · move long-tail thumbnails to S3 IA on day 1 |
| 10,000+ | Move to a sharded write path on Admin DB · region-pin AI workers per language cluster |

### 12.4 The non-negotiable scalability invariants (don't break these)

1. **One 4-level address — everywhere.** Database, S3 folders, CDN paths, channel filters all use `state → district → constituency → category`. Never invent a parallel scheme.
2. **Pre-computed counts.** Analytics never runs a live `SELECT COUNT(*) FROM content WHERE …` against the live table. Always reads from `content_filter_counts` (which is maintained by triggers).
3. **Idempotency on every webhook.** Every cross-DB call carries an `idempotency_key`; duplicates are silently no-op.
4. **Single source of truth per concern.** Decisions live only in Admin DB. Processing/storage state lives only in AI DB. They never disagree because they don't overlap.
5. **Constituency add = 1 row, not a migration.** A new town comes online by inserting a row into `content_collections` and `channel_config` — no S3 reorganisation, no schema change.

---

## 13. Phase status & next steps

| Phase | What's in it | Status |
|---|---|---|
| **Phase 0** — preparation | AWS account setup · GPU quota · staging Admin+AI DB pair · S3 bucket + CloudFront · pipeline lift-and-shift from Google Cloud | ✅ Complete |
| **Phase 1** — production cut-over | Pending Review backend (this doc) · Admin DB HA pair · CloudFront cache rules final pass · webhook reliability layer in production · all 9 channels migrated | 🟡 Nearing completion |
| **Phase 2** — scale-out | 300 channels onboarded · district-level grouping · analytics read replicas · cost optimisation pass | 📋 Planned |
| **Phase 3** — pan-India | 3,000 channels · OLAP analytics store · regional CDN tuning | 📋 Planned |
| **Phase 4** — optimisation | Sharded write path · per-language worker fleets · cost / quality refinement | 📋 Planned |

---

## 14. What we need from you (review questions)

1. **Retention windows** — please confirm: rejected-archive 30 days, hot 90 days, archive 1 year, deep archive thereafter. Adjust any numbers.
2. **Obituaries display rule** — same-day high priority + 30-day archive: acceptable, or do you want a different cadence?
3. **Local Advertisements separation** — confirm we keep this as a distinct paid lane (separate billing, separate folder, separate display rule) and not merged into Shopping.
4. **Master Admin assignment policy** — current proposal is "by language cluster" (Telugu = AP+TG, Kannada = KA, Tamil = TN). Any change?
5. **Auto-release window** — 30 minutes for stuck claims feels right; confirm or override.
6. **Escalation reasons** — should escalation **require** a reason text (mandatory field) or be optional? Current default: mandatory.

---

## 15. One-paragraph summary

A citizen uploads through the LocalAI TV app → safety checks run → the item lands in a **state-scoped, atomically-claimable Pending Review queue** in the Admin database → an Admin (or Master, or Super, per role-scope) opens it, sees the full submission, and either **Approves / Modifies+Approves / Rejects / Escalates** → on approval, a signed-and-retried webhook hands the `content_id` to the AI pipeline → the pipeline produces a Telugu video and reports back → the scheduler places it into a daily channel slot → the bulletin airs and the uploader is notified. Two databases (Decisions and Production) stay separate but linked by one ID. One S3 bucket in Mumbai, fronted by CloudFront, holds everything in a 4-level `state/district/constituency/category` address that scales from 9 to 10,000 channels without redesign.

---

*Documentation reflecting Phase-0 completion (23 May 2026) and Phase-1 cut-over scope. Supersedes v1.3 of LOCALAITV-DATA-STORAGE-FLOW-EXPLAINED.*
**LocalAI TV Architecture Team** · LocalAI Media Network Pvt Ltd · CIN: U63910KA2025PTC212593 · Hyderabad, India

# LocalAI TV — Admin Dashboard & Database System
## Final Specification Document · **v1.1**

**Status:** ✅ Final spec after consolidating feedback from 3 senior engineers (Abishek, Sameer, Gnana)
**Last updated:** 14 May 2026
**Owner:** Koneti Mohan Reddy ([localaitv@gmail.com](mailto:localaitv@gmail.com))
**Replaces:** v1.0 (24 May 2026)
**Document purpose:** Final shareable spec — locked and ready for build approval.

---

## 📜 Version History

| Version | Date | Changes |
|---|---|---|
| v1.0 | 24 May 2026 | Initial plan, 24 sections |
| **v1.1** | **14 May 2026** | **Consolidated 3 engineering reviews. Added production reliability, observability, security hardening, integration contract, retention policy, status enum updates.** |

### Key changes from v1.0 → v1.1

1. **Queue infrastructure** added (pg_boss in Postgres) — addresses Abishek's #1, #2, #8
2. **Observability stack** added (Sentry, PostHog, Better Stack, OpenTelemetry) — Abishek's #9
3. **Security hardening** explicit (Cloudflare Turnstile, WAF, rate limits, account lockout) — Abishek's #10
4. **Media validation** layer (MIME, virus, NSFW, hash dedup) — Abishek's #6
5. **Idempotency** built into webhook contract — Sameer/Gnana
6. **Integration contract** locked (full Pydantic schema, HMAC, retry, cancel-job) — Sameer/Gnana
7. **Bulletin output structure** per Gnana's spec adopted exactly
8. **Retention policy** per Gnana's recommendations
9. **Status enum** expanded to use Gnana's failure-state vocabulary
10. **Production readiness checklist** added (§20a)

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Three-Tier Admin System](#3-three-tier-admin-system)
4. [Content Workflow (End-to-End)](#4-content-workflow-end-to-end)
5. [The 8 Upload Forms — Field Audit](#5-the-8-upload-forms--field-audit)
6. [NotebookLM Integration](#6-notebooklm-integration)
7. [Database Architecture](#7-database-architecture)
8. [Storage Folder Structure](#8-storage-folder-structure)
9. [Hidden Admin Access](#9-hidden-admin-access)
10. [API Endpoints](#10-api-endpoints)
11. [Admin Dashboard UI](#11-admin-dashboard-ui)
12. [Analytics Dashboard with Drill-Down](#12-analytics-dashboard-with-drill-down)
13. [Channel Publishing Automation & Time Slots](#13-channel-publishing-automation--time-slots)
14. [Push Notification Templates](#14-push-notification-templates)
15. [AI Pipeline Webhook Integration (Updated)](#15-ai-pipeline-webhook-integration-updated)
16. [Security & Row Level Security](#16-security--row-level-security)
16a. [**🆕 Security Hardening**](#16a-security-hardening)
17. [Audit Log](#17-audit-log)
17a. [**🆕 Queue Infrastructure**](#17a-queue-infrastructure)
17b. [**🆕 Observability & Monitoring**](#17b-observability--monitoring)
18. [Tech Stack Summary](#18-tech-stack-summary)
19. [Cost Projections](#19-cost-projections)
20. [Implementation Phases](#20-implementation-phases)
20a. [**🆕 Production Readiness Checklist**](#20a-production-readiness-checklist)
21. [Team Requirements](#21-team-requirements)
22. [What's IN / OUT of v1](#22-whats-in--out-of-v1)
23. [What I Need From You — Action Items](#23-what-i-need-from-you--action-items)
24. [Approval & Sign-off](#24-approval--sign-off)

---

## 1. Executive Summary

We are building an internal moderation and content management system for LocalAI TV that:

- Adds a 3-tier admin team (super → master → admin) reviewing citizen submissions before they reach the AI processing pipeline
- Integrates seamlessly with the existing **FastAPI + Celery + RabbitMQ + Redis** AI Pipeline (already production-grade per AI team's review)
- Supports state-restricted admins (Telugu admin handles AP/TG; Kannada admin handles Karnataka; etc.)
- Integrates Google NotebookLM-generated content (5 content types) as a separate auto-approved stream
- Provides time-slot-based publishing automation with notifications to uploaders
- Includes production-grade queue infrastructure, observability, and security hardening

**Key non-disruption principle:** The existing AI processing pipeline stays 100% unchanged. The admin layer inserts BEFORE the pipeline — only approved content reaches AI processing.

**Monthly infrastructure cost (at launch):** ₹400–2,500
**Team requirements beyond founder:** Existing AI team (unchanged) + Claude (Anthropic) for build
**DevOps engineer needed:** No
**Full-stack developer needed:** No (Claude builds everything)

---

## 2. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           USERS                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│  │  Citizens/Public│    │  Admins         │    │  Master/Super   │       │
│  │  (Mobile app)   │    │  (Mobile + Web) │    │  Admins         │       │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘       │
└───────────┼──────────────────────┼──────────────────────┼────────────────┘
            │                      │                      │
            └──────────┬───────────┴──────────┬───────────┘
                       │                      │
                       ▼                      ▼
         ┌──────────────────────────────────────────────┐
         │   REACT + CAPACITOR APP (existing)           │
         │   ─────────────────────────                  │
         │   • Public app (citizen-facing)              │
         │   • /admin route (hidden, admin-only)        │
         └────────────┬─────────────────────────────────┘
                      │
                      │ API calls
                      ▼
         ┌──────────────────────────────────────────────┐
         │   SUPABASE (Mumbai, asia-south1)             │
         │   ─────────────────────────                  │
         │   • Postgres database                        │
         │   • Auth (SMS OTP + admin password+2FA)      │
         │   • Realtime subscriptions (Phase 2 only)    │
         │   • Row Level Security (permissions)         │
         │   • pg_boss (queue infrastructure)           │
         │   • pg_cron (scheduler + watchdog jobs)      │
         └────────────┬─────────────────────────────────┘
                      │
        ┌─────────────┼──────────────────────────────┐
        │             │                              │
        ▼             ▼                              ▼
┌──────────────┐ ┌─────────────────────┐  ┌──────────────────────┐
│ Cloudflare   │ │ Firebase Cloud      │  │ Observability stack  │
│ R2 (Mumbai + │ │ Messaging (FCM)     │  │ ─────────────────    │
│ Chennai)     │ │ ─────────────       │  │ • Sentry (errors)    │
│ ─────────    │ │ Push notifications  │  │ • Better Stack (logs)│
│ Photos/videos│ │ Free 100M/mo        │  │ • PostHog (product)  │
│ Zero egress  │ │                     │  │ • Cloudflare (CDN)   │
│ + WAF + DDoS │ └─────────────────────┘  │ • OpenTelemetry      │
│ + Turnstile  │                          └──────────────────────┘
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  EXISTING AI PIPELINE (FastAPI + Celery + RabbitMQ + Redis)  │
│  ─────────────────────────                                   │
│  • FastAPI intake (validates HMAC, returns 202 fast)         │
│  • RabbitMQ durable queue                                    │
│  • Celery media workers (Gemini Flash → Google TTS → FFmpeg) │
│  • Build worker (single instance, FFmpeg bulletin assembly)  │
│  • Maintenance worker (retries + cleanup)                    │
│  • Output to ai-processed/ in R2                             │
│  • Callback to Admin via /api/webhook/ai-processed           │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Three-Tier Admin System

### 3.1 Roles

| Role | Description |
|---|---|
| **Super Admin** | Founder-level. Full access. Only 1 person. |
| **Master Admin** | Senior moderator. Can create admins. Full state access. |
| **Admin** | Front-line moderator. Restricted to specific assigned state(s). |
| **Citizen / Public** | Unified role. No distinction between "citizen reporter" and "public". |

### 3.2 Permissions Matrix

| Capability | Super | Master | Admin |
|---|:---:|:---:|:---:|
| Create Master Admin | ✅ | ❌ | ❌ |
| Create Admin | ✅ | ✅ | ❌ |
| Suspend admins below tier | ✅ | ✅ (admins only) | ❌ |
| Geographic access | All | All | Assigned states only |
| Upload (national/state/district/constituency) | ✅ | ✅ | ✅ (within assigned states) |
| Bypass review (own uploads auto-approved) | ✅ | ✅ | ✅ |
| NotebookLM upload (5 sub-types) | ✅ | ✅ | ✅ |
| Approve / Modify+Approve / Reject | ✅ | ✅ | ✅ |
| Escalate to higher tier | n/a (top) | → Super | → Master |
| View all-India analytics | ✅ | ✅ | ❌ |
| Cancel approved jobs | ✅ | ✅ | ❌ |
| Audit log access | All | Team only | Own only |

### 3.3 State Restriction (Multi-Language Support)

Admins are assigned one or more states. Queue auto-filters; RLS enforces at DB level.

```
Admin: Ravi Kumar
├── Phone: +91 98765 43210
└── Language access (multi-select):
    ☑ Andhra Pradesh (Telugu)
    ☑ Telangana (Telugu)
    ☐ Karnataka (Kannada)
    ☐ Tamil Nadu (Tamil)
```

---

## 4. Content Workflow (End-to-End)

```
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 1 — UPLOAD                                                        │
│ Citizen submits: 1–3 media files + headline + description + location  │
│  • Files → Cloudflare R2 (Cloudflare Turnstile blocks bots)           │
│  • ClamAV virus scan via Edge Function                                │
│  • SHA-256 hash dedup                                                 │
│  • NSFW check via Google Cloud Vision (flag for priority review)      │
│  • Metadata → Supabase (status: pending)                              │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 2 — ADMIN CLAIM (atomic lock)                                    │
│ Admin clicks item:                                                    │
│  UPDATE content SET claimed_by=$me, claimed_at=NOW()                  │
│  WHERE id=$id AND status='pending'                                    │
│    AND (claimed_by IS NULL OR claimed_at < NOW() - INTERVAL '30 min') │
│  RETURNING *;                                                         │
│ • If 1 row returned: this admin owns it                               │
│ • If 0 rows: another admin already claimed → "already claimed by X"   │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 3 — DECISION                                                     │
│  ✅ APPROVE                                                            │
│  ✏️ MODIFY + APPROVE (original preserved read-only)                    │
│  ❌ REJECT (with reason; citizen notified)                             │
│  ↗ ESCALATE (admin → master → super)                                   │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
                       (only if approved)
                               │
                               ▼
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 4 — WEBHOOK DELIVERY VIA QUEUE                                   │
│  Admin enqueues webhook job in pg_boss                                │
│  Worker picks up → POST to AI Pipeline with HMAC + idempotency_key    │
│  Retry policy: 1s → 5s → 30s → 5min → 30min                           │
│  Dead-letter after 5 attempts → Sentry alert + super admin notify     │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 5 — AI PIPELINE (existing FastAPI + Celery + RabbitMQ + Redis)   │
│  FastAPI validates payload + HMAC                                     │
│  Returns 202 Accepted within 200ms                                    │
│  Enqueues Celery task with idempotency_key as task_id                 │
│  Worker: Gemini Flash → Google TTS → FFmpeg                           │
│  Output stored: ai-processed/<state>/<dist>/<const>/<cat>/<id>/       │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 6 — CALLBACK TO ADMIN                                            │
│  POST /api/webhook/ai-processed                                       │
│  Body: { content_id, ai_output_url, thumbnail_url, status, metrics }  │
│  Admin marks content: status = 'ready_for_bulletin'                   │
│  Retry 5 times if Admin unreachable; held in AI's local DLQ otherwise │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 7 — TIME-SLOT SCHEDULING                                         │
│  pg_cron + pg_try_advisory_xact_lock(slot_id)                         │
│  Catch-up job for missed slots                                        │
│  Birthday wishes auto-scheduled for birthday date                     │
│  Other content distributed across 4-5 daily slots                     │
│  10 min before slot: push notification to uploader                    │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 8 — BROADCAST                                                    │
│  Bulletin assembled (your existing 10-15min compilation)              │
│  Stored: ai-processed-bulletins/<state>/<dist>/<const>/bul_<TS>/      │
│  Live TV broadcast                                                    │
│  Audit log records aired_at                                           │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 5. The 8 Upload Forms — Field Audit

> **Note:** Final field-by-field audit will be done during Phase 1 against the canonical app source (`286.App_v3.jsx`). Megan (form engineer) has independently audited the live forms and will align them per founder's decisions. The JSONB `form_data` field handles any form-specific fields without requiring schema changes.

### Common rules across ALL forms:
- **Media:** Maximum 3 files (photos/videos in any combination)
  - Exception: Cars max 5, Rentals max 10 (subject to founder decision)
- **Single-language fields:** Headline / description are ONE field each (Telugu OR English; auto-detected)
- **Voice input** supported
- **Required confirmation:** "I confirm content is original" checkbox

### A. 📰 News
- Media (1–3, required)
- Headline (single, required, 4-30 words)
- Description (single, required, 20-300 words)
- Location (auto-filled with constituency)

### B. 🎂 Birthdays
- Recipient: name, DOB, age (auto), photos (max 3, first required)
- Up to 3 wishers: name + relation (one required), photo (optional)
- Auto-scheduled for birthday date

### C. 💒 Marriage Day (Anniversary)
- Couple name (combined field, required)
- Anniversary date
- Years auto-calculated
- Couple photos (first required)
- Up to 3 senders
- Greeting message (optional — to be ADDED to form per docs)

### D. 💍 Upcoming Marriage
- Bride name, Groom name (required)
- Marriage date, Venue, Muhurtham/Reception time
- Invitation card image, Invitation video
- Family contact phone (required)

### E. 📅 Events
- Event name, Event type (dropdown), Date, Time, Venue
- Description (required), Organizer name (required)
- Contact phone (required)
- Photos (max 3)

### F. 🛍 Shopping
- Shop name OR Item name (one required — founder decision pending)
- Category (dropdown), Price (required), Description
- Advertisement mode (Text / Voice)
- Media (Image / Video / Audio, max 3)
- Seller phone, Location

### G. 🚗 Cars / Vehicles
- Vehicle type, Brand, Model, Year
- KM driven, Fuel type (including Hybrid), Price, Owner type
- Color, Description, Seller details, Address
- Photos (max 5 — special exception)

### H. 🏠 Rentals
- Property type, Configuration (1BHK/2BHK/etc), Furnished status
- Monthly rent, Security deposit (optional)
- Area, Description, Owner name + contact
- Photos (max 10 — special exception)

### I. 💼 Jobs
- Job title, Company name, Job type (FT/PT/Contract/Daily wage/Internship/Fresher)
- Monthly salary (optional), Location
- Qualification (required), Skills (optional)
- Job description (required), No. of posts
- Contact phone OR email (at least one required)
- Last date to apply (optional)

### Future-proofing
When adding new categories (e.g. "Who's Who"): just add to category enum + define fields. Database `form_data` JSONB handles them automatically.

---

## 6. NotebookLM Integration

5 content streams from Google NotebookLM — admin uploads, auto-approved, bypasses AI pipeline:

| Source type | Description | Duration | Geographic level |
|---|---|---|---|
| **Individual news** | Constituency-specific items | 30 sec – 1 min | Constituency |
| **District bulletin** | 4-5 news compiled | 4-5 min | District |
| **State bulletin** | State-wide bulletin | 4-5 min | State |
| **National bulletin** | National bulletin | 4-5 min | National |
| **Debate (any level)** | Discussion format | Variable | All 4 levels |

**Upload:** Only Super/Master/Admin (admin within their states only). Auto-approved. Direct-publish lane. `processing_mode = 'notebooklm_generated'`.

---

## 7. Database Architecture

### Tech: Supabase (managed PostgreSQL) in Mumbai region.

### 7.1 Updated Tables

#### `users`
```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone             TEXT UNIQUE NOT NULL,
  name              TEXT,
  email             TEXT,
  role              user_role NOT NULL,
  assigned_states   TEXT[],
  password_hash     TEXT,
  profile_photo_url TEXT,
  constituency      TEXT,
  is_verified       BOOLEAN DEFAULT false,
  created_by        UUID REFERENCES users(id),
  suspended         BOOLEAN DEFAULT false,
  -- Security hardening (Abishek's input)
  failed_login_count INT DEFAULT 0,
  locked_until       TIMESTAMPTZ,
  last_login_at      TIMESTAMPTZ,
  last_login_ip      INET,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM (
  'super_admin', 'master_admin', 'admin', 'citizen'
);
```

#### `content` (updated with v1.1 columns)
```sql
CREATE TABLE content (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id           UUID REFERENCES users(id),
  author_role         user_role NOT NULL,
  content_source      content_source NOT NULL,
  processing_mode     processing_mode_enum NOT NULL,  -- 🆕 from Gnana
  geography_level     geography_level NOT NULL,
  state               TEXT,
  district            TEXT,
  constituency        TEXT,
  category            content_category NOT NULL,
  target_channel      TEXT,                           -- 🆕 for TTS routing
  form_data           JSONB NOT NULL,
  media_urls          JSONB,
  media_hashes        TEXT[],                         -- 🆕 SHA-256 for dedup
  nsfw_score          FLOAT,                          -- 🆕 from Google Vision
  original_data       JSONB,
  status              content_status NOT NULL DEFAULT 'pending',
  approved_version    INT DEFAULT 1,                  -- 🆕 from Gnana
  idempotency_key     TEXT UNIQUE,                    -- 🆕 from Gnana
  claimed_by          UUID REFERENCES users(id),
  claimed_at          TIMESTAMPTZ,
  reviewed_by         UUID REFERENCES users(id),
  reviewed_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  escalated_to        UUID REFERENCES users(id),
  webhook_sent_at     TIMESTAMPTZ,                    -- 🆕 prevent double-send
  ai_job_id           TEXT,                            -- 🆕 Celery task id
  ai_callback_at      TIMESTAMPTZ,                    -- 🆕
  ai_output_url       TEXT,                           -- 🆕
  ai_thumbnail_url    TEXT,                           -- 🆕
  ai_duration_seconds INT,
  ai_metrics          JSONB,                          -- 🆕 timing metrics
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE TYPE content_source AS ENUM (
  'citizen', 'admin_direct',
  'notebooklm_news', 'notebooklm_bulletin', 'notebooklm_debate'
);

CREATE TYPE processing_mode_enum AS ENUM (
  'ai_pipeline',         -- needs Gemini/TTS/FFmpeg
  'raw_video',           -- admin direct (skip AI)
  'notebooklm_generated' -- NotebookLM (skip AI)
);

CREATE TYPE geography_level AS ENUM ('national', 'state', 'district', 'constituency');

CREATE TYPE content_category AS ENUM (
  'news', 'birthday', 'marriage_day', 'upcoming_marriage',
  'event', 'shopping', 'car_sale', 'rental', 'job'
);

-- Updated status enum per Gnana's recommendation
CREATE TYPE content_status AS ENUM (
  'pending', 'in_review', 'rejected', 'escalated',
  'approved', 'queued', 'processing',
  'failed_retryable', 'failed_final',
  'ready_for_bulletin', 'scheduled', 'published',
  'cancelled', 'callback_lost', 'archived'
);
```

#### 🆕 `webhook_deliveries` (queue + retry tracking)
```sql
CREATE TABLE webhook_deliveries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id          UUID REFERENCES content(id),
  idempotency_key     TEXT UNIQUE NOT NULL,
  endpoint_url        TEXT NOT NULL,
  payload             JSONB NOT NULL,
  attempt_count       INT DEFAULT 0,
  last_attempted_at   TIMESTAMPTZ,
  last_response_status INT,
  last_response_body  TEXT,
  delivered_at        TIMESTAMPTZ,
  dead_lettered_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

#### 🆕 `ai_callbacks` (inbound from AI Pipeline)
```sql
CREATE TABLE ai_callbacks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id          UUID REFERENCES content(id),
  job_id              TEXT,
  idempotency_key     TEXT,
  status              TEXT,
  ai_output_url       TEXT,
  thumbnail_url       TEXT,
  duration_seconds    INT,
  error_message       TEXT,
  metrics             JSONB,
  received_at         TIMESTAMPTZ DEFAULT NOW()
);
```

#### `content_audit_log` (unchanged from v1.0)
[Same as v1.0 — see §7 of original plan]

#### `publishing_queue` (unchanged from v1.0)
[Same as v1.0]

#### `notifications` (unchanged)
[Same as v1.0]

### 7.2 Indexes (updated)

```sql
-- Fast admin queue queries (state-filtered)
CREATE INDEX idx_content_queue ON content(status, state, created_at)
  WHERE status IN ('pending', 'in_review') AND deleted_at IS NULL;

CREATE INDEX idx_content_geo ON content(state, district, constituency);

CREATE INDEX idx_approved_pool ON content(constituency, category, created_at DESC)
  WHERE status IN ('approved', 'ready_for_bulletin');

CREATE INDEX idx_reporter_stats ON content(author_id, status, created_at);

CREATE INDEX idx_publishing_pending ON publishing_queue(scheduled_for_date, scheduled_for_slot)
  WHERE status = 'queued';

-- For media dedup
CREATE INDEX idx_media_hashes ON content USING GIN (media_hashes);

-- For form-specific JSONB search
CREATE INDEX idx_form_data_gin ON content USING GIN (form_data);

-- For webhook delivery monitoring
CREATE INDEX idx_webhook_pending ON webhook_deliveries(content_id, attempt_count)
  WHERE delivered_at IS NULL AND dead_lettered_at IS NULL;
```

### 7.3 Row Level Security (unchanged from v1.0 — see §16)

---

## 8. Storage Folder Structure (updated per Gnana)

### Cloudflare R2 bucket: `localaitv-storage`

```
localaitv-storage/
│
├── citizen-uploads/
│   ├── pending/                    ← awaiting admin review
│   └── approved/                   ← admin-approved, queued for AI
│
├── admin-direct-uploads/           ← processing_mode='raw_video'
│
├── notebooklm/
│   ├── individual-news/<state>/<district>/<constituency>/
│   ├── bulletins/
│   │   ├── district/<state>/<district>/
│   │   ├── state/<state>/
│   │   └── national/
│   └── debates/<level>/<state>/<district>/<constituency>/
│
├── ai-processed/                   ← individual AI-processed items
│   └── <state>/<district>/<constituency>/<category>/<content_id>/
│       ├── final.mp4
│       ├── headline.mp3
│       ├── thumb.jpg
│       └── meta.json
│
└── ai-processed-bulletins/         ← per Gnana's exact spec
    └── <state>/<district>/<constituency>/bul_<YYYYMMDD_HHMMSS>/
        ├── final_bulletin.mp4
        ├── bulletin_manifest.json
        ├── thumbnail.jpg
        ├── segments/
        │   ├── item_001.mp4
        │   └── item_NNN.mp4
        └── metadata.json
```

### R2 Lifecycle Rules (per Gnana's retention policy)

```yaml
rules:
  - prefix: ai-processed-bulletins/*/segments/
    expire_days: 1                  # 24 hours
  - prefix: ai-processed-bulletins/*/final_bulletin.mp4
    expire_days: 2                  # 48 hours
  - prefix: ai-processed-bulletins/*/thumbnail.jpg
    expire_days: 2                  # 48 hours
  - prefix: ai-processed-bulletins/*/bulletin_manifest.json
    expire_days: 30                 # audit
  - prefix: ai-processed-bulletins/*/metadata.json
    expire_days: 30                 # audit
  - prefix: temp/*
    expire_days: 1                  # 24 hours
```

---

## 9. Hidden Admin Access

- **Web:** `https://admin.localaitv.com` (subdomain, not linked publicly)
- **Mobile:** Hidden 5-tap on Profile reveals "Staff Sign In" OR memorize URL
- **Login:** Phone/email + password + SMS OTP 2FA via 2Factor.in
- **Session:** 24h expiry
- **Failed logins:** Account locked after 5 failures, IP-blocked after 20/hour

---

## 10. API Endpoints (updated with v1.1 additions)

### Auth (admin)
- `POST /api/admin/login` — phone+password → OTP challenge
- `POST /api/admin/verify-otp` — confirm → session
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `POST /api/admin/change-password`

### Content queue
- `GET /api/admin/queue?state=&category=&geo_level=`
- `GET /api/admin/content/:id`
- `POST /api/admin/claim/:id`
- `POST /api/admin/release/:id`
- `POST /api/admin/approve/:id`
- `POST /api/admin/modify-approve/:id`
- `POST /api/admin/reject/:id`
- `POST /api/admin/escalate/:id`

### Admin uploads
- `POST /api/admin/upload` (auto-approved, AI pipeline)
- `POST /api/admin/upload-notebooklm` (auto-approved, direct publish)

### Citizen
- `POST /api/citizen/upload`
- `GET /api/citizen/my-uploads`
- `GET /api/citizen/notifications`

### User management
- `GET /api/admin/users?role=`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

### Analytics
- `GET /api/admin/analytics/dashboard?from=&to=&state=&category=`
- `GET /api/admin/analytics/breakdown?dimension=`
- `GET /api/admin/analytics/reporter/:id`
- `GET /api/admin/analytics/items?...`

### Publishing
- `GET /api/admin/publishing/queue`
- `POST /api/admin/publishing/schedule`
- `POST /api/admin/publishing/cancel/:id`

### 🆕 Webhook + Cancel job
- `POST /webhook/content-approved` (Admin → AI Pipeline)
- `POST /api/webhook/ai-processed` (AI Pipeline → Admin)
- `DELETE /webhook/cancel-job/:job_id` (Admin → AI Pipeline) 🆕
- `GET /api/admin/job-status/:job_id` (Admin polls AI) 🆕

### Audit
- `GET /api/admin/audit?content_id=`
- `GET /api/admin/audit/recent`

---

## 11. Admin Dashboard UI
(Unchanged from v1.0 — see §11 of original plan)

---

## 12. Analytics Dashboard with Drill-Down
(Unchanged from v1.0 — see §12)

---

## 13. Channel Publishing Automation & Time Slots

### Daily slots (configurable):
```
08:50 – 09:00  Morning
11:50 – 12:00  Lunch
16:50 – 17:00  Evening
20:50 – 21:00  Prime time
22:50 – 23:00  Late night
```

### Scheduling rules:
- **Birthday wishes:** Auto-scheduled to closest slot to 9 AM on EXACT birthday date
- **Marriage anniversaries:** Same
- **Upcoming marriage:** Scheduled 7d, 3d, and on-day
- **Events:** Scheduled 2d, 1d, and on-day
- **NotebookLM:** Routed to appropriate-level slot
- **General news:** Round-robin distribution

### Slot held vs released (per Gnana):
- Slot HELD if AI processing/callback fails
- Show "Standby filler" instead of empty broadcast
- Super admin can force-release

### Pre-broadcast notification:
10 min before each slot → push to all uploaders whose content airs.

---

## 14. Push Notification Templates
(Unchanged — see §14 of original plan)

---

## 15. AI Pipeline Webhook Integration (UPDATED v1.1)

### 15.1 Architecture (per Sameer + Gnana's contributions)

```
ADMIN DASHBOARD                       AI PIPELINE
─────────────────                     ─────────────
Admin approves                        
   ↓
Generate idempotency_key
  = content_id + "_v" + approved_version
   ↓
INSERT into webhook_deliveries
   ↓
pg_boss worker picks up
   ↓
POST /webhook/content-approved ──────► FastAPI validates HMAC
   {payload}                            Validates Pydantic schema
                                        Checks idempotency_key in Redis
   ◄────── 202 Accepted                Enqueues Celery task
   {job_id, idempotency_status}        (task_id = idempotency_key)
                                          ↓
                                        Celery worker:
                                          1. Downloads media from R2 signed URL
                                          2. Gemini Flash generates script
                                          3. Google TTS converts to MP3
                                          4. FFmpeg combines + edits
                                          5. Uploads to ai-processed/...
                                          ↓
   POST /api/webhook/ai-processed ◄──── AI sends callback
   {ai_output_url, status, metrics}
   ↓
Update status='ready_for_bulletin'
   ↓
Scheduler picks slot
   ↓
Notify uploader
   ↓
Build worker assembles bulletin
   ↓
Live broadcast
```

### 15.2 Webhook Payload Schema (Pydantic)

```python
class MediaItem(BaseModel):
    type: Literal["photo", "video"]
    url: str               # 1-hour signed URL
    size_bytes: int
    duration_seconds: Optional[int] = None
    thumb_url: Optional[str] = None
    sha256: str

class ApprovedContentWebhook(BaseModel):
    content_id: str        # UUID v4
    approved_version: int = 1
    idempotency_key: str   # = content_id + "_v" + approved_version
    job_id: Optional[str] = None
    
    geography_level: Literal["national", "state", "district", "constituency"]
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    
    category: Literal["news", "birthday", "marriage_day", "upcoming_marriage",
                       "event", "shopping", "car_sale", "rental", "job"]
    headline: str = Field(min_length=4, max_length=300)
    description: str = Field(min_length=20, max_length=3000)
    location: Optional[str] = None
    form_data: dict = Field(default_factory=dict)
    
    media_urls: list[MediaItem] = Field(min_length=1, max_length=3)
    
    author_id: str
    author_role: Literal["citizen", "admin", "master_admin", "super_admin"]
    approved_by: str
    approved_at: datetime
    
    target_channel: str    # e.g. "kurnool-tv" — selects TTS_PROVIDER_<CHANNEL>
    processing_mode: Literal["ai_pipeline", "raw_video", "notebooklm_generated"]
```

### 15.3 Webhook Response (AI → Admin)

```json
{
  "status": "queued",
  "ok": true,
  "content_id": "abc-123-def",
  "approved_version": 1,
  "job_id": "celery-task-id",
  "idempotency_status": "new",  // | "already_queued" | "already_completed" | "rejected"
  "accepted_at": "2026-05-14T10:30:00Z",
  "estimated_completion_at": "2026-05-14T10:32:00Z"
}
```

### 15.4 Callback Format (AI → Admin)

```json
POST /api/webhook/ai-processed
Authorization: Bearer <shared_callback_token>
X-LocalAITV-Idempotency-Key: <same>

{
  "content_id": "abc-123-def",
  "approved_version": 1,
  "job_id": "celery-task-id",
  "status": "ready_for_bulletin",  // or failed_retryable/failed_final
  "ai_output_url": "https://r2.../ai-processed/AP/Kurnool/Kurnool-Urban/news/abc-123/final.mp4",
  "thumbnail_url": "https://r2.../thumb.jpg",
  "duration_seconds": 47,
  "processed_at": "2026-05-14T10:35:00Z",
  "error_message": null,
  "metrics": {
    "gemini_time_ms": 1240,
    "tts_time_ms": 3820,
    "ffmpeg_time_ms": 12500,
    "total_time_ms": 17560
  }
}
```

### 15.5 Cancel Job Endpoint

```
DELETE /webhook/cancel-job/:job_id

Possible responses:
  200 OK  { "cancelled": true, "stage": "queued" | "processing" }
  410 Gone { "error": "already_complete", "ai_output_url": "..." }
  404 Not Found { "error": "job_not_found" }
```

### 15.6 HMAC Signing

```python
# Sender (Admin Dashboard)
body_bytes = json.dumps(payload, sort_keys=True).encode('utf-8')
signature = hmac.new(SHARED_SECRET, body_bytes, hashlib.sha256).hexdigest()

# Receiver (AI Pipeline) — must verify using raw body bytes
raw_body = await request.body()  # NOT request.json()
expected_sig = hmac.new(SHARED_SECRET, raw_body, hashlib.sha256).hexdigest()
if not hmac.compare_digest(expected_sig, request.headers['X-LocalAITV-Signature']):
    return JSONResponse({"error": "invalid_signature"}, status_code=401)
```

### 15.7 Retry Policy

| Failure type | Action |
|---|---|
| HTTP 5xx response | Retry: 1s → 5s → 30s → 5min → 30min |
| Network timeout | Retry same schedule |
| HTTP 4xx (validation) | DO NOT retry — write to dead-letter, alert super admin |
| HTTP 200 OK | Mark delivered, no further attempts |
| HTTP 200 with `idempotency_status: already_queued` | Mark delivered (duplicate is fine) |

After 5 attempts → dead-letter table → Sentry alert + super admin notification.

---

## 16. Security & Row Level Security (unchanged from v1.0 — see §16)

---

## 16a. 🆕 Security Hardening (Abishek's input)

| Threat | Solution | Cost |
|---|---|---|
| Bot uploads / scraping | **Cloudflare Turnstile** on all forms | ₹0 |
| DDoS / Layer 7 attacks | **Cloudflare WAF** (auto with R2) | ₹0 |
| API rate limiting | Per-IP token bucket in Netlify Functions | ₹0 |
| OTP abuse | Per-phone (5/hr) + Per-IP (20/hr) on `/api/sms-otp-send` | ₹0 |
| Admin brute-force | Lockout after 5 failed logins; IP block after 20/hour | ₹0 |
| Session hijack | HttpOnly + Secure + SameSite cookies, 24h expiry | ₹0 |
| File upload abuse | Per-user daily quota (20 uploads/day default) | ₹0 |
| Compromised credentials | HIBP API on admin signup | ₹0 |
| XSS | React auto-escape + CSP headers | ₹0 |
| SQL injection | Supabase parameterized queries (built-in) | ₹0 |
| Anomaly detection (Phase 2) | PostHog event rules | ₹0 (free tier) |
| Force-logout suspect admin | Super admin "kill session" action | ₹0 |

**All free. Just configuration + middleware.**

---

## 17. Audit Log (unchanged — see §17 of v1.0)

---

## 17a. 🆕 Queue Infrastructure

### pg_boss (Postgres-based job queue)

```sql
-- Installed as Supabase extension
CREATE EXTENSION pgboss;
```

### Job queues

| Queue name | Purpose | Concurrency |
|---|---|---|
| `webhook_delivery` | Admin → AI Pipeline webhook calls | 10 workers |
| `ai_callback_handler` | Processing AI callbacks | 5 workers |
| `notification_delivery` | Push notifications via FCM | 20 workers |
| `media_validation` | Virus scan, NSFW, hash dedup | 10 workers |
| `analytics_refresh` | Materialized view refreshes | 1 worker |
| `cleanup` | R2 lifecycle cleanup, deleted content | 1 worker |

### Idempotency

Every job has an `idempotency_key`. pg_boss deduplicates automatically.

### Retry policy

- 5 attempts with exponential backoff: 1s → 5s → 30s → 5min → 30min
- After exhaustion → moved to `dead_letter` queue → Sentry alert

### Watchdog (pg_cron)

```sql
-- Runs every 5 minutes
SELECT cron.schedule('stuck-job-watchdog', '*/5 * * * *', $$
  -- Re-queue items stuck in ai_processing > 30 min
  UPDATE content SET status = 'callback_lost'
  WHERE status = 'ai_processing' AND updated_at < NOW() - INTERVAL '30 minutes';
  
  -- Re-queue failed_retryable jobs older than 1 hour
  UPDATE webhook_deliveries SET attempt_count = 0
  WHERE last_response_status >= 500 AND last_attempted_at < NOW() - INTERVAL '1 hour';
$$);
```

### At scale

When pg_boss insufficient (>10K jobs/min sustained):
- Migrate to **Cloudflare Queues** ($0.40/million messages)
- Or self-hosted **Redis + BullMQ**

---

## 17b. 🆕 Observability & Monitoring

| Tool | Purpose | Free tier | Cost @ scale |
|---|---|---|---|
| **Sentry** | Error tracking, stack traces, releases | 5K errors/mo | ₹0–2K |
| **Better Stack (Logtail)** | Log aggregation | 1 GB/mo | ₹0–3K |
| **PostHog** | Product analytics, session replay, feature flags | 1M events/mo | ₹0–25K |
| **Cloudflare Analytics** | CDN + R2 metrics, request analytics | Built-in | ₹0 |
| **Supabase Logs** | DB queries, slow query log | Built-in | ₹0 |
| **Netlify Function Logs** | Serverless function logs | Built-in | ₹0 |
| **OpenTelemetry** | Distributed tracing (Phase 3) | Self-hosted | ₹0 |
| **Grafana Cloud** | Custom dashboards (queue depth, p95 latency) | 10K series | ₹0 |
| **Flower** (Celery monitoring) | AI Pipeline queue + worker visibility | Self-hosted | ₹0 |

### Critical alerts (PagerDuty / Slack)

| Alert | Threshold |
|---|---|
| Webhook delivery dead-letter | >0 in last 15 min |
| AI callback missing | Content in `ai_processing` >30 min |
| Queue depth | >500 pending in any queue |
| Worker count | Below configured minimum |
| 5xx response rate | >1% in last 5 min |
| Admin login failures (per IP) | >20/hour |
| Sentry error rate | >50/hour |

---

## 18. Tech Stack Summary (updated)

| Layer | Service | Cost @ launch | Cost @ 10K users |
|---|---|---|---|
| Database + Auth + Realtime | **Supabase** (Mumbai) | ₹0 | ₹2,100/mo |
| Job queue | **pg_boss** (in Supabase) | ₹0 | ₹0 |
| Media storage | **Cloudflare R2** | ₹0 | ₹3,000/mo |
| WAF + CAPTCHA | **Cloudflare Turnstile + WAF** | ₹0 | ₹0 |
| Push notifications | **Firebase Cloud Messaging** | ₹0 | ₹0 |
| SMS OTP | **2Factor.in** | ₹400/mo | ₹2,500/mo |
| AI script | **Google Gemini Flash** | ₹500-2K | ₹5,000/mo |
| AI voice (TTS) | **Google TTS** | ₹1-3K | ₹8,000/mo |
| NSFW detection | **Google Cloud Vision** | ₹0 (free 1K/mo) | ₹2-8K/mo |
| App hosting | **Netlify** | ₹0 | ₹1,500/mo |
| Error tracking | **Sentry** | ₹0 | ₹0 |
| Log aggregation | **Better Stack** | ₹0 | ₹0–3K |
| Product analytics | **PostHog** | ₹0 | ₹0–25K |
| Email (optional) | **Resend** | ₹0 | ₹0 |
| Domain | **localaitv.com** | ₹85/mo | ₹85/mo |
| **TOTAL** | | **₹2-5K/mo** | **₹25-50K/mo** |

---

## 19. Cost Projections

Same as v1.0 — see original §19. Production hardening adds ₹0 at launch.

---

## 20. Implementation Phases

### Phase 1 — Foundation
- Supabase project (Mumbai)
- Database schema (all tables + indexes + RLS)
- pg_boss queue setup
- Sentry + Better Stack integration
- Auth flow (password + SMS OTP)
- One super admin (founder)
- Cloudflare R2 + Turnstile + WAF setup

### Phase 2 — Admin Dashboard Core
- Dashboard layout + nav
- Review queue with state-filtering
- Item detail / review screen
- Claim/lock mechanism (atomic SQL)
- Approve / Reject flows
- Webhook delivery via pg_boss queue
- Idempotency + dead-letter handling

### Phase 3 — Admin Workflow Complete
- Modify & Approve (original retention)
- Escalation flow
- Admin direct upload
- Push notification integration (FCM)
- Notifications to citizens
- Media validation pipeline (MIME + virus + hash + NSFW)

### Phase 4 — Channel Publishing + NotebookLM
- Broadcast slots config
- pg_cron + advisory locks scheduler
- Birthday auto-scheduling
- NotebookLM upload (5 sub-types)
- Time-slot notifications to uploaders
- Publishing queue UI

### Phase 5 — Analytics + Team Management
- Analytics dashboard with drill-down
- Reporter profiles
- Date range filters
- Team management UI
- Audit log viewer
- Cancel-job UI for super admin

### Phase 6 — Integration Testing + Onboarding
- AI Pipeline webhook end-to-end testing
- Load test (k6 or Artillery)
- Disaster recovery runbook
- Onboard first admins
- User documentation
- Production deployment

---

## 20a. 🆕 Production Readiness Checklist

Before declaring v1 launched:

- [ ] Load test (1K concurrent admins, 10K citizen uploads/hour)
- [ ] Smoke tests for every endpoint
- [ ] Disaster recovery runbook documented
- [ ] Rollback procedure tested
- [ ] All Sentry alerts firing correctly to Slack
- [ ] Cloudflare WAF rules tuned to actual traffic
- [ ] Rate limits validated against real usage
- [ ] R2 lifecycle rules applied
- [ ] Backup strategy documented (Supabase auto-backup confirmed)
- [ ] Admin onboarding doc tested with non-technical user
- [ ] AI Pipeline webhook integration tested end-to-end with all 9 categories
- [ ] Cancel-job flow tested at each stage
- [ ] Idempotency tested (duplicate webhook sends)
- [ ] Failover behavior tested (kill worker mid-job)

---

## 21. Team Requirements

### Required:
- **Founder (Koneti Mohan Reddy)** — decisions, API keys, approval
- **AI Team (Sameer + Gnana)** — webhook adapter, ~1 week effort, existing pipeline unchanged
- **Claude (Anthropic)** — admin dashboard + database + integrations
- **Form Engineer (Megan)** — align live app forms with documented schema

### NOT required:
- ❌ DevOps engineer
- ❌ Full-stack hire (Claude builds)
- ❌ DBA (Supabase managed)

### Optional later:
- Part-time React maintainer (5-10 hrs/week post-launch)

---

## 22. What's IN / OUT of v1

### ✅ IN v1 (additions from v1.0)
- All v1.0 features
- **Production-grade queue infrastructure** (pg_boss)
- **Observability stack** (Sentry + Better Stack + PostHog)
- **Security hardening** (Turnstile, WAF, rate limits, account lockout, file quotas)
- **Media validation** (MIME, virus, hash, NSFW)
- **Idempotency + HMAC + retry** in webhook contract
- **Bulletin output structure** per Gnana's spec
- **Retention policy** (R2 lifecycle rules)
- **Cancel-job flow** for super admin
- **Production readiness checklist**

### ❌ OUT of v1 (deferred)
- Public analytics / leaderboards
- AI-assisted moderation (auto-flag)
- Reporter compensation/payout
- Reporter ranking-based auto-approval (Phase 2 — data tracked now)
- Bulk approve/reject
- Comment moderation
- Multi-language admin UI chrome
- Realtime websocket queue (polling sufficient for v1)
- ClickHouse OLAP (Phase 2 when needed)

---

## 23. What I Need From You — Action Items

Same as v1.0 §23, plus:

| Item | New in v1.1 |
|---|---|
| A. Supabase | (existing) |
| B. Cloudflare R2 | (existing) — now also enables Turnstile + WAF automatically |
| C. Firebase FCM | (existing) |
| D-G. Existing keys | (existing) |
| H. DNS for admin subdomain | (existing) |
| I. AI team webhook URL | (existing) — Sameer/Gnana to provide |
| J. Optional Resend | (existing) |
| **🆕 K. Sentry account** | https://sentry.io — free tier, 1-min signup |
| **🆕 L. Better Stack (Logtail)** | https://betterstack.com — free 1 GB/mo |
| **🆕 M. PostHog cloud account** | https://posthog.com — free 1M events/mo |

**Additional founder time:** ~10 min for the 3 new accounts.
**Additional cost:** ₹0 (all free tiers cover v1 scale).

---

## 24. Approval & Sign-off

### Founder approval

| Item | Confirmed by founder? |
|---|---|
| Three-tier admin + state restrictions | ☐ |
| Form fields (Megan-aligned during Phase 1) | ☐ |
| Supabase + R2 + pg_boss + Sentry stack | ☐ |
| Webhook contract (HMAC + idempotency + retries) | ☐ |
| Bulletin output structure (Gnana's spec) | ☐ |
| Retention policy (48hr bulletins, 30d audit) | ☐ |
| Security hardening (Turnstile, WAF, rate limits) | ☐ |
| Push notifications (FCM, free) | ☐ |
| NotebookLM 5 sub-types | ☐ |
| Analytics dashboard with drill-down | ☐ |
| Implementation phased build | ☐ |
| ₹2,000–5,500/mo infrastructure cost | ☐ |
| OUT of v1: payout, leaderboards, AI moderation, realtime | ☐ |

### AI Team approval

| Item | Confirmed? |
|---|---|
| Webhook contract (FastAPI intake, 202 fast, async Celery) | ☐ |
| Idempotency = content_id + approved_version | ☐ |
| Cancel-job endpoint feasibility | ☐ |
| Callback retry policy (5 attempts) | ☐ |
| Bulletin output structure adoption | ☐ |
| R2 download adapter implementation (~1 day) | ☐ |
| Direct-publish lane (admin/notebooklm) | ☐ |
| OpenTelemetry instrumentation | ☐ |
| Fallback policies (Gemini → OpenAI, GCP TTS → Sarvam) | ☐ |
| Separate Celery queue for high-volume TTS | ☐ |

### Final approval to begin Phase 1:

**Founder signature:** _______________________
**Date:** _______________________

---

## 📞 Contact

**Founder:** Koneti Mohan Reddy
**Email:** [localaitv@gmail.com](mailto:localaitv@gmail.com)
**Company:** LocalAI Media Network Pvt Ltd
**CIN:** U63910KA2025PTC212593

**Plan version:** **v1.1 final**
**Generated:** 14 May 2026
**Supersedes:** v1.0
**Subject to:** mutual iteration before Phase 1 build begins

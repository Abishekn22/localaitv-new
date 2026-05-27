# LocalAI TV — Admin Dashboard & Database System
## Final Specification Document · v1.0

**Status:** ✅ Plan finalized after iterative review · Ready for team review and approval
**Last updated:** 2026-05-14
**Owner:** Koneti Mohan Reddy (localaitv@gmail.com)
**Document purpose:** Shareable spec to align founder, AI team, and development team before build begins.

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Three-Tier Admin System](#3-three-tier-admin-system)
4. [Content Workflow (End-to-End)](#4-content-workflow-end-to-end)
5. [The 8 Upload Forms — Specifications](#5-the-8-upload-forms--specifications)
6. [NotebookLM Integration](#6-notebooklm-integration)
7. [Database Architecture](#7-database-architecture)
8. [Storage Folder Structure](#8-storage-folder-structure)
9. [Hidden Admin Access](#9-hidden-admin-access)
10. [API Endpoints](#10-api-endpoints)
11. [Admin Dashboard UI](#11-admin-dashboard-ui)
12. [Analytics Dashboard with Drill-Down](#12-analytics-dashboard-with-drill-down)
13. [Channel Publishing Automation & Time Slots](#13-channel-publishing-automation--time-slots)
14. [Push Notification Templates](#14-push-notification-templates)
15. [AI Pipeline Webhook Integration](#15-ai-pipeline-webhook-integration)
16. [Security & Row Level Security](#16-security--row-level-security)
17. [Audit Log](#17-audit-log)
18. [Tech Stack Summary](#18-tech-stack-summary)
19. [Cost Projections](#19-cost-projections)
20. [Implementation Phases](#20-implementation-phases)
21. [Team Requirements](#21-team-requirements)
22. [What's IN / OUT of v1](#22-whats-in--out-of-v1)
23. **[🚨 What I Need From You — Action Items](#23--what-i-need-from-you--action-items)**
24. [Approval & Sign-off](#24-approval--sign-off)

---

## 1. Executive Summary

We are building an **internal moderation and content management system** for LocalAI TV that:

- Lets a 3-tier admin team (super admin → master admin → admin) review citizen submissions before they reach the live TV pipeline
- Adds a quality gate between citizen uploads and the existing AI processing pipeline (Gemini Flash → Google TTS → FFmpeg → bulletin → live TV)
- Supports state-restricted admins (a Telugu-speaking admin handles AP+TG; a Kannada admin handles Karnataka; etc.)
- Integrates Google NotebookLM-generated content (constituency news, district/state/national bulletins, debates) as a separate "auto-approved" content stream
- Provides time-slot-based publishing automation with notifications to uploaders
- Provides a comprehensive analytics dashboard with drill-down

**Key non-disruption principle:**
The existing AI processing pipeline (script generation, TTS, video editing) stays 100% unchanged. The admin layer inserts BEFORE the AI pipeline — only approved content reaches the AI processing stage.

**Monthly infrastructure cost (at launch):** ₹400–2,500
**Team requirements beyond founder:** Existing AI team (unchanged) + Claude (Anthropic) for build
**DevOps engineer needed:** No
**Full-stack developer needed:** No (Claude builds everything)

---

## 2. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           USERS                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│  │  Citizens/Public│    │  Admins         │    │  Master/Super   │      │
│  │  (Mobile app)   │    │  (Mobile + Web) │    │  Admins         │      │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘      │
└───────────┼──────────────────────┼──────────────────────┼───────────────┘
            │                      │                      │
            └──────────┬───────────┴──────────┬───────────┘
                       │                      │
                       ▼                      ▼
         ┌─────────────────────────────────────────────┐
         │   REACT + CAPACITOR APP (existing)          │
         │   ─────────────────────────                  │
         │   • Public app (citizen-facing)             │
         │   • /admin route (hidden, admin-only)        │
         └────────────┬────────────────────────────────┘
                      │
                      │ API calls
                      ▼
         ┌─────────────────────────────────────────────┐
         │   SUPABASE (Mumbai, asia-south1)             │
         │   ─────────────────────────                  │
         │   • Postgres database                       │
         │   • Auth (SMS OTP + admin password+2FA)     │
         │   • Realtime subscriptions (admin queue)    │
         │   • Row Level Security (permissions)         │
         └────────────┬────────────────────────────────┘
                      │
        ┌─────────────┼──────────────────────┐
        │             │                      │
        ▼             ▼                      ▼
┌──────────────┐ ┌─────────────────────┐ ┌──────────────────────┐
│ Cloudflare   │ │ Firebase Cloud      │ │ Existing services    │
│ R2 (Mumbai)  │ │ Messaging (FCM)     │ │ ─────────────────    │
│ ─────────    │ │ ─────────────       │ │ • 2Factor.in (SMS)   │
│ Photos/videos│ │ Push notifications  │ │ • YouTube embeds     │
│ Zero egress  │ │ Free tier 100M/mo   │ │ • Netlify hosting    │
└──────────────┘ └─────────────────────┘ └──────────────────────┘
                                                  │
                                                  ▼
                                ┌─────────────────────────────────────┐
                                │ AI PROCESSING PIPELINE (unchanged)   │
                                │ ──────────────────────              │
                                │ • Google Gemini Flash (script)      │
                                │ • Google TTS (voice)                │
                                │ • FFmpeg (video editing)             │
                                │ • Bulletin assembly                  │
                                │ • Live TV publishing                 │
                                └─────────────────────────────────────┘
```

---

## 3. Three-Tier Admin System

### 3.1 Roles

| Role | Description |
|---|---|
| **Super Admin** | Founder-level. Full access to everything. Only 1 person typically. |
| **Master Admin** | Senior moderator. Can create admins. Full state access. Escalates to super admin when uncertain. |
| **Admin** | Front-line moderator. Restricted to specific assigned state(s). Escalates to master admin when uncertain. |
| **Citizen / Public** | One unified role. Anyone who uploads news/content. Same registration form as before. No distinction between "citizen reporter" and "public". |

### 3.2 Permissions Matrix

| Capability | Super | Master | Admin |
|---|:---:|:---:|:---:|
| Create Master Admin | ✅ | ❌ | ❌ |
| Create Admin | ✅ | ✅ | ❌ |
| Suspend/remove admins below tier | ✅ | ✅ (admins only) | ❌ |
| **Geographic access:** | | | |
| All states | ✅ | ✅ | ❌ (restricted to assigned states) |
| Assigned states only | — | — | ✅ |
| **Content upload (national/state/district/constituency, all 8 forms):** | | | |
| Upload anywhere | ✅ | ✅ | ✅ (within assigned states) |
| Bypass review (own uploads → directly approved) | ✅ | ✅ | ✅ |
| **NotebookLM content upload:** | | | |
| Constituency individual news | ✅ | ✅ | ✅ |
| District / State / National bulletins | ✅ | ✅ | ✅ |
| Debate content | ✅ | ✅ | ✅ |
| **Review citizen submissions:** | | | |
| Approve | ✅ | ✅ | ✅ |
| Modify & approve | ✅ | ✅ | ✅ |
| Reject with reason | ✅ | ✅ | ✅ |
| Escalate to higher tier | — (top) | → Super | → Master |
| **Analytics dashboard:** | | | |
| View all India stats | ✅ | ✅ | ❌ |
| View their state stats | ✅ | ✅ | ✅ |
| View reporter profiles (in their access scope) | ✅ | ✅ | ✅ |
| **Audit log:** | | | |
| Read all | ✅ | ❌ | ❌ |
| Read team's | ✅ | ✅ | ❌ |
| Read own | ✅ | ✅ | ✅ |

### 3.3 State Restriction (Multi-Language Support)

When a super admin or master admin creates an Admin, they assign one or more states:

```
Create Admin form:
├── Name: Ravi Kumar
├── Phone: +91 98765 43210
├── Email: ravi@localaitv.com
└── Language access (one or more):
    ☑ Andhra Pradesh (Telugu)
    ☑ Telangana (Telugu)
    ☐ Karnataka (Kannada)
    ☐ Tamil Nadu (Tamil)
    ☐ Kerala (Malayalam)
    ☐ Other states...
```

- **Admin** sees only content from their assigned state(s) — system auto-filters
- **Super/Master admin** sees ALL states with a dropdown to filter
- Database enforces this via Row Level Security — even if UI is bypassed, queries are filtered

---

## 4. Content Workflow (End-to-End)

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1 — UPLOAD                                                │
│  ─────────────────────                                          │
│  Citizen submits via app:                                       │
│   • 1–3 media files (photos/videos, max 3 total combined)       │
│   • Headline (single field, voice or text, te or en)            │
│   • Description (single field, voice or text, te or en)         │
│   • Location (defaults to constituency)                          │
│                                                                  │
│  → Files uploaded to Cloudflare R2 (signed URLs)                │
│  → Metadata saved to Supabase (status: pending)                  │
│  → Item appears in admin queue                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2 — ADMIN CLAIM (locking)                                 │
│  ─────────────────────                                          │
│  Admin clicks item from queue:                                  │
│   • DB locks item to that admin's ID (claimed_at = now)         │
│   • Other admins immediately stop seeing it in their queue       │
│   • Auto-expires after 30 minutes of inactivity                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3 — DECISION                                              │
│  ─────────────────────                                          │
│  Admin chooses one:                                             │
│                                                                  │
│   ✅ APPROVE         — content moves to approved pool           │
│   ✏️  MODIFY+APPROVE — admin edits text or removes some media,  │
│                        original is preserved (read-only),       │
│                        modified version goes to approved pool   │
│   ❌ REJECT          — admin gives reason, citizen is notified, │
│                        content soft-deleted (30-day retention)  │
│   ↗️  ESCALATE       — admin → master, master → super           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                  (only if approved)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4 — WEBHOOK FIRES                                         │
│  ─────────────────────                                          │
│  Supabase trigger sends webhook to your AI team's pipeline:     │
│  POST https://your-ai-pipeline.localaitv.com/webhook/approved   │
│  {                                                               │
│    "content_id": "...",                                          │
│    "headline": "...",                                            │
│    "description": "...",                                         │
│    "location": "...",                                            │
│    "media_urls": [...],                                          │
│    "category": "news",                                           │
│    "constituency": "kurnool-urban"                              │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5 — AI PIPELINE (your existing system, unchanged)         │
│  ─────────────────────                                          │
│   1. Gemini Flash generates 30–60sec script                     │
│   2. Google TTS converts script to voice                        │
│   3. FFmpeg edits video/photos to match voice duration          │
│   4. Original audio/music mixed where appropriate                │
│   5. Output stored in Kurnool TV public folder (or relevant)    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6 — PIPELINE CALLBACK                                     │
│  ─────────────────────                                          │
│  AI pipeline calls back to our API:                             │
│  POST /api/admin/mark-processed                                  │
│  { content_id, video_url, status: 'ready_for_bulletin' }        │
│                                                                  │
│  → Supabase updates: status = 'ready_for_bulletin'              │
│  → Time-slot scheduler picks it up                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7 — TIME-SLOT SCHEDULING                                  │
│  ─────────────────────                                          │
│  • Scheduler assigns content to next available broadcast slot   │
│  • Birthday wishes auto-scheduled for the EXACT birthday date   │
│  • Other content distributed across daily slots (8:50, 11:50,   │
│    16:50, 20:50, etc.)                                           │
│                                                                  │
│  10 minutes before slot:                                        │
│  → Uploader gets push: "Your post airs in 10 min — watch live!" │
│  → Birthday person + wisher both notified                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8 — LIVE TV BROADCAST                                     │
│  ─────────────────────                                          │
│  • Bulletin assembled (your existing 10-15 min compilation)     │
│  • Live TV broadcast on Kurnool TV channel                      │
│  • Status: 'published'                                          │
│  • Audit log records broadcast time                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. The 8 Upload Forms — Specifications

> **NOTE:** Field lists below are based on auditing your actual canonical app source (`286.App_v3_20260512-201203_auto-backup.jsx`). A final field-by-field audit will be done in Phase 1 build to lock every label, validation, and placeholder.

### Common rules across ALL forms:
- **Media:** Maximum 3 files total (photos and/or videos in any combination)
- **Single-language fields:** Headline / description fields are ONE field each — user types/speaks in Telugu OR English; app auto-detects
- **Voice input:** Supported for text fields (Telugu or English auto-detected)
- **Location:** Defaults to user's registered constituency
- **Required confirmation:** "I confirm content is original" checkbox before submit

### A. 📰 News Upload Form

| Field | Type | Required | Validation |
|---|---|:---:|---|
| Media | Photos / Videos | ✅ Yes | 1–3 files, mixed allowed |
| Headline | Text (single field, te or en) | ✅ Yes | 4–30 words |
| Description / Details | Text (single field, te or en) | ✅ Yes | 20–300 words |
| Location | Text | Auto-filled | Defaults to constituency |
| Originality confirmation | Checkbox | ✅ Yes | — |

### B. 🎂 Birthdays

| Field | Type | Required |
|---|---|:---:|
| Birthday person's full name | Text | ✅ Yes |
| Date of birth | Date | ✅ Yes |
| Age | Auto-calculated from DOB | — |
| Birthday photos | Photos (max 3) | Optional |
| Wisher's name | Text | ✅ Yes |
| Wisher's relation (Son / Daughter / Friend / etc.) | Text | ✅ Yes |
| Wisher's photos | Photos (max 3) | Optional |

**Auto-scheduling:** Submitted entries are queued to broadcast on the birthday date automatically.

### C. 💒 Marriage Days (Anniversary)

| Field | Type | Required |
|---|---|:---:|
| Couple names | Text | ✅ Yes |
| Anniversary date | Date | ✅ Yes |
| Years of marriage | Auto-calculated | — |
| Couple photo(s) | Photos (max 3) | Optional |
| Posted by — name | Text | ✅ Yes |
| Posted by — relation | Text | ✅ Yes |
| Greeting message | Text | Optional |

### D. 💍 Upcoming Marriage

| Field | Type | Required |
|---|---|:---:|
| Bride's name | Text | ✅ Yes |
| Groom's name | Text | ✅ Yes |
| Marriage date | Date | ✅ Yes |
| Venue / function hall | Text | ✅ Yes |
| Muhurtham time / Reception time | Time | Optional |
| Invitation card image | Photo | Optional |
| Invitation video | Video | Optional |
| Family contact phone | Phone | ✅ Yes |

### E. 📅 Events

| Field | Type | Required |
|---|---|:---:|
| Event name | Text | ✅ Yes |
| Event type (Religious/Cultural/Political/Sports/Educational/Other) | Dropdown | ✅ Yes |
| Date(s) | Date range | ✅ Yes |
| Time | Time | ✅ Yes |
| Venue / location | Text | ✅ Yes |
| Description | Text | ✅ Yes |
| Organizer name | Text | ✅ Yes |
| Contact phone | Phone | ✅ Yes |
| Photos / poster | Photos (max 3) | Optional |

### F. 🛍 Shopping Ad

| Field | Type | Required |
|---|---|:---:|
| Item name | Text | ✅ Yes |
| Category (Electronics/Clothing/Grocery/Furniture/Other) | Dropdown | ✅ Yes |
| Price (₹) or "Negotiable" | Text | ✅ Yes |
| Description | Text | ✅ Yes |
| Photos | Photos (max 3) | ✅ Yes |
| Seller contact phone | Phone (Call/WhatsApp) | ✅ Yes |
| Location | Text | ✅ Yes |

### G. 🚗 Car / Vehicle Sales

| Field | Type | Required |
|---|---|:---:|
| Vehicle type (Car/Bike/Scooter/Auto/Truck/Tractor) | Dropdown | ✅ Yes |
| Brand | Text | ✅ Yes |
| Model | Text | ✅ Yes |
| Year of manufacture | Year | ✅ Yes |
| KM driven | Number | ✅ Yes |
| Fuel type (Petrol/Diesel/CNG/Electric) | Dropdown | ✅ Yes |
| Price (₹) | Number | ✅ Yes |
| Owner type (1st/2nd/3rd) | Dropdown | ✅ Yes |
| Description | Text | Optional |
| Seller contact phone | Phone | ✅ Yes |
| Photos | Photos (max 3) | ✅ Yes |
| Location | Text | ✅ Yes |

### H. 🏠 Rentals

| Field | Type | Required |
|---|---|:---:|
| Property type (House/Shop/Room/PG/Commercial/Godown) | Dropdown | ✅ Yes |
| Configuration (1BHK/2BHK/3BHK/etc) | Dropdown | ✅ Yes (if house) |
| Furnished (Fully/Semi/Unfurnished) | Dropdown | ✅ Yes |
| Monthly rent (₹) | Number | ✅ Yes |
| Security deposit (₹) | Number | Optional |
| Area / locality | Text | ✅ Yes |
| Description | Text | Optional |
| Owner contact phone | Phone | ✅ Yes |
| Photos | Photos (max 3) | ✅ Yes |

### I. 💼 Jobs

| Field | Type | Required |
|---|---|:---:|
| Job title | Text | ✅ Yes |
| Company name | Text | ✅ Yes |
| Job type (Full-time/Part-time/Contract/Daily wage) | Dropdown | ✅ Yes |
| Salary range or "As per skills" | Text | ✅ Yes |
| Location | Text | ✅ Yes |
| Skills required | Text | Optional |
| Description | Text | Optional |
| Contact phone | Phone (Call/WhatsApp) | ✅ Yes |
| Email | Email | Optional |
| Last date to apply | Date | Optional |

### Future-proofing

When you add a new category (e.g. "Who's Who"):
1. We add `'whos_who'` to the category enum
2. Define new form fields
3. Database **automatically handles them** via the JSONB `form_data` column — no schema migration needed

---

## 6. NotebookLM Integration

Google NotebookLM generates pre-processed content that bypasses both admin approval AND the AI processing pipeline. Goes directly to publishing.

### Content streams from NotebookLM

| Source type | Description | Duration | Geographic level |
|---|---|---|---|
| **Individual news** | Constituency-specific news items | 30 sec – 1 min | Constituency |
| **District bulletin** | 4–5 news combined into a bulletin | 4–5 min | District |
| **State bulletin** | State-wide news bulletin | 4–5 min | State |
| **National bulletin** | National news bulletin | 4–5 min | National |
| **Debate (any level)** | Discussion-format content | Variable | Constituency / District / State / National |

### Upload behavior

- **Upload by:** Super Admin, Master Admin, Admin (within their assigned states)
- **Approval:** Auto-approved on upload (no review queue)
- **AI processing:** Skipped — uses raw uploaded video as-is
- **Publishing:** Goes directly into time-slot publishing queue

### Upload UI

```
┌─────────────────────────────────────────────────────────┐
│  Upload NotebookLM Content                              │
├─────────────────────────────────────────────────────────┤
│  Source type:                                            │
│   ( ) Individual constituency news                       │
│   ( ) District bulletin                                  │
│   ( ) State bulletin                                     │
│   ( ) National bulletin                                  │
│   ( ) Debate (specify level)                             │
│                                                          │
│  Geographic level:                                       │
│   State: [Andhra Pradesh ▼]                              │
│   District: [Kurnool ▼] (if applicable)                 │
│   Constituency: [Kurnool Urban ▼] (if applicable)       │
│                                                          │
│  Title: [...]                                            │
│  Description: [...]                                      │
│  Source video: [Choose file]                             │
│                                                          │
│  ⚠️ This content publishes DIRECTLY                       │
│     • No AI processing                                   │
│     • No editing                                          │
│     • Goes to assigned time slot                         │
│                                                          │
│  [Cancel]                         [Upload & Publish]     │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Database Architecture

### 7.1 Tech: Supabase (managed PostgreSQL) in Mumbai region

### 7.2 Tables

#### `users` (citizens + admins)
```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone             TEXT UNIQUE NOT NULL,
  name              TEXT,
  email             TEXT,                  -- admin only
  role              user_role NOT NULL,    -- enum
  assigned_states   TEXT[],                -- ['AP', 'TG'] etc. NULL for super/master
  password_hash     TEXT,                  -- admin only
  profile_photo_url TEXT,
  constituency      TEXT,                  -- citizen's home constituency
  is_verified       BOOLEAN DEFAULT false,
  created_by        UUID REFERENCES users(id),  -- who created this admin
  suspended         BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  last_login_at     TIMESTAMPTZ
);

CREATE TYPE user_role AS ENUM (
  'super_admin', 'master_admin', 'admin', 'citizen'
);
```

#### `content` (all uploaded items — citizen, admin, NotebookLM)
```sql
CREATE TABLE content (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id           UUID REFERENCES users(id),
  author_role         user_role NOT NULL,     -- snapshot
  content_source      content_source NOT NULL,
  geography_level     geography_level NOT NULL,
  state               TEXT,
  district            TEXT,
  constituency        TEXT,
  category            content_category NOT NULL,
  form_data           JSONB NOT NULL,         -- form fields per category
  media_urls          JSONB,                  -- array of {type, url, thumb_url}
  original_data       JSONB,                  -- preserved if modified
  status              content_status NOT NULL DEFAULT 'pending',
  claimed_by          UUID REFERENCES users(id),
  claimed_at          TIMESTAMPTZ,
  reviewed_by         UUID REFERENCES users(id),
  reviewed_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  escalated_to        UUID REFERENCES users(id),
  ai_processed_at     TIMESTAMPTZ,
  ai_output_url       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE TYPE content_source AS ENUM (
  'citizen',                  -- citizen upload (needs review + AI processing)
  'admin_direct',             -- admin direct upload (auto-approved + AI processing)
  'notebooklm_news',           -- NotebookLM constituency news (direct publish)
  'notebooklm_bulletin',       -- NotebookLM bulletins (direct publish)
  'notebooklm_debate'         -- NotebookLM debates (direct publish)
);

CREATE TYPE geography_level AS ENUM (
  'national', 'state', 'district', 'constituency'
);

CREATE TYPE content_category AS ENUM (
  'news', 'birthday', 'marriage_day', 'upcoming_marriage',
  'event', 'shopping', 'car_sale', 'rental', 'job'
);

CREATE TYPE content_status AS ENUM (
  'pending',              -- in admin queue
  'in_review',            -- claimed by admin
  'approved',             -- approved, awaiting AI processing
  'rejected',             -- rejected by admin
  'escalated',            -- escalated to higher tier
  'ai_processing',        -- AI pipeline working on it
  'ready_for_bulletin',   -- AI done, ready for next time slot
  'published',            -- aired live
  'archived'              -- past content
);
```

#### `content_audit_log`
```sql
CREATE TABLE content_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id    UUID REFERENCES content(id),
  action        audit_action NOT NULL,
  actor_id      UUID REFERENCES users(id),
  actor_role    user_role,
  before_state  JSONB,
  after_state   JSONB,
  reason        TEXT,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE audit_action AS ENUM (
  'created', 'claimed', 'modified', 'approved', 'rejected',
  'escalated', 'unclaimed', 'restored', 'published'
);
```

#### `publishing_queue`
```sql
CREATE TABLE publishing_queue (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id            UUID REFERENCES content(id),
  channel               TEXT,                          -- 'kurnool-tv', 'guntur-tv', etc.
  scheduled_for_date    DATE NOT NULL,
  scheduled_for_slot    TIME NOT NULL,                 -- '08:50:00', '11:50:00', etc.
  status                queue_status DEFAULT 'queued',
  aired_at              TIMESTAMPTZ,
  uploader_notified_at  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE queue_status AS ENUM ('queued', 'aired', 'cancelled', 'failed');
```

#### `notifications`
```sql
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id),
  type         notification_type NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT,
  payload      JSONB,
  read         BOOLEAN DEFAULT false,
  delivered    BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM (
  'content_approved', 'content_rejected', 'content_escalated',
  'broadcast_imminent', 'broadcast_aired',
  'new_for_review', 'admin_created', 'admin_suspended'
);
```

#### `constituencies` (reference)
```sql
CREATE TABLE constituencies (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  state      TEXT NOT NULL,
  district   TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT true
);
-- Pre-populated with 175 AP + 119 TG constituencies (+ Karnataka, TN later)
```

#### `broadcast_slots` (configurable)
```sql
CREATE TABLE broadcast_slots (
  id           SERIAL PRIMARY KEY,
  slot_name    TEXT,                  -- 'Morning', 'Lunch', 'Evening', 'Prime', 'Late'
  start_time   TIME NOT NULL,         -- '08:50:00'
  end_time     TIME NOT NULL,         -- '09:00:00'
  is_active    BOOLEAN DEFAULT true
);
```

### 7.3 Indexes

```sql
-- Fast admin queue queries
CREATE INDEX idx_content_queue ON content(status, state, created_at)
  WHERE status IN ('pending', 'in_review') AND deleted_at IS NULL;

-- Geography lookups
CREATE INDEX idx_content_geo ON content(state, district, constituency);

-- Approved pool by category
CREATE INDEX idx_approved_pool ON content(constituency, category, created_at DESC)
  WHERE status = 'approved';

-- Audit log lookups
CREATE INDEX idx_audit_content ON content_audit_log(content_id, created_at DESC);

-- Reporter analytics
CREATE INDEX idx_reporter_stats ON content(author_id, status, created_at);

-- Publishing queue
CREATE INDEX idx_publishing_pending ON publishing_queue(scheduled_for_date, scheduled_for_slot)
  WHERE status = 'queued';
```

---

## 8. Storage Folder Structure

### Cloudflare R2 bucket: `localaitv-storage`

```
localaitv-storage/
│
├── citizen-uploads/                       ← raw files from citizens
│   ├── pending/                            ← awaiting admin review
│   └── approved/                           ← admin-approved, queued for AI
│
├── admin-direct-uploads/                  ← admin's own content (auto-approved)
│
├── notebooklm/                            ← NotebookLM-generated content
│   ├── individual-news/
│   │   └── <state>/<district>/<constituency>/
│   ├── bulletins/
│   │   ├── district/<state>/<district>/
│   │   ├── state/<state>/
│   │   └── national/
│   └── debates/
│       ├── constituency/<state>/<district>/<constituency>/
│       ├── district/<state>/<district>/
│       ├── state/<state>/
│       └── national/
│
├── ai-processed/                          ← output from your AI pipeline
│   ├── <state>/<district>/<constituency>/<category>/
│
└── thumbnails/                            ← auto-generated previews
```

**Key principle:** The database (Supabase) is the source of truth. Folders are just where the media files live. Database queries handle "show me approved Kurnool news" — folders provide direct file access via signed URLs.

---

## 9. Hidden Admin Access

### Web access
- **Primary:** `https://admin.localaitv.com` (subdomain — not linked from public site)
- **Alternative:** `https://localaitv.com/staff` (less discoverable but works)

### Mobile access
- Open the LocalAI TV app
- Profile screen → 5-tap secret sequence reveals "Staff Sign In" button (optional)
- OR: just bookmark `admin.localaitv.com` in mobile browser

### Login flow
```
1. Admin opens admin.localaitv.com
2. Enters phone OR email + password
3. Server sends SMS OTP via 2Factor.in
4. Admin enters 6-digit OTP
5. Session token issued (24-hour expiry)
6. Lands on admin dashboard

For first-time admin (after being created by super/master admin):
- Receives SMS: "Welcome to LocalAI TV staff team. Login at admin.localaitv.com
                 with phone +91XXX. Temp password: XXXX. Change on first login."
- First login forces password change + 2FA setup
```

---

## 10. API Endpoints

### Auth (admin tier)
- `POST /api/admin/login` — phone+password → SMS OTP challenge
- `POST /api/admin/verify-otp` — confirm OTP → session token
- `POST /api/admin/logout`
- `GET /api/admin/me` — current user info + permissions
- `POST /api/admin/change-password`

### Auth (citizen)
- `POST /api/citizen/login` — phone → SMS OTP (existing, unchanged)
- `POST /api/citizen/verify-otp` — confirm OTP

### Content queue (admin-only)
- `GET /api/admin/queue?state=&category=&geo_level=` — pending items in admin's scope
- `GET /api/admin/content/:id` — full item details
- `POST /api/admin/claim/:id` — claim for review (locks)
- `POST /api/admin/release/:id` — release without deciding
- `POST /api/admin/approve/:id` — approve
- `POST /api/admin/modify-approve/:id` — modify fields, then approve
- `POST /api/admin/reject/:id` — reject with reason
- `POST /api/admin/escalate/:id` — escalate to next tier

### Admin uploads
- `POST /api/admin/upload` — admin's own content (auto-approved)
- `POST /api/admin/upload-notebooklm` — NotebookLM content (auto-approved, direct publish)

### Citizen uploads
- `POST /api/citizen/upload` — citizen submission (→ pending review)
- `GET /api/citizen/my-uploads` — citizen sees status of own uploads
- `GET /api/citizen/notifications` — citizen notifications

### User / admin management
- `GET /api/admin/users?role=` — list admins (filtered by permission)
- `POST /api/admin/users` — create new admin (with state assignment)
- `PATCH /api/admin/users/:id` — update role, states, suspend
- `DELETE /api/admin/users/:id` — soft-delete admin

### Analytics
- `GET /api/admin/analytics/dashboard?from=&to=&state=&district=&category=` — top-line stats
- `GET /api/admin/analytics/breakdown?dimension=state|district|category|reporter` — breakdown
- `GET /api/admin/analytics/reporter/:id` — individual reporter profile + lifetime stats
- `GET /api/admin/analytics/items?status=&from=&to=&...` — drill-down list

### Publishing
- `GET /api/admin/publishing/queue` — view publishing schedule
- `POST /api/admin/publishing/schedule` — manually schedule item to a slot
- `POST /api/admin/publishing/cancel/:id` — cancel a scheduled broadcast

### Webhooks (for AI team's pipeline)
- `POST /api/webhook/content-approved` — (from us → AI pipeline) on approval
- `POST /api/webhook/ai-processed` — (from AI pipeline → us) when processing done

### Audit
- `GET /api/admin/audit?content_id=` — audit trail for one item
- `GET /api/admin/audit/recent` — recent admin actions (super admin)

---

## 11. Admin Dashboard UI

### Layout
```
┌──────────────────────────────────────────────────────────────────────────┐
│ LocalAI TV — Staff Dashboard       👤 ravi@kurnool   [▼] Logout          │
├──────────────────────────────────────────────────────────────────────────┤
│ ▶ Review Queue  📤 Upload  📺 NotebookLM  👥 Team  📊 Analytics  📜 Audit│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Current section content goes here                                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Sections by tab

| Tab | Visible to | Content |
|---|---|---|
| **Review Queue** | All admins | Pending citizen submissions, filterable |
| **Upload** | All admins | Admin direct upload form (auto-approved) |
| **NotebookLM** | All admins | NotebookLM content upload (direct publish) |
| **Team** | Super + Master | Manage admins, create new admins |
| **Analytics** | All admins | Dashboard, drill-down, reporter profiles |
| **Audit** | Super (all) / Master (team) / Admin (own) | Action history |

(Detailed mockups in section 9 of the previous plan document.)

---

## 12. Analytics Dashboard with Drill-Down

### Top-line view (super admin)

```
┌────────────────────────────────────────────────────────────────────────┐
│  📊 Today's Activity                            [Day ▼] [Today ▼]      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  India Total Uploads Today: 1,247                                      │
│                                                                        │
│  Approved: 892 (72%) | Pending: 215 (17%) |                            │
│  Rejected: 94 (7%)   | Processing: 46 (4%)                              │
│                                                                        │
│  ─── BREAKDOWN (click any number to drill in) ───                      │
│  By State:    AP 753 | TG 494                                          │
│  By District: Kurnool 142 | Guntur 128 | Warangal 98 ...               │
│  By Category: News 612 | Birthdays 318 | Events 156 | Cars 89 ...      │
│  By Source:   Citizen 1,089 | Admin 158 | NotebookLM 0                 │
│                                                                        │
│  ─── TOP REPORTERS TODAY ───                                           │
│  1. Ravi Kumar (Kurnool)    42 uploads · 38 approved (90%)             │
│  2. Sandhya V (Guntur)      38 uploads · 35 approved (92%)             │
│  3. Praveen K (Warangal)    29 uploads · 24 approved (83%)             │
└────────────────────────────────────────────────────────────────────────┘
```

### Filters available
- **Time:** Today | Yesterday | This week | Last 7 days | This month | Last 30 days | This quarter | This year | Custom range
- **Geography:** State | District | Constituency
- **Category:** News | Birthday | Marriage | Event | Shopping | Cars | Rentals | Jobs
- **Source:** Citizen | Admin Direct | NotebookLM
- **Reporter:** Search by name

### Drill-down flow
1. **Click "Approved: 892"** → list of all 892 approved items today
2. **Click "Kurnool: 142"** → list of all 142 Kurnool uploads today
3. **Click any item** → full review screen (read-only)
4. **Click reporter name** → reporter profile page

### Reporter profile page

```
┌────────────────────────────────────────────────────────────────────────┐
│  👤 Ravi Kumar — Verified Citizen Reporter                              │
│  📍 Kurnool · Joined 2026-01-15                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Lifetime stats:                                                       │
│  Total uploads: 1,247                                                  │
│  Approved: 1,089 (87%)                                                  │
│  Rejected: 158 (13%)                                                    │
│  Last upload: 12 min ago                                                │
│                                                                        │
│  Trend chart (last 90 days): uploads/day with approval rate overlay   │
│                                                                        │
│  By category:                                                          │
│  News: 823 (90% approved)                                              │
│  Events: 214 (85% approved)                                            │
│  Birthdays: 98 (95% approved)                                          │
│  Cars: 67 (70% approved)                                               │
│                                                                        │
│  Recent uploads (clickable):                                           │
│  [list of last 20 items with status badges]                            │
└────────────────────────────────────────────────────────────────────────┘
```

### Permission scope by role
| Role | View scope |
|---|---|
| Super Admin | All India |
| Master Admin | All India (with state filter dropdown) |
| Admin | Their assigned state(s) only (auto-filtered) |

### Future: Auto-approve based on reporter rating (Phase 2)
- When reporter sustains ≥90% approval rate over 100+ uploads → flag as "trusted"
- Trusted reporters' content auto-approved (admin can still spot-check)
- Database tracks all stats needed for this; logic added in Phase 2

---

## 13. Channel Publishing Automation & Time Slots

### Broadcast slots (configurable in admin settings)

```
Default daily slots:
┌──────────────┬───────────────┬──────────────────┐
│ Slot Name    │ Time          │ Bulletin Length  │
├──────────────┼───────────────┼──────────────────┤
│ Morning      │ 08:50 – 09:00 │ ~10 minutes      │
│ Lunch        │ 11:50 – 12:00 │ ~10 minutes      │
│ Evening      │ 16:50 – 17:00 │ ~10 minutes      │
│ Prime time   │ 20:50 – 21:00 │ ~10 minutes      │
│ Late night   │ 22:50 – 23:00 │ ~10 minutes      │
└──────────────┴───────────────┴──────────────────┘
```

### Scheduling rules

1. **General news/content:** Distributed across daily slots (round-robin, freshest first)
2. **Birthday wishes:** Auto-scheduled for slot closest to 9:00 AM on the EXACT birthday date
3. **Marriage anniversaries:** Same as birthdays — scheduled for the anniversary date
4. **Upcoming marriage announcements:** Scheduled 7 days before, 3 days before, and on the day
5. **Events:** Scheduled 2 days before, 1 day before, and on the event day
6. **Other categories (shopping, jobs, cars, rentals):** Standard distribution
7. **NotebookLM content:** Scheduled per its assigned level (national → national slot, district → district slot)

### Pre-broadcast notification

10 minutes before each slot:
1. Scheduler picks content for the slot
2. Sends push notifications to all uploaders whose content is airing:
   ```
   Title: "🎉 Your post airs in 10 minutes!"
   Body:  "Tune in to Kurnool TV at 9:00 AM. Share with friends!"
   Action: Deep link to live channel
   ```
3. For birthdays: ALSO notify the birthday person + wishers

### Admin override
- Super admin can manually drag/drop items between slots
- Cancel a scheduled broadcast (with audit log)
- Schedule item to specific date/slot

---

## 14. Push Notification Templates

### To citizens
- **Content approved:** "🎉 Your post is approved! Airs today at [time]."
- **Content rejected:** "Your post needs changes. Reason: [admin reason]. Re-upload after corrections."
- **Broadcast imminent:** "🎬 Your post airs in 10 minutes! Watch on Kurnool TV. Share with friends!"
- **Broadcast aired:** "Your post just aired on live TV! Check the replay."

### To admins
- **New for review:** "New post in your queue: [category] · [constituency]."
- **Escalation (to master/super):** "[Admin name] escalated a post for your review."
- **Admin created (welcome):** "Welcome to LocalAI TV staff. Login at admin.localaitv.com. Temp password: XXXX."

### To birthday person + wishers
- **Birthday broadcast scheduled:** "🎂 Your birthday wish airs on [date] at [time] on Kurnool TV. Share with family!"
- **Broadcast imminent:** "Your birthday wish airs in 10 minutes! Watch live."

All templates are editable in admin settings (super admin only).

---

## 15. AI Pipeline Webhook Integration

### Non-disruption principle
Your existing AI processing pipeline (Gemini Flash → Google TTS → FFmpeg → bulletin assembly) stays **100% unchanged**. The only change for your AI team: receive a webhook instead of polling for new uploads.

### Webhook contract

**From admin system → AI pipeline (on approval):**
```
POST https://your-ai-pipeline.localaitv.com/webhook/content-approved
Content-Type: application/json
X-LocalAITV-Signature: <HMAC for verification>

Body:
{
  "content_id": "abc-123-def",
  "headline": "కర్నూలు ఫ్లై ఓవర్ ప్రారంభం",
  "description": "...",
  "location": "Kurnool City, Old Bus Stand",
  "category": "news",
  "geography_level": "constituency",
  "state": "AP",
  "district": "Kurnool",
  "constituency": "Kurnool Urban",
  "media_urls": [
    {"type": "photo", "url": "https://r2.localaitv.com/uploads/abc-1.jpg"},
    {"type": "photo", "url": "https://r2.localaitv.com/uploads/abc-2.jpg"},
    {"type": "video", "url": "https://r2.localaitv.com/uploads/abc-3.mp4"}
  ],
  "author": {
    "id": "user-xyz",
    "name": "Ravi Kumar",
    "phone": "+919876543210"
  },
  "approved_by": "admin-ravi-007",
  "approved_at": "2026-05-14T10:30:00Z"
}
```

**From AI pipeline → admin system (on completion):**
```
POST https://admin.localaitv.com/api/webhook/ai-processed
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "content_id": "abc-123-def",
  "status": "ready_for_bulletin",
  "ai_output_url": "https://r2.localaitv.com/ai-processed/kurnool-urban/news/abc-123.mp4",
  "duration_seconds": 47,
  "processed_at": "2026-05-14T10:35:00Z"
}
```

### What your AI team changes

```python
# OLD code (their existing):
def poll_for_new_uploads():
    new_uploads = api.fetch("/uploads?status=new")
    for upload in new_uploads:
        process_with_ai(upload)

# NEW code (10-line change):
@app.route("/webhook/content-approved", methods=["POST"])
def on_admin_approved():
    # Verify HMAC signature
    if not verify_signature(request):
        return {"error": "invalid"}, 401
    content = request.json
    process_with_ai(content)  # SAME function, no changes inside
    return {"ok": True}
```

That's the entire integration. Their pipeline keeps running as before.

---

## 16. Security & Row Level Security

### Authentication
- **Citizens:** SMS OTP only (via 2Factor.in)
- **Admins:** Password + SMS OTP 2FA (every login)
- **Session token expiry:** 24 hours (admin), 30 days (citizen)
- **Password requirements:** Minimum 10 characters, 1 uppercase, 1 number

### Row Level Security (database-enforced permissions)

```sql
-- Admins can only SELECT content in their geographic scope
CREATE POLICY admin_content_select ON content FOR SELECT
  USING (
    (auth.role() = 'super_admin') OR
    (auth.role() = 'master_admin') OR
    (auth.role() = 'admin' AND state = ANY(
      (SELECT assigned_states FROM users WHERE id = auth.uid())
    ))
  );

-- Only super admins can create master admins
CREATE POLICY users_create_master ON users FOR INSERT
  WITH CHECK (
    (NEW.role = 'master_admin' AND auth.role() = 'super_admin') OR
    (NEW.role = 'admin' AND auth.role() IN ('super_admin', 'master_admin')) OR
    (NEW.role = 'citizen')
  );

-- Citizens can only see their OWN content
CREATE POLICY citizen_own_content ON content FOR SELECT
  USING (author_id = auth.uid() AND deleted_at IS NULL);

-- Only super admins can hard-delete
CREATE POLICY content_delete_super ON content FOR DELETE
  USING (auth.role() = 'super_admin');
```

Even if someone bypasses the UI (direct API call), the database refuses operations they aren't authorized for.

### File access security
- All media files in Cloudflare R2 are **private by default**
- Access only via **signed URLs** with 1-hour expiry
- App requests new URL each time media is viewed
- Even if a URL is leaked, it expires harmlessly

### IT Rules 2021 compliance (India)
- Grievance officer contact in app (already in place)
- 24-hour response SLA on complaints
- Content takedown mechanism (built into review system)
- Audit log retained for legal record-keeping

---

## 17. Audit Log

Every action is logged with:
- WHO did it (user_id + role at time of action)
- WHAT they did (approved / rejected / modified / etc.)
- WHEN (timestamp)
- BEFORE state (snapshot of content before change)
- AFTER state (snapshot after change)
- REASON (free-text from admin)
- IP address + user agent

Retention: Indefinite (compliance), with archive option for items >1 year old.

Queryable by:
- Content ID (full history of one item)
- Actor (everything an admin did)
- Action type (all rejections, all escalations, etc.)
- Date range

---

## 18. Tech Stack Summary

| Layer | Service | Cost @ launch | Cost @ 10K users |
|---|---|---|---|
| Database + Auth + Realtime | **Supabase** (Mumbai) | ₹0 | ₹2,100/mo |
| Media storage | **Cloudflare R2** (Mumbai + Chennai) | ₹0 (10 GB free) | ₹3,000/mo |
| Push notifications | **Firebase Cloud Messaging** | ₹0 | ₹0 |
| SMS OTP | **2Factor.in** (existing) | ₹400/mo | ₹2,500/mo |
| AI script generation | **Google Gemini Flash** (existing) | ₹500-2,000/mo | ₹5,000/mo |
| AI voice (TTS) | **Google TTS** (existing) | ₹1,000-3,000/mo | ₹8,000/mo |
| App hosting | **Netlify** (existing) | ₹0 | ₹1,500/mo |
| Email (optional) | **Resend** | ₹0 (free tier) | ₹0 |
| Domain | **localaitv.com** (existing) | ₹85/mo | ₹85/mo |
| **TOTAL** | | **₹2,000–5,500/mo** | **~₹22,000/mo** |

---

## 19. Cost Projections

### Phase-wise cost during build
- Infrastructure: ₹2,000–5,500/month
- AI services (Gemini + TTS): scales with test volume — likely <₹5,000 during build
- No labor cost (founder + AI team unchanged + Claude does build)
- **Total during build: ~₹7,000–10,000/month**

### Production scaling
| Users (DAU) | Monthly cost |
|---|---|
| 0–1K | ₹2,000–5,000 |
| 1K–10K | ₹5,000–22,000 |
| 10K–100K | ₹22,000–1,00,000 |
| 100K–1M | ₹1,00,000–5,00,000 |

All pay-as-you-go. Scales with actual usage.

---

## 20. Implementation Phases

### Phase 1 — Foundation
- Supabase project setup (Mumbai)
- Database schema migration (all tables + indexes + RLS)
- Auth flow for admins (password + SMS OTP)
- One super admin account (you)
- Cloudflare R2 bucket setup
- Migration of any existing citizen profiles (if applicable)

### Phase 2 — Admin Dashboard Core
- Dashboard layout + navigation
- Review queue with state-filtering
- Item detail / review screen
- Claim/lock mechanism
- Approve / Reject flows
- Webhook trigger to AI pipeline

### Phase 3 — Admin Workflow Complete
- Modify & Approve (with original retention)
- Escalation flow (admin → master → super)
- Admin direct upload form (auto-approved)
- Push notification integration (FCM)
- Notifications to citizens on approve/reject

### Phase 4 — Channel Publishing + NotebookLM
- Broadcast slots configuration
- Time-slot scheduler (cron job)
- Birthday auto-scheduling
- NotebookLM upload form (5 sub-types)
- Time-slot notifications to uploaders
- Publishing queue UI

### Phase 5 — Analytics + Team Management
- Analytics dashboard with drill-down
- Reporter profile pages
- Date range filters
- Team management UI (create master/admin)
- Permission edit / suspend admin
- Audit log viewer

### Phase 6 — Integration Testing + Onboarding
- AI team webhook integration testing
- End-to-end test (citizen upload → admin review → AI process → live)
- Onboard first batch of admins
- User documentation
- Final deployment to production

---

## 21. Team Requirements

### Required:
- **Founder (Koneti Mohan Reddy)** — decisions, account setup, API keys, final approval
- **AI Team (existing)** — webhook handler addition (10 lines of code), pipeline stays unchanged
- **Claude (Anthropic AI)** — builds everything else

### NOT required:
- ❌ DevOps engineer (Supabase + R2 + Netlify are all managed services)
- ❌ Full-stack developer (Claude builds the code)
- ❌ Database administrator (Supabase auto-manages Postgres)
- ❌ Frontend developer (Claude builds in React)

### Optional (later):
- Part-time React developer for ongoing maintenance after launch (5–10 hours/week, useful but not urgent)

---

## 22. What's IN / OUT of v1

### ✅ IN v1
- Three-tier admin system (super / master / admin)
- State-restricted admin access
- Citizen review workflow (approve / modify+approve / reject / escalate)
- Locking mechanism (no double-review)
- Admin direct upload (auto-approved)
- NotebookLM upload (5 sub-types, auto-approved, direct-publish)
- Webhook integration with existing AI pipeline
- Time-slot publishing scheduler with notifications
- Push notifications (citizens + admins)
- Analytics dashboard with drill-down + reporter profiles
- Audit log
- Hidden admin access (subdomain)
- Mobile + web admin dashboards (same React/Capacitor app)

### ❌ OUT of v1 (future phases)
- Public analytics / leaderboards (out per founder decision)
- AI-assisted moderation (premature — wait for data)
- Reporter compensation / payout (out per founder — may add later)
- Reporter ranking-based auto-approval (database tracks stats, logic in Phase 2)
- Bulk approve / reject (wait for observed need)
- Comment moderation (no public comments yet)
- Multi-language admin UI chrome (English chrome only for v1; content is multilingual)

---

## 23. 🚨 What I Need From You — Action Items

To start building immediately after your approval, please complete these registrations and share the credentials with me. **Total time on your side: ~30 minutes.**

### A. **Supabase** (FREE — primary database + auth)
- **Where to sign up:** https://supabase.com/dashboard/sign-up
- **Account email:** Use localaitv@gmail.com (or your preferred work email)
- **Steps:**
  1. Click "New Project"
  2. Project name: `localaitv`
  3. Database password: Generate strong (save somewhere safe)
  4. Region: **Asia South (Mumbai)** — IMPORTANT for India latency
  5. Plan: Free (will upgrade to Pro later if needed)
- **Share with me:**
  - Project URL: `https://xxxxx.supabase.co`
  - `anon` public key (Settings → API → anon public)
  - `service_role` secret key (Settings → API → service_role)

### B. **Cloudflare R2** (Storage — needs credit card, but ₹0 at low usage)
- **Where to sign up:** https://dash.cloudflare.com/sign-up
- **Account email:** Same as Supabase
- **Steps:**
  1. Sign up for Cloudflare account
  2. Add a credit card (required to enable R2 — won't be charged at low usage)
  3. Go to R2 → "Purchase R2 Plan"
  4. Create bucket: `localaitv-storage` (Mumbai region if available)
  5. Generate API token: R2 → Manage R2 API Tokens → Create API Token
  6. Permissions: Object Read & Write
- **Share with me:**
  - Account ID
  - Access Key ID
  - Secret Access Key
  - Bucket name
  - R2 endpoint URL

### C. **Firebase Cloud Messaging** (FREE — push notifications)
- **Where to sign up:** https://console.firebase.google.com/
- **Account email:** Same Google account
- **Steps:**
  1. Click "Add project"
  2. Project name: `localaitv-fcm`
  3. Enable Google Analytics: optional (skip if you want)
  4. Once created, go to Project Settings → Cloud Messaging
- **Share with me:**
  - Project ID
  - Server key (Cloud Messaging tab → Server key)
  - Web push certificate key (for Capacitor + web)
  - Service account JSON file (Settings → Service accounts → Generate new private key)

### D. **Google Gemini Flash API** (EXISTING — confirm access)
- **Verify here:** https://aistudio.google.com/app/apikey
- **Share with me:**
  - API key (you already have this — confirm it works)
  - OR confirm: "AI team will handle Gemini calls, don't need access"

### E. **Google TTS API** (EXISTING — confirm access)
- **Verify here:** https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
- **Share with me:**
  - API key or service account JSON
  - OR confirm: "AI team will handle TTS calls, don't need access"

### F. **2Factor.in** (EXISTING — already have key)
- **Confirm:** You shared this earlier
- **For production launch:** Complete DLT registration if not already done (₹5,000 one-time, 5-7 days)

### G. **Netlify** (EXISTING — for deploying admin dashboard)
- **Confirm:** Use existing `localaitv@gmail.com` account
- **Action:** I'll deploy admin dashboard to a new Netlify site under your account using device-flow auth (already proven)

### H. **Domain DNS** (admin subdomain)
- **You need to:** Point `admin.localaitv.com` to Netlify
- **Where:** Your domain registrar (GoDaddy / Namecheap / wherever you bought localaitv.com)
- **How:** Add a CNAME record:
  - Type: CNAME
  - Name: `admin`
  - Value: `<netlify-site>.netlify.app` (I'll give you the exact value during Phase 1)
- **OR:** Give me access to DNS settings and I'll configure it

### I. **AI Pipeline webhook URL** (FROM YOUR AI TEAM)
- **Action:** Ask your AI team to provide a webhook endpoint where they'll receive approved content
- **Format:** `https://your-pipeline-domain.localaitv.com/webhook/content-approved`
- **Authentication:** I'll provide HMAC signing key for verification
- **Their effort:** ~10 lines of code to add this endpoint (replaces their current polling logic)

### J. **Optional — Resend** (FREE — for admin email invites)
- **Sign up:** https://resend.com/signup (3K emails/month free)
- **Skip if:** You don't want email — SMS-only is fine

---

### 📝 Summary of action items

| Item | Time needed | Cost |
|---|---|---|
| A. Supabase account | 5 min | ₹0 |
| B. Cloudflare R2 account (with card) | 10 min | ₹0 at low usage |
| C. Firebase project | 10 min | ₹0 |
| D. Confirm Gemini API access | 2 min | (existing) |
| E. Confirm Google TTS access | 2 min | (existing) |
| F. 2Factor.in DLT registration (optional, for production) | 5-7 days, ₹5,000 | One-time |
| G. Confirm Netlify access | 1 min | (existing) |
| H. DNS CNAME for `admin.localaitv.com` | 5 min | ₹0 |
| I. Ask AI team for webhook URL | (their decision) | ₹0 |
| J. Resend (optional) | 5 min | ₹0 |

**Total founder time:** ~30-45 minutes
**Total cost (one-time):** ₹0–5,000 (DLT is optional)
**Total monthly cost during build:** ~₹2,000–5,500

### Once you've completed A–I, paste the credentials in our chat (or save to a secure note and share via password manager). I'll start Phase 1 the moment I have them.

---

## 24. Approval & Sign-off

### Founder approval

| Item | Confirmed by founder? |
|---|---|
| Three-tier admin system (super / master / admin) | ☐ Yes ☐ No |
| State-restricted admins | ☐ Yes ☐ No |
| Form fields as specified (max 3 files, single fields) | ☐ Yes ☐ No |
| Supabase + Cloudflare R2 architecture | ☐ Yes ☐ No |
| Hidden admin URL (admin.localaitv.com) | ☐ Yes ☐ No |
| Push notifications (FCM, free) | ☐ Yes ☐ No |
| Channel publishing automation with time slots | ☐ Yes ☐ No |
| AI Pipeline webhook integration | ☐ Yes ☐ No |
| NotebookLM content folders (5 types) | ☐ Yes ☐ No |
| Analytics dashboard with drill-down | ☐ Yes ☐ No |
| 3-4 week build timeline | ☐ Yes ☐ No |
| ₹2,000–5,500/month infrastructure cost | ☐ Yes ☐ No |
| OUT of v1: payout, public leaderboards, AI moderation | ☐ Yes ☐ No |

### AI team review

| Item | Confirmed by AI team? |
|---|---|
| Webhook contract (receive POST instead of polling) | ☐ Yes ☐ No |
| 10-line code change in their pipeline | ☐ Yes ☐ No |
| Callback URL to mark content as processed | ☐ Yes ☐ No |

---

### Final approval to begin Phase 1:

**Founder signature:** _______________________
**Date:** _______________________

---

## 📞 Contact

**Founder:** Koneti Mohan Reddy
**Email:** localaitv@gmail.com
**Company:** LocalAI Media Network Pvt Ltd
**CIN:** U63910KA2025PTC212593

**Document version:** v1.0 final
**Generated:** 2026-05-14
**Subject to mutual updates as needed before Phase 1 build begins.**

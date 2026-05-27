# LocalAI TV — Admin Dashboard & Database Plan

**Status:** ⏸ Plan only — awaiting approval before any code is written
**Author:** Drafted from founder's voice brief
**Last updated:** 2026-05-14

---

## 1. Executive Summary

We are building an **internal moderation + content management system** that lets a 3-tier admin team (super admin → master admin → admin) review citizen-reporter submissions, upload their own authoritative content, and route everything to publishing channels (Karnool TV, etc.).

**Five pillars:**

1. **3-tier admin role system** with clear, escalating permissions
2. **Workflow engine** that routes citizen content through review → approve / modify+approve / reject / escalate
3. **Locking mechanism** so two admins never review the same item simultaneously
4. **Content database** organized geographically (National → State → District → Constituency) with 8 content categories per constituency
5. **Hidden admin access** — not visible to the public, accessible from app + web at a discreet URL

**Tech stack proposal:** Supabase (Postgres + Auth + Storage + Realtime) + the existing React/Capacitor app (admin section behind a hidden route) + Netlify Functions for any custom logic. Free tier covers the first ~50,000 users — total cost during the build phase is essentially zero.

---

## 2. ⚠️ Critical Open Questions — Please Answer Before We Build

The plan below makes reasonable assumptions for each of these. If any answer differs from our assumption, **the design changes**. Please confirm or correct.

| # | Question | Our assumption |
|---|---|---|
| **Q1** | **How should admins log in?** Same SMS OTP as citizens, or username/password, or both (2FA)? | We assume: **username/password + SMS OTP as 2nd factor** for admins. Citizens stay on SMS OTP only. |
| **Q2** | **When admin rejects citizen content, does the citizen get notified?** With what reason / message? | We assume: **Yes — citizen sees a notification in-app with admin-written rejection reason (free text)**. |
| **Q3** | **When admin "modifies and approves", do we keep the original?** Useful for audit, disputes, reporter feedback. | We assume: **Yes — original is stored read-only, the modified version becomes the "approved" copy**. |
| **Q4** | **Does "approved" content auto-publish, or is there another step?** | We assume: **Approved content lands in the "approved" pool, ready to be picked up by your publishing workflow (manual or automated). Approval ≠ live yet.** |
| **Q5** | **Should rejected content be deleted immediately, or kept for X days?** | We assume: **Soft delete with 30-day retention** for dispute resolution + audit. After 30 days, hard delete (compliance). |
| **Q6** | **Are admin uploads instantly published, or do they also have an "approved pool"?** | We assume: **Admin/Master/Super uploads bypass review and go directly to "approved pool"** — exactly as you described. |
| **Q7** | **How long should an admin's "claim" on an item last before auto-expiring?** | We assume: **30 minutes** of inactivity → lock released, item visible again to other admins. |
| **Q8** | **Do admins see analytics?** (e.g. "how many items I approved this week", reporter quality scores) | We assume: **Yes — basic stats on each admin's dashboard. Super admin sees team-wide stats.** |
| **Q9** | **Reporter compensation tracking** — when citizen content is approved, do we increment a balance on the citizen's profile? | We assume: **Yes — every approved item adds to the citizen's payout balance**. Payout flow itself is a separate later module. |
| **Q10** | **Do you want bulk approve/reject?** (Admin selects 10 items at once, approves all) | We assume: **Not in v1** — single-item review only, to ensure quality. Can add bulk later. |

> 📝 **Please reply with corrections.** If all 10 assumptions look good, just say "all good, proceed" and I'll lock the plan.

---

## 3. The Three Admin Tiers — Permissions Matrix

| Capability | Super Admin | Master Admin | Admin |
|---|:---:|:---:|:---:|
| Create Super Admin | ❌ (only one — the founder) | ❌ | ❌ |
| Create Master Admin | ✅ | ❌ | ❌ |
| Create Admin | ✅ | ✅ | ❌ |
| Suspend / remove admins below tier | ✅ | ✅ (admins only) | ❌ |
| Upload content (national) | ✅ | ✅ | ✅ |
| Upload content (state) | ✅ | ✅ | ✅ |
| Upload content (district) | ✅ | ✅ | ✅ |
| Upload content (constituency — all 8 forms) | ✅ | ✅ | ✅ |
| Bypass review (their own uploads go directly to "approved") | ✅ | ✅ | ✅ |
| **Review citizen submissions:** | | | |
| → Approve | ✅ | ✅ | ✅ |
| → Modify & approve | ✅ | ✅ | ✅ |
| → Reject (with reason) | ✅ | ✅ | ✅ |
| → Escalate to higher tier | — (top) | → Super Admin | → Master Admin |
| View audit log (everything) | ✅ | ✅ (team-only) | ✅ (own only) |
| Team analytics | ✅ (everyone) | ✅ (own team) | ✅ (own work) |
| Database backups / settings | ✅ | ❌ | ❌ |

**Implementation:** Each user has a `role` field in the database with one of:
- `super_admin` (only 1 person — typically founder)
- `master_admin`
- `admin`
- `citizen_reporter` (verified, can upload, needs review)
- `public` (regular app user, can browse + post community items)

Permissions are enforced **at the database level** via Supabase Row Level Security (RLS) policies. This means even if someone bypasses the UI, the database refuses operations they aren't allowed to do.

---

## 4. Content Workflow (the key diagram)

```
┌─────────────────────┐      ┌─────────────────────┐
│  CITIZEN REPORTER   │      │  ADMIN / MASTER /   │
│  / PUBLIC UPLOADS   │      │  SUPER ADMIN UPLOADS│
└──────────┬──────────┘      └──────────┬──────────┘
           │                            │
           ▼                            │
   ┌──────────────┐                     │
   │   PENDING    │                     │
   │   REVIEW     │                     │
   │  (queue for  │                     │
   │  admins)     │                     │
   └──────┬───────┘                     │
          │                             │
          ▼                             │
   ╔══════════════════════════╗         │
   ║ ADMIN OPENS ITEM         ║         │
   ║ → DB locks item to       ║         │
   ║   `claimed_by = admin_id`║         │
   ║ → Hidden from other      ║         │
   ║   admins' queue          ║         │
   ║ → 30-min auto-expire     ║         │
   ╚══════════════════════════╝         │
          │                             │
          ▼                             │
    ┌─────────────────────┐             │
    │  ADMIN DECIDES:     │             │
    └─────────────────────┘             │
       │  │   │      │                  │
       │  │   │      │                  │
       │  │   │      ▼                  │
       │  │   │  ESCALATE → next tier   │
       │  │   ▼                         │
       │  │  REJECT (+ reason)          │
       │  │   │                         │
       │  │   ▼                         │
       │  │  ❌ Notify reporter         │
       │  │     Soft-delete (30d)       │
       │  │                             │
       │  ▼                             │
       │ MODIFY & APPROVE                │
       │  │  • Save original (read-only) │
       │  │  • Save modified version     │
       │  ▼                              │
       ▼                                │
   APPROVE ←──────────────────────────  ┘
       │
       ▼
   ┌──────────────────────────────────┐
   │   APPROVED POOL                  │
   │   (per category, per geography)  │
   │   → Ready for publishing         │
   │   → Reporter balance += payout    │
   └──────────────────────────────────┘
       │
       ▼
   ┌──────────────────────────────────┐
   │ PUBLISHING (manual / automated)  │
   │  → Karnool TV live channel       │
   │  → App home feed                 │
   │  → Constituency local page       │
   └──────────────────────────────────┘
```

### 4.1 The Locking Rule (preventing two admins working on same item)

**Database table `content`:**
```
content_id  | status      | claimed_by  | claimed_at
------------+-------------+-------------+------------------
123         | pending     | NULL        | NULL
124         | in_review   | admin-007   | 2026-05-14 14:32
125         | approved    | (was admin-002) | 2026-05-14 12:10
```

When admin opens item 123:
```sql
UPDATE content
SET status = 'in_review', claimed_by = $admin_id, claimed_at = NOW()
WHERE id = 123
  AND status = 'pending'
  AND (claimed_by IS NULL OR claimed_at < NOW() - INTERVAL '30 minutes');
```

If the UPDATE affects 0 rows → another admin already claimed it → frontend says "this item was just claimed by [name]".

**Auto-expiry:** A background job (Netlify Function on cron, or Supabase Edge Function) runs every 5 minutes:
```sql
UPDATE content SET status = 'pending', claimed_by = NULL, claimed_at = NULL
WHERE status = 'in_review' AND claimed_at < NOW() - INTERVAL '30 minutes';
```

---

## 5. Database Schema (Postgres / Supabase)

### 5.1 Tables

```
┌──────────────────────────────────────────────────────────┐
│  users                                                    │
├──────────────────────────────────────────────────────────┤
│ id              UUID            PK                         │
│ phone           TEXT  UNIQUE                              │
│ name            TEXT                                       │
│ role            ENUM('super_admin','master_admin',         │
│                       'admin','citizen_reporter','public') │
│ created_by      UUID  FK→users.id  (who created this admin)│
│ created_at      TIMESTAMPTZ                                │
│ suspended       BOOLEAN  DEFAULT false                     │
│ password_hash   TEXT    (for admin tier only — citizens   │
│                          use SMS OTP, no password)        │
│ avatar_url      TEXT                                       │
│ payout_balance  DECIMAL (only meaningful for citizen_rep) │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  content                                                  │
├──────────────────────────────────────────────────────────┤
│ id              UUID    PK                                 │
│ author_id       UUID    FK→users.id                        │
│ author_role     ENUM    (snapshot of role at upload time) │
│ geography_level ENUM('national','state','district','const')│
│ state           TEXT    nullable                           │
│ district        TEXT    nullable                           │
│ constituency    TEXT    nullable                           │
│ category        ENUM('news','birthday','marriage','event', │
│                       'car_sale','rental','shopping','job')│
│ headline        TEXT                                       │
│ description     TEXT                                       │
│ location        TEXT                                       │
│ media_urls      JSONB   array of {type,url,thumb_url}      │
│ original_data   JSONB   (read-only snapshot at upload —   │
│                          preserves citizen's original     │
│                          version if admin modifies later) │
│ status          ENUM('pending','in_review','approved',     │
│                       'rejected','published')             │
│ claimed_by      UUID    FK→users.id (admin currently      │
│                                       reviewing)          │
│ claimed_at      TIMESTAMPTZ                                │
│ reviewed_by     UUID    FK→users.id (final decision)      │
│ reviewed_at     TIMESTAMPTZ                                │
│ rejection_reason TEXT                                      │
│ escalated_to    UUID    FK→users.id (if escalated)         │
│ created_at      TIMESTAMPTZ                                │
│ updated_at      TIMESTAMPTZ                                │
│ deleted_at      TIMESTAMPTZ  (soft delete — 30d retention)│
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  content_audit_log                                        │
├──────────────────────────────────────────────────────────┤
│ id              UUID    PK                                 │
│ content_id      UUID    FK→content.id                      │
│ action          ENUM('created','claimed','modified',       │
│                       'approved','rejected','escalated',   │
│                       'unclaimed','restored')             │
│ actor_id        UUID    FK→users.id                        │
│ actor_role      ENUM                                       │
│ before_state    JSONB  (snapshot before action)           │
│ after_state     JSONB  (snapshot after action)            │
│ reason          TEXT                                       │
│ ip_address      INET                                       │
│ user_agent      TEXT                                       │
│ created_at      TIMESTAMPTZ                                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  notifications                                            │
├──────────────────────────────────────────────────────────┤
│ id              UUID    PK                                 │
│ user_id         UUID    FK→users.id                        │
│ type            ENUM('content_approved','content_rejected',│
│                       'content_escalated','new_for_review',│
│                       'admin_created','payout_balance')   │
│ payload         JSONB                                      │
│ read            BOOLEAN                                    │
│ created_at      TIMESTAMPTZ                                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  constituencies   (reference table — 175 AP + 119 TG)     │
├──────────────────────────────────────────────────────────┤
│ id              SERIAL  PK                                 │
│ name            TEXT                                       │
│ state           TEXT                                       │
│ district        TEXT                                       │
│ is_active       BOOLEAN                                    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  publishing_queue   (after approval, before going live)   │
├──────────────────────────────────────────────────────────┤
│ id              UUID    PK                                 │
│ content_id      UUID    FK→content.id                      │
│ channel         TEXT  (e.g. 'kurnool-tv', 'app-home',      │
│                       'guntur-tv', 'web-state')           │
│ scheduled_for   TIMESTAMPTZ  nullable (immediate if NULL) │
│ published_at    TIMESTAMPTZ  nullable                      │
│ published_by    UUID  FK→users.id                          │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Indexes (for fast queue queries)

```sql
-- The "show me pending items for my queue" query needs to be fast
CREATE INDEX idx_content_queue ON content(status, geography_level, claimed_at)
  WHERE status IN ('pending','in_review');

-- Geography lookups
CREATE INDEX idx_content_geo ON content(state, district, constituency);

-- Audit log lookups by content
CREATE INDEX idx_audit_content ON content_audit_log(content_id, created_at DESC);

-- "What's in my approved pool, by constituency + category"
CREATE INDEX idx_approved_pool ON content(constituency, category, created_at DESC)
  WHERE status = 'approved';
```

### 5.3 Row Level Security (sample policies)

Supabase RLS enforces permissions at the database level:

```sql
-- Admins can SELECT content they have permission to see
CREATE POLICY admin_select_content ON content FOR SELECT
  USING (
    auth.role() IN ('admin', 'master_admin', 'super_admin')
    AND deleted_at IS NULL
  );

-- Only super admins can DELETE (hard delete, after 30-day soft delete)
CREATE POLICY super_admin_delete ON content FOR DELETE
  USING (auth.role() = 'super_admin');

-- Citizens can only see their OWN content
CREATE POLICY citizen_own_content ON content FOR SELECT
  USING (author_id = auth.uid());

-- Only super admins can create master admins
CREATE POLICY super_create_master ON users FOR INSERT
  WITH CHECK (
    (NEW.role = 'master_admin' AND auth.role() = 'super_admin')
    OR (NEW.role = 'admin' AND auth.role() IN ('super_admin','master_admin'))
    OR (NEW.role IN ('citizen_reporter','public'))
  );
```

---

## 6. Storage / Folder Structure (Supabase Storage, mirrors your mental model)

```
localaitv-storage/
│
├── national/
│   ├── pending/        ← citizen uploads awaiting review
│   └── approved/       ← admin-approved + admin direct uploads
│
├── state/
│   ├── andhra-pradesh/
│   │   ├── pending/
│   │   └── approved/
│   └── telangana/
│       ├── pending/
│       └── approved/
│
├── district/
│   ├── andhra-pradesh/
│   │   ├── kurnool/
│   │   │   ├── pending/
│   │   │   └── approved/
│   │   ├── guntur/...
│   │   └── ...
│   └── telangana/...
│
└── constituency/
    └── andhra-pradesh/
        └── kurnool/
            └── kurnool-urban/
                ├── news/
                │   ├── pending/        ← citizen news uploads
                │   └── approved/       ← admin-approved news
                ├── birthdays/
                │   ├── pending/
                │   └── approved/
                ├── marriages/
                │   ├── pending/
                │   └── approved/
                ├── events/
                ├── car_sales/
                ├── rentals/
                ├── shopping/
                └── jobs/
                    ├── pending/
                    └── approved/
```

> 💡 **In practice**, the database is the source of truth — folders are just where the media files (photos/videos) live. The "approved pool" is really a database query: `WHERE status='approved' AND constituency='kurnool-urban' AND category='news'` returns everything in the conceptual "approved/news" folder.

**Storage choice:**
- **Supabase Storage** (S3-compatible, built-in CDN, free tier 1 GB) — for v1
- **Cloudflare R2** — for production scale (cheaper egress)

---

## 7. Hidden Admin Access — Where Admins Log In

### 7.1 The discreet URL pattern

| Surface | URL / Path |
|---|---|
| Web (browser) | `https://localaitv.com/staff` ← obscure, no public link |
| Web alt | `https://admin.localaitv.com` (subdomain — even more hidden) |
| In-app deep link | Tap a hidden 5-tap sequence on Profile → "Staff Access" reveals login |
| QR code (for new admin onboarding) | Generated by super admin, scannable in-app |

**Recommendation: use a subdomain** `admin.localaitv.com`. No link from the public site. Bookmark it.

### 7.2 Admin login flow (proposed — see Q1 above)

```
1. Admin opens https://admin.localaitv.com
2. Enters phone or email + password
3. System sends SMS OTP to admin's registered number (via 2Factor.in)
4. Admin enters OTP
5. Session token issued (24-hour expiry)
6. Lands on admin dashboard
```

### 7.3 New admin creation flow

```
Super Admin                        New Master Admin
    │                                     │
    │ 1. Goes to /admin/team               │
    │ 2. Click "Create Master Admin"       │
    │ 3. Enters name, phone, email         │
    │ 4. Sets initial temp password        │
    │                                      │
    │ 5. New row in `users` table created  │
    │                                      │
    │ 6. SMS sent to new master admin      │
    │    "You've been added as Master      │
    │     Admin on LocalAI TV. Login:      │
    │     admin.localaitv.com Phone: ...   │
    │     Temp password: XXXX. You'll be   │
    │     asked to set a new one."         │
    │                                      │
    │                            7. Master admin logs in
    │                            8. Forced to change password
    │                            9. Set up SMS OTP 2FA
    │                            10. Lands on dashboard
```

Same flow for super admin → admin, and master admin → admin.

### 7.4 What citizens see (they do NOT see admin stuff)

The existing app's Profile screen gets ONE subtle addition:
- A footer line: **"Staff? [Sign in here →]"**  ← tiny text, only useful if you know

OR: nothing visible at all. Admins memorize `admin.localaitv.com`.

I lean toward **nothing visible** in v1. We can add the hidden link later.

---

## 8. API Endpoints (REST, served from Netlify Functions or Supabase auto-generated)

### 8.1 Auth (admin tier)
```
POST   /api/admin/login               { phone, password } → { challenge_id }
POST   /api/admin/verify-otp          { challenge_id, otp } → { session_token, user }
POST   /api/admin/logout              → { ok: true }
GET    /api/admin/me                  → { user, role, permissions }
POST   /api/admin/change-password     { old, new } → { ok }
```

### 8.2 Content queue (admins)
```
GET    /api/admin/queue?geo=<level>   → list of pending items, excluding claimed ones
GET    /api/admin/content/:id          → full item with media
POST   /api/admin/claim/:id            → { ok, claimed_by_me } or { error: already_claimed }
POST   /api/admin/release/:id          → { ok } (release a claim without deciding)
POST   /api/admin/approve/:id          → { ok }
POST   /api/admin/modify-approve/:id   { headline?, description?, location?, media_keep_ids? } → { ok }
POST   /api/admin/reject/:id           { reason } → { ok }
POST   /api/admin/escalate/:id         → { ok, escalated_to }
```

### 8.3 Admin uploads (their own content)
```
POST   /api/admin/upload               { geo, category, headline, description, location, media_uploads[] }
                                       → { content_id, status: 'approved' }   (bypasses review)
```

### 8.4 User / admin management
```
GET    /api/admin/users?role=...       → list (filtered by permission)
POST   /api/admin/users                 { name, phone, role } → creates new admin
PATCH  /api/admin/users/:id             { suspended?, role? }
DELETE /api/admin/users/:id             → soft-delete admin (super admin only)
```

### 8.5 Audit log + analytics
```
GET    /api/admin/audit?content_id=... → audit trail for one item
GET    /api/admin/analytics/me         → personal stats (items approved this week, etc.)
GET    /api/admin/analytics/team       → team stats (super/master admin only)
```

### 8.6 Citizen-facing (existing app, just new endpoints)
```
POST   /api/citizen/upload             → uploads go to `status='pending'`
GET    /api/citizen/my-uploads         → status of own uploads (pending/approved/rejected)
GET    /api/citizen/payout-balance     → current balance from approved items
```

---

## 9. UI Screen Sketches (admin side)

### 9.1 Dashboard Home (`/admin`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ LocalAI TV — Staff Dashboard       👤 ravi@kurnool   [▼] Logout         │
├──────────────────────────────────────────────────────────────────────────┤
│  ▶ Review Queue   📤 Upload   👥 Team   📊 Analytics   📜 Audit Log     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Your stats this week:                                                  │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│   │ Reviewed   │ │ Approved   │ │ Rejected   │ │ Escalated  │          │
│   │    47      │ │    38      │ │     6      │ │     3      │          │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘          │
│                                                                          │
│   📥 Pending review queue (24 items)                       [Refresh]    │
│   ──────────────────────────────────────────────────────────────────    │
│   FILTER:  Geography [All ▼]  Category [All ▼]  By: [Anyone ▼]          │
│                                                                          │
│   ┌────────────────────────────────────────────────────────────┐        │
│   │ 🖼  [thumb]  కర్నూలు ఫ్లై ఓవర్ ప్రారంభం              │        │
│   │             📍 Kurnool Urban · 📂 News · 🕐 12 min ago     │        │
│   │             👤 Ravi Kumar (citizen reporter)                │        │
│   │             [REVIEW →]                                      │        │
│   └────────────────────────────────────────────────────────────┘        │
│   ┌────────────────────────────────────────────────────────────┐        │
│   │ 🖼  [thumb]  ఆకాశ్ గారి పుట్టినరోజు                  │        │
│   │             📍 Kurnool Urban · 📂 Birthday · 🕐 28 min ago │        │
│   │             👤 Sandhya (citizen reporter)                   │        │
│   │             [REVIEW →]                                      │        │
│   └────────────────────────────────────────────────────────────┘        │
│   ...                                                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Review Screen (admin clicks REVIEW)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ← Back to queue          🔒 Locked to you (29:42 left)    [Release]    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   📂 Constituency News · 📍 Kurnool Urban                                │
│   👤 Submitted by: Ravi Kumar (Verified Reporter · 247 stories)         │
│   🕐 Submitted: 12 minutes ago                                           │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │   Headline (Telugu):                                            │   │
│   │   [కర్నూలు ఫ్లై ఓవర్ ప్రారంభం - CM ఆవిష్కరణ          ]│   │
│   │                                                                 │   │
│   │   Headline (English) — optional:                                │   │
│   │   [Kurnool flyover inaugurated by CM                          ] │   │
│   │                                                                 │   │
│   │   Description:                                                  │   │
│   │   ┌────────────────────────────────────────────────────────┐  │   │
│   │   │ నేడు సాయంత్రం 5 గంటలకు సీఎం గారు కర్నూలులో...     │  │   │
│   │   │ (4 paragraphs)                                          │  │   │
│   │   └────────────────────────────────────────────────────────┘  │   │
│   │                                                                 │   │
│   │   Location:  [Kurnool City · Old Bus Stand]                    │   │
│   │                                                                 │   │
│   │   Media:                                                        │   │
│   │   [🖼 Photo 1]  [🖼 Photo 2]  [🎬 Video — 0:34]                 │   │
│   │   [delete this]                          [+ Add new media]      │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │  Decision:                                                       │  │
│   │  [✅ APPROVE]  [✏️ MODIFY & APPROVE]  [❌ REJECT]  [↗️ ESCALATE] │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   If rejecting, give reason (citizen will see this):                    │
│   [                                                                  ]   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Admin Upload Form (admin uploads their own content directly)

Similar to the review screen, but blank — admin fills it in. On submit, content goes directly to `status='approved'`.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  📤 Upload News / Information                                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. Geography level:                                                    │
│      ( ) National   ( ) State   ( ) District   (•) Constituency         │
│                                                                          │
│   2. Location:                                                           │
│      State:        [Andhra Pradesh ▼]                                   │
│      District:     [Kurnool        ▼]                                   │
│      Constituency: [Kurnool Urban  ▼]                                   │
│                                                                          │
│   3. Category:                                                           │
│      [News ▼]                                                            │
│      (News / Birthday / Marriage / Event / Car Sale / Rental / Shop / Job)│
│                                                                          │
│   4. Content:                                                            │
│      Headline (te):    [...]                                             │
│      Headline (en):    [...]                                             │
│      Description:      [...]                                             │
│      Location text:    [...]                                             │
│                                                                          │
│   5. Media:                                                              │
│      [📷 Add photos]   [🎬 Add video]                                    │
│                                                                          │
│   [Cancel]                                       [Publish (Approved)]    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 9.4 Team Management (Super / Master Admins only)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  👥 Team Management                                  [+ Add new admin]   │
├──────────────────────────────────────────────────────────────────────────┤
│  ROLE       NAME             PHONE         JOINED        STATUS  ACTIONS │
│  ──────────────────────────────────────────────────────────────────────  │
│  Super      Nagarjuna T.     +91 98765...  2026-01-15    Active   —     │
│  Master     Sandhya V.       +91 98765...  2026-02-20    Active   [⚙]   │
│  Master     Praveen K.       +91 98765...  2026-03-01    Active   [⚙]   │
│  Admin      Ravi M.          +91 98765...  2026-04-05    Active   [⚙]   │
│  Admin      Lakshmi N.       +91 98765...  2026-04-10    Suspended[⚙]   │
│  Admin      Kiran V.         +91 98765...  2026-05-01    Active   [⚙]   │
│                                                                          │
│  [⚙] = Edit role, suspend, reset password, view their activity         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Tech Stack Recommendation

| Layer | Tool | Why |
|---|---|---|
| **Database** | **Supabase Postgres** (Mumbai region) | Free tier 500 MB DB · Built-in auth · RLS for permissions · Realtime subscriptions for live queue · Mumbai latency ~30ms |
| **Auth (admin)** | Supabase Auth + 2Factor.in SMS | Password + SMS 2FA = secure for staff |
| **Auth (citizen)** | Existing 2Factor.in SMS OTP | Already built |
| **File storage** | Supabase Storage (v1) → Cloudflare R2 (scale) | Free 1 GB, then $0.015/GB/mo on R2 |
| **Backend API** | Netlify Functions OR Supabase Edge Functions | Netlify if we keep current setup, Supabase Edge if we want everything in one platform |
| **Admin UI (web)** | Same React app, hidden route at `/admin` or subdomain | Reuses existing component library |
| **Admin UI (mobile)** | Same React/Capacitor app, hidden tab in Profile | One codebase, all platforms |
| **Realtime updates** | Supabase Realtime (Postgres LISTEN/NOTIFY) | Free — admin queue updates without polling |
| **Email notifications** | Resend (already chosen) | Optional, for password reset / new admin onboarding |
| **Audit log** | Same Postgres table | Simple, queryable, exportable for compliance |

**Why not other options:**
- ❌ Firebase: locks you in, harder to query/report
- ❌ MongoDB: overkill for relational data like this
- ❌ Direct AWS RDS: 10× more expensive than Supabase at this scale
- ❌ Build auth ourselves: security risk + reinventing the wheel

---

## 11. Implementation Phases (proposed)

We **DON'T** build everything at once. Suggested 4-week rollout:

### Phase 1 (Week 1): Foundation
- Supabase project setup (Mumbai region)
- Database schema migration (all 6 tables + indexes)
- Row Level Security policies
- Auth flow (admin login with SMS OTP)
- One super admin account (you)

### Phase 2 (Week 2): Admin core
- Admin dashboard skeleton + login
- Review queue (citizen uploads → pending list)
- Lock/claim mechanism
- Approve / Reject flow
- Audit log writes

### Phase 3 (Week 3): Full admin workflow
- Modify & Approve flow (with original-version retention)
- Escalation flow (admin → master → super)
- Admin upload form (direct-to-approved)
- Notifications to citizens
- Mobile (Capacitor) build with hidden access

### Phase 4 (Week 4): Polish + onboarding
- Team management UI (create master/admin)
- Analytics (personal + team stats)
- Audit log viewer
- Reporter payout balance tracking
- Bulk operations (if time)
- Production deployment + first onboarded admins

**Total: ~4 weeks** of focused work for one programmer.

---

## 12. Cost Estimate (v1, first 6 months)

| Item | Free? | Cost / month (after free tier) |
|---|---|---|
| Supabase (DB + Auth + Storage + Realtime) | Free up to 50K MAU, 500 MB DB, 1 GB storage | ₹0 |
| Netlify (functions + hosting) | Free up to 100K function invocations | ₹0 |
| SMS OTP (2Factor.in) — admin logins ~5/day × 10 admins = 50 SMS/day | No | ~₹400 |
| Domain (`localaitv.com` + admin subdomain) | Already have | ₹0 |
| Cloudflare R2 (for videos when storage grows) | 10 GB free | ₹0–100 |
| **Total — first 6 months** | | **~₹400–500/month** |

After 6 months / 50K MAU you may need to upgrade Supabase to Pro ($25/mo = ₹2,100). Still very cheap.

---

## 13. Open Tasks (after plan approved)

These get scheduled once you approve the plan. **Not yet started.**

- [ ] Set up Supabase project in Mumbai region (you create the account, I'll do the rest)
- [ ] Apply the database schema migration
- [ ] Set up RLS policies
- [ ] Build admin login UI + flow
- [ ] Build review queue with lock mechanism
- [ ] Build approve / reject / modify+approve / escalate flows
- [ ] Build admin upload form
- [ ] Build team management UI
- [ ] Wire up notifications to citizens
- [ ] Deploy + onboard first admins
- [ ] Test end-to-end with 2-3 citizen submissions and 2 admins

---

## 14. What's NOT in this plan (deliberately)

These are intentionally out of scope for v1 to keep this shippable:

- ❌ Public analytics / leaderboards (citizens see only their own stats)
- ❌ AI-assisted moderation (auto-flag risky content) — Phase 2
- ❌ Real-time payment / payout integration — separate module later
- ❌ Channel-specific publishing automation (Kurnool TV live integration) — separate module
- ❌ Mobile push notifications — can add later via Capacitor plugin
- ❌ Bulk approve / reject — added after observed need (most likely Phase 2)
- ❌ Reporter rating / score system — can layer on later
- ❌ Comment moderation on published content — separate later
- ❌ Multi-language admin UI — English only for v1, Telugu later

---

## 15. Summary for your programmers

If you give this to a programmer, here's the 30-second version:

> **What it is:** 3-tier admin dashboard with content moderation workflow
> **Database:** Supabase (Postgres) in Mumbai
> **Auth:** SMS OTP (citizens) + password + 2FA (admins)
> **Backend:** Netlify Functions + Supabase Edge Functions
> **Frontend:** Same React/Capacitor app with hidden admin route
> **Key features:** Review queue with lock, approve/reject/modify/escalate, audit log, direct admin uploads
> **Estimated effort:** 4 weeks, 1 programmer
> **Estimated cost:** ₹400-500/month for first 6 months

---

## 16. Next Steps

1. **You read this document** — take your time
2. **Answer the 10 critical questions in Section 2** (or say "all good, proceed")
3. **Once approved, we build Phase 1** (Supabase setup + schema, ~1 week)
4. **You test the foundation, then we move to Phase 2**

> 🛑 **Nothing will be built until you approve this plan.** Take your time to review. Ask any clarifications.

---

**Maintained by:** Nagarjuna Teddy ([balajikamireddy9@gmail.com](mailto:balajikamireddy9@gmail.com))

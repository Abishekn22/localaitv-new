# LocalAI TV — Session Context Summary

> **Purpose:** Capture everything from the current Claude session so a future session (or any teammate) can resume work with zero prior context.
> **Last generated:** 2026-05-22 10:48 IST
> **Spans calendar dates:** 2026-05-18 → 2026-05-22 (single conversation, multiple working days, post-compaction)

---

## 1. Session Overview

### Project
- **Name:** LocalAI TV — regional-language news & content platform (Telugu, Andhra Pradesh + Telangana)
- **Legal entity:** LocalAI Media Network Pvt Ltd · CIN U63910KA2025PTC212593 (Hyderabad, India)
- **Founder / MD:** Koneti Mohan Reddy ("Mohan Anna") — non-technical solo founder, Telugu-English code-switching, prefers autonomous execution, expects honest verdicts with caveats.
- **CTO:** Nagarjuna Reddy — handles registrations/credentials via Bitwarden vault (credentials NEVER routed to AI team / chat / Architecture Team).
- **AI pipeline engineers:** Sheikh Sameer + Gyana ("Gnana") Rajnan
- **Reviewers:** Abishek N. (architecture clarifications C1–C4) · Krishna (DevOps)

### Working roots (multi-root project — there is no single "repo")
| Purpose | Path |
|---|---|
| App canonical source (single-file React) | `/Users/venkataswaraswamy/AI NEWS /App_v3_20260510_latest.jsx` (~1.48 MB / 20.7k lines) |
| App preview wrapper (regenerated from source) | `/Users/venkataswaraswamy/AI NEWS /preview_v3_20260510.html` |
| Clean Netlify deploy repo (also the GitHub repo) | `/Users/venkataswaraswamy/localaitv-app-repo/` |
| Architecture/planning submission kit (THIS FILE LIVES HERE) | `/Users/venkataswaraswamy/Desktop/localaitv-submission-kit/` |
| User-viewable PDF copies (pdf-viewer sandbox) | `/Users/venkataswaraswamy/Documents/` |
| Project memory file (auto-loaded next session) | `/Users/venkataswaraswamy/.claude/projects/-Users-venkataswaraswamy-Documents/memory/project_admin_dashboard_pipeline.md` |

### High-level goals of THIS session (post-compaction)
1. ✅ Verify the in-progress hover-highlight UI plan is complete in the canonical source.
2. ✅ Deploy hover update to Netlify production + browser-verify live.
3. ✅ Produce Architecture-Team RESPONSE to AI team's "Phase0_AWS_Setup_Cost_Plan1.docx" (Sameer & Gnana, 18 May).
4. ✅ Produce plain-language **Database & Storage Flow** explainer PDF for the founder's review.
5. ✅ Advise on AWS GPU-quota situation (Case 177892985400464: denied 16 May → reopened 18 May → revised 4 vCPU appeal drafted 19 May+).
6. ✅ Draft the actual AWS support-ticket reply text for the founder to paste.
7. ✅ Explain Phase 0 / 1 / 2 / 3 in plain language for the founder.
8. ✅ This file — generate `CONTEXT_SUMMARY.md`.

### Current status
- **All 8 session goals: complete.**
- **Phase 0 Validation Gate: HELD** (policy; only founder lifts it; unchanged this session).
- **One outstanding review gap:** founder forwarded TWO documents (`Phase0_AWS_Setup_Cost_Plan (1).docx` and `Abishek's C1–C4 Architecture Sign-off Answers_.pdf`) asking for review — focus shifted to the AWS quota tactical question and **those two docs were NOT yet reviewed**. See §6.

---

## 2. Decisions Made (architectural, design, technical)

### 2.1 Hover-highlight plan is complete — code endorsed; deploy + live-verify the path forward
- **Decision:** Hover handlers on all Photo / Video / Library / Record buttons across the 5 upload forms (Events, Shopping, Jobs, CarSales, Rental) are implemented in the **canonical** source (`App_v3_20260510_latest.jsx`) — NOT in the older file `2.App_v3_20260510-070141_bottomnav-all-screens-upload-button` that the plan text referenced.
- **Reasoning:** Verified by direct grep + line-by-line inspection of the canonical file (timestamps confirmed canonical is newest, May 18 10:34). Brace/paren/bracket balance check passed exactly as plan required (0 / -3 / 0). Preview HTML + repo deploy copies were already regenerated in sync (all May 18 10:35).
- **Alternative considered:** Re-edit the older file the plan named — **rejected** because that file is stale; memory & timestamps both confirm `App_v3_20260510_latest.jsx` is the working canonical source.

### 2.2 Live browser verification via DOM event dispatch — not screenshots
- **Decision:** Verify hover effects by driving the app through `preview_eval` (find button → dispatch real `mouseover/mouseout` events → read back `style.transform` / `style.boxShadow` / `style.background` before/during/after).
- **Reasoning:** Screenshot tool fails on this heavy ~1.4 MB Babel-compiled app (memory rule); ~14 s Babel compile on reload; DOM eval is reliable and gives ground-truth proof the React onMouseEnter handlers fired (not just that the code looks right).
- **Result:** All 4 buttons on the Jobs form fired & reset correctly; Rentals form independently verified (Library accent = teal `rgba(0,131,143)` — different from Jobs navy — proving per-form color differentiation renders live).

### 2.3 AWS plan from Sameer & Gnana — endorsed in design (B-1 now FULLY endorsed)
- **Decision:** Upgrade the earlier "B-1 direction-endorsed-with-DNS-risk" verdict to **B-1 fully endorsed** because the team adopted **AWS CloudFront with a Hostinger-CNAME-only** approach (no nameserver delegation) and the **stronger** OAC + private bucket pattern (no public-read).
- **Reasoning:** The original risk — that handing `localaitv.com` nameservers to Cloudflare could break the live Play Store app's API `aiservices.localaitv.com` — is now fully defused. The team chose the safer option at every fork.
- **Alternatives the team rejected (correctly):** Full nameserver delegation (Option A), subdomain-only via Cloudflare paid (Option B); they chose Option C (CloudFront) per our prior recommendation.

### 2.4 GPU quota of 8 vCPU is correct for Phase 0
- **Decision:** The AI team's quota request — `8 vCPU for "Running On-Demand G and VT instances" in ap-south-1` — is **exactly correct**. Matches `PHASE-0-RUNBOOK` item A0 word-for-word ("at least 8 to allow one running + one test instance"). Allows one `g4dn.xlarge` (4 vCPU, 1× T4) running + a second test instance, or one `g4dn.2xlarge`.
- **Reasoning:** Phase 0 is single-stream NVENC validation (gate G1). 8 vCPU is more than enough; the only blocker is AWS approval latency, not engineering.
- **Honest caveats logged:** (a) 8 vCPU is NOT enough for Phase 1 multi-channel — must pre-file a larger quota the moment Zero Testing passes; (b) brand-new accounts default to 0 here, so approval genuinely gates Part B; (c) on-demand only — Spot is a separate quota.

### 2.5 AWS quota tactical move: 8 → 4 vCPU revised appeal on the existing case
- **Decision:** Recommended the founder reply to the **existing** Case 177892985400464 (NOT open a new case / NOT file a duplicate Service Quotas request) with the revised 4 vCPU ask + ramp/KYC offer.
- **Reasoning:** Duplicate cases get merged or closed and can reset queue position. The 8→4 reduction is the single biggest lever to flip an automated denial ("from zero to one g4dn.xlarge" is the lowest possible risk profile). Mirror AWS's own "gradually ramp up activity" language back at them.
- **Alternatives considered & rejected:**
  - **Wait silently for response to 18 May reopen** — rejected: the 18 May reopen does NOT contain the reduced 4 vCPU ask; adding that *new, lower-risk information* before a human reviewer sees the case is net-positive, not noise.
  - **Open a fresh Service Quotas request** — rejected: creates duplicate, harmful to review.
  - **Multiple follow-up messages** — rejected: each customer reply re-timestamps the case and can demote it in the queue. Recommendation = ONE clean reply, then wait.

### 2.6 Plan B (alternative GPU) runs IN PARALLEL with Plan A (AWS appeal)
- **Decision:** Recommend the founder start standing up **RunPod / Lambda Labs / similar on-demand GPU** this week, regardless of AWS quota outcome.
- **Reasoning:** Phase 0 is single-stream validation, doesn't need AWS specifically. Plan B unblocks the schedule; AWS becomes the preferred long-term home once granted. Don't let a one-region quota decision block the project.
- **Concrete action:** Founder to start **real AWS CPU spend now** (general-purpose t3/m5 on the already-isolated account) — that is the actual fix for the root cause of the denial (no billing history). Doubles as part of the ramp story for AWS.

### 2.7 Wording softened on the AWS reply
- **Decision:** Removed the "hard 4-week window / broadcaster commitments / cascades into go-to-market schedule" urgency paragraph from the founder's draft.
- **Reasoning:** AWS reads heavy time-pressure as *"rushed scaling = unexpected bill risk"* — exactly the reflex the denial cited. The reply must signal **low-risk, gradual, controlled**, not urgent.
- **Alternative considered:** Keep the urgency to signal seriousness — rejected; AWS already knows the customer wants approval, urgency adds zero new signal and triggers their denial logic.

### 2.8 Two-database federation explained as "two notebooks" with `content_id` link
- **Decision:** In the founder-facing data/storage explainer, frame the architecture as **"Notebook 1 — Decisions" (Admin Supabase Mumbai)** vs **"Notebook 2 — Production" (AI Pipeline Postgres, moving to AWS RDS PG16)**, linked by a single `content_id` UUID.
- **Reasoning:** Non-technical founder needed an intuitive metaphor; "two notebooks linked by one shared ID number" maps cleanly to real ledgers / accounting concepts he understands.

### 2.9 Storage explainer reflects the AWS-corrected design, not the frozen v1.3 Cloudflare wording
- **Decision:** The data/storage flow PDF describes **AWS S3 + AWS CloudFront** as the storage/CDN truth — with an explicit "v1.3 named Cloudflare; the accepted Addendum-A refinement is AWS CloudFront" note on page 1.
- **Reasoning:** Founder is reviewing to decide; he needs **current truth**, not stale text. The frozen v1.3 file is unchanged (not edited); the refinement is recorded in Addendum A per established policy.

### 2.10 Founder-decisions deferred to v1.4 review
- **Decisions explicitly handed back to founder** (in data/storage explainer §8):
  1. Which extra folders to add (recommended: separate `advertisements/`, `public-notices/`, `rejected-archive/`, `legal-hold/`, `exports/reports/`).
  2. Retention periods (hot / archived / deep-archive durations).
  3. Admin approval structure refinements (Super / Master / Admin escalation rules).
  4. Whether to add `district`-level as a real filtering level before Phase 1.
- **Reasoning:** These are business decisions, not engineering. Architecture Team's job is to lay out clear options + recommendations; the founder picks. Decisions land in Addendum A → applied as v1.4 only after the gate is lifted.

### 2.11 Governance / hard rules — unchanged this session, restated for safety
- Phase 0 Validation Gate is **HELD**; only the founder lifts it; nobody else.
- **No edits** to `ADMIN-DASHBOARD-PLAN-v1.3.md` — accepted fixes accumulate in Addendum A only.
- **No Phase 1 / no coding past Phase 0 / no v1.4** until the gate clears.
- **Credentials boundary:** never accepted by chat / file / screen-share / AnyDesk — Bitwarden vault → CTO → Sameer/Gnana only.
- App modifications ARE allowed (separate from the gated pipeline) — founder requests them directly.

---

## 3. Files Touched This Session

### 3.1 Created (new files)
| File | Purpose |
|---|---|
| `/Users/venkataswaraswamy/Desktop/localaitv-submission-kit/RESPONSE-Phase0-AWS-Setup-Cost-v1.3.md` | Architecture-team verdict on AI team's AWS Setup/Cost Plan (B-1 fully endorsed, 8-vCPU quota correct, 5 founder questions answered, honest gaps flagged) |
| `/Users/venkataswaraswamy/Desktop/localaitv-submission-kit/RESPONSE-Phase0-AWS-Setup-Cost-v1.3.pdf` | PDF rendering of the above (333 KB) |
| `/Users/venkataswaraswamy/Desktop/localaitv-submission-kit/LOCALAITV-DATA-STORAGE-FLOW-EXPLAINED.md` | Plain-language Database + Storage Flow documentation (founder's review request — the 7-section explainer) |
| `/Users/venkataswaraswamy/Desktop/localaitv-submission-kit/LOCALAITV-DATA-STORAGE-FLOW-EXPLAINED.pdf` | PDF rendering of the above (439 KB) |
| `/Users/venkataswaraswamy/Documents/RESPONSE-Phase0-AWS-Setup-Cost-v1.3.pdf` | Copy in pdf-viewer sandbox for inline display |
| `/Users/venkataswaraswamy/Documents/LOCALAITV-DATA-STORAGE-FLOW-EXPLAINED.pdf` | Copy in pdf-viewer sandbox for inline display |
| `/tmp/pdf-phase0-aws-setup.mjs` | One-off PDF generator script (Node ESM + marked + puppeteer-core + system Chrome) for the AWS RESPONSE |
| `/tmp/pdf-data-storage-flow.mjs` | Same toolchain, for the data/storage flow PDF |
| `/tmp/RESPONSE-Phase0-AWS-Setup-Cost-v1.3.html` | Intermediate HTML used by puppeteer |
| `/tmp/LOCALAITV-DATA-STORAGE-FLOW-EXPLAINED.html` | Intermediate HTML used by puppeteer |
| `/Users/venkataswaraswamy/Desktop/localaitv-submission-kit/CONTEXT_SUMMARY.md` | **This file** |
| `/Users/venkataswaraswamy/Desktop/localaitv-submission-kit/CONTEXT_SUMMARY_2026-05-22-1048.md` | Timestamped historical copy |

### 3.2 Modified (changes to existing files)
| File | Change |
|---|---|
| `/Users/venkataswaraswamy/.claude/projects/-Users-venkataswaraswamy-Documents/memory/project_admin_dashboard_pipeline.md` | Updated section C: "Latest" pointer rolled forward from `RESPONSE-Phase0-DB-CDN-v1.3` to `RESPONSE-Phase0-AWS-Setup-Cost-v1.3` with the new verdict summary (B-1 now fully endorsed, 8-vCPU quota correct = RUNBOOK A0, honest gaps flagged). Added new RESPONSE doc to the produced-list. |
| Netlify production site `localaitv-app-preview` (site id `35f74df6-0d25-49b7-9655-509766282758`) | Deployed the staged hover-highlight update from `~/localaitv-app-repo/` to **https://localaitv-app-preview.netlify.app** (build exit 0, "Deploy is live!") |

### 3.3 NOT modified (verified intact)
| File | Why mentioned |
|---|---|
| `/Users/venkataswaraswamy/AI NEWS /App_v3_20260510_latest.jsx` | Canonical app source — **not edited this session** (hover work was already done before session start). Verified state, did not touch. |
| `/Users/venkataswaraswamy/AI NEWS /preview_v3_20260510.html` | Already in sync with source (May 18 10:35) — not regenerated this session. |
| `/Users/venkataswaraswamy/Desktop/localaitv-submission-kit/ADMIN-DASHBOARD-PLAN-v1.3.md` | **Frozen** — read-only per governance rule. |
| All other `RESPONSE-*.md/.pdf`, `PHASE-0-RUNBOOK.md/.pdf`, `FOUNDER-REQUIREMENTS.md/.pdf`, `HANDOFF.md`, etc. | Read for grounding, **not edited**. |

### 3.4 Deleted
None.

---

## 4. Code Patterns & Conventions Established / Reused

### 4.1 Hover-effect patterns on upload form buttons (canonical 3-pattern set)
Used identically across News, Birthday, Events, Shopping, Jobs, CarSales, Rental forms — only the Library accent color differs per form.

**Pattern A — red Photo / Video buttons (red gradient background):**
```js
onMouseEnter={e=>{
  if(mediaPreviews.length >= 3) return;          // disabled-state guard
  e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
  e.currentTarget.style.boxShadow='0 8px 22px rgba(208,2,27,0.6)';
  e.currentTarget.style.background='linear-gradient(160deg,#FF1A35 0%,#C8001F 100%)';
}}
onMouseLeave={e=>{
  e.currentTarget.style.transform='translateY(0) scale(1)';
  e.currentTarget.style.boxShadow='0 3px 12px rgba(208,2,27,0.35)';
  e.currentTarget.style.background='linear-gradient(160deg,#E8001E 0%,#B0001A 100%)';
}}
```

**Pattern B — Library buttons (white/dark-bg, colored border, per-form accent):**
```js
onMouseEnter={e=>{
  if(mediaPreviews.length >= 3) return;
  e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
  e.currentTarget.style.boxShadow='0 8px 22px rgba(<R,G,B>,0.4)';   // per-form
  e.currentTarget.style.background='rgba(<R,G,B>,0.06)';
}}
onMouseLeave={e=>{
  e.currentTarget.style.transform='translateY(0) scale(1)';
  e.currentTarget.style.boxShadow='none';
  e.currentTarget.style.background=T.isDark?T.bg3:'#FFFFFF';
}}
```

**Pattern C — Record pill button:**
```js
onMouseEnter={e=>{
  e.currentTarget.style.transform='translateY(-2px) scale(1.06)';
  e.currentTarget.style.boxShadow='0 6px 18px rgba(208,2,27,0.6)';
  e.currentTarget.style.background='linear-gradient(135deg,#FF1A35,#C8001F)';
}}
onMouseLeave={e=>{
  e.currentTarget.style.transform='translateY(0) scale(1)';
  e.currentTarget.style.boxShadow='0 2px 10px rgba(208,2,27,0.35)';
  e.currentTarget.style.background = recording
    ?'linear-gradient(135deg,#9A0015,#D0021B)'
    :'linear-gradient(135deg,#E8001E,#B0001A)';
}}
```

**Per-form Library accent colors (boxShadow rgba):**
| Form | Accent | RGB |
|---|---|---|
| News | red `T.red` | (208,2,27) |
| Events | orange `#E65100` | (230,81,0) |
| Shopping | brown `#b45309` | (180,83,9) |
| Jobs | navy `#1e3a8a` | (30,58,138) |
| Vehicle (CarSales) | green `#1B5E20` | (27,94,32) |
| Rentals | teal `#00838F` | (0,131,143) |

### 4.2 Storage path convention (single source of truth — used by ALL categories)
`<state>/<district>/<constituency>/<category>/<content_id>/<asset_role>.<ext>`

Concretely under bucket `localaitv-content-mumbai`:
- `ai-processed/<state>/<district>/<constituency>/<category>/<content_id>/{final.mp4, headline.mp3, thumb.jpg, meta.json}`
- `ai-processed-bulletins/<state>/<district>/<constituency>/bul_<YYYYMMDD_HHMMSS>/{final_bulletin.mp4, bulletin_manifest.json, thumbnail.jpg, segments/item_NNN.mp4, metadata.json}`
- `citizen-uploads/pending/`, `citizen-uploads/approved/`
- `admin-direct-uploads/`
- `notebooklm/{individual-news/.../, bulletins/{district,state,national}/, debates/.../}`

### 4.3 Two-database federation pattern
- **DB 1 (Supabase PG, Mumbai) — Admin/Decisions:** `users`, `content`, `content_audit_log`, `webhook_deliveries`, `notifications`. SoT for moderation/approval.
- **DB 2 (AWS RDS PG16 ap-south-1, planned) — AI Pipeline/Production:** `ai_processing_jobs`, `content_assets`, `content_collections`, `program_schedule`, `schedule_slots`, `schedule_overrides`, `channel_config`, `content_filter_counts`, `content_display_rules`, `ai_callbacks_outbox`. SoT for processing/assets/scheduling/broadcast.
- **Federation link:** `content_id` (UUID v4, Admin-generated at upload, carried in webhook payload). The ONLY shared key.
- **Three complementary tracking tables (NOT duplicates):** `webhook_deliveries` (Admin) → `ai_processing_jobs` (AI) → `ai_callbacks_outbox` (AI). End-to-end traceability.

### 4.4 PDF generation toolchain (reused every RESPONSE/explainer)
- **Node:** `~/Library/Application Support/localaitv-dev/node/bin/node` (ESM)
- **Imports:** `marked.esm.js` + `puppeteer-core` from `~/Desktop/localaitv-submission-kit/capacitor-project/node_modules/`
- **Chrome:** `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (system)
- **Write a FRESH `.mjs` each time** (sed breaks on `&` and apostrophes — keep the title string apostrophe/ampersand-free)
- **CSS:** A4, red `#D0021B` h1, navy `#0B1020`/`#1A2540` table headers, code block left-border `#1A2540`
- **Margins:** 14mm/16mm/18mm/16mm A4, footer `Page X / Y` + title
- **Headless:** `'new'` mode, `--no-sandbox`, `--font-render-hinting=none`

### 4.5 Live verification convention
- **Don't trust screenshots on the heavy app** — Babel inline script >500KB takes ~14 s to compile.
- **Use `mcp__Claude_Preview__preview_eval`** to drive the DOM and read state.
- **For hover proof:** dispatch real `new MouseEvent('mouseover'/'mouseout', {bubbles:true, cancelable:true, view:window})` on the actual button element, snapshot `style.transform`/`boxShadow`/`background` before / during / after.
- **For React onMouseEnter:** dispatching `mouseover` is sufficient (React 18 implements onMouseEnter via mouseover with enter/leave simulation).

### 4.6 Brace/paren/bracket balance check (after manual JSX edits)
```bash
python3 -c "
s=open('App_v3_20260510_latest.jsx').read()
print('Braces:', s.count('{')-s.count('}'))
print('Parens:', s.count('(')-s.count(')'))
print('Brackets:', s.count('[')-s.count(']'))
"
# Must print: Braces: 0  Parens: -3  Brackets: 0
```
The expected `Parens: -3` is from JSX patterns (NOT a bug); it's the established invariant.

### 4.7 Preview server (Claude Preview)
- **Config name:** `localaitv-preview` (defined in `.claude/launch.json` or equivalent)
- **Port:** 8765
- **Serves:** `~/AI NEWS /` (note the trailing space — directory genuinely contains a space)
- **URL:** `http://localhost:8765/preview_v3_20260510.html`
- **serverId changes per session** — call `preview_start` with the name to get a fresh serverId.
- **Reload wait:** ~14s for Babel before DOM checks.

### 4.8 Netlify deploy command (paid Personal plan on team `newd`)
```bash
"$HOME/Library/Application Support/localaitv-dev/node/bin/netlify" \
  deploy --dir "$HOME/localaitv-app-repo" \
  --site 35f74df6-0d25-49b7-9655-509766282758 \
  --prod
```
- **Important:** use `--site <site-id>`, not `--site <name>` (name lookup returned "Not Found" historically).
- **Authentication persists** across sessions (no re-login needed).

### 4.9 PDF viewer sandbox rule
- `mcp__plugin_pdf-viewer_pdf__display_pdf` only accepts files under `/Users/venkataswaraswamy/Documents/`.
- **Convention:** generate the PDF wherever it belongs (usually submission-kit), then `cp` a copy to `~/Documents/` for viewing.

---

## 5. Problems Encountered & Solutions

### 5.1 Plan file pointed at a stale source file
- **Problem:** `/Users/venkataswaraswamy/.claude/plans/fancy-knitting-cocke.md` (the hover-plan) referenced `2.App_v3_20260510-070141_bottomnav-all-screens-upload-button` (May 12).
- **Solution:** Verified by `ls -t` that `App_v3_20260510_latest.jsx` (May 18 10:34) is newer and per-memory is the canonical file. Inspected canonical directly. **NOT TECH-DEBT** — the plan was written against the older file, but the work landed in the canonical file correctly.

### 5.2 PDF viewer sandboxed to `~/Documents`
- **Problem:** `display_pdf` returned `Local file not in allowed list: /Users/venkataswaraswamy/Desktop/localaitv-submission-kit/...`
- **Solution:** Copy the PDF to `~/Documents/` before calling `display_pdf`. Both paths now exist. **Not tech-debt; just the sandbox.**

### 5.3 Bash `for` loop math error on space-separated line-number group
- **Problem:** `for grp in "Form:18925 18976 19004 19032" ...; do lns="${grp#*:}"; for ln in $lns; do sed "$((ln-3)),...` errored `bad math expression: operator expected at '18976 19004...'`. The `$lns` interpolated literally; arithmetic expanded the entire string.
- **Solution:** Flattened to a single explicit `for ln in 18925 18976 19004 19032 ...; do` loop. **Not tech-debt; one-off command.**

### 5.4 `ls --time-style` is GNU coreutils; macOS `ls` doesn't support it
- **Problem:** `ls -la --time-style=+"%m-%d %H:%M"` failed on macOS.
- **Solution:** Use `stat -f "%Sm %N" -t "%m-%d %H:%M" "$f"` instead.

### 5.5 Deferred tools require ToolSearch before first call
- **Problem:** Tools like `TodoWrite`, `mcp__Claude_Preview__*`, `mcp__plugin_pdf-viewer_pdf__display_pdf` are listed by name in system reminders but have no schema loaded.
- **Solution:** `ToolSearch` with `query: "select:Name1,Name2,..."` loads schemas. Required before first call.

### 5.6 Babel "deoptimised >500KB" notes are NOT real errors
- **Problem:** Console error feed shows dozens of `[BABEL] Note: The code generator has deoptimised the styling of /Inline Babel script as it exceeds the max of 500KB` lines.
- **Solution:** Ignore — informational only, inherent to the in-browser Babel preview of the ~1.4 MB app. Production app will be pre-compiled (not in-browser Babel).

### 5.7 Founder's draft AWS appeal had urgency wording that would trigger AWS's denial reflex
- **Problem:** "Hard 4-week validation window before Phase 1 production launch, which is tied to broadcaster commitments. A delay here cascades into our broader go-to-market schedule."
- **Solution:** Removed the urgency paragraph entirely, replaced with quiet "low-risk gradual ramp" language mirroring AWS's own quota philosophy.

### 5.8 Founder's session-time tool reminders kept firing for `TodoWrite`
- **Problem:** Stale todos from before compaction ("Apply fix: mute=0 + key + overlay gate") kept showing in reminders.
- **Solution:** Reset the todo list at each task transition to reflect actual current work; ignored the stale reminders.

---

## 6. Open Questions / Pending Items

### 6.1 Review docs for the two forwarded files — drafts EXIST (correcting an earlier omission)
The founder forwarded these two files on 19 May; the post-compaction view of this session initially logged them as "not yet reviewed," **but RESPONSE drafts in the submission-kit prove they were addressed in a prior turn / earlier session:**
1. `/Users/venkataswaraswamy/AI NEWS /Phase0_AWS_Setup_Cost_Plan (1).docx` (v2) and `/Users/venkataswaraswamy/AI NEWS /Abishek's C1–C4 Architecture Sign-off Answers_.pdf` — covered together in **`RESPONSE-Phase0-AWS-v2-and-Abishek-C1-C4-v1.3.md/.pdf`** (created 2026-05-18 18:50).
2. The AWS GPU-quota Plan A/Plan B advisory — captured as **`RESPONSE-AWS-GPU-Quota-Strategy-PlanA-PlanB.md/.pdf`** (created 2026-05-19 07:56).

**Action for next session:** open both RESPONSE drafts under `/planning/`, re-verify they still reflect the latest state, and decide whether to (a) forward to the AI team as final, (b) update with anything that changed since 19 May, or (c) supersede them with a fresh consolidated note. Do not re-do the analysis from scratch — the drafts are the work product.

### 6.2 Phase 0 Validation Gate (HELD — unchanged)
Still-open gate blockers (none closed this session):
- ☐ Admin DB host verification (Supabase Mumbai — confirmed from Admin repo, not assumed)
- ☐ S-1 — bucket-scoped IAM policy drafted to replace `AmazonS3FullAccess`
- ☐ S-2 — S3 bucket `localaitv-content-mumbai` created in `ap-south-1`
- ☐ **GPU quota approval** (Case 177892985400464) — currently with AWS after 18 May reopen; revised 4 vCPU appeal drafted, not yet posted by founder
- ☐ C1–C4 architecture clarifications + Gnana & Abishek sign-offs (**possibly partially closed by Abishek doc above — review needed**)

### 6.3 Founder decisions deferred to v1.4 review (from data/storage explainer §8)
- ☐ Which extra folders to add: `advertisements/`, `public-notices/`, `rejected-archive/`, `legal-hold/`, `exports/reports/` — pick which.
- ☐ Retention periods: hot / archived / deep-archive durations.
- ☐ Admin approval structure refinements (Super/Master/Admin escalation rules).
- ☐ Add `district`-level as a real filtering level before Phase 1? (recommended yes).

### 6.4 Plan B (alternative GPU) not started
- **Recommendation given:** stand up RunPod / Lambda Labs / equivalent this week; start real AWS CPU spend on the isolated account now to build billing history.
- **Status:** Founder hasn't confirmed start; not blocked, ready when he is.

### 6.5 AWS Business Support upgrade
- **Recommendation given:** Upgrade before the next reply lands (faster queue, real engineer responses).
- **Status:** Not confirmed whether founder/CTO has done this.

### 6.6 AWS support ticket — revised reply
- **Status:** Polished reply text drafted and handed to founder (see §9.4).
- **Pending:** Founder to paste on the EXISTING Case 177892985400464 (not a new case). Then **wait** — no further follow-ups for ~3–5 business days minimum.

### 6.7 Live streaming architecture (RTMP fan-out) — design open
- **Status:** C1 (RTMP fan-out phase) was flagged as "Phase 1 or Phase 3 blocker?" by the AI team. Abishek's pending doc (§6.1.2) may address this.
- **Architectural note:** the Phase-0 design covers VOD/processed-media only; live multi-channel fan-out is undesigned.

### 6.8 Other architectural gaps flagged in the AWS RESPONSE (not yet addressed)
- ☐ CloudWatch alarms + log shipping (no monitoring/logging in the Phase 0 plan — gap).
- ☐ Admin Dashboard real backend (currently in-app demo only; Admin↔Supabase↔pipeline-DB unbuilt).
- ☐ Load test plan + active security tests.
- ☐ Multi-AZ RDS + tested restore drill (before Phase 1).
- ☐ Phase-1 quota pre-file plan (file the moment Zero Testing passes).

---

## 7. Environment & Setup

### 7.1 Toolchain installed (already in place — DO NOT reinstall)
- **Node ESM:** `/Users/venkataswaraswamy/Library/Application Support/localaitv-dev/node/bin/node`
- **Netlify CLI:** `/Users/venkataswaraswamy/Library/Application Support/localaitv-dev/node/bin/netlify` (logged in, persists)
- **GitHub CLI:** `gh` (device-flow OAuth, account `nagarjunak-pixel`, persists)
- **Chrome (for puppeteer):** `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **NPM modules (puppeteer-core, marked):** `~/Desktop/localaitv-submission-kit/capacitor-project/node_modules/`
- **macOS native:** `textutil` (used to extract .docx to txt)

### 7.2 Live external services (configured, do not change)
| Service | Identity / Endpoint |
|---|---|
| Netlify site | `localaitv-app-preview` (id `35f74df6-0d25-49b7-9655-509766282758`), team `newd` (balajikamireddy9@gmail.com), **paid Personal plan $9/mo** |
| Production URL | https://localaitv-app-preview.netlify.app |
| GitHub (private) | github.com/nagarjunak-pixel/localaitv-app-frontend |
| AWS account | 689186650531 (isolated, MFA on root, IAM user `localaitv-phase0` with MFA) |
| AWS region (planned) | ap-south-1 (Mumbai) for everything except ACM cert (us-east-1, required by CloudFront) |
| S3 bucket (planned) | `localaitv-content-mumbai` (NOT YET created — Phase 0 prep) |
| CDN hostname (planned) | `content.localaitv.com` (Hostinger CNAME → CloudFront, no nameserver migration) |
| AWS quota Case | **177892985400464** — open, reopened 18 May, awaiting reply with 4 vCPU revision |
| Hostinger | Authoritative DNS for `localaitv.com` (DO NOT migrate — protects live `aiservices.localaitv.com` for Play Store app) |
| Domain in live use | `aiservices.localaitv.com` (Play Store app's API base — production, untouched) |

### 7.3 Commands worth memorizing
```bash
# Regenerate preview from source (manual Python splice)
# Replace: import { useState, useEffect, useRef, useCallback, useMemo } from "react";
# With:    const { useState, useEffect, useRef, useCallback, useMemo } = React;
# And:     export default AppRoot;
# With:    ReactDOM.createRoot(document.getElementById("root")).render(<AppRoot/>);
# Wrap in the preview HTML head + <script type="text/babel">...</script></body></html>

# Sync repo copies (after preview regen)
cp "/Users/venkataswaraswamy/AI NEWS /preview_v3_20260510.html"   "$HOME/localaitv-app-repo/preview.html"
cp "/Users/venkataswaraswamy/AI NEWS /preview_v3_20260510.html"   "$HOME/localaitv-app-repo/index.html"
cp "/Users/venkataswaraswamy/AI NEWS /App_v3_20260510_latest.jsx" "$HOME/localaitv-app-repo/App.jsx"

# Deploy to Netlify prod
"$HOME/Library/Application Support/localaitv-dev/node/bin/netlify" \
  deploy --dir "$HOME/localaitv-app-repo" \
  --site 35f74df6-0d25-49b7-9655-509766282758 \
  --prod

# Brace/paren/bracket balance check (must print 0, -3, 0)
python3 -c "s=open('/Users/venkataswaraswamy/AI NEWS /App_v3_20260510_latest.jsx').read(); print('Braces:', s.count('{')-s.count('}')); print('Parens:', s.count('(')-s.count(')')); print('Brackets:', s.count('[')-s.count(']'))"

# Generate a RESPONSE PDF (write a fresh .mjs first; title MUST be apostrophe/ampersand-free)
"$HOME/Library/Application Support/localaitv-dev/node/bin/node" /tmp/<your-pdf-script>.mjs

# Read a .docx
textutil -convert txt -stdout "/path/to/file.docx" | less
```

### 7.4 People & contact (for memory; do NOT email without explicit founder approval)
- Founder: Koneti Mohan Reddy — `mohanreddy@localaitv.com` (referenced on AWS account)
- CTO: Nagarjuna Reddy
- AI engineers: Sheikh Sameer, Gyana ("Gnana") Rajnan
- Reviewers: Abishek N., Krishna (DevOps)
- Form engineer: Megan
- DB architect: Gyan

---

## 8. Next Steps (ordered, ready to resume)

### 8.1 Immediate next action (founder side)
1. **Post the revised AWS reply** (§9.4) on the existing Case **177892985400464** — single reply, no duplicate cases, no further follow-ups for 3–5 business days.
2. **Upgrade to AWS Business Support** if not already (faster queue, real engineers).
3. **Start real AWS CPU spend** on the isolated account (t3/m5 general-purpose instances doing any real work) — builds the billing history that's the root cause of the denial.
4. **Begin Plan B in parallel:** RunPod or Lambda Labs trial — Phase 0 GPU should not wait on AWS.

### 8.2 Immediate next action (Architecture Team / Claude side)
1. **Review the two pending docs** (§6.1) when the founder asks:
   - Diff `Phase0_AWS_Setup_Cost_Plan (1).docx` vs original `Phase0_AWS_Setup_Cost_Plan1.docx` and produce a brief delta RESPONSE or confirm verdict unchanged.
   - Read `Abishek's C1–C4 Architecture Sign-off Answers_.pdf` carefully and produce a RESPONSE — likely closes some §6.2 gate-blockers (C1–C4 sign-off line item).
2. **Open both PDFs in the viewer** for the founder when reviewing.

### 8.3 Resume task order if a new Claude session picks up cold
```
1. Read project memory:
   /Users/venkataswaraswamy/.claude/projects/-Users-venkataswaraswamy-Documents/memory/project_admin_dashboard_pipeline.md
2. Read this CONTEXT_SUMMARY.md (in submission-kit).
3. Check status of AWS Case 177892985400464 (founder will confirm).
4. If founder asks: review the two pending docs in §6.1.
5. Otherwise: stand by for either (a) founder's app-modification requests, or
   (b) the AI team's response/completion report following the AWS plan execution.
```

### 8.4 Things NOT to do (governance reminders)
- ❌ Do NOT edit `ADMIN-DASHBOARD-PLAN-v1.3.md` — frozen.
- ❌ Do NOT start any Phase 1 / coding-past-Phase-0 work until the founder lifts the gate.
- ❌ Do NOT accept credentials by any channel — vault → CTO → engineers only.
- ❌ Do NOT open duplicate AWS support cases.
- ❌ Do NOT change Hostinger nameservers (would break the live Play Store app).
- ❌ Do NOT promise scope or timelines on the founder's behalf — he holds all those decisions.

---

## 9. Key Snippets

### 9.1 Constituency / channel list (truth from `App_v3_20260510_latest.jsx` line 2225)
```js
const LIVE_CHANNELS = [
  // AP — 5 live channels
  { id:'kur', name:'కర్నూలు',   nameEn:'Kurnool',    code:'KTV', state:'AP' },
  { id:'gun', name:'గుంటూరు',   nameEn:'Guntur',     code:'GTV', state:'AP' },
  { id:'nel', name:'నెల్లూరు',  nameEn:'Nellore',    code:'NET', state:'AP' },
  { id:'kak', name:'కాకినాడ',   nameEn:'Kakinada',   code:'KKD', state:'AP' },
  { id:'tpt', name:'తిరుపతి',   nameEn:'Tirupati',   code:'TTV', state:'AP' },
  // TG — 4 live channels
  { id:'khm', name:'ఖమ్మం',     nameEn:'Khammam',    code:'KHM', state:'TG' },
  { id:'kar', name:'కరీంనగర్',  nameEn:'Karimnagar', code:'KNR', state:'TG' },
  { id:'war', name:'వరంగల్',    nameEn:'Warangal',   code:'WTV', state:'TG' },
  { id:'nal', name:'నల్గొండ',   nameEn:'Nalgonda',   code:'NLG', state:'TG' },
];
```

### 9.2 Upload categories (`UPLOAD_CATS` in app, line 11086)
```js
const UPLOAD_CATS = [
  { id:'news',       icon:'📰', label:'News',           color:'#1A237E' },
  { id:'birthdays',  icon:'🎂', label:'Birthdays',      color:'#7B1FA2' },
  { id:'marriages',  icon:'💒', label:'Marriages',      color:'#C2185B' },
  { id:'events',     icon:'🎉', label:'Events',         color:'#E65100' },
  { id:'jobs',       icon:'💼', label:'Jobs',           color:'#1565C0' },
  { id:'carsales',   icon:'🚗', label:'Car / Motorcycle',color:'#1B5E20' },
  { id:'rentals',    icon:'🏠', label:'Rentals',        color:'#00838F' },
  { id:'shopping',   icon:'🛍️', label:'Shopping',       color:'#F57F17' },
];
```

### 9.3 Phase-0 Gate definition (G1–G4) — verbatim from PHASE-0-RUNBOOK Part D
| Gate | Pass criterion |
|---|---|
| **G1 — Encoding latency** | Bulletin build < 2 min (target ~90s) vs. ~15 min baseline |
| **G2 — S3 upload reliability** | 100% of test builds land at the correct `s3://localaitv-content-mumbai/ai-processed/...` key |
| **G3 — CDN delivery** | Same media fetchable via `https://content.localaitv.com/ai-processed/...` (not the S3-direct URL) |
| **G4 — End-to-end availability** | Media playable through the CDN within the build cycle, no manual steps |

### 9.4 The AWS support ticket reply text (ready to paste — see chat for full context)
**Subject:** `Re: Case 177892985400464 — Quota Increase (EC2 G/VT, ap-south-1): Revised Lower Ask + Justification`

Body — six numbered sections:
1. Revised lower ask (8 → 4 vCPU, single g4dn.xlarge, minimum footprint, "gradual ramp" language mirroring AWS)
2. Company legitimacy (LocalAI Media Network Pvt Ltd, CIN U63910KA2025PTC212593, Hyderabad, founder Mohan Reddy, AWS account 689186650531)
3. Workload & technical fit (PyTorch/TensorFlow inference on short video segments; why g4dn T4 INT8/FP16; why ap-south-1 = co-located with S3/RDS/IAM)
4. Cost controls in place (Budgets alert $364.70/mo, isolated account, project=phase0 tag, MFA on root, vault, least-privilege IAM, verified payment method)
5. Willingness to validate before scaling (CPU first, ramp on history, KYC docs ready, verification call available)
6. Closing courtesy

**Critical changes from founder's draft:**
- Removed urgency paragraph ("hard 4-week window / broadcaster commitments / cascades into go-to-market")
- Mirrored AWS's own "gradual ramp / consumption history" language
- Tightened to scannable structure

Full text was rendered in the chat reply — recreate from chat transcript if needed.

### 9.5 Phase plain-language summary (founder-facing — for re-explaining)
| Phase | One-line | Definition of "done" |
|---|---|---|
| **Phase 0** | Prove the kitchen works | G1–G4 all pass on a single end-to-end test run on AWS |
| **Phase 1** | Open the restaurant for real customers | The 9 channels actually run through the new pipeline; admin backend live; real moderation flow on |
| **Phase 2** | Open more branches | Scale to many districts/constituencies (architecture supports ~3,000); Multi-AZ DB, full lifecycle tiering, monitoring at scale |
| **Phase 3** | Add advanced services | Live RTMP fan-out, national bulletins, signed/paid content, Lambda@Edge, cross-region DR |

### 9.6 Hover verification one-liner (re-runnable)
After deploy, in `preview_eval` against `localaitv-preview`:
```js
(function(){
  function findBtn(rx){ var b=[...document.querySelectorAll('button')]; for(var i=0;i<b.length;i++){ if(rx.test((b[i].innerText||'').trim())) return b[i]; } return null; }
  function fire(el,type){ el.dispatchEvent(new MouseEvent(type,{bubbles:true,cancelable:true,view:window})); }
  function snap(el){ return {transform:el.style.transform||'(none)', boxShadow:(el.style.boxShadow||'(none)').slice(0,46), bg:(el.style.background||el.style.backgroundColor||'(none)').slice(0,46)}; }
  var targets={ Photo:/^Photo/, Video:/^Video/, Library:/^Library/, Record:/రికార్డ్|Record/ };
  var out={};
  for(var k in targets){ var el=findBtn(targets[k]); if(!el){ out[k]='NOT FOUND'; continue; }
    var before=snap(el); fire(el,'mouseover'); fire(el,'mouseenter'); var hover=snap(el); fire(el,'mouseout'); fire(el,'mouseleave'); var after=snap(el);
    out[k]={before:before, hover:hover, after:after};
  }
  return out;
})()
```

### 9.7 Memory file (top-of-mind index — read first in any new session)
File: `/Users/venkataswaraswamy/.claude/projects/-Users-venkataswaraswamy-Documents/memory/MEMORY.md`
Points at:
- `project_localaitv.md` — app project (OLD; placeholder/historical)
- `user_role.md` — founder working style
- `reference_external_systems.md` — GitHub, Netlify, Play Console, 2Factor.in, iCloud
- `project_admin_dashboard_pipeline.md` — **THE one to read** — full canonical state for app + planning + gate + latest RESPONSE

---

## Closing rule

This file is **session memory**, not a plan. Do not edit it as a plan. Generate a new timestamped copy when material changes happen, so history is preserved.

*Documentation only · No execution · Phase-0 gate remains held · Standing rule: no credentials to AI team / Architecture Team / chat — Bitwarden vault only.*

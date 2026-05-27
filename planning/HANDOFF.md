# LocalAI TV — Project Handoff (paste this as the FIRST message in Claude Code on the new machine)

> Paste this entire file as your first message to Claude Code on the Windows computer. It restores full project context even though the old chat does not transfer.

---

## ⚠️ STOP — READ FIRST (governance rules — do not violate)

1. **Plan v1.3 is FROZEN.** Do not edit `ADMIN-DASHBOARD-PLAN-v1.3.md`. All accepted corrections accumulate in an **"Addendum A"** list (currently items 1–14) and are applied in ONE pass as v1.4 **only after the Phase 0 Validation Gate clears.**
2. **Phase 0 Validation Gate is policy.** No Phase 1 work, no coding, no v1.4, until: (a) scope frozen, (b) Phase 0 proven on AWS with measured numbers G1–G4, AND (c) the **Founder explicitly says "start."**
3. **Never accept credentials.** No passwords/API keys/access keys to the AI assistant by any channel (chat, file, screen-share, AnyDesk). The AI assistant only ever receives **non-secret status text**. Secrets live in the team vault among Founder + Sameer + Gnana only.
4. **Founder identity:** Koneti Mohan Reddy (founder, non-technical). Email localaitv@gmail.com. Do not revert to older names from git history.
5. **Nothing is implemented in this planning track.** It is a paperwork/planning phase. Outputs are documents (RESPONSE-*.md/.pdf), not code changes — until the gate lifts.

## How to start this session

- The persistent memory files were copied to this machine — read `MEMORY.md` and the files it points to first.
- This is a planning/review workstream. Each engineer submits a review doc → you produce an architecture-team `RESPONSE-*.md` + PDF → founder circulates → engineers recheck.
- Confirm you've read this handoff, then wait for the founder's next input. Do not take action on the gated items.

## Project context

LocalAI TV — hyperlocal Telugu news platform (AP/TG → pan-India). Two parallel tracks:
- **(A) The React app** (separate): single-file React app in `AI NEWS/App_v3_20260510_latest.jsx`, previewed via `preview_v3_20260510.html`. An in-app Admin Dashboard *demo* (Profile → 🛡️ Admin Dashboard, role switcher Super/Master/Admin, 15 modules) was built and is pending founder walkthrough.
- **(B) Admin Dashboard + AI Pipeline plan** (this track): `Desktop/localaitv-submission-kit/ADMIN-DASHBOARD-PLAN-v1.3.md`. Two-DB federation (Admin Supabase ↔ AI pipeline Postgres, linked by `content_id`); AI pipeline = FastAPI/Celery/RabbitMQ/Redis migrating Hostinger VPS → AWS EC2 g4dn.xlarge GPU (ap-south-1 Mumbai); AWS S3 + Cloudflare CDN. Scale: 9 → 300 → 3,000 channels.

## People

- **Founder:** Koneti Mohan Reddy (non-technical; wants honest "is this technically sound?" verdicts; discusses before acting).
- **Nagarjuna Reddy:** CTO / head of technical teams; handles credentials/registration (via vault, never to AI).
- **Sheikh Sameer + Gnana Rajnan:** AI pipeline engineers (trusted, ~4 months, strong). Sameer holds team credentials.
- **Gyan:** earlier AI Pipeline DB-spec author.
- **Abishek N. + Krishna:** independent reviewers (DevOps). Reviews contain real issues but fixes can be generic/AI-assisted — filter against the decision trail before acting.

## Current state (as of 16 May 2026)

- **Phase 0 Validation Gate:** held. Pre-gate prep (PHASE-0-RUNBOOK Part A: AWS GPU quota A0, non-secret confirmations A1, vault A2, guard-rails A3) handed to Sameer & Gnana — awaiting their A1 status reply.
- **Founder decision recorded:** NotebookLM = **manual workflow, accepted** (no automated pull).
- **Open / pending:** AI team to answer architecture-review clarifications **C1–C4** (esp. C1: is RTMP fan-out a Phase 1 or Phase 3 blocker); Gnana + Abishek sign-offs; Krishna's 3 adopted items (#3 Supabase tier, #4 DB lifecycle process, #7 CI/CD) recorded as Addendum A items 12–14.
- **v1.3 itself: unchanged.** Phase 3 economics (CDN ~25× under, GPU ~2× under, RTMP fleet uncosted, YouTube quota hard blocker) acknowledged as provisional → re-baseline after Phase 1.

## Documents produced (in `Desktop/localaitv-submission-kit/`)

`ADMIN-DASHBOARD-PLAN-v1.3.md/.pdf` (frozen) · `RESPONSE-Sameer-v2` · `RESPONSE-Gyan-DB-Spec` · `RESPONSE-Gap-Analysis-v1.3` · `RESPONSE-Production-Clarifications-v1.3` · `RESPONSE-Abishek-Recommendations-v1.3` · `RESPONSE-Architecture-Review-v1.3` · `RESPONSE-Krishna-Clarifications-v1.3` · `PHASE-0-RUNBOOK` · `PHASE-0-PREP-SCOPE-FOR-SAMEER-GNANA` · `FOUNDER-REQUIREMENTS` (each as .md + .pdf).

## Conventions

- **PDF toolchain:** Node ESM script using `marked.esm.js` + `puppeteer-core` from `localaitv-submission-kit/capacitor-project/node_modules/` + system Chrome. CSS: red #D0021B headers, navy table headers, A4, page footers. **On Windows:** Chrome path differs (`C:\Program Files\Google\Chrome\Application\chrome.exe`); reinstall node_modules; avoid apostrophes/ampersands in the JS `title:` string.
- **Memory:** persistent files under `~/.claude/projects/<cwd>/memory/` — keep updated.
- **The app folder name has a trailing space:** `AI NEWS ` — quote it in every command.
- Engineer reviews keep converging on the same core issues → architecture is sound; gaps are correctly known.

## Windows-specific setup (do this on the new machine)

- **Reinstall the toolchain** — Mac binaries under `~/Library/Application Support/localaitv-dev/` (Node, JDK, gh, Android SDK) are macOS-only. Install Windows Node.js, JDK, etc. fresh.
- **The auto-backup hook** (`~/.claude/auto-backup-localaitv.sh`) is a Mac bash script with hardcoded `/Users/...` paths — it will NOT run on Windows. Rewrite as a Windows-compatible hook (PowerShell/`.cmd`) with Windows paths before relying on it, or back up snapshots manually.
- **Preview server:** `.claude/launch.json` points at a macOS path — update it to the Windows project path.
- Verify the project file count matches the Mac (see the transfer checklist the founder has).

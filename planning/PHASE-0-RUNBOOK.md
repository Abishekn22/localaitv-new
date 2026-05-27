# Phase 0 — Execution Runbook & Pre-Gate Prep
## LocalAI TV · v1.3-aligned · Prep While the Validation Gate Is Held

**To:** Sheikh Sameer & Gnana Rajnan (execution) · Nagarjuna Reddy (CTO) · Koneti Mohan Reddy (Founder)
**From:** LocalAI TV Architecture Team
**Date:** 16 May 2026
**Status:** 🟡 **PREP DOCUMENT — execution is GATED.** The Validation Gate is intentionally held. Only **Part A (pre-gate prep)** is actionable now. **Part B (execution) starts only when the Founder explicitly lifts the gate.**

> **Rule (unchanged):** No EC2 launch, no pipeline change, no Phase 1, no coding past Phase 0 until the Founder says "start." This runbook is written *now* so that the moment the gate lifts, Sameer & Gnana execute Part B with zero scramble. Nothing in Part B is to be run before that.

---

## Part A — Pre-Gate Action Items (DO NOW, in parallel — no gate crossed)

These four items involve **no pipeline change and no Phase 0 execution.** They are pure readiness and remove start-day delays.

### A0 — Request the AWS GPU quota increase (highest lead-time item — do first)

AWS blocks GPU instances by default. The account almost certainly has a **0 limit** for the instance family Phase 0 needs.

- **Where:** AWS Console → **Service Quotas** → **Amazon EC2** → search **"Running On-Demand G and VT instances"** → Request quota increase.
- **Region:** **Asia Pacific (Mumbai) `ap-south-1`** (must match — quotas are per-region).
- **Request:** enough vCPUs for **g4dn.xlarge** (4 vCPUs). Request **at least 8** to allow one running + one test instance.
- **Lead time:** AWS approval typically **1–2 business days.** This is the single biggest risk to a fast Phase 0 start — **submit today.**
- **Owner:** Nagarjuna / DevOps. **No cost** to request.
- ☐ Submitted ☐ Approved (record date)

### A1 — Send the 3 non-secret readiness confirmations

Plain text to the Architecture Team — **descriptions only, no passwords/keys.** Lets us verify Phase-0 readiness and flag gaps now.

| Item | Confirm |
|---|---|
| AWS | Account ready? Region `ap-south-1` (Mumbai)? Same account as live channels (Y/N)? GPU quota (A0) requested? |
| Postgres | Version 15? Running where (Hostinger VPS / other)? Reachable from where the pipeline runs? |
| Domain / DNS | `localaitv.com` DNS managed at which registrar? Is `content.localaitv.com` free to point at the CDN? |
| VPS | Hostinger — which OS/version? Pipeline currently runs here? |

- **Owner:** Nagarjuna. ☐ Sent

### A2 — Stage credentials in the shared vault (NOT to the Architecture Team / not in chat)

- Create the shared vault (Bitwarden free is fine) → invite **only Sameer & Gnana**.
- Put in: AWS IAM access key (least-privilege, see A3), VPS SSH, Postgres connection string.
- **Never** send these to this assistant, chat, email, or WhatsApp.
- **Owner:** Founder / Nagarjuna. ☐ Vault ready ☐ Sameer & Gnana invited

### A3 — Guard-rails on the existing AWS account (since it also runs live channels)

So Phase 0 testing **cannot touch the live service:**

- ☐ **Dedicated IAM user** for Sameer/Gnana — least privilege: only the Phase 0 S3 bucket + launch/stop the Phase 0 EC2 instance. **Not** root, **not** full access.
- ☐ **Separate S3 bucket** `localaitv-content-mumbai` (distinct from any live-channel bucket).
- ☐ **Billing budget alert** (e.g. ₹35,000/mo) so test spend is visible & isolated.
- ☐ **Tag** every Phase 0 resource `project=phase0` so it's never confused with live resources.
- **Owner:** Nagarjuna / DevOps.

> **Part A creates nothing in production and crosses no gate.** It is the correct use of the hold period.

---

## Part B — Phase 0 Execution Runbook (RUN ONLY AFTER THE FOUNDER LIFTS THE GATE)

**Scope:** Two parallel tasks, run against the **existing Gupshup / direct-API flow**. **No webhook. No Admin Dashboard. No pipeline logic change** except one FFmpeg flag.

| Step | Action | Owner |
|---|---|---|
| B1 | Launch **EC2 g4dn.xlarge** in `ap-south-1`, tagged `project=phase0` | Gnana |
| B2 | Install: **CUDA 12.x + NVIDIA driver 535+ + FFmpeg built with `--enable-nvenc` + Python 3.11** | Gnana |
| B3 | `git clone` the existing pipeline code — **no code changes** | Gnana |
| B4 | Apply the **single** FFmpeg flag change (Part C) — nothing else in build logic | Gnana |
| B5 | Verify **S3 read/write** from the EC2 instance to `localaitv-content-mumbai` | Sameer |
| B6 | Wire `s3_storage.py` upload into `run_planner_task` **after** `build_bulletin_video()` succeeds (one post-success call — touch nothing else) | Sameer |
| B7 | Run **one full bulletin** end-to-end through the existing flow | Sameer + Gnana |
| B8 | Record **G1–G4** numbers in Part D; hand the filled table to the Founder | Sameer + Gnana |

> If any Phase 0 task starts needing a webhook, HMAC, or the Admin Dashboard — **stop**: it is mis-scoped. Phase 0 has no upstream dependency.

---

## Part C — Config Templates (no secrets — real values come from the vault)

**The ONLY pipeline change in Phase 0** (FFmpeg encoder swap):

```diff
# In the FFmpeg command(s):
- -c:v libx264 -preset fast
+ -c:v h264_nvenc -preset p4 -tune hq
```

**Environment template** (`.env` — placeholders only; real values from the vault):

```bash
AWS_REGION=ap-south-1
S3_BUCKET=localaitv-content-mumbai
S3_PUBLIC_CDN_BASE_URL=https://content.localaitv.com
AWS_ACCESS_KEY_ID=<from vault>
AWS_SECRET_ACCESS_KEY=<from vault>
# Output key convention:
# ai-processed/<state>/<district>/<constituency>/<category>/<content_id>/<asset_role>.<ext>
```

No HMAC secret / callback token in Phase 0 — those are Phase 1 (webhook), which is gated.

---

## Part D — Gate Results Capture (Sameer & Gnana fill this; Founder reviews to decide pass/fail)

| Criterion | Target | Measured | Pass? |
|---|---|---|---|
| **G1 — Encoding latency** | Bulletin build < 2 min (target ~90 s) vs. ~15 min baseline | Baseline: ____ · NVENC: ____ | ☐ |
| **G2 — S3 upload reliability** | 100% of test builds land at the correct `s3://localaitv-content-mumbai/ai-processed/...` key | ____ / ____ builds | ☐ |
| **G3 — CDN delivery** | Same media fetchable via `https://content.localaitv.com/ai-processed/...` (not the S3-direct URL) | ____ | ☐ |
| **G4 — End-to-end availability** | Media playable through the CDN within the build cycle, no manual steps | ____ | ☐ |

**Gate verdict:** ☐ PASS (all four) → Founder reviews → Founder says "start" → Phase 1 unlocks · ☐ FAIL → fix & re-test, stay in Phase 0.

---

## Part E — What "Gate Cleared" Unlocks (for awareness — not now)

Only after G1–G4 pass **and** the Founder explicitly says "start":
- Scope freeze locked (Gnana + Abishek sign-offs in)
- Plan **v1.4** issued in one pass (Addendum A items 1–11)
- Phase 1 build begins (Admin Dashboard + webhook adapter)

Until then: **gate held, Part A only.**

---

### Sign-off

| Party | Action | Status |
|---|---|---|
| Nagarjuna (CTO) | Run Part A (A0 quota, A1 confirmations, A2 vault, A3 guard-rails) | ☐ |
| Sameer & Gnana | Stand by for Part B; review runbook, flag issues | ☐ |
| Founder — Koneti Mohan Reddy | Lifts the gate when scope frozen + ready | ☐ |

**LocalAI TV Architecture Team** · LocalAI Media Network Pvt Ltd · CIN: U63910KA2025PTC212593 · Hyderabad, India

*Prep only. Part B does not run until the Founder lifts the gate. Plan v1.3 unchanged.*

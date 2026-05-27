# Response to the Phase 0 AWS Setup, Cost Estimate & Execution Plan
## LocalAI TV · Architecture Verdict + Founder Status Review · 18 May 2026

**To:** Sheikh Sameer & Gyana Rajnan (AI Pipeline Engineers) · cc Nagarjuna Reddy (CTO)
**For the Founder:** Koneti Mohan Reddy (Managing Director)
**From:** LocalAI TV Architecture Team
**Re:** (1) verdict on the AWS Setup/Cost Plan, (2) GPU-quota readiness, (3) the Founder's 5 questions, (4) what is still missing before Zero Testing and Phase 1
**Status:** 🟡 **Gate remains HELD.** The plan is sound and approved *in design*. Execution still waits on the GPU quota approval, the still-open items, and the Founder's explicit gate-lift after re-verification.

---

## TL;DR — plain language for the Founder

**The AWS plan from Sameer & Gnana is good, careful, and technically correct.** They took the safer option at every fork:

- The earlier dangerous DNS idea (handing the whole domain to Cloudflare, which could have broken your live Play Store app) is **gone**. They are now using **AWS CloudFront with a single Hostinger CNAME** — your live app on `aiservices.localaitv.com` is **not touched**. This was the one critical risk in the last round; it is now fully defused.
- The database move (Google Cloud → AWS, PostgreSQL 16) and the storage/CDN design are correct, with a 7-day rollback safety net.
- The cost is small and realistic: **~$20/month** for storage + CDN + database. The GPU machine is the real cost and is correctly tracked separately and **gated**.

**On the GPU quota (your headline concern):** the team requested **8 vCPU for "Running On-Demand G and VT instances" in Mumbai**. This is **exactly the right request** — it is precisely what our runbook (item A0) told them to ask for. It is enough for Zero Testing. The only problem is **AWS has not approved it yet** — that is an AWS-side wait, not a mistake by the team. Escalating the support case is the correct action; there is nothing more to "fix" on our side for the quota itself.

**Where we actually are:** we are at the **pre-Zero-Testing** stage. We are **not** close to Phase 1 yet — and that is correct and safe. Your sequence (Zero Testing → Internal Validation → Controlled Rollout → Phase 1) is the right one. Today we are still *before* step 1, waiting on (a) the AWS quota approval and (b) the remaining sign-off items. **Good news:** almost all of the setup work (database, storage, CDN) can be done *in parallel while waiting for AWS* — so the wait is not wasted time.

**This does not lift the gate.** Nothing is executed until you say "start," after the Architecture Team re-verifies the completed work.

---

## 1. Verdict on the AWS Setup & Cost Plan — ✅ Endorsed in design (with minor refinements)

The document correctly implements all three Architecture-Team decisions from the 18 May DB/CDN verdict:

| Item | Plan's choice | Verdict |
|---|---|---|
| **B-1 — CDN** | AWS CloudFront + S3, `content.localaitv.com` as a **Hostinger CNAME only**, nameservers untouched, **private bucket + OAC** | ✅ **Now FULLY endorsed.** The critical DNS production-risk is defused. They also took the *stronger* security option (private bucket + Origin Access Control) instead of public-read — better than the minimum we asked for. |
| **B-2 — Database** | Migrate `newsai_db` GCP Cloud SQL → AWS **RDS PostgreSQL 16**, `ap-south-1`, private SG, 7-day GCP read-only fallback | ✅ Endorsed. Co-located, disciplined cutover, tested rollback. |
| **B-3 — Version** | **PostgreSQL 16** + `pg_cron` via custom parameter group + reboot | ✅ Endorsed. Conservative, correct. |

**Technical claims I checked and confirm are accurate:**
- ACM certificate **must be in `us-east-1`** for CloudFront — correct and non-negotiable; good that they called it out.
- **S3 → CloudFront origin transfer is free**, and the **CloudFront 1 TB / 10M-request perpetual free tier** — both accurate as of current AWS pricing.
- S3 **Block Public Access ON + OAC, CloudFront principal only** — this is the correct secure pattern and supersedes the earlier public-read idea. Approved.
- Single-AZ RDS for Phase 0, Multi-AZ before Phase 1 — correct staging.
- Region lock `ap-south-1` (ACM the only `us-east-1` exception) — correct.
- ~$20/month estimate (excl. EC2 GPU) — realistic and consistent with official pricing.

**Minor refinements (NOT blockers — apply during execution, record in the completion report):**
1. **RDS size:** start Phase 0 on **`db.t4g.small` (2 GB RAM)**, not `t4g.micro` (1 GB). Restoring `newsai_db` plus `pgvector` + `pg_cron` on 1 GB risks an out-of-memory failure *during validation itself*. The cost difference (~$13/month) is trivial against the risk of a stalled gate. Keep `micro` only if the restored dataset is confirmed tiny.
2. **GPU instance must not run 24×7 in Phase 0.** The g4dn is the dominant cost. For Zero Testing, **start it for a test run, then STOP it** between runs. Left running 24×7, a g4dn.xlarge in Mumbai is roughly ₹30–35k/month; start/stop keeps Phase 0 GPU cost to a fraction of that. Make this an explicit runbook line.
3. **Add earlier billing alerts.** The single alert at $364.70 is fine as a ceiling, but add **$50 and $150 tiers** plus an AWS Budgets monthly budget, so an overage is caught early, not near the cap.
4. **Confirm the instance type is `g4dn.xlarge`** (4 vCPU, 1× T4, NVENC-capable) for Phase 0 — cheapest NVENC option and fits the 8-vCPU quota with headroom (see §2).

---

## 2. GPU Quota Readiness — the Founder's headline question · ✅ Request is correct; approval is the only blocker

**The request — "8 vCPU, Running On-Demand G and VT instances, `ap-south-1` (Mumbai)" — is exactly correct.** It matches `PHASE-0-RUNBOOK` item A0 word-for-word ("request at least 8 to allow one running + one test instance"). Specifically, 8 vCPU allows:
- **one `g4dn.xlarge` (4 vCPU, 1× NVIDIA T4)** running **plus a second 4-vCPU test instance**, or
- **one `g4dn.2xlarge` (8 vCPU, 1× T4)**.

Either is **more than enough for Zero Testing**, which is single-stream NVENC transcode validation (gate **G1**: bulletin build < 2 min vs ~15 min baseline). **No sizing change is needed for Phase 0.**

**Honest caveats — please note these now so there are no surprises later:**

1. **This 8-vCPU quota is a Phase-0 quota, not a Phase-1 quota.** Phase 1 = many constituencies / concurrent channels = many GPU vCPUs. A **much larger quota increase will be needed before Phase 1**, and AWS GPU-quota approvals have **long, unpredictable lead times**. Recommendation: the moment Zero Testing passes, **immediately file the Phase-1 quota request** (with the projected channel count) so the approval runs in the background during Internal Validation/Controlled Rollout instead of blocking the launch.
2. **Brand-new AWS accounts default to 0 here**, so this approval *genuinely* blocks Part B execution. The team escalating Case 177892985400464 is the correct and only action — there is no engineering fix on our side; it is an AWS support timeline.
3. **"On-Demand" quota only.** If Spot instances are used later for cost savings, that is a *separate* quota ("All G and VT Spot Instance Requests"). Not needed for Phase 0; flag it for Phase-1 cost planning.
4. **The quota wait does not block anything else.** RDS provisioning, the GCP→RDS migration rehearsal, S3 bucket creation, CloudFront + ACM + OAC, IAM, DNS CNAME staging — **none of these need the GPU**. They should all proceed in parallel now (as pre-gate prep), so that the day the quota lands, only the GPU steps remain.

**Verdict:** GPU-quota readiness is **correct and on the right track**. Status = *waiting on AWS*, not *blocked by an error*.

---

## 3. The Founder's 5 Questions — direct answers

### Q1. What additional requirements are needed from your side (Founder)?
- **Decision authority only at the end:** you lift the gate **after** the Architecture Team re-verifies the completed work — not before.
- **Approvals the team is waiting on you/CTO for:** region lock (`ap-south-1`) confirmed final; RDS size confirmed (we recommend `t4g.small`); OAC private-bucket pattern confirmed; a **maintenance window** approved for the GCP→RDS cutover (live channels currently use GCP).
- **CTO action (Nagarjuna):** route all credentials **only through the Bitwarden vault** — never to the AI team in chat, never to the Architecture Team, never by screen-share/AnyDesk. (This rule is firm and unchanged.)
- **Access for verification:** give the Architecture Team read access to the **Admin Dashboard repo** so the Supabase-Mumbai host can be positively confirmed (currently an assumption).

### Q2. What technical updates must the AI team complete before Zero Testing?
Close every item in the plan's §9 plus the runbook's Part A:
1. **Admin DB verified** from the Admin repo (Supabase Mumbai — confirmed, not assumed).
2. **S-2:** S3 bucket `localaitv-content-mumbai` created in `ap-south-1`.
3. **S-1:** bucket-scoped IAM policy drafted to replace `AmazonS3FullAccess` (apply before Phase 1; document now).
4. **C1–C4 answered** + **Gnana & Abishek sign-offs** (RTMP fan-out phase, Phase-1 CloudFront cost, ABR ladder vs GPU budget, pg_boss at scale).
5. **Pre-gate build done in parallel:** RDS provisioned + pg_cron parameter group, S3 + CloudFront + ACM + OAC configured, GCP→RDS migration **rehearsed** (dump/restore + row-count/checksum) — *staged, not cut over*.
6. **GPU quota approval** (Case 177892985400464) confirmed.
> Note: completing 1–6 is *prep*. Actually running the pipeline on the GPU (Part B / G1–G4) still only happens **after the Founder lifts the gate**.

### Q3. Are there missing infrastructure / deployment / streaming / API / scalability preparations?
**Yes — and this is important to state honestly.** This plan is excellent for what it covers (storage + CDN + database), but it deliberately does **not** cover several things that are needed before Phase 1:
- **Live streaming architecture is not yet specified.** This document is the **VOD / processed-media** path (pipeline → S3 → CloudFront). **Live multi-channel streaming and RTMP fan-out (C1) is still an open question**, not a designed system. Zero Testing only validates single-stream NVENC encoding — it does **not** validate live fan-out.
- **The API layer is out of scope here.** `aiservices.localaitv.com` (your live app's API) has no scaling/capacity plan in this doc. It is correctly left untouched for Phase 0, but a Phase-1 API scaling + RDS-connection plan is still owed.
- **Monitoring & logging is a real gap.** The plan has *billing* alerts only — there is **no CloudWatch metrics/alarms/dashboard and no log aggregation**. You cannot properly judge G1–G4 or catch a pipeline failure without this. A minimal observability setup must be added to Zero Testing (see §5).
- **Admin Dashboard backend is not wired.** Today it is an **in-app demo with no backend**. The real Admin ↔ Supabase ↔ pipeline-DB federation is unbuilt and untested — a separate Phase-1 workstream.
- **Load and security *testing* is not planned.** The plan has good security *checks* (IAM/MFA, private SG, Block Public Access, OAC) — but no test that *proves* the DB is unreachable from the internet, the bucket is not publicly listable, and the CDN serves only intended paths; and no load test of the pipeline/CDN. Lightweight for Phase 0; required before Phase 1.
- **Phase-1 DB HA / right-sizing** (Multi-AZ, read replica, instance class under real load) — correctly deferred, but on the Phase-1 list.

### Q4. What validations/testing must be completed before Phase 1?
Map onto your own sequence:
- **Zero Testing — gates G1–G4 must all PASS:**
  - **G1 Encoding latency:** a bulletin builds in **< 2 min** (target ~90s) vs the ~15-min baseline, using GPU NVENC.
  - **G2 S3 reliability:** 100% of test builds land at the correct `s3://localaitv-content-mumbai/ai-processed/...` key.
  - **G3 CDN delivery:** the same media is fetchable via `https://content.localaitv.com/ai-processed/...` (through the CDN, not the S3-direct URL).
  - **G4 End-to-end:** media is playable through the CDN within the build cycle with **no manual steps**.
- **Internal Validation:** post-cutover **live-channel check** (the 9 channels still work after the DB move), DNS/CDN cache-hit proof, RDS smoke test, and a **tested rollback drill** (repoint to GCP).
- **Controlled Rollout:** enable for **one constituency / small %** first, with monitoring live, before widening.
- **Then Phase 1**, only after the above pass and you say "start."

### Q5. Recommendations by area
| Area | Recommendation |
|---|---|
| **AWS infrastructure** | Plan endorsed. Apply the §1 refinements: `t4g.small` for Phase 0, start/stop the GPU, tiered billing alerts, confirm `g4dn.xlarge`. Do all non-GPU prep now in parallel. |
| **GPU quota readiness** | 8 vCPU request is correct for Phase 0. Keep the case escalated. **Pre-file the larger Phase-1 quota the moment Zero Testing passes** (long AWS lead time). |
| **Streaming architecture** | Out of scope of this doc and **not yet designed for live**. Resolve **C1 (RTMP fan-out)** and the live ingest→transcode→package→deliver path as a separate Phase-1 design before any production streaming. Zero Testing validates VOD encoding only. |
| **Database stability** | Endorsed. `t4g.small` Phase 0; **Multi-AZ + PITR + a tested restore drill before Phase 1**; keep GCP read-only 7 days; final snapshot before decommission. |
| **Front-end & admin testing** | App is being reviewed page-by-page (separate, on track). **Admin Dashboard real backend is unbuilt** — schedule Admin↔Supabase↔pipeline-DB integration + testing as an explicit Phase-1 workstream. |
| **Security & load testing** | Security *design* is good. Add **active tests**: confirm RDS not internet-reachable, bucket not public/listable, CDN path-scoped; add a controlled pipeline/CDN load test before Phase 1. |
| **Monitoring & logging** | **Add now (Zero-Testing gap):** CloudWatch alarms for RDS CPU/memory/connections, EC2 GPU utilization, S3 4xx/5xx, CloudFront error-rate + cache-hit ratio, and pipeline job success/fail count + duration; ship pipeline logs to CloudWatch Logs. Without this, G1–G4 results are not trustworthy and failures are invisible. |

---

## 4. Where We Actually Are — status vs. the Founder's roadmap

```
   Founder's sequence:  Zero Testing → Internal Validation → Controlled Rollout → Phase 1
                              ▲
   WE ARE HERE  ──────────────┘  (pre-Zero-Testing)
   Blocked by:  (a) AWS GPU quota approval  [waiting on AWS]
                (b) Gate HELD pending §9 open items + re-verification
   Not blocked: all non-GPU setup (RDS / S3 / CloudFront / ACM / OAC / migration rehearsal)
                — do this in parallel NOW so launch day is GPU-only.
```

We are **not near Phase 1** — and that is the correct, safe position. The plan reflects this honestly; please do not be pressured (by timelines or by anyone) into lifting the gate before G1–G4 pass and the Architecture Team re-verifies.

---

## 5. Next Steps

1. **AI team:** keep Case 177892985400464 escalated; do **all non-GPU prep in parallel** (RDS `t4g.small` + pg_cron group, S3 bucket, CloudFront + ACM + OAC, GCP→RDS migration rehearsal, tiered billing alerts, minimal CloudWatch alarms + log shipping).
2. **AI team:** close §9 — verify Admin DB host, draft S-1 scoped policy, confirm S-2 bucket, answer C1–C4, collect Gnana + Abishek sign-offs.
3. **CTO (Nagarjuna):** technical sign-off; route credentials **via the vault only**; grant Architecture Team read access to the Admin repo.
4. **AI team → Architecture Team:** on quota approval + §9 closure, submit the **completion report** (G1–G4 capture, post-cutover live-channel check, DNS/CDN proof, rollback-drill result) for **re-verification**.
5. **Founder:** lift the Phase 0 gate **only after** re-verification passes. Then Part B / Phase 1 proceeds per `PHASE-0-RUNBOOK`.
6. **Founder/Architecture (forward-looking):** treat **live streaming architecture (C1), the API scaling plan, the Admin backend, and load/security testing** as explicit Phase-1 design workstreams — they are *not* covered by this Phase-0 document.

### Sign-off

| Party | Action | Status |
|---|---|---|
| Sameer & Gnana | Non-GPU prep in parallel; close §9; keep quota escalated | ☐ Pending |
| Gyana Rajnan | DB migration plan final sign-off | ☐ Pending |
| Abishek | C1–C4 architecture sign-off | ☐ Pending |
| Nagarjuna (CTO) | Technical sign-off; vault-only credentials; Admin repo access | ☐ Pending |
| Architecture Team | Re-verify on completion report (G1–G4 + cutover + DNS + rollback) | ☐ Awaiting |
| Founder — Koneti Mohan Reddy | Lift gate only after re-verification | ◑ Holding |

**LocalAI TV Architecture Team** · LocalAI Media Network Pvt Ltd · CIN: U63910KA2025PTC212593 · Hyderabad, India

*Gate held. AWS Setup/Cost Plan endorsed in design; B-1 now fully endorsed (DNS risk defused). 8-vCPU GPU quota request is correct for Phase 0; approval is an AWS-side wait. v1.3 unchanged; CloudFront substitution recorded in Addendum A. No Phase 0 execution until the Founder lifts the gate after re-verification. Standing rule: no credentials to the AI team or Architecture Team or chat — Bitwarden vault only.*

# Response — Revised AWS Plan (v2) + Abishek's C1–C4 Architecture Sign-off
## LocalAI TV · Architecture Verdict · 18 May 2026

**To:** Sheikh Sameer & Gyana Rajnan (AI Pipeline Engineers) · Abishek N. (Architecture reviewer) · cc Nagarjuna Reddy (CTO)
**For the Founder:** Koneti Mohan Reddy (Managing Director)
**Re:** (A) the updated *Phase 0 AWS Setup & Cost Plan (post-execution)* and (B) *Abishek's C1–C4 Architecture Sign-off Answers*
**Status:** 🟡 **Gate remains HELD.** Good progress and good discipline — but **one P0 safety check on the DNS method must be answered immediately**, and several technical clarifications are required before C1–C4 can be signed off.

---

## TL;DR — plain language for the Founder

**Two documents, two messages:**

**1) The AWS plan (updated):** The team has now **actually built** the storage + CDN part (S3 bucket, security, SSL, CloudFront) and report that the CDN delivery test (Gate G3) passed. They **correctly held** the two risky items — the database move and the GPU machine — exactly as instructed. That is good, disciplined work.

> **BUT one important safety flag (please act on this first):** The agreed-safe plan was to add **only a single small DNS entry at Hostinger** and *never touch your domain's main settings*, so your **live Play Store app cannot break**. The updated document instead says they used **AWS "Route 53"** for the DNS. That *can* be done safely (for just the `content` sub-name) — **or** it could mean the whole domain's DNS was moved to AWS, which is exactly the risk I warned about and could break `aiservices.localaitv.com` (your live app's address). The document does **not** say which way they did it. **Before anything else, the team must confirm in writing: is your live app still working, and did they change only the `content` sub-name or the whole domain's nameservers?** This is a 10-minute check for them and it is the single most important question right now.

**2) Abishek's document:** First — this is **NOT a financial/accounting document**. It is **Abishek's technical answers to the 4 open architecture questions (C1–C4)** — one of the items blocking the gate. It does contain cost tables (that's probably why it looked financial), but its purpose is technical decisions about live-streaming, CDN cost, video-quality vs GPU cost, and the job-queue. **His recommendations are technically sound and sensibly cost-conscious.** However, he ends every section asking your AI team for specific numbers, so this is "answered, pending a few inputs" — **not yet a clean sign-off.**

**The single biggest thing for you to clarify internally:** all the favourable cost numbers in both documents assume the channels are built as **scheduled bulletins** (the GPU runs in short bursts — cheap). If your real vision is **24×7 live TV channels** (the GPU runs continuously), the cost is **5–10× higher**. This one decision changes the GPU size, the AWS quota size, and the monthly bill by a huge margin. Everything else hinges on it.

**Nothing here lifts the gate.** The gate stays held; only you lift it after the Architecture Team re-verifies the completed work.

---

# PART A — Revised AWS Setup & Cost Plan (post-execution)

## A1. What changed vs. the previous version

The document body is the same; **Section 9 was rewritten** from "items still open" into **9.1 Completed** and **9.2 Pending**, and the status line now reads *"CDN + S3 setup complete · 2 items pending."*

## A2. What they report as DONE — and our assessment

| Reported complete | Assessment |
|---|---|
| IAM user `localaitv-phase0` + MFA | ✅ Correct (least-privilege user, not root) |
| S3 bucket `localaitv-content-mumbai` — Block Public Access ON, versioning, SSE-S3 encryption | ✅ **Strong.** Exactly the secure pattern we asked for. Closes **S-2** (bucket exists). |
| ACM SSL cert for `content.localaitv.com` (us-east-1) | ✅ Correct region (CloudFront requires us-east-1) |
| CloudFront distribution with **OAC**, S3 policy auto-scoped to CloudFront | ✅ Correct — private bucket, CDN-only access. The strong option. |
| Access key generated, **stored in Bitwarden vault only** | ✅ Correct and compliant with the standing credentials rule. *Reminder: this key must never be sent to the Architecture Team or in chat — vault only.* |
| **Gate G3 verified** (media served via `https://content.localaitv.com/...`) | 🟡 **Plausible but must be independently re-verified** (see A4). |
| **DNS via Route 53 — A + AAAA alias for `content.localaitv.com`** | 🔴 **DEVIATION FROM THE ACCEPTED DESIGN — P0 verification required (see A3).** |

**Governance note (important and fair to the team):** building the S3/CloudFront/ACM/DNS layer was **explicitly recommended by the Architecture Team as safe parallel prep** while waiting on the GPU quota, and they **correctly held** the two gated items (DB cutover, GPU/EC2 launch). So this is **disciplined execution of the accepted prep — not a gate breach** — *with the single exception of the DNS-method change below.*

## A3. 🔴 P0 — The DNS method changed; confirm the live app is safe

- **Accepted-safe design (RESPONSE-Phase0-DB-CDN-v1.3 and AWS plan v1):** CloudFront + **a single Hostinger CNAME** `content.localaitv.com`; **Hostinger stays authoritative; nameservers untouched; `aiservices.localaitv.com` never affected.** The v1 doc's own safety table said exactly this.
- **What v2 now says:** *"Route 53 DNS: A + AAAA alias records created for `content.localaitv.com`"* and the ACM cert was *"DNS-validated via Route 53."*
- **Why this matters:** Route 53 serving `content.localaitv.com` is **safe only if** they created a Route 53 hosted zone for **just that sub-name** and delegated only `content` from Hostinger. It is **dangerous if** they moved the **entire `localaitv.com`** zone/nameservers to Route 53 without first exporting and recreating **every** existing record — that would break `aiservices.localaitv.com` (the live Play Store app API), the website, and email.
- **The document does not state which was done, and the old "safety table" was not updated to match.**

**Required from the AI team immediately (before any further work):**
1. Confirm **`aiservices.localaitv.com` still resolves and the live Play Store app still works end-to-end** (a real device/API check, not a guess).
2. State plainly: did they change **`localaitv.com` nameservers** to Route 53, or **delegate only the `content` subdomain**? (An `NS`/whois check answers this in minutes.)
3. If the whole zone moved: confirm **all** prior Hostinger records (`aiservices`, web, MX/email, any others) were exported and recreated in Route 53, with proof.
4. If only the subdomain was delegated: confirm Hostinger remains authoritative for everything else. **(This is the acceptable outcome.)**

Until items 1–4 are answered, treat the live-app safety as **unconfirmed**.

## A4. G3 re-verification (per the standard workflow)

"G3 verified" is the team's self-report. For the Architecture Team to re-verify on the completion note, please provide: the CloudFront distribution domain, the exact S3 test object key under `ai-processed/...`, and a request/response showing it served **through `content.localaitv.com`** (not the S3-direct URL) with a **CloudFront cache header + HTTP 200**, plus a repeat request showing a cache **HIT**. G3 alone does **not** lift the gate (G1/G2/G4 still need the GPU + the gated pipeline run).

## A5. Still open (unchanged by v2)
- **S-1:** IAM still on `AmazonS3FullAccess` — bucket-scoped policy still owed (before Phase 1).
- **Admin DB host verification** — still not confirmed from the Admin repo.
- **Monitoring/logging, load & security tests, live-streaming design** — the §3 gaps from the prior response are still not addressed in v2.
- **GCP→RDS migration** — correctly **on hold** (rehearsal only, awaiting cutover-window approval). Endorsed.
- **GPU quota** — Case reopened 18 May with justification; awaiting AWS. Correct; nothing to fix our side.

---

# PART B — Abishek's C1–C4 Architecture Sign-off

**What this document is:** **NOT** financial/accounting. It is **Abishek's technical sign-off answers to the four open architecture clarifications (C1–C4)** — a named gate-blocker. It includes cost tables (hence the "financial" impression) but the purpose is architecture decisions.

### C1 — RTMP fan-out (live ingest) → **Sound; recommendation accepted with conditions**
- **Recommends Option A: self-hosted SRS on EC2 (`t3.medium`, ap-south-1)** — ~₹4.5–9k/mo — over AWS IVS (managed but ~₹16–40k/mo, less control, lock-in).
- **Our assessment:** Technically sound. SRS is a proven open-source RTMP server; self-hosting fits a custom GPU pipeline and is cost-efficient. Choosing it over IVS is reasonable.
- **Honest caveats (must be resolved before Phase 1):** (a) A single SRS `t3.medium` is a **single point of failure for *all* constituency channels** — Abishek's own questions (RTMP push targets per channel, ingest redundancy, channel failure isolation) are exactly right and **must be answered**, not left open. (b) SRS + an `ingest.localaitv.com` subdomain is **new Phase-1 infrastructure**, not Phase-0 — it is *not* part of the held Phase-0 scope.

### C2 — CloudFront cost projection → **Method OK, but the headline number is optimistic**
- States Phase 0 ≈ $5/mo; Phase 1 (9 ch, 100 viewers/ch, 2.5 Mbps) ≈ **3,375 GB/mo ≈ $385/mo (~₹32k)**. Formula: `GB/mo = channels × viewers × Mbps × hours/day × 30 × 0.45`.
- **Our assessment:** The formula's `0.45` (GB per Mbps-hour) is correct. **But the $385 figure only holds if each viewer watches ≈ 7 minutes per day** — far too low for a *TV* product. At a realistic **~1 hour/day concurrent**, the same formula gives **~30,000 GB/mo ≈ ~$2,900/mo (~₹2.4 lakh)**; at 2–3 hours it is multiples of that. **The hidden variable is watch-time-per-viewer, and it is unstated.** Budget Phase-1 CDN on **realistic watch hours**, not the optimistic figure — this is directionally a *much* bigger number, and it compounds with the live-vs-batch question below.

### C3 — ABR ladder vs GPU budget → **Sound; reinforces our prior guidance**
- Standard 1080p/720p/480p/360p ladder; g4dn sizing table; explicitly adopts the **start/stop (100–200 hrs/mo)** pattern we recommended; notes 24×7 is **5–7× higher**.
- **Our assessment:** Well-reasoned and aligned with our prior recommendation (right-size GPU, start/stop not 24×7). **Two honest caveats:** (a) g4dn.xlarge at 3-rung ABR = only **1–2 channels**; Phase-1 (9 ch) needs **g4dn.12xlarge (48 vCPU, 4×T4)** — i.e. a **~48-vCPU GPU quota**, far above the **8 vCPU** now requested. **The 8-vCPU quota is Phase-0-only; file the ~48-vCPU Phase-1 quota the moment Zero Testing passes** (long AWS lead time). (b) the cost table assumes burst/batch use — see the cross-cutting issue below.

### C4 — pg_boss at scale → **Sound; correct low-risk call**
- Keep **pg_boss + PgBouncer** for Phase-1 start (~$0, low effort); move to SQS only if strain; BullMQ/Redis for high-throughput later; rejects SQS+Lambda (no GPU). Asks for peak jobs/minute to validate.
- **Our assessment:** Pragmatic and correct — defer the queue swap, add PgBouncer, decide on real numbers. No objection. Minor note: pg_boss lives **inside the AI Pipeline DB**, so the RDS instance must be sized with the queue load in mind (PgBouncer mitigates this).

### B-summary — does this close the C1–C4 gate-blocker?
**Partially.** The recommendations are technically sound and conservative, so C1–C4 moves from *"open"* to **"answered with conditions."** It is **not a clean sign-off** because every section ends with a specific question to the AI team, and **Gnana's sign-off is still separately required**. Inputs the AI team must supply to finalise: RTMP push-targets/redundancy/isolation plan (C1); explicit watch-time assumption + realistic Phase-1 CDN budget (C2); confirmation of the Phase-1 GPU class + the larger quota (C3); peak pipeline jobs/minute (C4).

---

## Cross-cutting issue (the most important one) — Batch vs. 24×7 Live

Every favourable cost number in **both** documents assumes the GPU runs in **short bursts** to build **scheduled bulletins** (start/stop, 100–200 hrs/mo). If LocalAI TV's Phase-1 product is **continuous 24×7 live linear channels**, the GPU and CDN both run continuously and the realistic monthly cost is **5–10× higher** (GPU alone could be ₹2–5 lakh+/mo; CDN similarly higher per C2).

**This single decision drives GPU instance size, the AWS quota size, and the monthly budget by an order of magnitude.** It must be answered before Phase-1 planning is meaningful:

> **Founder decision needed:** Is Phase-1 (a) **scheduled bulletins** (batch GPU — the current cost model), or (b) **24×7 live channels** (continuous GPU — costs 5–10× more)? Please decide internally; the whole Phase-1 infra and budget re-baselines on this.

---

## Next Steps

1. **AI team (P0, immediate):** answer the §A3 DNS-safety items in writing — confirm the live Play Store app is unaffected and state exactly what DNS change was made.
2. **AI team:** provide the §A4 G3 re-verification evidence.
3. **AI team / Abishek:** supply the C1–C4 inputs above; obtain **Gnana's** sign-off too.
4. **Founder (internal):** decide **batch vs. 24×7 live** (the cross-cutting issue) and your acceptable Phase-1 budget band.
5. **AI team:** keep the GPU quota escalated (8 vCPU now); **pre-stage the ~48-vCPU Phase-1 quota request** to file the instant Zero Testing passes.
6. **Architecture Team:** re-verify on the completion note (DNS-safety + G3 + DB-rehearsal + §A5 items). **Gate stays held until then and until the Founder lifts it.**

### Sign-off

| Party | Action | Status |
|---|---|---|
| Sameer & Gnana | Answer §A3 DNS safety + §A4 G3 proof; supply C1–C4 inputs | ☐ Pending |
| Abishek | C1–C4 — answered with conditions; finalise on AI-team inputs | ◑ Conditional |
| Gnana Rajnan | Separate C1–C4 / DB-migration sign-off still required | ☐ Pending |
| Nagarjuna (CTO) | Confirm DNS change protected the live app; vault-only credentials | ☐ Pending |
| Architecture Team | Re-verify (DNS safety + G3 + §A5) on completion note | ☐ Awaiting |
| Founder — Koneti Mohan Reddy | Decide batch-vs-live; lift gate only after re-verification | ◑ Holding |

**LocalAI TV Architecture Team** · LocalAI Media Network Pvt Ltd · CIN: U63910KA2025PTC212593 · Hyderabad, India

*Gate held. CDN/S3 build is accepted parallel prep (gated items correctly held). DNS method changed to Route 53 — live-app safety must be confirmed before proceeding. Abishek's C1–C4 = sound, answered-with-conditions, not yet a clean sign-off; Gnana sign-off still required. Batch-vs-24×7-live is the decisive cost question. v1.3 unchanged; outcomes recorded in Addendum A only after the Founder lifts the gate. Credentials: Bitwarden vault only — never to the Architecture Team or chat.*

# Phase 0 Prep — Scope of Work for Sameer & Gnana
## LocalAI TV · What the Architecture Team Needs · Prep Only (Gate Held)

**To:** Sheikh Sameer & Gnana Rajnan (AI Pipeline Engineers)
**From:** LocalAI TV Architecture Team
**For:** Founder Koneti Mohan Reddy (to forward)
**Date:** 16 May 2026
**Status:** 🟡 **Prep only.** Phase 0 execution stays held until the Founder lifts the gate. This document defines the four prep tasks and exactly what to send back.

---

## 0. SECURITY RULE — READ FIRST

This is **not** about trust. It is standard practice and it protects LocalAI TV.

| Topic | Rule |
|---|---|
| Sameer holding root / all internal credentials | ✅ **Fine — the Founder's decision.** Normal for a lead engineer. Not in question. |
| Real secrets (passwords, API keys, access keys, SSH keys) | Live **only** in the shared team vault (Bitwarden) among **Founder + Sameer + Gnana**. |
| What the **Architecture Team** receives | **Non-secret status text ONLY** (Section 3 template). Never a credential. |
| What is **never** sent to the Architecture Team — by ANY channel | No credentials via chat, file upload, email, WhatsApp, **screen-share, or AnyDesk**. There is no exception and no need for one. |
| AnyDesk / remote desktop / screen-share to transfer anything to the Architecture Team | ❌ **Not used. Not needed.** Do not set this up. |

**Why:** an AI assistant and any chat transcript are not a vault. The Architecture Team produces plans, code, and instructions; **you** operate the live systems with the real credentials. The two never meet. Trusting Sameer fully does not change this — the boundary is about *where secrets live*, not *who is trusted*.

**Net:** keep every secret in the vault. Send the Architecture Team only the plain-text status in Section 3.

---

## 1. The Four Prep Tasks (Part A — no gate crossed)

| # | Task | Owner | Notes |
|---|---|---|---|
| **A0** | **Submit the AWS GPU quota increase — today** | Sameer/Gnana | AWS Console → Service Quotas → EC2 → "Running On-Demand G and VT instances" → region **ap-south-1** → request **≥ 8 vCPUs**. Free to request; **AWS approval takes 1–2 business days** — this is the long pole, start it first. |
| **A1** | **Send the non-secret status confirmations** (Section 3) | Sameer/Gnana | Plain text only. ~15–30 min. This is the one item the Architecture Team needs to verify Phase-0 readiness. |
| **A2** | **Confirm the shared vault** | Founder + Sameer/Gnana | Bitwarden (free): one shared "LocalAI TV" vault; Sameer & Gnana invited; credentials placed there by the team. Never sent to the Architecture Team. |
| **A3** | **AWS guard-rails on the account** | Sameer/Gnana | Dedicated least-privilege IAM user (only S3 + the Phase 0 EC2 instance), separate bucket `localaitv-content-mumbai` (ap-south-1), billing budget alert (~₹35,000/mo), tag all Phase 0 resources `project=phase0` — so testing cannot touch the live channels. |

---

## 2. Timeline (since the team already has all access)

| Item | Team effort | External wait | Realistic completion |
|---|---|---|---|
| A0 | ~15 min to submit | **AWS approval 1–2 business days** (out of our hands) | Submit today → cleared in 1–2 days |
| A1 | ~15–30 min | none | **Same day — within the hour** |
| A2 | ~1–2 h (one-time vault setup) | none | Same day |
| A3 | ~2–4 h | none | Same day (scope the IAM policy carefully) |

**Bottom line:** if started today, prep is effectively complete in **~1 working day**, bounded only by AWS's GPU-quota approval (1–2 days). Nothing here touches the gate.

---

## 3. A1 — Send Exactly This (fill in, plain text, NO secrets)

> **Phase 0 Readiness — Status (non-secret)**
>
> **AWS**
> - Account ready: Yes / No
> - Region: ap-south-1 (Mumbai)? Yes / No
> - Same AWS account as the currently-live channels? Yes / No
> - GPU quota increase (A0) submitted? Yes / No — date: ______
>
> **Database**
> - PostgreSQL version: ______ (expected: 15)
> - Running where: Hostinger VPS / other: ______
> - Reachable from where the pipeline runs? Yes / No
>
> **Domain / DNS**
> - `localaitv.com` DNS managed at which registrar: ______
> - Is `content.localaitv.com` free to point at the CDN? Yes / No
>
> **VPS**
> - Hostinger OS + version: ______
> - Pipeline currently runs here? Yes / No

That is the entire content the Architecture Team needs. **No usernames, passwords, keys, or screenshots of secrets — ever.**

---

## 4. Gate Status (unchanged)

- This is **prep only.** Phase 0 **execution** (launch EC2, swap to NVENC, wire S3, measure G1–G4 — see PHASE-0-RUNBOOK Part B) does **not** start until the **Founder explicitly lifts the gate** and scope is frozen (architecture-review clarifications C1–C4 still pending with the AI team).
- Doing A0–A3 now does not cross the gate — it removes start-day delay.

---

### Sign-off

| Party | Action | Status |
|---|---|---|
| Sameer & Gnana | Do A0, A2, A3; send A1 status (Section 3) | ☐ |
| Founder — Koneti Mohan Reddy | Vault access for the team; lift the gate when ready (separate step) | ☐ |
| Architecture Team | Verify readiness from A1; flag gaps | ☐ Awaiting A1 |

**LocalAI TV Architecture Team** · LocalAI Media Network Pvt Ltd · CIN: U63910KA2025PTC212593 · Hyderabad, India

*Prep only. No credentials to the Architecture Team by any channel. Plan v1.3 unchanged. Execution waits for the Founder's gate-lift.*

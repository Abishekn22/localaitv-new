---
name: External systems for LocalAI TV
description: Pointers to GitHub repo, Netlify sites, Play Console, App Store Connect, 2Factor.in, iCloud backup paths — where to find things outside the codebase
type: reference
originSessionId: bdf68ed5-a922-4f9e-88a9-f62d59ad7ace
---
## GitHub

- **Repo:** https://github.com/nagarjunak-pixel/localaitv-app (private, owner `nagarjunak-pixel`)
- **Settings → Access (invite teammates):** https://github.com/nagarjunak-pixel/localaitv-app/settings/access
- **Personal access tokens:** https://github.com/settings/tokens
- **Authorized OAuth apps (GitHub CLI access):** https://github.com/settings/applications
- **Other repos on this account:** `localaitv` (existing, separate, content unknown — do NOT push to it without asking), `10`, `clicky`, `noha`, `surya-flow-ai`, `surya-shiksha`, `yes2562882`

## Netlify

- **Marketing site:** https://localaitv-marketing.netlify.app
- **Marketing site admin:** https://app.netlify.com/projects/localaitv-marketing
- **Account/team billing:** https://app.netlify.com/teams/balajikamireddy9/billing
- **Account email:** balajikamireddy9@gmail.com, team `newd` (slug `balajikamireddy9`)
- **All sites listing API:** `curl -H "Authorization: Bearer <token>" https://api.netlify.com/api/v1/sites`
- **As of 2026-05-13:** Account credit cap hit ("Account credit usage exceeded - new deploys are blocked"). User may need to add payment method or wait for monthly reset.

## Google Play Console

- **Live app:** https://play.google.com/store/apps/details?id=com.localaitv.app
- **Package ID:** `com.localaitv.app`
- **Console:** https://play.google.com/console (user manages own account)

## Apple App Store Connect

- Not yet set up. iOS submission pending Xcode upload.

## 2Factor.in (SMS OTP provider)

- **Login:** https://2factor.in/CP/login.php
- **DLT registration:** https://2factor.in/CP/dlt.php
- **Recharge:** https://2factor.in/CP/recharge.php
- **API key dashboard:** Login → Dashboard → API Keys
- **API base URL:** `https://2factor.in/API/V1/{API_KEY}/...`
- **Pricing:** ~₹0.15–0.25 per SMS, ₹0.25 for OTP via AUTOGEN
- **Required for India:** DLT registration before going live (~₹5,000 one-time, 5-7 working days)

## iCloud Drive backup

- **Mac path:** `~/Library/Mobile Documents/com~apple~CloudDocs/LocalAI-TV-Backups/`
- **iOS Files app:** Browse → iCloud Drive → LocalAI-TV-Backups
- **Web:** https://www.icloud.com/iclouddrive/ → LocalAI-TV-Backups
- **Contents:** `LocalAI-TV-v1.0.6.aab`, `localaitv-release.keystore`, `README.md`

## Email aliases the project uses (need to be set up by user)

Currently linked but NOT verified working — user has not confirmed email forwarding is set up. Marketing site references all these:
- `hello@localaitv.com`, `grievance@localaitv.com`, `press@localaitv.com`
- `reporters@localaitv.com`, `advertise@localaitv.com`, `partners@localaitv.com`, `copyright@localaitv.com`, `corporate@localaitv.com`
- All should resolve to a single working address (e.g. `balajikamireddy9@gmail.com`) via Zoho Mail / Google Workspace, OR find-and-replace in HTML to use one working address.

## How to apply

- When user asks "where is X" — check this list first. Don't speculate; verify with curl if uncertain.
- When user is confused about which account something is in, refer to the email mapping above.
- Before recommending an action on any of these systems, verify the URL still exists (HEAD request or browser open).

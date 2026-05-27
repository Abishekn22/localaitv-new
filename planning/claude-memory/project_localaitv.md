---
name: LocalAI TV App Project
description: Hyperlocal AI-powered Telugu news app for AP/TG — OLD Android version live on Play Store (placeholder); NEW v1.0.6 (iOS + Android) in active development. React single-file architecture, full app + deployment context.
type: project
originSessionId: bdf68ed5-a922-4f9e-88a9-f62d59ad7ace
---

## 🚦 Current Production State (snapshot 2026-05-13)

**Why this section:** Captures live production state so any new session can orient instantly without re-asking. Verify URLs before quoting — production state changes.

**🟡 Android — NEW v1.0.6 will UPDATE the old live app**
- Package: `com.localaitv.app` (same as old — keep it)
- **Current Play Store URL (OLD version, soon to be updated):** https://play.google.com/store/apps/details?id=com.localaitv.app
- **NEW v1.0.6 signed AAB (built but not yet uploaded):** `~/Desktop/LocalAI-TV-v1.0.6.aab` (5.7 MB)
- **The new AAB will be uploaded to Play Console as an UPDATE.** Existing users get the new version automatically. No separate listing.
- Keystore in use: `~/Library/Application Support/localaitv-dev/localaitv-release.keystore`
- **🚨 CRITICAL — VERIFY BEFORE UPLOAD:** The keystore used to sign the NEW AAB must be the SAME keystore that signed the ORIGINAL old app on Play Store. If they're different, Play Console rejects the upload with "signed with a different signing key" error. Two possible resolutions if mismatched:
  1. Find/recover the original keystore (search local backups, prior email, original developer's files)
  2. If Play App Signing was enabled in the original listing, contact Google Play support to rotate the upload key
- **versionCode** in `capacitor-project/android/app/build.gradle` must be HIGHER than what's currently on Play Store (check live listing → "What's New" or "About this app" → version number). If old is 1, new must be ≥ 2. Update before each release.
- **Strategy:** User iterates on iOS in Xcode → when stable, same React+Capacitor codebase rebuilds Android AAB → upload to Play Console as v1.0.6+ update. iOS goes to App Store fresh (no existing iOS listing).

**🟢 Marketing website — LIVE**
- URL: https://localaitv-marketing.netlify.app
- V1 deployed; V2 (with Play Store badge) pending — blocked by Netlify credit cap on `newd` team
- Netlify site_id: `c7fdfd85-219d-4666-8444-7791fe7ee790`
- Source: `~/Desktop/localaitv-submission-kit/website/`

**🟢 Source code — Private GitHub repo**
- URL: https://github.com/nagarjunak-pixel/localaitv-app (private)
- Owner: `nagarjunak-pixel` (account email: balajikamireddy9@gmail.com)
- Pushed 2026-05-13: 252 files, 12 commits, ~6.8 MB
- Excludes regeneratable: `store-assets/splash/`, `store-assets/screenshots/`, `website/screenshots/`

**🟢 iCloud Drive backup**
- Path: `~/Library/Mobile Documents/com~apple~CloudDocs/LocalAI-TV-Backups/`
- Contains: signed AAB + keystore + README
- Accessible via: iOS Files app → iCloud Drive → LocalAI-TV-Backups

**🟡 iOS — primary work-in-progress (the NEW build)**
- This is what the user is actively developing right now
- Xcode workspace: `~/Desktop/localaitv-submission-kit/capacitor-project/ios/App/App.xcworkspace`
- Once iOS is done and submitted to App Store, the SAME React+Capacitor codebase produces a new Android AAB which is then uploaded to Play Console as an UPDATE to the old listing
- Workflow: iterate on `src/App.jsx` → `npm run build` → `npx cap copy ios + android` → Xcode Archive for App Store + Gradle bundleRelease for Play Store
- Guide: `~/Desktop/localaitv-submission-kit/IOS-DEPLOY.md`

**🟡 Design redesign — 3 demos built, awaiting user pick**
- Path: `~/AI NEWS /design-demos/`
- V1 Cinematic OTT (Netflix-style, navy + electric blue + gold)
- V2 AI Newsroom (cyan glow, HUD, futuristic)
- V3 Premium Local Media (gold + magazine elegance)
- Live test: `cd ~/AI\ NEWS\ /design-demos && python3 -m http.server 8801` → http://localhost:8801
- User has NOT yet picked one — once they do, apply to a NEW App_v3 file (don't touch the canonical)
- **Important:** Redesign scope is iOS + Android ONLY (not web/marketing site) — user explicitly said web stays as-is

## 🧰 Production Stack (added 2026-05-13)

**Why this section:** Beyond the React-single-file, the project now has Capacitor wrapping + Netlify backend.

- **Frontend:** React 18 + Vite (precompiled, not Babel-in-browser anymore for production builds)
- **Mobile wrap:** Capacitor 6.1 with 13 native plugins
- **Backend:** Netlify Functions (serverless Node.js)
- **Storage:** `@netlify/blobs` (KV store for forms + sessions + rate limits)
- **Email:** Resend (optional, for forwarding form submissions)
- **SMS provider:** **2Factor.in** (DLT-compliant Indian OTP). Functions built: `sms-otp-send.mjs`, `sms-otp-verify.mjs`, `sms-balance.mjs` (in `capacitor-project/netlify/functions/`). Guide: `SMS-OTP-INTEGRATION.md`. Required env vars: `TWOFACTOR_API_KEY`, `AUTH_TOKEN_SECRET`, `SMS_OTP_RATE_PER_HOUR`. User had NOT yet pasted API key or set up DLT registration at session end.
- **Node.js dev path:** `~/Library/Application Support/localaitv-dev/node/bin/` (Node v22.x — user has no global node)
- **JDK:** `~/Library/Application Support/localaitv-dev/jdk/` (Adoptium Temurin 17)
- **Android SDK:** `~/localaitv-android-sdk/` (moved from spaced path because Gradle's sdkmanager broke on spaces)
- **`gh` CLI:** `~/Library/Application Support/localaitv-dev/gh/gh` v2.62.0 (installed via direct binary, no Homebrew)

## 🔐 Account access (for reference)

**Why this section:** When user asks about deploys, billing, or team access — refer to the right account.

- **Netlify:** `balajikamireddy9@gmail.com`, team `newd` (slug `balajikamireddy9`). Has 14 sites. As of 2026-05-13, account hit usage credit cap — new deploys blocked. Use the Netlify auth token method (token-based curl POST) for deploys.
- **GitHub:** `nagarjunak-pixel` (full name shown as "nagarjuna teddy"). Uses Google OAuth. Personal access tokens require explicit `repo` scope — first token user pasted (`ghp_BtdPeJ...`) had EMPTY scopes. Device flow + GitHub CLI OAuth app works fine.
- **Play Console:** Whoever owns `com.localaitv.app` — user owns it (signed AAB came from their keystore).
- **App Store Connect:** Not yet active.

## 📁 Critical files quick-reference

**Why this section:** During long sessions, paths get forgotten. Keep this updated as paths change.

| Purpose | Path |
|---|---|
| Canonical React source | `~/AI NEWS /286.App_v3_20260512-201203_auto-backup.jsx` |
| Capacitor build mirror | `~/Desktop/localaitv-submission-kit/capacitor-project/src/App.jsx` (same content) |
| Signed AAB | `~/Desktop/LocalAI-TV-v1.0.6.aab` |
| Keystore | `~/Library/Application Support/localaitv-dev/localaitv-release.keystore` |
| Xcode workspace | `~/Desktop/localaitv-submission-kit/capacitor-project/ios/App/App.xcworkspace` |
| Netlify Functions | `~/Desktop/localaitv-submission-kit/capacitor-project/netlify/functions/` |
| Marketing site | `~/Desktop/localaitv-submission-kit/website/` |
| Design demos | `~/AI NEWS /design-demos/v{1,2,3}-*/index.html` |
| Top-level guides | `~/Desktop/localaitv-submission-kit/*.md` (README, STATUS, IOS-DEPLOY, BACKEND-DEPLOY, EMAIL-NOTIFICATIONS-SETUP, DEPLOY-WEBSITE, SMS-OTP-INTEGRATION) |

---

## ⚠️ Versioning Rule (ALWAYS FOLLOW)

**Before making ANY edit to the source file:**
1. Copy the current working file to a new versioned snapshot first
2. Naming pattern: `<next_number>.App_v3_<YYYYMMDD-HHMMSS>_<short-description>`
3. Then edit the original source file
4. Then regenerate `preview_v3_20260510.html`

**Auto-backup hook is installed** (`~/.claude/auto-backup-localaitv.sh`) — it snapshots before every Edit/Write/MultiEdit. As of 2026-05-12 21:16 the hook was rewritten to be **path-agnostic** — it backs up *any* `.jsx` or `App_v3_*` file in `/Users/venkataswaraswamy/AI NEWS /` plus the preview HTML, so switching the canonical source does NOT break it. Snapshots are named `<N>.App_v3_<TS>_auto-backup.jsx` (or `…_auto-backup-preview.html` for the HTML). Query `ls | grep -E "^[0-9]+\.App_v3_" | sort -t. -k1n | tail -1` for current counter.

**Canonical source (only edit this file):**
- `/Users/venkataswaraswamy/AI NEWS /286.App_v3_20260512-201203_auto-backup.jsx` (set as canonical on 2026-05-12)
- Previous canonical was `2.App_v3_20260510-070141_bottomnav-all-screens-upload-button` — no longer the working source

**Derived files (regenerate from source):**
- `preview_v3_20260510.html` — Babel-in-browser preview wrapper
- `App_v3_20260510_latest.jsx` — download copy refreshed at end of each work batch

**Brace/paren baseline**: `Braces: 0, Parens: -3, Brackets: 0` — preserve this exactly after every edit.

---

## Project Overview

**App Name:** LocalAI TV  
**Version:** 1.0.6  
**API Base:** `https://aiservices.localaitv.com/api`  
**YouTube Channel:** `UClB3scGwKSfe3CmLYYFkDoQ`  
**File naming pattern:** `App_v3_YYYYMMDD-HHMMSS_<feature-description>` (single JSX/JS file)  
**Current file:** `2.App_v3_20260510-070141_bottomnav-all-screens-upload-button`

**Why:** Hyperlocal Telugu news platform targeting all 175 AP constituencies and 119 TG constituencies. Citizen reporter model with AI assistance.

**How to apply:** This is the canonical source file. Always reference this file when making changes or additions.

---

## Architecture

- **Single React file** — no separate component files; all components in one large JSX file (~19,900 lines, ~1.37MB)
- **No build system** — `preview_v3_20260510.html` loads React 18 UMD + ReactDOM UMD + Babel standalone via CDN, then runs the source inline as `<script type="text/babel">`. Babel compilation of 1.3MB JSX takes 60–120s in browser — be patient when previewing.
- **Root:** `AppRoot` → `ThemeProvider` → `App`
- **Routing:** `screen` state string + `navigate(screenName)` function — no React Router
- **API:** `apiCall(path, opts)` — 8s timeout, JSON, `API_BASE` prefix
- **Custom hook:** `useAPI(fetchFn, fallback, deps)` — loading/error/data state

---

## Theme System

- **Dual theme:** `T_DARK` (default) and `T_LIGHT` — toggled via `ThemeProvider`
- **Default:** Light mode (`getStoredTheme()` returns `'light'` by default)
- **localStorage key:** `localaitv_theme`
- **Global `T`:** Module-level variable synced by ThemeProvider — legacy components use `T` directly; new components use `useAppTheme()` hook
- **Key tokens:** `T.bg`, `T.bg2`, `T.bg3`, `T.surface`, `T.text`, `T.text2`, `T.textMuted`, `T.border`, `T.shadow`, `T.red`, `T.gold`, `T.teal`, `T.green`, `T.isDark`
- **DOM:** Sets CSS vars `--app-bg`, `--app-text`; body classes `theme-light` / `theme-dark`; `meta[name="theme-color"]`

---

## Content Accent System

```js
ACCENT = { breaking, official, community, alert, sports, business }
```
Each has `color`, `bg`, `border`, `label`. Used to badge news items by source/category.

---

## Data

- **AP_CONSTITUENCIES:** 175 entries (4 marked `live:true`: Anantapur Urban, Nellore City, Kakinada City, Tirupati)
- **TG_CONSTITUENCIES:** 119 entries (4 marked `live:true`: Karimnagar, Khammam, Warangal West, Nalgonda)
- **CHANNELS_AP / CHANNELS_TG:** Full constituency channel lists with `id`, `name`, `dist`, `live` fields
- **NEWS_ITEMS:** 15 categories — District, State, National, etc. — Telugu + English titles, Unsplash thumbnails
- **SHORT_NEWS:** YouTube Shorts-style news items with `ytId`
- **CLASSIFIEDS:** Local classifieds with categories: Property, Vehicles, Jobs, Electronics, Services, Agri, Shops, Marriage, Wishes, Education, Pets

---

## Screens (Navigation via `screen` state)

| Screen key | Component | Notes |
|---|---|---|
| `splash` | `SplashScreen` | Globe animation, progress bar, first-launch detection |
| `intro` | `IntroScreen` | First-time user onboarding |
| `location` | `LocationPickerScreen` | State + constituency picker |
| `home` | `HomeScreen` | Main feed with sections |
| `channels` | `ChannelsScreen` | Live TV channel grid |
| `upload` | `UploadScreen` | Citizen reporter upload; requires registration |
| `local` | `LocalScreen` | Hyperlocal section |
| `profile` | `ProfileScreen` | User profile |
| `settings` | `SettingsScreen` | App settings |
| `shortsfeed` | `KurnoolShortsScreen` | Vertical swipe shorts |
| `classifiedsfeed` | `ClassifiedsFeedScreen` | Full-screen classifieds |
| `bulletinsfeed` | `BulletinPlayerScreen` | News bulletins |
| `newsfeed` | `DistrictNewsFeedScreen` | District/State/National feed |
| `whoswho` | `WhosWhoScreen` | Local leaders/profiles |
| `utility` | `UtilityScreen` | Trains, weather, bullion tabs |
| `schedule` | `ScheduleScreen` | Today's broadcast schedule |
| `devotional` | `DevotionalScreen` | Devotional content |
| `register` | `RegisterScreen` | Citizen reporter registration |
| `earnings` | `EarningsScreen` | Reporter earnings |
| `panchangam` | `PanchangamScreen` | Telugu calendar |
| `election` | `ElectionScreen` | Election data |
| `leaderboard` | `LeaderboardScreen` | Reporter leaderboard |
| `progress` | `ProgressScreen` | Constituency progress |
| `emergency` | `EmergencyScreen` | Emergency contacts |
| `qrcode` | `QRCodeScreen` | QR code |
| `grievance` | `GrievanceScreen` | Grievance filing |
| `channelpartner` | `ChannelPartnerScreen` | Partner application |
| `about/privacy/terms/copyright/contact/advertise` | Legal/info screens | |
| `complaint/takedown/counternotification` | `ComplaintForm` etc. | IT Rules 2021 compliance |
| `deleteaccount` | `AccountDeletionScreen` | GDPR/account deletion |
| `classifieds` | `ClassifiedsScreen` | Full classifieds with post-ad form |
| `newsupload` | `NewsUploadFormScreen` | News upload form |
| `birthdayform/marriageform/upcomingmarriage` | Request forms | Community announcements |
| `shopping/jobs/carsales` | Ad forms | Classified ad forms |
| `vegpriceform` | `VegPriceForm` | Vegetable price reporting |
| `guestintake` | `GuestIntakeForm` | Who's Who guest intake |

---

## Bottom Navigation

5 tabs: **Home · Live TV · Upload (center FAB) · Local · Profile**

- Upload button: circular red gradient FAB raised above nav bar with paper-plane icon
- Active state: `T.red` color; inactive: `T.textMuted`

---

## Key Components

- **`BottomNav`** — 5-tab nav with Upload FAB
- **`AiLogo`** — "AI" gradient text + "TV" blue border badge, multiple sizes
- **`LocationPin`** — 3D glossy red/gold map pin SVG
- **`SkeletonBox`** — Shimmer placeholder
- **`LiveDot`** — Blinking red dot for live indicators
- **`Badge`** — Color-coded label badge
- **`KurnoolShortItem`** — Full-screen vertical short with like/dislike/comment/share/bell/rating
- **`InstagramClassifiedsViewer`** — Instagram-style snap-scroll classifieds viewer
- **`SharedActionBar`** — Reusable like/dislike/comment/share/bell bar; state persisted to localStorage
- **`BreakingNewsBanner`** — Rotating breaking news alert strip
- **`LiveViewerCounter`** — Real-time viewer count with animated updates
- **`ScheduleScreen`** — Full broadcast schedule (6AM/8AM/12PM/6PM/10PM blocks)
- **`GlobeIcon`** — Animated SVG globe for splash screen
- **`ClassifiedsSection`** — Home page classifieds strip with category pills

---

## Registration / Auth

- Citizen reporters must register before uploading (`localaitv_registered` in localStorage)
- `userProfile` state stored in localStorage as JSON (`localaitv_profile`)
- Registration gates the Upload screen → redirects to `RegisterScreen`

---

## Broadcast Schedule

Aired at 6AM, 8AM, 12PM, 6PM, 10PM. Each block:
1. 15-min News Bulletin (Global 8min + Local 7min)
2. 15-min Community Spotlight (Birthdays, Marriages, Jobs, Events, Shopping, Veg Prices, Weather, Devotional)
3. 30-min Extended Bulletin (+ Official Updates + Agri/Farming)

---

## Fonts & Styles

- **Barlow Condensed** — headlines, badges, labels (800–900 weight)
- **Barlow** — body text
- **Noto Sans Telugu** — Telugu language text
- Animations: shimmer, spin, blink, fadeIn, screenIn, slideUp, heartPop, tickerScroll, slideshowProgress

---

## API Endpoints (known)

- `/classifieds?constituency=...&limit=30`
- `/partner-applications` (POST)
- Pattern: `apiCall('/path', { method, body: JSON.stringify({...}) })`

---

## Recurring UX patterns the user expects

The user iterates heavily on polish. These patterns recur across requests — reuse them, don't reinvent:

**Hover highlights on buttons** — `cubic-bezier(0.22,1,0.36,1)` easing, lift + scale + color-tinted glow. For colored buttons (red Photo/Video, gradient pills): brighten background + amplify shadow. For white/outlined buttons (Library): light tinted background + colored shadow matching the form's accent. On disabled buttons (e.g. when `mediaPreviews.length >= 3`), guard `onMouseEnter` with an early return.

**Color-coded action bar glows** (Like/Dislike/Comment/Views/Share): blue / orange / teal / violet / gold, in that order. Each `boxShadow:'0 4px 14px rgba(<R,G,B>,0.45)'` + `transform:'translateY(-2px) scale(1.04)'`.

**Form accent colors** (for hover glows on Library-style buttons):
- News: red `T.red` · Events: orange `230,81,0` · Shopping: brown `180,83,9` · Jobs: navy `30,58,138` · Vehicle: green `27,94,32` · Rentals: teal `0,131,143` · Birthday: pink

**YouTube iframe gotchas** — iframes eat touch/wheel events on their area. Always:
1. Add `enablejsapi=1` so play/pause works via postMessage
2. Use `controls=0&iv_load_policy=3&disablekb=1&showinfo=0&fs=0` to hide ALL YouTube branding (info card, captions, settings, fullscreen)
3. Layer a transparent `<div style={{position:'absolute', inset:0, zIndex:3}}>` over the iframe to capture swipe/wheel before YouTube does
4. Use `youtube.com` (not `youtube-nocookie.com`) for live streams — nocookie triggers "sign in to confirm you're not a bot"
5. For live TV fallback: `YT_LIVE_FALLBACK = 'jfKfPfyJRdk'` and an iframe `onError` handler

**360° infinite scroll** — `getLoopIdx = ((rawIdx % total) + total) % total`. Decrement `rawIdx` freely on prev/next; never clamp at 0.

**Sticky-top mini-player pattern** (Bulletin feed) — Single active video `position:'absolute', top:0, z-index:5` with a list scrolling below using `paddingTop: 'calc(56.25vw + 70px)'` to clear it.

**Pill row top-clipping fix** — Hover lift on category pills gets clipped at top of container. Set `padding:'6px 16px 10px'` and `overflowY:'visible'` on the pill row to give room.

---

## Workflow conventions

1. **Always snapshot before edit** — auto-backup hook handles it. After edits, run brace/paren balance check (`Braces: 0, Parens: -3, Brackets: 0`), regenerate the preview HTML via Python script that swaps the inline `<script type="text/babel">` body, then `cp` source to `App_v3_20260510_latest.jsx` for download.

2. **User often communicates via voice transcription** — Telugu-English code-switched, phonetic. "Carnolu Local" = Kurnool Local; "Manukarnulu starts" = Mana Kurnool Shorts; "Iroju" = today; "Humber" = hamburger menu; "over highlight" = hover highlight; "monocorono" = Mana Kurnool. Parse phonetically when literal interpretation doesn't match a screen name.

3. **"Show it"** at the end of a request = regenerate preview and open browser. Auto mode is often active — execute without asking.

4. **Preview server** — `localaitv-preview` configuration in `.claude/launch.json`. Already running on port 8765; cwd `/Users/venkataswaraswamy/Documents`, serves from `/Users/venkataswaraswamy/AI NEWS`.

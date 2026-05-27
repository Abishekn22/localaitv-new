# Backend API Reference

The backend is **not part of this repo**. This is the front-end. All network calls hit a remote HTTP API:

| Env | Base URL |
|---|---|
| Dev (`npm run dev`) | `http://localhost:5000/api` |
| Production | `https://localaitv.com/api` |
| Override | `VITE_API_BASE` env var |

Source: [src/api/client.js](src/api/client.js). The exported helpers:
- `apiCall(path, opts)` — `fetch` wrapper, JSON in/out, 8s `AbortController` timeout, throws on non-2xx.
- `API_BASE` — full base URL with `/api` suffix.
- `API` — alias of `API_BASE` used by legacy form code paths.

Every request is anonymous (no Authorization header anywhere in the codebase). `check-phone` is the one call that sends `credentials: 'include'` for cookies.

---

## GET endpoints (read)

All called via `apiCall(path)` and wrapped in the `useAPI` hook so each section can render a static fallback while the request is in flight.

| Method | Path | Used by | Fallback | Notes |
|---|---|---|---|---|
| GET | `/news?constituency={en}&limit=20` | [HomeScreen.jsx:87](src/screens/HomeScreen.jsx#L87) | `NEWS_ITEMS` | District news rail + Lead Story + FeaturedStoryHero. Refreshes every 5 min. Response: `{ items: [...] }` or bare array. |
| GET | `/bulletins?page=1&limit=20` | [HomeScreen.jsx:95](src/screens/HomeScreen.jsx#L95) | `BULLETINS` (empty) | "ఈరోజు {channel} TV ప్రసారాలు" strip. Items mapped via `mapBulletin()`. |
| GET | `/bulletins?page=1&limit=50` | [BulletinPlayerScreen.jsx:12](src/screens/BulletinPlayerScreen.jsx#L12) | `BULLETINS` | Full-screen bulletin player feed. |
| GET | `/incidents?page=1&limit=10` | [HomeScreen.jsx:102](src/screens/HomeScreen.jsx#L102) | `[]` → `SHORT_NEWS` | "మన Kurnool Shorts" rail. Items mapped via `mapIncidentToShort()` (resolves S3 media URLs). |
| GET | `/classifieds?constituency={en}&limit=30` | [ClassifiedsSection.jsx:16](src/components/Sections/ClassifiedsSection.jsx#L16) | `CLASSIFIEDS` | Kurnool LOCAL rail. |
| GET | `/election?constituency={en}` | [ElectionScreen.jsx](src/screens/ElectionScreen.jsx) | static | Local election results / candidates. |
| GET | `/leaderboard?constituency={en}&month={YYYY-MM}` | [LeaderboardScreen.jsx](src/screens/LeaderboardScreen.jsx) | static | Citizen-reporter monthly leaderboard. |
| GET | `/projects?constituency={en}` | [ProgressScreen.jsx](src/screens/ProgressScreen.jsx) | static | Government project / civic progress list. |
| GET | `/utility/trains?from={en}` | [UtilityScreen.jsx](src/screens/UtilityScreen.jsx) | static | Train timings. |
| GET | `/utility/veg-prices?district={en}&date={YYYY-MM-DD}` | [UtilityScreen.jsx](src/screens/UtilityScreen.jsx) | static | Vegetable mandi prices for the day. |

---

## POST endpoints — compliance & business intake

JSON body. Submitted from compliance/legal screens. Most use `genComplianceId()` ([formHelpers.js:10](src/components/Form/formHelpers.js#L10)) to mint an `LAI-XXX-YYYYMMDD-NNNNNN` reference on the client and include it in the payload.

| Path | Called from | Purpose |
|---|---|---|
| POST `/complaints` | [ComplaintForm.jsx:54](src/screens/compliance/ComplaintForm.jsx) | IT Rules 2021 grievances. |
| POST `/content-reports` | [ReportContentForm.jsx:44](src/screens/compliance/ReportContentForm.jsx), also fired from [ReportSheet.jsx](src/components/sheets/ReportSheet.jsx) | Report a news/short/classified item. |
| POST `/copyright-takedown-requests` | [TakedownForm.jsx:56](src/screens/compliance/TakedownForm.jsx) | DMCA-style takedown notices. |
| POST `/copyright-counter-notifications` | [CounterNotificationForm.jsx:41](src/screens/compliance/CounterNotificationForm.jsx) | Counter-notification under copyright. |
| POST `/account-deletion-requests` | [AccountDeletionScreen.jsx:20](src/screens/legal/AccountDeletionScreen.jsx) | User-initiated account deletion (Play/App Store requirement). |
| POST `/advertising-enquiries` | [AdvertiseScreen.jsx:33](src/screens/legal/AdvertiseScreen.jsx) | "Advertise With Us" lead capture. |
| POST `/partner-applications` | [ChannelPartnerScreen.jsx:54](src/screens/ChannelPartnerScreen.jsx) | Town-channel partner program applications. |

---

## POST endpoints — user-generated content (Upload flow)

Submitted from the Upload category forms. All use raw `fetch(`${API}/…`)` with `Content-Type: application/json`. Most also POST attached photos through `/upload-file` afterwards via `uploadPhotos()` ([formHelpers.js:17-31](src/components/Form/formHelpers.js#L17-L31)).

| Path | Form |
|---|---|
| POST `/birthday-requests` | [BirthdayRequestForm.jsx:48](src/screens/forms/BirthdayRequestForm.jsx#L48) |
| POST `/anniversary-requests` | [MarriageAnniversaryRequestForm.jsx:67](src/screens/forms/MarriageAnniversaryRequestForm.jsx#L67) |
| POST `/marriage-requests` | [UpcomingMarriageForm.jsx:40](src/screens/forms/UpcomingMarriageForm.jsx#L40) |
| POST `/whoiswho-requests` | [WhoIsWhoRequestForm.jsx:35](src/screens/forms/WhoIsWhoRequestForm.jsx#L35) |
| POST `/talent-show-requests` | [TalentShowRequestForm.jsx:54](src/screens/forms/TalentShowRequestForm.jsx#L54) |
| POST `/public-voice-requests` | [PublicVoiceRequestForm.jsx:57](src/screens/forms/PublicVoiceRequestForm.jsx#L57) |
| POST `/event-listings` | [EventsForm.jsx:93](src/screens/forms/EventsForm.jsx#L93) |
| POST `/rental-listings` | [RentalForm.jsx:80](src/screens/forms/RentalForm.jsx#L80) |
| POST `/shopping-ads` | [ShoppingAdForm.jsx:68](src/screens/forms/ShoppingAdForm.jsx#L68) |
| POST `/job-posts` | [JobsForm.jsx:84](src/screens/forms/JobsForm.jsx#L84) |
| POST `/vehicle-sales` | [CarSalesForm.jsx:83](src/screens/forms/CarSalesForm.jsx#L83) |
| POST `/price-entries` | [VegPriceForm.jsx:37](src/screens/forms/VegPriceForm.jsx#L37) |
| POST `/guest-intake` | [GuestIntakeForm.jsx:50](src/screens/forms/GuestIntakeForm.jsx#L50) |

> **News uploads** ([NewsUploadFormScreen.jsx](src/screens/forms/NewsUploadFormScreen.jsx)) currently do **not** post to the backend — the form imports `API`/`apiCall` but never calls them. Likely pending wiring.

### File upload

| Path | Called from | Notes |
|---|---|---|
| POST `/upload-file` (multipart) | [formHelpers.js:25](src/components/Form/formHelpers.js#L25) — `uploadPhotos(files, reqId, relatedType)` | Form-data fields: `file`, `broadcast_request_id`, `related_type`. Returns `{ file_url }`. Iterated per-photo. |

---

## Auth endpoints

| Path | Called from | Notes |
|---|---|---|
| POST `/api/auth/check-phone` | [RegisterScreen.jsx:35](src/screens/RegisterScreen.jsx#L35), [UploadRegistrationScreen.jsx:30](src/screens/UploadRegistrationScreen.jsx#L30) | Checks if a 10-digit Indian mobile is already registered. Sends `{ phone }`, expects `{ registered: boolean }`. **Bug to flag:** built with `${API_BASE}/api/auth/check-phone` while `API_BASE` already ends in `/api`, so the request actually goes to `https://localaitv.com/api/api/auth/check-phone`. The other endpoints use `${API}/…` without the extra `/api` prefix and resolve correctly. |

OTP send / verify are simulated on the client (`setTimeout`) in [UploadScreen.jsx:65-77](src/screens/UploadScreen.jsx#L65) and [RegisterScreen.jsx:82-99](src/screens/RegisterScreen.jsx#L82) — no backend call yet.

---

## Summary of expected backend surface

19 distinct endpoints across 4 groups:

- **9 GET** — content read (news, bulletins, incidents, classifieds, election, leaderboard, projects, trains, veg-prices)
- **7 POST** — compliance & business intake (complaints, content-reports, takedowns, counter-notifications, account-deletion, advertising, partner)
- **13 POST** — user-generated content (12 listing types + 1 file upload)
- **1 POST** — auth (`check-phone`)

Every read endpoint must accept a `constituency` query param (English channel name like `Kurnool`, `Guntur`, …) or a `page`/`limit` pair, and respond with either `{ items: [...] }` or a bare array — the front-end accepts both (`d.items || d`). Listing fields used by the front-end are documented per-screen in inline comments next to each `apiCall` (e.g. [HomeScreen.jsx:115-140](src/screens/HomeScreen.jsx#L115-L140) for the `/incidents` shape).

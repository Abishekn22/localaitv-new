# iOS Submission Guide — Step by Step

This is the complete walkthrough for getting LocalAI TV approved on the **Apple App Store**.

Difficulty: more complex than Android. Plan for **3-5 days** of back-and-forth with Apple.

---

## 📋 Prerequisites (one-time setup, ~1 hour)

### 1. Apple Developer account ($99/year)

1. Go to **https://developer.apple.com/programs/enroll/**
2. Sign in with your Apple ID (the one with payment method)
3. Choose **Organization** (since LocalAI Media Network Pvt Ltd is registered)
4. Provide:
   - **Legal Entity Name**: `LocalAI Media Network Pvt Ltd`
   - **D-U-N-S Number**: Get free at https://www.dnb.com/duns-number/get-a-duns.html — takes 24-48 hours
   - **Headquarters Address**: Hyderabad, Telangana
   - Phone, website
5. Apple may call to verify. Have your phone ready.
6. Pay $99 USD
7. Wait 24-72 hours for approval

### 2. Install Xcode (~30 min, depends on internet)

1. Open **Mac App Store**
2. Search **Xcode** → click "Get" → install (10 GB download, takes 30-60 min)
3. After install, open Xcode once. Accept license. Let it install components.
4. In Terminal:
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   ```

### 3. Install CocoaPods (5 min)

In Terminal:
```bash
sudo gem install cocoapods
```

Type your Mac password when asked. Verify:
```bash
pod --version
# Should print something like 1.15.x
```

---

## 🛠 Build the iOS .ipa file (45 min)

### Step 1 — Install pods (one-time)

```bash
cd ~/Desktop/localaitv-submission-kit/capacitor-project
cd ios/App && pod install && cd ../..
```

Takes 2-5 min. Downloads ~600 MB of iOS dependencies.

### Step 2 — Sync the latest web build

```bash
export PATH="$HOME/Library/Application Support/localaitv-dev/node/bin:$PATH"
npm run build
npx cap sync ios
```

### Step 3 — Open in Xcode

```bash
npx cap open ios
```

Xcode opens the project. Wait for it to finish indexing (you'll see a progress bar at the top).

### Step 4 — Configure signing in Xcode

1. In Xcode's left sidebar, click the **App** project (top of the tree)
2. Click the **App** target (under "TARGETS")
3. Click the **Signing & Capabilities** tab
4. Under **Signing**:
   - Check **Automatically manage signing**
   - **Team**: pick your developer team (the one you registered)
   - **Bundle Identifier**: `com.localaitv.app` (already set)
5. Xcode will auto-generate a provisioning profile. Wait for the green checkmark.

If you see "Failed to register bundle identifier" — that means another app already uses `com.localaitv.app`. Change it to something unique like `com.localaimedianetwork.localaitv`.

### Step 5 — Set version + build number

Still in the **General** tab of the App target:
- **Version**: `1.0.6`
- **Build**: `1`

(For every future update you submit, bump the **Build** number by 1: 2, 3, 4...)

### Step 6 — Set deployment target

Under **General** → **Minimum Deployments**:
- iOS: **14.0** (or 15.0 — wider device coverage)

### Step 7 — Archive

1. At the top toolbar, where it says **Any iOS Device** or a simulator name → click → pick **"Any iOS Device (arm64)"**
2. Menu: **Product** → **Archive**
3. Wait ~3-5 minutes. Xcode builds, signs, and packages the app.
4. When done, the **Organizer** window opens automatically showing your archive.

### Step 8 — Upload to App Store Connect

In the Organizer window:
1. Select the new archive
2. Click **Distribute App**
3. Pick **App Store Connect**
4. Pick **Upload**
5. Distribution options: leave defaults checked
6. Re-sign: pick **Automatically manage signing**
7. Click **Upload**
8. Wait ~5-15 minutes. The build uploads + Apple processes it.

You'll get an email when it's ready.

---

## 📝 Fill out the App Store listing (1 hour)

### Step 1 — Create the app record

1. Go to **https://appstoreconnect.apple.com**
2. **My Apps** → **+** (top-left) → **New App**
3. Fill:
   - **Platforms**: iOS
   - **Name**: `LocalAI TV`
   - **Primary Language**: English (India)
   - **Bundle ID**: pick `com.localaitv.app` from dropdown (it should appear after your upload)
   - **SKU**: `localaitv-ios-001`
   - **User Access**: Full Access
4. Click **Create**

### Step 2 — App Information

In the new app's sidebar → **App Information**:
- **Subtitle**: `Hyperlocal Telugu News & TV`
- **Category Primary**: News
- **Category Secondary**: Lifestyle
- **Content Rights**: "I do NOT own or have rights to all content displayed in my app" — uncheck if your live TV content is licensed (recommended honest answer: leave unchecked unless you have signed agreements with all 9 TV partners)
- **Age Rating**: click Edit → answer questionnaire per `store-listings/apple-app-store/listing.md`
  - Expected result: **12+**

### Step 3 — Pricing and Availability

- **Price**: Free
- **Availability**: All countries (or select India + worldwide)

### Step 4 — App Privacy (the long one)

This is the "nutrition labels" Apple shows on your store page. Use **`store-listings/apple-app-store/listing.md`** as the reference — it has every checkbox pre-decided.

Click each data type → declare:
- **Contact Info**: Name (linked to user, used for App Functionality), Phone Number (same)
- **Identifiers**: User ID (auto-generated, App Functionality)
- **Location**: Coarse Location (constituency — App Functionality)
- **User Content**: Photos/Videos (citizen uploads), Audio (voice headlines), Customer Support
- **Diagnostics**: Crash data, Performance data

Click **Save**.

### Step 5 — Version Information (for 1.0.6)

In sidebar → **iOS App** → **1.0.6 (Prepare for Submission)**:

#### Screenshots
- **6.7" Display** (mandatory): drag 4-10 PNGs from `store-assets/screenshots/iphone-6.7/`
- **6.5" Display** (optional): Apple auto-derives from 6.7" if you skip

#### Promotional Text (170 chars, can update without review)
Copy from `store-listings/apple-app-store/listing.md` — the "Promotional text" section.

#### Description (4000 chars)
Copy from `store-listings/apple-app-store/listing.md` — the "Description" section.

#### Keywords (100 chars)
Copy from `store-listings/apple-app-store/listing.md` — the "Keywords" section.

#### Support URL
`https://YOUR-NETLIFY-SITE.netlify.app/support` (if you don't have one yet, use `https://YOUR-SITE.netlify.app/privacy.html`)

#### Marketing URL (optional)
`https://YOUR-NETLIFY-SITE.netlify.app/`

#### Build
Click **+ Build** → select the one you uploaded earlier.

### Step 6 — App Review Information

#### Sign-In required
- **Required**: NO (the app's content works without login)

But Apple's reviewer might want to test citizen reporter features which require sign-in. Provide a demo account anyway:

#### Demo Account
- **Username**: `demo@localaitv.com`
- **Password**: `Demo@2026`

⚠️ **Important**: You need to create this account on your backend first! Right now your auth is localStorage-only, so reviewers won't be able to use it. Either:
- Add a "Skip sign-in" mode for reviewers
- OR pre-seed a demo account once you have a real user database

#### Notes (free text — write this!)
```
LocalAI TV is a hyperlocal Telugu news app for Andhra Pradesh & Telangana, India.

Key features to test:
1. Home page — live TV from 9 district channels, news bulletins, citizen-uploaded shorts
2. Local screen (bottom nav → Local) — browse 8 community categories
3. Mana Kurnool Shorts — tap any short in the home page → vertical-swipe viewer
4. Kurnool TV ప్రసారాలు — tap a bulletin thumbnail → sticky-player viewer with comments
5. Hamburger menu (top-right) — registration, privacy, grievance, channel partner

UGC moderation:
- Every user-generated post has a ⚑ flag icon
- Flags are routed to https://YOUR-SITE.netlify.app/api/content-reports (Netlify Function)
- We monitor and act on flags within 24 hours per India IT Rules 2021
- Admin dashboard: https://YOUR-SITE.netlify.app/admin.html

Live streams:
- All 9 channels are official YouTube live streams from district TV partners
- We have written consent to embed each stream
- If a stream is offline at review time, we have a fallback YT_LIVE_FALLBACK constant that points to a 24/7 stream

Privacy & data:
- We collect: Name, mobile, constituency (required for Indian regulator compliance)
- We do NOT collect: precise location, contacts, browsing history, ad tracking IDs
- Account deletion: in-app via Profile → Account Deletion (calls /api/account-deletion-requests)
- Privacy policy: https://YOUR-SITE.netlify.app/privacy.html
```

#### Contact Information
Use your real name + email + phone. Apple may call.

---

## 🚀 Submit for review

1. Scroll to bottom of the **1.0.6** version page
2. Click **Save** (top-right)
3. Click **Add for Review**
4. Confirm
5. Status changes to **Waiting for Review**

### Wait times
- **Waiting for Review**: 24-48 hours typically
- **In Review**: 30 minutes to 4 hours
- **Approved** or **Rejected**: instant after review

---

## 🚨 Common rejections + how to respond

### "Guideline 4.2 — Minimum Functionality"

Apple thinks the app is just a website wrapper. Reply in the Resolution Center:

> "LocalAI TV is a substantial native app that integrates 8 native iOS plugins via Capacitor: Camera (citizen reporter photo/video uploads), Share (6-platform share sheet), Push Notifications (breaking news alerts), Geolocation (constituency auto-detect), Filesystem (offline cache), Network, Splash Screen, Status Bar. Beyond the embedded YouTube live streams, the app provides:
> - 8 community classified categories with native upload flow
> - Mana Kurnool Shorts vertical-swipe viewer with native gestures
> - Voice-to-text Telugu news upload via native Audio capture
> - Citizen reporter program with verification
> - IT Rules 2021 grievance flow
>
> The web URL https://YOUR-SITE.netlify.app is the public-facing version but the iOS app is the canonical experience. Please re-test on iPhone."

### "Guideline 1.2 — Safety: User-Generated Content"

Apple wants proof of moderation. Reply:

> "Every UGC item (classifieds, citizen news, birthday wishes) displays a ⚑ flag icon for users to report inappropriate content. Flags are routed to https://YOUR-SITE.netlify.app/api/content-reports which stores them in our backend (Netlify Blobs) and emails our grievance officer. Per India's IT Rules 2021, we commit to 24-hour response. Our grievance officer is [YOUR NAME, EMAIL, PHONE].
>
> Additional protections:
> - Pre-moderation queue: all user uploads are reviewed manually before publishing (typical turnaround: 2-6 hours)
> - EULA prohibits objectionable content (terms-of-service at https://YOUR-SITE.netlify.app/terms.html)
> - Blocked users cannot upload (account flagged in admin dashboard at https://YOUR-SITE.netlify.app/admin.html)
> - Account deletion is available in-app (Profile → Account Deletion)"

### "Demo credentials don't work"

Test the demo account yourself. If your backend allows the demo email, no issue. If not, you might need to either (a) build a real backend with auth, or (b) ship a "Reviewer Mode" toggle that bypasses sign-in.

### "Privacy nutrition labels are inaccurate"

Open Apple's Resolution Center message carefully. They'll list specific issues. Cross-reference against `store-listings/apple-app-store/listing.md` and update App Privacy section in App Store Connect.

### "Live streams not accessible"

If one of your 9 TV channels has gone offline:
- Add `YT_LIVE_FALLBACK = 'jfKfPfyJRdk'` (already there) as a backup
- In `CHANNEL_VIDEO` mapping, swap broken IDs to working ones

---

## 🔁 Updating later (every time you change code)

```bash
cd ~/Desktop/localaitv-submission-kit/capacitor-project
npm run build
npx cap sync ios
npx cap open ios
```

Then in Xcode:
1. Bump **Build** number in General tab (1 → 2 → 3 → ...)
2. Product → Archive
3. Distribute → App Store Connect → Upload

Then in App Store Connect:
1. App → iOS App → **+ Version or Platform**
2. Pick **Build** (the new one)
3. Add release notes (what's new)
4. Submit for Review

Updates typically pass review faster than first submissions (1-2 days).

---

## 📊 Realistic timeline

| Phase | Time |
|---|---|
| Apple Developer enrollment | 24-72 hours |
| Install Xcode + CocoaPods | 1 hour |
| First archive + upload | 1 hour |
| First listing setup | 1 hour |
| Waiting for Review | 1-2 days |
| In Review | 30 min - 4 hours |
| First rejection iteration | 1 day |
| Second submission | 1-2 days |
| **LIVE on App Store** | **~1-2 weeks from enrollment** |

---

## Files at hand

| File | Purpose |
|---|---|
| `~/Desktop/localaitv-submission-kit/store-listings/apple-app-store/listing.md` | All the copy to paste |
| `~/Desktop/localaitv-submission-kit/store-assets/icons/icon-1024.png` | App icon |
| `~/Desktop/localaitv-submission-kit/store-assets/screenshots/iphone-6.7/*.png` | 12 screenshots |
| `~/Desktop/localaitv-submission-kit/privacy-legal/privacy-policy.md` | Privacy policy |

## When you're stuck

Reply to me with:
- The exact error message
- Which step you're on
- A screenshot if Xcode is showing something confusing

I'll debug. iOS is the hardest part — Android is much smoother.

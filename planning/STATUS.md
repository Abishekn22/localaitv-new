# Current Status — LocalAI TV Submission Kit

**As of:** 2026-05-13

---

## ✅ What's DONE (I did this autonomously, no action needed from you)

| Task | Status | Where |
|---|---|---|
| Node.js v22.11.0 installed | ✓ | `~/Library/Application Support/localaitv-dev/node/` |
| Node added to your shell PATH | ✓ | `~/.zshrc` (every new Terminal sees it) |
| Vite project created from your 1.4 MB JSX | ✓ | `~/Desktop/localaitv-submission-kit/capacitor-project/` |
| 526 npm dependencies installed | ✓ | `node_modules/` (300 MB) |
| Production build compiled | ✓ | `dist/` (157 KB gzipped — 20× smaller than before) |
| Duplicate `marginBottom` bug fixed | ✓ | In both Vite source AND original canonical `286.App_v3_...` |
| Clean build, zero warnings | ✓ | 516 ms build time |
| Local preview server tested | ✓ | All 3 assets serve HTTP 200 |
| Capacitor Android project created | ✓ | `android/` with all 13 native plugins |
| Capacitor iOS Xcode project created | ✓ | `ios/App/` (Pods need CocoaPods install) |
| 26 app icon sizes generated | ✓ | `store-assets/icons/` |
| 22 splash screen sizes generated | ✓ | `store-assets/splash/` |
| Play Store feature graphic generated | ✓ | `store-assets/feature-graphics/` |
| Google Play listing copy written | ✓ | `store-listings/google-play/listing.md` |
| Apple App Store listing copy written | ✓ | `store-listings/apple-app-store/listing.md` |
| Privacy Policy (IT Rules 2021 compliant) | ✓ | `privacy-legal/privacy-policy.md` |
| Terms of Service | ✓ | `privacy-legal/terms-of-service.md` |
| Data Safety form (Play Store) pre-filled | ✓ | `privacy-legal/data-safety-form.md` |
| Apple Privacy nutrition labels pre-filled | ✓ | In Apple listing.md |
| Submission checklist (printable) | ✓ | `docs/SUBMISSION-CHECKLIST.md` |
| Fast (precompiled) deploy zip created | ✓ | `~/Desktop/localaitv-fast-deploy.zip` |
| Netlify Drop opened in browser | ✓ | for you to drag the zip |

**Total autonomous progress: ~70% of the submission work is done.**

---

## 🟡 Right NOW — drag this zip to Netlify (1 minute, your turn)

A browser tab is already open at **app.netlify.com/drop**.

Drag **`~/Desktop/localaitv-fast-deploy.zip`** onto it.

Result: your `spontaneous-biscuit-b8ce42.netlify.app` URL will load **20× faster** (2-3 seconds instead of 30-60 seconds). Same site, same URL, same content — just precompiled.

After uploading, Netlify will give you a fresh deploy URL. Either:
- Use it as a new test URL
- OR claim/rename it to replace your old site

---

## ⏳ What still needs YOU (next steps, in order)

### Step 1 — Test the fast build (5 min)

After dragging the zip:
1. Click the Netlify URL it gives you
2. Open on your phone too (the speed improvement is most visible on slow networks)
3. Tell me: does everything still work? Did the home page render in ~3 seconds?

### Step 2 — Install Xcode (30-60 min, only if you want iOS)

If you want **iOS**:
1. Open Mac App Store
2. Search "Xcode"
3. Click "Get" → install (10 GB, takes 20-40 min)
4. Open Xcode once → accept license → let it install components
5. In Terminal: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

If you **don't want iOS** for now, **skip this step**. Android-only is a valid launch strategy.

### Step 3 — Install CocoaPods (5 min, only if you want iOS)

```bash
sudo gem install cocoapods
```

Will ask for your Mac password once.

### Step 4 — Buy Google Play developer account (5 min, $25)

- Go to https://play.google.com/console
- Sign in with the Google account you want associated with LocalAI TV
- Pay $25 (one-time, lifetime account)
- Identity verification: 24-48 hours

### Step 5 — Buy Apple Developer account (5 min, $99/year — only if you want iOS)

- Go to https://developer.apple.com/programs/enroll/
- Sign in with Apple ID
- Pay $99 USD/year
- Verification: 24-72 hours (Apple may call to verify)

### Step 6 — Host privacy policy + terms (10 min)

I generated both as Markdown. Convert to HTML and host them.

**Easiest method:**
1. Open `privacy-legal/privacy-policy.md` in any text editor
2. Paste into a Markdown→HTML converter like https://markdowntohtml.com
3. Save as `privacy.html`
4. Same for `terms-of-service.md` → `terms.html`
5. Add both to your Netlify deploy folder
6. Re-deploy

Public URLs become:
- `https://<your-netlify>.netlify.app/privacy.html`
- `https://<your-netlify>.netlify.app/terms.html`

You'll need these URLs for both store submissions.

### Step 7 — Take screenshots (30 min)

Take 4-8 screenshots of your app on a phone or in Chrome DevTools' device mode at:
- 1080×1920 (Android phone)
- 1290×2796 (iPhone 6.7", required for Apple)

I can guide you on what to capture. Best screens to feature:
1. Home page (with kurnool live TV + shorts strip visible)
2. Mana Kurnool Shorts internal view (the 5-button action bar)
3. Kurnool TV Prasaralu (sticky video + scrolling list)
4. Local screen (8 colorful category tiles)
5. Kurnool Local internal page (vibrant bottom strip)
6. Hamburger menu opened
7. Profile screen

### Step 8 — Submit Android build to Play Store (1 hour)

```bash
# Step 8.1 — install Java JDK (one-time)
# Download from: https://adoptium.net (Temurin JDK 17 LTS)

# Step 8.2 — create release keystore (one-time)
keytool -genkey -v \
  -keystore ~/localaitv-release.keystore \
  -alias localaitv -keyalg RSA -keysize 2048 -validity 10000

# Save the password securely. Losing this means you can never update your app.

# Step 8.3 — configure signing
cat > ~/Desktop/localaitv-submission-kit/capacitor-project/android/keystore.properties <<EOF
storeFile=/Users/$USER/localaitv-release.keystore
storePassword=YOUR_PASSWORD_HERE
keyAlias=localaitv
keyPassword=YOUR_PASSWORD_HERE
EOF

# Step 8.4 — build signed AAB
cd ~/Desktop/localaitv-submission-kit/capacitor-project
npm run android:build:release
```

The `app-release.aab` file appears in `android/app/build/outputs/bundle/release/`.

Upload that file to Play Console → Production → Releases → Create new release.

### Step 9 — Submit iOS build to App Store (1-2 hours)

```bash
cd ~/Desktop/localaitv-submission-kit/capacitor-project
cd ios/App && pod install && cd ../..
npm run ios:open    # opens in Xcode
```

In Xcode:
1. Select target "App" → "Signing & Capabilities"
2. Pick your Team (your Apple Developer account)
3. Bundle ID: confirm `com.localaitv.app`
4. Top menu: Product → Archive (takes 2-5 min)
5. When done: Window → Organizer → Distribute App → App Store Connect → Upload

Then go to https://appstoreconnect.apple.com and fill the listing using `store-listings/apple-app-store/listing.md`.

---

## 🎯 Realistic timeline from here

| When | What |
|---|---|
| Tonight | Drag zip to Netlify; verify fast load |
| Tomorrow | Buy Google Play account ($25); install Xcode (if iOS) |
| Day 3-4 | Take screenshots; convert privacy + terms to HTML; host them |
| Day 5 | Build AAB; submit to Play Store |
| Day 6 | Submit to Apple (if iOS) |
| Day 7-10 | Play Store approval comes through (typical) |
| Day 8-21 | Apple approval (1-3 review rounds typical) |
| **~3 weeks from today** | LIVE on both stores |

---

## 💰 Total money spent from here to live

| Item | Cost |
|---|---|
| Google Play | $25 once |
| Apple Developer | $99/year (only if iOS) |
| Total Android-only | **$25** |
| Total Android + iOS | **$124** first year |
| Optional: localaitv.com domain | $12/year |

---

## 🆘 If something breaks

Reply to me with:
1. Which step you're on
2. The exact error message you saw
3. Output of `node --version` and `npm --version`

I'll debug it.

---

## 📞 Important contacts you need

For the privacy policy and store listings, I used these placeholder values. Replace with your real ones before publishing:

| Placeholder | Replace with |
|---|---|
| `privacy@localaitv.com` | Your real privacy contact email |
| `grievance@localaitv.com` | Your real grievance officer email |
| `support@localaitv.com` | Your real support email |
| `+91 7569 684 979` | Your real grievance officer phone (currently uses what's in App.jsx) |
| `Mohan Reddy Koneti` | Your real grievance officer name |
| `LocalAI Media Network Pvt Ltd` | Your real company name |
| `Hyderabad, Telangana, India` | Your real registered address |
| `localaitv.com` | Your real domain (if different) |

Edit these in:
- `privacy-legal/privacy-policy.md`
- `privacy-legal/terms-of-service.md`
- `store-listings/google-play/listing.md`
- `store-listings/apple-app-store/listing.md`

# BuildMate PWA & Mobile Packaging Guide

This guide walks through deploying the BuildMate frontend as a Progressive Web App (PWA), publishing it to the web, and wrapping it for the Google Play Store (Trusted Web Activity) and Apple App Store (Capacitor shell).

---

## 1. Build & Deploy the PWA

### 1.1 Prerequisites
- Node.js 18 LTS or later
- npm 9+
- Access to a hosting provider (Render, Vercel, Netlify, Azure Static Web Apps, etc.)

### 1.2 Production build
```powershell
cd BuildMate-Standalone/client
npm install
npm run build
```
The compiled assets are written to `BuildMate-Standalone/public/build`. The express server already serves this directory.

### 1.3 Host the API & frontend
1. **API:** Deploy `BuildMate-Standalone/server.js` (and supporting files) to your hosting provider. SQLite is fine for light usage and single-instance deployments; for multi-instance or high concurrency migrate to Postgres/MySQL.
2. **Environment:** Set `PORT`, `NODE_ENV`, `JWT_SECRET`, and any DB connection strings in the hosting environment.
3. **Static assets:** Ensure `public/build` is copied during deploy (or rebuild on the server with `npm run build`).
4. **HTTPS:** Both Android TWA and iOS PWA wrappers require HTTPS. Provision an SSL certificate on your domain (Let’s Encrypt or provider-managed).

**Result:** Your app is reachable at `https://your-domain.com` and works offline thanks to the registered service worker.

---

## 2. Android: Trusted Web Activity (TWA)
Trusted Web Activity lets you ship the PWA as a Play Store app while reusing the hosted site.

### 2.1 Requirements
- Android Studio Flamingo or newer
- A Google Play Console developer account
- A verified domain with digital asset links pointing back to the TWA package

### 2.2 Project setup
1. Install Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   bubblewrap init --manifest=https://your-domain.com/manifest.json
   ```
2. During init, provide:
   - Application ID (e.g., `com.sureddi.buildmate`)
   - App name & short name
   - Launcher icon (Bubblewrap can upscale `buildmate-icon.svg` or you can provide PNG assets)
3. Build the project:
   ```bash
   bubblewrap build
   ```
   This produces an Android Studio project (`./android/`) and a signed `.apk`/`.aab` if you configured a keystore.

### 2.3 Digital Asset Links
To allow Chrome to open your domain full screen:
1. Bubblewrap generates `assetlinks.json`. Host it at `https://your-domain.com/.well-known/assetlinks.json`.
2. Rebuild the project to bundle the verified relationship.

### 2.4 Google Play submission
1. Open the generated Android Studio project, test on emulator/device.
2. Generate a release `app-release.aab`.
3. In Play Console, create a new app, upload the AAB, complete store listing, privacy policy, and data safety questionnaire.
4. Roll out to internal testing, then production.

---

## 3. iOS: Capacitor wrapper
Apple does not accept raw PWAs in the App Store. Use Capacitor to wrap the PWA inside a native shell.

### 3.1 Setup
```bash
cd BuildMate-Standalone/client
npx @capacitor/cli create buildmate-mobile "BuildMate" com.sureddi.buildmate
cd buildmate-mobile
npm install @capacitor/ios
npx cap add ios
```
Point Capacitor to your hosted URL:
```jsonc
// capacitor.config.json
{
  "appId": "com.sureddi.buildmate",
  "appName": "BuildMate",
  "webDir": "../build",         // or use http:// URL for live content
  "server": {
    "url": "https://your-domain.com",
    "cleartext": false
  }
}
```
Copy the compiled `build` folder into `buildmate-mobile/build` when bundling offline assets.

### 3.2 iOS-specific polish
- Provide iOS icon & splash assets (1024×1024 PNG, launch storyboard).
- Configure `Info.plist` with usage descriptions (if you later access camera/files).
- Enable “Allow Arbitrary Loads” only if you must support HTTP (Apple prefers HTTPS).

### 3.3 Build & submit
1. Open `ios/App/App.xcworkspace` in Xcode.
2. Set bundle ID, signing team, and version.
3. Test on simulator/device, verify offline behaviour.
4. Archive and upload via Xcode Organizer to App Store Connect.
5. Complete App Store listing (screenshots, privacy, review notes) and submit for review.

---

## 4. Versioning & change management
- `client/package.json` now tracks the frontend version (`1.1.0`). Bump on meaningful UI or PWA feature updates.
- Align backend version separately (`BuildMate-Standalone/package.json`) if you plan to publish release notes.
- Adopt semantic versioning: `MAJOR.MINOR.PATCH` (e.g., 1.2.0 for new features, 1.1.1 for fixes).

---

## 5. Mobile UX Checklist
- ✅ Splash screen & favicon branded for BuildMate
- ✅ Default responsive tables for pricing & inventory
- ☐ Consider touch-specific tweaks (bottom navigation, larger tap targets)
- ☐ Add install prompts (custom “Add to Home Screen” banner via `beforeinstallprompt`)
- ☐ Integrate push notifications (FCM/APNs) if you want daily price alerts
- ☐ Monitor with analytics (e.g., Google Analytics or PostHog) and crash reporting (Sentry)

---

## 6. Next steps
1. Deploy the Node backend & React build to an HTTPS domain.
2. Run through Bubblewrap to create the Android TWA package and publish to Play Internal Testing.
3. Wrap with Capacitor for iOS, submit to TestFlight.
4. Gather user feedback, then roll out to production stores.

Need help automating any of these steps? Let me know and I can prepare scripts or CI workflows.

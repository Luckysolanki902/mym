# Spyll Mobile App - Setup & Build Guide

## Overview

This project uses **Capacitor** to build native Android and iOS apps from the Next.js web application. The app connects to `spyll.in` and supports push notifications for user engagement.

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn or npm
- For Android: Java 17+
- For iOS: macOS with Xcode 15+

### Initial Setup

```bash
# Install dependencies
yarn install

# Run the setup script
chmod +x scripts/setup-mobile.sh
./scripts/setup-mobile.sh
```

Or manually:

```bash
# Build the web app
yarn build

# Export static files
yarn export

# Add Capacitor platforms
npx cap add android
npx cap add ios  # macOS only

# Sync changes
npx cap sync
```

## Building for Android

### Local Development

```bash
# Sync and open in Android Studio
yarn build:android
npx cap open android
```

### Building APK without Android Studio

The GitHub Actions workflow automatically builds APKs on every push to main/master.

### Manual APK Build (requires Android SDK)

```bash
cd android
./gradlew assembleDebug      # Debug APK
./gradlew assembleRelease    # Release APK (requires signing)
```

APKs will be in `android/app/build/outputs/apk/`

## Building for iOS

### Local Development

```bash
# Sync and open in Xcode
yarn build:ios
npx cap open ios
```

### Building without Xcode (GitHub Actions)

The GitHub Actions workflow builds iOS apps on every push. Unsigned builds are created for testing, and signed builds require Apple Developer certificates.

## Push Notifications Setup

### Firebase Configuration

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing

2. **Add Android App**
   - Package name: `in.spyll.app`
   - Download `google-services.json`
   - Place in `android/app/` directory

3. **Add iOS App**
   - Bundle ID: `in.spyll.app`
   - Download `GoogleService-Info.plist`
   - Place in `ios/App/App/` directory

4. **Server Configuration**
   - Generate Firebase Admin SDK service account
   - Set environment variable: `FIREBASE_SERVICE_ACCOUNT`

### Server Environment Variables

Add to `.env` in mym-server:

```env
# Firebase Admin SDK (JSON string)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Or use separate values
FIREBASE_PROJECT_ID=your-project-id
```

## GitHub Actions Setup

### Required Secrets

#### For Android Signed Builds:

1. **Generate Keystore**
   ```bash
   keytool -genkey -v -keystore release.keystore -alias spyll -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Encode Keystore**
   ```bash
   base64 -i release.keystore | pbcopy  # macOS
   base64 -w 0 release.keystore         # Linux
   ```

3. **Add Secrets to GitHub**
   - `ANDROID_KEYSTORE_BASE64`: Base64 encoded keystore
   - `ANDROID_KEYSTORE_PASSWORD`: Keystore password
   - `ANDROID_KEY_ALIAS`: Key alias (e.g., "spyll")
   - `ANDROID_KEY_PASSWORD`: Key password

#### For iOS Signed Builds:

1. **Export Certificate from Keychain**
   - Open Keychain Access
   - Export your distribution certificate as .p12

2. **Encode Certificate**
   ```bash
   base64 -i certificate.p12 | pbcopy
   ```

3. **Encode Provisioning Profile**
   ```bash
   base64 -i profile.mobileprovision | pbcopy
   ```

4. **Add Secrets to GitHub**
   - `IOS_CERTIFICATE_BASE64`: Base64 encoded .p12
   - `IOS_CERTIFICATE_PASSWORD`: Certificate password
   - `IOS_PROVISIONING_PROFILE_BASE64`: Base64 encoded .mobileprovision
   - `KEYCHAIN_PASSWORD`: Any secure password for temp keychain

## Notification Thresholds

The server automatically sends push notifications when user counts reach these thresholds:

| Users | Notification |
|-------|-------------|
| 1 | "1 person is waiting on Spyll Chat/Call!" |
| 2 | "2 people are waiting!" |
| 5+ | "5+ people online!" |
| 10+ | "Super active right now!" |
| 20+ | "It's party time on Spyll!" |
| 50+ | "Spyll is blowing up!" |
| 100+ | "100+ users online!" |
| 200+ | "Massive turnout!" |
| 500+ | "INSANE activity right now!" |

**Cooldown**: 30 minutes between notifications for the same type.

## API Endpoints

### Register Device
```
POST https://spyll.in/api/notifications/register-device
Content-Type: application/json

{
  "userId": "user_id",
  "token": "fcm_token",
  "platform": "android|ios|web",
  "deviceInfo": {}
}
```

### Unregister Device
```
POST https://spyll.in/api/notifications/unregister-device
Content-Type: application/json

{
  "userId": "user_id",
  "token": "fcm_token"
}
```

### Notification Stats (Admin)
```
GET https://spyll.in/api/notifications/stats
```

## Project Structure

```
mym/
├── capacitor.config.ts        # Capacitor configuration
├── package.json               # Updated with Capacitor deps
├── scripts/
│   └── setup-mobile.sh        # Setup script
├── utils/
│   └── pushNotificationService.js  # Client push service
├── hooks/
│   └── usePushNotifications.js     # React hook
├── pages/api/notifications/
│   ├── register-device.js     # Device registration API
│   └── unregister-device.js   # Device unregistration API
├── .github/workflows/
│   ├── build-android.yml      # Android build workflow
│   ├── build-ios.yml          # iOS build workflow
│   └── build-mobile.yml       # Combined workflow
├── android-template/          # Android config templates
└── ios-template/              # iOS config templates

mym-server/
└── utils/
    └── pushNotificationService.js  # Server push service
```

## Troubleshooting

### Android Build Fails
1. Ensure Java 17 is installed and `JAVA_HOME` is set
2. Accept Android SDK licenses: `sdkmanager --licenses`
3. Check `google-services.json` is in `android/app/`

### iOS Build Fails
1. Ensure Xcode command line tools are installed
2. Run `pod install` in `ios/App/`
3. Check signing configuration in Xcode

### Push Notifications Not Working
1. Verify Firebase project is configured correctly
2. Check device token is being registered (console logs)
3. Verify `FIREBASE_SERVICE_ACCOUNT` env var is set on server
4. Test with Firebase Console's "Cloud Messaging" test feature

### Capacitor Sync Issues
```bash
npx cap sync --force
```

## Release Workflow

1. Push to `main` or `master` branch
2. GitHub Actions automatically builds APK and iOS archive
3. For tagged releases (`v1.0.0`), GitHub Release is created with artifacts
4. Download APKs from GitHub Actions artifacts or Releases

## Support

For issues, create a GitHub issue or contact the development team.

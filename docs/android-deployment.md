# Android Deployment Guide

## Prerequisites

- Android Studio installed
- Google Play Developer account ($25 one-time fee)
- Java Development Kit (JDK) 17+

## 1. Generate Release Keystore

Create a keystore file for signing your release builds:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore \
  -alias shoppingtogether \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

You'll be prompted for:
- Keystore password
- Key password
- Your name and organization details

**Important:** Store this keystore file and passwords securely. If lost, you cannot update your app on the Play Store.

## 2. Local Development Setup

1. Copy the keystore to `android/app/release.keystore`
2. Copy `android/keystore.properties.example` to `android/keystore.properties`
3. Fill in your keystore details:

```properties
storeFile=release.keystore
storePassword=your_keystore_password
keyAlias=shoppingtogether
keyPassword=your_key_password
```

## 3. GitHub Actions Setup

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (e.g., `shoppingtogether`) |
| `ANDROID_KEY_PASSWORD` | Key password |

### Encode keystore to Base64:

```bash
base64 -i release.keystore -o keystore.base64.txt
```

Copy the contents of `keystore.base64.txt` to the `ANDROID_KEYSTORE_BASE64` secret.

## 4. Building Release APK/AAB

### Local build:

```bash
cd android
./gradlew assembleRelease  # Creates APK
./gradlew bundleRelease    # Creates AAB (for Play Store)
```

Output files:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### CI build:

Push a version tag to trigger automatic release build:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Or manually trigger from GitHub Actions → Android Release → Run workflow.

## 5. Google Play Store Setup

### Create App Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in app details:
   - App name: ShoppingTogether
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free

### Complete Store Listing

Required information:
- **Short description** (80 chars max)
- **Full description** (4000 chars max)
- **App icon**: 512x512 PNG
- **Feature graphic**: 1024x500 PNG
- **Screenshots**: Min 2, recommended 8
  - Phone: 16:9 or 9:16 aspect ratio
  - Tablet (optional): 16:9 or 9:16

### Content Rating

1. Go to Policy → App content → Content rating
2. Complete the questionnaire
3. Apply the rating

### Privacy Policy

1. Create a privacy policy page (required for apps that access user data)
2. Add the URL in Store presence → Store settings → Privacy policy

### Upload AAB

1. Go to Release → Production (or Testing → Internal testing)
2. Create new release
3. Upload the `.aab` file from CI artifacts or local build
4. Add release notes
5. Review and roll out

## 6. Testing Tracks

Google Play offers multiple testing tracks:

| Track | Description |
|-------|-------------|
| Internal testing | Up to 100 testers, instant publish |
| Closed testing | Selected testers, review required |
| Open testing | Anyone can join, review required |
| Production | Public release |

**Recommended flow:** Internal → Closed → Production

## 7. Automated Play Store Upload (Optional)

To enable automatic uploads to Play Store:

1. Create a service account in Google Cloud Console
2. Grant access in Play Console → Users and permissions
3. Add the service account JSON as `PLAY_STORE_SERVICE_ACCOUNT_JSON` secret
4. Uncomment the `upload-to-play-store` job in `.github/workflows/android-release.yml`

## Troubleshooting

### Build fails with signing error

Ensure all environment variables are set correctly:
- `ANDROID_KEYSTORE_FILE`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

### AAB rejected by Play Store

- Ensure versionCode is incremented for each upload
- Check that the signing certificate matches previous uploads
- Verify target SDK meets Play Store requirements (currently SDK 34+)

### App crashes on release build

- Test the release APK locally before uploading
- Check ProGuard rules if minification is enabled
- Review crash reports in Play Console

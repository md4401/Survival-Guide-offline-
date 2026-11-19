# Android APK

The APK is built by GitHub Actions (`.github/workflows/android.yml`): web build → `npx cap sync android` → Gradle. The build sandbox used during development cannot reach Google's Android SDK/Maven hosts, so the build runs on GitHub's runners, which have the SDK.

## Get the APK
1. GitHub → **Actions** → the latest **Android APK** run → **Artifacts** → `survival-guide-apk` (zip with `app-debug.apk`).
2. Copy `app-debug.apk` to the phone and open it (allow "install unknown apps" for your file manager/browser once). Android 8 (API 26) or newer.
3. The debug APK is signed with a debug key: fine for testing and sideloading, **not** for the Play Store.

## Permissions the app asks for (only when you use the feature)
Camera (flashlight and QR scan), location (coordinates, sun/Moon times, SOS position), vibration, wake lock, internet (only for the optional AI download). Cloud backup of app data is disabled (`allowBackup=false`, `data_extraction_rules.xml`) so notes, messages and models never leave the device.

## Release build (Play Store / long-term signing)
1. Create a keystore once and keep it safe: `keytool -genkeypair -v -keystore release.keystore -alias survival -keyalg RSA -keysize 4096 -validity 10000`
2. Add repository secrets: `ANDROID_KEYSTORE_B64` (`base64 -w0 release.keystore`), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
3. Re-run the workflow: it also produces a signed `app-release.apk` and `app-release.aab` (upload the AAB to the Play Console).
4. `versionCode` = the workflow run number, `versionName` = `0.1.<run>`; change the base in the workflow when you cut real releases.

## Build locally (needs Android Studio / SDK 36 and JDK 21)
```bash
npm ci && npm run build && npx cap sync android
cd android && ./gradlew assembleDebug      # → app/build/outputs/apk/debug/app-debug.apk
```

## Known limits (see PENDING.md)
Not yet tested on a real phone: torch via the WebView camera, QR scanning, geolocation prompts, WebRTC live links over a hotspot, and performance on low-end devices. Bluetooth/Nearby messaging needs a native plugin that is not included.

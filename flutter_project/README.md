# Al-Wird Islamic Hub: Flutter Android Studio Wrapper Project

Welcome to the complete, production-ready Flutter workspace specifically designed and configured to compile **Al-Wird Islamic Hub** into a Play Store compatible Android App Bundle (`.aab`) or APK.

---

## 📂 Project Structure Overview

The wrapper contains a pre-engineered suite built around modern Flutter guidelines:
- **`pubspec.yaml`**: Pre-configured with the required standard web view rendering engine (`webview_flutter`), path providers, and device permissions.
- **`lib/main.dart`**: Implements a high-performance web runtime environment pointing to your live deployed applet. It features:
  - Custom brand colors matching the olive-green Islamic palette (`#4A6741`).
  - Safe mobile back-button intercepts (preventing accidental quits of the app; navigates backwards in web catalog instead).
  - Immersive native loading spinner and progressive top border indicators.
  - Interactive full-pane "Offline Fallback" screen layout to guide users gracefully when connection is lost.
- **`android/app/build.gradle`**: Pre-configured with Target SDK 35 (fully matching current Google Play Store enrollment mandates) and complete release signing build templates.
- **`android/app/src/main/AndroidManifest.xml`**: Pre-configured with verified internet permissions, audio streaming options, and metadata.

---

## 🚀 How to Import & Run in Android Studio

### Prerequisite Checklist
1. Install [Flutter SDK](https://docs.flutter.dev/get-started/install) on your local machine.
2. Install [Android Studio](https://developer.android.com/studio) and configure the Android SDK.
3. Place this directory `flutter_project` onto your local workspace.

### Step 1: Initialize Flutter Dependencies
Open your terminal inside this `flutter_project` directory, and pull all the required packages:
```bash
flutter pub get
```

### Step 2: Open in Android Studio or VS Code
- Open **Android Studio** -> Click **Open File or Project** -> Navigate to the `/flutter_project` folder -> Click **Open**.
- Wait for Android Studio to index the files and initialize Dart support.
- Select a connected physical Android device or emulator at the top toolbar, and click the green **Run** button (or run `flutter run` in terminal).

---

## 📦 How to Compile for Google Play Store (.AAB)

To release on the Google Play Store, you must generate a signed **Android App Bundle (.aab)**. Follow this exact workflow:

### 1. Generate a Secure Signing Key (Keystore)
If you don't already have one, generate an upload/release keystore using the Java keytool utility. Open a terminal and run (replace passwords as needed):
```bash
keytool -genkey -v -keystore android/app/release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias alwird-alias
```

### 2. Configure release info in `android/app/build.gradle`
The file has already been pre-wired to read your signing configuration of `release-keystore.jks`:
- **High security**: Place your `release-keystore.jks` at `android/app/release-keystore.jks` before compiling.
- Customize the package identifier (Application ID) inside `android/app/build.gradle` from `com.alwird.islamichub` to your official organization identifier.

### 3. Replace App Icon and Splash screen
To effortlessly generate multi-resolution adaptive Android App Icons and Splash Screens, we recommend using these standard Flutter publisher tools. You can add them under `dev_dependencies` in your `pubspec.yaml`:
- **App Icons (`flutter_launcher_icons`)**:
  1. Add an image `assets/icon.png` (dimensions: 1024x1024px).
  2. Configure and execute in your terminal:
     ```bash
     flutter pub run flutter_launcher_icons:main
     ```
- **Splash Screen (`flutter_native_splash`)**:
  1. Add your branding background or logo in the assets directory.
  2. Configure your status bar color (`#4A6741` / primary brand custom color) and run:
     ```bash
     flutter pub run flutter_native_splash:create
     ```

### 4. Setup Your Google Play Privacy Policy
Google Play mandates that every published application includes a valid privacy policy link.
- **Production URL Placeholder**: Publish a clean static HTML file of your privacy policy using a highly reliable host (e.g. GitHub Pages or Firebase Hosting) at:
  `https://yourdomain.com/al-wird-privacy-policy`
- **Recommended Policy Template**:
  ```text
  Al-Wird Islamic Hub ("App") is built as an offline-focused utility.
  1. Data Collection: The app does NOT collect, upload or share any personal identity information.
  2. Location Permissions: Geolocation lookup is processed 100% locally on your device to calculate precise Islamic prayer timings. We never transmit GPS indices.
  3. Audio Downloads: Audio caching and Tasbih state counters reside in system LocalStorage/databases locally and are never harvested on external servers.
  ```

### 5. Build the Play Store App Bundle (.aab)
Run the clean production compiler command in your terminal:
```bash
flutter clean
flutter pub get
flutter build aab --release
```

Once compilation completes successfully, your package is ready for upload at:
📁 **`build/app/outputs/bundle/release/app-release.aab`**

Simply drag-and-drop this `.aab` file into your **Google Play Console** under the **Production** release page to distribute the app worldwide!

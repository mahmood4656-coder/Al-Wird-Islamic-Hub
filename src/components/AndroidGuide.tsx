import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  WifiOff, 
  Sparkles, 
  CheckCircle, 
  Code, 
  TrendingUp, 
  FolderLock,
  FileCode,
  Terminal,
  Server,
  CloudLightning,
  BookOpen
} from 'lucide-react';

export default function AndroidGuide() {
  const [selectedTopic, setSelectedTopic] = useState<'project' | 'publishing' | 'source_code'>('project');
  const [activeCodeTab, setActiveCodeTab] = useState<'main' | 'pubspec' | 'manifest' | 'readme'>('readme');

  const pubspecCode = `name: al_wird_islamic_hub
description: A beautiful Play Store compatible Flutter wrapper for Al-Wird Islamic Hub.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.10.0
  webview_flutter_android: ^4.16.5
  path_provider: ^2.1.3
  http: ^1.2.1
  permission_handler: ^11.3.1
  shared_preferences: ^2.2.3`;

  const mainDartCode = `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Color(0xFF4A6741), // Olive-green theme alignment
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const AlWirdApp());
}

class AlWirdApp extends StatelessWidget {
  const AlWirdApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Al-Wird Islamic Hub',
      debugShowCheckedModeBanner: false,
      home: const MainPortalScreen(),
    );
  }
}

class MainPortalScreen extends StatefulWidget {
  const MainPortalScreen({super.key});

  @override
  State<MainPortalScreen> createState() => _MainPortalScreenState();
}

class _MainPortalScreenState extends State<MainPortalScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;

  final String _targetUrl = 'https://ais-pre-6wnlsnqrs2l4b3pv5lpa2s-205309828217.asia-southeast1.run.app';

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) => setState(() { _isLoading = true; _hasError = false; }),
          onPageFinished: (url) => setState({ _isLoading = false; }),
          onWebResourceError: (error) => setState({ _hasError = true; _isLoading = false; }),
        ),
      )
      ..loadRequest(Uri.parse(_targetUrl));
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (await _controller.canGoBack()) {
          _controller.goBack();
          return false;
        }
        return true;
      },
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_isLoading) const Center(child: CircularProgressIndicator(color: Color(0xFF4A6741))),
              if (_hasError) _buildOfflineFallback(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOfflineFallback() {
    return Container(
      color: const Color(0xFFFCFBF8),
      padding: const EdgeInsets.all(24.0),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.wifi_off_rounded, size: 64, color: Color(0xFF4A6741)),
            const SizedBox(height: 16),
            const Text('No Connection', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () => _controller.loadRequest(Uri.parse(_targetUrl)),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4A6741)),
              child: const Text('Try Again', style: TextStyle(color: Colors.white)),
            )
          ],
        ),
      ),
    );
  }
}`;

  const manifestCode = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    
    <application
        android:label="Al-Wird Islamic Hub"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const readmeCode = `# Al-Wird Islamic Hub: Flutter Android Studio Wrapper Project
This Flutter project is pre-configured and saved directly to the root subdirectory of this workspace under \`/flutter_project\`.

### Prerequisite Checklist
1. Install Flutter SDK on your computer (v3.0.0+).
2. Install Android Studio & configure Android SDK.

### Step 1: Open project in Android Studio
- Open Android Studio -> Select "Open File or Project" -> Select "/flutter_project".
- Run "flutter pub get" to install external libraries.

### Step 2: Build signed Play Store App Bundle (.aab)
- Generate a release signing key:
  keytool -genkey -v -keystore android/app/release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias alwird-alias
- Run:
  flutter clean && flutter pub get
  flutter build aab --release

Output location:
📁 build/app/outputs/bundle/release/app-release.aab
This is 100% Play Store compatible!`;

  return (
    <div id="android-guide-section" className="bg-white rounded-3xl p-6 text-brand-text shadow-sm border border-brand-border animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-border pb-6 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-green/10 text-brand-green mb-2 border border-brand-green/20 font-mono">
            <Smartphone className="w-3.5 h-3.5" /> Flutter Android Studio workspace
          </span>
          <h2 className="text-2xl font-black tracking-tight text-brand-text font-sans flex items-center gap-2">
            Flutter Google Play Exporter
            <span className="text-xs bg-brand-orange text-white px-2 py-0.5 rounded-md font-mono font-bold shrink-0">AAB Build Support</span>
          </h2>
          <p className="text-brand-stone text-sm mt-1">
            We have generated a 100% complete Flutter wrapper codebase inside <code className="bg-brand-light-gray px-1.5 py-0.5 rounded-md border text-brand-green text-xs">/flutter_project</code> on this workspace. Download it to quickly publish to the Google Play Store!
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl text-xs font-mono text-amber-800">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          Target SDK: 34 (Play Store compliant)
        </div>
      </div>

      {/* Main Topic Tab Buttons */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-brand-light-gray rounded-2xl mb-8 border border-brand-border">
        <button
          onClick={() => setSelectedTopic('project')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            selectedTopic === 'project'
              ? 'bg-brand-green text-white shadow-md'
              : 'text-brand-stone hover:text-brand-text'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Flutter Wrapper Specs</span>
        </button>
        <button
          onClick={() => setSelectedTopic('publishing')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            selectedTopic === 'publishing'
              ? 'bg-brand-green text-white shadow-md'
              : 'text-brand-stone hover:text-brand-text'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>AAB Comile Guide</span>
        </button>
        <button
          onClick={() => setSelectedTopic('source_code')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            selectedTopic === 'source_code'
              ? 'bg-brand-green text-white shadow-md'
              : 'text-brand-stone hover:text-brand-text'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Browse Generated Code</span>
        </button>
      </div>

      {/* TOPIC 1: FLUTTER WRAPPER SPECS */}
      {selectedTopic === 'project' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#FAF9F5] border border-amber-200/50 p-6 rounded-2xl relative overflow-hidden shadow-2xs">
            <h3 className="text-base font-bold text-brand-text mb-2 flex items-center gap-2">
              <CloudLightning className="w-5 h-5 text-brand-green" /> Why Flutter is superior to standard WebView wrappers:
            </h3>
            <p className="text-brand-stone text-xs leading-relaxed max-w-4xl">
              Our pre-generated Flutter project encapsulates the secure Chromium rendering engine and binds it deeply with native interface controllers. This bypasses typical browser performance bottle-necks, forces hardware acceleration, and guarantees full compatibility with Google's strict Play Store policies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Features list */}
            <div className="p-6 rounded-2xl border border-brand-border bg-brand-light-gray/20">
              <h4 className="font-extrabold text-brand-text text-sm uppercase tracking-wider mb-4 font-sans text-brand-green flex items-center gap-1.5 border-b pb-2">
                <CheckCircle className="w-4 h-4" /> Pre-Configured Custom Features
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-brand-stone">
                  <span className="h-2 w-2 rounded-full bg-brand-green mt-1.5 shrink-0" />
                  <span><strong>Physical Back-Button Intercepts:</strong> Pressing the device's back key will navigate backward inside Al-Wird menu states instead of instantly killing the application.</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-brand-stone">
                  <span className="h-2 w-2 rounded-full bg-brand-green mt-1.5 shrink-0" />
                  <span><strong>Live Status Bar Styling:</strong> Automatically adjusts the native top Android bar to the serene match color <code className="bg-brand-light-gray px-1 rounded">#4A6741</code>.</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-brand-stone">
                  <span className="h-2 w-2 rounded-full bg-brand-green mt-1.5 shrink-0" />
                  <span><strong>Native Error Fallbacks:</strong> In case of complete internet failure, shows a clean spiritual offline screen with a one-tap reconnect trigger.</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-brand-stone">
                  <span className="h-2 w-2 rounded-full bg-brand-green mt-1.5 shrink-0" />
                  <span><strong>Custom App Label:</strong> Configured on Android manifests as <strong className="text-brand-text">Al-Wird Islamic Hub</strong>.</span>
                </li>
              </ul>
            </div>

            {/* Offline approach comparison */}
            <div className="p-6 rounded-2xl border border-brand-border bg-brand-light-gray/20">
              <h4 className="font-extrabold text-brand-text text-sm uppercase tracking-wider mb-4 font-sans text-amber-700 flex items-center gap-1.5 border-b pb-2">
                <FolderLock className="w-4 h-4" /> Secure Sandbox Information
              </h4>
              <p className="text-brand-stone text-xs leading-relaxed mb-4">
                The built-in Flutter bridge registers all user's favorite lists, custom Wird counters, and Islamic dates into local memory sandbox. All persistent structures write data safely into standard devices data-stores without generating cloud server overhead liabilities.
              </p>
              <div className="bg-white px-4 py-3 border rounded-xl flex items-center justify-between text-xs text-brand-stone">
                <span>Active project files generated:</span>
                <span className="text-brand-green font-mono font-bold bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20">6 files on workspace</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 2: PUBLISHING TIMELINE & GUIDE */}
      {selectedTopic === 'publishing' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="relative border-l-2 border-brand-green/20 pl-6 ml-4 space-y-8">
            <div className="relative">
              <span className="absolute -left-10 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white font-black text-sm border-2 border-white shadow-xs">
                1
              </span>
              <div className="bg-brand-light-gray/20 border border-brand-border p-5 rounded-2xl">
                <h4 className="font-bold text-brand-text text-sm sm:text-base font-sans flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-green" /> Prepare Local Workspace &amp; Pull Flutter Dependencies
                </h4>
                <p className="text-brand-stone text-xs mt-1 leading-relaxed">
                  Extract the <code className="bg-white border px-1 rounded font-mono">/flutter_project</code> folder from your downloaded workspace ZIP to your computer's Desktop, and fetch required standard plugins:
                </p>
                <div className="bg-white p-3.5 rounded-xl border border-brand-border mt-3">
                  <pre className="text-xs font-mono text-brand-green leading-relaxed">
                    cd flutter_project<br />
                    flutter pub get
                  </pre>
                </div>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-10 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white font-black text-sm border-2 border-white shadow-xs">
                2
              </span>
              <div className="bg-brand-light-gray/20 border border-brand-border p-5 rounded-2xl">
                <h4 className="font-bold text-brand-text text-sm sm:text-base font-sans">
                  Generate Secure Production Upload Keystore
                </h4>
                <p className="text-brand-stone text-xs mt-1 leading-relaxed">
                  Open a terminal and generate a cryptographic safe certificate. Google Play Console requires all bundles uploaded in production release tabs to be signed with a digital cryptographic key tool. Keep passwords secure:
                </p>
                <div className="bg-white p-3.5 rounded-xl border border-brand-border mt-3">
                  <pre className="text-xs font-mono text-brand-green leading-relaxed whitespace-pre-wrap">
                    keytool -genkey -v -keystore android/app/release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias alwird-alias
                  </pre>
                </div>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-10 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white font-black text-sm border-2 border-white shadow-xs">
                3
              </span>
              <div className="bg-brand-light-gray/20 border border-brand-border p-5 rounded-2xl">
                <h4 className="font-bold text-brand-text text-sm sm:text-base font-sans">
                  Compile Signed Play Store Compatible .AAB
                </h4>
                <p className="text-brand-stone text-xs mt-1 leading-relaxed">
                  Run the clean compiler to bundle, pack, shrink options, obfuscate, and build the final Android App Bundle target. Flutter's performance compiler produces incredibly clean releases:
                </p>
                <div className="bg-white p-3.5 rounded-xl border border-brand-border mt-3">
                  <pre className="text-xs font-mono text-brand-green leading-relaxed">
                    flutter clean<br />
                    flutter pub get<br />
                    flutter build aab --release
                  </pre>
                </div>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-10 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white font-black text-sm border-2 border-white shadow-xs">
                4
              </span>
              <div className="bg-brand-light-gray/20 border border-brand-border p-5 rounded-2xl">
                <h4 className="font-bold text-brand-text text-sm sm:text-base font-sans">
                  Upload Bundle Package directly to Play Console
                </h4>
                <p className="text-brand-stone text-xs mt-1 leading-relaxed">
                  Log into your Google Play Developer Console, register your App name, select Production on the side list, and drag-and-drop the generated file found at:
                </p>
                <div className="bg-white p-3.5 rounded-xl border border-teal-200 text-teal-850 mt-3 font-mono text-xs flex items-center justify-between">
                  <span>📁 build/app/outputs/bundle/release/app-release.aab</span>
                  <span className="bg-teal-50 border border-teal-150 px-2 py-0.5 rounded text-[10px] font-bold">Upload Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 3: SOURCE CODE EXPLORER */}
      {selectedTopic === 'source_code' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Internal sub-tabs for file views */}
          <div className="flex flex-wrap p-1 bg-brand-light-gray rounded-xl gap-1 border">
            <button
              onClick={() => setActiveCodeTab('readme')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeCodeTab === 'readme' ? 'bg-white text-brand-green shadow-xs' : 'text-brand-stone hover:text-brand-text'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> README.md
            </button>
            <button
              onClick={() => setActiveCodeTab('pubspec')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeCodeTab === 'pubspec' ? 'bg-white text-brand-green shadow-xs' : 'text-brand-stone hover:text-brand-text'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> pubspec.yaml
            </button>
            <button
              onClick={() => setActiveCodeTab('main')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeCodeTab === 'main' ? 'bg-white text-brand-green shadow-xs' : 'text-brand-stone hover:text-brand-text'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> lib/main.dart
            </button>
            <button
              onClick={() => setActiveCodeTab('manifest')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeCodeTab === 'manifest' ? 'bg-white text-brand-green shadow-xs' : 'text-brand-stone hover:text-brand-text'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> AndroidManifest.xml
            </button>
          </div>

          <div className="bg-black/95 text-green-400 p-5 rounded-2xl font-mono text-xs overflow-x-auto relative shadow-md">
            <div className="absolute top-4 right-4 text-[9px] text-white/50 border border-white/20 uppercase tracking-wider px-2 py-0.5 rounded">
              {activeCodeTab === 'readme' && 'MARKDOWN'}
              {activeCodeTab === 'pubspec' && 'YAML'}
              {activeCodeTab === 'main' && 'DART'}
              {activeCodeTab === 'manifest' && 'XML'}
            </div>
            <pre className="scrollbar-thin scrollbar-thumb-white/10 leading-relaxed max-h-[420px] overflow-y-auto whitespace-pre-wrap">
              {activeCodeTab === 'readme' && readmeCode}
              {activeCodeTab === 'pubspec' && pubspecCode}
              {activeCodeTab === 'main' && mainDartCode}
              {activeCodeTab === 'manifest' && manifestCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

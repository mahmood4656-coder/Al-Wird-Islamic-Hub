import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

class WebPortalScreen extends StatefulWidget {
  const WebPortalScreen({super.key});

  @override
  State<WebPortalScreen> createState() => _WebPortalScreenState();
}

class _WebPortalScreenState extends State<WebPortalScreen> {
  late final WebViewController _controller;
  int _loadingProgress = 0;
  bool _isLoading = true;
  bool _hasError = false;
  bool _isLocalMode = true; // Offline-first by default for lightning-fast completely un-throttled loading

  final String _localAssetPath = 'assets/dist/index.html';
  final String _targetUrl = 'https://ais-pre-6wnlsnqrs2l4b3pv5lpa2s-205309828217.asia-southeast1.run.app';

  @override
  void initState() {
    super.initState();
    _initializeWebViewController();
  }

  void _initializeWebViewController() {
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is AndroidWebViewPlatform) {
      params = AndroidWebViewControllerCreationParams();
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    _controller = WebViewController.fromPlatformCreationParams(params)
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFFCFBF8))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _loadingProgress = progress;
            });
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            // Only report loading failures in live cloud mode
            if (!_isLocalMode) {
              if (error.errorType == WebResourceErrorType.hostLookup ||
                  error.errorType == WebResourceErrorType.connect ||
                  error.errorType == WebResourceErrorType.timeout) {
                setState(() {
                  _hasError = true;
                  _isLoading = false;
                });
              }
            }
          },
        ),
      );

    _loadContent();

    if (_controller.platform is AndroidWebViewController) {
      (_controller.platform as AndroidWebViewController)
          .setOnPlatformPermissionRequest((PlatformWebViewPermissionRequest request) {
        request.grant();
      });
    }
  }

  void _loadContent() {
    if (_isLocalMode) {
      _controller.loadFlutterAsset(_localAssetPath);
    } else {
      _controller.loadRequest(Uri.parse(_targetUrl));
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, Object? result) async {
        if (didPop) {
          return;
        }
        final NavigatorState navigator = Navigator.of(context);
        if (await _controller.canGoBack()) {
          await _controller.goBack();
        } else {
          navigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFFCFBF8),
        appBar: AppBar(
          backgroundColor: const Color(0xFFFCFBF8),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF4A6741), size: 18),
            onPressed: () async {
              if (await _controller.canGoBack()) {
                await _controller.goBack();
              } else {
                if (mounted) Navigator.pop(context);
              }
            },
          ),
          title: Text(
            _isLocalMode ? 'Al-Wird Portal (Local App)' : 'Al-Wird Portal (Live Cloud)',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
          ),
          actions: [
            // Mode toggle button between Offline Asset loading and Cloud Live server
            IconButton(
              icon: Icon(
                _isLocalMode ? Icons.cloud_queue_rounded : Icons.offline_bolt_rounded,
                color: const Color(0xFF4A6741),
                size: 20,
              ),
              tooltip: _isLocalMode ? 'Switch to Cloud Live Portal' : 'Switch to Local Offline App',
              onPressed: () {
                setState(() {
                  _isLocalMode = !_isLocalMode;
                  _isLoading = true;
                  _hasError = false;
                });
                _loadContent();
                
                ScaffoldMessenger.of(context).clearSnackBars();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(_isLocalMode 
                        ? 'Loaded local-bundled offline portal. 100% stable & fast!' 
                        : 'Connecting to live spiritual cloud databases...'
                    ),
                    behavior: SnackBarBehavior.floating,
                    backgroundColor: const Color(0xFF4A6741),
                    duration: const Duration(seconds: 2),
                  ),
                );
              },
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, color: Color(0xFF4A6741), size: 20),
              onPressed: () {
                _controller.reload();
              },
            ),
          ],
        ),
        body: SafeArea(
          child: Stack(
            children: [
              // WebView Core
              WebViewWidget(controller: _controller),

              // Progress Bar
              if (_isLoading)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: LinearProgressIndicator(
                    value: _loadingProgress / 100.0,
                    backgroundColor: Colors.transparent,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF4A6741)),
                    minHeight: 3.5,
                  ),
                ),

              // Reconnection view if fully offline
              if (_hasError)
                Container(
                  color: const Color(0xFFFCFBF8),
                  padding: const EdgeInsets.all(24.0),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: const Color(0xFF4A6741).withOpacity(0.08),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.wifi_off_rounded,
                            size: 40,
                            color: Color(0xFF4A6741),
                          ),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'No Internet Connection Available',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF2D312E),
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'Streaming blessed Quran recitations, Durood, and searching protective Azkar databases requires active connectivity. Reconnect to launch the server.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 32),
                        ElevatedButton.icon(
                          onPressed: () {
                            _controller.loadRequest(Uri.parse(_targetUrl));
                          },
                          icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                          label: const Text(
                            'Retry Loading Server',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4A6741),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

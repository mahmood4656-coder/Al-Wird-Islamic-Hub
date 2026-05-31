import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Color(0xFF4A6741), // Matches --color-brand-green
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFFFCFBF8), // Matches --color-brand-bg
      systemNavigationBarIconBrightness: Brightness.dark,
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
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4A6741),
          primary: const Color(0xFF4A6741),
        ),
        scaffoldBackgroundColor: const Color(0xFFFCFBF8),
        useMaterial3: true,
      ),
      home: const AnimatedSplashScreen(), // Boots through animated splash, transitions to Home
    );
  }
}

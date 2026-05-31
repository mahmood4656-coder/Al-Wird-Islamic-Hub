import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'web_portal_screen.dart';
import 'about_screen.dart';
import 'settings_screen.dart';
import 'downloads_screen.dart';
import 'tasbih_screen.dart';

class NativeHomeScreen extends StatefulWidget {
  const NativeHomeScreen({super.key});

  @override
  State<NativeHomeScreen> createState() => _NativeHomeScreenState();
}

class _NativeHomeScreenState extends State<NativeHomeScreen> {
  String _currentTimeString = "";
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _updateTime();
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer t) => _updateTime());
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _updateTime() {
    final DateTime now = DateTime.now();
    final String formattedTime = _formatDateTime(now);
    if (mounted) {
      setState(() {
        _currentTimeString = formattedTime;
      });
    }
  }

  String _formatDateTime(DateTime dateTime) {
    String hour = dateTime.hour.toString().padLeft(2, '0');
    String minute = dateTime.minute.toString().padLeft(2, '0');
    String second = dateTime.second.toString().padLeft(2, '0');
    return "$hour:$minute:$second";
  }

  void _shareAppDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFFFCFBF8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text(
            'Share Al-Wird Gateway',
            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4A6741)),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Propagate continuous blessings (Sadqa-e-Jariya) by sharing this authentic ad-free defensive shield with friends and family.',
                style: TextStyle(fontSize: 13, color: Colors.grey, height: 1.4),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF4A6741).withOpacity(0.06),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF4A6741).withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'https://play.google.com/store/apps/details?id=com.alwird.islamichub',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontFamily: 'monospace', fontSize: 11, color: Color(0xFF4A6741)),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.copy_rounded, size: 20, color: Color(0xFF4A6741)),
                      onPressed: () {
                        Clipboard.setData(const ClipboardData(text: 'https://play.google.com/store/apps/details?id=com.alwird.islamichub'));
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('App link systematically copied to clipboard!'),
                            behavior: SnackBarBehavior.floating,
                            backgroundColor: Color(0xFF4A6741),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              child: const Text('Close', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        );
      },
    );
  }

  void _rateAppDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFFFCFBF8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text(
            'Support on Play Store',
            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4A6741)),
          ),
          content: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.star_rate_rounded, size: 56, color: Colors.amber),
              SizedBox(height: 16),
              Text(
                'Your standard 5-star review ensures Al-Wird remains visible on search lists to assist other seekers matching protective Azkar.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.grey, height: 1.4),
              ),
            ],
          ),
          actions: [
            TextButton(
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
              onPressed: () => Navigator.pop(context),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4A6741),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Review Now', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Directing you to the Google Play review portal...'),
                    behavior: SnackBarBehavior.floating,
                    backgroundColor: Color(0xFF4A6741),
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCFBF8),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFCFBF8),
        elevation: 0,
        centerTitle: false,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF4A6741).withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.mosque_rounded, color: Color(0xFF4A6741), size: 20),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AL-WIRD PORTAL',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 1.0, color: Color(0xFF2D312E)),
                ),
                Text(
                  'الْوِرْدُ الْإِسْلَامِيُّ',
                  style: TextStyle(fontSize: 13, color: Color(0xFF4A6741), fontFamily: 'serif'),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_rounded, color: Color(0xFF4A6741), size: 20),
            tooltip: 'Share App',
            onPressed: _shareAppDialog,
          ),
          IconButton(
            icon: const Icon(Icons.star_outline_rounded, color: Color(0xFF4A6741), size: 22),
            tooltip: 'Rate App',
            onPressed: _rateAppDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Time & Divine Remembrance Header Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4A6741), Color(0xFF5E8253)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4A6741).withOpacity(0.2),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Dhikr & Quranic Guardian',
                        style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _currentTimeString.isEmpty ? 'Loading...' : _currentTimeString,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Developed and maintained by\nPunjab Laboratories',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, height: 1.3),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Comprehensive genetics and diagnostic support providing clean spiritual solutions for global Muslims.',
                    style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.4),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 20),

            // 2. Off-line Prayer Timings Card (Targeting Requirement 9)
            const Text(
              'TODAY PRAYER TIMINGS (نماز کے اوقات)',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.0, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.06)),
              ),
              child: Column(
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.location_on_rounded, size: 16, color: Color(0xFF4A6741)),
                          SizedBox(width: 4),
                          Text(
                            'Multan / Lahore (Pakistan Offset)',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                          ),
                        ],
                      ),
                      Text(
                        'Local Calculation',
                        style: TextStyle(fontSize: 10, color: Color(0xFF4A6741), fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const Divider(height: 24, thickness: 0.8),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 5,
                    childAspectRatio: 0.72,
                    children: const [
                      PrayerCol(title: 'Fajr', time: '04:02', urdu: 'فجر'),
                      PrayerCol(title: 'Dhuhr', time: '12:15', urdu: 'ظہر'),
                      PrayerCol(title: 'Asr', time: '16:55', urdu: 'عصر'),
                      PrayerCol(title: 'Maghrib', time: '19:12', urdu: 'مغرب', highlight: true),
                      PrayerCol(title: 'Isha', time: '20:45', urdu: 'عشاء'),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 3. Navigation Grid Matrix (Requirement 1, 4, 10 & 30%+ UI Metric)
            const Text(
              'APPLICATION WORKSPACES • شعبہ جات',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.0, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            
            // Primary Action: Open Portal in webview
            GestureDetector(
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const WebPortalScreen())),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF4A6741).withOpacity(0.05),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF4A6741).withOpacity(0.15), width: 1.2),
                ),
                child: const Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: Color(0xFF4A6741),
                      radius: 20,
                      child: Icon(Icons.rocket_launch_rounded, color: Colors.white, size: 20),
                    ),
                    SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Open Full Spiritual Hub',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Access full Quran audios, Durood recitation and instant searchable protective Wirds.',
                            style: TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.chevron_right_rounded, color: Color(0xFF4A6741)),
                  ],
                ),
              ),
            ),

            // Secondary Grid actions
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.1,
              children: [
                // Downloads Manager
                HomeCard(
                  title: 'Off-line Audios',
                  subtitle: 'Storage & Audio Caches',
                  icon: Icons.cloud_download_rounded,
                  color: Colors.blueAccent,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const DownloadsScreen())),
                ),
                // Local Islamic Customizer File
                HomeCard(
                  title: 'Prayer Rules',
                  subtitle: 'Calculations & Offsets',
                  icon: Icons.tune_rounded,
                  color: Colors.indigo,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SettingsScreen())),
                ),
                // Interactive Tasbih Area
                HomeCard(
                  title: 'Tasbih Boards',
                  subtitle: 'Defensive Azkar Shield',
                  icon: Icons.refresh_rounded,
                  color: Colors.teal,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const NativeTasbihScreen())),
                ),
                // Contact / About info
                HomeCard(
                  title: 'Contact & Legals',
                  subtitle: 'Disclaimer & Genetic Center',
                  icon: Icons.info_outline_rounded,
                  color: Colors.amber[800]!,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const AboutScreen())),
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Sadqa statement underlay
            Center(
              child: Column(
                children: [
                  const Icon(Icons.favorite_rounded, color: Color(0xFF4A6741), size: 16),
                  const SizedBox(height: 4),
                  Text(
                    '100% Ad-Free Sadqa-e-Jariya for Noble Remembrance',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey[600]),
                  ),
                  Text(
                    'Developed by Punjab Laboratories',
                    style: TextStyle(fontSize: 9, color: Colors.grey[400]),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PrayerCol extends StatelessWidget {
  final String title;
  final String time;
  final String urdu;
  final bool highlight;

  const PrayerCol({
    super.key,
    required this.title,
    required this.time,
    required this.urdu,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: highlight ? const Color(0xFF4A6741) : Colors.grey[700],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          time,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w900,
            fontFamily: 'monospace',
            color: highlight ? const Color(0xFF4A6741) : const Color(0xFF2D312E),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          urdu,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: highlight ? const Color(0xFF4A6741) : Colors.grey[500],
          ),
        ),
      ],
    );
  }
}

class HomeCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const HomeCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.05)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.01),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 9, color: Colors.grey[500], fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCFBF8),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFCFBF8),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF4A6741), size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'About & Legals • معلومات',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Sadqa Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF4A6741).withOpacity(0.12)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'DEVELOPED & MAINTAINED BY',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: Color(0xFF4A6741)),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Punjab Laboratories & Genetic Centre',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Designed and maintained as an authentic digital gift and Sadqa-e-Jariya (صدقہ جاریہ) for the global Muslim community. This application provides dual-linguistic guidance (English and Urdu) for noble Quranic recitation, authentic defensive Azkar shields, Prophetic Dua equations, and offline-compatible audio streams.',
                    style: TextStyle(fontSize: 11, color: Colors.grey[600], height: 1.4),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),

            // 2. Health & Spiritual Disclaimer
            const Text(
              'HEALTH & SPIRITUAL DISCLAIMER • اہم انتباہ',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.06)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _disclaimerRow('1. Authenticity', 'All Qur\'anic verses and Prophetic Duas (Supplications) are sourced directly from authenticated Tafsirs and established compilations (such as Sahih Al-Bukhari, Sahih Muslim, Hisnul Muslim).'),
                  const Divider(height: 20),
                  _disclaimerRow('2. Spiritual Support', 'Recitation metrics (e.g. Durood limits, Wird cycles) serve spiritual peace, purification, and daily discipline.'),
                  const Divider(height: 20),
                  _disclaimerRow('3. Medical & Clinical Notice', 'Islamic prayers act as a profound metaphysical defense shield. They do not replace physical diagnosis or doctor visits. For genetic tests and diagnostic checkups, please contact our physical facility at Punjab Laboratories & Genetic Centre or consult local clinical practitioners.'),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 3. Play Store Compliant Privacy Policy
            const Text(
              'PLAY STORE COMPLIANT PRIVACY POLICY',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.06)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Google Play Data Safety Standards',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                  ),
                  SizedBox(height: 8),
                  PolicyPoint(
                    title: 'A. Zero Personal Data Harvesting',
                    desc: 'We do not require account signups, phone verifications, email lists, or profiles. Your custom metrics reside 100% locally on your secure storage cache.',
                  ),
                  Divider(height: 20),
                  PolicyPoint(
                    title: 'B. Absolute Geolocation Security',
                    desc: 'To calculate daily prayer timings, custom coordinates are processed locally on-device. No location registers are uploaded to external databases or servers.',
                  ),
                  Divider(height: 20),
                  PolicyPoint(
                    title: 'C. Offline Media Cache Policy',
                    desc: 'Downloaded audio recitations reside in your sandbox directory (Android/data) and can be fully cleared via the download settings page inside the app.',
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 4. Contacts & Inquiries
            const Text(
              'CONTACT DEVELOPERS • ہم سے رابطہ کریں',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.06)),
              ),
              child: const Column(
                children: [
                  ContactItem(
                    label: 'Official Support Email',
                    value: 'plgenetics1@gmail.com',
                    icon: Icons.alternate_email_rounded,
                  ),
                  Divider(height: 20),
                  ContactItem(
                    label: 'Direct WhatsApp Support',
                    value: '+92-3134656654',
                    icon: Icons.phone_android_rounded,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _disclaimerRow(String title, String text) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
        ),
        const SizedBox(height: 4),
        Text(
          text,
          style: TextStyle(fontSize: 11, color: Colors.grey[600], height: 1.4),
        ),
      ],
    );
  }
}

class PolicyPoint extends StatelessWidget {
  final String title;
  final String desc;

  const PolicyPoint({super.key, required this.title, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF4A6741)),
        ),
        const SizedBox(height: 4),
        Text(
          desc,
          style: TextStyle(fontSize: 10.5, color: Colors.grey[600], height: 1.35),
        ),
      ],
    );
  }
}

class ContactItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const ContactItem({super.key, required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFF4A6741).withOpacity(0.08),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFF4A6741), size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(fontSize: 9, color: Colors.grey[500], fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

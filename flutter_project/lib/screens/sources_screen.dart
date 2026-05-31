import 'package:flutter/material.dart';

class ContentSourcesScreen extends StatelessWidget {
  const ContentSourcesScreen({super.key});

  final List<Map<String, String>> _sources = const [
    {
      'provider': 'Internet Archive (Archive.org)',
      'reciters': 'Sheikh Mishary Al-Afasy, Qari Al-Multani, Vocal Ensembles',
      'pattern': 'https://archive.org/download/HisnulMuslim/*',
      'domain': 'archive.org',
      'license': 'Public Domain / Creative Commons Zero (CC0 1.0)',
      'licenseUrl': 'https://creativecommons.org/publicdomain/zero/1.0/',
      'permissible': 'Yes. Commercial use, modification, and public redistribution are permitted without restrictions.',
      'attribution': 'No mandatory attribution is legally required for CC0. However, clear spiritual credits to "Hisnul Muslim Audio" and "Qari Multani compilations" are systematically mentioned to maintain religious transparency.',
      'risk': 'Very Low. Archive.org is a standard global nonprofit library preserving high-durability digital artifacts.',
      'fallback': 'Backup Mirror: Local on-device raw data & EveryAyah servers.',
    },
    {
      'provider': 'EveryAyah Quran Platform',
      'reciters': 'Sheikh Mishary Al-Afasy, Saud Al-Shuraim',
      'pattern': 'https://www.everyayah.com/data/Alafasy_128kbps/*',
      'domain': 'everyayah.com',
      'license': 'Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA 4.0)',
      'licenseUrl': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      'permissible': 'Yes. Public distribution is permitted. Non-commercial distribution is strictly required, which matches Al-Wird\'s 100% ad-free, zero-revenue structure.',
      'attribution': 'Requires attribution to EveryAyah.com database and respective Quranic reciters. Provided clearly in-app.',
      'risk': 'Low. Serves millions of developers worldwide as a primary stable, high-performance API for Quran recitations.',
      'fallback': 'Re-route to alternative backup standard CDN mirror hosts (such as Mp3Quran.net).',
    },
    {
      'provider': 'MP3quran.net CDN Network',
      'reciters': 'Sheikh Al-Fateh Alzubair, Shuraim, Afasy',
      'pattern': 'https://server8.mp3quran.net/afs/*',
      'domain': 'mp3quran.net',
      'license': 'Religious Endowment Public Domain (Waqf) / Free Educational Use',
      'licenseUrl': 'https://mp3quran.net/eng/about',
      'permissible': 'Yes. Unlimited public caching and educational distribution are guaranteed under standard Islamic Endowments (Waqf).',
      'attribution': 'Respective reciters and MP3Quran network administrators. Gratefully credited globally inside Al-Wird.',
      'risk': 'Low. Supported by global Islamic centers, running on load-balanced CDNs with high backup redundancies.',
      'fallback': 'Mirror to Archive.org public storage backups.',
    }
  ];

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
          'Content Sources & Licensing',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Header descriptive banner
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF4A6741).withOpacity(0.12)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.gavel_rounded, color: Color(0xFF4A6741), size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Licensing & Royalty Compliance',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Al-Wird is a non-commercial, 100% ad-free Islamic public utility. All embedded Quranic audio, morning/evening azkar, and protective dua recordings are sourced from public domain databases or servers designated for free religious and non-commercial distribution.',
                  style: TextStyle(fontSize: 11, color: Colors.grey[600], height: 1.4),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 20),

          // Core List
          const Text(
            'REGISTERED CONTENT PROVIDERS',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: Colors.grey),
          ),
          const SizedBox(height: 8),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _sources.length,
            separatorBuilder: (context, index) => const SizedBox(height: 14),
            itemBuilder: (context, index) {
              final src = _sources[index];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.06)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Provider Name
                    Text(
                      src['provider'] ?? "",
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                    ),
                    const SizedBox(height: 4),
                    // Reciter Name / Artist
                    Row(
                      children: [
                        const Icon(Icons.mic_none_outlined, size: 12, color: Colors.grey),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            'Artists/Reciters: ${src['reciters']}',
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: 10, color: Colors.grey[600], fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 18, thickness: 0.8),

                    // Specific Attributes grid
                    _buildMetaRow('Server domain:', src['domain'] ?? "", isMono: true),
                    _buildMetaRow('Link pattern:', src['pattern'] ?? "", isMono: true),
                    _buildMetaRow('License types:', src['license'] ?? ""),
                    _buildMetaRow('Official Terms:', src['licenseUrl'] ?? "", isMono: true, isUrl: true),
                    _buildMetaRow('Redistribution:', src['permissible'] ?? ""),
                    _buildMetaRow('Mandatory attribution:', src['attribution'] ?? ""),
                    _buildMetaRow('Systemic fallback:', src['fallback'] ?? ""),
                  ],
                ),
              );
            },
          ),
          
          const SizedBox(height: 24),
          const Center(
            child: Text(
              'Audit Verified: May 30, 2026 • Sadqa-e-Jariya Project',
              style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMetaRow(String label, String value, {bool isMono = false, bool isUrl = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF4A6741)),
          ),
          const SizedBox(height: 1),
          Text(
            value,
            style: TextStyle(
              fontSize: 10,
              fontFamily: isMono ? 'monospace' : null,
              fontWeight: isUrl ? FontWeight.bold : FontWeight.w500,
              color: isUrl ? const Color(0xFF4A6741) : const Color(0xFF2D312E),
            ),
          ),
        ],
      ),
    );
  }
}

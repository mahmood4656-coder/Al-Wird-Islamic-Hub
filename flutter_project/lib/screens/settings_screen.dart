import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'sources_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _hanafiAsrRule = false;
  bool _soundAdhanNotification = true;
  bool _wirdDailyAlarm = true;
  String _calculationMethod = 'MWL'; // Muslim World League (MWL), ISNA, Karachi, Egypt

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _hanafiAsrRule = prefs.getBool('hanafiAsrRule') ?? false;
      _soundAdhanNotification = prefs.getBool('soundAdhanNotification') ?? true;
      _wirdDailyAlarm = prefs.getBool('wirdDailyAlarm') ?? true;
      _calculationMethod = prefs.getString('calculationMethod') ?? 'MWL';
    });
  }

  Future<void> _saveBoolSetting(String key, bool value) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
    setState(() {
      if (key == 'hanafiAsrRule') _hanafiAsrRule = value;
      if (key == 'soundAdhanNotification') _soundAdhanNotification = value;
      if (key == 'wirdDailyAlarm') _wirdDailyAlarm = value;
    });
    _showSaveFeedback();
  }

  Future<void> _saveStringSetting(String value) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('calculationMethod', value);
    setState(() {
      _calculationMethod = value;
    });
    _showSaveFeedback();
  }

  void _showSaveFeedback() {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Settings saved locally on your device!'),
        behavior: SnackBarBehavior.floating,
        duration: Duration(milliseconds: 1000),
        backgroundColor: Color(0xFF4A6741),
      ),
    );
  }

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
          'Prayer Rules & Customizer',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // 1. Calculation Method Card
          const SectionHeader(title: 'Islamic Calculation Methods (اوقات نماز فقه)'),
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
                const Text(
                  'Jurisdiction Method',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Determines mathematically standard angles for calculation of Fajr and Isha prayer times.',
                  style: TextStyle(fontSize: 10, color: Colors.grey),
                ),
                const Divider(height: 24),
                _methodRadioTile('MWL', 'Muslim World League (Fajr 18°, Isha 17°)'),
                _methodRadioTile('ISNA', 'Islamic Society of North America (Fajr 15°, Isha 15°)'),
                _methodRadioTile('Karachi', 'University of Islamic Sciences, Karachi (Fajr 18°, Isha 18°)'),
                _methodRadioTile('Egypt', 'Egyptian General Authority (Fajr 19.5°, Isha 17.5°)'),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // 2. Fiqh Rule Card
          const SectionHeader(title: 'Fiqh Jurisdiction Checks (فقہی قوانین)'),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.06)),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  activeColor: const Color(0xFF4A6741),
                  title: const Text('Hanafi Asr Shadow Calculation', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E))),
                  subtitle: const Text('Calculates Asr when an object shadow is twice its height. Disable for standard Shafi/Maliki options.', style: TextStyle(fontSize: 10)),
                  value: _hanafiAsrRule,
                  onChanged: (bool val) => _saveBoolSetting('hanafiAsrRule', val),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // 3. Notifications/Mutes
          const SectionHeader(title: 'Spiritual Alarms & Triggers (روحانی بیداری)'),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.06)),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  activeColor: const Color(0xFF4A6741),
                  title: const Text('Active Adhan Reminder Beeps', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E))),
                  subtitle: const Text('Triggers standard chime/Adhan notifications at calculations limit times on your phone.', style: TextStyle(fontSize: 10)),
                  value: _soundAdhanNotification,
                  onChanged: (bool val) => _saveBoolSetting('soundAdhanNotification', val),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  activeColor: const Color(0xFF4A6741),
                  title: const Text('Defensive Wird Alarm (Morning/Evening)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E))),
                  subtitle: const Text('Prompts standard notification reminding you to recite morning and evening Azkar shields.', style: TextStyle(fontSize: 10)),
                  value: _wirdDailyAlarm,
                  onChanged: (bool val) => _saveBoolSetting('wirdDailyAlarm', val),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // 4. Content Sources Setting
          const SectionHeader(title: 'Content Licensing & Sources (حقوق اشاعت)'),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.06)),
            ),
            child: ListTile(
              leading: const Icon(Icons.source_rounded, color: Color(0xFF4A6741)),
              title: const Text('Content Sources & Licensing', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E))),
              subtitle: const Text('Verify public domain status & audio certifications.', style: TextStyle(fontSize: 10)),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF4A6741)),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ContentSourcesScreen()),
                );
              },
            ),
          ),
          
          const SizedBox(height: 32),
          const Center(
            child: Text(
              'Punjab Laboratories & Genetic Centre • Version 1.0.0 (Play Stable)',
              style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _methodRadioTile(String key, String title) {
    return RadioListTile<String>(
      activeColor: const Color(0xFF4A6741),
      title: Text(title, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF2D312E))),
      value: key,
      groupValue: _calculationMethod,
      onChanged: (String? val) {
        if (val != null) _saveStringSetting(val);
      },
      contentPadding: EdgeInsets.zero,
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String title;

  const SectionHeader({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: Colors.grey),
      ),
    );
  }
}

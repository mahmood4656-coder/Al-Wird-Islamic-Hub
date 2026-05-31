import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NativeTasbihScreen extends StatefulWidget {
  const NativeTasbihScreen({super.key});

  @override
  State<NativeTasbihScreen> createState() => _NativeTasbihScreenState();
}

class _NativeTasbihScreenState extends State<NativeTasbihScreen> {
  int _counter = 0;
  int _targetLimit = 33;
  int _totalCompletedLabs = 0;
  String _selectedZikr = "Subhan Allah (سُبْحَانَ اللَّهِ)";
  String _selectedZikrArabic = "سُبْحَانَ اللَّهِ";
  String _selectedZikrMeaning = "Glory be to Allah";

  final List<Map<String, String>> _zikrPresets = [
    {
      "english": "Subhan Allah (سُبْحَانَ اللَّهِ)",
      "arabic": "سُبْحَانَ اللَّهِ",
      "meaning": "Glory be to Allah",
      "limit": "33"
    },
    {
      "english": "Alhamdulillah (الْحَمْدُ لِلَّهِ)",
      "arabic": "الْحَمْدُ لِلَّهِ",
      "meaning": "Praise be to Allah",
      "limit": "33"
    },
    {
      "english": "Allahu Akbar (اللَّهُ أَكْبَرُ)",
      "arabic": "اللَّهُ أَكْبَرُ",
      "meaning": "Allah is the Greatest",
      "limit": "34"
    },
    {
      "english": "Astaghfirullah (أَسْتَغْفِرُ اللَّهَ)",
      "arabic": "أَسْتَغْفِرُ اللَّهَ",
      "meaning": "I seek forgiveness from Allah",
      "limit": "100"
    },
    {
      "english": "Durood Sharief (اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ)",
      "arabic": "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
      "meaning": "Oh Allah, send blessings upon Muhammad",
      "limit": "100"
    },
    {
      "english": "La Ilaha Illallah (لَا إِلَٰهَ إِلَّا اللَّهُ)",
      "arabic": "لَا إِلَٰهَ إِلَّا اللَّهُ",
      "meaning": "There is no god but Allah",
      "limit": "100"
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadTasbihData();
  }

  Future<void> _loadTasbihData() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _counter = prefs.getInt('tasbih_counter_$_selectedZikr') ?? 0;
      _totalCompletedLabs = prefs.getInt('tasbih_laps_$_selectedZikr') ?? 0;
    });
  }

  Future<void> _saveTasbihData() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setInt('tasbih_counter_$_selectedZikr', _counter);
    await prefs.setInt('tasbih_laps_$_selectedZikr', _totalCompletedLabs);
  }

  void _incrementCounter() {
    HapticFeedback.lightImpact();
    setState(() {
      _counter++;
      if (_counter >= _targetLimit) {
        _counter = 0;
        _totalCompletedLabs++;
        HapticFeedback.vibrate(); // Celebratory haptic pulse on completing target!
        _showCompletionDialog();
      }
    });
    _saveTasbihData();
  }

  void _showCompletionDialog() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Completed a full round of $_selectedZikrArabic!'),
        behavior: SnackBarBehavior.floating,
        backgroundColor: const Color(0xFF4A6741),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _resetCounter() {
    HapticFeedback.mediumImpact();
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFFFCFBF8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text(
            'Reset Tasbih Tally',
            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
          ),
          content: const Text(
            'Are you sure you want to clear your current progress and reset this digital bead tally back to zero?',
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _counter = 0;
                });
                _saveTasbihData();
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Reset Now', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  void _resetAllLaps() {
    HapticFeedback.mediumImpact();
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFFFCFBF8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text(
            'Reset All Stats',
            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
          ),
          content: const Text(
            'Are you sure you want to clear your grand total completed rounds list for this particular Wird?',
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _counter = 0;
                  _totalCompletedLabs = 0;
                });
                _saveTasbihData();
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Reset All', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    double progressPercent = _counter / _targetLimit;

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
          'Al-Wird Tasbih Board',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12.0),
          child: Column(
            children: [
              // Presets Selection Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.06)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'SELECT DIVINE APPRECIATION (اوراد کا انتخاب)',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<Map<String, String>>(
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderClass.transparentBorder,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: const BorderSide(color: Color(0xFF4A6741), width: 1.5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        filled: true,
                        fillColor: const Color(0xFF4A6741).withOpacity(0.04),
                      ),
                      value: _zikrPresets.firstWhere((p) => p['english'] == _selectedZikr, orElse: () => _zikrPresets[0]),
                      items: _zikrPresets.map((Map<String, String> preset) {
                        return DropdownMenuItem<Map<String, String>>(
                          value: preset,
                          child: Text(
                            preset['english']!,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                          ),
                        );
                      }).toList(),
                      onChanged: (Map<String, String>? newValue) {
                        if (newValue != null) {
                          setState(() {
                            _selectedZikr = newValue['english']!;
                            _selectedZikrArabic = newValue['arabic']!;
                            _selectedZikrMeaning = newValue['meaning']!;
                            _targetLimit = int.parse(newValue['limit']!);
                            _counter = 0;
                          });
                          _loadTasbihData();
                        }
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Active Zikr Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4A6741), Color(0xFF5E8253)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                ),
                child: Column(
                  children: [
                    Text(
                      _selectedZikrArabic,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: 'serif',
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _selectedZikrMeaning,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.85),
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 36),

              // Visual Tally Board Interface
              Center(
                child: GestureDetector(
                  onTap: _incrementCounter,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Outer visual progress circle
                      SizedBox(
                        width: 220,
                        height: 220,
                        child: CircularProgressIndicator(
                          value: progressPercent,
                          strokeWidth: 10,
                          backgroundColor: const Color(0xFF4A6741).withOpacity(0.08),
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF4A6741)),
                        ),
                      ),
                      // Core bead tapping pad
                      Container(
                        width: 190,
                        height: 190,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFCFBF8),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF4A6741).withOpacity(0.1), width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF4A6741).withOpacity(0.06),
                              blurRadius: 20,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              'COUNT / شمار',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '$_counter',
                              style: const TextStyle(
                                fontSize: 52,
                                fontWeight: FontWeight.black,
                                color: Color(0xFF2D312E),
                                fontFamily: 'monospace',
                              ),
                            ),
                            const SizedBox(height: 2),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF4A6741).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                'Target limit: $_targetLimit',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF4A6741)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 36),

              // Statistics grid & resets
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.05)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'COMPLETED COUNDS',
                            style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '$_totalCompletedLabs rounds',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                              ),
                              IconButton(
                                constraints: const BoxConstraints(),
                                padding: EdgeInsets.zero,
                                icon: const Icon(Icons.delete_sweep_rounded, color: Colors.redAccent, size: 18),
                                onPressed: _resetAllLaps,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Clear bead button
                  Expanded(
                    child: GestureDetector(
                      onTap: _resetCounter,
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF2D312E).withOpacity(0.05)),
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'CLEAR Progress',
                              style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey),
                            ),
                            SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Reset tally',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D312E)),
                                ),
                                Icon(Icons.refresh_rounded, color: Color(0xFF4A6741), size: 18),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Audio tactile prompt text
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF4A6741).withOpacity(0.03),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF4A6741).withOpacity(0.06)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, size: 18, color: Color(0xFF4A6741)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Tap anywhere inside the circular counter disk to increment your beads. Feel premium, responsive light impact haptics as you complete.',
                        style: TextStyle(fontSize: 10.5, color: Colors.grey[700], height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class BorderClass {
  static const BorderSide transparentBorder = BorderSide(color: Colors.transparent);
}

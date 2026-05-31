import 'package:flutter/material.dart';
import 'home_screen.dart';

class AnimatedSplashScreen extends StatefulWidget {
  const AnimatedSplashScreen({super.key});

  @override
  State<AnimatedSplashScreen> createState() => _AnimatedSplashScreenState();
}

class _AnimatedSplashScreenState extends State<AnimatedSplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.6, curve: Curves.easeIn)),
    );

    _scaleAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.8, curve: Curves.easeOutBack)),
    );

    _controller.forward();

    // Stagger transition to Home Screen after 2.5 seconds
    Future.delayed(const Duration(milliseconds: 2600), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => const NativeHomeScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
            transitionDuration: const Duration(milliseconds: 600),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCFBF8), // Soft off-white brand bg
      body: SafeArea(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Center(
              child: Opacity(
                opacity: _fadeAnimation.value,
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Spiritual Icon Frame
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            color: const Color(0xFF4A6741).withOpacity(0.08),
                            borderRadius: BorderRadius.circular(32),
                            border: Border.all(
                              color: const Color(0xFF4A6741).withOpacity(0.15),
                              width: 1.5,
                            ),
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.menu_book_rounded,
                              size: 48,
                              color: Color(0xFF4A6741),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        
                        // Arabic calligraphy placeholder label
                        const Text(
                          'الْوِرْدُ الْإِسْلَامِيُّ',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.normal,
                            fontFamily: 'serif',
                            color: Color(0xFF4A6741),
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 10),
                        
                        // Human Readable App Label
                        const Text(
                          'AL-WIRD ISLAMIC HUB',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                            color: Color(0xFF2D312E),
                          ),
                        ),
                        
                        const SizedBox(height: 8),
                        
                        // Subtitle
                        Text(
                          'Divine Protection & Blessed Remembrance',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            color: const Color(0xFF2D312E).withOpacity(0.6),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        
                        const SizedBox(height: 120),
                        
                        // Continuous loading indicator
                        const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.0,
                            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4A6741)),
                          ),
                        ),
                        const SizedBox(height: 48),
                        
                        // Sponser attribution updated correctly
                        Text(
                          'Developed and maintained by',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF2D312E).withOpacity(0.4),
                            letterSpacing: 0.8,
                            textBaseline: TextBaseline.alphabetic,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Punjab Laboratories & Genetic Centre',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF4A6741),
                            letterSpacing: 0.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

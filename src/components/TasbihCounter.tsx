import React, { useState, useEffect } from 'react';
import { TasbihState } from '../types';
import { INITIAL_TASBIH_DATA } from '../data';
import { 
  RotateCcw, 
  ChevronRight, 
  Check, 
  Plus, 
  HelpCircle, 
  Smartphone, 
  Music, 
  Sparkles,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TasbihCounter() {
  const [tasbihs, setTasbihs] = useState<TasbihState[]>(() => {
    const saved = localStorage.getItem('islamic_app_tasbihs');
    return saved ? JSON.parse(saved) : INITIAL_TASBIH_DATA;
  });

  const [activeId, setActiveId] = useState<string>('tasbih_fatiha');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [customGoal, setCustomGoal] = useState<string>('33');

  useEffect(() => {
    localStorage.setItem('islamic_app_tasbihs', JSON.stringify(tasbihs));
  }, [tasbihs]);

  const activeTasbih = tasbihs.find(t => t.id === activeId) || tasbihs[0];

  // Synthesize a beautiful, high-quality, tactile feedback click sound instantly
  // This bypasses external asset loading issues on Android
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Pleasant metallic/wood click sound
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Web Audio synthesis not supported in this iframe environment', e);
    }
  };

  const triggerVibration = () => {
    if (vibrateEnabled && navigator.vibrate) {
      // Short haptic burst mimicking native clicker
      navigator.vibrate(45);
    }
  };

  const incrementCount = () => {
    playClickSound();
    triggerVibration();

    setTasbihs(prev => prev.map(t => {
      if (t.id === activeId) {
        const nextCount = t.count + 1;
        let nextCycles = t.completedCycles;
        let finalCount = nextCount;

        if (nextCount >= t.goal) {
          nextCycles += 1;
          finalCount = 0; // Reset count for the next cycle
        }

        return {
          ...t,
          count: finalCount,
          completedCycles: nextCycles
        };
      }
      return t;
    }));
  };

  const resetCount = () => {
    setTasbihs(prev => prev.map(t => {
      if (t.id === activeId) {
        return {
          ...t,
          count: 0,
          completedCycles: 0
        };
      }
      return t;
    }));
    triggerVibration();
  };

  const changeGoal = (newGoal: number) => {
    if (newGoal <= 0) return;
    setTasbihs(prev => prev.map(t => {
      if (t.id === activeId) {
        return {
          ...t,
          goal: newGoal,
          count: 0 // restart counter with new target
        };
      }
      return t;
    }));
    setShowGoalModal(false);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      {/* Tasbih Selector Sidebar */}
      <div className="bg-white rounded-3xl p-5 border border-brand-border flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-semibold text-brand-green font-mono tracking-wider uppercase px-2 mb-1">
          Select Wazifa / Counter
        </h3>
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {tasbihs.map((t) => {
            const isActive = t.id === activeId;
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full text-left p-4 rounded-2xl flex justify-between items-center transition-all border ${
                  isActive 
                    ? 'bg-brand-light-gray border-brand-green/35 text-brand-text shadow-sm' 
                    : 'bg-brand-light-gray/25 hover:bg-shadow-sm/40 hover:bg-brand-light-gray/50 border-brand-border text-brand-stone hover:text-brand-text'
                }`}
              >
                <div className="space-y-1">
                  <div className={`font-semibold text-xs tracking-wide ${isActive ? 'text-brand-green' : 'text-brand-stone'}`}>
                    {t.name}
                  </div>
                  <div className="text-xs text-brand-stone/80 pl-0.5">
                    Target: {t.goal} | Cycles: {t.completedCycles}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-bold block text-brand-text">
                    {t.id === activeId ? t.count : 0}
                  </span>
                  <span className="text-[10px] text-brand-stone block">
                    {t.arabic}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Clicking Sphere Container */}
      <div className="md:col-span-2 bg-white rounded-[40px] p-6 border border-brand-border flex flex-col items-center relative overflow-hidden shadow-sm">
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

        {/* Action Controls Header */}
        <div className="w-full flex justify-between items-center mb-6 z-10">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                soundEnabled 
                  ? 'bg-brand-green/10 border-brand-green/20 text-brand-green' 
                  : 'bg-brand-light-gray border-brand-border text-brand-stone'
              }`}
              title="Toggle Tap Clicker Sound Output"
            >
              <Music className="w-4 h-4" /> sound {soundEnabled ? 'On' : 'Off'}
            </button>

            <button
              onClick={() => setVibrateEnabled(prev => !prev)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                vibrateEnabled 
                  ? 'bg-brand-green/10 border-brand-green/20 text-brand-green' 
                  : 'bg-brand-light-gray border-brand-border text-brand-stone'
              }`}
              title="Vibrate device on click (native supported only)"
            >
              <Smartphone className="w-4 h-4" /> vibration {vibrateEnabled ? 'On' : 'Off'}
            </button>
          </div>

          <button
            onClick={() => setShowGoalModal(true)}
            className="text-xs font-medium text-brand-stone hover:text-brand-text bg-brand-light-gray border border-brand-border px-3.5 py-2.5 rounded-xl transition duration-150"
          >
            Adjust Target Cap
          </button>
        </div>

        {/* Display Current Bead Details */}
        <div className="text-center mb-8 z-10">
          <h2 className="text-2xl font-bold text-brand-text font-serif italic mb-1">{activeTasbih.name}</h2>
          <p className="text-lg text-brand-stone mt-1 font-arabic tracking-wide select-none" dir="rtl">
            {activeTasbih.arabic}
          </p>
        </div>

        {/* Huge Interactive Clicker Bead */}
        <div className="relative flex items-center justify-center h-80 z-10">
          <button
            onClick={incrementCount}
            className="relative w-64 h-64 rounded-full bg-brand-green p-[3px] shadow-lg active:scale-[0.97] transition-all cursor-pointer select-none group focus:outline-none"
            style={{ touchAction: 'manipulation' }}
          >
            {/* Inner ring background */}
            <div className="w-full h-full rounded-full bg-[#F8F7F2] border-4 border-white flex flex-col items-center justify-center relative overflow-hidden">
              {/* Tap visual ripple effect using pure css */}
              <div className="absolute inset-0 bg-brand-green/5 group-active:scale-[1.8] opacity-0 group-active:opacity-100 transition-all duration-300 rounded-full" />
              
              <span className="text-brand-stone text-xs tracking-wider font-mono uppercase">
                CYCLES DONE: {activeTasbih.completedCycles}
              </span>
              
              {/* Current count */}
              <motion.span 
                key={activeTasbih.count}
                initial={{ scale: 0.85, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl font-serif italic text-brand-text font-bold my-1 block"
              >
                {activeTasbih.count}
              </motion.span>

              {/* Progress target indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-brand-border text-xs">
                <span className="text-brand-stone font-mono">Goal:</span>
                <span className="text-brand-green font-mono font-bold">{activeTasbih.goal}</span>
              </div>
            </div>
          </button>

          {/* Sparkly visual alert if complete cycle reached */}
          {activeTasbih.completedCycles > 0 && activeTasbih.count === 0 && (
            <div className="absolute -top-4 bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
              <Award className="w-4 h-4" /> Cycle Completed!
            </div>
          )}
        </div>

        {/* Bottom Helper Controls for clear and reset */}
        <div className="w-full flex justify-between items-center mt-8 pt-6 border-t border-brand-border z-10">
          <div className="text-xs text-brand-stone flex items-center gap-1.5">
            <Award className="w-4 h-4 text-brand-green" />
            <span>Successive loops: <strong className="text-brand-text">{activeTasbih.completedCycles}</strong></span>
          </div>

          <button
            onClick={resetCount}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100/80 text-red-750 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Counter
          </button>
        </div>

        {/* Dynamic adjust goal modal */}
        <AnimatePresence>
          {showGoalModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-bg/95 backdrop-blur-md flex items-center justify-center p-6 z-20"
            >
              <div className="w-full max-w-xs bg-white border border-brand-border p-6 rounded-3xl shadow-xl">
                <h4 className="text-sm font-bold text-brand-text mb-3">Set Target Limit Counter</h4>
                <p className="text-brand-stone text-xs mb-4">
                  Define when the tasbih loops and registers as an accomplished cycle.
                </p>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-light-gray border border-brand-border rounded-xl text-brand-text font-mono text-center outline-none focus:border-brand-green mb-4 font-bold text-lg"
                  placeholder="33"
                />
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-brand-light-gray text-xs font-semibold text-brand-stone hover:bg-brand-border-dark"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => changeGoal(Number(customGoal) || 33)}
                    className="flex-1 py-2.5 rounded-xl bg-brand-green text-xs font-bold text-white hover:bg-brand-green-hover shadow-sm"
                  >
                    Apply Cap
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

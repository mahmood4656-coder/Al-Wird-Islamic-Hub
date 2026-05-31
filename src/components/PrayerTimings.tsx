import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  MapPin, 
  Settings, 
  Clock, 
  Sun, 
  Moon, 
  Bell, 
  BellOff, 
  RefreshCw, 
  ChevronRight, 
  Volume2,
  Calendar as CalIcon,
  ChevronsRight
} from 'lucide-react';
import { getHijriFromGregorian } from './IslamicCalendar';

// Standard astronomical calculation interfaces
export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface LocationInfo {
  name: string;
  lat: number;
  lng: number;
  timezone: number;
}

export const POPULAR_LOCATIONS: LocationInfo[] = [
  { name: "Karachi, Pakistan", lat: 24.8607, lng: 67.0011, timezone: 5 },
  { name: "Mecca, Saudi Arabia", lat: 21.3891, lng: 39.8579, timezone: 3 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278, timezone: 1 }, // Account for standard BST / summer time offsets
  { name: "New York, USA", lat: 40.7128, lng: -74.0060, timezone: -4 }, // EDT
  { name: "Kuala Lumpur, Malaysia", lat: 3.1390, lng: 101.6869, timezone: 8 },
  { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, timezone: 3 },
  { name: "Dhaka, Bangladesh", lat: 23.8103, lng: 90.4125, timezone: 6 },
  { name: "Jakarta, Indonesia", lat: -6.2088, lng: 106.8456, timezone: 7 },
  { name: "Riyadh, Saudi Arabia", lat: 24.7136, lng: 46.6753, timezone: 3 },
  { name: "Mumbai, India", lat: 19.0760, lng: 72.8777, timezone: 5.5 }
];

// Helper helpers to convert degrees to radians and back
const dtr = (deg: number) => (deg * Math.PI) / 180;
const rtd = (rad: number) => (rad * 180) / Math.PI;

/**
 * Robust mathematical client-side prayer timings calculator.
 * Works 100% offline, perfectly accommodating extreme environments and PWA Android containers.
 */
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezone: number,
  asrMethod: 'shafi' | 'hanafi',
  fajrAngle: number = 18,
  ishaAngle: number = 18
): PrayerTimes {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;

  const d = JD - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(dtr(g)) + 0.02 * Math.sin(dtr(2 * g))) % 360;

  const obliq = 23.439 - 0.00000036 * d;
  const dec = rtd(Math.asin(Math.sin(dtr(obliq)) * Math.sin(dtr(L))));

  let ra = rtd(Math.atan2(Math.cos(dtr(obliq)) * Math.sin(dtr(L)), Math.cos(dtr(L))));
  ra = (ra + 360) % 360;
  const raHours = ra / 15;

  const qHours = q / 15;
  let eqt = qHours - raHours;
  if (eqt > 24) eqt -= 24;
  if (eqt < -24) eqt += 24;

  const midDay = 12 + timezone - lng / 15 - eqt;

  function hourAngle(angle: number, direction: 'fajr' | 'sunrise' | 'asr' | 'sunset' | 'isha'): number {
    let alt = angle;
    if (direction === 'fajr' || direction === 'sunrise' || direction === 'sunset' || direction === 'isha') {
      alt = -angle;
    }

    const latRad = dtr(lat);
    const decRad = dtr(dec);
    const altRad = dtr(alt);

    const cosH = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    if (cosH > 1 || cosH < -1) {
      return NaN;
    }
    return rtd(Math.acos(cosH)) / 15;
  }

  const hSunrise = hourAngle(0.833, 'sunrise');
  const hSunset = hourAngle(0.833, 'sunset');
  const hFajr = hourAngle(fajrAngle, 'fajr');
  const hIsha = hourAngle(ishaAngle, 'isha');

  const G = asrMethod === 'hanafi' ? 2 : 1;
  const latDecDiff = Math.abs(lat - dec);
  const altAsrRad = Math.atan(1 / (G + Math.tan(dtr(latDecDiff))));
  const altAsrDeg = rtd(altAsrRad);
  const hAsr = hourAngle(altAsrDeg, 'asr');

  function formatTime(hours: number): string {
    if (isNaN(hours)) return "--:--";
    let h = Math.floor(hours);
    let m = Math.round((hours - h) * 60);
    if (m === 60) {
      m = 0;
      h += 1;
    }
    h = (h + 24) % 24;
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${hStr}:${mStr}`;
  }

  return {
    fajr: formatTime(midDay - hFajr),
    sunrise: formatTime(midDay - hSunrise),
    dhuhr: formatTime(midDay),
    asr: formatTime(midDay + hAsr),
    maghrib: formatTime(midDay + hSunset),
    isha: formatTime(midDay + hIsha)
  };
}

/**
 * Shifting the wall clock time from browser to target location's timezone.
 * When local JS Date methods are called, they will exactly match the target location's wall time.
 */
export const getTargetLocalDate = (date: Date, timezoneOffsetHours: number): Date => {
  const utcMs = date.getTime();
  const targetMs = utcMs + (timezoneOffsetHours * 60 * 60 * 1000) + (date.getTimezoneOffset() * 60 * 1000);
  return new Date(targetMs);
};

export default function PrayerTimings() {
  // Config state load from local storage
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>(() => {
    const saved = localStorage.getItem('islamic_app_prayer_location');
    return saved ? JSON.parse(saved) : POPULAR_LOCATIONS[0];
  });

  const [asrMethod, setAsrMethod] = useState<'shafi' | 'hanafi'>(() => {
    const saved = localStorage.getItem('islamic_app_asr_method');
    return (saved as 'shafi' | 'hanafi') || 'hanafi'; // default Hanafi
  });

  const [fajrAngle, setFajrAngle] = useState<number>(18);
  const [ishaAngle, setIshaAngle] = useState<number>(18);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('islamic_app_prayer_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>({
    fajr: '--:--', sunrise: '--:--', dhuhr: '--:--', asr: '--:--', maghrib: '--:--', isha: '--:--'
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locatingError, setLocatingError] = useState<string | null>(null);

  // Sync Hijri Offset from Calendar settings dynamically
  const [hijriOffset, setHijriOffset] = useState<number>(() => {
    const saved = localStorage.getItem('islamic_hijri_cal_offset');
    return saved !== null ? Number(saved) : 1;
  });

  // Track the last notified prayer to avoid duplicate alerts inside the same minute
  const lastNotifiedRef = useRef<string>('');

  // Periodically read hijacked offsets or user updates from sibling modules
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const saved = localStorage.getItem('islamic_hijri_cal_offset');
      if (saved !== null) {
        setHijriOffset(Number(saved));
      }
    }, 1500);
    return () => clearInterval(syncInterval);
  }, []);

  // Update current time on secondary ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recalculate prayer times whenever configuration values change
  useEffect(() => {
    const targetDateObj = getTargetLocalDate(currentTime, selectedLocation.timezone);
    const times = calculatePrayerTimes(
      targetDateObj,
      selectedLocation.lat,
      selectedLocation.lng,
      selectedLocation.timezone,
      asrMethod,
      fajrAngle,
      ishaAngle
    );
    setPrayerTimes(times);
  }, [currentTime.getDate(), selectedLocation, asrMethod, fajrAngle, ishaAngle]);

  // Persistent settings sync
  useEffect(() => {
    localStorage.setItem('islamic_app_prayer_location', JSON.stringify(selectedLocation));
  }, [selectedLocation]);

  useEffect(() => {
    localStorage.setItem('islamic_app_asr_method', asrMethod);
  }, [asrMethod]);

  useEffect(() => {
    localStorage.setItem('islamic_app_prayer_sound', String(soundEnabled));
  }, [soundEnabled]);

  // Precise Web Audio API Synthesizer to trigger a sweet layered reminder chime offline
  const playOfflineAlert = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      
      // Sequence representing peaceful contemplative Eastern microtonal chime
      const notes = [
        { f: 329.63, d: 0.15, t: 0.05 }, // E4
        { f: 392.00, d: 0.20, t: 0.22 }, // G4
        { f: 440.00, d: 0.25, t: 0.45 }, // A4
        { f: 523.25, d: 0.35, t: 0.72 }, // C5
        { f: 587.33, d: 0.50, t: 1.05 }  // D5
      ];
      
      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, ctx.currentTime + note.t);
        
        // Soft volume envelope to sound premium and meditative, not harsh like an alarm
        gain.gain.setValueAtTime(0, ctx.currentTime + note.t);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + note.t + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.t + note.d);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + note.t);
        osc.stop(ctx.currentTime + note.t + note.d);
      });
    } catch (e) {
      console.warn("Contemplative synthesizer alert could not initialize:", e);
    }
  };

  // Convert "HH:MM" string to minutes of the day
  const timeToMinutes = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  // Calculate the upcoming prayer and provide countdown coordinates
  const getUpcomingPrayer = () => {
    const targetDateObj = getTargetLocalDate(currentTime, selectedLocation.timezone);
    const curHours = targetDateObj.getHours();
    const curMins = targetDateObj.getMinutes();
    const curTotal = curHours * 60 + curMins;

    const list = [
      { name: 'Fajr (فجر)', key: 'fajr', time: prayerTimes.fajr },
      { name: 'Suhur/Sunrise (طلوع)', key: 'sunrise', time: prayerTimes.sunrise },
      { name: 'Dhuhr (ظہر)', key: 'dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr (عصر)', key: 'asr', time: prayerTimes.asr },
      { name: 'Maghrib (مغرب)', key: 'maghrib', time: prayerTimes.maghrib },
      { name: 'Isha (عشا)', key: 'isha', time: prayerTimes.isha }
    ];

    // Find the next prayer today
    let upcoming = list.find(p => timeToMinutes(p.time) > curTotal);
    let nextDay = false;

    if (!upcoming) {
      // If past Isha, the next prayer is tomorrow's Fajr
      upcoming = list[0];
      nextDay = true;
    }

    // Compute remaining time
    let upcomingMinutes = timeToMinutes(upcoming.time);
    let diff = 0;

    if (nextDay) {
      diff = (24 * 60 - curTotal) + upcomingMinutes;
    } else {
      diff = upcomingMinutes - curTotal;
    }

    const diffHrs = Math.floor(diff / 60);
    const diffMins = diff % 60;

    // Check if a prayer has entered this very minute and trigger notification alert safely
    const activeMatch = list.find(p => timeToMinutes(p.time) === curTotal);
    if (activeMatch && activeMatch.key !== lastNotifiedRef.current) {
      lastNotifiedRef.current = activeMatch.key;
      if (soundEnabled) {
        playOfflineAlert();
      }
    }

    // Active prayer calculation (what is currently active)
    let activePrayer = list[list.length - 1]; // default Isha
    for (let i = 0; i < list.length; i++) {
      if (curTotal >= timeToMinutes(list[i].time)) {
        activePrayer = list[i];
      }
    }

    // Visual progress percentage of current prayer interval
    let prevPrayerTime = timeToMinutes(activePrayer.time);
    let nextPrayerTime = upcomingMinutes;
    if (nextDay) {
      nextPrayerTime = upcomingMinutes + 24 * 60;
    }
    const totalSegmentMinutes = nextPrayerTime - prevPrayerTime <= 0 ? 180 : (nextPrayerTime - prevPrayerTime);
    const progressPercent = Math.min(100, Math.max(0, ((curTotal - prevPrayerTime) / totalSegmentMinutes) * 100));

    return {
      name: upcoming.name,
      time: upcoming.time,
      countdown: `${diffHrs > 0 ? `${diffHrs}h ` : ''}${diffMins}m`,
      activeName: activePrayer.name,
      activeKey: activePrayer.key,
      progress: progressPercent
    };
  };

  const upcomingInfo = getUpcomingPrayer();

  // HTML Geolocation lookup
  const handleDetectLocation = () => {
    setIsLocating(true);
    setLocatingError(null);

    if (!navigator.geolocation) {
      setLocatingError("Geolocation not supported by this browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedOffset = -new Date().getTimezoneOffset() / 60;
        setSelectedLocation({
          name: "📍 Detected Location",
          lat: Number(position.coords.latitude.toFixed(4)),
          lng: Number(position.coords.longitude.toFixed(4)),
          timezone: detectedOffset
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn("Location error:", err);
        setLocatingError("Access denied or delayed. Pleaser select manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  // Convert Gregorian to Hijri using current offset at target local date
  const targetDateObj = getTargetLocalDate(currentTime, selectedLocation.timezone);
  const todayHijriStr = getHijriFromGregorian(targetDateObj, hijriOffset);
  const arabicMonthDisplay = todayHijriStr.monthNameAr;
  const urduMonthDisplay = todayHijriStr.monthNameUr;

  return (
    <div className="bg-white border border-brand-border/90 rounded-3xl p-4 md:p-5 shadow-xs transition-all duration-300 animate-fadeIn mb-8">
      {/* Top Header Row with Hijri Date and Prayer Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-brand-border pb-4 mb-4">
        
        {/* Dynamic Hijri & Gregorian integrated block */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0">
            <CalIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-brand-green tracking-wide select-all font-serif">
                {todayHijriStr.day} {todayHijriStr.monthNameEn} {todayHijriStr.year} AH
              </span>
              <span className="text-[10px] font-bold text-white bg-brand-green/85 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                Hijri Date
              </span>
            </div>
            
            <p className="text-xs text-brand-stone font-medium flex items-center gap-1.5 mt-0.5 select-none text-left">
              <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="text-brand-border-dark">|</span>
              <span className="font-arabic font-bold text-brand-green text-xs" dir="rtl">
                {todayHijriStr.day} {arabicMonthDisplay} ({urduMonthDisplay})ھ
              </span>
            </p>
          </div>
        </div>

        {/* Live status or countdown container */}
        <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
          
          {/* Location details display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-light-gray rounded-xl border border-brand-border text-xs text-brand-text font-bold uppercase tracking-tight select-none">
            <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0 animate-bounce" />
            <span className="truncate max-w-[150px]">{selectedLocation.name}</span>
          </div>

          {/* Settings toggler and Sound toggler */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute Entrance Alert Sound" : "Enable Entrance Alert Audio"}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border-brand-green/35' 
                  : 'bg-brand-light-gray hover:text-brand-text text-brand-stone border-transparent'
              }`}
            >
              {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => playOfflineAlert()}
              title="Test reminder sound effect"
              className="p-2.5 rounded-xl border border-brand-border text-brand-stone hover:text-brand-text hover:bg-brand-light-gray cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                showSettings 
                  ? 'bg-brand-stone text-white border-brand-stone' 
                  : 'bg-brand-light-gray/60 hover:bg-brand-light-gray hover:text-brand-text text-brand-stone border-brand-border/40'
              }`}
              title="Configure angles / sect settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Countdown Ribbon & Prayer Timings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        
        {/* Quick info panel: Next Prayer countdown and mini-status */}
        <div className="md:col-span-4 bg-brand-green text-white p-4 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden text-left select-none">
          {/* Top backdrop glow */}
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/80 animate-spin-slow" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 font-mono">Next Holy Obligation</span>
            </div>
            
            <div className="mt-2.5">
              <h4 className="text-xl font-extrabold truncate leading-tight">
                {upcomingInfo.name}
              </h4>
              <p className="text-2xl md:text-3xl font-black font-mono mt-1 tracking-tight">
                in {upcomingInfo.countdown}
              </p>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex justify-between items-center text-[10px] font-bold text-white/90 font-mono">
              <span className="uppercase">Active: {upcomingInfo.activeName}</span>
              <span>{Math.round(upcomingInfo.progress)}% Segment Passed</span>
            </div>
            
            {/* Visual alignment bar of current time till next prayer */}
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-white/90 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${upcomingInfo.progress}%` }}
              />
            </div>
            
            <p className="text-[9.5px] text-white/70 italic font-medium leading-normal">
              Keep your heart steady and make wudu calmly before the visual prayer call is initiated.
            </p>
          </div>
        </div>

        {/* Dynamic horizontal scroll/grid of the 6 core events */}
        <div className="md:col-span-8 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { tag: 'Fajr', key: 'fajr', ar: 'فجر', icon: Moon, desc: 'Dawn prayer', value: prayerTimes.fajr },
            { tag: 'Sunrise', key: 'sunrise', ar: 'طلوع', icon: Sun, desc: 'Limit of Sehri', value: prayerTimes.sunrise },
            { tag: 'Dhuhr', key: 'dhuhr', ar: 'ظہر', icon: Sun, desc: 'Noon prayer', value: prayerTimes.dhuhr },
            { tag: 'Asr', key: 'asr', ar: 'عصر', icon: Sun, desc: 'Late afternoon', value: prayerTimes.asr },
            { tag: 'Maghrib', key: 'maghrib', ar: 'مغرب', icon: Moon, desc: 'Sunset / Iftar', value: prayerTimes.maghrib },
            { tag: 'Isha', key: 'isha', ar: 'عشا', icon: Moon, desc: 'Night prayer', value: prayerTimes.isha }
          ].map((item) => {
            const Icon = item.icon;
            const isTargetUpcoming = upcomingInfo.name.toLowerCase().includes(item.tag.toLowerCase());
            const isCurrentlyActive = upcomingInfo.activeKey === item.key;

            return (
              <div
                key={item.key}
                className={`flex flex-col justify-between p-3 rounded-2xl border transition-all text-center relative overflow-hidden select-all select-none ${
                  isCurrentlyActive
                    ? 'bg-brand-green/10 border-brand-green shadow-xs scale-[1.02] ring-1 ring-brand-green/10'
                    : isTargetUpcoming
                      ? 'bg-amber-50/50 border-amber-300'
                      : 'bg-white border-brand-border/60 hover:border-brand-green/20'
                }`}
              >
                {/* Active indicator bar */}
                {isCurrentlyActive && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-brand-green" />
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Icon className={`w-3.5 h-3.5 ${isCurrentlyActive ? 'text-brand-green' : isTargetUpcoming ? 'text-amber-600' : 'text-brand-stone/50'}`} />
                    <span className="font-arabic text-[11px] font-bold text-brand-stone/75 leading-none pr-1">{item.ar}</span>
                  </div>

                  <h5 className="text-[11px] font-mono font-extrabold text-brand-stone uppercase tracking-wide leading-none">{item.tag}</h5>
                </div>

                <div className="mt-3.5">
                  <span className={`text-[15px] font-black font-mono tracking-tight leading-none block ${
                    isCurrentlyActive ? 'text-brand-green' : 'text-brand-text'
                  }`}>
                    {item.value}
                  </span>
                  
                  {isCurrentlyActive ? (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-brand-green font-mono text-white inline-block mt-1 leading-none uppercase">
                      Active
                    </span>
                  ) : isTargetUpcoming ? (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500 font-mono text-white inline-block mt-1 leading-none uppercase">
                      Next
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono text-brand-stone/60 font-medium block mt-1 leading-none">
                      {item.desc}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Advanced Settings & Location Config Tray */}
      {showSettings && (
        <div className="mt-5 border-t border-brand-border pt-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-left animate-fadeIn">
          
          {/* Location manual coordinate picker */}
          <div className="space-y-2 bg-brand-light-gray/40 border border-brand-border/60 p-4 rounded-2xl">
            <h4 className="text-xs font-mono font-extrabold text-brand-text uppercase tracking-wider flex items-center justify-between">
              <span>Choose Location</span>
              {isLocating ? (
                <span className="text-[9px] text-brand-green animate-pulse">Scanning coordinates...</span>
              ) : (
                <button 
                  onClick={handleDetectLocation}
                  className="text-[9px] text-brand-green hover:underline flex items-center gap-0.5"
                >
                  <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> Auto-Detect My Location
                </button>
              )}
            </h4>
            
            <div className="space-y-3">
              <select
                className="w-full bg-white text-xs border border-brand-border h-9 px-2.5 rounded-xl font-medium focus:ring-1 focus:ring-brand-green outline-none"
                value={selectedLocation.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const item = POPULAR_LOCATIONS.find(l => l.name === val);
                  if (item) {
                    setSelectedLocation(item);
                  }
                }}
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} (UTC{loc.timezone >= 0 ? `+${loc.timezone}` : loc.timezone})
                  </option>
                ))}
                {selectedLocation.name.startsWith("📍") && (
                  <option value={selectedLocation.name}>
                    {selectedLocation.name} (Custom GPS)
                  </option>
                )}
              </select>

              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-brand-stone select-none">
                <div>
                  <span className="block font-semibold">LATITUDE</span>
                  <span className="font-mono bg-white px-1.5 py-0.5 border border-brand-border block text-center rounded mt-0.5 font-bold text-brand-text">{selectedLocation.lat}°</span>
                </div>
                <div>
                  <span className="block font-semibold">LONGITUDE</span>
                  <span className="font-mono bg-white px-1.5 py-0.5 border border-brand-border block text-center rounded mt-0.5 font-bold text-brand-text">{selectedLocation.lng}°</span>
                </div>
                <div>
                  <span className="block font-semibold">TIMEZONE (HRS)</span>
                  <span className="font-mono bg-white px-1.5 py-0.5 border border-brand-border block text-center rounded mt-0.5 font-bold text-brand-text">+{selectedLocation.timezone}</span>
                </div>
              </div>

              {locatingError && (
                <p className="text-[9px] text-rose-600 font-bold leading-normal mt-1 block">⚠️ {locatingError}</p>
              )}
            </div>
          </div>

          {/* Sect & Calculation Method */}
          <div className="space-y-2 bg-brand-light-gray/40 border border-brand-border/60 p-4 rounded-2xl">
            <h4 className="text-xs font-mono font-extrabold text-brand-text uppercase tracking-wider">
              Asr Jurisdictional Sect
            </h4>
            <p className="text-[10px] text-brand-stone leading-relaxed">
              Determines when the afternoon Asr prayer begins based on shadows lengthening.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => setAsrMethod('hanafi')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  asrMethod === 'hanafi' 
                    ? 'bg-brand-green border-brand-green text-white shadow-sm' 
                    : 'bg-white border-brand-border text-brand-stone hover:text-brand-text'
                }`}
              >
                Hanafi (Shadow Ratio 2x)
              </button>
              <button
                onClick={() => setAsrMethod('shafi')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  asrMethod === 'shafi' 
                    ? 'bg-brand-green border-brand-green text-white shadow-sm' 
                    : 'bg-white border-brand-border text-brand-stone hover:text-brand-text'
                }`}
              >
                Shafi'i (Shadow Ratio 1x)
              </button>
            </div>
          </div>

          {/* Astronomical Angles customization */}
          <div className="space-y-2 bg-brand-light-gray/40 border border-brand-border/60 p-4 rounded-2xl">
            <h4 className="text-xs font-mono font-extrabold text-brand-text uppercase tracking-wider">
              Calculation Methods
            </h4>
            <p className="text-[10px] text-brand-stone leading-relaxed">
              Standard degree angle offsets of the sun below the horizon representing twilight bounds.
            </p>
            
            <div className="space-y-2 mt-2">
              <div>
                <div className="flex justify-between items-center text-[10px] text-brand-stone font-bold select-none">
                  <span>FAJR TWILIGHT ANGLE</span>
                  <span className="font-mono text-brand-green">{fajrAngle}°</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="20"
                  step="0.5"
                  value={fajrAngle}
                  onChange={(e) => setFajrAngle(parseFloat(e.target.value))}
                  className="w-full accent-brand-green cursor-pointer mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] text-brand-stone font-bold select-none">
                  <span>ISHA TWILIGHT ANGLE</span>
                  <span className="font-mono text-brand-green">{ishaAngle}°</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="20"
                  step="0.5"
                  value={ishaAngle}
                  onChange={(e) => setIshaAngle(parseFloat(e.target.value))}
                  className="w-full accent-brand-green cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

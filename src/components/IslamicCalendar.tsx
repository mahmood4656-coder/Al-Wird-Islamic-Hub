import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Moon, AlertCircle } from 'lucide-react';

export interface HijriDate {
  day: number;
  month: number; // 1-indexed
  year: number;
  monthNameEn: string;
  monthNameAr: string;
  monthNameUr: string;
}

export const HIJRI_MONTHS = [
  { en: "Muharram", ar: "المحرم", ur: "محرم الحرام", index: 1 },
  { en: "Safar", ar: "صفر", ur: "صفر المظفر", index: 2 },
  { en: "Rabi' al-Awwal", ar: "ربيع الأول", ur: "ربیع الاول", index: 3 },
  { en: "Rabi' al-Thani", ar: "ربيع الآخر", ur: "ربیع الثانی", index: 4 },
  { en: "Jumada al-Awwal", ar: "جمادى الأولى", ur: "جمادی الاول", index: 5 },
  { en: "Jumada al-Thani", ar: "جمادى الآخرة", ur: "جمادی الثانی", index: 6 },
  { en: "Rajab", ar: "رجب", ur: "رجب المرجب", index: 7 },
  { en: "Sha'ban", ar: "شعبان", ur: "شعبان المعظم", index: 8 },
  { en: "Ramadan", ar: "رمضان", ur: "رمضان المبارک", index: 9 },
  { en: "Shawwal", ar: "شوال", ur: "شوال المکرم", index: 10 },
  { en: "Dhu al-Qi'dah", ar: "ذو القعدة", ur: "ذوالقعدہ", index: 11 },
  { en: "Dhu al-Hijjah", ar: "ذو الحجة", ur: "ذوالحجہ", index: 12 }
];

// Major Islamic historical and religious days
export const ISLAMIC_EVENTS = [
  { month: 1, day: 1, name: "Islamic New Year", urdu: "نئے اسلامی سال کا آغاز" },
  { month: 1, day: 9, name: "Tasu'a (9th Muharram)", urdu: "تاسوعا (9 محرم)" },
  { month: 1, day: 10, name: "Ashura (10th Muharram)", urdu: "یومِ عاشورہ" },
  { month: 3, day: 12, name: "Mawlid an-Nabi (PBUH)", urdu: "عید میلاد النبی ﷺ" },
  { month: 7, day: 27, name: "Shab e Miraj (An-Journey)", urdu: "شبِ معراج مبارک" },
  { month: 8, day: 15, name: "Shab e Barat (Night of Forgiveness)", urdu: "شبِ برات مبارک" },
  { month: 9, day: 1, name: "First Day of Ramadan", urdu: "پہلا روزہ رمضان المبارک" },
  { month: 9, day: 21, name: "Nuzul al-Quran", urdu: "نزولِ قرآن پاک" },
  { month: 9, day: 27, name: "Laylat al-Qadr (27th Ramadan)", urdu: "لیلۃ القدر مبارک" },
  { month: 10, day: 1, name: "Eid al-Fitr Holiday", urdu: "عید الفطر مبارک" },
  { month: 12, day: 8, name: "Beginning of Hajj Days", urdu: "حج کے ایام کا آغاز" },
  { month: 12, day: 9, name: "Day of Arafah (9th Dhul-Hijjah)", urdu: "یومِ عرفہ (وقوفِ عرفات)" },
  { month: 12, day: 10, name: "Eid al-Adha Feast (10th Dhul-Hijjah)", urdu: "عید الاضحیٰ مبارک" },
  { month: 12, day: 11, name: "Tashreeq Day 1", urdu: "ایامِ تشریق - پہلا دن" },
  { month: 12, day: 12, name: "Tashreeq Day 2", urdu: "ایامِ تشریق - دوسرا دن" }
];

// Programmatic conversion helper with customizable offset (derived from standard tabular algorithm)
export function getHijriFromGregorian(gDate: Date, offset: number = 1): HijriDate {
  let y = gDate.getFullYear();
  let m = gDate.getMonth() + 1;
  let d = gDate.getDate();

  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = Math.floor(A / 4);
  const C = 2 - A + B;
  const E = Math.floor(365.25 * (y + 4716));
  const F = Math.floor(30.6001 * (m + 1));
  const JD = C + d + E + F - 1524.5;
  
  // Apply user offset
  const jd = Math.floor(JD + 0.5) + offset;

  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  
  let hMonth = Math.floor((24 * l) / 709);
  let hDay = l - Math.floor((709 * hMonth) / 24);
  let hYear = 30 * n + j - 30;

  // Final validation bounds to avoid overflow
  if (hDay <= 0) {
    hMonth -= 1;
    if (hMonth <= 0) {
      hMonth = 12;
      hYear -= 1;
    }
    hDay = 30; // approx
  }
  if (hMonth > 12) {
    hMonth = 12;
  }

  const monthIdx = (hMonth - 1 + 12) % 12;
  const mInfo = HIJRI_MONTHS[monthIdx] || HIJRI_MONTHS[11];

  return {
    day: hDay,
    month: hMonth,
    year: hYear,
    monthNameEn: mInfo.en,
    monthNameAr: mInfo.ar,
    monthNameUr: mInfo.ur
  };
}

// Convert a specific Hijri Date back estimate to Gregorian Date (for calendar grids)
export function getGregorianFromHijri(hYear: number, hMonth: number, hDay: number, offset: number = 1): Date {
  const n = Math.floor((hYear - 1) / 30);
  const j = hYear - 30 * n;
  let l = Math.floor((11 * j + 3) / 30) + 354 * j + 10631 * n + hDay - 383;
  if (hMonth > 1) {
    // Add cumulative days of preceding Hijri months
    // Alternate months are 30 and 29 days
    for (let m = 1; m < hMonth; m++) {
      l += (m % 2 === 1) ? 30 : 29;
    }
  }
  
  const jd = l + 1948440 - offset;
  
  // Convert Julian Day back to Gregorian
  const w = Math.floor((jd - 1867216.25) / 36524.25);
  const x = Math.floor(w / 4);
  const a = jd + 1 + w - x;
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d_temp = Math.floor(365.25 * c);
  const e = Math.floor((b - d_temp) / 30.6001);
  
  const gDay = b - d_temp - Math.floor(30.6001 * e);
  const gMonth = (e < 14) ? (e - 1) : (e - 13);
  const gYear = (gMonth > 2) ? (c - 4716) : (c - 4715);
  
  return new Date(gYear, gMonth - 1, gDay);
}

export default function IslamicCalendar() {
  const [offset, setOffset] = useState<number>(() => {
    const saved = localStorage.getItem('islamic_hijri_cal_offset');
    return saved !== null ? Number(saved) : 1; 
  });

  const currentDateObj = new Date();
  const todayHijri = getHijriFromGregorian(currentDateObj, offset);

  // States to navigate calendar view month and year
  const [viewMonth, setViewMonth] = useState<number>(todayHijri.month); // 1 to 12
  const [viewYear, setViewYear] = useState<number>(todayHijri.year);

  useEffect(() => {
    localStorage.setItem('islamic_hijri_cal_offset', String(offset));
  }, [offset]);

  const handleOffsetChange = (val: number) => {
    setOffset(prev => prev + val);
  };

  const handlePrevMonth = () => {
    setViewMonth(prev => {
      if (prev === 1) {
        setViewYear(y => y - 1);
        return 12;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setViewMonth(prev => {
      if (prev === 12) {
        setViewYear(y => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  const currentMonthInfo = HIJRI_MONTHS[viewMonth - 1];

  // Generate days in the viewed Hijri month (Hijri months are either 29 or 30 days)
  // Standard tabular months: odd months are 30, even are 29. Dhu al-Hijjah is 29 (or 30 in leap year)
  const isLeapYear = (30 * viewYear + 11) % 30 < 11;
  const daysInMonth = (viewMonth % 2 === 1) ? 30 : (viewMonth === 12 && isLeapYear ? 30 : 29);

  // Build list of days for grid
  const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  // Get weekday of the first Hijri day of this month
  const firstDayGregorian = getGregorianFromHijri(viewYear, viewMonth, 1, offset);
  const startDayOfWeek = firstDayGregorian.getDay(); // 0 = Sunday, 1 = Monday,...

  // Create empty slots for weekdays padding
  const emptyPads = Array.from({ length: startDayOfWeek }, (_, idx) => idx);

  const curHijriStr = `${todayHijri.day} ${todayHijri.monthNameEn} ${todayHijri.year} AH`;
  const curHijriUrdu = `${todayHijri.day} ${todayHijri.monthNameUr} ${todayHijri.year}ھ`;

  return (
    <div className="bg-white border border-brand-border rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
      {/* Calendar Header with Widget title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0">
            <CalIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
              <span>Islamic Hijri Calendar</span>
              <span className="font-arabic text-brand-green text-sm tracking-normal">(اسلامی ہجری کیلنڈر)</span>
            </h2>
            <p className="text-xs text-brand-stone">Calculated modern astronomical Hijri engine with manual moon sighting slider.</p>
          </div>
        </div>

        {/* Current today identifier */}
        <div className="bg-brand-light-gray border border-brand-border px-4 py-2 rounded-2xl text-right">
          <span className="text-[10px] font-bold text-brand-green uppercase font-mono block">Today's Date (آج کی تاریخ)</span>
          <span className="text-xs font-bold text-brand-text font-serif leading-tight block mt-0.5">{curHijriStr}</span>
          <span className="text-xs text-brand-stone font-arabic mt-0.5 block">{curHijriUrdu}</span>
        </div>
      </div>

      {/* Moon Sighting Adjustment Bar */}
      <div className="bg-brand-light-gray/60 border border-brand-border/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-2 text-brand-stone text-xs leading-relaxed max-w-md">
          <Moon className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
          <span>
            <strong>Moon Sighting Adjustment (رویتِ ہلال مطابقت):</strong> If Hijri dates in your country differ due to local moon sightings, adjust the slider below (+/- days).
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOffsetChange(-1)} 
            className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center font-bold text-brand-text hover:bg-brand-light-gray transition shadow-xs active:scale-95 cursor-pointer text-xs"
          >
            -1
          </button>
          <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 border border-brand-border rounded-lg shadow-2xs">
            Offset: {offset > 0 ? `+${offset}` : offset} Day{offset !== 1 && 's'}
          </span>
          <button 
            onClick={() => handleOffsetChange(1)} 
            className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center font-bold text-brand-text hover:bg-brand-light-gray transition shadow-xs active:scale-95 cursor-pointer text-xs"
          >
            +1
          </button>
          <button 
            onClick={() => setOffset(1)} 
            className="text-[10px] font-bold text-brand-stone hover:text-brand-green transition"
            title="Reset to astronomical standard (+1)"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Calendar Navigation Header & Month Display */}
      <div className="flex items-center justify-between bg-brand-green p-4 rounded-2xl text-white shadow-xs">
        <button 
          onClick={handlePrevMonth}
          className="p-2 bg-white/10 hover:bg-white/20 hover:scale-[1.03] rounded-xl transition text-white active:scale-95 cursor-pointer"
          title="Previous Hijri Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center font-bold select-none flex flex-col md:flex-row items-center gap-1 md:gap-3">
          <span className="font-serif text-lg leading-tight md:text-xl">{currentMonthInfo.en} {viewYear} AH</span>
          <span className="font-arabic text-white/90 text-sm md:text-base">({currentMonthInfo.ar} - {currentMonthInfo.ur})</span>
        </div>

        <button 
          onClick={handleNextMonth}
          className="p-2 bg-white/10 hover:bg-white/20 hover:scale-[1.03] rounded-xl transition text-white active:scale-95 cursor-pointer"
          title="Next Hijri Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Hijri Month Day Grid with Weekday Labels */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 text-center select-none">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dSymbol) => {
            const isWeekend = dSymbol === 'Sun' || dSymbol === 'Sat';
            return (
              <span 
                key={dSymbol} 
                className={`text-[10px] font-bold uppercase tracking-wider font-mono py-1 rounded ${
                  isWeekend ? 'text-brand-stone/60' : 'text-brand-green/80'
                }`}
              >
                {dSymbol}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {/* Pad prefix slots */}
          {emptyPads.map((empty) => (
            <div key={`empty-${empty}`} className="bg-brand-light-gray/10 rounded-xl border border-transparent h-14 md:h-16" />
          ))}

          {/* Actual days in the viewed month */}
          {daysArray.map((day) => {
            const dateOfFirst = getGregorianFromHijri(viewYear, viewMonth, day, offset);
            const isToday = Date.now() - dateOfFirst.getTime() > -43200000 && Date.now() - dateOfFirst.getTime() < 43200000;
            
            // Check if there's any major islamic events on this day
            const dayEvent = ISLAMIC_EVENTS.find(e => e.month === viewMonth && e.day === day);

            // Gregorian formatting
            const gregDayFormatted = dateOfFirst.getDate();
            const gregMonthName = dateOfFirst.toLocaleDateString('en-US', { month: 'short' });

            return (
              <div 
                key={`day-${day}`}
                className={`relative rounded-xl border p-2 flex flex-col justify-between h-14 md:h-16 transition-all hover:scale-[1.01] overflow-hidden select-none ${
                  isToday 
                    ? 'bg-brand-green/10 border-brand-green ring-1 ring-brand-green/20' 
                    : dayEvent 
                      ? 'bg-amber-50/70 border-amber-300' 
                      : 'bg-white border-brand-border/60 hover:border-brand-green/30'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className={`text-base font-extrabold leading-none ${isToday ? 'text-brand-green' : 'text-brand-text'}`}>
                    {day}
                  </span>
                  
                  {/* Gregorian mini text overlay */}
                  <span className="text-[8px] font-bold text-brand-stone font-mono leading-none">
                    {gregDayFormatted} {gregMonthName}
                  </span>
                </div>

                {/* Event micro title or indicator */}
                {dayEvent ? (
                  <span className="text-[7.5px] font-sans font-bold text-amber-800 bg-amber-100 px-1 py-0.5 rounded leading-none truncate max-w-full block" title={dayEvent.name}>
                    {dayEvent.name}
                  </span>
                ) : (
                  <span className="text-[8px] font-mono font-medium text-brand-stone/50 block text-right">
                    Day {day}
                  </span>
                )}

                {/* Border glowing today */}
                {isToday && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-green" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* List of Celebratory Key Events in this current month */}
      <div className="bg-amber-50/30 border border-amber-200/50 rounded-2xl p-4 space-y-3.5 animate-fadeIn">
        <h3 className="text-xs font-extrabold text-amber-800 uppercase font-mono tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" /> Significant Holy Days & Events In {currentMonthInfo.en}
        </h3>
        
        {/* Events listing */}
        {(() => {
          const eventsThisMonth = ISLAMIC_EVENTS.filter(e => e.month === viewMonth);
          if (eventsThisMonth.length === 0) {
            return (
              <p className="text-xs text-brand-stone italic pl-2">No key historical Islamic holidays fell on this month.</p>
            );
          }
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {eventsThisMonth.map((e, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-brand-border/60 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[12px] font-extrabold text-amber-800 line-clamp-1">{e.day}</span>
                    <span className="text-[6.5px] font-mono text-amber-700 uppercase leading-none">{currentMonthInfo.en.slice(0, 3)}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-brand-text block truncate leading-tight">{e.name}</span>
                    <span className="text-[11px] font-arabic font-semibold text-brand-stone block leading-normal">{e.urdu}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

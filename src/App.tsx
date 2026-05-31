/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AudioItem } from './types';
import IslamicMediaHub from './components/IslamicMediaHub';
import TasbihCounter from './components/TasbihCounter';
import AndroidGuide from './components/AndroidGuide';
import AboutInfoHub from './components/AboutInfoHub';
import GithubSyncHub from './components/GithubSyncHub';
import CompactGlobalPlayer from './components/CompactGlobalPlayer';
import DonationModal from './components/DonationModal';
import PrayerTimings from './components/PrayerTimings';
import { ISLAMIC_AUDIO_DATA } from './data';
import { 
  BookOpen, 
  Book, 
  Smartphone, 
  Heart, 
  Sparkles, 
  CheckCircle, 
  Radio, 
  Compass, 
  Download,
  Award,
  Menu,
  X,
  ChevronRight,
  Calendar,
  ArrowLeft,
  Info,
  GitBranch
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'media' | 'tasbih' | 'guide' | 'about' | 'github'>('media');
  const [activeTrack, setActiveTrack] = useState<AudioItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDonationOpen, setIsDonationOpen] = useState<boolean>(false);
  const [isAutoTriggered, setIsAutoTriggered] = useState<boolean>(false);

  // Unified global navigation and sidebar drawer state management
  const [selectedCategory, setSelectedCategory] = useState<'home' | 'all' | 'quran' | 'dua' | 'wird' | 'darood' | 'janazah' | 'favorites' | 'recent' | 'calendar' | 'kalma' | 'children'>('home');
  const [quranFilter, setQuranFilter] = useState<'all' | 'surah' | 'juz'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Check URL query parameters for a shared deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryTab = params.get('tab');
    
    if (queryTab === 'tasbih' || queryTab === 'guide' || queryTab === 'about' || queryTab === 'github') {
      setActiveTab(queryTab as 'media' | 'tasbih' | 'guide' | 'about' | 'github');
    } else {
      const trackId = params.get('track');
      if (trackId) {
        const foundTrack = ISLAMIC_AUDIO_DATA.find(item => item.id === trackId);
        if (foundTrack) {
          setActiveTrack(foundTrack);
          setIsPlaying(true);
          setActiveTab('media');
        }
      }
    }
  }, []);

  // Instantly scroll back to the top when the view tab or category changes, removing manual scroll-down friction!
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab, selectedCategory]);

  // Auto-trigger donation popup with minimal frequency (5 days limit)
  useEffect(() => {
    const lastPrompt = localStorage.getItem('islamic_app_last_donation_prompt');
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
    
    if (!lastPrompt || (Date.now() - Number(lastPrompt)) > fiveDaysInMs) {
      // Defer prompt showing slightly after mount to feel respectful
      const timer = setTimeout(() => {
        setIsAutoTriggered(true);
        setIsDonationOpen(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);
  const [greeting, setGreeting] = useState<{arabic: string; text: string; sub: string}>({
    arabic: 'السَّلَامُ عَلَيْكُمْ',
    text: 'Assalamu Alaikum',
    sub: 'May peace and blessings of Allah be upon you.'
  });

  // Calculate dynamic greeting based on time of day
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 12) {
      setGreeting({
        arabic: 'صَبَاحُ الْخَيْرِ',
        text: 'Good Morning (Subh-Bakhair)',
        sub: 'Start your dynamic day with the beautiful remembrance of Allah (ذكرullah).'
      });
    } else if (hours >= 12 && hours < 17) {
      setGreeting({
        arabic: 'السَّلَامُ عَلَيْكُمْ',
        text: 'Assalamu Alaikum',
        sub: 'Keep your tongue moist with the constant remembrance of Allah.'
      });
    } else {
      setGreeting({
        arabic: 'مَسَاءُ الْخَيْرِ',
        text: 'Good Evening (Shab-Bakhair)',
        sub: 'Sleep with a pure heart, reflecting upon the blessed Ayahs.'
      });
    }
  }, []);

  const handleSelectTrack = (track: AudioItem) => {
    setActiveTrack(track);
    setIsPlaying(true);
  };

  const handleTogglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleTrackCompleted = () => {
    setIsPlaying(false);
  };

  const menuOptions = [
    {
      group: "Portal Home & Calendar",
      urduGroup: "خوش آمدید اور اسلامی تاریخ",
      items: [
        {
          label: "Portal Dashboard",
          urdu: "مین پورٹل ڈیش بورڈ",
          icon: Compass,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('home');
          }
        },
        {
          label: "Islamic Hijri Calendar",
          urdu: "اسلامی ہجری کیلنڈر",
          icon: Calendar,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('calendar');
          }
        }
      ]
    },
    {
      group: "Al Quran Al-Karim",
      urduGroup: "القرآن الكريم",
      items: [
        {
          label: "Quranic Surahs",
          urdu: "تلاوتِ مبارک سورہ",
          icon: BookOpen,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('quran');
            setQuranFilter('surah');
          }
        },
        {
          label: "Quranic Parahs (Juz)",
          urdu: "قرآن پاک کے پارے",
          icon: Book,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('quran');
            setQuranFilter('juz');
          }
        }
      ]
    },
    {
      group: "Spiritual Remedies & Azkar",
      urduGroup: "مسنون دعائیں اور اذکار",
      items: [
        {
          label: "Islamic Duas",
          urdu: "مسنون و مقبول دعائیں",
          icon: Heart,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('dua');
          }
        },
        {
          label: "Wirds, Azkar & Wazaif",
          urdu: "اوراد و اذکار اور وظائف",
          icon: Compass,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('wird');
          }
        },
        {
          label: "Durood-e-Pak",
          urdu: "درودِ پاک مجموعہ",
          icon: Award,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('darood');
          }
        },
        {
          label: "Funeral (Janazah) Guide",
          urdu: "نمازِ جنازہ مکمل طریقہ",
          icon: CheckCircle,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('janazah');
          }
        },
        {
          label: "Six Kalmas",
          urdu: "شش کلمات",
          icon: Award,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('kalma');
          }
        },
        {
          label: "Children Section",
          urdu: "بچوں کا طریقہ (نماز)",
          icon: BookOpen,
          onClick: () => {
            setActiveTab('media');
            setSelectedCategory('children');
          }
        }
      ]
    },
    {
      group: "Application Utilities",
      urduGroup: "ایپلی کیشن یوٹیلیٹیز",
      items: [
        {
          label: "Tasbih / Wird Counter",
          urdu: "تسبیح کاؤنٹر",
          icon: Compass,
          onClick: () => {
            setActiveTab('tasbih');
          }
        },
        {
          label: "Android Guide",
          urdu: "اینڈرائیڈ انسٹالیشن گائیڈ",
          icon: Smartphone,
          onClick: () => {
            setActiveTab('guide');
          }
        },
        {
          label: "About & Privacy Policy",
          urdu: "معلومات اور پالیسی",
          icon: Info,
          onClick: () => {
            setActiveTab('about');
          }
        },
        {
          label: "GitHub Sync Hub",
          urdu: "گیٹ ہب مینوئل سنک",
          icon: GitBranch,
          onClick: () => {
            setActiveTab('github');
          }
        },
        {
          label: "Support & Donate",
          urdu: "عطیہ کیجئے / مالی معاونت",
          icon: Heart,
          onClick: () => {
            setIsAutoTriggered(false);
            setIsDonationOpen(true);
          },
          highlight: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans antialiased pb-36 relative">
      
      {/* Decorative top header line */}
      <div className="h-1 w-full bg-brand-green block" />

      {/* Floating Left Side Quick Menu Button (stuck to screen for instant sidebar access) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed left-4 bottom-28 md:bottom-auto md:top-36 z-40 flex items-center gap-2 px-3 py-2 bg-brand-green/95 backdrop-blur-md text-white hover:bg-brand-green rounded-2xl shadow-xl border border-brand-green/20 transition-all duration-200 active:scale-95 cursor-pointer font-bold text-[10px] uppercase tracking-wider"
        title="فہرست کِتاب / Toggle Navigation Menu"
      >
        <Menu className="w-4 h-4 animate-pulse" />
        <span>Directory Menu</span>
      </button>

      {/* Left Sidebar Overlay Drawer Components */}
      {/* Drawer Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-brand-stone/60 backdrop-blur-xs z-50 transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Drawer Navigation Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white border-r border-brand-border shadow-2xl z-51 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-brand-border flex justify-between items-center bg-brand-light-gray/40">
          <div>
            <span className="font-arabic text-sm font-bold text-brand-green block text-left" dir="rtl">فهرست کِتاب</span>
            <h2 className="text-xs font-bold tracking-tight text-brand-text uppercase font-mono mt-0.5">Quick Navigation Drawer</h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2.5 rounded-xl text-brand-stone hover:text-brand-text hover:bg-brand-light-gray border border-transparent hover:border-brand-border transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Options list */}
        <div className="flex-1 overflow-y-auto p-4 py-5 space-y-5 no-scrollbar">
          {menuOptions.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <div className="flex justify-between items-center px-2 select-none border-b border-brand-border/40 pb-1 mb-2">
                <span className="text-[9px] font-bold text-brand-stone font-mono uppercase tracking-widest">{group.group}</span>
                <span className="font-arabic text-[11px] font-semibold text-brand-stone/85">{group.urduGroup}</span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => {
                        item.onClick();
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-all duration-200 cursor-pointer text-left select-none border ${
                        item.highlight 
                           ? 'bg-rose-50 border-rose-100/50 hover:bg-rose-100 text-rose-700 hover:border-rose-200' 
                          : 'bg-transparent hover:bg-brand-light-gray border-transparent hover:border-brand-border/60 text-brand-stone hover:text-brand-text'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          item.highlight ? 'bg-rose-100 text-rose-600' : 'bg-brand-light-gray text-brand-green'
                        }`}>
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-sans text-[11px] tracking-tight truncate">{item.label}</span>
                          <span className="font-arabic text-[10px] font-medium leading-none text-brand-stone/70 mt-0.5 truncate">{item.urdu}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition ${item.highlight ? 'text-rose-500' : 'text-brand-stone/50'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer info */}
        <div className="p-4 border-t border-brand-border bg-brand-light-gray/20 text-center text-[9px] font-mono text-brand-stone select-none">
          ISLAMIC REMEMBRANCE PORTAL v1.1.0
        </div>
      </aside>

      {/* Render Primary Header Banner ONLY on Home Portal Central Page */}
      {activeTab === 'media' && selectedCategory === 'home' ? (
        <header className="max-w-6xl mx-auto w-full px-4 py-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Spiritual Kaaba GIF Banner and Header Title with Menu Drawer toggle */}
            <div className="flex items-center gap-4 animate-fadeIn">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-3.5 bg-brand-green hover:bg-brand-green/90 text-white rounded-2xl shadow-sm border border-brand-green/10 cursor-pointer transition-all duration-200 active:scale-95 shrink-0"
                title="کھولیں فہرست / Open Quick Access Drawer Menu"
              >
                <Menu className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Rounded Khana Kaaba Vector Box with pristine custom SVG, working 100% offline */}
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm shrink-0 bg-[#0B132B] group cursor-pointer" title="The Holy Kaaba in Mecca">
                <svg viewBox="0 0 100 100" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                  <defs>
                    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0B132B" />
                      <stop offset="100%" stopColor="#1C2541" />
                    </linearGradient>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="doorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                  </defs>

                  {/* Sky background */}
                  <rect x="0" y="0" width="100" height="100" fill="url(#skyGrad)" />
                  
                  {/* Stars */}
                  <circle cx="15" cy="20" r="0.7" fill="#ffffff" opacity="0.8" />
                  <circle cx="85" cy="15" r="0.9" fill="#ffffff" opacity="0.9" />
                  <circle cx="30" cy="12" r="0.5" fill="#ffffff" opacity="0.6" />
                  <circle cx="70" cy="25" r="0.6" fill="#ffffff" opacity="0.5" />
                  <circle cx="50" cy="8" r="0.8" fill="#ffffff" opacity="0.8" />
                  
                  {/* Crescent Moon */}
                  <path d="M 75 12 A 4 4 0 1 0 81 18 A 3.2 3.2 0 1 1 75 12 Z" fill="#FBBF24" opacity="0.9" />

                  {/* Ground / Marble floor */}
                  <path d="M 0 70 L 100 70 L 100 100 L 0 100 Z" fill="#E2E8F0" />
                  
                  {/* Kaaba Base (White marble baseline in perspective) */}
                  <path d="M 15 72 L 50 82 L 85 72 L 85 68 L 50 78 L 15 68 Z" fill="#F8FAFC" />

                  {/* Kaaba Main Body (Perspective blocks) */}
                  {/* Left Wall */}
                  <path d="M 18 35 L 50 43 L 50 78 L 18 70 Z" fill="#111827" />
                  {/* Right Wall */}
                  <path d="M 50 43 L 82 35 L 82 70 L 50 78 Z" fill="#1F2937" />

                  {/* Left Top Gold Calligraphy Belt */}
                  <path d="M 18 40 L 50 48 L 50 51 L 18 43 Z" fill="url(#goldGrad)" />
                  {/* Right Top Gold Calligraphy Belt */}
                  <path d="M 50 48 L 82 40 L 82 43 L 50 51 Z" fill="url(#goldGrad)" />

                  {/* Calligraphy stroke textures */}
                  <path d="M 21 41.5 L 47 48 M 21 42.2 L 47 48.7" stroke="#111827" strokeWidth="0.3" strokeDasharray="1.5,1" />
                  <path d="M 53 48 L 79 41.5 M 53 48.7 L 79 42.2" stroke="#111827" strokeWidth="0.3" strokeDasharray="1.5,1" />

                  {/* Golden Entrance Door */}
                  <path d="M 57 52 L 67 49 L 67 71 L 57 74 Z" fill="#78350F" />
                  <path d="M 58 53 L 66 50.5 L 66 70 L 58 72.5 Z" fill="url(#doorGrad)" />
                  <line x1="62" y1="51.5" x2="62" y2="71" stroke="#451A03" strokeWidth="0.5" />
                  <circle cx="60" cy="61" r="0.6" fill="#451A03" />
                  <circle cx="64" cy="60" r="0.6" fill="#451A03" />
                  <rect x="59.5" y="66" width="5" height="2" transform="rotate(-15 62 66)" fill="#FBBF24" />

                  {/* Hatim Semicircle Barrier */}
                  <path d="M 10 74 C 10 84, 40 88, 48 83" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                  <path d="M 10 74 C 10 84, 40 88, 48 83" fill="none" stroke="#F1F5F9" strokeWidth="1.5" />
                </svg>
                <div className="absolute inset-0 ring-1 ring-black/10 rounded-2xl pointer-events-none" />
              </div>

              <div className="space-y-0.5 text-left">
                <span className="text-lg md:text-xl font-extrabold font-arabic text-brand-green block tracking-tight leading-none" dir="rtl">
                  الْوِرْدُ وَالدُّعَاءُ الْإِسْلَامِيُّ
                </span>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-brand-text flex items-center gap-2 leading-none">
                  <span>Al-Wird Islamic Hub</span>
                  <span className="text-[9px] font-bold text-white bg-brand-green/85 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono shrink-0">
                    Remembrance
                  </span>
                </h1>
                <p className="text-brand-stone text-[11px] md:text-xs">
                  Your spiritual pocket companion for Duas, Wirds &amp; Tasbih
                </p>
              </div>
            </div>

            {/* Tab buttons and Donation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <div className="flex flex-wrap bg-brand-light-gray p-1.5 rounded-2xl border border-brand-border w-full sm:w-auto gap-1">
                <button
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'media'
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'text-brand-stone hover:text-brand-text'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" /> Listen Hub
                </button>
                <button
                  onClick={() => setActiveTab('tasbih')}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'tasbih'
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'text-brand-stone hover:text-brand-text'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" /> Wird Counter
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'guide'
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'text-brand-stone hover:text-brand-text'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Android Guide
                </button>
                <button
                  onClick={() => setActiveTab('github')}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'github'
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'text-brand-stone hover:text-brand-text'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" /> GitHub Sync
                </button>
              </div>

              {/* Support / Donation active button */}
              <button
                onClick={() => {
                  setIsAutoTriggered(false);
                  setIsDonationOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 md:py-3.5 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 hover:border-rose-200 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
                title="سپورٹ کریں / Support Core Server Expenses"
              >
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600 animate-pulse" />
                <span>عطیہ کیجئے / Donate</span>
              </button>
            </div>

          </div>
        </header>
      ) : (
        /* Standalone compact visual top-padding when homepage is hidden */
        <div className="h-4 block" />
      )}

      {/* Standardized Active Section Navigation Toolbar (Shown on all active segments inside any view) */}
      {!(activeTab === 'media' && selectedCategory === 'home') && (
        <div className="max-w-6xl mx-auto w-full px-4 mb-6">
          <div className="bg-white border border-brand-border rounded-3xl p-4 md:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            
            {/* Left side: Back to Directory button, Home icon reference, dynamic section headings */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-start text-left">
              
              {/* Sleek Direct Back Button */}
              <button
                onClick={() => {
                  setActiveTab('media');
                  setSelectedCategory('home');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F4F5F1] hover:bg-brand-green hover:text-white rounded-2xl text-xs font-extrabold text-[#53564A] transition-all duration-200 cursor-pointer border border-[#E4E5E1] hover:border-brand-green active:scale-95 select-none"
                title="Go back to dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              
              {/* Home Icon/Link Button */}
              <button
                onClick={() => {
                  setActiveTab('media');
                  setSelectedCategory('home');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F4F5F1] hover:bg-brand-green hover:text-white rounded-2xl text-xs font-extrabold text-[#53564A] transition-all duration-200 cursor-pointer border border-[#E4E5E1] hover:border-brand-green active:scale-95 select-none"
                title="Back to Home Portal Directory"
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>Home</span>
              </button>

              {/* Mobile quick menu drawer click */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-brand-green/10 hover:bg-brand-green hover:text-white rounded-2xl text-xs font-extrabold text-brand-green transition-all duration-200 cursor-pointer border border-brand-green/20 hover:border-brand-green active:scale-95 lg:hidden"
                title="Open Directory Sections Menu"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Sections</span>
              </button>

              <div className="h-6 w-px bg-brand-border mx-1 hidden sm:block" />

              {/* Active Area Title details */}
              <div className="text-left">
                <span className="text-[8px] font-bold text-brand-stone uppercase tracking-widest font-mono block">Selected Segment</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-xs md:text-sm font-black text-brand-text uppercase tracking-tight">
                    {activeTab === 'github' && 'GitHub Manual Sync Hub'}
                    {activeTab === 'tasbih' && 'Tasbih & Wird Counter'}
                    {activeTab === 'guide' && 'Android App Guide'}
                    {activeTab === 'about' && 'About, Contact & Privacy Policy'}
                    {activeTab === 'media' && (
                      <>
                        {selectedCategory === 'all' && 'All Audios & Repertoire'}
                        {selectedCategory === 'quran' && 'Noble Quran Recitations'}
                        {selectedCategory === 'dua' && 'Spiritual Duas & Prayers'}
                        {selectedCategory === 'wird' && 'Wirds, Azkar & Wazaif'}
                        {selectedCategory === 'darood' && 'Blessed Durood-e-Pak'}
                        {selectedCategory === 'janazah' && 'Funeral (Janazah) Service'}
                        {selectedCategory === 'kalma' && 'Six Foundations (Kalmas)'}
                        {selectedCategory === 'children' && 'Kids Islamic Prayer Guide'}
                        {selectedCategory === 'favorites' && 'Your Favorites Collection'}
                        {selectedCategory === 'recent' && 'Your Listening History'}
                        {selectedCategory === 'calendar' && 'Islamic Hijri Calendar'}
                      </>
                    )}
                  </h2>
                  <span className="font-arabic text-[10px] text-brand-green font-bold bg-brand-green/5 px-2 py-0.5 rounded-lg border border-brand-green/10">
                    {activeTab === 'github' && 'گیٹ ہب مینوئل سنک'}
                    {activeTab === 'tasbih' && 'تسبیح کاؤنٹر'}
                    {activeTab === 'guide' && 'اینڈرائیڈ انسٹال'}
                    {activeTab === 'about' && 'معلومات و پالیسی'}
                    {activeTab === 'media' && (
                      <>
                        {selectedCategory === 'all' && 'تمام آڈیوز'}
                        {selectedCategory === 'quran' && 'تلاوتِ قرآن'}
                        {selectedCategory === 'dua' && 'مسنون دعائیں'}
                        {selectedCategory === 'wird' && 'اوراد و وظائف'}
                        {selectedCategory === 'darood' && 'درودِ پاک'}
                        {selectedCategory === 'janazah' && 'نمازِ جنازہ'}
                        {selectedCategory === 'kalma' && 'شش کلمات'}
                        {selectedCategory === 'children' && 'بچوں کا طریقہ'}
                        {selectedCategory === 'favorites' && 'محفوظ کلام'}
                        {selectedCategory === 'recent' && 'تاریخِ سماعت'}
                        {selectedCategory === 'calendar' && 'ہجری کیلنڈر'}
                      </>
                    )}
                  </span>
                </div>
              </div>

            </div>

            {/* Right side: Branding tag */}
            <div className="flex items-center gap-2 select-none self-end sm:self-auto text-right">
              <span className="text-[10px] text-brand-stone font-mono tracking-wider font-semibold">AL-WIRD PORTAL</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            </div>

          </div>
        </div>
      )}

      {/* Main Sections */}
      <main className="max-w-6xl mx-auto w-full px-4 flex-grow animate-fadeIn">
        
        {/* Render PrayerTimings and dynamic offset widget ONLY on Homepage Central portal */}
        {activeTab === 'media' && selectedCategory === 'home' && (
          <PrayerTimings />
        )}

        {/* Dynamic content rendering with subtle animations */}
        <div className="animate-fadeIn min-h-[400px]">
          {activeTab === 'media' && (
            <IslamicMediaHub
              currentPlayingId={activeTrack?.id || null}
              isPlaying={isPlaying}
              onSelectTrack={handleSelectTrack}
              onTogglePlayPause={handleTogglePlayPause}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              quranFilter={quranFilter}
              setQuranFilter={setQuranFilter}
            />
          )}

          {activeTab === 'tasbih' && (
            <TasbihCounter />
          )}

          {activeTab === 'guide' && (
            <AndroidGuide />
          )}

          {activeTab === 'about' && (
            <AboutInfoHub />
          )}

          {activeTab === 'github' && (
            <GithubSyncHub />
          )}
        </div>

      </main>

      {/* Persistent global audio controller */}
      <CompactGlobalPlayer
        activeTrack={activeTrack}
        isPlaying={isPlaying}
        onClose={() => {
          setIsPlaying(false);
          setActiveTrack(null);
        }}
        onTogglePlayPause={handleTogglePlayPause}
        onTrackCompleted={handleTrackCompleted}
      />

      {/* Minimal clean footer */}
      <footer className="mt-16 border-t border-brand-border py-8 bg-brand-bg select-none">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-stone">
          <p>© 2026 Islamic Audio &amp; Wird Hub. Secure, ad-free sandbox template.</p>
          <button 
            onClick={() => {
              setIsAutoTriggered(false);
              setIsDonationOpen(true);
            }}
            className="flex items-center gap-1.5 hover:text-brand-green transition duration-200 cursor-pointer"
          >
            <span>Made with spiritual excellence &amp; support</span> <Heart className="w-3.5 h-3.5 text-brand-green fill-brand-green animate-pulse" />
          </button>
        </div>
      </footer>

      {/* Donation Appelle Overlay Modal */}
      <DonationModal 
        isOpen={isDonationOpen} 
        onClose={() => setIsDonationOpen(false)}
        isAutoTriggered={isAutoTriggered}
      />

    </div>
  );
}

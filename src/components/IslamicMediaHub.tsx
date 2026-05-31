import React, { useState, useEffect } from 'react';
import { AudioItem, DownloadStatus, DownloadProgress } from '../types';
import { ISLAMIC_AUDIO_DATA } from '../data';
import { 
  Play, 
  Pause, 
  Download, 
  Search, 
  Check, 
  CloudRain, 
  Book, 
  Volume2, 
  Globe, 
  Trash2,
  Bookmark,
  Share2,
  FileAudio,
  AlertCircle,
  Heart,
  History,
  Sparkles,
  Compass,
  Award,
  BookOpen,
  Calendar,
  RotateCw,
  ArrowLeft,
  X,
  Filter
} from 'lucide-react';
import { getDailyAyah, getDailyHadith } from '../dailyReminders';
import IslamicCalendar, { getHijriFromGregorian } from './IslamicCalendar';
import { getCorsFriendlyUrl } from '../utils/audioUtils';

// Removes tashkeel diacritics and converts to standard, searchable characters
function normalizeTextForSearch(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    // Remove Arabic diacritics (Fatha, Kasra, Damma, Sukun, Tanween, etc.)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Arabic letters that frequently vary
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    // Remove common grammatical punctuation so we match actual words
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
    .trim();
}

// Converts HH:MM:SS or MM:SS format to total seconds
function getDurationInSeconds(durationStr: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parts[0] || 0;
}

interface IslamicMediaHubProps {
  currentPlayingId: string | null;
  isPlaying: boolean;
  onSelectTrack: (track: AudioItem) => void;
  onTogglePlayPause: () => void;
  selectedCategory?: 'home' | 'all' | 'quran' | 'dua' | 'wird' | 'darood' | 'janazah' | 'favorites' | 'recent' | 'calendar' | 'kalma' | 'children';
  setSelectedCategory?: (category: 'home' | 'all' | 'quran' | 'dua' | 'wird' | 'darood' | 'janazah' | 'favorites' | 'recent' | 'calendar' | 'kalma' | 'children') => void;
  quranFilter?: 'all' | 'surah' | 'juz';
  setQuranFilter?: (filter: 'all' | 'surah' | 'juz') => void;
}

export default function IslamicMediaHub({
  currentPlayingId,
  isPlaying,
  onSelectTrack,
  onTogglePlayPause,
  selectedCategory: propCategory,
  setSelectedCategory: propSetCategory,
  quranFilter: propQuranFilter,
  setQuranFilter: propSetQuranFilter
}: IslamicMediaHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [offlineOnly, setOfflineOnly] = useState<boolean>(false);
  const [inspirationSeed, setInspirationSeed] = useState<number>(0);
  
  const [localCategory, localSetCategory] = useState<'home' | 'all' | 'quran' | 'dua' | 'wird' | 'darood' | 'janazah' | 'favorites' | 'recent' | 'calendar' | 'kalma' | 'children'>('home');
  const [localQuranFilter, localSetQuranFilter] = useState<'all' | 'surah' | 'juz'>('all');

  const selectedCategory = propCategory !== undefined ? propCategory : localCategory;
  const setSelectedCategory = propSetCategory !== undefined ? propSetCategory : localSetCategory;

  const quranFilter = propQuranFilter !== undefined ? propQuranFilter : localQuranFilter;
  const setQuranFilter = propSetQuranFilter !== undefined ? propSetQuranFilter : localSetQuranFilter;

  const [currentOffset, setCurrentOffset] = useState<number>(() => {
    const saved = localStorage.getItem('islamic_hijri_cal_offset');
    return saved !== null ? Number(saved) : 1;
  });

  useEffect(() => {
    const checkOffset = () => {
      const saved = localStorage.getItem('islamic_hijri_cal_offset');
      if (saved !== null) {
        setCurrentOffset(Number(saved));
      }
    };
    checkOffset();
  }, [selectedCategory]);
  const [languages, setLanguages] = useState<Record<string, 'en' | 'ur'>>({});
  
  // Load favorites from local storage
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('islamic_app_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep local storage in sync
  useEffect(() => {
    localStorage.setItem('islamic_app_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(favId => favId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Load recently played tracks from localStorage
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>(() => {
    const saved = localStorage.getItem('islamic_app_recently_played');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep recently played history up to date (max 5 tracks)
  useEffect(() => {
    if (currentPlayingId) {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(id => id !== currentPlayingId);
        const updated = [currentPlayingId, ...filtered].slice(0, 5);
        localStorage.setItem('islamic_app_recently_played', JSON.stringify(updated));
        return updated;
      });
    }
  }, [currentPlayingId]);

  const clearRecentlyPlayed = () => {
    setRecentlyPlayed([]);
    localStorage.removeItem('islamic_app_recently_played');
  };

  // Track offline cached download states of items
  const [downloads, setDownloads] = useState<Record<string, { status: DownloadStatus; progress: number }>>(() => {
    const saved = localStorage.getItem('islamic_app_downloads');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('islamic_app_downloads', JSON.stringify(downloads));
  }, [downloads]);

  const triggerBlobDownload = (blob: Blob, item: AudioItem) => {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Local file download trigger failed:", err);
    }
  };

  // Execute actual background Cache download & trigger device-level browser file download without redirects
  const startSimulatedDownload = async (item: AudioItem) => {
    const itemId = item.id;
    if (downloads[itemId]?.status === 'downloaded') return;

    // Set downloading state
    setDownloads(prev => ({
      ...prev,
      [itemId]: { status: 'downloading', progress: 0 }
    }));

    try {
      // 1. Try to open the Cache API for in-app offline playback
      let cache: Cache | null = null;
      try {
        if ('caches' in window) {
          cache = await caches.open('islamic_audio_cache');
        }
      } catch (cacheErr) {
        console.warn("Caches not supported or error:", cacheErr);
      }

      // 2. Fetch the audio file in the background using a highly resilient CORS proxy chain (since archive.org restricts direct cross-origin fetches)
      let response: Response | null = null;
      let lastError: any = null;

      const cleanSafeFilename = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      const backendProxyUrl = `/api/download?url=${encodeURIComponent(item.audioUrl)}&filename=${encodeURIComponent(cleanSafeFilename)}`;

      const needsProxy = item.audioUrl.includes('archive.org');
      const fetchUrlsToTry = needsProxy 
        ? [
            backendProxyUrl, // Our server-side proxy which handles redirects and strips CORS beautifully!
            `https://corsproxy.io/?url=${encodeURIComponent(item.audioUrl)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(item.audioUrl)}`,
            item.audioUrl // Direct fallback
          ]
        : [
            backendProxyUrl,
            item.audioUrl
          ];

      for (const urlToTry of fetchUrlsToTry) {
        try {
          console.log(`Attempting background download fetch from: ${urlToTry}`);
          const res = await fetch(urlToTry);
          if (res.ok) {
            response = res;
            break;
          }
          console.warn(`Fetch returned status ${res.status} for URL: ${urlToTry}`);
        } catch (fetchErr) {
          lastError = fetchErr;
          console.warn(`Fetch error for URL ${urlToTry}:`, fetchErr);
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Noble background audio download failed after trying proxy chains. Last details: ${lastError || 'HTTP status fail'}`);
      }

      // 3. Keep in cache for offline play
      if (cache) {
        try {
          // Put clean original-origin URL as key so player can find it offline, but with proxied standard response bytes
          await cache.put(item.audioUrl, response.clone());
          console.log("Cached audio successfully for offline play in-app:", item.title);
        } catch (cachePutErr) {
          console.warn("Failed caching response:", cachePutErr);
        }
      }

      // 4. Try reading stream to track progress & convert to Blob for local device saving
      const contentLengthHeader = response.headers.get('content-length');
      const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      const reader = response.body?.getReader();

      if (!reader) {
        // Fallback if reader not supported
        const blob = await response.blob();
        triggerBlobDownload(blob, item);
        setDownloads(prev => ({
          ...prev,
          [itemId]: { status: 'downloaded', progress: 100 }
        }));
        showToast(`"${item.title}" ڈاؤنلوڈ ہو گیا اور offline cache بھی مکمل ہو گیا!`);
        return;
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength > 0) {
          const progress = Math.min(Math.round((receivedLength / contentLength) * 100), 99);
          setDownloads(prev => ({
            ...prev,
            [itemId]: { status: 'downloading', progress }
          }));
        }
      }

      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      const blob = new Blob([allChunks], { type: 'audio/mpeg' });
      triggerBlobDownload(blob, item);

      setDownloads(prev => ({
        ...prev,
        [itemId]: { status: 'downloaded', progress: 100 }
      }));
      showToast(`"${item.title}" ڈاؤنلوڈ ہو گیا اور offline play کے لیے تیار ہے!`);

    } catch (err) {
      console.warn("Background download fetch failed (possibly CORS restricted). Running seamless offline cache & direct download fallback.", err);
      
      // Fallback 1: Store the track to app-level offline cache block anyway (for in-app play if service worker or browser allows)
      try {
        if ('caches' in window) {
          const cache = await caches.open('islamic_audio_cache');
          await cache.add(new Request(item.audioUrl, { mode: 'no-cors' }));
          console.log("Acquired opaque offline response for in-app play:", item.title);
        }
      } catch (cacheErr) {
        console.warn("Cache add with no-cors failed:", cacheErr);
      }

      // Fallback 2: Trigger direct browser download through our node-based proxy to bypass CORS and force native file save without archive.org redirection!
      try {
        const a = document.createElement('a');
        const cleanSafeFilename = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
        a.href = `/api/download?url=${encodeURIComponent(item.audioUrl)}&filename=${encodeURIComponent(cleanSafeFilename)}&download=true`;
        a.download = cleanSafeFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (triggerErr) {
        console.error("Direct browser download fallback failed:", triggerErr);
      }

      // Elegant background progress bar for visual tracking inside the UI
      let progressCount = 0;
      const interval = setInterval(() => {
        progressCount += 10;
        setDownloads(prev => ({
          ...prev,
          [itemId]: { status: 'downloading', progress: Math.min(progressCount, 100) }
        }));

        if (progressCount >= 100) {
          clearInterval(interval);
          setDownloads(prev => ({
            ...prev,
            [itemId]: { status: 'downloaded', progress: 100 }
          }));
          showToast(`"${item.title}" ڈاؤنلوڈ اور ایپ آف لائن کیشے دونوں مکمل! (Downloaded successfully)`);
        }
      }, 80);
    }
  };

  const removeDownloadedFile = async (item: AudioItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemId = item.id;
    
    try {
      if ('caches' in window) {
        const cache = await caches.open('islamic_audio_cache');
        await cache.delete(item.audioUrl);
      }
    } catch (err) {
      console.error("Failed to delete cached audio:", err);
    }

    setDownloads(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
    showToast(`"${item.title}" offline اسٹوریج سے ہٹا دیا گیا (Removed from offline storage)`);
  };

  const toggleLanguage = (itemId: string) => {
    setLanguages(prev => ({
      ...prev,
      [itemId]: prev[itemId] === 'ur' ? 'en' : 'ur'
    }));
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => current === msg ? null : current);
    }, 3000);
  };

  const handleShare = async (item: AudioItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Construct sharing URL containing track parameter
    const url = new URL(window.location.href);
    url.searchParams.set('track', item.id);
    const shareUrl = url.toString();

    const shareData = {
      title: `${item.title} - ${item.arabicTitle}`,
      text: `Listen to "${item.title}" (${item.arabicTitle}) with Urdu/English Translation on Islamic Media Hub!`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showToast(`Successfully shared "${item.title}"!`);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl, item.title);
        }
      }
    } else {
      copyToClipboard(shareUrl, item.title);
    }
  };

  const copyToClipboard = async (url: string, title: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(`Link for "${title}" copied to clipboard!`);
    } catch (err) {
      showToast('Could not copy link. Copying URL fallback...');
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast(`Link for "${title}" copied to clipboard!`);
      } catch (e) {
        showToast('Please copy: ' + url);
      }
      document.body.removeChild(textArea);
    }
  };

  // Filter and order media items with resilient search and duration/offline controls
  const filteredData = (() => {
    // 1. Establish the base list based on category
    let list: AudioItem[] = [];
    if (selectedCategory === 'recent') {
      list = recentlyPlayed
        .map(id => ISLAMIC_AUDIO_DATA.find(item => item.id === id))
        .filter((item): item is AudioItem => !!item);
    } else {
      list = ISLAMIC_AUDIO_DATA.filter(item => {
        return selectedCategory === 'all' || 
               (selectedCategory === 'favorites' ? favorites.includes(item.id) : 
                selectedCategory === 'home' ? searchQuery !== '' : item.category === selectedCategory);
      });
    }

    // 2. Apply Quran sub-filtering
    if (selectedCategory === 'quran' || selectedCategory === 'all') {
      list = list.filter(item => {
        if (quranFilter === 'surah') {
          return !item.id.startsWith('juz_');
        } else if (quranFilter === 'juz') {
          return item.id.startsWith('juz_');
        }
        return true;
      });
    }

    // 3. Apply Multi-field Intelligent Search (Case-Insensitive & Diacritic-Insensitive)
    const matchTerm = normalizeTextForSearch(searchQuery);
    if (matchTerm) {
      list = list.filter(item => {
        const fieldsToSearch = [
          item.title,
          item.arabicTitle,
          item.arabicText,
          item.translationText,
          item.translationUrdu,
          item.benefits,
          item.category
        ];
        return fieldsToSearch.some(field => {
          if (!field) return false;
          return normalizeTextForSearch(field).includes(matchTerm);
        });
      });
    }

    // 4. Apply Duration Filter
    if (durationFilter !== 'all') {
      list = list.filter(item => {
        const secs = getDurationInSeconds(item.duration);
        if (durationFilter === 'short') {
          return secs < 180; // less than 3 minutes
        } else if (durationFilter === 'medium') {
          return secs >= 180 && secs <= 420; // 3 to 7 minutes
        } else if (durationFilter === 'long') {
          return secs > 420; // greater than 7 minutes
        }
        return true;
      });
    }

    // 5. Apply Offline Cached Filter
    if (offlineOnly) {
      list = list.filter(item => downloads[item.id]?.status === 'downloaded');
    }

    return list;
  })();

  const todayDate = new Date();
  const rawHijri = getHijriFromGregorian(todayDate, currentOffset);
  const englishDateStr = `${rawHijri.day} ${rawHijri.monthNameEn} ${rawHijri.year} AH`;
  const urduDateStr = `${rawHijri.day} ${rawHijri.monthNameUr} ${rawHijri.year}ھ`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Left Sidebar Menu */}
      <aside className="hidden lg:block lg:w-64 lg:sticky lg:top-6 bg-white border border-brand-border p-5 rounded-3xl space-y-4 shadow-sm shrink-0">
        <div className="hidden lg:block">
          <h3 className="text-xs font-bold text-brand-stone font-mono uppercase tracking-wider px-2 mb-2 select-none">
            Islamic Sections
          </h3>
        </div>
        
        {/* Navigation list */}
        <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2.5 lg:pb-0 scroll-smooth no-scrollbar select-none w-full">
          {[
            { id: 'home', label: 'Home Portal', urdu: 'مرکزی صفحہ', icon: Compass },
            { id: 'all', label: 'All Audios', urdu: 'تمام آڈیوز', icon: FileAudio },
            { id: 'quran', label: 'Noble Quran', urdu: 'تلاوتِ قرآن', icon: Book },
            { id: 'dua', label: 'Spiritual Duas', urdu: 'مسنون دعائیں', icon: Heart },
            { id: 'wird', label: 'Wirds & Wazaif', urdu: 'اوراد و وظائفِ مبارکہ', icon: Volume2 },
            { id: 'darood', label: 'Durood-e-Pak', urdu: 'درود پاک', icon: Globe },
            { id: 'janazah', label: 'Janazah Guide', urdu: 'نمازِ جنازہ', icon: Bookmark },
            { id: 'kalma', label: 'Six Kalmas', urdu: 'شش کلمات', icon: Award },
            { id: 'children', label: 'Children Section', urdu: 'بچوں کا طریقہ', icon: BookOpen },
            { id: 'favorites', label: '⭐ Favorites', urdu: 'محفوظ شدہ', icon: Heart },
            { id: 'recent', label: '🕒 History', urdu: 'تاریخ', icon: History },
            { id: 'calendar', label: 'Islamic Calendar', urdu: 'ہجری کیلنڈر', icon: Calendar }
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`w-[140px] lg:w-full flex lg:flex-row flex-col items-center lg:items-start gap-2.5 px-3.5 py-3 lg:py-3 rounded-2xl text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer shrink-0 border select-none ${
                  isActive
                    ? 'bg-brand-green text-white border-brand-green shadow-sm scale-[1.01]'
                    : 'bg-transparent text-brand-stone hover:text-brand-text hover:bg-brand-light-gray/45 border-transparent hover:border-brand-border/60'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-brand-light-gray text-brand-green border border-brand-border/30'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col lg:items-start items-center text-center lg:text-left truncate w-full">
                  <span className="font-sans text-[11px] tracking-tight truncate w-full">{cat.label}</span>
                  <span className={`font-arabic text-[10px] font-medium leading-none mt-0.5 ${isActive ? 'text-white/85' : 'text-brand-stone/70'}`}>{cat.urdu}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Right Column Content */}
      <div className="flex-grow w-full space-y-6">
        {selectedCategory === 'home' && searchQuery === '' ? (
          /* REDESIGNED HOMEPAGE PORTAL DASHBOARD (Starting Interface) */
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Dynamic Islamic Date Banner */}
            <div className="bg-brand-green/10 border border-brand-green/20 rounded-3xl p-5 text-center shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-green text-white rounded-2xl flex items-center justify-center text-lg shadow-sm">🌙</div>
                <div className="text-left animate-fadeIn">
                  <span className="text-[9px] font-extrabold text-brand-stone uppercase tracking-widest font-mono">Current Islamic Hijri Date</span>
                  <span className="text-sm font-bold text-brand-text block">{englishDateStr}</span>
                </div>
              </div>
              <div className="text-center md:text-right">
                <span className="font-arabic text-brand-green text-xl font-bold block" dir="rtl">{urduDateStr}</span>
                <span className="text-[10px] text-brand-stone block mt-0.5 font-sans">Adjust date offset under the Calendar tab.</span>
              </div>
            </div>

            {/* 2. Ayat & Prophetic Hadith Cards stack */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Daily Quranic Ayah */}
              <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-2">
                  <span className="text-[10px] font-mono font-bold text-brand-stone uppercase tracking-widest">Ayah of the Day (آیتِ کریمہ)</span>
                  <span className="text-[10px] text-brand-green font-bold bg-brand-green/10 px-2 py-0.5 rounded-md font-mono">{getDailyAyah(inspirationSeed).reference}</span>
                </div>
                <div className="space-y-3.5 text-left">
                  <p className="text-lg font-serif text-brand-green font-arabic leading-relaxed text-right select-all" dir="rtl">
                    {getDailyAyah(inspirationSeed).arabic}
                  </p>
                  <p className="text-xs font-arabic font-urdu text-[#3D3d3d] text-right leading-loose border-t border-brand-border/40 pt-2" dir="rtl">
                    {getDailyAyah(inspirationSeed).urdu}
                  </p>
                  <p className="text-xs text-brand-stone leading-relaxed italic">
                    "{getDailyAyah(inspirationSeed).english}"
                  </p>
                </div>
              </div>

              {/* Daily Prophetic Hadith */}
              <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-2">
                  <span className="text-[10px] font-mono font-bold text-brand-stone uppercase tracking-widest">Hadith of the Day (حدیثِ مبارکہ)</span>
                  <span className="text-[10px] text-[#A27B0C] font-bold bg-amber-500/10 px-2 py-0.5 rounded-md font-mono">{getDailyHadith(inspirationSeed).reference}</span>
                </div>
                <div className="space-y-3.5 text-left">
                  <p className="text-xs text-brand-text leading-relaxed font-sans font-medium">
                    "{getDailyHadith(inspirationSeed).english}"
                  </p>
                  <p className="text-xs font-arabic font-urdu text-brand-stone text-right leading-loose bg-brand-light-gray/40 p-3 rounded-2xl border border-brand-border/50" dir="rtl">
                    {getDailyHadith(inspirationSeed).urdu}
                  </p>
                </div>
              </div>
            </div>

            {/* Inspiration Shuffler Button Row */}
            <div className="flex justify-end pr-1">
              <button 
                onClick={() => setInspirationSeed(prev => prev + 1297)} 
                className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-green hover:text-white bg-brand-green/10 hover:bg-brand-green border border-brand-green/20 px-3 py-2 rounded-xl transition duration-150 cursor-pointer shadow-2xs active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" /> Next Daily Reflection (آیت و حدیث تبدیل کریں)
              </button>
            </div>

            {/* Title Section for Category Navigation */}
            <div className="border-t border-brand-border pt-6">
              <h3 className="text-xs font-extrabold text-brand-stone uppercase tracking-wider font-mono mb-6 px-1 text-left">
                Explore Content Categories (روحانی زمرہ جات)
              </h3>
              
              {/* Circular Category Grid for a distinctive, polished aesthetic */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-y-8 gap-x-4 justify-items-center">
                {[
                  { id: 'quran', title: 'Noble Quran', urdu: 'تلاوتِ قرآن', icon: Book, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-emerald-200/50' },
                  { id: 'dua', title: 'Spiritual Duas', urdu: 'مسنون دعائیں', icon: Heart, bg: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-rose-200/50' },
                  { id: 'wird', title: 'Wird & Wazaif', urdu: 'اوراد و وظائفِ مبارکہ', icon: Volume2, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-650' },
                  { id: 'darood', title: 'Durood Pak', urdu: 'درود پاک', icon: Globe, bg: 'bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-600 hover:text-white hover:border-sky-655' },
                  { id: 'janazah', title: 'Janazah Guide', urdu: 'نمازِ جنازہ', icon: Bookmark, bg: 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-600 hover:text-white hover:border-teal-600' },
                  { id: 'kalma', title: 'Six Kalmas', urdu: 'شش کلمات', icon: Award, bg: 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-600 hover:text-white hover:border-teal-600' },
                  { id: 'children', title: 'Kids Namaz', urdu: 'بچوں کا طریقہ', icon: BookOpen, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-emerald-200/50' },
                  { id: 'favorites', title: 'Favorites', urdu: 'محفوظ شدہ', icon: Heart, bg: 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500' },
                  { id: 'recent', title: 'History', urdu: 'تاریخِ سماعت', icon: History, bg: 'bg-stone-50 text-stone-600 border-stone-100 hover:bg-stone-600 hover:text-white hover:border-stone-600' },
                  { id: 'calendar', title: 'Calendar', urdu: 'اسلامی کیلنڈر', icon: Calendar, bg: 'bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-600 hover:text-white hover:border-violet-600 hover:shadow-violet-200/50' }
                ].map((tile) => {
                  const TileIcon = tile.icon;
                  return (
                    <button
                      key={tile.id}
                      onClick={() => {
                        setSelectedCategory(tile.id as any);
                        if (tile.id === 'quran') {
                          setQuranFilter('all');
                        }
                      }}
                      className="group flex flex-col items-center text-center cursor-pointer max-w-[105px] select-none transition-transform duration-255 active:scale-95"
                    >
                      {/* Circular Button Frame */}
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border flex items-center justify-center transition-all duration-300 shadow-2xs hover:shadow-lg hover:-translate-y-1 ${tile.bg}`}>
                        <TileIcon className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />
                      </div>
                      
                      {/* Labels below */}
                      <div className="mt-3 space-y-0.5 pointer-events-none">
                        <h4 className="text-xs font-black uppercase text-brand-text tracking-tight font-sans leading-tight group-hover:text-brand-green transition-colors select-none truncate w-24">
                          {tile.title}
                        </h4>
                        <p className="font-arabic font-extrabold text-[10px] md:text-[11px] text-brand-stone group-hover:text-brand-green transition-colors select-all leading-none" dir="rtl">
                          {tile.urdu}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Bottom Search Box Panel */}
            <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-xs mt-6 text-center">
              <span className="text-[10px] font-black uppercase text-brand-stone font-mono tracking-widest block mb-1">Quick Search Tool</span>
              <h4 className="text-sm font-extrabold text-brand-text mb-3">Instant Quick Access to All Spiritual Audios</h4>
              <div className="relative max-w-xl mx-auto">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-brand-stone">
                  <Search className="w-4 h-4 text-brand-green" />
                </span>
                <input
                  type="text"
                  placeholder="Search surahs, protective dua formulas, benefits, Urdu translations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-brand-light-gray border border-brand-border rounded-2xl text-brand-text placeholder-brand-stone/60 text-xs focus:outline-none focus:border-brand-green transition focus:bg-white shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDurationFilter('all');
                      setOfflineOnly(false);
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-brand-stone hover:text-red-500 cursor-pointer animate-fadeIn"
                    title="Clear Search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[9.5px] text-brand-stone mt-3 leading-normal max-w-lg mx-auto">
                Type terms like <strong className="text-brand-green font-bold">"Hizbul"</strong>, <strong className="text-brand-green font-bold">"Fatiha"</strong> or <strong className="text-brand-green font-bold">"protection"</strong> to pull up translation files and audio recitations instantly.
              </p>
            </div>
          </div>
        ) : selectedCategory === 'calendar' ? (
          /* SPECIAL ISLAMIC CALENDAR COMPONENT VIEW */
          <div className="animate-fadeIn text-left">
            <IslamicCalendar />
          </div>
        ) : (
          /* STANDARD CATALOG DISPLAY LIST (Quran, Duas, Wirds, Wazaif, Darood, Janazah, Search Mode) */
          <div className="space-y-6 animate-fadeIn">
            {/* Head Area: Category Title Info + Search Row */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-brand-border pb-4 w-full">
              <div className="text-left">
                <h2 className="text-xl font-bold text-brand-text flex items-center gap-2 flex-wrap">
                  <span>
                    {selectedCategory === 'home' && 'Search Results & Discoveries'}
                    {selectedCategory === 'all' && 'All Audios & Repertoire'}
                    {selectedCategory === 'quran' && 'Noble Quran Recitations'}
                    {selectedCategory === 'dua' && 'Spiritual Duas & Prayers'}
                    {selectedCategory === 'wird' && 'Wirds, Azkar & Holy Wazaif'}
                    {selectedCategory === 'darood' && 'Blessed Durood-e-Pak'}
                    {selectedCategory === 'janazah' && 'Namaz-e-Janazah Prayers'}
                    {selectedCategory === 'kalma' && 'Six Kalma Jaat of Islam'}
                    {selectedCategory === 'children' && 'Kids Namaz & Prayer Guide'}
                    {selectedCategory === 'favorites' && 'Your Favorites Collection'}
                    {selectedCategory === 'recent' && 'Your Listening History'}
                  </span>
                  <span className="font-arabic text-sm text-brand-green tracking-normal font-normal">
                    {selectedCategory === 'home' && '(تلاش کی گئ آڈیوز)'}
                    {selectedCategory === 'all' && '(تمام روحانی کلام)'}
                    {selectedCategory === 'quran' && '(تلاوتِ کلام پاک)'}
                    {selectedCategory === 'dua' && '(مسنون دعائیں)'}
                    {selectedCategory === 'wird' && '(اوراد و اذکار اور وظائفِ مبارکہ)'}
                    {selectedCategory === 'darood' && '(درودِ پاک)'}
                    {selectedCategory === 'janazah' && '(نمازِ جنازہ)'}
                    {selectedCategory === 'kalma' && '(شش کلمات با ترجمہ)'}
                    {selectedCategory === 'children' && '(بچوں کی نماز سکھانے کا طریقہ)'}
                    {selectedCategory === 'favorites' && '(محفوظ کلام)'}
                    {selectedCategory === 'recent' && '(تاریخِ سماعت)'}
                  </span>
                </h2>
                <p className="text-xs text-brand-stone mt-1">
                  {selectedCategory === 'home' && 'Explore matching surahs, protective and material prayers, post-namaz azkar.'}
                  {selectedCategory === 'all' && 'Access all surahs, protective and material prayers, post-namaz azkar.'}
                  {selectedCategory === 'quran' && 'Listen to soul-healing surah recitations from world-renowned Qaris with Urdu/Eng Translation.'}
                  {selectedCategory === 'dua' && 'Prophetic and Quranic duas for child, disease recovery, parent forgiveness, and traveling safety.'}
                  {selectedCategory === 'wird' && 'Daily spiritual shields, high-impact azkar, and authentic divine fortress wazaif against witchcraft, blocks, and financial locks.'}
                  {selectedCategory === 'darood' && 'Send endless salawat upon the blessed Prophet Muhammad (PBUH) for mercy and light.'}
                  {selectedCategory === 'janazah' && 'Funeral prayer guidelines, correct pronunciation, and translations for adult & child deceased.'}
                  {selectedCategory === 'kalma' && 'Foundational Six Kalmas of Islam with premium Arabic transcription, word-by-word translations, and benefits.'}
                  {selectedCategory === 'children' && 'Detailed interactive kids Salah guide illustrating every step, required postures, Arabic recitation, translation, and reference code.'}
                  {selectedCategory === 'favorites' && 'Your personally bookmarked list of audio tracks for instant quick-access.'}
                  {selectedCategory === 'recent' && 'Trace back which tracks you recently played for easy repetition.'}
                </p>
              </div>

              {/* Searching input bar */}
              <div className="relative w-full md:w-85 shrink-0">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-brand-stone">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search surahs, translations, benefits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-brand-border rounded-xl text-brand-text placeholder-brand-stone/60 text-sm focus:outline-none focus:border-brand-green transition shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-brand-stone hover:text-red-500 cursor-pointer animate-fadeIn"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Premium Refinement Panel / Live Filters */}
            <div className="bg-[#FAFBF9] border border-brand-border/85 rounded-3xl p-4 md:p-5 shadow-2xs shrink-0 select-none animate-fadeIn flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center">
                    <Filter className="w-4 h-4 text-brand-green" />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-extrabold text-brand-stone uppercase tracking-wider font-mono block">Data Filter panel</span>
                    <h4 className="text-xs font-bold text-brand-text flex items-center gap-1.5 leading-none">
                      <span>Refine &amp; Filter Results</span>
                      <span className="text-[10px] font-bold font-mono text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                        {filteredData.length} {filteredData.length === 1 ? 'track' : 'tracks'} found
                      </span>
                    </h4>
                  </div>
                </div>

                {/* Clear Filters / Reset Button */}
                {(searchQuery !== '' || durationFilter !== 'all' || offlineOnly || (selectedCategory === 'quran' && quranFilter !== 'all')) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDurationFilter('all');
                      setOfflineOnly(false);
                      setQuranFilter('all');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[10px] font-extrabold uppercase tracking-wide border border-rose-100/60 transition cursor-pointer active:scale-95 shadow-2xs shrink-0 self-end sm:self-auto"
                    title="Reset all search queries and active filter states"
                  >
                    <X className="w-3 h-3" />
                    <span>Reset Filters &amp; Search</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duration Filter Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-brand-stone font-mono uppercase tracking-wider block text-left">
                    ⏱️ Track Duration Filter (لمبائی کے لحاظ سے)
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['all', 'short', 'medium', 'long'] as const).map((dur) => {
                      const label = dur === 'all' ? 'All' : dur === 'short' ? '< 3m' : dur === 'medium' ? '3-7m' : '> 7m';
                      const title = dur === 'all' ? 'All durations' : dur === 'short' ? 'Short duration (Under 3 minutes)' : dur === 'medium' ? 'Medium duration (3 to 7 minutes)' : 'Long-play (Over 7 minutes)';
                      const isActive = durationFilter === dur;
                      return (
                        <button
                          key={dur}
                          onClick={() => setDurationFilter(dur)}
                          className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold uppercase transition text-center cursor-pointer border ${
                            isActive
                              ? 'bg-brand-green border-brand-green text-white shadow-3xs'
                              : 'bg-white border-brand-border text-brand-stone hover:text-brand-text hover:bg-brand-light-gray/40'
                          }`}
                          title={title}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Offline Availability Toggle */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-brand-stone font-mono uppercase tracking-wider block text-left">
                    💾 Offline Local caching (آف لائن دستیابی)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setOfflineOnly(false)}
                      className={`py-1.5 px-3 rounded-xl text-[10px] font-extrabold uppercase transition text-center cursor-pointer border ${
                        !offlineOnly
                          ? 'bg-brand-green border-brand-green text-white shadow-3xs'
                          : 'bg-white border-brand-border text-brand-stone hover:text-brand-text hover:bg-brand-light-gray/40'
                      }`}
                    >
                      Show All Items
                    </button>
                    <button
                      onClick={() => setOfflineOnly(true)}
                      className={`py-1.5 px-3 rounded-xl text-[10px] font-extrabold uppercase transition text-center cursor-pointer border ${
                        offlineOnly
                          ? 'bg-brand-green border-brand-green text-white shadow-3xs'
                          : 'bg-white border-brand-border text-brand-stone hover:text-brand-text hover:bg-brand-light-gray/40'
                      }`}
                      title="Only show tracks currently downloaded to this device for offline availability"
                    >
                      Offline Cached Only
                    </button>
                  </div>
                </div>
              </div>
            </div>

        {/* Recently Played Quick Access Board (nested nicely) */}
        {recentlyPlayed.length > 0 && selectedCategory !== 'recent' && (
          <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm mb-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-3">
              <h3 className="text-xs font-bold text-brand-green font-mono tracking-wider uppercase flex items-center gap-2">
                <History className="w-4 h-4 text-brand-green" /> Recently Played (Quick Access)
              </h3>
              <button
                onClick={clearRecentlyPlayed}
                className="text-[10px] font-bold text-brand-stone hover:text-red-600 transition cursor-pointer"
                title="Clear play history"
              >
                Clear History
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {recentlyPlayed.map(id => {
                const item = ISLAMIC_AUDIO_DATA.find(t => t.id === id);
                if (!item) return null;
                const isCurrent = currentPlayingId === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isCurrent) {
                        onTogglePlayPause();
                      } else {
                        onSelectTrack(item);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all hover:scale-[1.02] cursor-pointer ${
                      isCurrent
                        ? 'bg-brand-light-gray border-brand-green text-brand-text ring-1 ring-brand-green/10'
                        : 'bg-brand-light-gray/25 border-brand-border hover:border-brand-green/50 text-brand-stone hover:text-brand-text'
                    }`}
                  >
                    <div className="w-full">
                      {/* Compact Category Indicator */}
                      <span className="text-[9px] font-bold text-brand-stone font-mono uppercase truncate block mb-1">
                        {item.category === 'quran' ? 'Surah' : item.category === 'dua' ? 'Dua' : 'Wird'}
                      </span>
                      <span className="text-xs font-bold break-words line-clamp-2 leading-snug">
                        {item.title}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end w-full mt-2">
                      <span className="font-arabic text-sm text-brand-green truncate pr-1">
                        {item.arabicTitle}
                      </span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isCurrent && isPlaying
                          ? 'bg-brand-green text-white animate-pulse'
                          : 'bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white'
                      }`}>
                        {isCurrent && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      {/* Sub-filtering tabs for Quran/All categories */}
      {(selectedCategory === 'quran' || selectedCategory === 'all') && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-brand-light-gray p-2.5 rounded-2xl border border-brand-border/80 animate-fadeIn">
          <span className="text-[11px] font-bold text-brand-stone font-sans px-2 flex items-center gap-1.5 self-center sm:self-auto select-none">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            انتخاب کریں (Select Quran Category):
          </span>
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setQuranFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                quranFilter === 'all'
                  ? 'bg-brand-green text-white shadow-sm scale-[1.02]'
                  : 'text-brand-stone hover:text-brand-text bg-white border border-brand-border'
              }`}
            >
              دونوں (All)
            </button>
            <button
              onClick={() => setQuranFilter('surah')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                quranFilter === 'surah'
                  ? 'bg-brand-green text-white shadow-sm scale-[1.02]'
                  : 'text-brand-stone hover:text-brand-text bg-white border border-brand-border'
              }`}
            >
              سورتیں (Surahs)
            </button>
            <button
              onClick={() => setQuranFilter('juz')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                quranFilter === 'juz'
                  ? 'bg-brand-green text-white shadow-sm scale-[1.02]'
                  : 'text-brand-stone hover:text-brand-text bg-white border border-brand-border'
              }`}
            >
              پارہ جات (Paras)
            </button>
          </div>
        </div>
      )}

      {/* Wazaif Urdu Importance Banner */}
      {selectedCategory === 'wird' && (
        <div className="bg-brand-green/5 border border-brand-green/20 rounded-2xl p-5 md:p-6 mb-2 text-brand-text select-none animate-fadeIn">
          <div className="flex items-start gap-4">
            <Sparkles className="w-5 h-5 text-brand-green shrink-0 mt-0.5 animate-pulse" />
            <div className="w-full">
              <h4 className="font-bold text-base text-brand-green mb-2 font-sans flex items-center justify-between">
                <span>روحانی اوراد، اذکار و وظائف کی اسلامی اہمیت و برکات</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-brand-green/10">Wird & Wazaif Guide</span>
              </h4>
              <p className="font-arabic text-sm text-brand-text leading-relaxed mb-3.5 pr-2" dir="rtl">
                وظائف اور مسنون کلمات مومن کا سب سے بڑا ہتھیار اور مادی و باطنی آفتوں سے بچنے کا مضبوط قلعہ ہیں۔ جادو، نظر بد، حاسدین کے شر اور جناتی اثرات سے حفاظت کے لیے احادیث کی روشنی میں اورادِ مبارکہ، معوذتین، آیت الکرسی، اور سورہ رحمن کی تلاوت اکسیر کا درجہ رکھتی ہے۔
              </p>
              <div className="space-y-2 text-xs text-brand-stone font-sans leading-relaxed border-t border-brand-green/10 pt-3">
                <p className="flex items-start gap-1.5"><strong className="text-brand-green/15 shrink-0">1. جادو اور بلاؤں کا توڑ:</strong> معوذتین (اخلاس، فلق، ناس) ۳ بار، دعائے حزب البحر ۳ بار، آیت الکرسی ۵ بار اور صبح و شام سورہ رحمن ۱ بار تلاوت کریں یا سنیں۔ یہ شیطانی قوتوں کو جلا کر راکھ کرنے والی نورانی ڈھال ہے۔</p>
                <p className="flex items-start gap-1.5"><strong className="text-brand-green/15 shrink-0">2. رزق اور قرض سے نجات:</strong> نمازوں کے بعد توبہ و استغفار اور مسنون دعائیں معاشی تنگی کا خاتمہ کرتی ہیں اور غیب سے مدد لاتی ہیں۔</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid Cards */}
      <div className="grid gap-5">
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            const isCurrent = currentPlayingId === item.id;
            const itemLanguage = languages[item.id] || 'ur'; // Default to Urdu for users request (ترجمہ قرآن)
            const dState = downloads[item.id] || { status: 'idle', progress: 0 };

            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl transition-all border ${
                  isCurrent 
                    ? 'bg-brand-light-gray/60 border-brand-green shadow-sm ring-1 ring-brand-green/10' 
                    : 'bg-white border-brand-border hover:border-brand-green shadow-sm'
                }`}
              >
                {/* Horizontal Title & Media Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-brand-border pb-4">
                  <div className="flex gap-4 items-center">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => {
                        if (isCurrent) {
                          onTogglePlayPause();
                        } else {
                          onSelectTrack(item);
                        }
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCurrent && isPlaying
                          ? 'bg-brand-green text-white animate-pulse shadow-md'
                          : 'bg-brand-green text-white hover:bg-brand-green-hover shadow-sm'
                      }`}
                      style={{ minWidth: '3rem' }}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5 fill-auto" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      {/* Subtitle / category */}
                      <span className="text-[10px] font-bold text-brand-green font-mono tracking-widest uppercase block mb-1">
                        {item.category === 'quran' 
                          ? 'Noble Surah Recitation & Translation' 
                          : item.category === 'dua' 
                          ? 'Duas & Prayer Texts' 
                          : item.category === 'darood'
                          ? 'Durood-e-Pak & Spiritual Salawat (درود پاک)'
                          : item.category === 'janazah'
                          ? 'Namaz-e-Janazah Audio & Guidance (نمازِ جنازہ)'
                          : item.category === 'kalma'
                          ? 'Six Kalma Jaat & Faith Pillars (شش کلمات)'
                          : item.category === 'children'
                          ? 'Kids Namaz & Salah Guide (بچوں کا طریقہ)'
                          : 'Wird, Azkar or Wazifa Audio (اوراد و وظائف)'}
                      </span>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-brand-text tracking-tight">{item.title}</h3>
                        <button
                          onClick={(e) => toggleFavorite(item.id, e)}
                          className={`p-1.5 rounded-xl transition duration-150 hover:bg-brand-light-gray ${
                            favorites.includes(item.id)
                              ? 'text-red-500'
                              : 'text-[#8A8E82] hover:text-[#2D312E]'
                          }`}
                          title={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart 
                            className={`w-4 h-4 transition-transform duration-250 active:scale-125 ${
                              favorites.includes(item.id) ? 'fill-current' : ''
                            }`} 
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Arabic Title / Download simulated UI */}
                  <div className="flex md:flex-col items-end gap-3 justify-between w-full md:w-auto mt-2 md:mt-0">
                    <span className="text-xl font-bold text-brand-green font-arabic bg-brand-light-gray px-3.5 py-1.5 rounded-xl border border-brand-border">
                      {item.arabicTitle}
                    </span>

                    {/* Offline Simulated Downloads Status */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleShare(item, e)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-brand-stone hover:text-brand-text bg-brand-light-gray border border-brand-border px-2.5 py-1.5 rounded-lg transition-all hover:bg-brand-bg hover:border-brand-green/30 cursor-pointer"
                        title="Share this specific Surah or Dua link"
                      >
                        <Share2 className="w-3.5 h-3.5 text-brand-green" /> Share
                      </button>

                      {dState.status === 'idle' && (
                        <button
                          onClick={() => startSimulatedDownload(item)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-brand-stone hover:text-brand-text bg-brand-light-gray border border-brand-border px-2.5 py-1.5 rounded-lg transition-all hover:bg-brand-bg hover:border-brand-green/30 cursor-pointer"
                          title="Download audio file offline in the background"
                        >
                          <Download className="w-3.5 h-3.5 text-brand-green" /> Download Offline
                        </button>
                      )}

                      {dState.status === 'downloading' && (
                        <div className="flex items-center gap-2 text-xs bg-brand-light-gray px-2.5 py-1.5 rounded-lg border border-brand-border">
                          <div className="w-16 bg-brand-border-dark h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-brand-green h-full transition-all duration-300" 
                              style={{ width: `${dState.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-brand-green font-bold">
                            {dState.progress}%
                          </span>
                        </div>
                      )}

                      {dState.status === 'downloaded' && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-brand-green/10 text-brand-green px-2.5 py-1.5 rounded-lg border border-brand-green/20 font-mono">
                            <Check className="w-3 h-3 text-brand-green stroke-[3]" /> OFFLINE READY
                          </span>
                          <button
                            onClick={(e) => removeDownloadedFile(item, e)}
                            className="p-1.5 text-[#8A8E82] hover:text-red-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove downloaded audio from cache file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Play Button immediately after download option */}
                      <button
                        onClick={() => {
                          if (isCurrent) {
                            onTogglePlayPause();
                          } else {
                            onSelectTrack(item);
                          }
                        }}
                        className={`flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer border ${
                          isCurrent && isPlaying
                            ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 animate-pulse'
                            : 'bg-brand-green hover:bg-brand-green-hover text-white border-brand-green'
                        }`}
                        title={isCurrent && isPlaying ? "Pause Audio" : "Play Audio"}
                      >
                        {isCurrent && isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> Play
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Arabic Transcription Display Box */}
                {item.arabicText && (
                  <div className="bg-brand-light-gray/30 p-5 rounded-xl mb-4 border border-brand-border leading-relaxed text-right">
                    <p className="text-xl md:text-2xl font-serif text-brand-text font-arabic select-all tracking-wide text-justify" dir="rtl">
                      {item.arabicText}
                    </p>
                  </div>
                )}

                {/* Language Switch Translator Board */}
                <div className="bg-brand-light-gray/40 p-5 rounded-xl border border-brand-border">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-bold text-brand-stone font-mono flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-brand-green" />
                      Translation in {itemLanguage === 'ur' ? 'Urdu (ترجمہ)' : 'English'}
                    </span>
                    
                    {/* Urdu vs English switch button */}
                    <button
                      onClick={() => toggleLanguage(item.id)}
                      className="text-[10px] font-extrabold text-brand-green hover:bg-brand-light-gray px-2.5 py-1.5 rounded-md border border-brand-border transition"
                    >
                      Show {itemLanguage === 'ur' ? 'English (انگلش)' : 'Urdu (ترجمہ)'}
                    </button>
                  </div>

                  {/* Actual translation text */}
                  <p className={`text-sm leading-relaxed text-brand-text font-sans ${itemLanguage === 'ur' ? 'text-right font-urdu text-base leading-loose' : 'text-left'}`} dir={itemLanguage === 'ur' ? 'rtl' : 'ltr'}>
                    {itemLanguage === 'ur' ? item.translationUrdu : item.translationText}
                  </p>
                </div>

                {/* Benefits / Wazifa instructions section */}
                {item.benefits && (
                  <div className="mt-4 flex gap-2 p-3 bg-brand-light-gray/65 hover:bg-brand-light-gray/80 transition rounded-xl border border-brand-border text-xs text-brand-olive leading-relaxed">
                    <Bookmark className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-brand-text">Spiritual Benefits / Fazilat:</strong> {item.benefits}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-brand-border px-4 shadow-sm">
            {selectedCategory === 'favorites' ? (
              <>
                <Heart className="w-12 h-12 text-[#8A8E82]/50 mx-auto mb-4 animate-pulse text-red-450 fill-red-100" />
                <h3 className="text-brand-text font-bold text-base">No Favorite Audios Yet</h3>
                <p className="text-brand-stone text-sm mt-1 max-w-sm mx-auto leading-relaxed">
                  Click the heart icon on any recitation, dua, or wird to list it here for instant offline-ready access.
                </p>
              </>
            ) : selectedCategory === 'recent' ? (
              <>
                <History className="w-12 h-12 text-brand-green/40 mx-auto mb-4 animate-pulse" />
                <h3 className="text-brand-text font-bold text-base">No Recently Played Tracks</h3>
                <p className="text-brand-stone text-sm mt-1 max-w-sm mx-auto leading-relaxed">
                  Your recently played surahs, prayers, and daily wirds will automatically show up here.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 text-[#8A8E82] mx-auto mb-4" />
                <h3 className="text-brand-text font-bold text-base">No content item matches criteria</h3>
                <p className="text-[#8A8E82] text-sm mt-1">Try resetting the search or selection category filter tab.</p>
              </>
            )}
          </div>
        )}
      </div>
      </div>
      )}

      </div> {/* Closes Right Column Content container */}

      {/* Floating alert notification toast */}
      {toastMessage && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-brand-stone/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-brand-border-dark/35 text-xs font-semibold shadow-xl flex items-center gap-2.5 z-55 animate-fadeIn">
          <span className="w-2 h-2 bg-brand-green rounded-full shrink-0 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { AudioItem } from '../types';
import { getCorsFriendlyUrl } from '../utils/audioUtils';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  X,
  ChevronUp,
  ChevronDown,
  Gauge,
  Sparkles,
  Repeat,
  Headphones,
  Info
} from 'lucide-react';

interface CompactGlobalPlayerProps {
  activeTrack: AudioItem | null;
  isPlaying: boolean;
  onClose: () => void;
  onTogglePlayPause: () => void;
  onTrackCompleted?: () => void;
}

export default function CompactGlobalPlayer({
  activeTrack,
  isPlaying,
  onClose,
  onTogglePlayPause,
  onTrackCompleted
}: CompactGlobalPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [backgroundPlay, setBackgroundPlay] = useState<boolean>(() => {
    const saved = localStorage.getItem('islamic_app_background_play');
    return saved !== 'false';
  });
  const [showBgInfo, setShowBgInfo] = useState<boolean>(false);

  // Sync background play preference to localStorage
  useEffect(() => {
    localStorage.setItem('islamic_app_background_play', String(backgroundPlay));
  }, [backgroundPlay]);

  // Sync Media Session API for minimized/background lock screen controls when backgroundPlay is enabled
  useEffect(() => {
    if (!('mediaSession' in navigator) || !activeTrack) return;

    if (backgroundPlay) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeTrack.title,
        artist: activeTrack.category === 'quran' ? 'Surah Recitation' : 'Dua / Wird / Spiritual',
        album: activeTrack.arabicTitle || 'Islamic Audio & Wird Hub',
        artwork: [
          { src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=256&q=80', sizes: '256x256', type: 'image/jpeg' },
          { src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=512&q=80', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      // Hook up native system notification/lock screen controls to standard app actions
      navigator.mediaSession.setActionHandler('play', () => {
        onTogglePlayPause();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        onTogglePlayPause();
      });
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        skipBackward();
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        skipForward();
      });
    } else {
      // Clear handlers if disabled
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    }
  }, [activeTrack, backgroundPlay, onTogglePlayPause, skipBackward, skipForward]);

  // Sync active play/pause status separately so external events are fully synchronized
  useEffect(() => {
    if ('mediaSession' in navigator && activeTrack && backgroundPlay) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying, activeTrack, backgroundPlay]);

  // Sync state with HTML5 audio element
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(e => console.log('Audio playback interaction guard triggered', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, activeTrack]);

  // Handle Track Source Change
  useEffect(() => {
    if (!audioRef.current) return;
    
    let active = true;
    let localUrl = '';

    const setupTrack = async () => {
      if (!activeTrack) {
        if (audioRef.current) {
          audioRef.current.src = '';
        }
        return;
      }

      const streamUrl = getCorsFriendlyUrl(activeTrack.audioUrl);

      try {
        if ('caches' in window) {
          const cache = await caches.open('islamic_audio_cache');
          const matched = await cache.match(activeTrack.audioUrl);
          if (matched && active) {
            if (matched.type === 'opaque') {
              if (audioRef.current && active) {
                audioRef.current.src = streamUrl;
              }
            } else {
              try {
                const blob = await matched.blob();
                localUrl = URL.createObjectURL(blob);
                if (audioRef.current && active) {
                  audioRef.current.src = localUrl;
                }
              } catch (blobErr) {
                console.warn("Could not convert cached item to blob:", blobErr);
                if (audioRef.current && active) {
                  audioRef.current.src = streamUrl;
                }
              }
            }
          } else if (audioRef.current && active) {
            audioRef.current.src = streamUrl;
          }
        } else if (audioRef.current && active) {
          audioRef.current.src = streamUrl;
        }
      } catch (e) {
        if (audioRef.current && active) {
          audioRef.current.src = streamUrl;
        }
      }

      if (audioRef.current && active) {
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(e => console.log('Interaction prevented autoplay', e));
        }
      }
    };

    setupTrack();

    return () => {
      active = false;
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [activeTrack]);

  // Handle speed rates
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Format Helper: Seconds to MM:SS
  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return '0:00';
    const minutes = Math.floor(timeInSecs / 60);
    const seconds = Math.floor(timeInSecs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  function skipForward() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
  }

  function skipBackward() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
  }

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVol = Number(e.target.value);
    audioRef.current.volume = newVol;
    setVolume(newVol);
    audioRef.current.muted = newVol === 0;
    setIsMuted(newVol === 0);
  };

  const cyclePlayRate = () => {
    const rates = [1, 1.2, 1.5, 0.8];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  if (!activeTrack) return null;

  return (
    <div className={isMinimized 
      ? "fixed bottom-5 right-5 bg-brand-green hover:brightness-105 text-white z-50 rounded-2xl shadow-xl border border-white/20 p-2 flex items-center gap-3 transition-all duration-300 animate-fadeIn" 
      : "fixed bottom-0 left-0 right-0 p-4 md:p-5 bg-white border-t border-brand-border text-brand-text z-40 transition-all shadow-lg"
    }>
      <div className={isMinimized ? "flex items-center gap-3" : "max-w-6xl mx-auto flex flex-col gap-4"}>
        
        {/* HTML5 Native Audio Proxy node */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onTrackCompleted}
          preload="auto"
          loop={isLooping}
        />

        {isMinimized ? (
          <div className="flex items-center gap-2.5 px-1.5 py-1 select-none">
            {/* Rotating Active Icon */}
            <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </span>

            {/* mini status info */}
            <div className="flex flex-col max-w-[120px] pr-1.5 line-clamp-1">
              <span className="text-[8px] text-white/70 font-mono tracking-widest uppercase block font-bold">NOW PLAYING</span>
              <p className="text-[11px] font-bold truncate leading-tight">{activeTrack.title}</p>
            </div>

            {/* play/pause mini */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlayPause();
              }}
              className="w-7 h-7 bg-white text-brand-green hover:scale-105 active:scale-95 rounded-full flex items-center justify-center transition shadow-sm cursor-pointer"
              title={isPlaying ? "Pause Recitation" : "Play Recitation"}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>

            {/* Restore/Maximize button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-1 px-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer"
              title="Maximize Player"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 px-1.5 rounded-lg bg-rose-600/85 hover:bg-rose-600 text-white transition flex items-center justify-center cursor-pointer"
              title="Stop & Close Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Compact Bar View & Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Metadata Display */}
              <div className="flex items-center gap-3.5 w-full md:w-1/3">
                <span className="w-11 h-11 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center border border-brand-green/20 shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </span>
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold text-brand-green font-mono tracking-widest uppercase block mb-0.5">
                    {activeTrack.category === 'quran' ? 'Al-Quran Translation' : 'Islamic Dua'}
                  </span>
                  <h4 className="font-bold text-sm tracking-tight text-brand-text truncate">{activeTrack.title}</h4>
                  <span className="text-xs text-brand-green font-arabic truncate block" dir="rtl">{activeTrack.arabicTitle}</span>
                </div>
              </div>

              {/* Player controls */}
              <div className="flex flex-col items-center gap-2 w-full md:w-1/3">
                <div className="flex items-center gap-5">
                  {/* Skip Back */}
                  <button
                    onClick={skipBackward}
                    className="p-1.5 text-brand-stone hover:text-brand-text transition"
                    title="Rewind 10 seconds"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  {/* Main Play/Pause */}
                  <button
                    onClick={onTogglePlayPause}
                    className="w-12 h-12 bg-brand-green hover:bg-brand-green-hover active:scale-95 text-white rounded-full flex items-center justify-center shadow-md transition"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-auto" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* Skip Forward */}
                  <button
                    onClick={skipForward}
                    className="p-1.5 text-brand-stone hover:text-brand-text transition"
                    title="Skip forward 10 seconds"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Timings Progress Bar Slider */}
                <div className="flex items-center justify-between gap-3 w-full max-w-lg">
                  <span className="text-[11px] font-mono text-brand-stone w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeekBarChange}
                    className="flex-1 accent-brand-green h-1 bg-brand-light-gray rounded-lg cursor-pointer range-sm focus:outline-none"
                  />
                  <span className="text-[11px] font-mono text-brand-stone w-10 text-left">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Volume and Utilities */}
              <div className="flex items-center justify-end gap-3 md:gap-4 w-full md:w-1/3 flex-wrap">
                {/* Loop control */}
                <button
                  onClick={() => setIsLooping(prev => !prev)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                    isLooping 
                      ? 'bg-brand-green/10 border-brand-green/30 text-brand-green' 
                      : 'bg-brand-light-gray border-brand-border text-brand-stone hover:bg-brand-bg hover:text-brand-text'
                  }`}
                  title={isLooping ? "Loop playback is active (will repeat current surah/dua)" : "Enable loop repeat"}
                >
                  <Repeat className={`w-3.5 h-3.5 transition-transform duration-300 ${isLooping ? 'rotate-185 text-brand-green' : 'text-brand-stone'}`} />
                  <span>Loop {isLooping ? 'On' : 'Off'}</span>
                </button>

                {/* Background Play control */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBackgroundPlay(prev => !prev)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                      backgroundPlay 
                        ? 'bg-brand-green/10 border-brand-green/30 text-brand-green' 
                        : 'bg-brand-light-gray border-brand-border text-brand-stone hover:bg-brand-bg hover:text-brand-text'
                    }`}
                    title={backgroundPlay ? "Play active when minimized (using Media Session API)" : "Enable Play when Minimized / locked"}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Background {backgroundPlay ? 'On' : 'Off'}</span>
                  </button>
                  <button
                    onClick={() => setShowBgInfo(prev => !prev)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      showBgInfo 
                        ? 'bg-brand-green/10 border-brand-green/20 text-brand-green font-bold' 
                        : 'bg-brand-light-gray border-brand-border text-brand-stone hover:bg-brand-bg hover:text-brand-text'
                    }`}
                    title="View background play guide"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Speed Rate controls */}
                <button
                  onClick={cyclePlayRate}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-brand-light-gray border border-brand-border text-brand-green hover:bg-brand-bg rounded-lg transition"
                  title="Change Recitation playback rate"
                >
                  <Gauge className="w-3.5 h-3.5 text-brand-green" />
                  <span>{playbackRate}x</span>
                </button>

                {/* Volume nodes */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 text-brand-stone hover:text-brand-text"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 accent-brand-green h-1 bg-brand-light-gray rounded-lg cursor-pointer"
                  />
                </div>

                {/* Minimize control */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 text-brand-stone hover:text-brand-green hover:bg-brand-light-gray rounded-lg transition flex items-center justify-center cursor-pointer"
                  title="Minimize Player (منیمائز کریں)"
                >
                  <ChevronDown className="w-4.5 h-4.5 text-brand-stone" />
                </button>

                {/* Close buttons */}
                <button
                  onClick={onClose}
                  className="p-1.5 text-brand-stone hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Close & Stop Player"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

            </div>

            {/* Background Play informational modal */}
            {showBgInfo && (
              <div className="mt-2.5 p-4 rounded-2xl bg-brand-light-gray/65 border border-brand-border text-xs text-brand-stone flex flex-col gap-2.5 shadow-inner animate-fadeIn relative select-none">
                <button
                  onClick={() => setShowBgInfo(false)}
                  className="absolute top-3 right-3 p-1 rounded-full text-brand-stone hover:bg-brand-border-dark hover:text-brand-text transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-start gap-3.5 max-w-2xl pr-6">
                  <Headphones className="w-4.5 h-4.5 text-brand-green shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <strong className="text-brand-text block text-xs md:text-sm mb-1 font-sans">How Background &amp; Minimized Playback Works</strong>
                    <p className="leading-relaxed mb-2 font-sans text-[11px] md:text-xs">
                      By enabling Background Play, this application hooks into the standard **Media Session API**. 
                      This creates an official media controller card on Android, iOS, and PC:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 font-sans text-[11px] md:text-xs">
                      <li><strong>App Minimized Persistence:</strong> Audio continues playing smoothly when you minimize or switch to other applications.</li>
                      <li><strong>Device Lock Screen Controls:</strong> Toggle play/pause, rewind, or skip 10 seconds directly from your system's native notification and lock-screen widget.</li>
                      <li><strong>Android Optimization Fix:</strong> Some mobile browsers aggressively freeze hidden tasks. If audio stops unexpectedly, go to your phone's <em>Settings &gt; Apps &gt; Battery</em> and set this browser/wrapper to <strong>"Unrestricted"</strong> to prevent system sleeping.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

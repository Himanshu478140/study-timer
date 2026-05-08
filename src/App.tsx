import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MotionValue, AnimatePresence, motion } from 'framer-motion';
import { useSound, SoundProvider } from './context/SoundContext';
import { useTimer } from './hooks/useTimer';
import { useGamification } from './hooks/useGamification';
import { useFullscreen } from './hooks/useFullscreen';
import { useFocusTask } from './hooks/useFocusTask';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useHabits } from './hooks/useHabits';
import { HabitsProvider } from './context/HabitsContext';
import { useDocumentPiP } from './hooks/useDocumentPiP';
import { useCloudSync } from './context/CloudSyncContext';

import { TimerDisplay } from './components/timer/TimerDisplay';
import { TimerControls } from './components/timer/TimerControls';
import { FocusCalendar } from './components/calendar/FocusCalendar';

import { SlidePanel } from './components/ui/SlidePanel';

import { MiniTimer } from './components/timer/MiniTimer';
import { ModeSelector, type FocusMode } from './components/modes/ModeSelector';
import { WallpaperSelector, WALLPAPERS, type WallpaperConfig } from './components/wallpaper/WallpaperSelector';
import { WallpaperLayer } from './components/layout/WallpaperLayer';
// import { FocusContainer } from './components/layout/FocusContainer'; // OLD LAYOUT
import { AudioPanel } from './components/audio/AudioPanel';
// import { SideWidgets } from './components/widgets/SideWidgets'; // OLD LAYOUT
// import { RightWidgets } from './components/widgets/RightWidgets'; // OLD LAYOUT
import { HomeView } from './components/home/HomeView';
import { ZenMode } from './components/zen/ZenMode';
import { type AppMode } from './components/layout/GlobalModeSwitcher';

import { Dashboard } from './components/dashboard/Dashboard';
import { Trophy, Flame, Zap, PictureInPicture2, Maximize, Minimize, LayoutGrid, User as UserIcon, Music, Calendar as CalendarIcon, BarChart3, Sun, Moon, ClipboardList, Target, Leaf, Home as HomeIcon, Sparkles, Image as ImageIcon, StickyNote, X } from 'lucide-react';
import { Dock, DockIcon } from './components/ui/Dock';
import { VerticalDock, VerticalDockIcon } from './components/ui/VerticalDock';
import { StitchMenu } from './components/ui/StitchMenu';
import { TaskSelectorPanel } from './components/ui/TaskSelectorPanel';
import { GraphSelectorPanel } from './components/ui/GraphSelectorPanel';
import { HabitSelectorPanel } from './components/ui/HabitSelectorPanel';
import type { DashboardTab } from './components/dashboard/Dashboard';
import './components/audio/audio.css';
import { TypingAnimation } from './components/ui/TypingAnimation';
import { DailyProgressRing } from './components/widgets/DailyProgressRing';
import { SessionQualityModal } from './components/modals/SessionQualityModal';
import { BreakPromptModal } from './components/modals/BreakPromptModal';
import { SessionProgress } from './components/ui/SessionProgress';
import { DesktopWidgetLayout } from './components/layout/DesktopWidgetLayout';
import { GamificationNotification } from './components/ui/GamificationNotification';
import { MobileToolsOverlay } from './components/layout/MobileToolsOverlay';
import { syncDoc, loadUserDoc } from './utils/syncUtils';


const StudyTimer = ({ timezone, setTimezone }: { timezone: string, setTimezone: (tz: string) => void }) => {
  const [mode, setMode] = useState<FocusMode>('deep_work');
  /* Wallpaper Persistence Logic */
  const [wallpaper, setWallpaper] = useState<WallpaperConfig>(() => {
    // 1. Load from LocalStorage on mount
    const saved = localStorage.getItem('saved-wallpaper');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved wallpaper", e);
      }
    }
    return WALLPAPERS[0]; // Default
  });

  const [isDashboardOpen, setIsDashboardOpen] = useState(false); // Dashboard State
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [breakPrompt, setBreakPrompt] = useState<{ show: boolean, duration: number }>({ show: false, duration: 5 });
  const [isBreak, setIsBreak] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHabitsOpen, setIsHabitsOpen] = useState(false);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [isGraphPanelOpen, setIsGraphPanelOpen] = useState(false);
  const [pendingSession, setPendingSession] = useState<{ mode: string, duration: number } | null>(null);
  const [isStitchMenuOpen, setIsStitchMenuOpen] = useState(false);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [isWallpaperOpen, setIsWallpaperOpen] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('stats');
  const taskIconRef = useRef<HTMLDivElement>(null);
  const graphIconRef = useRef<HTMLDivElement>(null);
  const habitIconRef = useRef<HTMLDivElement>(null);

  // Task context for vertical strip
  const { tasks, activeTaskId } = useFocusTask();

  const { setThemeFromWallpaper, toggleTheme, themeMode } = useTheme(); // Destructure toggleTheme and themeMode
  const { level, xp, awardXP, notification } = useGamification();
  const { playSFX, activeAmbient } = useSound();
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const [appMode, setAppMode] = useState<AppMode>('focus');

  // --- NEW STATES FOR DASHBOARD CONFIG ---
  const [clockFont, setClockFont] = useState('default');
  const [timerConfig, setTimerConfig] = useState({
    pomodoro: 25,
    flow: 52,
    deep_work: 90,
    shortBreak: 5,
    longBreak: 15,
    custom: 15,
    customBreak: 5
  });
  const [features, setFeatures] = useState({
    ambientMode: false,
    sound: true,
    notifications: true,
    showQuoteInFullscreen: true,
    zenModeType: 'clock' as 'clock' | 'timer',
    zenAutoFullscreen: false,
    zenTimeFormat: '24h' as '12h' | '24h',
    homeTimeFormat: '24h' as '12h' | '24h'
  });
  const [selectedQuote, setSelectedQuote] = useState("The only way to do great work is to love what you do.");
  const [quoteFont, setQuoteFont] = useState(() => {
    const saved = localStorage.getItem('quote-font');
    return saved || 'serif';
  });

  useEffect(() => {
    localStorage.setItem('quote-font', quoteFont);
  }, [quoteFont]);
  const [customQuotes, setCustomQuotes] = useState<string[]>(() => {
    const saved = localStorage.getItem('custom-quotes');
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState(() => localStorage.getItem('study-notes') || '');
  const [completedSessionsToday, setCompletedSessionsToday] = useState<number>(() => {
    const saved = localStorage.getItem('completed-sessions-today');
    if (saved) {
      const { count, date } = JSON.parse(saved);
      if (date === new Date().toDateString()) return count;
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem('completed-sessions-today', JSON.stringify({
      count: completedSessionsToday,
      date: new Date().toDateString()
    }));
  }, [completedSessionsToday]);

  useEffect(() => {
    localStorage.setItem('study-notes', notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('custom-quotes', JSON.stringify(customQuotes));
  }, [customQuotes]);

  const handleAddQuote = (quote: string) => {
    if (!customQuotes.includes(quote)) {
      setCustomQuotes([...customQuotes, quote]);
    }
  };

  const handleRemoveQuote = (quote: string) => {
    setCustomQuotes(customQuotes.filter(q => q !== quote));
    if (selectedQuote === quote) {
      setSelectedQuote("The only way to do great work is to love what you do.");
    }
  };

  // --- SYNC ENGINE INTEGRATION ---
  const { recordSession, stats } = useHabits();
  const { user } = useCloudSync();

  const streak = stats.streaks.current;

  // --- AUDIO TRIGGERS ---
  const prevLevel = useRef(level);
  useEffect(() => {
    if (level > prevLevel.current) {
      handlePlaySFX('level-up');
    }
    prevLevel.current = level;
  }, [level]);

  // Initial Preferences Load
  useEffect(() => {
    if (!user) return;
    const loadPreferences = async () => {
      console.log("Cloud Sync: Loading Preferences...");
      const cloudData = await loadUserDoc(user.uid);
      if (cloudData?.preferences) {
        const p = cloudData.preferences;
        if (p.wallpaper) setWallpaper(p.wallpaper);
        if (p.clockFont) setClockFont(p.clockFont);
        if (p.timerConfig) setTimerConfig(p.timerConfig);
        if (p.features) setFeatures(p.features);
        if (p.quoteFont) setQuoteFont(p.quoteFont);
        if (p.customQuotes) setCustomQuotes(p.customQuotes);
        if (p.appMode) setAppMode(p.appMode);
      } else {
        // Migration: Push local preferences to cloud on first login
        syncDoc(user.uid, 'preferences', {
          wallpaper,
          clockFont,
          timerConfig,
          features,
          quoteFont,
          customQuotes,
          appMode,
          timezone
        });
      }
    };
    loadPreferences();
  }, [user]);

  // Real-time Preference Sync
  useEffect(() => {
    if (user) {
      syncDoc(user.uid, 'preferences', {
        wallpaper,
        clockFont,
        timerConfig,
        features,
        quoteFont,
        customQuotes,
        appMode,
        timezone
      });
    }
  }, [user, wallpaper, clockFont, timerConfig, features, quoteFont, customQuotes, appMode, timezone]);

  // Document PiP Hook
  const { pipWindow, requestPiP, closePiP } = useDocumentPiP();

  // Basic hash routing for Electron Widget Mode
  const [isWidgetMode, setIsWidgetMode] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#/widget') {
        setIsWidgetMode(true);
        // Add transparent background to body for electron
        document.body.style.background = 'transparent';
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Apply wallpaper theme when changed
  useEffect(() => {
    setThemeFromWallpaper(wallpaper);
    // 2. Save to LocalStorage when changed
    try {
      localStorage.setItem('saved-wallpaper', JSON.stringify(wallpaper));

      // 3. Broadcast to Widget
      const channel = new BroadcastChannel('wallpaper_sync');
      channel.postMessage(wallpaper);
      setTimeout(() => channel.close(), 100);
    } catch (e) {
      console.error("Failed to save wallpaper (likely too large)", e);
    }
  }, [wallpaper]);

  // Request Notification Permission
  useEffect(() => {
    if (features.notifications && "Notification" in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [features.notifications]);

  // Sound Wrapper
  const handlePlaySFX = (name: 'level-up') => {
    if (features.sound) playSFX(name);
  };

  // Mode configuration
  const getInitialTime = (m: FocusMode) => {
    switch (m) {
      case 'pomodoro': return timerConfig.pomodoro * 60;
      case 'flow': return timerConfig.flow * 60; // 52/17 Rule
      case 'deep_work': return timerConfig.deep_work * 60; // Updated to 90 min
      case 'custom': return timerConfig.custom * 60; // 1 min default
      default: return timerConfig.pomodoro * 60;
    }
  };

  const lastCompletionTime = useRef<number>(0);

  const { timeLeft, status, start, pause, reset, setTimeLeft, setTimerStatus } = useTimer({
    initialTime: getInitialTime(mode),
    isStopwatch: false,
    onTick: () => {
      if (activeAmbient === 'clock') {
        playSFX('clock');
      }
    },
    onComplete: () => {
      // 0. Debounce/Lock to prevent double-execution (React 18 StrictMode or race conditions)
      const now = Date.now();
      if (now - lastCompletionTime.current < 2000) return;
      lastCompletionTime.current = now;

      // 1. Check if a BREAK just finished
      if (isBreak) {
        // Reset to Focus Mode
        setIsBreak(false);
        setTimerStatus('idle');
        setTimeLeft(getInitialTime(mode));

        if (features.notifications) {
          new Notification("Break's Over!", { body: "Ready to get back to work?", icon: "/favicon.ico" });
        }
        return;
      }

      // 2. Focus Session Finished
      const duration = (
        mode === 'pomodoro' ? timerConfig.pomodoro :
          mode === 'flow' ? timerConfig.flow :
            mode === 'deep_work' ? timerConfig.deep_work :
              timerConfig.custom
      );

      const xpGained = mode === 'pomodoro' ? 25 : mode === 'flow' ? 50 : mode === 'deep_work' ? 100 : Math.floor(duration / 1);
      awardXP(xpGained);

      exitFullscreen();

      if (features.notifications) {
        new Notification("Focus Session Complete!", { body: "Great job! Take a well-deserved break.", icon: "/favicon.ico" });
      }

      setCompletedSessionsToday(prev => prev + 1);

      // DIRECT SAVE - No Popups/Modals
      const activeTaskText = activeTaskId ? tasks.find(t => t.id === activeTaskId)?.text : undefined;
      const tags = activeTaskText ? [activeTaskText] : [];

      recordSession(mode, true, duration, false, undefined, tags);

      // Break Prompt
      const breakTime = mode === 'custom' ? timerConfig.customBreak : mode === 'pomodoro' ? timerConfig.shortBreak : mode === 'flow' ? 17 : timerConfig.longBreak;
      setBreakPrompt({ show: true, duration: breakTime });
    }
  });

  const handleSessionSave = (rating: number, tags: string[]) => {
    if (pendingSession) {
      recordSession(pendingSession.mode, true, pendingSession.duration, false, rating, tags);
      setPendingSession(null);

      // Auto-suggest break after save
      const breakTime = pendingSession.mode === 'pomodoro' ? 5 : pendingSession.mode === 'flow' ? 17 : 20;
      setBreakPrompt({ show: true, duration: breakTime });
    }
    setShowQualityModal(false);
  };

  const handleTakeBreak = (minutes: number) => {
    setTimerStatus('idle');
    setTimeLeft(minutes * 60);
    setIsBreak(true); // Enter Break Mode manually
    start();
  };

  const handleStart = () => {
    start();
  };

  const handleReset = () => {
    setIsBreak(false); // Always exit break mode on reset
    reset();
    exitFullscreen(); // This will trigger the hook's listener to set isFullscreen=false
  }

  // Removed Focus Protection Hook as per user request

  // Generalize Focus Mode: Only hide UI if manually in fullscreen OR Ambient Mode is enabled while running
  const isFocusActive = isFullscreen || (status === 'running' && features.ambientMode && appMode === 'focus');
  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const handleAppModeChange = (newMode: AppMode, e?: React.MouseEvent | MouseEvent) => {
    if (newMode === appMode) return;

    if (!(document as any).startViewTransition) {
      setAppMode(newMode);
      return;
    }

    if (e) {
      document.documentElement.style.setProperty('--reveal-x', `${(e as any).clientX}px`);
      document.documentElement.style.setProperty('--reveal-y', `${(e as any).clientY}px`);
    }

    (document as any).startViewTransition(() => {
      setAppMode(newMode);
    });
  };

  // Reset timer when mode changes
  // Reset timer when mode changes is handled by useTimer's internal useEffect responding to initialTime change
  // Redundant effect removed to prevent conflicts

  // ELECTRON WIDGET MODE RENDER
  if (isWidgetMode) {
    return <DesktopWidgetLayout />;
  }

  return (
    <div className="fullscreen flex-center" style={{ flexDirection: 'column' }}>

      <WallpaperLayer config={wallpaper} />

      {isFullscreen && features.showQuoteInFullscreen && selectedQuote && appMode !== 'home' && (
        <div className={`fullscreen-quote font-${quoteFont || 'serif'}`}>
          "{selectedQuote}"
        </div>
      )}

      {/* OLD LAYOUT: Branding credit was here. Now in stitch-header. See git history to restore. */}

      {/* OLD LAYOUT: SideWidgets was here. See git history to restore. */}

      {/* OLD LAYOUT: RightWidgets was here. See git history to restore. */}

      {/* Dashboard Overlay */}
      {isDashboardOpen && (
        <Dashboard
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          wallpaper={wallpaper}
          onWallpaperSelect={setWallpaper}
          xp={xp}
          level={level}
          streak={streak}
          stats={stats}
          clockFont={clockFont}
          setClockFont={setClockFont}
          timerConfig={timerConfig}
          setTimerConfig={setTimerConfig}
          features={features}
          setFeatures={setFeatures}
          selectedQuote={selectedQuote}
          setSelectedQuote={setSelectedQuote}
          customQuotes={customQuotes}
          onAddQuote={handleAddQuote}
          onRemoveQuote={handleRemoveQuote}
          quoteFont={quoteFont}
          setQuoteFont={setQuoteFont}
          timezone={timezone}
          setTimezone={setTimezone}
          appMode={appMode}
          onAppModeChange={setAppMode}
          initialTab={dashboardTab}
        />
      )}

      {/* Focus Warning Toast */}
      <SessionQualityModal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        onSave={handleSessionSave}
        sessionType={pendingSession?.mode || 'Focus'}
      />

      <BreakPromptModal
        isOpen={breakPrompt.show}
        breakTime={breakPrompt.duration}
        onTakeBreak={() => {
          setBreakPrompt({ ...breakPrompt, show: false });
          handleTakeBreak(breakPrompt.duration);
        }}
        onSkipBreak={() => {
          setBreakPrompt({ ...breakPrompt, show: false });
          // Reset to Focus Mode
          setTimerStatus('idle');
          setTimeLeft(getInitialTime(mode));
          setIsBreak(false);
        }}
      />

      {/* Focus Warning Toast Removed */}

      {/* XP Notification Toast */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '50%',
        transform: `translateX(-50%) translateY(${notification ? '0' : '-100px'})`,
        opacity: notification ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        background: 'var(--color-accent)',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '2rem',
        fontWeight: 500,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <Zap size={18} fill="currentColor" /> {notification}
      </div>

      {/* === NEW LAYOUT: Centered Top Header Bar (Stitch Style) === */}
      <header
        className="stitch-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          zIndex: 100,
          opacity: (isDashboardOpen || (isFocusActive && appMode !== 'home')) ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: (isDashboardOpen || (isFocusActive && appMode !== 'home')) ? 'none' : 'auto',
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--color-text-secondary)',
            opacity: appMode === 'zen' ? 0 : 0.7,
            transition: 'opacity 0.5s ease',
          }}>Study Timer</span>
        </div>

        {/* Center: Stats Bar */}
        <nav
          className="stitch-stats-bar"
          onClick={() => setIsDashboardOpen(true)}
          style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--color-glass-bg), rgba(var(--color-accent-rgb), var(--glass-tint-strength)))',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, var(--widget-border-opacity))',
            borderRadius: '999px',
            padding: '0.375rem 1.25rem',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
            color: 'var(--color-text-secondary)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          role="button"
          tabIndex={0}
          aria-label="Open Dashboard"
        >
          {/* Daily Progress */}
          <div className="flex-center" style={{ gap: '0.5rem' }}>
            <DailyProgressRing completed={stats.today.score} goal={100} />
          </div>

          {/* Level & XP */}
          <div className="flex-center" style={{ gap: '0.5rem' }}>
            <Trophy size={18} color="var(--color-accent)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>LVL {level}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{xp} XP</span>
          </div>

          {/* Streak */}
          <div className="flex-center" style={{ gap: '0.25rem' }} title="Current Streak">
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
            <Flame
              size={18}
              className={streak > 0 ? "streak-active" : ""}
              style={streak > 0 ? { stroke: 'url(#fireGradient)', filter: 'drop-shadow(0 0 2px rgba(249, 115, 22, 0.4))' } : {}}
            />
            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{streak}</span>
          </div>
        </nav>

        {/* Right spacer to keep stats bar centered */}
        <div style={{ minWidth: '120px' }} />
      </header>

      {/* OLD LAYOUT: Top-right stats pill was here. See git history to restore. */}

      {/* Mode Selector */}
      <div
        className="mode-selector-container"
        style={{
          opacity: (isFocusActive || appMode === 'home') ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: (isFocusActive || appMode === 'home') ? 'none' : 'auto',
          marginTop: '2.0rem', // Desktop default
          marginBottom: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <ModeSelector currentMode={mode} onModeChange={setMode} />
        <SessionProgress completed={completedSessionsToday} />
      </div>

      {/* Main Content Area */}
      {appMode === 'home' ? (
        <HomeView clockFont={clockFont} timeFormat={features.homeTimeFormat} />
      ) : appMode === 'zen' ? (
        <ZenMode
          clockFont={clockFont}
          zenModeType={features.zenModeType}
          timeLeft={timeLeft}
          status={status}
          onStart={handleStart}
          onPause={pause}
          onReset={reset}
          onEnterFullscreen={enterFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
          autoFullscreen={features.zenAutoFullscreen}
          timeFormat={features.zenTimeFormat}
          modeName={isBreak ? "Taking Break" : (tasks.find(t => t.id === activeTaskId)?.text || 'Ready to Focus?')}
        />
      ) : (
        /* === NEW LAYOUT: Free-floating Timer (Stitch Style) === */
        <>
          <section className="stitch-timer-section">
            <h2 className="stitch-mode-label" style={{
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 500,
              marginBottom: 'var(--space-3)',
              opacity: isFocusActive ? 0 : 0.7,
              display: isFocusActive ? 'none' : 'block',
              transition: 'opacity 0.3s',
              textAlign: 'center',
            }}>
              <TypingAnimation 
                key={isBreak ? 'break' : (activeTaskId || 'no-task')} 
                duration={100}
              >
                {isBreak 
                  ? 'Taking Break' 
                  : (tasks.find(t => t.id === activeTaskId)?.text || 'Ready to Focus?')}
              </TypingAnimation>
            </h2>

            <TimerDisplay
              seconds={timeLeft}
              font={clockFont}
              style={{
                fontSize: isFocusActive ? '25vw' : 'clamp(4rem, 12vw, 10rem)',
                lineHeight: 1,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                marginBottom: '0',
                transform: isFocusActive ? 'none' : 'none',
              }}
              active={status === 'running'}
              timeLeft={timeLeft}
              mode={mode}
              isFullscreen={isFullscreen}
            />

            <div style={{
              opacity: isFocusActive ? 0.05 : 1,
              transition: 'opacity 0.3s ease',
              position: isFocusActive ? 'absolute' : 'relative',
              bottom: isFocusActive ? '3rem' : 'auto',
              marginTop: 'var(--space-4)',
            }}
              onMouseEnter={(e) => {
                if (isFocusActive) e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                if (isFocusActive) e.currentTarget.style.opacity = '0.05';
              }}
            >
              <TimerControls
                status={status}
                onStart={handleStart}
                onPause={() => { pause(); }}
                onReset={handleReset}
                onBreak={() => {
                  setTimeLeft(5 * 60);
                  setIsBreak(true);
                  handleStart();
                }}
                allowReset
              />
            </div>
          </section>

          {/* Bottom-Right Quote */}
          <div
            className={`bottom-right-quote font-${quoteFont || 'serif'}`}
            style={{
              opacity: isFocusActive ? 0 : 1,
              visibility: isFocusActive ? 'hidden' : 'visible',
            }}
          >
            <p>"{selectedQuote}"</p>
          </div>
        </>

      )}

      {/* PiP Portal */}
      {pipWindow && createPortal(
        <MiniTimer
          timeLeft={timeLeft}
          status={status}
          start={handleStart}
          pause={pause}
          reset={handleReset}
          closePiP={closePiP}
          mode={mode}
          wallpaper={wallpaper}
        />,
        pipWindow.document.body
      )}

      {/* Bottom Magnetic Dock */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: (isFocusActive && appMode !== 'home') ? 0 : 1,
          visibility: (isFocusActive && appMode !== 'home') ? 'hidden' : 'visible',
          transition: 'all 0.5s ease',
          pointerEvents: (isFocusActive && appMode !== 'home') ? 'none' : 'auto',
          zIndex: 50,
          display: 'flex',
          gap: 'var(--space-2)',
          alignItems: 'center',
        }}
      >
        <Dock>
          {(mouseX: MotionValue<number>) => (
            <>
              {/* Sounds */}
              <DockIcon mouseX={mouseX} label="Sounds" onClick={() => setIsAudioPanelOpen(true)}>
                <Music size={20} />
              </DockIcon>

              {/* Notepad */}
              <DockIcon mouseX={mouseX} label="Notepad" onClick={() => setIsNotepadOpen(!isNotepadOpen)}>
                <StickyNote size={20} />
              </DockIcon>

              {/* PiP */}
              <DockIcon mouseX={mouseX} label="Pop Out" onClick={() => requestPiP({ width: 320, height: 320 })}>
                <PictureInPicture2 size={20} />
              </DockIcon>

              {/* Fullscreen */}
              <DockIcon mouseX={mouseX} label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} onClick={handleToggleFullscreen}>
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </DockIcon>
            </>
          )}
        </Dock>

        {/* Notepad Popup */}
        <AnimatePresence>
          {isNotepadOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
              className="notepad-popup"
              style={{ originX: 0.5, originY: 1 }}
            >
              <div className="notepad-popup-header">
                <span className="notepad-popup-title">Notepad</span>
                <button className="notepad-popup-close" onClick={() => setIsNotepadOpen(false)}>
                  <X size={14} />
                </button>
              </div>
              <textarea
                className="notepad-popup-textarea custom-scrollbar"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write something..."
                spellCheck={false}
                autoFocus
              />
              <div className="notepad-popup-footer">
                <span>{notes.length} chars</span>
                <span>Auto-saved</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wallpaper Drawer (externally controlled) */}
      <WallpaperSelector
        currentId={wallpaper.id}
        onSelect={setWallpaper}
        externalOpen={isWallpaperOpen}
        onClose={() => setIsWallpaperOpen(false)}
      />

      {/* Bottom-Left Mode Switcher Dock */}
      <div
        className="mode-dock-wrapper"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: 'var(--space-3)',
          opacity: (isFocusActive && appMode !== 'home') ? 0 : 1,
          visibility: (isFocusActive && appMode !== 'home') ? 'hidden' : 'visible',
          transition: 'opacity 0.4s ease, visibility 0.4s ease',
          zIndex: 50,
        }}
      >
        <Dock>
          {(mouseX: MotionValue<number>) => (
            <>
              <DockIcon
                mouseX={mouseX}
                label="Focus Timer"
                isActive={appMode === 'focus'}
                onClick={() => handleAppModeChange('focus')}
              >
                <Leaf size={20} />
              </DockIcon>

              <DockIcon
                mouseX={mouseX}
                label="Home"
                isActive={appMode === 'home'}
                onClick={() => handleAppModeChange('home')}
              >
                <HomeIcon size={20} />
              </DockIcon>

              <DockIcon
                mouseX={mouseX}
                label="Zen Mode"
                isActive={appMode === 'zen'}
                onClick={() => handleAppModeChange('zen')}
              >
                <Sparkles size={20} />
              </DockIcon>
            </>
          )}
        </Dock>
      </div>
      {/* Right Vertical Dock — Collapsible */}
      <div
        className="vdock-group"
        style={{
          position: 'fixed',
          right: 'var(--space-3)',
          top: '1.2rem',
          opacity: (isFocusActive && appMode !== 'home') ? 0 : 1,
          visibility: (isFocusActive && appMode !== 'home') ? 'hidden' : 'visible',
          transition: 'opacity 0.4s ease, visibility 0.4s ease',
          zIndex: 101,
        }}
      >
          {/* Avatar — always visible, toggles dock */}
          <div
            className={`vdock-avatar ${isDockExpanded ? 'expanded' : ''}`}
            onClick={() => setIsDockExpanded(!isDockExpanded)}
            role="button"
            tabIndex={0}
            aria-label={isDockExpanded ? 'Collapse dock' : 'Expand dock'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsDockExpanded(!isDockExpanded); } }}
          >
            {user ? (
              user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} />
              ) : (
                <div className="user-avatar-placeholder">
                  {(user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
              )
            ) : (
              <UserIcon size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
            )}
            <div className="vdock-tooltip">{isDockExpanded ? 'Collapse' : 'Expand'}</div>
          </div>

          {/* Expandable Dock */}
          <AnimatePresence>
            {isDockExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <VerticalDock>
                {(mouseY: MotionValue<number>) => (
                  <>
                    {/* Dashboard */}
                    <VerticalDockIcon mouseY={mouseY} label="Dashboard" onClick={() => setIsStitchMenuOpen(true)}>
                      <LayoutGrid size={20} />
                    </VerticalDockIcon>

                    {/* Tools */}
                    <VerticalDockIcon ref={taskIconRef} mouseY={mouseY} label="Tasks" onClick={() => setIsTaskPanelOpen(!isTaskPanelOpen)}>
                      <ClipboardList size={20} />
                    </VerticalDockIcon>

                    <VerticalDockIcon ref={graphIconRef} mouseY={mouseY} label="Graph" onClick={() => setIsGraphPanelOpen(!isGraphPanelOpen)}>
                      <BarChart3 size={20} />
                    </VerticalDockIcon>

                    <VerticalDockIcon mouseY={mouseY} label={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'} onClick={(e: React.MouseEvent<HTMLDivElement>) => toggleTheme(e)}>
                      {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </VerticalDockIcon>

                    <VerticalDockIcon mouseY={mouseY} label="Wallpaper" onClick={() => setIsWallpaperOpen(true)}>
                      <ImageIcon size={20} />
                    </VerticalDockIcon>

                    <VerticalDockIcon mouseY={mouseY} label="Calendar" onClick={() => setIsCalendarOpen(true)}>
                      <CalendarIcon size={20} />
                    </VerticalDockIcon>

                    <VerticalDockIcon ref={habitIconRef} mouseY={mouseY} label="Habits" onClick={() => setIsHabitsOpen(!isHabitsOpen)}>
                      <Target size={20} />
                    </VerticalDockIcon>
                  </>
                )}
                </VerticalDock>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      <StitchMenu
        isOpen={isStitchMenuOpen}
        onClose={() => setIsStitchMenuOpen(false)}
        onOpenSection={(section) => {
          setDashboardTab(section);
          setIsDashboardOpen(true);
        }}
      />

      <TaskSelectorPanel
        isOpen={isTaskPanelOpen}
        onClose={() => setIsTaskPanelOpen(false)}
        triggerRef={taskIconRef}
      />

      <GraphSelectorPanel
        isOpen={isGraphPanelOpen}
        onClose={() => setIsGraphPanelOpen(false)}
        triggerRef={graphIconRef}
      />

      <HabitSelectorPanel
        isOpen={isHabitsOpen}
        onClose={() => setIsHabitsOpen(false)}
        triggerRef={habitIconRef}
      />

      {/* Calendar Slide Panel */}
      <SlidePanel isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} title="Calendar">
        <FocusCalendar />
      </SlidePanel>


      {/* Audio Panel (hidden by default, triggered from toolbar) */}
      <AudioPanel
        externalOpen={isAudioPanelOpen}
        onOpenChange={setIsAudioPanelOpen}
      />

      {/* Mobile Tools Toggle (Visible <= 900px) */}
      {!isMobileToolsOpen && (
        <button
          className="audio-trigger-btn interactive-press mobile-only-flex"
          onClick={() => setIsMobileToolsOpen(true)}
          aria-label="Open Tools"
          title="Mobile Tools"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1rem',
            zIndex: 51,
          }}
        >
          <LayoutGrid size={20} />
        </button>
      )}

      {/* Mobile Sidebar/Drawer Overlay */}
      <MobileToolsOverlay
        isOpen={isMobileToolsOpen}
        onClose={() => setIsMobileToolsOpen(false)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onToggleTheme={toggleTheme}
        themeMode={themeMode}
        appMode={appMode}
        onAppModeChange={handleAppModeChange}
      />
    </div>
  );
};

export default function App() {
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('app-timezone') || 'auto';
  });

  useEffect(() => {
    localStorage.setItem('app-timezone', timezone);
  }, [timezone]);

  return (
    <ThemeProvider>
      <HabitsProvider timezone={timezone}>
        <SoundProvider>
          <StudyTimer timezone={timezone} setTimezone={setTimezone} />
          <GamificationNotification />
        </SoundProvider>
      </HabitsProvider>
    </ThemeProvider>
  );
}

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MotionValue } from 'framer-motion';
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
import { MiniTimer } from './components/timer/MiniTimer';
import { ModeSelector, type FocusMode } from './components/modes/ModeSelector';
import { WallpaperSelector, WALLPAPERS, type WallpaperConfig } from './components/wallpaper/WallpaperSelector';
import { WallpaperLayer } from './components/layout/WallpaperLayer';
import { FocusContainer } from './components/layout/FocusContainer';
import { AudioPanel } from './components/audio/AudioPanel';
import { SideWidgets } from './components/widgets/SideWidgets';
import { RightWidgets } from './components/widgets/RightWidgets';
import { HomeView } from './components/home/HomeView';
import { ZenMode } from './components/zen/ZenMode';
import { type AppMode } from './components/layout/GlobalModeSwitcher';

import { Dashboard } from './components/dashboard/Dashboard';
import { Trophy, Flame, Zap, PictureInPicture2, Maximize, Minimize, Headphones, LayoutGrid, User as UserIcon } from 'lucide-react';
import { Dock, DockIcon } from './components/ui/Dock';
import './components/audio/audio.css';
import { TypingAnimation } from './components/ui/TypingAnimation';
import { DailyProgressRing } from './components/widgets/DailyProgressRing';
import { SessionQualityModal } from './components/modals/SessionQualityModal';
import { BreakPromptModal } from './components/modals/BreakPromptModal';
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
  const [pendingSession, setPendingSession] = useState<{ mode: string, duration: number } | null>(null);

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
  const { activeTaskId, tasks } = useFocusTask();
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
      case 'ambient': return 0;
      case 'custom': return timerConfig.custom * 60; // 1 min default
      default: return timerConfig.pomodoro * 60;
    }
  };

  const lastCompletionTime = useRef<number>(0);

  const { timeLeft, status, start, pause, reset, setTimeLeft, setTimerStatus } = useTimer({
    initialTime: getInitialTime(mode),
    isStopwatch: mode === 'ambient',
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
      const duration = mode === 'ambient' ? Math.floor(timeLeft / 60) : (
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

      // DIRECT SAVE - No Popups/Modals
      const activeTaskText = activeTaskId ? tasks.find(t => t.id === activeTaskId)?.text : undefined;
      const tags = activeTaskText ? [activeTaskText] : [];

      recordSession(mode, true, duration, false, undefined, tags);

      // Break Prompt
      if (mode !== 'ambient') {
        const breakTime = mode === 'custom' ? timerConfig.customBreak : mode === 'pomodoro' ? timerConfig.shortBreak : mode === 'flow' ? 17 : timerConfig.longBreak;
        setBreakPrompt({ show: true, duration: breakTime });
      }
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

      {/* Branding Credit */}
      <div style={{
        position: 'fixed',
        top: '1.5rem',
        left: '2rem',
        color: 'var(--color-text-secondary)',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        zIndex: 100,
        pointerEvents: 'none',
        opacity: (isFocusActive && appMode !== 'home') || appMode === 'zen' ? 0 : 0.6,
        transition: 'opacity 0.5s ease',
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.3
      }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.15em'
        }}>
          Study Timer ·
        </div>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          opacity: 0.8
        }}>
          Crafted by Himanshu
        </div>
      </div>

      <SideWidgets
        visible={(!isFocusActive || appMode === 'home' || (appMode === 'zen' && !isFullscreen))}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onToggleTheme={toggleTheme}
        themeMode={themeMode}
        appMode={appMode}
        onAppModeChange={handleAppModeChange}
      />

      {/* Right Widgets - Calendar */}
      <RightWidgets visible={!isFocusActive && appMode === 'focus'} />

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
          onAppModeChange={handleAppModeChange}
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

      <div
        style={{
          position: 'absolute',
          top: '1.2rem',
          right: '2rem',
          opacity: (isDashboardOpen || (isFocusActive && appMode !== 'home')) ? 0 : 1,
          transition: 'all 0.5s ease',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          pointerEvents: (isDashboardOpen || (isFocusActive && appMode !== 'home')) ? 'none' : 'auto',
          zIndex: 100,
        }}
      >
        {/* User Stats - Click to Open Dashboard */}
        <div
          onClick={() => setIsDashboardOpen(true)}
          className="interactive-hover level-stats-pill"
          style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            // Glassmorphism - Matched to Widgets
            background: 'linear-gradient(135deg, var(--color-glass-bg), rgba(var(--color-accent-rgb), var(--glass-tint-strength)))',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, var(--widget-border-opacity))',
            borderRadius: '999px', // Pill shape
            padding: '5px 15px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
          }}>

          {/* New Daily Goal Ring */}
          <div className="flex-center" style={{ gap: '0.5rem' }}>
            <DailyProgressRing completed={stats.today.score} goal={100} />
          </div>

          <div className="flex-center" style={{ gap: '0.5rem' }}>
            <div className="flex-center" style={{ flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>LEVEL {level}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{xp} XP</span>
            </div>
            <Trophy size={20} color="var(--color-accent)" />
          </div>

          {/* Streak Indicator */}
          <div className="flex-center" style={{ gap: '0.25rem' }} title="Current Streak">
            {/* Fire Gradient Definition */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" /> {/* Red-500 */}
                  <stop offset="100%" stopColor="#f97316" /> {/* Orange-500 */}
                </linearGradient>
              </defs>
            </svg>
            <Flame
              size={20}
              className={streak > 0 ? "streak-active" : ""}
              style={streak > 0 ? { stroke: 'url(#fireGradient)', filter: 'drop-shadow(0 0 2px rgba(249, 115, 22, 0.4))' } : {}}
            />
            <span style={{ fontWeight: 600 }}>{streak}</span>
          </div>
        </div>

        {/* Independent User Avatar Circle */}
        <div
          className="avatar-circle-container"
          onClick={() => setIsDashboardOpen(true)}
          title={user ? (user.displayName || user.email || 'Logged In') : 'Log in to sync your progress'}
        >
          {user ? (
            user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar-placeholder">
                {(user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()}
              </div>
            )
          ) : (
            <UserIcon size={18} />
          )}
        </div>
      </div>

      {/* Mode Selector */}
      <div style={{
        opacity: (isFocusActive || appMode === 'home') ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: (isFocusActive || appMode === 'home') ? 'none' : 'auto',
        marginBottom: '0' // Adjusted layout
      }}>
        <ModeSelector currentMode={mode} onModeChange={setMode} />
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
          modeName={isBreak ? "Taking Break" : mode.replace('_', ' ')}
        />
      ) : (
        /* Main Focus Card */
        <FocusContainer isDeepWork={isFocusActive}>
          <h2 style={{
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-4)',
            opacity: isFocusActive ? 0 : 1,
            display: isFocusActive ? 'none' : 'block', // Hide completely to remove layout weight
            transition: 'opacity 0.3s'
          }}>
            <TypingAnimation key={mode} duration={100}>
              {mode.replace('_', ' ')}
            </TypingAnimation>
          </h2>

          <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            {/* FocusInput removed - Moved to SideWidgets */}
          </div>

          <TimerDisplay
            seconds={timeLeft}
            font={clockFont}
            style={{
              fontSize: isFocusActive ? '25vw' : undefined, // Huge responsive text
              lineHeight: 1,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              marginBottom: isFocusActive ? '0' : '0', // Removed margin for tighter centerpiece
              transform: isFocusActive ? 'none' : `translateY(var(--timer-y-offset))`
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
              onPause={() => {
                pause();
              }}
              onReset={handleReset}
              onBreak={mode === 'ambient' ? () => {
                const minutes = prompt("Enter break duration (minutes):", "5");
                if (minutes && !isNaN(parseInt(minutes))) {
                  handleTakeBreak(parseInt(minutes));
                }
              } : undefined}
              allowReset
            />
          </div>
        </FocusContainer>
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

      {/* Wallpaper Selector & Audio Panel */}
      <div
        className="bottom-toolbar-container"
        style={{
          position: 'fixed',
          bottom: '1.5rem', // Slightly lowered to account for dock height
          opacity: (isFocusActive && appMode !== 'home') ? 0 : 1,
          visibility: (isFocusActive && appMode !== 'home') ? 'hidden' : 'visible',
          transition: 'all 0.5s ease',
          pointerEvents: (isFocusActive && appMode !== 'home') ? 'none' : 'auto',
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50,
          padding: '0 1rem',
          maxWidth: '100vw',
          boxSizing: 'border-box'
        }}
      >
        <WallpaperSelector currentId={wallpaper.id} onSelect={setWallpaper} />

        <Dock>
          {(mouseX: MotionValue<number>) => (
            <>
              {/* Audio Tool */}
              <DockIcon
                mouseX={mouseX}
                label="Sounds"
                onClick={() => setIsAudioPanelOpen(true)}
              >
                <Headphones size={22} />
              </DockIcon>

              {/* PiP Tool */}
              <DockIcon
                mouseX={mouseX}
                label="Pop Out"
                onClick={() => requestPiP({ width: 320, height: 320 })}
              >
                <PictureInPicture2 size={22} />
              </DockIcon>

              {/* Fullscreen Tool */}
              <DockIcon
                mouseX={mouseX}
                label={isFullscreen ? "Exit Full" : "Fullscreen"}
                onClick={handleToggleFullscreen}
              >
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </DockIcon>
            </>
          )}
        </Dock>

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
            style={{ marginLeft: '0.5rem' }}
          >
            <LayoutGrid size={20} />
          </button>
        )}
      </div>

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

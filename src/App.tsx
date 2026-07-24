import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useSound, SoundProvider } from './components/Dock/audio/SoundContext';
import { useTimer } from './components/timer/useTimer';
import { useGamification } from './components/Gamification/useGamification';
import { useFullscreen } from './components/Modes/useFullscreen';
import { useTaskManager } from './TaskManager';
import { ThemeProvider } from './components/Theme/ThemeContext';
import { useHabits } from './Offlinebackup/localstorage/HabitsContext';
import { IntroVideo } from './components/Animation/IntroVideo';
import { HabitsProvider } from './Offlinebackup/localstorage/HabitsContext';
import { AttendanceProvider } from './components/Dock/attendance';
import { useDocumentPiP, WidgetMode } from './components/Modes/pip';

import { MiniTimer } from './components/timer/MiniTimer';
import { type FocusMode } from './components/timer/ModeSelectorPanel';
import { WallpaperLayer } from './components/wallpaper/WallpaperLayer';
import { AudioPanel } from './components/Dock/audio/AudioPanel';
import { type AppMode } from './components/Dock/AppModes/GlobalModeSwitcher';
import { type DashboardTab } from './components/dashboard/Dashboard';
import { Zap } from 'lucide-react';
import { TaskSelectorPanel } from './components/Dock/TaskSelectorPanel';
import { GraphSelectorPanel } from './components/Dock/GraphSelectorPanel';
import { HabitSelectorPanel } from './components/Dock/HabitSelectorPanel';
import { CalendarSelectorPanel } from './components/Dock/CalendarSelectorPanel';
import { ModeSelectorPanel } from './components/timer/ModeSelectorPanel';
import { GamificationNotification } from './components/Gamification/GamificationNotification';
import { ElectronTitlebar } from '../electron/layout/ElectronTitlebar';

import './components/Dock/audio/audio.css';
import './components/Dock/dock/VerticalDock.css';

// Custom Hooks
import { useWallpaperPersistence } from './components/wallpaper/useWallpaperPersistence';
import { useNotepad } from './components/Dock/Notepad';
import { useDashboardSettings } from './Offlinebackup/localstorage/useDashboardSettings';
import { useBreakFlow } from './components/Modes/Break';
import { useAppLayout } from './components/layout/useAppLayout';

// Layout Components
import { AppHeader } from './components/layout/AppHeader';
import { FocusContent } from './components/Dock/AppModes/FocusContent';
import { BottomDock, RightDock, VerticalDockPanel } from './components/Dock/dock';
import { NotepadOverlay } from './components/Dock/Notepad';

import { DashboardOverlay } from './components/dashboard';
import { BreakOverlay } from './components/Modes/Break';

const StudyTimer = ({
  timezone,
  setTimezone,
  onReady
}: {
  timezone: string,
  setTimezone: (tz: string) => void,
  onReady?: () => void
}) => {
  const [mode, setMode] = useState<FocusMode>('deep_work');
  const [appMode, setAppMode] = useState<AppMode>('focus');

  // Unified Custom Hooks
  const { wallpaper, setWallpaper } = useWallpaperPersistence();

  const {
    notes,
    isNotepadOpen,
    setIsNotepadOpen,
    editorRef,
    activeStyles,
    handleFormat,
    handleInsertChecklist,
    handleEditorInput,
    handleEditorClick
  } = useNotepad();

  const {
    clockFont,
    setClockFont,
    zenClockStyle,
    setZenClockStyle,
    timerConfig,
    setTimerConfig,
    features,
    setFeatures,
    selectedQuote,
    setSelectedQuote,
    quoteFont,
    setQuoteFont,
    customQuotes,
    handleAddQuote,
    handleRemoveQuote
  } = useDashboardSettings();

  const {
    breakPrompt,
    setBreakPrompt,
    isBreak,
    setIsBreak,
    pendingXp,
    setPendingXp,
    getBreakTime
  } = useBreakFlow();

  // Refs for selector alignments
  const notepadIconRef = useRef<HTMLDivElement>(null);
  const graphIconRef = useRef<HTMLDivElement>(null);
  const habitIconRef = useRef<HTMLDivElement>(null);
  const calendarIconRef = useRef<HTMLDivElement>(null);
  const modeIconRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const taskIconRef = useRef<HTMLDivElement>(null);
  const audioIconRef = useRef<HTMLDivElement>(null);
  const homeTaskPencilRef = useRef<HTMLDivElement>(null);

  // Layout scale & measurements
  const {
    scale,
    notepadRef,
    notepadYPos,
    notepadMaxHeight,
    isNotepadPositioned
  } = useAppLayout({ isNotepadOpen, notepadIconRef });

  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHabitsOpen, setIsHabitsOpen] = useState(false);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [isGraphPanelOpen, setIsGraphPanelOpen] = useState(false);
  const [isModePanelOpen, setIsModePanelOpen] = useState(false);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('stats');
  const [taskPanelTriggerRef, setTaskPanelTriggerRef] = useState<React.RefObject<HTMLDivElement | null>>(homeTaskPencilRef);

  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    return localStorage.getItem('custom-avatar');
  });

  useEffect(() => {
    if (customAvatar) {
      localStorage.setItem('custom-avatar', customAvatar);
    } else {
      localStorage.removeItem('custom-avatar');
    }
  }, [customAvatar]);

  // Click outside notepad handler
  useEffect(() => {
    if (!isNotepadOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const isOutsideNotepad = notepadRef.current && !notepadRef.current.contains(e.target as Node);
      const isNotNotepadTrigger = notepadIconRef.current && !notepadIconRef.current.contains(e.target as Node);

      if (isOutsideNotepad && isNotNotepadTrigger) {
        setIsNotepadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotepadOpen, notepadRef, notepadIconRef, setIsNotepadOpen]);

  // App core hooks
  const { tasks, activeTaskId, addTaskTime } = useTaskManager();
  const { recordSession, stats } = useHabits();
  const { level, xp, awardXP, notification } = useGamification();
  const { playSFX, activeAmbient } = useSound();
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const { pipWindow, requestPiP, closePiP } = useDocumentPiP();
  const [isWidgetMode, setIsWidgetMode] = useState(false);

  useEffect(() => {
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  // Electron IPC mode switches
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onModeChanged) {
      const unsubscribe = window.electronAPI.onModeChanged((newMode) => {
        setIsWidgetMode(newMode === 'widget');
      });
      return unsubscribe;
    }
  }, []);

  const handlePiPClick = () => {
    if (window.electronAPI) {
      window.electronAPI.setWindowMode(isWidgetMode ? 'full' : 'widget');
    } else {
      const isTabletOrMobile = window.matchMedia('(max-width: 1024px)').matches || ('ontouchstart' in window);
      if (isTabletOrMobile) {
        return;
      }
      requestPiP({ width: 320, height: 320 });
    }
  };

  useEffect(() => {
    if (features.notifications && "Notification" in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [features.notifications]);

  const handlePlaySFX = (name: 'level-up') => {
    if (features.sound) playSFX(name);
  };

  const prevLevel = useRef(level);
  useEffect(() => {
    if (level > prevLevel.current) {
      handlePlaySFX('level-up');
    }
    prevLevel.current = level;
  }, [level]);

  const getInitialTime = (m: FocusMode) => {
    switch (m) {
      case 'pomodoro': return timerConfig.pomodoro * 60;
      case 'flow': return timerConfig.flow * 60;
      case 'deep_work': return timerConfig.deep_work * 60;
      case 'custom': return timerConfig.custom * 60;
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
      const now = Date.now();
      if (now - lastCompletionTime.current < 2000) return;
      lastCompletionTime.current = now;

      if (isBreak) {
        setIsBreak(false);
        setTimerStatus('idle');
        setTimeLeft(getInitialTime(mode));

        if (window.electronAPI) {
          window.electronAPI.showNotification("Break's Over!", "Ready to get back to work?");
        } else if (features.notifications) {
          new Notification("Break's Over!", { body: "Ready to get back to work?", icon: "/favicon.ico" });
        }
        return;
      }

      const duration = (
        mode === 'pomodoro' ? timerConfig.pomodoro :
          mode === 'flow' ? timerConfig.flow :
            mode === 'deep_work' ? timerConfig.deep_work :
              timerConfig.custom
      );

      let xpGained = 0;
      if (mode === 'pomodoro') {
        xpGained = 30;
      } else if (mode === 'flow') {
        xpGained = 65;
      } else if (mode === 'deep_work') {
        xpGained = 125;
      } else {
        const roundedDuration = Math.round(duration);
        if (roundedDuration === 25) {
          xpGained = 30;
        } else if (roundedDuration === 50 || roundedDuration === 52) {
          xpGained = 65;
        } else if (roundedDuration === 90) {
          xpGained = 125;
        } else {
          xpGained = 5 + Math.floor(duration);
        }
      }

      const hasCombo = tasks.length > 0 && tasks.every(t => t.completed);
      setPendingXp({ xpGained, hasCombo });

      exitFullscreen();

      if (window.electronAPI) {
        window.electronAPI.showNotification("Focus Session Complete!", "Great job! Take a well-deserved break.");
      } else if (features.notifications) {
        new Notification("Focus Session Complete!", { body: "Great job! Take a well-deserved break.", icon: "/favicon.ico" });
      }

      const activeTaskText = activeTaskId ? tasks.find(t => t.id === activeTaskId)?.text : undefined;
      const tags = activeTaskText ? [activeTaskText] : [];

      recordSession(mode, true, duration, false, undefined, tags);

      if (activeTaskId) {
        addTaskTime(activeTaskId, duration * 60 * 1000);
      }

      const breakTime = getBreakTime(mode, timerConfig);
      setBreakPrompt({ show: true, duration: breakTime });
    }
  });

  const handleTakeBreak = (minutes: number) => {
    setTimerStatus('idle');
    setTimeLeft(minutes * 60);
    setIsBreak(true);
    start();
  };

  const handleStart = () => {
    start();
  };

  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onStartSession(() => {
        handleStart();
      });
      return unsubscribe;
    }
  }, [status]);

  const handleReset = () => {
    setIsBreak(false);
    reset();
    exitFullscreen();
  };

  const isFocusActive = status === 'running' && features.ambientMode && appMode === 'focus';
  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const handleAppModeChange = (newMode: AppMode, e?: React.MouseEvent) => {
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

  const getTodayDateStr = () => {
    if (timezone === 'auto') return new Date().toLocaleDateString('en-CA');
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  };

  const todaySessions = (stats?.history || [])
    .filter((s: any) => s.date === getTodayDateStr())
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const completedModes = todaySessions.map((s: any) => s.mode);
  const completedSessionsToday = completedModes.length;
  const streak = stats.streaks.current;

  // Widget Mode rendering check
  if (isWidgetMode) {
    return (
      <WidgetMode
        isWidgetMode={isWidgetMode}
        wallpaper={wallpaper}
        timeLeft={timeLeft}
        status={status}
        handleStart={handleStart}
        pause={pause}
        reset={handleReset}
        mode={mode}
        handlePiPClick={handlePiPClick}
      />
    );
  }

  return (
    <div className={`focus-scene ${(window.electronAPI && !isFullscreen) ? 'has-electron-titlebar' : ''}`}>
      {window.electronAPI && !isFullscreen && <ElectronTitlebar />}

      <WallpaperLayer config={wallpaper} />

      {/* Overlays */}
      <DashboardOverlay
        isDashboardOpen={isDashboardOpen}
        setIsDashboardOpen={setIsDashboardOpen}
        wallpaper={wallpaper}
        setWallpaper={setWallpaper}
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
        handleAddQuote={handleAddQuote}
        handleRemoveQuote={handleRemoveQuote}
        quoteFont={quoteFont}
        setQuoteFont={setQuoteFont}
        timezone={timezone}
        setTimezone={setTimezone}
        dashboardTab={dashboardTab}
        customAvatar={customAvatar}
        setCustomAvatar={setCustomAvatar}
        zenClockStyle={zenClockStyle}
        setZenClockStyle={setZenClockStyle}
      />

      <BreakOverlay
        isOpen={breakPrompt.show}
        breakTime={breakPrompt.duration}
        onTakeBreak={() => {
          setBreakPrompt({ ...breakPrompt, show: false });
          handleTakeBreak(breakPrompt.duration);
          if (pendingXp) {
            awardXP(pendingXp.xpGained, 'session');
            if (pendingXp.hasCombo) {
              awardXP(25, 'achievement');
            }
            setPendingXp(null);
          }
        }}
        onSkipBreak={() => {
          setBreakPrompt({ ...breakPrompt, show: false });
          setTimerStatus('idle');
          setTimeLeft(getInitialTime(mode));
          setIsBreak(false);
          if (pendingXp) {
            awardXP(pendingXp.xpGained, 'session');
            if (pendingXp.hasCombo) {
              awardXP(25, 'achievement');
            }
            setPendingXp(null);
          }
        }}
      />

      {/* XP Toast Notification */}
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

      <AppHeader
        isDashboardOpen={isDashboardOpen}
        isFocusActive={isFocusActive}
        appMode={appMode}
      />

      <FocusContent
        appMode={appMode}
        features={features}
        timeLeft={timeLeft}
        status={status}
        handleStart={handleStart}
        pause={pause}
        handleReset={handleReset}
        handleToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        isBreak={isBreak}
        tasks={tasks}
        activeTaskId={activeTaskId}
        clockFont={clockFont}
        zenClockStyle={zenClockStyle}
        isFocusActive={isFocusActive}
        homeTaskPencilRef={homeTaskPencilRef}
        setTaskPanelTriggerRef={setTaskPanelTriggerRef}
        isTaskPanelOpen={isTaskPanelOpen}
        setIsTaskPanelOpen={setIsTaskPanelOpen}
        mode={mode}
        getBreakTime={(m) => getBreakTime(m, timerConfig)}
        setBreakPrompt={setBreakPrompt}
      />

      {!isFocusActive && appMode !== 'home' && appMode !== 'zen' && (
        <div
          className={`bottom-right-quote font-${quoteFont || 'serif'}`}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            maxWidth: '300px',
            textAlign: 'right',
            opacity: 0.95,
          }}
        >
          <p>"{selectedQuote}"</p>
        </div>
      )}

      {/* Picture in Picture Portal */}
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

      <BottomDock
        isFocusActive={isFocusActive}
        appMode={appMode}
        handleAppModeChange={handleAppModeChange}
        handlePiPClick={handlePiPClick}
        isFullscreen={isFullscreen}
        handleToggleFullscreen={handleToggleFullscreen}
      />

      <RightDock
        isFocusActive={isFocusActive}
        appMode={appMode}
        stats={stats}
        setDashboardTab={setDashboardTab}
        setIsDashboardOpen={setIsDashboardOpen}
        level={level}
        xp={xp}
        completedSessionsToday={completedSessionsToday}
        completedModes={completedModes}
        mode={mode}
        avatarRef={avatarRef}
        isDockExpanded={isDockExpanded}
        setIsDockExpanded={setIsDockExpanded}
        customAvatar={customAvatar}
      />

      <TaskSelectorPanel
        isOpen={isTaskPanelOpen}
        onClose={() => setIsTaskPanelOpen(false)}
        triggerRef={taskPanelTriggerRef}
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

      <CalendarSelectorPanel
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        triggerRef={calendarIconRef}
      />

      <ModeSelectorPanel
        isOpen={isModePanelOpen}
        onClose={() => setIsModePanelOpen(false)}
        currentMode={mode}
        onModeChange={setMode}
        triggerRef={modeIconRef}
      />

      <AnimatePresence>
        {isNotepadOpen && (
          <NotepadOverlay
            setIsNotepadOpen={setIsNotepadOpen}
            notepadRef={notepadRef}
            scale={scale}
            isNotepadPositioned={isNotepadPositioned}
            notepadYPos={notepadYPos}
            notepadMaxHeight={notepadMaxHeight}
            editorRef={editorRef}
            notes={notes}
            activeStyles={activeStyles}
            handleFormat={handleFormat}
            handleInsertChecklist={handleInsertChecklist}
            handleEditorInput={handleEditorInput}
            handleEditorClick={handleEditorClick}
          />
        )}
      </AnimatePresence>

      <VerticalDockPanel
        isOpen={isDockExpanded}
        onClose={() => setIsDockExpanded(false)}
        mode={mode}
        completedSessionsToday={completedSessionsToday}
        notes={notes}
        onOpenDashboard={() => { setDashboardTab('clock'); setIsDashboardOpen(true); }}
        onToggleGraph={() => setIsGraphPanelOpen(!isGraphPanelOpen)}
        onToggleSounds={() => setIsAudioPanelOpen(!isAudioPanelOpen)}
        onToggleNotepad={() => setIsNotepadOpen(!isNotepadOpen)}
        onToggleCalendar={() => setIsCalendarOpen(!isCalendarOpen)}
        onToggleHabits={() => setIsHabitsOpen(!isHabitsOpen)}
        onToggleModeSelector={() => setIsModePanelOpen(!isModePanelOpen)}
        onToggleTasks={() => { setTaskPanelTriggerRef(taskIconRef); setIsTaskPanelOpen(!isTaskPanelOpen); }}
        triggerRef={avatarRef}
        modeIconRef={modeIconRef}
        graphIconRef={graphIconRef}
        calendarIconRef={calendarIconRef}
        habitIconRef={habitIconRef}
        notepadIconRef={notepadIconRef}
        taskIconRef={taskIconRef}
        audioIconRef={audioIconRef}
        isModeOpen={isModePanelOpen}
        isGraphOpen={isGraphPanelOpen}
        isAudioOpen={isAudioPanelOpen}
        isNotepadOpen={isNotepadOpen}
        isCalendarOpen={isCalendarOpen}
        isHabitsOpen={isHabitsOpen}
        isTaskOpen={isTaskPanelOpen}
      />

      <AudioPanel
        externalOpen={isAudioPanelOpen}
        onOpenChange={setIsAudioPanelOpen}
        triggerRef={audioIconRef}
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

  const [appReady, setAppReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <ThemeProvider>
      <HabitsProvider timezone={timezone}>
        <AttendanceProvider>
          <SoundProvider>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <StudyTimer
                timezone={timezone}
                setTimezone={setTimezone}
                onReady={() => setAppReady(true)}
              />
              <GamificationNotification />

              <AnimatePresence>
                {showIntro && (
                  <IntroVideo
                    appReady={appReady}
                    onComplete={handleIntroComplete}
                  />
                )}
              </AnimatePresence>
            </div>
          </SoundProvider>
        </AttendanceProvider>
      </HabitsProvider>
    </ThemeProvider>
  );
}

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

import { TimerDisplay } from './components/timer/TimerDisplay';
import { TimerControls } from './components/timer/TimerControls';
import { MiniTimer } from './components/timer/MiniTimer';
import { WidgetView } from './components/layout/WidgetView';
import { type FocusMode } from './components/ui/ModeSelectorPanel';
import { WALLPAPERS, type WallpaperConfig } from './components/wallpaper/WallpaperSelector';
import { WallpaperLayer } from './components/layout/WallpaperLayer';
import { AudioPanel } from './components/audio/AudioPanel';
import { HomeView } from './components/home/HomeView';
import { ZenMode } from './components/zen/ZenMode';
import { type AppMode } from './components/layout/GlobalModeSwitcher';
import { WeatherWidget } from './components/widgets/WeatherWidget';

import { Dashboard } from './components/dashboard/Dashboard';
import { Trophy, Zap, PictureInPicture2, Maximize, Minimize, User as UserIcon, Leaf, X, Brain, Clock, Coffee, Sliders, Pencil, Settings, Hourglass, CloudSun, Bold, Italic, Underline, Strikethrough, Quote, ListOrdered, List, ListTodo, Outdent, Indent } from 'lucide-react';
import { Dock, DockIcon } from './components/ui/Dock';
import { VerticalDockPanel } from './components/ui/VerticalDockPanel';
import { TaskSelectorPanel } from './components/ui/TaskSelectorPanel';
import { GraphSelectorPanel } from './components/ui/GraphSelectorPanel';
import { HabitSelectorPanel } from './components/ui/HabitSelectorPanel';
import { CalendarSelectorPanel } from './components/ui/CalendarSelectorPanel';
import { ModeSelectorPanel } from './components/ui/ModeSelectorPanel';
import type { DashboardTab } from './components/dashboard/Dashboard';
import './components/audio/audio.css';
import './components/ui/VerticalDock.css';
import { TypingAnimation } from './components/ui/TypingAnimation';
import { DailyProgressRing } from './components/widgets/DailyProgressRing';
import { BreakPromptModal } from './components/modals/BreakPromptModal';
import { SessionRing } from './components/ui/SessionRing';
import { ElectronTitlebar } from './components/layout/ElectronTitlebar';
import { GamificationNotification } from './components/ui/GamificationNotification';



const StudyTimer = ({ timezone, setTimezone }: { timezone: string, setTimezone: (tz: string) => void }) => {
  const [mode, setMode] = useState<FocusMode>('deep_work');
  /* Wallpaper Persistence Logic */
  const [wallpaper, setWallpaper] = useState<WallpaperConfig>(() => {
    // 1. Load from LocalStorage on mount
    const saved = localStorage.getItem('saved-wallpaper');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Find the wallpaper in the current WALLPAPERS list to get the fresh hashed URL from this build
        const fresh = WALLPAPERS.find(wp => wp.id === parsed.id);
        if (fresh) {
          return fresh;
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved wallpaper", e);
      }
    }
    return WALLPAPERS[0]; // Default
  });

  const [isDashboardOpen, setIsDashboardOpen] = useState(false); // Dashboard State
  const [breakPrompt, setBreakPrompt] = useState<{ show: boolean, duration: number }>({ show: false, duration: 5 });
  const [isBreak, setIsBreak] = useState(false);
  const [pendingXp, setPendingXp] = useState<{ xpGained: number; hasCombo: boolean } | null>(null);

  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHabitsOpen, setIsHabitsOpen] = useState(false);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [isGraphPanelOpen, setIsGraphPanelOpen] = useState(false);
  const [isModePanelOpen, setIsModePanelOpen] = useState(false);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('stats');
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
  const graphIconRef = useRef<HTMLDivElement>(null);
  const habitIconRef = useRef<HTMLDivElement>(null);
  const calendarIconRef = useRef<HTMLDivElement>(null);
  const modeIconRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const notepadIconRef = useRef<HTMLDivElement>(null);
  const taskIconRef = useRef<HTMLDivElement>(null);
  const audioIconRef = useRef<HTMLDivElement>(null);
  const notepadRef = useRef<HTMLDivElement>(null);
  const [notepadYPos, setNotepadYPos] = useState('50%');
  const [notepadMaxHeight, setNotepadMaxHeight] = useState('calc(100vh - 40px)');
  const [isNotepadPositioned, setIsNotepadPositioned] = useState(false);
  const homeTaskPencilRef = useRef<HTMLDivElement>(null);
  const [taskPanelTriggerRef, setTaskPanelTriggerRef] = useState<React.RefObject<HTMLDivElement | null>>(homeTaskPencilRef);

  const editorRef = useRef<HTMLDivElement>(null);
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertOrderedList: false,
    insertUnorderedList: false,
  });

  const updateActiveStyles = () => {
    try {
      setActiveStyles({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      });
    } catch (e) {
      // document.queryCommandState may fail if not selection is active
    }
  };

  useEffect(() => {
    if (isNotepadOpen) {
      const handleSelectionChange = () => {
        updateActiveStyles();
      };
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, [isNotepadOpen]);

  const handleFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
    }
    updateActiveStyles();
  };

  const handleInsertChecklist = () => {
    document.execCommand('insertHTML', false, '<ul class="todo-checklist"><li style="list-style:none; display:flex; align-items:center; gap:8px;"><input type="checkbox" class="notepad-todo-checkbox" style="width:14px; height:14px; margin:0;" />&nbsp;</li></ul>');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
    }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const checkbox = target as HTMLInputElement;
      if (checkbox.hasAttribute('checked')) {
        checkbox.removeAttribute('checked');
      } else {
        checkbox.setAttribute('checked', 'true');
      }
      handleEditorInput();
    }
  };


  const [dimensions, setDimensions] = useState({
    scale: Math.max(0.5, Math.min(Math.min(window.innerHeight / 633, window.innerWidth / 850), 1.8))
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        scale: Math.max(0.5, Math.min(Math.min(window.innerHeight / 633, window.innerWidth / 850), 1.8))
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale = dimensions.scale;

  // Update Notepad position with viewport clamping next to its sidebar icon
  useEffect(() => {
    const updatePosition = () => {
      if (isNotepadOpen && notepadIconRef.current) {
        const triggerRect = notepadIconRef.current.getBoundingClientRect();
        const triggerCenterY = triggerRect.top + triggerRect.height / 2;
        const panelHeight = notepadRef.current ? notepadRef.current.offsetHeight : 340;
        const viewportHeight = window.innerHeight;
        const margin = 20;

        // 1. Calculate the max allowable unscaled height to fit inside the viewport visually
        const maxUnscaledHeight = (viewportHeight - 2 * margin) / scale;
        const maxH = Math.max(200, maxUnscaledHeight);

        // 2. Compute offsetY shift due to scaling around 'right center' origin
        const currentHeight = Math.min(panelHeight, maxH);
        const offsetY = ((scale - 1) * currentHeight) / 2;

        // 3. Calculate idealTop (unscaled) centered around trigger
        let idealTop = triggerCenterY - currentHeight / 2;

        // 4. Clamped boundaries for unscaled top to keep visual top/bottom in viewport
        const minTop = margin + offsetY;
        const maxTop = viewportHeight - currentHeight - offsetY - margin;

        const finalTop = Math.max(minTop, Math.min(maxTop, idealTop));

        setNotepadYPos(`${finalTop}px`);
        setNotepadMaxHeight(`${maxH}px`);
        setIsNotepadPositioned(true);
      }
    };

    if (isNotepadOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);

      const observer = new ResizeObserver(() => {
        requestAnimationFrame(updatePosition);
      });
      if (notepadRef.current) {
        observer.observe(notepadRef.current);
      }

      return () => {
        window.removeEventListener('resize', updatePosition);
        observer.disconnect();
      };
    } else {
      setIsNotepadPositioned(false);
    }
  }, [isNotepadOpen, scale]);

  // Close notepad on click outside
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
  }, [isNotepadOpen]);

  // Task context for vertical strip
  const { tasks, activeTaskId, addTaskTime } = useFocusTask();

  const { setThemeFromWallpaper } = useTheme(); // Destructure toggleTheme and themeMode
  const { level, xp, awardXP, notification } = useGamification();
  const { playSFX, activeAmbient } = useSound();
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const [appMode, setAppMode] = useState<AppMode>('focus');

  // --- NEW STATES FOR DASHBOARD CONFIG ---
  const [clockFont, setClockFont] = useState(() => {
    return localStorage.getItem('saved-clock-font') || 'default';
  });

  useEffect(() => {
    localStorage.setItem('saved-clock-font', clockFont);
  }, [clockFont]);

  const [zenClockStyle, setZenClockStyle] = useState(() => {
    return localStorage.getItem('saved-zen-clock-style') || 'flip';
  });

  useEffect(() => {
    localStorage.setItem('saved-zen-clock-style', zenClockStyle);
  }, [zenClockStyle]);
  const [timerConfig, setTimerConfig] = useState(() => {
    const saved = localStorage.getItem('study-timer-timer-config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse timerConfig", e);
      }
    }
    return {
      pomodoro: 25,
      flow: 52,
      deep_work: 90,
      shortBreak: 5,
      longBreak: 15,
      custom: 15,
      customBreak: 5,
      pomodoroBreakMode: 'auto' as 'auto' | 'fixed',
      pomodoroBreakDuration: 5,
      flowBreakMode: 'auto' as 'auto' | 'fixed',
      flowBreakDuration: 17,
      deepWorkBreakMode: 'auto' as 'auto' | 'fixed',
      deepWorkBreakDuration: 15
    };
  });
  const [features, setFeatures] = useState(() => {
    const saved = localStorage.getItem('study-timer-features');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse features", e);
      }
    }
    return {
      ambientMode: false,
      sound: true,
      notifications: true,
      showQuoteInFullscreen: true,
      zenModeType: 'clock' as 'clock' | 'timer',
      zenTimeFormat: '24h' as '12h' | '24h',
      homeTimeFormat: '24h' as '12h' | '24h'
    };
  });

  useEffect(() => {
    localStorage.setItem('study-timer-timer-config', JSON.stringify(timerConfig));
  }, [timerConfig]);

  useEffect(() => {
    localStorage.setItem('study-timer-features', JSON.stringify(features));
  }, [features]);
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

  const [notes, setNotes] = useState(() => {
    const savedDate = localStorage.getItem('study-notes-date');
    const todayStr = new Date().toDateString();

    if (savedDate && savedDate !== todayStr) {
      // It's a new day! Clear the active scratchpad text
      localStorage.setItem('study-notes', '');
      localStorage.setItem('study-notes-date', todayStr);
      return '';
    }

    if (!savedDate) {
      localStorage.setItem('study-notes-date', todayStr);
    }

    return localStorage.getItem('study-notes') || '';
  });

  useEffect(() => {
    localStorage.setItem('study-notes', notes);

    const cleanContent = notes.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!cleanContent) return;

    const debounceHandler = setTimeout(() => {
      try {
        const savedLogs = localStorage.getItem('scratchpad-logs');
        const logs: Array<{ id: string; timestamp: string; content: string }> = savedLogs ? JSON.parse(savedLogs) : [];
        const now = new Date();
        const lastLog = logs[logs.length - 1];

        // Do nothing if content is exactly the same as the last log
        if (lastLog && lastLog.content === notes) {
          return;
        }

        const FIVE_MINUTES_MS = 5 * 60 * 1000;
        const isRecent = lastLog && (now.getTime() - new Date(lastLog.timestamp).getTime() < FIVE_MINUTES_MS);
        const isSameDay = lastLog && (new Date(lastLog.timestamp).toDateString() === now.toDateString());

        if (isRecent && isSameDay) {
          // Update the existing entry for this active typing session
          lastLog.content = notes;
          lastLog.timestamp = now.toISOString();
        } else {
          // Create a new entry
          logs.push({
            id: Math.random().toString(36).substring(2, 9),
            timestamp: now.toISOString(),
            content: notes
          });
        }

        localStorage.setItem('scratchpad-logs', JSON.stringify(logs));
        window.dispatchEvent(new Event('scratchpad-logs-updated'));
      } catch (err) {
        console.error('Error saving scratchpad logs:', err);
      }
    }, 5000); // 5 seconds debounce

    return () => clearTimeout(debounceHandler);
  }, [notes]);

  // Sync contentEditable content on open or when notes change (e.g. daily reset)
  useEffect(() => {
    if (isNotepadOpen && editorRef.current) {
      if (editorRef.current.innerHTML !== notes) {
        editorRef.current.innerHTML = notes || '<div><br></div>';
      }
    }
  }, [isNotepadOpen, notes]);

  useEffect(() => {
    localStorage.setItem('custom-quotes', JSON.stringify(customQuotes));
  }, [customQuotes]);

  // Check for day change to clear scratchpad and reset daily sessions count
  useEffect(() => {
    const checkDayChange = () => {
      const todayStr = new Date().toDateString();
      const savedDate = localStorage.getItem('study-notes-date');

      if (savedDate && savedDate !== todayStr) {
        setNotes('');
        localStorage.setItem('study-notes', '');
        localStorage.setItem('study-notes-date', todayStr);
      }
    };

    // Check on mount and focus
    checkDayChange();

    const interval = setInterval(checkDayChange, 60000); // Check every minute
    window.addEventListener('focus', checkDayChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkDayChange);
    };
  }, []);

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

  // --- AUDIO TRIGGERS ---
  const prevLevel = useRef(level);
  useEffect(() => {
    if (level > prevLevel.current) {
      handlePlaySFX('level-up');
    }
    prevLevel.current = level;
  }, [level]);

  // Document PiP Hook
  const { pipWindow, requestPiP, closePiP } = useDocumentPiP();
  const [isWidgetMode, setIsWidgetMode] = useState(false);

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
        return; // Do nothing on tablet/mobile
      }
      requestPiP({ width: 320, height: 320 });
    }
  };

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

  const getBreakTime = (m: string) => {
    if (m === 'custom') return timerConfig.customBreak;
    if (m === 'pomodoro') {
      return (timerConfig.pomodoroBreakMode || 'auto') === 'auto'
        ? timerConfig.shortBreak
        : (timerConfig.pomodoroBreakDuration || 5);
    }
    if (m === 'flow') {
      return (timerConfig.flowBreakMode || 'auto') === 'auto'
        ? 17
        : (timerConfig.flowBreakDuration || 17);
    }
    if (m === 'deep_work') {
      return (timerConfig.deepWorkBreakMode || 'auto') === 'auto'
        ? timerConfig.longBreak
        : (timerConfig.deepWorkBreakDuration || 15);
    }
    return timerConfig.shortBreak;
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

        if (window.electronAPI) {
          window.electronAPI.showNotification("Break's Over!", "Ready to get back to work?");
        } else if (features.notifications) {
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

      // DIRECT SAVE - No Popups/Modals
      const activeTaskText = activeTaskId ? tasks.find(t => t.id === activeTaskId)?.text : undefined;
      const tags = activeTaskText ? [activeTaskText] : [];

      recordSession(mode, true, duration, false, undefined, tags);

      if (activeTaskId) {
        addTaskTime(activeTaskId, duration * 60 * 1000);
      }

      // Break Prompt
      const breakTime = getBreakTime(mode);
      setBreakPrompt({ show: true, duration: breakTime });
    }
  });


  const handleTakeBreak = (minutes: number) => {
    setTimerStatus('idle');
    setTimeLeft(minutes * 60);
    setIsBreak(true); // Enter Break Mode manually
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
    setIsBreak(false); // Always exit break mode on reset
    reset();
    exitFullscreen(); // This will trigger the hook's listener to set isFullscreen=false
  }

  // Removed Focus Protection Hook as per user request

  // Generalize Focus Mode: Only hide UI if Ambient Mode is enabled while running
  const isFocusActive = status === 'running' && features.ambientMode && appMode === 'focus';
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



  if (isWidgetMode) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', padding: 0, margin: 0, boxSizing: 'border-box' }}>
        <WallpaperLayer config={wallpaper} />
        <WidgetView
          timeLeft={timeLeft}
          status={status}
          start={handleStart}
          pause={pause}
          reset={handleReset}
          mode={mode}
          onCloseWidget={handlePiPClick}
        />
      </div>
    );
  }

  return (
    <div className={`focus-scene ${(window.electronAPI && !isFullscreen) ? 'has-electron-titlebar' : ''}`}>
      {window.electronAPI && !isFullscreen && <ElectronTitlebar />}

      <WallpaperLayer config={wallpaper} />

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
          initialTab={dashboardTab}
          customAvatar={customAvatar}
          setCustomAvatar={setCustomAvatar}
          zenClockStyle={zenClockStyle}
          setZenClockStyle={setZenClockStyle}
        />
      )}



      <BreakPromptModal
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
          // Reset to Focus Mode
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
      <div className="focus-header">
        <header
          className="stitch-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem 2rem',
            width: '100%',
            opacity: (isDashboardOpen || isFocusActive) ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: (isDashboardOpen || isFocusActive) ? 'none' : 'auto',
          }}
        >
          {/* ... branding and stats bar ... */}
          {/* Left: Branding & Weather Card */}
          <div className="stitch-header-left" style={{
            position: 'absolute',
            left: '2rem',
            top: 'calc(var(--safe-top-offset) + 1.2rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1rem',
            zIndex: 50
          }}>
            <div className="brand-logo-text" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              alignItems: 'flex-end',
              opacity: appMode === 'zen' ? 0 : 0.95,
              transition: 'opacity 0.5s ease',
            }}>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '2.45rem',
                letterSpacing: '0.01em',
                color: '#ffffff',
                lineHeight: 1.1
              }}>focora</span>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 500,
                fontSize: '0.625rem',
                letterSpacing: '0.05em',
                color: 'rgba(255, 255, 255, 0.45)',
                lineHeight: 1.1
              }}>by HIMANSHU</span>
            </div>

            {appMode === 'home' && (
              <WeatherWidget />
            )}
          </div>

          {/* Stats Bar is now moved next to the vdock avatar */}

        </header>
      </div>

      <main className="focus-content">
        {appMode === 'zen' && (
          <ZenMode
            clockFont={zenClockStyle}
            zenModeType={features.zenModeType}
            timeLeft={timeLeft}
            status={status}
            onStart={handleStart}
            onPause={pause}
            onReset={reset}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            timeFormat={features.zenTimeFormat}
            modeName={isBreak ? "• Taking Break" : "• " + (tasks.find(t => t.id === activeTaskId)?.text || 'Ready to Focus?')}
          />
        )}
        <div className="hud-center-stack" style={{ display: appMode === 'zen' ? 'none' : 'flex' }}>
          <div
            className="mode-selector-container"
            style={{
              display: 'none',
            }}
          >
          </div>

          {/* Main Content Area: Home, Zen, or Timer */}
          {appMode === 'home' ? (
            <HomeView clockFont={clockFont} timeFormat={features.homeTimeFormat} />
          ) : appMode === 'zen' ? null : (
            <section className="stitch-timer-section">
              <div
                style={{
                  display: isFocusActive ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  opacity: isFocusActive ? 0 : 1,
                  transition: 'opacity 0.3s',
                  marginBottom: '1rem'
                }}
              >
                <h2 className="stitch-mode-label" style={{
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontSize: '1.7rem',
                  fontWeight: 500,
                  margin: 0,
                  textAlign: 'center',
                }}>
                  <TypingAnimation
                    key={isBreak ? 'break' : (activeTaskId || 'no-task')}
                    duration={100}
                  >
                    {isBreak
                      ? '• Taking Break'
                      : '• ' + (tasks.find(t => t.id === activeTaskId)?.text || 'Ready to Focus?')}
                  </TypingAnimation>
                </h2>
                {!isBreak && (
                  <div
                    ref={homeTaskPencilRef}
                    id="home-task-pencil-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskPanelTriggerRef(homeTaskPencilRef);
                      setIsTaskPanelOpen(!isTaskPanelOpen);
                    }}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'rgba(255, 255, 255, 0.4)',
                      transition: 'color 0.2s',
                      padding: '4px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    title="Change Focus Intentions"
                  >
                    <Pencil size={16} />
                  </div>
                )}
              </div>

              <TimerDisplay
                seconds={timeLeft}
                font={clockFont}
                style={{
                  fontSize: isFocusActive ? '25vw' : '12rem',
                  lineHeight: 1,
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '0',
                  transform: isFocusActive ? 'none' : 'none',
                }}
              />

              <div style={{
                opacity: isFocusActive ? 0.05 : 1,
                transition: 'opacity 0.3s ease',
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
                    setBreakPrompt({ show: true, duration: getBreakTime(mode) });
                  }}
                  allowReset
                />
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Overlays (Toasts, Quotes, etc.) */}
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



      {/* Bottom-Left Unified Docks Group */}
      <div
        className="bottom-docks-group"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: 'var(--space-3)',
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'center',
          transform: 'scale(var(--ui-scale))',
          transformOrigin: 'bottom left',
          zIndex: 51,
        }}
      >
        {/* Mode Switcher Dock */}
        <div
          className="mode-dock-wrapper"
          style={{
            opacity: isFocusActive ? 0 : 1,
            visibility: isFocusActive ? 'hidden' : 'visible',
            transition: 'opacity 0.4s ease, visibility 0.4s ease',
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
                  <Hourglass size={20} />
                </DockIcon>

                <DockIcon
                  mouseX={mouseX}
                  label="Relax"
                  isActive={appMode === 'home'}
                  onClick={() => handleAppModeChange('home')}
                >
                  <CloudSun size={20} />
                </DockIcon>

                <DockIcon
                  mouseX={mouseX}
                  label="Zen Mode"
                  isActive={appMode === 'zen'}
                  onClick={() => handleAppModeChange('zen')}
                >
                  <Leaf size={20} />
                </DockIcon>
              </>
            )}
          </Dock>
        </div>

        {/* Bottom Tool Dock */}
        <div
          className="bottom-dock-nav"
          style={{
            position: 'relative',
            opacity: (isFocusActive || appMode === 'zen') ? 0 : 1,
            visibility: (isFocusActive || appMode === 'zen') ? 'hidden' : 'visible',
            transition: 'all 0.5s ease',
            pointerEvents: isFocusActive ? 'none' : 'auto',
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
          }}
        >
          <Dock>
            {(mouseX: MotionValue<number>) => (
              <>
                {/* PiP */}
                <DockIcon mouseX={mouseX} label="Pop Out" onClick={handlePiPClick}>
                  <PictureInPicture2 size={20} />
                </DockIcon>

                {/* Fullscreen */}
                <DockIcon mouseX={mouseX} label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} onClick={handleToggleFullscreen}>
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </DockIcon>
              </>
            )}
          </Dock>
        </div>
      </div>

      {/* Right Vertical Dock — Collapsible */}
      <div
        className="vdock-group shifting-vdock"
        style={{
          opacity: (isFocusActive || appMode === 'zen') ? 0 : 1,
          visibility: (isFocusActive || appMode === 'zen') ? 'hidden' : 'visible',
          transition: 'opacity 0.4s ease, visibility 0.4s ease, top 0.5s ease, bottom 0.5s ease, right 0.5s ease, transform 0.5s ease',
          zIndex: 101,
        }}
      >
        {/* Horizontal wrapper for Stats Bar and the vdock avatar button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {appMode !== 'home' && (
            <nav
              className="stitch-stats-bar"
              onClick={() => { setDashboardTab('stats'); setIsDashboardOpen(true); }}
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '1.25rem',
                padding: '0 1.25rem',
                height: '3.5rem',
                boxSizing: 'border-box',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
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
              <div className="flex-center" style={{ gap: '0.5rem', whiteSpace: 'nowrap' }}>
                <Trophy size={20} color="var(--color-accent)" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.1 }}>LEVEL {level}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.6, lineHeight: 1.1 }}>{xp} XP</span>
                </div>
              </div>

              {/* Focus Mode Icon & Label — wrapped in SessionRing */}
              <SessionRing currentSession={completedSessionsToday} totalSessions={4} mode={mode} completedModes={completedModes}>
                <div
                  className="flex-center"
                  title="Current Focus Mode"
                >
                  {(() => {
                    const config = {
                      deep_work: { icon: <Brain size={18} />, color: '#a855f7', label: 'Deep Work' },
                      pomodoro: { icon: <Clock size={18} />, color: '#ef4444', label: 'Pomodoro' },
                      flow: { icon: <Coffee size={18} />, color: '#3b82f6', label: '52/17' },
                      custom: { icon: <Sliders size={18} />, color: '#22c55e', label: 'Custom' }
                    }[mode] || { icon: <Brain size={18} />, color: '#a855f7', label: 'Deep Work' };

                    return (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '0.5rem',
                        background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
                        color: '#ffffff',
                        boxShadow: `0 4px 12px ${config.color}40`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}>
                        {config.icon}
                      </span>
                    );
                  })()}
                </div>
              </SessionRing>
            </nav>
          )}

          {/* Avatar Button — always visible, toggles right-side Control Center panel */}
          <div
            ref={appMode === 'zen' ? null : avatarRef}
            className={`vdock-avatar ${isDockExpanded ? 'expanded' : ''}`}
            onClick={() => setIsDockExpanded(!isDockExpanded)}
            role="button"
            tabIndex={0}
            aria-label={isDockExpanded ? 'Close Control Center' : 'Open Control Center'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsDockExpanded(!isDockExpanded); } }}
          >
            {customAvatar ? (
              <img src={customAvatar} alt="User Avatar" />
            ) : (
              <UserIcon size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
            )}
            <div className="vdock-tooltip">{isDockExpanded ? 'Close' : 'Open Control Center'}</div>
          </div>
        </div>
      </div>

      {/* Zen Mode Minimal Settings Trigger */}
      {appMode === 'zen' && (
        <div
          ref={appMode === 'zen' ? avatarRef : null}
          onClick={(e) => { e.stopPropagation(); setIsDockExpanded(!isDockExpanded); }}
          style={{
            position: 'fixed',
            top: 'calc(var(--safe-top-offset) + 2rem)',
            left: '2rem',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 10000,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.35,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.35';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'none';
          }}
          className="interactive-press zen-settings-btn"
          role="button"
          tabIndex={0}
          aria-label="Toggle Control Center"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsDockExpanded(!isDockExpanded); } }}
        >
          <Settings size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </div>
      )}

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

      {/* Calendar Selector Panel */}
      <CalendarSelectorPanel
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        triggerRef={calendarIconRef}
      />

      {/* Mode Selector Panel */}
      <ModeSelectorPanel
        isOpen={isModePanelOpen}
        onClose={() => setIsModePanelOpen(false)}
        currentMode={mode}
        onModeChange={setMode}
        triggerRef={modeIconRef}
      />

      {/* Notepad Popup (Global Overlay) */}
      <AnimatePresence>
        {isNotepadOpen && (
          <motion.div
            ref={notepadRef}
            initial={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
            animate={{ opacity: isNotepadPositioned ? 1 : 0, x: 0, scale: scale }}
            exit={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="notepad-popup"
            style={{
              position: 'fixed',
              right: `${92 * scale}px`,
              top: notepadYPos,
              left: 'auto',
              bottom: 'auto',
              transform: 'none',
              transformOrigin: 'right center',
              zIndex: 1001,
              maxHeight: notepadMaxHeight,
              visibility: isNotepadPositioned ? 'visible' : 'hidden',
              overflowY: 'auto'
            }}
          >
            <div className="notepad-popup-header">
              <span className="notepad-popup-title">Scratchpad</span>
              <button className="notepad-popup-close" onClick={() => setIsNotepadOpen(false)}>
                <X size={14} />
              </button>
            </div>

            {/* Rich-Text Formatting Toolbar */}
            <div className="notepad-toolbar">
              <button
                type="button"
                onClick={() => handleFormat('bold')}
                className={`toolbar-btn ${activeStyles.bold ? 'active' : ''}`}
                title="Bold"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleFormat('italic')}
                className={`toolbar-btn ${activeStyles.italic ? 'active' : ''}`}
                title="Italic"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleFormat('underline')}
                className={`toolbar-btn ${activeStyles.underline ? 'active' : ''}`}
                title="Underline"
              >
                <Underline size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleFormat('strikeThrough')}
                className={`toolbar-btn ${activeStyles.strikeThrough ? 'active' : ''}`}
                title="Strikethrough"
              >
                <Strikethrough size={14} />
              </button>
              <div className="toolbar-divider" />
              <button
                type="button"
                onClick={() => handleFormat('formatBlock', '<h1>')}
                className="toolbar-btn text-btn"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => handleFormat('formatBlock', '<h2>')}
                className="toolbar-btn text-btn"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => handleFormat('formatBlock', '<blockquote>')}
                className="toolbar-btn"
                title="Blockquote"
              >
                <Quote size={14} />
              </button>
              <div className="toolbar-divider" />
              <button
                type="button"
                onClick={() => handleFormat('insertOrderedList')}
                className={`toolbar-btn ${activeStyles.insertOrderedList ? 'active' : ''}`}
                title="Numbered List"
              >
                <ListOrdered size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleFormat('insertUnorderedList')}
                className={`toolbar-btn ${activeStyles.insertUnorderedList ? 'active' : ''}`}
                title="Bulleted List"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={handleInsertChecklist}
                className="toolbar-btn"
                title="Todo List"
              >
                <ListTodo size={14} />
              </button>
              <div className="toolbar-divider" />
              <button
                type="button"
                onClick={() => handleFormat('outdent')}
                className="toolbar-btn"
                title="Decrease Indent"
              >
                <Outdent size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleFormat('indent')}
                className="toolbar-btn"
                title="Increase Indent"
              >
                <Indent size={14} />
              </button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onClick={handleEditorClick}
              className="notepad-popup-textarea custom-scrollbar"
              data-placeholder="Write something..."
              spellCheck={false}
              style={{
                outline: 'none',
                userSelect: 'text',
                WebkitUserSelect: 'text'
              }}
            />

            <div className="notepad-popup-footer">
              <span>{notes ? notes.replace(/<[^>]*>/g, '').length : 0} chars</span>
              <span>Auto-saved</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Center Side Panel */}
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

      {/* Audio Panel (hidden by default, triggered from toolbar) */}
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

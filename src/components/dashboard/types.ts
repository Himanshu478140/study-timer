import type { WallpaperConfig } from '../wallpaper/WallpaperSelector';

export type DashboardTab = 'themes' | 'clock' | 'stats' | 'quotes' | 'account' | 'support' | 'about';

export interface TimerConfig {
  pomodoro: number;
  flow: number;
  deep_work: number;
  shortBreak: number;
  longBreak: number;
  custom: number;
  customBreak: number;
  pomodoroBreakMode?: 'auto' | 'fixed';
  pomodoroBreakDuration?: number;
  flowBreakMode?: 'auto' | 'fixed';
  flowBreakDuration?: number;
  deepWorkBreakMode?: 'auto' | 'fixed';
  deepWorkBreakDuration?: number;
}

export interface DashboardFeatures {
  ambientMode: boolean;
  sound: boolean;
  notifications: boolean;
  showQuoteInFullscreen: boolean;
  zenModeType: 'clock' | 'timer';
  zenTimeFormat: '12h' | '24h';
  homeTimeFormat: '12h' | '24h';
}

export interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaper: WallpaperConfig;
  onWallpaperSelect: (config: WallpaperConfig) => void;
  timerConfig: TimerConfig;
  setTimerConfig: (config: TimerConfig) => void;
  features: DashboardFeatures;
  setFeatures: (features: DashboardFeatures) => void;
  clockFont: string;
  setClockFont: (font: string) => void;
  selectedQuote: string;
  setSelectedQuote: (quote: string) => void;
  customQuotes: string[];
  onAddQuote: (quote: string) => void;
  onRemoveQuote: (quote: string) => void;
  quoteFont: string;
  setQuoteFont: (font: string) => void;
  xp: number;
  level: number;
  streak: number;
  stats: any;
  timezone: string;
  setTimezone: (tz: string) => void;
  initialTab?: DashboardTab;
  customAvatar: string | null;
  setCustomAvatar: (avatar: string | null) => void;
  zenClockStyle: string;
  setZenClockStyle: (style: string) => void;
}

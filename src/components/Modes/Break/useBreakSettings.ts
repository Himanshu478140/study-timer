import { useState } from 'react';
import type { TimerConfig } from '../../dashboard/types';

/**
 * Custom hook to encapsulate pomodoro, 52/17 flow, and deep work break mode configurations.
 */
export const useBreakSettings = (
  timerConfig: TimerConfig,
  setTimerConfig: (config: TimerConfig) => void
) => {
  const [activeBreakSettingMode, setActiveBreakSettingMode] = useState<'pomodoro' | 'flow' | 'deep_work'>('pomodoro');
  const [focusError, setFocusError] = useState(false);
  const [breakError, setBreakError] = useState(false);

  const getBreakMode = (m: 'pomodoro' | 'flow' | 'deep_work') => {
    if (m === 'pomodoro') return timerConfig.pomodoroBreakMode || 'auto';
    if (m === 'flow') return timerConfig.flowBreakMode || 'auto';
    return timerConfig.deepWorkBreakMode || 'auto';
  };

  const setBreakMode = (m: 'pomodoro' | 'flow' | 'deep_work', modeValue: 'auto' | 'fixed') => {
    if (m === 'pomodoro') {
      setTimerConfig({ ...timerConfig, pomodoroBreakMode: modeValue });
    } else if (m === 'flow') {
      setTimerConfig({ ...timerConfig, flowBreakMode: modeValue });
    } else {
      setTimerConfig({ ...timerConfig, deepWorkBreakMode: modeValue });
    }
  };

  const getBreakDuration = (m: 'pomodoro' | 'flow' | 'deep_work') => {
    if (m === 'pomodoro') return timerConfig.pomodoroBreakDuration !== undefined ? timerConfig.pomodoroBreakDuration : 5;
    if (m === 'flow') return timerConfig.flowBreakDuration !== undefined ? timerConfig.flowBreakDuration : 17;
    return timerConfig.deepWorkBreakDuration !== undefined ? timerConfig.deepWorkBreakDuration : 15;
  };

  const setBreakDuration = (m: 'pomodoro' | 'flow' | 'deep_work', durationValue: number) => {
    if (m === 'pomodoro') {
      setTimerConfig({ ...timerConfig, pomodoroBreakDuration: durationValue });
    } else if (m === 'flow') {
      setTimerConfig({ ...timerConfig, flowBreakDuration: durationValue });
    } else {
      setTimerConfig({ ...timerConfig, deepWorkBreakDuration: durationValue });
    }
  };

  const getAutoBreakTime = (m: 'pomodoro' | 'flow' | 'deep_work') => {
    if (m === 'pomodoro') return timerConfig.shortBreak;
    if (m === 'flow') return 17;
    return timerConfig.longBreak;
  };

  const isCustomPreset = (m: 'pomodoro' | 'flow' | 'deep_work') => {
    const dur = getBreakDuration(m);
    return dur === 5 || dur === 10 || dur === 15;
  };

  return {
    activeBreakSettingMode,
    setActiveBreakSettingMode,
    focusError,
    setFocusError,
    breakError,
    setBreakError,
    getBreakMode,
    setBreakMode,
    getBreakDuration,
    setBreakDuration,
    getAutoBreakTime,
    isCustomPreset,
  };
};

import { useState } from 'react';

export const useBreakFlow = () => {
    const [breakPrompt, setBreakPrompt] = useState<{ show: boolean, duration: number }>({ show: false, duration: 5 });
    const [isBreak, setIsBreak] = useState(false);
    const [pendingXp, setPendingXp] = useState<{ xpGained: number; hasCombo: boolean } | null>(null);

    const getBreakTime = (m: string, timerConfig: any) => {
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

    return {
        breakPrompt,
        setBreakPrompt,
        isBreak,
        setIsBreak,
        pendingXp,
        setPendingXp,
        getBreakTime
    };
};

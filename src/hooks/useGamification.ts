import { useState, useEffect } from 'react';

const BASE_XP = 100;
const EXPONENT = 1.5;

export interface UserStats {
    xp: number;
    level: number;
    streak: number;
    lastSessionDate: string | null;
    dailySessionXp: number;
    dailyTaskCount: number;
    lastXpAwardDate: string | null;
}

export const getXpRequiredForLevel = (level: number): number => {
    return Math.floor(BASE_XP * Math.pow(level, EXPONENT));
};

export const getTotalXpToReachLevel = (level: number): number => {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += getXpRequiredForLevel(i);
    }
    return total;
};

export const getLevelFromXp = (xp: number): number => {
    let level = 1;
    while (true) {
        const nextXp = getXpRequiredForLevel(level);
        if (xp >= nextXp) {
            xp -= nextXp;
            level++;
        } else {
            break;
        }
    }
    return level;
};

export const useGamification = () => {
    const [stats, setStats] = useState<UserStats>(() => {
        const stored = localStorage.getItem('study-timer-stats');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return {
                    xp: parsed.xp ?? 0,
                    level: parsed.level ?? 1,
                    streak: parsed.streak ?? 0,
                    lastSessionDate: parsed.lastSessionDate ?? null,
                    dailySessionXp: parsed.dailySessionXp ?? 0,
                    dailyTaskCount: parsed.dailyTaskCount ?? 0,
                    lastXpAwardDate: parsed.lastXpAwardDate ?? null,
                };
            } catch (e) {
                console.error(e);
            }
        }
        return { xp: 0, level: 1, streak: 0, lastSessionDate: null, dailySessionXp: 0, dailyTaskCount: 0, lastXpAwardDate: null };
    });

    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('study-timer-stats', JSON.stringify(stats));
        window.dispatchEvent(new CustomEvent('study-timer-gamification-update', { detail: stats }));
    }, [stats]);

    useEffect(() => {
        const handleSync = (e: Event) => {
            const customEvent = e as CustomEvent<UserStats>;
            if (customEvent.detail && JSON.stringify(customEvent.detail) !== JSON.stringify(stats)) {
                setStats(customEvent.detail);
            }
        };
        window.addEventListener('study-timer-gamification-update', handleSync);
        return () => window.removeEventListener('study-timer-gamification-update', handleSync);
    }, [stats]);

    const awardXP = (amount: number, type: 'session' | 'task' | 'achievement' | 'other' = 'other') => {
        setStats((prev) => {
            const todayStr = new Date().toDateString();
            
            // Check if we need to reset daily caps
            const isNewDay = prev.lastXpAwardDate !== todayStr;
            let currentDailySessionXp = isNewDay ? 0 : prev.dailySessionXp;
            let currentDailyTaskCount = isNewDay ? 0 : prev.dailyTaskCount;

            let actualAmountToAward = amount;

            if (type === 'session') {
                const SESSION_DAILY_CAP = 300;
                if (currentDailySessionXp >= SESSION_DAILY_CAP) {
                    actualAmountToAward = 0;
                } else if (currentDailySessionXp + amount > SESSION_DAILY_CAP) {
                    actualAmountToAward = SESSION_DAILY_CAP - currentDailySessionXp;
                }
                currentDailySessionXp += actualAmountToAward;
            } else if (type === 'task') {
                const TASK_DAILY_CAP = 10;
                if (currentDailyTaskCount >= TASK_DAILY_CAP) {
                    actualAmountToAward = 0;
                } else if (currentDailyTaskCount + 1 > TASK_DAILY_CAP) {
                    actualAmountToAward = 0;
                } else {
                    currentDailyTaskCount += 1;
                }
            }

            if (actualAmountToAward <= 0) {
                // If capped out, show a cap reached notification
                setNotification(type === 'session' ? "Daily session XP cap reached!" : "Daily task XP cap reached!");
                setTimeout(() => setNotification(null), 3000);
                
                return {
                    ...prev,
                    dailySessionXp: currentDailySessionXp,
                    dailyTaskCount: currentDailyTaskCount,
                    lastXpAwardDate: todayStr
                };
            }

            const newXP = prev.xp + actualAmountToAward;
            const newLevel = getLevelFromXp(newXP);

            if (newLevel > prev.level) {
                setNotification(`Level Up! You represent level ${newLevel} now!`);
                setTimeout(() => setNotification(null), 5000);
            } else {
                setNotification(`+${actualAmountToAward} XP`);
                setTimeout(() => setNotification(null), 3000);
            }

            return {
                ...prev,
                xp: newXP,
                level: newLevel,
                dailySessionXp: currentDailySessionXp,
                dailyTaskCount: currentDailyTaskCount,
                lastXpAwardDate: todayStr
            };
        });
    };

    const xpRequiredForNextLevel = getXpRequiredForLevel(stats.level);
    const totalXpToReachCurrent = getTotalXpToReachLevel(stats.level);
    const progressXP = stats.xp - totalXpToReachCurrent;
    const progressPercent = (progressXP / xpRequiredForNextLevel) * 100;

    return {
        level: stats.level,
        xp: stats.xp,
        awardXP,
        notification,
        xpRequiredForNextLevel,
        progressXP,
        progressPercent
    };
};

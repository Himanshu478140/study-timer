import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from 'firebase/auth';
import { useGamification } from '../hooks/useGamification';
import { useCloudSync } from './CloudSyncContext';
import {
    syncCollectionItem,
    deleteCollectionItem,
    loadCollection,
    cleanupOldData
} from '../utils/syncUtils';

// --- Types ---
export interface FocusSession {
    id: string;
    date: string; // ISO Date String
    startTime: string; // ISO String
    durationMinutes: number;
    mode: 'pomodoro' | 'deep_work' | 'flow' | 'ambient' | 'custom';
    rating?: number; // 1-5
    tags?: string[]; // e.g. "Distracted", "Flow State"
}

export interface DailyHabit {
    id: string;
    name: string;
    color: string; // Hex code or tailwind class
    completedDates: string[]; // ISO Date strings "YYYY-MM-DD"
}

export interface FocusStats {
    history: FocusSession[];
    today: {
        date: string;
        score: number;
        pomodoros: number;
        deepWorkMinutes: number;
        sessions: number;
    };
    streaks: {
        current: number;
        best: number;
        lastActiveDate: string;
    };
    totalFocusMinutes: number;
    dailyGoalMinutes: number;
    level: number;
}

export interface CalendarEvent {
    id: string;
    date: string; // ISO Date String YYYY-MM-DD
    title: string;
    type: string;
    color: string;
}

interface HabitsContextType {
    stats: FocusStats;
    recordSession: (mode: string, noDistractions: boolean, durationMinutes?: number, taskFinished?: boolean, rating?: number, tags?: string[]) => void;
    habits: DailyHabit[];
    addHabit: (name: string, color: string) => void;
    toggleHabit: (id: string, date: string) => void;
    deleteHabit: (id: string) => void;
    events: CalendarEvent[];
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    deleteEvent: (id: string) => void;
    setDailyGoal: (minutes: number) => void;
    user: User | null;
}

// --- Helper Functions ---
const getToday = (timezone: string = 'auto', date: Date = new Date()) => {
    if (timezone === 'auto') return date.toLocaleDateString('en-CA');

    return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
};

const getYesterday = (timezone: string = 'auto') => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getToday(timezone, d);
};


// --- Context Definition ---
const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider = ({ children, timezone }: { children: ReactNode, timezone?: string }) => {
    const { user } = useCloudSync();

    // --- Stats Logic ---
    const [stats, setStats] = useState<FocusStats>(() => {
        const saved = localStorage.getItem('focus-stats');

        const defaultStats: FocusStats = {
            history: [],
            today: { date: getToday(timezone), score: 0, pomodoros: 0, deepWorkMinutes: 0, sessions: 0 },
            streaks: { current: 0, best: 0, lastActiveDate: '' },
            totalFocusMinutes: 0,
            dailyGoalMinutes: 240, // Default 4 hours
            level: 1
        };

        if (saved) {
            const parsed = JSON.parse(saved);
            let finalHistory: FocusSession[] = parsed.history || [];
            finalHistory.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            return { ...defaultStats, ...parsed, history: finalHistory };
        }

        return defaultStats;
    });

    // --- Habits Logic ---
    const [habits, setHabits] = useState<DailyHabit[]>(() => {
        const saved = localStorage.getItem('daily-habits');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) { return []; }
        }

        return [];
    });

    // --- Calendar Events Logic ---
    const [events, setEvents] = useState<CalendarEvent[]>(() => {
        const saved = localStorage.getItem('calendar-events');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) { return []; }
        }

        return [];
    });

    // --- Initial Cloud Load & Sync ---
    useEffect(() => {
        if (!user) return;

        const syncFromCloud = async () => {
            console.log("Cloud Sync: Initializing for", user.email);

            // 1. Cleanup old cloud data (30-day policy)
            await cleanupOldData(user.uid, 'sessions', 'date');
            await cleanupOldData(user.uid, 'events', 'date');

            // 2. Load Cloud Data
            const cloudSessions = await loadCollection(user.uid, 'sessions') as FocusSession[];
            const cloudHabits = await loadCollection(user.uid, 'habits') as DailyHabit[];
            const cloudEvents = await loadCollection(user.uid, 'events') as CalendarEvent[];

            // 3. Merge Logic (Cloud takes precedence for overlapping IDs)
            setStats(prev => {
                const mergedHistory = [...cloudSessions];
                // Add local sessions that aren't in cloud yet
                prev.history.forEach(local => {
                    if (!mergedHistory.find(c => c.id === local.id)) {
                        mergedHistory.push(local);
                        // Push new local data to cloud immediately
                        syncCollectionItem(user.uid, 'sessions', local.id, local);
                    }
                });
                mergedHistory.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

                // 30-Day Policy for local state too
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
                const cleanHistory = mergedHistory.filter(s => s.date >= thirtyDaysAgoStr);

                return { ...prev, history: cleanHistory };
            });

            setHabits(prev => {
                const merged = [...cloudHabits];
                prev.forEach(local => {
                    if (!merged.find(c => c.id === local.id)) {
                        merged.push(local);
                        syncCollectionItem(user.uid, 'habits', local.id, local);
                    }
                });
                return merged;
            });

            setEvents(prev => {
                const merged = [...cloudEvents];
                prev.forEach(local => {
                    if (!merged.find(c => c.id === local.id)) {
                        merged.push(local);
                        syncCollectionItem(user.uid, 'events', local.id, local);
                    }
                });

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
                return merged.filter(e => e.date >= thirtyDaysAgoStr);
            });
        };

        syncFromCloud();
    }, [user]);

    // --- Gamification Logic ---
    const { awardXP } = useGamification();

    // Daily Reset & Local Cleanup Logic
    useEffect(() => {
        const today = getToday(timezone);
        const yesterday = getYesterday(timezone);

        // 1. Handle Daily Reset & Streak Decay
        if (stats.today.date !== today) {
            setStats(prev => {
                const lastActive = prev.streaks.lastActiveDate;
                const isStreakBroken = lastActive !== today && lastActive !== yesterday && lastActive !== '';

                return {
                    ...prev,
                    today: { date: today, score: 0, pomodoros: 0, deepWorkMinutes: 0, sessions: 0 },
                    streaks: {
                        ...prev.streaks,
                        current: isStreakBroken ? 0 : prev.streaks.current
                    }
                };
            });
        }

        // 2. Perform Local Cleanup (30-Day Retention)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        setStats(prev => {
            const cleanHistory = prev.history.filter(s => s.date >= thirtyDaysAgoStr);
            if (cleanHistory.length === prev.history.length) return prev;
            console.log(`Local Cleanup: Removed ${prev.history.length - cleanHistory.length} old sessions.`);
            return { ...prev, history: cleanHistory };
        });

        setEvents(prev => {
            const cleanEvents = prev.filter(e => e.date >= thirtyDaysAgoStr);
            if (cleanEvents.length === prev.length) return prev;
            console.log(`Local Cleanup: Removed ${prev.length - cleanEvents.length} old events.`);
            return cleanEvents;
        });

    }, [timezone]); // Sync on timezone change or mount

    // Persist Stats
    useEffect(() => {
        localStorage.setItem('focus-stats', JSON.stringify(stats));
    }, [stats]);

    // Persist Habits
    useEffect(() => {
        localStorage.setItem('daily-habits', JSON.stringify(habits));
    }, [habits]);

    // Persist Events
    useEffect(() => {
        localStorage.setItem('calendar-events', JSON.stringify(events));
    }, [events]);

    // Actions
    const addHabit = (name: string, color: string) => {
        const newHabit = {
            id: crypto.randomUUID(),
            name,
            color,
            completedDates: []
        };
        setHabits(prev => [...prev, newHabit]);
        if (user) syncCollectionItem(user.uid, 'habits', newHabit.id, newHabit);
    };

    const toggleHabit = (id: string, date: string) => {
        setHabits(prev => prev.map(h => {
            if (h.id === id) {
                const exists = h.completedDates.includes(date);
                const updatedHabit = {
                    ...h,
                    completedDates: exists
                        ? h.completedDates.filter(d => d !== date)
                        : [...h.completedDates, date]
                };
                if (user) syncCollectionItem(user.uid, 'habits', id, updatedHabit);
                return updatedHabit;
            }
            return h;
        }));
    };

    const deleteHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
        if (user) deleteCollectionItem(user.uid, 'habits', id);
    };

    const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
        const newEvent = { ...event, id: crypto.randomUUID() };
        setEvents(prev => [...prev, newEvent]);
        if (user) syncCollectionItem(user.uid, 'events', newEvent.id, newEvent);
    };

    const deleteEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        if (user) deleteCollectionItem(user.uid, 'events', id);
    };

    const calculateScore = (totalMinutes: number, goal: number) => {
        return Math.min(100, Math.round((totalMinutes / goal) * 100));
    };

    const recordSession = (mode: string, _noDistractions: boolean, durationMinutes: number = 0, _taskFinished: boolean = false, rating?: number, tags: string[] = []) => {
        const newSession: FocusSession = {
            id: crypto.randomUUID(),
            date: getToday(),
            startTime: new Date().toISOString(),
            durationMinutes,
            mode: mode as any,
            rating,
            tags
        };

        setStats(prev => {
            const isToday = prev.today.date === getToday();
            const currentToday = isToday ? prev.today : { date: getToday(), score: 0, pomodoros: 0, deepWorkMinutes: 0, sessions: 0 };

            const newPomodoros = currentToday.pomodoros + (mode === 'pomodoro' ? 1 : 0);
            const newDeepWorkMinutes = currentToday.deepWorkMinutes + (mode === 'deep_work' || mode === 'flow' ? durationMinutes : 0);
            const actualTotalMinsToday = (isToday ? prev.history.filter(s => s.date === getToday()).reduce((acc, s) => acc + s.durationMinutes, 0) : 0) + durationMinutes;

            let newStreak = prev.streaks.current;
            const lastActive = prev.streaks.lastActiveDate;
            const todayStr = getToday(timezone);
            const yesterdayStr = getYesterday(timezone);

            if (lastActive !== todayStr) {
                if (lastActive === yesterdayStr) {
                    newStreak += 1;
                } else {
                    newStreak = 1;
                }
            } else if (newStreak === 0) {
                // Handle edge case where streak is 0 but lastActive was somehow today
                newStreak = 1;
            }

            const updatedStats = {
                ...prev,
                history: [newSession, ...prev.history],
                today: {
                    ...currentToday,
                    pomodoros: newPomodoros,
                    deepWorkMinutes: newDeepWorkMinutes,
                    sessions: currentToday.sessions + 1,
                    score: calculateScore(actualTotalMinsToday, prev.dailyGoalMinutes)
                },
                streaks: {
                    current: newStreak,
                    best: Math.max(newStreak, prev.streaks.best),
                    lastActiveDate: getToday()
                },
                totalFocusMinutes: prev.totalFocusMinutes + durationMinutes
            };

            return updatedStats;
        });

        if (user) syncCollectionItem(user.uid, 'sessions', newSession.id, newSession);

        // --- Award XP based on achievements ---
        setStats(prev => {
            let totalXP = 0;
            const isFirstSessionToday = prev.today.sessions === 1; // already incremented above
            const actualTotalMinsToday = prev.history.filter(s => s.date === getToday()).reduce((acc, s) => acc + s.durationMinutes, 0);
            const goalProgress = (actualTotalMinsToday / prev.dailyGoalMinutes) * 100;
            const newStreak = prev.streaks.current;
            const wasStreakIncremented = prev.streaks.lastActiveDate === getToday();

            // 🔥 Streak XP
            if (wasStreakIncremented && isFirstSessionToday) {
                if (newStreak === 1) totalXP += 10;
                else if (newStreak <= 6) totalXP += 20;
                else totalXP += 30;

                if (newStreak === 7) totalXP += 100;
                else if (newStreak === 14) totalXP += 200;
                else if (newStreak === 30) totalXP += 500;

                if (newStreak > prev.streaks.best) totalXP += 50;
            }

            // 🎯 Daily Goal XP
            const previousProgress = ((actualTotalMinsToday - durationMinutes) / prev.dailyGoalMinutes) * 100;
            if (previousProgress < 50 && goalProgress >= 50) totalXP += 15;
            if (previousProgress < 75 && goalProgress >= 75) totalXP += 25;
            if (previousProgress < 100 && goalProgress >= 100) totalXP += 50;
            if (previousProgress < 125 && goalProgress >= 125) totalXP += 75;
            if (previousProgress < 150 && goalProgress >= 150) totalXP += 100;

            // 📊 Session Quality Bonuses
            if (isFirstSessionToday) totalXP += 10;
            if (mode === 'deep_work' || mode === 'flow') totalXP += 5;

            if (totalXP > 0) awardXP(totalXP);
            return prev;
        });
    };

    const setDailyGoal = (minutes: number) => {
        setStats(prev => {
            const actualTotalMinsToday = prev.history
                .filter(s => s.date === prev.today.date)
                .reduce((acc, s) => acc + s.durationMinutes, 0);

            return {
                ...prev,
                dailyGoalMinutes: minutes,
                today: {
                    ...prev.today,
                    score: calculateScore(actualTotalMinsToday, minutes)
                }
            };
        });
    };

    return (
        <HabitsContext.Provider value={{ stats, recordSession, habits, addHabit, toggleHabit, deleteHabit, events, addEvent, deleteEvent, setDailyGoal, user }}>
            {children}
        </HabitsContext.Provider>
    );
};

export const useHabits = () => {
    const context = useContext(HabitsContext);
    if (context === undefined) {
        throw new Error('useHabits must be used within a HabitsProvider');
    }
    return context;
};

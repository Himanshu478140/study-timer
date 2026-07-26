import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useGamification } from '../../components/Gamification/useGamification';

// --- Types ---
export interface FocusSession {
    id: string;
    date: string; // ISO Date String
    startTime: string; // ISO String
    durationMinutes: number;
    mode: 'pomodoro' | 'deep_work' | 'flow' | 'custom';
    rating?: number; // 1-5
    tags?: string[]; // e.g. "Distracted", "Flow State"
}

export interface DailyHabit {
    id: string;
    name: string;
    color: string; // Hex code or tailwind class
    completedDates: string[]; // List of ISO Date Strings
    icon?: string;
    goal?: string;
    frequency?: 'daily' | 'weekdays' | 'weekly' | 'custom';
    activeDays?: string[];
}

export interface CalendarEvent {
    id: string;
    date: string; // "YYYY-MM-DD"
    title: string;
    type: string; // "session" | "habit" | "custom"
    color: string;
}

export interface FocusStats {
    history: FocusSession[];
    today: {
        date: string;
        score: number; // 0-100 progress indicator
        pomodoros: number;
        deepWorkMinutes: number;
        sessions: number;
    };
    streaks: {
        current: number;
        best: number;
        lastActiveDate: string; // "YYYY-MM-DD"
    };
    totalFocusMinutes: number;
    dailyGoalMinutes: number;
    level: number;
}

interface HabitsContextType {
    stats: FocusStats;
    recordSession: (mode: string, noDistractions: boolean, durationMinutes?: number, taskFinished?: boolean, rating?: number, tags?: string[]) => void;
    habits: DailyHabit[];
    addHabit: (name: string, color: string, icon?: string, goal?: string, frequency?: 'daily' | 'weekdays' | 'weekly' | 'custom', activeDays?: string[]) => void;
    toggleHabit: (id: string, date: string) => void;
    deleteHabit: (id: string) => void;
    events: CalendarEvent[];
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    deleteEvent: (id: string) => void;
    setDailyGoal: (minutes: number) => void;
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
    // --- Stats Logic ---
    const [stats, setStats] = useState<FocusStats>(() => {
        const saved = localStorage.getItem('focus-stats');
        const savedGoal = localStorage.getItem('focus-daily-goal');
        const initialGoal = savedGoal ? parseInt(savedGoal, 10) : 240;

        const defaultStats: FocusStats = {
            history: [],
            today: { date: getToday(timezone), score: 0, pomodoros: 0, deepWorkMinutes: 0, sessions: 0 },
            streaks: { current: 0, best: 0, lastActiveDate: '' },
            totalFocusMinutes: 0,
            dailyGoalMinutes: initialGoal, // Use dedicated key
            level: 1
        };

        if (saved) {
            const parsed = JSON.parse(saved);
            let finalHistory: FocusSession[] = parsed.history || [];
            finalHistory.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            return {
                ...defaultStats,
                ...parsed,
                dailyGoalMinutes: initialGoal, // Enforce correct goal value on load
                history: finalHistory
            };
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

    // --- Gamification Logic ---
    const { awardXP } = useGamification();

    // Daily Reset & Local Cleanup Logic
    useEffect(() => {
        const today = getToday(timezone);
        const yesterday = getYesterday(timezone);

        // Check if day changed
        if (stats.today.date !== today) {
            setStats(prev => {
                // Determine streak reset
                let newStreak = prev.streaks.current;
                const lastActive = prev.streaks.lastActiveDate;

                if (lastActive !== today && lastActive !== yesterday) {
                    newStreak = 0; // Reset streak if active days missed
                }

                // 12-Month Data Retention Policy on local stats history
                const twelveMonthsAgo = new Date();
                twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
                const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split('T')[0];

                const cleanHistory = prev.history.filter(s => s.date >= twelveMonthsAgoStr);

                return {
                    ...prev,
                    history: cleanHistory,
                    today: { date: today, score: 0, pomodoros: 0, deepWorkMinutes: 0, sessions: 0 },
                    streaks: { ...prev.streaks, current: newStreak }
                };
            });

            // 12-Month Data Retention Policy on local calendar events
            setEvents(prev => {
                const twelveMonthsAgo = new Date();
                twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
                const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split('T')[0];

                return prev.filter(e => e.date >= twelveMonthsAgoStr);
            });
        }
    }, [timezone, stats.today.date]);

    // Persist to LocalStorage
    useEffect(() => {
        localStorage.setItem('focus-stats', JSON.stringify(stats));
    }, [stats]);

    useEffect(() => {
        localStorage.setItem('daily-habits', JSON.stringify(habits));
    }, [habits]);

    useEffect(() => {
        localStorage.setItem('calendar-events', JSON.stringify(events));
    }, [events]);

    const addHabit = (
        name: string,
        color: string,
        icon?: string,
        goal?: string,
        frequency?: 'daily' | 'weekdays' | 'weekly' | 'custom',
        activeDays?: string[]
    ) => {
        const newHabit: DailyHabit = {
            id: crypto.randomUUID(),
            name,
            color,
            completedDates: [],
            icon,
            goal,
            frequency,
            activeDays
        };
        setHabits(prev => [...prev, newHabit]);
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
                return updatedHabit;
            }
            return h;
        }));
    };

    const deleteHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
        const newEvent = { ...event, id: crypto.randomUUID() };
        setEvents(prev => [...prev, newEvent]);
    };

    const deleteEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
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

        // --- Award XP based on achievements ---
        setStats(prev => {
            let achievementXP = 0;
            const isFirstSessionToday = prev.today.sessions === 1;
            const actualTotalMinsToday = prev.history.filter(s => s.date === getToday()).reduce((acc, s) => acc + s.durationMinutes, 0);
            const goalProgress = (actualTotalMinsToday / prev.dailyGoalMinutes) * 100;
            const newStreak = prev.streaks.current;

            // 🔥 Streak XP
            if (isFirstSessionToday) {
                if (newStreak === 3) achievementXP += 30;
                else if (newStreak === 7) achievementXP += 100;
                else if (newStreak === 30) achievementXP += 500;
            }

            // 🎯 Daily Goal XP
            const previousProgress = ((actualTotalMinsToday - durationMinutes) / prev.dailyGoalMinutes) * 100;
            if (previousProgress < 100 && goalProgress >= 100) {
                achievementXP += 20;
            }

            // 🏆 One-time Achievements (Milestones) based on session count
            const sessionCount = prev.history.length;
            if (sessionCount === 1) {
                achievementXP += 50;
            } else if (sessionCount === 10) {
                achievementXP += 100;
            } else if (sessionCount === 100) {
                achievementXP += 500;
            }

            if (achievementXP > 0) {
                awardXP(achievementXP, 'achievement');
            }
            return prev;
        });
    };

    const setDailyGoal = (minutes: number) => {
        localStorage.setItem('focus-daily-goal', minutes.toString());
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
        <HabitsContext.Provider value={{ stats, recordSession, habits, addHabit, toggleHabit, deleteHabit, events, addEvent, deleteEvent, setDailyGoal }}>
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

import { useMemo } from 'react';
import type { DailyHabit } from '../../../../Offlinebackup/localstorage/HabitsContext';
import type { HabitStats } from '../types';

/**
 * Calculates current streak (days active), completion rate for today, and total active days.
 */
export const useHabitStats = (habits: DailyHabit[], today: string): HabitStats => {
    return useMemo(() => {
        let streak = 0;
        const d = new Date();
        for (let i = 0; i < 365; i++) {
            const dateStr = d.toISOString().split('T')[0];
            const anyDone = habits.some(h => h.completedDates.includes(dateStr));
            if (anyDone) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }

        const todayCompleted = habits.filter(h => h.completedDates.includes(today)).length;
        const completionRate = habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0;

        const allDates = new Set<string>();
        habits.forEach(h => h.completedDates.forEach((dateString: string) => allDates.add(dateString)));
        const totalDaysActive = allDates.size;

        return { streak, completionRate, totalDaysActive };
    }, [habits, today]);
};

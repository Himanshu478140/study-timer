import type { DailyHabit } from '../../../../Offlinebackup/localstorage/HabitsContext';
import type { HeatmapCell } from '../types';

/**
 * Calculates levels (0-4) for 11 rows x 16 columns (176 days) of habit completions to fill container.
 */
export const calculateHeatmapData = (habits: DailyHabit[]): HeatmapCell[] => {
    const cells: HeatmapCell[] = [];
    const now = new Date();
    const totalHabits = habits.length;

    const totalDays = 11 * 16; // 176 days

    for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const completedCount = habits.reduce((acc, h) =>
            acc + (h.completedDates.includes(dateStr) ? 1 : 0), 0
        );

        let level = 0;
        if (totalHabits > 0 && completedCount > 0) {
            const ratio = completedCount / totalHabits;
            if (ratio >= 0.75) level = 4;
            else if (ratio >= 0.50) level = 3;
            else if (ratio >= 0.25) level = 2;
            else level = 1;
        }

        cells.push({ date: dateStr, level, completedCount, totalHabits });
    }

    return cells;
};

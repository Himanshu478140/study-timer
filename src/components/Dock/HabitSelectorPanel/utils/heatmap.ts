import type { DailyHabit } from '../../../../Offlinebackup/localstorage/HabitsContext';
import type { HeatmapCell } from '../types';

/**
 * Calculates levels (0-4) for the last 84 days of habit completions.
 */
export const calculateHeatmapData = (habits: DailyHabit[]): HeatmapCell[] => {
    const cells: HeatmapCell[] = [];
    const now = new Date();

    for (let i = 83; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const completedCount = habits.reduce((acc, h) =>
            acc + (h.completedDates.includes(dateStr) ? 1 : 0), 0
        );

        let level = 0;
        if (completedCount >= 4) level = 4;
        else if (completedCount === 3) level = 3;
        else if (completedCount === 2) level = 2;
        else if (completedCount === 1) level = 1;

        cells.push({ date: dateStr, level });
    }

    return cells;
};

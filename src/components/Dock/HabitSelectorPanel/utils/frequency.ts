import type { DailyHabit } from '../../../../Offlinebackup/localstorage/HabitsContext';

/**
 * Returns a human-readable label for a habit's active days schedule.
 */
export const getHabitFrequencyLabel = (habit: DailyHabit): string => {
    const freq = habit.frequency ?? 'daily';
    const activeDays = habit.activeDays ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (freq === 'daily') return 'Daily';
    if (freq === 'weekdays') return 'Weekdays';
    if (freq === 'weekly') return 'Weekly';

    if (freq === 'custom') {
        const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const weekend = ['Sat', 'Sun'];

        const isAll = allDays.every(d => activeDays.includes(d));
        if (isAll) return 'Daily';

        const isWeekdaysOnly = weekdays.length === activeDays.length && weekdays.every(d => activeDays.includes(d));
        if (isWeekdaysOnly) return 'Weekdays';

        const isWeekendOnly = weekend.length === activeDays.length && weekend.every(d => activeDays.includes(d));
        if (isWeekendOnly) return 'Weekends';

        if (activeDays.length === 0) return 'None';

        const ordered = allDays.filter(d => activeDays.includes(d));
        return ordered.join(', ');
    }

    return 'Daily';
};

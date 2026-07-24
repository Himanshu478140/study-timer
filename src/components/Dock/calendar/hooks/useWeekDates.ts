import { useMemo } from 'react';

/**
 * Hook to calculate and memoize the 7 dates in a week (Sun - Sat) around a view date.
 */
export const useWeekDates = (viewDate: Date): Date[] => {
  return useMemo(() => {
    const curr = new Date(viewDate);
    const dayOfWeek = curr.getDay(); // 0 = Sun
    const firstDay = new Date(curr);
    firstDay.setDate(curr.getDate() - dayOfWeek);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [viewDate]);
};

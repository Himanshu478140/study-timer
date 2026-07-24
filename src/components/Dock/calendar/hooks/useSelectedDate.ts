import { useState, useMemo } from 'react';
import { formatDateString, getSelectedDateLabel } from '../utils/calendar';

/**
 * Hook to manage selected date state, view date (for pagination), and formatting derivations.
 */
export const useSelectedDate = () => {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const selectedDateStr = useMemo(() => {
    const d = selectedDate || viewDate;
    return formatDateString(d);
  }, [selectedDate, viewDate]);

  const selectedDayOfWeek = useMemo(() => {
    return (selectedDate || viewDate).getDay();
  }, [selectedDate, viewDate]);

  const selectedDateLabel = useMemo(() => {
    return getSelectedDateLabel(selectedDate || viewDate);
  }, [selectedDate, viewDate]);

  const handleNav = (direction: 'next' | 'prev') => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() + (direction === 'next' ? 7 : -7));
    setViewDate(newDate);
  };

  return {
    viewDate,
    setViewDate,
    selectedDate,
    setSelectedDate,
    selectedDateStr,
    selectedDayOfWeek,
    selectedDateLabel,
    handleNav
  };
};

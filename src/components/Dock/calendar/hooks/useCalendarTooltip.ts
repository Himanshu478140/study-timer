import React, { useState, useRef } from 'react';
import type { CalendarEvent } from '../utils/calendar';

/**
 * Hook to manage custom portal hover tooltips for calendar date cells.
 */
export const useCalendarTooltip = (getEventFn: (date: Date) => CalendarEvent | undefined) => {
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; event: CalendarEvent } | null>(null);
  const tooltipTimeout = useRef<any>(null);

  const handleMouseEnterNode = (e: React.MouseEvent, date: Date) => {
    const event = getEventFn(date);
    if (event) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);

      setTooltipData({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        event
      });
    }
  };

  const handleMouseLeaveNode = () => {
    tooltipTimeout.current = setTimeout(() => {
      setTooltipData(null);
    }, 100);
  };

  return {
    tooltipData,
    handleMouseEnterNode,
    handleMouseLeaveNode
  };
};

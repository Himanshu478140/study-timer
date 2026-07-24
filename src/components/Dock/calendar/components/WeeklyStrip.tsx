import React from 'react';
import type { CalendarEvent } from '../utils/calendar';

interface WeeklyStripProps {
  weekDates: Date[];
  selectedDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onMouseEnterNode: (e: React.MouseEvent, date: Date) => void;
  onMouseLeaveNode: () => void;
  resolveDate: (dateStr: string) => { status: string; effectiveColor: string; label: string };
}

export const WeeklyStrip = ({
  weekDates,
  selectedDate,
  events,
  onDateClick,
  onMouseEnterNode,
  onMouseLeaveNode,
  resolveDate
}: WeeklyStripProps) => {
  return (
    <div className="weekly-strip-container">
      {weekDates.map((date, i) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const localDateStr = `${yyyy}-${mm}-${dd}`;

        // Use standard local ISO representation in system CA format to match today's date accurately
        const todayLocalStr = new Date().toLocaleDateString('en-CA');
        const isToday = localDateStr === todayLocalStr;
        const cellKey = date.toISOString().split('T')[0];

        const event = events.find(e => e.date === cellKey);
        const isSelected = selectedDate && cellKey === selectedDate.toISOString().split('T')[0];

        const resolved = resolveDate(localDateStr);
        const hasStatus = resolved.effectiveColor !== 'transparent';
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

        return (
          <div
            key={i}
            className="calendar-date-cell"
            onClick={() => onDateClick(date)}
            style={{
              background: isSelected
                ? 'var(--color-accent)'
                : hasStatus
                  ? resolved.effectiveColor
                  : 'rgba(255, 255, 255, 0.04)',
              border: isToday
                ? '2px solid rgba(255, 255, 255, 0.6)'
                : isSelected
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
              boxShadow: isSelected
                ? '0 6px 16px rgba(var(--color-accent-rgb), 0.35)'
                : hasStatus
                  ? `0 4px 12px ${resolved.effectiveColor}66`
                  : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isSelected && !hasStatus) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }
              onMouseEnterNode(e, date);
            }}
            onMouseLeave={(e) => {
              if (!isSelected && !hasStatus) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }
              onMouseLeaveNode();
            }}
          >
            <span
              className="calendar-date-cell-label"
              style={{
                color: (isSelected || hasStatus) ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.45)'
              }}
            >
              {dayLabel}
            </span>

            <span
              className="calendar-date-cell-number"
              style={{
                fontWeight: (isSelected || isToday || hasStatus) ? 700 : 500,
                color: (isSelected || isToday || hasStatus) ? '#ffffff' : 'rgba(255, 255, 255, 0.85)'
              }}
            >
              {date.getDate()}
            </span>

            {/* Event or Attendance Status indicator dot */}
            {(event || (hasStatus && !isSelected)) && (
              <span style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: event ? (event.color || '#ffffff') : '#ffffff',
                opacity: 0.8,
                marginTop: '1px'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export interface CalendarEvent {
  date: string;
  title: string;
  time?: string;
  color?: string;
}

/**
 * Searches list of habit events for an event matching a specific Date object.
 */
export const getEvent = (date: Date, events: CalendarEvent[]): CalendarEvent | undefined => {
  const dateStr = date.toISOString().split('T')[0];
  return events.find(e => e.date === dateStr);
};

/**
 * Formats a Date object to YYYY-MM-DD local format string.
 */
export const formatDateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Returns a short, user-friendly label for a selected date (e.g. Mon, Jul 19).
 */
export const getSelectedDateLabel = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

import type { TimetableSubject } from '../attendanceBlueprint';

/**
 * Formats a start and end date string (YYYY-MM-DD) into a localized range representation.
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startD = new Date(startDate + 'T00:00:00');
  const endD = new Date(endDate + 'T00:00:00');
  return startD.getTime() === endD.getTime()
    ? startD.toLocaleDateString('en-US', options)
    : `${startD.toLocaleDateString('en-US', options)} – ${endD.toLocaleDateString('en-US', options)}`;
};

/**
 * Default color palette for subjects.
 */
export const SUBJECT_COLORS = [
  '#8b5cf6', 
  '#ec4899', 
  '#3b82f6', 
  '#10b981', 
  '#f59e0b', 
  '#06b6d4'
];

/**
 * Filter subjects that are active on a specific day of the week.
 */
export const getActiveSubjects = (
  subjects: TimetableSubject[] | undefined,
  dayOfWeek: number
): TimetableSubject[] => {
  if (subjects && subjects.length > 0) {
    return subjects.filter(s => s.days.includes(dayOfWeek as any));
  }
  return [];
};


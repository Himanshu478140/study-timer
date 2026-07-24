import type { DayOfWeek } from '../attendanceBlueprint';

export const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' }
];

export const EVENT_TYPE_EMOJIS = {
  break: '🏖️',
  holiday: '🎉',
  exam: '📝',
  internship: '🏢',
  other: '📅'
} as const;

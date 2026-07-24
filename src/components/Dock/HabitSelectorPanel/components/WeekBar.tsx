import { Zap, Check } from 'lucide-react';
import type { WeekDayInfo } from '../types';

interface WeekBarProps {
    weekDays: WeekDayInfo[];
    isDayFullyCompleted: (dateStr: string) => boolean;
    isDayPartiallyCompleted: (dateStr: string) => boolean;
}

export const WeekBar = ({ weekDays, isDayFullyCompleted, isDayPartiallyCompleted }: WeekBarProps) => {
    return (
        <nav className="ht-day-bar" aria-label="Week days">
            {weekDays.map(day => {
                const fullyDone = isDayFullyCompleted(day.dateStr);
                const partiallyDone = isDayPartiallyCompleted(day.dateStr);

                return (
                    <div
                        key={day.dateStr}
                        className={`ht-day-item ${day.isToday ? 'ht-day-item--today' : ''} ${partiallyDone ? 'ht-day-item--completed' : ''}`}
                        tabIndex={0}
                        aria-label={`${day.dayName}${day.isToday ? ' (today)' : ''}${fullyDone ? ' - all habits complete' : ''}`}
                    >
                        <span className="ht-day-item__label">{day.dayName}</span>
                        <span className="ht-day-item__icon">
                            {day.isToday ? (
                                <Zap size={11} strokeWidth={2.5} />
                            ) : fullyDone ? (
                                <Check size={11} strokeWidth={3} />
                            ) : partiallyDone ? (
                                <Check size={9} strokeWidth={2} style={{ opacity: 0.5 }} />
                            ) : null}
                        </span>
                    </div>
                );
            })}
        </nav>
    );
};

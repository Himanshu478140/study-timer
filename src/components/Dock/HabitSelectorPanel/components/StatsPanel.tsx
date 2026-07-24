import { Flame, RefreshCw, CalendarDays } from 'lucide-react';
import type { HabitStats } from '../types';

interface StatsPanelProps {
    stats: HabitStats;
}

export const StatsPanel = ({ stats }: StatsPanelProps) => {
    return (
        <div className="ht-stats-column" role="group" aria-label="Habit statistics">
            <article className="ht-stat-card">
                <span className="ht-stat-card__label">Current Streak</span>
                <span className="ht-stat-card__value">{stats.streak} Days</span>
                <span className="ht-stat-card__icon"><Flame size={16} /></span>
            </article>
            <article className="ht-stat-card">
                <span className="ht-stat-card__label">Completion Rate</span>
                <span className="ht-stat-card__value">{stats.completionRate}%</span>
                <span className="ht-stat-card__icon"><RefreshCw size={14} /></span>
            </article>
            <article className="ht-stat-card">
                <span className="ht-stat-card__label">Total Days Active</span>
                <span className="ht-stat-card__value">{stats.totalDaysActive}</span>
                <span className="ht-stat-card__icon"><CalendarDays size={14} /></span>
            </article>
        </div>
    );
};

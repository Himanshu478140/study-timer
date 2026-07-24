import { Trash2, Check } from 'lucide-react';
import type { DailyHabit } from '../../../../Offlinebackup/localstorage/HabitsContext';
import { getHabitFrequencyLabel } from '../utils/frequency';

interface HabitCardProps {
    habit: DailyHabit;
    icon: string;
    isDone: boolean;
    onToggle: () => void;
    onDelete: () => void;
}

export const HabitCard = ({ habit, icon, isDone, onToggle, onDelete }: HabitCardProps) => {
    return (
        <article className="ht-habit-card">
            {/* Delete button (appears on hover) */}
            <button
                className="ht-habit-card__delete"
                onClick={onDelete}
                aria-label={`Delete ${habit.name}`}
            >
                <Trash2 size={10} />
            </button>

            {/* Icon */}
            <div
                className="ht-habit-card__icon"
                style={{ background: `${habit.color}25` }}
            >
                {icon}
            </div>

            {/* Info */}
            <div className="ht-habit-card__info">
                <span className="ht-habit-card__name">{habit.name}</span>
                <span className="ht-habit-card__meta">
                    {getHabitFrequencyLabel(habit)}
                    {habit.goal ? ` • ${habit.goal}` : ''}
                </span>
            </div>

            {/* Toggle */}
            <button
                className={`ht-habit-toggle ${isDone ? 'ht-habit-toggle--done' : ''}`}
                onClick={onToggle}
                aria-label={`Mark ${habit.name} as ${isDone ? 'incomplete' : 'complete'}`}
                aria-pressed={isDone}
            >
                {isDone && <Check size={14} color="white" strokeWidth={3} />}
            </button>
        </article>
    );
};

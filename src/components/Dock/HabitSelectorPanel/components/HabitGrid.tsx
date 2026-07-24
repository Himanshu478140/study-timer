import type { DailyHabit } from '../../../../Offlinebackup/localstorage/HabitsContext';
import { HabitCard } from './HabitCard';
import { HABIT_ICONS } from '../utils/constants';

interface HabitGridProps {
    habits: DailyHabit[];
    today: string;
    onToggleHabit: (habitId: string) => void;
    onDeleteHabit: (habitId: string) => void;
}

export const HabitGrid = ({ habits, today, onToggleHabit, onDeleteHabit }: HabitGridProps) => {
    return (
        <div className="ht-habits-grid">
            {habits.map((habit, index) => {
                const isDone = habit.completedDates.includes(today);
                const icon = habit.icon ?? HABIT_ICONS[index % HABIT_ICONS.length];

                return (
                    <HabitCard
                        key={habit.id}
                        habit={habit}
                        icon={icon}
                        isDone={isDone}
                        onToggle={() => onToggleHabit(habit.id)}
                        onDelete={() => onDeleteHabit(habit.id)}
                    />
                );
            })}
        </div>
    );
};

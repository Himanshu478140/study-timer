import { useHabits } from '../../../Offlinebackup/localstorage/HabitsContext';
import { HabitCard } from '../../Dock/HabitSelectorPanel/components/HabitCard';
import { HABIT_ICONS } from '../../Dock/HabitSelectorPanel/utils/constants';
import { CircleCheckBig } from 'lucide-react';

export const HabitMonthlyHeatmaps = () => {
    const { habits } = useHabits();

    if (habits.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', marginTop: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, opacity: 0.9, textAlign: 'left' }}>
                    Individual Habit Heatmaps
                </h3>
                <div style={{ padding: '2rem 1rem', opacity: 0.4, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <CircleCheckBig size={32} opacity={0.2} />
                    <span>No habits tracked yet.</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        Create habits in the Habit Tracker panel to see their heatmaps.
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, opacity: 0.9 }}>
                Individual Habit Heatmaps
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1rem'
            }}>
                {habits.map((habit, index) => {
                    const icon = habit.icon ?? HABIT_ICONS[index % HABIT_ICONS.length];

                    return (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            icon={icon}
                            readOnly={true}
                        />
                    );
                })}
            </div>
        </div>
    );
};

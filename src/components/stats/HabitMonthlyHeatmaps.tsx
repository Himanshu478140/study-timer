import { useMemo } from 'react';
import { useHabits } from '../../hooks/useHabits';
import { CircleCheckBig } from 'lucide-react';

const FALLBACK_ICONS = ['🧘', '📖', '💧', '🏃', '✍️', '🎯', '💪', '🧠', '🎨', '🌿'];

export const HabitMonthlyHeatmaps = () => {
    const { habits } = useHabits();

    const getColors = (colorStr: string) => {
        if (colorStr.startsWith('var(')) {
            return {
                active: colorStr,
                inactive: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.08)',
                badgeBg: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.12)',
                text: 'var(--color-accent)'
            };
        } else if (colorStr.startsWith('#')) {
            return {
                active: colorStr,
                inactive: `${colorStr}15`,
                badgeBg: `${colorStr}25`,
                text: colorStr
            };
        } else {
            return {
                active: 'var(--color-accent)',
                inactive: 'rgba(255, 255, 255, 0.04)',
                badgeBg: 'rgba(255, 255, 255, 0.08)',
                text: 'var(--color-accent)'
            };
        }
    };

    // Generate 30 days cell dates (sliding window)
    const dates = useMemo(() => {
        const list: { dateStr: string; label: string }[] = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            list.push({
                dateStr: d.toISOString().split('T')[0],
                label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            });
        }
        return list;
    }, []);

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
                        Create habits in the Habit Tracker panel to see their monthly heatmaps.
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <style>{`
                .habit-heatmap-cell {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: 4px;
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, box-shadow 0.2s ease;
                    cursor: pointer;
                }
                .habit-heatmap-cell:hover {
                    transform: scale(1.18);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                    z-index: 10;
                }
                @media (prefers-reduced-motion: reduce) {
                    .habit-heatmap-cell {
                        transition: none !important;
                    }
                    .habit-heatmap-cell:hover {
                        transform: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, opacity: 0.9 }}>
                Individual Habit Heatmaps
            </h3>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
            }}>
                {habits.map((habit, index) => {
                    const icon = habit.icon ?? FALLBACK_ICONS[index % FALLBACK_ICONS.length];
                    const colors = getColors(habit.color);

                    // Calculate stats
                    const completedDaysCount = dates.filter(d => habit.completedDates.includes(d.dateStr)).length;
                    const completionRate = Math.round((completedDaysCount / 30) * 100);

                    return (
                        <div
                            key={habit.id}
                            className="glass-panel"
                            style={{
                                padding: '1.25rem',
                                borderRadius: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.85rem',
                                transition: 'transform 0.2s ease',
                                background: 'rgba(18, 18, 22, 0.8)'
                            }}
                        >
                            {/* Habit Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                    <div style={{
                                        width: '2rem',
                                        height: '2rem',
                                        borderRadius: '50%',
                                        background: colors.inactive,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        flexShrink: 0
                                    }}>
                                        {icon}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {habit.name}
                                        </span>
                                        {habit.goal && (
                                            <span style={{ fontSize: '0.7rem', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                Target: {habit.goal}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    background: colors.badgeBg,
                                    color: colors.text,
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    <span>{completedDaysCount}/30d</span>
                                    <span style={{ opacity: 0.6 }}>•</span>
                                    <span>{completionRate}%</span>
                                </div>
                            </div>

                            {/* Monthly Heatmap Timeline Strip */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(10, 1fr)',
                                    gap: '6px',
                                    width: '100%'
                                }}>
                                    {dates.map((d, i) => {
                                        const isCompleted = habit.completedDates.includes(d.dateStr);
                                        return (
                                            <div
                                                key={i}
                                                className="habit-heatmap-cell"
                                                title={`${d.label}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                                                style={{
                                                    background: isCompleted ? colors.active : colors.inactive,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', opacity: 0.4, padding: '0 2px', marginTop: '2px' }}>
                                    <span>30 days ago</span>
                                    <span>Today</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

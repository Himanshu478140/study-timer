import { useMemo } from 'react';
import { useHabits } from '../../../Offlinebackup/localstorage/HabitsContext';

interface ConsistencyHeatmapProps {
    history: any[]; // accepted to prevent compilation error in caller
}

export const ConsistencyHeatmap = ({ history: _history }: ConsistencyHeatmapProps) => {
    const { habits } = useHabits();

    const heatmapData = useMemo(() => {
        const cells: { date: string; level: number; completedCount: number; totalHabits: number }[] = [];
        const now = new Date();
        const totalHabits = habits.length;

        for (let i = 181; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const completedCount = habits.reduce((acc: number, h: any) =>
                acc + (h.completedDates.includes(dateStr) ? 1 : 0), 0
            );

            let level = 0;
            if (totalHabits > 0 && completedCount > 0) {
                const ratio = completedCount / totalHabits;
                if (ratio >= 0.75) level = 4;
                else if (ratio >= 0.50) level = 3;
                else if (ratio >= 0.25) level = 2;
                else level = 1;
            }

            cells.push({ date: dateStr, level, completedCount, totalHabits });
        }

        return cells;
    }, [habits]);

    const getIntensityColor = (level: number) => {
        if (level === 0) return 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.08)';
        if (level === 1) return 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.25)';
        if (level === 2) return 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.45)';
        if (level === 3) return 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.65)';
        return 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.9)';
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, opacity: 0.9 }}>6-Month Heatmap</h3>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem', opacity: 0.6 }}>
                    <span>Less</span>
                    <div style={{ width: 10, height: 10, background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.08)', borderRadius: 2 }}></div>
                    <div style={{ width: 10, height: 10, background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.25)', borderRadius: 2 }}></div>
                    <div style={{ width: 10, height: 10, background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.45)', borderRadius: 2 }}></div>
                    <div style={{ width: 10, height: 10, background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.65)', borderRadius: 2 }}></div>
                    <div style={{ width: 10, height: 10, background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.9)', borderRadius: 2 }}></div>
                    <span>More</span>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateRows: 'repeat(7, 1fr)',
                gridAutoFlow: 'column',
                gridAutoColumns: '1fr',
                gap: '4px',
                width: '100%'
            }}>
                {heatmapData.map((cell, i) => {
                    const pct = cell.totalHabits > 0 ? Math.round((cell.completedCount / cell.totalHabits) * 100) : 0;
                    const tooltip = cell.totalHabits > 0
                        ? `${cell.date}: ${cell.completedCount}/${cell.totalHabits} completed (${pct}%)`
                        : `${cell.date}: No habits tracked`;

                    return (
                        <div
                            key={i}
                            title={tooltip}
                            style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: '2px',
                                background: getIntensityColor(cell.level),
                                transition: 'background 0.15s ease',
                                cursor: 'pointer'
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

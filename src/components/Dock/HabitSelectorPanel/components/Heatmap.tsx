import type { HeatmapCell } from '../types';

interface HeatmapProps {
    heatmapData: HeatmapCell[];
}

export const Heatmap = ({ heatmapData }: HeatmapProps) => {
    return (
        <div className="ht-heatmap-container" aria-label="Activity heatmap">
            <header className="ht-heatmap-header">
                <h3 className="ht-heatmap-title">Heatmap</h3>
                <div className="ht-heatmap-legend">
                    <span>Less</span>
                    <span className="ht-heatmap-legend__cell" style={{ background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.08)' }} />
                    <span className="ht-heatmap-legend__cell" style={{ background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.25)' }} />
                    <span className="ht-heatmap-legend__cell" style={{ background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.5)' }} />
                    <span className="ht-heatmap-legend__cell" style={{ background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.9)' }} />
                    <span>More</span>
                </div>
            </header>
            <div className="ht-heatmap-grid" role="img" aria-label="Habit activity over the last 12 weeks">
                {heatmapData.map((cell, i) => {
                    const hasStats = cell.completedCount !== undefined && cell.totalHabits !== undefined && cell.totalHabits > 0;
                    const pct = hasStats ? Math.round((cell.completedCount! / cell.totalHabits!) * 100) : 0;
                    const titleText = hasStats
                        ? `${cell.date}: ${cell.completedCount}/${cell.totalHabits} completed (${pct}%)`
                        : `${cell.date}: Level ${cell.level}`;

                    return (
                        <div
                            key={i}
                            className={`ht-heatmap-cell ${cell.level > 0 ? `ht-heatmap-cell--l${cell.level}` : ''}`}
                            title={titleText}
                        />
                    );
                })}
            </div>
        </div>
    );
};

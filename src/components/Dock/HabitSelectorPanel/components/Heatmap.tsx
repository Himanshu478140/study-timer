import type { HeatmapCell } from '../types';

interface HeatmapProps {
    heatmapData: HeatmapCell[];
}

export const Heatmap = ({ heatmapData }: HeatmapProps) => {
    return (
        <div className="ht-heatmap-container" aria-label="Activity heatmap">
            <header className="ht-heatmap-header">
                <h3 className="ht-heatmap-title">Monthly Heatmap</h3>
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
                {heatmapData.map((cell, i) => (
                    <div
                        key={i}
                        className={`ht-heatmap-cell ${cell.level > 0 ? `ht-heatmap-cell--l${cell.level}` : ''}`}
                        title={`${cell.date}: ${cell.level} habit${cell.level !== 1 ? 's' : ''} completed`}
                    />
                ))}
            </div>
        </div>
    );
};

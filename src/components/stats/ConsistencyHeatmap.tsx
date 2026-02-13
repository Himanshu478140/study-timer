// import { Tooltip } from 'react-tooltip';

interface ConsistencyHeatmapProps {
    history: any[]; // FocusSession[]
}

export const ConsistencyHeatmap = ({ history }: ConsistencyHeatmapProps) => {
    // Generate last 28 days (4 weeks) for compact view, or 60 days
    const daysToShow = 28;
    const today = new Date();

    // Create map of date -> intensity
    const activityMap = new Map<string, number>();
    history.forEach(session => {
        const current = activityMap.get(session.date) || 0;
        // Simple intensity: 1 session = 1 point, Max ~5 points
        activityMap.set(session.date, current + 1);
    });

    const dates = Array.from({ length: daysToShow }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (daysToShow - 1 - i));
        return d.toISOString().split('T')[0];
    });

    const getIntensityColor = (count: number) => {
        if (count === 0) return 'rgba(255,255,255,0.05)';
        if (count < 2) return 'rgba(16, 185, 129, 0.3)'; // Low
        if (count < 4) return 'rgba(16, 185, 129, 0.6)'; // Medium
        return 'rgba(16, 185, 129, 1)'; // High
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', opacity: 0.9 }}>Value Consistency</h3>

            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {dates.map(date => {
                    const count = activityMap.get(date) || 0;
                    return (
                        <div
                            key={date}
                            title={`${date}: ${count} sessions`}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                background: getIntensityColor(count),
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                        />
                    );
                })}
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '4px', alignItems: 'center', fontSize: '0.7rem', opacity: 0.6 }}>
                <span>Less</span>
                <div style={{ width: 10, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}></div>
                <div style={{ width: 10, height: 10, background: 'rgba(16, 185, 129, 0.3)', borderRadius: 2 }}></div>
                <div style={{ width: 10, height: 10, background: 'rgba(16, 185, 129, 1)', borderRadius: 2 }}></div>
                <span>More</span>
            </div>
        </div>
    );
};

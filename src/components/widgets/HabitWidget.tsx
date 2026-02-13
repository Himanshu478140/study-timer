import { Zap } from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import { WeeklyTrendChart } from '../stats/WeeklyTrendChart';

export const HabitWidget = () => {
    const { stats } = useHabits();

    return (
        <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="widget-header" style={{ marginBottom: '0.5rem' }}>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <Zap size={16} color="#a78bfa" fill="#a78bfa" style={{ filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.4))' }} />
                    <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }} className="text-gradient-header">Performance</span>
                </div>
            </div>

            {/* Compact Metrics Row Removed */}

            {/* Weekly Trend Graph (Clamped) */}
            <div className="habit-graph" style={{
                flex: 1,
                width: '100%',
                minHeight: '80px', // Ensure visibility
                marginTop: 'auto',
                // Adjust strict margins to fit the graph cleanly without overflow
                marginBottom: '-10px',
                position: 'relative'
            }}>
                {/* Minimal Mode: No padding, no header */}
                <WeeklyTrendChart history={stats.history} minimal={true} />
            </div>
        </div>
    );
};

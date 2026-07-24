import { DailyProgressRing } from '../../layout/widgets/DailyProgressRing';
import { Target, Trophy } from 'lucide-react';
import type { FocusSession } from '../../../Offlinebackup/localstorage/HabitsContext';

interface FocusScorePanelProps {
    score: number;
    dailyGoal: number;
    history: FocusSession[];
}

export const FocusScorePanel = ({ score, dailyGoal, history }: FocusScorePanelProps) => {
    const totalMinutes = Math.round((score / 100) * dailyGoal);

    // Filter today's sessions from history
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = history.filter(s => s.date === today);

    // Determine status and descriptive message
    let status = "On Track";
    let statusColor = "#818cf8"; // Indigo
    let message = "Keep the momentum going!";

    if (score >= 100) {
        status = "Goal Hit!";
        statusColor = "#10b981"; // Emerald
        message = "Focus mastery achieved today! 🏆";
    } else if (score >= 80) {
        status = "Excellent";
        statusColor = "#10b981"; // Emerald
        message = "You're almost at your daily goal!";
    } else if (score < 40 && todaySessions.length > 0) {
        status = "Steady";
        statusColor = "#f97316"; // Orange
        message = "A good start. One more session?";
    } else if (score === 0) {
        status = "New Day";
        statusColor = "rgba(255,255,255,0.4)";
        message = "Start your first session of the day.";
    }

    return (
        <div className="glass-panel" style={{
            padding: '2rem',
            borderRadius: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem',
            // Mesh-like background with solid dark glass base for text readability, no blur
            background: 'radial-gradient(at top left, rgba(var(--color-accent-rgb), 0.12), transparent), rgba(18, 18, 22, 0.92)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '300px',
                height: '300px',
                background: `radial-gradient(circle, ${statusColor}11 0%, transparent 70%)`,
                pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', width: '100%' }}>
                {/* Main Score Ring Section */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <DailyProgressRing completed={totalMinutes} goal={dailyGoal} size={140} strokeWidth={10} showLabel={false} />
                    <div className="flex-center" style={{ position: 'absolute', inset: 0, flexDirection: 'column' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: 'white' }}>
                            {score}<span style={{ fontSize: '1rem', opacity: 0.5 }}>%</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div style={{ flex: 1, zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.4rem 0.8rem',
                            borderRadius: '2rem',
                            background: `${statusColor}15`,
                            color: statusColor,
                            border: `1px solid ${statusColor}33`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: score >= 100 ? `0 0 15px ${statusColor}33` : 'none'
                        }}>
                            {score >= 100 ? <Trophy size={11} /> : <Target size={11} />}
                            {status}
                        </span>
                        {score >= 100 && (
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>+120 XP Bonus</span>
                        )}
                    </div>

                    <h3 style={{ marginBottom: '0.25rem', fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                        {totalMinutes}m <span style={{ opacity: 0.3, fontSize: '1rem' }}>/ {dailyGoal}m</span>
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

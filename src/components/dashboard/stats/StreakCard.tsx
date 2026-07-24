import { Flame, Trophy } from 'lucide-react';

interface StreakCardProps {
    current: number;
    best: number;
}

export const StreakCard = ({ current, best }: StreakCardProps) => {
    const getMotivation = (streak: number) => {
        if (streak === 0) return "Start your journey today!";
        if (streak < 3) return "Great start! Keep it going.";
        if (streak < 7) return "You're on fire! 🔥";
        if (streak < 30) return "Unstoppable force! 🚀";
        return "Legendary Consistency! 👑";
    };

    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.08)), rgba(18, 18, 22, 0.92)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Flame color="#f97316" fill="#f97316" /> Streak
                </h3>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Trophy size={14} /> Best: {best}
                </div>
            </div>

            <div className="flex-center" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#f97316' }}>
                        {current}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Days Active</div>
                </div>

                <div style={{ textAlign: 'right', maxWidth: '140px' }}>
                    <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                        "{getMotivation(current)}"
                    </p>
                </div>
            </div>

            {/* Visual Progress Bar to next Milestone (e.g. 7 days) */}
            <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${Math.min((current % 7) / 7 * 100, 100)}%`,
                    background: '#f97316',
                    transition: 'width 1s ease'
                }}></div>
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', opacity: 0.5, textAlign: 'right' }}>
                Next Milestone: 7 Days
            </div>
        </div>
    );
};

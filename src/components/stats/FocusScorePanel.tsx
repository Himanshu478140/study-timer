import { useState } from 'react';
import { DailyProgressRing } from '../widgets/DailyProgressRing';
import { Target, Clock, Trophy, ChevronRight, ChevronDown, Zap } from 'lucide-react';
import type { FocusSession } from '../../context/HabitsContext';

interface FocusScorePanelProps {
    score: number;
    dailyGoal: number;
    history: FocusSession[];
}

export const FocusScorePanel = ({ score, dailyGoal, history }: FocusScorePanelProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

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
            // Mesh-like background
            background: 'radial-gradient(at top left, rgba(var(--color-accent-rgb), 0.1), transparent), radial-gradient(at bottom right, rgba(255,255,255,0.02), transparent)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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

                {/* Interactive Progress Arrow */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        alignSelf: 'stretch',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 0.5rem',
                        opacity: isExpanded ? 0.8 : 0.2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        color: isExpanded ? 'var(--color-accent)' : 'inherit'
                    }}
                >
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
            </div>

            {/* Detailed Breakdown Section */}
            {isExpanded && (
                <div style={{
                    marginTop: '-1rem',
                    padding: '1.5rem',
                    borderRadius: '1.5rem',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.4, letterSpacing: '0.1em', marginBottom: '1rem' }}>
                        Session History
                    </div>
                    {todaySessions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {todaySessions.map((session, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.6rem 1rem',
                                    borderRadius: '1rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.03)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: session.mode === 'deep_work' ? 'rgba(var(--color-accent-rgb), 0.1)' : 'rgba(255,255,255,0.05)',
                                            color: session.mode === 'deep_work' ? 'var(--color-accent)' : 'rgba(255,255,255,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {session.mode === 'deep_work' || session.mode === 'flow' ? <Zap size={14} /> : <Clock size={14} />}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', textTransform: 'capitalize' }}>
                                                {session.mode.replace('_', ' ')}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.4 }}>
                                                {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                                        +{session.durationMinutes}m
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.4, fontSize: '0.85rem' }}>
                            No sessions recorded yet today.
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

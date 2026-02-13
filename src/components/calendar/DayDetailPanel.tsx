import { X, Clock, Zap, Star, Target } from 'lucide-react';
import type { FocusSession } from '../../hooks/useHabits';

interface DailyStats {
    date: string;
    score: number;
    pomodoros: number;
    deepWorkMinutes: number;
    sessions: FocusSession[];
    goalMet: boolean;
}

interface DayDetailPanelProps {
    date: string;
    stats: DailyStats | null;
    onClose: () => void;
}

export const DayDetailPanel = ({ date, stats, onClose }: DayDetailPanelProps) => {
    // Format Date: "Mon, Jan 30"
    const dateObj = new Date(date);
    const dateDisplay = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // Calculate Efficiency
    const ratedSessions = stats?.sessions.filter(s => s.rating) || [];
    const avgRating = ratedSessions.length > 0
        ? (ratedSessions.reduce((acc, s) => acc + (s.rating || 0), 0) / ratedSessions.length).toFixed(1)
        : '-';

    // Format Time
    const totalMinutes = stats?.deepWorkMinutes || 0;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            background: 'rgba(20, 20, 30, 0.95)', // High contrast backdrop
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{dateDisplay}</h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: 0 }}>Daily Report</p>
                </div>
                <button
                    onClick={onClose}
                    className="icon-btn-hover"
                    style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%', color: '#fff' }}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Empty State */}
            {!stats || stats.sessions.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💤</div>
                    <p>No focus activity recorded.</p>
                </div>
            ) : (
                <>
                    {/* Key Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {/* Score */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.25rem' }}>
                                <Zap size={12} color="#fbbf24" /> Focus Score
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stats.score >= 80 ? '#4ade80' : '#fff' }}>
                                {stats.score}
                            </div>
                        </div>

                        {/* Efficiency */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.25rem' }}>
                                <Star size={12} color="#a78bfa" /> Efficiency
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a78bfa' }}>
                                {avgRating} <span style={{ fontSize: '1rem', opacity: 0.5 }}>★</span>
                            </div>
                        </div>

                        {/* Time */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1rem', gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.25rem' }}>
                                    <Clock size={12} color="#60a5fa" /> Total Focus Time
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>
                                    {timeDisplay}
                                </div>
                            </div>
                            {stats.goalMet && (
                                <div style={{ padding: '0.5rem 1rem', background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', borderRadius: '2rem', fontSize: '0.75rem', border: '1px solid rgba(74, 222, 128, 0.3)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <Target size={12} />
                                    Goal Met
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Session List */}
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', opacity: 0.8 }}>Sessions</h3>
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {stats.sessions.map((session) => (
                                <div key={session.id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '0.5rem',
                                    padding: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderLeft: `2px solid ${session.mode === 'deep_work' ? '#8b5cf6' : '#ec4899'}`
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                            {session.mode === 'flow' ? 'Flow State' : session.mode === 'pomodoro' ? 'Pomodoro' : 'Deep Work'}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                            {session.durationMinutes}m
                                        </div>
                                        {session.rating && (
                                            <div style={{ fontSize: '0.7rem', color: '#fbbf24' }}>
                                                {'★'.repeat(session.rating)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

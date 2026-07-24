import { useMemo } from 'react';
import { History, Brain, Flame, Coffee, Sliders, Star, Tag, Clock } from 'lucide-react';
import type { FocusSession } from '../../../Offlinebackup/localstorage/HabitsContext';

interface SessionHistoryCardProps {
    history: FocusSession[];
}

export const SessionHistoryCard = ({ history }: SessionHistoryCardProps) => {
    const recentHistory = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return history.filter(session => new Date(session.startTime) >= sevenDaysAgo);
    }, [history]);

    // Helper: format duration in minutes to h/m
    const formatDuration = (minutes: number) => {
        if (!minutes) return '0m';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // Helper: format ISO date to readable string
    const formatSessionDate = (startTimeStr: string) => {
        try {
            const date = new Date(startTimeStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Recent Session';
        }
    };

    const getModeLabel = (mode: string) => {
        switch (mode) {
            case 'pomodoro': return 'Pomodoro Focus';
            case 'deep_work': return 'Deep Work';
            case 'flow': return '52/17 Flow';
            case 'custom': return 'Custom Session';
            default: return 'Focus Session';
        }
    };

    const getModeConfig = (mode: string) => {
        switch (mode) {
            case 'pomodoro':
                return {
                    icon: <Brain size={18} />,
                    color: '#f97316',
                    bg: 'rgba(249, 115, 22, 0.1)',
                    border: 'rgba(249, 115, 22, 0.2)'
                };
            case 'deep_work':
                return {
                    icon: <Flame size={18} />,
                    color: '#3b82f6',
                    bg: 'rgba(59, 130, 246, 0.1)',
                    border: 'rgba(59, 130, 246, 0.2)'
                };
            case 'flow':
                return {
                    icon: <Coffee size={18} />,
                    color: '#22c55e',
                    bg: 'rgba(34, 197, 94, 0.1)',
                    border: 'rgba(34, 197, 94, 0.2)'
                };
            case 'custom':
            default:
                return {
                    icon: <Sliders size={18} />,
                    color: '#a855f7',
                    bg: 'rgba(168, 85, 247, 0.1)',
                    border: 'rgba(168, 85, 247, 0.2)'
                };
        }
    };

    return (
        <section aria-labelledby="session-history-title" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'rgba(var(--color-accent-rgb), 0.1)',
                        padding: '0.5rem',
                        borderRadius: '0.625rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <History size={20} color="var(--color-accent)" />
                    </div>
                    <div>
                        <h2 id="session-history-title" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Session History</h2>
                        <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Log of completed focus sessions (last 7 days)</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.375rem 0.75rem', borderRadius: '0.625rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{recentHistory.length}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>Days</span>
                </div>
            </div>

            <div className="widget-daily-tasks-container" style={{
                background: 'rgba(18, 18, 22, 0.85)',
                borderRadius: '1rem',
                border: '1px solid var(--color-glass-border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'background var(--transition-theme), border-color var(--transition-theme)'
            }}>
                <div className="custom-scrollbar" style={{
                    maxHeight: '350px',
                    overflowY: 'auto',
                    padding: '1.25rem'
                }}>
                    {recentHistory.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentHistory.map((session, index) => {
                                const cfg = getModeConfig(session.mode);
                                return (
                                    <div
                                        key={session.id || index}
                                        style={{
                                            borderBottom: index === recentHistory.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                                            paddingBottom: index === recentHistory.length - 1 ? '0' : '1rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                maxWidth: '70%'
                                            }}>
                                                <div style={{
                                                    background: cfg.bg,
                                                    border: `1px solid ${cfg.border}`,
                                                    color: cfg.color,
                                                    width: '2.25rem',
                                                    height: '2.25rem',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    {cfg.icon}
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.125rem',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: 600,
                                                        color: '#fff',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {getModeLabel(session.mode)}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock size={10} />
                                                        {formatSessionDate(session.startTime)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                gap: '0.25rem'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: '#fff',
                                                    fontFamily: 'var(--font-mono, monospace)',
                                                    background: 'rgba(255,255,255,0.08)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '0.375rem',
                                                    fontWeight: 600
                                                }}>
                                                    {formatDuration(session.durationMinutes)}
                                                </div>
                                                {session.rating && (
                                                    <div style={{ display: 'flex', gap: '1px' }}>
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={10}
                                                                color={i < (session.rating || 0) ? '#eab308' : 'rgba(255,255,255,0.15)'}
                                                                fill={i < (session.rating || 0) ? '#eab308' : 'transparent'}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {session.tags && session.tags.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', paddingLeft: '3rem' }}>
                                                {session.tags.map((tag: string, tIdx: number) => (
                                                    <div
                                                        key={tIdx}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            fontSize: '0.65rem',
                                                            background: 'rgba(var(--color-accent-rgb), 0.08)',
                                                            border: '1px solid rgba(var(--color-accent-rgb), 0.15)',
                                                            color: 'var(--color-accent)',
                                                            padding: '0.125rem 0.375rem',
                                                            borderRadius: '0.25rem',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        <Tag size={8} />
                                                        {tag}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '2.5rem 1rem',
                            opacity: 0.4,
                            fontSize: '0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <History size={32} opacity={0.2} />
                            <span>No completed sessions in the last 7 days.</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

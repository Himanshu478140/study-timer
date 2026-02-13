import { useFocusTask } from '../../hooks/useFocusTask';
import { CheckCircle2 } from 'lucide-react';

export const DailyTaskStats = () => {
    const { allTasks } = useFocusTask();

    // Helper: format duration in ms to h/m
    const formatDuration = (ms: number | undefined) => {
        if (!ms) return '0m';
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    // --- CALCULATE WEEKLY STATS (Last 7 Days) ---
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const completedWeekly = allTasks.filter((t: any) => {
        if (!t.completed || !t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate >= sevenDaysAgo;
    }).sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .map((t: any) => ({
            text: t.text,
            timeSpent: t.timeSpent || 0,
            date: new Date(t.completedAt)
        }));

    return (
        <div className="daily-task-stats-block" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'rgba(74, 222, 128, 0.1)',
                        padding: '8px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle2 size={20} color="#4ade80" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weekly Tasks</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Last 7 days of focus items</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', background: 'rgba(255, 255, 255, 0.08)', padding: '6px 12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{completedWeekly.length}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>Done</span>
                </div>
            </div>

            <div className="widget-daily-tasks-container" style={{
                background: 'rgba(var(--color-accent-rgb), 0.03)',
                borderRadius: '16px',
                border: '1px solid var(--color-glass-border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'background var(--transition-theme), border-color var(--transition-theme)'
            }}>
                <div className="custom-scrollbar widget-daily-tasks" style={{
                    maxHeight: '300px',
                    padding: '1.25rem'
                }}>
                    {completedWeekly.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {completedWeekly.map((t, i) => (
                                <div key={i} className="widget-daily-task-item" style={{
                                    borderBottom: i === completedWeekly.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                                    alignItems: 'center' // Better vertical alignment
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px',
                                        maxWidth: '75%'
                                    }}>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            fontWeight: 500,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: '#fff'
                                        }}>
                                            {t.text}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
                                            {t.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: '#fff',
                                        fontFamily: 'var(--font-mono, monospace)',
                                        background: 'rgba(255,255,255,0.15)',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        opacity: 0.9
                                    }}>
                                        {formatDuration(t.timeSpent)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem 1rem',
                            opacity: 0.4,
                            fontSize: '0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <CheckCircle2 size={32} opacity={0.2} />
                            <span>No tasks completed in the last 7 days.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

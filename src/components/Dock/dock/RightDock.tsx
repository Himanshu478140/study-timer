import React from 'react';
import { Trophy, Brain, Clock, Coffee, Sliders, User as UserIcon, Settings } from 'lucide-react';
import { DailyProgressRing } from '../../layout/widgets/DailyProgressRing';
import { SessionRing } from '../../layout/widgets/SessionRing';
import { formatXP } from '../../Gamification/formatXP';
import { type AppMode } from '../AppModes/GlobalModeSwitcher';
import { type FocusMode } from '../../timer/ModeSelectorPanel';

interface RightDockProps {
    isFocusActive: boolean;
    appMode: AppMode;
    stats: any;
    setDashboardTab: (tab: any) => void;
    setIsDashboardOpen: (open: boolean) => void;
    level: number;
    xp: number;
    completedSessionsToday: number;
    completedModes: string[];
    mode: FocusMode;
    avatarRef: React.RefObject<HTMLDivElement | null>;
    isDockExpanded: boolean;
    setIsDockExpanded: (expanded: boolean) => void;
    customAvatar: string | null;
}

export const RightDock = ({
    isFocusActive,
    appMode,
    stats,
    setDashboardTab,
    setIsDashboardOpen,
    level,
    xp,
    completedSessionsToday,
    completedModes,
    mode,
    avatarRef,
    isDockExpanded,
    setIsDockExpanded,
    customAvatar
}: RightDockProps) => {
    return (
        <>
            {/* Right Vertical Dock — Collapsible */}
            <div
                className="vdock-group shifting-vdock"
                style={{
                    opacity: (isFocusActive || appMode === 'zen') ? 0 : 1,
                    visibility: (isFocusActive || appMode === 'zen') ? 'hidden' : 'visible',
                    transition: 'opacity 0.4s ease, visibility 0.4s ease, top 0.5s ease, bottom 0.5s ease, right 0.5s ease, transform 0.5s ease',
                    zIndex: 101,
                }}
            >
                {/* Horizontal wrapper for Stats Bar and the vdock avatar button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {appMode !== 'home' && (
                        <nav
                            className="stitch-stats-bar"
                            onClick={() => { setDashboardTab('stats'); setIsDashboardOpen(true); }}
                            style={{
                                display: 'flex',
                                gap: '1.25rem',
                                alignItems: 'center',
                                cursor: 'pointer',
                                background: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'none',
                                WebkitBackdropFilter: 'none',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '1.25rem',
                                padding: '0 1.25rem',
                                height: '3.5rem',
                                boxSizing: 'border-box',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                                color: 'var(--color-text-secondary)',
                                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label="Open Dashboard"
                        >
                            {/* Daily Progress */}
                            <div className="flex-center" style={{ gap: '0.5rem' }}>
                                <DailyProgressRing completed={stats.today.score} goal={100} />
                            </div>

                            {/* Level & XP */}
                            <div className="flex-center" style={{ gap: '0.5rem', whiteSpace: 'nowrap' }}>
                                <Trophy size={20} color="var(--color-accent)" />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.1 }}>LEVEL {level}</span>
                                    <span style={{ fontSize: '0.55rem', opacity: 0.65, lineHeight: 1.1 }}>{formatXP(xp)}</span>
                                </div>
                            </div>

                            {/* Focus Mode Icon & Label — wrapped in SessionRing */}
                            <SessionRing currentSession={completedSessionsToday} totalSessions={4} mode={mode} completedModes={completedModes}>
                                <div
                                    className="flex-center"
                                    title="Current Focus Mode"
                                >
                                    {(() => {
                                        const config = {
                                            deep_work: { icon: <Brain size={18} />, color: '#a855f7', label: 'Deep Work' },
                                            pomodoro: { icon: <Clock size={18} />, color: '#ef4444', label: 'Pomodoro' },
                                            flow: { icon: <Coffee size={18} />, color: '#3b82f6', label: '52/17' },
                                            custom: { icon: <Sliders size={18} />, color: '#22c55e', label: 'Custom' }
                                        }[mode] || { icon: <Brain size={18} />, color: '#a855f7', label: 'Deep Work' };

                                        return (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '2rem',
                                                height: '2rem',
                                                borderRadius: '0.5rem',
                                                background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
                                                color: '#ffffff',
                                                boxShadow: `0 4px 12px ${config.color}40`,
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}>
                                                {config.icon}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </SessionRing>
                        </nav>
                    )}

                    {/* Avatar Button — always visible, toggles right-side Control Center panel */}
                    <div
                        ref={appMode === 'zen' ? null : avatarRef}
                        className={`vdock-avatar ${isDockExpanded ? 'expanded' : ''}`}
                        onClick={() => setIsDockExpanded(!isDockExpanded)}
                        role="button"
                        tabIndex={0}
                        aria-label={isDockExpanded ? 'Close Control Center' : 'Open Control Center'}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsDockExpanded(!isDockExpanded); } }}
                    >
                        {customAvatar ? (
                            <img src={customAvatar} alt="User Avatar" />
                        ) : (
                            <UserIcon size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
                        )}
                        <div className="vdock-tooltip">{isDockExpanded ? 'Close' : 'Open Control Center'}</div>
                    </div>
                </div>
            </div>

            {/* Zen Mode Minimal Settings Trigger */}
            {appMode === 'zen' && (
                <div
                    ref={appMode === 'zen' ? avatarRef : null}
                    onClick={(e) => { e.stopPropagation(); setIsDockExpanded(!isDockExpanded); }}
                    style={{
                        position: 'fixed',
                        top: 'calc(var(--safe-top-offset) + 2rem)',
                        left: '2rem',
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        zIndex: 10000,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: 0.35,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                        e.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.35';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'none';
                    }}
                    className="interactive-press zen-settings-btn"
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle Control Center"
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsDockExpanded(!isDockExpanded); } }}
                >
                    <Settings size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                </div>
            )}
        </>
    );
};

import React from 'react';
import { X, Settings, Moon, Sun } from 'lucide-react';
import { TaskWidget } from '../widgets/TaskWidget';
import { HabitWidget } from '../widgets/HabitWidget';
import { FocusCalendar } from '../calendar/FocusCalendar';
import { InteractiveHoverButton } from '../ui/InteractiveHoverButton';
import { HabitTrackerOverlay as HabitTrackerWidget } from '../widgets/HabitTrackerWidget';
import { GlobalModeSwitcher, type AppMode } from '../layout/GlobalModeSwitcher';

interface MobileToolsOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenDashboard: () => void;
    onToggleTheme: () => void;
    themeMode: 'light' | 'dark';
    appMode: AppMode;
    onAppModeChange: (mode: AppMode) => void;
}

export const MobileToolsOverlay = ({
    isOpen,
    onClose,
    onOpenDashboard,
    onToggleTheme,
    themeMode,
    appMode,
    onAppModeChange
}: MobileToolsOverlayProps) => {
    const [showHabitTracker, setShowHabitTracker] = React.useState(false);

    if (!isOpen) return null;

    return (
        <div
            className="mobile-tools-overlay-backdrop"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 999,
                display: 'flex',
                justifyContent: 'flex-end',
            }}
            onClick={onClose}
        >
            <div
                className="mobile-tools-overlay glass"
                style={{
                    width: '85%',
                    maxWidth: '400px',
                    height: '100vh',
                    background: 'rgba(20, 20, 30, 0.65)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    animation: 'slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Tools & Focus</h2>
                    <button
                        onClick={onClose}
                        style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.5)' }}
                        className="interactive-press"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                        onClick={onOpenDashboard}
                        className="interactive-hover"
                        style={{
                            flex: 1, padding: '0.75rem', borderRadius: '1rem',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontSize: '0.85rem', fontWeight: 600
                        }}
                    >
                        <Settings size={18} /> Settings
                    </button>
                    <button
                        onClick={onToggleTheme}
                        className="interactive-hover"
                        style={{
                            padding: '0.75rem', width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>

                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                    <GlobalModeSwitcher currentMode={appMode} onModeChange={onAppModeChange} />
                </div>

                {/* Widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <section>
                        <h3 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Focus Task</h3>
                        <TaskWidget />
                    </section>

                    <section>
                        <h3 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>History & Calendar</h3>
                        <FocusCalendar />
                    </section>

                    <section>
                        <h3 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Daily Habits</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <HabitWidget />
                            <InteractiveHoverButton onClick={() => setShowHabitTracker(true)} style={{ width: '100%' }}>
                                Habit Tracker
                            </InteractiveHoverButton>
                        </div>
                    </section>
                </div>

                {/* Habit Tracker Modal (Independent for mobile) */}
                {showHabitTracker && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1100,
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <div style={{ width: '100%', maxWidth: '650px', height: '80vh', position: 'relative' }}>
                            <HabitTrackerWidget onClose={() => setShowHabitTracker(false)} />
                        </div>
                    </div>
                )}

                {/* Spacer for bottom safe area */}
                <div style={{ height: 'env(safe-area-inset-bottom)', minHeight: '20px' }} />
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

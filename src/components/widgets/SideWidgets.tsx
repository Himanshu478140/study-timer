import { Settings, Sun, Moon } from 'lucide-react';
import { HabitWidget } from './HabitWidget';
import { TaskWidget } from './TaskWidget';
import { GlobalModeSwitcher, type AppMode } from '../layout/GlobalModeSwitcher';
import './widgets.css';

interface SideWidgetsProps {
    visible: boolean;
    onOpenDashboard: () => void;
    onToggleTheme: (event?: React.MouseEvent | MouseEvent) => void;
    themeMode: 'light' | 'dark';
    appMode: AppMode;
    onAppModeChange: (mode: AppMode) => void;
}

export const SideWidgets = ({
    visible,
    onOpenDashboard,
    onToggleTheme,
    themeMode,
    appMode,
    onAppModeChange
}: SideWidgetsProps) => {
    const isZen = appMode === 'zen';
    const transitionStyle = {
        opacity: visible ? 1 : 0,
        zIndex: isZen ? 10001 : 100, // Above ZenMode overlay
        top: (appMode === 'home' || isZen) ? 'auto' : undefined,
        bottom: (appMode === 'home' || isZen) ? 'var(--widget-side-gap)' : undefined,
        transform: visible
            ? ((appMode === 'home' || isZen) ? 'translateX(0)' : 'translateY(-50%) translateX(0)')
            : ((appMode === 'home' || isZen) ? 'translateX(50px)' : 'translateY(-50%) translateX(50px)'),
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        visibility: (visible ? 'visible' : 'hidden') as any
    };

    const buttonStyle = {
        width: 45, height: 45,
        borderRadius: '50%',
        background: themeMode === 'light'
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(var(--color-accent-rgb), var(--glass-tint-strength)))'
            : 'linear-gradient(135deg, var(--color-glass-bg), rgba(var(--color-accent-rgb), var(--glass-tint-strength)))',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-glass-border)',
        transition: 'all 0.2s',
        cursor: 'pointer'
    };

    return (
        <>
            {/* Independent Stats/Habit Widget Container */}
            <div className="widget-positioner stats-positioner" style={transitionStyle}>
                {appMode === 'focus' && (
                    <>
                        <div style={{ marginBottom: '1rem', width: '100%', position: 'relative', zIndex: 20 }}>
                            <TaskWidget />
                        </div>
                        <HabitWidget />
                    </>
                )}

                {/* Relocated Settings & Theme Toggle */}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-start' }}>
                    {appMode !== 'zen' && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={onOpenDashboard}
                                style={buttonStyle}
                                className="interactive-hover"
                                title="Settings & Stats"
                            >
                                <Settings size={20} />
                            </button>

                            <button
                                onClick={(e) => onToggleTheme(e)}
                                style={buttonStyle}
                                className="interactive-hover"
                                title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Text`}
                            >
                                {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                        </div>
                    )}

                    <GlobalModeSwitcher currentMode={appMode} onModeChange={onAppModeChange} />
                </div>
            </div>
        </>
    );
};

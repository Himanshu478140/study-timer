import { WeatherWidget } from './widgets/WeatherWidget';
import { type AppMode } from '../Dock/AppModes/GlobalModeSwitcher';

interface AppHeaderProps {
    isDashboardOpen: boolean;
    isFocusActive: boolean;
    appMode: AppMode;
}

export const AppHeader = ({
    isDashboardOpen,
    isFocusActive,
    appMode
}: AppHeaderProps) => {
    return (
        <div className="focus-header">
            <header
                className="stitch-header"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem 2rem',
                    width: '100%',
                    opacity: (isDashboardOpen || isFocusActive) ? 0 : 1,
                    transition: 'opacity 0.5s ease',
                    pointerEvents: (isDashboardOpen || isFocusActive) ? 'none' : 'auto',
                }}
            >
                {/* Left: Branding & Weather Card */}
                <div className="stitch-header-left" style={{
                    position: 'absolute',
                    left: '2rem',
                    top: 'calc(var(--safe-top-offset) + 1.2rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    zIndex: 50
                }}>
                    <div className="brand-logo-text" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem',
                        alignItems: 'flex-end',
                        opacity: appMode === 'zen' ? 0 : 0.95,
                        transition: 'opacity 0.5s ease',
                    }}>
                        <span style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 700,
                            fontSize: '2.45rem',
                            letterSpacing: '0.01em',
                            color: '#ffffff',
                            lineHeight: 1.1
                        }}>focora</span>
                        <span style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 500,
                            fontSize: '0.625rem',
                            letterSpacing: '0.05em',
                            color: 'rgba(255, 255, 255, 0.45)',
                            lineHeight: 1.1
                        }}>by HIMANSHU</span>
                    </div>

                    {appMode === 'home' && (
                        <WeatherWidget />
                    )}
                </div>
            </header>
        </div>
    );
};

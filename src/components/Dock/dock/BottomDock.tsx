import { Hourglass, CloudSun, Leaf, PictureInPicture2, Maximize, Minimize } from 'lucide-react';
import { type MotionValue } from 'framer-motion';
import { Dock, DockIcon } from './Dock';
import { type AppMode } from '../AppModes/GlobalModeSwitcher';

interface BottomDockProps {
    isFocusActive: boolean;
    appMode: AppMode;
    handleAppModeChange: (mode: AppMode, e?: React.MouseEvent) => void;
    handlePiPClick: () => void;
    isFullscreen: boolean;
    handleToggleFullscreen: () => void;
}

export const BottomDock = ({
    isFocusActive,
    appMode,
    handleAppModeChange,
    handlePiPClick,
    isFullscreen,
    handleToggleFullscreen
}: BottomDockProps) => {
    return (
        <div
            className="bottom-docks-group"
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                left: 'var(--space-3)',
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'center',
                transform: 'scale(var(--ui-scale))',
                transformOrigin: 'bottom left',
                zIndex: 51,
            }}
        >
            {/* Mode Switcher Dock */}
            <div
                className="mode-dock-wrapper"
                style={{
                    opacity: isFocusActive ? 0 : 1,
                    visibility: isFocusActive ? 'hidden' : 'visible',
                    transition: 'opacity 0.4s ease, visibility 0.4s ease',
                }}
            >
                <Dock>
                    {(mouseX: MotionValue<number>) => (
                        <>
                            <DockIcon
                                mouseX={mouseX}
                                label="Focus Timer"
                                isActive={appMode === 'focus'}
                                onClick={() => handleAppModeChange('focus')}
                            >
                                <Hourglass size={20} />
                            </DockIcon>

                            <DockIcon
                                mouseX={mouseX}
                                label="Relax"
                                isActive={appMode === 'home'}
                                onClick={() => handleAppModeChange('home')}
                            >
                                <CloudSun size={20} />
                            </DockIcon>

                            <DockIcon
                                mouseX={mouseX}
                                label="Zen Mode"
                                isActive={appMode === 'zen'}
                                onClick={() => handleAppModeChange('zen')}
                            >
                                <Leaf size={20} />
                            </DockIcon>
                        </>
                    )}
                </Dock>
            </div>

            {/* Bottom Tool Dock */}
            <div
                className="bottom-dock-nav"
                style={{
                    position: 'relative',
                    opacity: (isFocusActive || appMode === 'zen') ? 0 : 1,
                    visibility: (isFocusActive || appMode === 'zen') ? 'hidden' : 'visible',
                    transition: 'all 0.5s ease',
                    pointerEvents: isFocusActive ? 'none' : 'auto',
                    display: 'flex',
                    gap: 'var(--space-2)',
                    alignItems: 'center',
                }}
            >
                <Dock>
                    {(mouseX: MotionValue<number>) => (
                        <>
                            {/* PiP */}
                            <DockIcon mouseX={mouseX} label="Pop Out" onClick={handlePiPClick}>
                                <PictureInPicture2 size={20} />
                            </DockIcon>

                            {/* Fullscreen */}
                            <DockIcon mouseX={mouseX} label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} onClick={handleToggleFullscreen}>
                                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                            </DockIcon>
                        </>
                    )}
                </Dock>
            </div>
        </div>
    );
};

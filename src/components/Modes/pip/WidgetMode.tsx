import { WallpaperLayer } from '../../wallpaper/WallpaperLayer';
import { WidgetView } from './WidgetView';
import { type WallpaperConfig } from '../../wallpaper/WallpaperSelector';
import { type FocusMode } from '../../timer/ModeSelectorPanel';

interface WidgetModeProps {
    isWidgetMode: boolean;
    wallpaper: WallpaperConfig;
    timeLeft: number;
    status: 'idle' | 'running' | 'paused' | 'completed';
    handleStart: () => void;
    pause: () => void;
    reset: () => void;
    mode: FocusMode;
    handlePiPClick: () => void;
}

export const WidgetMode = ({
    isWidgetMode,
    wallpaper,
    timeLeft,
    status,
    handleStart,
    pause,
    reset,
    mode,
    handlePiPClick
}: WidgetModeProps) => {
    if (!isWidgetMode) return null;

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', padding: 0, margin: 0, boxSizing: 'border-box' }}>
            <WallpaperLayer config={wallpaper} />
            <WidgetView
                timeLeft={timeLeft}
                status={status}
                start={handleStart}
                pause={pause}
                reset={reset}
                mode={mode}
                onCloseWidget={handlePiPClick}
            />
        </div>
    );
};

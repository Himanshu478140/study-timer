import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import type { TimerStatus } from '../../hooks/useTimer';
import './timer.css';

interface TimerControlsProps {
    status: TimerStatus;
    onStart: () => void;
    onPause: () => void;
    onReset?: () => void;
    onBreak?: () => void;
    allowReset?: boolean;
}

export const TimerControls = ({ status, onStart, onPause, onReset, onBreak, allowReset }: TimerControlsProps) => {
    const isRunning = status === 'running';

    return (
        <div className="timer-controls">
            {/* Reset — left, always small */}
            {onReset && (status !== 'idle' || allowReset) && (
                <button
                    className="control-btn control-btn--secondary interactive-hover"
                    onClick={onReset}
                    aria-label="Reset Timer"
                    title="Reset"
                >
                    <RotateCcw size={20} />
                </button>
            )}

            {/* Play/Pause — center, hero button (big) */}
            <button
                className={`control-btn control-btn--primary interactive-hover`}
                onClick={isRunning ? onPause : onStart}
                aria-label={isRunning ? "Pause Timer" : "Start Timer"}
                title={isRunning ? "Pause" : "Start"}
            >
                {isRunning ? (
                    <Pause size={30} fill="currentColor" />
                ) : (
                    <Play size={30} fill="currentColor" style={{ marginLeft: '3px' }} />
                )}
            </button>

            {/* Break button for ambient mode */}
            {onBreak && (
                <button
                    className="control-btn control-btn--secondary interactive-hover"
                    onClick={onBreak}
                    aria-label="Take a Break"
                    title="Take a Break"
                    style={{ color: '#C084FC' }}
                >
                    <Coffee size={20} />
                </button>
            )}
        </div>
    );
};

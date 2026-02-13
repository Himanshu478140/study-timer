import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import type { TimerStatus } from '../../hooks/useTimer';
import './timer.css';

interface TimerControlsProps {
    status: TimerStatus;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onBreak?: () => void;
    allowReset?: boolean;
}

export const TimerControls = ({ status, onStart, onPause, onReset, onBreak, allowReset }: TimerControlsProps) => {
    return (
        <div className="timer-controls">
            {status === 'running' ? (
                <button
                    className="control-btn interactive-hover"
                    onClick={onPause}
                    aria-label="Pause Timer"
                    title="Pause"
                >
                    <Pause size={28} fill="currentColor" />
                </button>
            ) : (
                <button
                    className="control-btn primary interactive-hover"
                    onClick={onStart}
                    aria-label="Start Timer"
                    title="Start"
                >
                    <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
                </button>
            )}

            {(status !== 'idle' || allowReset) && (
                <button
                    className="control-btn interactive-hover"
                    onClick={onReset}
                    aria-label="Reset Timer"
                    title="Reset"
                >
                    <RotateCcw size={24} />
                </button>
            )}

            {onBreak && (
                <button
                    className="control-btn interactive-hover"
                    onClick={onBreak}
                    aria-label="Take a Break"
                    title="Take a Break"
                    style={{ color: '#C084FC' }} // Optional accent color
                >
                    <Coffee size={24} />
                </button>
            )}
        </div>
    );
};

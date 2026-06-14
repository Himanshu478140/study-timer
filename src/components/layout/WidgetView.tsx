import React from 'react';
import { Play, Pause, RefreshCw, X } from 'lucide-react';
import { type FocusMode } from '../ui/ModeSelectorPanel';
import { type TimerStatus } from '../../hooks/useTimer';

interface WidgetViewProps {
    timeLeft: number;
    status: TimerStatus;
    start: () => void;
    pause: () => void;
    reset: () => void;
    mode: FocusMode;
    onCloseWidget: () => void;
}

export const WidgetView: React.FC<WidgetViewProps> = ({
    timeLeft,
    status,
    start,
    pause,
    reset,
    mode,
    onCloseWidget,
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getModeLabel = (modeStr: FocusMode) => {
        return modeStr.replace('_', ' ').toUpperCase();
    };

    return (
        <main
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '6vmin',
                boxSizing: 'border-box',
                position: 'relative',
                // WebkitAppRegion drag allows dragging the window by clicking anywhere except buttons
                // @ts-ignore
                WebkitAppRegion: 'drag',
                userSelect: 'none',
                overflow: 'hidden',
            }}
        >
            <style>{`
                .interactive-button {
                    transition: transform 0.2s ease, background-color 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    outline: none;
                }
                .interactive-button svg {
                    width: 45%;
                    height: 45%;
                    stroke-width: 2.5;
                }
                .interactive-button:hover {
                    transform: scale(1.08);
                    background-color: var(--color-bg-hover, rgba(255, 255, 255, 0.2));
                }
                .interactive-button:active {
                    transform: scale(0.92);
                }
                .interactive-button:focus-visible {
                    outline: 0.125rem solid var(--color-accent, #10b981);
                    outline-offset: 0.125rem;
                }
                @media (prefers-reduced-motion: reduce) {
                    .interactive-button {
                        transition: none !important;
                        transform: none !important;
                    }
                    .interactive-button:hover {
                        transform: none !important;
                    }
                    .interactive-button:active {
                        transform: none !important;
                    }
                }
            `}</style>

            {/* Header section */}
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <h2
                    style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 700,
                        fontSize: '5.5vmin',
                        letterSpacing: '0.08em',
                        color: 'var(--color-text-primary, #ffffff)',
                        margin: 0,
                        textShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.5)',
                        pointerEvents: 'none', // Lets click events fall through to the drag container
                    }}
                >
                    {getModeLabel(mode)}
                </h2>

                <button
                    onClick={onCloseWidget}
                    style={{
                        // @ts-ignore
                        WebkitAppRegion: 'no-drag',
                        background: 'var(--color-bg-translucent, rgba(0, 0, 0, 0.3))',
                        border: '0.0625rem solid var(--color-border-translucent, rgba(255, 255, 255, 0.1))',
                        borderRadius: '50%',
                        color: 'var(--color-text-primary, #ffffff)',
                        cursor: 'pointer',
                        width: '10.5vmin',
                        height: '10.5vmin',
                        maxWidth: '2.4rem',
                        maxHeight: '2.4rem',
                        minWidth: '1.7rem',
                        minHeight: '1.7rem',
                        backdropFilter: 'blur(0.25rem)',
                    }}
                    className="interactive-button"
                    title="Return to Full Mode"
                    aria-label="Return to Full Mode"
                >
                    <X />
                </button>
            </header>

            {/* Timer section */}
            <section
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: '1 1 auto',
                    pointerEvents: 'none', // Click events fall through to the drag container
                }}
            >
                <div
                    role="timer"
                    aria-live="polite"
                    style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '25vmin',
                        fontWeight: 700,
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--color-text-primary, #ffffff)',
                        textShadow: '0 0.25rem 1.875rem rgba(0, 0, 0, 0.4)',
                        filter: 'drop-shadow(0 0.125rem 0.25rem rgba(0, 0, 0, 0.3))',
                        pointerEvents: 'none',
                    }}
                >
                    {formatTime(timeLeft)}
                </div>
            </section>

            {/* Controls section */}
            <footer
                style={{
                    display: 'flex',
                    gap: '4vmin',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                {/* Play/Pause */}
                <button
                    onClick={status === 'running' ? pause : start}
                    style={{
                        // @ts-ignore
                        WebkitAppRegion: 'no-drag',
                        width: '14vmin',
                        height: '14vmin',
                        maxWidth: '3.2rem',
                        maxHeight: '3.2rem',
                        minWidth: '2.2rem',
                        minHeight: '2.2rem',
                        borderRadius: '50%',
                        background: status === 'running' ? 'var(--color-bg-translucent, rgba(255, 255, 255, 0.1))' : 'var(--color-accent, #10b981)',
                        border: status === 'running' ? '0.0625rem solid var(--color-border-translucent, rgba(255, 255, 255, 0.2))' : 'none',
                        color: 'var(--color-text-primary, #ffffff)',
                        cursor: 'pointer',
                    }}
                    className="interactive-button"
                    aria-label={status === 'running' ? 'Pause' : 'Start'}
                >
                    {status === 'running' ? <Pause fill="currentColor" /> : <Play fill="currentColor" style={{ transform: 'translateX(0.0625rem)' }} />}
                </button>

                {/* Reset */}
                <button
                    onClick={reset}
                    style={{
                        // @ts-ignore
                        WebkitAppRegion: 'no-drag',
                        width: '10.5vmin',
                        height: '10.5vmin',
                        maxWidth: '2.4rem',
                        maxHeight: '2.4rem',
                        minWidth: '1.7rem',
                        minHeight: '1.7rem',
                        borderRadius: '50%',
                        background: 'var(--color-bg-translucent, rgba(0, 0, 0, 0.3))',
                        border: '0.0625rem solid var(--color-border-translucent, rgba(255, 255, 255, 0.1))',
                        color: 'var(--color-text-secondary, rgba(255, 255, 255, 0.8))',
                        cursor: 'pointer',
                    }}
                    className="interactive-button"
                    aria-label="Reset Timer"
                >
                    <RefreshCw />
                </button>
            </footer>
        </main>
    );
};

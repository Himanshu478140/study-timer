import { useState, useEffect, useCallback } from 'react';
import { FlipClock } from '../timer/FlipClock';
import { SimpleFlip } from '../timer/SimpleFlip';
import { Maximize, Minimize } from 'lucide-react';

interface ZenModeProps {
    clockFont?: string;
    zenModeType?: 'clock' | 'timer';
    timeLeft?: number;
    status?: string;
    onStart?: () => void;
    onPause?: () => void;
    onReset?: () => void;
    onEnterFullscreen?: () => void;
    onToggleFullscreen?: () => void;
    isFullscreen?: boolean;
    autoFullscreen?: boolean;
    timeFormat?: '12h' | '24h';
    modeName?: string;
}

export const ZenMode = ({
    clockFont, zenModeType = 'clock',
    timeLeft = 0, status = 'idle', onStart, onPause, onReset,
    onEnterFullscreen, onToggleFullscreen, isFullscreen, autoFullscreen,
    timeFormat = '24h', modeName
}: ZenModeProps) => {
    const [time, setTime] = useState(new Date());
    const [showExit, setShowExit] = useState(false);
    const [isPortrait, setIsPortrait] = useState(false);
    const [scale, setScale] = useState(1);

    const updateLayout = useCallback(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const portrait = vh > vw;
        setIsPortrait(portrait);

        // FlipUnit base size: 120x160px, 4 digits + gaps
        // Horizontal: ~(120*4 + gaps) x 160 ≈ 540 x 160
        // Vertical: ~(120*2 + gap) x (160*2 + gap) ≈ 250 x 340
        const clockW = portrait ? 250 : 540;
        const clockH = portrait ? 340 : 160;

        // Fill viewport with some padding (90% width, 85% height landscape, 80% height portrait)
        const scaleX = (vw * (portrait ? 0.9 : 0.95)) / clockW;
        const scaleY = (vh * (portrait ? 0.8 : 0.85)) / clockH;
        setScale(Math.min(scaleX, scaleY));
    }, []);

    useEffect(() => {
        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, [updateLayout]);

    useEffect(() => {
        if (autoFullscreen) {
            onEnterFullscreen?.();
        }
    }, [onEnterFullscreen, autoFullscreen]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const rawHours = time.getHours();
    const hours = timeFormat === '12h' ? (rawHours % 12 || 12) : rawHours;
    const minutes = time.getMinutes();

    const val1 = zenModeType === 'timer' ? Math.floor(timeLeft / 60) : hours;
    const val2 = zenModeType === 'timer' ? timeLeft % 60 : minutes;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                cursor: (showExit || status === 'completed') ? 'auto' : 'none',
                userSelect: 'none'
            }}
            onClick={() => {
                if (zenModeType === 'timer' && status !== 'completed') {
                    if (status === 'running') onPause?.();
                    else onStart?.();
                }
            }}
            onMouseMove={() => setShowExit(true)}
            onMouseLeave={() => setShowExit(false)}
        >
            <div style={{
                transform: `scale(${scale})`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
            }}>
                {clockFont === 'simple-flip' ? (
                    <SimpleFlip value1={val1} value2={val2} vertical={isPortrait} />
                ) : (
                    <FlipClock value1={val1} value2={val2} vertical={isPortrait} />
                )}

                {zenModeType === 'clock' && timeFormat === '12h' && (
                    <div style={{
                        position: 'absolute',
                        right: '-2rem',
                        bottom: '0',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        opacity: 0.25,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        zIndex: 10,
                        pointerEvents: 'none',
                        color: 'white',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: '2px 4px',
                        borderRadius: '3px'
                    }}>
                        {time.getHours() >= 12 ? 'PM' : 'AM'}
                    </div>
                )}
            </div>

            <div style={{
                position: 'absolute',
                bottom: isPortrait ? '4%' : '10%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: showExit ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: showExit ? 'auto' : 'none',
                textAlign: 'center'
            }}>
                {modeName && (
                    <div style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3em',
                        marginBottom: '0.25rem'
                    }}>
                        {modeName}
                    </div>
                )}
                <div style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    opacity: 0.6
                }}>
                    {status === 'running' ? 'Focusing...' : (status === 'completed' ? 'Session Complete' : 'Paused')}
                </div>
            </div>

            {/* Toolbar Top Right */}
            <div style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                display: 'flex',
                gap: '1rem',
                opacity: (showExit && status !== 'completed') ? 1 : 0,
                transition: 'all 0.3s ease',
                pointerEvents: (showExit && status !== 'completed') ? 'auto' : 'none',
                zIndex: 10000
            }}>
                {zenModeType === 'timer' && status !== 'running' && status !== 'completed' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onReset?.();
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '0.5rem 1.25rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)'
                        }}
                        className="interactive-hover"
                    >
                        Reset Timer
                    </button>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFullscreen?.();
                    }}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        backdropFilter: 'blur(10px)'
                    }}
                    className="interactive-hover"
                >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>
            </div>
        </div>
    );
};

import { Play, Pause, RefreshCw, X } from 'lucide-react';
import type { TimerStatus } from '../../hooks/useTimer';
import type { WallpaperConfig } from '../wallpaper/WallpaperSelector';
import { YouTubeWallpaper } from '../wallpaper/YouTubeWallpaper';
import { VideoWallpaper } from '../wallpaper/VideoWallpaper';
import { ParticleWallpaper } from '../wallpaper/ParticleWallpaper';
import '../wallpaper/animatedGradients.css';

interface MiniTimerProps {
    timeLeft: number;
    status: TimerStatus;
    start: () => void;
    pause: () => void;
    reset: () => void;
    closePiP: () => void;
    mode: string;
    wallpaper: WallpaperConfig;
}

export const MiniTimer = ({ timeLeft, status, start, pause, reset, closePiP, mode, wallpaper }: MiniTimerProps) => {

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            minHeight: '100vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '"Inter", system-ui, sans-serif',
            color: 'white',
            margin: 0,
            padding: 0
        }}>
            {/* --- Wallpaper Layer (Fixed Background) --- */}
            {wallpaper.type === 'solid' && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: wallpaper.value,
                    zIndex: -3,
                    transition: 'background 0.5s ease'
                }} />
            )}

            {wallpaper.type === 'image' && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: wallpaper.value,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: -3,
                    transition: 'opacity 0.5s ease'
                }} />
            )}

            {wallpaper.type === 'video' && wallpaper.videoUrl && (
                <VideoWallpaper
                    videoUrl={wallpaper.videoUrl}
                    blur={0}
                    brightness={1}
                />
            )}

            {wallpaper.type === 'youtube' && wallpaper.youtubeId && (
                <YouTubeWallpaper videoId={wallpaper.youtubeId} />
            )}

            {wallpaper.type === 'animated-gradient' && (
                <div className={`animated-gradient-bg ${wallpaper.value}`} />
            )}

            {wallpaper.type === 'particles' && wallpaper.particleConfig && (
                <ParticleWallpaper
                    type={wallpaper.particleConfig.type}
                    density={wallpaper.particleConfig.density}
                    speedMultiplier={wallpaper.particleConfig.speed}
                    color={wallpaper.particleConfig.color}
                />
            )}

            {/* Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'black',
                opacity: (wallpaper.overlayOpacity || 0.2) + 0.1,
                zIndex: -2,
                pointerEvents: 'none'
            }} />

            {/* Radial Glow (Focus Effect) */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '150%',
                height: '150%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 60%)',
                pointerEvents: 'none',
                zIndex: -1
            }} />


            {/* --- Header --- */}
            <div style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                flexShrink: 0 // Prevent header squishing
            }}>
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    opacity: 0.9,
                    textTransform: 'uppercase',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                    {mode.replace('_', ' ')}
                </span>
                <button
                    onClick={closePiP}
                    className="interactive-hover"
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        color: 'white',
                        cursor: 'pointer',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                    title="Close Mini Timer"
                >
                    <X size={14} />
                </button>
            </div>

            {/* --- Main Content (Flex Column) --- */}
            <div style={{
                flex: '1 1 auto', // Grow to fill space
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 5,
                width: '100%'
            }}>
                {/* Timer Display */}
                <div style={{
                    flex: '1 1 auto', // Allow growing/shrinking
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    position: 'relative'
                }}>
                    <h1 style={{
                        fontSize: '30vmin', // Responsive Text
                        fontWeight: 700,
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                        margin: 0,
                        textShadow: '0 4px 30px rgba(0,0,0,0.4)',
                        letterSpacing: '-0.03em',
                        // Metallic Gradient Text
                        background: 'linear-gradient(180deg, #ffffff 10%, #cbd5e1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}>
                        {formatTime(timeLeft)}
                    </h1>
                </div>

                {/* Controls Area */}
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    flexShrink: 0 // Keep controls visible
                }}>
                    <button
                        onClick={() => status === 'running' ? pause() : start()}
                        className="interactive-hover"
                        style={{
                            width: 'min(18vmin, 64px)',
                            height: 'min(18vmin, 64px)',
                            borderRadius: '50%',
                            background: status === 'running'
                                ? 'rgba(255,255,255,0.1)'
                                : 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                            border: status === 'running' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: status === 'running'
                                ? 'inset 0 2px 4px rgba(0,0,0,0.1)'
                                : '0 8px 16px rgba(5, 150, 105, 0.4), 0 2px 4px rgba(0,0,0,0.1)', // Green Glow
                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {status === 'running' ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" style={{ marginLeft: 4 }} />}
                    </button>

                    <button
                        onClick={reset}
                        className="interactive-hover"
                        style={{
                            width: 'min(14vmin, 48px)',
                            height: 'min(14vmin, 48px)',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(4px)'
                        }}
                        title="Reset"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

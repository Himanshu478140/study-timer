import { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, X, Settings2 } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import type { WallpaperConfig } from '../wallpaper/WallpaperSelector';
import { WALLPAPERS, WallpaperGrid } from '../wallpaper/WallpaperSelector';
import { YouTubeWallpaper } from '../wallpaper/YouTubeWallpaper';
import { VideoWallpaper } from '../wallpaper/VideoWallpaper';
import { ParticleWallpaper } from '../wallpaper/ParticleWallpaper';
import '../wallpaper/animatedGradients.css';

export const DesktopWidgetLayout = () => {
    const [showSettings, setShowSettings] = useState(false);

    // Self-contained state (persisted in Electron's LocalStorage)
    const [wallpaper, setWallpaper] = useState<WallpaperConfig>(() => {
        try {
            const saved = localStorage.getItem('widget-wallpaper');
            return saved ? JSON.parse(saved) : WALLPAPERS[0];
        } catch {
            return WALLPAPERS[0];
        }
    });

    // Persist when changed
    useEffect(() => {
        localStorage.setItem('widget-wallpaper', JSON.stringify(wallpaper));
    }, [wallpaper]);

    const { timeLeft, status, start, pause, reset } = useTimer({
        initialTime: 25 * 60,
        isStopwatch: false
    });

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const closeApp = () => {
        // @ts-ignore
        if (window.electronAPI) window.electronAPI.close();
        else window.close();
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
            padding: 0,
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            // Ensure background catches clicks for resizing if needed, but keep it subtle
            background: 'rgba(0,0,0,0.01)'
        }}>
            {/* --- Wallpaper Layer --- */}
            {wallpaper.type === 'solid' && (
                <div style={{ position: 'absolute', inset: 0, background: wallpaper.value, zIndex: -3 }} />
            )}

            {wallpaper.type === 'image' && (
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: wallpaper.value, backgroundSize: 'cover', backgroundPosition: 'center',
                    zIndex: -3
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
                position: 'absolute', inset: 0, background: 'black',
                opacity: (wallpaper.overlayOpacity || 0.2) + 0.1, zIndex: -2, pointerEvents: 'none'
            }} />

            {/* --- Drag Region (Centered) --- */}
            <div style={{
                position: 'absolute', top: 6, left: '15%', right: '15%', height: '24px',
                zIndex: 50,
                // @ts-ignore
                WebkitAppRegion: 'drag',
                cursor: 'move',
                borderRadius: '12px',
                // background: 'rgba(255,255,255,0.1)' // Hint at drag area?
            }} />

            {/* --- Header --- */}
            <div style={{
                padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                zIndex: 60, flexShrink: 0, marginTop: '4px'
            }}>
                {/* Settings Toggle */}
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="interactive-hover"
                    style={{
                        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%', color: 'white', cursor: 'pointer',
                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                        // @ts-ignore
                        WebkitAppRegion: 'no-drag'
                    }}
                >
                    <Settings2 size={14} />
                </button>

                {/* Close Button */}
                <button
                    onClick={closeApp}
                    className="interactive-hover"
                    style={{
                        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%', color: 'white', cursor: 'pointer',
                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                        // @ts-ignore
                        WebkitAppRegion: 'no-drag'
                    }}
                >
                    <X size={14} />
                </button>
            </div>

            {/* --- Settings Panel (Overlay) --- */}
            {showSettings && (
                <div style={{
                    position: 'absolute', inset: '40px 10px 10px 10px',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
                    borderRadius: '16px', zIndex: 100,
                    padding: '1rem', overflowY: 'auto',
                    border: '1px solid rgba(255,255,255,0.1)',
                    // @ts-ignore
                    WebkitAppRegion: 'no-drag'
                }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>Select Wallpaper</h3>
                    <WallpaperGrid currentId={wallpaper.id} onSelect={(wp) => {
                        setWallpaper(wp);
                        // Optional: close on select?
                        // setShowSettings(false);
                    }} />
                    <button
                        onClick={() => setShowSettings(false)}
                        style={{
                            marginTop: '1rem', width: '100%', padding: '8px',
                            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                            color: 'white', cursor: 'pointer'
                        }}
                    >
                        Done
                    </button>
                </div>
            )}

            {/* --- Main Content --- */}
            <div style={{
                flex: '1 1 auto', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', zIndex: 5, width: '100%',
                opacity: showSettings ? 0 : 1, transition: 'opacity 0.2s'
            }}>
                {/* Timer */}
                <h1 style={{
                    fontSize: '28vmin', fontWeight: 700, lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums', margin: 0,
                    textShadow: '0 4px 30px rgba(0,0,0,0.4)',
                    background: 'linear-gradient(180deg, #ffffff 10%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                    {formatTime(timeLeft)}
                </h1>

                {/* Controls */}
                <div style={{
                    display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center',
                    marginTop: '2rem', flexShrink: 0,
                    // @ts-ignore
                    WebkitAppRegion: 'no-drag'
                }}>
                    <button
                        onClick={() => status === 'running' ? pause() : start()}
                        className="interactive-hover"
                        style={{
                            width: 'min(15vmin, 56px)', height: 'min(15vmin, 56px)', borderRadius: '50%',
                            background: status === 'running' ? 'rgba(255,255,255,0.1)' : 'var(--color-accent, #34d399)',
                            border: status === 'running' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        {status === 'running' ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" style={{ marginLeft: 2 }} />}
                    </button>

                    <button onClick={reset} style={{
                        width: 'min(12vmin, 42px)', height: 'min(12vmin, 42px)', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* --- Resize Grip (Bottom Right) --- */}
            <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 16, height: 16,
                zIndex: 60,
                cursor: 'se-resize',
                opacity: 0.5,
                // @ts-ignore
                WebkitAppRegion: 'no-drag', // Crucial!
                color: 'white'
            }}>
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v6" />
                    <path d="M15 21h6" />
                    <path d="M21 9v2" />
                    <path d="M9 21h2" />
                </svg>
            </div>
        </div>
    );
};

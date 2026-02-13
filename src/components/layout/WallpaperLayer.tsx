import type { WallpaperConfig } from '../wallpaper/WallpaperSelector';
import { VideoWallpaper } from '../wallpaper/VideoWallpaper';
import { ParticleWallpaper } from '../wallpaper/ParticleWallpaper';
import { YouTubeWallpaper } from '../wallpaper/YouTubeWallpaper';
import '../wallpaper/animatedGradients.css';

interface WallpaperLayerProps {
    config: WallpaperConfig;
}

export const WallpaperLayer = ({ config }: WallpaperLayerProps) => {
    return (
        <>
            {/* Base Color Layer (z-index: -3) */}
            <div
                className="wallpaper-layer"
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: config.type === 'solid' ? config.value : '#0f0f11',
                    zIndex: -3,
                    transition: 'background 0.5s ease'
                }}
            />

            {/* Image Layer (z-index: -2) */}
            {config.type === 'image' && (
                <div
                    className="wallpaper-image"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundImage: config.value,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: -2,
                        transition: 'opacity 0.5s ease'
                    }}
                />
            )}

            {/* Video Layer (z-index: -2) */}
            {config.type === 'video' && config.videoUrl && (
                <VideoWallpaper
                    videoUrl={config.videoUrl}
                    blur={0}
                    brightness={1}
                />
            )}

            {/* YouTube Layer (z-index: -2) */}
            {config.type === 'youtube' && config.youtubeId && (
                <YouTubeWallpaper
                    videoId={config.youtubeId}
                />
            )}

            {/* Animated Gradient Layer (z-index: -2) */}
            {config.type === 'animated-gradient' && (
                <div
                    className={`animated-gradient-bg ${config.value}`}
                />
            )}

            {/* Particle Layer (z-index: -2) */}
            {config.particleConfig && (
                <ParticleWallpaper
                    type={config.particleConfig.type}
                    density={config.particleConfig.density}
                    speedMultiplier={config.particleConfig.speed}
                    color={config.particleConfig.color}
                    interactionType={config.particleConfig.interactionType}
                />
            )}

            {/* Overlay for legibility (z-index: -1) */}
            <div
                className="wallpaper-overlay"
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'black',
                    opacity: config.overlayOpacity || 0,
                    pointerEvents: 'none',
                    zIndex: -1,
                    transition: 'opacity 0.5s ease'
                }}
            />
        </>
    );
};

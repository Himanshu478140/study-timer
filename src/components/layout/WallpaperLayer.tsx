import React, { useEffect, useState, useRef } from 'react';
import type { WallpaperConfig } from '../wallpaper/WallpaperSelector';
import { VideoWallpaper } from '../wallpaper/VideoWallpaper';
import { ParticleWallpaper } from '../wallpaper/ParticleWallpaper';
import { YouTubeWallpaper } from '../wallpaper/YouTubeWallpaper';
import '../wallpaper/wallpaper.css';
import '../wallpaper/animatedGradients.css';

interface WallpaperLayerProps {
    config: WallpaperConfig;
}

// Session-level cache of successfully preloaded & decoded background images to bypass the decode queue
const decodedImagesCache = new Set<string>();

export const WallpaperLayer = ({ config }: WallpaperLayerProps) => {
    const [layer1Image, setLayer1Image] = useState<string | null>(null);
    const [layer2Image, setLayer2Image] = useState<string | null>(null);
    const [activeLayer, setActiveLayer] = useState<1 | 2 | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    const loadIdRef = useRef(0);

    // Extract the raw URL string from CSS url(...) syntax
    const getRawUrl = (cssUrl: string): string => {
        const match = cssUrl.match(/url\(['"]?([^'"]+)['"]?\)/);
        return match ? match[1] : cssUrl;
    };

    useEffect(() => {
        if (config.type !== 'image') {
            // If the wallpaper type is not an image, fade out any active image layers
            if (activeLayer !== null) {
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                setIsTransitioning(!prefersReducedMotion);
                setActiveLayer(null);
            }
            return;
        }

        const targetValue = config.value;

        // 1. Initial Load: Mount instantly on application startup for visual snappiness
        if (activeLayer === null) {
            setLayer1Image(targetValue);
            setActiveLayer(1);
            decodedImagesCache.add(targetValue);
            return;
        }

        // Identify current visible wallpaper value
        const currentActiveValue = activeLayer === 1 ? layer1Image : layer2Image;
        if (targetValue === currentActiveValue) {
            return;
        }

        // Check if transition should be skipped for accessibility
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // 2. Cache Hit: Swaps backgrounds instantaneously & synchronously
        if (decodedImagesCache.has(targetValue)) {
            setIsTransitioning(!prefersReducedMotion);
            if (activeLayer === 1) {
                setLayer2Image(targetValue);
                setActiveLayer(2);
            } else {
                setLayer1Image(targetValue);
                setActiveLayer(1);
            }
            return;
        }

        // 3. Cache Miss: Run asynchronous off-screen pre-decoding pipeline
        const currentLoadId = ++loadIdRef.current;
        const rawUrl = getRawUrl(targetValue);

        const img = new Image();
        img.src = rawUrl;

        const handleImageReady = () => {
            // Cancel update if a newer request has superseded this load
            if (currentLoadId !== loadIdRef.current) return;

            // Cache successfully loaded URL
            decodedImagesCache.add(targetValue);

            setIsTransitioning(!prefersReducedMotion);
            if (activeLayer === 1) {
                setLayer2Image(targetValue);
                setActiveLayer(2);
            } else {
                setLayer1Image(targetValue);
                setActiveLayer(1);
            }
        };

        if (typeof img.decode === 'function') {
            img.decode()
                .then(handleImageReady)
                .catch((err) => {
                    console.warn('[WallpaperLayer] Async decode failed, falling back to onload', err);
                    handleImageReady();
                });
        } else {
            img.onload = handleImageReady;
            img.onerror = handleImageReady;
        }
    }, [config.value, config.type]);

    // Handle transition completion to clean up GPU resources (will-change)
    const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
        if (e.propertyName === 'opacity') {
            setIsTransitioning(false);
        }
    };

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

            {/* Image Layer 1 (z-index: -2) */}
            {layer1Image && (
                <div
                    className={`wallpaper-image ${isTransitioning ? 'transitioning' : ''}`}
                    style={{
                        backgroundImage: layer1Image,
                        opacity: activeLayer === 1 ? 1 : 0
                    }}
                    onTransitionEnd={handleTransitionEnd}
                />
            )}

            {/* Image Layer 2 (z-index: -2) */}
            {layer2Image && (
                <div
                    className={`wallpaper-image ${isTransitioning ? 'transitioning' : ''}`}
                    style={{
                        backgroundImage: layer2Image,
                        opacity: activeLayer === 2 ? 1 : 0
                    }}
                    onTransitionEnd={handleTransitionEnd}
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

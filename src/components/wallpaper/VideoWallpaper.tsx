import { useEffect, useRef } from 'react';
import './videoWallpaper.css';

interface VideoWallpaperProps {
    videoUrl: string;
    blur?: number;
    brightness?: number;
}

export const VideoWallpaper = ({ videoUrl, blur = 0, brightness = 1 }: VideoWallpaperProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Visibility API: Pause when tab is hidden
        const handleVisibilityChange = () => {
            if (document.hidden) {
                video.pause();
            } else {
                video.play().catch(e => console.warn('Video play failed:', e));
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Ensure video plays on mount
        video.play().catch(e => console.warn('Initial video play failed:', e));

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [videoUrl]);

    return (
        <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onCanPlay={(e) => {
                const vid = e.currentTarget;
                vid.play().catch(err => console.error("Video play onCanPlay failed:", err));
            }}
            className="video-wallpaper"
            style={{
                filter: `blur(${blur}px) brightness(${brightness})`
            }}
        />
    );
};

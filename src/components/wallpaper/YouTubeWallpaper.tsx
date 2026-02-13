import { useRef } from 'react';

interface YouTubeWallpaperProps {
    videoId: string;
}

export const YouTubeWallpaper = ({ videoId }: YouTubeWallpaperProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: -2,
            overflow: 'hidden',
            pointerEvents: 'none',
            background: '#000'
        }}>
            <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&enablejsapi=1&widget_referrer=${encodeURIComponent(window.location.href)}`}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100vw',
                    height: '100vh',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none'
                }}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="YouTube Background"
            />
            {/* Additional CSS to make it cover correctly if screen ratio differs */}
            <style>
                {`
                    @media (min-aspect-ratio: 16/9) {
                        iframe {
                            height: 56.25vw !important;
                        }
                    }
                    @media (max-aspect-ratio: 16/9) {
                        iframe {
                            width: 177.78vh !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

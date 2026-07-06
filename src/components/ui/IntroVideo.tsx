import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './IntroVideo.css';

interface IntroVideoProps {
  appReady: boolean;
  onComplete: () => void;
}

export const IntroVideo = ({ appReady, onComplete }: IntroVideoProps) => {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Try with sound first, fallback to muted if blocked
  const videoRef = useRef<HTMLVideoElement>(null);

  // Default integrated video asset path
  const videoUrl = '/intro.mp4';
  const isVideoMode = !videoError;

  // 1. Handle the 3-second minimum duration timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3000); // 3 seconds minimum display requirement
    return () => clearTimeout(timer);
  }, []);

  // 2. Handle video autoplay and browser autoplay restrictions
  useEffect(() => {
    if (isVideoMode && videoRef.current) {
      setVideoEnded(false);
      setVideoError(false);

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Autoplay with sound was blocked, attempting muted playback:", error);
          setIsMuted(true);
          // Retry playing muted
          videoRef.current?.play().catch((err) => {
            console.error("Video playback failed completely, falling back to logo animation:", err);
            setVideoError(true);
          });
        });
      }
    }
  }, [isVideoMode]);

  // 3. Monitor exit condition: minimum time has passed AND application is initialized/ready
  useEffect(() => {
    // For video mode, wait for the video to end OR the 3-second minimum time to elapse
    const timeIsMet = isVideoMode ? (videoEnded || minTimeElapsed) : minTimeElapsed;
    
    if (timeIsMet && appReady) {
      onComplete();
    }
  }, [minTimeElapsed, videoEnded, appReady, onComplete, isVideoMode]);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  const handleVideoError = () => {
    console.error("Default video intro asset (/intro.mp4) was not found or failed to load. Falling back to logo reveal animation.");
    setVideoError(true);
  };

  return (
    <motion.div
      className="focora-intro-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Video Background Layer */}
      {isVideoMode && (
        <div className="focora-intro-video-container">
          <video
            ref={videoRef}
            className="focora-intro-video"
            src={videoUrl}
            muted={isMuted}
            playsInline
            onEnded={handleVideoEnded}
            onError={handleVideoError}
          />
        </div>
      )}

      {/* Fallback Logo Animation Layer (Always rendered if not playing a video) */}
      {!isVideoMode && (
        <div className="focora-intro-content">
          <div className="focora-intro-logo-wrapper">
            <div className="focora-intro-glow" />
            <svg
              className="focora-intro-svg"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer circle ring */}
              <circle
                className="focora-intro-svg-ring"
                cx="50"
                cy="50"
                r="45"
                stroke="var(--color-accent, #818cf8)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Inner hourglass emblem */}
              <g className="focora-intro-svg-hourglass">
                <path
                  d="M35 32H65"
                  stroke="var(--color-accent, #818cf8)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M35 68H65"
                  stroke="var(--color-accent, #818cf8)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M38 32C38 46 48 50 48 50C48 50 38 54 38 68"
                  stroke="var(--color-accent, #818cf8)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M62 32C62 46 52 50 52 50C52 50 62 54 62 68"
                  stroke="var(--color-accent, #818cf8)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Sand particles */}
                <path
                  d="M48 39H52M49 43H51"
                  stroke="var(--color-accent, #818cf8)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M50 53V64"
                  stroke="var(--color-accent, #818cf8)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="2 3"
                />
                <path
                  d="M46 64H54M48 61H52"
                  stroke="var(--color-accent, #818cf8)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>
          <h1 className="focora-intro-title">focora</h1>
          <p className="focora-intro-subtitle">by Himanshu</p>
        </div>
      )}

      {/* Loading Status Indicator (Visible when minimum time is met but the background app is still initializing) */}
      {minTimeElapsed && !appReady && (
        <div className="focora-intro-status">
          <div className="focora-intro-spinner" />
          <span className="focora-intro-status-text">Readying your workspace...</span>
        </div>
      )}
    </motion.div>
  );
};

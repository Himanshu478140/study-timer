import { useEffect, useState } from 'react';

interface DailyProgressRingProps {
    completed: number;
    goal?: number;
    size?: number;
    strokeWidth?: number;
}

export const DailyProgressRing = ({
    completed,
    goal = 4,
    size = 48,
    strokeWidth = 4,
    showLabel = true
}: DailyProgressRingProps & { showLabel?: boolean }) => {
    const [progress, setProgress] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Animate progress
    useEffect(() => {
        const percentage = Math.min(completed / goal, 1);
        const offset = circumference - (percentage * circumference);
        // Small delay for animation
        const timer = setTimeout(() => setProgress(offset), 100);
        return () => clearTimeout(timer);
    }, [completed, goal, circumference]);

    return (
        <div className="daily-progress-ring flex-center" style={{ position: 'relative', width: size, height: size }}>
            {/* SVG Ring */}
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" />
                        <stop offset="100%" stopColor="#c084fc" /> {/* Brighter purple */}
                    </linearGradient>
                    <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Background Track */}
                <circle
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />

                {/* Progress Track */}
                <circle
                    stroke="url(#ringGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: progress,
                        transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: completed >= goal ? 'url(#ringGlow)' : 'none'
                    }}
                />
            </svg>

            {/* Center Content */}
            {showLabel && (
                <div style={{ position: 'absolute', fontSize: '0.8rem', fontWeight: '800', color: 'white' }}>
                    {Math.round((completed / goal) * 100)}%
                </div>
            )}
        </div>
    );
};

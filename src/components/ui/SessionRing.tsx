import React, { useEffect, useRef, memo } from 'react';

interface SessionRingProps {
  currentSession: number;
  totalSessions?: number;
  children: React.ReactNode;
  mode?: string; // Stability check prop
  completedModes?: string[];
}

/**
 * Decorative SVG ring drawn around a child element (the mode icon button).
 * Divided into N equal arc‑segments with small gaps.
 * Completed segments glow green; remaining segments are faint white.
 * When currentSession > totalSessions the ring resets and a ×N badge appears.
 */
export const SessionRing: React.FC<SessionRingProps> = memo(({
  currentSession,
  totalSessions = 4,
  children,
  mode = 'pomodoro',
  completedModes,
}) => {
  const prevSessionRef = useRef(currentSession);

  // Determine mode color mapping
  const getModeColor = (m: string) => {
    switch (m) {
      case 'pomodoro': return '#ef4444';
      case 'flow': return '#3b82f6';
      case 'deep_work': return '#a855f7';
      case 'custom': return '#22c55e';
      default: return '#ef4444';
    }
  };

  const getModeRgb = (m: string) => {
    switch (m) {
      case 'pomodoro': return '239, 68, 68';
      case 'flow': return '59, 130, 246';
      case 'deep_work': return '168, 85, 247';
      case 'custom': return '34, 197, 94';
      default: return '239, 68, 68';
    }
  };

  const colorAccent = getModeColor(mode);
  const rgbAccent = getModeRgb(mode);

  // Determine which "round" we're on and how many segments are filled this round
  const round = totalSessions > 0 ? Math.floor(currentSession / totalSessions) : 0;
  const filledThisRound = totalSessions > 0 ? currentSession % totalSessions : 0;
  // If perfectly divisible and > 0, that means last round was *just* completed
  const filled = currentSession > 0 && filledThisRound === 0 && round > 0
    ? totalSessions
    : filledThisRound;
  const showBadge = round >= 1;

  // Track the previously‑filled count so we know which segment just animated in
  useEffect(() => {
    prevSessionRef.current = currentSession;
  }, [currentSession]);

  // ── SVG geometry ──
  const padding = 6;          // px of ring padding outside the icon
  const strokeWidth = 2.5;
  const iconSize = 32;        // matches the 2rem icon button
  const svgSize = iconSize + padding * 2 + strokeWidth * 2;
  const center = svgSize / 2;
  const radius = iconSize / 2 + padding;
  const gapDeg = totalSessions <= 1 ? 0 : 8; // degrees between segments
  const totalGapDeg = gapDeg * totalSessions;
  const segDeg = totalSessions > 0 ? (360 - totalGapDeg) / totalSessions : 360;

  /** Convert polar to SVG cartesian (0° = top) */
  const polarToXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  };

  /** Build an arc path for a segment at index `i` */
  const arcPath = (i: number) => {
    const startDeg = i * (segDeg + gapDeg);
    const endDeg = startDeg + segDeg;
    const start = polarToXY(startDeg);
    const end = polarToXY(endDeg);
    const largeArc = segDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  return (
    <div
      className="session-ring-wrapper"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${svgSize}px`,
        height: `${svgSize}px`,
      }}
    >
      {/* SVG ring layer */}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {Array.from({ length: totalSessions }).map((_, i) => {
          const isFilled = i < filled;
          const justFilled = i === filled - 1 && currentSession !== prevSessionRef.current;
          
          // Use the mode of the completed session at index i, or fall back to the active mode
          const segmentMode = (completedModes && i < completedModes.length) 
            ? completedModes[i] 
            : mode;

          const segColorAccent = getModeColor(segmentMode);
          const segRgbAccent = getModeRgb(segmentMode);

          return (
            <path
              key={i}
              d={arcPath(i)}
              fill="none"
              stroke={isFilled ? segColorAccent : 'rgba(255, 255, 255, 0.2)'}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className={justFilled ? 'session-ring-segment-animate' : ''}
              style={{
                filter: isFilled ? `drop-shadow(0 0 3px rgba(${segRgbAccent}, 0.5))` : 'none',
                transition: 'stroke 0.4s ease, filter 0.4s ease',
              }}
            />
          );
        })}
      </svg>

      {/* Icon button (child) — centered */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* ×N badge when round >= 1 */}
      {showBadge && (
        <span
          className="session-ring-badge"
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: '-2px',
            background: colorAccent,
            color: '#0a0a0a',
            fontSize: '0.55rem',
            fontWeight: 800,
            lineHeight: 1,
            padding: '2px 4px',
            borderRadius: '6px',
            zIndex: 2,
            pointerEvents: 'none',
            boxShadow: `0 2px 6px rgba(${rgbAccent}, 0.4)`,
          }}
        >
          ×{round}
        </span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  const arraysEqual = (a?: string[], b?: string[]) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  return prevProps.currentSession === nextProps.currentSession &&
         prevProps.totalSessions === nextProps.totalSessions &&
         prevProps.mode === nextProps.mode &&
         arraysEqual(prevProps.completedModes, nextProps.completedModes);
});

SessionRing.displayName = 'SessionRing';

interface MiniAttendanceRingProps {
  percentage: number;
  color: string;
}

export const MiniAttendanceRing = ({ percentage, color }: MiniAttendanceRingProps) => {
  const ringSize = 32;
  const ringStroke = 3;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (percentage / 100) * ringCircumference;
  const ringColor = percentage >= 75 ? color : '#ef4444';

  return (
    <div style={{
      position: 'relative',
      width: `${ringSize}px`,
      height: `${ringSize}px`,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={ringRadius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={ringStroke}
          fill="transparent"
        />
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={ringRadius}
          stroke={ringColor}
          strokeWidth={ringStroke}
          strokeDasharray={ringCircumference}
          strokeDashoffset={ringOffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.4s ease',
            filter: `drop-shadow(0 0 3px ${ringColor}66)`
          }}
        />
      </svg>
      <span style={{
        position: 'absolute',
        fontSize: '0.5rem',
        fontWeight: 700,
        color: ringColor,
        lineHeight: 1
      }}>
        {percentage}
      </span>
    </div>
  );
};

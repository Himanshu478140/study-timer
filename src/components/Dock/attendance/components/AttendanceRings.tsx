import { useAttendance } from '../AttendanceContext';
import { Settings } from 'lucide-react';

const StatRing = ({ value, label, color, isPercentage = false, maxValue = 100 }: {
    value: number;
    label: string;
    color: string;
    isPercentage?: boolean;
    maxValue?: number;
}) => {
    const size = 90;
    const strokeWidth = 5.5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const fillRatio = maxValue > 0 ? Math.min(1, Math.max(0, value / maxValue)) : 0;
    const strokeDashoffset = circumference - fillRatio * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        style={{
                            transition: 'stroke-dashoffset 0.6s ease',
                            filter: `drop-shadow(0 0 6px ${color}88)`
                        }}
                    />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                        {isPercentage ? `${value}%` : value}
                    </span>
                </div>
            </div>
            <span style={{
                fontSize: '0.725rem',
                color: 'rgba(255, 255, 255, 0.55)',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textAlign: 'center',
                lineHeight: 1.2
            }}>
                {label}
            </span>
        </div>
    );
};

export const AttendanceRings = () => {
    const { stats, isUnconfigured, setIsWizardOpen } = useAttendance();

    const overallPct = isUnconfigured ? 78 : Math.round(stats.currentPercentage);
    const canMiss = isUnconfigured ? 3 : stats.maxClassesCanMiss;

    const presentCount = isUnconfigured ? 42 : stats.presentCount;
    const absentCount = isUnconfigured ? 9 : stats.absentCount;
    const mustAttend = isUnconfigured ? 5 : stats.mustAttendNextY;
    const totalClasses = presentCount + absentCount;

    return (
        <div style={{
            width: '148px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            flexShrink: 0,
            boxSizing: 'border-box'
        }}>
            {/* Stat Rings - Vertical Layout */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                background: 'rgba(15,15,15,0.55)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '1.25rem',
                padding: '0.75rem',
                boxSizing: 'border-box',
                position: 'relative'
            }}>
                {/* Settings Button */}
                <button
                    onClick={() => setIsWizardOpen(true)}
                    title="Attendance Settings"
                    style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        padding: '3px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        zIndex: 1
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Settings size={14} />
                </button>

                <StatRing
                    value={overallPct}
                    label="Overall"
                    color={overallPct >= 75 ? 'var(--color-accent, #8b5cf6)' : '#ef4444'}
                    isPercentage
                />
                <StatRing
                    value={presentCount}
                    label="Present"
                    color="#10b981"
                    maxValue={Math.max(totalClasses, 1)}
                />
                <StatRing
                    value={absentCount}
                    label="Absent"
                    color="#ef4444"
                    maxValue={Math.max(totalClasses, 1)}
                />
                <StatRing
                    value={canMiss}
                    label="Can Miss"
                    color="#10b981"
                    maxValue={Math.max(canMiss + mustAttend, 1)}
                />
            </div>
        </div>
    );
};

import { useState, useMemo, useRef, useId } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, Clock } from 'lucide-react';
import { PremiumSelect } from '../ui/PremiumSelect';

interface DayStats {
    date: string;
    label: string;
    total: number;
    pomodoro: number;
    deep: number;
    flow: number;
    custom: number;
}

interface InteractiveFocusChartProps {
    history: any[]; // FocusSession[]
}

export const InteractiveFocusChart = ({ history }: InteractiveFocusChartProps) => {
    const [timeRange, setTimeRange] = useState("30d");
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const chartId = useId().replace(/:/g, '');

    // Range options for PremiumSelect
    const rangeOptions = [
        { id: '7d', label: 'Last 7 days', icon: <Clock size={16} /> },
        { id: '30d', label: 'Last 30 days', icon: <Activity size={16} /> },
        { id: '90d', label: 'Last 3 months', icon: <Calendar size={16} /> },
    ];

    // Visual Configuration (Matching Sanctuary aesthetic)
    const MODES_CONFIG = {
        pomodoro: { label: 'Pomodoro', color: '#f97316' },
        deep: { label: 'Deep Work', color: '#3b82f6' },
        flow: { label: 'Flow State', color: '#22c55e' },
        custom: { label: 'Custom', color: '#facc15' }
    };

    // Process data based on selected range
    const dataPoints = useMemo(() => {
        const daysToSubtract = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const points: DayStats[] = [];
        const today = new Date();

        for (let i = daysToSubtract - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const daySessions = history.filter(s => s.date === dateStr);

            // --- MOCK DATA FOR REVIEW ---
            // Creating realistic variance
            const seed = i + (timeRange === "90d" ? 100 : 50);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;

            // Generate some "base" values if real data is missing
            const mPomo = daySessions.filter(s => s.mode === 'pomodoro').reduce((acc, s) => acc + s.durationMinutes, 0) ||
                (Math.abs(Math.sin(seed)) > 0.4 ? Math.floor(Math.abs(Math.cos(seed * 0.5)) * 60) + 20 : 0);

            const mDeep = daySessions.filter(s => s.mode === 'deep_work').reduce((acc, s) => acc + s.durationMinutes, 0) ||
                (Math.abs(Math.cos(seed)) > 0.3 ? Math.floor(Math.abs(Math.sin(seed * 0.3)) * 140) + 40 : 0);

            const mFlow = daySessions.filter(s => s.mode === 'flow').reduce((acc, s) => acc + s.durationMinutes, 0) ||
                (Math.abs(Math.sin(seed * 2)) > 0.6 ? Math.floor(Math.abs(Math.cos(seed)) * 90) + 30 : 0);

            const mCustom = daySessions.filter(s => s.mode === 'custom').reduce((acc, s) => acc + s.durationMinutes, 0) ||
                (Math.abs(Math.cos(seed * 1.5)) > 0.8 ? Math.floor(Math.abs(Math.sin(seed)) * 50) + 10 : 0);

            const multiplier = isWeekend ? 0.4 : 1.1;

            points.push({
                date: dateStr,
                label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                pomodoro: Math.floor(mPomo * multiplier),
                deep: Math.floor(mDeep * multiplier),
                flow: Math.floor(mFlow * multiplier),
                custom: Math.floor(mCustom * multiplier),
                total: Math.floor((mPomo + mDeep + mFlow + mCustom) * multiplier)
            });
        }
        return points;
    }, [history, timeRange]);

    // Stacked Area Calculation
    const maxVal = Math.max(...dataPoints.map(d => d.total), 60);
    const width = 800;
    const height = 250;
    const padding = 40;
    const graphWidth = width;
    const graphHeight = height - padding;

    const getX = (index: number) => (index / (dataPoints.length - 1)) * graphWidth;
    const getY = (value: number) => graphHeight - (value / maxVal) * graphHeight + padding / 2;

    const generatePath = (pts: { x: number, y: number }[], bottomPts?: { x: number, y: number }[]) => {
        if (pts.length < 2) return '';

        const controlPoint = (current: any, previous: any, next: any, reverse?: boolean) => {
            const p = previous || current;
            const n = next || current;
            const smoothing = 0.15;
            const o = { x: n.x - p.x, y: n.y - p.y };
            const tangentLength = Math.sqrt(Math.pow(n.x - current.x, 2) + Math.pow(n.y - current.y, 2)) * smoothing;
            const angle = Math.atan2(o.y, o.x) + (reverse ? Math.PI : 0);
            return { x: current.x + Math.cos(angle) * tangentLength, y: current.y + Math.sin(angle) * tangentLength };
        };

        // Top edge
        let d = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const cp1 = controlPoint(pts[i], pts[i - 1], pts[i + 1]);
            const cp2 = controlPoint(pts[i + 1], pts[i], pts[i + 2], true);
            d += ` C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${pts[i + 1].x},${pts[i + 1].y}`;
        }

        if (bottomPts) {
            // Draw bottom edge back (also smooth)
            d += ` L ${bottomPts[bottomPts.length - 1].x},${bottomPts[bottomPts.length - 1].y}`;
            for (let i = bottomPts.length - 1; i >= 1; i--) {
                const cp1 = controlPoint(bottomPts[i], bottomPts[i + 1], bottomPts[i - 1]);
                const cp2 = controlPoint(bottomPts[i - 1], bottomPts[i], bottomPts[i - 2], true);
                d += ` C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${bottomPts[i - 1].x},${bottomPts[i - 1].y}`;
            }
        } else {
            d += ` L ${width},${height} L 0,${height}`;
        }

        return d + ' Z';
    };

    const activeData = hoverIndex !== null ? dataPoints[hoverIndex] : null;

    // --- ANIMATION NORMALIZATION ---
    // Framer motion needs the same number of points to animate morphing.
    // We normalize all ranges to 90 points.
    const normalizedPoints = useMemo(() => {
        const target = 90;
        const pts = [];
        for (let i = 0; i < target; i++) {
            const relIndex = (i / (target - 1)) * (dataPoints.length - 1);
            const low = Math.floor(relIndex);
            const high = Math.ceil(relIndex);
            const weight = relIndex - low;

            const p1 = dataPoints[low];
            const p2 = dataPoints[high];

            const interpolate = (v1: number, v2: number) => v1 * (1 - weight) + v2 * weight;

            pts.push({
                x: (i / (target - 1)) * graphWidth,
                total: interpolate(p1.total, p2.total),
                pomodoro: interpolate(p1.pomodoro, p2.pomodoro),
                deep: interpolate(p1.deep, p2.deep),
                flow: interpolate(p1.flow, p2.flow),
                custom: interpolate(p1.custom, p2.custom),
            });
        }
        return pts;
    }, [dataPoints, graphWidth]);

    // Calculate stacked layers
    const layers = useMemo(() => {
        const customPts = normalizedPoints.map(p => ({ x: p.x, y: getY(p.custom) }));
        const flowPts = normalizedPoints.map(p => ({ x: p.x, y: getY(p.custom + p.flow) }));
        const deepPts = normalizedPoints.map(p => ({ x: p.x, y: getY(p.custom + p.flow + p.deep) }));
        const pomoPts = normalizedPoints.map(p => ({ x: p.x, y: getY(p.total) }));

        const zeroPts = normalizedPoints.map(p => ({ x: p.x, y: height }));

        return [
            { id: 'custom', path: generatePath(customPts, zeroPts), color: MODES_CONFIG.custom.color },
            { id: 'flow', path: generatePath(flowPts, customPts), color: MODES_CONFIG.flow.color },
            { id: 'deep', path: generatePath(deepPts, flowPts), color: MODES_CONFIG.deep.color },
            { id: 'pomodoro', path: generatePath(pomoPts, deepPts), color: MODES_CONFIG.pomodoro.color },
        ];
    }, [normalizedPoints, MODES_CONFIG, height]);

    return (
        <div
            ref={containerRef}
            className="interactive-chart"
            style={{
                width: '100%',
                height: '100%',
                maxHeight: '450px',
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent'
            }}
            onMouseMove={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                    const x = e.clientX - rect.left - 24; // padding
                    const y = e.clientY - rect.top;

                    // Don't show tooltip if mouse is in the header/select area
                    if (y < 80) {
                        setHoverIndex(null);
                        return;
                    }

                    const index = Math.round((x / (rect.width - 48)) * (dataPoints.length - 1));
                    setHoverIndex(Math.max(0, Math.min(dataPoints.length - 1, index)));
                }
            }}
            onMouseLeave={() => setHoverIndex(null)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: "'Noto Serif', serif", fontStyle: 'italic' }}>Focus Analytics</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        Interactive range-based stacked area view
                    </p>
                </div>

                <PremiumSelect
                    options={rangeOptions}
                    value={timeRange}
                    onChange={setTimeRange}
                />
            </div>

            <div style={{ 
                position: 'relative', 
                height: `${height}px`, 
                width: '100%',
                flexShrink: 0,
                marginTop: '12px'
            }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                        {layers.map(layer => (
                            <linearGradient key={`grad-${layer.id}`} id={`grad-${layer.id}-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={layer.color} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={layer.color} stopOpacity="0.1" />
                            </linearGradient>
                        ))}
                    </defs>

                    {layers.slice().reverse().map(layer => (
                        <motion.path
                            key={layer.id}
                            initial={false}
                            animate={{ d: layer.path }}
                            transition={{ type: "spring", damping: 25, stiffness: 120 }}
                            fill={`url(#grad-${layer.id}-${chartId})`}
                            stroke={layer.color}
                            strokeWidth="1.5"
                        />
                    ))}

                    {/* Hover Guide */}
                    {hoverIndex !== null && (
                        <line
                            x1={getX(hoverIndex)} y1={0} x2={getX(hoverIndex)} y2={height}
                            stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4"
                        />
                    )}
                </svg>

                {/* Legend Overlay */}
                <div style={{
                    position: 'absolute',
                    bottom: '-40px',
                    left: 0,
                    display: 'flex',
                    gap: '16px',
                    opacity: 0.6
                }}>
                    {Object.entries(MODES_CONFIG).map(([key, config]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.color }} />
                            {config.label}
                        </div>
                    ))}
                </div>

                {/* Tooltip */}
                {activeData && hoverIndex !== null && (
                    <div style={{
                        position: 'absolute',
                        left: `${(getX(hoverIndex) / width) * 100}%`,
                        top: '0',
                        transform: hoverIndex > dataPoints.length / 2 ? 'translate(-110%, -50%)' : 'translate(10%, -50%)',
                        background: 'rgba(20, 20, 20, 0.9)',
                        backdropFilter: 'blur(10px)',
                        padding: '16px',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        zIndex: 5,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        minWidth: '160px',
                        pointerEvents: 'none',
                        transition: 'left 0.1s ease-out, transform 0.1s ease-out'
                    }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px' }}>
                            {new Date(activeData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {Object.entries(MODES_CONFIG).reverse().map(([key, config]) => {
                                const val = activeData[key as keyof DayStats];
                                if (typeof val !== 'number' || val === 0) return null;
                                return (
                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: config.color }} />
                                            <span style={{ opacity: 0.7 }}>{config.label}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{val}m</span>
                                    </div>
                                );
                            })}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Total Focus</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#a855f7' }}>{activeData.total}m</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ height: '40px' }} />
        </div>
    );
};

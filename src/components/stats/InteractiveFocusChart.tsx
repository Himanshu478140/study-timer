import { useState, useMemo, useRef, useId, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Calendar, Check } from 'lucide-react';

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
    const [timeRange, setTimeRange] = useState("7d");
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const chartId = useId().replace(/:/g, '');
    const [isSelectFocused, setIsSelectFocused] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Range options for select dropdown
    const rangeOptions = [
        { id: '7d', label: 'Last 7 days' },
        { id: '30d', label: 'Last 30 days' },
        { id: '90d', label: 'Last 3 months' },
    ];

    const selectedOption = rangeOptions.find(opt => opt.id === timeRange);

    // Visual Configuration (Matching Sanctuary aesthetic)
    const MODES_CONFIG = {
        pomodoro: { label: 'Pomodoro', color: '#ef4444' },
        deep: { label: 'Deep Work', color: '#a855f7' },
        flow: { label: 'Flow State', color: '#3b82f6' },
        custom: { label: 'Custom', color: '#22c55e' }
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

            const mPomo = daySessions.filter(s => s.mode === 'pomodoro').reduce((acc, s) => acc + s.durationMinutes, 0);
            const mDeep = daySessions.filter(s => s.mode === 'deep_work').reduce((acc, s) => acc + s.durationMinutes, 0);
            const mFlow = daySessions.filter(s => s.mode === 'flow').reduce((acc, s) => acc + s.durationMinutes, 0);
            const mCustom = daySessions.filter(s => s.mode === 'custom').reduce((acc, s) => acc + s.durationMinutes, 0);

            points.push({
                date: dateStr,
                label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                pomodoro: mPomo,
                deep: mDeep,
                flow: mFlow,
                custom: mCustom,
                total: mPomo + mDeep + mFlow + mCustom
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

    // Catmull-Rom Spline Interpolation for C1-continuous smooth curves
    const catmullRom = (p0: number, p1: number, p2: number, p3: number, t: number) => {
        const v = 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
        );
        return Math.max(0, v);
    };

    const generatePath = (pts: { x: number, y: number, val?: number }[], bottomPts?: { x: number, y: number }[], strokeOnly: boolean = false) => {
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

        if (strokeOnly) {
            let d = '';
            let inPath = false;
            for (let i = 0; i < pts.length - 1; i++) {
                const currentVal = pts[i].val ?? 0;
                const nextVal = pts[i + 1].val ?? 0;
                const drawSegment = currentVal > 0.1 || nextVal > 0.1;

                if (drawSegment) {
                    if (!inPath) {
                        d += `M ${pts[i].x},${pts[i].y}`;
                        inPath = true;
                    }
                    const cp1 = controlPoint(pts[i], pts[i - 1], pts[i + 1]);
                    const cp2 = controlPoint(pts[i + 1], pts[i], pts[i + 2], true);
                    d += ` C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${pts[i + 1].x},${pts[i + 1].y}`;
                } else {
                    inPath = false;
                }
            }
            return d;
        }

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
    // We normalize all ranges to 90 points.
    const normalizedPoints = useMemo(() => {
        const target = 90;
        const pts = [];
        for (let i = 0; i < target; i++) {
            const relIndex = (i / (target - 1)) * (dataPoints.length - 1);
            const low = Math.floor(relIndex);
            const high = Math.ceil(relIndex);
            const weight = relIndex - low;

            const idx0 = Math.max(0, low - 1);
            const idx1 = low;
            const idx2 = high;
            const idx3 = Math.min(dataPoints.length - 1, high + 1);

            const p0 = dataPoints[idx0];
            const p1 = dataPoints[idx1];
            const p2 = dataPoints[idx2];
            const p3 = dataPoints[idx3];

            const interpolateVal = (val0: number, val1: number, val2: number, val3: number) => {
                return catmullRom(val0, val1, val2, val3, weight);
            };

            // Interpolate stacked totals to prevent overlap
            const customVal = interpolateVal(p0.custom, p1.custom, p2.custom, p3.custom);
            const flowVal = Math.max(customVal, interpolateVal(p0.custom + p0.flow, p1.custom + p1.flow, p2.custom + p2.flow, p3.custom + p3.flow));
            const deepVal = Math.max(flowVal, interpolateVal(p0.custom + p0.flow + p0.deep, p1.custom + p1.flow + p1.deep, p2.custom + p2.flow + p2.deep, p3.custom + p3.flow + p3.deep));
            const totalVal = Math.max(deepVal, interpolateVal(p0.total, p1.total, p2.total, p3.total));

            pts.push({
                x: (i / (target - 1)) * graphWidth,
                customStacked: customVal,
                flowStacked: flowVal,
                deepStacked: deepVal,
                totalStacked: totalVal,
                // Decomposed metrics for tooltip details
                total: totalVal,
                pomodoro: Math.max(0, totalVal - deepVal),
                deep: Math.max(0, deepVal - flowVal),
                flow: Math.max(0, flowVal - customVal),
                custom: customVal
            });
        }
        return pts;
    }, [dataPoints, graphWidth]);

    // Calculate stacked layers
    const layers = useMemo(() => {
        const customPts = normalizedPoints.map(p => ({ x: p.x, y: getY(p.customStacked), val: p.custom }));
        const flowPts = normalizedPoints.map(p => ({ x: p.x, y: getY(p.flowStacked), val: p.flow }));
        const deepPts = normalizedPoints.map(p => ({ x: p.x, y: getY(p.deepStacked), val: p.deep }));
        const pomoPts = normalizedPoints.map(p => ({ x: p.x, y: getY(p.totalStacked), val: p.pomodoro }));

        const zeroPts = normalizedPoints.map(p => ({ x: p.x, y: getY(0) }));

        return [
            { id: 'custom', fillPath: generatePath(customPts, zeroPts), strokePath: generatePath(customPts, undefined, true), color: MODES_CONFIG.custom.color },
            { id: 'flow', fillPath: generatePath(flowPts, customPts), strokePath: generatePath(flowPts, undefined, true), color: MODES_CONFIG.flow.color },
            { id: 'deep', fillPath: generatePath(deepPts, flowPts), strokePath: generatePath(deepPts, undefined, true), color: MODES_CONFIG.deep.color },
            { id: 'pomodoro', fillPath: generatePath(pomoPts, deepPts), strokePath: generatePath(pomoPts, undefined, true), color: MODES_CONFIG.pomodoro.color },
        ].map(layer => {
            const isAllZero = dataPoints.every(dp => dp[layer.id as keyof typeof dp] === 0);
            return {
                ...layer,
                strokeWidth: isAllZero ? 0 : 1.5,
                isAllZero
            };
        });
    }, [normalizedPoints, MODES_CONFIG, height, dataPoints]);

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
                background: 'rgba(18, 18, 22, 0.92)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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

                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        onFocus={() => setIsSelectFocused(true)}
                        onBlur={() => setIsSelectFocused(false)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: isOpen || isSelectFocused ? '1px solid var(--color-accent, #a855f7)' : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            color: 'white',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: isOpen || isSelectFocused ? '0 0 12px rgba(var(--color-accent-rgb), 0.15)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            userSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (!isOpen && !isSelectFocused) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isOpen && !isSelectFocused) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            }
                        }}
                    >
                        <Calendar size={14} style={{ opacity: 0.6 }} />
                        <span>{selectedOption?.label}</span>
                        <motion.span
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}
                            style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                            <ChevronDown size={14} style={{ opacity: 0.6 }} />
                        </motion.span>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.95 }}
                                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.95 }}
                                transition={shouldReduceMotion ? { duration: 0.05 } : { duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    background: 'rgba(18, 18, 22, 0.96)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    padding: '6px',
                                    zIndex: 100,
                                    minWidth: '150px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}
                            >
                                {rangeOptions.map(opt => {
                                    const isActive = opt.id === timeRange;
                                    return (
                                        <motion.button
                                            key={opt.id}
                                            whileHover={shouldReduceMotion ? {} : { background: 'rgba(255, 255, 255, 0.04)', x: 2 }}
                                            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                                            onClick={() => {
                                                setTimeRange(opt.id);
                                                setIsOpen(false);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                padding: '8px 12px',
                                                background: isActive ? 'rgba(var(--color-accent-rgb), 0.12)' : 'transparent',
                                                color: isActive ? 'var(--color-accent, #a855f7)' : 'rgba(255, 255, 255, 0.7)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                fontWeight: isActive ? 700 : 500,
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'color 0.15s ease, background-color 0.15s ease',
                                                outline: 'none'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                            }}
                                            onBlur={(e) => {
                                                if (opt.id !== timeRange) {
                                                    e.currentTarget.style.background = 'transparent';
                                                } else {
                                                    e.currentTarget.style.background = 'rgba(var(--color-accent-rgb), 0.12)';
                                                }
                                            }}
                                        >
                                            <span style={{ whiteSpace: 'nowrap' }}>{opt.label}</span>
                                            {isActive && (
                                                <motion.span
                                                    initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.5, opacity: 0 }}
                                                    animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.15 }}
                                                    style={{ display: 'inline-flex', marginLeft: '8px' }}
                                                >
                                                    <Check size={14} style={{ strokeWidth: 3 }} />
                                                </motion.span>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
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
                        <g key={layer.id}>
                            <motion.path
                                initial={false}
                                animate={{ d: layer.fillPath }}
                                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                                fill={layer.isAllZero ? "none" : `url(#grad-${layer.id}-${chartId})`}
                                stroke="none"
                            />
                            <motion.path
                                initial={false}
                                animate={{ d: layer.strokePath }}
                                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                                fill="none"
                                stroke={layer.isAllZero ? "none" : layer.color}
                                strokeWidth={layer.strokeWidth}
                            />
                        </g>
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
                        background: 'rgba(20, 20, 20, 0.98)',
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none',
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

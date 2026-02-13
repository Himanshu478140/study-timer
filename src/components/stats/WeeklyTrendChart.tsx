import { useState, useMemo, useRef, useId } from 'react';

// Explicit interface for data points
interface DayStats {
    date: string;
    label: string;
    value: number;
    pomodoro: number;
    deep: number;
    flow: number;
    custom: number;
    ambient: number;
}

interface WeeklyTrendChartProps {
    history: any[]; // FocusSession[]
    minimal?: boolean;
}

export const WeeklyTrendChart = ({ history, minimal = false }: WeeklyTrendChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const chartId = useId().replace(/:/g, '');

    // --- VISUAL CONFIGURATION ---
    const GRAPH_CONFIG = {
        total: { color: '168, 85, 247', stroke: '#a855f7', fillOpacity: 0.7, strokeOpacity: 1 }, // Purple
        pomo: { color: '249, 115, 22', stroke: '#f97316', fillOpacity: 0.15, strokeOpacity: 0.3 }, // Orange
        deep: { color: '59, 130, 246', stroke: '#3b82f6', fillOpacity: 0.15, strokeOpacity: 0.3 }, // Blue
        flow: { color: '34, 197, 94', stroke: '#22c55e', fillOpacity: 0.15, strokeOpacity: 0.3 },  // Green
        custom: { color: '250, 204, 21', stroke: '#facc15', fillOpacity: 0.15, strokeOpacity: 0.3 }, // Yellow/Gold
        ambient: { color: '34, 211, 238', stroke: '#22d3ee', fillOpacity: 0.15, strokeOpacity: 0.3 } // Cyan
    };

    // Process data for the last 7 days
    const dataPoints: DayStats[] = useMemo(() => {
        const days: DayStats[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

            const daySessions = history.filter(s => s.date === dateStr);
            const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

            // Metrics Breakdown
            const pomodoroMins = daySessions.filter(s => s.mode === 'pomodoro').reduce((acc, s) => acc + s.durationMinutes, 0);
            const deepMins = daySessions.filter(s => s.mode === 'deep_work').reduce((acc, s) => acc + s.durationMinutes, 0);
            const flowMins = daySessions.filter(s => s.mode === 'flow').reduce((acc, s) => acc + s.durationMinutes, 0);
            const customMins = daySessions.filter(s => s.mode === 'custom').reduce((acc, s) => acc + s.durationMinutes, 0);
            const ambientMins = daySessions.filter(s => s.mode === 'ambient').reduce((acc, s) => acc + s.durationMinutes, 0);

            days.push({
                date: dateStr,
                label: dayLabel,
                value: totalMinutes,
                pomodoro: pomodoroMins,
                deep: deepMins,
                flow: flowMins,
                custom: customMins,
                ambient: ambientMins
            });
        }
        return days;
    }, [history]);

    // Active Data Point (Safe Access)
    const activeData = hoverIndex !== null && dataPoints[hoverIndex] ? dataPoints[hoverIndex] : null;

    // Chart Dimensions
    const width = 300;
    const height = 120;
    const padding = 20;
    const graphWidth = width;
    const graphHeight = height - padding;

    // Scales
    const maxVal = Math.max(...dataPoints.map(d => d.value), 60);

    const getX = (index: number) => (index / (dataPoints.length - 1)) * graphWidth;
    const getY = (value: number) => graphHeight - (value / maxVal) * graphHeight + padding / 2;

    // Generate Points
    const pointsTotal = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.value), ...d }));
    const pointsPomo = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.pomodoro), ...d }));
    const pointsDeep = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.deep), ...d }));
    const pointsFlow = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.flow), ...d }));
    const pointsCustom = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.custom), ...d }));
    const pointsAmbient = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.ambient), ...d }));

    // Generate Smooth Path
    const generatePath = (pts: { x: number, y: number }[], close: boolean = false) => {
        if (pts.length === 0) return '';

        const controlPoint = (current: any, previous: any, next: any, reverse?: boolean) => {
            const p = previous || current;
            const n = next || current;
            const smoothing = 0.4;
            const o = { x: n.x - p.x, y: n.y - p.y };

            const tangentLength = Math.sqrt(Math.pow(n.x - current.x, 2) + Math.pow(n.y - current.y, 2)) * smoothing;
            const angle = Math.atan2(o.y, o.x) + (reverse ? Math.PI : 0);
            return { x: current.x + Math.cos(angle) * tangentLength, y: current.y + Math.sin(angle) * tangentLength };
        };

        let d = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i - 1]; const p1 = pts[i]; const p2 = pts[i + 1]; const p3 = pts[i + 2];
            const cp1 = controlPoint(p1, p0, p2); const cp2 = controlPoint(p2, p1, p3, true);
            d += ` C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y}`;
        }
        if (close) d += ` L ${width},${height} L 0,${height} Z`;
        return d;
    };

    // Paths
    const pathTotal = { stroke: generatePath(pointsTotal), fill: generatePath(pointsTotal, true) };
    const pathPomo = { stroke: generatePath(pointsPomo), fill: generatePath(pointsPomo, true) };
    const pathDeep = { stroke: generatePath(pointsDeep), fill: generatePath(pointsDeep, true) };
    const pathFlow = { stroke: generatePath(pointsFlow), fill: generatePath(pointsFlow, true) };
    const pathCustom = { stroke: generatePath(pointsCustom), fill: generatePath(pointsCustom, true) };
    const pathAmbient = { stroke: generatePath(pointsAmbient), fill: generatePath(pointsAmbient, true) };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const index = Math.round((x / rect.width) * (dataPoints.length - 1));
        const clampedIndex = Math.max(0, Math.min(dataPoints.length - 1, index));
        setHoverIndex(clampedIndex);
    };

    return (
        <div ref={containerRef} className="widget-card-glass" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', padding: minimal ? 0 : '1.5rem', overflow: 'visible', background: 'transparent', boxShadow: 'none', border: 'none' }} onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIndex(null)}>
            {!minimal && (
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Performance</h3>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px', minHeight: '18px' }}>
                            Last 7 Days
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '180px' }}>
                        {/* Static Legend */}
                        {[
                            { color: GRAPH_CONFIG.total.stroke, label: 'Total' },
                            { color: GRAPH_CONFIG.pomo.stroke, label: 'Pomo' },
                            { color: GRAPH_CONFIG.deep.stroke, label: 'Deep' },
                            { color: GRAPH_CONFIG.flow.stroke, label: 'Flow' },
                            { color: GRAPH_CONFIG.custom.stroke, label: 'Custom' },
                            { color: GRAPH_CONFIG.ambient.stroke, label: 'Ambient' }
                        ].map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: l.color }} /> {l.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '100px' }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                        <filter id={`glow-${chartId}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>

                        <linearGradient id={`gTotal-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={GRAPH_CONFIG.total.stroke} stopOpacity={GRAPH_CONFIG.total.fillOpacity} />
                            <stop offset="100%" stopColor={GRAPH_CONFIG.total.stroke} stopOpacity="0" />
                        </linearGradient>

                        <linearGradient id={`gPomo-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={GRAPH_CONFIG.pomo.stroke} stopOpacity={GRAPH_CONFIG.pomo.fillOpacity} />
                            <stop offset="100%" stopColor={GRAPH_CONFIG.pomo.stroke} stopOpacity="0" />
                        </linearGradient>

                        <linearGradient id={`gDeep-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={GRAPH_CONFIG.deep.stroke} stopOpacity={GRAPH_CONFIG.deep.fillOpacity} />
                            <stop offset="100%" stopColor={GRAPH_CONFIG.deep.stroke} stopOpacity="0" />
                        </linearGradient>

                        <linearGradient id={`gFlow-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={GRAPH_CONFIG.flow.stroke} stopOpacity={GRAPH_CONFIG.flow.fillOpacity} />
                            <stop offset="100%" stopColor={GRAPH_CONFIG.flow.stroke} stopOpacity="0" />
                        </linearGradient>

                        <linearGradient id={`gCustom-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={GRAPH_CONFIG.custom.stroke} stopOpacity={GRAPH_CONFIG.custom.fillOpacity} />
                            <stop offset="100%" stopColor={GRAPH_CONFIG.custom.stroke} stopOpacity="0" />
                        </linearGradient>

                        <linearGradient id={`gAmbient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={GRAPH_CONFIG.ambient.stroke} stopOpacity={GRAPH_CONFIG.ambient.fillOpacity} />
                            <stop offset="100%" stopColor={GRAPH_CONFIG.ambient.stroke} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Rendering Order: Background to Foreground */}

                    <path d={pathTotal.fill} fill={`url(#gTotal-${chartId})`} />
                    <path d={pathTotal.stroke} fill="none" stroke={GRAPH_CONFIG.total.stroke} strokeWidth="2" opacity={GRAPH_CONFIG.total.strokeOpacity} />

                    <path d={pathPomo.fill} fill={`url(#gPomo-${chartId})`} style={{ mixBlendMode: 'screen' }} />
                    <path d={pathPomo.stroke} fill="none" stroke={GRAPH_CONFIG.pomo.stroke} strokeWidth="2" filter={`url(#glow-${chartId})`} opacity={GRAPH_CONFIG.pomo.strokeOpacity} />

                    <path d={pathDeep.fill} fill={`url(#gDeep-${chartId})`} style={{ mixBlendMode: 'screen' }} />
                    <path d={pathDeep.stroke} fill="none" stroke={GRAPH_CONFIG.deep.stroke} strokeWidth="2" filter={`url(#glow-${chartId})`} opacity={GRAPH_CONFIG.deep.strokeOpacity} />

                    <path d={pathFlow.fill} fill={`url(#gFlow-${chartId})`} style={{ mixBlendMode: 'screen' }} />
                    <path d={pathFlow.stroke} fill="none" stroke={GRAPH_CONFIG.flow.stroke} strokeWidth="2" filter={`url(#glow-${chartId})`} opacity={GRAPH_CONFIG.flow.strokeOpacity} />

                    <path d={pathCustom.fill} fill={`url(#gCustom-${chartId})`} style={{ mixBlendMode: 'screen' }} />
                    <path d={pathCustom.stroke} fill="none" stroke={GRAPH_CONFIG.custom.stroke} strokeWidth="2" filter={`url(#glow-${chartId})`} opacity={GRAPH_CONFIG.custom.strokeOpacity} />

                    <path d={pathAmbient.fill} fill={`url(#gAmbient-${chartId})`} style={{ mixBlendMode: 'screen' }} />
                    <path d={pathAmbient.stroke} fill="none" stroke={GRAPH_CONFIG.ambient.stroke} strokeWidth="2" filter={`url(#glow-${chartId})`} opacity={GRAPH_CONFIG.ambient.strokeOpacity} />

                    {/* Hover Dots */}
                    {activeData && hoverIndex !== null && (
                        <>
                            <circle cx={pointsTotal[hoverIndex].x} cy={pointsTotal[hoverIndex].y} r={4} fill="#a855f7" />
                            <circle cx={pointsPomo[hoverIndex].x} cy={pointsPomo[hoverIndex].y} r={4} fill="#f97316" stroke="#fff" strokeWidth={1} />
                            <circle cx={pointsDeep[hoverIndex].x} cy={pointsDeep[hoverIndex].y} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={1} />
                            <circle cx={pointsFlow[hoverIndex].x} cy={pointsFlow[hoverIndex].y} r={4} fill="#22c55e" stroke="#fff" strokeWidth={1} />
                            <circle cx={pointsCustom[hoverIndex].x} cy={pointsCustom[hoverIndex].y} r={4} fill="#facc15" stroke="#fff" strokeWidth={1} />
                            <circle cx={pointsAmbient[hoverIndex].x} cy={pointsAmbient[hoverIndex].y} r={4} fill="#22d3ee" stroke="#fff" strokeWidth={1} />

                            <line x1={pointsTotal[hoverIndex].x} y1={0} x2={pointsTotal[hoverIndex].x} y2={height} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
                        </>
                    )}
                </svg>

                {/* Smart Tooltip - Flips side based on index */}
                {activeData && hoverIndex !== null && (
                    <div style={{
                        position: 'absolute',
                        left: `${(pointsTotal[hoverIndex].x / width) * 100}%`,
                        top: '50%', // Center vertically
                        transform: hoverIndex > 3
                            ? 'translate(-110%, -50%)'
                            : 'translate(10%, -50%)',
                        background: 'transparent',
                        padding: '0', // Minimal padding
                        border: 'none',
                        pointerEvents: 'none',
                        zIndex: 40,
                        minWidth: 'auto', // Shrink to fit
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            // Strong text shadow acting as black border
                            textShadow: '0.5px 0.5px 0 #000, -0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000'
                        }}>
                            <div style={{ color: GRAPH_CONFIG.pomo.stroke }}>{activeData.pomodoro}m</div>
                            <div style={{ color: GRAPH_CONFIG.deep.stroke }}>{activeData.deep}m</div>
                            <div style={{ color: GRAPH_CONFIG.flow.stroke }}>{activeData.flow}m</div>
                            <div style={{ color: GRAPH_CONFIG.custom.stroke }}>{activeData.custom}m</div>
                            <div style={{ color: GRAPH_CONFIG.ambient.stroke }}>{activeData.ambient}m</div>
                            <div style={{ color: GRAPH_CONFIG.total.stroke, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '2px', marginTop: '2px' }}>{activeData.value}m</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', padding: '0 4px' }}>
                {pointsTotal.map((p, i) => (
                    <div key={i} style={{ fontSize: '0.7rem', color: hoverIndex === i ? 'white' : 'rgba(255,255,255,0.5)', transition: 'color 0.2s', width: '24px', textAlign: 'center' }}>{p.label}</div>
                ))}
            </div>
        </div>
    );
};
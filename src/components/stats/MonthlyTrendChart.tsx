import { useState, useMemo, useRef, useId } from 'react';

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

interface MonthlyTrendChartProps {
    history: any[]; // FocusSession[]
}

export const MonthlyTrendChart = ({ history }: MonthlyTrendChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const chartId = useId().replace(/:/g, '');

    // --- VISUAL CONFIGURATION ---
    const GRAPH_CONFIG = {
        total: { color: '168, 85, 247', stroke: '#a855f7', fillOpacity: 0.7, strokeOpacity: 1 },
        pomo: { color: '249, 115, 22', stroke: '#f97316', fillOpacity: 0.15, strokeOpacity: 0.4 },
        deep: { color: '59, 130, 246', stroke: '#3b82f6', fillOpacity: 0.15, strokeOpacity: 0.4 },
        flow: { color: '34, 197, 94', stroke: '#22c55e', fillOpacity: 0.15, strokeOpacity: 0.4 },
        custom: { color: '250, 204, 21', stroke: '#facc15', fillOpacity: 0.15, strokeOpacity: 0.4 },
        ambient: { color: '34, 211, 238', stroke: '#22d3ee', fillOpacity: 0.15, strokeOpacity: 0.4 }
    };

    // Process data for the last 30 days
    const dataPoints: DayStats[] = useMemo(() => {
        const days: DayStats[] = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // For monthly, we show date numbers every few days to avoid clutter
            const dayLabel = (i % 5 === 0 || i === 0 || i === 29)
                ? d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                : '';

            const daySessions = history.filter(s => s.date === dateStr);
            const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

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

    const activeData = hoverIndex !== null && dataPoints[hoverIndex] ? dataPoints[hoverIndex] : null;

    // Chart Dimensions
    const width = 600; // Wider for a month
    const height = 180;
    const padding = 30;
    const graphWidth = width;
    const graphHeight = height - padding;

    const maxVal = Math.max(...dataPoints.map(d => d.value), 60);

    const getX = (index: number) => (index / (dataPoints.length - 1)) * graphWidth;
    const getY = (value: number) => graphHeight - (value / maxVal) * graphHeight + padding / 2;

    const generatePath = (pts: { x: number, y: number }[], close: boolean = false) => {
        if (pts.length === 0) return '';
        let d = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p2 = pts[i + 1];
            // Linear for monthly to keep it crisp with many points
            d += ` L ${p2.x},${p2.y}`;
        }
        if (close) d += ` L ${width},${height} L 0,${height} Z`;
        return d;
    };

    const pointsTotal = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.value) }));
    const pointsPomo = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.pomodoro) }));
    const pointsDeep = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.deep) }));
    const pointsFlow = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.flow) }));
    const pointsCustom = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.custom) }));
    const pointsAmbient = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.ambient) }));

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const index = Math.round((x / rect.width) * (dataPoints.length - 1));
        const clampedIndex = Math.max(0, Math.min(dataPoints.length - 1, index));
        setHoverIndex(clampedIndex);
    };

    return (
        <div ref={containerRef} className="monthly-chart-container" style={{ width: '100%', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }} onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIndex(null)}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Monthly Focus Trend</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Last 30 days of focus activity</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '300px' }}>
                    {Object.entries(GRAPH_CONFIG).map(([key, config]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', opacity: 0.6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: config.stroke }} />
                            {key === 'total' ? 'Total' : key.charAt(0).toUpperCase() + key.slice(1)}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                        {Object.entries(GRAPH_CONFIG).map(([key, config]) => (
                            <linearGradient key={`g-${key}-${chartId}`} id={`g-${key}-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={config.stroke} stopOpacity={config.fillOpacity} />
                                <stop offset="100%" stopColor={config.stroke} stopOpacity="0" />
                            </linearGradient>
                        ))}
                    </defs>

                    {/* Area Fills */}
                    <path d={generatePath(pointsTotal, true)} fill={`url(#g-total-${chartId})`} />

                    {/* Lines */}
                    <path d={generatePath(pointsPomo)} fill="none" stroke={GRAPH_CONFIG.pomo.stroke} strokeWidth="1.2" opacity={GRAPH_CONFIG.pomo.strokeOpacity} />
                    <path d={generatePath(pointsDeep)} fill="none" stroke={GRAPH_CONFIG.deep.stroke} strokeWidth="1.2" opacity={GRAPH_CONFIG.deep.strokeOpacity} />
                    <path d={generatePath(pointsFlow)} fill="none" stroke={GRAPH_CONFIG.flow.stroke} strokeWidth="1.2" opacity={GRAPH_CONFIG.flow.strokeOpacity} />
                    <path d={generatePath(pointsCustom)} fill="none" stroke={GRAPH_CONFIG.custom.stroke} strokeWidth="1.2" opacity={GRAPH_CONFIG.custom.strokeOpacity} />
                    <path d={generatePath(pointsAmbient)} fill="none" stroke={GRAPH_CONFIG.ambient.stroke} strokeWidth="1.2" opacity={GRAPH_CONFIG.ambient.strokeOpacity} />
                    <path d={generatePath(pointsTotal)} fill="none" stroke={GRAPH_CONFIG.total.stroke} strokeWidth="2" />

                    {/* Hover Guide */}
                    {hoverIndex !== null && (
                        <>
                            <line x1={getX(hoverIndex)} y1={0} x2={getX(hoverIndex)} y2={height} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                            <circle cx={getX(hoverIndex)} cy={pointsTotal[hoverIndex].y} r={4} fill={GRAPH_CONFIG.total.stroke} stroke="#fff" strokeWidth={2} />
                        </>
                    )}
                </svg>

                {/* Monthly Tooltip */}
                {activeData && hoverIndex !== null && (
                    <div style={{
                        position: 'absolute',
                        left: `${(getX(hoverIndex) / width) * 100}%`,
                        top: '-10px',
                        transform: hoverIndex > 15 ? 'translate(-110%, -50%)' : 'translate(10%, -50%)',
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(10px)',
                        padding: '0.8rem',
                        borderRadius: '0.8rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        zIndex: 50,
                        minWidth: '130px',
                        pointerEvents: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                            {new Date(activeData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 10px' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Pomodoro</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GRAPH_CONFIG.pomo.stroke, textAlign: 'right' }}>{activeData.pomodoro}m</div>

                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Deep Work</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GRAPH_CONFIG.deep.stroke, textAlign: 'right' }}>{activeData.deep}m</div>

                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Flow State</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GRAPH_CONFIG.flow.stroke, textAlign: 'right' }}>{activeData.flow}m</div>

                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Custom</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GRAPH_CONFIG.custom.stroke, textAlign: 'right' }}>{activeData.custom}m</div>

                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Ambient</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GRAPH_CONFIG.ambient.stroke, textAlign: 'right' }}>{activeData.ambient}m</div>

                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '4px' }}>Total</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: GRAPH_CONFIG.total.stroke, textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '4px' }}>{activeData.value}m</div>
                        </div>
                    </div>
                )}
            </div>

            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', opacity: 0.4, fontSize: '0.65rem' }}>
                {dataPoints.map((d, i) => d.label ? (
                    <div key={i} style={{ transform: 'translateX(-50%)' }}>{d.label}</div>
                ) : null)}
            </div>
        </div>
    );
};

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useFocusTask } from '../../hooks/useFocusTask';
import { AddEventModal } from '../modals/AddEventModal';
import { ChevronLeft, ChevronRight, Grid, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import '../widgets/widgets.css';

export const FocusCalendar = () => {
    const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');

    // --- VISUAL CONFIGURATION ---
    const CONFIG = {
        dayNameSize: '0.95rem',   // Size of "MON", "TUE"
        dayNumberSize: '1.5rem',    // Size of the date number "12", "13"
        circleSize: 36,           // Size of the static date circle (px)
        activeCircleSize: 50,     // Size of the blue active glowing circle (px)

        // FONT SIZES
        monthTitleSize: '2.8rem', // Size of "February"
        headerDateSize: '3rem', // Size of the big day number "12"

        // FADE & GLOW CONTROL
        fadeSpeed: 1.8,           // Disabled opacity fade to debug visibility
        glowOpacityTop: 0.20,     // Intensity of the curve glow at the top (0.0 - 1.0)
        glowOpacityBottom: 0.07,  // Intensity of the curve glow at the bottom (0.0 - 1.0)
    };

    // --- LAYOUT CONFIGURATION (Visuals Only) ---
    // Adjust these to move the SVG lines/glow without changing where the dates scroll
    const LAYOUT = {
        curveTopY: 65,        // Top curve start/end Y
        curveBottomY: 120,     // Bottom curve start/end Y
        curveControlTop: 19,  // Top curve control point Y (middle)
        curveControlBottom: 70,// Bottom curve control point Y (middle)
        ballY: 68.25,         // Vertical center of the ball
    };

    // ... (rest unchanged) ...
    // Note: I will only replace the CONFIG block and then separate calls for usage sites if needed, 
    // but here I can probably only update the CONFIG. 
    // Wait, I need to update the SVG and Logic too. 
    // I will use multi_replace for this to be clean.

    // --- PHYSICS CONFIGURATION (Motion Path) ---
    // Controls where the dates scroll. Decoupled from visuals as requested.
    const PHYSICS = {
        startY: 66,           // Date path start Y
        controlY: 34.5,       // Date path control Y (dip)
        endY: 66              // Date path end Y
    };

    // --- BEZIER MATH ---
    // Coordinate System: X is 0-100 (Percentage), Y is 0-120 (Pixels, fixed height)
    // Center is 50% X.
    const curve = {
        p0: { x: 0, y: PHYSICS.startY },
        p1: { x: 50, y: PHYSICS.controlY },
        p2: { x: 100, y: PHYSICS.endY }
    };

    const getQuadraticBezierXY = (t: number) => {
        // Clamp t slightly to avoid crazy values, though opacity will hide them
        const invT = 1 - t;
        const x = (invT * invT * curve.p0.x) + (2 * invT * t * curve.p1.x) + (t * t * curve.p2.x);
        const y = (invT * invT * curve.p0.y) + (2 * invT * t * curve.p1.y) + (t * t * curve.p2.y);
        return { x, y }; // x is %, y is px
    };

    // --- STATE ---
    // Start with today
    const [viewDate, setViewDate] = useState(new Date());

    // Generate dates for the WEEKLY VIEW month
    const monthDates = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dates = [];
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(new Date(year, month, i));
        }
        return dates;
    }, [viewDate]);

    // Generate dates for MONTHLY GRID VIEW (Fixed 6 rows / 42 cells)
    const gridDates = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const dates = [];

        // 1. Padding for start (Previous Month)
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month, 0 - i);
            dates.push({ date: d, isCurrentMonth: false });
        }

        // 2. Current Month
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // 3. Padding for end (Next Month) to fill 42 cells (6 rows * 7 cols)
        const remainingCells = 42 - dates.length;
        for (let i = 1; i <= remainingCells; i++) {
            dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return dates;
    }, [viewDate]);

    const monthName = viewDate.toLocaleDateString('en-US', { month: 'long' });
    const yearNum = viewDate.getFullYear();
    const dayNumber = new Date().getDate(); // Fallback for active day display

    // scrollIndex represents the float index of the day currently at the CENTER
    // Initial state: today's index (if same month) or 0 (if different)
    // We check if viewDate is "today's month" to set initial index, otherwise 0
    const [scrollIndex, setScrollIndex] = useState(() => {
        const now = new Date();
        if (now.getMonth() === viewDate.getMonth() && now.getFullYear() === viewDate.getFullYear()) {
            return now.getDate() - 1;
        }
        return 0;
    });

    const handleMonthNav = (direction: 'next' | 'prev') => {
        const newDate = new Date(viewDate);
        if (direction === 'next') {
            newDate.setMonth(viewDate.getMonth() + 1);
        } else {
            newDate.setMonth(viewDate.getMonth() - 1);
        }
        setViewDate(newDate);
        setScrollIndex(0); // Reset weekly scroll
    };

    const [isDragging, setIsDragging] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const lastX = useRef<number>(0);
    const velocity = useRef<number>(0);
    const dragDistance = useRef<number>(0); // Track total movement to distinguish click vs drag
    const rafId = useRef<number>(0);

    const SPACING = 0.15; // Increased spacing to use more width
    const SNAP_THRESHOLD = 0.5; // How far to pull to snap to next/prev month

    // --- EFFECT: MONTH SWITCHING ---
    useEffect(() => {
        if (isDragging) return; // Don't switch while user is holding

        const maxIndex = monthDates.length - 1;

        // Switch to NEXT Month
        if (scrollIndex > maxIndex + SNAP_THRESHOLD) {
            const nextMonth = new Date(viewDate);
            nextMonth.setMonth(viewDate.getMonth() + 1);
            setViewDate(nextMonth);
            setScrollIndex(0); // Jump to start of next month
            velocity.current = 0;
        }
        // Switch to PREV Month
        else if (scrollIndex < -SNAP_THRESHOLD) {
            const prevMonth = new Date(viewDate);
            prevMonth.setMonth(viewDate.getMonth() - 1);
            setViewDate(prevMonth);
            // Jump to end of prev month
            const daysInPrev = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
            setScrollIndex(daysInPrev - 1);
            velocity.current = 0;
        }
    }, [scrollIndex, isDragging, monthDates.length, viewDate]);


    // --- INTERACTION HANDLERS ---
    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        lastX.current = e.clientX;
        velocity.current = 0;
        dragDistance.current = 0; // Reset distance
        cancelAnimationFrame(rafId.current);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastX.current;
        lastX.current = e.clientX;
        dragDistance.current += Math.abs(deltaX); // Accumulate movement

        // Sensitivity
        const sensitivity = 0.025;
        const deltaIndex = -deltaX * sensitivity;

        setScrollIndex(prev => prev + deltaIndex); // Allow unbounded scroll for trigger
        velocity.current = deltaIndex;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);

        // Check for Click (Minimal dragging)
        if (dragDistance.current < 5) {
            // Because of pointer capture, e.target is the container
            // Use elementFromPoint to find what's actually under the cursor
            const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
            const target = elementUnderCursor?.closest('.calendar-day-node');

            if (target) {
                const dateIso = target.getAttribute('data-date-iso');
                if (dateIso) {
                    const mockEvent = { currentTarget: target } as unknown as React.MouseEvent;
                    handleDateClick(mockEvent, new Date(dateIso));
                }
            }
        }

        startMomentumSnap();
    };

    const startMomentumSnap = () => {
        // Find target
        let targetIndex = Math.round(scrollIndex + (velocity.current * 10));

        // Note: We deliberately allow targetIndex to be out of bounds here
        // so the Effect can pick it up and switch months.
        // But if it's mostly in bounds, we clamp it slightly to avoid flying off to infinity
        // logic: if inside month, snap to nearest day. If outside, let it stay outside to trigger switch.

        if (targetIndex >= 0 && targetIndex < monthDates.length) {
            setScrollIndex(targetIndex);
        } else {
            // Let it settle at the edge + buffer to trigger the switch
            // or just leave it 'as is' if it's already past edge?
            // Actually, we should set it to the target and let Effect handle the jump
            setScrollIndex(targetIndex);
        }
    };

    // Calculate Visible Dates
    // We only render dates that map to 0 < t < 1 (plus buffer) based on current scrollIndex
    const visibleDates = monthDates.map((date, i) => {
        // "i" is the index of this date
        // center (t=0.5) is when i === scrollIndex
        // diff = i - scrollIndex
        // t = 0.5 + (diff * SPACING)
        const diff = i - scrollIndex;
        const t = 0.5 + (diff * SPACING);

        // Visibility Check
        if (t < -0.5 || t > 1.5) return null; // Cull invisible items (wider range to ensure 7 days)

        const pos = getQuadraticBezierXY(t);
        return { date, i, t, pos };
    }).filter(Boolean) as { date: Date, i: number, t: number, pos: { x: number, y: number } }[];

    // Active Day (centered)
    const activeDayNumber = monthDates[Math.round(scrollIndex)]?.getDate() || dayNumber;

    // --- REAL EVENTS DATA ---
    const { events, addEvent, deleteEvent } = useHabits();
    const { tasks, allTasks } = useFocusTask() as any; // Cast until hook type is updated or inferred

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string; type: string; color: string } | null>(null);



    // --- DAY VIEW DATA ---
    const [dayViewData, setDayViewData] = useState<{
        date: Date,
        events: any[],
        stats: { tasks: number },
        completedTasks: { text: string, timeSpent: number }[]
    } | null>(null);

    const formatDuration = (ms: number | undefined) => {
        if (!ms) return '0m';
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const getEvent = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.find(e => e.date === dateStr);
    };

    const handleDateClick = (_e: React.MouseEvent | undefined, date: Date) => {
        // If moved more than 5px, treat as drag, not click
        if (dragDistance.current > 5) return;

        if (viewMode === 'week') {
            // WEEKLY: Transition to DAY VIEW
            const dateStr = date.toLocaleDateString('en-CA');
            const dayEvents = events.filter(ev => ev.date === dateStr);

            /* // --- CALCULATE STATS ---
            // REMOVED Primary Focus Logic in favor of Task List
            */

            // 2. Tasks Completed - Use allTasks to include deleted ones
            const sourceTasks = allTasks || tasks; // Fallback if allTasks not yet available

            const completedTaskItems = sourceTasks.filter((t: any) => {
                if (!t.completed || !t.completedAt) return false;

                // TIMEZONE FIX: Compare dates properly instead of string matching
                const completedDate = new Date(t.completedAt);
                return completedDate.getDate() === date.getDate() &&
                    completedDate.getMonth() === date.getMonth() &&
                    completedDate.getFullYear() === date.getFullYear();
            }).map((t: any) => ({
                text: t.text,
                timeSpent: t.timeSpent || 0
            }));

            setDayViewData({
                date,
                events: dayEvents,
                stats: { tasks: completedTaskItems.length },
                completedTasks: completedTaskItems
            });
            setViewMode('day');

        } else if (viewMode === 'month') {
            // MONTHLY: Open Add Event Modal
            setSelectedDate(date);

            // Find existing event
            const existingInfo = getEvent(date);
            if (existingInfo) {
                setSelectedEvent({
                    id: existingInfo.id,
                    title: existingInfo.title,
                    type: existingInfo.type,
                    color: existingInfo.color
                });
            } else {
                setSelectedEvent(null);
            }

            setIsModalOpen(true);
        }
    };

    const handleSaveEvent = (title: string, type: string, color: string) => {
        if (selectedDate) {
            // If editing, delete old event first
            if (selectedEvent) {
                deleteEvent(selectedEvent.id);
            }
            addEvent({
                date: selectedDate.toISOString().split('T')[0],
                title,
                type,
                color
            });
        }
    };

    const handleDeleteEvent = () => {
        if (selectedEvent) {
            deleteEvent(selectedEvent.id);
        }
    };

    // --- TOOLTIP STATE ---
    const [tooltipData, setTooltipData] = useState<{ x: number, y: number, event: any } | null>(null);
    const tooltipTimeout = useRef<any>(null);

    const handleMouseEnterNode = (e: React.MouseEvent, date: Date) => {
        const event = getEvent(date);
        if (event) {
            const rect = e.currentTarget.getBoundingClientRect();
            // Clear any pending hide
            if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);

            setTooltipData({
                x: rect.left + rect.width / 2,
                y: rect.top - 10, // Position above the node
                event
            });
        }
    };

    const handleMouseLeaveNode = () => {
        tooltipTimeout.current = setTimeout(() => {
            setTooltipData(null);
        }, 100);
    };

    return (
        <>


            <AddEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={selectedEvent ? handleDeleteEvent : undefined}
                initialDate={selectedDate || new Date()}
                initialEvent={selectedEvent}
            />

            <div className="widget-card" style={{
                padding: viewMode === 'month' ? '1.5rem' : '2rem',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'padding 0.3s ease',
                position: 'relative'
            }}>

                {/* --- TOGGLE (Absolute Top Right) --- */}
                {viewMode !== 'day' && (
                    <div className="calendar-toggle-group" style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        marginBottom: 0,
                        width: '80px', /* Fixed width for toggle group */
                        height: '39px',
                        padding: '4px',
                        zIndex: 20
                    }}>
                        {/* Sliding Background */}
                        <div className={`calendar-toggle-slider ${viewMode === 'month' ? 'right' : 'left'}`} style={{ width: 'calc(50% - 4px)' }}></div>

                        <button
                            className={`calendar-toggle ${viewMode === 'week' ? 'active' : ''}`}
                            onClick={() => setViewMode('week')}
                            title="Weekly View"
                            style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Grid size={18} style={{ transform: 'rotate(45deg)' }} />
                        </button>
                        <button
                            className={`calendar-toggle ${viewMode === 'month' ? 'active' : ''}`}
                            onClick={() => setViewMode('month')}
                            title="Monthly View"
                            style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <CalendarIcon size={18} />
                        </button>
                    </div>
                )}

                {/* --- HEADER --- */}
                {viewMode !== 'day' && (
                    <>
                        {viewMode === 'week' ? (
                            // WEEKLY: Large Original Style
                            <div className="calendar-header-large">
                                <div className="calendar-weekly-label">
                                    WEEKLY
                                </div>
                                <div className="calendar-month" style={{ fontSize: CONFIG.monthTitleSize, lineHeight: 1 }}>{monthName}</div>
                                <div className="calendar-day-number" style={{ fontSize: CONFIG.headerDateSize, opacity: 0.8, lineHeight: 1 }}>{activeDayNumber}</div>
                            </div>
                        ) : (
                            // MONTHLY: Navigable Header
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', height: '40px' }}>
                                <button onClick={() => handleMonthNav('prev')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0 }}><ChevronLeft size={20} /></button>
                                <div style={{ fontSize: '1.2rem', fontWeight: 600, minWidth: '140px', textAlign: 'center' }}>
                                    {monthName} <span style={{ opacity: 0.5, fontSize: '1rem', fontWeight: 400 }}>{yearNum}</span>
                                </div>
                                <button onClick={() => handleMonthNav('next')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0 }}><ChevronRight size={20} /></button>
                            </div>
                        )}
                    </>
                )}

                {/* --- WEEKLY VIEW --- */}
                {viewMode === 'week' && (
                    <div className="animate-slide-left" style={{ position: 'relative', flex: 1 }}>
                        <div className="calendar-day-number" style={{
                            fontSize: CONFIG.headerDateSize, opacity: 0.8, lineHeight: 1,
                            marginBottom: '1rem',
                            display: 'none' // Hide old header layout
                        }}>
                            {activeDayNumber}
                        </div>

                        {/* INTERACTIVE CONTAINER */}
                        <div
                            ref={containerRef}
                            className="calendar-week-row"
                            style={{ position: 'relative', height: '120px', width: 'calc(100% + 3rem)', margin: '0 -1.5rem', touchAction: 'none', userSelect: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                        >
                            {/* SVG Curves & Glow */}
                            <svg className="calendar-curve-lines" viewBox="0 0 400 120" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                <defs>
                                    <linearGradient id="curveGlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={`rgba(255,255,255,${CONFIG.glowOpacityTop})`} />
                                        <stop offset="100%" stopColor={`rgba(255,255,255,${CONFIG.glowOpacityBottom})`} />
                                    </linearGradient>
                                    <linearGradient id="fadeEdgeGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="black" />
                                        <stop offset="15%" stopColor="white" />
                                        <stop offset="85%" stopColor="white" />
                                        <stop offset="100%" stopColor="black" />
                                    </linearGradient>
                                    <mask id="fadeEdgeMask">
                                        <rect width="100%" height="100%" fill="url(#fadeEdgeGradient)" />
                                    </mask>
                                </defs>
                                <g mask="url(#fadeEdgeMask)">
                                    <path d={`M0,${LAYOUT.curveTopY} Q200,${LAYOUT.curveControlTop} 400,${LAYOUT.curveTopY} L400,${LAYOUT.curveBottomY} Q200,${LAYOUT.curveControlBottom} 0,${LAYOUT.curveBottomY} Z`} fill="url(#curveGlow)" stroke="none" />
                                    <path d={`M0,${LAYOUT.curveTopY} Q200,${LAYOUT.curveControlTop} 400,${LAYOUT.curveTopY}`} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                                    <path d={`M0,${LAYOUT.curveBottomY} Q200,${LAYOUT.curveControlBottom} 400,${LAYOUT.curveBottomY}`} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                                </g>
                            </svg>

                            {/* SELECTOR */}
                            <div className="active-selector-glow" style={{ position: 'absolute', left: '50%', top: `${LAYOUT.ballY}px`, transform: `translate(-50%, -50%)`, width: `${CONFIG.activeCircleSize}px`, height: `${CONFIG.activeCircleSize}px`, borderRadius: '50%', background: 'var(--color-accent)', boxShadow: '0 0 20px var(--color-accent)', pointerEvents: 'none', zIndex: 10 }} />

                            {/* DATES */}
                            {visibleDates.map((item) => {
                                const dayName = item.date.toLocaleDateString('en-US', { weekday: 'short' });
                                const dNum = item.date.getDate();
                                const event = getEvent(item.date);
                                const isActive = Math.round(scrollIndex) === item.i;
                                const dist = Math.abs(item.t - 0.5);
                                let dynamicOpacity = 1 - (dist * CONFIG.fadeSpeed);
                                if (dynamicOpacity < 0) dynamicOpacity = 0;

                                return (
                                    <div key={item.i} className="calendar-day-node" data-date-iso={item.date.toISOString()}
                                        onClick={(e) => handleDateClick(e, item.date)}
                                        onMouseEnter={(e) => handleMouseEnterNode(e, item.date)}
                                        onMouseLeave={handleMouseLeaveNode}
                                        style={{ position: 'absolute', left: `${item.pos.x}%`, top: `${item.pos.y}px`, transform: `translate(-50%, -50%) scale(${isActive ? 1.1 : 0.9})`, zIndex: 11, textAlign: 'center', pointerEvents: 'auto', cursor: 'pointer', opacity: dynamicOpacity, transition: isDragging ? 'none' : 'left 0.4s ease-out, top 0.4s ease-out, transform 0.2s' }}>
                                        <span className="day-name" style={{ display: 'block', fontSize: CONFIG.dayNameSize, opacity: 0.7, marginBottom: 4 }}>{dayName}</span>
                                        <div className="day-num" style={{ width: CONFIG.circleSize, height: CONFIG.circleSize, fontSize: CONFIG.dayNumberSize, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: event ? '#fff' : 'var(--color-text-primary)', textShadow: event ? '0 1px 2px rgba(0,0,0,0.5)' : 'var(--shadow-text)', position: 'relative', background: event ? event.color : 'transparent', borderRadius: '50%', boxShadow: event ? `0 4px 12px ${event.color}66` : 'none', border: event ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                                            {dNum}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- MONTHLY VIEW --- */}
                {viewMode === 'month' && (
                    <div className="animate-slide-right">
                        {/* Header Strip */}
                        <div className="calendar-month-days-strip">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d}>{d}</div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', padding: '0' }}>
                            {gridDates.map((item, i) => {
                                const date = item.date;
                                const isCurrentMonth = item.isCurrentMonth;

                                // --- DATE STRINGS ---
                                // 1. Local Date String for "Today" Highlight (Visual correctness)
                                const localDateStr = date.toLocaleDateString('en-CA');
                                const todayLocalStr = new Date().toLocaleDateString('en-CA');
                                const isToday = localDateStr === todayLocalStr;

                                // 2. Naive ISO Date String for Data Logic (Matching stored format)
                                // Events are stored as naive ISO strings (often shifted to prev day in +ve timezones)
                                // We must generate the same key for the cell to find the event.
                                const cellKey = date.toISOString().split('T')[0];

                                // Calculate Today's Key in the same naive way (reset time to 00:00:00 local first)
                                const todayDateObj = new Date();
                                todayDateObj.setHours(0, 0, 0, 0);
                                const todayKey = todayDateObj.toISOString().split('T')[0];

                                const event = events.find(e => e.date === cellKey);

                                // CONNECTOR STRIP LOGIC
                                let isStrip = false;
                                let isStripStart = false;
                                let isStripEnd = false;
                                let stripColor = 'transparent';

                                // Calculate Next Event using Naive Keys
                                const futureEvents = events
                                    .filter(e => e.date >= todayKey)
                                    .sort((a, b) => a.date.localeCompare(b.date));

                                const nextEvent = futureEvents.find(e => e.date > todayKey);

                                if (nextEvent) {
                                    // String comparison works for ISO
                                    if (cellKey >= todayKey && cellKey <= nextEvent.date) {
                                        isStrip = true;
                                        stripColor = nextEvent.color;
                                        if (cellKey === todayKey) isStripStart = true;
                                        if (cellKey === nextEvent.date) isStripEnd = true;
                                    }
                                }
                                return (
                                    <div
                                        key={i}
                                        onClick={(e) => handleDateClick(e, date)}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '30px',
                                            margin: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            opacity: isCurrentMonth ? 1 : 0.3,
                                            background: 'transparent' // Clear old background
                                        }}
                                    >
                                        {/* NEW CONNECTOR STRIP DESIGN */}
                                        {isStrip && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    height: '24px', // Comfortable pill height
                                                    background: stripColor,
                                                    opacity: 0.2, // Subtle transparency
                                                    zIndex: 1, // Behind text

                                                    // Dynamic Width & Positioning to bridge gaps
                                                    left: isStripStart ? '50%' : '-2px', // Start from center or cover left gap
                                                    right: isStripEnd ? '50%' : '-2px', // End at center or cover right gap

                                                    // Rounded Caps
                                                    borderTopLeftRadius: isStripStart ? '12px' : '0',
                                                    borderBottomLeftRadius: isStripStart ? '12px' : '0',
                                                    borderTopRightRadius: isStripEnd ? '12px' : '0',
                                                    borderBottomRightRadius: isStripEnd ? '12px' : '0',
                                                }}
                                            />
                                        )}

                                        <div style={{
                                            // THE CIRCLE NODE ITSELF
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            zIndex: 2, // Above strip

                                            // --- CIRCLE STYLE IF EVENT ---
                                            background: isToday ? 'var(--color-accent)' : (event ? event.color : 'transparent'),
                                            color: (isToday || event) ? '#fff' : 'rgba(255,255,255,0.8)',
                                            fontWeight: (isToday || event) ? 700 : 400,
                                            boxShadow: isToday ? '0 0 12px var(--color-accent)' : (event ? `0 4px 12px ${event.color}66` : 'none'),
                                            border: (isToday || event) ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                                            textShadow: (isToday || event) ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                                        }}
                                            onMouseEnter={(e) => {
                                                if (!isToday && !event) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                                handleMouseEnterNode(e, date);
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isToday && !event) e.currentTarget.style.background = 'transparent';
                                                handleMouseLeaveNode();
                                            }}
                                        >
                                            <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>
                                                {date.getDate()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* --- DAY VIEW --- */}
                {viewMode === 'day' && dayViewData && (
                    <div className="day-view-container animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', color: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                            <button onClick={() => setViewMode('week')} style={{
                                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px',
                                cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <ChevronLeft size={18} />
                            </button>
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.1, color: '#fff' }}>
                                    {dayViewData.date.toLocaleDateString('en-US', { weekday: 'long' })}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', whiteSpace: 'nowrap' }}>
                                    {dayViewData.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>

                            {/* TASKS DONE - Moved to Header */}
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '12px' }}>
                                <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2, color: '#fff' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{dayViewData.stats.tasks}</span>
                                    <span style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase' }}>Tasks</span>
                                </div>
                            </div>
                        </div>

                        {/* TASK LIST */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '0.1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '0.1rem' }}>
                                <div className="widget-daily-tasks-container" style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}>
                                    <div className="widget-daily-tasks-header">
                                        <span className="daily-tasks-header-pill" style={{ color: '#fff' }}>Daily Tasks</span>
                                    </div>
                                    <div className="custom-scrollbar widget-daily-tasks">
                                        {dayViewData.completedTasks.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                {dayViewData.completedTasks.map((t, i) => (
                                                    <div key={i} className="widget-daily-task-item">
                                                        <div style={{ fontSize: '1rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', color: '#fff' }}>
                                                            {t.text}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace', background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                            {formatDuration(t.timeSpent)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', marginTop: '1rem' }}>
                                                No tasks completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TOOLTIP */}
            {tooltipData && (
                <div style={{
                    position: 'fixed',
                    left: tooltipData.x,
                    top: tooltipData.y,
                    transform: 'translate(-50%, -100%)',
                    background: `
                        linear-gradient(
                            155deg,
                            rgba(35, 40, 35, 0.88),
                            rgba(20, 24, 20, 0.82) 40%,
                            rgba(15, 18, 15, 0.78)
                        )
                    `,
                    // ✨ REALISTIC GLASS EDGE (top lit, bottom shadowed)
                    borderTop: '1px solid rgba(255,255,255,0.28)',
                    borderLeft: '1px solid rgba(255,255,255,0.18)',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                    borderBottom: '1px solid rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    boxShadow: `
                        0 10px 25px rgba(0,0,0,0.45),
                        0 2px 4px rgba(0,0,0,0.35),
                        inset 0 1px 0 rgba(255,255,255,0.25)
                    `,
                    minWidth: '120px'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        color: tooltipData.event.color,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px',
                        textShadow: `0 0 10px ${tooltipData.event.color}, 0 0 20px ${tooltipData.event.color}` // NEON GLOW
                    }}>
                        {tooltipData.event.type}
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.95)',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)' // Legibility shadow
                    }}>
                        {tooltipData.event.title}
                    </div>
                    <div style={{
                        position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
                        width: 0, height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid rgba(0,0,0,0.8)'
                    }} />
                </div>
            )}
        </>
    );
};

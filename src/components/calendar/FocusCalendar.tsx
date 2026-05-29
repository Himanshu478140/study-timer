import React, { useState, useMemo, useRef } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { AddEventModal } from '../modals/AddEventModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../widgets/widgets.css';

export const FocusCalendar = () => {



    // --- STATE ---
    // Start with today
    const [viewDate, setViewDate] = useState(new Date());

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

    const handleMonthNav = (direction: 'next' | 'prev') => {
        const newDate = new Date(viewDate);
        if (direction === 'next') {
            newDate.setMonth(viewDate.getMonth() + 1);
        } else {
            newDate.setMonth(viewDate.getMonth() - 1);
        }
        setViewDate(newDate);
    };

    // --- REAL EVENTS DATA ---
    const { events, addEvent, deleteEvent } = useHabits();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string; type: string; color: string } | null>(null);

    const getEvent = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.find(e => e.date === dateStr);
    };

    const handleDateClick = (_e: React.MouseEvent | undefined, date: Date) => {
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
                padding: '1.5rem',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'padding 0.3s ease',
                position: 'relative'
            }}>



                {/* --- HEADER --- */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', height: '40px' }}>
                    <button onClick={() => handleMonthNav('prev')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0 }}><ChevronLeft size={20} /></button>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, minWidth: '140px', textAlign: 'center' }}>
                        {monthName} <span style={{ opacity: 0.5, fontSize: '1rem', fontWeight: 400 }}>{yearNum}</span>
                    </div>
                    <button onClick={() => handleMonthNav('next')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0 }}><ChevronRight size={20} /></button>
                </div>


                {/* --- MONTHLY VIEW --- */}
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

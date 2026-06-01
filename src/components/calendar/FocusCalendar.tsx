import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    const [modalAnchor, setModalAnchor] = useState<{
        top: number;
        bottom: number;
        left: number;
        width: number;
    } | null>(null);

    const getEvent = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.find(e => e.date === dateStr);
    };

    const handleDateClick = (e: React.MouseEvent | undefined, date: Date) => {
        // MONTHLY: Open Add Event Modal
        setSelectedDate(date);

        if (e) {
            const rect = e.currentTarget.getBoundingClientRect();
            setModalAnchor({
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.width
            });
        } else {
            setModalAnchor(null);
        }

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
                onClose={() => {
                    setIsModalOpen(false);
                    setModalAnchor(null);
                }}
                onSave={handleSaveEvent}
                onDelete={selectedEvent ? handleDeleteEvent : undefined}
                initialDate={selectedDate || new Date()}
                initialEvent={selectedEvent}
                anchor={modalAnchor}
            />

            <div className="widget-card" style={{
                padding: '1.25rem',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                background: 'linear-gradient(180deg, #1b1b1f 0%, #121215 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}>

                {/* --- REALISTIC VIOLET TOP GLOWING ACCENT BAR --- */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '3px',
                    background: 'var(--color-accent, #8b5cf6)',
                    borderBottomLeftRadius: '3px',
                    borderBottomRightRadius: '3px',
                    boxShadow: '0 0 10px var(--color-accent, #8b5cf6), 0 0 20px var(--color-accent, #8b5cf6)',
                    zIndex: 10
                }} />

                {/* --- HEADER --- */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', marginTop: '0.5rem', height: '40px' }}>
                    <button
                        onClick={() => handleMonthNav('prev')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.02)',
                            color: 'rgba(255,255,255,0.8)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            padding: 0
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', letterSpacing: '0.2px' }}>
                        {monthName} <span style={{ opacity: 0.9 }}>{yearNum}</span>
                    </div>

                    <button
                        onClick={() => handleMonthNav('next')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.02)',
                            color: 'rgba(255,255,255,0.8)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            padding: 0
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* --- MONTHLY VIEW --- */}
                <div className="animate-slide-right">
                    {/* Header Strip */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        color: 'rgba(255, 255, 255, 0.3)',
                        textTransform: 'uppercase',
                        marginBottom: '0.75rem',
                        padding: '0'
                    }}>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                            <div key={d}>{d}</div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', columnGap: '0', rowGap: '6px', padding: '0' }}>
                        {gridDates.map((item, i) => {
                            const date = item.date;
                            const isCurrentMonth = item.isCurrentMonth;

                            // --- DATE STRINGS ---
                            const localDateStr = date.toLocaleDateString('en-CA');
                            const todayLocalStr = new Date().toLocaleDateString('en-CA');
                            const isToday = localDateStr === todayLocalStr;
                            const cellKey = date.toISOString().split('T')[0];

                            const todayDateObj = new Date();
                            todayDateObj.setHours(0, 0, 0, 0);
                            const todayKey = todayDateObj.toISOString().split('T')[0];

                            const event = events.find(e => e.date === cellKey);
                            const isSelected = selectedDate && cellKey === selectedDate.toISOString().split('T')[0];

                            // CONNECTOR STRIP LOGIC
                            let isStrip = false;
                            let isStripStart = false;
                            let isStripEnd = false;
                            let stripColor = 'transparent';

                            const futureEvents = events
                                .filter(e => e.date >= todayKey)
                                .sort((a, b) => a.date.localeCompare(b.date));

                            const nextEvent = futureEvents.find(e => e.date > todayKey);

                            if (nextEvent) {
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
                                        height: '34px',
                                        margin: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        opacity: isCurrentMonth ? 1 : 0.15,
                                        background: 'transparent'
                                    }}
                                >


                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        zIndex: 2,
                                        position: 'relative',

                                        // --- CIRCLE STYLE MATCHING THE MOCKUP ---
                                        background: (isSelected || isToday)
                                            ? 'var(--color-accent, #8b5cf6)'
                                            : 'transparent',
                                        color: (isSelected || isToday)
                                            ? '#ffffff'
                                            : 'rgba(255,255,255,0.9)',
                                        fontWeight: (isSelected || isToday) ? 600 : 400,
                                        boxShadow: (isSelected || isToday)
                                            ? '0 0 14px var(--color-accent, #8b5cf6), 0 0 4px var(--color-accent, #8b5cf6)'
                                            : 'none',
                                        border: 'none'
                                    }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected && !isToday) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                            handleMouseEnterNode(e, date);
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected && !isToday) e.currentTarget.style.background = 'transparent';
                                            handleMouseLeaveNode();
                                        }}
                                    >
                                        <span style={{ fontSize: '0.85rem', lineHeight: 1, transform: event && !isSelected ? 'translateY(-2px)' : 'none' }}>
                                            {date.getDate()}
                                        </span>

                                        {/* Subtle event dot indicator at the bottom of the circle */}
                                        {event && !isSelected && (
                                            <span style={{
                                                position: 'absolute',
                                                bottom: '4px',
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                background: event.color || 'var(--color-accent, #8b5cf6)',
                                                boxShadow: `0 0 4px ${event.color || 'var(--color-accent, #8b5cf6)'}`
                                            }} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* TOOLTIP */}
            {tooltipData && createPortal(
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
                    zIndex: 100005,
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
                </div>,
                document.body
            )}
        </>
    );
};

import { useState, useMemo } from 'react';
import { Plus, Check, Trash2, X } from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';

export const HabitTrackerOverlay = ({ onClose }: { onClose?: () => void }) => {
    const { habits, addHabit, toggleHabit, deleteHabit } = useHabits();
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#a855f7'); // Neon Purple default

    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose?.();
        }, 150); // Match animation duration
    };

    // Logic: Get Current Week (Mon-Sun)
    const weekDays = useMemo(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(d.setDate(diff));

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(date.getDate() + i);
            return {
                dateStr: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue...
                dayNum: date.getDate()
            };
        });
    }, []);

    // Logic: Get Current Month Days
    const monthDays = useMemo(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: daysInMonth }, (_, i) => {
            const d = new Date(year, month, i + 1);
            return {
                dateStr: d.toISOString().split('T')[0],
                dayNum: i + 1,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' })
            };
        });
    }, []);

    const handleAddHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitName.trim()) {
            addHabit(newHabitName, selectedColor);
            setNewHabitName('');
            setIsAdding(false);
        }
    };

    const neonColors = [
        { name: 'Neon Purple', value: '#a855f7' },
        { name: 'Bright Blue', value: '#3b82f6' },
        { name: 'Neon Green', value: '#22c55e' },
        { name: 'Warm Orange', value: '#f97316' },
        { name: 'Golden Yellow', value: '#eab308' },
        { name: 'Hot Pink', value: '#ec4899' },
    ];

    // Calculate Weekly Progress using the *currently displayed* weekDays
    const getProgress = (habit: any) => {
        const targetDays = viewMode === 'week' ? weekDays : monthDays;
        const completedCount = targetDays.filter(d => habit.completedDates.includes(d.dateStr)).length;
        return Math.round((completedCount / targetDays.length) * 100);
    };

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <div
            className={isClosing ? 'animate-scale-out' : 'animate-scale-in'}
            style={{
                width: '100%',
                height: '100%',
                background: 'rgba(9, 9, 11, 0.4)', // highly transparent dark
                backdropFilter: 'blur(24px) saturate(180%)', // heavy blur for "frosted glass"
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxSizing: 'border-box',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px var(--color-glass-border), inset 0 0 0 1px rgba(var(--color-accent-rgb), 0.1)', // subtle accent tint
                position: 'relative',
                overflow: 'hidden',
                pointerEvents: 'auto' // Re-enable interaction blocked by parent wrapper
            }}
            onClick={e => e.stopPropagation()}
        >
            {/* Ambient Background Glow */}
            <div style={{ position: 'absolute', top: '-20%', left: '50%', width: '60%', height: '40%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Habits</h2>

                    {/* View Toggle */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '4px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        isolation: 'isolate'
                    }}>
                        {/* Sliding Pill Background */}
                        <div style={{
                            position: 'absolute',
                            top: '4px',
                            bottom: '4px',
                            left: '4px',
                            width: 'calc(50% - 4px)',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            transform: viewMode === 'week' ? 'translateX(0)' : 'translateX(100%)',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            zIndex: 0
                        }} />

                        <button
                            onClick={() => setViewMode('week')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: 'transparent',
                                color: viewMode === 'week' ? '#fff' : 'rgba(255,255,255,0.5)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                zIndex: 1,
                                flex: 1,
                                width: '60px', // Fixed width for alignment
                                textAlign: 'center'
                            }}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: 'transparent',
                                color: viewMode === 'month' ? '#fff' : 'rgba(255,255,255,0.5)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                zIndex: 1,
                                flex: 1,
                                width: '60px', // Fixed width for alignment
                                textAlign: 'center'
                            }}
                        >
                            Month
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="add-habit-btn"
                    >
                        {isAdding ? <X size={16} /> : <Plus size={16} />}
                        <span>{isAdding ? 'Cancel' : 'Add Habit'}</span>
                    </button>
                    {onClose && (
                        <button
                            onClick={handleClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}>
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Add Habit Form */}
            {isAdding && (
                <form onSubmit={handleAddHabit} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', animation: 'slideDown 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginLeft: '4px' }}>Name your habit</label>
                        <input
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                            }}
                            placeholder="e.g. Read 30 mins..."
                            value={newHabitName}
                            onChange={e => setNewHabitName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginLeft: '4px' }}>Pick a color</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {neonColors.map(c => (
                                <div
                                    key={c.value}
                                    onClick={() => setSelectedColor(c.value)}
                                    style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: c.value,
                                        cursor: 'pointer',
                                        boxShadow: selectedColor === c.value ? `0 0 15px ${c.value}` : 'inset 0 0 0 1px rgba(0,0,0,0.2)',
                                        border: selectedColor === c.value ? '3px solid white' : '2px solid transparent', // White ring for clarity
                                        transform: selectedColor === c.value ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s'
                                    }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" style={{
                        marginTop: '0.5rem',
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(to right, #fff, #e4e4e7)',
                        color: '#000',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        transition: 'transform 0.1s'
                    }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Create Habit
                    </button>
                </form>
            )}

            {/* Main Dashboard Grid */}
            <div className="custom-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto', paddingRight: '4px' }}>

                {/* Column Headers (View Mode Dependant) */}
                <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'week' ? '140px 1fr 60px' : '140px 1fr 60px', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>HABIT</span>
                    {viewMode === 'week' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {weekDays.map(d => (
                                <div key={d.dateStr} style={{ width: '32px', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                    {d.dayName}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                            {new Date().toLocaleDateString('en-US', { month: 'long' })} Progress
                        </div>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textAlign: 'right' }}>PROG</span>
                </div>

                {/* Rows */}
                {habits.map(habit => {
                    const progress = getProgress(habit);

                    return (
                        <div key={habit.id} className="habit-row group" style={{
                            display: 'grid',
                            gridTemplateColumns: '140px 1fr 60px',
                            alignItems: 'center',
                            padding: '1rem 0.5rem', // Generous padding
                            marginBottom: '0.1rem', // Space for elevation
                            background: hexToRgba(habit.color, 0.15), // Base tint
                            borderLeft: `4px solid ${habit.color}`, // Color strip
                            // borderRadius handled by CSS
                        }}>
                            {/* Label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '10px' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{habit.name}</span>
                                <button onClick={() => deleteHabit(habit.id)} className="habit-delete-btn"><Trash2 size={14} /></button>
                            </div>

                            {/* Grid / Dots Content */}
                            {viewMode === 'week' ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    {weekDays.map(d => {
                                        const isDone = habit.completedDates.includes(d.dateStr);
                                        const isToday = d.dateStr === new Date().toISOString().split('T')[0];
                                        return (
                                            <div
                                                key={d.dateStr}
                                                onClick={() => toggleHabit(habit.id, d.dateStr)}
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    border: isDone ? 'none' : `1.5px solid rgba(255,255,255,${isToday ? 0.3 : 0.08})`,
                                                    background: isDone ? habit.color : 'transparent',
                                                    boxShadow: isDone ? `0 0 12px ${habit.color}80` : 'inset 0 1px 2px rgba(0,0,0,0.9)', // Micro-depth for empty state
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                    transform: isDone ? 'scale(1)' : 'scale(0.85)'
                                                }}
                                            >
                                                {isDone && <Check size={16} color="#000" strokeWidth={3} />}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                /* Monthly View - Dotted Grid */
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px',
                                    alignContent: 'center'
                                }}>
                                    {monthDays.map(d => {
                                        const isDone = habit.completedDates.includes(d.dateStr);
                                        const isToday = d.dateStr === new Date().toISOString().split('T')[0];
                                        return (
                                            <div
                                                key={d.dateStr}
                                                onClick={() => toggleHabit(habit.id, d.dateStr)}
                                                title={`${d.dateStr} (${d.dayName})`}
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    background: isDone ? habit.color : 'rgba(255,255,255,0.1)',
                                                    boxShadow: isDone ? `0 0 6px ${habit.color}60` : 'none',
                                                    border: isToday ? '1px solid #fff' : 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    opacity: isDone || isToday ? 1 : 0.5
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Progress Bar */}
                            <div style={{ paddingLeft: '1rem', display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: habit.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {habits.length === 0 && !isAdding && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                        <p>No habits yet. Start your journey!</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
};

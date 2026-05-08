import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, X, Target } from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';

interface HabitSelectorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}

export const HabitSelectorPanel = ({ isOpen, onClose, triggerRef }: HabitSelectorPanelProps) => {
    const { habits, addHabit, toggleHabit, deleteHabit } = useHabits();
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#a855f7');
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    
    const panelRef = useRef<HTMLDivElement>(null);
    const [yPos, setYPos] = useState('50%');

    // Viewport clamping logic
    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && triggerRef?.current && panelRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const triggerCenterY = triggerRect.top + triggerRect.height / 2;
                const panelHeight = panelRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;
                const margin = 20;
                
                let idealTop = triggerCenterY - panelHeight / 2;
                const minTop = margin;
                const maxTop = viewportHeight - panelHeight - margin;
                
                const finalTop = Math.max(minTop, Math.min(maxTop, idealTop));
                setYPos(`${finalTop}px`);
            }
        };

        if (isOpen) {
            updatePosition();
            
            // Recalculate on window resize
            window.addEventListener('resize', updatePosition);
            
            // Recalculate if panel height changes (e.g. when 'Add' form opens)
            const observer = new ResizeObserver(() => {
                requestAnimationFrame(updatePosition);
            });
            
            if (panelRef.current) {
                observer.observe(panelRef.current);
            }
            
            return () => {
                window.removeEventListener('resize', updatePosition);
                observer.disconnect();
            };
        }
    }, [isOpen, triggerRef]);

    // Click outside logic
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            const isOutsidePanel = panelRef.current && !panelRef.current.contains(e.target as Node);
            const isNotTrigger = triggerRef?.current && !triggerRef.current.contains(e.target as Node);
            if (isOutsidePanel && isNotTrigger) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, triggerRef]);

    // Logic: Get Current Week
    const weekDays = useMemo(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(date.getDate() + i);
            return {
                dateStr: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' })[0], // S, M, T...
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
        { name: 'Purple', value: '#a855f7' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Pink', value: '#ec4899' },
    ];

    const getProgress = (habit: any) => {
        const targetDays = viewMode === 'week' ? weekDays : monthDays;
        const completedCount = targetDays.filter(d => habit.completedDates.includes(d.dateStr)).length;
        return Math.round((completedCount / targetDays.length) * 100);
    };

    const content = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, x: 40, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.98 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="task-selector-panel-mobile"
                    style={{
                        position: 'fixed',
                        right: '100px',
                        top: yPos,
                        width: 'var(--panel-width, 420px)',
                        maxWidth: 'calc(100vw - 40px)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '24px',
                        zIndex: 9999,
                        background: 'rgba(18, 18, 18, 0.85)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        maxHeight: 'calc(100vh - 40px)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Target size={14} color="#a855f7" />
                                <h3 style={{ 
                                    fontSize: '10px', 
                                    fontWeight: 'bold', 
                                    letterSpacing: '0.2em', 
                                    textTransform: 'uppercase', 
                                    color: 'rgba(255, 255, 255, 0.4)' 
                                }}>Consistency</h3>
                            </div>
                            <h2 style={{ 
                                fontSize: '24px', 
                                fontFamily: "'Noto Serif', serif", 
                                fontStyle: 'italic', 
                                margin: 0
                            }}>Habit Tracker</h2>
                        </div>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            style={{
                                background: isAdding ? 'rgba(255,255,255,0.1)' : 'white',
                                color: isAdding ? 'white' : 'black',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isAdding ? <X size={14} /> : <Plus size={14} />}
                            {isAdding ? 'Cancel' : 'Add'}
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '4px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        width: 'fit-content',
                        flexShrink: 0
                    }}>
                        <button
                            onClick={() => setViewMode('week')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '8px',
                                background: viewMode === 'week' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: viewMode === 'week' ? 'white' : 'rgba(255,255,255,0.4)',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '8px',
                                background: viewMode === 'month' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: viewMode === 'month' ? 'white' : 'rgba(255,255,255,0.4)',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Monthly
                        </button>
                    </div>

                    {/* Add Habit Form */}
                    <AnimatePresence>
                        {isAdding && (
                            <motion.form
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                onSubmit={handleAddHabit}
                                style={{ overflow: 'hidden', flexShrink: 0 }}
                            >
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '16px' }}>
                                    <input
                                        autoFocus
                                        placeholder="Habit name..."
                                        value={newHabitName}
                                        onChange={e => setNewHabitName(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            padding: '12px',
                                            color: 'white',
                                            marginBottom: '12px'
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {neonColors.map(c => (
                                                <div
                                                    key={c.value}
                                                    onClick={() => setSelectedColor(c.value)}
                                                    style={{
                                                        width: '20px', height: '20px', borderRadius: '50%',
                                                        background: c.value, cursor: 'pointer',
                                                        border: selectedColor === c.value ? '2px solid white' : '2px solid transparent',
                                                        boxShadow: selectedColor === c.value ? `0 0 10px ${c.value}` : 'none'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <button type="submit" style={{ background: 'white', color: 'black', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold' }}>Create</button>
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Habits List */}
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {habits.map(habit => {
                                const progress = getProgress(habit);
                                return (
                                    <div key={habit.id} style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '1.25rem',
                                        padding: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderLeft: `4px solid ${habit.color}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontWeight: '600', fontSize: '14px' }}>{habit.name}</span>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>{progress}%</span>
                                                <Trash2 size={12} style={{ cursor: 'pointer', opacity: 0.3 }} onClick={() => deleteHabit(habit.id)} />
                                            </div>
                                        </div>

                                        {viewMode === 'week' ? (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                {weekDays.map(d => {
                                                    const isDone = habit.completedDates.includes(d.dateStr);
                                                    return (
                                                        <div key={d.dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>{d.dayName}</span>
                                                            <div
                                                                onClick={() => toggleHabit(habit.id, d.dateStr)}
                                                                style={{
                                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                                    background: isDone ? habit.color : 'rgba(255,255,255,0.05)',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {isDone && <Check size={14} color="black" strokeWidth={3} />}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {monthDays.map(d => {
                                                    const isDone = habit.completedDates.includes(d.dateStr);
                                                    return (
                                                        <div
                                                            key={d.dateStr}
                                                            onClick={() => toggleHabit(habit.id, d.dateStr)}
                                                            style={{
                                                                width: '10px', height: '10px', borderRadius: '2px',
                                                                background: isDone ? habit.color : 'rgba(255,255,255,0.05)',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};

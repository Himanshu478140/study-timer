import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { useHabits } from '../../../Offlinebackup/localstorage/HabitsContext';
import { usePanelPosition } from './hooks/usePanelPosition';
import { useHabitStats } from './hooks/useHabitStats';
import { WeekBar } from './components/WeekBar';
import { StatsPanel } from './components/StatsPanel';
import { Heatmap } from './components/Heatmap';
import { HabitGrid } from './components/HabitGrid';
import { AddHabitPopup } from './components/AddHabitPopup';
import { calculateHeatmapData } from './utils/heatmap';
import type { HabitSelectorPanelProps } from './types';
import './HabitSelectorPanel.css';

/**
 * Main HabitSelectorPanel component orchestrating sub-panels, custom hooks, and layout portals.
 */
export const HabitSelectorPanel = ({ isOpen, onClose, triggerRef }: HabitSelectorPanelProps) => {
    const { habits, addHabit, toggleHabit, deleteHabit } = useHabits();
    const [isAdding, setIsAdding] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const {
        panelRef,
        yPos,
        maxHeight,
        isPositioned,
        scale
    } = usePanelPosition(isOpen, triggerRef);

    const stats = useHabitStats(habits, today);
    const heatmapData = useMemo(() => calculateHeatmapData(habits), [habits]);

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
    }, [isOpen, onClose, triggerRef, panelRef]);

    const weekDays = useMemo(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d);
        monday.setDate(diff);

        const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(date.getDate() + i);
            return {
                dateStr: date.toISOString().split('T')[0],
                dayName: dayNames[i],
                isToday: date.toISOString().split('T')[0] === today
            };
        });
    }, [today]);

    const isDayFullyCompleted = (dateStr: string) => {
        if (habits.length === 0) return false;
        return habits.every(h => h.completedDates.includes(dateStr));
    };

    const isDayPartiallyCompleted = (dateStr: string) => {
        return habits.some(h => h.completedDates.includes(dateStr));
    };

    const handleAddHabit = (name: string, emoji: string, goal: string, freq: 'daily' | 'weekdays' | 'weekly' | 'custom', activeDaysList: string[]) => {
        addHabit(name, 'var(--color-accent)', emoji, goal, freq, activeDaysList);
        setIsAdding(false);
    };

    const handleToggleToday = (habitId: string) => {
        toggleHabit(habitId, today);
    };

    const content = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale, pointerEvents: 'none' }}
                    animate={{ opacity: isPositioned ? 1 : 0, x: 0, scale: scale, pointerEvents: isPositioned ? 'auto' : 'none' }}
                    exit={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale, pointerEvents: 'none' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="task-selector-panel-mobile"
                    style={{
                        position: 'fixed',
                        right: `${92 * scale}px`,
                        top: yPos,
                        width: 'var(--panel-width, 840px)',
                        maxWidth: 'calc(100vw - 40px)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '0',
                        zIndex: 9999,
                        background: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: maxHeight,
                        overflowY: 'auto',
                        transformOrigin: 'right center',
                        visibility: isPositioned ? 'visible' : 'hidden'
                    }}
                >
                    <section
                        className="ht-container"
                        style={{
                            background: 'transparent',
                            backdropFilter: 'none',
                            WebkitBackdropFilter: 'none',
                            boxShadow: 'none',
                            border: 'none',
                            height: 'auto',
                            minHeight: '27rem'
                        }}
                        aria-label="Habit Tracker"
                    >
                        {/* Close Button */}
                        <button
                            className="ht-close-btn"
                            onClick={onClose}
                            aria-label="Close habit tracker"
                        >
                            <X size={16} />
                        </button>

                        {/* ===== 2-COLUMN SPLIT LAYOUT ===== */}
                        <div className="ht-split-layout">
                            {/* LEFT COLUMN: Remaining Layout (WeekBar + Stats + Heatmap) */}
                            <div className="ht-left-column">
                                {/* ===== DAY SELECTOR BAR ===== */}
                                <WeekBar
                                    weekDays={weekDays}
                                    isDayFullyCompleted={isDayFullyCompleted}
                                    isDayPartiallyCompleted={isDayPartiallyCompleted}
                                />

                                {/* ===== STATS + HEATMAP ROW ===== */}
                                <div className="ht-stats-heatmap-row">
                                    <StatsPanel stats={stats} />
                                    <Heatmap heatmapData={heatmapData} />
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Current Habits Section */}
                            <div className="ht-right-column">
                                <header className="ht-section-header">
                                    <h2 className="ht-section-title">Current Habits</h2>
                                    <button
                                        className="ht-add-habit-btn"
                                        onClick={() => setIsAdding(!isAdding)}
                                        aria-label={isAdding ? "Close habit popup" : "Add new habit"}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.375rem',
                                            padding: '0.4rem 0.75rem',
                                            background: isAdding ? 'rgba(255,255,255,0.1)' : 'var(--ht-accent)',
                                            color: isAdding ? 'var(--ht-text-primary)' : 'white',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            boxShadow: isAdding ? 'none' : '0 2px 8px rgba(var(--ht-accent-rgb), 0.3)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Plus size={16} strokeWidth={2.5} style={{ transform: isAdding ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }} />
                                        <span>{isAdding ? 'Close' : 'Add Habit'}</span>
                                    </button>
                                </header>

                                {/* ===== ADD FORM POPUP ===== */}
                                {isAdding && (
                                    <AddHabitPopup
                                        onClose={() => setIsAdding(false)}
                                        onSubmit={handleAddHabit}
                                    />
                                )}

                                {/* ===== HABITS GRID ===== */}
                                <HabitGrid
                                    habits={habits}
                                    today={today}
                                    onToggleHabit={handleToggleToday}
                                    onDeleteHabit={deleteHabit}
                                />
                            </div>
                        </div>
                    </section>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};
export default HabitSelectorPanel;

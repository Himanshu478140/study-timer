import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Check, X, Trash2, Zap, Flame, RefreshCw, CalendarDays, Dumbbell, Sprout, BookOpen, Palette, ChevronDown } from 'lucide-react';
import { useHabits, type DailyHabit } from '../../hooks/useHabits';
import { motion, AnimatePresence } from 'framer-motion';
import './widgets.css';

// Emoji icons for habit cards (cycles through these)
const HABIT_ICONS = ['🧘', '📖', '💧', '🏃', '✍️', '🎯', '💪', '🧠', '🎨', '🌿'];



const ICON_TO_EMOJI: Record<string, string> = {
    dumbbell: '🏋️',
    sprout: '🌱',
    book: '📖',
    palette: '🎨'
};

const getHabitFrequencyLabel = (habit: DailyHabit) => {
    const freq = habit.frequency ?? 'daily';
    const activeDays = habit.activeDays ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (freq === 'daily') return 'Daily';
    if (freq === 'weekdays') return 'Weekdays';
    if (freq === 'weekly') return 'Weekly';

    if (freq === 'custom') {
        const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const weekend = ['Sat', 'Sun'];

        const isAll = allDays.every(d => activeDays.includes(d));
        if (isAll) return 'Daily';

        const isWeekdaysOnly = weekdays.length === activeDays.length && weekdays.every(d => activeDays.includes(d));
        if (isWeekdaysOnly) return 'Weekdays';

        const isWeekendOnly = weekend.length === activeDays.length && weekend.every(d => activeDays.includes(d));
        if (isWeekendOnly) return 'Weekends';

        if (activeDays.length === 0) return 'None';

        const ordered = allDays.filter(d => activeDays.includes(d));
        return ordered.join(', ');
    }

    return 'Daily';
};

export const HabitTrackerOverlay = ({ onClose }: { onClose?: () => void }) => {
    const { habits, addHabit, toggleHabit, deleteHabit } = useHabits();
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<'dumbbell' | 'sprout' | 'book' | 'palette'>('dumbbell');
    const [habitGoal, setHabitGoal] = useState('');
    const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekly' | 'custom'>('daily');
    const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
        Mon: true,
        Tue: true,
        Wed: true,
        Thu: true,
        Fri: true,
        Sat: true,
        Sun: true
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const today = new Date().toISOString().split('T')[0];

    // --- Week Days (Mon-Sun) ---
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

    // --- Heatmap Data (last 12 weeks = 84 days) ---
    const heatmapData = useMemo(() => {
        const cells: { date: string; level: number }[] = [];
        const now = new Date();

        for (let i = 83; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Count how many habits were completed on this date
            const completedCount = habits.reduce((acc, h) =>
                acc + (h.completedDates.includes(dateStr) ? 1 : 0), 0
            );

            // Map to intensity level 0-4
            let level = 0;
            if (completedCount >= 4) level = 4;
            else if (completedCount === 3) level = 3;
            else if (completedCount === 2) level = 2;
            else if (completedCount === 1) level = 1;

            cells.push({ date: dateStr, level });
        }

        return cells;
    }, [habits]);

    // --- Computed Stats ---
    const stats = useMemo(() => {
        // Current streak: consecutive days (backwards from today) with at least 1 habit done
        let streak = 0;
        const d = new Date();
        for (let i = 0; i < 365; i++) {
            const dateStr = d.toISOString().split('T')[0];
            const anyDone = habits.some(h => h.completedDates.includes(dateStr));
            if (anyDone) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }

        // Completion rate today
        const todayCompleted = habits.filter(h => h.completedDates.includes(today)).length;
        const completionRate = habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0;

        // Total unique days with any habit activity
        const allDates = new Set<string>();
        habits.forEach(h => h.completedDates.forEach(d => allDates.add(d)));
        const totalDaysActive = allDates.size;

        return { streak, completionRate, totalDaysActive };
    }, [habits, today]);

    // Check if a day has all habits completed
    const isDayFullyCompleted = (dateStr: string) => {
        if (habits.length === 0) return false;
        return habits.every(h => h.completedDates.includes(dateStr));
    };

    // Check if a day has any habit completed
    const isDayPartiallyCompleted = (dateStr: string) => {
        return habits.some(h => h.completedDates.includes(dateStr));
    };

    const handleAddHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitName.trim()) {
            const emoji = ICON_TO_EMOJI[selectedIcon] || '🧘';
            let activeDaysList: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            if (frequency === 'custom') {
                activeDaysList = Object.keys(selectedDays).filter(d => selectedDays[d]);
            } else if (frequency === 'weekdays') {
                activeDaysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            }
            addHabit(newHabitName.trim(), 'var(--color-accent)', emoji, habitGoal.trim(), frequency, activeDaysList);
            setNewHabitName('');
            setHabitGoal('');
            setSelectedIcon('dumbbell');
            setFrequency('daily');
            setIsDropdownOpen(false);
            setSelectedDays({
                Mon: true,
                Tue: true,
                Wed: true,
                Thu: true,
                Fri: true,
                Sat: true,
                Sun: true
            });
            setIsAdding(false);
        }
    };

    const handleToggleToday = (habitId: string) => {
        toggleHabit(habitId, today);
    };

    return (
        <section
            className="ht-container"
            onClick={e => e.stopPropagation()}
            aria-label="Habit Tracker"
            style={{
                minHeight: isAdding ? '26.25rem' : 'auto',
                transition: 'min-height 0.25s ease'
            }}
        >
            {/* Close Button */}
            {onClose && (
                <button
                    className="ht-close-btn"
                    onClick={onClose}
                    aria-label="Close habit tracker"
                >
                    <X size={16} />
                </button>
            )}

            {/* ===== DAY SELECTOR BAR ===== */}
            <nav className="ht-day-bar" aria-label="Week days">
                {weekDays.map(day => {
                    const fullyDone = isDayFullyCompleted(day.dateStr);
                    const partiallyDone = isDayPartiallyCompleted(day.dateStr);

                    return (
                        <div
                            key={day.dateStr}
                            className={`ht-day-item ${day.isToday ? 'ht-day-item--today' : ''} ${partiallyDone ? 'ht-day-item--completed' : ''}`}
                            tabIndex={0}
                            aria-label={`${day.dayName}${day.isToday ? ' (today)' : ''}${fullyDone ? ' - all habits complete' : ''}`}
                        >
                            <span className="ht-day-item__label">{day.dayName}</span>
                            <span className="ht-day-item__icon">
                                {day.isToday ? (
                                    <Zap size={11} strokeWidth={2.5} />
                                ) : fullyDone ? (
                                    <Check size={11} strokeWidth={3} />
                                ) : partiallyDone ? (
                                    <Check size={9} strokeWidth={2} style={{ opacity: 0.5 }} />
                                ) : null}
                            </span>
                        </div>
                    );
                })}
            </nav>

            {/* ===== STATS + HEATMAP ROW ===== */}
            <div className="ht-stats-heatmap-row">
                {/* Stats Column */}
                <div className="ht-stats-column" role="group" aria-label="Habit statistics">
                    <article className="ht-stat-card">
                        <span className="ht-stat-card__label">Current Streak</span>
                        <span className="ht-stat-card__value">{stats.streak} Days</span>
                        <span className="ht-stat-card__icon"><Flame size={16} /></span>
                    </article>
                    <article className="ht-stat-card">
                        <span className="ht-stat-card__label">Completion Rate</span>
                        <span className="ht-stat-card__value">{stats.completionRate}%</span>
                        <span className="ht-stat-card__icon"><RefreshCw size={14} /></span>
                    </article>
                    <article className="ht-stat-card">
                        <span className="ht-stat-card__label">Total Days Active</span>
                        <span className="ht-stat-card__value">{stats.totalDaysActive}</span>
                        <span className="ht-stat-card__icon"><CalendarDays size={14} /></span>
                    </article>
                </div>

                {/* Heatmap */}
                <div className="ht-heatmap-container" aria-label="Activity heatmap">
                    <header className="ht-heatmap-header">
                        <h3 className="ht-heatmap-title">Monthly Heatmap</h3>
                        <div className="ht-heatmap-legend">
                            <span>Less</span>
                            <span className="ht-heatmap-legend__cell" style={{ background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.08)' }} />
                            <span className="ht-heatmap-legend__cell" style={{ background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.25)' }} />
                            <span className="ht-heatmap-legend__cell" style={{ background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.5)' }} />
                            <span className="ht-heatmap-legend__cell" style={{ background: 'rgba(var(--color-accent-rgb, 74, 124, 89), 0.9)' }} />
                            <span>More</span>
                        </div>
                    </header>
                    <div className="ht-heatmap-grid" role="img" aria-label="Habit activity over the last 12 weeks">
                        {heatmapData.map((cell, i) => (
                            <div
                                key={i}
                                className={`ht-heatmap-cell ${cell.level > 0 ? `ht-heatmap-cell--l${cell.level}` : ''}`}
                                title={`${cell.date}: ${cell.level} habit${cell.level !== 1 ? 's' : ''} completed`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== SECTION HEADER ===== */}
            <header className="ht-section-header">
                <h2 className="ht-section-title">Current Habits</h2>
            </header>



            {/* ===== HABITS GRID ===== */}
            <div className="ht-habits-grid">
                {habits.map((habit, index) => {
                    const isDone = habit.completedDates.includes(today);
                    const icon = habit.icon ?? HABIT_ICONS[index % HABIT_ICONS.length];

                    return (
                        <article key={habit.id} className="ht-habit-card">
                            {/* Delete button (appears on hover) */}
                            <button
                                className="ht-habit-card__delete"
                                onClick={() => deleteHabit(habit.id)}
                                aria-label={`Delete ${habit.name}`}
                            >
                                <Trash2 size={10} />
                            </button>

                            {/* Icon */}
                            <div
                                className="ht-habit-card__icon"
                                style={{ background: `${habit.color}25` }}
                            >
                                {icon}
                            </div>

                            {/* Info */}
                            <div className="ht-habit-card__info">
                                <span className="ht-habit-card__name">{habit.name}</span>
                                <span className="ht-habit-card__meta">
                                    {getHabitFrequencyLabel(habit)}
                                    {habit.goal ? ` • ${habit.goal}` : ''}
                                </span>
                            </div>

                            {/* Toggle */}
                            <button
                                className={`ht-habit-toggle ${isDone ? 'ht-habit-toggle--done' : ''}`}
                                onClick={() => handleToggleToday(habit.id)}
                                aria-label={`Mark ${habit.name} as ${isDone ? 'incomplete' : 'complete'}`}
                                aria-pressed={isDone}
                            >
                                {isDone && <Check size={14} color="white" strokeWidth={3} />}
                            </button>
                        </article>
                    );
                })}

            </div>

            {/* ===== ADD FORM (conditional mini-popup rendered at bottom to float on top of everything) ===== */}
            {isAdding && (
                <form className="ht-popup" onSubmit={handleAddHabit}>
                    <div className="ht-popup-header">
                        <h3 className="ht-popup-title">New Habit</h3>
                        <button
                            type="button"
                            className="ht-popup-close"
                            onClick={() => setIsAdding(false)}
                            aria-label="Close"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <div className="ht-popup-field">
                        <label className="ht-popup-label" htmlFor="widget-habit-name">Habit Name</label>
                        <input
                            id="widget-habit-name"
                            className="ht-popup-input"
                            type="text"
                            placeholder="e.g., Morning Yoga"
                            value={newHabitName}
                            onChange={e => setNewHabitName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="ht-popup-field">
                        <span className="ht-popup-label">Icon</span>
                        <div className="ht-popup-icon-row" role="radiogroup" aria-label="Select icon">
                            <button
                                type="button"
                                className={`ht-popup-icon-btn ${selectedIcon === 'dumbbell' ? 'ht-popup-icon-btn--active' : ''}`}
                                onClick={() => setSelectedIcon('dumbbell')}
                                aria-label="Dumbbell icon"
                                role="radio"
                                aria-checked={selectedIcon === 'dumbbell'}
                            >
                                <Dumbbell size={16} />
                            </button>
                            <button
                                type="button"
                                className={`ht-popup-icon-btn ${selectedIcon === 'sprout' ? 'ht-popup-icon-btn--active' : ''}`}
                                onClick={() => setSelectedIcon('sprout')}
                                aria-label="Sprout icon"
                                role="radio"
                                aria-checked={selectedIcon === 'sprout'}
                            >
                                <Sprout size={16} />
                            </button>
                            <button
                                type="button"
                                className={`ht-popup-icon-btn ${selectedIcon === 'book' ? 'ht-popup-icon-btn--active' : ''}`}
                                onClick={() => setSelectedIcon('book')}
                                aria-label="Book icon"
                                role="radio"
                                aria-checked={selectedIcon === 'book'}
                            >
                                <BookOpen size={16} />
                            </button>
                            <button
                                type="button"
                                className={`ht-popup-icon-btn ${selectedIcon === 'palette' ? 'ht-popup-icon-btn--active' : ''}`}
                                onClick={() => setSelectedIcon('palette')}
                                aria-label="Palette icon"
                                role="radio"
                                aria-checked={selectedIcon === 'palette'}
                            >
                                <Palette size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="ht-popup-cols">
                        <div className="ht-popup-field" style={{ zIndex: 110 }}>
                            <label className="ht-popup-label" id="widget-frequency-label">Frequency</label>
                            <div className="ht-popup-select-container" ref={dropdownRef}>
                                <button
                                    type="button"
                                    className={`ht-popup-select-trigger ${isDropdownOpen ? 'ht-popup-select-trigger--active' : ''}`}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    aria-haspopup="listbox"
                                    aria-expanded={isDropdownOpen}
                                    aria-labelledby="widget-frequency-label"
                                >
                                    <span>{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</span>
                                    <ChevronDown className="ht-popup-select-trigger__arrow" size={16} />
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            className="ht-popup-select-dropdown"
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 4, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            transition={{ duration: 0.15, ease: 'easeOut' }}
                                            role="listbox"
                                        >
                                            {[
                                                { value: 'daily', label: 'Daily' },
                                                { value: 'weekdays', label: 'Weekdays' },
                                                { value: 'weekly', label: 'Weekly' },
                                                { value: 'custom', label: 'Custom' }
                                            ].map(opt => {
                                                const isSelected = frequency === opt.value;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`ht-popup-select-option ${isSelected ? 'ht-popup-select-option--active' : ''}`}
                                                        onClick={() => {
                                                            setFrequency(opt.value as any);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        role="option"
                                                        aria-selected={isSelected}
                                                    >
                                                        <span>{opt.label}</span>
                                                        {isSelected && <Check size={14} className="ht-popup-select-option__check" strokeWidth={3} />}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="ht-popup-field">
                            <label className="ht-popup-label" htmlFor="widget-habit-goal">Goal</label>
                            <input
                                id="widget-habit-goal"
                                className="ht-popup-input"
                                type="text"
                                placeholder="e.g., 30 mins"
                                value={habitGoal}
                                onChange={e => setHabitGoal(e.target.value)}
                            />
                        </div>
                    </div>

                    {frequency === 'custom' && (
                        <div className="ht-popup-day-row">
                            <span className="ht-popup-day-label">DAYS</span>
                            <div className="ht-popup-day-chips" role="group" aria-label="Select active days">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                    const isActive = selectedDays[day];
                                    const letter = day.charAt(0);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            className={`ht-popup-day-btn ${isActive ? 'ht-popup-day-btn--active' : ''}`}
                                            onClick={() => {
                                                setSelectedDays(prev => ({
                                                    ...prev,
                                                    [day]: !prev[day]
                                                }));
                                            }}
                                            aria-pressed={isActive}
                                            aria-label={`Toggle ${day}`}
                                        >
                                            {letter}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="ht-popup-footer">
                        <button
                            type="button"
                            className="ht-popup-btn--cancel"
                            onClick={() => {
                                setIsAdding(false);
                                setNewHabitName('');
                                setHabitGoal('');
                                setFrequency('daily');
                                setIsDropdownOpen(false);
                                setSelectedDays({
                                    Mon: true,
                                    Tue: true,
                                    Wed: true,
                                    Thu: true,
                                    Fri: true,
                                    Sat: true,
                                    Sun: true
                                });
                            }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="ht-popup-btn--submit">
                            Add Habit
                        </button>
                    </div>
                </form>
            )}

            {/* ===== FAB ===== */}
            <button
                className="ht-fab"
                onClick={() => setIsAdding(!isAdding)}
                aria-label={isAdding ? "Close habit popup" : "Add new habit"}
                style={{
                    transform: isAdding ? 'rotate(45deg)' : 'none',
                    background: isAdding ? 'rgba(255,255,255,0.1)' : 'var(--ht-accent)',
                    color: isAdding ? 'var(--ht-text-primary)' : 'white',
                    boxShadow: isAdding ? 'none' : '0 4px 16px rgba(var(--ht-accent-rgb), 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
            >
                <Plus size={18} strokeWidth={2.5} />
            </button>
        </section>
    );
};

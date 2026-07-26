import { useMemo, useRef, useEffect } from 'react';
import { Trash2, Check } from 'lucide-react';
import type { DailyHabit } from '../../../../Offlinebackup/localstorage/HabitsContext';
import { HabitIcon } from './HabitIcon';

interface HabitCardProps {
    habit: DailyHabit;
    icon: string;
    isDone?: boolean;
    onToggle?: () => void;
    onDelete?: () => void;
    readOnly?: boolean;
}

export const HabitCard = ({ habit, icon, isDone, onToggle, onDelete, readOnly = false }: HabitCardProps) => {
    const habitColor = habit.color || 'var(--color-accent)';
    const gridRef = useRef<HTMLDivElement>(null);

    // Generate 4-row matrix data (35 columns x 4 rows = 140 days)
    const miniGridData = useMemo(() => {
        const rows = 4;
        const columns = 35;
        const totalDays = rows * columns;
        const now = new Date();
        const list: { dateStr: string; isCompleted: boolean }[] = [];

        for (let i = totalDays - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            list.push({
                dateStr,
                isCompleted: habit.completedDates.includes(dateStr)
            });
        }
        return list;
    }, [habit.completedDates]);

    // Auto-scroll to the right so recent/today's days are anchored on the right side
    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.scrollLeft = gridRef.current.scrollWidth;
        }
    }, [miniGridData]);

    // Translate mouse wheel scrolling into horizontal scrolling
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (gridRef.current) {
            const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
            gridRef.current.scrollLeft += delta;
        }
    };

    // Mouse drag-to-scroll support
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!gridRef.current) return;
        isDraggingRef.current = true;
        startXRef.current = e.pageX - gridRef.current.offsetLeft;
        scrollLeftRef.current = gridRef.current.scrollLeft;
    };

    const handleMouseLeaveOrUp = () => {
        isDraggingRef.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !gridRef.current) return;
        e.preventDefault();
        const x = e.pageX - gridRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 1.5;
        gridRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    return (
        <article className="ht-habit-card">
            {/* Top Row: Icon + Name on left, Large Checkbox on right */}
            <div className="ht-habit-card__header">
                <div className="ht-habit-card__left">
                    <div className="ht-habit-card__icon-box">
                        <HabitIcon icon={icon} size={18} />
                        {/* Delete button badge on icon box */}
                        {!readOnly && onDelete && (
                            <button
                                className="ht-habit-card__delete"
                                onClick={onDelete}
                                aria-label={`Delete ${habit.name}`}
                                title={`Delete ${habit.name}`}
                            >
                                <Trash2 size={10} />
                            </button>
                        )}
                    </div>
                    <div className="ht-habit-card__info">
                        <span className="ht-habit-card__name">{habit.name}</span>
                    </div>
                </div>

                {!readOnly && onToggle && (
                    <button
                        className={`ht-habit-card__checkbox ${isDone ? 'ht-habit-card__checkbox--done' : ''}`}
                        onClick={onToggle}
                        style={{
                            background: isDone ? habitColor : 'rgba(255, 255, 255, 0.06)',
                            borderColor: isDone ? habitColor : 'rgba(255, 255, 255, 0.08)',
                            boxShadow: isDone ? `0 4px 14px ${habitColor}40` : 'none'
                        }}
                        aria-label={`Mark ${habit.name} as ${isDone ? 'incomplete' : 'complete'}`}
                    >
                        <Check size={20} color="white" strokeWidth={3} style={{ opacity: isDone ? 1 : 0.2 }} />
                    </button>
                )}
            </div>

            {/* Bottom Row: 4-Row Horizontally Scrollable Matrix Grid */}
            <div
                className="ht-habit-card__grid-wrapper"
                ref={gridRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
            >
                <div className="ht-habit-card__grid" role="img" aria-label={`Activity history for ${habit.name}`}>
                    {miniGridData.map((cell, i) => (
                        <div
                            key={i}
                            className="ht-habit-card__grid-cell"
                            title={`${cell.dateStr}: ${cell.isCompleted ? 'Completed' : 'Not completed'}`}
                            style={{
                                background: cell.isCompleted ? habitColor : 'rgba(255, 255, 255, 0.04)'
                            }}
                        />
                    ))}
                </div>
            </div>
        </article>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useFocusTask } from '../../hooks/useFocusTask';
import {
    Trash2, CheckCircle2, Circle, GripVertical, Plus, Clock, Check,
    X, Search, FlaskConical, Briefcase, Heart, Palette, Code2, ListTodo
} from 'lucide-react';
import './TaskSelectorPanel.css';

const CATEGORIES = ['STUDY', 'WORK', 'PERSONAL', 'CREATIVE', 'OTHER'] as const;

interface TaskSelectorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ---- Category helpers ---- */
const getCategoryIcon = (category?: string) => {
    switch (category?.toUpperCase()) {
        case 'STUDY': return <FlaskConical size={18} />;
        case 'WORK': return <Briefcase size={18} />;
        case 'PERSONAL': return <Heart size={18} />;
        case 'CREATIVE': return <Palette size={18} />;
        default: return <Code2 size={18} />;
    }
};

const getCategoryIconClass = (category?: string): string => {
    switch (category?.toUpperCase()) {
        case 'STUDY': return 'focus-picker__cat-icon--study';
        case 'WORK': return 'focus-picker__cat-icon--work';
        case 'PERSONAL': return 'focus-picker__cat-icon--personal';
        case 'CREATIVE': return 'focus-picker__cat-icon--creative';
        default: return 'focus-picker__cat-icon--other';
    }
};

const getCategoryClass = (category?: string): string => {
    switch (category?.toUpperCase()) {
        case 'STUDY': return 'task-panel__badge--study';
        case 'WORK': return 'task-panel__badge--work';
        case 'PERSONAL': return 'task-panel__badge--personal';
        case 'CREATIVE': return 'task-panel__badge--creative';
        default: return 'task-panel__badge--other';
    }
};

const formatTime = (minutes?: number): string => {
    if (!minutes) return '';
    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${minutes}m`;
};

const getSubtitle = (task: { estimatedMinutes?: number; completedAt?: string | null; category?: string }): string => {
    if (task.estimatedMinutes) return `${task.estimatedMinutes} min session`;
    return task.category ? task.category.charAt(0) + task.category.slice(1).toLowerCase() : 'Focus task';
};

interface CategoryDropdownProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const CategoryDropdown = ({ value, onChange, className = 'task-panel__cat-select' }: CategoryDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCategory = value;

    const handleSelect = (cat: string) => {
        onChange(cat);
        setIsOpen(false);
    };

    const isInline = className.includes('inline');
    const menuStyles: React.CSSProperties = isInline
        ? {
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: '4px',
              minWidth: '120px',
              background: 'var(--fp-bg, rgba(18, 18, 22, 0.98))',
              border: '1px solid var(--fp-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '0.5rem',
              padding: '0.25rem',
              margin: 0,
              listStyle: 'none',
              zIndex: 10000,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
          }
        : {
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              minWidth: '120px',
              background: 'var(--tp-bg, rgba(18, 18, 22, 0.98))',
              border: '1px solid var(--tp-card-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '0.5rem',
              padding: '0.25rem',
              margin: 0,
              listStyle: 'none',
              zIndex: 10000,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
          };

    const prefersReduced = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    const transitionProps = prefersReduced ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' as const };
    const animateProps = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };
    const initialProps = prefersReduced ? { opacity: 0 } : { opacity: 0, y: isInline ? 8 : -8, scale: 0.96 };
    const exitProps = prefersReduced ? { opacity: 0 } : { opacity: 0, y: isInline ? 8 : -8, scale: 0.96 };

    return (
        <div ref={dropdownRef} className={`custom-dropdown ${className}-wrapper`} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                type="button"
                className={`custom-dropdown__trigger ${className}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    textAlign: 'left'
                }}
            >
                <span className="custom-dropdown__trigger-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    {getCategoryIcon(selectedCategory)}
                </span>
                <span className="custom-dropdown__trigger-label">{selectedCategory}</span>
                <span className="custom-dropdown__trigger-arrow">▼</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        role="listbox"
                        initial={initialProps}
                        animate={animateProps}
                        exit={exitProps}
                        transition={transitionProps}
                        className="custom-dropdown__menu"
                        style={menuStyles}
                    >
                        {CATEGORIES.map(cat => (
                            <li
                                key={cat}
                                role="option"
                                aria-selected={cat === selectedCategory}
                                onClick={() => handleSelect(cat)}
                                className={`custom-dropdown__item ${cat === selectedCategory ? 'custom-dropdown__item--selected' : ''}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.375rem 0.5rem',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    color: cat === selectedCategory ? 'var(--color-accent, #818cf8)' : 'var(--tp-text-secondary)',
                                    background: cat === selectedCategory ? 'rgba(129, 140, 248, 0.08)' : 'transparent',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <span className={`custom-dropdown__item-icon ${getCategoryIconClass(cat)}`} style={{ display: 'flex', alignItems: 'center' }}>
                                    {getCategoryIcon(cat)}
                                </span>
                                <span>{cat}</span>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export const TaskSelectorPanel = ({ isOpen, onClose, triggerRef }: TaskSelectorPanelProps) => {
    const { tasks, activeTaskId, setActiveTaskId, addTask, removeTask, toggleTask, reorderTasks } = useFocusTask();
    const [newTaskText, setNewTaskText] = useState('');
    const [newCategory, setNewCategory] = useState<string>('STUDY');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const addInputRef = useRef<HTMLInputElement>(null);
    const [position, setPosition] = useState<{
        top: string;
        left: string;
        right: string;
        origin: string;
        maxHeight?: string;
    }>({
        top: '50%',
        left: 'auto',
        right: '100px',
        origin: 'right center'
    });
    const [isPositioned, setIsPositioned] = useState(false);

    const [dimensions, setDimensions] = useState({
        scale: Math.max(0.5, Math.min(Math.min(window.innerHeight / 633, window.innerWidth / 850), 1.8))
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                scale: Math.max(0.5, Math.min(Math.min(window.innerHeight / 633, window.innerWidth / 850), 1.8))
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scale = dimensions.scale;

    const isPencilTrigger = (): boolean => {
        return !!(triggerRef?.current && (
            triggerRef.current.id === 'home-task-pencil-trigger' ||
            triggerRef.current.closest('#home-task-pencil-trigger') !== null
        ));
    };

    // Update position with viewport clamping
    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && triggerRef?.current && panelRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const panelWidth = panelRef.current.offsetWidth;
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;
                const margin = 20;

                if (isPencilTrigger()) {
                    // Always position below the trigger, centered horizontally
                    const idealTop = triggerRect.bottom + 10;
                    const maxH = Math.max(200, viewportHeight - idealTop - margin);

                    let idealLeft = triggerRect.left + triggerRect.width / 2 - panelWidth / 2;
                    idealLeft = Math.max(margin, Math.min(viewportWidth - panelWidth - margin, idealLeft));

                    setPosition({
                        top: `${idealTop}px`,
                        left: `${idealLeft}px`,
                        right: 'auto',
                        origin: 'top center',
                        maxHeight: `${maxH}px`
                    });
                    setIsPositioned(true);
                } else {
                    // Standard right-dock alignment
                    const panelHeight = panelRef.current.offsetHeight;
                    const triggerCenterY = triggerRect.top + triggerRect.height / 2;
                    
                    // 1. Calculate the max allowable unscaled height to fit inside the viewport visually
                    const maxUnscaledHeight = (viewportHeight - 2 * margin) / scale;
                    const maxH = Math.max(200, maxUnscaledHeight);

                    // 2. Compute offsetY shift due to scaling around 'right center' origin
                    const currentHeight = Math.min(panelHeight, maxH);
                    const offsetY = ((scale - 1) * currentHeight) / 2;

                    // 3. Calculate idealTop (unscaled) centered around trigger
                    let idealTop = triggerCenterY - currentHeight / 2;

                    // 4. Clamped boundaries for unscaled top to keep visual top/bottom in viewport
                    const minTop = margin + offsetY;
                    const maxTop = viewportHeight - currentHeight - offsetY - margin;

                    const finalTop = Math.max(minTop, Math.min(maxTop, idealTop));

                    setPosition({
                        top: `${finalTop}px`,
                        left: 'auto',
                        right: `${92 * scale}px`,
                        origin: 'right center',
                        maxHeight: `${maxH}px`
                    });
                    setIsPositioned(true);
                }
            }
        };

        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);

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
        } else {
            setIsPositioned(false);
        }
    }, [isOpen, triggerRef, scale]);

    const upcomingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed).slice(0, 5);
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Close on click outside
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

    // Auto-focus appropriate input when panel opens
    useEffect(() => {
        if (isOpen) {
            if (isPencilTrigger()) {
                setTimeout(() => searchRef.current?.focus(), 100);
            } else {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
        // Reset add mode when closing
        if (!isOpen) {
            setIsAdding(false);
            setSearchQuery('');
        }
    }, [isOpen]);

    // Focus inline add input when switching to add mode
    useEffect(() => {
        if (isAdding) {
            setTimeout(() => addInputRef.current?.focus(), 50);
        }
    }, [isAdding]);

    const handleAdd = () => {
        if (newTaskText.trim()) {
            addTask(newTaskText.trim(), newCategory);
            setNewTaskText('');
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
        if (e.key === 'Escape') {
            setIsAdding(false);
        }
    };

    const handleStartTask = (taskId: string) => {
        setActiveTaskId(taskId);
        onClose();
    };

    /* ================================================================
       RENDER: Focus Picker variant (pencil trigger)
       ================================================================ */
    const renderFocusPicker = () => {
        const filtered = upcomingTasks.filter(t =>
            t.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const displayTasks = searchQuery ? filtered : filtered.slice(0, 5);

        return (
            <motion.div
                ref={panelRef}
                initial={{ opacity: 0, y: -10 * scale, scale: 0.97 * scale }}
                animate={{ opacity: isPositioned ? 1 : 0, y: 0, scale: scale }}
                exit={{ opacity: 0, y: -10 * scale, scale: 0.97 * scale }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="task-selector-panel-mobile focus-picker"
                style={{
                    position: 'fixed',
                    right: position.right,
                    left: position.left,
                    top: position.top,
                    width: '380px',
                    maxWidth: 'calc(100vw - 40px)',
                    maxHeight: position.maxHeight,
                    borderRadius: '1.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    zIndex: 9999,
                    background: 'var(--fp-bg, rgba(18, 18, 22, 0.97))',
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
                    transformOrigin: position.origin,
                    visibility: isPositioned ? 'visible' : 'hidden'
                }}
            >
                {/* Header */}
                <header className="focus-picker__header">
                    <h2 className="focus-picker__title">Select Your Focus</h2>
                    <button
                        className="focus-picker__close-btn"
                        onClick={onClose}
                        aria-label="Close focus picker"
                    >
                        <X size={18} />
                    </button>
                </header>

                {/* Search */}
                <div className="focus-picker__search">
                    <div className="focus-picker__search-inner">
                        <span className="focus-picker__search-icon">
                            <Search size={16} />
                        </span>
                        <input
                            ref={searchRef}
                            className="focus-picker__search-input"
                            type="text"
                            placeholder="Find a task..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search tasks"
                        />
                    </div>
                </div>

                {/* Section Header */}
                <div className="focus-picker__section-header">
                    <p className="focus-picker__section-title">
                        {searchQuery ? `Results (${filtered.length})` : 'Recent Tasks'}
                    </p>
                    {!searchQuery && upcomingTasks.length > 5 && (
                        <button
                            className="focus-picker__view-all"
                            onClick={() => setSearchQuery(' ')}
                            aria-label="View all tasks"
                        >
                            View All
                        </button>
                    )}
                </div>

                {/* Task Rows */}
                <div className="focus-picker__list">
                    {displayTasks.length > 0 ? (
                        displayTasks.map(task => (
                            <div
                                key={task.id}
                                className={`focus-picker__row ${task.id === activeTaskId ? 'focus-picker__row--active' : ''}`}
                            >
                                <button
                                    className="focus-picker__checkbox"
                                    onClick={() => toggleTask(task.id)}
                                    aria-label={`Mark "${task.text}" as complete`}
                                >
                                    <Circle size={18} />
                                </button>
                                <div className={`focus-picker__cat-icon ${getCategoryIconClass(task.category)}`}>
                                    {getCategoryIcon(task.category)}
                                </div>
                                <div className="focus-picker__info">
                                    <span className="focus-picker__task-name">{task.text}</span>
                                    <span className="focus-picker__task-sub">{getSubtitle(task)}</span>
                                </div>
                                <button
                                    className={`focus-picker__start-btn ${task.id === activeTaskId ? 'focus-picker__start-btn--active' : ''}`}
                                    onClick={() => handleStartTask(task.id)}
                                    aria-label={`Start "${task.text}"`}
                                >
                                    {task.id === activeTaskId ? 'Active' : 'Start'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="focus-picker__empty">
                            <div className="focus-picker__empty-icon">✦</div>
                            <p className="focus-picker__empty-text">
                                {searchQuery.trim() ? 'No tasks match your search.' : 'No tasks yet. Add your first focus task below.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer: Add New Task */}
                <footer className="focus-picker__footer">
                    {isAdding ? (
                        <div className="focus-picker__inline-add">
                            <div className="focus-picker__inline-row">
                                <input
                                    ref={addInputRef}
                                    className="focus-picker__inline-input"
                                    type="text"
                                    placeholder="Task name..."
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    aria-label="New task name"
                                />
                            </div>
                            <div className="focus-picker__inline-row">
                                <CategoryDropdown
                                    className="focus-picker__inline-select"
                                    value={newCategory}
                                    onChange={setNewCategory}
                                />
                                <button
                                    className="focus-picker__inline-submit"
                                    onClick={handleAdd}
                                    aria-label="Submit new task"
                                >
                                    <Check size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="focus-picker__add-btn"
                            onClick={() => setIsAdding(true)}
                            aria-label="Add new task"
                        >
                            <Plus size={16} />
                            Add New Task
                        </button>
                    )}
                </footer>
            </motion.div>
        );
    };

    /* ================================================================
       RENDER: Full task manager variant (dock trigger)
       ================================================================ */
    const renderFullPanel = () => (
        <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
            animate={{ opacity: isPositioned ? 1 : 0, x: 0, y: 0, scale: scale }}
            exit={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="task-selector-panel-mobile task-panel"
            style={{
                position: 'fixed',
                right: position.right,
                left: position.left,
                top: position.top,
                width: 'var(--panel-width, 380px)',
                maxWidth: 'calc(100vw - 40px)',
                maxHeight: position.maxHeight,
                borderRadius: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                zIndex: 9999,
                background: 'var(--tp-bg)',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
                transformOrigin: position.origin,
                visibility: isPositioned ? 'visible' : 'hidden'
            }}
        >
            {/* Header */}
            <header className="task-panel__header">
                <h2 className="task-panel__title">
                    <ListTodo size={22} className="task-panel__title-icon" />
                    Tasks
                </h2>
                <div className="task-panel__progress-container">
                    <div className="task-panel__progress-text">
                        <span>{completedCount} OF {totalCount} COMPLETED</span>
                        <span>{percentage}%</span>
                    </div>
                    <div className="task-panel__progress-bar-track">
                        <div 
                            className="task-panel__progress-bar-fill"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Input Row */}
            <div className="task-panel__input-row">
                <button
                    className="task-panel__add-btn"
                    onClick={handleAdd}
                    aria-label="Add task"
                    title="Add task"
                >
                    <Plus size={16} />
                </button>
                <input
                    ref={inputRef}
                    className="task-panel__text-input"
                    type="text"
                    placeholder="What's your focus?"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="New task name"
                />
                <CategoryDropdown
                    className="task-panel__cat-select"
                    value={newCategory}
                    onChange={setNewCategory}
                />
            </div>

            {/* Task List */}
            <div className="task-panel__list">
                {/* Upcoming Tasks */}
                {upcomingTasks.length > 0 && (
                    <>
                        <p className="task-panel__section-label">
                            Active ({upcomingTasks.length})
                        </p>
                        <Reorder.Group axis="y" values={upcomingTasks} onReorder={(newOrder) => {
                            const completedOnly = tasks.filter(t => t.completed);
                            reorderTasks([...newOrder, ...completedOnly]);
                        }}>
                            {upcomingTasks.map(task => (
                                <Reorder.Item
                                    key={task.id}
                                    value={task}
                                    style={{ listStyle: 'none' }}
                                >
                                    <article
                                        className={`task-panel__card ${task.id === activeTaskId ? 'task-panel__card--active' : ''}`}
                                    >
                                        <div className="task-panel__drag-handle" aria-hidden="true">
                                            <GripVertical size={14} />
                                        </div>
                                        <button
                                            className="task-panel__checkbox"
                                            onClick={() => toggleTask(task.id)}
                                            aria-label={`Mark "${task.text}" as complete`}
                                        >
                                            <Circle size={20} />
                                        </button>
                                        <div className="task-panel__card-body">
                                            <span
                                                className="task-panel__task-name"
                                                onClick={() => setActiveTaskId(task.id)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTaskId(task.id); }}
                                                aria-label={`Set "${task.text}" as active focus`}
                                            >
                                                {task.text}
                                            </span>
                                            <div className="task-panel__meta">
                                                {task.category && (
                                                    <span className={`task-panel__badge ${getCategoryClass(task.category)}`}>
                                                        {task.category}
                                                    </span>
                                                )}
                                                {task.estimatedMinutes && (
                                                    <span className="task-panel__time">
                                                        <Clock size={12} />
                                                        {formatTime(task.estimatedMinutes)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="task-panel__delete-btn"
                                            onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                                            aria-label={`Delete "${task.text}"`}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </article>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <>
                        <p className="task-panel__section-label task-panel__section-label--completed">
                            Completed
                        </p>
                        {completedTasks.map(task => (
                            <article
                                key={task.id}
                                className="task-panel__card task-panel__card--completed"
                            >
                                <button
                                    className="task-panel__checkbox task-panel__checkbox--completed"
                                    onClick={() => toggleTask(task.id)}
                                    aria-label={`Unmark "${task.text}" as complete`}
                                >
                                    <CheckCircle2 size={20} />
                                </button>
                                <div className="task-panel__card-body">
                                    <span className="task-panel__task-name task-panel__task-name--completed">
                                        {task.text}
                                    </span>
                                    <div className="task-panel__meta">
                                        {task.category && (
                                            <span className={`task-panel__badge ${getCategoryClass(task.category)}`}>
                                                {task.category}
                                            </span>
                                        )}
                                        <span className="task-panel__completed-label">
                                            <Check size={12} />
                                            Completed
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="task-panel__delete-btn"
                                    onClick={() => removeTask(task.id)}
                                    aria-label={`Delete "${task.text}"`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </article>
                        ))}
                    </>
                )}

                {/* Empty State */}
                {upcomingTasks.length === 0 && completedTasks.length === 0 && (
                    <div className="task-panel__empty">
                        <div className="task-panel__empty-icon">✦</div>
                        <p className="task-panel__empty-text">
                            No tasks yet. Add your first focus task above.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );

    const content = (
        <AnimatePresence>
            {isOpen && (isPencilTrigger() ? renderFocusPicker() : renderFullPanel())}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};

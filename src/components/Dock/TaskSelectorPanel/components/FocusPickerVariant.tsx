import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Circle, X, Plus, Check } from 'lucide-react';
import { useTaskManager } from '../../../../TaskManager';
import { CategoryDropdown } from './CategoryDropdown';
import { getCategoryIcon, getCategoryIconClass, getSubtitle } from '../constants';
import type { VariantProps } from '../types';

export const FocusPickerVariant = ({
    isOpen,
    onClose,
    scale,
    isPositioned,
    position,
    panelRef
}: VariantProps) => {
    const { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask } = useTaskManager();
    const [newTaskText, setNewTaskText] = useState('');
    const [newCategory, setNewCategory] = useState<string>('STUDY');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    const searchRef = useRef<HTMLInputElement>(null);
    const addInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchRef.current?.focus(), 100);
        }
        return () => {
            setIsAdding(false);
            setSearchQuery('');
        };
    }, [isOpen]);

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
        if (e.key === 'Enter') handleAdd();
        if (e.key === 'Escape') setIsAdding(false);
    };

    const handleStartTask = (taskId: string) => {
        setActiveTaskId(taskId);
        onClose();
    };

    const upcomingTasks = tasks.filter(t => !t.completed);
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
            <header className="focus-picker__header">
                <h2 className="focus-picker__title">Select Your Focus</h2>
                <button className="focus-picker__close-btn" onClick={onClose} aria-label="Close focus picker">
                    <X size={18} />
                </button>
            </header>

            <div className="focus-picker__search">
                <div className="focus-picker__search-inner">
                    <span className="focus-picker__search-icon"><Search size={16} /></span>
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

            <div className="focus-picker__section-header">
                <p className="focus-picker__section-title">
                    {searchQuery ? `Results (${filtered.length})` : 'Recent Tasks'}
                </p>
                {!searchQuery && upcomingTasks.length > 5 && (
                    <button className="focus-picker__view-all" onClick={() => setSearchQuery(' ')} aria-label="View all tasks">
                        View All
                    </button>
                )}
            </div>

            <div className="focus-picker__list">
                {displayTasks.length > 0 ? (
                    displayTasks.map(task => (
                        <div key={task.id} className={`focus-picker__row ${task.id === activeTaskId ? 'focus-picker__row--active' : ''}`}>
                            <button className="focus-picker__checkbox" onClick={() => toggleTask(task.id)} aria-label={`Mark "${task.text}" as complete`}>
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
                            <CategoryDropdown className="focus-picker__inline-select" value={newCategory} onChange={setNewCategory} />
                            <button className="focus-picker__inline-submit" onClick={handleAdd} aria-label="Submit new task">
                                <Check size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="focus-picker__add-btn" onClick={() => setIsAdding(true)} aria-label="Add new task">
                        <Plus size={16} />
                        Add New Task
                    </button>
                )}
            </footer>
        </motion.div>
    );
};
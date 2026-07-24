import React, { useState, useRef, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { ListTodo, Plus, GripVertical, Circle, Clock, Trash2, CheckCircle2, Check } from 'lucide-react';
import { useTaskManager } from '../../../../TaskManager';
import { CategoryDropdown } from './CategoryDropdown';
import { getCategoryClass, formatTime } from '../constants';
import type { VariantProps } from '../types';

export const FullPanelVariant = ({
    isOpen,
    scale,
    isPositioned,
    position,
    panelRef
}: VariantProps) => {
    const { tasks, activeTaskId, setActiveTaskId, addTask, removeTask, toggleTask, reorderTasks } = useTaskManager();
    const [newTaskText, setNewTaskText] = useState('');
    const [newCategory, setNewCategory] = useState<string>('STUDY');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleAdd = () => {
        if (newTaskText.trim()) {
            addTask(newTaskText.trim(), newCategory);
            setNewTaskText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleAdd();
    };

    const upcomingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed).slice(0, 5);
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
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
                        <div className="task-panel__progress-bar-fill" style={{ width: `${percentage}%` }} />
                    </div>
                </div>
            </header>

            <div className="task-panel__input-row">
                <button className="task-panel__add-btn" onClick={handleAdd} aria-label="Add task" title="Add task">
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
                <CategoryDropdown className="task-panel__cat-select" value={newCategory} onChange={setNewCategory} />
            </div>

            <div className="task-panel__list">
                {upcomingTasks.length > 0 && (
                    <>
                        <p className="task-panel__section-label">Active ({upcomingTasks.length})</p>
                        <Reorder.Group axis="y" values={upcomingTasks} onReorder={(newOrder) => {
                            const completedOnly = tasks.filter(t => t.completed);
                            reorderTasks([...newOrder, ...completedOnly]);
                        }}>
                            {upcomingTasks.map(task => (
                                <Reorder.Item key={task.id} value={task} style={{ listStyle: 'none' }}>
                                    <article className={`task-panel__card ${task.id === activeTaskId ? 'task-panel__card--active' : ''}`}>
                                        <div className="task-panel__drag-handle" aria-hidden="true">
                                            <GripVertical size={14} />
                                        </div>
                                        <button className="task-panel__checkbox" onClick={() => toggleTask(task.id)} aria-label={`Mark "${task.text}" as complete`}>
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
                                        <button className="task-panel__delete-btn" onClick={(e) => { e.stopPropagation(); removeTask(task.id); }} aria-label={`Delete "${task.text}"`}>
                                            <Trash2 size={14} />
                                        </button>
                                    </article>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </>
                )}

                {completedTasks.length > 0 && (
                    <>
                        <p className="task-panel__section-label task-panel__section-label--completed">Completed</p>
                        {completedTasks.map(task => (
                            <article key={task.id} className="task-panel__card task-panel__card--completed">
                                <button className="task-panel__checkbox task-panel__checkbox--completed" onClick={() => toggleTask(task.id)} aria-label={`Unmark "${task.text}" as complete`}>
                                    <CheckCircle2 size={20} />
                                </button>
                                <div className="task-panel__card-body">
                                    <span className="task-panel__task-name task-panel__task-name--completed">{task.text}</span>
                                    <div className="task-panel__meta">
                                        {task.category && (
                                            <span className={`task-panel__badge ${getCategoryClass(task.category)}`}>
                                                {task.category}
                                            </span>
                                        )}
                                        <span className="task-panel__completed-label">
                                            <Check size={12} /> Completed
                                        </span>
                                    </div>
                                </div>
                                <button className="task-panel__delete-btn" onClick={() => removeTask(task.id)} aria-label={`Delete "${task.text}"`}>
                                    <Trash2 size={14} />
                                </button>
                            </article>
                        ))}
                    </>
                )}

                {upcomingTasks.length === 0 && completedTasks.length === 0 && (
                    <div className="task-panel__empty">
                        <div className="task-panel__empty-icon">✦</div>
                        <p className="task-panel__empty-text">No tasks yet. Add your first focus task above.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
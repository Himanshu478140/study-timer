import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useFocusTask } from '../../hooks/useFocusTask';
import { Trash2, CheckCircle2, Circle, GripVertical } from 'lucide-react';

interface TaskSelectorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}

export const TaskSelectorPanel = ({ isOpen, onClose, triggerRef }: TaskSelectorPanelProps) => {
    const { tasks, activeTaskId, setActiveTaskId, addTask, removeTask, toggleTask, reorderTasks } = useFocusTask();
    const [newTaskText, setNewTaskText] = useState('');
    const panelRef = useRef<HTMLDivElement>(null);
    const [yPos, setYPos] = useState('50%');

    // Update position with viewport clamping
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
        }
    }, [isOpen, triggerRef]);

    const activeTask = tasks.find(t => t.id === activeTaskId);
    const upcomingTasks = tasks.filter(t => t.id !== activeTaskId && !t.completed);
    const completedTasks = tasks.filter(t => t.completed).slice(0, 5);

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

    const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newTaskText.trim()) {
            addTask(newTaskText.trim());
            setNewTaskText('');
        }
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
                        width: 'var(--panel-width, 340px)',
                        maxWidth: 'calc(100vw - 40px)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '24px 0',
                        zIndex: 9999,
                        background: 'rgba(18, 18, 18, 0.85)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'calc(100vh - 40px)' // Clamp total height
                    }}
                >
                    {/* Header: Current Focus */}
                    <div style={{ padding: '0 32px', marginBottom: '24px', flexShrink: 0 }}>
                        <h3 style={{ 
                            fontSize: '10px', 
                            fontWeight: 'bold', 
                            marginBottom: '8px', 
                            letterSpacing: '0.2em', 
                            textTransform: 'uppercase', 
                            color: '#4edea3' 
                        }}>Current Focus</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <p style={{ 
                                fontSize: '20px', 
                                fontFamily: "'Noto Serif', serif", 
                                fontStyle: 'italic', 
                                color: 'rgba(255, 255, 255, 0.95)',
                                lineHeight: '1.2',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {activeTask ? activeTask.text : 'No active focus'}
                            </p>
                            {activeTask && (
                                <button 
                                    onClick={() => toggleTask(activeTask.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#4edea3', cursor: 'pointer', padding: '4px' }}
                                    title="Complete"
                                >
                                    <CheckCircle2 size={24} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* New Task Input */}
                    <div style={{ 
                        padding: '16px 24px', 
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                        marginBottom: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        flexShrink: 0
                    }}>
                        <input
                            style={{ 
                                width: '100%', 
                                background: 'transparent', 
                                border: 'none', 
                                fontSize: '14px', 
                                color: 'rgba(255, 255, 255, 0.7)', 
                                fontStyle: 'italic', 
                                outline: 'none' 
                            }}
                            placeholder="Capture a new intention..."
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyDown={handleAdd}
                        />
                    </div>

                    {/* Task List Section */}
                    <div className="custom-scrollbar" style={{ 
                        padding: '0 12px', 
                        overflowY: 'auto', 
                        flex: 1,
                        minHeight: '100px' // Minimum height before showing empty or starting to grow
                    }}>
                        {upcomingTasks.length > 0 && (
                            <>
                                <div style={{ 
                                    padding: '8px 16px', 
                                    fontSize: '10px', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.15em', 
                                    color: 'rgba(255, 255, 255, 0.3)', 
                                    fontWeight: '600', 
                                    marginBottom: '8px' 
                                }}>Coming Up</div>
                                
                                <Reorder.Group axis="y" values={upcomingTasks} onReorder={(newOrder) => {
                                    // Construct new full tasks list
                                    const otherTasks = tasks.filter(t => t.id === activeTaskId || t.completed);
                                    reorderTasks([...newOrder, ...otherTasks]);
                                }}>
                                    {upcomingTasks.map(task => (
                                        <Reorder.Item
                                            key={task.id}
                                            value={task}
                                            style={{ marginBottom: '4px' }}
                                        >
                                            <div
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '10px 12px', 
                                                    borderRadius: '1rem', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '12px',
                                                    fontSize: '14px', 
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    cursor: 'default',
                                                    border: '1px solid transparent',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                                    const trash = e.currentTarget.querySelector('.trash-btn') as HTMLElement;
                                                    if (trash) trash.style.opacity = '1';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                                    e.currentTarget.style.borderColor = 'transparent';
                                                    const trash = e.currentTarget.querySelector('.trash-btn') as HTMLElement;
                                                    if (trash) trash.style.opacity = '0';
                                                }}
                                            >
                                                <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.1)' }}>
                                                    <GripVertical size={14} />
                                                </div>
                                                
                                                <button
                                                    onClick={() => toggleTask(task.id)}
                                                    style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'rgba(255, 255, 255, 0.2)', transition: 'color 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#4edea3'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.2)'}
                                                >
                                                    <Circle size={18} />
                                                </button>

                                                <span 
                                                    onClick={() => setActiveTaskId(task.id)}
                                                    style={{ 
                                                        flex: 1, 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        whiteSpace: 'nowrap',
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        fontFamily: "'Noto Serif', serif",
                                                        cursor: 'pointer'
                                                    }}
                                                >{task.text}</span>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeTask(task.id);
                                                    }}
                                                    className="trash-btn"
                                                    style={{ 
                                                        background: 'transparent', 
                                                        border: 'none', 
                                                        padding: '4px', 
                                                        cursor: 'pointer', 
                                                        color: 'rgba(239, 68, 68, 0.5)',
                                                        opacity: 0,
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </>
                        )}

                        {completedTasks.length > 0 && (
                            <div style={{ marginTop: '24px', paddingBottom: '16px' }}>
                                <div style={{ 
                                    padding: '8px 16px', 
                                    fontSize: '10px', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.15em', 
                                    color: 'rgba(78, 222, 163, 0.3)', 
                                    fontWeight: '600', 
                                    marginBottom: '8px' 
                                }}>Completed</div>
                                {completedTasks.map(task => (
                                    <div
                                        key={task.id}
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px 16px', 
                                            borderRadius: '1rem', 
                                            border: '1px solid rgba(78, 222, 163, 0.1)', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            fontSize: '13px', 
                                            marginBottom: '6px',
                                            background: 'rgba(78, 222, 163, 0.03)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            const trash = e.currentTarget.querySelector('.trash-btn-comp') as HTMLElement;
                                            if (trash) trash.style.opacity = '1';
                                        }}
                                        onMouseLeave={(e) => {
                                            const trash = e.currentTarget.querySelector('.trash-btn-comp') as HTMLElement;
                                            if (trash) trash.style.opacity = '0';
                                        }}
                                    >
                                        <span style={{ 
                                            flex: 1, 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis', 
                                            whiteSpace: 'nowrap',
                                            fontFamily: "'Noto Serif', serif",
                                            fontStyle: 'italic',
                                            color: 'rgba(78, 222, 163, 0.7)',
                                            textDecoration: 'line-through'
                                        }}>{task.text}</span>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => toggleTask(task.id)}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}
                                            >
                                                <CheckCircle2 size={16} style={{ color: '#4edea3' }} />
                                            </button>
                                            <button 
                                                onClick={() => removeTask(task.id)}
                                                className="trash-btn-comp"
                                                style={{ 
                                                    background: 'transparent', 
                                                    border: 'none', 
                                                    cursor: 'pointer', 
                                                    display: 'flex', 
                                                    color: 'rgba(239, 68, 68, 0.5)',
                                                    padding: '4px',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s'
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};




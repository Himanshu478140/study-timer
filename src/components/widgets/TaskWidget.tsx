import { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Circle } from 'lucide-react';
import { useFocusTask } from '../../hooks/useFocusTask';
import { PremiumSelect } from '../ui/PremiumSelect';

export const TaskWidget = () => {
    const { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask, removeTask } = useFocusTask();
    const [isAdding, setIsAdding] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Auto-select first task if none selected
    useEffect(() => {
        if (!activeTaskId && tasks.length > 0) {
            setActiveTaskId(tasks[0].id);
        }
    }, [tasks, activeTaskId, setActiveTaskId]);

    const handleSelect = (val: string) => {
        if (val === 'create_new') {
            setIsAdding(true);
        } else {
            setActiveTaskId(val);
        }
    };

    const handleAddSubmit = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            const newId = addTask(inputValue.trim());
            setInputValue('');
            setIsAdding(false);
            if (newId) setActiveTaskId(newId);
        }
    };

    const options = [
        ...tasks.map(t => ({
            id: t.id,
            label: <span style={{
                textDecoration: t.completed ? 'line-through' : 'none',
                opacity: t.completed ? 0.7 : 1,
                color: t.completed ? '#94a3b8' : 'inherit',
                transition: 'all 0.3s'
            }}>{t.text}</span>,
            // Wrap icon in interactive div to stop propagation and toggle task
            icon: (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(t.id);
                        // Auto-switch logic: If completing current task, switch to next open one
                        if (activeTaskId === t.id && !t.completed) {
                            const incomplete = tasks.find(task => !task.completed && task.id !== t.id);
                            if (incomplete) setActiveTaskId(incomplete.id);
                        }
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title={t.completed ? "Mark Unfinished" : "Complete Task"}
                >
                    {t.completed ? <CheckCircle size={16} color="var(--color-accent)" /> : <Circle size={16} style={{ opacity: 0.5 }} />}
                </div>
            )
        })),
        { id: 'create_new', label: 'Create New Task...', icon: <Plus size={16} color="var(--color-accent)" /> }
    ];

    if (isAdding) {
        return (
            <div className="widget-card" style={{ padding: '1rem' }}>
                <div style={{
                    width: '100%',
                    background: 'var(--color-glass-bg)', // Match select-trigger
                    borderRadius: '999px',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '1px solid var(--color-glass-border)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)'
                }}>
                    <Target size={18} color="var(--color-accent)" />
                    <input
                        autoFocus
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleAddSubmit}
                        onBlur={() => { setIsAdding(false); setInputValue('') }} // Cancel on blur
                        placeholder="What is your focus?"
                        className="task-input-placeholder-white"
                        style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="widget-card" style={{ padding: '1rem', overflow: 'visible', pointerEvents: 'auto' }}> {/* Card Wrapper */}
            <div style={{ position: 'relative', zIndex: 100 }}>
                <PremiumSelect
                    options={options}
                    value={activeTaskId || ''}
                    onChange={handleSelect}
                    placeholder="Select a task..."
                    onDelete={activeTaskId ? () => removeTask(activeTaskId) : undefined}
                />
            </div>

            {/* External buttons removed, functionality moved inside PremiumSelect */}
        </div>
    );
};

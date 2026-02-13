import { useState, type KeyboardEvent } from 'react';
import { Check, X, Target } from 'lucide-react';

interface FocusInputProps {
    task: string;
    isCompleted: boolean;
    onUpdate: (task: string) => void;
    onToggle: () => void;
    onClear: () => void;
}

export const FocusInput = ({ task, isCompleted, onUpdate, onToggle, onClear }: FocusInputProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(task);

    const handleSubmit = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            onUpdate(inputValue);
            setIsEditing(false);
        }
    };

    if (!task && !isEditing) {
        return (
            <div
                className="interactive-hover"
                style={{
                    marginBottom: '1rem',
                    opacity: 0.8,
                    cursor: 'text'
                }}
                onClick={() => setIsEditing(true)}
            >
                <div className="glass" style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.9rem'
                }}>
                    <Target size={16} />
                    <span>What is your main focus?</span>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="glass" style={{
                marginBottom: '1rem',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                display: 'flex',
                alignItems: 'center'
            }}>
                <input
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleSubmit}
                    onBlur={() => {
                        if (inputValue.trim()) onUpdate(inputValue);
                        setIsEditing(false);
                    }}
                    placeholder="I will focus on..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-primary)',
                        fontSize: '1rem',
                        textAlign: 'center',
                        width: '100%',
                        outline: 'none',
                        fontFamily: 'inherit'
                    }}
                />
            </div>
        );
    }

    return (
        <div className="glass interactive-hover" style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: isCompleted ? 'rgba(34, 197, 94, 0.2)' : undefined,
            borderColor: isCompleted ? 'rgba(34, 197, 94, 0.4)' : undefined,
            transition: 'all 0.3s ease'
        }}>
            <button
                onClick={onToggle}
                className="interactive-press"
                style={{
                    background: isCompleted ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer'
                }}
            >
                {isCompleted && <Check size={14} />}
            </button>

            <span style={{
                textDecoration: isCompleted ? 'line-through' : 'none',
                opacity: isCompleted ? 0.7 : 1,
                fontSize: '1rem',
                fontWeight: 500
            }}>
                {task}
            </span>

            <button
                onClick={onClear}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                    opacity: 0.5
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

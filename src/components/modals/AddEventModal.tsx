import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import '../../components/widgets/widgets.css';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, type: string, color: string) => void;
    onDelete?: () => void;
    initialDate?: Date;
    initialEvent?: { title: string; type: string; color: string } | null;
}

export const AddEventModal = ({ isOpen, onClose, onSave, onDelete, initialEvent }: AddEventModalProps) => {
    const [title, setTitle] = useState(initialEvent?.title || '');
    const [type, setType] = useState<'exam' | 'assignment' | 'study' | 'other'>('study');
    const [customType, setCustomType] = useState('');

    // Reset state when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            setTitle(initialEvent?.title || '');
            const initialType = (initialEvent?.type as any);
            if (initialType && ['exam', 'assignment', 'study'].includes(initialType)) {
                setType(initialType);
                setCustomType('');
            } else if (initialEvent?.type) {
                setType('other');
                setCustomType(initialEvent.type);
            } else {
                setType('study');
                setCustomType('');
            }
        }
    }, [isOpen, initialEvent]);

    if (!isOpen) return null;

    const eventTypes = [
        { id: 'exam', label: 'Exam', color: '#ef4444' },
        { id: 'assignment', label: 'Assignment', color: '#eab308' },
        { id: 'study', label: 'Study Session', color: '#a855f7' },
        { id: 'other', label: 'Other', color: '#3b82f6' }
    ];

    const handleSave = () => {
        if (!title.trim()) return;

        let finalType = type;
        if (type === 'other') {
            finalType = customType.trim() ? (customType as any) : 'Other'; // Default to 'Other' if empty
        }

        const selectedType = eventTypes.find(t => t.id === type);
        onSave(title, finalType, selectedType?.color || '#3b82f6');
        setTitle('');
        setCustomType('');
        onClose();
    };

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
        }}>
            <div className="widget-card" style={{ width: '350px', padding: '1.5rem', background: 'var(--color-glass-bg)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                        <CalendarIcon size={18} />
                        {initialEvent ? 'Edit Event' : 'Add Event'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'white', opacity: 0.9 }}>Event Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Math Final"
                        autoFocus
                        style={{
                            width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'white', opacity: 0.9 }}>Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: type === 'other' ? '0.75rem' : '0' }}>
                        {eventTypes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setType(t.id as any);
                                    if (t.id !== 'other') setCustomType('');
                                }}
                                style={{
                                    padding: '0.5rem', borderRadius: '0.5rem',
                                    background: type === t.id ? t.color : 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: type === t.id ? '#000' : 'rgba(255,255,255,0.8)',
                                    fontWeight: type === t.id ? 600 : 400,
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    {type === 'other' && (
                        <div style={{ animation: 'fadeIn 0.2s' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.3rem', color: 'white', opacity: 0.7 }}>Custom Category Name</label>
                            <input
                                type="text"
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                placeholder="e.g. Birthday, Gym, Party"
                                style={{
                                    width: '100%', padding: '0.6rem', borderRadius: '0.5rem',
                                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white', fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {initialEvent && onDelete && (
                        <button
                            onClick={() => { onDelete(); onClose(); }}
                            style={{
                                flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Delete
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        style={{
                            flex: 2, padding: '0.75rem', borderRadius: '0.75rem',
                            background: 'white', color: 'black', border: 'none',
                            fontWeight: 600, cursor: 'pointer', opacity: title.trim() ? 1 : 0.5
                        }}
                    >
                        {initialEvent ? 'Update Event' : 'Save Event'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

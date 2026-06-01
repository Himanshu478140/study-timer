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
    anchor?: {
        top: number;
        bottom: number;
        left: number;
        width: number;
    } | null;
}

export const AddEventModal = ({ isOpen, onClose, onSave, onDelete, initialEvent, anchor }: AddEventModalProps) => {
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

    const cardWidth = 280;
    const margin = 16;
    
    let leftStyle = '50%';
    let topStyle = '50%';
    let transformStyle = 'translate(-50%, -50%)';
    let hasArrow = false;
    let arrowStyle: React.CSSProperties = {};
    
    if (anchor) {
        const centerX = anchor.left + anchor.width / 2;
        const leftClamped = Math.max(cardWidth / 2 + margin, Math.min(window.innerWidth - cardWidth / 2 - margin, centerX));
        
        leftStyle = `${leftClamped}px`;
        
        // Check if there is enough space above (300px modal height + padding)
        const spaceAbove = anchor.top;
        const preferAbove = spaceAbove > 320;
        
        if (preferAbove) {
            topStyle = `${anchor.top - 12}px`;
            transformStyle = 'translate(-50%, -100%)';
            hasArrow = true;
            arrowStyle = {
                bottom: '-6px',
                left: `calc(50% + ${centerX - leftClamped}px)`,
                transform: 'translateX(-50%) rotate(45deg)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
            };
        } else {
            topStyle = `${anchor.bottom + 12}px`;
            transformStyle = 'translate(-50%, 0)';
            hasArrow = true;
            arrowStyle = {
                top: '-6px',
                left: `calc(50% + ${centerX - leftClamped}px)`,
                transform: 'translateX(-50%) rotate(45deg)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
            };
        }
    }

    return createPortal(
        <div 
            className="add-event-modal-container"
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 100000,
                background: anchor ? 'transparent' : 'rgba(0,0,0,0.6)', 
                backdropFilter: anchor ? 'none' : 'blur(4px)'
            }}
        >
            <div 
                className="widget-card" 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                    position: anchor ? 'absolute' : 'relative',
                    left: leftStyle,
                    top: topStyle,
                    transform: transformStyle,
                    width: `${cardWidth}px`, 
                    padding: '1rem', 
                    background: 'rgba(15, 15, 15, 0.95)', 
                    
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    borderRadius: '0.85rem'
                }}
            >
                {hasArrow && (
                    <div style={{
                        position: 'absolute',
                        width: '12px',
                        height: '12px',
                        background: 'rgba(15, 15, 15, 0.95)',
                        zIndex: -1,
                        ...arrowStyle
                    }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                        <CalendarIcon size={16} />
                        {initialEvent ? 'Edit Event' : 'Add Event'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.3rem', color: 'white', opacity: 0.9 }}>Event Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Math Final"
                        autoFocus
                        style={{
                            width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.5rem',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', fontSize: '0.9rem'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.3rem', color: 'white', opacity: 0.9 }}>Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: type === 'other' ? '0.6rem' : '0' }}>
                        {eventTypes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setType(t.id as any);
                                    if (t.id !== 'other') setCustomType('');
                                }}
                                style={{
                                    padding: '0.4rem', borderRadius: '0.4rem',
                                    background: type === t.id ? t.color : 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: type === t.id ? '#000' : 'rgba(255,255,255,0.8)',
                                    fontWeight: type === t.id ? 600 : 400,
                                    fontSize: '0.8rem',
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

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {initialEvent && onDelete && (
                        <button
                            onClick={() => { onDelete(); onClose(); }}
                            style={{
                                flex: 1, padding: '0.55rem', borderRadius: '0.5rem',
                                background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                            }}
                        >
                            Delete
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        style={{
                            flex: 2, padding: '0.55rem', borderRadius: '0.5rem',
                            background: 'white', color: 'black', border: 'none',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: title.trim() ? 1 : 0.5
                        }}
                    >
                        {initialEvent ? 'Update' : 'Save'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

import { useState } from 'react';
import { Star, X, Tag } from 'lucide-react';

interface SessionQualityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rating: number, tags: string[]) => void;
    sessionType: string;
}

const TAG_OPTIONS = [
    "Deep Focus", "Flow State", "Distracted",
    "Tired", "Energetic", "Procrastinated",
    "Learning", "Creative"
];

export const SessionQualityModal = ({ isOpen, onClose, onSave, sessionType }: SessionQualityModalProps) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    if (!isOpen) return null;

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    const handleSave = () => {
        if (rating === 0) return; // Force rating
        onSave(rating, selectedTags);
        // Reset for next time (optional, but good UX)
        setRating(0);
        setSelectedTags([]);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div
                className="glass-panel"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '90%',
                    maxWidth: '400px',
                    padding: '2rem',
                    borderRadius: '1rem',
                    background: 'var(--color-bg-primary)', // Solid background to block underlying UI
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Session Complete!</h2>
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                    How was your {sessionType.replace('_', ' ')} session?
                </p>

                {/* Star Rating */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star
                            key={star}
                            size={32}
                            fill={(hoverRating || rating) >= star ? "#fbbf24" : "transparent"}
                            color={(hoverRating || rating) >= star ? "#fbbf24" : "var(--color-text-secondary)"}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>

                {/* Tags */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.8 }}>
                        <Tag size={14} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>ADD TAGS</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {TAG_OPTIONS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '2rem',
                                    fontSize: '0.8rem',
                                    background: selectedTags.includes(tag) ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                    color: selectedTags.includes(tag) ? 'white' : 'var(--color-text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={rating === 0}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        background: rating > 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                        color: rating > 0 ? 'white' : 'rgba(255,255,255,0.3)',
                        border: 'none',
                        fontWeight: 600,
                        cursor: rating > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                    }}
                >
                    Save & Continue
                </button>
            </div>
        </div>
    );
};

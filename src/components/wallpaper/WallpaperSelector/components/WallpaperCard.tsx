import { X } from 'lucide-react';
import { type WallpaperConfig } from '../types';

interface WallpaperCardProps {
    wp: WallpaperConfig;
    currentId: string;
    onSelect: (wp: WallpaperConfig) => void;
    onDelete?: (id: string) => void;
}

export const WallpaperCard = ({
    wp,
    currentId,
    onSelect,
    onDelete
}: WallpaperCardProps) => {
    const isActive = currentId === wp.id;
    const isCustom = wp.category === 'Custom';

    const getBackgroundValue = () => {
        if (wp.type === 'solid') return wp.value;
        if (wp.thumbnail && (wp.thumbnail.startsWith('#') || wp.thumbnail.startsWith('linear-gradient'))) {
            return wp.thumbnail;
        }
        return wp.thumbnail ? `url(${wp.thumbnail}) center/cover` : wp.value;
    };

    return (
        <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
                className={`wp-btn ${isActive ? 'active' : ''} interactive-hover`}
                onClick={() => onSelect(wp)}
                title={wp.id}
                style={{
                    background: getBackgroundValue(),
                    width: '80px',
                    height: '80px',
                    borderRadius: '1rem',
                    border: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: wp.textColorTheme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'
                }}
            >
                {wp.icon && <wp.icon size={28} strokeWidth={1.5} />}
            </button>
            {isCustom && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(wp.id);
                    }}
                    style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: '#ef4444',
                        color: 'white',
                        border: '2px solid #000',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        padding: 0
                    }}
                    title="Delete"
                >
                    <X size={14} strokeWidth={3} />
                </button>
            )}
        </div>
    );
};

import { Star, X } from 'lucide-react';
import { type WallpaperConfig } from '../../WallpaperSelector';
import { getThumbBg, prettyName } from '../utils/wallpaperHelpers';

interface WallpaperThumbnailProps {
    wp: WallpaperConfig;
    isActive: boolean;
    isFav: boolean;
    onSelect: (wp: WallpaperConfig) => void;
    toggleFavorite: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const WallpaperThumbnail = ({
    wp,
    isActive,
    isFav,
    onSelect,
    toggleFavorite,
    onDelete
}: WallpaperThumbnailProps) => {
    const isCustom = wp.category === 'Custom';

    return (
        <div className={`wg-thumb ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
            <button
                className="wg-thumb__preview"
                onClick={() => onSelect(wp)}
                aria-label={`Select wallpaper: ${prettyName(wp.id)}`}
            >
                <div
                    className="wg-thumb__preview-inner"
                    style={{ background: getThumbBg(wp) }}
                >
                    {wp.icon && <wp.icon size={24} strokeWidth={1.5} className="wg-thumb__icon" />}
                </div>
                {isActive && <span className="wg-active-badge">Active</span>}
            </button>

            {/* Favorite toggle */}
            <button
                className={`wg-fav-btn ${isFav ? 'is-fav' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(wp.id); }}
                aria-label={isFav ? `Remove ${prettyName(wp.id)} from favorites` : `Add ${prettyName(wp.id)} to favorites`}
            >
                <Star size={12} fill={isFav ? '#fbbf24' : 'none'} />
            </button>

            {/* Delete button for custom */}
            {isCustom && onDelete && (
                <button
                    className="wg-delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(wp.id); }}
                    aria-label={`Delete custom wallpaper ${prettyName(wp.id)}`}
                >
                    <X size={12} strokeWidth={3} />
                </button>
            )}

            <span className="wg-thumb__label">{prettyName(wp.id)}</span>
        </div>
    );
};

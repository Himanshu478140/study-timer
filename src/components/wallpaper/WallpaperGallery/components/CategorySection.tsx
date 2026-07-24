import { Star } from 'lucide-react';
import { type WallpaperCategory, type WallpaperConfig } from '../../WallpaperSelector';
import { CATEGORY_ORDER, CATEGORY_META } from '../utils/category';
import { WallpaperThumbnail } from './WallpaperThumbnail';
import { UploadSection } from './UploadSection';

interface CategorySectionProps {
    grouped: Record<WallpaperCategory, WallpaperConfig[]>;
    favWallpapers: WallpaperConfig[];
    favorites: string[];
    currentId: string;
    onSelect: (wp: WallpaperConfig) => void;
    toggleFavorite: (id: string) => void;
    onDeleteCustom: (id: string) => void;
    
    // Upload Props
    youtubeUrl: string;
    setYoutubeUrl: (url: string) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddYouTube: () => void;
}

export const CategorySection = ({
    grouped,
    favWallpapers,
    favorites,
    currentId,
    onSelect,
    toggleFavorite,
    onDeleteCustom,
    youtubeUrl,
    setYoutubeUrl,
    handleFileUpload,
    handleVideoUpload,
    handleAddYouTube
}: CategorySectionProps) => {
    return (
        <>
            {/* ── Favorites Row ── */}
            {favWallpapers.length > 0 && (
                <>
                    <div className="wg-category">
                        <div className="wg-category__header">
                            <Star size={16} className="wg-category__icon" />
                            <h3 className="wg-category__title">Favorites</h3>
                            <span className="wg-category__count">{favWallpapers.length}</span>
                        </div>
                        <div className="wg-scroll-row">
                            {favWallpapers.map(wp => (
                                <WallpaperThumbnail
                                    key={wp.id}
                                    wp={wp}
                                    isActive={currentId === wp.id}
                                    isFav={true}
                                    onSelect={onSelect}
                                    toggleFavorite={toggleFavorite}
                                    onDelete={onDeleteCustom}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="wg-divider" />
                </>
            )}

            {/* ── Category Rows ── */}
            {CATEGORY_ORDER.map((cat, idx) => {
                const items = grouped[cat];
                if (!items && cat !== 'Custom') return null;
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                const showCustom = cat === 'Custom';

                // Skip empty non-custom categories
                if (!showCustom && (!items || items.length === 0)) return null;

                return (
                    <div key={cat}>
                        <div className="wg-category">
                            <div className="wg-category__header">
                                <Icon size={16} className="wg-category__icon" />
                                <h3 className="wg-category__title">{meta.label}</h3>
                                <span className="wg-category__count">{items?.length ?? 0}</span>
                            </div>
                            <div className="wg-scroll-row">
                                {/* Upload cards for Custom category */}
                                {showCustom && (
                                    <UploadSection
                                        youtubeUrl={youtubeUrl}
                                        setYoutubeUrl={setYoutubeUrl}
                                        handleFileUpload={handleFileUpload}
                                        handleVideoUpload={handleVideoUpload}
                                        handleAddYouTube={handleAddYouTube}
                                    />
                                )}

                                {/* Wallpaper thumbnails */}
                                {items?.map(wp => (
                                    <WallpaperThumbnail
                                        key={wp.id}
                                        wp={wp}
                                        isActive={currentId === wp.id}
                                        isFav={favorites.includes(wp.id)}
                                        onSelect={onSelect}
                                        toggleFavorite={toggleFavorite}
                                        onDelete={onDeleteCustom}
                                    />
                                ))}

                                {/* Empty state for Custom when no custom wallpapers */}
                                {showCustom && (!items || items.length === 0) && (
                                    <div className="wg-empty">Upload images, videos, or paste YouTube links</div>
                                )}
                            </div>
                        </div>
                        {/* Divider between categories (not after last) */}
                        {idx < CATEGORY_ORDER.length - 1 && <div className="wg-divider" style={{ marginTop: '1rem' }} />}
                    </div>
                );
            })}
        </>
    );
};

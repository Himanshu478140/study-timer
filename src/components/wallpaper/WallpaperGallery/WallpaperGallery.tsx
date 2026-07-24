import { useState, useMemo } from 'react';
import { WALLPAPERS, type WallpaperConfig } from '../WallpaperSelector';
import { useCustomWallpapers } from './hooks/useCustomWallpapers';
import { useWallpaperFilters } from './hooks/useWallpaperFilters';
import { WallpaperHero } from './components/WallpaperHero';
import { FilterBar } from './components/FilterBar';
import { CategorySection } from './components/CategorySection';
import './wallpaper-gallery.css';

interface WallpaperGalleryProps {
    currentId: string;
    wallpaper: WallpaperConfig;
    onSelect: (config: WallpaperConfig) => void;
}

export const WallpaperGallery = ({ currentId, wallpaper, onSelect }: WallpaperGalleryProps) => {
    /* ── Favorites ── */
    const [favorites, setFavorites] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('wallpaper-favorites');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            localStorage.setItem('wallpaper-favorites', JSON.stringify(next));
            return next;
        });
    };

    /* ── Custom wallpapers & uploads hook ── */
    const {
        customWallpapers,
        youtubeUrl,
        setYoutubeUrl,
        handleFileUpload,
        handleVideoUpload,
        handleAddYouTube,
        handleDeleteCustom
    } = useCustomWallpapers({ onSelect });

    const allWallpapers = useMemo(() => [...WALLPAPERS, ...customWallpapers], [customWallpapers]);

    /* ── Filtering and memoized category grouping states hook ── */
    const {
        typeFilter,
        setTypeFilter,
        toneFilter,
        setToneFilter,
        grouped,
        favWallpapers
    } = useWallpaperFilters(allWallpapers, favorites);

    /* ── Current selected wallpaper showcase banner info ── */
    const heroBg = useMemo(() => {
        if (wallpaper.type === 'solid') {
            return { kind: 'solid' as const, value: wallpaper.value };
        }
        if (wallpaper.type === 'animated-gradient' || wallpaper.type === 'particles') {
            return { kind: 'gradient' as const, value: wallpaper.thumbnail || 'linear-gradient(135deg, #1e1b4b, #312e81)' };
        }
        if (wallpaper.type === 'image') {
            const raw = wallpaper.value;
            const match = raw.match(/url\(['"]?(.*?)['"]?\)/);
            const src = match ? match[1] : wallpaper.value;
            
            // Build responsive srcSet for Unsplash images to achieve Retina-sharp renders with minimum bandwidth
            if (src.includes('images.unsplash.com')) {
                const baseUrl = src.split('?')[0];
                const params = 'auto=format&fit=crop&q=75';
                const srcSet = [
                    `${baseUrl}?${params}&w=400 400w`,
                    `${baseUrl}?${params}&w=800 800w`,
                    `${baseUrl}?${params}&w=1200 1200w`,
                    `${baseUrl}?${params}&w=1600 1600w`
                ].join(', ');
                
                // Fallback src (typically 800px wide is a perfect desktop default)
                const fallbackSrc = `${baseUrl}?${params}&w=800`;
                return { kind: 'image' as const, value: fallbackSrc, srcSet };
            }
            return { kind: 'image' as const, value: src };
        }
        // video / youtube
        const src = wallpaper.thumbnail || '';
        return { kind: 'image' as const, value: src };
    }, [wallpaper]);

    return (
        <section className="wallpaper-gallery" aria-label="Wallpaper Gallery">
            {/* Hero showcase */}
            <WallpaperHero wallpaper={wallpaper} heroBg={heroBg} />

            {/* Filter controls */}
            <FilterBar
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                toneFilter={toneFilter}
                setToneFilter={setToneFilter}
            />

            {/* Categories & Favorites lists */}
            <CategorySection
                grouped={grouped}
                favWallpapers={favWallpapers}
                favorites={favorites}
                currentId={currentId}
                onSelect={onSelect}
                toggleFavorite={toggleFavorite}
                onDeleteCustom={handleDeleteCustom}
                youtubeUrl={youtubeUrl}
                setYoutubeUrl={setYoutubeUrl}
                handleFileUpload={handleFileUpload}
                handleVideoUpload={handleVideoUpload}
                handleAddYouTube={handleAddYouTube}
            />
        </section>
    );
};

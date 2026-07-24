import { useState, useMemo } from 'react';
import { WALLPAPERS } from './data/wallpapers';
import { type WallpaperConfig, type WallpaperCategory } from './types';
import { useCustomWallpapers } from './hooks/useCustomWallpapers';
import { useStorageInfo } from './hooks/useStorageInfo';
import { CategoryTabs } from './components/CategoryTabs';
import { UploadPanel } from './components/UploadPanel';
import { WallpaperCard } from './components/WallpaperCard';
import './wallpaper.css';

interface WallpaperGridProps {
    currentId: string;
    onSelect: (config: WallpaperConfig) => void;
}

export const WallpaperGrid = ({ currentId, onSelect }: WallpaperGridProps) => {
    const [activeCategory, setActiveCategory] = useState<WallpaperCategory>('Solid Colour');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const {
        customWallpapers,
        handleFileUpload,
        handleVideoUpload,
        handleAddYouTube,
        handleDeleteCustom
    } = useCustomWallpapers({
        onSelect,
        setActiveCategory
    });

    const {
        storageUsed,
        storageColor
    } = useStorageInfo(customWallpapers);

    const allWallpapers = useMemo(() => [...WALLPAPERS, ...customWallpapers], [customWallpapers]);
    const filteredWallpapers = useMemo(() => allWallpapers.filter(wp => wp.category === activeCategory), [allWallpapers, activeCategory]);

    const handleYouTubeSubmit = () => {
        handleAddYouTube(youtubeUrl, () => setYoutubeUrl(''));
    };

    return (
        <>
            {/* Category Tabs */}
            <CategoryTabs
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />

            {/* Wallpapers Grid */}
            <div className="wallpaper-grid" style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                padding: '0.5rem 0.25rem 1rem 0.25rem'
            }}>
                {activeCategory === 'Custom' && (
                    <UploadPanel
                        youtubeUrl={youtubeUrl}
                        setYoutubeUrl={setYoutubeUrl}
                        handleFileUpload={handleFileUpload}
                        handleVideoUpload={handleVideoUpload}
                        handleAddYouTube={handleYouTubeSubmit}
                        storageUsed={storageUsed}
                        storageColor={storageColor}
                    />
                )}

                {filteredWallpapers.map((wp) => (
                    <WallpaperCard
                        key={wp.id}
                        wp={wp}
                        currentId={currentId}
                        onSelect={onSelect}
                        onDelete={handleDeleteCustom}
                    />
                ))}
            </div>
        </>
    );
};

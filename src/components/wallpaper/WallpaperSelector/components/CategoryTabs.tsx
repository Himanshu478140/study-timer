import { type WallpaperCategory } from '../types';
import { WALLPAPER_CATEGORIES } from '../data/categories';

interface CategoryTabsProps {
    activeCategory: WallpaperCategory;
    setActiveCategory: (cat: WallpaperCategory) => void;
}

export const CategoryTabs = ({ activeCategory, setActiveCategory }: CategoryTabsProps) => {
    return (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', marginTop: '1rem' }}>
            {WALLPAPER_CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="interactive-press"
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '1.5rem',
                        fontSize: '0.875rem',
                        background: activeCategory === cat ? 'white' : 'rgba(255,255,255,0.05)',
                        color: activeCategory === cat ? 'black' : 'rgba(255,255,255,0.7)',
                        fontWeight: activeCategory === cat ? 600 : 400,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

import { useState, useMemo } from 'react';
import { type WallpaperConfig, type WallpaperCategory } from '../../WallpaperSelector';
import { isAnimated, getTone, type ToneFilter } from '../utils/wallpaperHelpers';
import { CATEGORY_ORDER } from '../utils/category';

export type TypeFilter = 'all' | 'static' | 'animated';

export const useWallpaperFilters = (allWallpapers: WallpaperConfig[], favorites: string[]) => {
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [toneFilter, setToneFilter] = useState<ToneFilter>('all');

    const grouped = useMemo(() => {
        const passesFilter = (wp: WallpaperConfig): boolean => {
            if (typeFilter === 'static' && isAnimated(wp)) return false;
            if (typeFilter === 'animated' && !isAnimated(wp)) return false;
            if (toneFilter !== 'all' && !getTone(wp).includes(toneFilter)) return false;
            return true;
        };

        return CATEGORY_ORDER.reduce((acc, cat) => {
            const items = allWallpapers.filter(wp => wp.category === cat && passesFilter(wp));
            if (items.length > 0 || cat === 'Custom') acc[cat] = items;
            return acc;
        }, {} as Record<WallpaperCategory, WallpaperConfig[]>);
    }, [allWallpapers, typeFilter, toneFilter]);

    const favWallpapers = useMemo(() => {
        const passesFilter = (wp: WallpaperConfig): boolean => {
            if (typeFilter === 'static' && isAnimated(wp)) return false;
            if (typeFilter === 'animated' && !isAnimated(wp)) return false;
            if (toneFilter !== 'all' && !getTone(wp).includes(toneFilter)) return false;
            return true;
        };
        return allWallpapers.filter(wp => favorites.includes(wp.id) && passesFilter(wp));
    }, [allWallpapers, favorites, typeFilter, toneFilter]);

    return {
        typeFilter,
        setTypeFilter,
        toneFilter,
        setToneFilter,
        grouped,
        favWallpapers
    };
};

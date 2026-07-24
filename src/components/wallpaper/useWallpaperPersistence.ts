import { useState, useEffect } from 'react';
import { useTheme } from '../Theme/ThemeContext';
import { WALLPAPERS, type WallpaperConfig } from './WallpaperSelector';

export const useWallpaperPersistence = () => {
    const { setThemeFromWallpaper } = useTheme();

    const [wallpaper, setWallpaper] = useState<WallpaperConfig>(() => {
        const saved = localStorage.getItem('saved-wallpaper');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const fresh = WALLPAPERS.find(wp => wp.id === parsed.id);
                if (fresh) {
                    return fresh;
                }
                return parsed;
            } catch (e) {
                console.error("Failed to parse saved wallpaper", e);
            }
        }
        return WALLPAPERS[0];
    });

    useEffect(() => {
        setThemeFromWallpaper(wallpaper);
        try {
            localStorage.setItem('saved-wallpaper', JSON.stringify(wallpaper));
            const channel = new BroadcastChannel('wallpaper_sync');
            channel.postMessage(wallpaper);
            setTimeout(() => channel.close(), 100);
        } catch (e) {
            console.error("Failed to save wallpaper", e);
        }
    }, [wallpaper, setThemeFromWallpaper]);

    return {
        wallpaper,
        setWallpaper
    };
};

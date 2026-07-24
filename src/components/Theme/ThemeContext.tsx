import { createContext, useContext, useState, type ReactNode } from 'react';
import type { WallpaperConfig } from '../wallpaper/WallpaperSelector';

interface ThemeContextType {
    themeMode: 'light' | 'dark';
    accentColor: string;
    setThemeFromWallpaper: (wallpaper: WallpaperConfig) => void;
    toggleTheme: (event?: React.MouseEvent | MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
    const [accentColor] = useState('#818cf8'); // Default Indigo

    const setThemeFromWallpaper = async (wallpaper: WallpaperConfig) => {
        const root = document.documentElement;

        // Apply Accent immediately (based on preference)
        const accent = wallpaper.accentColor || '#818cf8';
        root.style.setProperty('--color-accent', accent);

        // HEX to RGB conversion for glass effects
        const hex = accent.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        root.style.setProperty('--color-accent-rgb', `${r}, ${g}, ${b}`);

        // Determine brightness
        let isLight = false;

        if (wallpaper.type === 'solid') {
            // Basic hex brightness check
            const hex = wallpaper.value.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            isLight = brightness > 128;
            setThemeMode(isLight ? 'light' : 'dark');
            applyThemeVars();
        } else {
            // Async image analysis
            // Use pre-configured theme as immediate fallback to prevent flash
            const initialMode = wallpaper.textColorTheme;
            setThemeMode(initialMode);
            applyThemeVars();

            // Async image analysis REMOVED to prevent flickering.
            // We rely on the manually configured 'textColorTheme' in WALLPAPERS constant.
            // This ensures stability for complex images like Neon/Space.

            /* 
             * Previous Logic:
             * try {
             *    if (!wallpaper.value.includes('gradient')) { ... analyze ... }
             * } catch (e) { ... }
             */
        }
    };

    const applyThemeVars = () => {
        const root = document.documentElement;
        // Always force light text (white) regardless of theme mode or wallpaper brightness
        root.style.setProperty('--color-text-primary', '#ffffff');
        root.style.setProperty('--color-text-secondary', 'rgba(255, 255, 255, 0.7)');
        root.style.setProperty('--color-glass-bg', 'rgba(20, 20, 20, 0.10)');
        root.style.setProperty('--color-glass-border', 'rgba(255, 255, 255, 0.08)');
        root.style.setProperty('--shadow-text', '0 2px 4px rgba(0,0,0,0.5)');
    };

    const toggleTheme = (event?: React.MouseEvent | MouseEvent) => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';

        const updateTheme = () => {
            setThemeMode(newMode);
            applyThemeVars();
        };

        // Support for View Transition API (Circular Reveal)
        if (event && 'startViewTransition' in document) {
            const x = event.clientX;
            const y = event.clientY;

            document.documentElement.style.setProperty('--reveal-x', `${x}px`);
            document.documentElement.style.setProperty('--reveal-y', `${y}px`);
            document.documentElement.classList.add('view-transitioning');

            const transition = (document as any).startViewTransition(() => {
                updateTheme();
            });

            // Remove class after transition completes or fails
            transition.finished.finally(() => {
                document.documentElement.classList.remove('view-transitioning');
            });
        } else {
            updateTheme();
        }
    };

    return (
        <ThemeContext.Provider value={{ themeMode, accentColor, setThemeFromWallpaper, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

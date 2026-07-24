export type WallpaperCategory = 'Solid Colour' | 'Scenery' | 'Cozy Spaces' | 'Anime & Cyber' | 'Celestial' | 'Abstract Flow' | 'Aura' | 'Motion' | 'Custom';

export interface WallpaperConfig {
    id: string;
    type: 'solid' | 'image' | 'video' | 'animated-gradient' | 'particles' | 'youtube';
    category: WallpaperCategory;
    value: string; // Color hex, Image URL, or fallback
    thumbnail?: string;
    videoUrl?: string; // For video wallpapers
    youtubeId?: string; // For youtube wallpapers
    particleConfig?: {
        type: 'stars' | 'snow' | 'dust' | 'fireflies' | 'rain' | 'matrix';
        density?: number;
        speed?: number;
        color?: string;
        interactionType?: 'none' | 'follow' | 'repel';
    };
    textColorTheme: 'light' | 'dark';
    accentColor?: string; // Optional custom accent
    overlayOpacity?: number;
    icon?: any; // Lucide icon for better thumbnail recognition
}

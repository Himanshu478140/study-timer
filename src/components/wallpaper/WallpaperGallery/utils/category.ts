import { Circle, Mountain, Home, Tv, Moon, Wind, Sparkles, Layers, Palette } from 'lucide-react';
import { type WallpaperCategory } from '../../WallpaperSelector';

export const CATEGORY_META: Record<WallpaperCategory, { icon: any; label: string }> = {
    'Solid Colour':   { icon: Circle,   label: 'Solid Colours' },
    'Scenery':        { icon: Mountain, label: 'Scenery' },
    'Cozy Spaces':    { icon: Home,     label: 'Cozy Spaces' },
    'Anime & Cyber':  { icon: Tv,       label: 'Anime & Cyber' },
    'Celestial':      { icon: Moon,     label: 'Celestial' },
    'Abstract Flow':  { icon: Wind,     label: 'Abstract Flow' },
    'Aura':           { icon: Sparkles, label: 'Aura' },
    'Motion':         { icon: Layers,   label: 'Motion' },
    'Custom':         { icon: Palette,  label: 'Custom' },
};

export const CATEGORY_ORDER: WallpaperCategory[] = [
    'Solid Colour', 'Scenery', 'Cozy Spaces', 'Anime & Cyber', 'Celestial', 'Abstract Flow', 'Aura', 'Motion', 'Custom'
];

export const TONE_COLORS = {
    dark:    '#1e1e2e',
    light:   '#d4d4d8',
    cool:    '#38bdf8',
    warm:    '#fb923c',
    vibrant: '#c084fc',
} as const;

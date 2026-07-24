import { type WallpaperConfig } from '../../WallpaperSelector';

export type ToneFilter = 'all' | 'dark' | 'light' | 'cool' | 'warm' | 'vibrant';

/** Classify a wallpaper into a tone bucket */
export function getTone(wp: WallpaperConfig): ToneFilter[] {
    const tones: ToneFilter[] = [];
    const accent = wp.accentColor?.toLowerCase() ?? '';

    // Dark / Light from textColorTheme
    if (wp.textColorTheme === 'light') tones.push('dark');
    if (wp.textColorTheme === 'dark') tones.push('light');

    // Color-family heuristics from accent
    if (accent) {
        // Warm tones: red, orange, yellow, amber
        if (/^#(f[0-9a-f]|e[0-9a-f]|d9|fb|f5|f9|fbb|fcd)/.test(accent)) tones.push('warm');
        // Cool tones: blue, cyan, teal, sky
        if (/^#(3[0-8]|0[0-9a-f]|2[0-2]|7d|38b|22d)/.test(accent)) tones.push('cool');
        // Vibrant: purple, pink, magenta
        if (/^#([89a-f][0-8]|c0|d9|a[78])/.test(accent)) tones.push('vibrant');
    }

    return tones.length ? tones : ['dark']; // default
}

/** Is a wallpaper static or animated? */
export function isAnimated(wp: WallpaperConfig): boolean {
    return wp.type === 'animated-gradient' || wp.type === 'particles' || wp.type === 'video' || wp.type === 'youtube';
}

/** Pretty name from wallpaper id */
export function prettyName(id: string): string {
    return id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Get wallpaper type label */
export function getTypeLabel(wp: WallpaperConfig): string {
    switch (wp.type) {
        case 'solid': return 'Solid';
        case 'image': return 'Image';
        case 'animated-gradient': return 'Animated';
        case 'particles': return 'Particles';
        case 'video': return 'Video';
        case 'youtube': return 'YouTube';
        default: return 'Wallpaper';
    }
}

/** Get thumbnail background CSS */
export function getThumbBg(wp: WallpaperConfig): string {
    if (wp.type === 'solid') return wp.value;
    if (wp.thumbnail) {
        if (wp.thumbnail.startsWith('#') || wp.thumbnail.startsWith('linear-gradient'))
            return wp.thumbnail;
        return `url(${wp.thumbnail}) center/cover`;
    }
    return wp.value;
}

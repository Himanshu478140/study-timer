import { useState, useMemo } from 'react';
import {
    Image as ImageIcon, Plus, Star, Youtube, X,
    Circle, Palette, Sparkles, Mountain,
    Layers, Video, Home, Tv, Moon, Wind
} from 'lucide-react';
import { WALLPAPERS, type WallpaperConfig, type WallpaperCategory } from './WallpaperSelector';
import { estimateBase64Size, hasEnoughSpace, formatBytes, getLocalStorageSize } from '../../utils/storageUtils';
import './wallpaper-gallery.css';

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */
type TypeFilter = 'all' | 'static' | 'animated';
type ToneFilter = 'all' | 'dark' | 'light' | 'cool' | 'warm' | 'vibrant';

interface WallpaperGalleryProps {
    currentId: string;
    wallpaper: WallpaperConfig;
    onSelect: (config: WallpaperConfig) => void;
}

/* ──────────────────────────────────────────
   Helpers
   ────────────────────────────────────────── */
const CATEGORY_META: Record<WallpaperCategory, { icon: any; label: string }> = {
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

const CATEGORY_ORDER: WallpaperCategory[] = [
    'Solid Colour', 'Scenery', 'Cozy Spaces', 'Anime & Cyber', 'Celestial', 'Abstract Flow', 'Aura', 'Motion', 'Custom'
];

const TONE_COLORS: Record<Exclude<ToneFilter, 'all'>, string> = {
    dark:    '#1e1e2e',
    light:   '#d4d4d8',
    cool:    '#38bdf8',
    warm:    '#fb923c',
    vibrant: '#c084fc',
};

/** Classify a wallpaper into a tone bucket */
function getTone(wp: WallpaperConfig): ToneFilter[] {
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
function isAnimated(wp: WallpaperConfig): boolean {
    return wp.type === 'animated-gradient' || wp.type === 'particles' || wp.type === 'video' || wp.type === 'youtube';
}

/** Pretty name from wallpaper id */
function prettyName(id: string): string {
    return id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Get wallpaper type label */
function getTypeLabel(wp: WallpaperConfig): string {
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
function getThumbBg(wp: WallpaperConfig): string {
    if (wp.type === 'solid') return wp.value;
    if (wp.thumbnail) {
        if (wp.thumbnail.startsWith('#') || wp.thumbnail.startsWith('linear-gradient'))
            return wp.thumbnail;
        return `url(${wp.thumbnail}) center/cover`;
    }
    return wp.value;
}

/** Extract YouTube ID */
function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/* ──────────────────────────────────────────
   Component
   ────────────────────────────────────────── */
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

    /* ── Custom wallpapers ── */
    const [customWallpapers, setCustomWallpapers] = useState<WallpaperConfig[]>(() => {
        try {
            const saved = localStorage.getItem('custom-wallpapers-list');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    /* ── Filters ── */
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [toneFilter, setToneFilter] = useState<ToneFilter>('all');

    /* ── YouTube ── */
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const allWallpapers = useMemo(() => [...WALLPAPERS, ...customWallpapers], [customWallpapers]);

    /* ── Filter logic & Grouping (Memoized) ── */
    const grouped = useMemo(() => {
        const passesFilter = (wp: WallpaperConfig): boolean => {
            // Type filter
            if (typeFilter === 'static' && isAnimated(wp)) return false;
            if (typeFilter === 'animated' && !isAnimated(wp)) return false;
            // Tone filter
            if (toneFilter !== 'all' && !getTone(wp).includes(toneFilter)) return false;
            return true;
        };

        return CATEGORY_ORDER.reduce((acc, cat) => {
            const items = allWallpapers.filter(wp => wp.category === cat && passesFilter(wp));
            if (items.length > 0 || cat === 'Custom') acc[cat] = items;
            return acc;
        }, {} as Record<WallpaperCategory, WallpaperConfig[]>);
    }, [allWallpapers, typeFilter, toneFilter]);

    /* ── Favorites row (Memoized) ── */
    const favWallpapers = useMemo(() => {
        const passesFilter = (wp: WallpaperConfig): boolean => {
            if (typeFilter === 'static' && isAnimated(wp)) return false;
            if (typeFilter === 'animated' && !isAnimated(wp)) return false;
            if (toneFilter !== 'all' && !getTone(wp).includes(toneFilter)) return false;
            return true;
        };
        return allWallpapers.filter(wp => favorites.includes(wp.id) && passesFilter(wp));
    }, [allWallpapers, favorites, typeFilter, toneFilter]);

    /* ── Upload handlers ── */
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const estimatedSize = estimateBase64Size(file.size);
        if (!hasEnoughSpace(estimatedSize)) {
            alert(`Not enough storage space. Needs ~${formatBytes(estimatedSize)}, only ${formatBytes(getLocalStorageSize())} available.`);
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1920;
                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.drawImage(img, 0, 0, width, height);

                // Color analysis
                const centerSize = 100;
                const cx = Math.max(0, width / 2 - centerSize / 2);
                const cy = Math.max(0, height / 2 - centerSize / 2);
                const imageData = ctx.getImageData(cx, cy, Math.min(centerSize, width), Math.min(centerSize, height)).data;
                let r = 0, g = 0, b = 0;
                const pc = imageData.length / 4;
                for (let i = 0; i < imageData.length; i += 4) {
                    r += imageData[i]; g += imageData[i + 1]; b += imageData[i + 2];
                }
                r = Math.round(r / pc); g = Math.round(g / pc); b = Math.round(b / pc);
                const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

                const getPixelBrightness = (x: number, y: number) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
                    const p = ctx.getImageData(x, y, 1, 1).data;
                    return (p[0] * 299 + p[1] * 587 + p[2] * 114) / 1000;
                };
                const avgBrightness = (getPixelBrightness(10, 10) + getPixelBrightness(width - 10, 10) + getPixelBrightness(width / 2, height / 2)) / 3;

                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                const customConfig: WallpaperConfig = {
                    id: `custom-${Date.now()}`,
                    type: 'image',
                    category: 'Custom',
                    value: `url(${dataUrl})`,
                    thumbnail: dataUrl,
                    textColorTheme: avgBrightness > 128 ? 'dark' : 'light',
                    accentColor: rgbToHex(r, g, b),
                    overlayOpacity: avgBrightness > 128 ? 0.1 : 0.2
                };

                const updatedList = [customConfig, ...customWallpapers];
                setCustomWallpapers(updatedList);
                try { localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList)); }
                catch (err) { console.error('Failed to save custom wallpaper', err); }
                onSelect(customConfig);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert('Video file is too large. Maximum size is 50MB.');
            e.target.value = '';
            return;
        }
        const estimatedSize = estimateBase64Size(file.size);
        if (!hasEnoughSpace(estimatedSize)) {
            alert(`Not enough storage space. Needs ~${formatBytes(estimatedSize)}.`);
            e.target.value = '';
            return;
        }
        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file (MP4 or WebM recommended).');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const videoDataUrl = event.target?.result as string;
            const customConfig: WallpaperConfig = {
                id: `custom-video-${Date.now()}`,
                type: 'video',
                category: 'Custom',
                value: '#0f0f11',
                videoUrl: videoDataUrl,
                thumbnail: '',
                textColorTheme: 'light',
                accentColor: '#818cf8',
                overlayOpacity: 0.3
            };
            const updatedList = [customConfig, ...customWallpapers];
            setCustomWallpapers(updatedList);
            try { localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList)); }
            catch (err) {
                console.error('Failed to save video wallpaper', err);
                alert('Video is too large to save.');
                return;
            }
            onSelect(customConfig);
        };
        reader.readAsDataURL(file);
    };

    const handleAddYouTube = () => {
        const id = getYouTubeId(youtubeUrl);
        if (!id) { alert('Please enter a valid YouTube URL'); return; }
        const customConfig: WallpaperConfig = {
            id: `youtube-${Date.now()}`,
            type: 'youtube',
            category: 'Custom',
            value: '#0f0f11',
            youtubeId: id,
            thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
            textColorTheme: 'light',
            accentColor: '#ef4444',
            overlayOpacity: 0.1
        };
        const updatedList = [customConfig, ...customWallpapers];
        setCustomWallpapers(updatedList);
        localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList));
        setYoutubeUrl('');
        onSelect(customConfig);
    };

    const handleDeleteCustom = (id: string) => {
        const newList = customWallpapers.filter(w => w.id !== id);
        setCustomWallpapers(newList);
        localStorage.setItem('custom-wallpapers-list', JSON.stringify(newList));
    };

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
            let src = match ? match[1] : wallpaper.value;
            
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

    /* ── Render a single thumbnail card ── */
    const renderThumb = (wp: WallpaperConfig) => {
        const isActive = currentId === wp.id;
        const isFav = favorites.includes(wp.id);
        const isCustom = wp.category === 'Custom';

        return (
            <div key={wp.id} className={`wg-thumb ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
                <button
                    className="wg-thumb__preview"
                    onClick={() => onSelect(wp)}
                    aria-label={`Select wallpaper: ${prettyName(wp.id)}`}
                >
                    <div
                        className="wg-thumb__preview-inner"
                        style={{ background: getThumbBg(wp) }}
                    >
                        {wp.icon && <wp.icon size={24} strokeWidth={1.5} className="wg-thumb__icon" />}
                    </div>
                    {isActive && <span className="wg-active-badge">Active</span>}
                </button>

                {/* Favorite toggle */}
                <button
                    className={`wg-fav-btn ${isFav ? 'is-fav' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(wp.id); }}
                    aria-label={isFav ? `Remove ${prettyName(wp.id)} from favorites` : `Add ${prettyName(wp.id)} to favorites`}
                >
                    <Star size={12} fill={isFav ? '#fbbf24' : 'none'} />
                </button>

                {/* Delete button for custom */}
                {isCustom && (
                    <button
                        className="wg-delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCustom(wp.id); }}
                        aria-label={`Delete custom wallpaper ${prettyName(wp.id)}`}
                    >
                        <X size={12} strokeWidth={3} />
                    </button>
                )}

                <span className="wg-thumb__label">{prettyName(wp.id)}</span>
            </div>
        );
    };

    return (
        <section className="wallpaper-gallery" aria-label="Wallpaper Gallery">

            {/* ── Hero Preview ── */}
            <div className="wg-hero" role="banner">
                {heroBg.kind === 'image' && heroBg.value && (
                    <img 
                        className="wg-hero__image" 
                        src={heroBg.value} 
                        srcSet={'srcSet' in heroBg ? heroBg.srcSet : undefined}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                        alt="" 
                        loading="lazy" 
                    />
                )}
                {heroBg.kind === 'gradient' && (
                    <div className="wg-hero__gradient-bg" style={{ background: heroBg.value }} />
                )}
                {heroBg.kind === 'solid' && (
                    <div className="wg-hero__solid-bg" style={{ background: heroBg.value }} />
                )}
                <div className="wg-hero__overlay" />
                <div className="wg-hero__content">
                    <span className="wg-hero__badge">Current Selection</span>
                    <h2 className="wg-hero__name">{prettyName(wallpaper.id)}</h2>
                    <p className="wg-hero__subtitle">
                        {CATEGORY_META[wallpaper.category]?.label ?? wallpaper.category} • {getTypeLabel(wallpaper)}
                    </p>
                </div>
            </div>

            {/* ── Filter Chips ── */}
            <nav className="wg-filters" aria-label="Wallpaper filters">
                {/* Type row */}
                <div className="wg-filter-row" role="group" aria-label="Type filter">
                    {(['all', 'static', 'animated'] as TypeFilter[]).map(t => (
                        <button
                            key={t}
                            className={`wg-chip ${typeFilter === t ? 'active' : ''}`}
                            onClick={() => setTypeFilter(t)}
                            aria-pressed={typeFilter === t}
                        >
                            {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
                {/* Tone row */}
                <div className="wg-filter-row" role="group" aria-label="Tone filter">
                    <button
                        className={`wg-chip ${toneFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setToneFilter('all')}
                        aria-pressed={toneFilter === 'all'}
                    >
                        All Tones
                    </button>
                    {(Object.keys(TONE_COLORS) as Exclude<ToneFilter, 'all'>[]).map(t => (
                        <button
                            key={t}
                            className={`wg-chip wg-chip--tone ${toneFilter === t ? 'active' : ''}`}
                            onClick={() => setToneFilter(t)}
                            aria-pressed={toneFilter === t}
                        >
                            <span className="wg-tone-dot" style={{ background: TONE_COLORS[t] }} />
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </nav>

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
                            {favWallpapers.map(renderThumb)}
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
                                    <>
                                        {/* Image upload */}
                                        <label className="wg-upload-card" tabIndex={0} aria-label="Upload custom image wallpaper">
                                            <div className="wg-upload-card__preview">
                                                <ImageIcon size={20} />
                                                <span style={{ fontSize: '0.625rem', fontWeight: 600 }}>Upload Image</span>
                                            </div>
                                            <span className="wg-upload-card__label">Image</span>
                                            <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
                                        </label>

                                        {/* Video upload */}
                                        <label className="wg-upload-card" tabIndex={0} aria-label="Upload custom video wallpaper">
                                            <div className="wg-upload-card__preview">
                                                <Video size={20} />
                                                <span style={{ fontSize: '0.625rem', fontWeight: 600 }}>Upload Video</span>
                                            </div>
                                            <span className="wg-upload-card__label">Video</span>
                                            <input type="file" accept="video/*" onChange={handleVideoUpload} hidden />
                                        </label>

                                        {/* YouTube card */}
                                        <div className="wg-youtube-row">
                                            <div className="wg-youtube-card">
                                                <div className="wg-youtube-card__header">
                                                    <Youtube size={12} />
                                                    <span>YouTube</span>
                                                </div>
                                                <div className="wg-youtube-card__input-row">
                                                    <input
                                                        className="wg-youtube-card__input"
                                                        type="text"
                                                        placeholder="Paste link..."
                                                        value={youtubeUrl}
                                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddYouTube(); }}
                                                    />
                                                    <button
                                                        className="wg-youtube-card__submit"
                                                        onClick={handleAddYouTube}
                                                        aria-label="Add YouTube wallpaper"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <span className="wg-upload-card__label">YouTube Link</span>
                                        </div>
                                    </>
                                )}

                                {/* Wallpaper thumbnails */}
                                {items?.map(renderThumb)}

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
        </section>
    );
};

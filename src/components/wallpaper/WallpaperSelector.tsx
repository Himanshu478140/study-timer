import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Image as ImageIcon, X, Info, HardDrive, Youtube, Plus,
    Stars, Sparkles, Flame, Bug,
    Mountain
} from 'lucide-react';
import './wallpaper.css';
import { getLocalStorageSize, formatBytes, estimateBase64Size, hasEnoughSpace, getStorageUsagePercent } from '../../utils/storageUtils';

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

// Helper to get imports if available, otherwise fallback
const natureImg = new URL('../../assets/wallpapers/nature.png', import.meta.url).href;
const sunsetImg = new URL('../../assets/wallpapers/sunset.png', import.meta.url).href;
const mountainsImg = new URL('../../assets/wallpapers/mountains.png', import.meta.url).href;
const spaceImg = new URL('../../assets/wallpapers/space.png', import.meta.url).href;

// Newly Added Wallpaper Assets
const amberDunesImg = new URL('../../assets/wallpapers/Amber Dunes.webp', import.meta.url).href;
const auroraBloomImg = new URL('../../assets/wallpapers/Aurora Bloom.webp', import.meta.url).href;
const bambooCathedralImg = new URL('../../assets/wallpapers/Bamboo Cathedral.webp', import.meta.url).href;
const celestialSkyKingdomImg = new URL('../../assets/wallpapers/Celestial Sky Kingdom.webp', import.meta.url).href;
const cosmicHavenImg = new URL('../../assets/wallpapers/Cosmic Haven.webp', import.meta.url).href;
const cyberRainDistrictImg = new URL('../../assets/wallpapers/Cyber Rain District.webp', import.meta.url).href;
const emeraldCanopyImg = new URL('../../assets/wallpapers/Emerald Canopy.webp', import.meta.url).href;
const emeraldValleyDreamsImg = new URL('../../assets/wallpapers/Emerald Valley Dreams.webp', import.meta.url).href;
const enchantedPineForestImg = new URL('../../assets/wallpapers/Enchanted Pine Forest.webp', import.meta.url).href;
const goldenCityHorizonImg = new URL('../../assets/wallpapers/Golden City Horizon.webp', import.meta.url).href;
const lastTrainHomeImg = new URL('../../assets/wallpapers/Last Train Home.webp', import.meta.url).href;
const midnightHarborImg = new URL('../../assets/wallpapers/Midnight Harbor.webp', import.meta.url).href;
const midnightStudyRetreatImg = new URL('../../assets/wallpapers/Midnight Study Retreat.webp', import.meta.url).href;
const mountainRailwayJourneyImg = new URL('../../assets/wallpapers/Mountain Railway Journey.webp', import.meta.url).href;
const nebulaVeilImg = new URL('../../assets/wallpapers/Nebula Veil.webp', import.meta.url).href;
const neonGridNexusImg = new URL('../../assets/wallpapers/Neon Grid Nexus.webp', import.meta.url).href;
const neonHorizonImg = new URL('../../assets/wallpapers/Neon Horizon.webp', import.meta.url).href;
const oceanSurgeImg = new URL('../../assets/wallpapers/Ocean Surge.webp', import.meta.url).href;
const starlightObservatoryImg = new URL('../../assets/wallpapers/Starlight Observatory.webp', import.meta.url).href;
const sunlitSakuraVistaImg = new URL('../../assets/wallpapers/Sunlit Sakura Vista.webp', import.meta.url).href;
const twilightToriiForestImg = new URL('../../assets/wallpapers/Twilight Torii Forest.webp', import.meta.url).href;
const zenRippleGardenImg = new URL('../../assets/wallpapers/Zen Ripple Garden.webp', import.meta.url).href;

export const WALLPAPERS: WallpaperConfig[] = [
    // ─── SOLID COLOURS ───
    {
        id: 'dark-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#0f0f11',
        textColorTheme: 'light',
        accentColor: '#818cf8', // Indigo
        overlayOpacity: 0
    },
    {
        id: 'deep-ocean',
        type: 'solid',
        category: 'Solid Colour',
        value: '#0f172a', // Slate 900
        textColorTheme: 'light',
        accentColor: '#06b6d4', // Cyan 500
        overlayOpacity: 0
    },
    {
        id: 'slate-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#1e293b',
        textColorTheme: 'light',
        accentColor: '#38bdf8', // Sky
        overlayOpacity: 0
    },
    {
        id: 'nord-storm-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#2e3440',
        textColorTheme: 'light',
        accentColor: '#88c0d0', // Nord Blue
        overlayOpacity: 0
    },
    {
        id: 'midnight-blue-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#1e1b4b',
        textColorTheme: 'light',
        accentColor: '#c084fc', // Purple
        overlayOpacity: 0
    },
    {
        id: 'dusty-lavender',
        type: 'solid',
        category: 'Solid Colour',
        value: '#5c5470', // Deep Muted Lavender
        textColorTheme: 'light',
        accentColor: '#f472b6', // Pink 400
        overlayOpacity: 0
    },
    {
        id: 'crimson-velvet-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#4c0519',
        textColorTheme: 'light',
        accentColor: '#fb7185', // Rose
        overlayOpacity: 0
    },
    {
        id: 'spiced-chili',
        type: 'solid',
        category: 'Solid Colour',
        value: '#b91c1c', // Red 700
        textColorTheme: 'light',
        accentColor: '#f97316', // Bright Orange 500
        overlayOpacity: 0
    },
    {
        id: 'espresso-mocha-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#271c19',
        textColorTheme: 'light',
        accentColor: '#fb923c', // Orange
        overlayOpacity: 0
    },
    {
        id: 'terracotta-clay-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#7c2d12',
        textColorTheme: 'light',
        accentColor: '#fdba74', // Peach
        overlayOpacity: 0
    },
    {
        id: 'sage-calm-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#14201e',
        textColorTheme: 'light',
        accentColor: '#a7f3d0', // Mint
        overlayOpacity: 0
    },
    {
        id: 'ocean-teal-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#042f2e',
        textColorTheme: 'light',
        accentColor: '#2dd4bf', // Teal
        overlayOpacity: 0
    },
    {
        id: 'forest-green-solid',
        type: 'solid',
        category: 'Solid Colour',
        value: '#064e3b',
        textColorTheme: 'light',
        accentColor: '#34d399', // Emerald
        overlayOpacity: 0
    },
    {
        id: 'fresh-sage',
        type: 'solid',
        category: 'Solid Colour',
        value: '#3b6e50', // Mid-tone Sage Green
        textColorTheme: 'light',
        accentColor: '#4ade80', // Mint Green 400
        overlayOpacity: 0
    },
    {
        id: 'ocean-breeze',
        type: 'solid',
        category: 'Solid Colour',
        value: '#2a5c7a', // Muted Ocean Blue
        textColorTheme: 'light',
        accentColor: '#38bdf8', // Sky Blue 400
        overlayOpacity: 0
    },
    {
        id: 'vintage-teal',
        type: 'solid',
        category: 'Solid Colour',
        value: '#2d6a7a', // Mid-tone Teal
        textColorTheme: 'light',
        accentColor: '#22d3ee', // Bright Cyan 400
        overlayOpacity: 0
    },
    {
        id: 'dusty-rose',
        type: 'solid',
        category: 'Solid Colour',
        value: '#884a55', // Smoky Rose
        textColorTheme: 'light',
        accentColor: '#fda4af', // Rose 300
        overlayOpacity: 0
    },
    {
        id: 'desert-rose',
        type: 'solid',
        category: 'Solid Colour',
        value: '#965a6c', // Muted Mauve/Rose
        textColorTheme: 'light',
        accentColor: '#fbcfe8', // Pink 200
        overlayOpacity: 0
    },
    {
        id: 'retro-bubblegum',
        type: 'solid',
        category: 'Solid Colour',
        value: '#be5a83', // Deep Bubblegum Pink
        textColorTheme: 'light',
        accentColor: '#e9d5ff', // Purple 200
        overlayOpacity: 0
    },
    

    // ─── SCENERY ───
    {
        id: 'nature-calm',
        type: 'image',
        category: 'Scenery',
        value: `url(${natureImg})`,
        thumbnail: natureImg,
        textColorTheme: 'light',
        accentColor: '#84cc16', // Lime/Nature
        overlayOpacity: 0.3
    },
    {
        id: 'bamboo-cathedral',
        type: 'image',
        category: 'Scenery',
        value: `url(${bambooCathedralImg})`,
        thumbnail: bambooCathedralImg,
        textColorTheme: 'light',
        accentColor: '#10b981',
        overlayOpacity: 0.2
    },
    {
        id: 'emerald-canopy',
        type: 'image',
        category: 'Scenery',
        value: `url(${emeraldCanopyImg})`,
        thumbnail: emeraldCanopyImg,
        textColorTheme: 'light',
        accentColor: '#22c55e',
        overlayOpacity: 0.2
    },
    {
        id: 'emerald-valley-dreams',
        type: 'image',
        category: 'Scenery',
        value: `url(${emeraldValleyDreamsImg})`,
        thumbnail: emeraldValleyDreamsImg,
        textColorTheme: 'light',
        accentColor: '#4ade80',
        overlayOpacity: 0.15
    },
    {
        id: 'enchanted-pine-forest',
        type: 'image',
        category: 'Scenery',
        value: `url(${enchantedPineForestImg})`,
        thumbnail: enchantedPineForestImg,
        textColorTheme: 'light',
        accentColor: '#2dd4bf',
        overlayOpacity: 0.2
    },
    {
        id: 'mountain-railway-journey',
        type: 'image',
        category: 'Scenery',
        value: `url(${mountainRailwayJourneyImg})`,
        thumbnail: mountainRailwayJourneyImg,
        textColorTheme: 'light',
        accentColor: '#06b6d4',
        overlayOpacity: 0.2
    },
    {
        id: 'sunlit-sakura-vista',
        type: 'image',
        category: 'Scenery',
        value: `url(${sunlitSakuraVistaImg})`,
        thumbnail: sunlitSakuraVistaImg,
        textColorTheme: 'dark',
        accentColor: '#db2777',
        overlayOpacity: 0.1
    },
    {
        id: 'twilight-torii-forest',
        type: 'image',
        category: 'Scenery',
        value: `url(${twilightToriiForestImg})`,
        thumbnail: twilightToriiForestImg,
        textColorTheme: 'light',
        accentColor: '#ef4444',
        overlayOpacity: 0.2
    },
    {
        id: 'sunset-horizon',
        type: 'image',
        category: 'Scenery',
        value: `url(${sunsetImg})`,
        thumbnail: sunsetImg,
        textColorTheme: 'dark', // Bright sunset
        accentColor: '#fb923c', // Orange-400
        overlayOpacity: 0.1
    },
    {
        id: 'misty-mountains',
        type: 'image',
        category: 'Scenery',
        value: `url(${mountainsImg})`,
        thumbnail: mountainsImg,
        textColorTheme: 'light',
        accentColor: '#38bdf8', // Sky-400
        overlayOpacity: 0.2
    },
    {
        id: 'amber-dunes',
        type: 'image',
        category: 'Scenery',
        value: `url(${amberDunesImg})`,
        thumbnail: amberDunesImg,
        textColorTheme: 'light',
        accentColor: '#f59e0b', // Amber-500
        overlayOpacity: 0.15
    },
    {
        id: 'midnight-harbor',
        type: 'image',
        category: 'Scenery',
        value: `url(${midnightHarborImg})`,
        thumbnail: midnightHarborImg,
        textColorTheme: 'light',
        accentColor: '#38bdf8', // Sky-400
        overlayOpacity: 0.25
    },

    // ─── COZY SPACES ───
    {
        id: 'midnight-study-retreat',
        type: 'image',
        category: 'Cozy Spaces',
        value: `url(${midnightStudyRetreatImg})`,
        thumbnail: midnightStudyRetreatImg,
        textColorTheme: 'light',
        accentColor: '#6366f1',
        overlayOpacity: 0.2
    },
    {
        id: 'last-train-home',
        type: 'image',
        category: 'Cozy Spaces',
        value: `url(${lastTrainHomeImg})`,
        thumbnail: lastTrainHomeImg,
        textColorTheme: 'light',
        accentColor: '#818cf8',
        overlayOpacity: 0.2
    },
    {
        id: 'cosmic-haven',
        type: 'image',
        category: 'Cozy Spaces',
        value: `url(${cosmicHavenImg})`,
        thumbnail: cosmicHavenImg,
        textColorTheme: 'light',
        accentColor: '#c084fc', // Purple-400
        overlayOpacity: 0.15
    },

    // ─── ANIME & CYBER ───
    {
        id: 'cyber-rain-district',
        type: 'image',
        category: 'Anime & Cyber',
        value: `url(${cyberRainDistrictImg})`,
        thumbnail: cyberRainDistrictImg,
        textColorTheme: 'light',
        accentColor: '#ec4899',
        overlayOpacity: 0.2
    },
    {
        id: 'neon-grid-nexus',
        type: 'image',
        category: 'Anime & Cyber',
        value: `url(${neonGridNexusImg})`,
        thumbnail: neonGridNexusImg,
        textColorTheme: 'light',
        accentColor: '#a855f7',
        overlayOpacity: 0.15
    },
    {
        id: 'golden-city-horizon',
        type: 'image',
        category: 'Anime & Cyber',
        value: `url(${goldenCityHorizonImg})`,
        thumbnail: goldenCityHorizonImg,
        textColorTheme: 'light',
        accentColor: '#eab308',
        overlayOpacity: 0.2
    },
    {
        id: 'neon-horizon',
        type: 'image',
        category: 'Anime & Cyber',
        value: `url(${neonHorizonImg})`,
        thumbnail: neonHorizonImg,
        textColorTheme: 'light',
        accentColor: '#38bdf8', // Sky-400
        overlayOpacity: 0.2
    },


    // ─── CELESTIAL ───
    {
        id: 'deep-space',
        type: 'image',
        category: 'Celestial',
        value: `url(${spaceImg})`,
        thumbnail: spaceImg,
        textColorTheme: 'light',
        accentColor: '#818cf8',
        overlayOpacity: 0.1
    },
    {
        id: 'celestial-sky-kingdom',
        type: 'image',
        category: 'Celestial',
        value: `url(${celestialSkyKingdomImg})`,
        thumbnail: celestialSkyKingdomImg,
        textColorTheme: 'dark',
        accentColor: '#6366f1',
        overlayOpacity: 0.15
    },
    {
        id: 'starlight-observatory',
        type: 'image',
        category: 'Celestial',
        value: `url(${starlightObservatoryImg})`,
        thumbnail: starlightObservatoryImg,
        textColorTheme: 'light',
        accentColor: '#a855f7',
        overlayOpacity: 0.2
    },
    {
        id: 'nebula-veil',
        type: 'image',
        category: 'Celestial',
        value: `url(${nebulaVeilImg})`,
        thumbnail: nebulaVeilImg,
        textColorTheme: 'light',
        accentColor: '#f472b6', // Pink-400
        overlayOpacity: 0.15
    },
    {
        id: 'aurora-bloom',
        type: 'image',
        category: 'Celestial',
        value: `url(${auroraBloomImg})`,
        thumbnail: auroraBloomImg,
        textColorTheme: 'light',
        accentColor: '#10b981', // Emerald-500
        overlayOpacity: 0.2
    },

    // ─── ABSTRACT FLOW ───
    {
        id: 'ocean-surge',
        type: 'image',
        category: 'Abstract Flow',
        value: `url(${oceanSurgeImg})`,
        thumbnail: oceanSurgeImg,
        textColorTheme: 'light',
        accentColor: '#0284c7',
        overlayOpacity: 0.2
    },
    {
        id: 'abstract-geometric-prism',
        type: 'image',
        category: 'Abstract Flow',
        value: 'url(https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=60&w=1600)',
        thumbnail: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=400',
        textColorTheme: 'dark',
        accentColor: '#6366f1',
        overlayOpacity: 0.1
    },
    {
        id: 'zen-ripple-garden',
        type: 'image',
        category: 'Abstract Flow',
        value: `url(${zenRippleGardenImg})`,
        thumbnail: zenRippleGardenImg,
        textColorTheme: 'light',
        accentColor: '#14b8a6',
        overlayOpacity: 0.2
    },

    // ─── AURA ───
    {
        id: 'aurora-borealis',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-aurora-borealis',
        thumbnail: 'linear-gradient(135deg, #064e3b, #3b0764)',
        textColorTheme: 'light',
        accentColor: '#4ade80',
        overlayOpacity: 0.1,
        icon: Sparkles
    },
    {
        id: 'volcanic-flow',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-lava-lamp',
        thumbnail: 'linear-gradient(135deg, #991b1b, #fb923c)',
        textColorTheme: 'light',
        accentColor: '#f97316',
        overlayOpacity: 0.2,
        icon: Flame
    },
    {
        id: 'holographic-prism',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-holographic',
        thumbnail: 'linear-gradient(135deg, #ffcfd2, #b9fbc0)',
        textColorTheme: 'dark',
        accentColor: '#6366f1',
        overlayOpacity: 0,
        icon: Sparkles
    },

    // ─── MOTION ───
    {
        id: 'hybrid-deep-space',
        type: 'animated-gradient',
        category: 'Motion',
        value: 'gradient-nebula',
        particleConfig: {
            type: 'stars',
            density: 60,
            speed: 0.8,
            color: '#ffffff'
        },
        thumbnail: 'linear-gradient(135deg, #1e1b4b, #2e1065)',
        textColorTheme: 'light',
        accentColor: '#c084fc',
        overlayOpacity: 0.1,
        icon: Mountain
    },
    {
        id: 'ambient-stars',
        type: 'particles',
        category: 'Motion',
        value: '#020617',
        particleConfig: {
            type: 'stars',
            density: 60,
            speed: 0.5,
            color: '#cbd5e1'
        },
        thumbnail: '#020617',
        textColorTheme: 'light',
        accentColor: '#fbbf24',
        overlayOpacity: 0,
        icon: Stars
    },
    {
        id: 'ambient-fireflies',
        type: 'particles',
        category: 'Motion',
        value: '#020617',
        particleConfig: {
            type: 'fireflies',
            density: 25,
            speed: 0.5,
            color: '#bef264'
        },
        thumbnail: '#020617',
        textColorTheme: 'light',
        accentColor: '#bef264',
        overlayOpacity: 0,
        icon: Bug
    },
];

interface WallpaperSelectorProps {
    currentId: string;
    onSelect: (config: WallpaperConfig) => void;
    /** If provided, controls the drawer externally (no trigger button rendered) */
    externalOpen?: boolean;
    onClose?: () => void;
}

export const WallpaperSelector = ({ currentId, onSelect, externalOpen, onClose }: WallpaperSelectorProps) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = externalOpen !== undefined;
    const isOpen = isControlled ? externalOpen : internalOpen;
    const handleClose = () => {
        if (isControlled && onClose) onClose();
        else setInternalOpen(false);
    };

    return (
        <>
            {/* Only render trigger button when NOT externally controlled */}
            {!isControlled && (
                <button
                    className="wallpaper-trigger-btn interactive-press"
                    onClick={() => setInternalOpen(true)}
                >
                    <ImageIcon size={18} />
                    <span>Wallpaper</span>
                </button>
            )}

            {createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className={`wallpaper-drawer-overlay ${isOpen ? 'open' : ''}`}
                        onClick={handleClose}
                    />

                    {/* Drawer Panel */}
                    <div className={`wallpaper-drawer ${isOpen ? 'open' : ''}`}>
                        <div className="drawer-handle" />

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>Backgrounds</h3>
                            <button onClick={handleClose} style={{ padding: '0.5rem', opacity: 0.7, color: 'white' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Reusable Grid Component */}
                        <WallpaperGrid currentId={currentId} onSelect={onSelect} />
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

export const WallpaperGrid = ({ currentId, onSelect }: WallpaperSelectorProps) => {
    const [activeCategory, setActiveCategory] = useState<WallpaperCategory>('Solid Colour');
    const [customWallpapers, setCustomWallpapers] = useState<WallpaperConfig[]>(() => {
        try {
            const saved = localStorage.getItem('custom-wallpapers-list');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load custom wallpapers", e);
            return [];
        }
    });
    const [storageUsed, setStorageUsed] = useState(0);
    const [storagePercent, setStoragePercent] = useState(0);
    const [youtubeUrl, setYoutubeUrl] = useState('');

    // Extract YouTube ID from various URL formats
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/|shorts\/)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleAddYouTube = () => {
        const id = getYouTubeId(youtubeUrl);
        if (!id) {
            alert('Please enter a valid YouTube URL');
            return;
        }

        const customConfig: WallpaperConfig = {
            id: `youtube-${Date.now()}`,
            type: 'youtube',
            category: 'Custom',
            value: '#0f0f11',
            youtubeId: id,
            thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
            textColorTheme: 'light',
            accentColor: '#ef4444', // YouTube red
            overlayOpacity: 0.1
        };

        const updatedList = [customConfig, ...customWallpapers];
        setCustomWallpapers(updatedList);
        localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList));
        setYoutubeUrl('');
        onSelect(customConfig);
    };

    // Update storage info whenever custom wallpapers change
    useEffect(() => {
        setStorageUsed(getLocalStorageSize());
        setStoragePercent(getStorageUsagePercent());
    }, [customWallpapers]);

    const categories: WallpaperCategory[] = ['Solid Colour', 'Scenery', 'Cozy Spaces', 'Anime & Cyber', 'Celestial', 'Abstract Flow', 'Aura', 'Motion', 'Custom'];

    const allWallpapers = useMemo(() => [...WALLPAPERS, ...customWallpapers], [customWallpapers]);
    const filteredWallpapers = useMemo(() => allWallpapers.filter(wp => wp.category === activeCategory), [allWallpapers, activeCategory]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check estimated file size after base64 encoding
        const estimatedSize = estimateBase64Size(file.size);
        if (!hasEnoughSpace(estimatedSize)) {
            alert(`Not enough storage space. This image needs ~${formatBytes(estimatedSize)}, but only ${formatBytes(getLocalStorageSize())} available. Try deleting some custom wallpapers first.`);
            e.target.value = ''; // Reset input
            return;
        }

        // Compress Image logic to save LocalStorage space
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimension 1920px (HD)
                const MAX_SIZE = 1920;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0, width, height);

                // --- Color Analysis ---
                // 1. Get center patch for primary accent
                const centerSize = 100;
                const centerX = Math.max(0, width / 2 - centerSize / 2);
                const centerY = Math.max(0, height / 2 - centerSize / 2);
                const imageData = ctx.getImageData(centerX, centerY, Math.min(centerSize, width), Math.min(centerSize, height)).data;

                let r = 0, g = 0, b = 0;
                const pixelCount = imageData.length / 4;

                for (let i = 0; i < imageData.length; i += 4) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                }

                r = Math.round(r / pixelCount);
                g = Math.round(g / pixelCount);
                b = Math.round(b / pixelCount);

                // Boost saturation for accent
                const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
                const accentHex = rgbToHex(r, g, b);

                // 2. Determine Brightness for Text Theme
                const getPixelBrightness = (x: number, y: number) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
                    const p = ctx.getImageData(x, y, 1, 1).data;
                    return (p[0] * 299 + p[1] * 587 + p[2] * 114) / 1000;
                }

                const b1 = getPixelBrightness(10, 10);
                const b2 = getPixelBrightness(width - 10, 10);
                const b3 = getPixelBrightness(width / 2, height / 2);
                const avgBrightness = (b1 + b2 + b3) / 3;

                const isLight = avgBrightness > 128;

                // Compress to JPEG 70%
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                const customConfig: WallpaperConfig = {
                    id: `custom-${Date.now()}`,
                    type: 'image',
                    category: 'Custom',
                    value: `url(${dataUrl})`,
                    thumbnail: dataUrl,
                    textColorTheme: isLight ? 'dark' : 'light',
                    accentColor: accentHex,
                    overlayOpacity: isLight ? 0.1 : 0.2
                };

                // Save to Custom List
                const updatedList = [customConfig, ...customWallpapers];
                setCustomWallpapers(updatedList);
                try {
                    localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList));
                } catch (e) {
                    console.error("Failed to save custom wallpaper list", e);
                }

                onSelect(customConfig);
                setActiveCategory('Custom');
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (50MB limit)
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB
        if (file.size > MAX_SIZE) {
            alert('Video file is too large. Maximum size is 50MB.');
            e.target.value = ''; // Reset input
            return;
        }

        // Check estimated storage space
        const estimatedSize = estimateBase64Size(file.size);
        if (!hasEnoughSpace(estimatedSize)) {
            alert(`Not enough storage space. This video needs ~${formatBytes(estimatedSize)}, but only ${formatBytes(getLocalStorageSize())} available. Try deleting some custom wallpapers or use a smaller video.`);
            e.target.value = ''; // Reset input
            return;
        }

        // Check file type
        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file (MP4 or WebM recommended).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const videoDataUrl = event.target?.result as string;

            // Create a simple config - video processing would be done server-side in production
            // For now, we'll store the data URL directly (note: this is memory-intensive)
            const customConfig: WallpaperConfig = {
                id: `custom-video-${Date.now()}`,
                type: 'video',
                category: 'Custom',
                value: '#0f0f11', // Fallback color
                videoUrl: videoDataUrl,
                thumbnail: '', // Could generate a thumbnail from first frame
                textColorTheme: 'light',
                accentColor: '#818cf8',
                overlayOpacity: 0.3
            };

            // Save to Custom List
            const updatedList = [customConfig, ...customWallpapers];
            setCustomWallpapers(updatedList);
            try {
                localStorage.setItem('custom-wallpapers-list', JSON.stringify(updatedList));
            } catch (e) {
                console.error("Failed to save custom wallpaper list. Video may be too large for localStorage.", e);
                alert('Video is too large to save. Try a shorter or lower quality video.');
                return;
            }

            onSelect(customConfig);
            setActiveCategory('Custom');
        };
        reader.readAsDataURL(file);
    };


    // Get storage color based on usage
    const getStorageColor = () => {
        if (storagePercent < 60) return '#10b981'; // Green
        if (storagePercent < 85) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <>
            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', marginTop: '1rem' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat as any)}
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

            {/* Wallpapers Grid */}
            <div className="wallpaper-grid" style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                padding: '0.5rem 0.25rem 1rem 0.25rem'
            }}>
                {activeCategory === 'Custom' && (
                    <>
                        <label
                            className="interactive-hover"
                            style={{
                                flexShrink: 0,
                                width: '80px',
                                height: '80px',
                                borderRadius: '1rem',
                                border: '2px dashed rgba(255,255,255,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.7rem',
                                gap: '4px'
                            }}
                        >
                            <ImageIcon size={20} />
                            <span>Image</span>
                            <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
                        </label>

                        <label
                            className="interactive-hover"
                            style={{
                                flexShrink: 0,
                                width: '80px',
                                height: '80px',
                                borderRadius: '1rem',
                                border: '2px dashed rgba(139, 92, 246, 0.3)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'rgba(139, 92, 246, 0.9)',
                                fontSize: '0.7rem',
                                gap: '4px'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                            <span>Video</span>
                            <input type="file" accept="video/*" onChange={handleVideoUpload} hidden />
                        </label>

                        {/* YouTube Link Input */}
                        <div style={{
                            flexShrink: 0,
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '1rem',
                            padding: '0.5rem 0.75rem',
                            height: '80px',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0000', fontSize: '0.7rem' }}>
                                    <Youtube size={14} />
                                    <span style={{ fontWeight: 600 }}>YouTube Link</span>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <input
                                        type="text"
                                        placeholder="Paste link..."
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0.5rem',
                                            padding: '4px 8px',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            width: '120px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleAddYouTube}
                                        className="interactive-press"
                                        style={{
                                            background: 'var(--color-accent)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Instructional Note */}
                        <div style={{
                            flexShrink: 0,
                            width: '100%',
                            maxWidth: '800px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '1rem',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            gap: '2rem',
                            boxSizing: 'border-box'
                        }}>
                            {/* Image Section */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Info size={12} />
                                    <span>Image Tips</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>
                                    • Max size: <strong>20MB</strong><br />
                                    • Best formats: <strong>JPEG / PNG / WebP</strong><br />
                                    • Tip: <strong>1080p+</strong> for sharpest quality.<br />
                                    • Privacy: Images stay private.
                                </p>
                            </div>

                            {/* Divider */}
                            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.05)', alignSelf: 'stretch' }} />

                            {/* Video Section */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Info size={12} />
                                    <span>Video Tips</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>
                                    • Max size: <strong>50MB</strong> (local)<br />
                                    • Supports: <strong>MP4 / WebM / YouTube</strong><br />
                                    • <strong>Performance Tip</strong>: YouTube and 4K streams may affect performance on low-end devices.<br />
                                    • Privacy: Videos stay private.
                                </p>
                            </div>

                            {/* Divider */}
                            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.05)', alignSelf: 'stretch' }} />

                            {/* Storage Section */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: getStorageColor(), fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <HardDrive size={12} />
                                    <span>Storage</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                                    <strong style={{ color: getStorageColor() }}>{formatBytes(storageUsed)}</strong> / ~9 MB used
                                </p>
                                <p style={{
                                    margin: '0.1rem 0 0 0',
                                    fontSize: '0.66rem',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    lineHeight: '1.6',
                                    fontWeight: 500,
                                    maxWidth: '220px'
                                }}>
                                    Your stats, habits, tasks, quotes, and preferences stay local in your browser. If storage fills up, new data won't be saved.
                                </p>
                            </div>
                        </div>

                    </>
                )}

                {filteredWallpapers.map((wp) => (
                    <div key={wp.id} style={{ position: 'relative', flexShrink: 0 }}>
                        <button
                            className={`wp-btn ${currentId === wp.id ? 'active' : ''} interactive-hover`}
                            onClick={() => onSelect(wp)}
                            title={wp.id}
                            style={{
                                background: wp.type === 'solid' ? wp.value : (wp.thumbnail && (wp.thumbnail.startsWith('#') || wp.thumbnail.startsWith('linear-gradient'))) ? wp.thumbnail : wp.thumbnail ? `url(${wp.thumbnail}) center/cover` : wp.value,
                                width: '80px',
                                height: '80px',
                                borderRadius: '1rem',
                                border: currentId === wp.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: wp.textColorTheme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'
                            }}
                        >
                            {wp.icon && <wp.icon size={28} strokeWidth={1.5} />}
                        </button>
                        {wp.category === 'Custom' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newList = customWallpapers.filter(w => w.id !== wp.id);
                                    setCustomWallpapers(newList);
                                    localStorage.setItem('custom-wallpapers-list', JSON.stringify(newList));
                                    if (currentId === wp.id) {
                                        // Optional: Reset to default if deleted active
                                        // onSelect(WALLPAPERS[0]); 
                                    }
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: '2px solid #000',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    padding: 0
                                }}
                                title="Delete"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

        </>
    );
};

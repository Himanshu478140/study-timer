import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Image as ImageIcon, X, Info, HardDrive, Youtube, Plus,
    Stars, CloudRain, Binary, Sparkles, Waves, Flame, Sun, Bug,
    Moon, Wind, Zap, Mountain, Trees, Droplets, Library, Music, Map
} from 'lucide-react';
import './wallpaper.css';
import { getLocalStorageSize, formatBytes, estimateBase64Size, hasEnoughSpace, getStorageUsagePercent } from '../../utils/storageUtils';

export type WallpaperCategory = 'Essentials' | 'Gradients' | 'Vibe' | 'Scenery' | 'Aura' | 'Motion' | 'Custom';

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
const gradientImg = new URL('../../assets/wallpapers/gradient.png', import.meta.url).href;
const sunsetImg = new URL('../../assets/wallpapers/sunset.png', import.meta.url).href;
const mountainsImg = new URL('../../assets/wallpapers/mountains.png', import.meta.url).href;
const coffeeImg = new URL('../../assets/wallpapers/coffee.png', import.meta.url).href;
const neonImg = new URL('../../assets/wallpapers/neon.png', import.meta.url).href;
const spaceImg = new URL('../../assets/wallpapers/space.png', import.meta.url).href;

export const WALLPAPERS: WallpaperConfig[] = [
    {
        id: 'dark-solid',
        type: 'solid',
        category: 'Essentials',
        value: '#0f0f11',
        textColorTheme: 'light',
        accentColor: '#818cf8', // Indigo
        overlayOpacity: 0
    },
    {
        id: 'midnight-blue',
        type: 'solid',
        category: 'Essentials',
        value: '#1e1b4b',
        textColorTheme: 'light',
        accentColor: '#c084fc', // Purple
        overlayOpacity: 0
    },
    {
        id: 'forest-green',
        type: 'solid',
        category: 'Essentials',
        value: '#064e3b',
        textColorTheme: 'light',
        accentColor: '#34d399', // Emerald
        overlayOpacity: 0
    },
    {
        id: 'gradient-soft',
        type: 'image',
        category: 'Gradients',
        value: `url(${gradientImg})`,
        thumbnail: gradientImg,
        textColorTheme: 'dark',
        accentColor: '#4f46e5', // Deep Indigo
        overlayOpacity: 0.1
    },
    {
        id: 'gradient-warm',
        type: 'image',
        category: 'Gradients',
        value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        thumbnail: '', // CSS Gradient doesn't need thumb
        textColorTheme: 'dark',
        accentColor: '#ea580c', // Orange
        overlayOpacity: 0.1
    },
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
        id: 'nature-forest-path',
        type: 'image',
        category: 'Scenery',
        value: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560)',
        thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400',
        textColorTheme: 'light',
        accentColor: '#22c55e',
        overlayOpacity: 0.2
    },
    {
        id: 'nature-desert-gold',
        type: 'image',
        category: 'Scenery',
        value: 'url(https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=2560)',
        thumbnail: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=400',
        textColorTheme: 'light',
        accentColor: '#f59e0b',
        overlayOpacity: 0.1
    },
    {
        id: 'nature-mountain-peak',
        type: 'image',
        category: 'Scenery',
        value: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2560)',
        thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400',
        textColorTheme: 'light',
        accentColor: '#0ea5e9',
        overlayOpacity: 0.2
    },
    {
        id: 'nature-ocean-shore',
        type: 'image',
        category: 'Scenery',
        value: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2560)',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
        textColorTheme: 'dark',
        accentColor: '#2dd4bf',
        overlayOpacity: 0.15
    },
    {
        id: 'cozy-coffee',
        type: 'image',
        category: 'Vibe',
        value: `url(${coffeeImg})`,
        thumbnail: coffeeImg,
        textColorTheme: 'dark',
        accentColor: '#d97706',
        overlayOpacity: 0.1
    },
    {
        id: 'neon-city',
        type: 'image',
        category: 'Vibe',
        value: `url(${neonImg})`,
        thumbnail: neonImg,
        textColorTheme: 'light',
        accentColor: '#d946ef',
        overlayOpacity: 0.2
    },
    {
        id: 'deep-space',
        type: 'image',
        category: 'Vibe',
        value: `url(${spaceImg})`,
        thumbnail: spaceImg,
        textColorTheme: 'light',
        accentColor: '#818cf8',
        overlayOpacity: 0.1
    },
    {
        id: 'abstract-silk-dark',
        type: 'image',
        category: 'Vibe',
        value: 'url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2560)',
        thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400',
        textColorTheme: 'light',
        accentColor: '#818cf8',
        overlayOpacity: 0.2
    },
    {
        id: 'abstract-light-trails',
        type: 'image',
        category: 'Vibe',
        value: 'url(https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=2560)',
        thumbnail: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=400',
        textColorTheme: 'light',
        accentColor: '#ec4899',
        overlayOpacity: 0.1
    },
    {
        id: 'abstract-geometric-prism',
        type: 'image',
        category: 'Vibe',
        value: 'url(https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=2560)',
        thumbnail: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=400',
        textColorTheme: 'dark',
        accentColor: '#6366f1',
        overlayOpacity: 0.1
    },
    {
        id: 'abstract-misty-purple',
        type: 'image',
        category: 'Vibe',
        value: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2560)',
        thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=400',
        textColorTheme: 'light',
        accentColor: '#a855f7',
        overlayOpacity: 0.15
    },
    // Video Wallpapers - Users can add their own videos in the Custom category
    // These are placeholders showing the structure
    {
        id: 'aurora-gradient',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-aurora',
        thumbnail: 'linear-gradient(135deg, #0f172a, #312e81)',
        textColorTheme: 'light',
        accentColor: '#4ade80',
        overlayOpacity: 0.1,
        icon: Sparkles
    },
    {
        id: 'midnight-gradient',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-midnight',
        thumbnail: 'linear-gradient(135deg, #09090b, #27272a)',
        textColorTheme: 'light',
        accentColor: '#818cf8',
        overlayOpacity: 0.1,
        icon: Moon
    },
    {
        id: 'ocean-gradient',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-ocean',
        thumbnail: 'linear-gradient(135deg, #0c4a6e, #0369a1)',
        textColorTheme: 'light',
        accentColor: '#38bdf8',
        overlayOpacity: 0.1,
        icon: Waves
    },
    {
        id: 'sunset-gradient',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-sunset',
        thumbnail: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
        textColorTheme: 'light',
        accentColor: '#c084fc',
        overlayOpacity: 0.1,
        icon: Sun
    },
    {
        id: 'cyberpunk-gradient',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-cyberpunk',
        thumbnail: 'linear-gradient(135deg, #701a75, #1e1b4b)',
        textColorTheme: 'light',
        accentColor: '#f472b6',
        overlayOpacity: 0.15,
        icon: Zap
    },
    {
        id: 'nebula-gradient',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-nebula',
        thumbnail: 'linear-gradient(135deg, #2e1065, #581c87)',
        textColorTheme: 'light',
        accentColor: '#a78bfa',
        overlayOpacity: 0.1,
        icon: Stars
    },
    {
        id: 'forest-gradient',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-forest',
        thumbnail: 'linear-gradient(135deg, #064e3b, #047857)',
        textColorTheme: 'light',
        accentColor: '#34d399',
        overlayOpacity: 0.1,
        icon: Trees
    },
    {
        id: 'flocus-aura',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-flocus',
        thumbnail: 'linear-gradient(135deg, #1e1b4b, #701a75)',
        textColorTheme: 'light',
        accentColor: '#f472b6',
        overlayOpacity: 0.1,
        icon: Sparkles
    },
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
        id: 'hybrid-neon-matrix',
        type: 'animated-gradient',
        category: 'Motion',
        value: 'gradient-cyberpunk',
        particleConfig: {
            type: 'matrix',
            density: 30,
            speed: 0.5,
            color: '#f472b6'
        },
        thumbnail: 'linear-gradient(135deg, #4a044e, #1e1b4b)',
        textColorTheme: 'light',
        accentColor: '#f472b6',
        overlayOpacity: 0.2,
        icon: Binary
    },
    {
        id: 'hybrid-forest-fireflies',
        type: 'animated-gradient',
        category: 'Motion',
        value: 'gradient-forest',
        particleConfig: {
            type: 'fireflies',
            density: 30,
            speed: 0.6,
            color: '#bef264'
        },
        thumbnail: 'linear-gradient(135deg, #064e3b, #065f46)',
        textColorTheme: 'light',
        accentColor: '#34d399',
        overlayOpacity: 0.1,
        icon: Bug
    },
    // Particle Ambient Presets
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
        id: 'ambient-snow',
        type: 'particles',
        category: 'Motion',
        value: 'linear-gradient(to bottom, #1e293b, #0f172a)',
        particleConfig: {
            type: 'snow',
            density: 40,
            speed: 1,
            color: '#f8fafc'
        },
        thumbnail: '#1e293b',
        textColorTheme: 'light',
        accentColor: '#7dd3fc',
        overlayOpacity: 0,
        icon: Wind
    },
    {
        id: 'ambient-dust',
        type: 'particles',
        category: 'Motion',
        value: '#111827',
        particleConfig: {
            type: 'dust',
            density: 30,
            speed: 0.3,
            color: '#fcd34d'
        },
        thumbnail: '#111827',
        textColorTheme: 'light',
        accentColor: '#fb923c',
        overlayOpacity: 0,
        icon: Droplets
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
    {
        id: 'ambient-matrix',
        type: 'particles',
        category: 'Motion',
        value: '#000000',
        particleConfig: {
            type: 'matrix',
            density: 40,
            speed: 1,
            color: '#22c55e'
        },
        thumbnail: '#000000',
        textColorTheme: 'light',
        accentColor: '#22c55e',
        overlayOpacity: 0,
        icon: Binary
    },
    {
        id: 'ambient-rain',
        type: 'particles',
        category: 'Motion',
        value: '#0f172a',
        particleConfig: {
            type: 'rain',
            density: 50,
            speed: 1.2,
            color: '#38bdf8'
        },
        thumbnail: '#0f172a',
        textColorTheme: 'light',
        accentColor: '#38bdf8',
        overlayOpacity: 0.2,
        icon: CloudRain
    },
    // --- Expansion: reaching 50 presets ---
    {
        id: 'slate-solid',
        type: 'solid',
        category: 'Essentials',
        value: '#1e293b',
        thumbnail: '#1e293b',
        textColorTheme: 'light',
        accentColor: '#94a3b8'
    },
    {
        id: 'lavender-gradient',
        type: 'animated-gradient',
        category: 'Gradients',
        value: 'gradient-sunset', // Reusing base for lavender feel
        thumbnail: 'linear-gradient(135deg, #e9d5ff, #fbcfe8)',
        textColorTheme: 'dark',
        accentColor: '#d8b4fe'
    },
    {
        id: 'deep-ocean-gradient',
        type: 'animated-gradient',
        category: 'Gradients',
        value: 'gradient-ocean',
        thumbnail: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
        textColorTheme: 'light',
        accentColor: '#60a5fa'
    },
    {
        id: 'northern-soul-aura',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-northern-soul',
        particleConfig: {
            type: 'fireflies',
            density: 20,
            speed: 0.3,
            color: '#4ade80',
            interactionType: 'follow'
        },
        thumbnail: 'linear-gradient(135deg, #064e3b, #1e1b4b)',
        textColorTheme: 'light',
        accentColor: '#4ade80',
        icon: Sparkles
    },
    {
        id: 'cosmic-candy-aura',
        type: 'animated-gradient',
        category: 'Aura',
        value: 'gradient-cosmic-candy',
        particleConfig: {
            type: 'stars',
            density: 40,
            speed: 0.5,
            color: '#f472b6',
            interactionType: 'follow'
        },
        thumbnail: 'linear-gradient(135deg, #701a75, #4338ca)',
        textColorTheme: 'light',
        accentColor: '#f472b6',
        icon: Stars
    },
    {
        id: 'stardust-gold-motion',
        type: 'particles',
        category: 'Motion',
        value: '#020617',
        particleConfig: {
            type: 'stars',
            density: 60,
            speed: 0.4,
            color: '#fcd34d',
            interactionType: 'follow'
        },
        thumbnail: '#020617',
        textColorTheme: 'light',
        accentColor: '#fcd34d',
        icon: Moon
    },
    {
        id: 'magnetic-rain-motion',
        type: 'particles',
        category: 'Motion',
        value: '#09090b',
        particleConfig: {
            type: 'rain',
            density: 40,
            speed: 1.5,
            color: '#22d3ee',
            interactionType: 'repel'
        },
        thumbnail: '#09090b',
        textColorTheme: 'light',
        accentColor: '#22d3ee',
        icon: CloudRain
    },
    {
        id: 'tokyo-night-scenery',
        type: 'image',
        category: 'Scenery',
        value: 'url(https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1920)',
        thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=40&w=300',
        textColorTheme: 'light',
        accentColor: '#f472b6',
        icon: Map
    },
    {
        id: 'swiss-alps-scenery',
        type: 'image',
        category: 'Scenery',
        value: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920)',
        thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=40&w=300',
        textColorTheme: 'light',
        accentColor: '#7dd3fc',
        icon: Mountain
    },
    {
        id: 'library-vibe',
        type: 'image',
        category: 'Vibe',
        value: 'url(https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1920)',
        thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=40&w=300',
        textColorTheme: 'light',
        accentColor: '#fbbf24',
        icon: Library
    },
    {
        id: 'vinyl-vibe',
        type: 'image',
        category: 'Vibe',
        value: 'url(https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=1920)',
        thumbnail: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=40&w=300',
        textColorTheme: 'light',
        accentColor: '#ef4444',
        icon: Music
    },
];

interface WallpaperSelectorProps {
    currentId: string;
    onSelect: (config: WallpaperConfig) => void;
}

export const WallpaperSelector = ({ currentId, onSelect }: WallpaperSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Trigger Button */}
            <button
                className="wallpaper-trigger-btn interactive-press"
                onClick={() => setIsOpen(true)}
            >
                <ImageIcon size={18} />
                <span>Wallpaper</span>
            </button>

            {createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className={`wallpaper-drawer-overlay ${isOpen ? 'open' : ''}`}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className={`wallpaper-drawer ${isOpen ? 'open' : ''}`}>
                        <div className="drawer-handle" />

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>Backgrounds</h3>
                            <button onClick={() => setIsOpen(false)} style={{ padding: '0.5rem', opacity: 0.7, color: 'white' }}>
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
    const [activeCategory, setActiveCategory] = useState<WallpaperCategory>('Essentials');
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

    const categories: WallpaperCategory[] = ['Essentials', 'Gradients', 'Aura', 'Motion', 'Scenery', 'Vibe', 'Custom'];

    const allWallpapers = [...WALLPAPERS, ...customWallpapers];
    const filteredWallpapers = allWallpapers.filter(wp => wp.category === activeCategory);

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

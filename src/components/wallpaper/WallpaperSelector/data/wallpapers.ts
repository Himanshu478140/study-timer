import { Sparkles, Flame, Mountain, Stars, Bug } from 'lucide-react';
import { type WallpaperConfig } from '../types';
import * as assets from './wallpaperAssets';

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
        value: `url(${assets.natureImg})`,
        thumbnail: assets.natureImg,
        textColorTheme: 'light',
        accentColor: '#84cc16', // Lime/Nature
        overlayOpacity: 0.3
    },
    {
        id: 'bamboo-cathedral',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.bambooCathedralImg})`,
        thumbnail: assets.bambooCathedralImg,
        textColorTheme: 'light',
        accentColor: '#10b981',
        overlayOpacity: 0.2
    },
    {
        id: 'emerald-canopy',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.emeraldCanopyImg})`,
        thumbnail: assets.emeraldCanopyImg,
        textColorTheme: 'light',
        accentColor: '#22c55e',
        overlayOpacity: 0.2
    },
    {
        id: 'emerald-valley-dreams',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.emeraldValleyDreamsImg})`,
        thumbnail: assets.emeraldValleyDreamsImg,
        textColorTheme: 'light',
        accentColor: '#4ade80',
        overlayOpacity: 0.15
    },
    {
        id: 'enchanted-pine-forest',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.enchantedPineForestImg})`,
        thumbnail: assets.enchantedPineForestImg,
        textColorTheme: 'light',
        accentColor: '#2dd4bf',
        overlayOpacity: 0.2
    },
    {
        id: 'mountain-railway-journey',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.mountainRailwayJourneyImg})`,
        thumbnail: assets.mountainRailwayJourneyImg,
        textColorTheme: 'light',
        accentColor: '#06b6d4',
        overlayOpacity: 0.2
    },
    {
        id: 'sunlit-sakura-vista',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.sunlitSakuraVistaImg})`,
        thumbnail: assets.sunlitSakuraVistaImg,
        textColorTheme: 'dark',
        accentColor: '#db2777',
        overlayOpacity: 0.1
    },
    {
        id: 'twilight-torii-forest',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.twilightToriiForestImg})`,
        thumbnail: assets.twilightToriiForestImg,
        textColorTheme: 'light',
        accentColor: '#ef4444',
        overlayOpacity: 0.2
    },
    {
        id: 'sunset-horizon',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.sunsetImg})`,
        thumbnail: assets.sunsetImg,
        textColorTheme: 'dark', // Bright sunset
        accentColor: '#fb923c', // Orange-400
        overlayOpacity: 0.1
    },
    {
        id: 'misty-mountains',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.mountainsImg})`,
        thumbnail: assets.mountainsImg,
        textColorTheme: 'light',
        accentColor: '#38bdf8', // Sky-400
        overlayOpacity: 0.2
    },
    {
        id: 'amber-dunes',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.amberDunesImg})`,
        thumbnail: assets.amberDunesImg,
        textColorTheme: 'light',
        accentColor: '#f59e0b', // Amber-500
        overlayOpacity: 0.15
    },
    {
        id: 'midnight-harbor',
        type: 'image',
        category: 'Scenery',
        value: `url(${assets.midnightHarborImg})`,
        thumbnail: assets.midnightHarborImg,
        textColorTheme: 'light',
        accentColor: '#38bdf8', // Sky-400
        overlayOpacity: 0.25
    },

    // ─── COZY SPACES ───
    {
        id: 'midnight-study-retreat',
        type: 'image',
        category: 'Cozy Spaces',
        value: `url(${assets.midnightStudyRetreatImg})`,
        thumbnail: assets.midnightStudyRetreatImg,
        textColorTheme: 'light',
        accentColor: '#6366f1',
        overlayOpacity: 0.2
    },
    {
        id: 'last-train-home',
        type: 'image',
        category: 'Cozy Spaces',
        value: `url(${assets.lastTrainHomeImg})`,
        thumbnail: assets.lastTrainHomeImg,
        textColorTheme: 'light',
        accentColor: '#818cf8',
        overlayOpacity: 0.2
    },
    {
        id: 'cosmic-haven',
        type: 'image',
        category: 'Cozy Spaces',
        value: `url(${assets.cosmicHavenImg})`,
        thumbnail: assets.cosmicHavenImg,
        textColorTheme: 'light',
        accentColor: '#c084fc', // Purple-400
        overlayOpacity: 0.15
    },

    // ─── ANIME & CYBER ───
    {
        id: 'cyber-rain-district',
        type: 'image',
        category: 'Anime & Cyber',
        value: `url(${assets.cyberRainDistrictImg})`,
        thumbnail: assets.cyberRainDistrictImg,
        textColorTheme: 'light',
        accentColor: '#ec4899',
        overlayOpacity: 0.2
    },
    {
        id: 'neon-grid-nexus',
        type: 'image',
        category: 'Anime & Cyber',
        value: `url(${assets.neonGridNexusImg})`,
        thumbnail: assets.neonGridNexusImg,
        textColorTheme: 'light',
        accentColor: '#a855f7',
        overlayOpacity: 0.15
    },
    {
        id: 'golden-city-horizon',
        type: 'image',
        category: 'Anime & Cyber',
        value: `url(${assets.goldenCityHorizonImg})`,
        thumbnail: assets.goldenCityHorizonImg,
        textColorTheme: 'light',
        accentColor: '#eab308',
        overlayOpacity: 0.2
    },
    {
        id: 'neon-horizon',
        type: 'image',
        category: 'Anime & Cyber',
        value: `url(${assets.neonHorizonImg})`,
        thumbnail: assets.neonHorizonImg,
        textColorTheme: 'light',
        accentColor: '#38bdf8', // Sky-400
        overlayOpacity: 0.2
    },

    // ─── CELESTIAL ───
    {
        id: 'deep-space',
        type: 'image',
        category: 'Celestial',
        value: `url(${assets.spaceImg})`,
        thumbnail: assets.spaceImg,
        textColorTheme: 'light',
        accentColor: '#818cf8',
        overlayOpacity: 0.1
    },
    {
        id: 'celestial-sky-kingdom',
        type: 'image',
        category: 'Celestial',
        value: `url(${assets.celestialSkyKingdomImg})`,
        thumbnail: assets.celestialSkyKingdomImg,
        textColorTheme: 'dark',
        accentColor: '#6366f1',
        overlayOpacity: 0.15
    },
    {
        id: 'starlight-observatory',
        type: 'image',
        category: 'Celestial',
        value: `url(${assets.starlightObservatoryImg})`,
        thumbnail: assets.starlightObservatoryImg,
        textColorTheme: 'light',
        accentColor: '#a855f7',
        overlayOpacity: 0.2
    },
    {
        id: 'nebula-veil',
        type: 'image',
        category: 'Celestial',
        value: `url(${assets.nebulaVeilImg})`,
        thumbnail: assets.nebulaVeilImg,
        textColorTheme: 'light',
        accentColor: '#f472b6', // Pink-400
        overlayOpacity: 0.15
    },
    {
        id: 'aurora-bloom',
        type: 'image',
        category: 'Celestial',
        value: `url(${assets.auroraBloomImg})`,
        thumbnail: assets.auroraBloomImg,
        textColorTheme: 'light',
        accentColor: '#10b981', // Emerald-500
        overlayOpacity: 0.2
    },

    // ─── ABSTRACT FLOW ───
    {
        id: 'ocean-surge',
        type: 'image',
        category: 'Abstract Flow',
        value: `url(${assets.oceanSurgeImg})`,
        thumbnail: assets.oceanSurgeImg,
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
        value: `url(${assets.zenRippleGardenImg})`,
        thumbnail: assets.zenRippleGardenImg,
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

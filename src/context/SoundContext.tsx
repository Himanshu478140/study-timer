import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { audioManager } from '../utils/audioManager';

export type AmbientSound =
    | 'none'
    | 'rain'
    | 'forest'
    | 'cafe'
    | 'waves'
    | 'clock'
    // Nature Sounds
    | 'light_rain'
    | 'waterfall'
    | 'summer_night'
    // Noise Types
    | 'white_noise'
    | 'pink_noise'
    | 'brown_noise'
    // Atmosphere
    | 'fireplace'
    | 'campfire'
    | 'japanese_library'
    | 'nyc_morning'
    // Binaural Beats
    | 'binaural_alpha'
    | 'binaural_theta'
    | 'binaural_delta'
    | 'binaural_gamma'
    | 'binaural_beta';

interface SoundContextType {
    activeAmbient: AmbientSound | string;
    setAmbient: (sound: AmbientSound | string) => void;
    playSFX: (name: 'level-up' | 'clock') => void;
    volumes: { master: number; ambient: number; ui: number };
    updateVolume: (type: 'master' | 'ambient' | 'ui', value: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) throw new Error('useSound must be used within a SoundProvider');
    return context;
};

// Asset Mapping (Placeholder URLs for now)
const SOUND_URLS = {
    // Original sounds
    rain: '/audio/rain.mp3',
    forest: '/audio/forest.mp3',
    cafe: '/audio/cafe.mp3',
    waves: '/audio/waves.mp3',
    clock: '/audio/clock.mp3',
    // Nature Sounds
    light_rain: '/audio/light_rain.mp3',
    waterfall: '/audio/waterfall.mp3',
    summer_night: '/audio/summer_night.mp3',
    // Noise Types
    white_noise: '/audio/white_noise.mp3',
    pink_noise: '/audio/pink_noise.mp3',
    brown_noise: '/audio/brown_noise.mp3',
    // Atmosphere
    fireplace: '/audio/fireplace.mp3',
    campfire: '/audio/campfire.mp3',
    japanese_library: '/audio/japanese_library.mp3',
    nyc_morning: '/audio/nyc_morning.mp3',
    // Binaural Beats
    binaural_alpha: '/audio/binaural_alpha.mp3',
    binaural_theta: '/audio/binaural_theta.mp3',
    binaural_delta: '/audio/binaural_delta.mp3',
    binaural_gamma: '/audio/binaural_gamma.mp3',
    binaural_beta: '/audio/binaural_beta.mp3'
};

const SFX_URLS = {
    level_up: '/audio/level_up.mp3',
    clock: '/audio/clock.mp3'
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
    const [activeAmbient, setActiveAmbient] = useState<AmbientSound | string>('none');
    const [volumes, setVolumes] = useState({
        master: 0.5, // Default lower to be subtle
        ambient: 0.7,
        ui: 0.6
    });

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('study-timer-audio');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setVolumes(parsed.volumes || volumes);
                // Don't auto-play ambient on load to respect autoplay policies usually
                // But we can set the state
                setActiveAmbient(parsed.activeAmbient || 'none');

                // Initialize manager volumes
                audioManager.setVolume('master', parsed.volumes?.master ?? 0.5);
                audioManager.setVolume('ambient', parsed.volumes?.ambient ?? 0.7);
                audioManager.setVolume('ui', parsed.volumes?.ui ?? 0.6);
            } catch (e) { console.error(e); }
        }
    }, []);

    // Persist settings
    useEffect(() => {
        localStorage.setItem('study-timer-audio', JSON.stringify({ volumes, activeAmbient }));
    }, [volumes, activeAmbient]);

    const setAmbient = (sound: AmbientSound | string) => {
        if (activeAmbient === sound && sound !== 'none') {
            setActiveAmbient('none');
            audioManager.stopAmbient();
            return;
        }

        setActiveAmbient(sound as AmbientSound);
        if (sound === 'none' || sound === 'clock') {
            audioManager.stopAmbient();
        } else {
            // Check presets first
            // @ts-ignore
            let url = SOUND_URLS[sound];

            if (url) audioManager.playAmbient(url);
        }
    };

    const updateVolume = (type: 'master' | 'ambient' | 'ui', value: number) => {
        setVolumes(prev => ({ ...prev, [type]: value }));
        audioManager.setVolume(type, value);
    };

    const playSFX = (name: 'level-up' | 'clock') => {
        // Map clean names to keys
        const key = name === 'level-up' ? 'level_up' : name;
        // @ts-ignore
        const url = SFX_URLS[key];
        if (url) audioManager.playSFX(url);
    };

    return (
        <SoundContext.Provider value={{
            activeAmbient, setAmbient, playSFX, volumes, updateVolume
        }}>
            {children}
        </SoundContext.Provider>
    );
};

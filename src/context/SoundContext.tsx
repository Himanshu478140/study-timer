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
    binaural_gamma: '/audio/binaural_gamma.mp3',
    binaural_beta: '/audio/binaural_beta.mp3'
};

const SFX_URLS = {
    level_up: '/audio/level_up.mp3',
    clock: '/audio/clock.mp3'
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
    const [volumes, setVolumes] = useState(() => {
        const saved = localStorage.getItem('study-timer-audio');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.volumes) {
                    return {
                        master: parsed.volumes.master ?? 0.5,
                        ambient: parsed.volumes.ambient ?? 1.0,
                        ui: parsed.volumes.ui ?? 0.6
                    };
                }
            } catch (e) {
                console.error(e);
            }
        }
        return {
            master: 0.5,
            ambient: 1.0,
            ui: 0.6
        };
    });

    const [activeAmbient, setActiveAmbient] = useState<AmbientSound | string>(() => {
        const saved = localStorage.getItem('study-timer-audio');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed.activeAmbient || 'none';
            } catch (e) {
                console.error(e);
            }
        }
        return 'none';
    });

    // Initialize manager volumes on mount
    useEffect(() => {
        audioManager.setVolume('master', volumes.master);
        audioManager.setVolume('ambient', volumes.ambient);
        audioManager.setVolume('ui', volumes.ui);
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

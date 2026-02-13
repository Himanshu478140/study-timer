import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Headphones, Volume2, CloudRain, Wind, Coffee, Waves, X, Clock,
    Droplets, Moon, Flame, BookOpen, Building2, Brain, Radio
} from 'lucide-react';
import { useSound, type AmbientSound } from '../../context/SoundContext';
import './audio.css';

type SoundCategory = 'All' | 'Original' | 'Nature' | 'Noise' | 'Atmosphere' | 'Binaural';

export const AudioPanel = ({
    externalOpen,
    onOpenChange
}: {
    externalOpen?: boolean;
    onOpenChange?: (open: boolean) => void
} = {}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    const [activeCategory, setActiveCategory] = useState<SoundCategory>('Original');
    const { activeAmbient, setAmbient, volumes, updateVolume } = useSound();
    const [audioState, setAudioState] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

    useEffect(() => {
        // @ts-ignore - access manager directly for state sync
        import('../../utils/audioManager').then(({ audioManager }) => {
            audioManager.setStateListener((state) => {
                setAudioState(state);
            });
        });
    }, []);

    // Flat list of all sounds with their categories
    const allSounds: { id: AmbientSound; label: string; icon: any; category: SoundCategory }[] = [
        // Original
        { id: 'rain', label: 'Rain', icon: CloudRain, category: 'Original' },
        { id: 'forest', label: 'Forest', icon: Wind, category: 'Original' },
        { id: 'cafe', label: 'Cafe', icon: Coffee, category: 'Original' },
        { id: 'waves', label: 'Ocean', icon: Waves, category: 'Original' },
        { id: 'clock', label: 'Clock', icon: Clock, category: 'Original' },
        // Nature
        { id: 'light_rain', label: 'Light Rain', icon: Droplets, category: 'Nature' },
        { id: 'waterfall', label: 'Waterfall', icon: Waves, category: 'Nature' },
        { id: 'summer_night', label: 'Summer Night', icon: Moon, category: 'Nature' },
        // Noise
        { id: 'white_noise', label: 'White Noise', icon: Radio, category: 'Noise' },
        { id: 'pink_noise', label: 'Pink Noise', icon: Radio, category: 'Noise' },
        { id: 'brown_noise', label: 'Brown Noise', icon: Radio, category: 'Noise' },
        // Atmosphere
        { id: 'fireplace', label: 'Fireplace', icon: Flame, category: 'Atmosphere' },
        { id: 'campfire', label: 'Campfire', icon: Flame, category: 'Atmosphere' },
        { id: 'japanese_library', label: 'Japanese Library', icon: BookOpen, category: 'Atmosphere' },
        { id: 'nyc_morning', label: 'NYC Morning', icon: Building2, category: 'Atmosphere' },
        // Binaural
        { id: 'binaural_alpha', label: 'Alpha (Relax)', icon: Brain, category: 'Binaural' },
        { id: 'binaural_theta', label: 'Theta (Meditate)', icon: Brain, category: 'Binaural' },
        { id: 'binaural_delta', label: 'Delta (Sleep)', icon: Brain, category: 'Binaural' },
        { id: 'binaural_gamma', label: 'Gamma (Focus)', icon: Brain, category: 'Binaural' },
        { id: 'binaural_beta', label: 'Beta (Alert)', icon: Brain, category: 'Binaural' }
    ];

    const categories: SoundCategory[] = ['Original', 'Nature', 'Noise', 'Atmosphere', 'Binaural'];

    // Filter sounds based on active category
    const filteredSounds = allSounds.filter(s => s.category === activeCategory);

    return (
        <>
            {externalOpen === undefined && (
                <button
                    className="audio-trigger-btn interactive-press"
                    onClick={() => setIsOpen(true)}
                    aria-label="Audio Settings"
                >
                    <Headphones size={20} />
                </button>
            )}

            {createPortal(
                <>
                    {/* Overlay */}
                    <div
                        className={`audio-drawer-overlay ${isOpen ? 'open' : ''}`}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer */}
                    <div className={`audio-drawer ${isOpen ? 'open' : ''}`}>
                        <div className="drawer-handle" />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Audio Settings</h3>
                            <button onClick={() => setIsOpen(false)} style={{ padding: '0.5rem', opacity: 0.7 }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Status Feedback */}
                        {(audioState.loading || audioState.error) && (
                            <div style={{
                                padding: '0.8rem',
                                borderRadius: '0.8rem',
                                background: audioState.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--color-accent-rgb), 0.1)',
                                border: `1px solid ${audioState.error ? '#ef4444' : 'var(--color-accent)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '0.85rem',
                                color: audioState.error ? '#f87171' : 'var(--color-accent)',
                                animation: 'fadeIn 0.3s ease'
                            }}>
                                {audioState.loading ? (
                                    <>
                                        <div className="loading-spinner-tiny" />
                                        <span>Tuning into frequency...</span>
                                    </>
                                ) : (
                                    <>
                                        <X size={16} />
                                        <span>{audioState.error}</span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Volume Controls */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                            <div className="volume-control">
                                <Volume2 size={16} style={{ opacity: 0.7 }} />
                                <span style={{ fontSize: '0.9rem', minWidth: '60px' }}>Master</span>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={volumes.master}
                                    onChange={(e) => updateVolume('master', parseFloat(e.target.value))}
                                    className="volume-slider"
                                />
                            </div>
                            <div className="volume-control">
                                <span style={{ fontSize: '0.9rem', minWidth: '80px', opacity: 0.7, paddingLeft: '24px' }}>Ambience</span>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={volumes.ambient}
                                    onChange={(e) => updateVolume('ambient', parseFloat(e.target.value))}
                                    className="volume-slider"
                                />
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'var(--color-glass-border)', margin: '0.5rem 0' }} />

                        {/* Category Tabs */}
                        <div className="category-tabs">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Ambient Grid */}
                        <div className="ambient-grid">
                            {filteredSounds.map(sound => {
                                const Icon = sound.icon;
                                const isPlaying = activeAmbient === sound.id;
                                return (
                                    <button
                                        key={sound.id}
                                        className={`ambient-btn interactive-hover ${activeAmbient === sound.id ? 'active' : ''}`}
                                        onClick={() => setAmbient(sound.id)}
                                    >
                                        <div className="ambient-icon-wrapper">
                                            <Icon size={24} />
                                            {isPlaying && (
                                                <div className="play-overlay">
                                                    <div className="mini-dot" />
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.8rem' }}>{sound.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

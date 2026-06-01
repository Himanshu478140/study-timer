import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Headphones, Volume2, VolumeX, Volume1, CloudRain, Wind, Coffee, Waves, X, Clock,
    Droplets, Moon, Flame, BookOpen, Building2, Brain, Radio
} from 'lucide-react';
import { useSound, type AmbientSound } from '../../context/SoundContext';
import './audio.css';

type SoundCategory = 'Original' | 'Nature' | 'Noise' | 'Atmosphere' | 'Binaural';

interface AudioPanelProps {
    externalOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}

export const AudioPanel = ({
    externalOpen,
    onOpenChange,
    triggerRef
}: AudioPanelProps) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    const [activeCategory, setActiveCategory] = useState<SoundCategory>('Original');
    const { activeAmbient, setAmbient, volumes, updateVolume } = useSound();
    const [audioState, setAudioState] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

    const panelRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{
        top: string;
        left: string;
        right: string;
        origin: string;
        maxHeight?: string;
    }>({
        top: '50%',
        left: 'auto',
        right: '100px',
        origin: 'right center'
    });
    const [isPositioned, setIsPositioned] = useState(false);

    const [dimensions, setDimensions] = useState({
        scale: Math.max(0.5, Math.min(Math.min(window.innerHeight / 633, window.innerWidth / 850), 1.8))
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                scale: Math.max(0.5, Math.min(Math.min(window.innerHeight / 633, window.innerWidth / 850), 1.8))
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scale = dimensions.scale;

    useEffect(() => {
        // @ts-ignore - access manager directly for state sync
        import('../../utils/audioManager').then(({ audioManager }) => {
            audioManager.setStateListener((state) => {
                setAudioState(state);
            });
        });
    }, []);

    // Update position with viewport clamping next to its sidebar icon
    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && triggerRef?.current && panelRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const panelHeight = panelRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;
                const margin = 20;

                const triggerCenterY = triggerRect.top + triggerRect.height / 2;
                let idealTop = triggerCenterY - panelHeight / 2;
                const minTop = margin;
                const maxTop = viewportHeight - panelHeight - margin;
                const finalTop = Math.max(minTop, Math.min(maxTop, idealTop));
                const maxH = Math.max(200, viewportHeight - finalTop - margin);

                setPosition({
                    top: `${finalTop}px`,
                    left: 'auto',
                    right: `${92 * scale}px`,
                    origin: 'right center',
                    maxHeight: `${maxH}px`
                });
                setIsPositioned(true);
            }
        };

        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);

            const observer = new ResizeObserver(() => {
                requestAnimationFrame(updatePosition);
            });

            if (panelRef.current) {
                observer.observe(panelRef.current);
            }

            return () => {
                window.removeEventListener('resize', updatePosition);
                observer.disconnect();
            };
        } else {
            setIsPositioned(false);
        }
    }, [isOpen, triggerRef, scale]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            const isOutsidePanel = panelRef.current && !panelRef.current.contains(e.target as Node);
            const isNotTrigger = triggerRef?.current && !triggerRef.current.contains(e.target as Node);

            if (isOutsidePanel && isNotTrigger) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, triggerRef]);

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
        { id: 'binaural_gamma', label: 'Gamma (Focus)', icon: Brain, category: 'Binaural' },
        { id: 'binaural_beta', label: 'Beta (Alert)', icon: Brain, category: 'Binaural' }
    ];

    const categories: SoundCategory[] = ['Original', 'Nature', 'Noise', 'Atmosphere', 'Binaural'];

    // Filter sounds based on active category
    const filteredSounds = allSounds.filter(s => s.category === activeCategory);

    const renderVolumeControl = () => {
        const val = volumes.master;
        
        let VolIcon = Volume2;
        if (val === 0) VolIcon = VolumeX;
        else if (val < 0.5) VolIcon = Volume1;

        return (
            <div className="audio-panel__volume-control">
                <div className="audio-panel__volume-label-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <VolIcon size={16} className="audio-panel__volume-icon" />
                        <span className="audio-panel__volume-label">Volume</span>
                    </div>
                    <span className="audio-panel__volume-percentage">{Math.round(val * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0" max="1" step="0.05"
                    value={val}
                    onChange={(e) => {
                        const newVol = parseFloat(e.target.value);
                        updateVolume('master', newVol);
                        updateVolume('ambient', 1.0); // Keep ambient full so master dictates the actual volume
                    }}
                    className="audio-panel__volume-slider"
                    aria-label="Volume"
                />
            </div>
        );
    };

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
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={panelRef}
                            initial={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
                            animate={{ opacity: isPositioned ? 1 : 0, x: 0, scale: scale }}
                            exit={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="audio-panel"
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                                position: 'fixed',
                                right: position.right,
                                left: position.left,
                                top: position.top,
                                width: '380px',
                                maxWidth: 'calc(100vw - 40px)',
                                maxHeight: position.maxHeight,
                                borderRadius: '1.25rem',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                zIndex: 9999,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
                                transformOrigin: position.origin,
                                visibility: isPositioned ? 'visible' : 'hidden'
                            }}
                        >
                            {/* Header */}
                            <header className="audio-panel__header">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Headphones size={22} className="audio-panel__header-icon" />
                                        <h2 className="audio-panel__title">Focus Sounds</h2>
                                    </div>
                                    <button
                                        className="audio-panel__close-btn"
                                        onClick={() => setIsOpen(false)}
                                        aria-label="Close audio panel"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </header>

                            {/* Status Feedback */}
                            {(audioState.loading || audioState.error) && (
                                <div className="audio-panel__status">
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

                            {/* Scrollable Content Container */}
                            <div className="audio-panel__content custom-scrollbar">
                                {/* Volume Slider */}
                                <section className="audio-panel__section">
                                    {renderVolumeControl()}
                                </section>

                                <div className="audio-panel__divider" />

                                {/* Category Tabs */}
                                <section className="audio-panel__section">
                                    <div className="audio-panel__categories custom-scrollbar">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                className={`audio-panel__category-tab ${activeCategory === cat ? 'active' : ''}`}
                                                onClick={() => setActiveCategory(cat)}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Ambient Grid */}
                                <section className="audio-panel__section" style={{ flex: 1, minHeight: 0 }}>
                                    <div className="audio-panel__grid custom-scrollbar">
                                        {filteredSounds.map(sound => {
                                            const Icon = sound.icon;
                                            const isPlaying = activeAmbient === sound.id;
                                            return (
                                                <button
                                                    key={sound.id}
                                                    className={`audio-panel__btn ${isPlaying ? 'active' : ''}`}
                                                    onClick={() => setAmbient(sound.id)}
                                                    aria-label={`Play ${sound.label}`}
                                                >
                                                    <div className="audio-panel__icon-wrapper">
                                                        <Icon size={20} />
                                                        {isPlaying && (
                                                            <div className="audio-panel__soundwave">
                                                                <div className="soundwave-bar" />
                                                                <div className="soundwave-bar" />
                                                                <div className="soundwave-bar" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="audio-panel__btn-label">{sound.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

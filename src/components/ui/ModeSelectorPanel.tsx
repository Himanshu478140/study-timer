import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Brain, Clock, Coffee, Sliders, Timer } from 'lucide-react';
import type { FocusMode } from '../modes/ModeSelector';

interface ModeSelectorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentMode: FocusMode;
    onModeChange: (mode: FocusMode) => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}

const modes: { id: FocusMode; label: string; description: string; icon: React.ReactNode; accent: string }[] = [
    { id: 'deep_work', label: 'Deep Work', description: '90 min focused session', icon: <Brain size={22} />, accent: '#a855f7' },
    { id: 'pomodoro', label: 'Pomodoro', description: '25 min work, 5 min break', icon: <Clock size={22} />, accent: '#ef4444' },
    { id: 'flow', label: '52/17', description: '52 min work, 17 min break', icon: <Coffee size={22} />, accent: '#3b82f6' },
    { id: 'custom', label: 'Custom', description: 'Set your own timer', icon: <Sliders size={22} />, accent: '#22c55e' },
];

export const ModeSelectorPanel = ({ isOpen, onClose, currentMode, onModeChange, triggerRef }: ModeSelectorPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [yPos, setYPos] = useState('50%');
    const [maxHeight, setMaxHeight] = useState('calc(100vh - 40px)');
    const [isPositioned, setIsPositioned] = useState(false);
    const shouldReduceMotion = useReducedMotion();

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

    const motionProps = shouldReduceMotion ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 }
    } : {
        initial: { opacity: 0, x: 40 * scale, scale: 0.98 * scale },
        animate: { opacity: 1, x: 0, scale: scale },
        exit: { opacity: 0, x: 40 * scale, scale: 0.98 * scale },
        transition: { type: "spring" as const, damping: 25, stiffness: 300 }
    };

    // Viewport clamping logic
    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && triggerRef?.current && panelRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const triggerCenterY = triggerRect.top + triggerRect.height / 2;
                const panelHeight = panelRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;
                const margin = 20;

                // 1. Calculate the max allowable unscaled height to fit inside the viewport visually
                const maxUnscaledHeight = (viewportHeight - 2 * margin) / scale;
                const maxH = Math.max(200, maxUnscaledHeight);

                // 2. Compute offsetY shift due to scaling around 'right center' origin
                const currentHeight = Math.min(panelHeight, maxH);
                const offsetY = ((scale - 1) * currentHeight) / 2;

                // 3. Calculate idealTop (unscaled) centered around trigger
                let idealTop = triggerCenterY - currentHeight / 2;

                // 4. Clamped boundaries for unscaled top to keep visual top/bottom in viewport
                const minTop = margin + offsetY;
                const maxTop = viewportHeight - currentHeight - offsetY - margin;

                const finalTop = Math.max(minTop, Math.min(maxTop, idealTop));

                setYPos(`${finalTop}px`);
                setMaxHeight(`${maxH}px`);
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

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            const isOutsidePanel = panelRef.current && !panelRef.current.contains(e.target as Node);
            const isNotTrigger = triggerRef?.current && !triggerRef.current.contains(e.target as Node);

            if (isOutsidePanel && isNotTrigger) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, triggerRef]);

    const handleSelect = (modeId: FocusMode) => {
        onModeChange(modeId);
        onClose();
    };

    const content = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={panelRef}
                    {...motionProps}
                    animate={shouldReduceMotion ? undefined : { opacity: isPositioned ? 1 : 0, x: 0, scale: scale }}
                    className="mode-selector-panel"
                    style={{
                        position: 'fixed',
                        right: `${92 * scale}px`,
                        top: yPos,
                        width: 'var(--panel-width, 320px)',
                        maxWidth: 'calc(100vw - 40px)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '24px',
                        zIndex: 9999,
                        background: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        maxHeight: maxHeight,
                        overflowY: 'auto',
                        transformOrigin: 'right center',
                        visibility: isPositioned ? 'visible' : 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{ flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Timer size={14} color="var(--color-accent)" />
                            <h3 style={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: 'rgba(255, 255, 255, 0.4)',
                                margin: 0
                            }}>Timer Mode</h3>
                        </div>
                        <h2 style={{
                            fontSize: '24px',
                            fontFamily: "'Noto Serif', serif",
                            fontStyle: 'italic',
                            margin: 0
                        }}>Focus Mode</h2>
                    </div>

                    {/* Mode Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {modes.map((m) => {
                            const isActive = currentMode === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => handleSelect(m.id)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '1.25rem',
                                        border: isActive
                                            ? `1px solid ${m.accent}40`
                                            : '1px solid rgba(255, 255, 255, 0.05)',
                                        background: isActive
                                            ? `linear-gradient(135deg, ${m.accent}18, ${m.accent}08)`
                                            : 'rgba(255, 255, 255, 0.02)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                        }
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.outline = `2px solid ${m.accent}`;
                                        e.currentTarget.style.outlineOffset = '2px';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.outline = 'none';
                                    }}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '14px',
                                        background: isActive
                                            ? `linear-gradient(135deg, ${m.accent}, ${m.accent}cc)`
                                            : 'rgba(255, 255, 255, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                        flexShrink: 0,
                                        boxShadow: isActive ? `0 4px 16px ${m.accent}40` : 'none',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        {m.icon}
                                    </div>

                                    {/* Text */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            marginBottom: '2px',
                                            color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)'
                                        }}>
                                            {m.label}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: isActive ? `${m.accent}` : 'rgba(255, 255, 255, 0.3)',
                                            fontWeight: 500
                                        }}>
                                            {m.description}
                                        </div>
                                    </div>

                                    {/* Active indicator */}
                                    {isActive && (
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: m.accent,
                                            boxShadow: `0 0 8px ${m.accent}`,
                                            flexShrink: 0
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};

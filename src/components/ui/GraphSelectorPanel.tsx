import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../../hooks/useHabits';
import { InteractiveFocusChart } from '../stats/InteractiveFocusChart';
import { TrendingUp, Target, Zap } from 'lucide-react';

interface GraphSelectorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}

export const GraphSelectorPanel = ({ isOpen, onClose, triggerRef }: GraphSelectorPanelProps) => {
    const { stats } = useHabits();
    const panelRef = useRef<HTMLDivElement>(null);
    const [yPos, setYPos] = useState('50%');
    const [maxHeight, setMaxHeight] = useState('calc(100vh - 40px)');
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

    // Update position with viewport clamping
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

    // Close on click outside
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

    const content = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
                    animate={{ opacity: isPositioned ? 1 : 0, x: 0, scale: scale }}
                    exit={{ opacity: 0, x: 40 * scale, scale: 0.98 * scale }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="task-selector-panel-mobile"
                    style={{
                        position: 'fixed',
                        right: `${92 * scale}px`,
                        top: yPos,
                        width: 'var(--panel-width, 600px)',
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
                        maxHeight: maxHeight,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        transformOrigin: 'right center',
                        visibility: isPositioned ? 'visible' : 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{ marginBottom: '24px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <TrendingUp size={14} color="#a855f7" />
                            <h3 style={{ 
                                fontSize: '10px', 
                                fontWeight: 'bold', 
                                letterSpacing: '0.2em', 
                                textTransform: 'uppercase', 
                                color: 'rgba(255, 255, 255, 0.4)' 
                            }}>Performance Insights</h3>
                        </div>
                        <h2 style={{ 
                            fontSize: '24px', 
                            fontFamily: "'Noto Serif', serif", 
                            fontStyle: 'italic', 
                            color: 'white',
                            margin: 0
                        }}>Activity Trend</h2>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px', 
                        marginBottom: '24px',
                        flexShrink: 0
                    }}>
                        <div style={{ 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            padding: '12px 16px', 
                            borderRadius: '1.25rem',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', opacity: 0.5 }}>
                                <Zap size={12} />
                                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Streak</span>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.streaks.current} Days</div>
                        </div>
                        <div style={{ 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            padding: '12px 16px', 
                            borderRadius: '1.25rem',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', opacity: 0.5 }}>
                                <Target size={12} />
                                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Focus Today</span>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                {(() => {
                                    const todayStr = new Date().toISOString().split('T')[0];
                                    const todayMins = stats.history
                                        .filter((s: any) => s.date === todayStr)
                                        .reduce((acc: number, s: any) => acc + s.durationMinutes, 0);
                                    return todayMins;
                                })()}m
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <InteractiveFocusChart history={stats.history} />
                    </div>


                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};

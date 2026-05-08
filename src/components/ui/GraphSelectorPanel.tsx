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

    // Update position with viewport clamping
    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && triggerRef?.current && panelRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const triggerCenterY = triggerRect.top + triggerRect.height / 2;
                const panelHeight = panelRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;
                const margin = 20;
                
                let idealTop = triggerCenterY - panelHeight / 2;
                const minTop = margin;
                const maxTop = viewportHeight - panelHeight - margin;
                
                const finalTop = Math.max(minTop, Math.min(maxTop, idealTop));
                setYPos(`${finalTop}px`);
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
        }
    }, [isOpen, triggerRef]);

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
                    initial={{ opacity: 0, x: 40, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.98 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="task-selector-panel-mobile"
                    style={{
                        position: 'fixed',
                        right: '100px',
                        top: yPos,
                        width: 'var(--panel-width, 600px)',
                        maxWidth: 'calc(100vw - 40px)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '24px',
                        zIndex: 9999,
                        background: 'rgba(18, 18, 18, 0.85)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'calc(100vh - 40px)',
                        overflowY: 'auto',
                        overflowX: 'hidden'
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
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.today.score}m</div>
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

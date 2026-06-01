import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FocusCalendar } from '../calendar/FocusCalendar';

interface CalendarSelectorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}

export const CalendarSelectorPanel = ({ isOpen, onClose, triggerRef }: CalendarSelectorPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
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
    const [yPos, setYPos] = useState('50%');
    const [maxHeight, setMaxHeight] = useState('calc(100vh - 40px)');
    const [isPositioned, setIsPositioned] = useState(false);

    const isMobile = window.innerWidth <= 768;

    const motionProps = isMobile ? {
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
            const target = e.target as HTMLElement;
            const isOutsidePanel = panelRef.current && !panelRef.current.contains(target);
            const isNotTrigger = triggerRef?.current && !triggerRef.current.contains(target);
            const isModalClick = target.closest('.add-event-modal-container');
            
            if (isOutsidePanel && isNotTrigger && !isModalClick) {
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
                    {...motionProps}
                    animate={shouldReduceMotion ? undefined : { opacity: isPositioned ? 1 : 0, x: 0, scale: scale }}
                    className="calendar-selector-panel"
                    style={{
                        position: 'fixed',
                        right: `${92 * scale}px`,
                        top: yPos,
                        width: 'var(--panel-width, 380px)',
                        maxWidth: 'calc(100vw - 40px)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '12px',
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
                        transformOrigin: 'right center',
                        visibility: isPositioned ? 'visible' : 'hidden'
                    }}
                >


                    {/* Calendar Body */}
                    <div className="custom-scrollbar" style={{ 
                        flex: 1,
                        overflowY: 'auto',
                    }}>
                        <div style={{ width: '100%' }}>
                            <FocusCalendar />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};

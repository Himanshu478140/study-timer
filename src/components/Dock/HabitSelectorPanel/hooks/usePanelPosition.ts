import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to calculate position, scale factor, and bounds clamping.
 */
export const usePanelPosition = (
    isOpen: boolean,
    triggerRef: React.RefObject<HTMLDivElement | null> | undefined
) => {
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

    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && triggerRef?.current && panelRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const triggerCenterY = triggerRect.top + triggerRect.height / 2;
                const panelHeight = panelRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;
                const margin = 20;

                const maxUnscaledHeight = (viewportHeight - 2 * margin) / scale;
                const maxH = Math.max(200, maxUnscaledHeight);
                const currentHeight = Math.min(panelHeight, maxH);
                const offsetY = ((scale - 1) * currentHeight) / 2;
                const idealTop = triggerCenterY - currentHeight / 2;
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

    return {
        panelRef,
        yPos,
        maxHeight,
        isPositioned,
        scale
    };
};

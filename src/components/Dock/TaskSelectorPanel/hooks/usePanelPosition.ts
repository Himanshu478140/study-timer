import { useState, useEffect } from 'react';

interface PositionState {
    top: string;
    left: string;
    right: string;
    origin: string;
    maxHeight?: string;
}

export const usePanelPosition = (isOpen: boolean, triggerRef?: React.RefObject<HTMLDivElement | null>, panelRef?: React.RefObject<HTMLDivElement | null>) => {
    const [isPositioned, setIsPositioned] = useState(false);
    const [dimensions, setDimensions] = useState({
        scale: typeof window !== 'undefined' ? Math.max(0.5, Math.min(Math.min(window.innerHeight / 633, window.innerWidth / 850), 1.8)) : 1
    });
    const [position, setPosition] = useState<PositionState>({
        top: '50%',
        left: 'auto',
        right: '100px',
        origin: 'right center'
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

    const isPencilTrigger = (): boolean => {
        return !!(triggerRef?.current && (
            triggerRef.current.id === 'home-task-pencil-trigger' ||
            triggerRef.current.closest('#home-task-pencil-trigger') !== null
        ));
    };

    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && triggerRef?.current && panelRef?.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const panelWidth = panelRef.current.offsetWidth;
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;
                const margin = 20;

                if (isPencilTrigger()) {
                    const idealTop = triggerRect.bottom + 10;
                    const maxH = Math.max(200, viewportHeight - idealTop - margin);
                    let idealLeft = triggerRect.left + triggerRect.width / 2 - panelWidth / 2;
                    idealLeft = Math.max(margin, Math.min(viewportWidth - panelWidth - margin, idealLeft));

                    setPosition({
                        top: `${idealTop}px`,
                        left: `${idealLeft}px`,
                        right: 'auto',
                        origin: 'top center',
                        maxHeight: `${maxH}px`
                    });
                    setIsPositioned(true);
                } else {
                    const panelHeight = panelRef.current.offsetHeight;
                    const triggerCenterY = triggerRect.top + triggerRect.height / 2;
                    const maxUnscaledHeight = (viewportHeight - 2 * margin) / scale;
                    const maxH = Math.max(200, maxUnscaledHeight);
                    const currentHeight = Math.min(panelHeight, maxH);
                    const offsetY = ((scale - 1) * currentHeight) / 2;
                    let idealTop = triggerCenterY - currentHeight / 2;
                    const minTop = margin + offsetY;
                    const maxTop = viewportHeight - currentHeight - offsetY - margin;
                    const finalTop = Math.max(minTop, Math.min(maxTop, idealTop));

                    setPosition({
                        top: `${finalTop}px`,
                        left: 'auto',
                        right: `${92 * scale}px`,
                        origin: 'right center',
                        maxHeight: `${maxH}px`
                    });
                    setIsPositioned(true);
                }
            }
        };

        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            const observer = new ResizeObserver(() => {
                requestAnimationFrame(updatePosition);
            });
            if (panelRef?.current) observer.observe(panelRef.current);

            return () => {
                window.removeEventListener('resize', updatePosition);
                observer.disconnect();
            };
        } else {
            setIsPositioned(false);
        }
    }, [isOpen, triggerRef, panelRef, scale]);

    return { scale, position, isPositioned, isPencilTrigger: isPencilTrigger() };
};
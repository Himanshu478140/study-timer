import { useState, useEffect, useRef } from 'react';

interface UseAppLayoutProps {
    isNotepadOpen: boolean;
    notepadIconRef: React.RefObject<HTMLDivElement | null>;
}

export const useAppLayout = ({ isNotepadOpen, notepadIconRef }: UseAppLayoutProps) => {
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

    const notepadRef = useRef<HTMLDivElement>(null);
    const [notepadYPos, setNotepadYPos] = useState('50%');
    const [notepadMaxHeight, setNotepadMaxHeight] = useState('calc(100vh - 40px)');
    const [isNotepadPositioned, setIsNotepadPositioned] = useState(false);

    useEffect(() => {
        const updatePosition = () => {
            if (isNotepadOpen && notepadIconRef.current) {
                const triggerRect = notepadIconRef.current.getBoundingClientRect();
                const triggerCenterY = triggerRect.top + triggerRect.height / 2;
                const panelHeight = notepadRef.current ? notepadRef.current.offsetHeight : 340;
                const viewportHeight = window.innerHeight;
                const margin = 20;

                const maxUnscaledHeight = (viewportHeight - 2 * margin) / scale;
                const maxH = Math.max(200, maxUnscaledHeight);

                const currentHeight = Math.min(panelHeight, maxH);
                const offsetY = ((scale - 1) * currentHeight) / 2;

                let idealTop = triggerCenterY - currentHeight / 2;

                const minTop = margin + offsetY;
                const maxTop = viewportHeight - currentHeight - offsetY - margin;

                const finalTop = Math.max(minTop, Math.min(maxTop, idealTop));

                setNotepadYPos(`${finalTop}px`);
                setNotepadMaxHeight(`${maxH}px`);
                setIsNotepadPositioned(true);
            }
        };

        if (isNotepadOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);

            const observer = new ResizeObserver(() => {
                requestAnimationFrame(updatePosition);
            });
            if (notepadRef.current) {
                observer.observe(notepadRef.current);
            }

            return () => {
                window.removeEventListener('resize', updatePosition);
                observer.disconnect();
            };
        } else {
            setIsNotepadPositioned(false);
        }
    }, [isNotepadOpen, scale, notepadIconRef]);

    return {
        scale,
        notepadRef,
        notepadYPos,
        notepadMaxHeight,
        isNotepadPositioned
    };
};

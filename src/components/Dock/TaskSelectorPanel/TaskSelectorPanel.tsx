import './TaskSelectorPanel.css';
import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { usePanelPosition } from './hooks/usePanelPosition';
import { FocusPickerVariant } from './components/FocusPickerVariant';
import { FullPanelVariant } from './components/FullPanelVariant';
import type { TaskSelectorPanelProps } from './types';

export const TaskSelectorPanel = ({ isOpen, onClose, triggerRef }: TaskSelectorPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    
    // Position and scaling layout business logic
    const { scale, position, isPositioned, isPencilTrigger } = usePanelPosition(
        isOpen,
        triggerRef,
        panelRef
    );

    // Close the panel on clicking outside
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

    const variantProps = {
        isOpen,
        onClose,
        scale,
        isPositioned,
        position,
        panelRef
    };

    const content = (
        <AnimatePresence>
            {isOpen && (
                isPencilTrigger 
                    ? <FocusPickerVariant {...variantProps} /> 
                    : <FullPanelVariant {...variantProps} />
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};
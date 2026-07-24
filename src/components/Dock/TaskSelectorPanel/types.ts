import React from 'react';

export type TaskCategory = 'STUDY' | 'WORK' | 'PERSONAL' | 'CREATIVE' | 'OTHER';

export interface Task {
    id: string;
    text: string;
    category: string;
    completed: boolean;
    estimatedMinutes?: number;
    completedAt?: string | null;
}

export interface TaskSelectorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}

export interface CategoryDropdownProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export interface VariantProps {
    isOpen: boolean;
    onClose: () => void;
    scale: number;
    isPositioned: boolean;
    position: {
        top: string;
        left: string;
        right: string;
        origin: string;
        maxHeight?: string;
    };
    panelRef: React.RefObject<HTMLDivElement | null>;
}
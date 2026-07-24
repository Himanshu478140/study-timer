import React from 'react';
import { FlaskConical, Briefcase, Heart, Palette, Code2 } from 'lucide-react';
import type { TaskCategory } from './types';

export const CATEGORIES: readonly TaskCategory[] = ['STUDY', 'WORK', 'PERSONAL', 'CREATIVE', 'OTHER'] as const;

export const getCategoryIcon = (category?: string): React.JSX.Element => {
    switch (category?.toUpperCase()) {
        case 'STUDY': return React.createElement(FlaskConical, { size: 18 });
        case 'WORK': return React.createElement(Briefcase, { size: 18 });
        case 'PERSONAL': return React.createElement(Heart, { size: 18 });
        case 'CREATIVE': return React.createElement(Palette, { size: 18 });
        default: return React.createElement(Code2, { size: 18 });
    }
};

export const getCategoryIconClass = (category?: string): string => {
    switch (category?.toUpperCase()) {
        case 'STUDY': return 'focus-picker__cat-icon--study';
        case 'WORK': return 'focus-picker__cat-icon--work';
        case 'PERSONAL': return 'focus-picker__cat-icon--personal';
        case 'CREATIVE': return 'focus-picker__cat-icon--creative';
        default: return 'focus-picker__cat-icon--other';
    }
};

export const getCategoryClass = (category?: string): string => {
    switch (category?.toUpperCase()) {
        case 'STUDY': return 'task-panel__badge--study';
        case 'WORK': return 'task-panel__badge--work';
        case 'PERSONAL': return 'task-panel__badge--personal';
        case 'CREATIVE': return 'task-panel__badge--creative';
        default: return 'task-panel__badge--other';
    }
};

export const formatTime = (minutes?: number): string => {
    if (!minutes) return '';
    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${minutes}m`;
};

export const getSubtitle = (task: { estimatedMinutes?: number; category?: string }): string => {
    if (task.estimatedMinutes) return `${task.estimatedMinutes} min session`;
    return task.category ? task.category.charAt(0) + task.category.slice(1).toLowerCase() : 'Focus task';
};
export interface HabitSelectorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
}

export interface WeekDayInfo {
    dateStr: string;
    dayName: string;
    isToday: boolean;
}

export interface HeatmapCell {
    date: string;
    level: number;
    completedCount?: number;
    totalHabits?: number;
}

export interface HabitStats {
    streak: number;
    completionRate: number;
    totalDaysActive: number;
}

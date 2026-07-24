export interface FocusTask {
    id: string;
    text: string;
    completed: boolean;
    category?: string;        // e.g. "STUDY", "WORK", "PERSONAL"
    estimatedMinutes?: number; // e.g. 45
    completedAt?: string | null; // ISO Date String
    isDeleted?: boolean; // Soft delete for stats
    timeSpent?: number; // Total time in ms
    lastActiveStart?: number; // Timestamp when it became active
}

export interface TaskManagerContextType {
    tasks: FocusTask[];
    allTasks: FocusTask[]; // LIVE + DELETED (For Stats)
    activeTaskId: string | null;
    setActiveTaskId: (id: string | null) => void;
    addTask: (text: string, category?: string, estimatedMinutes?: number) => string;
    toggleTask: (id: string) => void;
    removeTask: (id: string) => void;
    clearCompleted: () => void;
    reorderTasks: (newTasks: FocusTask[]) => void;
    addTaskTime: (id: string, ms: number) => void;
}

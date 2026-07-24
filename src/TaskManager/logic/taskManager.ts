import type { FocusTask } from '../types/focusTask';

/** Create a new task object */
export const createTask = (
    text: string,
    category?: string,
    estimatedMinutes?: number
): FocusTask => ({
    id: Date.now().toString(),
    text,
    completed: false,
    category: category || undefined,
    estimatedMinutes: estimatedMinutes || undefined,
    completedAt: null,
    isDeleted: false,
    timeSpent: 0
});

/** Toggle a task's completion status. Returns updated tasks + whether it was just completed */
export const toggleTaskCompletion = (
    tasks: FocusTask[],
    id: string
): { tasks: FocusTask[]; justCompleted: boolean } => {
    let justCompleted = false;
    const updatedTasks = tasks.map(t => {
        if (t.id === id) {
            const isNowCompleted = !t.completed;
            justCompleted = isNowCompleted;
            return {
                ...t,
                completed: isNowCompleted,
                completedAt: isNowCompleted ? new Date().toISOString() : null
            };
        }
        return t;
    });
    return { tasks: updatedTasks, justCompleted };
};

/** Add tracked time (ms) to a task */
export const addTimeToTask = (
    tasks: FocusTask[],
    id: string,
    ms: number
): FocusTask[] => {
    return tasks.map(t => {
        if (t.id === id) {
            return { ...t, timeSpent: (t.timeSpent || 0) + ms };
        }
        return t;
    });
};

/** Soft-delete a single task by ID */
export const softDeleteTask = (
    tasks: FocusTask[],
    id: string
): FocusTask[] => {
    return tasks.map(t => {
        if (t.id === id) return { ...t, isDeleted: true };
        return t;
    });
};

/** Soft-delete all completed tasks */
export const softDeleteCompleted = (tasks: FocusTask[]): FocusTask[] => {
    return tasks.map(t => {
        if (t.completed) return { ...t, isDeleted: true };
        return t;
    });
};

/** Merge a reordered set of visible tasks with existing deleted tasks */
export const mergeReorderedTasks = (
    newOrder: FocusTask[],
    allTasks: FocusTask[]
): FocusTask[] => {
    const deletedTasks = allTasks.filter(t => t.isDeleted);
    return [...newOrder, ...deletedTasks];
};

/** Filter out soft-deleted tasks */
export const getVisibleTasks = (tasks: FocusTask[]): FocusTask[] => {
    return tasks.filter(t => !t.isDeleted);
};

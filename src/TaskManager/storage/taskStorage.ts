import type { FocusTask } from '../types/focusTask';

const TASKS_KEY = 'focus-tasks';
const ACTIVE_TASK_KEY = 'focus-active-task-id';
const RETENTION_MONTHS = 6;

/** Load tasks from localStorage with 6-month retention policy for deleted tasks */
export const loadTasks = (): FocusTask[] => {
    const savedTasks = localStorage.getItem(TASKS_KEY);
    if (savedTasks) {
        try {
            const parsed = JSON.parse(savedTasks);
            if (Array.isArray(parsed)) {
                const cutoff = new Date();
                cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);

                return parsed.filter((t: FocusTask) => {
                    if (!t.isDeleted) return true;
                    if (!t.completedAt) return false;
                    return new Date(t.completedAt) > cutoff;
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
    return [];
};

/** Load the active task ID from localStorage */
export const loadActiveTaskId = (): string | null => {
    return localStorage.getItem(ACTIVE_TASK_KEY);
};

/** Save tasks array to localStorage */
export const saveTasks = (tasks: FocusTask[]): void => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

/** Save or clear the active task ID in localStorage */
export const saveActiveTaskId = (id: string | null): void => {
    if (id) localStorage.setItem(ACTIVE_TASK_KEY, id);
    else localStorage.removeItem(ACTIVE_TASK_KEY);
};

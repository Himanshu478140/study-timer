import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useGamification } from '../hooks/useGamification';

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

interface FocusTaskContextType {
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

const FocusTaskContext = createContext<FocusTaskContextType | undefined>(undefined);

export const FocusTaskProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<FocusTask[]>(() => {
        const savedTasks = localStorage.getItem('focus-tasks');
        if (savedTasks) {
            try {
                const parsed = JSON.parse(savedTasks);
                if (Array.isArray(parsed)) {
                    // 6-MONTH RETENTION POLICY
                    const sixMonthsAgo = new Date();
                    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

                    return parsed.filter((t: FocusTask) => {
                        if (!t.isDeleted) return true;
                        if (!t.completedAt) return false;
                        return new Date(t.completedAt) > sixMonthsAgo;
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
        return [];
    });

    const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
        return localStorage.getItem('focus-active-task-id');
    });

    const { awardXP } = useGamification();

    // Persist to LocalStorage
    useEffect(() => {
        localStorage.setItem('focus-tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        if (activeTaskId) localStorage.setItem('focus-active-task-id', activeTaskId);
        else localStorage.removeItem('focus-active-task-id');
    }, [activeTaskId]);

    const handleSetActiveTask = (newId: string | null) => {
        setActiveTaskId(newId);
    };

    const addTask = (text: string, category?: string, estimatedMinutes?: number) => {
        const newTask: FocusTask = {
            id: Date.now().toString(),
            text,
            completed: false,
            category: category || undefined,
            estimatedMinutes: estimatedMinutes || undefined,
            completedAt: null,
            isDeleted: false,
            timeSpent: 0
        };
        setTasks(prev => [...prev, newTask]);

        if (tasks.length === 0) handleSetActiveTask(newTask.id);
        return newTask.id;
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                const isNowCompleted = !t.completed;
                if (isNowCompleted) {
                    awardXP(10, 'task');
                }
                const updatedTask = {
                    ...t,
                    completed: isNowCompleted,
                    completedAt: isNowCompleted ? new Date().toISOString() : null
                };
                return updatedTask;
            }
            return t;
        }));
    };

    const addTaskTime = (id: string, ms: number) => {
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                const updatedTask = {
                    ...t,
                    timeSpent: (t.timeSpent || 0) + ms
                };
                return updatedTask;
            }
            return t;
        }));
    };

    const removeTask = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                const updatedTask = { ...t, isDeleted: true };
                return updatedTask;
            }
            return t;
        }));
        if (activeTaskId === id) handleSetActiveTask(null);
    };

    const clearCompleted = () => {
        setTasks(prev => prev.map(t => {
            if (t.completed) {
                const updatedTask = { ...t, isDeleted: true };
                return updatedTask;
            }
            return t;
        }));
        const activeTask = tasks.find(t => t.id === activeTaskId);
        if (activeTask?.completed) handleSetActiveTask(null);
    };

    const reorderTasks = (newTasks: FocusTask[]) => {
        setTasks(prev => {
            // Merge the new order of non-deleted tasks with existing deleted tasks
            const deletedTasks = prev.filter(t => t.isDeleted);
            return [...newTasks, ...deletedTasks];
        });
    };

    return (
        <FocusTaskContext.Provider value={{
            tasks: tasks.filter(t => !t.isDeleted),
            allTasks: tasks,
            activeTaskId,
            setActiveTaskId: handleSetActiveTask,
            addTask,
            toggleTask,
            removeTask,
            clearCompleted,
            reorderTasks,
            addTaskTime
        }}>
            {children}
        </FocusTaskContext.Provider>
    );
};

export const useFocusTaskContext = () => {
    const context = useContext(FocusTaskContext);
    if (!context) throw new Error('useFocusTaskContext must be used within a FocusTaskProvider');
    return context;
};

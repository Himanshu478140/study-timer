import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useCloudSync } from './CloudSyncContext';
import {
    syncCollectionItem,
    loadCollection,
    cleanupOldData
} from '../utils/syncUtils';

export interface FocusTask {
    id: string;
    text: string;
    completed: boolean;
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
    addTask: (text: string) => string;
    toggleTask: (id: string) => void;
    removeTask: (id: string) => void;
    clearCompleted: () => void;
}

const FocusTaskContext = createContext<FocusTaskContextType | undefined>(undefined);

export const FocusTaskProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useCloudSync();


    const [tasks, setTasks] = useState<FocusTask[]>([]);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    // Initial Load from LocalStorage (Guest Mode)
    useEffect(() => {
        const savedTasks = localStorage.getItem('focus-tasks');
        if (savedTasks) {
            try {
                const parsed = JSON.parse(savedTasks);
                if (Array.isArray(parsed)) {
                    // 30-DAY RETENTION POLICY
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                    const cleanTasks = parsed.filter((t: FocusTask) => {
                        if (!t.isDeleted) return true;
                        if (!t.completedAt) return false;
                        return new Date(t.completedAt) > thirtyDaysAgo;
                    });
                    setTasks(cleanTasks);
                }
            } catch (e) { console.error(e); }
        } else {
            setTasks([]);
        }

        const savedActiveId = localStorage.getItem('focus-active-task-id');
        if (savedActiveId) setActiveTaskId(savedActiveId);
    }, []);

    // Initial Cloud Sync
    useEffect(() => {
        if (!user) return;

        const syncFromCloud = async () => {
            console.log("Cloud Sync: Syncing Tasks...");
            await cleanupOldData(user.uid, 'tasks', 'completedAt');

            const cloudTasks = await loadCollection(user.uid, 'tasks') as FocusTask[];

            setTasks(prev => {
                const merged = [...cloudTasks];
                prev.forEach(local => {
                    if (!merged.find(c => c.id === local.id)) {
                        merged.push(local);
                        syncCollectionItem(user.uid, 'tasks', local.id, local);
                    }
                });
                return merged;
            });
        };

        syncFromCloud();
    }, [user]);

    // Persist to LocalStorage
    useEffect(() => {
        localStorage.setItem('focus-tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        if (activeTaskId) localStorage.setItem('focus-active-task-id', activeTaskId);
        else localStorage.removeItem('focus-active-task-id');
    }, [activeTaskId]);

    const handleSetActiveTask = (newId: string | null) => {
        const now = Date.now();
        setTasks(prev => {
            const updated = prev.map(t => {
                if (t.id === activeTaskId && t.lastActiveStart) {
                    const updatedTask = {
                        ...t,
                        timeSpent: (t.timeSpent || 0) + (now - t.lastActiveStart),
                        lastActiveStart: undefined
                    };
                    if (user) syncCollectionItem(user.uid, 'tasks', t.id, updatedTask);
                    return updatedTask;
                }
                if (t.id === newId) {
                    const updatedTask = { ...t, lastActiveStart: now };
                    if (user) syncCollectionItem(user.uid, 'tasks', t.id, updatedTask);
                    return updatedTask;
                }
                return t;
            });
            return updated;
        });
        setActiveTaskId(newId);
    };

    const addTask = (text: string) => {
        const newTask: FocusTask = {
            id: Date.now().toString(),
            text,
            completed: false,
            completedAt: null,
            isDeleted: false,
            timeSpent: 0
        };
        setTasks(prev => [...prev, newTask]);
        if (user) syncCollectionItem(user.uid, 'tasks', newTask.id, newTask);

        if (tasks.length === 0) handleSetActiveTask(newTask.id);
        return newTask.id;
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                const isNowCompleted = !t.completed;
                const now = Date.now();
                let additionalTime = 0;
                if (isNowCompleted && t.id === activeTaskId && t.lastActiveStart) {
                    additionalTime = now - t.lastActiveStart;
                }

                const updatedTask = {
                    ...t,
                    completed: isNowCompleted,
                    completedAt: isNowCompleted ? new Date().toISOString() : null,
                    timeSpent: (t.timeSpent || 0) + additionalTime,
                    lastActiveStart: undefined
                };
                if (user) syncCollectionItem(user.uid, 'tasks', id, updatedTask);
                return updatedTask;
            }
            return t;
        }));
    };

    const removeTask = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                const updatedTask = { ...t, isDeleted: true };
                if (user) syncCollectionItem(user.uid, 'tasks', id, updatedTask);
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
                if (user) syncCollectionItem(user.uid, 'tasks', t.id, updatedTask);
                return updatedTask;
            }
            return t;
        }));
        const activeTask = tasks.find(t => t.id === activeTaskId);
        if (activeTask?.completed) handleSetActiveTask(null);
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
            clearCompleted
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

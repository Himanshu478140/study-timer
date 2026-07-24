import { useState, useEffect, type ReactNode } from 'react';
import { useGamification } from '../../components/Gamification/useGamification';
import { TaskManagerContext } from './TaskManagerContext';
import { loadTasks, loadActiveTaskId, saveTasks, saveActiveTaskId } from '../storage/taskStorage';
import {
    createTask,
    toggleTaskCompletion,
    addTimeToTask,
    softDeleteTask,
    softDeleteCompleted,
    mergeReorderedTasks,
    getVisibleTasks
} from '../logic/taskManager';
import type { FocusTask } from '../types/focusTask';

export const TaskManagerProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<FocusTask[]>(loadTasks);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(loadActiveTaskId);
    const { awardXP } = useGamification();

    // Persist to localStorage on change
    useEffect(() => { saveTasks(tasks); }, [tasks]);
    useEffect(() => { saveActiveTaskId(activeTaskId); }, [activeTaskId]);

    const addTask = (text: string, category?: string, estimatedMinutes?: number) => {
        const newTask = createTask(text, category, estimatedMinutes);
        setTasks(prev => [...prev, newTask]);
        if (tasks.length === 0) setActiveTaskId(newTask.id);
        return newTask.id;
    };

    const toggleTask = (id: string) => {
        setTasks(prev => {
            const result = toggleTaskCompletion(prev, id);
            if (result.justCompleted) awardXP(10, 'task'); // Gamification cross-cut
            return result.tasks;
        });
    };

    const addTaskTimeHandler = (id: string, ms: number) => {
        setTasks(prev => addTimeToTask(prev, id, ms));
    };

    const removeTask = (id: string) => {
        setTasks(prev => softDeleteTask(prev, id));
        if (activeTaskId === id) setActiveTaskId(null);
    };

    const clearCompleted = () => {
        setTasks(prev => softDeleteCompleted(prev));
        const activeTask = tasks.find(t => t.id === activeTaskId);
        if (activeTask?.completed) setActiveTaskId(null);
    };

    const reorderTasks = (newTasks: FocusTask[]) => {
        setTasks(prev => mergeReorderedTasks(newTasks, prev));
    };

    return (
        <TaskManagerContext.Provider value={{
            tasks: getVisibleTasks(tasks),
            allTasks: tasks,
            activeTaskId,
            setActiveTaskId,
            addTask,
            toggleTask,
            removeTask,
            clearCompleted,
            reorderTasks,
            addTaskTime: addTaskTimeHandler
        }}>
            {children}
        </TaskManagerContext.Provider>
    );
};

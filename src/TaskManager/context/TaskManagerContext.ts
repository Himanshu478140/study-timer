import { createContext, useContext } from 'react';
import type { TaskManagerContextType } from '../types/focusTask';

export const TaskManagerContext = createContext<TaskManagerContextType | undefined>(undefined);

export const useTaskManager = () => {
    const context = useContext(TaskManagerContext);
    if (!context) throw new Error('useTaskManager must be used within a TaskManagerProvider');
    return context;
};

import { useFocusTaskContext } from '../context/FocusTaskContext';
import type { FocusTask } from '../context/FocusTaskContext';

export type { FocusTask };

export const useFocusTask = () => {
    return useFocusTaskContext();
};

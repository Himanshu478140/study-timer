
/**
 * Formats seconds into MM:SS string
 * @param seconds Total seconds
 * @returns string formatted as "MM:SS"
 */
export const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Calculates percentage of time remaining
 * @param current Current seconds
 * @param total Total seconds
 * @returns number 0-100
 */
export const calculateProgress = (current: number, total: number): number => {
    if (total === 0) return 0;
    return ((total - current) / total) * 100;
};

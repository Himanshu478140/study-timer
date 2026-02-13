import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface UseTimerProps {
    initialTime: number; // in seconds
    onComplete?: () => void;
    onTick?: (timeLeft: number) => void;
    isStopwatch?: boolean;
}

export const useTimer = ({ initialTime, onComplete, onTick, isStopwatch = false }: UseTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [status, setStatus] = useState<TimerStatus>('idle');
    const timerRef = useRef<number | null>(null);
    const onCompleteRef = useRef(onComplete);

    // Keep onComplete ref up to date
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(initialTime);
        setStatus('idle');
    }, [initialTime, isStopwatch]);

    const onTickRef = useRef(onTick);

    // Keep onTick ref up to date
    useEffect(() => {
        onTickRef.current = onTick;
    }, [onTick]);

    const tick = useCallback(() => {
        setTimeLeft((prev) => {
            const nextValue = isStopwatch ? prev + 1 : prev - 1;

            if (!isStopwatch && prev <= 1) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setStatus('completed');
                onCompleteRef.current?.();
                return 0;
            }

            onTickRef.current?.(nextValue);
            return nextValue;
        });
    }, [isStopwatch]);

    const start = useCallback(() => {
        if (status === 'running' || timerRef.current) return;
        setStatus('running');
        timerRef.current = setInterval(tick, 1000);
    }, [status, tick]);

    const pause = useCallback(() => {
        if (status !== 'running') return;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setStatus('paused');
    }, [status]);

    const reset = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTimeLeft(initialTime);
        setStatus('idle');
    }, [initialTime]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return {
        timeLeft,
        status,
        start,
        pause,
        reset,
        setTimeLeft, // Allow manual adjustment if needed
        setTimerStatus: setStatus,
    };
};

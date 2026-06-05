import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface UseTimerProps {
    initialTime: number; // in seconds
    onComplete?: () => void;
    onTick?: (timeLeft: number) => void;
    isStopwatch?: boolean;
}

export const useTimer = ({ initialTime, onComplete, onTick, isStopwatch = false }: UseTimerProps) => {
    const [status, setStatus] = useState<TimerStatus>('idle');
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const endTimeRef = useRef<number | null>(null);
    const onCompleteRef = useRef(onComplete);
    const onTickRef = useRef(onTick);

    const [timeLeft, setTimeLeftState] = useState(initialTime);
    const timeLeftRef = useRef(initialTime);

    const setTimeLeft = useCallback((time: number | ((prev: number) => number)) => {
        if (typeof time === 'function') {
            setTimeLeftState((prev) => {
                const nextVal = time(prev);
                timeLeftRef.current = nextVal;
                return nextVal;
            });
        } else {
            timeLeftRef.current = time;
            setTimeLeftState(time);
        }
    }, []);

    // Keep onComplete ref up to date
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Keep onTick ref up to date
    useEffect(() => {
        onTickRef.current = onTick;
    }, [onTick]);

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        startTimeRef.current = null;
        endTimeRef.current = null;
        setTimeLeft(initialTime);
        setStatus('idle');
    }, [initialTime, isStopwatch, setTimeLeft]);

    const tick = useCallback(() => {
        const now = Date.now();
        if (isStopwatch) {
            if (startTimeRef.current !== null) {
                const elapsed = Math.max(0, Math.round((now - startTimeRef.current) / 1000));
                setTimeLeft(elapsed);
                onTickRef.current?.(elapsed);
            }
        } else {
            if (endTimeRef.current !== null) {
                const remaining = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
                setTimeLeft(remaining);
                onTickRef.current?.(remaining);

                if (remaining <= 0) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    setStatus('completed');
                    onCompleteRef.current?.();
                }
            }
        }
    }, [isStopwatch, setTimeLeft]);

    const start = useCallback(() => {
        if (status === 'running') return;
        
        const now = Date.now();
        if (isStopwatch) {
            startTimeRef.current = now - timeLeftRef.current * 1000;
        } else {
            endTimeRef.current = now + timeLeftRef.current * 1000;
        }
        
        setStatus('running');
        timerRef.current = setInterval(tick, 1000);
    }, [status, isStopwatch, tick]);

    const pause = useCallback(() => {
        if (status !== 'running') return;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        const now = Date.now();
        if (isStopwatch) {
            if (startTimeRef.current !== null) {
                const elapsed = Math.max(0, Math.round((now - startTimeRef.current) / 1000));
                setTimeLeft(elapsed);
            }
        } else {
            if (endTimeRef.current !== null) {
                const remaining = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
                setTimeLeft(remaining);
            }
        }
        
        startTimeRef.current = null;
        endTimeRef.current = null;
        setStatus('paused');
    }, [status, isStopwatch, setTimeLeft]);

    const reset = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        startTimeRef.current = null;
        endTimeRef.current = null;
        setTimeLeft(initialTime);
        setStatus('idle');
    }, [initialTime, setTimeLeft]);

    // Handle visibility change to update clock immediately
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && status === 'running') {
                tick();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [status, tick]);

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
        setTimeLeft,
        setTimerStatus: setStatus,
    };
};

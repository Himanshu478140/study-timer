import { useState, useEffect, useRef } from 'react';

interface FlipUnitProps {
    digit: number;
    shuffle?: boolean;
}

export const FlipUnit = ({ digit }: FlipUnitProps) => {
    const [current, setCurrent] = useState(digit);
    const [next, setNext] = useState(digit);
    const [flipping, setFlipping] = useState(false);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (digit !== current) {
            setNext(digit);
            setFlipping(true);

            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                setCurrent(digit);
                setFlipping(false);
            }, 600); // Match CSS animation duration
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [digit, current]);

    return (
        <div className={`flip-unit ${flipping ? 'flipping' : ''}`}>
            {/* Upper part of the card (Static, showing next value) */}
            <div className="top-next">
                <span>{next}</span>
            </div>

            {/* Upper part of the card (Animated, showing current value) */}
            <div className="top">
                <span>{current}</span>
            </div>

            {/* Lower part of the card (Animated, showing next value) */}
            <div className="bottom-next">
                <span>{next}</span>
            </div>

            {/* Lower part of the card (Static, showing current value) */}
            <div className="bottom">
                <span>{current}</span>
            </div>

            <div className="shadow"></div>
        </div>
    );
};

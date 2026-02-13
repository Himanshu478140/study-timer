import { useState, useEffect } from 'react';
import './SimpleFlip.css';

interface SimpleFlipProps {
    value1: number;
    value2: number;
}

const Digit = ({ value }: { value: number }) => {
    const [prevValue, setPrevValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (value !== prevValue) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setPrevValue(value);
                setIsAnimating(false);
            }, 400); // Match CSS animation duration
            return () => clearTimeout(timer);
        }
    }, [value, prevValue]);

    return (
        <div className="simple-flip-digit">
            <div className={`digit-container ${isAnimating ? 'animating' : ''}`}>
                <div className="digit-current">{prevValue}</div>
                <div className="digit-next">{value}</div>
            </div>
        </div>
    );
};

export const SimpleFlip = ({ value1, value2 }: SimpleFlipProps) => {
    const v1_1 = Math.floor(value1 / 10);
    const v1_2 = value1 % 10;
    const v2_1 = Math.floor(value2 / 10);
    const v2_2 = value2 % 10;

    return (
        <div className="simple-flip-clock">
            <div className="simple-flip-group">
                <Digit value={v1_1} />
                <Digit value={v1_2} />
            </div>
            <div className="simple-flip-separator">:</div>
            <div className="simple-flip-group">
                <Digit value={v2_1} />
                <Digit value={v2_2} />
            </div>
        </div>
    );
};

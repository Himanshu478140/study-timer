import { FlipUnit } from './FlipUnit';
import './FlipClock.css';

interface FlipClockProps {
    value1: number;
    value2: number;
}

export const FlipClock = ({ value1, value2 }: FlipClockProps) => {
    const v1_1 = Math.floor(value1 / 10);
    const v1_2 = value1 % 10;
    const v2_1 = Math.floor(value2 / 10);
    const v2_2 = value2 % 10;

    return (
        <div className="flip-clock">
            <div className="flip-group">
                <FlipUnit digit={v1_1} />
                <FlipUnit digit={v1_2} />
            </div>

            <div className="flip-separator">:</div>

            <div className="flip-group">
                <FlipUnit digit={v2_1} />
                <FlipUnit digit={v2_2} />
            </div>
        </div>
    );
};

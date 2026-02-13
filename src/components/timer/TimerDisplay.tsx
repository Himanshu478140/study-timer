import { formatTime } from '../../utils/time';
import { FlipClock } from './FlipClock';
import { SimpleFlip } from './SimpleFlip';
import './timer.css';

interface TimerDisplayProps {
    seconds: number;
    style?: React.CSSProperties;
    className?: string;
    font?: string;
    isFullscreen?: boolean;
    // Props passed but not used for alignment with layout
    active?: boolean;
    timeLeft?: number;
    mode?: string;
}

export const TimerDisplay = ({
    seconds, style, className, font, isFullscreen
}: TimerDisplayProps) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

            {font === 'flip' ? (
                <div className={className} style={{ ...style, fontSize: undefined, transform: undefined }}>
                    <FlipClock
                        value1={Math.floor(seconds / 60)}
                        value2={seconds % 60}
                    />
                </div>
            ) : font === 'simple-flip' ? (
                <div className={className} style={{ ...style, fontSize: undefined, transform: undefined }}>
                    <SimpleFlip
                        value1={Math.floor(seconds / 60)}
                        value2={seconds % 60}
                    />
                </div>
            ) : (
                <div className={isFullscreen ? 'clock-glass animate-breathing' : ''}>
                    <div className={`timer-display ${className || ''} font-${font || 'default'}`} style={style}>
                        {formatTime(seconds)}
                    </div>
                </div>
            )}
        </div>
    );
};

import { Coffee, RotateCcw } from 'lucide-react';
import './BreakPromptModal.css';

interface BreakPromptModalProps {
    isOpen: boolean;
    breakTime: number;
    onTakeBreak: () => void;
    onSkipBreak: () => void;
}

export const BreakPromptModal = ({ isOpen, breakTime, onTakeBreak, onSkipBreak }: BreakPromptModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="break-modal-overlay">
            <div className="break-modal-content">
                <div className="break-icon-wrapper">
                    <Coffee size={40} color="#fff" />
                </div>

                <h2>Session Complete!</h2>
                <p>Great focus. Time to recharge your brain?</p>

                <div className="break-actions">
                    <button
                        className="break-btn primary"
                        onClick={onTakeBreak}
                    >
                        <Coffee size={18} />
                        Start {breakTime}m Break
                    </button>

                    <button
                        className="break-btn secondary"
                        onClick={onSkipBreak}
                    >
                        <RotateCcw size={18} />
                        Skip & Start Next Session
                    </button>
                </div>
            </div>
        </div>
    );
};

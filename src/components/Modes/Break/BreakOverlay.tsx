import { BreakPromptModal } from './BreakPromptModal';

interface BreakOverlayProps {
    isOpen: boolean;
    breakTime: number;
    onTakeBreak: () => void;
    onSkipBreak: () => void;
}

export const BreakOverlay = ({
    isOpen,
    breakTime,
    onTakeBreak,
    onSkipBreak
}: BreakOverlayProps) => {
    return (
        <BreakPromptModal
            isOpen={isOpen}
            breakTime={breakTime}
            onTakeBreak={onTakeBreak}
            onSkipBreak={onSkipBreak}
        />
    );
};

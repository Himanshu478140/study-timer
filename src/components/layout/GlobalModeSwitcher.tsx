import { Leaf, Home, Moon } from 'lucide-react';
import { Dock, DockIcon } from '../ui/Dock';

export type AppMode = 'focus' | 'home' | 'zen';

interface GlobalModeSwitcherProps {
    currentMode: AppMode;
    onModeChange: (mode: AppMode) => void;
}

export const GlobalModeSwitcher = ({ currentMode, onModeChange }: GlobalModeSwitcherProps) => {
    const modes: { id: AppMode; label: string; icon: any }[] = [
        { id: 'focus', label: 'Focus Timer', icon: Leaf },
        { id: 'home', label: 'Home Dashboard', icon: Home },
        { id: 'zen', label: 'Zen Clock', icon: Moon },
    ];

    return (
        <div className="global-mode-switcher-container">
            <Dock>
                {(mouseX) => (
                    modes.map((mode) => (
                        <DockIcon
                            key={mode.id}
                            mouseX={mouseX}
                            label={mode.label}
                            isActive={currentMode === mode.id}
                            onClick={() => onModeChange(mode.id)}
                        >
                            <mode.icon size={24} />
                        </DockIcon>
                    ))
                )}
            </Dock>
        </div>
    );
};

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { Brain, Clock, Coffee, Zap, Sliders } from 'lucide-react';
import './modes.css';

export type FocusMode = 'deep_work' | 'pomodoro' | 'flow' | 'ambient' | 'custom';

interface ModeSelectorProps {
    currentMode: FocusMode;
    onModeChange: (mode: FocusMode) => void;
}

const MagnifiedButton = ({
    mouseX,
    id,
    label,
    icon,
    isActive,
    onClick
}: {
    mouseX: MotionValue,
    id: string,
    label: string,
    icon: React.ReactNode,
    isActive: boolean,
    onClick: () => void
}) => {
    const ref = useRef<HTMLButtonElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const scaleTransform = useTransform(distance, [-150, 0, 150], [1, 1.15, 1]);
    const scale = useSpring(scaleTransform, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <button
            ref={ref}
            key={id}
            className={`mode-btn flex-center ${isActive ? 'active' : ''} interactive-press`}
            onClick={onClick}
            style={{
                gap: '6px',
                position: 'relative',
                zIndex: 1,
                background: isActive ? 'transparent' : undefined,
                backdropFilter: isActive ? 'none' : undefined,
                WebkitBackdropFilter: isActive ? 'none' : undefined,
                border: isActive ? '1px solid transparent' : undefined
            }}
        >
            <motion.div
                style={{ scale, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
                {icon}
                <span>{label}</span>
            </motion.div>
        </button>
    );
};

export const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
    const selectorRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const mouseX = useMotionValue(Infinity);

    const modes: { id: FocusMode; label: string; icon: React.ReactNode }[] = [
        { id: 'deep_work', label: 'Deep Work', icon: <Brain size={16} /> },
        { id: 'pomodoro', label: 'Pomodoro', icon: <Clock size={16} /> },
        { id: 'flow', label: '52/17', icon: <Coffee size={16} /> },
        { id: 'ambient', label: 'Ambient', icon: <Zap size={16} /> },
        { id: 'custom', label: 'Custom', icon: <Sliders size={16} /> },
    ];

    useEffect(() => {
        const updateIndicator = () => {
            const activeBtn = selectorRef.current?.querySelector('.mode-btn.active') as HTMLElement;
            if (activeBtn && selectorRef.current) {
                const selectorRect = selectorRef.current.getBoundingClientRect();
                const btnRect = activeBtn.getBoundingClientRect();

                setIndicatorStyle({
                    left: btnRect.left - selectorRect.left,
                    width: btnRect.width,
                    opacity: 1
                });
            }
        };

        const timer = setTimeout(updateIndicator, 50); // Small delay for layout stabilization
        window.addEventListener('resize', updateIndicator);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateIndicator);
        };
    }, [currentMode]);

    return (
        <div
            ref={selectorRef}
            className="mode-selector"
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            style={{
                position: 'relative',
                background: `linear-gradient(135deg, 
                    var(--color-glass-bg), 
                    rgba(var(--color-accent-rgb), var(--glass-tint-strength)))`,
                display: 'flex',
                alignItems: 'center',
                padding: '5px'
            }}
        >
            <div
                className="mode-indicator"
                style={{
                    position: 'absolute',
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    opacity: indicatorStyle.opacity,
                    height: 'calc(100% - 10px)',
                    top: '5px',
                    background: 'var(--color-accent)',
                    borderRadius: '1.5rem',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(var(--color-accent-rgb), 0.2)',
                    zIndex: 0
                }}
            />
            {modes.map((mode) => (
                <MagnifiedButton
                    key={mode.id}
                    mouseX={mouseX}
                    id={mode.id}
                    label={mode.label}
                    icon={mode.icon}
                    isActive={currentMode === mode.id}
                    onClick={() => onModeChange(mode.id)}
                />
            ))}
        </div>
    );
};

import React, { useRef } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    MotionValue,
} from "framer-motion";
import "./Dock.css";

interface DockIconProps {
    children: React.ReactNode;
    mouseX: MotionValue;
    label?: string;
    isActive?: boolean;
    onClick?: () => void;
}

const DockIcon = ({ children, mouseX, label, isActive, onClick }: DockIconProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    // Enhanced magnification range for a more 'magnetic' pull
    const sizeTransform = useTransform(distance, [-150, 0, 150], [42, 64, 42]);

    const size = useSpring(sizeTransform, {
        mass: 0.1,
        stiffness: 120, // Slightly softer for more 'organic' feel
        damping: 15,
    });

    return (
        <motion.div
            ref={ref}
            style={{ width: size, height: size }}
            onClick={onClick}
            whileTap={{ scale: 0.92 }} // Tactile feedback
            className={`dock-icon-wrapper ${isActive ? "active" : ""}`}
        >
            <motion.div style={{ scale: useTransform(size, [42, 64], [1, 1.2]) }}>
                {children}
            </motion.div>
            {label && <div className="dock-tooltip">{label}</div>}
        </motion.div>
    );
};

interface DockProps {
    children: (mouseX: MotionValue) => React.ReactNode;
}

export const Dock = ({ children }: DockProps) => {
    const mouseX = useMotionValue(Infinity);

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="dock-container"
        >
            {children(mouseX)}
        </motion.div>
    );
};

export { DockIcon };

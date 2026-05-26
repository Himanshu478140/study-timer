import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    MotionValue,
} from "framer-motion";
import "./VerticalDock.css";

interface VerticalDockIconProps {
    children: React.ReactNode;
    mouseY: MotionValue;
    label?: string;
    isActive?: boolean;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const VerticalDockIcon = forwardRef<HTMLDivElement, VerticalDockIconProps>(
    ({ children, mouseY, label, isActive, className, onClick }, forwardedRef) => {
        const localRef = useRef<HTMLDivElement>(null);
        const [isMobile, setIsMobile] = useState(false);

        useEffect(() => {
            const checkMobile = () => {
                setIsMobile(window.innerWidth <= 1100 || window.matchMedia("(pointer: coarse)").matches);
            };
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }, []);
        
        // Use localRef for internal logic but sync with forwardedRef
        useImperativeHandle(forwardedRef, () => localRef.current as HTMLDivElement);

    const distance = useTransform(mouseY, (val) => {
        const bounds = localRef.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
        return val - bounds.y - bounds.height / 2;
    });

    // Magnification range — same physics as horizontal dock
    const sizeTransform = useTransform(distance, [-150, 0, 150], [42, isMobile ? 42 : 64, 42]);

    const size = useSpring(sizeTransform, {
        mass: 0.1,
        stiffness: 120,
        damping: 15,
    });

    return (
        <motion.div
            ref={localRef}
            style={{ width: size, height: size }}
            onClick={onClick}
            whileTap={{ scale: 0.92 }}
            className={`vdock-icon-wrapper ${isActive ? "active" : ""} ${className || ''}`}
        >
            <motion.div style={{ scale: useTransform(size, [42, 64], [1, 1.2]) }}>
                {children}
            </motion.div>
            {label && <div className="vdock-tooltip">{label}</div>}
        </motion.div>
    );
});

interface VerticalDockProps {
    children: (mouseY: MotionValue) => React.ReactNode;
    className?: string;
}

export const VerticalDock = ({ children, className }: VerticalDockProps) => {
    const mouseY = useMotionValue(Infinity);

    return (
        <motion.div
            onMouseMove={(e) => mouseY.set(e.pageY)}
            onMouseLeave={() => mouseY.set(Infinity)}
            className={`vdock-container ${className || ''}`}
        >
            {children(mouseY)}
        </motion.div>
    );
};

export { VerticalDockIcon };

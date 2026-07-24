import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import "./VerticalDock.css";

interface VerticalDockIconProps {
    children: React.ReactNode;
    mouseY?: any; // kept for backwards-compatibility in App.tsx usage
    label?: string;
    isActive?: boolean;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const VerticalDockIcon = forwardRef<HTMLDivElement, VerticalDockIconProps>(
    ({ children, label, isActive, className, onClick }, forwardedRef) => {
        const localRef = useRef<HTMLDivElement>(null);
        
        useImperativeHandle(forwardedRef, () => localRef.current as HTMLDivElement);

        return (
            <motion.div
                ref={localRef}
                onClick={onClick}
                whileTap={{ scale: 0.94 }}
                className={`vdock-icon-wrapper ${isActive ? "active" : ""} ${className || ''}`}
            >
                <div className="vdock-icon-inner">
                    {children}
                </div>
                {label && <div className="vdock-tooltip">{label}</div>}
            </motion.div>
        );
    }
);

interface VerticalDockProps {
    children: (mouseY: any) => React.ReactNode;
    className?: string;
}

export const VerticalDock = ({ children, className }: VerticalDockProps) => {
    return (
        <div className={`vdock-container ${className || ''}`}>
            {children(undefined)}
        </div>
    );
};

export { VerticalDockIcon };

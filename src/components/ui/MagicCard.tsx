import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import "./MagicCard.css";

interface MagicCardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    gradientSize?: number;
    gradientColor?: string;
    gradientOpacity?: number;
}

export const MagicCard = ({
    children,
    className = "",
    style = {},
    gradientSize = 400,
    gradientColor = "rgba(var(--color-accent-rgb), 0.3)",
    gradientOpacity = 0.5,
}: MagicCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth movement springs
    const springConfig = { damping: 25, stiffness: 150 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    // Correct way to combine MotionValues into a string for background
    const background = useTransform(
        [smoothX, smoothY],
        ([x, y]) => `radial-gradient(${gradientSize}px circle at ${x}px ${y}px, ${gradientColor}, transparent 100%)`
    );

    const borderBackground = useTransform(
        [smoothX, smoothY],
        ([x, y]) => `radial-gradient(${gradientSize / 2}px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.4), transparent 100%)`
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const { left, top } = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`magic-card-wrapper ${className}`}
            style={style}
        >
            {/* Interactive Gradient Overlay */}
            <motion.div
                className="magic-card-overlay"
                style={{
                    background: background,
                    opacity: isHovered ? gradientOpacity : 0,
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Interactive Border Highlight */}
            <motion.div
                className="magic-card-border-mask"
                style={{
                    background: borderBackground,
                    opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
            />

            <div className="magic-card-content">{children}</div>
        </div>
    );
};

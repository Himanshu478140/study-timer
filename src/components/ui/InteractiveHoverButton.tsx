import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

interface InteractiveHoverButtonProps {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
    ({ children, onClick, className, style }, ref) => {
        const [isHovered, setIsHovered] = useState(false);

        return (
            <button
                ref={ref}
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={className}
                style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'auto',
                    minWidth: '120px',
                    height: '40px',
                    padding: '0 1.5rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: isHovered ? 'rgba(255,255,255,0.9)' : `linear-gradient(135deg, var(--color-glass-bg), rgba(var(--color-accent-rgb), var(--glass-tint-strength)))`,
                    color: isHovered ? '#000' : '#fff',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    pointerEvents: 'auto', // Force clickable
                    zIndex: 50, // Ensure above other elements
                    ...style
                }}
            >
                {/* Default Text */}
                <span style={{
                    display: 'inline-block',
                    transform: isHovered ? 'translateX(10px)' : 'translateX(0)',
                    opacity: isHovered ? 0 : 1,
                    transition: 'all 0.3s ease',
                    position: 'absolute'
                }}>
                    {children}
                </span>

                {/* Hover Text + Icon */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: isHovered ? 1 : 0,
                    transition: 'all 0.3s ease'
                }}>
                    <span>{children}</span>
                    <ArrowRight size={16} />
                </div>
            </button>
        );
    },
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

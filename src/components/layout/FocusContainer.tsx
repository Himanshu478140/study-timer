import type { ReactNode } from 'react';
import { MagicCard } from '../ui/MagicCard';

interface FocusContainerProps {
    children: ReactNode;
    isDeepWork: boolean;
}

export const FocusContainer = ({ children, isDeepWork }: FocusContainerProps) => {
    return (
        <MagicCard
            className={`focus-container glass ${isDeepWork ? 'deep-work' : ''}`}
            gradientColor="rgba(var(--color-accent-rgb), 0.25)"
            gradientSize={isDeepWork ? 0 : 500}
            gradientOpacity={isDeepWork ? 0 : 0.5} // Reduced from 0.6
            style={{
                borderRadius: '2rem',
                textAlign: 'center',
                minWidth: '360px',
                minHeight: '330px',
                height: isDeepWork ? '100vh' : 'auto',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                // Centering Logic maintained
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',

                // Default Glass State with Tint (Increased transparency)
                background: isDeepWork ? 'transparent' : `linear-gradient(135deg,
                    rgba(20, 20, 20, 0.05),
                    rgba(var(--color-accent-rgb), calc(var(--glass-tint-strength) * 0.7)))`,

                // Deep work overrides
                ...(isDeepWork ? {
                    backdropFilter: 'none',
                    border: '1px solid transparent',
                    boxShadow: 'none',
                    overflow: 'visible' // Allow timer to breathe in fullscreen
                } : {
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                })
            }}
        >
            {children}
        </MagicCard>
    );
};

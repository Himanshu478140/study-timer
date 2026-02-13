export const ProductivityGraph = () => {
    // Simulated data points to create "mountain" curves
    // Using simple cubic bezier curves manually or generating polygon points
    return (
        <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.05" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Background Grid Lines (Subtle) */}
            <line x1="0" y1="250" x2="800" y2="250" stroke="rgba(255,255,255,0.1)" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.05)" />

            {/* Layer 3: Background Mountain (Grey/Ghost) */}
            <path
                d="M0,300 C100,280 200,200 300,220 S500,250 600,200 S700,280 800,290 V300 H0 Z"
                fill="url(#grad3)"
            />

            {/* Layer 2: Secondary Metric (Purple) */}
            <path
                d="M0,300 C50,300 150,250 250,260 S400,100 450,150 S600,220 700,240 S800,280 800,300 H0 Z"
                fill="url(#grad2)"
                filter="url(#glow)"
            />

            {/* Layer 1: Primary Metric (Blue - High Peak) */}
            <path
                d="M0,300 C80,300 200,280 350,280 S500,50 550,80 S650,250 800,280 V300 H0 Z"
                fill="url(#grad1)"
                stroke="white"
                strokeWidth="1"
                filter="url(#glow)"
            />

            {/* Glowing Points at Peaks */}
            <circle cx="550" cy="80" r="6" fill="#60a5fa" stroke="white" strokeWidth="2" filter="url(#glow)" />
            <circle cx="450" cy="150" r="4" fill="#a78bfa" stroke="white" strokeWidth="1" />

            {/* Connector Lines (Info-graphic style) */}
            <line x1="550" y1="80" x2="550" y2="280" stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />

            {/* Labels */}
            <text x="560" y="70" fill="white" fontSize="12" fontWeight="bold">Peak Focus</text>
            <text x="460" y="140" fill="#ddd" fontSize="10">Deep Work</text>

        </svg>
    );
};

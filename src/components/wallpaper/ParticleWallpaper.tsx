import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    color: string;
    pulseSpeed?: number;
    pulseDir?: number;
    trail?: { x: number; y: number; opacity: number }[];
}

interface ParticleWallpaperProps {
    type: 'stars' | 'snow' | 'dust' | 'fireflies' | 'rain' | 'matrix';
    density?: number;
    speedMultiplier?: number;
    color?: string;
    interactionType?: 'none' | 'follow' | 'repel';
}

export const ParticleWallpaper = ({
    type,
    density = 50,
    speedMultiplier = 1,
    color,
    interactionType = 'none'
}: ParticleWallpaperProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const animationFrameId = useRef<number>(0);
    const mouse = useRef({ x: -1000, y: -1000 });

    const initParticles = (width: number, height: number) => {
        let countMultiplier = 1;
        if (type === 'rain') countMultiplier = 2.5;
        if (type === 'matrix') countMultiplier = 1.5;

        const count = Math.floor((width * height) / 20000) * (density / 50) * countMultiplier;
        const newParticles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            const p: Particle = {
                x: Math.random() * width,
                y: Math.random() * height,
                size: 1,
                speedX: 0,
                speedY: 0,
                opacity: Math.random() * 0.5 + 0.3, // Slightly higher base opacity
                color: color || '#ffffff'
            };

            if (type === 'snow') {
                p.size = Math.random() * 3 + 1;
                p.speedY = Math.random() * 1 + 0.5;
            } else if (type === 'dust') {
                p.size = Math.random() * 2 + 0.5;
                p.speedX = (Math.random() - 0.5) * 0.5;
                p.speedY = (Math.random() - 0.5) * 0.2;
                p.color = color || '#fcd34d';
            } else if (type === 'stars') {
                p.size = Math.random() * 2 + 0.5;
                p.color = color || '#ffffff';
            } else if (type === 'fireflies') {
                p.size = Math.random() * 2 + 1;
                p.speedX = (Math.random() - 0.5) * 0.4;
                p.speedY = (Math.random() - 0.5) * 0.4;
                p.color = color || '#a3e635'; // Lime green
                p.pulseSpeed = Math.random() * 0.02 + 0.01;
                p.pulseDir = 1;
            } else if (type === 'rain') {
                p.size = Math.random() * 1 + 1;
                p.speedY = Math.random() * 15 + 15; // Faster rain
                p.color = color || '#38bdf8'; // Sky blue
            } else if (type === 'matrix') {
                p.size = Math.random() * 2 + 10;
                p.speedY = Math.random() * 3 + 2;
                p.color = color || '#22c55e';
                p.trail = [];
            }

            newParticles.push(p);
        }
        particles.current = newParticles;
    };

    const animate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);

        particles.current.forEach(p => {
            // Mouse Interaction
            if (interactionType !== 'none' && mouse.current.x !== -1000) {
                const dx = p.x - mouse.current.x;
                const dy = p.y - mouse.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 200;

                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    const strength = 0.5;

                    if (interactionType === 'follow') {
                        p.x -= dx * force * strength * 0.2;
                        p.y -= dy * force * strength * 0.2;
                    } else if (interactionType === 'repel') {
                        p.x += dx * force * strength * 0.2;
                        p.y += dy * force * strength * 0.2;
                    }
                }
            }

            // Update position
            p.x += p.speedX * speedMultiplier;
            p.y += p.speedY * speedMultiplier;

            // Simple wrap around/shimmer logic
            if (type === 'snow' || type === 'rain' || type === 'matrix') {
                if (p.y > height + 20) {
                    p.y = -20;
                    if (type !== 'matrix') p.x = Math.random() * width;
                }
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;
            } else {
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;
                if (p.y > height) p.y = 0;
                if (p.y < 0) p.y = height;
            }

            // Type specific logic
            if (type === 'stars') {
                p.opacity += (Math.random() - 0.5) * 0.05;
                if (p.opacity < 0.1) p.opacity = 0.1;
                if (p.opacity > 0.8) p.opacity = 0.8;
            } else if (type === 'fireflies') {
                p.opacity += (p.pulseSpeed || 0.01) * (p.pulseDir || 1);
                if (p.opacity > 0.9) p.pulseDir = -1;
                if (p.opacity < 0.1) p.pulseDir = 1;
            }

            // Draw
            ctx.beginPath();
            if (type === 'rain') {
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, p.y + p.speedY * 1.5);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size;
                ctx.globalAlpha = p.opacity;
                ctx.stroke();
            } else if (type === 'matrix') {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fillRect(p.x, p.y, p.size * 0.5, p.size);
                ctx.globalAlpha = p.opacity * 0.3;
                ctx.fillRect(p.x, p.y - p.size, p.size * 0.5, p.size);
            } else {
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
            }
        });

        animationFrameId.current = requestAnimationFrame(() => animate(ctx, width, height));
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(canvas.width, canvas.height);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mouse.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        resize();

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            animate(ctx, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.current.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
            });
        }

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [type, density, speedMultiplier, color, interactionType]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -2,
                pointerEvents: 'none',
                opacity: 0.8 // Increased overall opacity
            }}
        />
    );
};

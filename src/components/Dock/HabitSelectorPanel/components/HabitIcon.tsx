import React from 'react';
import {
    Dumbbell, Sprout, BookOpen, Palette, Droplet, Flame, Brain, Target,
    Heart, Moon, Pencil, Coffee, Music, Smile, Zap, Activity
} from 'lucide-react';

export const LUCIDE_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    dumbbell: Dumbbell,
    sprout: Sprout,
    book: BookOpen,
    palette: Palette,
    droplet: Droplet,
    flame: Flame,
    brain: Brain,
    target: Target,
    heart: Heart,
    moon: Moon,
    pencil: Pencil,
    coffee: Coffee,
    music: Music,
    smile: Smile,
    zap: Zap,

    // Fallbacks for legacy emoji data
    '🏋️': Dumbbell,
    '🧘': Sprout,
    '🌱': Sprout,
    '🌿': Sprout,
    '📖': BookOpen,
    '🎨': Palette,
    '💧': Droplet,
    '🏃': Flame,
    '🔥': Flame,
    '💪': Flame,
    '🧠': Brain,
    '🎯': Target,
    '❤️': Heart,
    '🌙': Moon,
    '✍️': Pencil,
    '☕': Coffee,
    '🎵': Music,
    '😊': Smile,
    '⚡': Zap
};

export const HabitIcon = ({ icon, size = 18 }: { icon: string; size?: number }) => {
    const IconComponent = LUCIDE_ICON_MAP[icon] || LUCIDE_ICON_MAP[icon.toLowerCase()] || Activity;
    return React.createElement(IconComponent, { size });
};

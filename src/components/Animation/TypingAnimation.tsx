import { useEffect, useState } from 'react';

interface TypingAnimationProps {
    children: string;
    className?: string;
    duration?: number;
    delay?: number;
}

export const TypingAnimation = ({
    children,
    className = "",
    duration = 50,
    delay = 0
}: TypingAnimationProps) => {
    const [displayedText, setDisplayedText] = useState("");
    const [started, setStarted] = useState(false);

    useEffect(() => {
        // Reset when children changes
        setDisplayedText("");
        setStarted(false);

        const timeout = setTimeout(() => {
            setStarted(true);
        }, delay);

        return () => clearTimeout(timeout);
    }, [children, delay]);

    useEffect(() => {
        if (!started) return;

        let i = 0;
        const typingEffect = setInterval(() => {
            if (i < children.length) {
                setDisplayedText(children.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typingEffect);
            }
        }, duration);

        return () => {
            clearInterval(typingEffect);
        };
    }, [children, duration, started]);

    return (
        <span className={className}>
            {displayedText}
        </span>
    );
};

import { useState, useEffect } from 'react';

export const useDashboardSettings = () => {
    const [clockFont, setClockFont] = useState(() => {
        return localStorage.getItem('saved-clock-font') || 'default';
    });

    useEffect(() => {
        localStorage.setItem('saved-clock-font', clockFont);
    }, [clockFont]);

    const [zenClockStyle, setZenClockStyle] = useState(() => {
        return localStorage.getItem('saved-zen-clock-style') || 'flip';
    });

    useEffect(() => {
        localStorage.setItem('saved-zen-clock-style', zenClockStyle);
    }, [zenClockStyle]);

    const [timerConfig, setTimerConfig] = useState(() => {
        const saved = localStorage.getItem('study-timer-timer-config');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse timerConfig", e);
            }
        }
        return {
            pomodoro: 25,
            flow: 52,
            deep_work: 90,
            shortBreak: 5,
            longBreak: 15,
            custom: 15,
            customBreak: 5,
            pomodoroBreakMode: 'auto' as 'auto' | 'fixed',
            pomodoroBreakDuration: 5,
            flowBreakMode: 'auto' as 'auto' | 'fixed',
            flowBreakDuration: 17,
            deepWorkBreakMode: 'auto' as 'auto' | 'fixed',
            deepWorkBreakDuration: 15
        };
    });

    const [features, setFeatures] = useState(() => {
        const saved = localStorage.getItem('study-timer-features');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse features", e);
            }
        }
        return {
            ambientMode: false,
            sound: true,
            notifications: true,
            showQuoteInFullscreen: true,
            zenModeType: 'clock' as 'clock' | 'timer',
            zenTimeFormat: '24h' as '12h' | '24h',
            homeTimeFormat: '24h' as '12h' | '24h'
        };
    });

    useEffect(() => {
        localStorage.setItem('study-timer-timer-config', JSON.stringify(timerConfig));
    }, [timerConfig]);

    useEffect(() => {
        localStorage.setItem('study-timer-features', JSON.stringify(features));
    }, [features]);

    const [selectedQuote, setSelectedQuote] = useState("The only way to do great work is to love what you do.");
    const [quoteFont, setQuoteFont] = useState(() => {
        const saved = localStorage.getItem('quote-font');
        return saved || 'serif';
    });

    useEffect(() => {
        localStorage.setItem('quote-font', quoteFont);
    }, [quoteFont]);

    const [customQuotes, setCustomQuotes] = useState<string[]>(() => {
        const saved = localStorage.getItem('custom-quotes');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('custom-quotes', JSON.stringify(customQuotes));
    }, [customQuotes]);

    const handleAddQuote = (quote: string) => {
        if (!customQuotes.includes(quote)) {
            setCustomQuotes([...customQuotes, quote]);
        }
    };

    const handleRemoveQuote = (quote: string) => {
        setCustomQuotes(customQuotes.filter(q => q !== quote));
        if (selectedQuote === quote) {
            setSelectedQuote("The only way to do great work is to love what you do.");
        }
    };

    return {
        clockFont,
        setClockFont,
        zenClockStyle,
        setZenClockStyle,
        timerConfig,
        setTimerConfig,
        features,
        setFeatures,
        selectedQuote,
        setSelectedQuote,
        quoteFont,
        setQuoteFont,
        customQuotes,
        handleAddQuote,
        handleRemoveQuote
    };
};

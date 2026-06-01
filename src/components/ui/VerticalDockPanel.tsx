import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Timer as TimerIcon, ChartArea, AudioLines,
    NotepadText, CalendarDays as CalendarIcon, CircleCheckBig, ListTodo
} from 'lucide-react';


interface VerticalDockPanelProps {
    isOpen: boolean;
    onClose: () => void;
    mode: string;
    completedSessionsToday: number;
    notes: string;
    
    // Actions
    onOpenDashboard: () => void;
    onToggleGraph: () => void;
    onToggleSounds: () => void;
    onToggleNotepad: () => void;
    onToggleCalendar: () => void;
    onToggleHabits: () => void;
    onToggleModeSelector: () => void;
    onToggleTasks: () => void;
    triggerRef?: React.RefObject<HTMLDivElement | null>;
    modeIconRef?: React.RefObject<HTMLDivElement | null>;
    graphIconRef?: React.RefObject<HTMLDivElement | null>;
    calendarIconRef?: React.RefObject<HTMLDivElement | null>;
    habitIconRef?: React.RefObject<HTMLDivElement | null>;
    notepadIconRef?: React.RefObject<HTMLDivElement | null>;
    taskIconRef?: React.RefObject<HTMLDivElement | null>;
    audioIconRef?: React.RefObject<HTMLDivElement | null>;

    // Active States
    isModeOpen?: boolean;
    isGraphOpen?: boolean;
    isAudioOpen?: boolean;
    isNotepadOpen?: boolean;
    isCalendarOpen?: boolean;
    isHabitsOpen?: boolean;
    isTaskOpen?: boolean;
}

export const VerticalDockPanel = ({
    isOpen,
    onClose,
    mode,
    completedSessionsToday,
    notes,
    onOpenDashboard,
    onToggleGraph,
    onToggleSounds,
    onToggleNotepad,
    onToggleCalendar,
    onToggleHabits,
    onToggleModeSelector,
    onToggleTasks,
    triggerRef,
    modeIconRef,
    graphIconRef,
    calendarIconRef,
    habitIconRef,
    notepadIconRef,
    taskIconRef,
    audioIconRef,
    isModeOpen,
    isGraphOpen,
    isAudioOpen,
    isNotepadOpen,
    isCalendarOpen,
    isHabitsOpen,
    isTaskOpen
}: VerticalDockPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        scale: Math.max(0.5, Math.min(Math.min(window.innerHeight / 633, window.innerWidth / 850), 1.8))
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                height: window.innerHeight,
                scale: Math.max(0.5, Math.min(Math.min(window.innerHeight / 633, window.innerWidth / 850), 1.8))
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scale = dimensions.scale;
    const panelWidth = 120 * scale;
    const curveWidth = 40 * scale;

    // Reset hover state when panel closes
    useEffect(() => {
        if (!isOpen) {
            setHoveredIdx(null);
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            const isOutsidePanel = panelRef.current && !panelRef.current.contains(e.target as Node);
            const isNotTrigger = triggerRef?.current && !triggerRef.current.contains(e.target as Node);
            
            // Do not close if clicking inside any floating selector panels or modals
            const target = e.target as HTMLElement | null;
            const isSelectorPanel = target && (
                target.closest('.task-selector-panel-mobile') || 
                target.closest('.mode-selector-panel') || 
                target.closest('.calendar-selector-panel') ||
                target.closest('.notepad-popup') ||
                target.closest('.audio-panel') ||
                target.closest('.add-event-modal-container')
            );
            
            if (isOutsidePanel && isNotTrigger && !isSelectorPanel) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, triggerRef]);

    const notesSummary = notes ? `${notes.length} characters written` : 'Quick notepad is empty';
    
    const readableModeName = {
        deep_work: 'Deep Work',
        pomodoro: 'Pomodoro',
        flow: '52/17 Flow',
        custom: 'Custom Timer'
    }[mode] || 'Deep Focus';

    const utilitiesList = [
        {
            icon: <Settings size={22} />,
            title: 'Main Dashboard',
            subtitle: 'Stitch central control hub',
            onClick: () => { onOpenDashboard(); onClose(); },
            isActive: false
        },
        {
            icon: <TimerIcon size={22} />,
            title: 'Focus Session',
            subtitle: `Mode: ${readableModeName} • Round ${completedSessionsToday}`,
            onClick: () => { onToggleModeSelector(); },
            isActive: isModeOpen
        },
        {
            icon: <ListTodo size={22} />,
            title: 'Focus Tasks',
            subtitle: 'Manage your next intentions',
            onClick: () => { onToggleTasks(); },
            isActive: isTaskOpen
        },
        {
            icon: <ChartArea size={22} />,
            title: 'Analytics & Trends',
            subtitle: 'XP progress & focus patterns',
            onClick: () => { onToggleGraph(); },
            isActive: isGraphOpen
        },
        {
            icon: <AudioLines size={22} />,
            title: 'Focus Sounds',
            subtitle: 'Play atmospheric background noise',
            onClick: () => { onToggleSounds(); },
            isActive: isAudioOpen
        },
        {
            icon: <NotepadText size={22} />,
            title: 'Scratch Note',
            subtitle: notesSummary,
            onClick: () => { onToggleNotepad(); },
            isActive: isNotepadOpen
        },
        {
            icon: <CalendarIcon size={22} />,
            title: 'Calendar Planner',
            subtitle: 'Schedule upcoming timer slots',
            onClick: () => { onToggleCalendar(); },
            isActive: isCalendarOpen
        },
        {
            icon: <CircleCheckBig size={22} />,
            title: 'Daily Habits',
            subtitle: 'Log and review daily targets',
            onClick: () => { onToggleHabits(); },
            isActive: isHabitsOpen
        }
    ];

    const content = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                    ref={panelRef}
                    initial={{ x: '100%', opacity: 0.95 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0.95 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                    style={{
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        height: '100vh',
                        width: `${panelWidth}px`,
                        maxWidth: '100vw',
                        background: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                        zIndex: 9999,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: `${24 * scale}px 0 ${24 * scale}px ${40 * scale}px`,
                        overflow: 'visible',
                        clipPath: `path('M ${curveWidth} ${curveWidth} C ${curveWidth} ${curveWidth / 2}, ${curveWidth / 2} 0, 0 0 L ${panelWidth} 0 L ${panelWidth} ${dimensions.height} L 0 ${dimensions.height} C ${curveWidth / 2} ${dimensions.height}, ${curveWidth} ${dimensions.height - curveWidth / 2}, ${curveWidth} ${dimensions.height - curveWidth} Z')`
                    }}
                >
                    {/* Scrollable utilities list */}
                    <div 
                        className="custom-scrollbar"
                        style={{
                            overflowY: 'auto',
                            flex: 1,
                            padding: '0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: `${12 * scale}px`
                        }}
                    >
                        {utilitiesList.map((item, idx) => (
                            <div
                                key={idx}
                                ref={
                                    idx === 1 ? modeIconRef : 
                                    idx === 2 ? taskIconRef : 
                                    idx === 3 ? graphIconRef : 
                                    idx === 4 ? audioIconRef : 
                                    idx === 5 ? notepadIconRef : 
                                    idx === 6 ? calendarIconRef : 
                                    idx === 7 ? habitIconRef : 
                                    undefined
                                }
                                onClick={item.onClick}
                                onMouseEnter={(e) => {
                                    setHoveredIdx(idx);
                                    if (item.isActive) {
                                        e.currentTarget.style.background = 'var(--color-accent, #818cf8)';
                                        e.currentTarget.style.color = '#0f0f11';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                    } else {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                    }
                                    e.currentTarget.style.transform = `scale(1.1) translateX(-${2 * scale}px)`;
                                }}
                                onMouseLeave={(e) => {
                                    setHoveredIdx(null);
                                    if (item.isActive) {
                                        e.currentTarget.style.background = 'var(--color-accent, #818cf8)';
                                        e.currentTarget.style.color = '#0f0f11';
                                    } else {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                    }
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.transform = 'none';
                                }}
                                style={{
                                    width: `${52 * scale}px`,
                                    height: `${52 * scale}px`,
                                    borderRadius: `${16 * scale}px`,
                                    background: item.isActive ? 'var(--color-accent, #818cf8)' : 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: item.isActive ? '#0f0f11' : 'rgba(255, 255, 255, 0.7)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div style={{ transform: `scale(${scale})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {item.icon}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Rich Floating Tooltip (sibling of panel to prevent clipPath cropping) */}
                <AnimatePresence>
                    {hoveredIdx !== null && (
                        <motion.div
                            className="vdock-panel-tooltip"
                            initial={{ opacity: 0, x: 10, y: '-50%', scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, y: '-50%', scale: 1 }}
                            exit={{ opacity: 0, x: 10, y: '-50%', scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            style={{
                                position: 'fixed',
                                right: `${92 * scale}px`,
                                top: `${(50 + hoveredIdx * 64) * scale}px`,
                                background: 'rgba(0, 0, 0, 0.75)',
                                backdropFilter: 'none',
                                WebkitBackdropFilter: 'none',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '12px',
                                padding: '8px 14px',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                                color: 'white',
                                zIndex: 10000,
                                pointerEvents: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px',
                                whiteSpace: 'nowrap',
                                transformOrigin: 'right center',
                                transform: `scale(${scale}) translateY(-50%)`,
                            }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                                {utilitiesList[hoveredIdx].title}
                            </span>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
                                {utilitiesList[hoveredIdx].subtitle}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        )}
    </AnimatePresence>
    );

    return createPortal(content, document.body);
};
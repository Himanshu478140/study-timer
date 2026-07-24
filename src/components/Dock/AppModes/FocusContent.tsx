import React from 'react';
import { Pencil } from 'lucide-react';
import { ZenMode } from './zen/ZenMode';
import { HomeView } from './home/HomeView';
import { TimerDisplay } from '../../timer/TimerDisplay';
import { TimerControls } from '../../timer/TimerControls';
import { TypingAnimation } from '../../Animation/TypingAnimation';
import { type AppMode } from './GlobalModeSwitcher';
import { type FocusMode } from '../../timer/ModeSelectorPanel';

interface FocusContentProps {
    appMode: AppMode;
    features: {
        zenModeType: 'clock' | 'timer';
        zenTimeFormat: '12h' | '24h';
        homeTimeFormat: '12h' | '24h';
        ambientMode: boolean;
    };
    timeLeft: number;
    status: 'idle' | 'running' | 'paused' | 'completed';
    handleStart: () => void;
    pause: () => void;
    handleReset: () => void;
    handleToggleFullscreen: () => void;
    isFullscreen: boolean;
    isBreak: boolean;
    tasks: any[];
    activeTaskId: string | null;
    clockFont: string;
    zenClockStyle: string;
    isFocusActive: boolean;
    homeTaskPencilRef: React.RefObject<HTMLDivElement | null>;
    setTaskPanelTriggerRef: (ref: React.RefObject<HTMLDivElement | null>) => void;
    isTaskPanelOpen: boolean;
    setIsTaskPanelOpen: (open: boolean) => void;
    mode: FocusMode;
    getBreakTime: (m: string) => number;
    setBreakPrompt: (prompt: { show: boolean; duration: number }) => void;
}

export const FocusContent = ({
    appMode,
    features,
    timeLeft,
    status,
    handleStart,
    pause,
    handleReset,
    handleToggleFullscreen,
    isFullscreen,
    isBreak,
    tasks,
    activeTaskId,
    clockFont,
    zenClockStyle,
    isFocusActive,
    homeTaskPencilRef,
    setTaskPanelTriggerRef,
    isTaskPanelOpen,
    setIsTaskPanelOpen,
    mode,
    getBreakTime,
    setBreakPrompt
}: FocusContentProps) => {
    const activeTaskText = tasks.find(t => t.id === activeTaskId)?.text || 'Ready to Focus?';
    const activeIntentLabel = isBreak ? '• Taking Break' : '• ' + activeTaskText;

    return (
        <main className="focus-content">
            {appMode === 'zen' && (
                <ZenMode
                    clockFont={zenClockStyle}
                    zenModeType={features.zenModeType}
                    timeLeft={timeLeft}
                    status={status}
                    onStart={handleStart}
                    onPause={pause}
                    onReset={handleReset}
                    onToggleFullscreen={handleToggleFullscreen}
                    isFullscreen={isFullscreen}
                    timeFormat={features.zenTimeFormat}
                    modeName={activeIntentLabel}
                />
            )}
            <div className="hud-center-stack" style={{ display: appMode === 'zen' ? 'none' : 'flex' }}>
                {appMode === 'home' ? (
                    <HomeView clockFont={clockFont} timeFormat={features.homeTimeFormat} />
                ) : appMode === 'zen' ? null : (
                    <section className="stitch-timer-section">
                        <div
                            style={{
                                display: isFocusActive ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                opacity: isFocusActive ? 0 : 1,
                                transition: 'opacity 0.3s',
                                marginBottom: '1rem'
                            }}
                        >
                            <h2 className="stitch-mode-label" style={{
                                color: 'var(--color-text-secondary)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                fontSize: '1.7rem',
                                fontWeight: 500,
                                margin: 0,
                                textAlign: 'center',
                            }}>
                                <TypingAnimation
                                    key={isBreak ? 'break' : (activeTaskId || 'no-task')}
                                    duration={100}
                                >
                                    {activeIntentLabel}
                                </TypingAnimation>
                            </h2>
                            {!isBreak && (
                                <div
                                    ref={homeTaskPencilRef}
                                    id="home-task-pencil-trigger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTaskPanelTriggerRef(homeTaskPencilRef);
                                        setIsTaskPanelOpen(!isTaskPanelOpen);
                                    }}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'rgba(255, 255, 255, 0.4)',
                                        transition: 'color 0.2s',
                                        padding: '4px',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                    }}
                                    title="Change Focus Intentions"
                                >
                                    <Pencil size={16} />
                                </div>
                            )}
                        </div>

                        <TimerDisplay
                            seconds={timeLeft}
                            font={clockFont}
                            style={{
                                fontSize: isFocusActive ? '25vw' : '12rem',
                                lineHeight: 1,
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                marginBottom: '0',
                                transform: 'none',
                            }}
                        />

                        <div style={{
                            opacity: isFocusActive ? 0.05 : 1,
                            transition: 'opacity 0.3s ease',
                        }}
                            onMouseEnter={(e) => {
                                if (isFocusActive) e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                if (isFocusActive) e.currentTarget.style.opacity = '0.05';
                            }}
                        >
                            <TimerControls
                                status={status}
                                onStart={handleStart}
                                onPause={pause}
                                onReset={handleReset}
                                onBreak={() => {
                                    setBreakPrompt({ show: true, duration: getBreakTime(mode) });
                                }}
                                allowReset
                            />
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
};

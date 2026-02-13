import { useState } from 'react';
import { FocusCalendar } from '../calendar/FocusCalendar';
import { InteractiveHoverButton } from '../ui/InteractiveHoverButton';
import { HabitTrackerOverlay as HabitTrackerWidget } from './HabitTrackerWidget';
// import { Modal } from '../ui/Modal'; // Removed unused
import './widgets.css';

interface RightWidgetsProps {
    visible: boolean;
}

export const RightWidgets = ({ visible }: RightWidgetsProps) => {
    const [showTracker, setShowTracker] = useState(false);

    return (
        <>
            {/* Standard Right Widgets (Calendar) - Always Visible & Fixed */}
            <div
                className="right-widgets-container"
                style={{
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.6s ease',
                    visibility: visible ? 'visible' : 'hidden',
                }}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>

                    {/* Calendar - Always here */}
                    <FocusCalendar />

                    {/* Tracker Button Container - Anchored Here */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '4px', position: 'relative' }}>

                        {/* Tracker Popover */}
                        {showTracker && (
                            <>
                                {/* Invisible Overlay for Click Outside */}
                                <div
                                    style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                                    onClick={() => setShowTracker(false)}
                                />

                                <div style={{
                                    position: 'absolute',
                                    bottom: '120%', // Above the button with gap
                                    right: 0, // Aligned to right edge
                                    width: '650px', // Spacious for Dashboard Layout
                                    height: '450px',
                                    background: 'transparent', // Let child handle styles
                                    zIndex: 50,
                                    transformOrigin: 'bottom right',
                                    pointerEvents: 'none' // Interaction handled by child, avoid blocking if transparent areas exist (though mostly filled)
                                }}>

                                    {/* Content (Arrow removed for glass look) */}

                                    {/* Content */}
                                    <HabitTrackerWidget onClose={() => setShowTracker(false)} />
                                </div>
                            </>
                        )}

                        <InteractiveHoverButton onClick={() => setShowTracker(!showTracker)}>
                            Habit Tracker
                        </InteractiveHoverButton>
                    </div>
                </div>
            </div>
        </>
    );
};

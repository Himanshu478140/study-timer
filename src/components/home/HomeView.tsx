import { useState, useEffect } from 'react';
import { TypingAnimation } from '../ui/TypingAnimation';
import { FlipClock } from '../timer/FlipClock';
import { SimpleFlip } from '../timer/SimpleFlip';

export const HomeView = ({ clockFont, timeFormat = '24h' }: { clockFont?: string, timeFormat?: '12h' | '24h' }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const rawHours = time.getHours();
    const hours = timeFormat === '12h' ? (rawHours % 12 || 12) : rawHours;
    const minutes = time.getMinutes();
    const isMorning = rawHours >= 5 && rawHours < 12;
    const isAfternoon = rawHours >= 12 && rawHours < 17;
    const isEvening = rawHours >= 17 && rawHours < 21;
    // const isNight = rawHours >= 21 || rawHours < 5;

    const getGreeting = () => {
        const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
        if (rawHours >= 21) return `${dayName}'s a wrap. Rest up!`;
        if (rawHours < 5) return `Late night vibes. Get some sleep soon.`;
        if (isMorning) return `Good morning. Ready to focus?`;
        if (isAfternoon) return `Good afternoon. Keep the momentum!`;
        if (isEvening) return `${dayName} evening. Wind down or push on?`;
        return `Hello, Focus!`;
    };

    const timeString = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: timeFormat === '12h'
    });

    return (
        <div className="home-view-container animate-slide-up" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '1rem',
            paddingBottom: '23vh'
        }}>
            <div className="home-greeting" style={{
                fontSize: '1.8rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                opacity: 0.9,
                marginBottom: '0.5rem',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                transition: 'color var(--transition-theme)'
            }}>
                <TypingAnimation duration={80}>
                    {getGreeting()}
                </TypingAnimation>
            </div>

            {clockFont === 'flip' ? (
                <div style={{ transform: 'scale(1.5)', marginTop: '2rem' }}>
                    <FlipClock value1={hours} value2={minutes} />
                </div>
            ) : clockFont === 'simple-flip' ? (
                <div style={{ transform: 'scale(1.5)', marginTop: '2rem' }}>
                    <SimpleFlip value1={hours} value2={minutes} />
                </div>
            ) : (
                <div className="clock-glass animate-breathing" style={{ marginTop: '1rem' }}>
                    <div
                        className={`home-clock font-${clockFont}`}
                        style={{
                            fontSize: '15vw',
                            lineHeight: 1,
                            color: 'var(--color-text-primary)',
                            transition: 'all var(--transition-theme)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>{timeString.replace(/\s?[AP]M/i, '')}</span>
                        {timeFormat === '12h' && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginLeft: '1rem',
                                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                                paddingLeft: '1rem'
                            }}>
                                <span style={{
                                    fontSize: '0.15em',
                                    textTransform: 'uppercase',
                                    opacity: time.getHours() < 12 ? 1 : 0.2,
                                    fontWeight: 800,
                                    color: time.getHours() < 12 ? 'var(--color-accent)' : 'inherit'
                                }}>AM</span>
                                <span style={{
                                    fontSize: '0.15em',
                                    textTransform: 'uppercase',
                                    opacity: time.getHours() >= 12 ? 1 : 0.2,
                                    fontWeight: 800,
                                    color: time.getHours() >= 12 ? 'var(--color-accent)' : 'inherit'
                                }}>PM</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

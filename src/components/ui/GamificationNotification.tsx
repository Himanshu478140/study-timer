import { useEffect, useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import './gamification.css';

export const GamificationNotification = () => {
    const { notification } = useGamification();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [notification]);

    if (!notification) return null;

    const isLevelUp = notification.includes('Level Up');

    return (
        <div className={`xp-notification ${visible ? 'show' : ''} ${isLevelUp ? 'level-up' : ''}`}>
            <div className="xp-content">
                {isLevelUp && <span className="level-icon">🎉</span>}
                <span className="xp-text">{notification}</span>
            </div>
        </div>
    );
};

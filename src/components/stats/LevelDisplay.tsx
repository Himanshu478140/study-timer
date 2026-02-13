import { useGamification } from '../../hooks/useGamification';
import './levelDisplay.css';

export const LevelDisplay = () => {
    const { level, xp } = useGamification();

    const XP_PER_LEVEL = 100;
    const currentLevelXP = (level - 1) * XP_PER_LEVEL;
    const progressXP = xp - currentLevelXP;
    const progressPercent = (progressXP / XP_PER_LEVEL) * 100;

    return (
        <div className="level-display-card">
            <div className="level-header">
                <div className="level-badge">
                    <span className="level-number">{level}</span>
                    <span className="level-label">Level</span>
                </div>
                <div className="xp-info">
                    <span className="xp-current">{progressXP} XP</span>
                    <span className="xp-separator">/</span>
                    <span className="xp-next">{XP_PER_LEVEL} XP</span>
                </div>
            </div>

            <div className="progress-bar-container">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                >
                    <div className="progress-glow"></div>
                </div>
            </div>

            <div className="level-footer">
                <span className="total-xp">Total: {xp.toLocaleString()} XP</span>
            </div>
        </div>
    );
};

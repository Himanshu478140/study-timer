import { useGamification } from '../../Gamification/useGamification';
import { formatXP } from '../../Gamification/formatXP';
import './levelDisplay.css';

export const LevelDisplay = () => {
    const { level, xp, xpRequiredForNextLevel, progressXP, progressPercent } = useGamification();

    return (
        <div className="level-display-card">
            <div className="level-header">
                <div className="level-badge">
                    <span className="level-number">{level}</span>
                    <span className="level-label">Level</span>
                </div>
                <div className="xp-info">
                    <span className="xp-current">{formatXP(progressXP)}</span>
                    <span className="xp-separator">/</span>
                    <span className="xp-next">{formatXP(xpRequiredForNextLevel)}</span>
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
                <span className="total-xp">Total: {formatXP(xp)}</span>
            </div>
        </div>
    );
};

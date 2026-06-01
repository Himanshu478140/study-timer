// import { Zap, Clock, Target, Flame } from 'lucide-react'; // Removing unused
import type { FocusStats } from '../../hooks/useHabits';

interface StatsPanelProps {
    stats: {
        xp: number;
        level: number;
        streak: number;
    };
    focusStats: FocusStats;
    setDailyGoal: (minutes: number) => void;
}

import { FocusScorePanel } from '../stats/FocusScorePanel';
import { StreakCard } from '../stats/StreakCard';
import { ConsistencyHeatmap } from '../stats/ConsistencyHeatmap';
import { InteractiveFocusChart } from '../stats/InteractiveFocusChart';
import { Minus, Plus } from 'lucide-react';
import { DailyTaskStats } from '../stats/DailyTaskStats';
import { LevelDisplay } from '../stats/LevelDisplay';

export const StatsPanel = ({ stats: _userStats, focusStats, setDailyGoal }: StatsPanelProps) => {

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div className="stats-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div className="stats-title">Focus Performance</div>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Track your consistency and prevent burnout.</p>
                </div>
                {/* Goal Adjuster - Relocated for discoverability */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '2.5rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                        Daily Focus Target
                    </div>
                    <div className="smart-adjuster" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <button
                            className="adjuster-btn"
                            onClick={() => setDailyGoal(Math.max(30, focusStats.dailyGoalMinutes - 30))}
                        >
                            <Minus size={14} />
                        </button>
                        <div className="adjuster-input-container">
                            <input
                                type="number"
                                className="adjuster-input"
                                value={focusStats.dailyGoalMinutes}
                                onChange={(e) => setDailyGoal(Math.min(1440, Math.max(0, parseInt(e.target.value) || 0)))}
                            />
                            <span className="adjuster-unit">m</span>
                        </div>
                        <button
                            className="adjuster-btn"
                            onClick={() => setDailyGoal(Math.min(1440, focusStats.dailyGoalMinutes + 30))}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Score & Streak Section */}
            <div className="stats-grid" style={{ alignItems: 'flex-start' }}>
                <FocusScorePanel
                    score={focusStats.today.score}
                    dailyGoal={focusStats.dailyGoalMinutes}
                    history={focusStats.history}
                />
                <StreakCard
                    current={focusStats.streaks.current}
                    best={focusStats.streaks.best}
                />
            </div>

            {/* Level & XP Display */}
            <LevelDisplay />

            {/* Consistency Heatmap */}
            <ConsistencyHeatmap history={focusStats.history} />

            {/* Premium Stacked Area Focus Chart */}
            <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                <InteractiveFocusChart history={focusStats.history} />
            </div>

            {/* NEW Independent Block: Daily Tasks */}
            <DailyTaskStats />
        </div>
    );
};

// StatCard removed as it is replaced by dedicated components

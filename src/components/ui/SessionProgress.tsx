import React from 'react';
import { motion } from 'framer-motion';

interface SessionProgressProps {
  completed: number;
  goal?: number;
}

export const SessionProgress: React.FC<SessionProgressProps> = ({ 
  completed, 
  goal = 4 
}) => {
  // Logic to handle more than 4 sessions cleanly
  // If completed > goal, we might show a second row or group them
  // For now, let's stick to the user's logic: 
  // "First 4 sessions shown as normal dots. Additional sessions create a new grouped section"
  
  const renderDots = (count: number, total: number, isExtra = false) => {
    return Array.from({ length: total }).map((_, i) => {
      const isFilled = i < count;
      return (
        <motion.div
          key={`${isExtra ? 'extra' : 'main'}-${i}`}
          className={`session-dot ${isFilled ? 'filled' : 'empty'} ${isExtra ? 'extra' : ''}`}
          initial={false}
          animate={{
            scale: isFilled ? [1, 1.3, 1] : 1,
            opacity: isFilled ? 1 : 0.6,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
            scale: { duration: 0.4 }
          }}
        >
          {isFilled && <div className="dot-glow" />}
        </motion.div>
      );
    });
  };

  const mainCompleted = Math.min(completed, goal);
  const extraSessions = completed > goal ? completed - goal : 0;
  // If extra > 4, we might want to group them or show another 4
  const extraGoal = extraSessions > 4 ? Math.ceil(extraSessions / 4) * 4 : 4;
  const extraCompleted = extraSessions;

  return (
    <div className="session-progress-wrapper">
      <div className="session-dots-container">
        {renderDots(mainCompleted, goal)}
      </div>
      
      {completed > goal && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="session-dots-container extra-sessions"
        >
          <div className="session-divider" />
          {renderDots(extraCompleted, extraGoal, true)}
        </motion.div>
      )}
    </div>
  );
};

import { Check, X, Minus } from 'lucide-react';
import type { TimetableSubject } from '../../..';
import { MiniAttendanceRing } from './MiniAttendanceRing';

interface SubjectCardProps {
  subject: TimetableSubject;
  currentStatus: 'present' | 'absent' | 'no_class' | null;
  subjectStats?: {
    currentPercentage: number;
    mustAttendNextY: number;
    maxClassesCanMiss: number;
  };
  onToggle: (status: 'present' | 'absent' | 'no_class') => void;
}

export const SubjectCard = ({ subject, currentStatus, subjectStats, onToggle }: SubjectCardProps) => {
  const pct = subjectStats ? Math.round(subjectStats.currentPercentage) : 100;

  return (
    <div className="subject-card-container">
      {/* Left Colored Accent Strip */}
      <div
        className="subject-card-accent-strip"
        style={{
          background: subject.color,
          boxShadow: `0 0 8px ${subject.color}aa`
        }}
      />

      {/* Mini Attendance Ring + Subject Info */}
      <div className="subject-card-info">
        <MiniAttendanceRing percentage={pct} color={subject.color} />

        {/* Subject Name */}
        <div className="subject-card-text">
          <span className="subject-card-name">{subject.name}</span>
          {subjectStats && (() => {
            if (subjectStats.mustAttendNextY > 0) {
              return (
                <span style={{ fontSize: '0.675rem', color: '#f59e0b', fontWeight: 500 }}>
                  Must attend next {subjectStats.mustAttendNextY} classes
                </span>
              );
            }
            return (
              <span style={{ fontSize: '0.675rem', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 500 }}>
                Can miss {subjectStats.maxClassesCanMiss} more classes
              </span>
            );
          })()}
        </div>
      </div>

      {/* Interactive Status Actions (Present / Absent / No Class) */}
      <div className="subject-card-actions">
        <button
          onClick={() => onToggle('present')}
          title="Mark Present"
          className="subject-status-btn"
          style={{
            border: currentStatus === 'present' ? '1.5px solid #10b981' : '1.5px solid rgba(255, 255, 255, 0.15)',
            background: currentStatus === 'present' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.02)',
            color: currentStatus === 'present' ? '#10b981' : 'rgba(255, 255, 255, 0.4)'
          }}
        >
          <Check size={13} />
        </button>

        <button
          onClick={() => onToggle('absent')}
          title="Mark Absent"
          className="subject-status-btn"
          style={{
            border: currentStatus === 'absent' ? '1.5px solid #ef4444' : '1.5px solid rgba(255, 255, 255, 0.15)',
            background: currentStatus === 'absent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.02)',
            color: currentStatus === 'absent' ? '#ef4444' : 'rgba(255, 255, 255, 0.4)'
          }}
        >
          <X size={13} />
        </button>

        <button
          onClick={() => onToggle('no_class')}
          title="No Class"
          className="subject-status-btn"
          style={{
            border: currentStatus === 'no_class' ? '1.5px solid #6b7280' : '1.5px solid rgba(255, 255, 255, 0.15)',
            background: currentStatus === 'no_class' ? 'rgba(107, 114, 128, 0.2)' : 'rgba(255, 255, 255, 0.02)',
            color: currentStatus === 'no_class' ? '#6b7280' : 'rgba(255, 255, 255, 0.4)'
          }}
        >
          <Minus size={13} />
        </button>
      </div>
    </div>
  );
};

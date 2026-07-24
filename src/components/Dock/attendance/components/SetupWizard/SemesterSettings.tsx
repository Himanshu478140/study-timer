import { Calendar, Check } from 'lucide-react';
import type { DayOfWeek } from '../../attendanceBlueprint';
import { DayToggleGroup } from './DayToggleGroup';

interface SemesterSettingsProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  targetPercentage: number;
  setTargetPercentage: (val: number) => void;
  workingDays: DayOfWeek[];
  toggleDay: (day: DayOfWeek) => void;
}

export const SemesterSettings = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  targetPercentage,
  setTargetPercentage,
  workingDays,
  toggleDay
}: SemesterSettingsProps) => {
  return (
    <div className="setup-wizard-col col-params" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      {/* Step 1: Semester Dates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} color="var(--color-accent, #8b5cf6)" /> Semester Duration
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '4px' }}>Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '0.68rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '4px' }}>End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '0.68rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* Step 2: Attendance Target */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.85 }}>
          Required Attendance Target
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[75, 80, 85, 90].map(pct => (
            <button
              type="button"
              key={pct}
              onClick={() => setTargetPercentage(pct)}
              style={{
                flex: 1,
                padding: '0.5rem 0',
                borderRadius: '0.6rem',
                border: targetPercentage === pct ? '1px solid var(--color-accent, #8b5cf6)' : '1px solid rgba(255,255,255,0.08)',
                background: targetPercentage === pct ? 'rgba(var(--color-accent-rgb), 0.15)' : 'rgba(255,255,255,0.04)',
                color: targetPercentage === pct ? '#ffffff' : 'rgba(255,255,255,0.7)',
                fontWeight: targetPercentage === pct ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {pct}%
            </button>
          ))}
          <div style={{ width: '65px' }}>
            <input
              type="number"
              min="1"
              max="100"
              value={targetPercentage}
              onChange={e => setTargetPercentage(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                textAlign: 'center',
                borderRadius: '0.6rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* Step 3: Working Days */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.85 }}>
          Working Class Days
        </label>
        <DayToggleGroup selectedDays={workingDays} onToggle={toggleDay} />
      </div>

      {/* Action Save Button */}
      <button
        type="submit"
        style={{
          marginTop: '0.5rem',
          width: '100%',
          padding: '0.8rem',
          borderRadius: '0.8rem',
          border: 'none',
          background: 'var(--color-accent)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 16px rgba(var(--color-accent-rgb), 0.35)',
          transition: 'transform 0.15s ease'
        }}
      >
        <Check size={16} /> Save & Start Tracking
      </button>
    </div>
  );
};

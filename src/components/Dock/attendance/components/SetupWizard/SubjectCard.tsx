import { Trash2 } from 'lucide-react';
import type { TimetableSubject, DayOfWeek } from '../../attendanceBlueprint';
import { DayToggleGroup } from './DayToggleGroup';

interface SubjectCardProps {
  subject: TimetableSubject;
  onDelete: (id: string) => void;
  onToggleDay: (subId: string, day: DayOfWeek) => void;
}

export const SubjectCard = ({ subject, onDelete, onToggleDay }: SubjectCardProps) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '0.75rem',
        padding: '0.6rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject.color }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>{subject.name}</span>
        </div>
        <button
          type="button"
          onClick={() => onDelete(subject.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(239, 68, 68, 0.6)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Days pill toggles */}
      <DayToggleGroup
        selectedDays={subject.days}
        color={subject.color}
        onToggle={day => onToggleDay(subject.id, day)}
      />
    </div>
  );
};

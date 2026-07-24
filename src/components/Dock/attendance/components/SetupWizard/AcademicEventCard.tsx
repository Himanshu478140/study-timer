import { Trash2 } from 'lucide-react';
import type { AcademicEvent } from '../../attendanceBlueprint';
import { EVENT_TYPE_EMOJIS } from '../../data/metadata';
import { formatDateRange } from '../../utils/helpers';

interface AcademicEventCardProps {
  event: AcademicEvent;
  onDelete: (id: string) => void;
}

export const AcademicEventCard = ({ event, onDelete }: AcademicEventCardProps) => {
  const emoji = EVENT_TYPE_EMOJIS[event.type] || '📅';
  const rangeStr = formatDateRange(event.startDate, event.endDate);

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '0.75rem',
        padding: '0.6rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{emoji}</span>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.name}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.45)' }}>
            {rangeStr}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(event.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(239, 68, 68, 0.6)',
          cursor: 'pointer',
          padding: '2px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

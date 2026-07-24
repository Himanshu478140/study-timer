import { DAYS } from '../../data/metadata';
import type { DayOfWeek } from '../../attendanceBlueprint';

interface DayToggleGroupProps {
  selectedDays: DayOfWeek[];
  onToggle: (day: DayOfWeek) => void;
  color?: string; // If supplied, uses the subject theme color, otherwise uses the green class-day accent
}

export const DayToggleGroup = ({ selectedDays, onToggle, color }: DayToggleGroupProps) => {
  return (
    <div style={{ display: 'flex', gap: '0.35rem', width: '100%' }}>
      {DAYS.map(d => {
        const isActive = selectedDays.includes(d.id);

        // Define active borders and backgrounds
        const activeBorder = color ? `1px solid ${color}` : '1px solid #10b981';
        const activeBackground = color ? `${color}33` : 'rgba(16, 185, 129, 0.18)';
        const activeTextColor = color ? '#ffffff' : '#10b981';

        // Fallback inactive states
        const inactiveBorder = '1px solid rgba(255, 255, 255, 0.06)';
        const inactiveBackground = 'rgba(255, 255, 255, 0.02)';
        const inactiveTextColor = 'rgba(255, 255, 255, 0.4)';

        return (
          <button
            type="button"
            key={d.id}
            onClick={() => onToggle(d.id)}
            style={{
              flex: 1,
              padding: color ? '2px 0' : '0.55rem 0',
              borderRadius: color ? '0.4rem' : '0.6rem',
              border: isActive ? activeBorder : inactiveBorder,
              background: isActive ? activeBackground : inactiveBackground,
              color: isActive ? activeTextColor : inactiveTextColor,
              fontWeight: isActive ? 600 : 400,
              fontSize: color ? '0.65rem' : '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
};

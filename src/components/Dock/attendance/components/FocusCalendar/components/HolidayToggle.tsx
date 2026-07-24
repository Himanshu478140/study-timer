import { Check } from 'lucide-react';

interface HolidayToggleProps {
  isHoliday: boolean;
  onToggle: () => void;
}

export const HolidayToggle = ({ isHoliday, onToggle }: HolidayToggleProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isHoliday ? "Unmark as Holiday" : "Mark as Holiday"}
      style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        border: isHoliday ? '1.5px solid #3b82f6' : '1.5px solid rgba(255, 255, 255, 0.25)',
        background: isHoliday ? '#3b82f6' : 'transparent',
        color: isHoliday ? '#ffffff' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isHoliday ? '0 0 10px rgba(59, 130, 246, 0.55)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: 0,
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        if (!isHoliday) {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
          e.currentTarget.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.35)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isHoliday) {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {isHoliday && <Check size={12} strokeWidth={3} />}
    </button>
  );
};

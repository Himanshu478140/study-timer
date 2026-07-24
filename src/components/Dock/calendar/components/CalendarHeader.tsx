import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  viewDate: Date;
  onNav: (direction: 'next' | 'prev') => void;
}

export const CalendarHeader = ({ viewDate, onNav }: CalendarHeaderProps) => {
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long' });
  const yearNum = viewDate.getFullYear();

  return (
    <div className="calendar-header-container">
      <button
        onClick={() => onNav('prev')}
        className="calendar-nav-btn"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="calendar-header-title">
        {monthName} <span>{yearNum}</span>
      </div>

      <button
        onClick={() => onNav('next')}
        className="calendar-nav-btn"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

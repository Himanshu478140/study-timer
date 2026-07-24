import { createPortal } from 'react-dom';
import type { CalendarEvent } from '../utils/calendar';

interface EventTooltipProps {
  x: number;
  y: number;
  event: CalendarEvent;
}

export const EventTooltip = ({ x, y, event }: EventTooltipProps) => {
  return createPortal(
    <div
      className="calendar-tooltip-portal"
      style={{
        left: x,
        top: y,
        background: `
          linear-gradient(
            155deg,
            rgba(28, 28, 35, 0.95),
            rgba(18, 18, 22, 0.95)
          )
        `
      }}
    >
      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{event.title}</div>
      {event.time && (
        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{event.time}</div>
      )}
    </div>,
    document.body
  );
};

import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import type { AcademicEvent, AcademicEventType } from '../../attendanceBlueprint';
import { AcademicEventCard } from './AcademicEventCard';

interface AcademicHolidayProps {
  academicEvents: AcademicEvent[];
  newEventName: string;
  setNewEventName: (val: string) => void;
  newEventStartDate: string;
  setNewEventStartDate: (val: string) => void;
  newEventEndDate: string;
  setNewEventEndDate: (val: string) => void;
  newEventType: AcademicEventType;
  setNewEventType: (val: AcademicEventType) => void;
  handleAddEvent: () => void;
  handleDeleteEvent: (id: string) => void;
}

export const AcademicHoliday = ({
  academicEvents,
  newEventName,
  setNewEventName,
  newEventStartDate,
  setNewEventStartDate,
  newEventEndDate,
  setNewEventEndDate,
  newEventType,
  setNewEventType,
  handleAddEvent,
  handleDeleteEvent
}: AcademicHolidayProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="setup-wizard-col col-calendar" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Calendar size={14} color="var(--color-accent, #8b5cf6)" /> Academic Calendar & Breaks
      </label>

      {/* Event List */}
      <div className="custom-scrollbar" style={{
        maxHeight: '260px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingRight: '4px'
      }}>
        {academicEvents.length === 0 ? (
          <div style={{
            padding: '1.5rem 1rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.8rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '0.75rem'
          }}>
            No academic events/breaks added yet. Use the form below to configure breaks.
          </div>
        ) : (
          academicEvents.map(event => (
            <AcademicEventCard
              key={event.id}
              event={event}
              onDelete={handleDeleteEvent}
            />
          ))
        )}
      </div>

      {/* Add Event Form Block */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '0.85rem',
        padding: '0.6rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginTop: '0.25rem'
      }}>
        <input
          type="text"
          placeholder="Event Title (e.g. Summer Break)"
          value={newEventName}
          onChange={e => setNewEventName(e.target.value)}
          style={{
            padding: '0.45rem 0.6rem',
            borderRadius: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '0.775rem',
            outline: 'none',
            boxSizing: 'border-box',
            width: '100%'
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.6rem', opacity: 0.45, display: 'block', marginBottom: '2px' }}>Start</span>
            <input
              type="date"
              value={newEventStartDate}
              onChange={e => setNewEventStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.5rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.725rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: '0.6rem', opacity: 0.45, display: 'block', marginBottom: '2px' }}>End</span>
            <input
              type="date"
              value={newEventEndDate}
              onChange={e => setNewEventEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.5rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.725rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', position: 'relative' }}>
          {isDropdownOpen && (
            <div
              onClick={() => setIsDropdownOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999
              }}
            />
          )}

          <div style={{ position: 'relative', flex: 1, zIndex: 1000 }}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.75rem',
                outline: 'none',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>
                  {newEventType === 'break' && '🏖️'}
                  {newEventType === 'holiday' && '🇮🇳'}
                  {newEventType === 'exam' && '📝'}
                  {newEventType === 'internship' && '🏢'}
                  {newEventType === 'other' && '📅'}
                </span>
                <span style={{ textTransform: 'capitalize' }}>
                  {newEventType === 'exam' ? 'Exams' : newEventType}
                </span>
              </span>
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  opacity: 0.6
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 0.35rem)',
                  left: 0,
                  right: 0,
                  background: 'rgba(15, 15, 18, 0.98)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.6rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  animation: 'dashboardFadeIn 0.2s ease-out',
                  boxSizing: 'border-box'
                }}
              >
                {([
                  { val: 'break', label: 'Break', emoji: '🏖️' },
                  { val: 'holiday', label: 'Holiday', emoji: '🇮🇳' },
                  { val: 'exam', label: 'Exams', emoji: '📝' },
                  { val: 'internship', label: 'Internship', emoji: '🏢' },
                  { val: 'other', label: 'Other', emoji: '📅' }
                ] as const).map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setNewEventType(opt.val);
                      setIsDropdownOpen(false);
                    }}
                    className="custom-dropdown-option"
                    style={{
                      padding: '0.45rem 0.6rem',
                      borderRadius: '0.4rem',
                      background: newEventType === opt.val ? 'rgba(var(--color-accent-rgb), 0.12)' : 'transparent',
                      color: newEventType === opt.val ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.8)',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: newEventType === opt.val ? 600 : 400,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddEvent}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'var(--color-accent)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              flexShrink: 0
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

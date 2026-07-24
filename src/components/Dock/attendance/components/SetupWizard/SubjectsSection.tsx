import { BookOpen, Plus } from 'lucide-react';
import type { TimetableSubject, DayOfWeek } from '../../attendanceBlueprint';
import { SubjectCard } from './SubjectCard';

interface SubjectsSectionProps {
  subjects: TimetableSubject[];
  newSubName: string;
  setNewSubName: (val: string) => void;
  handleAddSubject: () => void;
  handleDeleteSubject: (id: string) => void;
  toggleSubjectDay: (subId: string, day: DayOfWeek) => void;
}

export const SubjectsSection = ({
  subjects,
  newSubName,
  setNewSubName,
  handleAddSubject,
  handleDeleteSubject,
  toggleSubjectDay
}: SubjectsSectionProps) => {
  return (
    <div className="setup-wizard-col col-timetable" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <BookOpen size={14} color="var(--color-accent, #8b5cf6)" /> College Timetable & Subjects
      </label>

      {/* Subject List */}
      <div className="custom-scrollbar" style={{
        maxHeight: '260px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingRight: '4px'
      }}>
        {subjects.length === 0 ? (
          <div style={{
            padding: '1.5rem 1rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.8rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '0.75rem'
          }}>
            No subjects added yet. Type a subject name below and click + Add.
          </div>
        ) : (
          subjects.map(sub => (
            <SubjectCard
              key={sub.id}
              subject={sub}
              onDelete={handleDeleteSubject}
              onToggleDay={toggleSubjectDay}
            />
          ))
        )}
      </div>

      {/* Add Subject Input */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <input
          type="text"
          placeholder="Add subject (e.g. Data Structures)"
          value={newSubName}
          onChange={e => setNewSubName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSubject();
            }
          }}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            borderRadius: '0.6rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '0.8rem',
            outline: 'none'
          }}
        />
        <button
          type="button"
          onClick={handleAddSubject}
          style={{
            padding: '0.5rem 0.85rem',
            borderRadius: '0.6rem',
            border: 'none',
            background: 'var(--color-accent)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
};

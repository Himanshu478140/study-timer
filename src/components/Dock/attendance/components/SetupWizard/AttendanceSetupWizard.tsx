import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAttendance } from '../../AttendanceContext';
import type { SemesterConfig, DayOfWeek, TimetableSubject, AcademicEvent, AcademicEventType } from '../../attendanceBlueprint';
import { SemesterSettings } from './SemesterSettings';
import { SubjectsSection } from './SubjectsSection';
import { AcademicHoliday } from './AcademicHoliday';
import { SUBJECT_COLORS } from '../../utils/helpers';

interface AttendanceSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceSetupWizard = ({ isOpen, onClose }: AttendanceSetupWizardProps) => {
  const { config, saveSemesterConfig } = useAttendance();

  // Pre-fill defaults or existing config
  const today = new Date();
  const defaultStart = config?.startDate || today.toISOString().split('T')[0];

  const defaultEndObj = new Date(today);
  defaultEndObj.setMonth(defaultEndObj.getMonth() + 4);
  const defaultEnd = config?.endDate || defaultEndObj.toISOString().split('T')[0];

  // Primary Configuration State
  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [targetPercentage, setTargetPercentage] = useState<number>(config?.targetPercentage || 75);
  const [workingDays, setWorkingDays] = useState<DayOfWeek[]>(config?.workingDays || [1, 2, 3, 4, 5]);
  const [subjects, setSubjects] = useState<TimetableSubject[]>(config?.subjects || []);
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>(config?.academicEvents || []);

  // Helper local form states
  const [newSubName, setNewSubName] = useState<string>('');
  const [newEventName, setNewEventName] = useState<string>('');
  const [newEventStartDate, setNewEventStartDate] = useState<string>(today.toISOString().split('T')[0]);
  const [newEventEndDate, setNewEventEndDate] = useState<string>(today.toISOString().split('T')[0]);
  const [newEventType, setNewEventType] = useState<AcademicEventType>('break');

  useEffect(() => {
    if (isOpen) {
      setStartDate(config?.startDate || defaultStart);
      setEndDate(config?.endDate || defaultEnd);
      setTargetPercentage(config?.targetPercentage || 75);
      setWorkingDays(config?.workingDays || [1, 2, 3, 4, 5]);
      setSubjects(config?.subjects ? config.subjects.filter(s => !['sub-1', 'sub-2', 'sub-3', 'sub-4', 'sub-5'].includes(s.id)) : []);
      setAcademicEvents(config?.academicEvents || []);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // State handlers
  const toggleDay = (day: DayOfWeek) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const toggleSubjectDay = (subId: string, day: DayOfWeek) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subId) return s;
      const days = s.days.includes(day)
        ? s.days.filter(d => d !== day)
        : [...s.days, day].sort();
      return { ...s, days };
    }));
  };

  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    const newSub: TimetableSubject = {
      id: 'subject-' + Date.now(),
      name: newSubName.trim(),
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
      days: [1, 2, 3, 4, 5]
    };
    setSubjects(prev => [...prev, newSub]);
    setNewSubName('');
  };

  const handleDeleteSubject = (subId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subId));
  };

  const handleAddEvent = () => {
    if (!newEventName.trim() || !newEventStartDate || !newEventEndDate) return;
    const newEvent: AcademicEvent = {
      id: 'event-' + Date.now(),
      name: newEventName.trim(),
      startDate: newEventStartDate,
      endDate: newEventEndDate,
      type: newEventType
    };
    setAcademicEvents(prev => [...prev, newEvent].sort((a, b) => a.startDate.localeCompare(b.startDate)));
    setNewEventName('');
  };

  const handleDeleteEvent = (eventId: string) => {
    setAcademicEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const newConfig: SemesterConfig = {
      startDate,
      endDate,
      targetPercentage: Math.min(100, Math.max(1, targetPercentage)),
      workingDays,
      holidays: config?.holidays || [],
      subjects,
      academicEvents
    };

    saveSemesterConfig(newConfig, 'Active Semester');
    onClose();
  };

  return (
    <div
      className="attendance-setup-wizard"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100005,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        padding: '1rem'
      }}
    >
      <div
        className="attendance-setup-wizard-container custom-scrollbar"
        style={{
          background: 'linear-gradient(180deg, #111113 0%, #09090b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '1.5rem',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(var(--color-accent-rgb), 0.15)',
          position: 'relative',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* Top Accent Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90px',
          height: '3px',
          background: 'var(--color-accent, #8b5cf6)',
          borderBottomLeftRadius: '3px',
          borderBottomRightRadius: '3px',
          boxShadow: '0 0 12px var(--color-accent, #8b5cf6)'
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Semester Setup</h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="attendance-setup-form">
          <SemesterSettings
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            targetPercentage={targetPercentage}
            setTargetPercentage={setTargetPercentage}
            workingDays={workingDays}
            toggleDay={toggleDay}
          />

          <SubjectsSection
            subjects={subjects}
            newSubName={newSubName}
            setNewSubName={setNewSubName}
            handleAddSubject={handleAddSubject}
            handleDeleteSubject={handleDeleteSubject}
            toggleSubjectDay={toggleSubjectDay}
          />

          <AcademicHoliday
            academicEvents={academicEvents}
            newEventName={newEventName}
            setNewEventName={setNewEventName}
            newEventStartDate={newEventStartDate}
            setNewEventStartDate={setNewEventStartDate}
            newEventEndDate={newEventEndDate}
            setNewEventEndDate={setNewEventEndDate}
            newEventType={newEventType}
            setNewEventType={setNewEventType}
            handleAddEvent={handleAddEvent}
            handleDeleteEvent={handleDeleteEvent}
          />
        </form>
      </div>
    </div>
  );
};

import { useState, useMemo } from 'react';
import { useHabits } from '../../../../../Offlinebackup/localstorage/HabitsContext';
import { useAttendance, getActiveSubjects } from '../..';
import { SubjectSchedule } from './components/SubjectSchedule';
import {
  CalendarHeader,
  WeeklyStrip,
  EventTooltip,
  useSelectedDate,
  useWeekDates,
  useCalendarTooltip,
  getEvent
} from '../../../calendar';
import '../../../calendar/styles/calendar.css';

export const FocusCalendar = () => {
  const { resolveDate, config, records, recordSubjectAttendance, stats, toggleHoliday } = useAttendance();
  const { events } = useHabits();

  // --- HOOKS ---
  const {
    viewDate,
    selectedDate,
    setSelectedDate,
    selectedDateStr,
    selectedDayOfWeek,
    selectedDateLabel,
    handleNav
  } = useSelectedDate();

  const weekDates = useWeekDates(viewDate);

  const {
    tooltipData,
    handleMouseEnterNode,
    handleMouseLeaveNode
  } = useCalendarTooltip((date) => getEvent(date, events));

  // Fallback local status state for unconfigured mode
  const [localSubjectStatuses, setLocalSubjectStatuses] = useState<Record<string, 'present' | 'absent' | 'no_class'>>({
    'sub-1': 'present',
    'sub-2': 'absent'
  });

  const activeSubjects = useMemo(() => {
    return getActiveSubjects(config?.subjects, selectedDayOfWeek);
  }, [config, selectedDayOfWeek]);

  const handleSubjectToggle = (subId: string, status: 'present' | 'absent' | 'no_class') => {
    if (config) {
      recordSubjectAttendance(selectedDateStr, subId, status);
    } else {
      setLocalSubjectStatuses(prev => {
        const current = prev[subId];
        if (current === status) {
          const copy = { ...prev };
          delete copy[subId];
          return copy;
        }
        return { ...prev, [subId]: status };
      });
    }
  };

  return (
    <>
      <div className="widget-card focus-calendar-card">
        {/* --- TOP ACCENT BAR --- */}
        <div className="focus-calendar-accent-bar" />

        {/* --- HEADER --- */}
        <CalendarHeader viewDate={viewDate} onNav={handleNav} />

        {/* --- WEEKLY STRIP VIEW --- */}
        <WeeklyStrip
          weekDates={weekDates}
          selectedDate={selectedDate}
          events={events}
          onDateClick={setSelectedDate}
          onMouseEnterNode={handleMouseEnterNode}
          onMouseLeaveNode={handleMouseLeaveNode}
          resolveDate={resolveDate}
        />

        {/* --- SUBJECT SCHEDULE CARDS --- */}
        <SubjectSchedule
          selectedDateLabel={selectedDateLabel}
          selectedDateStr={selectedDateStr}
          activeSubjects={activeSubjects}
          records={records}
          localSubjectStatuses={localSubjectStatuses}
          stats={stats}
          config={config}
          resolveDate={resolveDate}
          toggleHoliday={toggleHoliday}
          handleSubjectToggle={handleSubjectToggle}
        />
      </div>

      {/* TOOLTIP */}
      {tooltipData && (
        <EventTooltip
          x={tooltipData.x}
          y={tooltipData.y}
          event={tooltipData.event}
        />
      )}
    </>
  );
};

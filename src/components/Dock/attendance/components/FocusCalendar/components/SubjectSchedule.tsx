import type { TimetableSubject, SubjectAttendanceSlot } from '../../..';
import { SubjectCard } from './SubjectCard';
import { EmptySchedule } from './EmptySchedule';
import { HolidayToggle } from './HolidayToggle';

interface SubjectScheduleProps {
  selectedDateLabel: string;
  selectedDateStr: string;
  activeSubjects: TimetableSubject[];
  records: any;
  localSubjectStatuses: Record<string, 'present' | 'absent' | 'no_class'>;
  stats: any;
  config: any;
  resolveDate: (dateStr: string) => { status: string; effectiveColor: string; label: string };
  toggleHoliday: (dateStr: string) => void;
  handleSubjectToggle: (subId: string, status: 'present' | 'absent' | 'no_class') => void;
}

export const SubjectSchedule = ({
  selectedDateLabel,
  selectedDateStr,
  activeSubjects,
  records,
  localSubjectStatuses,
  stats,
  config,
  resolveDate,
  toggleHoliday,
  handleSubjectToggle
}: SubjectScheduleProps) => {
  const resolved = resolveDate(selectedDateStr);
  const isHoliday = resolved.status === 'holiday';

  return (
    <div className="subject-schedule-container">
      <div className="subject-schedule-header">
        <span className="subject-schedule-title">
          Subject Schedule ({selectedDateLabel})
        </span>
        {config && (
          <HolidayToggle
            isHoliday={isHoliday}
            onToggle={() => toggleHoliday(selectedDateStr)}
          />
        )}
      </div>

      <div className="subject-scroll-area custom-scrollbar">
        {activeSubjects.length === 0 ? (
          <EmptySchedule
            message={
              isHoliday
                ? resolved.label
                : 'No classes scheduled for this day'
            }
          />
        ) : (
          activeSubjects.map(item => {
            const recordSlot = records[selectedDateStr]?.subjects?.find(
              (s: SubjectAttendanceSlot) => s.subjectId === item.id
            );
            const currentStatus = recordSlot
              ? recordSlot.status
              : (localSubjectStatuses[item.id] || null);
            const subStat = stats.subjectStats?.[item.id];

            return (
              <SubjectCard
                key={item.id}
                subject={item}
                currentStatus={currentStatus}
                subjectStats={subStat}
                onToggle={status => handleSubjectToggle(item.id, status)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

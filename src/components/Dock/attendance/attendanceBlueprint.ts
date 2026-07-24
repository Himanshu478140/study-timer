export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sun, 1 = Mon ... 6 = Sat

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday' | 'no_class';

export type ResolvedStatusType = 
  | 'present'     // User marked Present 🟢
  | 'absent'      // User marked Absent 🔴
  | 'leave'       // User marked Leave 🟡
  | 'holiday'     // Configured or user Holiday 🔵
  | 'no_class'    // User marked No Class ⚪
  | 'weekend'     // Auto-derived non-working day 🔘
  | 'unmarked'    // Past working day pending mark ⚠️
  | 'future';     // Future working day 📅

export interface SubjectAttendanceSlot {
  subjectId: string;
  status: AttendanceStatus;
}

export interface DailyAttendanceRecord {
  date: string; // ISO format "YYYY-MM-DD"
  status: AttendanceStatus;
  updatedAt: string; // ISO Timestamp
  subjects?: SubjectAttendanceSlot[]; // Extensibility hook for subject-wise tracking
}

export interface TimetableSubject {
  id: string;
  name: string;
  color: string;
  days: DayOfWeek[]; // e.g. [1, 2, 3, 4, 5]
}

export type AcademicEventType = 'break' | 'holiday' | 'exam' | 'internship' | 'other';

export interface AcademicEvent {
  id: string;
  name: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD" (inclusive)
  type: AcademicEventType;
}

export interface SemesterConfig {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  targetPercentage: number; // Default: 75
  workingDays: DayOfWeek[]; // e.g. [1, 2, 3, 4, 5]
  holidays: string[]; // Array of "YYYY-MM-DD"
  subjects?: TimetableSubject[];
  academicEvents?: AcademicEvent[];
}

export interface AttendanceSemester {
  id: string;
  name: string; // e.g., "Semester 1"
  config: SemesterConfig;
  records: Record<string, DailyAttendanceRecord>; // Keyed by "YYYY-MM-DD"
}

export interface AttendanceStoreSchema {
  version: 1;
  activeSemesterId: string | null;
  semesters: Record<string, AttendanceSemester>;
}

export interface ResolvedDayStatus {
  dateStr: string;
  status: ResolvedStatusType;
  isWorkingDay: boolean;
  countsTowardAttendance: boolean;
  source: 'user_override' | 'config_holiday' | 'derived_weekend' | 'unmarked_working' | 'future_working';
  effectiveColor: string;
  label: string;
}

export interface SubjectAttendanceStats {
  subjectId: string;
  presentCount: number;
  absentCount: number;
  noClassCount: number; // Cancelled classes
  currentPercentage: number;
  maxClassesCanMiss: number;
  mustAttendNextY: number;
  remainingClassDays: number;
  totalScheduledCount: number;
}

export interface AttendanceSummaryStats {
  totalSemesterDays: number;
  validClassDays: number;
  elapsedClassDays: number;
  remainingClassDays: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  holidayCount: number;
  currentPercentage: number;
  maxClassesCanMiss: number;
  mustAttendNextY: number;
  maxProjectedPercentage: number;
  isUnconfigured: boolean;
  subjectStats?: Record<string, SubjectAttendanceStats>;
}

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  AttendanceStatus,
  SemesterConfig,
  AttendanceSemester,
  AttendanceStoreSchema,
  ResolvedDayStatus,
  AttendanceSummaryStats,
  DailyAttendanceRecord
} from './attendanceBlueprint';
import {
  resolveDayStatus,
  calculateAttendanceStats,
  getTodayStr
} from './utils/engine';

const STORAGE_KEY = 'focora-attendance-v1';

interface AttendanceContextType {
  activeSemester: AttendanceSemester | null;
  records: Record<string, DailyAttendanceRecord>;
  config: SemesterConfig | null;
  stats: AttendanceSummaryStats;
  isUnconfigured: boolean;
  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;
  recordAttendance: (date: string, status: AttendanceStatus) => void;
  recordSubjectAttendance: (date: string, subjectId: string, status: 'present' | 'absent' | 'no_class') => void;
  deleteAttendance: (date: string) => void;
  saveSemesterConfig: (config: SemesterConfig, name?: string) => void;
  resolveDate: (dateStr: string) => ResolvedDayStatus;
  toggleHoliday: (date: string) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const getDefaultStore = (): AttendanceStoreSchema => {
  return {
    version: 1,
    activeSemesterId: null,
    semesters: {}
  };
};

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<AttendanceStoreSchema>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.version === 1 && parsed.semesters) {
          // Clean legacy mock subjects from existing stored semesters
          Object.keys(parsed.semesters).forEach(semId => {
            const sem = parsed.semesters[semId];
            if (sem?.config?.subjects) {
              sem.config.subjects = sem.config.subjects.filter((s: any) =>
                !['sub-1', 'sub-2', 'sub-3', 'sub-4', 'sub-5'].includes(s.id) &&
                !s.name.includes('Linear Algebra') &&
                !s.name.includes('Electromagnetism') &&
                !s.name.includes('Data Structures') &&
                !s.name.includes('Organic Chemistry') &&
                !s.name.includes('Modernism')
              );
            }
          });
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse attendance storage:', e);
      }
    }
    return getDefaultStore();
  });

  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  // Derived Active Semester
  const activeSemester = useMemo(() => {
    if (!store.activeSemesterId || !store.semesters[store.activeSemesterId]) {
      return null;
    }
    return store.semesters[store.activeSemesterId];
  }, [store]);

  const config = activeSemester?.config || null;
  const records = activeSemester?.records || {};

  const isUnconfigured = !activeSemester || !config || !config.startDate || !config.endDate;

  // Memoized stats calculation
  const stats = useMemo(() => {
    return calculateAttendanceStats(config, records);
  }, [config, records]);

  // Resolver helper
  const resolveDate = (dateStr: string): ResolvedDayStatus => {
    return resolveDayStatus(dateStr, config, records, getTodayStr());
  };

  // Record Attendance Status (or clear if toggled same status)
  const recordAttendance = (date: string, status: AttendanceStatus) => {
    if (!store.activeSemesterId || !store.semesters[store.activeSemesterId]) {
      // If unconfigured, open setup wizard
      setIsWizardOpen(true);
      return;
    }

    const currentSemesterId = store.activeSemesterId;

    setStore(prev => {
      const currentSem = prev.semesters[currentSemesterId];
      if (!currentSem) return prev;

      const existingRecord = currentSem.records[date];
      const updatedRecords = { ...currentSem.records };

      // If user clicks the exact same status, clear it
      if (existingRecord && existingRecord.status === status) {
        delete updatedRecords[date];
      } else {
        updatedRecords[date] = {
          date,
          status,
          updatedAt: new Date().toISOString()
        };
      }

      return {
        ...prev,
        semesters: {
          ...prev.semesters,
          [currentSemesterId]: {
            ...currentSem,
            records: updatedRecords
          }
        }
      };
    });
  };

  // Delete Attendance Record for Date
  const deleteAttendance = (date: string) => {
    if (!store.activeSemesterId) return;
    const currentSemesterId = store.activeSemesterId;

    setStore(prev => {
      const currentSem = prev.semesters[currentSemesterId];
      if (!currentSem || !currentSem.records[date]) return prev;

      const updatedRecords = { ...currentSem.records };
      delete updatedRecords[date];

      return {
        ...prev,
        semesters: {
          ...prev.semesters,
          [currentSemesterId]: {
            ...currentSem,
            records: updatedRecords
          }
        }
      };
    });
  };

  // Save / Update Semester Config
  const saveSemesterConfig = (newConfig: SemesterConfig, name: string = 'Semester 1') => {
    setStore(prev => {
      let semesterId = prev.activeSemesterId;
      if (!semesterId) {
        semesterId = 'sem_' + Date.now();
      }

      const existingSem = prev.semesters[semesterId];

      const updatedSem: AttendanceSemester = {
        id: semesterId,
        name: existingSem?.name || name,
        config: newConfig,
        records: existingSem?.records || {}
      };

      return {
        ...prev,
        activeSemesterId: semesterId,
        semesters: {
          ...prev.semesters,
          [semesterId]: updatedSem
        }
      };
    });

    setIsWizardOpen(false);
  };

  // Record Subject Attendance Status
  const recordSubjectAttendance = (date: string, subjectId: string, status: 'present' | 'absent' | 'no_class') => {
    if (!store.activeSemesterId || !store.semesters[store.activeSemesterId]) return;
    const currentSemesterId = store.activeSemesterId;

    setStore(prev => {
      const currentSem = prev.semesters[currentSemesterId];
      if (!currentSem) return prev;

      const existingRecord = currentSem.records[date] || {
        date,
        status: 'present',
        updatedAt: new Date().toISOString(),
        subjects: []
      };

      const currentSlots = existingRecord.subjects || [];
      const existingSlot = currentSlots.find(s => s.subjectId === subjectId);
      let updatedSlots: any[] = [];

      if (existingSlot && existingSlot.status === status) {
        updatedSlots = currentSlots.filter(s => s.subjectId !== subjectId);
      } else {
        updatedSlots = [
          ...currentSlots.filter(s => s.subjectId !== subjectId),
          { subjectId, status }
        ];
      }

      return {
        ...prev,
        semesters: {
          ...prev.semesters,
          [currentSemesterId]: {
            ...currentSem,
            records: {
              ...currentSem.records,
              [date]: {
                ...existingRecord,
                subjects: updatedSlots,
                updatedAt: new Date().toISOString()
              }
            }
          }
        }
      };
    });
  };

  const toggleHoliday = (date: string) => {
    if (!store.activeSemesterId || !store.semesters[store.activeSemesterId]) return;
    const currentSemesterId = store.activeSemesterId;

    setStore(prev => {
      const currentSem = prev.semesters[currentSemesterId];
      if (!currentSem) return prev;

      const currentHolidays = currentSem.config.holidays || [];
      const isHoliday = currentHolidays.includes(date);
      const updatedHolidays = isHoliday
        ? currentHolidays.filter(d => d !== date)
        : [...currentHolidays, date].sort();

      return {
        ...prev,
        semesters: {
          ...prev.semesters,
          [currentSemesterId]: {
            ...currentSem,
            config: {
              ...currentSem.config,
              holidays: updatedHolidays
            }
          }
        }
      };
    });
  };

  return (
    <AttendanceContext.Provider
      value={{
        activeSemester,
        records,
        config,
        stats,
        isUnconfigured,
        isWizardOpen,
        setIsWizardOpen,
        recordAttendance,
        recordSubjectAttendance,
        deleteAttendance,
        saveSemesterConfig,
        resolveDate,
        toggleHoliday
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

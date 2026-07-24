import type {
  AttendanceStatus,
  SemesterConfig,
  DailyAttendanceRecord,
  ResolvedDayStatus,
  AttendanceSummaryStats,
  DayOfWeek,
  SubjectAttendanceStats
} from '../attendanceBlueprint';

export const STATUS_CONFIG: Record<AttendanceStatus | 'weekend' | 'unmarked' | 'future', { label: string; color: string; icon: string }> = {
  present: { label: 'Present', color: '#10b981', icon: '🟢' },
  absent: { label: 'Absent', color: '#ef4444', icon: '🔴' },
  leave: { label: 'Leave', color: '#f59e0b', icon: '🟡' },
  holiday: { label: 'Holiday', color: '#3b82f6', icon: '🔵' },
  no_class: { label: 'No Class', color: 'rgba(255, 255, 255, 0.4)', icon: '⚪' },
  weekend: { label: 'Weekend', color: 'transparent', icon: '🔘' },
  unmarked: { label: 'Unmarked', color: 'transparent', icon: '⚠️' },
  future: { label: 'Class Day', color: 'transparent', icon: '📅' }
};

/**
 * Returns today's local date in YYYY-MM-DD string format
 */
export const getTodayStr = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Helper to resolve the day's status from subject logs when subjects are configured
 */
export const getDerivedSubjectDayStatus = (
  dateStr: string,
  config: SemesterConfig,
  records: Record<string, DailyAttendanceRecord>,
  todayStr: string
): ResolvedDayStatus | null => {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay() as DayOfWeek;

  const isHoliday = config.holidays.includes(dateStr);
  const matchingEvent = config.academicEvents?.find(
    e => e.startDate <= dateStr && dateStr <= e.endDate
  );

  if (isHoliday || matchingEvent) {
    const label = matchingEvent ? matchingEvent.name : STATUS_CONFIG.holiday.label;
    return {
      dateStr,
      status: 'holiday',
      isWorkingDay: false,
      countsTowardAttendance: false,
      source: 'config_holiday',
      effectiveColor: STATUS_CONFIG.holiday.color,
      label
    };
  }

  const subjects = config.subjects || [];
  const scheduledSubjects = subjects.filter(sub => sub.days.includes(dayOfWeek));

  if (scheduledSubjects.length === 0) {
    const isWorking = config.workingDays.includes(dayOfWeek);
    if (isWorking) {
      return {
        dateStr,
        status: 'no_class',
        isWorkingDay: true,
        countsTowardAttendance: false,
        source: 'derived_weekend',
        effectiveColor: STATUS_CONFIG.no_class.color,
        label: 'No Classes Scheduled'
      };
    } else {
      return {
        dateStr,
        status: 'weekend',
        isWorkingDay: false,
        countsTowardAttendance: false,
        source: 'derived_weekend',
        effectiveColor: STATUS_CONFIG.weekend.color,
        label: STATUS_CONFIG.weekend.label
      };
    }
  }

  const subjectRecords = records[dateStr]?.subjects || [];

  let presentCount = 0;
  let absentCount = 0;
  let noClassCount = 0;
  let unmarkedCount = 0;

  for (const sub of scheduledSubjects) {
    const slot = subjectRecords.find(s => s.subjectId === sub.id);
    if (slot) {
      if (slot.status === 'present') presentCount++;
      else if (slot.status === 'absent') absentCount++;
      else if (slot.status === 'no_class') noClassCount++;
    } else {
      unmarkedCount++;
    }
  }

  const isWorking = config.workingDays.includes(dayOfWeek);

  // If any scheduled class is present, mark the day as overall Present
  if (presentCount > 0) {
    return {
      dateStr,
      status: 'present',
      isWorkingDay: isWorking,
      countsTowardAttendance: true,
      source: 'user_override',
      effectiveColor: STATUS_CONFIG.present.color,
      label: 'Present'
    };
  }

  // If no classes are present, but at least one class is absent, mark overall as Absent
  if (absentCount > 0) {
    return {
      dateStr,
      status: 'absent',
      isWorkingDay: isWorking,
      countsTowardAttendance: true,
      source: 'user_override',
      effectiveColor: STATUS_CONFIG.absent.color,
      label: 'Absent'
    };
  }

  // If all scheduled classes were cancelled (no_class)
  if (noClassCount === scheduledSubjects.length) {
    return {
      dateStr,
      status: 'no_class',
      isWorkingDay: isWorking,
      countsTowardAttendance: false,
      source: 'user_override',
      effectiveColor: STATUS_CONFIG.no_class.color,
      label: 'Classes Cancelled'
    };
  }

  // If there are unmarked classes
  if (unmarkedCount > 0) {
    if (dateStr <= todayStr) {
      return {
        dateStr,
        status: 'unmarked',
        isWorkingDay: isWorking,
        countsTowardAttendance: false,
        source: 'unmarked_working',
        effectiveColor: STATUS_CONFIG.unmarked.color,
        label: 'Unmarked Class(es)'
      };
    } else {
      return {
        dateStr,
        status: 'future',
        isWorkingDay: isWorking,
        countsTowardAttendance: false,
        source: 'future_working',
        effectiveColor: 'transparent',
        label: 'Future Classes'
      };
    }
  }

  // Mixed/default case
  return {
    dateStr,
    status: 'present',
    isWorkingDay: isWorking,
    countsTowardAttendance: true,
    source: 'user_override',
    effectiveColor: STATUS_CONFIG.present.color,
    label: 'Attended'
  };
};

/**
 * Single Source of Truth Date Status Resolver
 */
export const resolveDayStatus = (
  dateStr: string,
  config: SemesterConfig | null,
  records: Record<string, DailyAttendanceRecord>,
  todayStr: string = getTodayStr()
): ResolvedDayStatus => {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay() as DayOfWeek;

  // If no semester is configured
  if (!config) {
    return {
      dateStr,
      status: 'future',
      isWorkingDay: false,
      countsTowardAttendance: false,
      source: 'future_working',
      effectiveColor: 'transparent',
      label: 'Class Day'
    };
  }

  // Prioritize subject-wise derived status if subjects exist
  if (config.subjects && config.subjects.length > 0) {
    const derived = getDerivedSubjectDayStatus(dateStr, config, records, todayStr);
    if (derived) return derived;
  }

  // Fallback to legacy/daily-level logic
  // 1. Explicit user override record
  if (records[dateStr]) {
    const status = records[dateStr].status;
    const isWorking = config.workingDays.includes(dayOfWeek);
    return {
      dateStr,
      status,
      isWorkingDay: isWorking,
      countsTowardAttendance: status === 'present' || status === 'absent',
      source: 'user_override',
      effectiveColor: STATUS_CONFIG[status].color,
      label: STATUS_CONFIG[status].label
    };
  }

  // 2. Configured Holiday in Semester Settings
  const matchingEvent = config.academicEvents?.find(
    e => e.startDate <= dateStr && dateStr <= e.endDate
  );
  if (config.holidays.includes(dateStr) || matchingEvent) {
    const label = matchingEvent ? matchingEvent.name : STATUS_CONFIG.holiday.label;
    return {
      dateStr,
      status: 'holiday',
      isWorkingDay: false,
      countsTowardAttendance: false,
      source: 'config_holiday',
      effectiveColor: STATUS_CONFIG.holiday.color,
      label
    };
  }

  // 3. Auto-derived Weekend / Non-working Day
  if (!config.workingDays.includes(dayOfWeek)) {
    return {
      dateStr,
      status: 'weekend',
      isWorkingDay: false,
      countsTowardAttendance: false,
      source: 'derived_weekend',
      effectiveColor: STATUS_CONFIG.weekend.color,
      label: STATUS_CONFIG.weekend.label
    };
  }

  // 4. Past or Today working day without explicit mark
  if (dateStr <= todayStr) {
    return {
      dateStr,
      status: 'unmarked',
      isWorkingDay: true,
      countsTowardAttendance: false,
      source: 'unmarked_working',
      effectiveColor: STATUS_CONFIG.unmarked.color,
      label: STATUS_CONFIG.unmarked.label
    };
  }

  // 5. Future working class day
  return {
    dateStr,
    status: 'future',
    isWorkingDay: true,
    countsTowardAttendance: false,
    source: 'future_working',
    effectiveColor: 'transparent',
    label: STATUS_CONFIG.future.label
  };
};

/**
 * Generates an array of YYYY-MM-DD strings for a date range inclusive
 */
export const getDatesInRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  if (!startDate || !endDate || startDate > endDate) return dates;

  const curr = new Date(startDate + 'T00:00:00');
  const last = new Date(endDate + 'T00:00:00');

  while (curr <= last) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    curr.setDate(curr.getDate() + 1);
  }

  return dates;
};

export const calculateAttendanceStats = (
  config: SemesterConfig | null,
  records: Record<string, DailyAttendanceRecord>,
  todayStr: string = getTodayStr()
): AttendanceSummaryStats => {
  const emptyStats: AttendanceSummaryStats = {
    totalSemesterDays: 0,
    validClassDays: 0,
    elapsedClassDays: 0,
    remainingClassDays: 0,
    presentCount: 0,
    absentCount: 0,
    leaveCount: 0,
    holidayCount: 0,
    currentPercentage: 100,
    maxClassesCanMiss: 0,
    mustAttendNextY: 0,
    maxProjectedPercentage: 100,
    isUnconfigured: true
  };

  if (!config || !config.startDate || !config.endDate) {
    return emptyStats;
  }

  const allDates = getDatesInRange(config.startDate, config.endDate);
  if (allDates.length === 0) return emptyStats;

  const subjects = config.subjects || [];

  if (subjects.length > 0) {
    const subjectStats: Record<string, SubjectAttendanceStats> = {};

    // Initialize subjectStats map
    for (const sub of subjects) {
      subjectStats[sub.id] = {
        subjectId: sub.id,
        presentCount: 0,
        absentCount: 0,
        noClassCount: 0,
        currentPercentage: 100,
        maxClassesCanMiss: 0,
        mustAttendNextY: 0,
        remainingClassDays: 0,
        totalScheduledCount: 0
      };
    }

    let holidayCount = 0;
    let validClassDays = 0;
    let elapsedClassDays = 0;
    let remainingClassDays = 0;

    let overallPresent = 0;
    let overallAbsent = 0;
    let overallRemaining = 0;

    for (const d of allDates) {
      const dateObj = new Date(d + 'T00:00:00');
      const dayOfWeek = dateObj.getDay() as DayOfWeek;
      const matchingEvent = config.academicEvents?.find(
        e => e.startDate <= d && d <= e.endDate
      );
      const isHoliday = config.holidays.includes(d) || !!matchingEvent;

      if (isHoliday) {
        holidayCount++;
        continue;
      }

      // Check if any subject is scheduled on this day
      let hasScheduledSubject = false;
      for (const sub of subjects) {
        if (sub.days.includes(dayOfWeek)) {
          hasScheduledSubject = true;

          const statsObj = subjectStats[sub.id];
          statsObj.totalScheduledCount++;

          // Check override status
          const recordSlot = records[d]?.subjects?.find(s => s.subjectId === sub.id);
          if (recordSlot) {
            if (recordSlot.status === 'present') {
              statsObj.presentCount++;
            } else if (recordSlot.status === 'absent') {
              statsObj.absentCount++;
            } else if (recordSlot.status === 'no_class') {
              statsObj.noClassCount++;
            }
          } else {
            // No override logged
            if (d > todayStr) {
              statsObj.remainingClassDays++;
            }
          }
        }
      }

      if (hasScheduledSubject) {
        validClassDays++;
        if (d <= todayStr) {
          elapsedClassDays++;
        } else {
          remainingClassDays++;
        }

        // Calculate overall day status based on resolved date status
        const resolved = resolveDayStatus(d, config, records, todayStr);
        if (resolved.status === 'present') {
          overallPresent++;
        } else if (resolved.status === 'absent') {
          overallAbsent++;
        } else if (d > todayStr) {
          overallRemaining++;
        }
      }
    }

    // Calculate stats for each subject
    const T = (config.targetPercentage || 75) / 100;

    for (const sub of subjects) {
      const statsObj = subjectStats[sub.id];
      const conducted = statsObj.presentCount + statsObj.absentCount;
      statsObj.currentPercentage = conducted > 0
        ? parseFloat(((statsObj.presentCount / conducted) * 100).toFixed(1))
        : 100;

      const totalExpected = conducted + statsObj.remainingClassDays;
      statsObj.maxClassesCanMiss = Math.min(
        statsObj.remainingClassDays,
        Math.max(0, Math.floor(statsObj.presentCount + statsObj.remainingClassDays - T * totalExpected))
      );

      if (conducted > 0 && statsObj.currentPercentage < config.targetPercentage) {
        if (T >= 1) {
          statsObj.mustAttendNextY = statsObj.absentCount > 0 ? statsObj.remainingClassDays + 1 : 0;
        } else {
          statsObj.mustAttendNextY = Math.max(0, Math.ceil((T * conducted - statsObj.presentCount) / (1 - T)));
        }
      } else {
        statsObj.mustAttendNextY = 0;
      }
    }

    const overallConducted = overallPresent + overallAbsent;
    const overallPercentage = overallConducted > 0 ? (overallPresent / overallConducted) * 100 : 100;
    const overallTotalExpected = overallConducted + overallRemaining;

    const overallMaxMissable = Math.min(
      overallRemaining,
      Math.max(0, Math.floor(overallPresent + overallRemaining - T * overallTotalExpected))
    );

    let overallMustAttendNextY = 0;
    if (overallConducted > 0 && overallPercentage < config.targetPercentage) {
      if (T >= 1) {
        overallMustAttendNextY = overallAbsent > 0 ? overallRemaining + 1 : 0;
      } else {
        overallMustAttendNextY = Math.max(0, Math.ceil((T * overallConducted - overallPresent) / (1 - T)));
      }
    }

    const overallMaxProjected = overallTotalExpected > 0
      ? ((overallPresent + overallRemaining) / overallTotalExpected) * 100
      : 100;

    return {
      totalSemesterDays: allDates.length,
      validClassDays,
      elapsedClassDays,
      remainingClassDays,
      presentCount: overallPresent,
      absentCount: overallAbsent,
      leaveCount: 0,
      holidayCount,
      currentPercentage: parseFloat(overallPercentage.toFixed(1)),
      maxClassesCanMiss: overallMaxMissable,
      mustAttendNextY: overallMustAttendNextY,
      maxProjectedPercentage: parseFloat(overallMaxProjected.toFixed(1)),
      isUnconfigured: false,
      subjectStats
    };
  }

  // Daily fallback (no subjects defined)
  let validClassDays = 0;
  let elapsedClassDays = 0;
  let remainingClassDays = 0;
  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let holidayCount = 0;

  for (const d of allDates) {
    const resolved = resolveDayStatus(d, config, records, todayStr);

    if (resolved.status === 'holiday') {
      holidayCount++;
    } else if (resolved.status === 'leave') {
      leaveCount++;
    }

    if (resolved.status === 'present') {
      presentCount++;
    } else if (resolved.status === 'absent') {
      absentCount++;
    }

    if (resolved.isWorkingDay && resolved.status !== 'holiday' && resolved.status !== 'no_class') {
      validClassDays++;
      if (d <= todayStr) {
        elapsedClassDays++;
      } else {
        remainingClassDays++;
      }
    }
  }

  const totalConducted = presentCount + absentCount;
  const currentPercentage = totalConducted > 0 ? (presentCount / totalConducted) * 100 : 100;
  const T = (config.targetPercentage || 75) / 100;
  const TotalClasses = totalConducted + remainingClassDays;
  const maxMissable = Math.min(remainingClassDays, Math.max(0, Math.floor(presentCount + remainingClassDays - T * TotalClasses)));

  let mustAttendNextY = 0;
  if (totalConducted > 0 && currentPercentage < config.targetPercentage) {
    if (T >= 1) {
      mustAttendNextY = absentCount > 0 ? remainingClassDays + 1 : 0;
    } else {
      mustAttendNextY = Math.max(0, Math.ceil((T * totalConducted - presentCount) / (1 - T)));
    }
  }

  const maxProjectedPercentage = TotalClasses > 0 ? ((presentCount + remainingClassDays) / TotalClasses) * 100 : 100;

  return {
    totalSemesterDays: allDates.length,
    validClassDays,
    elapsedClassDays,
    remainingClassDays,
    presentCount,
    absentCount,
    leaveCount,
    holidayCount,
    currentPercentage: parseFloat(currentPercentage.toFixed(1)),
    maxClassesCanMiss: maxMissable,
    mustAttendNextY,
    maxProjectedPercentage: parseFloat(maxProjectedPercentage.toFixed(1)),
    isUnconfigured: false
  };
};

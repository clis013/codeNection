import { CandidateTimeWindow, FixedBusyEvent, FocusBlock, ProtectedTime, TimeResourceFacts } from '../types/calendar';

interface TimeInterval {
  start: Date;
  end: Date;
}

/**
 * Calculates candidate time windows by subtracting blocked intervals from a planning horizon.
 */
export function calculateCandidateWindows(
  horizonStartIso: string,
  horizonEndIso: string,
  busyEvents: FixedBusyEvent[],
  protectedTimes: ProtectedTime[],
  focusBlocks: FocusBlock[],
  minDurationMinutes: number = 30
): CandidateTimeWindow[] {
  const horizonStart = new Date(horizonStartIso);
  const horizonEnd = new Date(horizonEndIso);

  if (horizonStart >= horizonEnd) {
    return [];
  }

  // 1. Gather all explicit blocked intervals
  const blockedIntervals: TimeInterval[] = [];

  // Busy events
  for (const ev of busyEvents) {
    blockedIntervals.push({
      start: new Date(ev.startDateTime),
      end: new Date(ev.endDateTime)
    });
  }

  // Focus blocks
  for (const fb of focusBlocks) {
    blockedIntervals.push({
      start: new Date(fb.startDateTime),
      end: new Date(fb.endDateTime)
    });
  }

  // Protected times (recurring vs explicit)
  for (const pt of protectedTimes) {
    if (pt.isRecurring && pt.recurringStartTime && pt.recurringEndTime) {
      // Expand recurring time across the horizon
      expandRecurringProtectedTime(pt.recurringStartTime, pt.recurringEndTime, horizonStart, horizonEnd).forEach(interval => {
        blockedIntervals.push(interval);
      });
    } else if (pt.startDateTime && pt.endDateTime) {
      blockedIntervals.push({
        start: new Date(pt.startDateTime),
        end: new Date(pt.endDateTime)
      });
    }
  }

  // 2. Clamp blocked intervals to horizon and merge overlaps
  const clampedIntervals = blockedIntervals
    .map(interval => ({
      start: new Date(Math.max(interval.start.getTime(), horizonStart.getTime())),
      end: new Date(Math.min(interval.end.getTime(), horizonEnd.getTime()))
    }))
    .filter(interval => interval.start < interval.end)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const mergedIntervals: TimeInterval[] = [];
  for (const interval of clampedIntervals) {
    if (mergedIntervals.length === 0) {
      mergedIntervals.push(interval);
    } else {
      const last = mergedIntervals[mergedIntervals.length - 1];
      if (interval.start <= last.end) {
        // Overlap or contiguous, merge them
        last.end = new Date(Math.max(last.end.getTime(), interval.end.getTime()));
      } else {
        mergedIntervals.push(interval);
      }
    }
  }

  // 3. Subtract merged intervals from horizon to find gaps
  const candidates: CandidateTimeWindow[] = [];
  let currentStart = horizonStart;

  for (const blocked of mergedIntervals) {
    if (currentStart < blocked.start) {
      const durationMinutes = (blocked.start.getTime() - currentStart.getTime()) / 60000;
      if (durationMinutes >= minDurationMinutes) {
        candidates.push({
          startDateTime: currentStart.toISOString(),
          endDateTime: blocked.start.toISOString(),
          durationMinutes
        });
      }
    }
    if (currentStart < blocked.end) {
      currentStart = blocked.end;
    }
  }

  // Check the final gap after the last blocked interval
  if (currentStart < horizonEnd) {
    const durationMinutes = (horizonEnd.getTime() - currentStart.getTime()) / 60000;
    if (durationMinutes >= minDurationMinutes) {
      candidates.push({
        startDateTime: currentStart.toISOString(),
        endDateTime: horizonEnd.toISOString(),
        durationMinutes
      });
    }
  }

  return candidates;
}

/**
 * Expands a recurring HH:mm to HH:mm interval (e.g. 23:30 to 07:30) across the horizon days.
 * Correctly handles overnight blocks by crossing midnight.
 */
function expandRecurringProtectedTime(startTimeHHmm: string, endTimeHHmm: string, horizonStart: Date, horizonEnd: Date): TimeInterval[] {
  const intervals: TimeInterval[] = [];
  const [startH, startM] = startTimeHHmm.split(':').map(Number);
  const [endH, endM] = endTimeHHmm.split(':').map(Number);
  
  const isOvernight = (startH > endH) || (startH === endH && startM > endM);

  // Start from the day before horizonStart to catch overnight blocks that start before the horizon but end inside it
  const currentDay = new Date(horizonStart);
  currentDay.setDate(currentDay.getDate() - 1);
  currentDay.setHours(0, 0, 0, 0);

  const endDay = new Date(horizonEnd);
  endDay.setHours(0, 0, 0, 0);

  while (currentDay <= endDay) {
    const start = new Date(currentDay);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(currentDay);
    if (isOvernight) {
      end.setDate(end.getDate() + 1);
    }
    end.setHours(endH, endM, 0, 0);

    // Only add if it overlaps with the horizon (will be clamped precisely later)
    if (end > horizonStart && start < horizonEnd) {
      intervals.push({ start, end });
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  return intervals;
}

/**
 * Derives aggregate time resource facts from candidate windows.
 */
export function deriveTimeResourceFacts(
  candidates: CandidateTimeWindow[],
  horizonStartIso: string,
  horizonEndIso: string,
  dataSource: 'mock' | 'google' | 'manual'
): TimeResourceFacts {
  const totalMinutes = candidates.reduce((sum, w) => sum + w.durationMinutes, 0);
  
  return {
    calendarDataAvailable: true,
    calendarDataSource: dataSource,
    horizonStart: horizonStartIso,
    horizonEnd: horizonEndIso,
    candidateWindowCount: candidates.length,
    candidateTimeHours: Number((totalMinutes / 60).toFixed(1))
  };
}

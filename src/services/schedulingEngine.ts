import { 
  SchedulingCharacteristics, 
  SchedulableWorkload, 
  SchedulingInput, 
  CandidatePlan, 
  CandidateStrategy, 
  PlannedFocusBlock,
  CandidatePlanMetrics
} from '../types/scheduling';
import { WorkloadItem } from '../types/workload';
import { CandidateTimeWindow, FocusBlock } from '../types/calendar';

// --- Configuration & Defaults ---

export function getWorkloadDefaults(workloadType: WorkloadItem['workloadType']): SchedulingCharacteristics {
  switch (workloadType) {
    case 'ExamPreparation':
      return { splittable: true, spacingPreferred: true, source: 'workload-default' };
    case 'Assignment':
      return { splittable: true, spacingPreferred: false, source: 'workload-default' };
    case 'Project':
      return { splittable: true, spacingPreferred: true, source: 'workload-default' };
    case 'PresentationPreparation':
      return { splittable: true, spacingPreferred: false, source: 'workload-default' };
    case 'Reading':
      return { splittable: true, spacingPreferred: true, source: 'workload-default' };
    case 'Errand':
      return { splittable: false, spacingPreferred: false, source: 'workload-default' };
    case 'Other':
    default:
      return { splittable: true, spacingPreferred: false, source: 'workload-default' };
  }
}

// --- Data Preparation ---

export interface SchedulableWorkloadResult {
  schedulableWorkloads: SchedulableWorkload[];
  mismatches: string[];
}

export function prepareSchedulableWorkloads(
  workloads: WorkloadItem[],
  existingFocusBlocks: FocusBlock[]
): SchedulableWorkloadResult {
  const schedulableWorkloads: SchedulableWorkload[] = [];
  const mismatches: string[] = [];

  for (const w of workloads) {
    if (w.status === 'Completed' || w.remainingTimeHours <= 0) continue;

    const plannedHours = existingFocusBlocks
      .filter(fb => fb.workloadId === w.id)
      .reduce((sum, fb) => sum + (new Date(fb.endDateTime).getTime() - new Date(fb.startDateTime).getTime()) / 3600000, 0);

    if (plannedHours > w.remainingTimeHours) {
      mismatches.push(`Mismatch for ${w.id}: Planned hours (${plannedHours.toFixed(1)}h) exceed remaining effort (${w.remainingTimeHours}h). User intervention required.`);
      // Still include it but with zero unscheduled effort so it isn't completely dropped from context,
      // though the generator won't schedule anything new.
      schedulableWorkloads.push({
        ...w,
        plannedHours,
        unscheduledEffortHours: 0
      });
      continue;
    }

    const unscheduledEffortHours = w.remainingTimeHours - plannedHours;
    if (unscheduledEffortHours > 0) {
      schedulableWorkloads.push({
        ...w,
        plannedHours,
        unscheduledEffortHours
      });
    }
  }

  return { schedulableWorkloads, mismatches };
}

// --- Helper Functions ---

function calculateCandidateOpportunity(
  workload: SchedulableWorkload,
  windows: CandidateTimeWindow[]
): number {
  if (workload.timingType === 'Flexible' || !workload.deadline) {
    // Total candidate time in horizon
    return windows.reduce((sum, w) => sum + w.durationMinutes, 0) / 60;
  }
  
  const cutoffTime = new Date(workload.deadline).getTime();
  let availableMinutes = 0;

  for (const win of windows) {
    const winStart = new Date(win.startDateTime).getTime();
    const winEnd = new Date(win.endDateTime).getTime();
    if (winStart >= cutoffTime) continue; // After cutoff
    
    if (winEnd <= cutoffTime) {
      availableMinutes += win.durationMinutes;
    } else {
      // Partial overlap
      availableMinutes += (cutoffTime - winStart) / 60000;
    }
  }
  return availableMinutes / 60;
}

function getWorkloadFeasibilityMargin(w: SchedulableWorkload, oppHours: number): number {
  return oppHours - w.unscheduledEffortHours;
}

// Generates an ephemeral ID
let ephemeralIdCounter = 1;
function generateId(): string {
  return `pb_${ephemeralIdCounter++}_${Date.now()}`;
}

// Modifies windows in-place to subtract placed time.
// Since block fragmentations need to be contained, this returns actual placed minutes.
function placeBlockInWindows(
  durationMinutes: number, 
  cutoffTimeMs: number | null,
  windows: CandidateTimeWindow[],
  workloadId: string,
  outBlocks: PlannedFocusBlock[],
  splittable: boolean,
  minBlockMin: number = 30
): number {
  let remainingToPlace = durationMinutes;
  
  if (!splittable) {
    // Find the first window that fits the entire duration before cutoff
    let foundIdx = -1;
    let placedStartMs = 0;
    let placedEndMs = 0;

    for (let i = 0; i < windows.length; i++) {
      const win = windows[i];
      const winStart = new Date(win.startDateTime).getTime();
      const winEnd = new Date(win.endDateTime).getTime();
      
      const effectiveEnd = cutoffTimeMs ? Math.min(winEnd, cutoffTimeMs) : winEnd;
      if (effectiveEnd - winStart >= durationMinutes * 60000 - 1) { // 1ms tolerance
        foundIdx = i;
        placedStartMs = winStart;
        placedEndMs = winStart + durationMinutes * 60000;
        break;
      }
    }

    if (foundIdx === -1) return 0; // Failure to place non-splittable block

    outBlocks.push({
      id: generateId(),
      workloadId,
      startDateTime: new Date(placedStartMs).toISOString(),
      endDateTime: new Date(placedEndMs).toISOString(),
      durationMinutes: durationMinutes
    });

    const win = windows[foundIdx];
    const winEnd = new Date(win.endDateTime).getTime();
    if (placedEndMs < winEnd) {
      win.startDateTime = new Date(placedEndMs).toISOString();
      win.durationMinutes = (winEnd - placedEndMs) / 60000;
    } else {
      windows.splice(foundIdx, 1);
    }
    return durationMinutes;
  }

  // Splittable placement logic
  for (let i = 0; i < windows.length && remainingToPlace > 0.01; i++) {
    const win = windows[i];
    const winStart = new Date(win.startDateTime).getTime();
    const winEnd = new Date(win.endDateTime).getTime();
    const effectiveEnd = cutoffTimeMs ? Math.min(winEnd, cutoffTimeMs) : winEnd;
    
    let availableInWin = (effectiveEnd - winStart) / 60000;
    if (availableInWin <= 0.01) continue;

    // Check if the last block for this workload ends exactly at winStart (contiguous extension)
    const lastBlock = outBlocks.length > 0 ? outBlocks[outBlocks.length - 1] : null;
    const isLastBlockContiguous = lastBlock && 
      lastBlock.workloadId === workloadId && 
      Math.abs(new Date(lastBlock.endDateTime).getTime() - winStart) < 1000;

    if (isLastBlockContiguous && lastBlock) {
      const extendAmount = Math.min(remainingToPlace, availableInWin);
      const newEndMs = winStart + extendAmount * 60000;
      lastBlock.endDateTime = new Date(newEndMs).toISOString();
      lastBlock.durationMinutes += extendAmount;
      remainingToPlace -= extendAmount;

      if (newEndMs < winEnd) {
        win.startDateTime = new Date(newEndMs).toISOString();
        win.durationMinutes = (winEnd - newEndMs) / 60000;
      } else {
        windows.splice(i, 1);
        i--;
      }
      continue;
    }

    // Otherwise starting a NEW standalone block
    const placeAmount = Math.min(remainingToPlace, availableInWin);

    if (placeAmount >= minBlockMin - 0.01) {
      // Place a valid standalone block (>= minBlockMin)
      const placedStartMs = winStart;
      const placedEndMs = winStart + placeAmount * 60000;

      outBlocks.push({
        id: generateId(),
        workloadId,
        startDateTime: new Date(placedStartMs).toISOString(),
        endDateTime: new Date(placedEndMs).toISOString(),
        durationMinutes: placeAmount
      });

      remainingToPlace -= placeAmount;

      if (placedEndMs < winEnd) {
        win.startDateTime = new Date(placedEndMs).toISOString();
        win.durationMinutes = (winEnd - placedEndMs) / 60000;
      } else {
        windows.splice(i, 1);
        i--;
      }
    } else {
      // placeAmount < minBlockMin: CANNOT create a new sub-minimum standalone block!
      // Required 3-step fallback:
      // 1. Extend/merge into an already-generated block for the same workload.
      // 2. Redistribute into another valid same-workload block/window if possible.
      // 3. If neither is possible, leave it explicitly unscheduled.

      const merged = tryMergeOrExtendRemainder(
        remainingToPlace,
        workloadId,
        outBlocks,
        windows,
        cutoffTimeMs
      );

      if (merged > 0.01) {
        remainingToPlace -= merged;
      } else {
        // Cannot merge or create a standalone block >= minBlockMin.
        // Stop attempting to place sub-minimum fragments into windows.
        break;
      }
    }
  }

  return durationMinutes - remainingToPlace;
}

/**
 * Helper to extend/merge an unscheduled remainder into existing blocks for the same workload.
 */
function tryMergeOrExtendRemainder(
  remainderMin: number,
  workloadId: string,
  outBlocks: PlannedFocusBlock[],
  windows: CandidateTimeWindow[],
  cutoffTimeMs: number | null
): number {
  if (remainderMin <= 0.01) return 0;

  const existingBlocks = outBlocks.filter(b => b.workloadId === workloadId);
  if (existingBlocks.length === 0) return 0;

  let totalMerged = 0;
  let currentRem = remainderMin;

  for (const block of existingBlocks) {
    if (currentRem <= 0.01) break;

    const bEndMs = new Date(block.endDateTime).getTime();

    // Find if there is a window in `windows` starting at or near bEndMs
    const winIdx = windows.findIndex(w => {
      const wStart = new Date(w.startDateTime).getTime();
      return Math.abs(wStart - bEndMs) < 1000;
    });

    if (winIdx !== -1) {
      const win = windows[winIdx];
      const winStart = new Date(win.startDateTime).getTime();
      const winEnd = new Date(win.endDateTime).getTime();
      const effectiveEnd = cutoffTimeMs ? Math.min(winEnd, cutoffTimeMs) : winEnd;
      const avail = (effectiveEnd - winStart) / 60000;

      if (avail > 0.01) {
        const addAmount = Math.min(currentRem, avail);
        const newEndMs = winStart + addAmount * 60000;

        block.endDateTime = new Date(newEndMs).toISOString();
        block.durationMinutes += addAmount;
        currentRem -= addAmount;
        totalMerged += addAmount;

        if (newEndMs < winEnd) {
          win.startDateTime = new Date(newEndMs).toISOString();
          win.durationMinutes = (winEnd - newEndMs) / 60000;
        } else {
          windows.splice(winIdx, 1);
        }
      }
    }
  }

  return totalMerged;
}

// --- Shared Placement Engine ---

export function generateCandidatePlans(input: SchedulingInput): CandidatePlan[] {
  const plans: CandidatePlan[] = [];
  
  plans.push(buildPlan(input, 'DeadlineFirst'));
  plans.push(buildPlan(input, 'BalancedForward'));
  plans.push(buildPlan(input, 'SustainabilityAware'));

  return plans;
}

function buildPlan(input: SchedulingInput, strategy: CandidateStrategy): CandidatePlan {
  // Deep clone candidate windows so we can mutate them
  const windows = JSON.parse(JSON.stringify(input.candidateTimeWindows)) as CandidateTimeWindow[];
  const workloads = [...input.schedulableWorkloads].map(w => ({ ...w }));
  
  const outBlocks: PlannedFocusBlock[] = [];

  // Track remaining effort locally
  const remainingEffort = new Map<string, number>();
  workloads.forEach(w => remainingEffort.set(w.id, w.unscheduledEffortHours));

  if (strategy === 'DeadlineFirst') {
    // Strategy A: Deadline First.
    // Order by narrowest feasibility margin, then urgency, then deadline proximity.
    workloads.sort((a, b) => {
      const oppA = calculateCandidateOpportunity(a, windows);
      const oppB = calculateCandidateOpportunity(b, windows);
      const marginA = getWorkloadFeasibilityMargin(a, oppA);
      const marginB = getWorkloadFeasibilityMargin(b, oppB);
      
      if (Math.abs(marginA - marginB) > 1) {
        return marginA - marginB; // Smaller margin first
      }
      const tA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const tB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return tA - tB;
    });

    // Greedily place all
    for (const w of workloads) {
      const toPlaceMin = (remainingEffort.get(w.id) ?? 0) * 60;
      if (toPlaceMin <= 0) continue;
      
      const cutoffTimeMs = (w.timingType !== 'Flexible' && w.deadline) 
        ? new Date(w.deadline).getTime() 
        : null;

      const placedMin = placeBlockInWindows(
        toPlaceMin, 
        cutoffTimeMs, 
        windows, 
        w.id, 
        outBlocks, 
        w.schedulingCharacteristics.splittable,
        w.schedulingCharacteristics.minimumBlockMinutes ?? 30
      );

      remainingEffort.set(w.id, Math.max(0, (toPlaceMin - placedMin) / 60));
    }

  } else if (strategy === 'BalancedForward') {
    // Strategy B: Balanced Forward.
    const horizonStartMs = new Date(input.horizonStart).getTime();
    const horizonEndMs = new Date(input.horizonEnd).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // We iterate day by day
    for (let currentDayMs = horizonStartMs; currentDayMs < horizonEndMs; currentDayMs += dayMs) {
      const nextDayMs = currentDayMs + dayMs;
      
      // Compute how much of each workload SHOULD be placed today
      workloads.forEach(w => {
        w['_tempQuota'] = 0; // Reset every day
        
        const rem = remainingEffort.get(w.id) ?? 0;
        if (rem <= 0) return;
        
        const cutoffMs = (w.timingType !== 'Flexible' && w.deadline) 
          ? new Date(w.deadline).getTime() 
          : horizonEndMs;

        if (cutoffMs <= currentDayMs) return;
        
        let dailyQuota = 0;
        if (!w.schedulingCharacteristics.splittable) {
          dailyQuota = rem;
        } else {
          const daysLeft = Math.max(1, Math.ceil((cutoffMs - currentDayMs) / dayMs));
          dailyQuota = rem / daysLeft;
        }
        
        w['_tempQuota'] = dailyQuota;
        w['_tempMargin'] = getWorkloadFeasibilityMargin(w, calculateCandidateOpportunity(w, windows));
      });

      const activeWorkloads = workloads.filter(w => (w['_tempQuota'] ?? 0) > 0);
      activeWorkloads.sort((a, b) => (a['_tempMargin'] ?? 0) - (b['_tempMargin'] ?? 0));

      for (const w of activeWorkloads) {
        const quotaMin = (w['_tempQuota'] ?? 0) * 60;
        const cutoffTimeMs = (w.timingType !== 'Flexible' && w.deadline) 
          ? new Date(w.deadline).getTime() 
          : null;

        const placedMin = placeBlockInWindows(
          quotaMin,
          Math.min(cutoffTimeMs || Infinity, nextDayMs),
          windows, 
          w.id,
          outBlocks,
          w.schedulingCharacteristics.splittable,
          w.schedulingCharacteristics.minimumBlockMinutes ?? 30
        );

        remainingEffort.set(w.id, Math.max(0, (remainingEffort.get(w.id) ?? 0) - (placedMin / 60)));
      }
    }

    // After all days, do a final sweep for any unplaced effort
    workloads.forEach(w => {
      const rem = remainingEffort.get(w.id) ?? 0;
      if (rem > 0) {
        const cutoffTimeMs = (w.timingType !== 'Flexible' && w.deadline) ? new Date(w.deadline).getTime() : null;
        const placedMin = placeBlockInWindows(
          rem * 60, cutoffTimeMs, windows, w.id, outBlocks, 
          w.schedulingCharacteristics.splittable, w.schedulingCharacteristics.minimumBlockMinutes ?? 30
        );
        remainingEffort.set(w.id, Math.max(0, rem - (placedMin / 60)));
      }
    });

  } else if (strategy === 'SustainabilityAware') {
    // Strategy C: Sustainability Aware
    const energy = input.resourceContext?.energyLevel;
    
    workloads.sort((a, b) => {
      const oppA = calculateCandidateOpportunity(a, windows);
      const oppB = calculateCandidateOpportunity(b, windows);
      const marginA = getWorkloadFeasibilityMargin(a, oppA);
      const marginB = getWorkloadFeasibilityMargin(b, oppB);

      if (Math.abs(marginA - marginB) > 1) {
        return marginA - marginB; 
      }
      
      if (energy && energy <= 2 && marginA >= 2 && marginB >= 2) {
        const demandA = a.demandProfile.cognitive + a.demandProfile.emotional;
        const demandB = b.demandProfile.cognitive + b.demandProfile.emotional;
        if (demandA !== demandB) {
          return demandA - demandB;
        }
      }
      
      const tA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const tB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return tA - tB;
    });

    for (const w of workloads) {
      const toPlaceMin = (remainingEffort.get(w.id) ?? 0) * 60;
      if (toPlaceMin <= 0) continue;
      
      const cutoffTimeMs = (w.timingType !== 'Flexible' && w.deadline) 
        ? new Date(w.deadline).getTime() 
        : null;

      const placedMin = placeBlockInWindows(
        toPlaceMin, 
        cutoffTimeMs, 
        windows, 
        w.id, 
        outBlocks, 
        w.schedulingCharacteristics.splittable,
        w.schedulingCharacteristics.minimumBlockMinutes ?? 30
      );

      remainingEffort.set(w.id, Math.max(0, (toPlaceMin - placedMin) / 60));
    }
  }

  // Aggregate unscheduled required effort accurately across all workloads
  const totalUnscheduled = Array.from(remainingEffort.values()).reduce((sum, rem) => sum + Math.max(0, rem), 0);

  const plan: CandidatePlan = {
    id: `plan_${strategy}_${Date.now()}`,
    strategy,
    plannedBlocks: outBlocks,
    isValid: true,
    hardConstraintViolations: [],
    basicMetrics: {
      unscheduledRequiredEffort: Number(totalUnscheduled.toFixed(2))
    }
  };

  validateCandidatePlan(plan, input);

  return plan;
}

// --- Validation ---

export function validateCandidatePlan(plan: CandidatePlan, input: SchedulingInput): void {
  const violations: string[] = [];
  
  // 1. Blocks must not overlap each other
  const blocks = [...plan.plannedBlocks].sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  for (let i = 0; i < blocks.length - 1; i++) {
    const b1 = blocks[i];
    const b2 = blocks[i+1];
    if (new Date(b1.endDateTime).getTime() > new Date(b2.startDateTime).getTime()) {
      violations.push(`Overlap detected between generated blocks ${b1.id} and ${b2.id}`);
    }
  }

  // 2. Fits inside CandidateTimeWindow completely
  for (const block of plan.plannedBlocks) {
    const bStart = new Date(block.startDateTime).getTime();
    const bEnd = new Date(block.endDateTime).getTime();
    
    const coveredByWindow = input.candidateTimeWindows.some(win => {
      const wStart = new Date(win.startDateTime).getTime();
      const wEnd = new Date(win.endDateTime).getTime();
      return bStart >= wStart && bEnd <= wEnd;
    });

    if (!coveredByWindow) {
      violations.push(`Block ${block.id} is not fully enclosed in any CandidateTimeWindow`);
    }
  }

  // 3. Cutoff respected & 6. Unscheduled effort not exceeded & 4. Splittability respected
  const workloadMap = new Map<string, SchedulableWorkload>();
  input.schedulableWorkloads.forEach(w => workloadMap.set(w.id, w));

  const scheduledByWorkload = new Map<string, { totalMin: number, count: number }>();
  
  for (const block of plan.plannedBlocks) {
    const w = workloadMap.get(block.workloadId);
    if (!w) continue;
    
    if (w.timingType !== 'Flexible' && w.deadline) {
      const cutoff = new Date(w.deadline).getTime();
      if (new Date(block.endDateTime).getTime() > cutoff) {
        violations.push(`Block ${block.id} violates deadline cutoff for workload ${w.id}`);
      }
    }

    const current = scheduledByWorkload.get(w.id) || { totalMin: 0, count: 0 };
    current.totalMin += block.durationMinutes;
    current.count += 1;
    scheduledByWorkload.set(w.id, current);

    // 5. Min block length (Strict: never emit any block < minimumBlockMinutes)
    const minLen = w.schedulingCharacteristics.minimumBlockMinutes;
    if (minLen && block.durationMinutes < minLen - 0.01) {
      violations.push(`Block ${block.id} duration (${block.durationMinutes.toFixed(1)}m) is less than enforced minimum (${minLen}m)`);
    }
  }

  for (const [wId, stats] of scheduledByWorkload.entries()) {
    const w = workloadMap.get(wId)!;
    if (stats.totalMin > w.unscheduledEffortHours * 60 + 1) { // 1 min float tolerance
      violations.push(`Workload ${wId} scheduled for ${stats.totalMin}m, exceeding unscheduled effort of ${w.unscheduledEffortHours * 60}m`);
    }

    if (!w.schedulingCharacteristics.splittable && stats.count > 1) {
      violations.push(`Workload ${wId} is non-splittable but was split into ${stats.count} blocks`);
    }
  }

  if (violations.length > 0) {
    plan.isValid = false;
    plan.hardConstraintViolations = violations;
  }
}

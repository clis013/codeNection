import { WorkloadItem, DemandProfile } from './workload';
import { CandidateTimeWindow, FocusBlock } from './calendar';
import { AnalysisResult } from './stress';

export interface SchedulingCharacteristics {
  splittable: boolean;
  spacingPreferred: boolean;
  minimumBlockMinutes?: number;
  preferredBlockMinutes?: number;
  source: 'user' | 'ai' | 'workload-default';
}

export interface SchedulableWorkload extends WorkloadItem {
  plannedHours: number;
  unscheduledEffortHours: number;
}

export interface SchedulingInput {
  horizonStart: string;
  horizonEnd: string;
  candidateTimeWindows: CandidateTimeWindow[];
  schedulableWorkloads: SchedulableWorkload[];
  existingFocusBlocks: FocusBlock[];
  
  resourceContext: {
    energyLevel?: number;
    controlScore?: number;
    stressCategory?: string;
  } | null;
  
  analysisContext: AnalysisResult;
}

export interface PlannedFocusBlock {
  id: string;
  workloadId: string;
  startDateTime: string;
  endDateTime: string;
  durationMinutes: number;
}

export interface CandidatePlanMetrics {
  deadlineSafety: {
    unscheduledRequiredEffort: number;
    deadlineViolations: number;
    percentEffortNearDeadline: number;
  };
  futureBottleneck: {
    workloadsAtRisk: Array<{
      workloadId: string;
      unscheduledHours: number;
      availableCandidateHoursBeforeDeadline: number;
      bottleneckRatio: number;
    }>;
    maxDailyScheduledHours: number;
  };
  spacing: {
    workloadSpacing: Array<{
      workloadId: string;
      scheduledDaysCount: number;
      longestGapDays: number;
      isConcentratedOnSingleDay: boolean;
    }>;
  };
  demandDistribution: {
    consecutiveHighCognitiveBlocks: number;
  };
  fragmentation: {
    totalTaskSwitches: number;
    subMinimumBlocks: number;
  };
  resourceFit: {
    poorFitBlocksNearTerm: number;
  };
  openTimePreservation: {
    unallocatedCandidateHours: number;
  };
  userPreference: {
    preferenceConflicts: Array<{
      workloadId: string;
      reason: string;
    }>;
  };
}

export type CandidateStrategy = 'DeadlineFirst' | 'BalancedForward' | 'SustainabilityAware';

export interface CandidatePlan {
  id: string;
  strategy: CandidateStrategy;
  plannedBlocks: PlannedFocusBlock[];
  
  isValid: boolean;
  hardConstraintViolations: string[];
  
  metrics?: CandidatePlanMetrics; // Full metrics deferred to Stage 4C
  
  // Basic placement outcomes needed for generation/validation
  basicMetrics: {
    unscheduledRequiredEffort: number;
  };
}

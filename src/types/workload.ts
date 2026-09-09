import { SchedulingCharacteristics } from './scheduling';

export type WorkloadArea = 'Academic' | 'Personal' | 'Social' | 'Self-Care';

export type ActivityType = 'Deep focus' | 'Communication' | 'Creative' | 'Physical' | 'Administrative';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type FlexibilityLevel = 'Strict' | 'Moderate' | 'Flexible';

export type WorkloadStatus = 'Active' | 'Completed' | 'Deferred';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DemandProfile {
  cognitive: number; // 1–5 integer
  emotional: number; // 1–5 integer
  physical: number;  // 1–5 integer
  // Use getDemandLabel() from utils/demandHelpers to convert to Low/Moderate/High.
  // Do NOT store string labels here — keep raw scores for calculation.
}

export interface NasaTlxScore {
  mentalDemand: number;   // 0–100
  physicalDemand: number; // 0–100
  temporalDemand: number; // 0–100
  performance: number;    // 0–100
  effort: number;         // 0–100
  frustration: number;    // 0–100
  overallScore?: number;
}

export interface WorkloadItem {
  id: string;
  title: string;
  area: WorkloadArea;
  activityType: ActivityType;
  deadline: string; // ISO date-time string

  urgency: UrgencyLevel;
  
  // Separation of Flexibility
  timeFlexibility: 'Strict' | 'Moderate' | 'Flexible'; // How freely blocks can move
  effortFlexibility: 'Strict' | 'Moderate' | 'Flexible'; // How reasonable it is to reduce planned effort

  // Scheduling Semantics
  workloadType: 'ExamPreparation' | 'Assignment' | 'Project' | 'PresentationPreparation' | 'Reading' | 'Errand' | 'Other';
  timingType: 'Deadline' | 'EventPrep' | 'Flexible';
  
  importance: 'Low' | 'Medium' | 'High'; // Consequence / significance
  userPriority?: 'Low' | 'Medium' | 'High'; // Optional explicit user scheduling preference

  schedulingCharacteristics: SchedulingCharacteristics;

  /**
   * Original total-time estimate (hours).
   * Set at creation time. Does not shrink as work is done.
   */
  estimatedHours: number;

  /**
   * Current estimate of unfinished work still required (hours).
   * Starts equal to estimatedHours. Updated by user or future logic as work progresses.
   * Must NOT be automatically derived from subtask completion percentage.
   */
  remainingTimeHours: number;

  demandProfile: DemandProfile;
  perceivedStressImpact: number; // 1–5

  status: WorkloadStatus;
  subtasks: SubTask[];

  nasaTlx?: NasaTlxScore;
  notes?: string;
  isMainConcern?: boolean;

  // Calendar / scheduling fields (written by Balance Apply)
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;

  // Balance decision fields
  balanceDecision?: 'Keep' | 'Reduce' | 'Reconsider' | 'Move / Delay';
  balanceRationale?: string;
}

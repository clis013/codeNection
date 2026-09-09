import { AreaDistribution, DemandDistribution } from '../utils/demandHelpers';
import { WorkloadArea, ActivityType, UrgencyLevel, FlexibilityLevel } from './workload';

export type StressCategory = 'Normal' | 'Elevated' | 'High' | 'Very High';

export type BaselineComparisonCategory =
  | 'normal'
  | 'elevated'
  | 'significantly elevated'
  | 'lower than normal';

// ─── Baseline Metrics ────────────────────────────────────────────────────────

export interface BaselineMetrics {
  hasBaseline: boolean;
  baselineStressAverage: number;
  baselineEnergyAverage: number;
  baselineControlAverage: number;
  baselineMentalDemandAverage: number;
  baselineCopingConfidenceAverage: number;
}

// ─── Daily Check-In ──────────────────────────────────────────────────────────

export interface DailyCheckIn {
  id: string;

  /** Local calendar date 'YYYY-MM-DD'. Use getTodayLocalDate() from dateHelpers to set. */
  date: string;

  /** ISO timestamp of when the check-in was saved. */
  createdAt: string;

  // Raw question answers (stored to reproduce the PSS calculation)
  q1_stress: number;       // 1–5  "How stressed do you feel right now?"
  q2_control: number;      // 1–5  "How much control do you feel you have?"
  q3_mentalDemand: number; // 1–5  "How mentally demanding has your day been?"
  q4_capability: number;   // 1–5  "How capable do you feel of handling your workload?"

  // Non-PSS inputs
  energyLevel: number;     // 1–5  (Q5 in questionnaire)
  emotionFeeling: string;  // Q6 emotion label

  // Derived at save time (from raw answers via calculatePss)
  pssScore: number;              // 4–20: Q1 + (6-Q2) + Q3 + (6-Q4)
  category: StressCategory;

  // Aliases kept for existing view compatibility
  controlScore: number;          // = q2_control
  mentalDemandScore: number;     // = q3_mentalDemand
  copingCapabilityScore: number; // = q4_capability

  // Baseline comparison — only present when ≥30 prior records existed at save time
  baselineDiff?: number;
  baselineCategory?: BaselineComparisonCategory;
  snapshotInterpretation?: string;
  baselineInterpretation?: string;
}

// ─── Derived workload facts ───────────────────────────────────────────────────

/**
 * Deterministic facts derived from current active workloads.
 * Computed from structured app data — NOT AI interpretation.
 * Exposed via AppContext and consumed by views and the future Analysis layer.
 */
export interface DerivedWorkloadFacts {
  activeWorkloadCount: number;

  /** Sum of remainingTimeHours across active workloads. */
  totalRemainingHours: number;

  /** Sum of estimatedHours across active workloads. */
  totalEstimatedHours: number;

  areaDistribution: AreaDistribution;

  /**
   * Dominant area(s) by workload count.
   * Array length > 1 means tied areas — do NOT silently pick one winner.
   */
  dominantAreas: string[];

  demandDistribution: DemandDistribution;

  /**
   * Demand dimension(s) with the highest average score.
   * Array length > 1 means tied dimensions — do NOT silently pick one winner.
   */
  mostDrainingDemands: string[];
}

// ─── Analysis Contract Types ──────────────────────────────────────────────────

export type DemandResourceStatus = 'Manageable' | 'Strained' | 'Overloaded' | 'InsufficientData';

export type AnalysisConfidence = 'Low' | 'Moderate' | 'High';

export interface AnalysisEvidence {
  category: 'Time' | 'Cognitive' | 'Emotional' | 'Physical' | 'Social' | 'Energy' | 'Control' | 'Stress' | 'Context';
  message: string;
  severity?: 'Low' | 'Moderate' | 'High';
}

export interface AnalysisFactor {
  factorType: 'Deadline' | 'Volume' | 'Complexity' | 'ResourceDepletion' | 'Contextual';
  description: string;
  relatedWorkloadIds?: string[];
}

export interface RecoveryNeed {
  indicated: boolean;
  type?: 'cognitive' | 'emotional' | 'physical' | 'general';
  reason?: string;
}

export interface AnalysisInput {
  localDate: string;
  
  checkInState: {
    stressCategory: StressCategory;
    energyLevel: number;
    controlLevel: number;
    baselineDiff: number | null;
    pssScore?: number;
    mentalDemandScore?: number;
    copingCapabilityScore?: number;
  } | null;

  workloadFacts: {
    activeWorkloads: Array<{
      id: string;
      title: string;
      area: WorkloadArea;
      activityType: ActivityType;
      urgency: UrgencyLevel;
      flexibility: FlexibilityLevel;
      importance?: string;
      deadline: string;
      remainingTimeHours: number;
      demandProfile: {
        cognitive: number;
        emotional: number;
        physical: number;
      };
    }>;
    totalRemainingHours: number;
    demandDistribution: DemandDistribution;
  };

  timeFeasibility: {
    calendarDataAvailable: boolean;
    calendarDataSource: 'mock' | 'google' | 'manual';
    horizonStart: string;
    horizonEnd: string;
    candidateWindowCount: number;
    candidateTimeHours: number;
  } | null;

  stressDumpContext: string[];
}

export interface AnalysisResult {
  demandResourceStatus: DemandResourceStatus;
  confidence: AnalysisConfidence;
  
  evidence: AnalysisEvidence[];
  mainConstraints: AnalysisFactor[];
  mainContributors: AnalysisFactor[];
  
  mismatch: {
    detected: boolean;
    type?: 'HighStressManageableLoad' | 'NormalStressOverloadedLoad';
    insight?: string;
  };
  
  recoveryNeed: RecoveryNeed;

  isMock: boolean;
  dataLimitations: string[];
}

// ─── Capacity profile (aggregated for view consumption) ──────────────────────

/**
 * Aggregated view-consumption object.
 *
 * FIELD SOURCES (clearly annotated):
 *   energy, recoveryState  — real, derived from todayCheckIn (null when no check-in)
 *   candidateTimeHours     — Real derived values from Calendar engine
 *   dominantArea           — real, derived from active workloads (first dominant area)
 *   mostDrainingDemand     — real, derived from active workloads (first most draining)
 *   analysisResult         — FROM ANALYSIS PROVIDER
 */
export interface CapacityProfile {
  // Real: derived from today's check-in
  energy: number | null;   // 0–100 (null when no check-in today)
  recoveryState: 'Rested' | 'Moderate' | 'Depleted' | 'Unknown';

  // Real: factual candidate time hours derived from Calendar Engine within a specific horizon
  candidateTimeHours: number | null;

  // Real: derived from active workloads
  dominantArea: string;
  mostDrainingDemand: 'Cognitive' | 'Emotional' | 'Physical' | 'Unknown';

  // FROM ANALYSIS PROVIDER — replaces mock analysis
  analysisResult: AnalysisResult;

  // Direct alias for daily demand-resource status (e.g. 'Overloaded')
  dailyStatus?: DemandResourceStatus;
}

// ─── AI Dump chat types ───────────────────────────────────────────────────────

export interface AiDumpChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  extractedWorkloadDrafts?: Array<{
    title: string;
    area: 'Academic' | 'Personal' | 'Social' | 'Self-Care';
    activityType: 'Deep focus' | 'Communication' | 'Creative' | 'Physical' | 'Administrative';
    urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
    estimatedHours: number;
    cognitive: number;
    emotional: number;
    physical: number;
  }>;
  stressDrivers?: string[];
  stressEffects?: string[];
  recoveryNeeds?: string[];
  suggestedAction?: 'manage' | 'recover' | 'none';
  isVoice?: boolean;
  audioDuration?: string;
  audioWave?: number[];
  isShoutVent?: boolean;
  decibelLevel?: number;
  unrecordedWorkload?: {
    title: string;
    dueDate?: string;
    dueTime?: string;
    deadline?: string;
    estimatedHours: number;
    area: 'Academic' | 'Personal' | 'Social' | 'Self-Care';
    activityType?: 'Deep focus' | 'Communication' | 'Creative' | 'Physical' | 'Administrative';
    urgency?: 'Low' | 'Medium' | 'High' | 'Urgent';
    notes?: string;
  };
  isAddedToCalendar?: boolean;
  isOverloadNotice?: boolean;
  overloadSummary?: {
    totalHours: number;
    availableHours: number;
    deficit: number;
    taskTitle?: string;
  };
  isNicoleDemoExtraction?: boolean;
  isNicoleAnalysisPlan?: boolean;
  nicoleClarified?: boolean;
  nicoleConfirmed?: boolean;
  nicoleContext?: {
    primaryConcern: string;
    secondaryConcern: string;
    additionalDemand: string;
    currentFeeling: string;
    recentContext: string;
  };
}

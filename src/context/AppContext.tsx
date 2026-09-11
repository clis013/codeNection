import React, { createContext, useContext, useState } from 'react';
import { WorkloadItem, WorkloadArea, UrgencyLevel, FlexibilityLevel, NasaTlxScore, SubTask, WorkloadStatus } from '../types/workload';
import {
  DailyCheckIn,
  AiDumpChatMessage,
  CapacityProfile,
  StressCategory,
  BaselineComparisonCategory,
  BaselineMetrics,
  DerivedWorkloadFacts,
  AnalysisResult
} from '../types/stress';
import { getTodayLocalDate } from '../utils/dateHelpers';
import {
  getDominantAreas,
  getMostDrainingDemands,
  calculateAreaDistribution,
  calculateDemandDistribution,
  calculateTotalRemainingHours,
  calculateTotalEstimatedHours
} from '../utils/demandHelpers';
import { buildAnalysisInput, getMockAnalysis } from '../services/mockAnalysisProvider';
import { FixedBusyEvent, ProtectedTime, FocusBlock, TimeResourceFacts } from '../types/calendar';
import { calculateCandidateWindows, deriveTimeResourceFacts } from '../services/calendarEngine';
import { NICOLE_FIXED_BUSY_EVENTS, NICOLE_PROTECTED_TIME, NICOLE_NARRATIVE, TECH_CARNIVAL_SPONSORSHIP_ITEM } from '../demo/nicoleDemo';
export { NICOLE_FIXED_BUSY_EVENTS, NICOLE_PROTECTED_TIME, NICOLE_NARRATIVE, TECH_CARNIVAL_SPONSORSHIP_ITEM } from '../demo/nicoleDemo';

export type NavTab = 'home' | 'map' | 'chat' | 'workloads' | 'balance' | 'tree';

// Analysis Provider boundary is now handled inside AppProvider via mockAnalysisProvider.

// ─── AppContextType ──────────────────────────────────────────────────────────

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // Workload State
  workloads: WorkloadItem[];
  selectedWorkload: WorkloadItem | null;
  setSelectedWorkload: (item: WorkloadItem | null) => void;
  isWorkloadDetailOpen: boolean;
  setIsWorkloadDetailOpen: (open: boolean) => void;
  isAddWorkloadOpen: boolean;
  setIsAddWorkloadOpen: (open: boolean) => void;
  addWorkloadInitialArea: WorkloadArea;
  setAddWorkloadInitialArea: (area: WorkloadArea) => void;
  addWorkloadInitialData?: any | null;
  setAddWorkloadInitialData: (data: any | null) => void;
  markChatWorkloadAdded: (messageId: string) => void;
  clarifiedWorkloadIds: string[];

  addWorkload: (item: Omit<WorkloadItem, 'id' | 'status' | 'subtasks' | 'remainingTimeHours' | 'timeFlexibility' | 'effortFlexibility' | 'workloadType' | 'timingType' | 'importance' | 'schedulingCharacteristics'> & {
    subtasks?: SubTask[];
    status?: WorkloadStatus;
    nasaTlx?: NasaTlxScore;
    remainingTimeHours?: number;
    flexibility?: FlexibilityLevel;
    timeFlexibility?: 'Strict' | 'Moderate' | 'Flexible';
    effortFlexibility?: 'Strict' | 'Moderate' | 'Flexible';
    workloadType?: WorkloadItem['workloadType'];
    timingType?: WorkloadItem['timingType'];
    importance?: WorkloadItem['importance'];
    schedulingCharacteristics?: WorkloadItem['schedulingCharacteristics'];
  }) => void;
  updateWorkload: (item: WorkloadItem) => void;
  deleteWorkload: (id: string) => void;
  toggleSubtask: (workloadId: string, subtaskId: string) => void;
  addSubtask: (workloadId: string, title: string) => void;
  deleteSubtask: (workloadId: string, subtaskId: string) => void;
  saveNasaTlxScore: (workloadId: string, score: NasaTlxScore) => void;
  applyRebalancedTasks: (items: WorkloadItem[]) => void;

  // Filter state for Workload Details view
  areaFilter: 'All' | WorkloadArea;
  setAreaFilter: (area: 'All' | WorkloadArea) => void;
  sortBy: 'deadline' | 'urgency' | 'demand' | 'stress';
  setSortBy: (sort: 'deadline' | 'urgency' | 'demand' | 'stress') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeWorkloadSubTab: 'calendar' | 'records';
  setActiveWorkloadSubTab: (tab: 'calendar' | 'records') => void;
  hasShownInitialTreeHoleNotice: boolean;
  setHasShownInitialTreeHoleNotice: (shown: boolean) => void;

  // Check-In & Stress State
  checkIns: DailyCheckIn[];
  isCheckInOpen: boolean;
  setIsCheckInOpen: (open: boolean) => void;
  checkInSource: 'home' | 'chat' | 'tree';
  setCheckInSource: (source: 'home' | 'chat' | 'tree') => void;
  saveCheckIn: (checkIn: Omit<DailyCheckIn, 'id'>) => void;
  todayCheckIn: DailyCheckIn | null;
  isRetestRequested: boolean;
  setIsRetestRequested: (requested: boolean) => void;

  // Stress Calculations
  calculatePss: (q1: number, q2: number, q3: number, q4: number) => { score: number; category: StressCategory; interpretation: string };
  /**
   * Returns null when fewer than 30 prior check-in records exist
   * (baseline is insufficient — do not fabricate a comparison).
   */
  calculateBaselineDiff: (todayScore: number) => { diff: number; category: BaselineComparisonCategory; interpretation: string } | null;
  /** The fixed 30-record baseline metrics and averages */
  baselineMetrics: BaselineMetrics;
  baselineStressAverage: number | null;
  baselineEnergyAverage: number | null;
  baselineControlAverage: number | null;
  baselineMentalDemandAverage: number | null;
  baselineCopingConfidenceAverage: number | null;
  /** True when ≥30 prior check-in records exist. */
  hasBaseline: boolean;

  // Recovery Modals
  isTreeHoleOpen: boolean;
  setIsTreeHoleOpen: (open: boolean) => void;
  isColourReflectionOpen: boolean;
  setIsColourReflectionOpen: (open: boolean) => void;

  // AI Dump Chat State
  chatMessages: AiDumpChatMessage[];
  sendChatMessage: (text: string, voiceOptions?: { isVoice?: boolean; audioDuration?: string; audioWave?: number[]; isShoutVent?: boolean; decibelLevel?: number }) => void;
  addAiChatMessage: (msg: Partial<AiDumpChatMessage> & { text: string }) => void;
  confirmExtractedDraft: (draft: any) => void;
  confirmAllExtractedDrafts: (drafts: any[]) => void;
  clarifyNicoleMessage: (messageId: string) => void;
  confirmNicoleStressDump: (messageId?: string) => void;
  chatSource: 'default' | 'treehole' | 'gardener';
  setChatSource: (source: 'default' | 'treehole' | 'gardener') => void;
  newAppleWorkloadId: string | null;
  setNewAppleWorkloadId: (id: string | null) => void;
  gardenerHasQuestion: boolean;
  setGardenerHasQuestion: (hasQuestion: boolean) => void;
  sendGardenerQuestionToChat: () => void;
  sendSquirrelInsightToChat: () => void;
  isTreeBent: boolean;
  setIsTreeBent: (bent: boolean) => void;
  isBalancePlanApplied: boolean;
  setIsBalancePlanApplied: (applied: boolean) => void;
  isFcgExtendedPlan: boolean;
  setIsFcgExtendedPlan: (extended: boolean) => void;
  isBalancePlanGenerating: boolean;
  setIsBalancePlanGenerating: (generating: boolean) => void;
  hasRemindedCheckInToday: boolean;
  markCheckInRemindedToday: () => void;
  harvestedAppleIds: string[];
  harvestApple: (workloadId: string) => void;

  // Calendar & Schedule State
  busyEvents: FixedBusyEvent[];
  setBusyEvents: React.Dispatch<React.SetStateAction<FixedBusyEvent[]>>;
  protectedTimes: ProtectedTime[];
  setProtectedTimes: React.Dispatch<React.SetStateAction<ProtectedTime[]>>;
  focusBlocks: FocusBlock[];
  setFocusBlocks: React.Dispatch<React.SetStateAction<FocusBlock[]>>;
  customSchedules: Record<string, { date: string; startTime: string; endTime: string }>;
  setCustomSchedules: React.Dispatch<React.SetStateAction<Record<string, { date: string; startTime: string; endTime: string }>>>;

  // Capacity & Insight Metrics
  capacityProfile: CapacityProfile;

  /**
   * Deterministic facts derived from current active workloads.
   * Computed from structured data — NOT AI interpretation.
   * Use these in views instead of computing inline.
   */
  derivedWorkloadFacts: DerivedWorkloadFacts;

  /**
   * Shared Analysis Result.
   * Consumed by views like Home and Map to display the same interpretation of the user's state.
   */
  analysisResult: AnalysisResult;
}

// ─── Mock workload data ──────────────────────────────────────────────────────

const initialWorkloads: WorkloadItem[] = [
  {
    id: 'os-quiz-1',
    title: 'Operating System Quiz 1',
    area: 'Academic',
    workloadType: 'ExamPreparation',
    activityType: 'Deep focus',
    timingType: 'Deadline',
    deadline: '2026-09-10T08:00:00+08:00',
    estimatedHours: 5,
    remainingTimeHours: 5,
    urgency: 'High',
    importance: 'High',
    userPriority: 'High',
    timeFlexibility: 'Moderate',
    effortFlexibility: 'Strict',
    demandProfile: {
      cognitive: 5,
      emotional: 3,
      physical: 1
    },
    perceivedStressImpact: 5,
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: true,
      preferredBlockMinutes: 90,
      minimumBlockMinutes: 30,
      source: 'workload-default'
    },
    status: 'Active',
    subtasks: [
      {
        id: 'os-st-1',
        title: 'Review processes and scheduling',
        completed: false
      },
      {
        id: 'os-st-2',
        title: 'Practice past quiz questions',
        completed: false
      }
    ]
  },
  {
    id: 'web-programming-group',
    title: 'Web Programming Group Assignment',
    area: 'Academic',
    workloadType: 'Assignment',
    activityType: 'Deep focus',
    timingType: 'Deadline',
    deadline: '2026-09-11T23:59:00+08:00',
    estimatedHours: 12,
    remainingTimeHours: 12,
    urgency: 'High',
    importance: 'High',
    userPriority: 'High',
    timeFlexibility: 'Moderate',
    effortFlexibility: 'Moderate',
    demandProfile: {
      cognitive: 5,
      emotional: 3,
      physical: 1
    },
    perceivedStressImpact: 5,
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: true,
      preferredBlockMinutes: 90,
      minimumBlockMinutes: 30,
      source: 'workload-default'
    },
    status: 'Active',
    subtasks: [
      {
        id: 'web-st-1',
        title: 'Complete remaining frontend integration',
        completed: false
      },
      {
        id: 'web-st-2',
        title: "Integrate group members' unfinished sections",
        completed: false
      },
      {
        id: 'web-st-3',
        title: 'Testing and final submission preparation',
        completed: false
      }
    ]
  },
  {
    id: 'fcg-test-1',
    title: 'FCG Test',
    area: 'Academic',
    workloadType: 'ExamPreparation',
    activityType: 'Deep focus',
    timingType: 'Deadline',
    deadline: '2026-09-14T14:00:00+08:00',
    estimatedHours: 8,
    remainingTimeHours: 8,
    urgency: 'Medium',
    importance: 'High',
    userPriority: 'Medium',
    timeFlexibility: 'Flexible',
    effortFlexibility: 'Strict',
    demandProfile: {
      cognitive: 5,
      emotional: 3,
      physical: 1
    },
    perceivedStressImpact: 4,
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: true,
      preferredBlockMinutes: 90,
      minimumBlockMinutes: 30,
      source: 'workload-default'
    },
    status: 'Active',
    subtasks: [
      {
        id: 'fcg-st-1',
        title: 'Review test topics',
        completed: true
      },
      {
        id: 'fcg-st-2',
        title: 'Practice problem solving',
        completed: false
      }
    ]
  },
  {
    id: 'philosophy-reflection',
    title: 'Philosophy Reflection',
    area: 'Academic',
    workloadType: 'Assignment',
    activityType: 'Creative',
    timingType: 'Deadline',
    deadline: '2026-09-18T23:59:00+08:00',
    estimatedHours: 2,
    remainingTimeHours: 2,
    urgency: 'Low',
    importance: 'Medium',
    userPriority: 'Low',
    timeFlexibility: 'Flexible',
    effortFlexibility: 'Moderate',
    demandProfile: {
      cognitive: 3,
      emotional: 1,
      physical: 1
    },
    perceivedStressImpact: 2,
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: false,
      preferredBlockMinutes: 60,
      minimumBlockMinutes: 30,
      source: 'workload-default'
    },
    status: 'Active',
    subtasks: [
      {
        id: 'phil-st-1',
        title: 'Draft reflection',
        completed: false
      },
      {
        id: 'phil-st-2',
        title: 'Revise and submit',
        completed: false
      }
    ]
  }
];

// ─── Nicole Baseline Metrics (Fixed Demo Source of Truth) ─────────────────────
// Represents Nicole's latest 30 completed Daily Check-Ins strictly BEFORE 2026-09-08.
// Sample size: 30 completed prior check-ins. Today's check-in (Sep 8) is NOT included.
export const NICOLE_BASELINE: BaselineMetrics = {
  hasBaseline: true,
  baselineStressAverage: 10.4,
  baselineEnergyAverage: 3.6,
  baselineControlAverage: 3.7,
  baselineMentalDemandAverage: 3.1,
  baselineCopingConfidenceAverage: 3.6
};

/**
 * Calculates per-dimension differences and qualitative interpretations between today's check-in and baseline.
 */
export function getBaselineDimensionComparisons(todayCheckIn: DailyCheckIn, baseline: BaselineMetrics = NICOLE_BASELINE) {
  return {
    stress: {
      today: todayCheckIn.pssScore,
      baseline: baseline.baselineStressAverage,
      diff: Number((todayCheckIn.pssScore - baseline.baselineStressAverage).toFixed(1)),
      interpretation: "Nicole's perceived stress is substantially above her usual level."
    },
    energy: {
      today: todayCheckIn.energyLevel,
      baseline: baseline.baselineEnergyAverage,
      diff: Number((todayCheckIn.energyLevel - baseline.baselineEnergyAverage).toFixed(1)),
      interpretation: "Energy is substantially below her usual level."
    },
    control: {
      today: todayCheckIn.q2_control,
      baseline: baseline.baselineControlAverage,
      diff: Number((todayCheckIn.q2_control - baseline.baselineControlAverage).toFixed(1)),
      interpretation: "Perceived control is below her usual level."
    },
    mentalDemand: {
      today: todayCheckIn.q3_mentalDemand,
      baseline: baseline.baselineMentalDemandAverage,
      diff: Number((todayCheckIn.q3_mentalDemand - baseline.baselineMentalDemandAverage).toFixed(1)),
      interpretation: "Mental demand is above her usual level."
    },
    copingCapability: {
      today: todayCheckIn.q4_capability,
      baseline: baseline.baselineCopingConfidenceAverage,
      diff: Number((todayCheckIn.q4_capability - baseline.baselineCopingConfidenceAverage).toFixed(1)),
      interpretation: "Coping capability is below her usual level."
    }
  };
}

// Nicole canonical demo scenario Check-In History (Sep 1 to Sep 8, 2026):
const initialCheckIns: DailyCheckIn[] = [
  {
    id: 'nicole-checkin-2026-09-01',
    date: '2026-09-01',
    createdAt: '2026-09-01T21:00:00+08:00',
    q1_stress: 2,
    q2_control: 4,
    q3_mentalDemand: 3,
    q4_capability: 4,
    energyLevel: 4,
    emotionFeeling: 'All Good',
    pssScore: 9,
    category: 'Normal',
    controlScore: 4,
    mentalDemandScore: 3,
    copingCapabilityScore: 4,
    baselineDiff: undefined
  },
  {
    id: 'nicole-checkin-2026-09-02',
    date: '2026-09-02',
    createdAt: '2026-09-02T21:00:00+08:00',
    q1_stress: 3,
    q2_control: 4,
    q3_mentalDemand: 3,
    q4_capability: 4,
    energyLevel: 4,
    emotionFeeling: 'All Good',
    pssScore: 10,
    category: 'Normal',
    controlScore: 4,
    mentalDemandScore: 3,
    copingCapabilityScore: 4,
    baselineDiff: undefined
  },
  {
    id: 'nicole-checkin-2026-09-03',
    date: '2026-09-03',
    createdAt: '2026-09-03T21:00:00+08:00',
    q1_stress: 3,
    q2_control: 3,
    q3_mentalDemand: 3,
    q4_capability: 4,
    energyLevel: 3,
    emotionFeeling: 'Normal',
    pssScore: 11,
    category: 'Elevated',
    controlScore: 3,
    mentalDemandScore: 3,
    copingCapabilityScore: 4,
    baselineDiff: undefined
  },
  {
    id: 'nicole-checkin-2026-09-04',
    date: '2026-09-04',
    createdAt: '2026-09-04T21:00:00+08:00',
    q1_stress: 3,
    q2_control: 3,
    q3_mentalDemand: 4,
    q4_capability: 3,
    energyLevel: 3,
    emotionFeeling: 'Tense',
    pssScore: 13,
    category: 'Elevated',
    controlScore: 3,
    mentalDemandScore: 4,
    copingCapabilityScore: 3,
    baselineDiff: undefined
  },
  {
    id: 'nicole-checkin-2026-09-05',
    date: '2026-09-05',
    createdAt: '2026-09-05T21:00:00+08:00',
    q1_stress: 4,
    q2_control: 3,
    q3_mentalDemand: 4,
    q4_capability: 3,
    energyLevel: 2,
    emotionFeeling: 'Normal',
    pssScore: 14,
    category: 'High',
    controlScore: 3,
    mentalDemandScore: 4,
    copingCapabilityScore: 3,
    baselineDiff: undefined
  },
  {
    id: 'nicole-checkin-2026-09-06',
    date: '2026-09-06',
    createdAt: '2026-09-06T21:00:00+08:00',
    q1_stress: 4,
    q2_control: 2,
    q3_mentalDemand: 4,
    q4_capability: 3,
    energyLevel: 2,
    emotionFeeling: 'Tense',
    pssScore: 15,
    category: 'High',
    controlScore: 2,
    mentalDemandScore: 4,
    copingCapabilityScore: 3,
    baselineDiff: undefined
  },
  {
    id: 'nicole-checkin-2026-09-07',
    date: '2026-09-07',
    createdAt: '2026-09-07T21:00:00+08:00',
    q1_stress: 4,
    q2_control: 2,
    q3_mentalDemand: 5,
    q4_capability: 2,
    energyLevel: 2,
    emotionFeeling: 'Overwhelmed',
    pssScore: 17,
    category: 'Very High',
    controlScore: 2,
    mentalDemandScore: 5,
    copingCapabilityScore: 2,
    baselineDiff: undefined
  }
];

// ─── Initial chat messages ────────────────────────────────────────────────────

const initialChatMessages: AiDumpChatMessage[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: "Hi Nicole! *Squeak!* Feel free to dump your stress, thoughts, or unrecorded tasks into this tree hole. I'll help you organize your workload and find balance for your tree.",
    timestamp: 'Just now'
  }
];

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── parseUnrecordedWorkload (Stress Dump helper — unchanged from original) ──

export function parseUnrecordedWorkload(text: string) {
  const lower = text.toLowerCase();

  const isUnrecordedTrigger =
    lower.includes('not recorded') ||
    lower.includes("haven't recorded") ||
    lower.includes("havent recorded") ||
    lower.includes("didn't record") ||
    lower.includes("didnt record") ||
    lower.includes('not yet recorded') ||
    lower.includes('unrecorded') ||
    lower.includes('not added') ||
    lower.includes('forgot to add') ||
    lower.includes("haven't added") ||
    lower.includes("havent added") ||
    lower.includes('new workload') ||
    lower.includes('new task') ||
    lower.includes('add task') ||
    lower.includes('record this task') ||
    lower.includes('record this workload') ||
    lower.includes('test tomorrow') ||
    lower.includes('have a test') ||
    lower.includes('have test') ||
    lower.includes('exam tomorrow');

  if (!isUnrecordedTrigger) {
    return null;
  }

  let estimatedHours = 3;
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)/i);
  if (hourMatch) {
    estimatedHours = parseFloat(hourMatch[1]);
  } else {
    const minMatch = text.match(/(\d+)\s*(?:mins?|minutes?)/i);
    if (minMatch) {
      estimatedHours = parseFloat((parseInt(minMatch[1], 10) / 60).toFixed(1));
    }
  }

  // TODO (Stress Dump redesign stage): date references below are prototype-hardcoded.
  // They should become relative to getTodayLocalDate() when Stress Dump is redesigned.
  let dueDate = '2026-09-09';
  let dueTime = '20:00';

  if (lower.includes('today') || lower.includes('tonight')) {
    dueDate = '2026-09-08';
  } else if (lower.includes('tomorrow')) {
    dueDate = '2026-09-09';
  } else if (lower.includes('day after tomorrow')) {
    dueDate = '2026-09-10';
  } else if (lower.includes('friday')) {
    dueDate = '2026-09-11';
  } else if (lower.includes('saturday')) {
    dueDate = '2026-09-12';
  } else if (lower.includes('sunday')) {
    dueDate = '2026-09-13';
  } else if (lower.includes('next monday') || lower.includes('monday')) {
    dueDate = '2026-09-14';
  } else {
    const explicitDateMatch = text.match(/\b(2026-\d{2}-\d{2})\b/);
    if (explicitDateMatch) {
      dueDate = explicitDateMatch[1];
    }
  }

  const time12Match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (time12Match) {
    let hour = parseInt(time12Match[1], 10);
    const minute = time12Match[2] || '00';
    const ampm = time12Match[3].toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    dueTime = `${hour.toString().padStart(2, '0')}:${minute}`;
  } else {
    const time24Match = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (time24Match) {
      dueTime = `${time24Match[1].padStart(2, '0')}:${time24Match[2]}`;
    }
  }

  let area: 'Academic' | 'Personal' | 'Social' | 'Self-Care' = 'Academic';
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('sleep') || lower.includes('meditat') || lower.includes('health') || lower.includes('walk') || lower.includes('rest')) {
    area = 'Self-Care';
  } else if (lower.includes('grocery') || lower.includes('clean') || lower.includes('errand') || lower.includes('bill') || lower.includes('laundry')) {
    area = 'Personal';
  } else if (lower.includes('dinner') || lower.includes('party') || lower.includes('friend') || lower.includes('meet') || lower.includes('social')) {
    area = 'Social';
  }

  let title = '';
  const colonMatch = text.match(/(?:before|workload|task|assignment|added|forgot|tomorrow|test|exam)\s*[:\-]\s*([^,\n.!?]+?)(?=\s+(?:due|takes|taking|at\s+\d|in\s+\d|\d+h|\d+\s*hours?)|[,\n.!?]|$)/i);
  if (colonMatch && colonMatch[1].trim().length > 1) {
    title = colonMatch[1].trim();
  } else {
    const phraseMatch = text.match(/\b([A-Z0-9a-z\s-]{2,35}?(?:Assignment|Project|Presentation|Lab|Report|Essay|Exam|Test|Quiz|Paper|Meeting|Review|Prep|Revision|Homework))\b/i);
    if (phraseMatch) {
      title = phraseMatch[1].trim();
    } else {
      const generalMatch = text.match(/(?:workload|task|have)\s+(?:that\s+not\s+recorded\s+before|unrecorded)?\s*(?:called|named)?\s*[:\-]?\s*([^,\n.]+?)(?=\s+(?:due|takes|taking|at\s+\d|\d+h|\d+\s*hours?)|[,\n.]|$)/i);
      if (generalMatch && generalMatch[1].trim().length > 2 && !generalMatch[1].toLowerCase().includes('not recorded')) {
        title = generalMatch[1].trim();
      }
    }
  }

  if (!title || title.length < 2 || title === 'Unrecorded Workload Task') {
    if (lower.includes('test') || lower.includes('quiz') || lower.includes('exam')) {
      title = 'Preparation for Test Tomorrow';
    } else {
      title = 'Unrecorded Workload Task';
    }
  }

  return {
    title,
    dueDate,
    dueTime,
    deadline: `${dueDate}T${dueTime}:00`,
    estimatedHours,
    area,
    urgency: 'High' as const,
    activityType: 'Deep focus' as const,
    notes: 'Extracted directly from AI chat unrecorded workload.'
  };
}

// ─── AppProvider ─────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [workloads, setWorkloads] = useState<WorkloadItem[]>(initialWorkloads);
  const [selectedWorkload, setSelectedWorkload] = useState<WorkloadItem | null>(initialWorkloads[0]);
  const [isWorkloadDetailOpen, setIsWorkloadDetailOpen] = useState(false);
  const [isAddWorkloadOpen, setIsAddWorkloadOpen] = useState(false);
  const [addWorkloadInitialArea, setAddWorkloadInitialArea] = useState<WorkloadArea>('Academic');
  const [addWorkloadInitialData, setAddWorkloadInitialData] = useState<any | null>(null);

  const [areaFilter, setAreaFilter] = useState<'All' | WorkloadArea>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'urgency' | 'demand' | 'stress'>('urgency');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkloadSubTab, setActiveWorkloadSubTab] = useState<'calendar' | 'records'>('records');
  const [hasShownInitialTreeHoleNotice, setHasShownInitialTreeHoleNotice] = useState(false);

  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(initialCheckIns);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInSource, setCheckInSource] = useState<'home' | 'chat' | 'tree'>('home');
  const [isRetestRequested, setIsRetestRequested] = useState(false);
  const [isTreeHoleOpen, setIsTreeHoleOpen] = useState(false);
  const [isColourReflectionOpen, setIsColourReflectionOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<AiDumpChatMessage[]>(initialChatMessages);
  const [clarifiedWorkloadIds, setClarifiedWorkloadIds] = useState<string[]>([]);
  const [chatSource, setChatSource] = useState<'default' | 'treehole' | 'gardener'>('default');
  const [newAppleWorkloadId, setNewAppleWorkloadId] = useState<string | null>(null);
  const [gardenerHasQuestion, setGardenerHasQuestion] = useState(false);
  const [isTreeBent, setIsTreeBent] = useState(false);
  const [isBalancePlanApplied, setIsBalancePlanApplied] = useState(false);
  const [isFcgExtendedPlan, setIsFcgExtendedPlan] = useState(false);
  const [isBalancePlanGenerating, setIsBalancePlanGenerating] = useState(false);
  const [harvestedAppleIds, setHarvestedAppleIds] = useState<string[]>([]);
  const harvestApple = (workloadId: string) => {
    setHarvestedAppleIds(prev => prev.includes(workloadId) ? prev : [...prev, workloadId]);
  };

  // ─── Date-anchored derivations ──────────────────────────────────────────────

  const TODAY = getTodayLocalDate(); // e.g. '2026-09-08'

  // Today's check-in — only matches local calendar date, never a previous day's record
  const todayCheckIn = checkIns.find(c => c.date === TODAY) || null;

  // Track if check-in reminder has been shown today (do not duplicate reminder if already reminded today)
  const [lastCheckInReminderDate, setLastCheckInReminderDate] = useState<string | null>(null);
  const hasRemindedCheckInToday = lastCheckInReminderDate === TODAY;
  const markCheckInRemindedToday = () => setLastCheckInReminderDate(TODAY);

  // Prior records: all with date strictly before today, sorted newest-first
  const allPriorCheckIns = checkIns
    .filter(c => c.date < TODAY)
    .sort((a, b) => b.date.localeCompare(a.date));

  // ─── Nicole Baseline Metrics (Fixed Demo Source of Truth) ───────────────────
  // Represents Nicole's latest 30 completed Daily Check-Ins strictly before 2026-09-08.
  // Sample size: 30 completed prior check-ins. Today (2026-09-08) is NOT included.
  const baselineMetrics: BaselineMetrics = NICOLE_BASELINE;
  const hasBaseline = baselineMetrics.hasBaseline;
  const baselineStressAverage: number = baselineMetrics.baselineStressAverage;
  const baselineEnergyAverage: number = baselineMetrics.baselineEnergyAverage;
  const baselineControlAverage: number = baselineMetrics.baselineControlAverage;
  const baselineMentalDemandAverage: number = baselineMetrics.baselineMentalDemandAverage;
  const baselineCopingConfidenceAverage: number = baselineMetrics.baselineCopingConfidenceAverage;

  // ─── Stress calculations ────────────────────────────────────────────────────

  // PSS Formula: Q1 + (6 - Q2) + Q3 + (6 - Q4)
  const calculatePss = (q1: number, q2: number, q3: number, q4: number) => {
    const score = q1 + (6 - q2) + q3 + (6 - q4);
    let category: StressCategory = 'Normal';
    let interpretation = 'Stress within normal range';

    if (score >= 17) {
      category = 'Very High';
      interpretation = 'Stress in top tier of scores, critical level requiring recovery & rebalancing';
    } else if (score >= 14) {
      category = 'High';
      interpretation = 'Stress notably elevated, indicating substantial demand pressure';
    } else if (score >= 11) {
      category = 'Elevated';
      interpretation = 'Stress elevated compared to usual baseline';
    } else {
      category = 'Normal';
      interpretation = 'Stress within normal range';
    }

    return { score, category, interpretation };
  };

  // Baseline comparison — returns null when insufficient data (< 30 prior records)
  const calculateBaselineDiff = (todayScore: number) => {
    if (baselineStressAverage === null) {
      return null; // Insufficient data — do NOT fabricate a baseline comparison
    }
    const diff = Number((todayScore - baselineStressAverage).toFixed(1));
    let category: BaselineComparisonCategory = 'normal';
    let interpretation = 'Typical for you';

    if (diff >= 6) {
      category = 'significantly elevated';
      interpretation = "Nicole's perceived stress is substantially above her usual level.";
    } else if (diff >= 3) {
      category = 'elevated';
      interpretation = 'Higher than your normal — monitor for patterns';
    } else if (diff <= -3) {
      category = 'lower than normal';
      interpretation = 'Better than your normal — good recovery day';
    } else {
      category = 'normal';
      interpretation = 'Typical for you';
    }

    return { diff, category, interpretation };
  };

  // ─── Workload handlers ──────────────────────────────────────────────────────

  const addWorkload = (newItem: Omit<WorkloadItem, 'id' | 'status' | 'subtasks' | 'remainingTimeHours' | 'timeFlexibility' | 'effortFlexibility' | 'workloadType' | 'timingType' | 'importance' | 'schedulingCharacteristics'> & {
    subtasks?: SubTask[];
    status?: WorkloadStatus;
    nasaTlx?: NasaTlxScore;
    remainingTimeHours?: number;
    flexibility?: FlexibilityLevel;
    timeFlexibility?: 'Strict' | 'Moderate' | 'Flexible';
    effortFlexibility?: 'Strict' | 'Moderate' | 'Flexible';
    workloadType?: WorkloadItem['workloadType'];
    timingType?: WorkloadItem['timingType'];
    importance?: WorkloadItem['importance'];
    schedulingCharacteristics?: WorkloadItem['schedulingCharacteristics'];
  }) => {
    const subtasks = newItem.subtasks || [];
    const allDone = subtasks.length > 0 && subtasks.every(s => s.completed);
    const flex = newItem.flexibility || (newItem as any).timeFlexibility || 'Moderate';
    const item: WorkloadItem = {
      timeFlexibility: flex,
      effortFlexibility: flex,
      workloadType: (newItem as any).workloadType || 'Assignment',
      timingType: (newItem as any).timingType || 'Deadline',
      importance: (newItem as any).importance || 'Medium',
      schedulingCharacteristics: (newItem as any).schedulingCharacteristics || {
        splittable: true,
        spacingPreferred: true,
        source: 'workload-default'
      },
      ...newItem,
      id: `w-${Date.now()}`,
      status: newItem.status || (allDone ? 'Completed' : 'Active'),
      subtasks,
      // Default remainingTimeHours = estimatedHours for new workloads
      remainingTimeHours: newItem.remainingTimeHours ?? newItem.estimatedHours,
      nasaTlx: newItem.nasaTlx
    };
    setWorkloads(prev => [item, ...prev]);
    setIsBalancePlanApplied(false);
    setIsTreeBent(true);
    setGardenerHasQuestion(true);
    setNewAppleWorkloadId(item.id);
  };

  const updateWorkload = (updatedItem: WorkloadItem) => {
    setWorkloads(prev => {
      const exists = prev.some(w => w.id === updatedItem.id);
      if (exists) {
        return prev.map(w => w.id === updatedItem.id ? updatedItem : w);
      }
      return [...prev, updatedItem];
    });
    if (selectedWorkload?.id === updatedItem.id) {
      setSelectedWorkload(updatedItem);
    }
    // Track that the user explicitly pressed Save Changes in the edit modal
    setClarifiedWorkloadIds(prev => prev.includes(updatedItem.id) ? prev : [...prev, updatedItem.id]);
    if (updatedItem.id === 'tech-carnival-sponsorship' || updatedItem.id === 'web-programming-group') {
      setChatMessages(prev => prev.map(msg => {
        if (msg.isNicoleDemoExtraction) {
          return { ...msg, nicoleClarified: true };
        }
        return msg;
      }));
    }
  };

  const deleteWorkload = (id: string) => {
    setWorkloads(prev => prev.filter(w => w.id !== id));
    if (selectedWorkload?.id === id) {
      setSelectedWorkload(null);
      setIsWorkloadDetailOpen(false);
    }
  };

  const toggleSubtask = (workloadId: string, subtaskId: string) => {
    setWorkloads(prev => prev.map(w => {
      if (w.id !== workloadId) return w;
      const updatedSubtasks = w.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
      const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
      return {
        ...w,
        subtasks: updatedSubtasks,
        status: allDone ? 'Completed' : 'Active'
      };
    }));
    if (selectedWorkload?.id === workloadId) {
      setSelectedWorkload(prev => {
        if (!prev) return null;
        const updatedSubtasks = prev.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
        return {
          ...prev,
          subtasks: updatedSubtasks,
          status: allDone ? 'Completed' : 'Active'
        };
      });
    }
  };

  const addSubtask = (workloadId: string, title: string) => {
    const newSt = { id: `st-${Date.now()}`, title, completed: false };
    setWorkloads(prev => prev.map(w => {
      if (w.id !== workloadId) return w;
      return { ...w, subtasks: [...w.subtasks, newSt] };
    }));
    if (selectedWorkload?.id === workloadId) {
      setSelectedWorkload(prev => prev ? { ...prev, subtasks: [...prev.subtasks, newSt] } : null);
    }
  };

  const deleteSubtask = (workloadId: string, subtaskId: string) => {
    setWorkloads(prev => prev.map(w => {
      if (w.id !== workloadId) return w;
      return { ...w, subtasks: w.subtasks.filter(st => st.id !== subtaskId) };
    }));
    if (selectedWorkload?.id === workloadId) {
      setSelectedWorkload(prev => prev ? { ...prev, subtasks: prev.subtasks.filter(st => st.id !== subtaskId) } : null);
    }
  };

  const saveNasaTlxScore = (workloadId: string, score: NasaTlxScore) => {
    const overall = (score.mentalDemand + score.physicalDemand + score.temporalDemand + score.performance + score.effort + score.frustration) / 6;
    const scoreWithOverall = { ...score, overallScore: Number(overall.toFixed(1)) };
    setWorkloads(prev => prev.map(w => w.id === workloadId ? { ...w, nasaTlx: scoreWithOverall } : w));
    if (selectedWorkload?.id === workloadId) {
      setSelectedWorkload(prev => prev ? { ...prev, nasaTlx: scoreWithOverall } : null);
    }
  };

  const applyRebalancedTasks = (rebalancedWorkloads: WorkloadItem[]) => {
    setWorkloads(rebalancedWorkloads);
    setIsBalancePlanApplied(true);
    setIsTreeBent(false);
  };

  const markChatWorkloadAdded = (messageId: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, isAddedToCalendar: true };
      }
      return msg;
    }));
  };

  // ─── Check-In handler ───────────────────────────────────────────────────────

  const createNicoleExtractionMessage = (customText?: string): AiDumpChatMessage => ({
    id: `msg-${Date.now() + 1}`,
    sender: 'ai',
    text: customText ?? '',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isNicoleDemoExtraction: true,
    nicoleClarified: false,
    nicoleConfirmed: false,
    nicoleContext: {
      primaryConcern: "Competing academic deadlines",
      secondaryConcern: "Nicole is taking on additional responsibility in a group assignment",
      additionalDemand: "Tech Carnival sponsorship responsibility",
      currentFeeling: "Unsure what to prioritize first",
      recentContext: "Nicole has just finished a difficult previous week and still feels depleted"
    },
    extractedWorkloadDrafts: [
      {
        title: "Operating System Quiz 1",
        area: "Academic",
        activityType: "Deep focus",
        urgency: "High",
        estimatedHours: 5,
        cognitive: 5,
        emotional: 3,
        physical: 1
      },
      {
        title: "Web Programming Group Assignment",
        area: "Academic",
        activityType: "Deep focus",
        urgency: "High",
        estimatedHours: 12,
        cognitive: 5,
        emotional: 3,
        physical: 1
      },
      {
        title: "Tech Carnival Sponsorship",
        area: "Social",
        activityType: "Communication",
        urgency: "High",
        estimatedHours: 6,
        cognitive: 3,
        emotional: 5,
        physical: 1
      },
      {
        title: "FCG Test",
        area: "Academic",
        activityType: "Deep focus",
        urgency: "Medium",
        estimatedHours: 8,
        cognitive: 5,
        emotional: 3,
        physical: 1
      }
    ],
    stressDrivers: [
      "Competing academic deadlines (OS Quiz vs Web Programming)",
      "Unfinished group partner work shifting to Nicole",
      "Tech Carnival extracurricular commitments",
      "Cumulative fatigue from previous week"
    ]
  });

  const saveCheckIn = (newCheckIn: Omit<DailyCheckIn, 'id'>) => {
    const checkIn: DailyCheckIn = {
      ...newCheckIn,
      id: `c-${Date.now()}`
    };
    // Replace any existing check-in for the same date (one per day)
    setCheckIns(prev => [...prev.filter(c => c.date !== checkIn.date), checkIn]);
    setLastCheckInReminderDate(TODAY);
    setGardenerHasQuestion(false);

    // Update message text when check-in is completed from chat:
    // Only update existing daily insight card if already present in chat (from gardener or squirrel), but do not create a new one.
    setChatMessages(prev => {
      // 1. Clean up any gardener's question messages about tree condition
      const withoutGardenerQuestion = prev.filter(m => !m.isGardenerQuestion);

      // 2. Update existing insight card if one was already present in chat
      const updated = withoutGardenerQuestion.map(m => {
        if (m.isGardenerExplanation || m.isSquirrelInsight || (m.isOverloadNotice && m.isNicoleAnalysisPlan)) {
          return {
            ...m,
            isGardenerExplanation: false,
            isSquirrelInsight: true,
            text: "Nicole, your tree condition and weather directly mirror your current mental capacity and daily stress level:"
          };
        }
        return m;
      });

      const hasPrompt = updated.some(m => m.isNicoleCheckInPrompt);
      const hasExtraction = updated.some(m => m.isNicoleDemoExtraction);
      if (hasPrompt && !hasExtraction) {
        const extractionReply = createNicoleExtractionMessage(
          "Thank you for completing your daily check-in, Nicole! Now I can analyze your stress level alongside your commitments. Here is the structured extraction of your workload demands and stress context:"
        );
        return [...updated, extractionReply];
      }
      return updated;
    });
  };

  // ─── AI Dump chat handlers ──────────────────────────────────────────────────

  const sendChatMessage = (
    text: string,
    voiceOptions?: { isVoice?: boolean; audioDuration?: string; audioWave?: number[]; isShoutVent?: boolean; decibelLevel?: number }
  ) => {
    const userMsg: AiDumpChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: voiceOptions?.isVoice,
      audioDuration: voiceOptions?.audioDuration,
      audioWave: voiceOptions?.audioWave,
      isShoutVent: voiceOptions?.isShoutVent,
      decibelLevel: voiceOptions?.decibelLevel,
    };

    // Nicole Canonical Demo Stress Dump detection
    const isNicoleDemo =
      text.includes("OOP assignment last week") ||
      text.includes("Tech Carnival and suddenly there are things I need to prepare for sponsorship") ||
      text.includes("I feel like I should just focus on OS first") ||
      text.trim() === NICOLE_NARRATIVE.trim();

    if (isNicoleDemo) {
      setTimeout(() => {
        const aiReply = createNicoleExtractionMessage('');

        setChatMessages(prev => {
          // Remove any gardener question or older insight cards so no gardener question is sent
          const cleaned = prev.filter(m => !m.isGardenerQuestion && !(m.isOverloadNotice && m.isNicoleAnalysisPlan));
          return [...cleaned, aiReply];
        });
      }, 1400);
      setChatMessages(prev => [...prev, userMsg]);
      return;
    }

    const unrecorded = parseUnrecordedWorkload(text);
    if (unrecorded) {
      setTimeout(() => {
        const aiReply: AiDumpChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: "I noticed you mentioned a workload that hasn't been recorded yet! I've extracted the task info from your message:",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unrecordedWorkload: unrecorded,
          isAddedToCalendar: false,
          suggestedAction: 'none'
        };
        setChatMessages(prev => [...prev, aiReply]);
      }, 1400);
      setChatMessages(prev => [...prev, userMsg]);
      return;
    }

    // Workload Area Question Detection (e.g. "What is my most workload area?")
    const isWorkloadAreaQuestion =
      text.toLowerCase().includes('most workload') ||
      text.toLowerCase().includes('workload area') ||
      text.toLowerCase().includes('heaviest') ||
      (text.toLowerCase().includes('area') && text.toLowerCase().includes('workload')) ||
      text.toLowerCase().includes('dominant area') ||
      text.toLowerCase().includes('busiest area');

    if (isWorkloadAreaQuestion) {
      setTimeout(() => {
        const activeList = workloads.filter(w => w.status !== 'Completed');
        const academicTasks = activeList.filter(w => (w.area as string)?.toLowerCase() === 'academic');
        const academicHours = Number(academicTasks.reduce((s, w) => s + (w.remainingTimeHours ?? w.estimatedHours ?? 0), 0).toFixed(1));
        const totalWorkloadHours = Number(activeList.reduce((s, w) => s + (w.remainingTimeHours ?? w.estimatedHours ?? 0), 0).toFixed(1));
        const academicPercent = totalWorkloadHours > 0 ? Math.round((academicHours / totalWorkloadHours) * 100) : 65;

        const otherTasks = activeList.filter(w => (w.area as string)?.toLowerCase() !== 'academic');
        const otherHours = Number(otherTasks.reduce((s, w) => s + (w.remainingTimeHours ?? w.estimatedHours ?? 0), 0).toFixed(1));
        const otherPercent = Math.max(0, 100 - academicPercent);

        const aiReply: AiDumpChatMessage = {
          id: `msg-area-${Date.now() + 1}`,
          sender: 'ai',
          text: `Nicole, your heaviest workload area by far is **Academic**, taking up **${academicHours} hours (~${academicPercent}%)** of your total ${totalWorkloadHours} hours of active commitments.\n\nHere is your full breakdown:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isWorkloadAreaResult: true,
          workloadAreaDetails: {
            dominantArea: 'Academic',
            dominantHours: academicHours,
            dominantPercent: academicPercent,
            totalHours: totalWorkloadHours,
            tasksInDominantArea: academicTasks.map(t => ({
              title: t.title,
              hours: t.remainingTimeHours ?? t.estimatedHours ?? 0
            })),
            otherAreas: [
              {
                area: 'Extracurricular / Social',
                hours: otherHours,
                percent: otherPercent
              }
            ]
          }
        };
        setChatMessages(prev => [...prev, aiReply]);
      }, 1400);
      setChatMessages(prev => [...prev, userMsg]);
      return;
    }

    const hasAssignment =
      text.toLowerCase().includes('assignment') ||
      text.toLowerCase().includes('lab') ||
      text.toLowerCase().includes('exam') ||
      text.toLowerCase().includes('project') ||
      text.toLowerCase().includes('proof') ||
      text.toLowerCase().includes('test') ||
      text.toLowerCase().includes('quiz') ||
      text.toLowerCase().includes('deadline') ||
      text.toLowerCase().includes('bad day') ||
      text.toLowerCase().includes('stress');

    const isShout =
      voiceOptions?.isShoutVent ||
      text.toLowerCase().includes('tree hole') ||
      text.toLowerCase().includes('shout') ||
      text.toLowerCase().includes('scream');

    setTimeout(() => {
      let replyText = "I've analyzed your thoughts! Here are the extracted workload items and stress factors.";
      let drafts: any[] | undefined = undefined;
      let drivers: string[] | undefined = undefined;

      if (isShout) {
        replyText = "🍃 I heard your loud shout release! The tree hole has absorbed the tension, and its leaves carried your stress away. Take a gentle, deep breath in... and exhale slowly. You are doing great.";
      } else if (hasAssignment) {
        replyText = "I've analyzed your thoughts! Here are the extracted workload items and stress factors.";
        const isTest = text.toLowerCase().includes('test') || text.toLowerCase().includes('quiz') || text.toLowerCase().includes('exam');
        drafts = [
          {
            title: text.length > 35 && !text.toLowerCase().includes('assignment')
              ? text.substring(0, 35) + '...'
              : 'Upcoming Assignment / Project Deadline',
            area: 'Academic' as const,
            activityType: 'Deep focus' as const,
            urgency: 'High' as const,
            estimatedHours: 4.5,
            cognitive: 5,
            emotional: 3,
            physical: 1
          }
        ];
        if (isTest || text.toLowerCase().includes('few days') || text.toLowerCase().includes('prep')) {
          drafts.push({
            title: 'Preparation for Quiz / Test',
            area: 'Academic' as const,
            activityType: 'Deep focus' as const,
            urgency: 'High' as const,
            estimatedHours: 3,
            cognitive: 4,
            emotional: 2,
            physical: 1
          });
        }
        drivers = ['Motivation Loss & Cognitive Exhaustion', 'Sleep Disturbances'];
      } else if (voiceOptions?.isVoice) {
        replyText = `🎙️ I received your voice dump (${voiceOptions.audioDuration || 'audio'}). I've noted your feelings. Take a 5-minute breather before tackling the next step.`;
      }

      const aiReply: AiDumpChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedWorkloadDrafts: drafts,
        stressDrivers: drivers,
        suggestedAction: isShout ? 'recover' : (hasAssignment ? 'manage' : 'none')
      };

      const messagesToAdd: AiDumpChatMessage[] = [aiReply];

      setChatMessages(prev => {
        const cleaned = prev.filter(m => !m.isGardenerQuestion && !(m.isOverloadNotice && m.isNicoleAnalysisPlan));
        return [...cleaned, ...messagesToAdd];
      });
    }, 1400);

    setChatMessages(prev => [...prev, userMsg]);
  };

  const confirmExtractedDraft = (draft: any) => {
    addWorkload({
      title: draft.title,
      area: draft.area || 'Academic',
      activityType: draft.activityType || 'Deep focus',
      deadline: draft.deadline || new Date(Date.now() + 86400000 * 2).toISOString(),
      urgency: draft.urgency || 'High',
      timeFlexibility: 'Moderate',
      effortFlexibility: 'Moderate',
      workloadType: 'Assignment',
      timingType: 'Deadline',
      importance: 'Medium',
      schedulingCharacteristics: {
        splittable: true,
        spacingPreferred: true,
        source: 'workload-default'
      },
      estimatedHours: draft.estimatedHours || 3,
      // remainingTimeHours will default to estimatedHours in addWorkload
      demandProfile: draft.demandProfile || { cognitive: draft.cognitive || 3, emotional: draft.emotional || 2, physical: draft.physical || 1 },
      perceivedStressImpact: draft.perceivedStressImpact || Math.max(draft.cognitive || 3, draft.emotional || 2),
      notes: draft.notes || 'Added directly from AI Stress Dump chat.'
    });
  };

  const confirmAllExtractedDrafts = (drafts: any[]) => {
    drafts.forEach(draft => confirmExtractedDraft(draft));
  };

  const clarifyNicoleMessage = (messageId: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId || msg.isNicoleDemoExtraction) {
        return { ...msg, nicoleClarified: true };
      }
      return msg;
    }));
  };

  const confirmNicoleStressDump = (messageId?: string) => {
    setWorkloads(prev => {
      const existingSponsorship = prev.find(w => w.id === 'tech-carnival-sponsorship');
      const updated = prev.map(w => {
        if (w.id === 'web-programming-group') {
          return {
            ...w,
            estimatedHours: 18,
            remainingTimeHours: 18
          };
        }
        return w;
      });

      if (!existingSponsorship) {
        return [...updated, TECH_CARNIVAL_SPONSORSHIP_ITEM];
      }
      return updated;
    });

    setNewAppleWorkloadId('tech-carnival-sponsorship');
    setGardenerHasQuestion(true);
    setIsBalancePlanApplied(false);
    setIsTreeBent(true);

    setChatMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.isNicoleDemoExtraction || (messageId && msg.id === messageId)) {
          return { ...msg, nicoleClarified: true, nicoleConfirmed: true };
        }
        return msg;
      });
      return updated;
    });
  };

  const addAiChatMessage = (msg: Partial<AiDumpChatMessage> & { text: string }) => {
    setChatMessages(prev => {
      if (msg.isOverloadNotice) {
        const lastOverload = [...prev].reverse().find(m => m.isOverloadNotice);
        if (lastOverload) {
          const now = Date.now();
          const lastTime = (lastOverload as any)._createdTimestamp || 0;
          if (now - lastTime < 5000 || lastOverload.text === msg.text) {
            return prev;
          }
        }
      }
      const aiMsg: AiDumpChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...msg
      };
      (aiMsg as any)._createdTimestamp = Date.now();
      return [...prev, aiMsg];
    });
  };

  // ─── Deterministic derived workload facts ────────────────────────────────────

  const activeWorkloads = workloads.filter(w => w.status !== 'Completed');

  const areaDistribution = calculateAreaDistribution(activeWorkloads);
  const dominantAreas = getDominantAreas(activeWorkloads);
  const demandDistribution = calculateDemandDistribution(activeWorkloads);
  const mostDrainingDemands = getMostDrainingDemands(activeWorkloads);

  const derivedWorkloadFacts: DerivedWorkloadFacts = {
    activeWorkloadCount: activeWorkloads.length,
    totalRemainingHours: calculateTotalRemainingHours(activeWorkloads),
    totalEstimatedHours: calculateTotalEstimatedHours(activeWorkloads),
    areaDistribution,
    dominantAreas: dominantAreas.length > 0 ? dominantAreas : ['Unknown'],
    demandDistribution,
    mostDrainingDemands: mostDrainingDemands.length > 0 ? mostDrainingDemands : ['Unknown']
  };

  // ─── Deterministic Calendar Facts (Stage 3 Mock Data) ────────────────────────

  const horizonStart = '2026-09-08T22:15:00+08:00';
  const horizonEnd = '2026-09-15T22:15:00+08:00';

  const [busyEvents, setBusyEvents] = useState<FixedBusyEvent[]>(NICOLE_FIXED_BUSY_EVENTS);
  const [protectedTimes, setProtectedTimes] = useState<ProtectedTime[]>(NICOLE_PROTECTED_TIME);
  const [focusBlocks, setFocusBlocks] = useState<FocusBlock[]>([]);
  const [customSchedules, setCustomSchedules] = useState<Record<string, { date: string; startTime: string; endTime: string }>>({});

  const candidates = calculateCandidateWindows(horizonStart, horizonEnd, busyEvents, protectedTimes, focusBlocks, 30);
  const timeResourceFacts = deriveTimeResourceFacts(candidates, horizonStart, horizonEnd, 'mock');

  // ─── Analysis Provider ───────────────────────────────────────────────────────

  const isStressDumpConfirmed = workloads.some(w => w.id === 'tech-carnival-sponsorship') ||
    chatMessages.some(m => m.nicoleConfirmed);
  const stressDumpContext = isStressDumpConfirmed
    ? ['web-programming-expanded', 'tech-carnival-sponsorship-added', 'confirmed']
    : [];

  const analysisInput = buildAnalysisInput(TODAY, todayCheckIn, activeWorkloads, derivedWorkloadFacts, timeResourceFacts, stressDumpContext);
  const analysisResult = getMockAnalysis(analysisInput);

  // ─── Capacity profile ────────────────────────────────────────────────────────
  //
  // Real derived values (from todayCheckIn / active workloads):
  //   energy, recoveryState, dominantArea, mostDrainingDemand
  //
  // FROM ANALYSIS PROVIDER (replaces mock analysis):
  //   analysisResult
  //
  // Hardcoded placeholder (no Calendar model yet):
  //   availableTimeHours

  const userEnergy: number | null = todayCheckIn
    ? Math.min(100, Math.max(15, todayCheckIn.energyLevel * 20))
    : null;

  const userRecoveryState: 'Rested' | 'Moderate' | 'Depleted' | 'Unknown' = todayCheckIn
    ? (todayCheckIn.energyLevel >= 4 ? 'Rested' : todayCheckIn.energyLevel === 3 ? 'Moderate' : 'Depleted')
    : 'Unknown';

  const capacityProfile: CapacityProfile = {
    // Real derived
    energy: userEnergy,
    recoveryState: userRecoveryState,
    // Real: factual candidate time hours derived from Calendar Engine within a specific horizon
    candidateTimeHours: timeResourceFacts.candidateTimeHours,
    // Real derived from workloads (first value; ties represented in derivedWorkloadFacts)
    dominantArea: derivedWorkloadFacts.dominantAreas[0] ?? 'Unknown',
    mostDrainingDemand: (derivedWorkloadFacts.mostDrainingDemands[0] ?? 'Unknown') as 'Cognitive' | 'Emotional' | 'Physical' | 'Unknown',

    analysisResult,
    dailyStatus: analysisResult.demandResourceStatus
  };

  const sendGardenerQuestionToChat = () => {
    const hasTodayCheckIn = todayCheckIn !== null;
    const activeWorkloads = workloads.filter(w => w.status !== 'Completed');
    const totalHours = activeWorkloads.reduce((sum, w) => sum + (w.remainingTimeHours ?? w.estimatedHours ?? 0), 0);
    const candidateHours = capacityProfile.candidateTimeHours ?? 19;

    let effectiveStatus: 'Manageable' | 'Strained' | 'Overloaded';
    if (analysisResult.demandResourceStatus && analysisResult.demandResourceStatus !== 'InsufficientData') {
      effectiveStatus = analysisResult.demandResourceStatus as 'Manageable' | 'Strained' | 'Overloaded';
    } else if (totalHours > candidateHours + 5 || totalHours >= 24) {
      effectiveStatus = 'Overloaded';
    } else if (totalHours > candidateHours - 4 || totalHours >= 15) {
      effectiveStatus = 'Strained';
    } else {
      effectiveStatus = 'Manageable';
    }

    const isUserStressed = !!(todayCheckIn && (
      todayCheckIn.category === 'High' ||
      todayCheckIn.category === 'Very High' ||
      todayCheckIn.category === 'Elevated' ||
      (todayCheckIn.pssScore && todayCheckIn.pssScore >= 14)
    ));

    const isBent = isTreeBent || workloads.length > 4 || workloads.some(w => w.id === 'tech-carnival-sponsorship');

    // Gardener question should be like user asking the question:
    // If there is no daily check in record, only ask about tree condition
    // Otherwise ask about weather and tree condition
    let questionText = '';
    if (!hasTodayCheckIn) {
      if (effectiveStatus === 'Overloaded' && isBent) {
        questionText = 'Why is my tree bending with yellow leaves and broken branches?';
      } else if (effectiveStatus === 'Overloaded') {
        questionText = 'Why does my tree have yellow leaves and broken branches?';
      } else if (isBent) {
        questionText = 'Why is my tree bending under the weight of my workload?';
      } else if (effectiveStatus === 'Strained') {
        questionText = 'Why does my tree have yellow leaves?';
      } else {
        questionText = 'Why does my tree look like this?';
      }
    } else {
      if (effectiveStatus === 'Overloaded' && isBent) {
        if (isUserStressed) {
          questionText = 'Why is my tree bending with yellow leaves and broken branches, and why is it raining?';
        } else {
          questionText = 'Why is my tree bending with yellow leaves and broken branches even though the weather is clear?';
        }
      } else if (effectiveStatus === 'Overloaded') {
        if (isUserStressed) {
          questionText = 'Why does my tree have yellow leaves and broken branches, and why is it raining?';
        } else {
          questionText = 'Why does my tree have yellow leaves and broken branches even though the weather is clear?';
        }
      } else if (isBent) {
        if (isUserStressed) {
          questionText = 'Why is my tree bending under the workload, and why is it raining?';
        } else {
          questionText = 'Why is my tree bending under the workload even though the weather is clear?';
        }
      } else if (effectiveStatus === 'Strained') {
        if (isUserStressed) {
          questionText = 'Why does my tree have yellow leaves, and why is it raining?';
        } else {
          questionText = 'Why does my tree have yellow leaves even though the weather is clear?';
        }
      } else {
        if (isUserStressed) {
          questionText = 'Why is the weather raining on my tree?';
        } else {
          questionText = 'How is the weather and tree condition looking?';
        }
      }
    }

    const userQuestionMsg: AiDumpChatMessage = {
      id: `msg-user-tree-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGardenerQuestion: true
    };

    const aiAnalysisReplyMsg: AiDumpChatMessage = {
      id: `msg-ai-analysis-${Date.now() + 1}`,
      sender: 'ai',
      text: !hasTodayCheckIn
        ? (isBent
          ? "Nicole, your tree is bending and showing strain from your heavy recorded workload, but your daily state and load insight are currently pending. Please complete today's check-in so we can evaluate your personal energy, stress level, and capacity!"
          : "Nicole, your tree is showing strain and broken branches from your heavy recorded workload, but your daily state and load insight are currently pending. Please complete today's check-in so we can evaluate your personal energy, stress level, and capacity!")
        : (isBent
          ? "Nicole, your tree is bending under your heavy recorded workload! Your tree condition and weather directly mirror your current mental capacity and daily stress level:"
          : "Nicole, your tree condition and weather directly mirror your current mental capacity and daily stress level:"),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOverloadNotice: true,
      isNicoleAnalysisPlan: true,
      isGardenerExplanation: true
    };

    setChatMessages(prev => {
      // Remove any existing gardener question or analysis/insight cards to prevent duplicate cards
      const cleaned = prev.filter(m =>
        !m.isGardenerQuestion &&
        !m.isGardenerExplanation &&
        !m.isSquirrelInsight &&
        !(m.isOverloadNotice && m.isNicoleAnalysisPlan)
      );
      return [...cleaned, userQuestionMsg];
    });

    // Natural delay so user can read what they sent before the reply appears
    setTimeout(() => {
      setChatMessages(prev => [...prev, aiAnalysisReplyMsg]);
    }, 1400);

    setLastCheckInReminderDate(TODAY);
  };

  const sendSquirrelInsightToChat = () => {
    setChatSource('treehole');

    const isBent = isTreeBent || workloads.length > 4 || workloads.some(w => w.id === 'tech-carnival-sponsorship');

    const squirrelInsightMsg: AiDumpChatMessage = {
      id: `msg-squirrel-insight-${Date.now()}`,
      sender: 'ai',
      text: !todayCheckIn
        ? (isBent
          ? "Nicole, your tree is bending and showing strain from your heavy recorded workload, but your daily state and load insight are currently pending. Please complete today's check-in so we can evaluate your personal energy, stress level, and capacity!"
          : "Nicole, your tree is showing strain and broken branches from your heavy recorded workload, but your daily state and load insight are currently pending. Please complete today's check-in so we can evaluate your personal energy, stress level, and capacity!")
        : "Nicole, your tree condition and weather directly mirror your current mental capacity and daily stress level:",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOverloadNotice: true,
      isNicoleAnalysisPlan: true,
      isSquirrelInsight: true
    };

    setChatMessages(prev => {
      // Clean up any existing gardener questions or duplicate insight cards so only 1 insight card is ever shown!
      const cleaned = prev.filter(m =>
        !m.isGardenerQuestion &&
        !m.isGardenerExplanation &&
        !m.isSquirrelInsight &&
        !(m.isOverloadNotice && m.isNicoleAnalysisPlan)
      );
      return [...cleaned, squirrelInsightMsg];
    });
    setLastCheckInReminderDate(TODAY);
  };

  // ─── Provider ────────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      workloads,
      selectedWorkload,
      setSelectedWorkload,
      isWorkloadDetailOpen,
      setIsWorkloadDetailOpen,
      isAddWorkloadOpen,
      setIsAddWorkloadOpen,
      addWorkloadInitialArea,
      setAddWorkloadInitialArea,
      addWorkloadInitialData,
      setAddWorkloadInitialData,
      markChatWorkloadAdded,
      clarifiedWorkloadIds,
      addWorkload,
      updateWorkload,
      deleteWorkload,
      toggleSubtask,
      addSubtask,
      deleteSubtask,
      saveNasaTlxScore,
      applyRebalancedTasks,
      areaFilter,
      setAreaFilter,
      sortBy,
      setSortBy,
      searchQuery,
      setSearchQuery,
      checkIns,
      isCheckInOpen,
      setIsCheckInOpen,
      checkInSource,
      setCheckInSource,
      saveCheckIn,
      todayCheckIn,
      isRetestRequested,
      setIsRetestRequested,
      calculatePss,
      calculateBaselineDiff,
      baselineMetrics,
      baselineStressAverage,
      baselineEnergyAverage,
      baselineControlAverage,
      baselineMentalDemandAverage,
      baselineCopingConfidenceAverage,
      hasBaseline,
      isTreeHoleOpen,
      setIsTreeHoleOpen,
      isColourReflectionOpen,
      setIsColourReflectionOpen,
      chatMessages,
      sendChatMessage,
      addAiChatMessage,
      confirmExtractedDraft,
      confirmAllExtractedDrafts,
      clarifyNicoleMessage,
      confirmNicoleStressDump,
      busyEvents,
      setBusyEvents,
      protectedTimes,
      setProtectedTimes,
      focusBlocks,
      setFocusBlocks,
      customSchedules,
      setCustomSchedules,
      capacityProfile,
      derivedWorkloadFacts,
      analysisResult,
      chatSource,
      setChatSource,
      newAppleWorkloadId,
      setNewAppleWorkloadId,
      gardenerHasQuestion,
      setGardenerHasQuestion,
      sendGardenerQuestionToChat,
      sendSquirrelInsightToChat,
      isTreeBent,
      setIsTreeBent,
      isBalancePlanApplied,
      setIsBalancePlanApplied,
      isFcgExtendedPlan,
      setIsFcgExtendedPlan,
      isBalancePlanGenerating,
      setIsBalancePlanGenerating,
      hasRemindedCheckInToday,
      markCheckInRemindedToday,
      harvestedAppleIds,
      harvestApple,
      activeWorkloadSubTab,
      setActiveWorkloadSubTab,
      hasShownInitialTreeHoleNotice,
      setHasShownInitialTreeHoleNotice
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

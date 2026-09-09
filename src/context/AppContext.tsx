import React, { createContext, useContext, useState } from 'react';
import { WorkloadItem, WorkloadArea, UrgencyLevel, NasaTlxScore, SubTask, WorkloadStatus } from '../types/workload';
import {
  DailyCheckIn,
  AiDumpChatMessage,
  CapacityProfile,
  StressCategory,
  BaselineComparisonCategory,
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

export type NavTab = 'home' | 'map' | 'chat' | 'workloads' | 'balance';

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

  // Handlers
  addWorkload: (item: Omit<WorkloadItem, 'id' | 'status' | 'subtasks' | 'remainingTimeHours'> & {
    subtasks?: SubTask[];
    status?: WorkloadStatus;
    nasaTlx?: NasaTlxScore;
    remainingTimeHours?: number;
  }) => void;
  updateWorkload: (item: WorkloadItem) => void;
  deleteWorkload: (id: string) => void;
  toggleSubtask: (workloadId: string, subtaskId: string) => void;
  addSubtask: (workloadId: string, title: string) => void;
  saveNasaTlxScore: (workloadId: string, score: NasaTlxScore) => void;
  applyRebalancedTasks: (items: WorkloadItem[]) => void;

  // Filter state for Workload Details view
  areaFilter: 'All' | WorkloadArea;
  setAreaFilter: (area: 'All' | WorkloadArea) => void;
  sortBy: 'deadline' | 'urgency' | 'demand' | 'stress';
  setSortBy: (sort: 'deadline' | 'urgency' | 'demand' | 'stress') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Check-In & Stress State
  checkIns: DailyCheckIn[];
  isCheckInOpen: boolean;
  setIsCheckInOpen: (open: boolean) => void;
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
  /** The computed 30-record baseline average, or null when insufficient data. */
  baselineStressAverage: number | null;
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
    importance: 'High',
    userPriority: 'High',
    timeFlexibility: 'Moderate',
    effortFlexibility: 'Strict',
    urgency: 'High',
    demandProfile: { cognitive: 5, emotional: 3, physical: 1 },
    perceivedStressImpact: 5,
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: true,
      preferredBlockMinutes: 90,
      minimumBlockMinutes: 30,
      source: 'workload-default'
    },
    status: 'Active',
    subtasks: []
  },
  {
    id: 'web-programming-group',
    title: 'Web Programming Group Assignment',
    area: 'Academic',
    workloadType: 'Assignment',
    activityType: 'Deep focus',
    timingType: 'Deadline',
    deadline: '2026-09-11T23:59:00+08:00',
    estimatedHours: 18,
    remainingTimeHours: 18,
    importance: 'High',
    userPriority: 'High',
    timeFlexibility: 'Moderate',
    effortFlexibility: 'Moderate',
    urgency: 'High',
    demandProfile: { cognitive: 5, emotional: 3, physical: 1 },
    perceivedStressImpact: 5,
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: true,
      preferredBlockMinutes: 90,
      minimumBlockMinutes: 30,
      source: 'user'
    },
    status: 'Active',
    subtasks: []
  },
  {
    id: 'tech-carnival-sponsorship',
    title: 'Tech Carnival Sponsorship Preparation',
    area: 'Social',
    workloadType: 'Project',
    activityType: 'Communication',
    timingType: 'Deadline',
    deadline: '2026-09-10T18:00:00+08:00',
    estimatedHours: 6,
    remainingTimeHours: 6,
    importance: 'High',
    userPriority: 'Medium',
    timeFlexibility: 'Moderate',
    effortFlexibility: 'Moderate',
    urgency: 'High',
    demandProfile: { cognitive: 3, emotional: 5, physical: 1 },
    perceivedStressImpact: 4,
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: false,
      preferredBlockMinutes: 60,
      minimumBlockMinutes: 30,
      source: 'user'
    },
    status: 'Active',
    subtasks: []
  },
  {
    id: 'fcg-test-1',
    title: 'FCG Test 1',
    area: 'Academic',
    workloadType: 'ExamPreparation',
    activityType: 'Deep focus',
    timingType: 'Deadline',
    deadline: '2026-09-14T14:00:00+08:00',
    estimatedHours: 8,
    remainingTimeHours: 8,
    importance: 'High',
    userPriority: 'Medium',
    timeFlexibility: 'Flexible',
    effortFlexibility: 'Strict',
    urgency: 'Medium',
    demandProfile: { cognitive: 5, emotional: 3, physical: 1 },
    perceivedStressImpact: 4,
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: true,
      preferredBlockMinutes: 90,
      minimumBlockMinutes: 30,
      source: 'workload-default'
    },
    status: 'Active',
    subtasks: []
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
    importance: 'Medium',
    userPriority: 'Low',
    timeFlexibility: 'Flexible',
    effortFlexibility: 'Moderate',
    urgency: 'Low',
    demandProfile: { cognitive: 3, emotional: 1, physical: 1 },
    perceivedStressImpact: 2,
    schedulingCharacteristics: {
      splittable: true,
      spacingPreferred: false,
      preferredBlockMinutes: 60,
      minimumBlockMinutes: 30,
      source: 'workload-default'
    },
    status: 'Active',
    subtasks: []
  }
];

// Nicole canonical demo scenario Check-In (single check-in today, no baseline)
const initialCheckIns: DailyCheckIn[] = [
  {
    id: 'nicole-checkin-01',
    date: '2026-09-08',
    createdAt: '2026-09-08T22:15:00+08:00',
    q1_stress: 5,
    q2_control: 2,
    q3_mentalDemand: 5,
    q4_capability: 2,
    energyLevel: 1,
    emotionFeeling: 'Exhausted',
    pssScore: 18,
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
    text: "Hello Nicole! How are you feeling right now? If you're carrying a lot in your mind or feeling stressed, feel free to dump your thoughts or voice here. I'll help you organize your tasks, detect stress drivers, and find balance.",
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

  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(initialCheckIns);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isRetestRequested, setIsRetestRequested] = useState(false);
  const [isTreeHoleOpen, setIsTreeHoleOpen] = useState(false);
  const [isColourReflectionOpen, setIsColourReflectionOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<AiDumpChatMessage[]>(initialChatMessages);

  // ─── Date-anchored derivations ──────────────────────────────────────────────

  const TODAY = getTodayLocalDate(); // e.g. '2026-09-08'

  // Today's check-in — only matches local calendar date, never a previous day's record
  const todayCheckIn = checkIns.find(c => c.date === TODAY) || null;

  // Prior records: all with date strictly before today, sorted newest-first
  const allPriorCheckIns = checkIns
    .filter(c => c.date < TODAY)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Personal baseline: requires exactly 30 prior completed records
  const hasBaseline = allPriorCheckIns.length >= 30;
  const latest30Prior = allPriorCheckIns.slice(0, 30);
  const baselineStressAverage: number | null = hasBaseline
    ? Math.round(latest30Prior.reduce((acc, c) => acc + c.pssScore, 0) / latest30Prior.length)
    : null;

  // ─── Stress calculations ────────────────────────────────────────────────────

  // PSS Formula: Q1 + (6 - Q2) + Q3 + (6 - Q4)
  const calculatePss = (q1: number, q2: number, q3: number, q4: number) => {
    const score = q1 + (6 - q2) + q3 + (6 - q4);
    let category: StressCategory = 'Normal';
    let interpretation = 'Stress within normal range for community adults';

    if (score >= 17) {
      category = 'Very High';
      interpretation = 'Stress in top 1% of scores, critical level requiring intervention';
    } else if (score >= 14) {
      category = 'High';
      interpretation = 'Stress in top 5% of scores, linked to burnout risk';
    } else if (score >= 11) {
      category = 'Elevated';
      interpretation = 'Stress elevated compared to the general population';
    } else {
      category = 'Normal';
      interpretation = 'Stress within normal range for community adults';
    }

    return { score, category, interpretation };
  };

  // Baseline comparison — returns null when insufficient data (< 30 prior records)
  const calculateBaselineDiff = (todayScore: number) => {
    if (baselineStressAverage === null) {
      return null; // Insufficient data — do NOT fabricate a baseline comparison
    }
    const diff = todayScore - baselineStressAverage;
    let category: BaselineComparisonCategory = 'normal';
    let interpretation = 'Typical for you';

    if (diff >= 6) {
      category = 'significantly elevated';
      interpretation = 'Much higher than your normal — a notable spike';
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

  const addWorkload = (newItem: Omit<WorkloadItem, 'id' | 'status' | 'subtasks' | 'remainingTimeHours'> & {
    subtasks?: SubTask[];
    status?: WorkloadStatus;
    nasaTlx?: NasaTlxScore;
    remainingTimeHours?: number;
  }) => {
    const subtasks = newItem.subtasks || [];
    const allDone = subtasks.length > 0 && subtasks.every(s => s.completed);
    const item: WorkloadItem = {
      ...newItem,
      id: `w-${Date.now()}`,
      status: newItem.status || (allDone ? 'Completed' : 'Active'),
      subtasks,
      // Default remainingTimeHours = estimatedHours for new workloads
      remainingTimeHours: newItem.remainingTimeHours ?? newItem.estimatedHours,
      nasaTlx: newItem.nasaTlx
    };
    setWorkloads(prev => [item, ...prev]);
  };

  const updateWorkload = (updatedItem: WorkloadItem) => {
    setWorkloads(prev => prev.map(w => w.id === updatedItem.id ? updatedItem : w));
    if (selectedWorkload?.id === updatedItem.id) {
      setSelectedWorkload(updatedItem);
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

  const saveCheckIn = (newCheckIn: Omit<DailyCheckIn, 'id'>) => {
    const checkIn: DailyCheckIn = {
      ...newCheckIn,
      id: `c-${Date.now()}`
    };
    // Replace any existing check-in for the same date (one per day)
    setCheckIns(prev => [...prev.filter(c => c.date !== checkIn.date), checkIn]);
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
      }, 500);
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
      setChatMessages(prev => [...prev, aiReply]);
    }, 700);

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

  const mockBusyEvents: FixedBusyEvent[] = [
    { id: 'b1', title: 'Operating System class', startDateTime: '2026-09-08T08:00:00+08:00', endDateTime: '2026-09-08T10:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b2', title: 'Web Programming class', startDateTime: '2026-09-09T11:00:00+08:00', endDateTime: '2026-09-09T13:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b3', title: 'Object Oriented Programming class', startDateTime: '2026-09-09T14:00:00+08:00', endDateTime: '2026-09-09T17:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b4', title: 'Tech Carnival committee prep meeting', startDateTime: '2026-09-09T19:00:00+08:00', endDateTime: '2026-09-09T21:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b5', title: 'Operating System class', startDateTime: '2026-09-10T08:00:00+08:00', endDateTime: '2026-09-10T10:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b6', title: 'Tech Carnival logistics meeting', startDateTime: '2026-09-10T19:30:00+08:00', endDateTime: '2026-09-10T21:30:00+08:00', source: 'mock', isMovable: false },
    { id: 'b7', title: 'Philosophy class', startDateTime: '2026-09-11T10:00:00+08:00', endDateTime: '2026-09-11T12:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b8', title: 'Tech Carnival event preparation', startDateTime: '2026-09-12T09:00:00+08:00', endDateTime: '2026-09-12T13:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b9', title: 'English Communication', startDateTime: '2026-09-14T08:00:00+08:00', endDateTime: '2026-09-14T10:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b10', title: 'Web Programming', startDateTime: '2026-09-14T11:00:00+08:00', endDateTime: '2026-09-14T13:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b11', title: 'FCG', startDateTime: '2026-09-14T14:00:00+08:00', endDateTime: '2026-09-14T17:00:00+08:00', source: 'mock', isMovable: false },
    { id: 'b12', title: 'Operating System', startDateTime: '2026-09-15T08:00:00+08:00', endDateTime: '2026-09-15T10:00:00+08:00', source: 'mock', isMovable: false }
  ];

  const mockProtectedTimes: ProtectedTime[] = [
    {
      id: 'protected-rest-00-04',
      title: 'Protected Rest',
      type: 'sleep',
      source: 'mock',
      isRecurring: true,
      recurringStartTime: '00:00',
      recurringEndTime: '04:00'
    }
  ];

  const mockFocusBlocks: FocusBlock[] = [];

  const candidates = calculateCandidateWindows(horizonStart, horizonEnd, mockBusyEvents, mockProtectedTimes, mockFocusBlocks, 30);
  const timeResourceFacts = deriveTimeResourceFacts(candidates, horizonStart, horizonEnd, 'mock');

  // ─── Analysis Provider ───────────────────────────────────────────────────────
  
  const analysisInput = buildAnalysisInput(TODAY, todayCheckIn, activeWorkloads, derivedWorkloadFacts, timeResourceFacts);
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
    
    analysisResult
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
      addWorkload,
      updateWorkload,
      deleteWorkload,
      toggleSubtask,
      addSubtask,
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
      saveCheckIn,
      todayCheckIn,
      isRetestRequested,
      setIsRetestRequested,
      calculatePss,
      calculateBaselineDiff,
      baselineStressAverage,
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
      capacityProfile,
      derivedWorkloadFacts,
      analysisResult
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

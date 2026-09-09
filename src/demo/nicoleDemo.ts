import { FixedBusyEvent, ProtectedTime } from '../types/calendar';
import { WorkloadItem } from '../types/workload';
import { DailyCheckIn } from '../types/stress';
export const DEMO_NOW = '2026-09-08T22:15:00+08:00';
export const DEMO_DATE = '2026-09-08';
export const DEMO_TIMEZONE = 'Asia/Kuala_Lumpur';
export const NICOLE_NARRATIVE = "I thought I would feel better after finally submitting the OOP assignment last week but honestly I'm still so tired.\n\nNow I have an OS quiz coming up and the Web Programming group assignment is also due soon. I feel like I should just focus on OS first because it's the closest deadline, but I'm worried that if I do that I'm going to have no time left for the assignment.\n\nThe group assignment is also stressing me out because some parts from my group still aren't done and I feel like I'm slowly taking over more and more of it.\n\nThen there's club stuff too. I'm helping with the Tech Carnival and suddenly there are things I need to prepare for sponsorship and the event. I know I said yes to some of it earlier but right now I really don't know why I'm doing so much.\n\nAnd I have an FCG test after all of this too. I haven't even started properly.\n\nI just finished such a horrible week and I feel like I'm already going straight into another one. I don't even know what I should do first anymore.";
export const canonicalWorkloads: WorkloadItem[] = [
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
    title: 'Tech Carnival Sponsorship',
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
      source: 'ai'
    },
    status: 'Active',
    subtasks: [
      {
        id: 'tech-sponsor-st-1',
        title: 'Prepare sponsorship materials',
        completed: false
      },
      {
        id: 'tech-sponsor-st-2',
        title: 'Coordinate sponsorship follow-up',
        completed: false
      }
    ]
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

export const TECH_CARNIVAL_SPONSORSHIP_ITEM: WorkloadItem = canonicalWorkloads.find(w => w.id === 'tech-carnival-sponsorship')!;

export function startingWorkloads(): WorkloadItem[] {
  return structuredClone(canonicalWorkloads.filter(w => w.id !== 'tech-carnival-sponsorship')).map(w =>
    w.id === 'web-programming-group' ? { ...w, estimatedHours: 12, remainingTimeHours: 12 } : w);
}
export interface NicoleDraft {
  record: WorkloadItem;
  remainingHours: string;
  deadlineLocal: string;
  needsClarification: boolean;
}
export function extractNicole(workloads: WorkloadItem[]): NicoleDraft[] {
  return ['os-quiz-1', 'web-programming-group', 'tech-carnival-sponsorship', 'fcg-test-1'].map(id => {
    const record = structuredClone(workloads.find(w => w.id === id) || canonicalWorkloads.find(w => w.id === id)!);
    const isNew = id === 'tech-carnival-sponsorship' && !workloads.some(w => w.id === id);
    return { record, remainingHours: isNew ? '' : String(record.remainingTimeHours),
      deadlineLocal: isNew ? '' : record.deadline.slice(0,16),
      needsClarification: isNew || id === 'web-programming-group' };
  });
}
export function clarifyNicole(drafts: NicoleDraft[]): NicoleDraft[] {
  return drafts.map(d => !d.needsClarification ? d : d.record.id === 'web-programming-group'
    ? { ...d, remainingHours: '18', needsClarification: false }
    : { ...d, remainingHours: d.remainingHours || '6', deadlineLocal: d.deadlineLocal || '2026-09-10T18:00', needsClarification: false });
}
export function validDraft(d: NicoleDraft): boolean {
  const hours = Number(d.remainingHours);
  return !d.needsClarification && !!d.record.title.trim() && d.remainingHours.trim() !== '' && Number.isFinite(hours) && hours > 0
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(d.deadlineLocal)
    && Number.isFinite(Date.parse(d.deadlineLocal + ':00+08:00'));
}
export function confirmNicole(workloads: WorkloadItem[], drafts: NicoleDraft[]): WorkloadItem[] {
  if (drafts.length !== 4 || !drafts.every(validDraft)) return workloads;
  const updates = drafts.map(d => ({ ...structuredClone(d.record), title: d.record.title.trim(),
    remainingTimeHours: Number(d.remainingHours), deadline: d.deadlineLocal + ':00+08:00' }));
  return [...workloads.map(w => updates.find(d => d.id === w.id) || w), ...updates.filter(d => !workloads.some(w => w.id === d.id))];
}
export function validCheckIn(c: Partial<DailyCheckIn>): boolean {
  return [c.q1_stress,c.q2_control,c.q3_mentalDemand,c.q4_capability,c.energyLevel].every(v => Number.isInteger(v) && v! >= 1 && v! <= 5)
    && typeof c.emotionFeeling === 'string' && c.emotionFeeling.trim().length > 0;
}

// Canonical demo fixed busy events (9 classes + 3 Tech Carnival commitments = 12 total)
export const NICOLE_FIXED_BUSY_EVENTS: FixedBusyEvent[] = [
  {
    id: "class-os-2026-09-08",
    title: "Operating Systems",
    startDateTime: "2026-09-08T08:00:00+08:00",
    endDateTime: "2026-09-08T10:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "class-web-2026-09-09",
    title: "Web Programming",
    startDateTime: "2026-09-09T11:00:00+08:00",
    endDateTime: "2026-09-09T13:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "class-oop-2026-09-09",
    title: "Object-Oriented Programming",
    startDateTime: "2026-09-09T14:00:00+08:00",
    endDateTime: "2026-09-09T17:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "class-os-2026-09-10",
    title: "Operating Systems",
    startDateTime: "2026-09-10T08:00:00+08:00",
    endDateTime: "2026-09-10T10:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "class-philosophy-2026-09-11",
    title: "Philosophy",
    startDateTime: "2026-09-11T10:00:00+08:00",
    endDateTime: "2026-09-11T12:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "class-english-2026-09-14",
    title: "English Communication",
    startDateTime: "2026-09-14T08:00:00+08:00",
    endDateTime: "2026-09-14T10:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "class-web-2026-09-14",
    title: "Web Programming",
    startDateTime: "2026-09-14T11:00:00+08:00",
    endDateTime: "2026-09-14T13:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "class-fcg-2026-09-14",
    title: "FCG",
    startDateTime: "2026-09-14T14:00:00+08:00",
    endDateTime: "2026-09-14T17:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "class-os-2026-09-15",
    title: "Operating Systems",
    startDateTime: "2026-09-15T08:00:00+08:00",
    endDateTime: "2026-09-15T10:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "tech-carnival-committee-prep-2026-09-09",
    title: "Tech Carnival Committee Prep",
    startDateTime: "2026-09-09T19:00:00+08:00",
    endDateTime: "2026-09-09T21:00:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "tech-carnival-logistics-2026-09-10",
    title: "Tech Carnival Logistics",
    startDateTime: "2026-09-10T19:30:00+08:00",
    endDateTime: "2026-09-10T21:30:00+08:00",
    source: "mock",
    isMovable: false
  },
  {
    id: "tech-carnival-event-prep-2026-09-12",
    title: "Tech Carnival Event Prep",
    startDateTime: "2026-09-12T09:00:00+08:00",
    endDateTime: "2026-09-12T13:00:00+08:00",
    source: "mock",
    isMovable: false
  }
];

// Canonical demo protected sleep: 23:30–07:30 recurring daily (crosses midnight)
export const NICOLE_PROTECTED_TIME: ProtectedTime[] = [
  {
    id: "prot-sleep",
    title: "Night Sleep",
    type: "sleep",
    source: "mock",
    isRecurring: true,
    recurringStartTime: "23:30",
    recurringEndTime: "07:30"
  }
];

export const demoProtectedTimes: ProtectedTime[] = NICOLE_PROTECTED_TIME;

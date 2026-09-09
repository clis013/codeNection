import { FixedBusyEvent, ProtectedTime, FocusBlock } from '../src/types/calendar';
import { WorkloadItem } from '../src/types/workload';
import { DailyCheckIn } from '../src/types/stress';
import { calculateCandidateWindows, deriveTimeResourceFacts } from '../src/services/calendarEngine';
import { buildAnalysisInput, getMockAnalysis } from '../src/services/mockAnalysisProvider';
import { prepareSchedulableWorkloads, generateCandidatePlans } from '../src/services/schedulingEngine';
import { calculateAreaDistribution, calculateDemandDistribution, calculateTotalRemainingHours, calculateTotalEstimatedHours, getDominantAreas, getMostDrainingDemands } from '../src/utils/demandHelpers';

// ─── 1. Canonical Anchor & Timezone Setup ─────────────────────────────────────
const ANCHOR_ISO = '2026-09-08T22:15:00+08:00';
const HORIZON_START = ANCHOR_ISO;
const HORIZON_END = '2026-09-15T22:15:00+08:00';
const TODAY_LOCAL_DATE = '2026-09-08';

console.log('================================================================');
console.log('   RESTORE NICOLE CANONICAL DEMO SCENARIO (STAGE 4B)');
console.log('================================================================\n');

// ─── 2. Daily Check-In Fixture ────────────────────────────────────────────────
const q1 = 5, q2 = 2, q3 = 5, q4 = 2, q5Energy = 1, q6Emotion = 'Exhausted';
const pssScore = q1 + (6 - q2) + q3 + (6 - q4);

const todayCheckIn: DailyCheckIn = {
  id: 'nicole-checkin-01',
  date: TODAY_LOCAL_DATE,
  createdAt: ANCHOR_ISO,
  q1_stress: q1,
  q2_control: q2,
  q3_mentalDemand: q3,
  q4_capability: q4,
  energyLevel: q5Energy,
  emotionFeeling: q6Emotion,
  pssScore,
  category: 'Very High',
  controlScore: q2,
  mentalDemandScore: q3,
  copingCapabilityScore: q4,
  baselineDiff: undefined // No prior 30 records baseline available
};

console.log('--- 1. DAILY CHECK-IN ---');
console.log(`Date: ${todayCheckIn.date}`);
console.log(`Raw Answers: Q1(Stress)=${q1}, Q2(Control)=${q2}, Q3(MentalDemand)=${q3}, Q4(Capability)=${q4}, Q5(Energy)=${q5Energy}, Q6(Emotion)="${q6Emotion}"`);
console.log(`Derived PSS Score: ${todayCheckIn.pssScore} (Formula: ${q1} + (6-${q2}) + ${q3} + (6-${q4}))`);
console.log(`Derived Category: ${todayCheckIn.category}`);
console.log(`Derived Energy: Low (${q5Energy}/5) | Derived Control: Low (${q2}/5)`);
console.log(`Personal Baseline: Unavailable (baselineDiff = ${todayCheckIn.baselineDiff})\n`);

// ─── 3. Active Workloads Fixture ──────────────────────────────────────────────
const workloads: WorkloadItem[] = [
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

console.log('--- 2. ACTIVE WORKLOADS ---');
workloads.forEach(w => {
  console.log(`- [${w.id}] ${w.title} (${w.remainingTimeHours}h remaining) | Deadline: ${w.deadline} | Importance: ${w.importance}`);
});
console.log('');

// ─── 4. Calendar Busy Events & Protected Time Fixture ─────────────────────────
const fixedBusyEvents: FixedBusyEvent[] = [
  // Tue 8 Sep
  { id: 'b1', title: 'Operating System class', startDateTime: '2026-09-08T08:00:00+08:00', endDateTime: '2026-09-08T10:00:00+08:00', source: 'mock', isMovable: false },
  // Wed 9 Sep
  { id: 'b2', title: 'Web Programming class', startDateTime: '2026-09-09T11:00:00+08:00', endDateTime: '2026-09-09T13:00:00+08:00', source: 'mock', isMovable: false },
  { id: 'b3', title: 'Object Oriented Programming class', startDateTime: '2026-09-09T14:00:00+08:00', endDateTime: '2026-09-09T17:00:00+08:00', source: 'mock', isMovable: false },
  { id: 'b4', title: 'Tech Carnival committee prep meeting', startDateTime: '2026-09-09T19:00:00+08:00', endDateTime: '2026-09-09T21:00:00+08:00', source: 'mock', isMovable: false },
  // Thu 10 Sep
  { id: 'b5', title: 'Operating System class', startDateTime: '2026-09-10T08:00:00+08:00', endDateTime: '2026-09-10T10:00:00+08:00', source: 'mock', isMovable: false },
  { id: 'b6', title: 'Tech Carnival logistics meeting', startDateTime: '2026-09-10T19:30:00+08:00', endDateTime: '2026-09-10T21:30:00+08:00', source: 'mock', isMovable: false },
  // Fri 11 Sep
  { id: 'b7', title: 'Philosophy class', startDateTime: '2026-09-11T10:00:00+08:00', endDateTime: '2026-09-11T12:00:00+08:00', source: 'mock', isMovable: false },
  // Sat 12 Sep
  { id: 'b8', title: 'Tech Carnival event preparation', startDateTime: '2026-09-12T09:00:00+08:00', endDateTime: '2026-09-12T13:00:00+08:00', source: 'mock', isMovable: false },
  // Mon 14 Sep
  { id: 'b9', title: 'English Communication', startDateTime: '2026-09-14T08:00:00+08:00', endDateTime: '2026-09-14T10:00:00+08:00', source: 'mock', isMovable: false },
  { id: 'b10', title: 'Web Programming', startDateTime: '2026-09-14T11:00:00+08:00', endDateTime: '2026-09-14T13:00:00+08:00', source: 'mock', isMovable: false },
  { id: 'b11', title: 'FCG', startDateTime: '2026-09-14T14:00:00+08:00', endDateTime: '2026-09-14T17:00:00+08:00', source: 'mock', isMovable: false },
  // Tue 15 Sep
  { id: 'b12', title: 'Operating System', startDateTime: '2026-09-15T08:00:00+08:00', endDateTime: '2026-09-15T10:00:00+08:00', source: 'mock', isMovable: false }
];

const protectedTimes: ProtectedTime[] = [
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

const existingFocusBlocks: FocusBlock[] = [];

// ─── 5. Calculate Candidate Time Windows ──────────────────────────────────────
const candidateWindows = calculateCandidateWindows(
  HORIZON_START,
  HORIZON_END,
  fixedBusyEvents,
  protectedTimes,
  existingFocusBlocks,
  30
);

const timeResourceFacts = deriveTimeResourceFacts(candidateWindows, HORIZON_START, HORIZON_END, 'mock');

console.log('--- 3. CANDIDATE TIME CALCULATION ---');
console.log(`Planning Horizon: ${HORIZON_START} -> ${HORIZON_END}`);
console.log(`Total Candidate Windows Count: ${timeResourceFacts.candidateWindowCount}`);
console.log(`Total Candidate Time Hours: ${timeResourceFacts.candidateTimeHours}h`);
console.log('\nExact Candidate Time Windows:');
candidateWindows.forEach((w, idx) => {
  const s = new Date(w.startDateTime);
  const e = new Date(w.endDateTime);
  console.log(`  Window ${idx + 1}: ${s.toISOString()} to ${e.toISOString()} (${w.durationMinutes}m / ${(w.durationMinutes/60).toFixed(2)}h)`);
});
console.log('');

// ─── 6. Derived Workload Facts & Analysis Pipeline ───────────────────────────
const activeWorkloads = workloads.filter(w => w.status !== 'Completed');
const derivedWorkloadFacts = {
  activeWorkloadCount: activeWorkloads.length,
  totalRemainingHours: calculateTotalRemainingHours(activeWorkloads),
  totalEstimatedHours: calculateTotalEstimatedHours(activeWorkloads),
  areaDistribution: calculateAreaDistribution(activeWorkloads),
  dominantAreas: getDominantAreas(activeWorkloads),
  demandDistribution: calculateDemandDistribution(activeWorkloads),
  mostDrainingDemands: getMostDrainingDemands(activeWorkloads)
};

const analysisInput = buildAnalysisInput(
  TODAY_LOCAL_DATE,
  todayCheckIn,
  activeWorkloads,
  derivedWorkloadFacts,
  timeResourceFacts
);

const analysisResult = getMockAnalysis(analysisInput);

console.log('--- 4. ANALYSIS RESULT PIPELINE ---');
console.log(`Demand-Resource Status: ${analysisResult.demandResourceStatus}`);
console.log(`Confidence: ${analysisResult.confidence}`);
console.log(`Mismatch Detected: ${analysisResult.mismatch.detected} ${analysisResult.mismatch.type ? `(${analysisResult.mismatch.type})` : ''}`);
if (analysisResult.mismatch.insight) console.log(`  Insight: "${analysisResult.mismatch.insight}"`);
console.log(`Recovery Need Indicated: ${analysisResult.recoveryNeed.indicated} (${analysisResult.recoveryNeed.type || 'none'})`);
console.log(`Data Limitations:`, analysisResult.dataLimitations);
console.log(`Evidence:`);
analysisResult.evidence.forEach(e => console.log(`  - [${e.category}] ${e.message} (${e.severity})`));
console.log(`Main Constraints:`, analysisResult.mainConstraints.map(c => c.description));
console.log(`Main Contributors:`, analysisResult.mainContributors.map(c => c.description));
console.log('');

// ─── 7. Stage 4B Schedule Generation ─────────────────────────────────────────
const schedPrep = prepareSchedulableWorkloads(workloads, existingFocusBlocks);

const schedulingInput = {
  horizonStart: HORIZON_START,
  horizonEnd: HORIZON_END,
  candidateTimeWindows: candidateWindows,
  schedulableWorkloads: schedPrep.schedulableWorkloads,
  existingFocusBlocks,
  resourceContext: {
    energyLevel: todayCheckIn.energyLevel,
    controlScore: todayCheckIn.controlScore,
    stressCategory: todayCheckIn.category
  },
  analysisContext: analysisResult
};

const candidatePlans = generateCandidatePlans(schedulingInput);

console.log('--- 5. STAGE 4B CANDIDATE SCHEDULE GENERATION ---');

candidatePlans.forEach(plan => {
  console.log(`================================================================`);
  console.log(` STRATEGY: ${plan.strategy}`);
  console.log(` Plan Valid: ${plan.isValid}`);
  if (!plan.isValid) console.log(` Hard Violations:`, plan.hardConstraintViolations);
  console.log(` Total Unscheduled Effort: ${plan.basicMetrics.unscheduledRequiredEffort}h`);
  console.log(` Total Scheduled Blocks: ${plan.plannedBlocks.length}`);
  console.log(`----------------------------------------------------------------`);

  // Summarize scheduled hours per workload for this strategy
  const scheduledHoursByWorkload: Record<string, number> = {};
  workloads.forEach(w => scheduledHoursByWorkload[w.id] = 0);
  plan.plannedBlocks.forEach(b => {
    scheduledHoursByWorkload[b.workloadId] = (scheduledHoursByWorkload[b.workloadId] || 0) + (b.durationMinutes / 60);
  });

  console.log(`Workload Scheduled vs Remaining:`);
  workloads.forEach(w => {
    const sched = scheduledHoursByWorkload[w.id] || 0;
    const unsched = w.remainingTimeHours - sched;
    console.log(`  - ${w.id} (${w.title}): Scheduled ${sched.toFixed(2)}h / ${w.remainingTimeHours}h | Unscheduled: ${unsched.toFixed(2)}h`);
  });

  console.log(`\nDetailed Block Placement Chronology:`);
  const sortedBlocks = [...plan.plannedBlocks].sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  
  const tinyBlocks: string[] = [];
  const earlyMorningBlocks: string[] = [];
  
  sortedBlocks.forEach((b, idx) => {
    const s = new Date(b.startDateTime);
    const e = new Date(b.endDateTime);
    const dayStr = s.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
    const timeStr = `${s.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' })} - ${e.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' })}`;
    
    console.log(`  [Block ${idx + 1}] ${dayStr} | ${timeStr} | ${b.durationMinutes} mins (${(b.durationMinutes/60).toFixed(2)}h) -> Workload: ${b.workloadId}`);

    if (b.durationMinutes < 30) {
      tinyBlocks.push(`Block ${idx + 1} (${b.workloadId}): ${b.durationMinutes}m on ${dayStr} ${timeStr}`);
    }
    const hour = s.getHours(); // local hour
    if (hour >= 4 && hour < 7) {
      earlyMorningBlocks.push(`Block ${idx + 1} (${b.workloadId}): starts at ${timeStr} on ${dayStr}`);
    }
  });

  if (tinyBlocks.length > 0) {
    console.log(`\n  ⚠️ Tiny/Fragmented Blocks (<30m):`);
    tinyBlocks.forEach(tb => console.log(`    * ${tb}`));
  }
  if (earlyMorningBlocks.length > 0) {
    console.log(`\n  ⚠️ Early Morning Blocks (04:00 - 07:00):`);
    earlyMorningBlocks.forEach(eb => console.log(`    * ${eb}`));
  }
  console.log('\n');
});

console.log('================================================================');
console.log('   END OF CANONICAL SCENARIO EXECUTION');
console.log('================================================================');

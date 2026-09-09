import { CandidateTimeWindow, FocusBlock } from '../src/types/calendar';
import { WorkloadItem } from '../src/types/workload';
import { 
  SchedulingInput, 
  CandidatePlan 
} from '../src/types/scheduling';
import { 
  getWorkloadDefaults, 
  prepareSchedulableWorkloads, 
  generateCandidatePlans 
} from '../src/services/schedulingEngine';

// --- Base Fixtures ---
const baseWorkload: WorkloadItem = {
  id: 'w_test',
  title: 'Test',
  area: 'Academic',
  activityType: 'Deep focus',
  workloadType: 'Assignment',
  timingType: 'Deadline',
  deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  urgency: 'Medium',
  timeFlexibility: 'Moderate',
  effortFlexibility: 'Moderate',
  importance: 'Medium',
  estimatedHours: 5,
  remainingTimeHours: 5,
  demandProfile: { cognitive: 3, emotional: 3, physical: 1 },
  perceivedStressImpact: 3,
  status: 'Active',
  subtasks: [],
  schedulingCharacteristics: getWorkloadDefaults('Assignment')
};

const horizonStart = new Date(Date.now()).toISOString();
const horizonEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

function createTimeWindow(startOffsetHours: number, durationHours: number): CandidateTimeWindow {
  return {
    id: Math.random().toString(),
    startDateTime: new Date(Date.now() + startOffsetHours * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + (startOffsetHours + durationHours) * 60 * 60 * 1000).toISOString(),
    durationMinutes: durationHours * 60,
    source: 'mock'
  };
}

function runScenario(name: string, workloads: WorkloadItem[], candidateWindows: CandidateTimeWindow[], blocks: FocusBlock[] = [], energyLevel?: number) {
  console.log(`\n--- SCENARIO: ${name} ---`);
  
  const prep = prepareSchedulableWorkloads(workloads, blocks);
  if (prep.mismatches.length > 0) {
    console.log("Mismatches:", prep.mismatches);
  }

  const input: SchedulingInput = {
    horizonStart,
    horizonEnd,
    candidateTimeWindows: candidateWindows,
    schedulableWorkloads: prep.schedulableWorkloads,
    existingFocusBlocks: blocks,
    resourceContext: energyLevel !== undefined ? { energyLevel, controlScore: 3, stressCategory: 'Manageable' } : null,
    analysisContext: {} as any
  };

  const plans = generateCandidatePlans(input);
  
  for (const p of plans) {
    console.log(`\nStrategy: ${p.strategy} | Valid: ${p.isValid}`);
    if (!p.isValid) {
      console.log('Violations:', p.hardConstraintViolations);
    }
    console.log(`Total Unscheduled Req Effort: ${p.basicMetrics.unscheduledRequiredEffort}h`);
    
    // Group blocks by workload for readable output
    const byWorkload = p.plannedBlocks.reduce((acc, b) => {
      acc[b.workloadId] = (acc[b.workloadId] || 0) + b.durationMinutes / 60;
      return acc;
    }, {} as Record<string, number>);

    for (const [wId, hours] of Object.entries(byWorkload)) {
      console.log(`  Workload ${wId}: Scheduled ${hours}h`);
      const wBlocks = p.plannedBlocks.filter(b => b.workloadId === wId);
      for (const b of wBlocks) {
        console.log(`    - ${new Date(b.startDateTime).toLocaleTimeString()} to ${new Date(b.endDateTime).toLocaleTimeString()} (${b.durationMinutes}m)`);
      }
    }
  }
}

// 17. Scenario A — Single Deadline
// One workload, sufficient CandidateTime.
runScenario(
  "A: Single Deadline",
  [{ ...baseWorkload, remainingTimeHours: 2 }],
  [createTimeWindow(1, 4)]
);

// 17. Scenario B — Two Nearby Exams
// Exam A 4 days away, Exam B 5 days away
runScenario(
  "B: Two Nearby Exams",
  [
    { 
      ...baseWorkload, id: 'ExamA', title: 'Exam A', workloadType: 'ExamPreparation', 
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), 
      remainingTimeHours: 6, schedulingCharacteristics: getWorkloadDefaults('ExamPreparation') 
    },
    { 
      ...baseWorkload, id: 'ExamB', title: 'Exam B', workloadType: 'ExamPreparation', 
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
      remainingTimeHours: 6, schedulingCharacteristics: getWorkloadDefaults('ExamPreparation') 
    }
  ],
  [
    createTimeWindow(24, 4), // Day 1
    createTimeWindow(48, 4), // Day 2
    createTimeWindow(72, 4), // Day 3
    createTimeWindow(96, 4), // Day 4 (Exam A cutoff)
    createTimeWindow(120, 4) // Day 5
  ]
);

// 17. Scenario C — Impossible Workload Volume
runScenario(
  "C: Impossible Workload Volume",
  [{ ...baseWorkload, remainingTimeHours: 20, deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }],
  [createTimeWindow(1, 5)] // only 5h available
);

// 17. Scenario D1 — Non-Splittable Work (Impossible)
runScenario(
  "D1: Non-Splittable Work (Impossible)",
  [{ ...baseWorkload, remainingTimeHours: 3, schedulingCharacteristics: { splittable: false, spacingPreferred: false, source: 'workload-default' } }],
  [
    createTimeWindow(1, 2), // 2h block
    createTimeWindow(4, 2)  // 2h block
  ] // no 3h block available
);

// 17. Scenario D2 — Non-Splittable Work (Valid)
runScenario(
  "D2: Non-Splittable Work (Valid)",
  [{ ...baseWorkload, remainingTimeHours: 2, schedulingCharacteristics: { splittable: false, spacingPreferred: false, source: 'workload-default' } }],
  [
    createTimeWindow(1, 1), // 1h block
    createTimeWindow(3, 1),  // 1h block
    createTimeWindow(6, 2.5) // 2.5h block
  ] // should pick the 3rd block
);

// 17. Scenario E — Existing FocusBlocks
runScenario(
  "E: Existing FocusBlocks",
  [{ ...baseWorkload, id: 'w1', remainingTimeHours: 5 }],
  [createTimeWindow(1, 10)],
  [{ id: 'fb1', workloadId: 'w1', startDateTime: new Date().toISOString(), endDateTime: new Date().toISOString(), durationMinutes: 120, source: 'mock', locked: true } as any]
);

// 17. Scenario F — Planned Hours Exceed Remaining Hours
runScenario(
  "F: Planned Hours Exceed Remaining Hours",
  [{ ...baseWorkload, id: 'w1', remainingTimeHours: 1 }],
  [createTimeWindow(1, 10)],
  [{ id: 'fb1', workloadId: 'w1', startDateTime: new Date().toISOString(), endDateTime: new Date().toISOString(), durationMinutes: 120, source: 'mock', locked: true } as any]
);

// 17. Scenario G — Missing Daily Check-In
runScenario(
  "G: Missing Daily Check-In",
  [{ ...baseWorkload, remainingTimeHours: 2 }],
  [createTimeWindow(1, 4)],
  [],
  undefined // Missing energy level
);

// 17. Scenario H — Candidate Window Boundary
// Work requires 2 hours, but window is only 1.5 hours before cutoff.
const cutoffMs = Date.now() + 2 * 60 * 60 * 1000; // 2 hours from now
runScenario(
  "H: Candidate Window Boundary",
  [{ ...baseWorkload, remainingTimeHours: 2, deadline: new Date(cutoffMs).toISOString() }],
  [
    {
      id: 'win',
      startDateTime: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(),
      endDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 2.5h long, but only 1.5h before cutoff
      durationMinutes: 150,
      source: 'mock'
    }
  ]
);

import { CandidateTimeWindow } from '../src/types/calendar';
import { WorkloadItem } from '../src/types/workload';
import { SchedulingInput } from '../src/types/scheduling';
import { prepareSchedulableWorkloads, generateCandidatePlans, getWorkloadDefaults } from '../src/services/schedulingEngine';

const baseWorkload: WorkloadItem = {
  id: 'w_test',
  title: 'Test Workload',
  area: 'Academic',
  activityType: 'Deep focus',
  workloadType: 'Assignment',
  timingType: 'Deadline',
  deadline: '2026-09-11T23:59:00+08:00',
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

const horizonStart = '2026-09-08T22:15:00+08:00';
const horizonEnd = '2026-09-15T22:15:00+08:00';

function createTimeWindow(id: string, startIso: string, durationMinutes: number): CandidateTimeWindow {
  const startMs = new Date(startIso).getTime();
  const endMs = startMs + durationMinutes * 60000;
  return {
    startDateTime: new Date(startMs).toISOString(),
    endDateTime: new Date(endMs).toISOString(),
    durationMinutes
  };
}

let allPassed = true;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.log(`  ❌ FAIL: ${message}`);
    allPassed = false;
  }
}

console.log('================================================================');
console.log('   REGRESSION TESTS FOR STAGE 4B SCHEDULER MINIMUM BLOCK FIX');
console.log('================================================================\n');

// ─── TEST 1: 15-minute remainder with 30-minute minimum ──────────────────────
console.log('--- TEST 1: 15-minute remainder with 30-minute minimum ---');
{
  // 15-minute remaining workload (0.25h) with 30-minute minimum
  const workloads: WorkloadItem[] = [{
    ...baseWorkload,
    id: 'w_15m',
    remainingTimeHours: 0.25, // 15 mins
    schedulingCharacteristics: { splittable: true, spacingPreferred: true, minimumBlockMinutes: 30, source: 'workload-default' }
  }];
  const windows = [createTimeWindow('win1', '2026-09-09T08:00:00+08:00', 120)]; // 2h window available

  const prep = prepareSchedulableWorkloads(workloads, []);
  const input: SchedulingInput = {
    horizonStart, horizonEnd, candidateTimeWindows: windows, schedulableWorkloads: prep.schedulableWorkloads,
    existingFocusBlocks: [], resourceContext: null, analysisContext: {} as any
  };

  const plans = generateCandidatePlans(input);

  plans.forEach(plan => {
    assert(plan.isValid, `${plan.strategy} plan is valid`);
    const subMinBlocks = plan.plannedBlocks.filter(b => b.durationMinutes < 30);
    assert(subMinBlocks.length === 0, `${plan.strategy} generated 0 sub-30m blocks (actual: ${subMinBlocks.length})`);
    assert(plan.plannedBlocks.length === 0, `${plan.strategy} emitted 0 standalone blocks for 15m remainder`);
    assert(plan.basicMetrics.unscheduledRequiredEffort === 0.25, `${plan.strategy} left 15m (0.25h) unscheduled (actual: ${plan.basicMetrics.unscheduledRequiredEffort}h)`);
  });
}
console.log('');

// ─── TEST 2: Floating-point / quota remainder ────────────────────────────────
console.log('--- TEST 2: Floating-point / quota remainder ---');
{
  // 3.6h effort (216 minutes) with 30m minimum into 200m windows
  const workloads: WorkloadItem[] = [{
    ...baseWorkload,
    id: 'w_float',
    remainingTimeHours: 3.6, // 216 minutes
    schedulingCharacteristics: { splittable: true, spacingPreferred: true, minimumBlockMinutes: 30, source: 'workload-default' }
  }];
  const windows = [
    createTimeWindow('win1', '2026-09-09T08:00:00+08:00', 200), // 200m
    createTimeWindow('win2', '2026-09-10T08:00:00+08:00', 60)   // 60m
  ];

  const prep = prepareSchedulableWorkloads(workloads, []);
  const input: SchedulingInput = {
    horizonStart, horizonEnd, candidateTimeWindows: windows, schedulableWorkloads: prep.schedulableWorkloads,
    existingFocusBlocks: [], resourceContext: null, analysisContext: {} as any
  };

  const plans = generateCandidatePlans(input);

  plans.forEach(plan => {
    assert(plan.isValid, `${plan.strategy} plan is valid`);
    const subMinBlocks = plan.plannedBlocks.filter(b => b.durationMinutes < 30);
    assert(subMinBlocks.length === 0, `${plan.strategy} generated 0 sub-30m blocks (actual: ${subMinBlocks.length})`);
    const microBlocks = plan.plannedBlocks.filter(b => b.durationMinutes < 5);
    assert(microBlocks.length === 0, `${plan.strategy} generated 0 micro-minute/seconds-long blocks`);
  });
}
console.log('');

// ─── TEST 3: Remainder can be merged into an existing valid block ────────────
console.log('--- TEST 3: Remainder merged into existing valid block ---');
{
  // 75 minutes total (1.25h) into a 120-minute window
  const workloads: WorkloadItem[] = [{
    ...baseWorkload,
    id: 'w_merge',
    remainingTimeHours: 1.25, // 75 mins
    schedulingCharacteristics: { splittable: true, spacingPreferred: true, minimumBlockMinutes: 30, source: 'workload-default' }
  }];
  const windows = [createTimeWindow('win1', '2026-09-09T08:00:00+08:00', 120)]; // 120m window

  const prep = prepareSchedulableWorkloads(workloads, []);
  const input: SchedulingInput = {
    horizonStart, horizonEnd, candidateTimeWindows: windows, schedulableWorkloads: prep.schedulableWorkloads,
    existingFocusBlocks: [], resourceContext: null, analysisContext: {} as any
  };

  const plans = generateCandidatePlans(input);

  plans.forEach(plan => {
    assert(plan.isValid, `${plan.strategy} plan is valid`);
    assert(plan.plannedBlocks.length === 1, `${plan.strategy} merged into 1 block (actual blocks: ${plan.plannedBlocks.length})`);
    assert(plan.plannedBlocks[0]?.durationMinutes === 75, `${plan.strategy} single block has 75m duration`);
    assert(plan.basicMetrics.unscheduledRequiredEffort === 0, `${plan.strategy} total effort fully scheduled (unscheduled: ${plan.basicMetrics.unscheduledRequiredEffort}h)`);
  });
}
console.log('');

// ─── TEST 4: Remainder cannot be merged ───────────────────────────────────────
console.log('--- TEST 4: Remainder cannot be merged ---');
{
  // 45 minutes total (0.75h) with 30m min into Window 1 (30m) and Window 2 (15m)
  const workloads: WorkloadItem[] = [{
    ...baseWorkload,
    id: 'w_nomerge',
    remainingTimeHours: 0.75, // 45 mins
    schedulingCharacteristics: { splittable: true, spacingPreferred: true, minimumBlockMinutes: 30, source: 'workload-default' }
  }];
  const windows = [
    createTimeWindow('win1', '2026-09-09T08:00:00+08:00', 30), // 30m window
    createTimeWindow('win2', '2026-09-09T14:00:00+08:00', 15)  // 15m window (separated by class)
  ];

  const prep = prepareSchedulableWorkloads(workloads, []);
  const input: SchedulingInput = {
    horizonStart, horizonEnd, candidateTimeWindows: windows, schedulableWorkloads: prep.schedulableWorkloads,
    existingFocusBlocks: [], resourceContext: null, analysisContext: {} as any
  };

  const plans = generateCandidatePlans(input);

  plans.forEach(plan => {
    assert(plan.isValid, `${plan.strategy} plan is valid`);
    assert(plan.plannedBlocks.length === 1, `${plan.strategy} placed exactly 1 valid 30m block`);
    assert(plan.plannedBlocks[0]?.durationMinutes === 30, `${plan.strategy} block 1 is 30m`);
    assert(plan.basicMetrics.unscheduledRequiredEffort === 0.25, `${plan.strategy} 15m remainder remains unscheduled (actual: ${plan.basicMetrics.unscheduledRequiredEffort}h)`);
  });
}
console.log('');

console.log('================================================================');
if (allPassed) {
  console.log('   ALL REGRESSION TESTS PASSED SUCCESSFULLY!');
} else {
  console.log('   SOME REGRESSION TESTS FAILED!');
}
console.log('================================================================');

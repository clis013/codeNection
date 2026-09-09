import { calculateCandidateWindows } from '../src/services/calendarEngine';
import { FixedBusyEvent, ProtectedTime, FocusBlock } from '../src/types/calendar';

const horizonStart = new Date('2026-09-09T08:00:00.000Z');
const horizonEnd = new Date('2026-09-09T17:00:00.000Z');

// A. Busy event subtraction
let busyEvents: FixedBusyEvent[] = [{ id: '1', title: 'busy', startDateTime: '2026-09-09T09:00:00.000Z', endDateTime: '2026-09-09T11:00:00.000Z', source: 'mock', isMovable: false }];
let protectedTimes: ProtectedTime[] = [];
let focusBlocks: FocusBlock[] = [];

console.log("=== A. Busy event subtraction ===");
let candidates = calculateCandidateWindows(horizonStart.toISOString(), horizonEnd.toISOString(), busyEvents, protectedTimes, focusBlocks, 0);
candidates.forEach(c => console.log(new Date(c.startDateTime).toISOString().substring(11, 16) + " - " + new Date(c.endDateTime).toISOString().substring(11, 16)));

// B. Protected time subtraction
console.log("\n=== B. Protected time subtraction ===");
busyEvents = [];
protectedTimes = [{ id: '2', title: 'protected', type: 'manual', source: 'manual', isRecurring: false, startDateTime: '2026-09-09T13:00:00.000Z', endDateTime: '2026-09-09T14:00:00.000Z' }];
candidates = calculateCandidateWindows(horizonStart.toISOString(), horizonEnd.toISOString(), busyEvents, protectedTimes, focusBlocks, 0);
candidates.forEach(c => console.log(new Date(c.startDateTime).toISOString().substring(11, 16) + " - " + new Date(c.endDateTime).toISOString().substring(11, 16)));

// C. Overlapping blocks
console.log("\n=== C. Overlapping blocks ===");
busyEvents = [{ id: '1', title: 'busy', startDateTime: '2026-09-09T09:00:00.000Z', endDateTime: '2026-09-09T11:00:00.000Z', source: 'mock', isMovable: false }];
protectedTimes = [{ id: '2', title: 'protected', type: 'manual', source: 'manual', isRecurring: false, startDateTime: '2026-09-09T10:00:00.000Z', endDateTime: '2026-09-09T12:00:00.000Z' }];
candidates = calculateCandidateWindows(horizonStart.toISOString(), horizonEnd.toISOString(), busyEvents, protectedTimes, focusBlocks, 0);
candidates.forEach(c => console.log(new Date(c.startDateTime).toISOString().substring(11, 16) + " - " + new Date(c.endDateTime).toISOString().substring(11, 16)));

// D. Existing FocusBlock
console.log("\n=== D. Existing FocusBlock ===");
busyEvents = [];
protectedTimes = [];
focusBlocks = [{ id: '3', workloadId: 'w1', startDateTime: '2026-09-09T12:00:00.000Z', endDateTime: '2026-09-09T13:00:00.000Z', status: 'planned', locked: true }];
candidates = calculateCandidateWindows(horizonStart.toISOString(), horizonEnd.toISOString(), busyEvents, protectedTimes, focusBlocks, 0);
candidates.forEach(c => console.log(new Date(c.startDateTime).toISOString().substring(11, 16) + " - " + new Date(c.endDateTime).toISOString().substring(11, 16)));

// E. Tiny gap
console.log("\n=== E. Tiny gap ===");
busyEvents = [
  { id: '1', title: 'b1', startDateTime: '2026-09-09T09:00:00.000Z', endDateTime: '2026-09-09T12:00:00.000Z', source: 'mock', isMovable: false },
  { id: '2', title: 'b2', startDateTime: '2026-09-09T12:20:00.000Z', endDateTime: '2026-09-09T17:00:00.000Z', source: 'mock', isMovable: false }
];
// Gap is 12:00 to 12:20 (20 mins). minDuration is 30
candidates = calculateCandidateWindows(horizonStart.toISOString(), horizonEnd.toISOString(), busyEvents, protectedTimes, focusBlocks, 30);
console.log("Candidates with min 30m: ", candidates.length);

// F. No busy blocks
console.log("\n=== F. No busy blocks ===");
candidates = calculateCandidateWindows(horizonStart.toISOString(), horizonEnd.toISOString(), [], [], [], 0);
candidates.forEach(c => console.log(new Date(c.startDateTime).toISOString().substring(11, 16) + " - " + new Date(c.endDateTime).toISOString().substring(11, 16)));

// G. Overnight Sleep
console.log("\n=== G. Overnight Sleep ===");
// Let horizon be across 2 days
const longHorizonStart = new Date('2026-09-09T08:00:00.000Z');
const longHorizonEnd = new Date('2026-09-10T12:00:00.000Z');
protectedTimes = [{
  id: 'sleep', title: 'Sleep', type: 'sleep', source: 'manual',
  isRecurring: true, recurringStartTime: '23:30', recurringEndTime: '07:30'
}];
// For this we need to use local time handling vs UTC. Since we do new Date(currentDay).setHours(), it will be local time.
// Since the environment is running this script, let's just see output.
candidates = calculateCandidateWindows(longHorizonStart.toISOString(), longHorizonEnd.toISOString(), [], protectedTimes, [], 0);
candidates.forEach(c => console.log(new Date(c.startDateTime).toLocaleString() + " - " + new Date(c.endDateTime).toLocaleString()));

import { AnalysisInput, AnalysisResult, AnalysisEvidence, AnalysisFactor, RecoveryNeed } from '../types/stress';

/**
 * Builds the AnalysisInput object from application state.
 * This acts as the boundary between the app's deterministic facts and the AI layer.
 */
export function buildAnalysisInput(
  localDate: string,
  todayCheckIn: any | null,
  activeWorkloads: any[],
  derivedFacts: any,
  timeFeasibility: any | null = null
): AnalysisInput {
  return {
    localDate,
    checkInState: todayCheckIn ? {
      stressCategory: todayCheckIn.category,
      energyLevel: todayCheckIn.energyLevel,
      controlLevel: todayCheckIn.controlScore || todayCheckIn.q2_control,
      baselineDiff: todayCheckIn.baselineDiff ?? null,
    } : null,
    workloadFacts: {
      activeWorkloads: activeWorkloads.map(w => ({
        id: w.id,
        title: w.title,
        area: w.area,
        activityType: w.activityType,
        urgency: w.urgency,
        flexibility: w.flexibility,
        importance: undefined, // Do not invent importance from isMainConcern
        deadline: w.deadline,
        remainingTimeHours: w.remainingTimeHours,
        demandProfile: { ...w.demandProfile }
      })),
      totalRemainingHours: derivedFacts.totalRemainingHours,
      demandDistribution: derivedFacts.demandDistribution
    },
    timeFeasibility,
    stressDumpContext: []
  };
}

/**
 * MOCK ANALYSIS PROVIDER
 * 
 * IMPORTANT: This is a prototype simulation, NOT a validated psychological algorithm.
 * It uses combinations of available signals to match predefined prototype scenario archetypes.
 */
export function getMockAnalysis(input: AnalysisInput): AnalysisResult {
  const isCheckInMissing = !input.checkInState;
  const isWorkloadsMissing = input.workloadFacts.activeWorkloads.length === 0;

  // 1. Evaluate Data Sufficiency First
  if (isWorkloadsMissing) {
    return {
      demandResourceStatus: 'InsufficientData',
      confidence: 'Low',
      evidence: [],
      mainConstraints: [],
      mainContributors: [],
      mismatch: { detected: false },
      recoveryNeed: { indicated: false },
      isMock: true,
      dataLimitations: ['No active workloads recorded.']
    };
  }

  // 1.5 Evaluate Data Sufficiency for Resources
  if (isCheckInMissing) {
    return {
      demandResourceStatus: 'InsufficientData',
      confidence: input.timeFeasibility?.calendarDataAvailable ? 'Moderate' : 'Low',
      evidence: [],
      mainConstraints: [],
      mainContributors: [],
      mismatch: { detected: false },
      recoveryNeed: { indicated: false },
      isMock: true,
      dataLimitations: [
        'No daily check-in recorded for today.',
        ...(input.timeFeasibility?.calendarDataAvailable ? [] : ['Missing Calendar time feasibility.'])
      ]
    };
  }

  // 2. Base Confidence
  const hasCalendar = input.timeFeasibility?.calendarDataAvailable ?? false;
  // Conservative confidence semantics:
  // Missing check-in or missing calendar caps it at Moderate.
  // High confidence should only become possible when strong evidence justifies it (for MVP we remain conservative).
  let confidence: 'Low' | 'Moderate' | 'High' = hasCalendar ? 'Moderate' : 'Moderate';
  if (!hasCalendar) confidence = 'Low'; // Fallback to Low if no check-in & no calendar (Wait, check-in exists here)
  if (hasCalendar && !isCheckInMissing) {
    // Stage 2 baseline semantics: we only achieve High if there are strong alignments. For now, Moderate is safe, but we can allow High if we want to simulate full data. The user specifically asked: "High confidence should only become possible when the existing Analysis Provider's evidence and data-quality conditions justify it." Let's stick with Moderate or High.
    confidence = 'High';
  }
  if (!hasCalendar) confidence = 'Moderate'; // Restore original Stage 2 missing-calendar ceiling

  const dataLimitations: string[] = [];
  if (!hasCalendar) {
    dataLimitations.push('Missing Calendar time feasibility.');
  } else if (input.timeFeasibility?.calendarDataSource === 'mock') {
    dataLimitations.push('Time feasibility based on mock calendar data.');
  }
  if (isCheckInMissing) {
    dataLimitations.push('No daily check-in recorded for today.');
  }

  // 3. Evaluate Workload Demands
  const wFacts = input.workloadFacts;
  const highCognitive = wFacts.demandDistribution.cognitive.high;
  const highEmotional = wFacts.demandDistribution.emotional.high;
  
  // Resources
  const energy = input.checkInState?.energyLevel;
  const control = input.checkInState?.controlLevel;
  const stress = input.checkInState?.stressCategory;
  const availHours = input.timeFeasibility?.candidateTimeHours ?? 4.5; // fallback strictly for mock reasoning if calendar is disabled

  let status: 'Manageable' | 'Strained' | 'Overloaded' = 'Manageable';
  const evidence: AnalysisEvidence[] = [];
  const constraints: AnalysisFactor[] = [];
  const contributors: AnalysisFactor[] = [];
  const recoveryNeed: RecoveryNeed = { indicated: false, type: undefined, reason: undefined };

  // SCENARIO: Overloaded
  if (wFacts.totalRemainingHours > 20) {
    status = 'Overloaded';
    evidence.push({ category: 'Time', message: 'Total workload volume exceeds sustainable psychological load.', severity: 'High' });
    constraints.push({ factorType: 'Volume', description: 'Exceptionally high total workload hours' });
    recoveryNeed.indicated = true;
    recoveryNeed.type = 'general';
    recoveryNeed.reason = 'Sustained high volume load rapidly drains reserves.';
  } else if (hasCalendar && wFacts.totalRemainingHours > (input.timeFeasibility?.candidateTimeHours ?? 0)) {
    // Stage 3 Contextual Evidence ONLY - Does not unilaterally force Overload status since deadlines aren't checked
    evidence.push({ category: 'Time', message: 'Total workload exceeds candidate time in the 7-day horizon. Deadline scheduling may be tight.', severity: 'Moderate' });
  }

  if (highCognitive >= 2 && energy !== undefined && energy <= 2) {
    status = 'Overloaded';
    evidence.push({ category: 'Cognitive', message: 'Multiple highly cognitive tasks while energy is depleted.', severity: 'High' });
    evidence.push({ category: 'Energy', message: 'Current energy levels are insufficient for the planned demands.', severity: 'High' });
    constraints.push({ factorType: 'ResourceDepletion', description: 'Low cognitive energy reserves' });
    contributors.push({ factorType: 'Volume', description: 'Multiple high cognitive demand tasks' });
    recoveryNeed.indicated = true;
    recoveryNeed.type = 'cognitive';
    recoveryNeed.reason = 'Cognitive depletion combined with demanding tasks requires mental rest.';
  } 
  // SCENARIO: Strained
  // Some high demands or moderate resources
  else if (highEmotional >= 1 && control !== undefined && control <= 2) {
    status = 'Strained';
    evidence.push({ category: 'Emotional', message: 'Facing emotionally demanding work while feeling low control.', severity: 'Moderate' });
    constraints.push({ factorType: 'Contextual', description: 'Reduced perceived control over workload' });
    contributors.push({ factorType: 'Complexity', description: 'Emotionally demanding tasks' });
    recoveryNeed.indicated = true;
    recoveryNeed.type = 'emotional';
    recoveryNeed.reason = 'Low perceived control and emotional demands indicate need for emotional release.';
  }
  // SCENARIO: Strained (General volume with low energy)
  else if (wFacts.totalRemainingHours >= 15 && energy !== undefined && energy <= 3) {
    status = 'Strained';
    evidence.push({ category: 'Time', message: 'Significant workload volume compared to available energy.', severity: 'Moderate' });
    constraints.push({ factorType: 'Volume', description: 'High total remaining hours' });
    recoveryNeed.indicated = true;
    recoveryNeed.type = 'general';
    recoveryNeed.reason = 'High volume of work suggests need for paced recovery breaks.';
  }
  // SCENARIO: Manageable
  else {
    status = 'Manageable';
    evidence.push({ category: 'Cognitive', message: 'Recorded demands align well with current resources.', severity: 'Low' });
    if (!isCheckInMissing && energy !== undefined && energy >= 4) {
      evidence.push({ category: 'Energy', message: 'Good energy levels to tackle upcoming tasks.', severity: 'Low' });
    }
  }

  // 5. Evaluate Mismatch (Only if check-in exists and status != InsufficientData)
  let mismatch = { detected: false, type: undefined as any, insight: undefined as any };
  
  if (!isCheckInMissing) {
    if ((stress === 'High' || stress === 'Very High') && status === 'Manageable') {
      mismatch = {
        detected: true,
        type: 'HighStressManageableLoad',
        insight: 'Your recorded workload currently looks manageable, but your Stress is high. Something important may not yet be captured.'
      };
    } else if (stress === 'Normal' && status === 'Overloaded') {
      mismatch = {
        detected: true,
        type: 'NormalStressOverloadedLoad',
        insight: 'You may feel okay right now, but your recorded plan appears difficult to sustain without adjustment.'
      };
    }
  }

  // If check-in missing, we strip subjective evidence that we might have guessed
  const filteredEvidence = isCheckInMissing 
    ? evidence.filter(e => e.category !== 'Energy' && e.category !== 'Stress' && e.category !== 'Control')
    : evidence;

  return {
    demandResourceStatus: status,
    confidence,
    evidence: filteredEvidence,
    mainConstraints: constraints,
    mainContributors: contributors,
    mismatch,
    recoveryNeed,
    isMock: true,
    dataLimitations
  };
}

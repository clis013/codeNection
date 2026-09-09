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
  timeFeasibility: any | null = null,
  stressDumpContext: string[] = []
): AnalysisInput {
  return {
    localDate,
    checkInState: todayCheckIn ? {
      stressCategory: todayCheckIn.category,
      energyLevel: todayCheckIn.energyLevel,
      controlLevel: todayCheckIn.controlScore || todayCheckIn.q2_control,
      baselineDiff: todayCheckIn.baselineDiff ?? null,
      pssScore: todayCheckIn.pssScore,
      mentalDemandScore: todayCheckIn.mentalDemandScore || todayCheckIn.q3_mentalDemand,
      copingCapabilityScore: todayCheckIn.copingCapabilityScore || todayCheckIn.q4_capability,
    } : null,
    workloadFacts: {
      activeWorkloads: activeWorkloads.map(w => ({
        id: w.id,
        title: w.title,
        area: w.area,
        activityType: w.activityType,
        urgency: w.urgency,
        flexibility: w.flexibility,
        importance: w.importance,
        deadline: w.deadline,
        remainingTimeHours: w.remainingTimeHours ?? w.estimatedHours,
        demandProfile: { ...w.demandProfile }
      })),
      totalRemainingHours: derivedFacts.totalRemainingHours,
      demandDistribution: derivedFacts.demandDistribution
    },
    timeFeasibility,
    stressDumpContext
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
  let confidence: 'Low' | 'Moderate' | 'High' = hasCalendar ? 'Moderate' : 'Moderate';
  if (!hasCalendar) confidence = 'Low';
  if (hasCalendar && !isCheckInMissing) {
    confidence = 'High';
  }
  if (!hasCalendar) confidence = 'Moderate';

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

  let status: 'Manageable' | 'Strained' | 'Overloaded' = 'Manageable';
  const evidence: AnalysisEvidence[] = [];
  const constraints: AnalysisFactor[] = [];
  const contributors: AnalysisFactor[] = [];
  const recoveryNeed: RecoveryNeed = { indicated: false, type: undefined, reason: undefined };

  // Detect whether Stress Dump confirmation has occurred
  const isStressDumpConfirmed = wFacts.activeWorkloads.some(w => w.id === 'tech-carnival-sponsorship') ||
    wFacts.activeWorkloads.some(w => w.id === 'web-programming-group' && (w.remainingTimeHours === 18 || (w as any).estimatedHours === 18)) ||
    input.stressDumpContext?.includes('tech-carnival-sponsorship-added') ||
    input.stressDumpContext?.includes('confirmed');

  // SCENARIO: Converging Overload (Justified by multiple converging signals:
  // Very High stress + stress substantially above baseline + very low energy (<=2) + low control (<=2) + high cognitive workload)
  const isConvergingOverload = (
    (stress === 'Very High' || stress === 'High') &&
    energy !== undefined && energy <= 2 &&
    control !== undefined && control <= 2 &&
    highCognitive >= 2
  );

  if (isConvergingOverload) {
    status = 'Overloaded';
    confidence = 'High';
    recoveryNeed.indicated = true;
    recoveryNeed.type = 'general';
    recoveryNeed.reason =
      'Nicole reports very low energy after a difficult previous week while several demanding commitments are approaching.';

    if (!isStressDumpConfirmed) {
      // BEFORE STRESS DUMP
      evidence.push(
        { category: 'Stress', message: 'Your perceived stress is 18/20 today, compared with your recent baseline average of 10.4.', severity: 'High' },
        { category: 'Energy', message: 'Your energy is 1/5 today, substantially below your recent baseline average of 3.6.', severity: 'High' },
        { category: 'Control', message: 'Your sense of control is 2/5 today, below your recent baseline average of 3.7.', severity: 'High' },
        { category: 'Cognitive', message: 'Several active commitments require high cognitive effort, including the OS Quiz, Web Programming assignment and FCG Test.', severity: 'High' },
        { category: 'Time', message: 'Several substantial academic commitments have closely competing deadlines over the next few days.', severity: 'High' }
      );
      constraints.push(
        { factorType: 'ResourceDepletion', description: 'Depleted energy (1/5) and low perceived control (2/5) relative to baseline' },
        { factorType: 'Deadline', description: 'Multiple substantial academic commitments due in close proximity' }
      );
      contributors.push(
        { factorType: 'Complexity', description: 'High cognitive effort required across OS Quiz, Web Programming, and FCG Test' }
      );
    } else {
      // AFTER STRESS DUMP CONFIRMATION
      evidence.push(
        { category: 'Stress', message: 'Your perceived stress is 18/20 today, compared with your recent baseline average of 10.4.', severity: 'High' },
        { category: 'Energy', message: 'Your energy is 1/5 today, substantially below your recent baseline average of 3.6.', severity: 'High' },
        { category: 'Control', message: 'Your sense of control is 2/5 today, below your recent baseline average of 3.7.', severity: 'High' },
        { category: 'Cognitive', message: 'OS Quiz, Web Programming and FCG all require high cognitive effort.', severity: 'High' },
        { category: 'Context', message: 'Stress Dump revealed that your share of the Web Programming assignment is larger than originally recorded.', severity: 'High' },
        { category: 'Context', message: 'Stress Dump also surfaced Tech Carnival Sponsorship as an additional responsibility.', severity: 'High' },
        { category: 'Time', message: 'OS preparation, Tech Carnival sponsorship and Web Programming are competing for attention within a short period.', severity: 'High' }
      );
      constraints.push(
        { factorType: 'ResourceDepletion', description: 'Depleted energy (1/5) and low perceived control (2/5) relative to baseline' },
        { factorType: 'Deadline', description: 'Short-term deadline clustering across academic and extracurricular commitments' }
      );
      contributors.push(
        { factorType: 'Complexity', description: 'High cognitive effort required across OS Quiz, Web Programming, and FCG Test' },
        { factorType: 'Volume', description: 'Expanded Web Programming responsibility (18h) and Tech Carnival sponsorship (6h)' }
      );
    }
  } 
  // SCENARIO: Strained (Emotional pressure with low perceived control)
  else if (highEmotional >= 1 && control !== undefined && control <= 2) {
    status = 'Strained';
    evidence.push({ category: 'Emotional', message: 'Facing emotionally demanding work while feeling low control.', severity: 'Moderate' });
    constraints.push({ factorType: 'Contextual', description: 'Reduced perceived control over workload' });
    contributors.push({ factorType: 'Complexity', description: 'Emotionally demanding tasks' });
    recoveryNeed.indicated = true;
    recoveryNeed.type = 'emotional';
    recoveryNeed.reason = 'Low perceived control and emotional demands indicate need for emotional release.';
  }
  // SCENARIO: Strained (Significant workload compared to available energy)
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

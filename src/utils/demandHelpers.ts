/**
 * Demand helpers — Restore Prototype
 *
 * Centralized helpers for demand dimension conversion and derived workload facts.
 * All views should use getDemandLabel() rather than defining their own thresholds.
 *
 * Spec mapping:
 *   1–2 → Low
 *   3   → Moderate
 *   4–5 → High
 */

import { WorkloadItem } from '../types/workload';

// ─── Demand label conversion ────────────────────────────────────────────────

export type DemandLabel = 'Low' | 'Moderate' | 'High';

/**
 * Converts a 1–5 demand score to a Low/Moderate/High label.
 * This is the single canonical threshold used throughout the app.
 */
export function getDemandLabel(score: number): DemandLabel {
  if (score <= 2) return 'Low';
  if (score === 3) return 'Moderate';
  return 'High'; // 4–5
}

// ─── Demand distribution ─────────────────────────────────────────────────────

export interface DemandDistribution {
  cognitive: { high: number; moderate: number; low: number };
  emotional: { high: number; moderate: number; low: number };
  physical: { high: number; moderate: number; low: number };
}

/**
 * Calculates how many active workloads fall into High/Moderate/Low for each
 * demand dimension (cognitive, emotional, physical).
 */
export function calculateDemandDistribution(activeWorkloads: WorkloadItem[]): DemandDistribution {
  const dist: DemandDistribution = {
    cognitive: { high: 0, moderate: 0, low: 0 },
    emotional: { high: 0, moderate: 0, low: 0 },
    physical:  { high: 0, moderate: 0, low: 0 },
  };

  for (const w of activeWorkloads) {
    const cogLabel = getDemandLabel(w.demandProfile.cognitive);
    const emoLabel = getDemandLabel(w.demandProfile.emotional);
    const phyLabel = getDemandLabel(w.demandProfile.physical);

    if (cogLabel === 'High')     dist.cognitive.high++;
    else if (cogLabel === 'Moderate') dist.cognitive.moderate++;
    else                              dist.cognitive.low++;

    if (emoLabel === 'High')     dist.emotional.high++;
    else if (emoLabel === 'Moderate') dist.emotional.moderate++;
    else                              dist.emotional.low++;

    if (phyLabel === 'High')     dist.physical.high++;
    else if (phyLabel === 'Moderate') dist.physical.moderate++;
    else                              dist.physical.low++;
  }

  return dist;
}

// ─── Area distribution ───────────────────────────────────────────────────────

export interface AreaDistribution {
  Academic: number;
  Personal: number;
  Social: number;
  'Self-Care': number;
}

/**
 * Counts active workloads per area. Returns exact spec areas.
 */
export function calculateAreaDistribution(activeWorkloads: WorkloadItem[]): AreaDistribution {
  const dist: AreaDistribution = { Academic: 0, Personal: 0, Social: 0, 'Self-Care': 0 };
  for (const w of activeWorkloads) {
    if (w.area in dist) {
      dist[w.area as keyof AreaDistribution]++;
    }
  }
  return dist;
}

/**
 * Returns the dominant workload area(s).
 * Returns an array to correctly represent ties rather than silently picking one.
 */
export function getDominantAreas(activeWorkloads: WorkloadItem[]): Array<keyof AreaDistribution> {
  const dist = calculateAreaDistribution(activeWorkloads);
  const max = Math.max(...Object.values(dist));
  if (max === 0) return [];
  return (Object.keys(dist) as Array<keyof AreaDistribution>).filter(k => dist[k] === max);
}

// ─── Most draining demand ─────────────────────────────────────────────────────

/**
 * Returns the demand dimension(s) with the highest average score across active workloads.
 * Returns an array to correctly represent ties.
 *
 * Method: average score per dimension — transparent and deterministic.
 */
export function getMostDrainingDemands(activeWorkloads: WorkloadItem[]): Array<'Cognitive' | 'Emotional' | 'Physical'> {
  if (activeWorkloads.length === 0) return [];
  const n = activeWorkloads.length;
  const avgCog = activeWorkloads.reduce((acc, w) => acc + w.demandProfile.cognitive, 0) / n;
  const avgEmo = activeWorkloads.reduce((acc, w) => acc + w.demandProfile.emotional, 0) / n;
  const avgPhy = activeWorkloads.reduce((acc, w) => acc + w.demandProfile.physical, 0) / n;

  const avgs: Record<'Cognitive' | 'Emotional' | 'Physical', number> = {
    Cognitive: avgCog,
    Emotional: avgEmo,
    Physical:  avgPhy,
  };
  const max = Math.max(avgCog, avgEmo, avgPhy);
  return (Object.keys(avgs) as Array<'Cognitive' | 'Emotional' | 'Physical'>).filter(k => avgs[k] === max);
}

// ─── Hours ────────────────────────────────────────────────────────────────────

/**
 * Sums `remainingTimeHours` for all active workloads.
 * Falls back to `estimatedHours` if `remainingTimeHours` is not set.
 */
export function calculateTotalRemainingHours(activeWorkloads: WorkloadItem[]): number {
  return Number(
    activeWorkloads
      .reduce((acc, w) => acc + (w.remainingTimeHours ?? w.estimatedHours), 0)
      .toFixed(1)
  );
}

/**
 * Sums `estimatedHours` for all active workloads.
 */
export function calculateTotalEstimatedHours(activeWorkloads: WorkloadItem[]): number {
  return Number(
    activeWorkloads
      .reduce((acc, w) => acc + (w.estimatedHours || 0), 0)
      .toFixed(1)
  );
}

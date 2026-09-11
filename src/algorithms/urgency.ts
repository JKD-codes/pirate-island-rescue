import type { Island, Storm, TriageLevel } from '../types';

const TRIAGE_BONUS: Record<TriageLevel, number> = {
  Critical: 50,
  Urgent: 25,
  Stable: 10,
};

/**
 * P_i = (Survivors * 1.5) + TriageBonus - (DistanceToNearestStorm * 0.25)
 * Uses remaining survivors (survivors - rescued).
 */
export function calculateUrgencyIndex(island: Island, storms: Storm[]): number {
  const remaining = island.survivors - island.rescued;
  if (remaining <= 0) return -Infinity;

  const bonus = TRIAGE_BONUS[island.triage];

  // Distance to nearest storm center
  let minDist = Infinity;
  for (const storm of storms) {
    const dx = island.x - storm.x;
    const dy = island.y - storm.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) minDist = dist;
  }
  if (!isFinite(minDist)) minDist = 0;

  return remaining * 1.5 + bonus - minDist * 0.25;
}

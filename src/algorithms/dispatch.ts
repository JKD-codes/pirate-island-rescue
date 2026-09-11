import type { Island, Ship, Storm, LogEntry } from '../types';
import { calculateUrgencyIndex } from './urgency';
import { runAStar, pathDistance } from './astar';

export interface DispatchAssignment {
  shipId: string;
  islandId: string;
  path: { x: number; y: number }[];
  passengersToLoad: number;
  distance: number;
}

interface DispatchResult {
  assignments: DispatchAssignment[];
  updatedShips: Ship[];
  updatedIslands: Island[];
  logs: LogEntry[];
}

function timestamp(): string {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

/**
 * Greedy capacity-constrained dispatch solver.
 *
 * 1. Score all islands by urgency index (descending).
 * 2. For each un-evacuated island, find the best idle ship minimizing
 *    Cost = A*_Distance / (RemainingCapacity * Speed).
 * 3. Assign min(islandRemaining, shipRemainingCapacity) passengers.
 * 4. If survivors remain, the island stays in queue for the next cutter.
 * 5. Compute A* paths for each assignment.
 */
export function solveDispatchPlan(
  islands: Island[],
  ships: Ship[],
  storms: Storm[]
): DispatchResult {
  const logs: LogEntry[] = [];
  const ts = timestamp;

  // ─── 1. Score islands ───
  const scored = islands
    .map((isl) => ({
      ...isl,
      urgencyIndex: calculateUrgencyIndex(isl, storms),
    }))
    .filter((isl) => isl.survivors - isl.rescued > 0)
    .sort((a, b) => b.urgencyIndex - a.urgencyIndex);

  logs.push({
    timestamp: ts(),
    message: `[ALGORITHM] Urgency scoring complete. Evaluated ${scored.length} unevacuated atolls:`,
    type: 'info',
  });
  scored.forEach((isl, i) => {
    logs.push({
      timestamp: ts(),
      message: `   #${i + 1} ${isl.name} — Priority=${isl.urgencyIndex.toFixed(1)} (${isl.triage} Triage, ${isl.survivors - isl.rescued} castaways remaining)`,
      type: isl.triage === 'Critical' ? 'critical' : isl.triage === 'Urgent' ? 'warning' : 'info',
    });
  });

  // ─── 2. Working copies ───
  const shipWork = ships.map((s) => ({
    ...s,
    remainingCapacity: s.capacity - s.load,
    assigned: false,
  }));

  const islandWork = scored.map((isl) => ({
    ...isl,
    unassigned: Math.max(0, isl.survivors - isl.rescued),
  }));

  const assignments: DispatchAssignment[] = [];

  // ─── 3. Greedy matching ───
  for (const island of islandWork) {
    if (island.unassigned <= 0) continue;

    while (island.unassigned > 0) {
      // Find best available ship
      let bestShip: (typeof shipWork)[number] | null = null;
      let bestCost = Infinity;
      let bestPath: { x: number; y: number }[] = [];
      let bestDist = 0;

      for (const ship of shipWork) {
        if (ship.assigned || ship.remainingCapacity <= 0) continue;

        const path = runAStar(
          { x: ship.x, y: ship.y },
          { x: island.x, y: island.y },
          storms
        );
        const dist = pathDistance(path);
        const cost = dist / (ship.remainingCapacity * ship.speed);

        if (cost < bestCost) {
          bestCost = cost;
          bestShip = ship;
          bestPath = path;
          bestDist = dist;
        }
      }

      if (!bestShip) {
        logs.push({
          timestamp: ts(),
          message: `[CAPACITY EXHAUSTED] No available cutters for ${island.name} — ${island.unassigned} castaways remain in queue.`,
          type: 'warning',
        });
        break;
      }

      // Allocate passengers
      const passengersToLoad = Math.min(island.unassigned, bestShip.remainingCapacity);
      island.unassigned -= passengersToLoad;
      bestShip.remainingCapacity -= passengersToLoad;
      bestShip.assigned = true; // One destination per ship per round

      assignments.push({
        shipId: bestShip.id,
        islandId: island.id,
        path: bestPath,
        passengersToLoad,
        distance: bestDist,
      });

      logs.push({
        timestamp: ts(),
        message: `[PASSAGE DECREED] ${bestShip.name} → ${island.name} | ${passengersToLoad} souls | ${bestDist.toFixed(0)} NM via A* (${bestPath.length} waypoints)`,
        type: 'success',
      });
    }
  }

  // ─── 4. Build updated state ───
  const updatedShips = ships.map((ship) => {
    const assignment = assignments.find((a) => a.shipId === ship.id);
    if (!assignment) return { ...ship };
    return {
      ...ship,
      targetIslandId: assignment.islandId,
      path: assignment.path,
      pathIndex: 0,
      status: 'en-route' as const,
    };
  });

  const updatedIslands = islands.map((isl) => {
    const scored_isl = scored.find((s) => s.id === isl.id);
    return {
      ...isl,
      urgencyIndex: scored_isl ? scored_isl.urgencyIndex : calculateUrgencyIndex(isl, storms),
    };
  });

  logs.push({
    timestamp: ts(),
    message: `[DISPATCH PLAN COMPLETE] ${assignments.length} optimal routes computed. ${assignments.reduce((s, a) => s + a.passengersToLoad, 0)} souls scheduled for extraction.`,
    type: 'success',
  });

  return { assignments, updatedShips, updatedIslands, logs };
}

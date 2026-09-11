import type { Island, Ship, Storm, LogEntry } from '../types';
import { runAStar, pathDistance } from './astar';
import { calculateUrgencyIndex } from './urgency';

function timestamp(): string {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

export interface SimulationStepResult {
  updatedShips: Ship[];
  updatedIslands: Island[];
  updatedStorms: Storm[];
  logs: LogEntry[];
  isMissionComplete: boolean;
}

/**
 * Checks if a point is within the danger buffer of any storm.
 */
export function isPointInStormZone(
  point: { x: number; y: number },
  storms: Storm[],
  buffer = 15
): boolean {
  return storms.some(
    (s) => Math.hypot(point.x - s.x, point.y - s.y) <= s.radius + buffer
  );
}

/**
 * Returns the specific storm engulfing a point, or null.
 */
export function getEngulfingStorm(
  point: { x: number; y: number },
  storms: Storm[],
  buffer = 15
): Storm | null {
  return (
    storms.find(
      (s) => Math.hypot(point.x - s.x, point.y - s.y) <= s.radius + buffer
    ) || null
  );
}

/**
 * Predicts storm positions over a future time horizon (t = 2 to 16 seconds)
 * and finds the optimal safe haven waypoint near the target focus that will
 * remain clear of moving danger corridors.
 */
export function findPredictiveSafeHaven(
  shipPos: { x: number; y: number },
  focusPoint: { x: number; y: number },
  storms: Storm[]
): { x: number; y: number } {
  const candidateRadii = [60, 90, 120, 160, 200];
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const timeHorizons = [0, 3, 6, 9, 12, 16];

  let bestPoint: { x: number; y: number } | null = null;
  let bestScore = -Infinity;

  for (const r of candidateRadii) {
    for (const deg of angles) {
      const rad = (deg * Math.PI) / 180;
      const px = Math.round(focusPoint.x + Math.cos(rad) * r);
      const py = Math.round(focusPoint.y + Math.sin(rad) * r);

      // Boundary safety
      if (px < 50 || px > 750 || py < 50 || py > 550) continue;

      let minClearance = Infinity;
      let isNeverEngulfed = true;

      for (const t of timeHorizons) {
        for (const s of storms) {
          const vx = s.vx ?? 0;
          const vy = s.vy ?? 0;
          let projX = s.x + vx * 0.4 * t;
          let projY = s.y + vy * 0.4 * t;

          // Chart boundary bounce reflection
          if (projX < 110) projX = 110 + (110 - projX);
          if (projX > 690) projX = 690 - (projX - 690);
          if (projY < 100) projY = 100 + (100 - projY);
          if (projY > 500) projY = 500 - (projY - 500);

          const d = Math.hypot(px - projX, py - projY);
          const clearance = d - (s.radius + 25);
          if (clearance < minClearance) minClearance = clearance;
          if (clearance <= 0) isNeverEngulfed = false;
        }
      }

      if (!isNeverEngulfed) continue;

      const distToShip = Math.hypot(px - shipPos.x, py - shipPos.y);
      const distToFocus = Math.hypot(px - focusPoint.x, py - focusPoint.y);
      const score = minClearance * 2 - distToShip * 0.5 - distToFocus * 0.3;

      if (score > bestScore) {
        bestScore = score;
        bestPoint = { x: px, y: py };
      }
    }
  }

  return bestPoint || {
    x: Math.max(50, Math.min(750, shipPos.x)),
    y: Math.max(50, Math.min(550, shipPos.y)),
  };
}

/**
 * Simulates one tick:
 * - Updates storm positions if autoRoam is active.
 * - Handles ship movement, obstacle checking, holding patterns when trapped or blocked,
 *   embarkation/disembarkation, and mission completion.
 */
export function stepSimulation(
  ships: Ship[],
  islands: Island[],
  storms: Storm[],
  speedMultiplier: number = 1,
  autoRoamStorms: boolean = true
): SimulationStepResult {
  const logs: LogEntry[] = [];
  const nextIslands = islands.map((isl) => ({ ...isl }));
  const nextShips = ships.map((s) => ({ ...s, path: [...s.path] }));

  // ─── 0. Storm Auto-Roam Drift (Natural Atmospheric Wandering) ───
  const nextStorms: Storm[] = storms.map((storm) => {
    if (!autoRoamStorms) return { ...storm };

    let vx = storm.vx ?? (Math.random() > 0.5 ? 0.4 : -0.4);
    let vy = storm.vy ?? (Math.random() > 0.5 ? 0.3 : -0.3);

    // Occasional gentle organic drift change (~2% chance per tick)
    if (Math.random() < 0.02) {
      vx += (Math.random() - 0.5) * 0.15;
      vy += (Math.random() - 0.5) * 0.15;
      vx = Math.max(-0.6, Math.min(0.6, vx));
      vy = Math.max(-0.5, Math.min(0.5, vy));
    }

    const driftFactor = 0.4 * speedMultiplier;
    let newX = storm.x + vx * driftFactor;
    let newY = storm.y + vy * driftFactor;

    // Boundary containment within nautical chart (100-700 in X, 100-500 in Y)
    if (newX < 110) {
      newX = 110;
      vx = Math.abs(vx);
    } else if (newX > 690) {
      newX = 690;
      vx = -Math.abs(vx);
    }

    if (newY < 100) {
      newY = 100;
      vy = Math.abs(vy);
    } else if (newY > 500) {
      newY = 500;
      vy = -Math.abs(vy);
    }

    return {
      ...storm,
      x: Math.round(newX * 10) / 10,
      y: Math.round(newY * 10) / 10,
      vx,
      vy,
    };
  });

  // ─── Fleet Movement & Triage Lifecycle ───
  for (const ship of nextShips) {
    const moveDist = ship.speed * speedMultiplier;

    // ─── Case A: Ship is HOLDING (Sheltering from storm or waiting for corridor) ───
    if (ship.status === 'holding') {
      // 1. Dynamic Hazard Evasion while in Holding Status
      // If any storm drifts or is placed within danger perimeter (radius + 45px), maneuver away actively!
      const encroachingStorms = nextStorms.filter(
        (s) => Math.hypot(ship.x - s.x, ship.y - s.y) <= s.radius + 45
      );

      if (encroachingStorms.length > 0) {
        let pushX = 0;
        let pushY = 0;
        for (const s of encroachingStorms) {
          const d = Math.hypot(ship.x - s.x, ship.y - s.y) || 1;
          const force = Math.max(0.6, (s.radius + 50 - d) / (s.radius + 50));
          pushX += ((ship.x - s.x) / d) * force;
          pushY += ((ship.y - s.y) / d) * force;
          if (s.vx || s.vy) {
            pushX += (s.vx ?? 0) * 0.4;
            pushY += (s.vy ?? 0) * 0.4;
          }
        }
        const pushMag = Math.hypot(pushX, pushY) || 1;
        const evadeDist = ship.speed * speedMultiplier * 1.1;
        const newX = Math.max(50, Math.min(750, ship.x + (pushX / pushMag) * evadeDist));
        const newY = Math.max(50, Math.min(550, ship.y + (pushY / pushMag) * evadeDist));
        ship.x = Math.round(newX * 10) / 10;
        ship.y = Math.round(newY * 10) / 10;

        if (Math.random() < 0.05) {
          logs.push({
            timestamp: timestamp(),
            message: `⚡ [TACTICAL EVASION] ${ship.name} heaved-to maneuver: steered clear of encroaching ${encroachingStorms[0].name} to open waters (${Math.round(ship.x)}, ${Math.round(ship.y)}).`,
            type: 'warning',
          });
        }
      }

      const currentEngulfing = getEngulfingStorm({ x: ship.x, y: ship.y }, nextStorms);
      const targetIsland = nextIslands.find((i) => i.id === ship.targetIslandId);
      const islandEngulfing = targetIsland
        ? getEngulfingStorm({ x: targetIsland.x, y: targetIsland.y }, nextStorms)
        : null;

      // 2. Opportunistic retasking if target island is fully engulfed
      if (targetIsland && islandEngulfing) {
        const availableCap = ship.capacity - ship.load;
        if (availableCap > 0) {
          const alternativeSafeIslands = nextIslands
            .filter((i) => i.id !== targetIsland.id && (i.survivors - i.rescued) > 0)
            .filter((i) => !getEngulfingStorm({ x: i.x, y: i.y }, nextStorms, 15))
            .map((i) => ({
              ...i,
              urgency: calculateUrgencyIndex(i, nextStorms),
              dist: Math.hypot(ship.x - i.x, ship.y - i.y),
            }))
            .sort((a, b) => b.urgency - a.urgency || a.dist - b.dist);

          if (alternativeSafeIslands.length > 0) {
            const bestAlt = alternativeSafeIslands[0];
            const altPath = runAStar(
              { x: ship.x, y: ship.y },
              { x: bestAlt.x, y: bestAlt.y },
              nextStorms
            );
            if (altPath.length > 1) {
              ship.targetIslandId = bestAlt.id;
              ship.path = altPath;
              ship.pathIndex = 1;
              ship.status = 'en-route';
              logs.push({
                timestamp: timestamp(),
                message: `🚨 [ENGULFED DIVERT] ${targetIsland.name} is besieged by ${islandEngulfing.name}! ${ship.name} broke holding to rescue ${bestAlt.survivors - bestAlt.rescued} survivors at safe atoll ${bestAlt.name}!`,
                type: 'warning',
              });
              continue;
            }
          } else {
            // No safe islands available: steer towards predictive safe haven outside the storm's moving path!
            const safeHaven = findPredictiveSafeHaven(
              { x: ship.x, y: ship.y },
              { x: targetIsland.x, y: targetIsland.y },
              nextStorms
            );
            const distToHaven = Math.hypot(ship.x - safeHaven.x, ship.y - safeHaven.y);
            if (distToHaven > 18) {
              const dx = safeHaven.x - ship.x;
              const dy = safeHaven.y - ship.y;
              const dh = Math.hypot(dx, dy) || 1;
              ship.x = Math.round((ship.x + (dx / dh) * moveDist) * 10) / 10;
              ship.y = Math.round((ship.y + (dy / dh) * moveDist) * 10) / 10;
            }
          }
        }
      }

      // Check if both ship's immediate position and destination are clear
      if (!currentEngulfing && !islandEngulfing) {
        // CORRIDOR CLEAR: Resume voyage!
        if (ship.load > 0 || (targetIsland && targetIsland.survivors - targetIsland.rescued <= 0)) {
          // Return to home harbor
          const returnPath = runAStar(
            { x: ship.x, y: ship.y },
            { x: ship.startX, y: ship.startY },
            nextStorms
          );
          ship.path = returnPath;
          ship.pathIndex = 1;
          ship.status = 'returning';

          logs.push({
            timestamp: timestamp(),
            message: `🌤️ [ALL CLEAR] Storm eye cleared! ${ship.name} weighed anchor with ${ship.load} souls and resumed return to port!`,
            type: 'success',
          });
        } else if (targetIsland && targetIsland.survivors - targetIsland.rescued > 0) {
          // If ship was at the island: embark castaways now!
          const distToIsland = Math.hypot(ship.x - targetIsland.x, ship.y - targetIsland.y);
          if (distToIsland <= 25) {
            const remaining = targetIsland.survivors - targetIsland.rescued;
            const availableCap = ship.capacity - ship.load;
            const take = Math.min(remaining, availableCap);

            targetIsland.rescued += take;
            ship.load += take;

            const returnPath = runAStar(
              { x: ship.x, y: ship.y },
              { x: ship.startX, y: ship.startY },
              nextStorms
            );
            ship.path = returnPath;
            ship.pathIndex = 1;
            ship.status = 'returning';

            logs.push({
              timestamp: timestamp(),
              message: `⚓ [STORM PASSED] ${ship.name} safely embarked ${take} castaways from ${targetIsland.name} and set sail for base!`,
              type: 'success',
            });
          } else {
            // Resume en-route navigation to island
            const resumePath = runAStar(
              { x: ship.x, y: ship.y },
              { x: targetIsland.x, y: targetIsland.y },
              nextStorms
            );
            ship.path = resumePath;
            ship.pathIndex = 1;
            ship.status = 'en-route';

            logs.push({
              timestamp: timestamp(),
              message: `🌤️ [SHELTER LIFTED] Gale subsided at ${targetIsland.name}. ${ship.name} resumed rescue approach.`,
              type: 'info',
            });
          }
        } else {
          ship.status = 'idle';
        }
      }
      // Still trapped in or blocked by storm: keep holding position safely!
      continue;
    }

    // ─── Case B: Ship is EN-ROUTE to Island ───
    if (ship.status === 'en-route') {
      if (!ship.path || ship.path.length === 0) {
        ship.status = 'idle';
        continue;
      }

      const targetIsland = nextIslands.find((i) => i.id === ship.targetIslandId);

      // ─── VOYAGE CONSTRAINT: Never visit an already liberated / safe atoll! ───
      const remainingOnTarget = targetIsland ? targetIsland.survivors - targetIsland.rescued : 0;
      if (!targetIsland || remainingOnTarget <= 0) {
        // Target atoll is already safe (0 stranded)! Immediately divert cutter to next needy atoll or return to port!
        const availableCap = ship.capacity - ship.load;
        const otherUnevacuated = nextIslands
          .filter((i) => (i.survivors - i.rescued) > 0)
          .map((i) => ({
            ...i,
            urgency: calculateUrgencyIndex(i, nextStorms),
            dist: Math.hypot(ship.x - i.x, ship.y - i.y),
          }))
          .sort((a, b) => b.urgency - a.urgency || a.dist - b.dist);

        if (availableCap > 0 && otherUnevacuated.length > 0) {
          const nextTarget = otherUnevacuated[0];
          const newPath = runAStar(
            { x: ship.x, y: ship.y },
            { x: nextTarget.x, y: nextTarget.y },
            nextStorms
          );
          ship.targetIslandId = nextTarget.id;
          ship.path = newPath;
          ship.pathIndex = 1;
          ship.status = 'en-route';
          logs.push({
            timestamp: timestamp(),
            message: `[DYNAMIC RE-ROUTE] ${targetIsland?.name || 'Previous atoll'} is already safe! ${ship.name} diverted course to ${nextTarget.name} (${nextTarget.survivors - nextTarget.rescued} castaways).`,
            type: 'warning',
          });
          continue;
        } else {
          // No more atolls need rescue or vessel holds full capacity: return to home base!
          const returnPath = runAStar(
            { x: ship.x, y: ship.y },
            { x: ship.startX, y: ship.startY },
            nextStorms
          );
          ship.path = returnPath;
          ship.pathIndex = 1;
          ship.status = 'returning';
          ship.targetIslandId = null;
          logs.push({
            timestamp: timestamp(),
            message: `[MISSION UPDATE] ${targetIsland?.name || 'Target'} is liberated. ${ship.name} returning to home anchorage with ${ship.load} souls aboard.`,
            type: ship.load > 0 ? 'success' : 'info',
          });
          continue;
        }
      }

      // Check if target atoll is currently engulfed by a storm vortex
      if (targetIsland) {
        const islandStorm = getEngulfingStorm(
          { x: targetIsland.x, y: targetIsland.y },
          nextStorms,
          20
        );
        if (islandStorm) {
          const availableCap = ship.capacity - ship.load;
          // 1. Check if other unevacuated islands are safe to rescue!
          const alternativeSafeIslands = nextIslands
            .filter((i) => i.id !== targetIsland.id && (i.survivors - i.rescued) > 0)
            .filter((i) => !getEngulfingStorm({ x: i.x, y: i.y }, nextStorms, 15))
            .map((i) => ({
              ...i,
              urgency: calculateUrgencyIndex(i, nextStorms),
              dist: Math.hypot(ship.x - i.x, ship.y - i.y),
            }))
            .sort((a, b) => b.urgency - a.urgency || a.dist - b.dist);

          if (availableCap > 0 && alternativeSafeIslands.length > 0) {
            const nextTarget = alternativeSafeIslands[0];
            const newPath = runAStar(
              { x: ship.x, y: ship.y },
              { x: nextTarget.x, y: nextTarget.y },
              nextStorms
            );
            if (newPath.length > 1) {
              ship.targetIslandId = nextTarget.id;
              ship.path = newPath;
              ship.pathIndex = 1;
              ship.status = 'en-route';
              logs.push({
                timestamp: timestamp(),
                message: `⚡ [DYNAMIC RETASKING] Destination ${targetIsland.name} is besieged by ${islandStorm.name}! ${ship.name} re-routed to rescue ${nextTarget.survivors - nextTarget.rescued} castaways at safe atoll ${nextTarget.name}!`,
                type: 'warning',
              });
              continue;
            }
          }

          // 2. If no other safe islands exist, navigate to predictive safe haven!
          const distToStorm = Math.hypot(ship.x - islandStorm.x, ship.y - islandStorm.y);
          if (distToStorm <= islandStorm.radius + 40) {
            const safeHaven = findPredictiveSafeHaven(
              { x: ship.x, y: ship.y },
              { x: targetIsland.x, y: targetIsland.y },
              nextStorms
            );
            ship.status = 'holding';
            const havenPath = runAStar(
              { x: ship.x, y: ship.y },
              { x: safeHaven.x, y: safeHaven.y },
              nextStorms
            );
            if (havenPath.length > 1) {
              ship.path = havenPath;
              ship.pathIndex = 1;
            }
            logs.push({
              timestamp: timestamp(),
              message: `🧭 [PREDICTIVE HAVEN] All reachable atolls engulfed! ${ship.name} navigating to safe haven waypoint (${Math.round(safeHaven.x)}, ${Math.round(safeHaven.y)}) clear of ${islandStorm.name}'s path.`,
              type: 'warning',
            });
            continue;
          }
        }
      }

      const targetWp = ship.path[ship.pathIndex];
      if (!targetWp) {
        ship.status = 'idle';
        continue;
      }

      // Check if immediate next waypoint has drifted into a storm
      const wpStorm = getEngulfingStorm(targetWp, nextStorms);
      if (wpStorm) {
        // Attempt dynamic A* bypass around newly positioned storm
        const destination = targetIsland || { x: ship.startX, y: ship.startY };
        const bypass = runAStar(
          { x: ship.x, y: ship.y },
          { x: destination.x, y: destination.y },
          nextStorms
        );

        if (bypass.length > 1 && !isPointInStormZone(bypass[1], nextStorms)) {
          ship.path = bypass;
          ship.pathIndex = 1;
          logs.push({
            timestamp: timestamp(),
            message: `[HAZARD AVOIDANCE] ${ship.name} plotted evasive bypass around roaming ${wpStorm.name}.`,
            type: 'info',
          });
        } else {
          // Completely obstructed: hold position outside storm boundary!
          ship.status = 'holding';
          logs.push({
            timestamp: timestamp(),
            message: `[HAZARD HOLD] ${ship.name} heaved to — passage blocked by ${wpStorm.name}. Awaiting clear water.`,
            type: 'warning',
          });
          continue;
        }
      }

      const dx = targetWp.x - ship.x;
      const dy = targetWp.y - ship.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= moveDist) {
        // Snap to current waypoint
        ship.x = targetWp.x;
        ship.y = targetWp.y;
        ship.pathIndex++;

        // Reached target destination island!
        if (ship.pathIndex >= ship.path.length) {
          if (targetIsland) {
            // Check if island is CURRENTLY inside a storm danger zone!
            const currentIslandStorm = getEngulfingStorm(
              { x: targetIsland.x, y: targetIsland.y },
              nextStorms
            );

            if (currentIslandStorm) {
              // Can make harbor shelter, but MUST WAIT to depart or embark!
              ship.status = 'holding';
              logs.push({
                timestamp: timestamp(),
                message: `[STORM OVER ATOLL] ${ship.name} reached ${targetIsland.name}, but ${currentIslandStorm.name} is overhead! Heaved-to until gale passes.`,
                type: 'warning',
              });
              continue;
            }

            // Safe to embark castaways!
            const remaining = targetIsland.survivors - targetIsland.rescued;
            const availableCap = ship.capacity - ship.load;
            const take = Math.min(remaining, availableCap);

            targetIsland.rescued += take;
            ship.load += take;

            const islandNowCleared = (targetIsland.survivors - targetIsland.rescued) <= 0;
            if (islandNowCleared) {
              logs.push({
                timestamp: timestamp(),
                message: `[LIBERATED] ${targetIsland.name} 100% evacuated! All pirate souls secured.`,
                type: 'success',
              });

              // Instantly alert and divert any other ships currently heading toward this now-cleared atoll!
              for (const otherShip of nextShips) {
                if (
                  otherShip.id !== ship.id &&
                  otherShip.targetIslandId === targetIsland.id &&
                  otherShip.status === 'en-route'
                ) {
                  const otherCap = otherShip.capacity - otherShip.load;
                  const needyAtolls = nextIslands
                    .filter((i) => i.id !== targetIsland.id && (i.survivors - i.rescued) > 0)
                    .map((i) => ({ ...i, urgency: calculateUrgencyIndex(i, nextStorms) }))
                    .sort((a, b) => b.urgency - a.urgency);

                  if (otherCap > 0 && needyAtolls.length > 0) {
                    const divertTarget = needyAtolls[0];
                    otherShip.targetIslandId = divertTarget.id;
                    otherShip.path = runAStar(
                      { x: otherShip.x, y: otherShip.y },
                      { x: divertTarget.x, y: divertTarget.y },
                      nextStorms
                    );
                    otherShip.pathIndex = 1;
                    logs.push({
                      timestamp: timestamp(),
                      message: `[DISPATCH DIVERT] ${targetIsland.name} fully cleared! ${otherShip.name} immediately diverted to ${divertTarget.name}.`,
                      type: 'warning',
                    });
                  } else {
                    otherShip.targetIslandId = null;
                    otherShip.path = runAStar(
                      { x: otherShip.x, y: otherShip.y },
                      { x: otherShip.startX, y: otherShip.startY },
                      nextStorms
                    );
                    otherShip.pathIndex = 1;
                    otherShip.status = 'returning';
                    logs.push({
                      timestamp: timestamp(),
                      message: `[MISSION UPDATE] ${targetIsland.name} cleared. ${otherShip.name} stood down and returned to port.`,
                      type: 'info',
                    });
                  }
                }
              }
            }

            if (take > 0) {
              logs.push({
                timestamp: timestamp(),
                message: `${ship.name} made landfall at ${targetIsland.name}. Loaded ${take} castaways (${targetIsland.survivors - targetIsland.rescued} remain).`,
                type: 'info',
              });
            }

            const remainingCap = ship.capacity - ship.load;

            // If cutter still has surplus capacity and another atoll is in need:
            const otherUnevacuated = nextIslands
              .filter((i) => i.id !== targetIsland.id && (i.survivors - i.rescued) > 0)
              .map((i) => ({
                ...i,
                urgency: calculateUrgencyIndex(i, nextStorms),
              }))
              .sort((a, b) => b.urgency - a.urgency);

            if (remainingCap >= 5 && otherUnevacuated.length > 0) {
              const nextTarget = otherUnevacuated[0];
              const nextRoute = runAStar(
                { x: ship.x, y: ship.y },
                { x: nextTarget.x, y: nextTarget.y },
                nextStorms
              );

              ship.targetIslandId = nextTarget.id;
              ship.path = nextRoute;
              ship.pathIndex = 1;
              ship.status = 'en-route';

              logs.push({
                timestamp: timestamp(),
                message: `${ship.name} has ${remainingCap} berths free! Continuing rescue course to ${nextTarget.name}.`,
                type: 'warning',
              });
            } else {
              // Return to designated home harbor
              const returnPath = runAStar(
                { x: ship.x, y: ship.y },
                { x: ship.startX, y: ship.startY },
                nextStorms
              );

              ship.path = returnPath;
              ship.pathIndex = 1;
              ship.status = 'returning';
              ship.targetIslandId = null;

              logs.push({
                timestamp: timestamp(),
                message: `${ship.name} ${remainingCap === 0 ? '[HOLD FULL]' : '[LEG COMPLETE]'} — returning to home harbor with ${ship.load} souls.`,
                type: 'info',
              });
            }
          } else {
            ship.status = 'idle';
          }
        }
      } else {
        ship.x += (dx / dist) * moveDist;
        ship.y += (dy / dist) * moveDist;
      }
    }

    // ─── Case C: Ship is RETURNING to Port ───
    else if (ship.status === 'returning') {
      if (!ship.path || ship.path.length === 0) {
        ship.x = ship.startX;
        ship.y = ship.startY;
        ship.load = 0;
        ship.status = 'idle';
        continue;
      }

      const targetWp = ship.path[ship.pathIndex];
      if (!targetWp) {
        ship.status = 'idle';
        continue;
      }

      // Check if return path is obstructed by a roaming storm
      const wpStorm = getEngulfingStorm(targetWp, nextStorms);
      if (wpStorm) {
        const bypass = runAStar(
          { x: ship.x, y: ship.y },
          { x: ship.startX, y: ship.startY },
          nextStorms
        );
        if (bypass.length > 1 && !isPointInStormZone(bypass[1], nextStorms)) {
          ship.path = bypass;
          ship.pathIndex = 1;
          logs.push({
            timestamp: timestamp(),
            message: `⚡ ${ship.name} evasive detour: avoiding roaming ${wpStorm.name} on return leg.`,
            type: 'info',
          });
        } else {
          // Obstruction: heave to outside danger ring!
          ship.status = 'holding';
          logs.push({
            timestamp: timestamp(),
            message: `⚠️ [HOLDING OUTSIDE PORT] ${ship.name} heaved-to with ${ship.load} souls — awaiting ${wpStorm.name} to clear shipping lane.`,
            type: 'warning',
          });
          continue;
        }
      }

      const dx = targetWp.x - ship.x;
      const dy = targetWp.y - ship.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= moveDist) {
        ship.x = targetWp.x;
        ship.y = targetWp.y;
        ship.pathIndex++;

        // Reached home staging port!
        if (ship.pathIndex >= ship.path.length) {
          const offloaded = ship.load;
          ship.load = 0;
          ship.targetIslandId = null;
          ship.path = [];
          ship.pathIndex = 0;

          logs.push({
            timestamp: timestamp(),
            message: `🏰 ${ship.name} docked safely at staging port! Disembarked ${offloaded} rescued souls to hospital.`,
            type: 'success',
          });

          // Check if any island still needs rescue
          const unserviced = nextIslands
            .filter((isl) => isl.survivors - isl.rescued > 0)
            .map((isl) => ({
              ...isl,
              urgency: calculateUrgencyIndex(isl, nextStorms),
            }))
            .sort((a, b) => b.urgency - a.urgency);

          if (unserviced.length > 0) {
            let bestTarget: (typeof unserviced)[0] | null = null;
            let bestCost = Infinity;
            let bestRoute: { x: number; y: number }[] = [];

            for (const isl of unserviced) {
              const route = runAStar(
                { x: ship.x, y: ship.y },
                { x: isl.x, y: isl.y },
                nextStorms
              );
              const rDist = pathDistance(route);
              const cost = rDist / (ship.capacity * ship.speed);
              if (cost < bestCost) {
                bestCost = cost;
                bestTarget = isl;
                bestRoute = route;
              }
            }

            if (bestTarget && bestRoute.length > 0) {
              ship.targetIslandId = bestTarget.id;
              ship.path = bestRoute;
              ship.pathIndex = 0;
              ship.status = 'en-route';

              logs.push({
                timestamp: timestamp(),
                message: `⚡ ${ship.name} redeployed to ${bestTarget.name} (${bestTarget.survivors - bestTarget.rescued} souls remaining).`,
                type: 'warning',
              });
            } else {
              ship.status = 'idle';
            }
          } else {
            ship.status = 'idle';
          }
        }
      } else {
        ship.x += (dx / dist) * moveDist;
        ship.y += (dy / dist) * moveDist;
      }
    }
  }

  // Recalculate dynamic urgency index for all islands based on latest storm positions
  const updatedIslands = nextIslands.map((isl) => ({
    ...isl,
    urgencyIndex: calculateUrgencyIndex(isl, nextStorms),
  }));

  // Check mission complete condition
  const allEvacuated = updatedIslands.every((isl) => isl.survivors - isl.rescued <= 0);
  const allShipsDocked = nextShips.every(
    (s) => s.status === 'idle' || (s.load === 0 && s.status !== 'en-route')
  );
  const isMissionComplete = allEvacuated && allShipsDocked;

  return {
    updatedShips: nextShips,
    updatedIslands,
    updatedStorms: nextStorms,
    logs,
    isMissionComplete,
  };
}

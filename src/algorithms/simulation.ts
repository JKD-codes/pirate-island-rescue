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
  logs: LogEntry[];
  isMissionComplete: boolean;
}

/**
 * Executes a single simulation tick.
 * Moves ships along calculated A* paths, handles passenger loading at atolls,
 * charts return paths to staging docks, disembarks survivors, and auto-redispatches.
 */
export function stepSimulation(
  ships: Ship[],
  islands: Island[],
  storms: Storm[],
  speedMultiplier: number = 1
): SimulationStepResult {
  const logs: LogEntry[] = [];
  const nextIslands = islands.map((isl) => ({ ...isl }));
  const nextShips = ships.map((s) => ({ ...s, path: [...s.path] }));

  for (const ship of nextShips) {
    const moveDist = ship.speed * speedMultiplier;

    // ─── 1. Ship En-Route to Island ───
    if (ship.status === 'en-route') {
      if (!ship.path || ship.path.length === 0) {
        ship.status = 'idle';
        continue;
      }

      const targetWp = ship.path[ship.pathIndex];
      if (!targetWp) {
        ship.status = 'idle';
        continue;
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
          const island = nextIslands.find((i) => i.id === ship.targetIslandId);
          if (island) {
            const remaining = island.survivors - island.rescued;
            const availableCap = ship.capacity - ship.load;
            const take = Math.min(remaining, availableCap);

            island.rescued += take;
            ship.load += take;

            const islandNowCleared = island.survivors - island.rescued <= 0;

            if (islandNowCleared) {
              logs.push({
                timestamp: timestamp(),
                message: `🔔 [EVACUATED] ${island.name} 100% evacuated! All pirate souls secured.`,
                type: 'success',
              });
            }

            logs.push({
              timestamp: timestamp(),
              message: `⚓ ${ship.name} made landfall at ${island.name}. Loaded ${take} castaways (${island.survivors - island.rescued} remain).`,
              type: 'info',
            });

            const remainingCap = ship.capacity - ship.load;

            // If cutter still has capacity and more targets exist: route to next target
            const otherUnevacuated = nextIslands
              .filter((i) => i.id !== island.id && i.survivors - i.rescued > 0)
              .map((i) => ({
                ...i,
                urgency: calculateUrgencyIndex(i, storms),
              }))
              .sort((a, b) => b.urgency - a.urgency);

            if (remainingCap >= 10 && otherUnevacuated.length > 0) {
              const nextTarget = otherUnevacuated[0];
              const nextRoute = runAStar(
                { x: ship.x, y: ship.y },
                { x: nextTarget.x, y: nextTarget.y },
                storms
              );

              ship.targetIslandId = nextTarget.id;
              ship.path = nextRoute;
              ship.pathIndex = 1;
              ship.status = 'en-route';

              logs.push({
                timestamp: timestamp(),
                message: `➡ ${ship.name} has ${remainingCap} berths free! Continuing rescue course to ${nextTarget.name}.`,
                type: 'warning',
              });
            } else {
              // Full or no nearby targets: return to designated home harbor
              const returnPath = runAStar(
                { x: ship.x, y: ship.y },
                { x: ship.startX, y: ship.startY },
                storms
              );

              ship.path = returnPath;
              ship.pathIndex = 1;
              ship.status = 'returning';

              logs.push({
                timestamp: timestamp(),
                message: `🔄 ${ship.name} ${remainingCap === 0 ? '[CAPACITY FULL]' : '[LEG COMPLETE]'} — returning to home harbor with ${ship.load} souls.`,
                type: 'info',
              });
            }
          } else {
            ship.status = 'idle';
          }
        }
      } else {
        // Interpolate along vector
        ship.x += (dx / dist) * moveDist;
        ship.y += (dy / dist) * moveDist;
      }
    }

    // ─── 2. Ship Returning to Base ───
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
              urgency: calculateUrgencyIndex(isl, storms),
            }))
            .sort((a, b) => b.urgency - a.urgency);

          if (unserviced.length > 0) {
            // Greedy match next best target
            let bestTarget: (typeof unserviced)[0] | null = null;
            let bestCost = Infinity;
            let bestRoute: { x: number; y: number }[] = [];

            for (const isl of unserviced) {
              const route = runAStar(
                { x: ship.x, y: ship.y },
                { x: isl.x, y: isl.y },
                storms
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

  // Recalculate dynamic urgency index for all islands
  const updatedIslands = nextIslands.map((isl) => ({
    ...isl,
    urgencyIndex: calculateUrgencyIndex(isl, storms),
  }));

  // Check mission complete condition
  const allEvacuated = updatedIslands.every((isl) => isl.survivors - isl.rescued <= 0);
  const allShipsDocked = nextShips.every((s) => s.status === 'idle' || (s.load === 0 && s.status !== 'en-route'));
  const isMissionComplete = allEvacuated && allShipsDocked;

  if (isMissionComplete) {
    logs.push({
      timestamp: timestamp(),
      message: `🎉 ALL SECTORS SECURED! 100% of stranded souls evacuated across the archipelago!`,
      type: 'success',
    });
  }

  return {
    updatedShips: nextShips,
    updatedIslands,
    logs,
    isMissionComplete,
  };
}

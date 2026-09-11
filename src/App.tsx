import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import RadarCanvas from './components/RadarCanvas';
import Sidebar from './components/Sidebar';
import {
  INITIAL_ISLANDS,
  INITIAL_SHIPS,
  INITIAL_STORMS,
  INITIAL_LOGS,
} from './data/entities';
import type { Island, Ship, Storm, LogEntry } from './types';

import { solveDispatchPlan } from './algorithms/dispatch';
import { stepSimulation } from './algorithms/simulation';
import { calculateUrgencyIndex } from './algorithms/urgency';
import { runAStar } from './algorithms/astar';

function App() {
  const [islands, setIslands] = useState<Island[]>(() => {
    const raw = structuredClone(INITIAL_ISLANDS);
    return raw.map((isl) => ({
      ...isl,
      urgencyIndex: calculateUrgencyIndex(isl, INITIAL_STORMS),
    }));
  });

  const [ships, setShips] = useState<Ship[]>(
    () => structuredClone(INITIAL_SHIPS)
  );

  const [storms, setStorms] = useState<Storm[]>(
    () => structuredClone(INITIAL_STORMS)
  );

  const [logs, setLogs] = useState<LogEntry[]>([...INITIAL_LOGS]);
  const [isRunning, setIsRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Refs for current state inside animation interval
  const stateRef = useRef({ ships, islands, storms, speedMultiplier });
  useEffect(() => {
    stateRef.current = { ships, islands, storms, speedMultiplier };
  }, [ships, islands, storms, speedMultiplier]);

  // ─── Derived Telemetry ───
  const totalSurvivors = islands.reduce(
    (sum, isl) => sum + Math.max(0, isl.survivors - isl.rescued),
    0
  );
  const totalRescued = islands.reduce((sum, isl) => sum + isl.rescued, 0);
  const fleetCapacity = ships.reduce((sum, s) => sum + (s.capacity - s.load), 0);
  const activeHazards = storms.length;

  // ─── Log Helper ───
  const addLog = useCallback(
    (message: string, type: LogEntry['type'] = 'info') => {
      const now = new Date();
      const timestamp = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map((n) => String(n).padStart(2, '0'))
        .join(':');
      setLogs((prev) => [...prev, { timestamp, message, type }]);
    },
    []
  );

  // ─── Storm Drag Handler with Dynamic Urgency & Re-routing ───
  const handleStormDrag = useCallback(
    (stormId: string, x: number, y: number) => {
      setStorms((prevStorms) => {
        const nextStorms = prevStorms.map((s) =>
          s.id === stormId ? { ...s, x, y } : s
        );

        // Update live urgency scores based on new storm distance
        setIslands((prevIslands) =>
          prevIslands.map((isl) => ({
            ...isl,
            urgencyIndex: calculateUrgencyIndex(isl, nextStorms),
          }))
        );

        // Check if any active ship route intersects the moved storm
        setShips((prevShips) =>
          prevShips.map((ship) => {
            if (ship.status === 'idle' || ship.path.length <= 1) return ship;

            // Re-route on the fly around new storm positions!
            const target =
              ship.status === 'en-route'
                ? nextStorms && ship.targetIslandId
                  ? islands.find((i) => i.id === ship.targetIslandId)
                  : null
                : { x: ship.startX, y: ship.startY };

            if (target) {
              const newRoute = runAStar(
                { x: ship.x, y: ship.y },
                { x: target.x, y: target.y },
                nextStorms
              );
              return {
                ...ship,
                path: newRoute,
                pathIndex: 0,
              };
            }
            return ship;
          })
        );

        return nextStorms;
      });
    },
    [islands]
  );

  // ─── Solve Dispatch (Phase 2) ───
  const handleSolve = useCallback(() => {
    addLog('🧮 Dispatch solver initiated — computing A* routes…', 'warning');
    const result = solveDispatchPlan(islands, ships, storms);
    setShips(result.updatedShips);
    setIslands(result.updatedIslands);
    setLogs((prev) => [...prev, ...result.logs]);
  }, [islands, ships, storms, addLog]);

  // ─── Single Simulation Step (Manual Tick) ───
  const handleStep = useCallback(() => {
    const { ships: curShips, islands: curIslands, storms: curStorms, speedMultiplier: spd } =
      stateRef.current;

    // If no ship is moving, solve first
    const hasActiveRoutes = curShips.some((s) => s.path.length > 0 && s.status !== 'idle');
    if (!hasActiveRoutes) {
      handleSolve();
      return;
    }

    const stepRes = stepSimulation(curShips, curIslands, curStorms, spd);
    setShips(stepRes.updatedShips);
    setIslands(stepRes.updatedIslands);
    if (stepRes.logs.length > 0) {
      setLogs((prev) => [...prev, ...stepRes.logs]);
    }
    if (stepRes.isMissionComplete) {
      setIsRunning(false);
    }
  }, [handleSolve]);

  // ─── Simulation Toggle ───
  const handleToggleSimulation = () => {
    setIsRunning((prev) => {
      const next = !prev;
      if (next) {
        // If no active routes exist yet, solve automatically on start
        const hasActiveRoutes = ships.some((s) => s.path.length > 0 && s.status !== 'idle');
        if (!hasActiveRoutes) {
          handleSolve();
        }
        addLog('▶ Fleet underway — full speed ahead!', 'success');
      } else {
        addLog('⏸ Fleet holding position — simulation paused.', 'warning');
      }
      return next;
    });
  };

  // ─── Simulation Tick Loop ───
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      const {
        ships: curShips,
        islands: curIslands,
        storms: curStorms,
        speedMultiplier: spd,
      } = stateRef.current;

      const stepRes = stepSimulation(curShips, curIslands, curStorms, spd);
      setShips(stepRes.updatedShips);
      setIslands(stepRes.updatedIslands);

      if (stepRes.logs.length > 0) {
        setLogs((prev) => [...prev, ...stepRes.logs]);
      }

      if (stepRes.isMissionComplete) {
        setIsRunning(false);
      }
    }, 40); // 25 fps simulation tick

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  // ─── Reset Scenario ───
  const handleReset = () => {
    const freshIslands = structuredClone(INITIAL_ISLANDS).map((isl) => ({
      ...isl,
      urgencyIndex: calculateUrgencyIndex(isl, INITIAL_STORMS),
    }));
    setIslands(freshIslands);
    setShips(structuredClone(INITIAL_SHIPS));
    setStorms(structuredClone(INITIAL_STORMS));
    setLogs([...INITIAL_LOGS]);
    setIsRunning(false);
    addLog('♻ Scenario reset to initial state.', 'info');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070b14] text-slate-200 overflow-hidden select-none">
      <Header
        totalSurvivors={totalSurvivors}
        totalRescued={totalRescued}
        fleetCapacity={fleetCapacity}
        activeHazards={activeHazards}
      />
      <div className="flex-1 flex min-h-0">
        <RadarCanvas
          islands={islands}
          ships={ships}
          storms={storms}
          onStormDrag={handleStormDrag}
        />
        <Sidebar
          ships={ships}
          islands={islands}
          logs={logs}
          isRunning={isRunning}
          speedMultiplier={speedMultiplier}
          onSetSpeedMultiplier={setSpeedMultiplier}
          onStep={handleStep}
          onSolve={handleSolve}
          onToggleSimulation={handleToggleSimulation}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}

export default App;

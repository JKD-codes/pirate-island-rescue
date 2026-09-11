import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import RadarCanvas from './components/RadarCanvas';
import Sidebar from './components/Sidebar';
import {
  INITIAL_ISLANDS,
  INITIAL_SHIPS,
  INITIAL_STORMS,
  INITIAL_LOGS,
  SCENARIO_PRESETS,
} from './data/entities';
import type { Island, Ship, Storm, LogEntry } from './types';

import { solveDispatchPlan } from './algorithms/dispatch';
import { stepSimulation } from './algorithms/simulation';
import { calculateUrgencyIndex } from './algorithms/urgency';
import { runAStar } from './algorithms/astar';
import {
  playSonarPing,
  playRescueBell,
  playHazardAlert,
  playVictoryFanfare,
  setSoundMuted,
} from './utils/audio';

function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState('scenario-1');

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

  const [initialSurvivors, setInitialSurvivors] = useState<number>(() =>
    INITIAL_ISLANDS.reduce((sum, i) => sum + i.survivors, 0)
  );

  const [logs, setLogs] = useState<LogEntry[]>([...INITIAL_LOGS]);
  const [isRunning, setIsRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Track which islands have triggered evacuation bell sound
  const evacuatedSoundPlayedRef = useRef<Set<string>>(new Set());

  // Ref for current state inside animation interval
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
  const efficiencyScore =
    initialSurvivors > 0
      ? Math.min(100, Math.round((totalRescued / initialSurvivors) * 100))
      : 100;

  // ─── Sound Mute Toggle ───
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setSoundMuted(next);
      return next;
    });
  }, []);

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

  // ─── Scenario Switcher ───
  const handleSelectScenario = useCallback(
    (scenarioId: string) => {
      const preset = SCENARIO_PRESETS.find((p) => p.id === scenarioId);
      if (!preset) return;

      setSelectedScenarioId(scenarioId);
      setIsRunning(false);
      evacuatedSoundPlayedRef.current.clear();

      const freshIslands = structuredClone(preset.islands).map((isl) => ({
        ...isl,
        urgencyIndex: calculateUrgencyIndex(isl, preset.storms),
      }));

      setIslands(freshIslands);
      setShips(structuredClone(preset.ships));
      setStorms(structuredClone(preset.storms));
      setInitialSurvivors(
        freshIslands.reduce((sum, i) => sum + i.survivors, 0)
      );

      playSonarPing();
      addLog(`🚩 Switched to [${preset.name}] — ${preset.description}`, 'info');
      addLog(`📋 ${preset.islands.reduce((s, i) => s + i.survivors, 0)} souls awaiting extraction.`, 'warning');
    },
    [addLog]
  );

  // ─── Dynamic Storm Drag & Real-Time Rerouting ───
  const handleStormDrag = useCallback(
    (stormId: string, x: number, y: number) => {
      setStorms((prevStorms) => {
        const nextStorms = prevStorms.map((s) =>
          s.id === stormId ? { ...s, x, y } : s
        );

        // 1. Recalculate dynamic urgency scores with updated storm distance
        setIslands((prevIslands) =>
          prevIslands.map((isl) => ({
            ...isl,
            urgencyIndex: calculateUrgencyIndex(isl, nextStorms),
          }))
        );

        // 2. Real-time dynamic rerouting for all moving vessels around new storm center
        let reroutedAny = false;
        setShips((prevShips) =>
          prevShips.map((ship) => {
            if (ship.status === 'idle' || ship.path.length <= 1) return ship;
            reroutedAny = true;

            const target =
              ship.status === 'en-route' && ship.targetIslandId
                ? islands.find((i) => i.id === ship.targetIslandId)
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

        if (reroutedAny) {
          playHazardAlert();
        }

        return nextStorms;
      });
    },
    [islands]
  );

  // ─── Solve Dispatch (Phase 2) ───
  const handleSolve = useCallback(() => {
    playSonarPing();
    addLog('🧮 Dispatch solver initiated — computing optimal A* routes…', 'warning');
    const result = solveDispatchPlan(islands, ships, storms);
    setShips(result.updatedShips);
    setIslands(result.updatedIslands);
    setLogs((prev) => [...prev, ...result.logs]);
  }, [islands, ships, storms, addLog]);

  // ─── Single Simulation Step (Manual Tick) ───
  const handleStep = useCallback(() => {
    const { ships: curShips, islands: curIslands, storms: curStorms, speedMultiplier: spd } =
      stateRef.current;

    const hasActiveRoutes = curShips.some((s) => s.path.length > 0 && s.status !== 'idle');
    if (!hasActiveRoutes) {
      handleSolve();
      return;
    }

    const stepRes = stepSimulation(curShips, curIslands, curStorms, spd);
    setShips(stepRes.updatedShips);
    setIslands(stepRes.updatedIslands);

    // Audio feedback for newly evacuated islands
    stepRes.updatedIslands.forEach((isl) => {
      if (isl.survivors - isl.rescued <= 0 && !evacuatedSoundPlayedRef.current.has(isl.id)) {
        evacuatedSoundPlayedRef.current.add(isl.id);
        playRescueBell();
      }
    });

    if (stepRes.logs.length > 0) {
      setLogs((prev) => [...prev, ...stepRes.logs]);
    }
    if (stepRes.isMissionComplete) {
      setIsRunning(false);
      playVictoryFanfare();
    }
  }, [handleSolve]);

  // ─── Simulation Toggle ───
  const handleToggleSimulation = () => {
    setIsRunning((prev) => {
      const next = !prev;
      if (next) {
        const hasActiveRoutes = ships.some((s) => s.path.length > 0 && s.status !== 'idle');
        if (!hasActiveRoutes) {
          handleSolve();
        }
        playSonarPing();
        addLog('▶ Fleet underway — full speed ahead!', 'success');
      } else {
        addLog('⏸ Fleet holding position — simulation paused.', 'warning');
      }
      return next;
    });
  };

  // ─── Simulation Tick Loop (Smooth 40ms / 25 FPS) ───
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

      // Trigger audio bell chime on atoll clearance
      stepRes.updatedIslands.forEach((isl) => {
        if (isl.survivors - isl.rescued <= 0 && !evacuatedSoundPlayedRef.current.has(isl.id)) {
          evacuatedSoundPlayedRef.current.add(isl.id);
          playRescueBell();
        }
      });

      if (stepRes.logs.length > 0) {
        setLogs((prev) => [...prev, ...stepRes.logs]);
      }

      if (stepRes.isMissionComplete) {
        setIsRunning(false);
        playVictoryFanfare();
      }
    }, 40);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  // ─── Reset Scenario ───
  const handleReset = () => {
    handleSelectScenario(selectedScenarioId);
    addLog('♻ Scenario reset to initial positions.', 'info');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070b14] text-slate-200 overflow-hidden select-none">
      <Header
        totalSurvivors={totalSurvivors}
        totalRescued={totalRescued}
        fleetCapacity={fleetCapacity}
        activeHazards={activeHazards}
        efficiencyScore={efficiencyScore}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={handleSelectScenario}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
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

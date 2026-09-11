import { useState, useCallback } from 'react';
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

function App() {
  const [islands, setIslands] = useState<Island[]>(
    () => structuredClone(INITIAL_ISLANDS)
  );
  const [ships, setShips] = useState<Ship[]>(
    () => structuredClone(INITIAL_SHIPS)
  );
  const [storms, setStorms] = useState<Storm[]>(
    () => structuredClone(INITIAL_STORMS)
  );
  const [logs, setLogs] = useState<LogEntry[]>([...INITIAL_LOGS]);
  const [isRunning, setIsRunning] = useState(false);

  // ─── Derived Telemetry ───
  const totalSurvivors = islands.reduce(
    (sum, isl) => sum + (isl.survivors - isl.rescued),
    0
  );
  const totalRescued = islands.reduce((sum, isl) => sum + isl.rescued, 0);
  const fleetCapacity = ships.reduce((sum, s) => sum + (s.capacity - s.load), 0);
  const activeHazards = storms.length;

  // ─── Storm Drag Handler ───
  const handleStormDrag = useCallback(
    (stormId: string, x: number, y: number) => {
      setStorms((prev) =>
        prev.map((s) => (s.id === stormId ? { ...s, x, y } : s))
      );
    },
    []
  );

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

  // ─── Stubs for Phase 2 ───
  const handleSolve = () => {
    addLog('Dispatch solver initiated — computing optimal routes…', 'warning');
    addLog('⚡ Solver stub: Full A* + greedy dispatch coming in Phase 2.', 'info');
  };

  const handleToggleSimulation = () => {
    setIsRunning((prev) => {
      const next = !prev;
      addLog(
        next
          ? '▶ Simulation STARTED — engines at full throttle.'
          : '⏸ Simulation PAUSED — holding position.',
        next ? 'success' : 'warning'
      );
      return next;
    });
  };

  const handleReset = () => {
    setIslands(structuredClone(INITIAL_ISLANDS));
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
          onSolve={handleSolve}
          onToggleSimulation={handleToggleSimulation}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}

export default App;

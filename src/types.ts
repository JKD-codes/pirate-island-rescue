// ─── KrakenWatch Core Type Definitions ───

export type TriageLevel = 'Critical' | 'Urgent' | 'Stable';

export type ShipStatus = 'idle' | 'en-route' | 'loading' | 'returning' | 'holding';

export type IslandStatus = 'pending' | 'in-progress' | 'evacuated';

export interface Island {
  id: string;
  name: string;
  x: number;
  y: number;
  survivors: number;
  rescued: number;
  triage: TriageLevel;
  urgencyIndex: number;
  status: IslandStatus;
  image?: string;
}

export interface Ship {
  id: string;
  name: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  capacity: number;
  load: number;
  targetLoad?: number;
  speed: number;
  status: ShipStatus;
  targetIslandId: string | null;
  path: { x: number; y: number }[];
  pathIndex: number;
  image?: string;
}

export interface Storm {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  vx?: number;
  vy?: number;
  image?: string;
  type?: 'cyclone' | 'monster';
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'critical';
}

export interface SimulationState {
  islands: Island[];
  ships: Ship[];
  storms: Storm[];
  logs: LogEntry[];
  isRunning: boolean;
  tick: number;
  totalRescued: number;
}

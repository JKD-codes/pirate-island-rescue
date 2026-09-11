import type { Island, Ship, Storm, LogEntry } from '../types';

// ─── 5 Islands (Atolls) ───
export const INITIAL_ISLANDS: Island[] = [
  {
    id: 'isl-1',
    name: 'Skull Rock',
    x: 140,
    y: 150,
    survivors: 45,
    rescued: 0,
    triage: 'Critical',
    urgencyIndex: 0,
    status: 'pending',
  },
  {
    id: 'isl-2',
    name: 'Isla de Muerta',
    x: 260,
    y: 460,
    survivors: 28,
    rescued: 0,
    triage: 'Urgent',
    urgencyIndex: 0,
    status: 'pending',
  },
  {
    id: 'isl-3',
    name: "Siren's Cove",
    x: 500,
    y: 140,
    survivors: 18,
    rescued: 0,
    triage: 'Stable',
    urgencyIndex: 0,
    status: 'pending',
  },
  {
    id: 'isl-4',
    name: 'Kraken Shoals',
    x: 680,
    y: 440,
    survivors: 35,
    rescued: 0,
    triage: 'Critical',
    urgencyIndex: 0,
    status: 'pending',
  },
  {
    id: 'isl-5',
    name: 'Tortuga Shallows',
    x: 420,
    y: 340,
    survivors: 22,
    rescued: 0,
    triage: 'Urgent',
    urgencyIndex: 0,
    status: 'pending',
  },
];

// ─── 3 Rescue Cutters ───
export const INITIAL_SHIPS: Ship[] = [
  {
    id: 'ship-1',
    name: 'The Black Pearl',
    x: 60,
    y: 80,
    startX: 60,
    startY: 80,
    capacity: 60,
    load: 0,
    speed: 3.5,
    status: 'idle',
    targetIslandId: null,
    path: [],
    pathIndex: 0,
  },
  {
    id: 'ship-2',
    name: "Queen Anne's Revenge",
    x: 740,
    y: 80,
    startX: 740,
    startY: 80,
    capacity: 50,
    load: 0,
    speed: 3.0,
    status: 'idle',
    targetIslandId: null,
    path: [],
    pathIndex: 0,
  },
  {
    id: 'ship-3',
    name: 'The Flying Dutchman',
    x: 80,
    y: 520,
    startX: 80,
    startY: 520,
    capacity: 40,
    load: 0,
    speed: 4.5,
    status: 'idle',
    targetIslandId: null,
    path: [],
    pathIndex: 0,
  },
];

// ─── 2 Typhoon Storms ───
export const INITIAL_STORMS: Storm[] = [
  {
    id: 'storm-1',
    name: 'Cyclone Maelstrom',
    x: 300,
    y: 220,
    radius: 85,
  },
  {
    id: 'storm-2',
    name: 'Tempest Maw',
    x: 560,
    y: 320,
    radius: 75,
  },
];

// ─── Boot Log ───
export const INITIAL_LOGS: LogEntry[] = [
  {
    timestamp: '00:00:00',
    message: 'KRAKENWATCH v1.0 — System Online',
    type: 'info',
  },
  {
    timestamp: '00:00:01',
    message: 'Radar sweep complete. 5 atolls detected.',
    type: 'info',
  },
  {
    timestamp: '00:00:02',
    message: '2 Category-5 typhoons tracked in AO.',
    type: 'warning',
  },
  {
    timestamp: '00:00:03',
    message: '3 rescue cutters standing by. Awaiting dispatch.',
    type: 'success',
  },
  {
    timestamp: '00:00:04',
    message: '148 souls awaiting extraction. Godspeed.',
    type: 'critical',
  },
];

// ─── Triage Color Map ───
export const TRIAGE_COLORS = {
  Critical: { bg: '#ef4444', text: '#fca5a5', border: '#dc2626', glow: 'rgba(239,68,68,0.35)' },
  Urgent:   { bg: '#f59e0b', text: '#fcd34d', border: '#d97706', glow: 'rgba(245,158,11,0.3)' },
  Stable:   { bg: '#38bdf8', text: '#7dd3fc', border: '#0284c7', glow: 'rgba(56,189,248,0.25)' },
} as const;

// ─── Ship color palette ───
export const SHIP_COLORS = [
  '#22d3ee', // cyan
  '#a78bfa', // violet
  '#34d399', // emerald
];

// ─── Judge Scenario Presets ───
export interface ScenarioPreset {
  id: string;
  name: string;
  tag: string;
  badgeColor: string;
  description: string;
  islands: Island[];
  ships: Ship[];
  storms: Storm[];
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'scenario-1',
    name: 'Scenario 1: Default Archipelago',
    tag: 'Baseline',
    badgeColor: 'border-sky-500/40 text-sky-300 bg-sky-950/40',
    description: 'Baseline layout from BRAIN.md — 148 castaways, 2 Category-5 storms, 3 cutters.',
    islands: INITIAL_ISLANDS,
    ships: INITIAL_SHIPS,
    storms: INITIAL_STORMS,
  },
  {
    id: 'scenario-2',
    name: 'Scenario 2: Typhoon Maelstrom Direct Hit',
    tag: 'Hazard Drill',
    badgeColor: 'border-red-500/40 text-red-300 bg-red-950/40',
    description: 'Cyclone Maelstrom relocated to (200, 150) blocking Skull Rock corridor. Tests A* obstacle avoidance.',
    islands: INITIAL_ISLANDS,
    ships: INITIAL_SHIPS,
    storms: [
      {
        id: 'storm-1',
        name: 'Cyclone Maelstrom [DIRECT HIT]',
        x: 200,
        y: 150,
        radius: 95,
      },
      {
        id: 'storm-2',
        name: 'Tempest Maw',
        x: 560,
        y: 320,
        radius: 75,
      },
    ],
  },
  {
    id: 'scenario-3',
    name: 'Scenario 3: Fleet Overload',
    tag: 'Stress Test',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/40',
    description: '350 castaways across 5 atolls (60+ per island). Showcases multi-ship split rescues & greedy round-trips.',
    islands: [
      {
        id: 'isl-1',
        name: 'Skull Rock',
        x: 140,
        y: 150,
        survivors: 75,
        rescued: 0,
        triage: 'Critical',
        urgencyIndex: 0,
        status: 'pending',
      },
      {
        id: 'isl-2',
        name: 'Isla de Muerta',
        x: 260,
        y: 460,
        survivors: 65,
        rescued: 0,
        triage: 'Urgent',
        urgencyIndex: 0,
        status: 'pending',
      },
      {
        id: 'isl-3',
        name: "Siren's Cove",
        x: 500,
        y: 140,
        survivors: 60,
        rescued: 0,
        triage: 'Stable',
        urgencyIndex: 0,
        status: 'pending',
      },
      {
        id: 'isl-4',
        name: 'Kraken Shoals',
        x: 680,
        y: 440,
        survivors: 80,
        rescued: 0,
        triage: 'Critical',
        urgencyIndex: 0,
        status: 'pending',
      },
      {
        id: 'isl-5',
        name: 'Tortuga Shallows',
        x: 420,
        y: 340,
        survivors: 70,
        rescued: 0,
        triage: 'Urgent',
        urgencyIndex: 0,
        status: 'pending',
      },
    ],
    ships: INITIAL_SHIPS,
    storms: INITIAL_STORMS,
  },
];

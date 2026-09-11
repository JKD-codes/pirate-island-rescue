import { useRef, useEffect } from 'react';
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  Ship,
  Users,
  Wind,
  Activity,
  AlertTriangle,
  FastForward,
  StepForward,
  Radio,
  X,
} from 'lucide-react';
import type { Island, Ship as ShipT, LogEntry } from '../types';
import { TRIAGE_COLORS, SHIP_COLORS } from '../data/entities';

interface SidebarProps {
  ships: ShipT[];
  islands: Island[];
  logs: LogEntry[];
  isRunning: boolean;
  speedMultiplier: number;
  onSetSpeedMultiplier: (speed: number) => void;
  onStep: () => void;
  onSolve: () => void;
  onToggleSimulation: () => void;
  onReset: () => void;
  onEmergencyPing: () => void;
  isDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

const LOG_TYPE_COLORS = {
  info: 'text-sky-400',
  warning: 'text-amber-400',
  success: 'text-emerald-400',
  critical: 'text-red-400',
};

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  idle: { text: 'text-slate-400', bg: 'bg-slate-800/60', border: 'border-slate-700/50' },
  'en-route': { text: 'text-sky-400', bg: 'bg-sky-950/60', border: 'border-sky-500/30' },
  loading: { text: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-500/30' },
  returning: { text: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-500/30' },
};

export default function Sidebar({
  ships,
  islands,
  logs,
  isRunning,
  speedMultiplier,
  onSetSpeedMultiplier,
  onStep,
  onSolve,
  onToggleSimulation,
  onReset,
  onEmergencyPing,
  isDrawerOpen = false,
  onCloseDrawer,
}: SidebarProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <aside
      className={`w-[360px] sm:w-[380px] max-w-[90vw] shrink-0 border-l border-amber-500/15 bg-[#0b1329] flex flex-col overflow-hidden select-none z-40 transition-transform duration-300 fixed inset-y-0 right-0 shadow-2xl lg:relative lg:translate-x-0 ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* ─── Action Buttons ─── */}
      <div className="px-4 pt-3 pb-3 space-y-2 border-b border-slate-700/40">
        {/* Mobile Drawer Close Header */}
        <div className="flex items-center justify-between lg:hidden pb-1 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass size={13} className="text-amber-400" />
            Command Deck Drawer
          </span>
          <button
            onClick={onCloseDrawer}
            className="text-slate-400 hover:text-slate-200 p-1 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <SectionLabel icon={<Compass size={12} />} text="Command Console" />

        {/* Primary Controls */}
        <div className="flex gap-2">
          <button
            onClick={onSolve}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-400/50 active:scale-95 transition-all duration-150 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.1)]"
          >
            <Activity size={13} />
            Solve Itinerary
          </button>
          <button
            onClick={onToggleSimulation}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider border active:scale-95 transition-all duration-150 cursor-pointer ${
              isRunning
                ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            }`}
          >
            {isRunning ? <Pause size={13} /> : <Play size={13} />}
            {isRunning ? 'Halt Fleet' : 'Simulate'}
          </button>
        </div>

        {/* Secondary Controls: Speed & Single Step */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-900/80 rounded-md p-1 border border-slate-800 flex-1">
            <FastForward size={11} className="text-slate-500 ml-1" />
            <span className="text-[9px] font-mono text-slate-500 mr-1">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeedMultiplier(spd)}
                className={`flex-1 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                  speedMultiplier === spd
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={onStep}
            disabled={isRunning}
            title="Advance 1 Tick"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <StepForward size={11} />
            Step
          </button>

          <button
            onClick={onReset}
            title="Reset Scenario"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono bg-slate-850 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        </div>

        {/* Dynamic Crisis Trigger (Voyage Constraint 2) */}
        <button
          onClick={onEmergencyPing}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-[10.5px] font-bold font-mono uppercase tracking-wider bg-red-950/40 text-red-300 border border-red-500/40 hover:bg-red-900/40 hover:border-red-400 active:scale-95 transition-all duration-150 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.15)]"
        >
          <Radio size={13} className="text-red-400 animate-pulse" />
          Emergency Radio Ping (S.O.S.)
        </button>
      </div>

      {/* ─── Fleet Manifest ─── */}
      <div className="px-4 py-2.5 border-b border-slate-700/40">
        <SectionLabel icon={<Ship size={12} />} text="Fleet Manifest" />
        <div className="mt-1.5 space-y-2">
          {ships.map((ship, idx) => {
            const color = SHIP_COLORS[idx % SHIP_COLORS.length];
            const loadPct =
              ship.capacity > 0
                ? Math.round((ship.load / ship.capacity) * 100)
                : 0;
            const sc = STATUS_COLORS[ship.status] || STATUS_COLORS.idle;
            const targetIsl = islands.find((i) => i.id === ship.targetIslandId);

            return (
              <div
                key={ship.id}
                className="rounded-md bg-slate-900/70 border border-slate-800 px-3 py-2 transition-all hover:border-slate-700"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-[11px] font-semibold tracking-wide"
                      style={{ color }}
                    >
                      {ship.name}
                    </span>
                  </div>
                  <span
                    className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded border ${sc.bg} ${sc.text} ${sc.border}`}
                  >
                    {ship.status}
                  </span>
                </div>

                {/* Destination line */}
                <div className="text-[9px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                  <span>
                    {ship.status === 'en-route' && targetIsl
                      ? `🎯 Dest: ${targetIsl.name}`
                      : ship.status === 'returning'
                      ? '🏠 Returning to Safe Port'
                      : ship.status === 'loading'
                      ? '⚓ Embarking Castaways'
                      : '⚓ Standing by in harbor'}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Wind size={10} />
                    {ship.speed} px/tk
                  </span>
                </div>

                {/* Capacity progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${loadPct}%`,
                        backgroundColor: color,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-300 w-14 text-right">
                    {ship.load}/{ship.capacity} ({loadPct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Island Triage Status ─── */}
      <div className="px-4 py-2.5 border-b border-slate-700/40">
        <SectionLabel icon={<Users size={12} />} text="Island Triage Status" />
        <div className="mt-1.5 space-y-1.5">
          {islands.map((island) => {
            const tc = TRIAGE_COLORS[island.triage];
            const remaining = island.survivors - island.rescued;
            const pct =
              island.survivors > 0
                ? Math.round((island.rescued / island.survivors) * 100)
                : 100;
            const isCleared = remaining <= 0;

            return (
              <div
                key={island.id}
                className={`flex items-center gap-2 rounded border px-2.5 py-1.5 transition-all ${
                  isCleared
                    ? 'bg-emerald-950/20 border-emerald-900/40'
                    : 'bg-slate-900/50 border-slate-800/80'
                }`}
              >
                {/* Status indicator */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: isCleared ? '#34d399' : tc.bg }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10.5px] font-semibold truncate ${isCleared ? 'text-emerald-300/80 line-through' : 'text-slate-200'}`}>
                      {island.name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {island.urgencyIndex !== 0 && isFinite(island.urgencyIndex) && !isCleared && (
                        <span className="text-[8px] font-mono text-amber-400 bg-amber-950/50 border border-amber-500/30 px-1 rounded">
                          P:{island.urgencyIndex.toFixed(0)}
                        </span>
                      )}
                      <span
                        className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{
                          color: isCleared ? '#34d399' : tc.text,
                          backgroundColor: isCleared ? '#064e3b33' : `${tc.bg}22`,
                        }}
                      >
                        {isCleared ? 'CLEARED' : island.triage}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isCleared ? '#34d399' : tc.bg,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className={`text-[8.5px] font-mono w-16 text-right ${isCleared ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      {isCleared ? '✓ 100%' : `${remaining} left`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Mission Incident Log ─── */}
      <div className="flex-1 flex flex-col min-h-0 px-4 py-2.5">
        <SectionLabel
          icon={<AlertTriangle size={12} />}
          text="Mission Incident Log"
        />
        <div className="mt-1.5 flex-1 min-h-0 rounded-md bg-black/70 border border-slate-800 overflow-y-auto font-mono text-[9.5px] p-2.5 scrollbar-thin">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 leading-relaxed mb-0.5">
              <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
              <span className={LOG_TYPE_COLORS[log.type]}>{log.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-0.5">
      <span className="text-amber-500/70">{icon}</span>
      <span className="text-[10px] font-bold text-amber-200/70 uppercase tracking-[0.16em]">
        {text}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-amber-500/25 to-transparent" />
    </div>
  );
}

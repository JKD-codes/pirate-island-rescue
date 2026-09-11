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
} from 'lucide-react';
import type { Island, Ship as ShipT, LogEntry } from '../types';
import { TRIAGE_COLORS, SHIP_COLORS } from '../data/entities';

interface SidebarProps {
  ships: ShipT[];
  islands: Island[];
  logs: LogEntry[];
  isRunning: boolean;
  onSolve: () => void;
  onToggleSimulation: () => void;
  onReset: () => void;
}

const LOG_TYPE_COLORS = {
  info: 'text-sky-400',
  warning: 'text-amber-400',
  success: 'text-emerald-400',
  critical: 'text-red-400',
};

export default function Sidebar({
  ships,
  islands,
  logs,
  isRunning,
  onSolve,
  onToggleSimulation,
  onReset,
}: SidebarProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <aside className="w-[380px] shrink-0 border-l border-amber-500/15 bg-[#0b1329] flex flex-col overflow-hidden">
      {/* ─── Action Buttons ─── */}
      <div className="px-4 pt-4 pb-3 space-y-2 border-b border-slate-700/40">
        <SectionLabel icon={<Compass size={12} />} text="Command Console" />
        <div className="flex gap-2">
          <button
            onClick={onSolve}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-400/50 transition-all duration-200"
          >
            <Activity size={13} />
            Solve Itinerary
          </button>
          <button
            onClick={onToggleSimulation}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
              isRunning
                ? 'bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/25'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
            }`}
          >
            {isRunning ? <Pause size={13} /> : <Play size={13} />}
            {isRunning ? 'Halt' : 'Simulate'}
          </button>
        </div>
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:bg-slate-700/50 hover:text-slate-300 transition-all duration-200"
        >
          <RotateCcw size={12} />
          Reset Scenario
        </button>
      </div>

      {/* ─── Fleet Manifest ─── */}
      <div className="px-4 py-3 border-b border-slate-700/40">
        <SectionLabel icon={<Ship size={12} />} text="Fleet Manifest" />
        <div className="mt-2 space-y-2.5">
          {ships.map((ship, idx) => {
            const color = SHIP_COLORS[idx % SHIP_COLORS.length];
            const loadPct =
              ship.capacity > 0
                ? Math.round((ship.load / ship.capacity) * 100)
                : 0;
            return (
              <div
                key={ship.id}
                className="rounded-md bg-slate-900/60 border border-slate-700/30 px-3 py-2"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
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
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                    {ship.status}
                  </span>
                </div>
                {/* Capacity bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${loadPct}%`,
                        backgroundColor: color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 w-12 text-right">
                    {ship.load}/{ship.capacity}
                  </span>
                </div>
                {/* Speed */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1">
                    <Wind size={9} className="text-slate-500" />
                    <span className="text-[9px] font-mono text-slate-500">
                      {ship.speed} px/tick
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600">
                    ({ship.x.toFixed(0)}, {ship.y.toFixed(0)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Island Triage Status ─── */}
      <div className="px-4 py-3 border-b border-slate-700/40">
        <SectionLabel icon={<Users size={12} />} text="Island Triage Status" />
        <div className="mt-2 space-y-1.5">
          {islands.map((island) => {
            const tc = TRIAGE_COLORS[island.triage];
            const remaining = island.survivors - island.rescued;
            const pct =
              island.survivors > 0
                ? Math.round((island.rescued / island.survivors) * 100)
                : 100;
            return (
              <div
                key={island.id}
                className="flex items-center gap-2 rounded bg-slate-900/40 border border-slate-800/50 px-2.5 py-1.5"
              >
                {/* Triage dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: tc.bg }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-300 truncate">
                      {island.name}
                    </span>
                    <span
                      className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                      style={{
                        color: tc.text,
                        backgroundColor: `${tc.bg}22`,
                      }}
                    >
                      {island.triage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: tc.bg,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 w-16 text-right">
                      {remaining > 0 ? `👥 ${remaining} left` : '✓ Clear'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Mission Incident Log ─── */}
      <div className="flex-1 flex flex-col min-h-0 px-4 py-3">
        <SectionLabel
          icon={<AlertTriangle size={12} />}
          text="Mission Incident Log"
        />
        <div className="mt-2 flex-1 min-h-0 rounded-md bg-black/60 border border-slate-800/50 overflow-y-auto font-mono text-[10px] p-2.5 scrollbar-thin">
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
    <div className="flex items-center gap-2 mb-1">
      <span className="text-amber-500/60">{icon}</span>
      <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-[0.18em]">
        {text}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
    </div>
  );
}

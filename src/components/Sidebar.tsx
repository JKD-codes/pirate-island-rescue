import { useRef, useEffect, useState } from 'react';
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
  Navigation,
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
  info: 'text-sky-300',
  warning: 'text-amber-300',
  success: 'text-emerald-300',
  critical: 'text-rose-400',
};

const STATUS_CONFIG: Record<string, { label: string; text: string; bg: string; border: string; dot: string }> = {
  idle: {
    label: 'IDLE IN PORT',
    text: 'text-slate-300',
    bg: 'bg-slate-800/50',
    border: 'border-slate-700/60',
    dot: 'bg-slate-400',
  },
  'en-route': {
    label: 'EN ROUTE',
    text: 'text-sky-300',
    bg: 'bg-sky-950/40',
    border: 'border-sky-500/40',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
  },
  loading: {
    label: 'EMBARKING',
    text: 'text-amber-300',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  },
  returning: {
    label: 'RETURNING',
    text: 'text-emerald-300',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  },
  holding: {
    label: 'HEAVED TO',
    text: 'text-amber-200 font-bold',
    bg: 'bg-amber-950/60',
    border: 'border-amber-400/80',
    dot: 'bg-amber-300 animate-ping',
  },
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
  const [mobileTab, setMobileTab] = useState<'console' | 'fleet' | 'islands' | 'logs'>('console');

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <aside
      className={`glass-panel w-[350px] sm:w-[390px] max-w-[94vw] shrink-0 flex flex-col overflow-hidden select-none z-40 transition-transform duration-300 fixed inset-y-0 right-0 shadow-2xl lg:relative lg:translate-x-0 ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* ─── Mobile Drawer Top Header & Navigation Tabs ─── */}
      <div className="lg:hidden px-3.5 pt-3 pb-2 border-b border-amber-500/20 bg-slate-950/70 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between pb-2.5">
          <span className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-widest flex items-center gap-2">
            <Compass size={14} className="text-amber-400 animate-spin-slow" />
            Admiralty Command Deck
          </span>
          <button
            onClick={onCloseDrawer}
            className="text-slate-400 hover:text-amber-300 p-1.5 rounded-lg border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab switchers for mobile drawer */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-lg border border-white/10 text-[10px] font-outfit">
          <button
            onClick={() => setMobileTab('console')}
            className={`py-1 rounded-md text-center font-semibold transition-all cursor-pointer ${
              mobileTab === 'console'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Console
          </button>
          <button
            onClick={() => setMobileTab('fleet')}
            className={`py-1 rounded-md text-center font-semibold transition-all cursor-pointer ${
              mobileTab === 'fleet'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fleet
          </button>
          <button
            onClick={() => setMobileTab('islands')}
            className={`py-1 rounded-md text-center font-semibold transition-all cursor-pointer ${
              mobileTab === 'islands'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Islands
          </button>
          <button
            onClick={() => setMobileTab('logs')}
            className={`py-1 rounded-md text-center font-semibold transition-all cursor-pointer ${
              mobileTab === 'logs'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ledger
          </button>
        </div>
      </div>

      {/* ─── Action Buttons / Command Console ─── */}
      <div className={`px-4 pt-3.5 pb-3 space-y-2.5 border-b border-amber-500/15 shrink-0 ${mobileTab !== 'console' ? 'hidden lg:block' : 'block'}`}>
        <SectionLabel icon={<Compass size={13} />} text="Naval Command Console" />

        {/* Primary Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onSolve}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-outfit font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 text-amber-200 border border-amber-400/50 hover:border-amber-300 hover:bg-amber-500/30 active:scale-95 transition-all cursor-pointer shadow-[0_0_18px_rgba(245,158,11,0.18)]"
          >
            <Activity size={14} className="text-amber-400" />
            Solve Itinerary
          </button>
          <button
            onClick={onToggleSimulation}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-outfit font-bold uppercase tracking-wider border active:scale-95 transition-all cursor-pointer ${
              isRunning
                ? 'bg-gradient-to-r from-rose-500/25 to-red-600/25 text-rose-200 border-rose-400/60 hover:bg-rose-500/35 shadow-[0_0_18px_rgba(244,63,94,0.25)]'
                : 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-200 border-emerald-400/60 hover:bg-emerald-500/35 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
            }`}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Halt Fleet' : 'Launch Simulation'}
          </button>
        </div>

        {/* Speed Controls & Single Step */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950/70 backdrop-blur-md rounded-lg p-1 border border-white/10 flex-1">
            <FastForward size={12} className="text-amber-400 ml-1.5" />
            <span className="text-[9.5px] font-telemetry text-slate-400 mr-1 uppercase">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeedMultiplier(spd)}
                className={`flex-1 py-0.5 rounded text-[10px] font-telemetry font-bold transition-all cursor-pointer ${
                  speedMultiplier === spd
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-telemetry bg-slate-900/80 border border-white/10 text-slate-300 hover:border-amber-400/40 hover:text-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <StepForward size={12} />
            Step
          </button>

          <button
            onClick={onReset}
            title="Reset Scenario to Initial Dock"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-telemetry bg-slate-900/80 border border-white/10 text-slate-400 hover:border-amber-400/40 hover:text-amber-200 transition-all cursor-pointer"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        {/* Dynamic S.O.S. Distress Radio Ping */}
        <button
          onClick={onEmergencyPing}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-outfit font-bold uppercase tracking-wider bg-gradient-to-r from-rose-950/50 via-rose-900/40 to-rose-950/50 text-rose-200 border border-rose-500/40 hover:border-rose-400 hover:bg-rose-900/60 active:scale-95 transition-all cursor-pointer shadow-[0_0_16px_rgba(244,63,94,0.18)]"
        >
          <Radio size={13} className="text-rose-400 animate-pulse" />
          Emergency Distress Beacon (S.O.S.)
        </button>
      </div>

      {/* ─── Fleet Manifest (Bespoke Maritime Cards) ─── */}
      <div className={`px-4 py-3 border-b border-amber-500/15 overflow-y-auto max-h-[42vh] lg:max-h-none shrink-0 ${mobileTab !== 'fleet' ? 'hidden lg:block' : 'block flex-1'}`}>
        <SectionLabel icon={<Ship size={13} />} text="Active Fleet Manifest" />
        <div className="mt-2 space-y-2.5">
          {ships.map((ship, idx) => {
            const color = SHIP_COLORS[idx % SHIP_COLORS.length];
            const loadPct =
              ship.capacity > 0
                ? Math.round((ship.load / ship.capacity) * 100)
                : 0;
            const sc = STATUS_CONFIG[ship.status] || STATUS_CONFIG.idle;
            const targetIsl = islands.find((i) => i.id === ship.targetIslandId);
            const boatImg = idx === 0 ? '/boat_1.png' : idx === 1 ? '/boat_2.png' : '/boat_3.png';
            const vesselClass = idx === 0 ? 'Heavy Galleon' : idx === 1 ? 'War Frigate' : 'Phantom Clipper';

            return (
              <div
                key={ship.id}
                className="glass-card rounded-xl p-3 landscape-compact-card border border-white/[0.07] hover:border-amber-400/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {/* Vessel Portrait in Frosted Gold Frame */}
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,0,0,0.5)]">
                      <img src={boatImg} alt={ship.name} className="w-full h-full object-contain drop-shadow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                        />
                        <span className="font-cinzel text-xs font-bold tracking-wider text-slate-100">
                          {ship.name}
                        </span>
                      </div>
                      <span className="font-outfit text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                        {vesselClass}
                      </span>
                    </div>
                  </div>

                  {/* Refined Status Pill */}
                  <span
                    className={`text-[8.5px] font-telemetry uppercase px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${sc.bg} ${sc.text} ${sc.border}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>

                {/* Destination & Speed line */}
                <div className="text-[10px] font-outfit text-slate-300/90 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <Navigation size={10} className="text-amber-400 shrink-0" />
                    {ship.status === 'en-route' && targetIsl
                      ? `Course: ${targetIsl.name}`
                      : ship.status === 'returning'
                      ? 'Returning to Safe Port'
                      : ship.status === 'loading'
                      ? 'Embarking Castaways'
                      : ship.status === 'holding'
                      ? 'Heaved-To • Sheltering'
                      : 'Standby at Anchorage'}
                  </span>
                  <span className="text-slate-400 font-telemetry text-[9px] flex items-center gap-1 shrink-0">
                    <Wind size={10} className="text-sky-400" />
                    {ship.speed} kn
                  </span>
                </div>

                {/* Capacity Progress Bar with soft glow */}
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/[0.05]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${loadPct}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}88`,
                      }}
                    />
                  </div>
                  <span className="text-[9.5px] font-telemetry text-slate-300 shrink-0">
                    <strong className="text-amber-300">{ship.load}</strong> / {ship.capacity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Island Triage Status (NO STRIKETHROUGHS, Pure Naval Status) ─── */}
      <div className={`px-4 py-3 border-b border-amber-500/15 overflow-y-auto max-h-[36vh] lg:max-h-none shrink-0 ${mobileTab !== 'islands' ? 'hidden lg:block' : 'block flex-1'}`}>
        <SectionLabel icon={<Users size={13} />} text="Archipelago Triage" />
        <div className="mt-2 space-y-2">
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
                className={`rounded-xl px-3 py-2 transition-all border ${
                  isCleared
                    ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_2px_12px_rgba(16,185,129,0.06)]'
                    : 'glass-card border-white/[0.08] hover:border-amber-400/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {/* Status jewel */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isCleared ? '#34d399' : tc.bg,
                        boxShadow: `0 0 8px ${isCleared ? '#34d399' : tc.bg}`,
                      }}
                    />
                    <span className={`font-cinzel text-xs font-bold ${isCleared ? 'text-emerald-300' : 'text-slate-100'}`}>
                      {island.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {island.urgencyIndex !== 0 && isFinite(island.urgencyIndex) && !isCleared && (
                      <span className="text-[8px] font-telemetry text-amber-300 bg-amber-950/50 border border-amber-500/40 px-1.5 py-0.2 rounded">
                        P:{island.urgencyIndex.toFixed(0)}
                      </span>
                    )}

                    <span
                      className={`text-[8px] font-telemetry font-bold uppercase px-2 py-0.5 rounded-full border ${
                        isCleared
                          ? 'text-emerald-300 bg-emerald-500/15 border-emerald-400/40'
                          : island.triage === 'Critical'
                          ? 'text-rose-300 bg-rose-500/15 border-rose-500/40'
                          : island.triage === 'Urgent'
                          ? 'text-amber-300 bg-amber-500/15 border-amber-500/40'
                          : 'text-sky-300 bg-sky-500/15 border-sky-500/40'
                      }`}
                    >
                      {isCleared ? 'SECURED' : island.triage}
                    </span>
                  </div>
                </div>

                {/* Progress bar and headcount */}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/[0.05]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isCleared ? '#10b981' : tc.bg,
                        boxShadow: `0 0 8px ${isCleared ? '#10b981' : tc.bg}88`,
                      }}
                    />
                  </div>
                  <span className={`text-[9.5px] font-telemetry w-20 text-right ${isCleared ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                    {isCleared ? '100% SECURE' : `${remaining} souls left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Admiralty Incident Ledger ─── */}
      <div className={`flex-1 flex flex-col min-h-0 px-4 py-3 ${mobileTab !== 'logs' ? 'hidden lg:flex' : 'flex'}`}>
        <SectionLabel
          icon={<AlertTriangle size={13} />}
          text="Admiralty Incident Ledger"
        />
        <div className="mt-2 flex-1 min-h-0 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/[0.07] overflow-y-auto font-telemetry text-[9.5px] p-3 scrollbar-thin shadow-inner">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 leading-relaxed mb-1 items-start">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
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
      <span className="text-amber-400">{icon}</span>
      <span className="font-cinzel text-[10.5px] font-bold text-amber-200/90 uppercase tracking-[0.16em]">
        {text}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
    </div>
  );
}


import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  StepForward,
  X,
  Compass,
  Ship,
  MapPin,
  ScrollText,
  Flame,
  Anchor,
  Navigation,
  Coins,
  Home,
  AlertTriangle,
  ArrowDown,
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
  info: 'text-amber-200/90',
  warning: 'text-amber-400 font-semibold',
  success: 'text-emerald-300 font-bold',
  critical: 'text-rose-400 font-bold',
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
  const [activeTab, setActiveTab] = useState<'all' | 'fleet' | 'logs'>('all');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <aside
      className={`w-[360px] sm:w-[400px] max-w-[92vw] shrink-0 border-l-2 border-[#8b5a2b] bg-gradient-to-b from-[#180f08] via-[#140b05] to-[#100804] flex flex-col overflow-hidden select-none z-40 transition-transform duration-300 fixed inset-y-0 right-0 shadow-2xl lg:relative lg:translate-x-0 font-heading pb-6 lg:pb-0 ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* ─── Quarterdeck Command Console (Fixed at top) ─── */}
      <div className="px-4 pt-3 pb-2.5 space-y-2 border-b-2 border-[#8b5a2b]/60 bg-[#160d07]/95 shrink-0">
        {/* Mobile Drawer Close Header */}
        <div className="flex items-center justify-between lg:hidden pb-1 border-b border-[#8b5a2b]/60">
          <span className="text-xs font-heading font-bold text-[#f3e5ab] uppercase tracking-wider flex items-center gap-1.5">
            <Anchor size={14} className="text-[#d4af37]" />
            Quarterdeck Drawer
          </span>
          <button
            onClick={onCloseDrawer}
            className="text-[#c89b3c] hover:text-amber-200 p-1 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Section Label */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-[#d4af37]" />
            <span className="text-[11px] font-heading font-extrabold text-[#f3e5ab] uppercase tracking-[0.16em]">
              Admiral's Quarterdeck
            </span>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-[#0d0703] p-0.5 rounded border border-[#5c4028]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-0.5 rounded text-[9px] font-heading font-bold uppercase transition-all ${
                activeTab === 'all'
                  ? 'bg-[#d4af37] text-[#1c0d02] shadow-sm'
                  : 'text-[#c89b3c]/80 hover:text-amber-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-2 py-0.5 rounded text-[9px] font-heading font-bold uppercase transition-all ${
                activeTab === 'fleet'
                  ? 'bg-[#d4af37] text-[#1c0d02] shadow-sm'
                  : 'text-[#c89b3c]/80 hover:text-amber-100'
              }`}
            >
              Fleet
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-heading font-bold uppercase transition-all ${
                activeTab === 'logs'
                  ? 'bg-[#d4af37] text-[#1c0d02] shadow-sm'
                  : 'text-[#c89b3c]/80 hover:text-amber-100'
              }`}
            >
              <span>Logs</span>
              <span className="text-[8px] opacity-80 font-mono">({logs.length})</span>
            </button>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex gap-2">
          <button
            onClick={onSolve}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-[11px] font-heading font-black uppercase tracking-wider bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#92400e] text-[#1c0d02] border border-[#fde68a] hover:brightness-110 active:scale-95 transition-all duration-150 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Compass size={13} className="text-[#1c0d02]" />
            <span>Chart Passage</span>
          </button>
          <button
            onClick={onToggleSimulation}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-[11px] font-heading font-black uppercase tracking-wider border active:scale-95 transition-all duration-150 cursor-pointer ${
              isRunning
                ? 'bg-gradient-to-b from-[#991b1b] to-[#7f1d1d] text-rose-100 border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:brightness-110'
                : 'bg-gradient-to-b from-[#166534] to-[#14532d] text-emerald-100 border-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:brightness-110'
            }`}
          >
            {isRunning ? <Pause size={13} /> : <Play size={13} />}
            <span>{isRunning ? 'Cast Anchor' : 'Hoist Canvas'}</span>
          </button>
        </div>

        {/* Secondary Controls: Knots & Single Tick */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#1a1109] rounded p-1 border border-[#6b4423] flex-1">
            <FastForward size={11} className="text-[#c89b3c] ml-1" />
            <span className="text-[9px] font-heading text-[#c89b3c]/80 mr-1">Knots:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeedMultiplier(spd)}
                className={`flex-1 py-0.5 rounded text-[9.5px] font-heading font-bold transition-all ${
                  speedMultiplier === spd
                    ? 'bg-[#d4af37] text-[#1c0d02] shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                    : 'text-amber-200/70 hover:text-amber-100'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={onStep}
            disabled={isRunning}
            title="Advance 1 Nautical Turn"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-heading bg-[#22150b] border border-[#785108] text-amber-200 hover:bg-[#331f10] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <StepForward size={11} />
            <span>Turn</span>
          </button>

          <button
            onClick={onReset}
            title="Reset Sea Chart"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-heading bg-[#22150b] border border-[#785108] text-amber-300 hover:text-amber-100 hover:bg-[#331f10] transition-all cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        </div>

        {/* Emergency Distress Flare Button */}
        <button
          onClick={onEmergencyPing}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-[10.5px] font-heading font-black uppercase tracking-wider bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] text-amber-100 border border-red-500/70 hover:brightness-110 active:scale-95 transition-all duration-150 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)]"
        >
          <Flame size={13} className="text-amber-300 animate-pulse" />
          <span>Fire Emergency Distress Flare (S.O.S.)</span>
        </button>
      </div>

      {/* ─── Body Content Area (Scrollable with antique scrollbar) ─── */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-[#8b5a2b]/30">
        {/* FLEET MANIFEST SECTION */}
        {(activeTab === 'all' || activeTab === 'fleet') && (
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ship size={14} className="text-[#d4af37]" />
                <span className="text-[10.5px] font-heading font-extrabold text-[#f3e5ab] uppercase tracking-[0.14em]">
                  Fleet Manifest ({ships.length} Cutters)
                </span>
              </div>
              <span className="text-[9px] font-parchment text-[#c89b3c]/80">
                Holding Capacity
              </span>
            </div>

            <div className="space-y-2">
              {ships.map((ship, idx) => {
                const color = SHIP_COLORS[idx % SHIP_COLORS.length];
                const loadPct =
                  ship.capacity > 0
                    ? Math.round((ship.load / ship.capacity) * 100)
                    : 0;
                const targetIsl = islands.find((i) => i.id === ship.targetIslandId);
                const boatImg = idx === 0 ? '/boat_1.png' : idx === 1 ? '/boat_2.png' : '/boat_3.png';

                // Status configuration
                let statusLabel = 'Anchored';
                let statusBg = 'bg-[#22140a] text-amber-200/70 border-[#5c4028]';
                let StatusIcon = Anchor;

                if (ship.status === 'en-route') {
                  statusLabel = 'In Passage';
                  statusBg = 'bg-[#0f2133] text-sky-300 border-[#0369a1]';
                  StatusIcon = Navigation;
                } else if (ship.status === 'loading') {
                  statusLabel = 'Hoisting';
                  statusBg = 'bg-[#2e1d09] text-amber-300 border-[#b45309]';
                  StatusIcon = Coins;
                } else if (ship.status === 'returning') {
                  statusLabel = 'Sailing Haven';
                  statusBg = 'bg-[#122818] text-emerald-300 border-[#15803d]';
                  StatusIcon = Home;
                } else if (ship.status === 'holding') {
                  statusLabel = 'Heaved-To';
                  statusBg = 'bg-[#3b200b] text-amber-300 font-bold border-[#d4af37]';
                  StatusIcon = AlertTriangle;
                }

                return (
                  <div
                    key={ship.id}
                    className="rounded-lg bg-[#1a1109] border border-[#6b4423] p-2.5 transition-all hover:border-[#c89b3c]/80 shadow-md"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Miniature Porthole */}
                        <div className="w-9 h-9 rounded-md bg-[#110904] border-2 border-[#d4af37]/70 flex items-center justify-center overflow-hidden p-0.5 shrink-0 shadow-inner">
                          <img src={boatImg} alt={ship.name} className="w-full h-full object-contain drop-shadow" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-[11.5px] font-heading font-extrabold tracking-wide text-[#f3e5ab] truncate">
                              {ship.name}
                            </span>
                          </div>
                          <span className="text-[8.5px] font-parchment italic text-[#c89b3c]/80 block truncate">
                            {idx === 0 ? 'Heavy War Galleon' : idx === 1 ? 'Black Frigate' : 'Phantom Sea Clipper'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[8.5px] font-heading uppercase px-2 py-0.5 rounded border shadow-inner shrink-0 flex items-center gap-1 ${statusBg}`}
                      >
                        <StatusIcon size={9} />
                        <span>{statusLabel}</span>
                      </span>
                    </div>

                    {/* Course destination */}
                    <div className="text-[9.5px] font-parchment text-amber-200/80 mb-1 flex items-center justify-between gap-1">
                      <span className="truncate flex-1 min-w-0">
                        {ship.status === 'en-route' && targetIsl
                          ? `Bound for: ${targetIsl.name}`
                          : ship.status === 'returning'
                          ? 'Steaming for Haven Port'
                          : ship.status === 'loading'
                          ? 'Hoisting Castaways'
                          : ship.status === 'holding'
                          ? 'Sheltering in Open Sea'
                          : 'Standing by in harbor'}
                      </span>
                      <span className="text-[#c89b3c] font-heading font-semibold text-[9px] shrink-0">
                        {ship.speed} knots
                      </span>
                    </div>

                    {/* Hold capacity bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#0e0703] rounded-full overflow-hidden border border-[#5c4028]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${loadPct}%`,
                            backgroundColor: color,
                            opacity: 0.9,
                          }}
                        />
                      </div>
                      <span className="text-[9.5px] font-heading font-bold text-amber-300 w-16 text-right shrink-0">
                        {ship.load}/{ship.capacity} ({loadPct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FORBIDDEN ATOLLS SECTION */}
        {(activeTab === 'all' || activeTab === 'fleet') && (
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#d4af37]" />
                <span className="text-[10.5px] font-heading font-extrabold text-[#f3e5ab] uppercase tracking-[0.14em]">
                  Forbidden Atolls ({islands.length})
                </span>
              </div>
              <span className="text-[9px] font-parchment text-[#c89b3c]/80">
                Rescue Progress
              </span>
            </div>

            <div className="space-y-1.5">
              {islands.map((island) => {
                const tc = TRIAGE_COLORS[island.triage];
                const remaining = island.survivors - island.rescued;
                const pct =
                  island.survivors > 0
                    ? Math.round((island.rescued / island.survivors) * 100)
                    : 100;
                const isCleared = remaining <= 0;
                const islandImg =
                  island.image ||
                  (island.name.includes('Skull')
                    ? '/pirate_skull_island.png'
                    : island.name.includes('Tortuga')
                    ? '/tortuga_island.png'
                    : island.name.includes('Siren')
                    ? '/siren_island.png'
                    : '/razor_reef.png');

                return (
                  <div
                    key={island.id}
                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 transition-all shadow-inner ${
                      isCleared
                        ? 'bg-[#122818]/60 border-[#15803d]/60'
                        : 'bg-[#1a1109] border-[#6b4423]'
                    }`}
                  >
                    {/* Island portrait */}
                    <div className="w-8 h-8 rounded-md bg-[#0e0703] border border-[#d4af37]/60 flex items-center justify-center overflow-hidden p-0.5 shrink-0 shadow">
                      <img src={islandImg} alt={island.name} className="w-full h-full object-contain drop-shadow" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[11px] font-heading font-extrabold truncate ${isCleared ? 'text-emerald-300/80 line-through' : 'text-[#f4ecd8]'}`}>
                          {island.name}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {island.urgencyIndex !== 0 && isFinite(island.urgencyIndex) && !isCleared && (
                            <span className="text-[8px] font-heading font-bold text-amber-300 bg-[#2b1909] border border-[#d4af37]/50 px-1 py-0.2 rounded">
                              P:{island.urgencyIndex.toFixed(0)}
                            </span>
                          )}
                          <span
                            className="text-[8px] font-heading font-extrabold uppercase px-1.5 py-0.5 rounded shadow-sm"
                            style={{
                              color: isCleared ? '#34d399' : tc.text,
                              backgroundColor: isCleared ? '#064e3b55' : `${tc.bg}33`,
                              border: `1px solid ${isCleared ? '#10b981' : tc.border}`,
                            }}
                          >
                            {isCleared ? '✓ LIBERATED' : island.triage}
                          </span>
                        </div>
                      </div>

                      {/* Rescue progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#0e0703] rounded-full overflow-hidden border border-[#5c4028]/60">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isCleared ? '#34d399' : tc.bg,
                              opacity: 0.85,
                            }}
                          />
                        </div>
                        <span className={`text-[9px] font-heading font-bold w-16 text-right shrink-0 ${isCleared ? 'text-emerald-300' : 'text-amber-200/90'}`}>
                          {isCleared ? '100%' : `${remaining} left`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SHIP'S CHRONICLES & INCIDENT LOG SECTION */}
        {(activeTab === 'all' || activeTab === 'logs') && (
          <div className={`px-4 py-3 flex flex-col ${activeTab === 'logs' ? 'h-full min-h-[450px]' : 'min-h-[220px]'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <ScrollText size={14} className="text-[#d4af37]" />
                <span className="text-[10.5px] font-heading font-extrabold text-[#f3e5ab] uppercase tracking-[0.14em]">
                  Ship's Chronicles
                </span>
              </div>
              <button
                onClick={() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                title="Scroll to latest entry"
                className="text-[9px] font-heading text-[#c89b3c] hover:text-amber-100 flex items-center gap-0.5 cursor-pointer"
              >
                <ArrowDown size={10} />
                <span>Latest</span>
              </button>
            </div>

            <div className="flex-1 rounded-lg bg-[#0e0703] border border-[#5c4028] overflow-y-auto font-parchment text-[11px] p-3 shadow-inner space-y-1 max-h-[360px]">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#c89b3c]/70 shrink-0 font-heading text-[9.5px] mt-0.5">
                    [{log.timestamp}]
                  </span>
                  <span className={`${LOG_TYPE_COLORS[log.type]} break-words flex-1 min-w-0`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

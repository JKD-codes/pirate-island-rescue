import { useState } from 'react';
import { Ship as ShipIcon, Users, Compass, X, Check, ScrollText, MapPin, Coins, ShieldCheck } from 'lucide-react';
import type { Ship, Island, Storm } from '../types';
import { runAStar, pathDistance } from '../algorithms/astar';
import { SHIP_COLORS, TRIAGE_COLORS } from '../data/entities';

interface ManualDispatchModalProps {
  isOpen: boolean;
  ship: Ship | null;
  island: Island | null;
  storms: Storm[];
  onConfirm: (shipId: string, islandId: string, castaways: number) => void;
  onClose: () => void;
}

export default function ManualDispatchModal({
  isOpen,
  ship,
  island,
  storms,
  onConfirm,
  onClose,
}: ManualDispatchModalProps) {
  const [userSelectedCastaways, setUserSelectedCastaways] = useState<number | null>(null);

  const availableCap = ship ? ship.capacity - ship.load : 0;
  const remainingSurvivors = island ? island.survivors - island.rescued : 0;
  const maxBoard = Math.max(1, Math.min(remainingSurvivors, availableCap));
  const castaways = userSelectedCastaways !== null ? Math.min(userSelectedCastaways, maxBoard) : maxBoard;
  const isIslandSafe = remainingSurvivors <= 0;

  if (!isOpen || !ship || !island) return null;

  // Calculate projected A* route distance & ETA
  const path = runAStar({ x: ship.x, y: ship.y }, { x: island.x, y: island.y }, storms);
  const dist = Math.round(pathDistance(path));
  const etaTicks = Math.round(dist / ship.speed);

  const shipColor = SHIP_COLORS[0];
  const tc = TRIAGE_COLORS[island.triage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 animate-fade-in font-heading">
      <div className="w-full max-w-md max-h-[95vh] overflow-y-auto bg-gradient-to-b from-[#1e130a] via-[#160d06] to-[#100804] border-2 border-[#d4af37] rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden ring-4 ring-[#2c1808]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#8b5a2b] bg-[#24150b]">
          <div className="flex items-center gap-2">
            <ScrollText size={16} className="text-[#d4af37]" />
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#f3e5ab]">
              Royal Charter & Passage Order
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#c89b3c] hover:text-amber-200 p-1 rounded transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 text-xs">
          {/* Liberated Island Warning Alert */}
          {isIslandSafe && (
            <div className="bg-[#0b1f14] border border-[#10b981]/60 rounded-lg p-2.5 sm:p-3 flex items-center gap-2.5 text-emerald-300 shadow">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold uppercase tracking-wider text-[10.5px]">
                  Atoll Fully Liberated
                </p>
                <p className="text-[10px] text-[#a7f3d0]/80 font-parchment leading-tight mt-0.5">
                  All castaways have already been safely rescued from {island.name}. No rescue voyage required.
                </p>
              </div>
            </div>
          )}

          {/* Ship & Island summary */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Vessel Card */}
            <div className="bg-[#120a05] border border-[#6b4423] rounded-lg p-3 flex items-center gap-2.5 shadow-inner">
              <div className="w-11 h-11 rounded-md bg-[#0a0502] border border-[#d4af37]/70 flex items-center justify-center overflow-hidden p-0.5 shrink-0 shadow">
                <img
                  src={ship.image || '/boat_1.png'}
                  alt={ship.name}
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[#c89b3c]/80 text-[9.5px] uppercase mb-0.5 font-bold">
                  <ShipIcon size={11} style={{ color: shipColor }} />
                  <span>Cutter</span>
                </div>
                <p className="font-extrabold text-[#f3e5ab] text-[11.5px] truncate">{ship.name}</p>
                <div className="flex justify-between text-[9.5px] text-[#e2d4b7]/75 mt-0.5 font-parchment">
                  <span>Free Berths:</span>
                  <span className="text-sky-300 font-bold">{availableCap} pax</span>
                </div>
              </div>
            </div>

            {/* Target Island Card */}
            <div className="bg-[#120a05] border border-[#6b4423] rounded-lg p-3 flex items-center gap-2.5 shadow-inner">
              <div className="w-11 h-11 rounded-md bg-[#0a0502] border border-[#d4af37]/70 flex items-center justify-center overflow-hidden p-0.5 shrink-0 shadow">
                <img
                  src={
                    island.image ||
                    (island.name.includes('Skull')
                      ? '/pirate_skull_island.png'
                      : island.name.includes('Tortuga')
                      ? '/tortuga_island.png'
                      : island.name.includes('Siren')
                      ? '/siren_island.png'
                      : '/razor_reef.png')
                  }
                  alt={island.name}
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[#c89b3c]/80 text-[9.5px] uppercase mb-0.5 font-bold">
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-emerald-400" />
                    <span>Atoll</span>
                  </div>
                  <span
                    className="text-[7.5px] uppercase px-1.5 py-0.2 rounded font-bold"
                    style={{ color: tc.text, backgroundColor: `${tc.bg}33`, border: `1px solid ${tc.border}` }}
                  >
                    {isIslandSafe ? 'SAFE' : island.triage}
                  </span>
                </div>
                <p className="font-extrabold text-[#f3e5ab] text-[11.5px] truncate">{island.name}</p>
                <div className="flex justify-between text-[9.5px] text-[#e2d4b7]/75 mt-0.5 font-parchment">
                  <span>Castaways:</span>
                  <span className={isIslandSafe ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {remainingSurvivors} left
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigational Telemetry */}
          <div className="bg-[#110904] border border-[#c89b3c]/40 rounded-lg p-3 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-200">
              <Compass size={14} className="text-[#d4af37] animate-spin-slow" />
              <span className="font-bold">A* Charted Course:</span>
            </div>
            <div className="flex gap-3 text-[#e2d4b7]">
              <span>Dist: <strong className="text-sky-300 font-heading">{dist} NM</strong></span>
              <span>Waypoints: <strong className="text-amber-300 font-heading">{path.length}</strong></span>
              <span>ETA: <strong className="text-emerald-300 font-heading">~{etaTicks} turns</strong></span>
            </div>
          </div>

          {/* Castaway allocation slider (only if island has remaining survivors) */}
          {!isIslandSafe && (
            <div className="space-y-2 bg-[#140a04] p-3.5 rounded-lg border border-[#6b4423]">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-[#f3e5ab] flex items-center gap-1.5">
                  <Users size={13} className="text-[#d4af37]" />
                  Castaways to Hoist Aboard:
                </span>
                <span className="text-sm font-extrabold text-amber-300 font-heading px-2.5 py-0.5 bg-[#2b1708] rounded border border-[#d4af37]/60 shadow flex items-center gap-1">
                  <Coins size={12} className="text-amber-400" />
                  <span>{castaways} Souls</span>
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={maxBoard}
                value={castaways}
                onChange={(e) => setUserSelectedCastaways(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-[#0a0502] rounded-lg border border-[#5c4028]"
              />

              <div className="flex justify-between text-[9.5px] text-[#c89b3c]/80 font-parchment italic">
                <span>Minimum: 1 Soul</span>
                <span>Available Capacity: {maxBoard} Berths</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-[#170e08] border-t border-[#8b5a2b]">
          <button
            onClick={() => {
              setUserSelectedCastaways(null);
              onClose();
            }}
            className="px-3.5 py-1.5 rounded text-xs font-heading text-amber-200/80 hover:text-amber-100 border border-[#6b4423] hover:bg-[#25150a] transition-colors cursor-pointer"
          >
            Rescind Order
          </button>
          <button
            disabled={isIslandSafe || availableCap <= 0}
            onClick={() => {
              onConfirm(ship.id, island.id, castaways);
              setUserSelectedCastaways(null);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-black font-heading text-[#1c0d02] bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#92400e] border border-[#fde68a] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer"
          >
            <Check size={14} />
            Decree Voyage
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Ship as ShipIcon, Users, Compass, Navigation, X, Check } from 'lucide-react';
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
  const [castaways, setCastaways] = useState(1);

  const availableCap = ship ? ship.capacity - ship.load : 0;
  const remainingSurvivors = island ? island.survivors - island.rescued : 0;
  const maxBoard = Math.max(1, Math.min(remainingSurvivors, availableCap));

  useEffect(() => {
    if (isOpen) {
      setCastaways(maxBoard);
    }
  }, [isOpen, maxBoard]);

  if (!isOpen || !ship || !island) return null;

  // Calculate projected A* route distance & ETA
  const path = runAStar({ x: ship.x, y: ship.y }, { x: island.x, y: island.y }, storms);
  const dist = Math.round(pathDistance(path));
  const etaTicks = Math.round(dist / ship.speed);

  const shipColor = SHIP_COLORS[0];
  const tc = TRIAGE_COLORS[island.triage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto font-outfit">
      <div className="glass-modal w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border border-amber-400/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-500/25 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Navigation size={14} className="text-amber-300" />
            </div>
            <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-200">
              Tactical Dispatch Order
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-amber-300 p-1.5 rounded-lg border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1 scrollbar-thin">
          {/* Ship & Island summary */}
          <div className="grid grid-cols-2 gap-3">
            {/* Vessel Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-md p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase mb-1">
                <ShipIcon size={12} style={{ color: shipColor }} />
                <span>Assigned Cutter</span>
              </div>
              <p className="font-bold text-slate-200 text-[11px] truncate">{ship.name}</p>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Free Berths:</span>
                <span className="text-sky-300 font-bold">{availableCap} pax</span>
              </div>
            </div>

            {/* Target Island Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-md p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase mb-1">
                <span className="text-[12px]">🏝</span>
                <span>Target Atoll</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-200 text-[11px] truncate">{island.name}</p>
                <span
                  className="text-[7.5px] uppercase px-1 py-0.2 rounded font-bold"
                  style={{ color: tc.text, backgroundColor: `${tc.bg}22` }}
                >
                  {island.triage}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Castaways:</span>
                <span className="text-red-400 font-bold">{remainingSurvivors} left</span>
              </div>
            </div>
          </div>

          {/* Navigational Telemetry */}
          <div className="bg-slate-950/70 border border-sky-500/20 rounded-md p-2.5 flex items-center justify-between text-[10.5px]">
            <div className="flex items-center gap-1.5 text-sky-300">
              <Compass size={13} className="text-sky-400 animate-spin-slow" />
              <span>A* Hazard Route:</span>
            </div>
            <div className="flex gap-3 text-slate-300">
              <span>Dist: <strong className="text-sky-300 font-mono">{dist}px</strong></span>
              <span>Waypoints: <strong className="text-amber-300 font-mono">{path.length}</strong></span>
              <span>Est. Transit: <strong className="text-emerald-300 font-mono">~{etaTicks} ticks</strong></span>
            </div>
          </div>

          {/* Castaway allocation slider */}
          <div className="space-y-2 bg-slate-900/40 p-3 rounded-md border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Users size={13} className="text-amber-400" />
                Castaways to Board:
              </span>
              <span className="text-sm font-bold text-amber-300 font-mono px-2 py-0.5 bg-amber-500/20 rounded border border-amber-500/40">
                {castaways} Souls
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={maxBoard}
              value={castaways}
              onChange={(e) => setCastaways(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Min: 1</span>
              <span>Available Capacity: {maxBoard}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-900/90 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(ship.id, island.id, castaways)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold font-mono text-amber-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            <Check size={14} />
            Confirm Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}

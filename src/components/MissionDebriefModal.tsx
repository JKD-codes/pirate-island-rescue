import { Trophy, ShieldCheck, Ship, Users, Compass, Zap, RotateCcw, X } from 'lucide-react';

interface MissionDebriefModalProps {
  isOpen: boolean;
  totalRescued: number;
  initialTotal: number;
  totalCapacity: number;
  totalNauticalMiles: number;
  efficiencyScore: number;
  isBenchmarkMode: boolean;
  onReplay: () => void;
  onClose: () => void;
}

export default function MissionDebriefModal({
  isOpen,
  totalRescued,
  initialTotal,
  totalCapacity,
  totalNauticalMiles,
  efficiencyScore,
  isBenchmarkMode,
  onReplay,
  onClose,
}: MissionDebriefModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0b1329] border-2 border-amber-400/70 rounded-xl shadow-[0_0_80px_rgba(245,158,11,0.25)] overflow-hidden font-mono text-xs">
        {/* Top Gold Banner */}
        <div className="bg-gradient-to-r from-amber-500/30 via-amber-400/20 to-amber-500/30 border-b border-amber-500/40 px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Trophy className="text-amber-400 animate-bounce" size={20} />
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-amber-200">
                Captain's Council // Mission Debrief
              </h2>
              <p className="text-[9px] sm:text-[10px] text-amber-300/70 uppercase tracking-widest">
                {isBenchmarkMode ? 'Official Benchmark Run Complete' : 'Full Evacuation Assessment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Zero Losses Confirmation Seal */}
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-lg p-3 sm:p-3.5 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-emerald-300" size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-emerald-300 tracking-wider">
                100% Survival Rate // Zero Losses Confirmed
              </p>
              <p className="text-[10px] text-emerald-400/80 mt-0.5 leading-relaxed">
                All pirate crews successfully extracted from danger zones. Fleet integrity maintained without a single casualty.
              </p>
            </div>
          </div>

          {/* Key Metric Scorecard Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Souls Saved vs Capacity */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase mb-1">
                <Users size={13} className="text-red-400" />
                <span>Souls Extracted</span>
              </div>
              <p className="text-lg font-bold text-amber-300">
                {totalRescued} <span className="text-xs text-slate-400 font-normal">/ {initialTotal}</span>
              </p>
              <p className="text-[9.5px] text-slate-500 mt-0.5">
                Fleet Capacity: {totalCapacity} Berths
              </p>
            </div>

            {/* Nautical Miles Consumed */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase mb-1">
                <Compass size={13} className="text-sky-400" />
                <span>Nautical Distance</span>
              </div>
              <p className="text-lg font-bold text-sky-300">
                {totalNauticalMiles.toLocaleString()} <span className="text-xs text-slate-400 font-normal">NM</span>
              </p>
              <p className="text-[9.5px] text-slate-500 mt-0.5">
                Optimal A* Transit Waypoints
              </p>
            </div>

            {/* Atolls Secured */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase mb-1">
                <span className="text-[12px]">🏝</span>
                <span>Atolls Secured</span>
              </div>
              <p className="text-lg font-bold text-emerald-300">
                5 / 5 <span className="text-xs text-emerald-400 font-normal">(100%)</span>
              </p>
              <p className="text-[9.5px] text-slate-500 mt-0.5">
                Critical & Urgent triage cleared
              </p>
            </div>

            {/* Algorithmic Efficiency Rating */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase mb-1">
                <Zap size={13} className="text-amber-400" />
                <span>Dispatch Efficiency</span>
              </div>
              <p className="text-lg font-bold text-amber-300">
                {efficiencyScore}%
              </p>
              <p className="text-[9.5px] text-slate-500 mt-0.5">
                Greedy capacity-distance ratio
              </p>
            </div>
          </div>

          {/* Fleet Status Summary */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1.5 text-[10.5px]">
            <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-800/60">
              <span className="flex items-center gap-1">
                <Ship size={12} className="text-sky-400" />
                The Black Pearl
              </span>
              <span className="text-emerald-400">Mission Accomplished • 0 Casualties</span>
            </div>
            <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-800/60">
              <span className="flex items-center gap-1">
                <Ship size={12} className="text-violet-400" />
                Queen Anne's Revenge
              </span>
              <span className="text-emerald-400">Mission Accomplished • 0 Casualties</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Ship size={12} className="text-emerald-400" />
                The Flying Dutchman
              </span>
              <span className="text-emerald-400">Mission Accomplished • 0 Casualties</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900/90 border-t border-slate-800">
          <button
            onClick={onReplay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            Replay Scenario
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-bold font-mono text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            Dismiss Debrief
          </button>
        </div>
      </div>
    </div>
  );
}

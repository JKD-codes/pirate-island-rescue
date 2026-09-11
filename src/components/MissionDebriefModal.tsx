import { ShieldCheck, Ship, Users, Compass, Zap, RotateCcw, X, Award, CheckCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="glass-modal w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl overflow-hidden font-outfit shadow-2xl border border-amber-400/30">
        {/* Top Gold Crest Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border-b border-amber-500/30 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Award className="text-amber-300" size={18} />
            </div>
            <div>
              <h2 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-amber-200">
                Captain's Council // Mission Debrief
              </h2>
              <p className="font-telemetry text-[9px] sm:text-[9.5px] text-amber-300/80 uppercase tracking-widest mt-0.5">
                {isBenchmarkMode ? 'Official Benchmark Run Verified' : 'Full Evacuation Assessment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-amber-300 p-1.5 rounded-lg border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 scrollbar-thin">
          {/* Zero Losses Maritime Seal */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/25 to-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="text-emerald-300" size={24} />
            </div>
            <div>
              <p className="font-cinzel text-xs sm:text-[13px] font-bold uppercase text-emerald-300 tracking-wider">
                100% Survival Rate • Zero Losses Confirmed
              </p>
              <p className="font-outfit text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
                All archipelago castaways extracted from cyclonic threat perimeters. Fleet integrity maintained without a single casualty.
              </p>
            </div>
          </div>

          {/* Key Metric Scorecard Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Souls Saved */}
            <div className="glass-card rounded-xl p-3.5 border border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-medium tracking-wider mb-1">
                <Users size={12} className="text-rose-400" />
                <span>Castaways Extracted</span>
              </div>
              <p className="font-telemetry text-xl sm:text-2xl font-bold text-amber-200">
                {totalRescued} <span className="text-xs text-slate-400 font-normal">/ {initialTotal}</span>
              </p>
              <p className="font-outfit text-[10px] text-slate-400 mt-1">
                Fleet Capacity: {totalCapacity} Berths
              </p>
            </div>

            {/* Nautical Miles Consumed */}
            <div className="glass-card rounded-xl p-3.5 border border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-medium tracking-wider mb-1">
                <Compass size={12} className="text-sky-400" />
                <span>Nautical Transit</span>
              </div>
              <p className="font-telemetry text-xl sm:text-2xl font-bold text-sky-300">
                {totalNauticalMiles.toLocaleString()} <span className="text-xs text-slate-400 font-normal">NM</span>
              </p>
              <p className="font-outfit text-[10px] text-slate-400 mt-1">
                Optimal A* Hazard Waypoints
              </p>
            </div>

            {/* Atolls Secured */}
            <div className="glass-card rounded-xl p-3.5 border border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-medium tracking-wider mb-1">
                <CheckCircle size={12} className="text-emerald-400" />
                <span>Atolls Secured</span>
              </div>
              <p className="font-telemetry text-xl sm:text-2xl font-bold text-emerald-300">
                5 / 5 <span className="text-xs text-emerald-400 font-normal">(100%)</span>
              </p>
              <p className="font-outfit text-[10px] text-slate-400 mt-1">
                Critical & Urgent triage cleared
              </p>
            </div>

            {/* Algorithmic Efficiency Rating */}
            <div className="glass-card rounded-xl p-3.5 border border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-medium tracking-wider mb-1">
                <Zap size={12} className="text-amber-400" />
                <span>Dispatch Efficiency</span>
              </div>
              <p className="font-telemetry text-xl sm:text-2xl font-bold text-amber-300">
                {efficiencyScore}%
              </p>
              <p className="font-outfit text-[10px] text-slate-400 mt-1">
                Capacity-distance ratio
              </p>
            </div>
          </div>

          {/* Fleet Clearance Honor Roll */}
          <div className="bg-slate-950/60 backdrop-blur-md border border-white/[0.08] rounded-xl p-3 space-y-2 text-[11px] font-outfit">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="flex items-center gap-2 text-slate-200 font-medium">
                <Ship size={13} className="text-sky-400" />
                The Black Pearl (Galleon)
              </span>
              <span className="text-emerald-300 font-telemetry text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Mission Accomplished • 0 Casualties
              </span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="flex items-center gap-2 text-slate-200 font-medium">
                <Ship size={13} className="text-violet-400" />
                Queen Anne's Revenge (Frigate)
              </span>
              <span className="text-emerald-300 font-telemetry text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Mission Accomplished • 0 Casualties
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-200 font-medium">
                <Ship size={13} className="text-emerald-400" />
                The Flying Dutchman (Clipper)
              </span>
              <span className="text-emerald-300 font-telemetry text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Mission Accomplished • 0 Casualties
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/70 border-t border-white/[0.08] shrink-0">
          <button
            onClick={onReplay}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-outfit font-semibold text-amber-300 border border-amber-500/40 hover:bg-amber-500/15 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            Replay Scenario
          </button>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg text-xs font-outfit font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            Dismiss Debrief
          </button>
        </div>
      </div>
    </div>
  );
}

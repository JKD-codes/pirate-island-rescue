import { Trophy, ShieldCheck, Users, Compass, Zap, RotateCcw, X, Anchor, MapPin } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-heading">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#1c1109] via-[#140b05] to-[#0c0603] border-2 border-[#d4af37] rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden ring-4 ring-[#2c1808]">
        {/* Ornate Gold Banner */}
        <div className="bg-gradient-to-r from-[#2a1708] via-[#3a200b] to-[#2a1708] border-b border-[#8b5a2b] px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#f59e0b] to-[#b45309] border border-[#fde68a] flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Trophy className="text-[#1c0d02]" size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#fef3c7] drop-shadow">
                Captain's Council // Admiralty Debrief
              </h2>
              <p className="text-[10px] text-[#d4af37] uppercase tracking-widest font-parchment">
                {isBenchmarkMode ? 'Official Royal Benchmark Completed' : 'Expedition Victory Scroll & Charter'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#c89b3c] hover:text-[#fef3c7] p-1 rounded transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Parchment Body Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Zero Losses Confirmation Seal */}
          <div className="bg-[#0b1f14]/80 border-2 border-[#10b981]/60 rounded-lg p-3.5 flex items-center gap-3.5 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-[#047857]/40">
            <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#10b981] to-[#047857] border-2 border-[#6ee7b7] flex items-center justify-center shrink-0 shadow">
              <ShieldCheck className="text-[#022c22]" size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-[#6ee7b7] tracking-wider drop-shadow">
                100% Fleet Survival // Davy Jones Claimed None
              </p>
              <p className="text-[10.5px] text-[#a7f3d0]/90 mt-0.5 leading-relaxed font-parchment">
                Every last stranded soul was rescued from the reefs and hauled into safe berths. The pirate code remains unbroken.
              </p>
            </div>
          </div>

          {/* Key Metric Scorecard Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Souls Saved vs Capacity */}
            <div className="bg-[#120904] border border-[#6b4423] rounded-lg p-3 shadow-inner">
              <div className="flex items-center gap-1.5 text-[#c89b3c] text-[10px] uppercase mb-1 font-bold">
                <Users size={13} className="text-rose-400" />
                <span>Castaways Hoisted</span>
              </div>
              <p className="text-lg font-black text-amber-300 font-heading">
                {totalRescued} <span className="text-xs text-[#a89078] font-normal">/ {initialTotal}</span>
              </p>
              <p className="text-[9.5px] text-[#c89b3c]/80 mt-0.5 font-parchment">
                Fleet Capacity: {totalCapacity} Berths
              </p>
            </div>

            {/* Nautical Miles Consumed */}
            <div className="bg-[#120904] border border-[#6b4423] rounded-lg p-3 shadow-inner">
              <div className="flex items-center gap-1.5 text-[#c89b3c] text-[10px] uppercase mb-1 font-bold">
                <Compass size={13} className="text-sky-400" />
                <span>Nautical Distance</span>
              </div>
              <p className="text-lg font-black text-sky-300 font-heading">
                {totalNauticalMiles.toLocaleString()} <span className="text-xs text-[#a89078] font-normal">NM</span>
              </p>
              <p className="text-[9.5px] text-[#c89b3c]/80 mt-0.5 font-parchment">
                Optimal A* Rhumb Lines
              </p>
            </div>

            {/* Atolls Secured */}
            <div className="bg-[#120904] border border-[#6b4423] rounded-lg p-3 shadow-inner">
              <div className="flex items-center gap-1.5 text-[#c89b3c] text-[10px] uppercase mb-1 font-bold">
                <MapPin size={13} className="text-emerald-400" />
                <span>Atolls Secured</span>
              </div>
              <p className="text-lg font-black text-emerald-300 font-heading">
                5 / 5 <span className="text-xs text-emerald-400 font-normal">(100%)</span>
              </p>
              <p className="text-[9.5px] text-[#c89b3c]/80 mt-0.5 font-parchment">
                Critical & Urgent triage cleared
              </p>
            </div>

            {/* Algorithmic Efficiency Rating */}
            <div className="bg-[#120904] border border-[#6b4423] rounded-lg p-3 shadow-inner">
              <div className="flex items-center gap-1.5 text-[#c89b3c] text-[10px] uppercase mb-1 font-bold">
                <Zap size={13} className="text-amber-400" />
                <span>Dispatch Prowess</span>
              </div>
              <p className="text-lg font-black text-amber-300 font-heading">
                {efficiencyScore}%
              </p>
              <p className="text-[9.5px] text-[#c89b3c]/80 mt-0.5 font-parchment">
                Optimal capacity-wind ratio
              </p>
            </div>
          </div>

          {/* Fleet Triumphant Return Roster */}
          <div className="bg-[#0e0703] border border-[#6b4423] rounded-lg p-3 space-y-2 text-[10.5px]">
            <div className="text-[9.5px] uppercase font-bold tracking-widest text-[#d4af37] pb-1 border-b border-[#3b2210] flex items-center justify-between">
              <span>Fleet Expedition Roster</span>
              <span>Honor Status</span>
            </div>

            <div className="flex items-center justify-between text-[#f3e5ab] py-0.5 border-b border-[#2b180a]">
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-[#d4af37]/60 bg-black/40 p-0.5 shrink-0">
                  <img src="/boat_1.png" alt="Black Pearl" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold">The Black Pearl</span>
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Anchor size={11} />
                Anchored Safely • 0 Losses
              </span>
            </div>

            <div className="flex items-center justify-between text-[#f3e5ab] py-0.5 border-b border-[#2b180a]">
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-[#d4af37]/60 bg-black/40 p-0.5 shrink-0">
                  <img src="/boat_2.png" alt="Queen Anne's Revenge" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold">Queen Anne's Revenge</span>
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Anchor size={11} />
                Anchored Safely • 0 Losses
              </span>
            </div>

            <div className="flex items-center justify-between text-[#f3e5ab] py-0.5">
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-[#d4af37]/60 bg-black/40 p-0.5 shrink-0">
                  <img src="/boat_3.png" alt="Flying Dutchman" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold">The Flying Dutchman</span>
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Anchor size={11} />
                Anchored Safely • 0 Losses
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#170e08] border-t border-[#8b5a2b]">
          <button
            onClick={onReplay}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-heading font-bold text-amber-200 border border-[#6b4423] hover:bg-[#25150a] active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            Replay Voyage
          </button>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded text-xs font-black font-heading text-[#1c0d02] bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#92400e] border border-[#fde68a] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            Seal Scroll & Return to Helm
          </button>
        </div>
      </div>
    </div>
  );
}


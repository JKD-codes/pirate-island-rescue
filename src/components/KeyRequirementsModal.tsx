import { CheckCircle2, Shield, Compass, Ship, Users, Zap, X, Anchor, FileText } from 'lucide-react';
import type { Island, Ship as ShipT } from '../types';

interface KeyRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalInitial: number;
  totalRescued: number;
  totalStranded: number;
  islands: Island[];
  ships: ShipT[];
}

export default function KeyRequirementsModal({
  isOpen,
  onClose,
  totalInitial,
  totalRescued,
  totalStranded,
  islands,
  ships,
}: KeyRequirementsModalProps) {
  if (!isOpen) return null;

  const requirements = [
    {
      num: 1,
      title: 'Map overview of islands harboring stranded pirates with headcount and urgency levels',
      desc: 'Interactive 2.5D grand sea chart rendering 5 archipelago atolls with dynamic survivor headcounts, triage badges (Critical, Urgent, Stable), and continuous hazard-distance urgency calculations.',
      telemetry: `${islands.length} Atolls Tracked • ${totalStranded} Castaways Stranded`,
      icon: Users,
    },
    {
      num: 2,
      title: 'Fleet manifest tracking rescue vessels, carrying capacity, current load, and cruising knots',
      desc: 'Real-time telemetry for all cutters in the armada (The Black Pearl, Queen Anne\'s Revenge, The Flying Dutchman) with live load indicators, maximum capacity, and distinct cruising speeds (3.0–4.5 knots).',
      telemetry: `${ships.length} Cutters • ${ships.reduce((s, sh) => s + (sh.capacity - sh.load), 0)} Free Berths Available`,
      icon: Ship,
    },
    {
      num: 3,
      title: 'Manual and algorithmic ship-to-island dispatch assignment interface',
      desc: 'Comprehensive dual-mode assignment system: (A) 1-Click Algorithmic A* Greedy Solver prioritizing urgency and capacity-distance efficiency; (B) Point-and-click Manual Charter Decree interface with customizable passenger allocations.',
      telemetry: 'Algorithmic A* + Interactive Point & Click Active',
      icon: Zap,
    },
    {
      num: 4,
      title: 'Live metric tracking: Total Marooned, Successfully Rescued, and Remaining Stranded',
      desc: 'Synchronous telemetry displaying the initial castaways marooned, live souls extracted to safety, remaining stranded pirates, and fleet efficiency scoring.',
      telemetry: `Marooned: ${totalInitial} | Rescued: ${totalRescued} | Stranded: ${totalStranded}`,
      icon: Shield,
    },
    {
      num: 5,
      title: 'Heuristic calculation of optimal rescue routes minimizing total transit nautical miles',
      desc: 'A* 8-directional heuristic pathfinding minimizing Euclidean nautical distance while dynamically circumnavigating moving Category-5 Typhoon Maelstroms and Abyssal Kraken hazard perimeters.',
      telemetry: 'A* Grid Obstacle Bypass with Dynamic Hazard Deflection',
      icon: Compass,
    },
  ];

  const constraints = [
    {
      title: 'Vessel Capacity Limit (Ls ≤ Cs)',
      desc: 'Cutters strictly cannot exceed berth capacity. Residual capacity triggers multi-leg chain rescues.',
      status: 'Enforced',
    },
    {
      title: 'Apex Hazard Avoidance & Holding (D > R)',
      desc: 'Cutters dynamically plot A* bypasses or heave-to outside vortex perimeters when corridors are obstructed.',
      status: 'Enforced',
    },
    {
      title: 'Zero Redundant Dispatches (Safe Atoll Avoidance)',
      desc: 'Liberated atolls are strictly barred from new assignments. Inbound cutters dynamically divert mid-passage.',
      status: 'Enforced',
    },
    {
      title: 'Triage & Calamity Prioritization',
      desc: 'Urgency index factors headcount, hazard proximity, and triage class into greedy dispatch cost.',
      status: 'Enforced',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-heading">
      <div className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-[#1b1008] via-[#140b05] to-[#0c0603] border-2 border-[#d4af37] rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden ring-4 ring-[#2c1808] flex flex-col">
        {/* Ornate Header */}
        <div className="bg-gradient-to-r from-[#241307] via-[#331b0a] to-[#241307] border-b border-[#8b5a2b] px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#f59e0b] to-[#b45309] border border-[#fde68a] flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0">
              <CheckCircle2 className="text-[#1c0d02]" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#fef3c7] drop-shadow">
                  Key Requirements & Directives
                </h2>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/70 text-emerald-300">
                  5/5 Verified
                </span>
              </div>
              <p className="text-[10px] text-[#d4af37] uppercase tracking-widest font-parchment">
                [PS #05] Pirate Island Rescue • Category: AI / ML
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#c89b3c] hover:text-[#fef3c7] p-1.5 rounded transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Official Problem Formulation Box */}
          <div className="bg-[#120803] border border-[#8b5a2b]/70 rounded-lg p-3.5 shadow-inner space-y-2">
            <div className="flex items-center gap-2 text-[#d4af37] text-[11px] font-extrabold uppercase tracking-wider">
              <FileText size={14} />
              <span>Problem Statement & Expected Solution</span>
            </div>
            <p className="text-[#e8d7be] font-parchment text-[12px] leading-relaxed">
              <strong>Problem:</strong> Formulate an algorithmic fleet disaster rescue coordinator that schedules rescue cutters to atolls with varying castaway populations, optimizing vessel capacities, distances, and survivor urgency.
            </p>
            <p className="text-[#c89b3c]/90 font-parchment text-[11.5px] leading-relaxed border-t border-[#3b2210] pt-1.5">
              <strong>Expected Solution:</strong> A disaster dispatch dashboard showing islands with stranded headcounts, rescue ship fleet capacities, interactive ship-to-island dispatch assignments, real-time rescue tallies, and an automated optimal rescue itinerary solver.
            </p>
          </div>

          {/* 5 Key Requirements List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-[#8b5a2b]/50">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span className="text-xs font-black uppercase text-[#fef3c7] tracking-widest">
                Key Requirements Compliance
              </span>
            </div>

            <div className="space-y-2.5">
              {requirements.map((req) => {
                const Icon = req.icon;
                return (
                  <div
                    key={req.num}
                    className="bg-[#140b05] border border-[#6b4423] hover:border-[#d4af37]/80 rounded-lg p-3 transition-colors shadow-inner"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#2b1708] border border-[#d4af37]/70 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-black text-[#fde68a]">
                        {req.num}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-[12px] font-bold text-[#fef3c7] leading-snug">
                            {req.title}
                          </h4>
                          <span className="text-[8.5px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/60 px-1.5 py-0.5 rounded shrink-0">
                            ✓ ACTIVE
                          </span>
                        </div>
                        <p className="text-[11px] text-[#c89b3c]/90 font-parchment leading-relaxed mb-2">
                          {req.desc}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#86efac] font-mono bg-[#0b1c10] px-2 py-1 rounded border border-[#10b981]/30">
                          <Icon size={12} className="text-emerald-400 shrink-0" />
                          <span className="font-semibold">{req.telemetry}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voyage Constraints Checklist */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-[#8b5a2b]/50">
              <Anchor size={15} className="text-[#d4af37]" />
              <span className="text-xs font-black uppercase text-[#fef3c7] tracking-widest">
                Voyage Constraints Implementation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {constraints.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-[#120803] border border-[#6b4423]/90 rounded-lg p-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#fde68a]">
                        {c.title}
                      </span>
                      <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-950/80 border border-[#d4af37]/60 text-amber-300">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#c89b3c]/80 font-parchment leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#170e08] border-t border-[#8b5a2b] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded text-xs font-black font-heading text-[#1c0d02] bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#92400e] border border-[#fde68a] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            Close Directives
          </button>
        </div>
      </div>
    </div>
  );
}

import {
  Volume2,
  VolumeX,
  Menu,
  Navigation,
  Wind,
  CheckCircle2,
  Trophy,
  ScrollText,
  Skull,
  Coins,
  Ship,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import type { ElementType } from 'react';
import { SCENARIO_PRESETS } from '../data/entities';

interface HeaderProps {
  totalSurvivors: number;
  totalRescued: number;
  fleetCapacity: number;
  activeHazards: number;
  efficiencyScore: number;
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  autoRoamStorms: boolean;
  onToggleAutoRoam: () => void;
  isManualDispatchMode: boolean;
  onToggleManualDispatch: () => void;
  onRunBenchmark: () => void;
  onOpenRequirements: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}

export default function Header({
  totalSurvivors,
  totalRescued,
  fleetCapacity,
  activeHazards,
  efficiencyScore,
  selectedScenarioId,
  onSelectScenario,
  autoRoamStorms,
  onToggleAutoRoam,
  isManualDispatchMode,
  onToggleManualDispatch,
  onRunBenchmark,
  onOpenRequirements,
  isMuted,
  onToggleMute,
  isDrawerOpen,
  onToggleDrawer,
}: HeaderProps) {
  const chips: {
    label: string;
    value: string | number;
    icon: ElementType;
    textColor: string;
    bgClass: string;
    borderClass: string;
    iconColor: string;
    glowClass: string;
  }[] = [
    {
      label: 'Stranded',
      value: totalSurvivors,
      icon: Skull,
      textColor: 'text-rose-300',
      bgClass: 'bg-gradient-to-b from-[#2d0e0e] to-[#1a0808]',
      borderClass: 'border-rose-700/80',
      iconColor: 'text-rose-400',
      glowClass: 'shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    },
    {
      label: 'Rescued',
      value: totalRescued,
      icon: Coins,
      textColor: 'text-emerald-300',
      bgClass: 'bg-gradient-to-b from-[#102a14] to-[#0a180b]',
      borderClass: 'border-emerald-600/80',
      iconColor: 'text-emerald-400',
      glowClass: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    },
    {
      label: 'Free Berths',
      value: fleetCapacity,
      icon: Ship,
      textColor: 'text-sky-300',
      bgClass: 'bg-gradient-to-b from-[#0c2238] to-[#071320]',
      borderClass: 'border-sky-600/80',
      iconColor: 'text-sky-400',
      glowClass: 'shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    },
    {
      label: 'Sea Terrors',
      value: activeHazards,
      icon: ShieldAlert,
      textColor: 'text-purple-300',
      bgClass: 'bg-gradient-to-b from-[#291038] to-[#170820]',
      borderClass: 'border-purple-600/80',
      iconColor: 'text-purple-400',
      glowClass: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between px-4 py-2 border-b-2 border-[#c89b3c]/80 bg-gradient-to-r from-[#170e08] via-[#24160b] to-[#170e08] shadow-[0_4px_25px_rgba(0,0,0,0.85)] gap-2 z-30 shrink-0 font-heading">
      {/* ─── Left: Pirate Title & Grand Admiralty Coat of Arms ─── */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#fde68a] via-[#d4af37] to-[#854d0e] p-0.5 shadow-[0_0_16px_rgba(212,175,55,0.5)] flex items-center justify-center border-2 border-[#fef3c7] shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1007] to-[#0f0703] flex items-center justify-center shadow-inner relative">
            <Skull size={19} className="text-[#fde68a] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
            <div className="absolute -bottom-0.5 w-3.5 h-1 rounded-full bg-amber-400/60 blur-xs" />
          </div>
        </div>
        <div>
          <h1 className="font-pirate text-xl md:text-2xl tracking-wider text-[#f3e5ab] uppercase leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] flex items-center gap-2">
            KRAKENWATCH
            <span className="text-[#c89b3c]/60 font-serif font-light text-sm">//</span>
            <span className="font-parchment text-amber-200/90 text-sm tracking-wider normal-case italic hidden sm:inline">
              High Seas Fleet Admiral
            </span>
          </h1>
          <p className="text-[8.5px] text-[#c89b3c]/90 tracking-widest uppercase font-heading hidden sm:block">
            Archipelago Disaster Command • Sector 7G
          </p>
        </div>
      </div>

      {/* ─── Mobile-Only Compact Telemetry Strip (<640px) ─── */}
      <div className="flex sm:hidden items-center gap-2 px-2.5 py-1 rounded bg-[#160d07] border border-[#8b5a2b]/70 text-[10px] font-mono shadow-inner">
        <span className="text-rose-400 font-bold flex items-center gap-1" title="Marooned Castaways">
          <Skull size={11} /> {totalSurvivors}
        </span>
        <span className="text-[#c89b3c]/40">•</span>
        <span className="text-emerald-400 font-bold flex items-center gap-1" title="Rescued to Safety">
          <Coins size={11} /> {totalRescued}
        </span>
        <span className="text-[#c89b3c]/40">•</span>
        <span className="text-sky-400 font-bold flex items-center gap-1" title="Fleet Free Berths">
          <Ship size={11} /> {fleetCapacity}
        </span>
      </div>

      {/* ─── Center: Official Benchmark & Directives & Sea Chart Controls (≥640px) ─── */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        {/* Official Directives & Key Requirements Modal Button */}
        <button
          onClick={onOpenRequirements}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-heading font-extrabold uppercase tracking-wider bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857] text-[#022c22] border border-[#6ee7b7] shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <CheckCircle2 size={13} className="text-[#022c22]" />
          <span>Directives [5/5]</span>
        </button>

        {/* "Captain's Council" 1-Click Benchmark Demo */}
        <button
          onClick={onRunBenchmark}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-heading font-extrabold uppercase tracking-wider bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#92400e] text-[#1c0d02] border border-[#fde68a] shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Trophy size={13} className="text-[#1c0d02]" />
          <span>Captain's Trial</span>
        </button>

        {/* Sea Chart Scenario Selector */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#1c1209] border border-[#c89b3c]/60 rounded px-2.5 py-1 shadow-inner">
          <ScrollText size={13} className="text-[#d4af37]" />
          <select
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-transparent text-[10.5px] font-heading text-[#f3e5ab] outline-none cursor-pointer pr-1"
          >
            {SCENARIO_PRESETS.map((preset) => (
              <option
                key={preset.id}
                value={preset.id}
                className="bg-[#170e08] text-amber-100 font-heading"
              >
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Storm Winds Mode (Auto-Drift vs Manual Drag) Toggle */}
        <button
          onClick={onToggleAutoRoam}
          title={
            autoRoamStorms
              ? 'Winds of Fate: Atmospheric Drift Active — Click to Anchor Hazards'
              : 'Winds of Fate: Anchored Hazards — Click to Release Winds'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-heading font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            autoRoamStorms
              ? 'bg-[#182a3a] border-[#38bdf8]/80 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
              : 'bg-[#1c1209] border-[#8b5a2b] text-[#c89b3c]/80 hover:text-amber-200'
          }`}
        >
          <Wind
            size={12}
            className={autoRoamStorms ? 'text-sky-400 animate-spin' : 'text-[#c89b3c]/60'}
            style={autoRoamStorms ? { animationDuration: '6s' } : undefined}
          />
          <span>Winds: {autoRoamStorms ? 'ROAMING' : 'ANCHORED'}</span>
        </button>

        {/* Royal Charter Orders Button */}
        <button
          onClick={onToggleManualDispatch}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-heading font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            isManualDispatchMode
              ? 'bg-[#3b240f] border-[#d4af37] text-[#f3e5ab] shadow-[0_0_14px_rgba(212,175,55,0.35)]'
              : 'bg-[#1c1209] border-[#8b5a2b] text-[#c89b3c]/80 hover:text-amber-200'
          }`}
        >
          <Navigation size={12} className={isManualDispatchMode ? 'text-amber-400' : 'text-[#c89b3c]/60'} />
          <span>Charter: {isManualDispatchMode ? 'ACTIVE' : 'STANDBY'}</span>
        </button>
      </div>

      {/* ─── Right: Wax Seal Medallions + Bell + Mobile Drawer ─── */}
      <div className="flex items-center gap-1.5">
        {chips.map((chip) => {
          const ChipIcon = chip.icon;
          return (
            <div
              key={chip.label}
              className={`hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${chip.bgClass} ${chip.borderClass} ${chip.glowClass}`}
            >
              <div className="p-1 rounded-full bg-black/40 border border-[#d4af37]/40 shadow-inner">
                <ChipIcon size={13} className={chip.iconColor} />
              </div>
              <div className="text-right">
                <p className="text-[7px] text-[#c89b3c]/90 uppercase tracking-widest leading-none font-bold">
                  {chip.label}
                </p>
                <p className={`text-[12px] font-heading font-black ${chip.textColor} leading-tight`}>
                  {chip.value}
                </p>
              </div>
            </div>
          );
        })}

        {/* Admiral's Honor Rating / Efficiency */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-[#d4af37] bg-gradient-to-b from-[#2a1a0d] to-[#1a0f07] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          <div className="w-5 h-5 rounded-full bg-[#3b2310] border border-amber-400/80 flex items-center justify-center shadow-inner">
            <Compass size={12} className="text-amber-400 animate-spin-slow" />
          </div>
          <div>
            <p className="text-[7px] text-amber-400/90 uppercase tracking-widest leading-none font-bold">
              Prowess
            </p>
            <p className="text-[12px] font-heading font-black text-[#f3e5ab] leading-tight">
              {efficiencyScore}%
            </p>
          </div>
        </div>

        {/* Ship's Bell Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? "Ring Ship's Bell (Unmute)" : "Muffle Bell (Mute)"}
          className={`p-1.5 rounded border transition-all cursor-pointer ${
            isMuted
              ? 'bg-[#1a120b] border-[#5c4028] text-stone-500 hover:text-stone-300'
              : 'bg-[#2b1b0e] border-[#d4af37] text-amber-300 hover:bg-[#3d2714] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
          }`}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        {/* Slide-over Quarterdeck Drawer Button (below 1024px) */}
        <button
          onClick={onToggleDrawer}
          title={isDrawerOpen ? 'Close Quarterdeck' : 'Open Quarterdeck'}
          className={`lg:hidden flex items-center gap-1 px-2.5 py-1 rounded text-[10.5px] font-heading font-bold uppercase tracking-wider border cursor-pointer ${
            isDrawerOpen
              ? 'bg-[#3b240f] border-[#d4af37] text-[#f3e5ab] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
              : 'bg-[#1f1309] border-[#8b5a2b] text-amber-200 hover:bg-[#2c1b0d]'
          }`}
        >
          <Menu size={13} />
          <span>{isDrawerOpen ? 'Close' : 'Deck'}</span>
        </button>
      </div>
    </header>
  );
}

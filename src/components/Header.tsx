import React, { useState, useRef, useEffect } from 'react';
import {
  Anchor,
  Ship,
  AlertTriangle,
  Users,
  ShieldAlert,
  Activity,
  Gauge,
  Volume2,
  VolumeX,
  Layers,
  Trophy,
  Menu,
  Navigation,
  Wind,
  ChevronDown,
  Check,
} from 'lucide-react';
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
  isMuted,
  onToggleMute,
  isDrawerOpen,
  onToggleDrawer,
}: HeaderProps) {
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const scenarioDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        scenarioDropdownRef.current &&
        !scenarioDropdownRef.current.contains(event.target as Node)
      ) {
        setIsScenarioOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsScenarioOpen(false);
      }
    }
    if (isScenarioOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScenarioOpen]);

  const currentPreset =
    SCENARIO_PRESETS.find((p) => p.id === selectedScenarioId) || SCENARIO_PRESETS[0];

  const chips: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      label: 'Stranded',
      value: totalSurvivors,
      icon: <Users size={12} />,
      color: 'text-red-400',
    },
    {
      label: 'Rescued',
      value: totalRescued,
      icon: <ShieldAlert size={12} />,
      color: 'text-emerald-400',
    },
    {
      label: 'Free Cap',
      value: fleetCapacity,
      icon: <Ship size={12} />,
      color: 'text-sky-400',
    },
    {
      label: 'Hazards',
      value: activeHazards,
      icon: <AlertTriangle size={12} />,
      color: 'text-amber-400',
    },
    {
      label: 'Efficiency',
      value: `${efficiencyScore}%`,
      icon: <Gauge size={12} />,
      color: 'text-emerald-300',
    },
  ];

  return (
    <header className="glass-header flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 gap-2 z-30 shrink-0 transition-all landscape-compact-header">
      {/* ─── Top Bar (Mobile: Row with Brand & Key Actions) ─── */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
        {/* Left: Naval Crest & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Anchor className="text-amber-300" size={17} />
            <Activity
              className="absolute -top-1 -right-1 text-sky-400 animate-pulse"
              size={8}
            />
          </div>
          <div>
            <h1 className="font-cinzel text-xs sm:text-sm md:text-[15px] font-bold tracking-[0.16em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 uppercase leading-none flex items-center gap-1.5">
              KrakenWatch
              <span className="text-amber-500/50 font-normal hidden xs:inline font-sans">//</span>
              <span className="font-outfit text-sky-300/90 font-medium text-[10px] sm:text-xs tracking-[0.1em] hidden md:inline lowercase capitalize">
                Fleet Rescue Coordinator
              </span>
            </h1>
            <p className="font-telemetry text-[7.5px] sm:text-[8px] text-slate-400/80 tracking-widest uppercase mt-0.5 hidden xs:block landscape-hide-subtext">
              Maritime AI Command Deck • Sector 7G
            </p>
          </div>
        </div>

        {/* Mobile-Only Actions: Efficiency, Mute, Deck Drawer Toggle */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/60 backdrop-blur-md border border-emerald-500/30">
            <Gauge size={11} className="text-emerald-400" />
            <span className="text-[10px] font-telemetry font-bold text-emerald-300">
              {efficiencyScore}%
            </span>
          </div>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={`p-1.5 rounded-lg backdrop-blur-md border transition-all cursor-pointer ${
              isMuted
                ? 'bg-slate-900/60 border-slate-700/60 text-slate-500'
                : 'bg-amber-500/10 border-amber-400/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
            }`}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          <button
            onClick={onToggleDrawer}
            title={isDrawerOpen ? 'Close Command Deck' : 'Open Command Deck'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-outfit font-semibold uppercase tracking-wider border backdrop-blur-md cursor-pointer transition-all ${
              isDrawerOpen
                ? 'bg-amber-500/25 border-amber-400/80 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/70 border-amber-500/30 text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Menu size={13} />
            <span>{isDrawerOpen ? 'Close' : 'Deck'}</span>
          </button>
        </div>
      </div>

      {/* ─── Center Controls (Glass Action Strip) ─── */}
      <div className="flex items-center flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 overflow-visible py-0.5 sm:py-0 w-full sm:w-auto justify-start sm:justify-center">
        {/* "Captain's Council" 1-Click Benchmark Demo */}
        <button
          onClick={onRunBenchmark}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] sm:text-[11px] font-outfit font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
        >
          <Trophy size={13} className="text-slate-950 shrink-0" />
          <span className="whitespace-nowrap">Benchmark Run</span>
        </button>

        {/* Custom Glassmorphic Scenario Selector Dropdown */}
        <div className="relative shrink-0" ref={scenarioDropdownRef}>
          <button
            type="button"
            onClick={() => setIsScenarioOpen((prev) => !prev)}
            aria-expanded={isScenarioOpen}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10.5px] sm:text-[11px] font-outfit backdrop-blur-md border transition-all cursor-pointer ${
              isScenarioOpen
                ? 'bg-amber-500/20 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-slate-950/70 border-white/10 hover:border-amber-400/40 text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <Layers size={12} className="text-amber-400 shrink-0" />
            <span className="font-semibold text-slate-200 max-w-[130px] sm:max-w-[170px] truncate text-left">
              {currentPreset.name.replace(/^Scenario \d+:\s*/, '')}
            </span>
            <span
              className={`text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded border hidden md:inline-block ${currentPreset.badgeColor}`}
            >
              {currentPreset.tag}
            </span>
            <ChevronDown
              size={12}
              className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                isScenarioOpen ? 'rotate-180 text-amber-400' : ''
              }`}
            />
          </button>

          {/* Floating Dropdown Panel */}
          {isScenarioOpen && (
            <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-[290px] sm:w-[330px] rounded-xl bg-[#091124]/95 backdrop-blur-2xl border border-amber-500/35 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.18)] z-50 p-1.5 space-y-1 animate-fade-in">
              <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-white/[0.08] mb-1">
                <span className="font-cinzel text-[9.5px] font-bold tracking-widest text-amber-300 uppercase flex items-center gap-1.5">
                  <Layers size={10} className="text-amber-400" />
                  Mission Scenarios
                </span>
                <span className="text-[8.5px] text-slate-400 font-telemetry tracking-wider uppercase">
                  {SCENARIO_PRESETS.length} Presets
                </span>
              </div>

              {SCENARIO_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedScenarioId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onSelectScenario(preset.id);
                      setIsScenarioOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-all border flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-900/40 border-transparent hover:bg-slate-800/60 hover:border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-[11px] font-bold truncate ${
                            isSelected ? 'text-amber-200' : 'text-slate-100'
                          }`}
                        >
                          {preset.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${preset.badgeColor}`}
                        >
                          {preset.tag}
                        </span>
                        {isSelected && <Check size={12} className="text-amber-400 shrink-0 ml-0.5" />}
                      </div>
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-outfit leading-relaxed line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Storm Drift Mode Toggle */}
        <button
          onClick={onToggleAutoRoam}
          title={
            autoRoamStorms
              ? 'Cyclone Atmospheric Auto-Drift Active — Click to switch to Manual Drag'
              : 'Cyclone Manual Drag Mode Active — Click to enable Atmospheric Auto-Drift'
          }
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[10.5px] font-outfit font-semibold uppercase tracking-wider backdrop-blur-md border transition-all cursor-pointer ${
            autoRoamStorms
              ? 'bg-sky-500/15 border-sky-400/60 text-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.2)]'
              : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wind
            size={12}
            className={autoRoamStorms ? 'text-sky-400 animate-spin shrink-0' : 'text-slate-500 shrink-0'}
            style={autoRoamStorms ? { animationDuration: '6s' } : undefined}
          />
          <span className="whitespace-nowrap">Storms: {autoRoamStorms ? 'AUTO' : 'MANUAL'}</span>
        </button>

        {/* Manual Dispatch Mode Button */}
        <button
          onClick={onToggleManualDispatch}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[10.5px] font-outfit font-semibold uppercase tracking-wider backdrop-blur-md border transition-all cursor-pointer ${
            isManualDispatchMode
              ? 'bg-amber-500/20 border-amber-400/80 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.2)]'
              : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation size={11} className={isManualDispatchMode ? 'text-amber-400 shrink-0' : 'text-slate-500 shrink-0'} />
          <span className="whitespace-nowrap">Manual: {isManualDispatchMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* ─── Right: Desktop Telemetry Glass Chips + Controls ─── */}
      <div className="hidden sm:flex items-center gap-1.5 md:gap-2 shrink-0">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/50 backdrop-blur-md border border-white/[0.07] hover:border-amber-400/25 transition-all"
          >
            <span className={chip.color}>{chip.icon}</span>
            <div className="text-right">
              <p className="text-[7.5px] text-slate-400 uppercase tracking-widest leading-none font-outfit font-medium">
                {chip.label}
              </p>
              <p className={`text-[11.5px] font-telemetry font-bold ${chip.color} leading-tight mt-0.5`}>
                {chip.value}
              </p>
            </div>
          </div>
        ))}

        {/* Compact stats for tablet/medium screens */}
        <div className="flex xl:hidden items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/60 backdrop-blur-md border border-white/10 text-[10.5px] font-telemetry">
          <span className="text-red-400 flex items-center gap-1" title="Stranded Castaways">
            <Users size={12} /> {totalSurvivors}
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400 flex items-center gap-1" title="Rescued">
            <ShieldAlert size={12} /> {totalRescued}
          </span>
        </div>

        {/* Efficiency Glass Chip */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 backdrop-blur-md border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
          <Gauge size={13} className="text-emerald-400" />
          <span className="text-[11.5px] font-telemetry font-bold text-emerald-300">
            {efficiencyScore}%
          </span>
        </div>

        {/* Audio Mute Glass Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className={`p-1.5 rounded-lg backdrop-blur-md border transition-all cursor-pointer ${
            isMuted
              ? 'bg-slate-900/60 border-slate-700/60 text-slate-500 hover:text-slate-300'
              : 'bg-amber-500/10 border-amber-400/30 text-amber-300 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
          }`}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        {/* Slide-over Drawer Menu Button (below lg: 1024px) */}
        <button
          onClick={onToggleDrawer}
          title={isDrawerOpen ? 'Close Command Deck' : 'Open Command Deck'}
          className={`lg:hidden flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-outfit font-semibold uppercase tracking-wider border backdrop-blur-md cursor-pointer transition-all ${
            isDrawerOpen
              ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/70 border-amber-500/30 text-amber-300 hover:bg-slate-800'
          }`}
        >
          <Menu size={13} />
          <span>{isDrawerOpen ? 'Close' : 'Deck'}</span>
        </button>
      </div>
    </header>
  );
}

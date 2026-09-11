import React from 'react';
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
    <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 border-b border-amber-500/20 bg-[#0b1329]/95 backdrop-blur-md gap-2 z-30 shrink-0">
      {/* ─── Top Bar (Mobile: Row with Brand & Key Actions) ─── */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Anchor className="text-amber-400" size={20} />
            <Activity
              className="absolute -top-1 -right-1 text-sky-400 animate-pulse"
              size={8}
            />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold tracking-[0.14em] text-amber-100 uppercase leading-tight flex items-center gap-1.5">
              KrakenWatch
              <span className="text-amber-500/60 font-normal hidden xs:inline">//</span>
              <span className="text-sky-300 font-medium text-[10px] sm:text-xs tracking-[0.1em] hidden md:inline">
                Rescue Coordinator
              </span>
            </h1>
            <p className="text-[8px] sm:text-[8.5px] text-slate-500 tracking-widest uppercase font-mono hidden xs:block">
              Maritime AI Command • Sector 7G
            </p>
          </div>
        </div>

        {/* Mobile-Only Actions: Efficiency, Mute, Deck Drawer Toggle */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-700/60 bg-slate-900/80">
            <Gauge size={11} className="text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-emerald-300">
              {efficiencyScore}%
            </span>
          </div>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={`p-1 rounded border transition-all cursor-pointer ${
              isMuted
                ? 'bg-slate-900/60 border-slate-700 text-slate-500 hover:text-slate-300'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
            }`}
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>

          <button
            onClick={onToggleDrawer}
            title={isDrawerOpen ? 'Close Command Deck' : 'Open Command Deck'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border cursor-pointer ${
              isDrawerOpen
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
            }`}
          >
            <Menu size={12} />
            <span>{isDrawerOpen ? 'Close' : 'Deck'}</span>
          </button>
        </div>
      </div>

      {/* ─── Center Controls (Horizontally Scrollable or Flexible on Mobile) ─── */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 sm:py-0 w-full sm:w-auto justify-start sm:justify-center">
        {/* "Captain's Council" 1-Click Benchmark Demo */}
        <button
          onClick={onRunBenchmark}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-[10.5px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_18px_rgba(245,158,11,0.35)] cursor-pointer"
        >
          <Trophy size={12} className="text-slate-950 shrink-0" />
          <span className="whitespace-nowrap">Benchmark Demo</span>
        </button>

        {/* Scenario Selector */}
        <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-amber-500/25 rounded-md px-2 py-1 shadow-sm">
          <Layers size={11} className="text-amber-400 shrink-0" />
          <select
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-transparent text-[10px] sm:text-[10.5px] font-mono text-slate-200 outline-none cursor-pointer pr-1"
          >
            {SCENARIO_PRESETS.map((preset) => (
              <option
                key={preset.id}
                value={preset.id}
                className="bg-[#0b1329] text-slate-200"
              >
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Storm Drift Mode (Auto-Drift vs Manual Drag) Toggle */}
        <button
          onClick={onToggleAutoRoam}
          title={
            autoRoamStorms
              ? 'Cyclone Atmospheric Auto-Drift Active — Click to switch to Manual Drag'
              : 'Cyclone Manual Drag Mode Active — Click to enable Atmospheric Auto-Drift'
          }
          className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-md text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            autoRoamStorms
              ? 'bg-sky-500/20 border-sky-400/80 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wind
            size={11}
            className={autoRoamStorms ? 'text-sky-400 animate-spin shrink-0' : 'text-slate-500 shrink-0'}
            style={autoRoamStorms ? { animationDuration: '6s' } : undefined}
          />
          <span className="whitespace-nowrap">Storms: {autoRoamStorms ? 'AUTO' : 'MANUAL'}</span>
        </button>

        {/* Manual Dispatch Mode Button */}
        <button
          onClick={onToggleManualDispatch}
          className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-md text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            isManualDispatchMode
              ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation size={11} className={isManualDispatchMode ? 'text-amber-400 shrink-0' : 'text-slate-500 shrink-0'} />
          <span className="whitespace-nowrap">Manual: {isManualDispatchMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* ─── Right: Desktop Telemetry Chips + Controls ─── */}
      <div className="hidden sm:flex items-center gap-1 md:gap-1.5 shrink-0">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700/60 bg-slate-900/70"
          >
            <span className={chip.color}>{chip.icon}</span>
            <div className="text-right">
              <p className="text-[7.5px] text-slate-400 uppercase tracking-wider leading-none">
                {chip.label}
              </p>
              <p className={`text-[11px] font-mono font-bold ${chip.color} leading-tight`}>
                {chip.value}
              </p>
            </div>
          </div>
        ))}

        {/* Compact stats for medium screens (between sm and xl) */}
        <div className="flex xl:hidden items-center gap-1.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60 text-[10px] font-mono">
          <span className="text-red-400 flex items-center gap-0.5" title="Stranded Castaways">
            <Users size={11} /> {totalSurvivors}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-0.5" title="Rescued">
            <ShieldAlert size={11} /> {totalRescued}
          </span>
        </div>

        {/* Efficiency chip */}
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-slate-700/60 bg-slate-900/80">
          <Gauge size={12} className="text-emerald-400" />
          <span className="text-[11px] font-mono font-bold text-emerald-300">
            {efficiencyScore}%
          </span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className={`p-1.5 rounded border transition-all cursor-pointer ${
            isMuted
              ? 'bg-slate-900/60 border-slate-700 text-slate-500 hover:text-slate-300'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
          }`}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        {/* Slide-over Drawer Menu Button (below lg: 1024px) */}
        <button
          onClick={onToggleDrawer}
          title={isDrawerOpen ? 'Close Command Deck Drawer' : 'Open Command Deck Drawer'}
          className={`lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold uppercase tracking-wider border cursor-pointer ${
            isDrawerOpen
              ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
          }`}
        >
          <Menu size={13} />
          <span>{isDrawerOpen ? 'Close Deck' : 'Deck'}</span>
        </button>
      </div>
    </header>
  );
}

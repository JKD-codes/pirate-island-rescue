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
  isManualDispatchMode: boolean;
  onToggleManualDispatch: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function Header({
  totalSurvivors,
  totalRescued,
  fleetCapacity,
  activeHazards,
  efficiencyScore,
  selectedScenarioId,
  onSelectScenario,
  isManualDispatchMode,
  onToggleManualDispatch,
  isMuted,
  onToggleMute,
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
      icon: <Users size={13} />,
      color: 'text-red-400',
    },
    {
      label: 'Rescued',
      value: totalRescued,
      icon: <ShieldAlert size={13} />,
      color: 'text-emerald-400',
    },
    {
      label: 'Available Cap',
      value: fleetCapacity,
      icon: <Ship size={13} />,
      color: 'text-sky-400',
    },
    {
      label: 'Hazards',
      value: activeHazards,
      icon: <AlertTriangle size={13} />,
      color: 'text-amber-400',
    },
    {
      label: 'Efficiency',
      value: `${efficiencyScore}%`,
      icon: <Gauge size={13} />,
      color: 'text-emerald-300',
    },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-amber-500/20 bg-[#0b1329]/90 backdrop-blur-md gap-2 z-20">
      {/* ─── Left: Title cluster ─── */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Anchor className="text-amber-400" size={24} />
          <Activity
            className="absolute -top-1 -right-1 text-sky-400 animate-pulse"
            size={10}
          />
        </div>
        <div>
          <h1 className="text-xs md:text-sm font-bold tracking-[0.2em] text-amber-100 uppercase leading-tight flex items-center gap-1.5">
            KrakenWatch
            <span className="text-amber-500/60 font-normal">//</span>
            <span className="text-sky-300 font-medium text-[11px] md:text-xs tracking-[0.14em]">
              Fleet Disaster Rescue Coordinator
            </span>
          </h1>
          <p className="text-[9px] text-slate-500 tracking-widest uppercase font-mono">
            Maritime AI Dispatch Command • Sector 7G
          </p>
        </div>
      </div>

      {/* ─── Center: Presets & Manual Dispatch Toggle ─── */}
      <div className="flex items-center gap-2">
        {/* Scenario Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/25 rounded-md px-2.5 py-1 shadow-sm">
          <Layers size={13} className="text-amber-400" />
          <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider hidden sm:inline">
            Scenario:
          </span>
          <select
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-transparent text-[11px] font-mono text-slate-200 outline-none cursor-pointer pr-1"
          >
            {SCENARIO_PRESETS.map((preset) => (
              <option
                key={preset.id}
                value={preset.id}
                className="bg-[#0b1329] text-slate-200"
              >
                {preset.name} [{preset.tag}]
              </option>
            ))}
          </select>
        </div>

        {/* Manual Dispatch Mode Button */}
        <button
          onClick={onToggleManualDispatch}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            isManualDispatchMode
              ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isManualDispatchMode ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
            }`}
          />
          <span>Manual Dispatch: {isManualDispatchMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* ─── Right: Telemetry chips + Mute Button ─── */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-700/60 bg-slate-900/70"
          >
            <span className={chip.color}>{chip.icon}</span>
            <div className="text-right">
              <p className="text-[8.5px] text-slate-400 uppercase tracking-wider leading-none">
                {chip.label}
              </p>
              <p className={`text-xs font-mono font-bold ${chip.color} leading-tight`}>
                {chip.value}
              </p>
            </div>
          </div>
        ))}

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
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </header>
  );
}

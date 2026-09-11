import {
  Anchor,
  Ship,
  AlertTriangle,
  Users,
  ShieldAlert,
  Activity,
} from 'lucide-react';

interface HeaderProps {
  totalSurvivors: number;
  totalRescued: number;
  fleetCapacity: number;
  activeHazards: number;
}

export default function Header({
  totalSurvivors,
  totalRescued,
  fleetCapacity,
  activeHazards,
}: HeaderProps) {
  const chips: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      label: 'Stranded Souls',
      value: totalSurvivors,
      icon: <Users size={14} />,
      color: 'text-red-400',
    },
    {
      label: 'Rescued',
      value: totalRescued,
      icon: <ShieldAlert size={14} />,
      color: 'text-emerald-400',
    },
    {
      label: 'Fleet Capacity',
      value: fleetCapacity,
      icon: <Ship size={14} />,
      color: 'text-sky-400',
    },
    {
      label: 'Active Hazards',
      value: activeHazards,
      icon: <AlertTriangle size={14} />,
      color: 'text-amber-400',
    },
  ];

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-amber-500/20 bg-[#0b1329]/80 backdrop-blur-sm">
      {/* Title cluster */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Anchor className="text-amber-400" size={26} />
          <Activity
            className="absolute -top-1 -right-1 text-sky-400 animate-pulse"
            size={10}
          />
        </div>
        <div>
          <h1 className="text-sm md:text-base font-bold tracking-[0.25em] text-amber-100 uppercase leading-tight">
            KrakenWatch{' '}
            <span className="text-amber-500/60 font-normal">//</span>{' '}
            <span className="text-sky-300/80 font-medium text-xs md:text-sm tracking-[0.15em]">
              Fleet Disaster Rescue Coordinator
            </span>
          </h1>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">
            Maritime Emergency Command — Sector 7G
          </p>
        </div>
      </div>

      {/* Telemetry chips */}
      <div className="flex items-center gap-2 md:gap-3">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-700/60 bg-slate-900/60"
          >
            <span className={chip.color}>{chip.icon}</span>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">
                {chip.label}
              </p>
              <p className={`text-sm font-mono font-bold ${chip.color} leading-tight`}>
                {chip.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}

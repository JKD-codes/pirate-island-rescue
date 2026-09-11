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
    icon: ElementType;
    textColor: string;
    bgClass: string;
    borderClass: string;
    iconColor: string;
  }[] = [
    {
      label: 'Stranded',
      value: totalSurvivors,
      icon: Skull,
      textColor: 'text-rose-300',
      bgClass: 'bg-[#2b0c0c]',
      borderClass: 'border-[#991b1b]',
      iconColor: 'text-rose-400',
    },
    {
      label: 'Rescued',
      value: totalRescued,
      icon: Coins,
      textColor: 'text-emerald-300',
      bgClass: 'bg-[#122815]',
      borderClass: 'border-[#15803d]',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Free Berths',
      value: fleetCapacity,
      icon: Ship,
      textColor: 'text-sky-300',
      bgClass: 'bg-[#0e2133]',
      borderClass: 'border-[#0369a1]',
      iconColor: 'text-sky-400',
    },
    {
      label: 'Sea Terrors',
      value: activeHazards,
      icon: ShieldAlert,
      textColor: 'text-purple-300',
      bgClass: 'bg-[#260e2f]',
      borderClass: 'border-[#7e22ce]',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between px-4 py-2 border-b-2 border-[#c89b3c]/80 bg-gradient-to-r from-[#170e08] via-[#24160b] to-[#170e08] shadow-[0_4px_25px_rgba(0,0,0,0.85)] gap-2 z-30 shrink-0 font-heading">
      {/* ─── Left: Pirate Title & Coat of Arms ─── */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37] via-[#b48328] to-[#683f12] p-0.5 shadow-[0_0_12px_rgba(212,175,55,0.4)] flex items-center justify-center border border-[#f3e5ab] shrink-0">
          <div className="w-full h-full rounded-full bg-[#170e08] flex items-center justify-center shadow-inner">
            <Skull size={18} className="text-[#fde68a] drop-shadow" />
          </div>
        </div>
        <div>
          <h1 className="font-pirate text-xl md:text-2xl tracking-wider text-[#f3e5ab] uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-2">
            KRAKENWATCH
            <span className="text-[#c89b3c]/60 font-serif font-light text-sm">//</span>
            <span className="font-parchment text-amber-200/90 text-sm tracking-wider normal-case italic hidden sm:inline">
              High Seas Fleet Admiral
            </span>
          </h1>
          <p className="text-[9px] text-[#c89b3c]/80 tracking-widest uppercase font-heading hidden sm:block">
            Archipelago Disaster Command • Sector 7G
          </p>
        </div>
      </div>

      {/* ─── Center: Official Benchmark & Directives & Sea Chart Controls ─── */}
      <div className="flex items-center gap-2 flex-wrap">
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
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded border shadow-inner ${chip.bgClass} ${chip.borderClass}`}
            >
              <ChipIcon size={14} className={chip.iconColor} />
              <div className="text-right">
                <p className="text-[7.5px] text-[#c89b3c]/90 uppercase tracking-widest leading-none font-bold">
                  {chip.label}
                </p>
                <p className={`text-[11.5px] font-heading font-extrabold ${chip.textColor} leading-tight`}>
                  {chip.value}
                </p>
              </div>
            </div>
          );
        })}

        {/* Admiral's Honor Rating / Efficiency */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#c89b3c] bg-[#24170c] shadow-inner">
          <Compass size={14} className="text-amber-400 animate-spin-slow" />
          <div>
            <p className="text-[7px] text-amber-400/80 uppercase tracking-widest leading-none font-bold">
              Prowess
            </p>
            <p className="text-[11.5px] font-heading font-extrabold text-[#f3e5ab] leading-tight">
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

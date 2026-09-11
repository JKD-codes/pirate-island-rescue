import React, { useRef, useState, useCallback } from 'react';
import type { Island, Ship, Storm } from '../types';
import { TRIAGE_COLORS, SHIP_COLORS } from '../data/entities';

interface RadarCanvasProps {
  islands: Island[];
  ships: Ship[];
  storms: Storm[];
  onStormDrag: (stormId: string, x: number, y: number) => void;
  isManualDispatchMode?: boolean;
  selectedShipId?: string | null;
  onSelectShip?: (shipId: string) => void;
  onSelectIsland?: (island: Island) => void;
}

export default function RadarCanvas({
  islands,
  ships,
  storms,
  onStormDrag,
  isManualDispatchMode = false,
  selectedShipId = null,
  onSelectShip,
  onSelectIsland,
}: RadarCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  // Convert mouse event to SVG coordinates
  const toSVGPoint = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const svgP = pt.matrixTransform(ctm.inverse());
      return { x: svgP.x, y: svgP.y };
    },
    []
  );

  const handleMouseDown = (stormId: string) => {
    setDragging(stormId);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const { x, y } = toSVGPoint(e);
      const cx = Math.max(0, Math.min(800, x));
      const cy = Math.max(0, Math.min(600, y));
      onStormDrag(dragging, cx, cy);
    },
    [dragging, toSVGPoint, onStormDrag]
  );

  const handleMouseUp = () => setDragging(null);

  return (
    <div className="flex-1 flex items-center justify-center p-3 min-w-0">
      <div className="relative w-full max-w-[1000px] aspect-[4/3] rounded-lg border border-amber-500/15 bg-[#060a12] overflow-hidden shadow-[0_0_40px_rgba(56,189,248,0.04)]">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-sky-500/30 rounded-tl z-10" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-sky-500/30 rounded-tr z-10" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-sky-500/30 rounded-bl z-10" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-sky-500/30 rounded-br z-10" />

        {/* Radar label */}
        <div className="absolute top-2 left-3 z-10 text-[9px] font-mono text-sky-500/40 tracking-[0.2em] uppercase">
          Tactical Radar — Sector 7G
        </div>
        <div className="absolute top-2 right-3 z-10 text-[9px] font-mono text-amber-500/40 tracking-wider">
          viewBox 800×600
        </div>

        {/* Manual Dispatch Mode Status Banner */}
        {isManualDispatchMode && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded-full text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>MANUAL DISPATCH:</span>
            <span className="text-slate-200">
              {selectedShipId
                ? 'Select destination atoll on map'
                : 'Click an idle cutter to select'}
            </span>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 800 600"
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            {/* Storm pulsing glow */}
            <radialGradient id="stormGlow">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            {/* Island glow for each triage */}
            {(['Critical', 'Urgent', 'Stable'] as const).map((t) => (
              <radialGradient key={t} id={`glow-${t}`}>
                <stop offset="0%" stopColor={TRIAGE_COLORS[t].bg} stopOpacity="0.3" />
                <stop offset="100%" stopColor={TRIAGE_COLORS[t].bg} stopOpacity="0" />
              </radialGradient>
            ))}
            {/* Evacuated island glow */}
            <radialGradient id="glow-evacuated">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
            {/* Scan line gradient */}
            <linearGradient id="scanLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ─── Grid Lines ─── */}
          {Array.from({ length: 41 }, (_, i) => (
            <line
              key={`vg-${i}`}
              x1={i * 20}
              y1={0}
              x2={i * 20}
              y2={600}
              stroke="#1e3a5f"
              strokeOpacity={i % 2 === 0 ? 0.2 : 0.07}
              strokeWidth={i % 2 === 0 ? 0.5 : 0.3}
            />
          ))}
          {Array.from({ length: 31 }, (_, i) => (
            <line
              key={`hg-${i}`}
              x1={0}
              y1={i * 20}
              x2={800}
              y2={i * 20}
              stroke="#1e3a5f"
              strokeOpacity={i % 2 === 0 ? 0.2 : 0.07}
              strokeWidth={i % 2 === 0 ? 0.5 : 0.3}
            />
          ))}

          {/* ─── Scan Line Animation ─── */}
          <rect x="0" y="0" width="800" height="40" fill="url(#scanLine)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 -40; 0 600"
              dur="6s"
              repeatCount="indefinite"
            />
          </rect>

          {/* ─── Storms ─── */}
          {storms.map((storm) => (
            <g
              key={storm.id}
              className="cursor-grab active:cursor-grabbing"
              onMouseDown={() => handleMouseDown(storm.id)}
            >
              {/* Danger zone fill */}
              <circle
                cx={storm.x}
                cy={storm.y}
                r={storm.radius + 15}
                fill="url(#stormGlow)"
                stroke="#ef4444"
                strokeWidth="0.5"
                strokeOpacity="0.15"
                strokeDasharray="4 4"
              />
              {/* Pulsing outer ring */}
              <circle
                cx={storm.x}
                cy={storm.y}
                r={storm.radius}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              >
                <animate
                  attributeName="r"
                  values={`${storm.radius};${storm.radius + 8};${storm.radius}`}
                  dur="2.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  values="0.5;0.15;0.5"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Inner core */}
              <circle
                cx={storm.x}
                cy={storm.y}
                r={12}
                fill="#ef4444"
                fillOpacity="0.2"
                stroke="#ef4444"
                strokeWidth="1"
                strokeOpacity="0.6"
              >
                <animate
                  attributeName="r"
                  values="10;14;10"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Swirl lines */}
              {[0, 90, 180, 270].map((angle) => (
                <line
                  key={angle}
                  x1={storm.x}
                  y1={storm.y}
                  x2={storm.x + Math.cos((angle * Math.PI) / 180) * (storm.radius * 0.6)}
                  y2={storm.y + Math.sin((angle * Math.PI) / 180) * (storm.radius * 0.6)}
                  stroke="#ef4444"
                  strokeWidth="0.8"
                  strokeOpacity="0.3"
                  strokeDasharray="3 5"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`${angle} ${storm.x} ${storm.y}`}
                    to={`${angle + 360} ${storm.x} ${storm.y}`}
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </line>
              ))}
              {/* Storm label */}
              <text
                x={storm.x}
                y={storm.y - storm.radius - 10}
                textAnchor="middle"
                className="text-[9px] font-mono uppercase tracking-wider"
                fill="#ef4444"
                fillOpacity="0.7"
              >
                ⚠ {storm.name}
              </text>
              <text
                x={storm.x}
                y={storm.y - storm.radius + 2}
                textAnchor="middle"
                className="text-[7px] font-mono"
                fill="#fca5a5"
                fillOpacity="0.4"
              >
                R:{storm.radius}px • CAT-5
              </text>
            </g>
          ))}

          {/* ─── Islands (Voyage Constraint 3: 3 Distinct Lifecycle States) ─── */}
          {islands.map((island) => {
            const tc = TRIAGE_COLORS[island.triage];
            const remaining = Math.max(0, island.survivors - island.rescued);

            // Determine Lifecycle State: 'pending' | 'in-progress' | 'evacuated'
            const isEnRoute = ships.some(
              (s) => s.targetIslandId === island.id && (s.status === 'en-route' || s.status === 'loading')
            );
            const lifecycle: 'pending' | 'in-progress' | 'evacuated' =
              remaining <= 0
                ? 'evacuated'
                : isEnRoute || island.status === 'in-progress'
                ? 'in-progress'
                : 'pending';

            const isClickable =
              isManualDispatchMode && selectedShipId && lifecycle !== 'evacuated';

            return (
              <g
                key={island.id}
                className={isClickable ? 'cursor-pointer' : undefined}
                onClick={() => {
                  if (isClickable && onSelectIsland) {
                    onSelectIsland(island);
                  }
                }}
              >
                {/* 1. EVACUATED STATE */}
                {lifecycle === 'evacuated' && (
                  <>
                    <circle cx={island.x} cy={island.y} r={32} fill="url(#glow-evacuated)" />
                    <circle
                      cx={island.x}
                      cy={island.y}
                      r={18}
                      fill="#064e3b33"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeOpacity="0.8"
                    />
                    <text
                      x={island.x}
                      y={island.y + 4}
                      textAnchor="middle"
                      className="text-[12px] font-bold"
                      fill="#34d399"
                    >
                      ✓
                    </text>
                    <text
                      x={island.x}
                      y={island.y + 28}
                      textAnchor="middle"
                      className="text-[9px] font-semibold"
                      fill="#34d399"
                    >
                      {island.name}
                    </text>
                    {/* Status tag: SAFE (0 STRANDED) */}
                    <rect
                      x={island.x - 38}
                      y={island.y + 32}
                      width={76}
                      height={12}
                      rx={2}
                      fill="#064e3b44"
                      stroke="#10b981"
                      strokeWidth="0.8"
                    />
                    <text
                      x={island.x}
                      y={island.y + 41}
                      textAnchor="middle"
                      className="text-[7.5px] font-mono font-bold"
                      fill="#34d399"
                    >
                      SAFE (0 STRANDED)
                    </text>
                  </>
                )}

                {/* 2. IN-PROGRESS STATE */}
                {lifecycle === 'in-progress' && (
                  <>
                    <circle cx={island.x} cy={island.y} r={32} fill={`url(#glow-${island.triage})`} />
                    {/* Rotating blue dashed perimeter ring */}
                    <circle
                      cx={island.x}
                      cy={island.y}
                      r={24}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.8"
                      strokeDasharray="6 3"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${island.x} ${island.y}`}
                        to={`360 ${island.x} ${island.y}`}
                        dur="5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Reef hex */}
                    <polygon
                      points={hexPoints(island.x, island.y, 14)}
                      fill="#0f1a2e"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <text
                      x={island.x}
                      y={island.y + 4}
                      textAnchor="middle"
                      className="text-[11px]"
                      fill="#38bdf8"
                    >
                      🏝
                    </text>
                    <text
                      x={island.x}
                      y={island.y + 28}
                      textAnchor="middle"
                      className="text-[9px] font-semibold"
                      fill="#38bdf8"
                    >
                      {island.name}
                    </text>
                    {/* Status tag: RESCUE IN TRANSIT */}
                    <rect
                      x={island.x - 44}
                      y={island.y + 32}
                      width={88}
                      height={13}
                      rx={2}
                      fill="#0284c733"
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                    />
                    <text
                      x={island.x}
                      y={island.y + 42}
                      textAnchor="middle"
                      className="text-[7.5px] font-mono font-bold uppercase tracking-wider"
                      fill="#7dd3fc"
                    >
                      RESCUE IN TRANSIT
                    </text>
                    {/* Remaining badge */}
                    <rect
                      x={island.x + 14}
                      y={island.y - 22}
                      width={38}
                      height={12}
                      rx={2}
                      fill="#0369a144"
                      stroke="#38bdf8"
                      strokeWidth="0.7"
                    />
                    <text
                      x={island.x + 33}
                      y={island.y - 13}
                      textAnchor="middle"
                      className="text-[7px] font-mono font-bold"
                      fill="#38bdf8"
                    >
                      👥 {remaining}
                    </text>
                  </>
                )}

                {/* 3. PENDING STATE */}
                {lifecycle === 'pending' && (
                  <>
                    <circle cx={island.x} cy={island.y} r={32} fill={`url(#glow-${island.triage})`} />
                    {/* Pulsing amber border */}
                    <circle
                      cx={island.x}
                      cy={island.y}
                      r={22}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                    >
                      <animate
                        attributeName="stroke-opacity"
                        values="0.3;0.9;0.3"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="r"
                        values="21;24;21"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Reef hex */}
                    <polygon
                      points={hexPoints(island.x, island.y, 14)}
                      fill="#0f1a2e"
                      stroke={tc.border}
                      strokeWidth="1.5"
                    />
                    <text
                      x={island.x}
                      y={island.y + 4}
                      textAnchor="middle"
                      className="text-[11px]"
                      fill={tc.text}
                    >
                      🏝
                    </text>
                    <text
                      x={island.x}
                      y={island.y + 28}
                      textAnchor="middle"
                      className="text-[9px] font-semibold"
                      fill={tc.text}
                    >
                      {island.name}
                    </text>
                    {/* Survivor headcount badge highlighted */}
                    <rect
                      x={island.x - 20}
                      y={island.y + 31}
                      width={40}
                      height={13}
                      rx={3}
                      fill={tc.bg}
                      fillOpacity="0.25"
                      stroke={tc.border}
                      strokeWidth="0.9"
                    />
                    <text
                      x={island.x}
                      y={island.y + 41}
                      textAnchor="middle"
                      className="text-[8px] font-mono font-bold"
                      fill={tc.text}
                    >
                      👥 {remaining} left
                    </text>
                    {/* Triage tag */}
                    <rect
                      x={island.x + 14}
                      y={island.y - 22}
                      width={island.triage.length * 5.5 + 8}
                      height={12}
                      rx={2}
                      fill={tc.bg}
                      fillOpacity="0.25"
                      stroke={tc.border}
                      strokeWidth="0.6"
                    />
                    <text
                      x={island.x + 18}
                      y={island.y - 13}
                      className="text-[7px] font-mono font-bold uppercase"
                      fill={tc.text}
                    >
                      {island.triage}
                    </text>

                    {/* Algorithmic Urgency Index Badge (P_i) */}
                    {island.urgencyIndex !== 0 && isFinite(island.urgencyIndex) && (
                      <g>
                        <rect
                          x={island.x - 48}
                          y={island.y - 22}
                          width={42}
                          height={12}
                          rx={2}
                          fill="#0f172a"
                          stroke="#f59e0b"
                          strokeWidth="0.7"
                        />
                        <text
                          x={island.x - 27}
                          y={island.y - 13}
                          textAnchor="middle"
                          className="text-[7px] font-mono font-bold"
                          fill="#fbbf24"
                        >
                          P:{island.urgencyIndex.toFixed(1)}
                        </text>
                      </g>
                    )}
                  </>
                )}

                {/* Manual Dispatch Target Reticle on hover/clickable */}
                {isClickable && (
                  <circle
                    cx={island.x}
                    cy={island.y}
                    r={34}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* ─── Staging Docks (Home Ports) ─── */}
          {ships.map((ship, idx) => {
            const color = SHIP_COLORS[idx % SHIP_COLORS.length];
            return (
              <g key={`port-${ship.id}`}>
                <circle
                  cx={ship.startX}
                  cy={ship.startY}
                  r={12}
                  fill="#0b1329"
                  stroke={color}
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                  strokeOpacity="0.5"
                />
                <text
                  x={ship.startX}
                  y={ship.startY + 3}
                  textAnchor="middle"
                  className="text-[8px]"
                  fill={color}
                  fillOpacity="0.6"
                >
                  ⚓
                </text>
                <text
                  x={ship.startX}
                  y={ship.startY - 14}
                  textAnchor="middle"
                  className="text-[6.5px] font-mono tracking-wider uppercase"
                  fill={color}
                  fillOpacity="0.5"
                >
                  Port {idx + 1}
                </text>
              </g>
            );
          })}

          {/* ─── A* Route Paths ─── */}
          {ships.map((ship, idx) => {
            if (ship.path.length < 2) return null;
            const color = SHIP_COLORS[idx % SHIP_COLORS.length];
            const d = ship.path
              .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
              .join(' ');
            return (
              <g key={`path-${ship.id}`}>
                {/* Glow layer */}
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth="4"
                  strokeOpacity="0.12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Main dashed route */}
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-16"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Waypoint dots */}
                {ship.path.filter((_, i) => i > 0 && i < ship.path.length - 1 && i % 3 === 0).map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={1.5}
                    fill={color}
                    fillOpacity="0.4"
                  />
                ))}
              </g>
            );
          })}

          {/* ─── Ships ─── */}
          {ships.map((ship, idx) => {
            const color = SHIP_COLORS[idx % SHIP_COLORS.length];
            const loadPct = ship.capacity > 0 ? ship.load / ship.capacity : 0;
            const isSelected = selectedShipId === ship.id;
            const isIdle = ship.status === 'idle';
            const canSelect = isManualDispatchMode && isIdle;

            // Calculate heading rotation towards next waypoint
            let headingAngle = 0;
            if (ship.path && ship.path[ship.pathIndex]) {
              const targetWp = ship.path[ship.pathIndex];
              headingAngle =
                (Math.atan2(targetWp.y - ship.y, targetWp.x - ship.x) * 180) /
                  Math.PI +
                90;
            }

            return (
              <g
                key={ship.id}
                className={canSelect ? 'cursor-pointer' : undefined}
                onClick={() => {
                  if (canSelect && onSelectShip) {
                    onSelectShip(ship.id);
                  }
                }}
              >
                {/* Selected Cutter Targeting Reticle */}
                {isSelected && (
                  <g>
                    <circle
                      cx={ship.x}
                      cy={ship.y}
                      r={26}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.6"
                      strokeDasharray="4 2"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${ship.x} ${ship.y}`}
                        to={`360 ${ship.x} ${ship.y}`}
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x={ship.x}
                      y={ship.y - 34}
                      textAnchor="middle"
                      className="text-[7.5px] font-mono font-bold uppercase tracking-wider"
                      fill="#fbbf24"
                    >
                      [SELECTED]
                    </text>
                  </g>
                )}

                {/* Range ring */}
                <circle
                  cx={ship.x}
                  cy={ship.y}
                  r={20}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.6"
                  strokeOpacity="0.2"
                  strokeDasharray="3 3"
                />

                {/* Rotated ship hull */}
                <g transform={`rotate(${headingAngle} ${ship.x} ${ship.y})`}>
                  <polygon
                    points={shipShape(ship.x, ship.y)}
                    fill={color}
                    fillOpacity={isSelected ? 0.5 : 0.3}
                    stroke={isSelected ? '#fbbf24' : color}
                    strokeWidth={isSelected ? 2 : 1.4}
                  />
                  {/* Blinking beacon */}
                  <circle
                    cx={ship.x}
                    cy={ship.y - 5}
                    r={2}
                    fill={ship.status === 'idle' ? '#22d3ee' : '#34d399'}
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.3;1"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>

                {/* Ship name */}
                <text
                  x={ship.x}
                  y={ship.y - 24}
                  textAnchor="middle"
                  className="text-[8px] font-mono font-semibold"
                  fill={isSelected ? '#fbbf24' : color}
                >
                  {ship.name}
                </text>

                {/* Status chip */}
                {ship.status !== 'idle' && (
                  <text
                    x={ship.x}
                    y={ship.y - 15}
                    textAnchor="middle"
                    className="text-[6.5px] font-mono uppercase tracking-widest"
                    fill={ship.status === 'returning' ? '#34d399' : '#38bdf8'}
                  >
                    {ship.status}
                  </text>
                )}

                {/* Load bar background */}
                <rect
                  x={ship.x - 16}
                  y={ship.y + 14}
                  width={32}
                  height={4}
                  rx={2}
                  fill="#1e293b"
                  stroke={color}
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                />
                {/* Load bar fill */}
                <rect
                  x={ship.x - 16}
                  y={ship.y + 14}
                  width={32 * loadPct}
                  height={4}
                  rx={2}
                  fill={color}
                  fillOpacity="0.75"
                />
                {/* Load text */}
                <text
                  x={ship.x}
                  y={ship.y + 26}
                  textAnchor="middle"
                  className="text-[7px] font-mono font-bold"
                  fill={color}
                  fillOpacity="0.8"
                >
                  {ship.load}/{ship.capacity}
                </text>
              </g>
            );
          })}

          {/* ─── Coordinate labels along edges ─── */}
          {Array.from({ length: 9 }, (_, i) => (
            <text
              key={`xl-${i}`}
              x={i * 100}
              y={596}
              textAnchor="middle"
              className="text-[7px] font-mono"
              fill="#334155"
            >
              {i * 100}
            </text>
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <text
              key={`yl-${i}`}
              x={6}
              y={i * 100 + 3}
              textAnchor="start"
              className="text-[7px] font-mono"
              fill="#334155"
            >
              {i * 100}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Geometry Helpers ───
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

function shipShape(cx: number, cy: number): string {
  return [
    `${cx},${cy - 10}`,
    `${cx + 7},${cy + 2}`,
    `${cx + 4},${cy + 10}`,
    `${cx - 4},${cy + 10}`,
    `${cx - 7},${cy + 2}`,
  ].join(' ');
}

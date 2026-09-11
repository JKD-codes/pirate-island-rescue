import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { Island, Ship, Storm } from '../types';
import { TRIAGE_COLORS, SHIP_COLORS } from '../data/entities';

interface RadarCanvasProps {
  islands: Island[];
  ships: Ship[];
  storms: Storm[];
  onStormDrag: (stormId: string, x: number, y: number) => void;
  onStormDragEnd?: (stormId: string) => void;
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
  onStormDragEnd,
  isManualDispatchMode = false,
  selectedShipId = null,
  onSelectShip,
  onSelectIsland,
}: RadarCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<string | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Convert client coordinates to SVG canvas coordinates
  const clientToSVG = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgP = pt.matrixTransform(ctm.inverse());
    return {
      x: Math.max(25, Math.min(775, Math.round(svgP.x))),
      y: Math.max(25, Math.min(575, Math.round(svgP.y))),
    };
  }, []);

  // Pointer down handler on hazard sprite
  const handleHazardPointerDown = (stormId: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = stormId;
    setActiveDragId(stormId);

    const { x, y } = clientToSVG(e.clientX, e.clientY);
    onStormDrag(stormId, x, y);
  };

  // Window-level butter-smooth pointermove and pointerup (never drops or lags)
  useEffect(() => {
    if (!activeDragId) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const stormId = draggingRef.current;
      const { x, y } = clientToSVG(e.clientX, e.clientY);

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        onStormDrag(stormId, x, y);
      });
    };

    const handlePointerUp = () => {
      if (draggingRef.current) {
        const stormId = draggingRef.current;
        if (onStormDragEnd) {
          onStormDragEnd(stormId);
        }
        draggingRef.current = null;
        setActiveDragId(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [activeDragId, clientToSVG, onStormDrag, onStormDragEnd]);

  return (
    <div className="flex-1 flex items-center justify-center p-3 min-w-0 bg-[#0d0704]">
      {/* ─── Spanish Galleon Teak & Brass Studded Maritime Chart Frame ─── */}
      <div className="relative w-full max-w-[1000px] aspect-[4/3] rounded-xl border-[3px] border-[#c89b3c]/80 bg-[#05111b] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.95)] ring-4 ring-[#2c1808]">
        {/* Ornate Antique Brass Studded Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#d4af37] rounded-tl z-10 pointer-events-none drop-shadow">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f3e5ab] m-1 shadow-[0_0_4px_#f3e5ab]" />
        </div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#d4af37] rounded-tr z-10 pointer-events-none drop-shadow">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f3e5ab] ml-auto mr-1 mt-1 shadow-[0_0_4px_#f3e5ab]" />
        </div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#d4af37] rounded-bl z-10 pointer-events-none drop-shadow">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f3e5ab] ml-1 mb-1 shadow-[0_0_4px_#f3e5ab]" />
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#d4af37] rounded-br z-10 pointer-events-none drop-shadow">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f3e5ab] ml-auto mr-1 mb-1 shadow-[0_0_4px_#f3e5ab]" />
        </div>

        {/* Nautical Chart Banner Title */}
        <div className="absolute top-2 left-4 z-10 text-[10px] font-heading font-bold text-amber-200/80 tracking-[0.18em] uppercase flex items-center gap-1.5 drop-shadow">
          <span className="text-[#d4af37]">🧭</span>
          <span>Grand Sea Chart — Sector 7G</span>
        </div>
        <div className="absolute top-2 right-4 z-10 text-[9px] font-parchment text-[#c89b3c]/80 tracking-wider hidden sm:block">
          Grid: 800 × 600 Leagues
        </div>

        {/* Royal Charter Order Status Banner (Manual Dispatch Mode) */}
        {isManualDispatchMode && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 px-4 py-0.5 bg-[#2a1708]/95 border-2 border-[#d4af37] rounded-full text-[9.5px] font-heading font-bold text-[#f3e5ab] uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse">
            <span className="text-amber-400">📜</span>
            <span className="text-amber-300">ROYAL CHARTER:</span>
            <span className="text-[#f4ecd8]">
              {selectedShipId
                ? 'Decree destination atoll on the chart'
                : 'Select an idle galleon to charter'}
            </span>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full select-none"
        >
          <defs>
            {/* Storm pulsing glow */}
            <radialGradient id="stormGlow">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            {/* Monster pulsing glow */}
            <radialGradient id="monsterGlow">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
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

          {/* ─── Nautical Ocean Water Background ─── */}
          <image
            href="/water_bg.png"
            x="0"
            y="0"
            width="800"
            height="600"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.75"
            className="pointer-events-none"
          />

          {/* Deep tactical maritime tint for high HUD contrast */}
          <rect
            x="0"
            y="0"
            width="800"
            height="600"
            fill="#061224"
            opacity="0.30"
            className="pointer-events-none"
          />

          {/* ─── Antique Nautical Chart Rhumb & Coordinate Grid Lines ─── */}
          {Array.from({ length: 41 }, (_, i) => (
            <line
              key={`vg-${i}`}
              x1={i * 20}
              y1={0}
              x2={i * 20}
              y2={600}
              stroke="#c89b3c"
              strokeOpacity={i % 5 === 0 ? 0.22 : 0.05}
              strokeWidth={i % 5 === 0 ? 0.7 : 0.35}
              strokeDasharray={i % 5 === 0 ? '4 2' : undefined}
            />
          ))}
          {Array.from({ length: 31 }, (_, i) => (
            <line
              key={`hg-${i}`}
              x1={0}
              y1={i * 20}
              x2={800}
              y2={i * 20}
              stroke="#c89b3c"
              strokeOpacity={i % 5 === 0 ? 0.22 : 0.05}
              strokeWidth={i % 5 === 0 ? 0.7 : 0.35}
              strokeDasharray={i % 5 === 0 ? '4 2' : undefined}
            />
          ))}

          {/* ─── Antique Compass Rose Watermark ─── */}
          <g transform="translate(710, 85)" opacity="0.3" className="pointer-events-none">
            <circle r="40" fill="none" stroke="#d4af37" strokeWidth="0.8" strokeDasharray="3 2" />
            <circle r="34" fill="none" stroke="#c89b3c" strokeWidth="1" />
            <circle r="5" fill="#f59e0b" fillOpacity="0.4" />
            {/* 8-pointed Nautical Star */}
            <polygon points="0,-34 3,-7 34,0 3,7 0,34 -3,7 -34,0 -3,-7" fill="#d4af37" fillOpacity="0.35" stroke="#d4af37" strokeWidth="0.8" />
            <polygon points="0,-34 3,-6 0,-1 -3,-6" fill="#f59e0b" />
            <text x="0" y="-38" textAnchor="middle" fill="#f3e5ab" className="text-[10px] font-pirate font-bold">N</text>
            <text x="0" y="46" textAnchor="middle" fill="#d4af37" className="text-[8.5px] font-pirate font-bold">S</text>
            <text x="44" y="3" textAnchor="middle" fill="#d4af37" className="text-[8.5px] font-pirate font-bold">E</text>
            <text x="-44" y="3" textAnchor="middle" fill="#d4af37" className="text-[8.5px] font-pirate font-bold">W</text>
          </g>

          {/* ─── Golden Navigational Chart Sunbeam / Shimmer ─── */}
          <rect x="0" y="0" width="800" height="35" fill="url(#scanLine)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 -40; 0 600"
              dur="8s"
              repeatCount="indefinite"
            />
          </rect>

          {/* ─── Storms & Sea Monsters ─── */}
          {storms.map((storm) => {
            const isMonster =
              storm.type === 'monster' ||
              storm.id.includes('monster') ||
              storm.name.toLowerCase().includes('kraken') ||
              storm.name.toLowerCase().includes('maw');
            const hazardImg = storm.image || (isMonster ? '/deep_sea_monster.png' : '/cyclone.png');
            const glowId = isMonster ? 'monsterGlow' : 'stormGlow';
            const themeColor = isMonster ? '#c084fc' : '#ef4444';
            const borderColor = isMonster ? '#a855f7' : '#ef4444';

            return (
              <g
                key={storm.id}
                className="cursor-grab active:cursor-grabbing touch-none select-none"
                onPointerDown={(e) => handleHazardPointerDown(storm.id, e)}
              >
                {/* 1. Danger zone radial glow fill */}
                <circle
                  cx={storm.x}
                  cy={storm.y}
                  r={storm.radius + 15}
                  fill={`url(#${glowId})`}
                  stroke={borderColor}
                  strokeWidth="0.8"
                  strokeOpacity="0.25"
                  strokeDasharray="4 4"
                />

                {/* 2. Pulsing outer hazard perimeter */}
                <circle
                  cx={storm.x}
                  cy={storm.y}
                  r={storm.radius}
                  fill="none"
                  stroke={borderColor}
                  strokeWidth="1.6"
                  strokeOpacity="0.65"
                  strokeDasharray={isMonster ? '6 4' : '8 3'}
                >
                  <animate
                    attributeName="r"
                    values={`${storm.radius};${storm.radius + 6};${storm.radius}`}
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    values="0.65;0.25;0.65"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* 3. Deep water disturbance shadow */}
                <ellipse
                  cx={storm.x}
                  cy={storm.y + 10}
                  rx={storm.radius * 0.75}
                  ry={storm.radius * 0.4}
                  fill="#030712"
                  fillOpacity="0.6"
                  className="pointer-events-none"
                />

                {/* 4. Hazard Visual Sprite Artwork */}
                <g transform={`translate(${storm.x}, ${storm.y})`}>
                  {isMonster ? (
                    // Deep Sea Kraken: Tentacles emerging with gentle breathing sway
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0 -4; 0 4; 0 -4"
                        dur="3.2s"
                        repeatCount="indefinite"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="-2; 2; -2"
                        dur="5s"
                        repeatCount="indefinite"
                        additive="sum"
                      />
                      <image
                        href={hazardImg}
                        x={-storm.radius * 0.9}
                        y={-storm.radius * 0.9}
                        width={storm.radius * 1.8}
                        height={storm.radius * 1.8}
                        preserveAspectRatio="xMidYMid meet"
                        className="pointer-events-none filter drop-shadow-[0_8px_20px_rgba(147,51,234,0.6)]"
                      />
                    </g>
                  ) : (
                    // Category-5 Cyclone: Continuously spinning hurricane vortex
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0"
                        to="360"
                        dur="14s"
                        repeatCount="indefinite"
                      />
                      <image
                        href={hazardImg}
                        x={-storm.radius * 0.95}
                        y={-storm.radius * 0.95}
                        width={storm.radius * 1.9}
                        height={storm.radius * 1.9}
                        preserveAspectRatio="xMidYMid meet"
                        className="pointer-events-none filter drop-shadow-[0_8px_24px_rgba(239,68,68,0.55)]"
                      />
                    </g>
                  )}
                </g>

                {/* 5. Warning Label & Hazard Classification Tag */}
                <rect
                  x={storm.x - 65}
                  y={storm.y - storm.radius - 22}
                  width={130}
                  height={14}
                  rx={3}
                  fill="#090d16"
                  fillOpacity="0.88"
                  stroke={borderColor}
                  strokeWidth="0.8"
                />
                <text
                  x={storm.x}
                  y={storm.y - storm.radius - 12}
                  textAnchor="middle"
                  className="text-[8px] font-mono uppercase tracking-wider font-bold"
                  fill={themeColor}
                >
                  {storm.name}
                </text>
                <text
                  x={storm.x}
                  y={storm.y - storm.radius - 2}
                  textAnchor="middle"
                  className="text-[7px] font-mono"
                  fill={isMonster ? '#e9d5ff' : '#fca5a5'}
                  fillOpacity="0.75"
                >
                  R:{storm.radius}px • {isMonster ? 'APEX HAZARD' : 'CAT-5 VORTEX'}
                </text>
              </g>
            );
          })}

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

            const islandImg =
              island.image ||
              (island.name.includes('Skull')
                ? '/pirate_skull_island.png'
                : island.name.includes('Tortuga')
                ? '/tortuga_island.png'
                : island.name.includes('Siren')
                ? '/siren_island.png'
                : '/razor_reef.png');

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
                {/* 1. Shallow Lagoon Reef Water Aura & Ripple */}
                <ellipse
                  cx={island.x}
                  cy={island.y + 12}
                  rx={36}
                  ry={14}
                  fill={lifecycle === 'evacuated' ? '#064e3b' : '#0284c7'}
                  fillOpacity="0.28"
                  className="pointer-events-none"
                />
                <ellipse
                  cx={island.x}
                  cy={island.y + 12}
                  rx={38}
                  ry={15}
                  fill="none"
                  stroke={lifecycle === 'evacuated' ? '#34d399' : '#38bdf8'}
                  strokeWidth="0.8"
                >
                  <animate
                    attributeName="rx"
                    values="34;44;34"
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="ry"
                    values="13;18;13"
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    values="0.35;0.05;0.35"
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
                </ellipse>

                {/* 2. 2.5D Isometric Island Sprite Image */}
                <image
                  href={islandImg}
                  x={island.x - 38}
                  y={island.y - 36}
                  width={76}
                  height={66}
                  preserveAspectRatio="xMidYMid meet"
                  className="pointer-events-none filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.85)]"
                />

                {/* 3. LIFECYCLE STATE OVERLAYS */}

                {/* ─── A. EVACUATED STATE ─── */}
                {lifecycle === 'evacuated' && (
                  <>
                    <circle cx={island.x} cy={island.y + 4} r={36} fill="url(#glow-evacuated)" />
                    <circle
                      cx={island.x}
                      cy={island.y + 4}
                      r={26}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      strokeOpacity="0.8"
                    />
                    {/* Secured Checkmark Shield */}
                    <circle
                      cx={island.x}
                      cy={island.y - 20}
                      r={9}
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="1.5"
                    />
                    <text
                      x={island.x}
                      y={island.y - 16}
                      textAnchor="middle"
                      className="text-[10px] font-bold"
                      fill="#34d399"
                    >
                      ✓
                    </text>
                    {/* Island Name */}
                    <text
                      x={island.x}
                      y={island.y + 34}
                      textAnchor="middle"
                      className="text-[9px] font-semibold"
                      fill="#34d399"
                    >
                      {island.name}
                    </text>
                    {/* Status tag: SAFE (0 STRANDED) */}
                    <rect
                      x={island.x - 42}
                      y={island.y + 38}
                      width={84}
                      height={12}
                      rx={2}
                      fill="#064e3b55"
                      stroke="#10b981"
                      strokeWidth="0.8"
                    />
                    <text
                      x={island.x}
                      y={island.y + 47}
                      textAnchor="middle"
                      className="text-[7.5px] font-mono font-bold"
                      fill="#34d399"
                    >
                      SAFE (0 STRANDED)
                    </text>
                  </>
                )}

                {/* ─── B. IN-PROGRESS STATE ─── */}
                {lifecycle === 'in-progress' && (
                  <>
                    <circle cx={island.x} cy={island.y + 4} r={38} fill={`url(#glow-${island.triage})`} />
                    {/* Rotating blue dashed tactical perimeter ring */}
                    <circle
                      cx={island.x}
                      cy={island.y + 4}
                      r={30}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.8"
                      strokeDasharray="6 3"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${island.x} ${island.y + 4}`}
                        to={`360 ${island.x} ${island.y + 4}`}
                        dur="5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Rescue Anchor Badge */}
                    <circle
                      cx={island.x}
                      cy={island.y - 20}
                      r={8}
                      fill="#0284c7"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <text
                      x={island.x}
                      y={island.y - 16}
                      textAnchor="middle"
                      className="text-[9px]"
                      fill="#ffffff"
                    >
                      ⚓
                    </text>
                    {/* Island Name */}
                    <text
                      x={island.x}
                      y={island.y + 34}
                      textAnchor="middle"
                      className="text-[9px] font-semibold"
                      fill="#38bdf8"
                    >
                      {island.name}
                    </text>
                    {/* Status tag: RESCUE IN TRANSIT */}
                    <rect
                      x={island.x - 46}
                      y={island.y + 38}
                      width={92}
                      height={13}
                      rx={2}
                      fill="#0284c744"
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                    />
                    <text
                      x={island.x}
                      y={island.y + 48}
                      textAnchor="middle"
                      className="text-[7.5px] font-mono font-bold uppercase tracking-wider"
                      fill="#7dd3fc"
                    >
                      RESCUE IN TRANSIT
                    </text>
                    {/* Remaining badge */}
                    <rect
                      x={island.x + 18}
                      y={island.y - 28}
                      width={38}
                      height={12}
                      rx={2}
                      fill="#0369a166"
                      stroke="#38bdf8"
                      strokeWidth="0.7"
                    />
                    <text
                      x={island.x + 37}
                      y={island.y - 19}
                      textAnchor="middle"
                      className="text-[7px] font-mono font-bold"
                      fill="#38bdf8"
                    >
                      👥 {remaining}
                    </text>
                  </>
                )}

                {/* ─── C. PENDING STATE ─── */}
                {lifecycle === 'pending' && (
                  <>
                    <circle cx={island.x} cy={island.y + 4} r={38} fill={`url(#glow-${island.triage})`} />
                    {/* Pulsing triage color border */}
                    <circle
                      cx={island.x}
                      cy={island.y + 4}
                      r={28}
                      fill="none"
                      stroke={tc.border}
                      strokeWidth="1.6"
                    >
                      <animate
                        attributeName="stroke-opacity"
                        values="0.3;0.9;0.3"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="r"
                        values="26;30;26"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Island Name */}
                    <text
                      x={island.x}
                      y={island.y + 34}
                      textAnchor="middle"
                      className="text-[9px] font-semibold"
                      fill={tc.text}
                    >
                      {island.name}
                    </text>
                    {/* Survivor headcount badge highlighted */}
                    <rect
                      x={island.x - 36}
                      y={island.y + 38}
                      width={72}
                      height={13}
                      rx={3}
                      fill={tc.bg}
                      fillOpacity="0.25"
                      stroke={tc.border}
                      strokeWidth="0.9"
                    />
                    <text
                      x={island.x}
                      y={island.y + 48}
                      textAnchor="middle"
                      className="text-[7.5px] font-mono font-bold tracking-wider"
                      fill={tc.text}
                    >
                      {remaining} STRANDED
                    </text>
                    {/* Triage tag */}
                    <rect
                      x={island.x + 18}
                      y={island.y - 28}
                      width={island.triage.length * 5.5 + 8}
                      height={12}
                      rx={2}
                      fill={tc.bg}
                      fillOpacity="0.3"
                      stroke={tc.border}
                      strokeWidth="0.6"
                    />
                    <text
                      x={island.x + 22}
                      y={island.y - 19}
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
                          y={island.y - 28}
                          width={42}
                          height={12}
                          rx={2}
                          fill="#0f172a"
                          stroke="#f59e0b"
                          strokeWidth="0.7"
                        />
                        <text
                          x={island.x - 27}
                          y={island.y - 19}
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

                {/* ─── D. MANUAL DISPATCH RETICLE CROSSHAIR ─── */}
                {isClickable && (
                  <g>
                    <circle
                      cx={island.x}
                      cy={island.y + 4}
                      r={38}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                      className="animate-pulse"
                    />
                    <line
                      x1={island.x - 44}
                      y1={island.y + 4}
                      x2={island.x - 28}
                      y2={island.y + 4}
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                    <line
                      x1={island.x + 28}
                      y1={island.y + 4}
                      x2={island.x + 44}
                      y2={island.y + 4}
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                    <line
                      x1={island.x}
                      y1={island.y - 40}
                      x2={island.x}
                      y2={island.y - 24}
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                    <line
                      x1={island.x}
                      y1={island.y + 32}
                      x2={island.x}
                      y2={island.y + 48}
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                  </g>
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
            const isHolding = ship.status === 'holding';
            const isMoving = ship.status === 'en-route' || ship.status === 'returning';
            const canSelect = isManualDispatchMode && isIdle;

            // Boat sprite image mapping
            const boatImg =
              idx === 0 ? '/boat_1.png' : idx === 1 ? '/boat_2.png' : '/boat_3.png';

            // Calculate direction vector towards current waypoint
            let dx = 0;
            let dy = 0;
            if (ship.path && ship.path[ship.pathIndex]) {
              const targetWp = ship.path[ship.pathIndex];
              dx = targetWp.x - ship.x;
              dy = targetWp.y - ship.y;
            }

            // Sprite naturally faces down-left. If sailing eastward (dx > 0.05), flip horizontally
            const isFacingRight = dx > 0.05;

            // Dynamic pitch angle tilting into wave trajectory (-14 to +14 deg)
            const dist = Math.hypot(dx, dy) || 1;
            const pitchDeg = isMoving
              ? Math.max(-14, Math.min(14, (dy / dist) * 16)) * (isFacingRight ? -1 : 1)
              : 0;

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
                {/* 1. Dynamic Water Foam Wake when sailing */}
                {isMoving && (
                  <g className="pointer-events-none">
                    <ellipse
                      cx={ship.x + (isFacingRight ? -22 : 22)}
                      cy={ship.y + 12}
                      rx={9}
                      ry={3.5}
                      fill="#ffffff"
                      fillOpacity="0.4"
                    >
                      <animate
                        attributeName="rx"
                        values="6;16;6"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0.1;0.6"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                    </ellipse>
                    <ellipse
                      cx={ship.x + (isFacingRight ? -30 : 30)}
                      cy={ship.y + 14}
                      rx={13}
                      ry={4.5}
                      fill="#38bdf8"
                      fillOpacity="0.25"
                    >
                      <animate
                        attributeName="rx"
                        values="9;22;9"
                        dur="1.1s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.4;0.05;0.4"
                        dur="1.1s"
                        repeatCount="indefinite"
                      />
                    </ellipse>
                  </g>
                )}

                {/* 2. Waterline Hull Shadow (Realistic displacement in water) */}
                <ellipse
                  cx={ship.x}
                  cy={ship.y + 14}
                  rx={22}
                  ry={6}
                  fill="#030814"
                  fillOpacity="0.6"
                  className="pointer-events-none"
                />

                {/* 3. Selected Cutter Targeting Reticle */}
                {isSelected && (
                  <g>
                    <circle
                      cx={ship.x}
                      cy={ship.y + 6}
                      r={30}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.8"
                      strokeDasharray="5 3"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${ship.x} ${ship.y + 6}`}
                        to={`360 ${ship.x} ${ship.y + 6}`}
                        dur="3.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x={ship.x}
                      y={ship.y - 36}
                      textAnchor="middle"
                      className="text-[7.5px] font-mono font-bold uppercase tracking-wider"
                      fill="#fbbf24"
                    >
                      [SELECTED CUTTER]
                    </text>
                  </g>
                )}

                {/* 4. Range ring */}
                <circle
                  cx={ship.x}
                  cy={ship.y + 6}
                  r={24}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.6"
                  strokeOpacity="0.25"
                  strokeDasharray="3 3"
                />

                {/* 5. Animated Buoyancy Bobbing & Rocking */}
                <g transform={`translate(${ship.x}, ${ship.y})`}>
                  <g>
                    {/* Vertical wave swell bobbing */}
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values={isHolding ? '0 -1; 0 1; 0 -1' : '0 -2.5; 0 2.5; 0 -2.5'}
                      dur={isHolding ? '4s' : `${2.2 + idx * 0.4}s`}
                      repeatCount="indefinite"
                    />
                    {/* Gentle ocean roll rocking */}
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values={isHolding ? '-1.5; 1.5; -1.5' : '-2.5; 2.5; -2.5'}
                      dur={isHolding ? '4.5s' : `${2.8 + idx * 0.3}s`}
                      repeatCount="indefinite"
                      additive="sum"
                    />

                    {/* Flipped & pitched boat sprite image */}
                    <g transform={`scale(${isFacingRight ? -1 : 1}, 1) rotate(${pitchDeg})`}>
                      <image
                        href={boatImg}
                        x={-28}
                        y={-24}
                        width={56}
                        height={48}
                        preserveAspectRatio="xMidYMid meet"
                        className="drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] filter"
                      />
                    </g>
                  </g>
                </g>

                {/* 6. Heaved-To Holding Shelter Aura */}
                {isHolding && (
                  <circle
                    cx={ship.x}
                    cy={ship.y + 6}
                    r={28}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.6"
                    strokeDasharray="3 3"
                  >
                    <animate
                      attributeName="stroke-opacity"
                      values="0.3;1;0.3"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* 7. Mast Beacon Light */}
                <circle
                  cx={ship.x}
                  cy={ship.y - 18}
                  r={2.2}
                  fill={isIdle ? '#22d3ee' : isHolding ? '#f59e0b' : '#34d399'}
                >
                  <animate
                    attributeName="opacity"
                    values="1;0.3;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* 8. Ship Name Banner */}
                <rect
                  x={ship.x - 36}
                  y={ship.y - 30}
                  width={72}
                  height={11}
                  rx={2}
                  fill="#070e1c"
                  fillOpacity="0.85"
                  stroke={isSelected ? '#fbbf24' : color}
                  strokeWidth="0.7"
                />
                <text
                  x={ship.x}
                  y={ship.y - 22}
                  textAnchor="middle"
                  className="text-[7.5px] font-mono font-bold"
                  fill={isSelected ? '#fbbf24' : color}
                >
                  {ship.name}
                </text>

                {/* 9. Status Chip */}
                {!isIdle && (
                  <text
                    x={ship.x}
                    y={ship.y + 24}
                    textAnchor="middle"
                    className="text-[6.5px] font-mono uppercase tracking-widest font-bold drop-shadow"
                    fill={
                      ship.status === 'returning'
                        ? '#34d399'
                        : isHolding
                        ? '#fbbf24'
                        : '#38bdf8'
                    }
                  >
                    {isHolding ? 'HEAVED TO' : ship.status}
                  </text>
                )}

                {/* 10. Load Bar */}
                <rect
                  x={ship.x - 18}
                  y={ship.y + 28}
                  width={36}
                  height={4.5}
                  rx={2}
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth="0.6"
                  strokeOpacity="0.4"
                />
                <rect
                  x={ship.x - 18}
                  y={ship.y + 28}
                  width={36 * loadPct}
                  height={4.5}
                  rx={2}
                  fill={color}
                  fillOpacity="0.85"
                />
                {/* Load text */}
                <text
                  x={ship.x}
                  y={ship.y + 40}
                  textAnchor="middle"
                  className="text-[6.5px] font-mono font-bold"
                  fill={color}
                  fillOpacity="0.9"
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

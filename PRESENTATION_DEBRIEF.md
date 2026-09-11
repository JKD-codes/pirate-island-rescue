# 🏴‍☠️ [PS #05] Pirate Island Rescue: Algorithmic Fleet Coordinator
## Complete Executive Briefing, Technical Formulation & Presentation Dossier

---

### 1. Executive Summary & Problem Compliance

| Item | Problem Statement Specification | KrakenWatch Implementation Status |
| :--- | :--- | :--- |
| **Category** | AI / ML Algorithmic Coordination | ✅ **100% Implemented & Verified** |
| **Core Problem** | Formulate an algorithmic fleet disaster rescue coordinator that schedules rescue cutters to atolls with varying castaway populations, optimizing vessel capacities, distances, and survivor urgency. | ✅ **Solved via Greedy Urgency-Weighted A\* Pathfinding & Real-Time Dynamic Shuttling Engine** |
| **Expected Solution 1** | Disaster dispatch dashboard | ✅ **Interactive 2D Naval Radar & Command Deck (`RadarCanvas.tsx`, `Sidebar.tsx`)** |
| **Expected Solution 2** | Islands with stranded headcounts | ✅ **5 Atolls with live headcounts, triage badges, urgency indices, & status tracking** |
| **Expected Solution 3** | Rescue ship fleet capacities | ✅ **Multi-cutter fleet with berth capacity tracking, current load, and speed parameters** |
| **Expected Solution 4** | Interactive ship-to-island dispatch assignments | ✅ **Dual Dispatch: 1-Click Automated Solver + Manual Tactical Point-and-Click Dispatcher** |
| **Expected Solution 5** | Real-time rescue tallies | ✅ **Live Telemetry HUD: Stranded, Rescued, Available Berths, Hazards, Efficiency %** |
| **Expected Solution 6** | Automated optimal rescue itinerary solver | ✅ **Multi-objective optimization algorithm running in `dispatch.ts` & `simulation.ts`** |

---

### 2. Operational Constraints Identified & Resolved

During maritime rescue operations, naïve shortest-path models fail due to real-world physical and naval limitations. KrakenWatch enforces **6 key operational constraints**:

```
                                 [ HARBOR BASE ]
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        [ Capacity Constraint ]               [ Hazard Collision Avoidance ]
     - Cutter load <= max capacity          - Category-5 storm exclusion rings
     - Overflow requires split trips        - A* dynamic pathfinding bypass
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       ▼
                       [ Maritime "Heave-To" Protocol ]
                        - Ship holds outside danger ring
                        - Waits for cyclone to pass safely
                                       │
                                       ▼
                         [ Urgency-Weighted Triage ]
                        - Evaluates P_i index
                        - Prioritizes critical & storm-threatened
                                       │
                                       ▼
                       [ Round-Trip Shuttling Loop ]
                        - Offload survivors at home port
                        - Free capacity -> Launch next sortie
```

#### Constraint 1: Vessel Passenger Berth Limits ($L_j \le C_j$)
- **Rule**: A rescue cutter cannot embark more passengers than its certified berth capacity ($C_j$).
- **Handling**: If an island has $N = 75$ castaways and a cutter has $C = 50$, the system loads exactly 50 passengers, leaving $25$ castaways queued for either an accompanying cutter or a subsequent sortie.

#### Constraint 2: Safe Port Shuttling & Disembarkation Loop
- **Rule**: Rescued castaways must be brought to safety. Cutters cannot carry passengers indefinitely or exceed their displacement limits.
- **Handling**: Once loaded or full, cutters automatically plot an A* return vector to the home naval staging port (`startX, startY`). Upon docking, passengers are disembarked (`load = 0`), berths are freed, and the cutter redeploys to remaining high-urgency atolls.

#### Constraint 3: Severe Hazard Collision Avoidance (Category-5 Typhoons)
- **Rule**: Category-5 cyclonic vortexes (danger radius $75\text{px} - 95\text{px}$) actively drift across the maritime theatre. Ships cannot cross through a storm eye or inner radius.
- **Handling**: The system uses a continuous grid-based **A\* Pathfinding Algorithm** with obstacle buffer zones ($+15\text{px}$ safety perimeter) to calculate detour waypoints around storm perimeters.

#### Constraint 4: Dynamic Re-routing & Maritime "Heave-To" Safety Holding
- **Rule**: Because cyclones roam atmospherically, a storm can drift directly across a cutter's pre-calculated path or settle directly over a target atoll mid-voyage.
- **Handling**: 
  - If a waypoint is engulfed, the cutter calculates an instant dynamic bypass.
  - If passage is completely blocked or the island itself is engulfed, the cutter initiates an authentic **"Heaved-To"** holding pattern (halting safely in open water outside the storm perimeter) until the storm eye clears before resuming approach.

#### Constraint 5: Multi-Factor Survivor Urgency ($P_i$)
- **Rule**: Rescue scheduling must not simply visit the closest island; it must weigh medical triage status, survivor headcount, and storm proximity.
- **Handling**: Calculated in real-time via the Urgency Formula (detailed below).

#### Constraint 6: Strict Island Lifecycle Progression
- **Rule**: Islands must reflect accurate evacuation states to prevent double-dispatch or abandoned castaways.
- **Handling**: Strict 3-state progression:
  $$\text{Pending (Unserviced)} \longrightarrow \text{In-Progress (En Route / Embarking)} \longrightarrow \text{Evacuated (100\% Secured)}$$

---

### 3. Algorithmic Formulations

#### 1. Urgency Index Metric ($P_i$)
Located in `src/algorithms/urgency.ts`:
$$P_i = (\text{RemainingCastaways} \times 1.5) + \text{TriageBonus} - (\text{DistanceToNearestStorm} \times 0.25)$$

Where:
- $\text{TriageBonus}(\text{Critical}) = +50$
- $\text{TriageBonus}(\text{Urgent}) = +25$
- $\text{TriageBonus}(\text{Stable}) = +10$
- $\text{DistanceToNearestStorm} = \min_{s \in \text{Storms}} \sqrt{(x_i - x_s)^2 + (y_i - y_s)^2}$

*Why this works:* Islands with large populations and critical triage score high, and if a cyclone drifts toward them (low $\text{DistanceToNearestStorm}$), their urgency increases drastically.

#### 2. Cost-to-Serve Vessel Allocation Function
Located in `src/algorithms/dispatch.ts`:
For each prioritized island, the coordinator selects the idle vessel $j$ that minimizes:
$$\text{Cost}(j, i) = \frac{\text{Distance}_{A^*}(j, i)}{\text{RemainingCapacity}_j \times \text{Speed}_j}$$

*Why this works:* Fast cutters with high free capacity receive priority for distant or densely populated atolls, maximizing passenger-miles-per-hour and minimizing fleet idle time.

#### 3. Grid-Based A\* Pathfinding
Located in `src/algorithms/astar.ts`:
$$f(n) = g(n) + h(n)$$
- $g(n)$: Exact path travel cost from start node.
- $h(n)$: Euclidean distance heuristic to target destination.
- Nodes falling within $\text{StormRadius} + \text{Buffer}$ are marked as non-traversable barriers with dynamic 8-directional neighbor exploration and real-time waypoint smoothing.

---

### 4. Novelty: What We Added Beyond Baseline Requirements

Aside from fulfilling all baseline requirements, KrakenWatch includes several advanced features that elevate it:

1. **Manual Tactical Dispatch Mode**:
   - Beyond the automated solver, dispatchers can click any cutter and atoll to open an interactive modal with a custom passenger slider, real-time A* path projection, and transit ETA estimation.
2. **Dual Atmospheric Storm Control**:
   - Evaluators can toggle between **Natural Atmospheric Auto-Drift** (realistic cyclonic wandering) and **Manual Drag-and-Drop Mode** (allowing judges to move storm vortexes in real-time to test the AI's instant obstacle evasion).
3. **"Captain's Council" 1-Click Benchmark Demo**:
   - A dedicated header button that resets the archipelago, enables procedural audio, executes the optimal multi-cutter itinerary, and plays out the rescue sequence for presentations.
4. **Crisis S.O.S. Emergency Radio Ping**:
   - An interactive event trigger that injects unexpected survivor surges mid-operation, forcing the fleet coordinator to dynamically recalculate priority queues on the fly.
5. **Procedural Web Audio Synthesizer**:
   - Built with the native browser Web Audio API: generates sonar pings, hazard alert sirens, docking clearance bells, and mission accomplishment fanfares without any external MP3 files.
6. **Post-Mission Debrief & Analytics Modal**:
   - Comprehensive performance debrief tracking: Total Rescued, Casualties (0), Fleet Utilization %, Average Speed, and a chronological mission ledger.
7. **Bespoke Maritime Glassmorphic UI**:
   - Custom fonts (`Cinzel`, `Outfit`, `JetBrains Mono`), animated radar sweep line, dynamic nautical wakes, ship heading angle rotation, and custom frosted glass dropdowns.
8. **Landscape Mobile Cockpit Mode**:
   - Responsive layout with orientation advisor banner and compact landscape cockpit controls for mobile presentations.

---

### 5. Step-by-Step Presentation & Demo Script

Use this 2-minute walkthrough when presenting to judges:

1. **Introduction (15s)**:
   > *"Judges, welcome to KrakenWatch: our AI-driven fleet disaster rescue coordinator built for Problem Statement #05. In maritime disasters, traditional routing fails because storms roam dynamically, ship berths are strictly limited, and castaway medical urgency changes every second."*

2. **The Dashboard & Baseline Scenario (30s)**:
   > *"On screen is Sector 7G. You can see 5 atolls with 148 total stranded castaways, color-coded by medical triage—from Critical in red to Stable in emerald. In our staging port are 3 rescue cutters, each with unique speeds and passenger capacities, and 2 Category-5 roaming cyclonic storms."*

3. **Demonstrating the Optimal Solver (30s)**:
   > *"Click **'Benchmark Run'** (or **'Solve Optimal Dispatch'**). Watch our multi-tier algorithm immediately compute Urgency Indices ($P_i$), assign cutters via our $\frac{\text{Distance}}{\text{Capacity} \times \text{Speed}}$ cost function, and plot obstacle-free A\* paths around the typhoons. Cutters embark castaways, shuttle them back to harbor, disembark, and immediately launch subsequent sorties until 100% of survivors are saved."*

4. **Demonstrating Real-Time Resilience & Obstacle Avoidance (30s)**:
   > *"Notice what happens if a storm drifts directly into a ship's path: the ship automatically computes an evasive bypass, or if completely blocked, executes the maritime 'Heave-To' protocol—holding safely outside the danger ring until the gale passes. Zero ship losses, zero casualties."*

5. **Highlighting Manual Control & Post-Mission Debrief (15s)**:
   > *"We also provide a Tactical Manual Dispatch mode for human operators, and upon completing the operation, our Mission Debrief modal provides a full operational ledger with 100% rescue efficiency and zero casualties."*

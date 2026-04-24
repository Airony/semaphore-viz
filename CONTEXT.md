# semaphore-viz — Application Context

> Generated: 2026-04-24  
> Purpose: Reference document for future tasks on this codebase.

---

## Project Overview

A step-by-step interactive visualization of a semaphore-controlled road intersection, based on a French OS synchronisation homework exercise (*Devoir maison — Systèmes d'exploitation*).

Users select one of **7 scenarios**, then step through each logical semaphore operation watching:
- Cars move along roads in an SVG intersection
- Semaphore values update with colour coding
- Shared variables (`feux`, `enAttente`) highlight on change
- Pseudocode highlights the currently-executing line(s)
- A French description narrates each step

**Stack:** Vite + React 19 + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`)  
**Dev server:** `npm run dev` → http://localhost:5173  
**Build:** `npm run build` (runs `tsc -b && vite build`)  
**Root:** `/home/raouf/semaphore-viz`

---

## Domain Model

### Shared variables (the exercise)
| Variable | Init | Role |
|---|---|---|
| `feux` | `1` | Which road has the green light (1 or 2) |
| `enAttente` | `false` | True when a car is blocked waiting for `Changement()` |

### Semaphores
| Semaphore | Init | Role |
|---|---|---|
| `mutexFeux` | `1` | Mutex protecting `feux` and `enAttente` |
| `queue1` | `1` | Mutual exclusion for road 1 queue (1 car at a time) |
| `queue2` | `1` | Mutual exclusion for road 2 queue (1 car at a time) |
| `signalAttente` | `0` | Signal: `Changement()` wakes a waiting car |

### Car positions (`CarPosition` union)
| Value | Meaning |
|---|---|
| `'off'` | Not yet in scene / already removed |
| `'arriving'` | Approaching the intersection |
| `'queued'` | Blocked on `P(queueX)` — another car holds the queue semaphore |
| `'waiting_mutex'` | Blocked on `P(mutexFeux)` |
| `'waiting_signal'` | Blocked on `P(signalAttente)` |
| `'passing'` | Inside the intersection, executing `passer()` |
| `'done'` | Has exited the intersection |

---

## Source File Structure

```
src/
├── main.tsx                    # React entry point (imports index.css)
├── index.css                   # Single line: @import "tailwindcss"
├── App.tsx                     # Root component — layout + state
├── types.ts                    # All TypeScript interfaces
├── data/
│   ├── code.ts                 # Pseudocode string arrays (1 entry = 1 line)
│   └── scenarios.ts            # All 7 scenario definitions
└── components/
    ├── IntersectionView.tsx    # SVG crossroads, traffic lights, car icons
    ├── SemaphorePanel.tsx      # 4 semaphore value boxes
    ├── VariablesPanel.tsx      # feux + enAttente display
    ├── CodeView.tsx            # Dual code panel with line highlights
    ├── StepDescription.tsx     # Step narrative + active process badges
    ├── StepControls.tsx        # Prev / Next / Reset + dot progress
    └── ScenarioSelector.tsx    # Card-based scenario picker
```

---

## TypeScript Interfaces (`src/types.ts`)

```ts
type CarPosition = 'off' | 'arriving' | 'queued' | 'waiting_mutex'
                 | 'waiting_signal' | 'passing' | 'done';

interface CarState    { id: string; voie: 1|2; position: CarPosition; }
interface SemaphoreValues { mutexFeux: number; queue1: number; queue2: number; signalAttente: number; }
interface SharedVars  { feux: 1|2; enAttente: boolean; }
type SemaphoreKey = keyof SemaphoreValues;

interface CodeHighlight {
  procedure: 'Changement' | 'Traverser';
  lines: number[];  // 1-based line numbers
}

interface Step {
  description: string;           // French narration
  activeProcesses: string[];     // e.g. ["V1 — Traverser(1)", "P — Changement()"]
  semaphores: SemaphoreValues;
  changedSemaphores: SemaphoreKey[];  // which semaphores just changed (for yellow highlight)
  vars: SharedVars;
  changedVars: (keyof SharedVars)[];  // which vars just changed (for yellow highlight)
  cars: CarState[];
  codeHighlights: CodeHighlight[];
}

interface Scenario { id: string; title: string; subtitle: string; steps: Step[]; }
```

---

## Scenarios (`src/data/scenarios.ts`)

All scenarios are **pre-authored arrays of `Step` snapshots** (not dynamically simulated). Each step is a full system state at one logical operation.

Helper functions used inside `scenarios.ts`:
```ts
const sem = (mutexFeux, queue1, queue2, signalAttente): SemaphoreValues => ...
const vars = (feux: 1|2, enAttente: boolean): SharedVars => ...
```

| ID | Title | Subtitle | Steps |
|---|---|---|---|
| `sc1` | Scénario 1 | Feu vert — passage direct | 6 |
| `sc2` | Scénario 2 | Feu rouge — attente du changement | 10 |
| `sc3` | Scénario 3 | Changement sans voiture en attente | 4 |
| `sc4` | Scénario 4 | Arrivée simultanée — voie verte obtient mutexFeux en premier | 10 |
| `sc4p` | Scénario 4' | Arrivée simultanée — voie rouge obtient mutexFeux en premier | 9 |
| `sc5` | Scénario 5 | File de 3 voitures sur la voie 1 | 8 |
| `sc6` | Scénario 6 | Plusieurs voitures sur les deux voies (additionnel) | 13 |

**Car IDs used per scenario:**
- sc1: `V1` (voie 1)
- sc2: `V2` (voie 2)
- sc3: *(no cars)*
- sc4, sc4p: `V1` (voie 1), `V2` (voie 2)
- sc5: `V1`, `V2`, `V3` (all voie 1)
- sc6: `V1A`, `V1B` (voie 1), `V2A`, `V2B` (voie 2)

---

## Pseudocode (`src/data/code.ts`)

Two exported arrays, one entry per line, **1-indexed** (index 0 = line 1):

**`CHANGEMENT_CODE`** — 11 lines  
**`TRAVERSER_CODE`** — 18 lines

Line numbers are used directly in `CodeHighlight.lines` fields in scenario steps.

### Changement() line reference
| Line | Content |
|---|---|
| 1 | `Changement() {` |
| 2 | `  P(mutexFeux);` |
| 3 | `  feux = 3 - feux;` |
| 5 | `  if (enAttente) {` |
| 6 | `    V(signalAttente);` |
| 9 | `    V(mutexFeux);` |

### Traverser() line reference
| Line | Content |
|---|---|
| 2 | `  P(queues[voie-1]);` |
| 3 | `  P(mutexFeux);` |
| 5 | `  if (feux == voie) {` |
| 6 | `    passer();` |
| 7 | `    V(mutexFeux);` |
| 9 | `    enAttente = true;` |
| 10 | `    V(mutexFeux);` |
| 11 | `    P(signalAttente);` |
| 12 | `    enAttente = false;` |
| 13 | `    passer();` |
| 14 | `    V(mutexFeux);` |
| 17 | `  V(queues[voie-1]);` |

---

## IntersectionView SVG Layout (`src/components/IntersectionView.tsx`)

- **Canvas:** 600×600 viewBox
- **Centre:** (300, 300)
- **Road width:** 80px
- **Voie 1** = horizontal road (left → right)
- **Voie 2** = vertical road (top → bottom)

Car positions are looked up via key `v{voie}-{position}` in the `POSITIONS` map:

| Key | x | y | angle |
|---|---|---|---|
| `v1-arriving` | 60 | CY | 0° |
| `v1-queued` | 110 | CY | 0° |
| `v1-waiting_mutex` | 155 | CY | 0° |
| `v1-waiting_signal` | 155 | CY-32 | 0° |
| `v1-passing` | CX | CY | 0° |
| `v1-done` | 540 | CY | 0° |
| `v2-arriving` | CX | 60 | 90° |
| `v2-queued` | CX | 110 | 90° |
| `v2-waiting_mutex` | CX | 155 | 90° |
| `v2-waiting_signal` | CX+32 | 155 | 90° |
| `v2-passing` | CX | CY | 90° |
| `v2-done` | CX | 540 | 90° |

Cars at the same position are stacked with a 14px offset. Cars with `position === 'done'` are **not** rendered (excluded from the `byPosKey` grouping).

**Car colours by ID:**
| ID | Colour |
|---|---|
| V1, V1A | blue-500 `#3b82f6` |
| V1B | indigo-500 `#6366f1` |
| V2, V2A | amber-500 `#f59e0b` |
| V2B | red-500 `#ef4444` |
| V3 | emerald-500 `#10b981` |

---

## App.tsx State

```ts
const [scenarioId, setScenarioId] = useState(scenarios[0].id);  // 'sc1'
const [stepIndex, setStepIndex] = useState(0);
```

All rendering is derived from `scenario.steps[stepIndex]` — no simulation logic.

**Keyboard shortcuts:** `←` prev, `→` next, `R` / `r` reset.

**Layout (Tailwind):**
- `bg-slate-950` root, `bg-slate-900` panels, `border-slate-800` borders
- Desktop: `grid-cols-[1fr_400px]` — left: intersection + panels + description + controls; right: code view
- Mobile: single column

---

## Component Props Summary

| Component | Key Props |
|---|---|
| `IntersectionView` | `cars: CarState[]`, `feux: 1\|2` |
| `SemaphorePanel` | `semaphores: SemaphoreValues`, `changed: SemaphoreKey[]` |
| `VariablesPanel` | `vars: SharedVars`, `changed: (keyof SharedVars)[]` |
| `CodeView` | `highlights: CodeHighlight[]`, `activeProcesses: string[]` |
| `StepDescription` | `description: string`, `activeProcesses: string[]`, `stepIndex: number` |
| `StepControls` | `step: number`, `total: number`, `onPrev/onNext/onReset: () => void` |
| `ScenarioSelector` | `scenarios: Scenario[]`, `current: string`, `onSelect: (id) => void` |

---

## Design Conventions

- **Language:** French throughout (matches the exercise)
- **Highlight on change:** Yellow border + `bg-yellow-400/10` on panels; yellow dot + `text-yellow-200` on code lines
- **Semaphore colours:** `bg-red-950` when value = 0 (blocked), `bg-emerald-950` when > 0
- **Active code block:** `border-cyan-500 shadow-cyan-500/20`, badge "en cours"
- **Scenario cards:** Each scenario has a unique colour gradient (`sc1`=blue, `sc2`=amber, `sc3`=slate, `sc4`=violet, `sc4p`=fuchsia, `sc5`=emerald, `sc6`=rose)
- **No animation library** — CSS `transition: transform 0.5s ease` on SVG `<g>` elements for car movement

---

## Adding a New Scenario

1. Define a `Scenario` object in `src/data/scenarios.ts` with a unique `id`.
2. Add `Step` entries — each step needs: `description`, `activeProcesses`, `semaphores` (via `sem()`), `changedSemaphores`, `vars` (via `vars()`), `changedVars`, `cars`, `codeHighlights`.
3. Append to the `scenarios` export array.
4. Add a colour entry in `ScenarioSelector.tsx` → `SCENARIO_COLORS` and `ACTIVE_COLORS`.
5. If new car IDs are needed, add them to `CAR_COLORS` in `IntersectionView.tsx`.

## Adding a New Car Position

1. Add the new `CarPosition` literal to the union in `src/types.ts`.
2. Add entries for both voies in the `POSITIONS` map in `IntersectionView.tsx`.
3. Update relevant scenario steps to use the new position value.

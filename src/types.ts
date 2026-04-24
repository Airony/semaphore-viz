export type CarPosition =
  | 'off'           // not yet arrived / already left the scene
  | 'arriving'      // approaching the intersection
  | 'queued'        // blocked on P(queueX), another car holds the queue semaphore
  | 'waiting_mutex' // blocked on P(mutexFeux)
  | 'waiting_signal'// blocked on P(signalAttente)
  | 'passing'       // inside the intersection (passer())
  | 'done';         // exited the intersection

export interface CarState {
  id: string;        // e.g. "V1", "V2"
  voie: 1 | 2;
  position: CarPosition;
}

export interface SemaphoreValues {
  mutexFeux: number;
  queue1: number;
  queue2: number;
  signalAttente: number;
}

export interface SharedVars {
  feux: 1 | 2;
  enAttente: boolean;
}

/** Which semaphore changed in this step (for highlight) */
export type SemaphoreKey = keyof SemaphoreValues;

export interface CodeHighlight {
  procedure: 'Changement' | 'Traverser';
  /** 1-based line numbers to highlight */
  lines: number[];
  /** Process/vehicle ID for per-vehicle coloring (e.g. 'V1', 'V2A', 'P') */
  processId?: string;
}

export interface Step {
  description: string;
  /** Active processes labels shown in code view, e.g. ["V1 (Traverser)", "P (Changement)"] */
  activeProcesses: string[];
  semaphores: SemaphoreValues;
  /** Which semaphore(s) just changed */
  changedSemaphores: SemaphoreKey[];
  vars: SharedVars;
  /** Which shared var(s) just changed */
  changedVars: (keyof SharedVars)[];
  cars: CarState[];
  codeHighlights: CodeHighlight[];
  /** Processes blocked/waiting on each semaphore (shown on hover) */
  semaphoreQueues?: Partial<Record<SemaphoreKey, string[]>>;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  steps: Step[];
}

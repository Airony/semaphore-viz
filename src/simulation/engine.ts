import type { CarState, CarPosition, SemaphoreValues, SharedVars, SemaphoreKey } from '../types';
import { Semaphore } from './semaphore';

// ─── Event log entry ─────────────────────────────────────────────────────────

export interface LogEntry {
  time: number;       // timestamp (ms since engine start)
  message: string;
  processId?: string;
}

// ─── Simulation snapshot (what React renders) ────────────────────────────────

export interface SimSnapshot {
  cars: CarState[];
  semaphores: SemaphoreValues;
  vars: SharedVars;
  semaphoreQueues: Partial<Record<SemaphoreKey, string[]>>;
  running: boolean;
  paused: boolean;
  speed: number;
  log: LogEntry[];
  changementCountdown: number;  // seconds remaining until next auto-changement
}

// ─── Color palette for dynamically spawned cars ──────────────────────────────

const VOIE1_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#0ea5e9', '#06b6d4'];
const VOIE2_COLORS = ['#f59e0b', '#ef4444', '#f97316', '#e11d48', '#ec4899'];

// ─── Engine ──────────────────────────────────────────────────────────────────

export class SimulationEngine {
  // Semaphores
  private mutexFeux: Semaphore;
  private queue1: Semaphore;
  private queue2: Semaphore;
  private signalAttente: Semaphore;

  // Shared vars
  private feux: 1 | 2 = 1;
  private enAttente = false;

  // Car tracking
  private cars = new Map<string, CarState>();
  private nextCarId = 1;
  private voie1Count = 0;
  private voie2Count = 0;

  // State
  private _running = false;
  private _paused = false;
  private _speed = 1;  // multiplier: higher = faster
  private _log: LogEntry[] = [];
  private _startTime = 0;

  // Pause gate: all async processes await this when paused
  private _pauseGate: Promise<void> = Promise.resolve();
  private _pauseResolve: (() => void) | null = null;

  // Abort: on reset, we increment this to signal all running processes to stop
  private _epoch = 0;

  // Auto-changement timer
  private _changementInterval: ReturnType<typeof setInterval> | null = null;
  private _changementCountdown = 5;
  private _countdownInterval: ReturnType<typeof setInterval> | null = null;
  private _changementPeriod = 5; // seconds (base, before speed)

  // Callback to notify React
  private _onChange: (() => void) | null = null;

  constructor() {
    this.mutexFeux = new Semaphore(1, 'mutexFeux');
    this.queue1 = new Semaphore(1, 'queue1');
    this.queue2 = new Semaphore(1, 'queue2');
    this.signalAttente = new Semaphore(0, 'signalAttente');
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  onStateChange(cb: () => void): void {
    this._onChange = cb;
  }

  get snapshot(): SimSnapshot {
    return {
      cars: Array.from(this.cars.values()),
      semaphores: {
        mutexFeux: this.mutexFeux.value,
        queue1: this.queue1.value,
        queue2: this.queue2.value,
        signalAttente: this.signalAttente.value,
      },
      vars: { feux: this.feux, enAttente: this.enAttente },
      semaphoreQueues: {
        mutexFeux: this.mutexFeux.waiters,
        queue1: this.queue1.waiters,
        queue2: this.queue2.waiters,
        signalAttente: this.signalAttente.waiters,
      },
      running: this._running,
      paused: this._paused,
      speed: this._speed,
      log: this._log.slice(),
      changementCountdown: this._changementCountdown,
    };
  }

  start(): void {
    if (this._running) return;
    this._running = true;
    this._startTime = Date.now();
    this.startChangementTimer();
    this.emit();
  }

  stop(): void {
    this._running = false;
    this.stopChangementTimer();
    this.emit();
  }

  reset(): void {
    // Increment epoch to signal all running async processes to bail out
    this._epoch++;

    this.stopChangementTimer();
    this._running = false;
    this._paused = false;

    // Reset pause gate
    if (this._pauseResolve) {
      this._pauseResolve();
      this._pauseResolve = null;
    }
    this._pauseGate = Promise.resolve();

    // Reset semaphores
    this.mutexFeux.reset(1);
    this.queue1.reset(1);
    this.queue2.reset(1);
    this.signalAttente.reset(0);

    // Reset vars
    this.feux = 1;
    this.enAttente = false;

    // Clear cars
    this.cars.clear();
    this.nextCarId = 1;
    this.voie1Count = 0;
    this.voie2Count = 0;

    // Clear log
    this._log = [];
    this._changementCountdown = this._changementPeriod;
    this._startTime = 0;

    this.emit();
  }

  pause(): void {
    if (this._paused) return;
    this._paused = true;
    this._pauseGate = new Promise<void>((resolve) => {
      this._pauseResolve = resolve;
    });
    this.stopChangementTimer();
    this.emit();
  }

  resume(): void {
    if (!this._paused) return;
    this._paused = false;
    if (this._pauseResolve) {
      this._pauseResolve();
      this._pauseResolve = null;
    }
    this._pauseGate = Promise.resolve();
    if (this._running) this.startChangementTimer();
    this.emit();
  }

  setSpeed(speed: number): void {
    this._speed = Math.max(0.25, Math.min(4, speed));
    // Restart the changement timer with adjusted period
    if (this._running && !this._paused) {
      this.stopChangementTimer();
      this.startChangementTimer();
    }
    this.emit();
  }

  spawnCar(voie: 1 | 2): void {
    if (!this._running) this.start();
    const id = `V${this.nextCarId++}`;
    const car: CarState = { id, voie, position: 'arriving' };
    this.cars.set(id, car);
    if (voie === 1) this.voie1Count++;
    else this.voie2Count++;
    this.addLog(`${id} arrive sur la voie ${voie}`, id);
    this.emit();

    // Run Traverser() for this car as an async "process"
    const epoch = this._epoch;
    this.runTraverser(id, voie, epoch);
  }

  triggerChangement(): void {
    if (!this._running) return;
    const epoch = this._epoch;
    this.runChangement(epoch);
    // Reset countdown
    this._changementCountdown = this._changementPeriod;
  }

  getCarColor(id: string): string {
    const car = this.cars.get(id);
    if (!car) return '#94a3b8';
    const palette = car.voie === 1 ? VOIE1_COLORS : VOIE2_COLORS;
    // Extract numeric part
    const num = parseInt(id.replace(/\D/g, ''), 10) || 1;
    return palette[(num - 1) % palette.length];
  }

  // ─── Private: async car process ──────────────────────────────────────────

  private async runTraverser(carId: string, voie: 1 | 2, epoch: number): Promise<void> {
    const bail = () => this._epoch !== epoch;
    const gate = () => this._pauseGate;
    const queueSem = voie === 1 ? this.queue1 : this.queue2;

    // Small visual delay before starting (arriving animation)
    await this.delay(400, epoch);
    if (bail()) return;

    // P(queue[voie])
    this.setCarPosition(carId, 'queued');
    this.addLog(`${carId} : P(queue${voie})`, carId);
    this.emit();
    await gate();
    if (bail()) return;
    await queueSem.P(carId);
    if (bail()) return;
    await gate();
    if (bail()) return;
    this.emit(); // queue value changed
    await this.delay(200, epoch);
    if (bail()) return;

    // P(mutexFeux)
    this.setCarPosition(carId, 'waiting_mutex');
    this.addLog(`${carId} : P(mutexFeux)`, carId);
    this.emit();
    await gate();
    if (bail()) return;
    await this.mutexFeux.P(carId);
    if (bail()) return;
    await gate();
    if (bail()) return;
    this.emit(); // mutex value changed
    await this.delay(200, epoch);
    if (bail()) return;

    // Check feux == voie
    if (this.feux === voie) {
      // GREEN — pass directly
      this.setCarPosition(carId, 'passing');
      this.addLog(`${carId} : feux==${voie} → passer()`, carId);
      this.emit();
      await this.delay(1500, epoch); // passer() duration
      if (bail()) return;
      await gate();
      if (bail()) return;

      // V(mutexFeux)
      this.mutexFeux.V();
      this.addLog(`${carId} : V(mutexFeux)`, carId);
      this.emit();
      await this.delay(150, epoch);
      if (bail()) return;
    } else {
      // RED — wait for changement
      this.setCarPosition(carId, 'waiting_signal');
      this.enAttente = true;
      this.addLog(`${carId} : feux≠${voie} → enAttente=true, V(mutexFeux)`, carId);

      // V(mutexFeux) — release before blocking on signal
      this.mutexFeux.V();
      this.emit();
      await this.delay(200, epoch);
      if (bail()) return;
      await gate();
      if (bail()) return;

      // P(signalAttente) — blocks until Changement() signals
      this.addLog(`${carId} : P(signalAttente) — bloqué`, carId);
      this.emit();
      await gate();
      if (bail()) return;
      await this.signalAttente.P(carId);
      if (bail()) return;
      await gate();
      if (bail()) return;

      // Woken up by Changement
      this.enAttente = false;
      this.setCarPosition(carId, 'passing');
      this.addLog(`${carId} : réveillé → enAttente=false, passer()`, carId);
      this.emit();
      await this.delay(1500, epoch); // passer()
      if (bail()) return;
      await gate();
      if (bail()) return;

      // V(mutexFeux) — release mutex held by Changement
      this.mutexFeux.V();
      this.addLog(`${carId} : V(mutexFeux)`, carId);
      this.emit();
      await this.delay(150, epoch);
      if (bail()) return;
    }

    // V(queue[voie])
    queueSem.V();
    this.setCarPosition(carId, 'done');
    this.addLog(`${carId} : V(queue${voie}) — terminé`, carId);
    this.emit();
  }

  private async runChangement(epoch: number): Promise<void> {
    const bail = () => this._epoch !== epoch;

    // P(mutexFeux)
    this.addLog('P : Changement() — P(mutexFeux)', 'P');
    this.emit();
    await this.mutexFeux.P('P');
    if (bail()) return;

    // feux = 3 - feux
    this.feux = (3 - this.feux) as 1 | 2;
    this.addLog(`P : feux = ${this.feux}`, 'P');
    this.emit();
    await this.delay(300, epoch);
    if (bail()) return;

    if (this.enAttente) {
      // V(signalAttente) — wake the waiting car; mutex stays locked (car releases it)
      this.signalAttente.V();
      this.addLog('P : enAttente=true → V(signalAttente)', 'P');
      this.emit();
    } else {
      // V(mutexFeux)
      this.mutexFeux.V();
      this.addLog('P : enAttente=false → V(mutexFeux)', 'P');
      this.emit();
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private setCarPosition(carId: string, position: CarPosition): void {
    const car = this.cars.get(carId);
    if (car) {
      this.cars.set(carId, { ...car, position });
    }
  }

  private addLog(message: string, processId?: string): void {
    this._log.push({
      time: Date.now() - this._startTime,
      message,
      processId,
    });
    // Keep max 100 entries
    if (this._log.length > 100) {
      this._log = this._log.slice(-80);
    }
  }

  private emit(): void {
    this._onChange?.();
  }

  private delay(baseMs: number, epoch: number): Promise<void> {
    const ms = baseMs / this._speed;
    return new Promise<void>((resolve) => {
      const id = setTimeout(() => {
        if (this._epoch !== epoch) {
          resolve();
          return;
        }
        resolve();
      }, ms);
      // If epoch changes, the bail() check after await handles it
      void id;
    });
  }

  // ─── Auto-changement timer ──────────────────────────────────────────────

  private startChangementTimer(): void {
    this.stopChangementTimer();
    this._changementCountdown = this._changementPeriod;

    // Countdown ticker (1s real-time)
    this._countdownInterval = setInterval(() => {
      this._changementCountdown = Math.max(0, this._changementCountdown - 1);
      this.emit();
    }, 1000 / this._speed);

    // Actual changement trigger
    this._changementInterval = setInterval(() => {
      if (this._running && !this._paused) {
        const epoch = this._epoch;
        this.runChangement(epoch);
        this._changementCountdown = this._changementPeriod;
      }
    }, (this._changementPeriod * 1000) / this._speed);
  }

  private stopChangementTimer(): void {
    if (this._changementInterval !== null) {
      clearInterval(this._changementInterval);
      this._changementInterval = null;
    }
    if (this._countdownInterval !== null) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
  }
}

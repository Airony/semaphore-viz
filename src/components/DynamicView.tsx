import { useRef, useState, useCallback, useEffect } from 'react';
import { SimulationEngine } from '../simulation/engine';
import type { SimSnapshot, LogEntry } from '../simulation/engine';
import IntersectionView from './IntersectionView';
import SemaphorePanel from './SemaphorePanel';
import VariablesPanel from './VariablesPanel';
import SimulationControls from './SimulationControls';

const PROCESS_COLORS: Record<string, string> = {
  P: '#06b6d4',
};
const VOIE1_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#0ea5e9', '#06b6d4'];
const VOIE2_COLORS = ['#f59e0b', '#ef4444', '#f97316', '#e11d48', '#ec4899'];

function getLogColor(entry: LogEntry): string {
  if (!entry.processId) return '#94a3b8';
  if (entry.processId === 'P') return PROCESS_COLORS.P;
  const num = parseInt(entry.processId.replace(/\D/g, ''), 10) || 1;
  // Guess voie from log message content — fallback to voie 1 colors
  if (entry.message.includes('voie 2')) return VOIE2_COLORS[(num - 1) % VOIE2_COLORS.length];
  return VOIE1_COLORS[(num - 1) % VOIE1_COLORS.length];
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  if (m > 0) return `${m}:${String(sec).padStart(2, '0')}.${tenths}`;
  return `${sec}.${tenths}s`;
}

export default function DynamicView() {
  const engineRef = useRef<SimulationEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine();
  }
  const engine = engineRef.current;

  const [snap, setSnap] = useState<SimSnapshot>(engine.snapshot);
  const logEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to engine state changes
  const updateSnap = useCallback(() => {
    setSnap(engine.snapshot);
  }, [engine]);

  useEffect(() => {
    engine.onStateChange(updateSnap);
    return () => engine.onStateChange(() => {});
  }, [engine, updateSnap]);

  // Auto-scroll log only when already at the bottom
  useEffect(() => {
    const el = logContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (isAtBottom) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [snap.log.length]);

  // Handlers
  const handleSpawnCar = useCallback((voie: 1 | 2) => {
    engine.spawnCar(voie);
  }, [engine]);

  const handleChangement = useCallback(() => {
    engine.triggerChangement();
  }, [engine]);

  const handlePause = useCallback(() => engine.pause(), [engine]);
  const handleResume = useCallback(() => engine.resume(), [engine]);
  const handleSpeedChange = useCallback((s: number) => engine.setSpeed(s), [engine]);
  const handlePasserDurationChange = useCallback((ms: number) => engine.setPasserDuration(ms), [engine]);
  const handleChangementPeriodChange = useCallback((s: number) => engine.setChangementPeriod(s), [engine]);

  const handleReset = useCallback(() => {
    engine.reset();
    setSnap(engine.snapshot);
  }, [engine]);

  // Filter out 'done' cars older than 2s for cleaner display — or just show all
  const activeCars = snap.cars.filter(c => c.position !== 'off');

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      {/* ── Three-column main area ─────────────────────────────────────── */}
      <div className="flex gap-3 min-h-0" style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}>

        {/* LEFT: event log */}
        <div className="w-52 flex-shrink-0 cs-card flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b-2 cs-header flex-shrink-0">
            <span className="cs-label">Journal</span>
          </div>
          <div ref={logContainerRef} className="flex-1 overflow-y-auto px-2 py-1.5 space-y-px font-mono cs-log-bg">
            {snap.log.length === 0 ? (
              <p className="text-center py-6 text-[10px] font-black cs-text-faint">Aucun événement</p>
            ) : (
              snap.log.map((entry, i) => (
                <div key={i} className="flex gap-1.5 py-0.5 items-start">
                  <span className="cs-log-time text-[10px] w-10 flex-shrink-0 text-right leading-4 pt-px font-mono font-black">
                    {formatTime(entry.time)}
                  </span>
                  <span
                    className="w-1.5 h-1.5 flex-shrink-0 mt-[5px] border border-black"
                    style={{ background: getLogColor(entry) }}
                  />
                  <span className="cs-log-msg text-[10px] leading-4 break-all font-mono">{entry.message}</span>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* CENTER: intersection + active cars */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="overflow-hidden flex-1 flex flex-col min-h-0 cs-card">
            <div className="px-4 py-2 border-b-2 cs-header flex items-center justify-between flex-shrink-0">
              <span className="cs-label">
                Simulation dynamique
              </span>
              <div className="flex items-center gap-3">
                {snap.running && (
                  <span className={`text-[10px] font-black ${snap.paused ? 'cs-accent-amber' : 'cs-accent-green'}`}>
                    {snap.paused ? '⏸ En pause' : '● En cours'}
                  </span>
                )}
                <span className="text-[10px] font-black cs-text-muted">
                  feux = <span className={snap.vars.feux === 1 ? 'cs-accent-blue font-black' : 'cs-accent-amber font-black'}>
                    {snap.vars.feux}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <IntersectionView cars={activeCars} feux={snap.vars.feux} />
            </div>
          </div>

          {/* Active cars — compact horizontal list */}
          {activeCars.filter(c => c.position !== 'done').length > 0 && (
            <div className="cs-card px-3 py-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {activeCars
                .filter(c => c.position !== 'done')
                .map(car => {
                  const color = engine.getCarColor(car.id);
                  return (
                    <div
                      key={car.id}
                      className="cs-chip flex items-center gap-1.5 px-2 py-1"
                    >
                      <span className="w-2 h-2 flex-shrink-0 border border-black" style={{ background: color }} />
                      <span className="font-mono text-xs font-black cs-text-primary">{car.id}</span>
                      <span className="text-[10px] font-bold cs-chip-lbl">v{car.voie}</span>
                      <span className="cs-chip-pos text-[10px] font-mono font-black px-1">
                        {car.position.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* RIGHT: controls */}
        <div className="w-64 flex-shrink-0 overflow-y-auto">
          <SimulationControls
            running={snap.running}
            paused={snap.paused}
            speed={snap.speed}
            changementCountdown={snap.changementCountdown}
            changementPeriod={snap.changementPeriod}
            passerDuration={snap.passerDuration}
            onSpawnCar={handleSpawnCar}
            onChangement={handleChangement}
            onPause={handlePause}
            onResume={handleResume}
            onSpeedChange={handleSpeedChange}
            onChangementPeriodChange={handleChangementPeriodChange}
            onPasserDurationChange={handlePasserDurationChange}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* ── Bottom: semaphores + variables, compact ────────────────────── */}
      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        <SemaphorePanel
          semaphores={snap.semaphores}
          changed={[]}
          queues={snap.semaphoreQueues}
          compact
        />
        <VariablesPanel vars={snap.vars} changed={[]} compact />
      </div>
    </div>
  );
}

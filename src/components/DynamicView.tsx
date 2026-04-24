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

  // Subscribe to engine state changes
  const updateSnap = useCallback(() => {
    setSnap(engine.snapshot);
  }, [engine]);

  useEffect(() => {
    engine.onStateChange(updateSnap);
    return () => engine.onStateChange(() => {});
  }, [engine, updateSnap]);

  // Auto-scroll log
//   useEffect(() => {
//     logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [snap.log.length]);

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
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Left column: intersection + panels */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Simulation dynamique
              </span>
              <div className="flex items-center gap-3">
                {snap.running && (
                  <span className={`text-xs font-semibold ${snap.paused ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {snap.paused ? '⏸ En pause' : '● En cours'}
                  </span>
                )}
                <span className="text-xs text-slate-600">
                  feux = <span className={snap.vars.feux === 1 ? 'text-blue-400 font-bold' : 'text-amber-400 font-bold'}>
                    {snap.vars.feux}
                  </span>
                </span>
              </div>
            </div>
            <IntersectionView cars={activeCars} feux={snap.vars.feux} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SemaphorePanel
              semaphores={snap.semaphores}
              changed={[]}
              queues={snap.semaphoreQueues}
            />
            <VariablesPanel vars={snap.vars} changed={[]} />
          </div>

          {/* Event log */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Journal d'exécution
              </span>
            </div>
            <div className="h-48 overflow-y-auto px-3 py-2 space-y-0.5 font-mono text-xs">
              {snap.log.length === 0 ? (
                <p className="text-slate-600 text-center py-8">
                  Ajoutez une voiture pour commencer la simulation
                </p>
              ) : (
                snap.log.map((entry, i) => (
                  <div key={i} className="flex gap-2 py-0.5">
                    <span className="text-slate-600 w-14 flex-shrink-0 text-right">
                      {formatTime(entry.time)}
                    </span>
                    <span
                      className="w-1 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: getLogColor(entry) }}
                    />
                    <span className="text-slate-300">{entry.message}</span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Right column: controls */}
        <div className="flex flex-col gap-4">
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

          {/* Active cars list */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Voitures actives
            </h3>
            {activeCars.filter(c => c.position !== 'done').length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">
                Aucune voiture en cours
              </p>
            ) : (
              <div className="space-y-1.5">
                {activeCars
                  .filter(c => c.position !== 'done')
                  .map(car => {
                    const color = engine.getCarColor(car.id);
                    return (
                      <div
                        key={car.id}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-900/50"
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-mono text-sm font-bold text-white">{car.id}</span>
                        <span className="text-xs text-slate-500">voie {car.voie}</span>
                        <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          {car.position.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

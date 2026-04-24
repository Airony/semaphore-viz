import type { SemaphoreValues, SemaphoreKey } from '../types';

const LABELS: Record<SemaphoreKey, string> = {
  mutexFeux:     'mutexFeux',
  queue1:        'queue1',
  queue2:        'queue2',
  signalAttente: 'signalAttente',
};

const INIT: Record<SemaphoreKey, number> = {
  mutexFeux:     1,
  queue1:        1,
  queue2:        1,
  signalAttente: 0,
};

const PROCESS_COLORS: Record<string, string> = {
  V1:  '#3b82f6',
  V1A: '#3b82f6',
  V1B: '#6366f1',
  V2:  '#f59e0b',
  V2A: '#f59e0b',
  V2B: '#ef4444',
  V3:  '#10b981',
  P:   '#06b6d4',
};

interface Props {
  semaphores: SemaphoreValues;
  changed: SemaphoreKey[];
  queues?: Partial<Record<SemaphoreKey, string[]>>;
  compact?: boolean;
}

export default function SemaphorePanel({ semaphores, changed, queues, compact }: Props) {
  const keys = Object.keys(LABELS) as SemaphoreKey[];

  return (
    <div className={`bg-slate-800 rounded-xl ${compact ? 'p-2.5' : 'p-4 space-y-2'}`}>
      <h3 className={`font-bold text-slate-400 uppercase tracking-wider ${compact ? 'text-[10px] mb-2' : 'text-xs mb-3'}`}>
        Sémaphores
      </h3>
      <div className={`grid gap-1.5 ${compact ? 'grid-cols-4' : 'grid-cols-2 gap-2'}`}>
        {keys.map((key) => {
          const val = semaphores[key];
          const isChanged = changed.includes(key);
          const isBlocked = val === 0;
          const queue = queues?.[key] ?? [];

          return (
            <div
              key={key}
              className={`
                group relative rounded-lg border transition-all duration-300 cursor-default
                ${compact ? 'p-1.5' : 'p-2.5'}
                ${isChanged
                  ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-500/20'
                  : isBlocked
                    ? 'border-red-800 bg-red-950/60'
                    : 'border-emerald-700 bg-emerald-950/60'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-slate-300 ${compact ? 'text-[9px] leading-none' : 'text-xs'}`}>{LABELS[key]}</span>
                <span
                  className={`
                    font-bold font-mono
                    ${compact ? 'text-sm' : 'text-lg'}
                    ${isBlocked ? 'text-red-400' : 'text-emerald-400'}
                  `}
                >
                  {val}
                </span>
              </div>
              {!compact && (
                <div className="mt-1 text-xs text-slate-500">
                  init: {INIT[key]}
                </div>
              )}
              {/* visual bar */}
              <div className={`rounded-full bg-slate-700 overflow-hidden ${compact ? 'mt-1 h-1' : 'mt-1.5 h-1.5'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: val > 0 ? '100%' : '0%' }}
                />
              </div>

              {/* hover tooltip — queue info */}
              <div className="absolute z-10 left-0 right-0 top-full mt-1 rounded-lg border p-2
                              opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200
                              bg-slate-700 border-slate-600 text-xs shadow-lg">
                <div className="font-semibold text-slate-300 mb-1">File d'attente :</div>
                {queue.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {queue.map(pid => {
                      const color = PROCESS_COLORS[pid] ?? '#94a3b8';
                      return (
                        <span
                          key={pid}
                          className="inline-block px-1.5 py-0.5 rounded font-mono font-medium"
                          style={{ backgroundColor: `${color}30`, color }}
                        >
                          {pid}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-slate-400">Aucun processus en attente</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

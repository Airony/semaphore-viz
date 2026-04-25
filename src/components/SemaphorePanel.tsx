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
    <div className={`cs-card ${compact ? 'p-2.5' : 'p-3'}`}>
      <p className={`cs-label ${compact ? 'mb-2' : 'mb-3'}`}>Sémaphores</p>
      <div className={`grid gap-2 ${compact ? 'grid-cols-4' : 'grid-cols-2'}`}>
        {keys.map((key) => {
          const val = semaphores[key];
          const isChanged = changed.includes(key);
          const isBlocked = val === 0;
          const queue = queues?.[key] ?? [];

          const numColor = isChanged ? '#fcd34d' : isBlocked ? '#f87171' : '#4ade80';
          const barColor = isChanged ? '#f59e0b' : isBlocked ? '#ef4444' : '#22c55e';
          const cellClass = isChanged ? 'cs-sem-changed' : isBlocked ? 'cs-sem-blocked' : 'cs-sem-ok';

          return (
            <div
              key={key}
              className={`group relative cursor-default ${cellClass}`}
              style={{ padding: compact ? '5px 8px' : '9px 10px' }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-mono font-black cs-sem-init"
                  style={{ fontSize: compact ? 9 : 10 }}
                >
                  {LABELS[key]}
                </span>
                <span
                  className="font-black font-mono"
                  style={{ fontSize: compact ? 14 : 20, color: numColor, lineHeight: 1 }}
                >
                  {val}
                </span>
              </div>
              {!compact && (
                <div className="cs-sem-init" style={{ fontSize: 9, fontWeight: 900, marginTop: 2 }}>
                  init: {INIT[key]}
                </div>
              )}
              {/* Flat progress bar */}
              <div
                className="cs-sem-bar"
                style={{ marginTop: compact ? 4 : 5, height: compact ? 3 : 4 }}
              >
                <div
                  style={{
                    height: '100%',
                    width: val > 0 ? '100%' : '0%',
                    background: barColor,
                    transition: 'width 0.3s',
                  }}
                />
              </div>

              {/* Hover tooltip */}
              <div
                className="absolute z-10 left-0 right-0 top-full mt-1 p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 cs-card"
              >
                <div className="cs-label mb-1">File d&apos;attente</div>
                {queue.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {queue.map(pid => {
                      const color = PROCESS_COLORS[pid] ?? '#94a3b8';
                      return (
                        <span
                          key={pid}
                          className="inline-block px-1.5 py-0.5 text-[10px] font-mono font-black border-2 border-black shadow-[1px_1px_0_#000]"
                          style={{ background: color, color: '#000' }}
                        >
                          {pid}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="cs-text-faint" style={{ fontSize: 10, fontWeight: 700 }}>Aucun</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

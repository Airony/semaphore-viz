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

interface Props {
  semaphores: SemaphoreValues;
  changed: SemaphoreKey[];
}

export default function SemaphorePanel({ semaphores, changed }: Props) {
  const keys = Object.keys(LABELS) as SemaphoreKey[];

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Sémaphores
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {keys.map((key) => {
          const val = semaphores[key];
          const isChanged = changed.includes(key);
          const isBlocked = val === 0;

          return (
            <div
              key={key}
              className={`
                rounded-lg p-2.5 border transition-all duration-300
                ${isChanged
                  ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-500/20'
                  : isBlocked
                    ? 'border-red-800 bg-red-950/60'
                    : 'border-emerald-700 bg-emerald-950/60'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300">{LABELS[key]}</span>
                <span
                  className={`
                    text-lg font-bold font-mono
                    ${isBlocked ? 'text-red-400' : 'text-emerald-400'}
                  `}
                >
                  {val}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                init: {INIT[key]}
              </div>
              {/* visual bar */}
              <div className="mt-1.5 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: val > 0 ? '100%' : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

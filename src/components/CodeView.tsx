import type { CarState, CodeHighlight, SemaphoreKey } from '../types';
import { CHANGEMENT_CODE, TRAVERSER_CODE } from '../data/code';

const PROCESS_COLORS: Record<string, string> = {
  V1:  '#3b82f6',   // blue-500
  V1A: '#3b82f6',
  V1B: '#6366f1',   // indigo-500
  V2:  '#f59e0b',   // amber-500
  V2A: '#f59e0b',
  V2B: '#ef4444',   // red-500
  V3:  '#10b981',   // emerald-500
  P:   '#06b6d4',   // cyan-500
};

interface CodeBlockProps {
  title: string;
  procedure: 'Changement' | 'Traverser';
  lines: string[];
  highlights: CodeHighlight[];
  activeProcesses: string[];
  cars: CarState[];
  semaphoreQueues?: Partial<Record<SemaphoreKey, string[]>>;
}

interface ProcessMarker {
  processId: string;
  color: string;
}

const BLOCKED_LINE_BY_SEMAPHORE: Partial<Record<SemaphoreKey, number>> = {
  queue1: 2,
  queue2: 2,
  mutexFeux: 3,
  signalAttente: 11,
};

function addMarker(map: Map<number, ProcessMarker[]>, line: number, marker: ProcessMarker) {
  const existing = map.get(line) ?? [];
  if (!existing.some(entry => entry.processId === marker.processId)) {
    existing.push(marker);
    map.set(line, existing);
  }
}

function CodeBlock({ title, procedure, lines, highlights, activeProcesses, cars, semaphoreQueues }: CodeBlockProps) {
  const blockedByLine = new Map<number, ProcessMarker[]>();

  if (procedure === 'Traverser' && semaphoreQueues) {
    for (const [key, pids] of Object.entries(semaphoreQueues) as [SemaphoreKey, string[]][]) {
      const line = BLOCKED_LINE_BY_SEMAPHORE[key];
      if (!line) continue;
      for (const pid of pids) {
        addMarker(blockedByLine, line, {
          processId: pid,
          color: PROCESS_COLORS[pid] ?? '#fbbf24',
        });
      }
    }
  }

  // Map line → executing and blocked markers separately
  const executingByLine = new Map<number, ProcessMarker[]>();
  for (const h of highlights) {
    if (h.procedure === procedure) {
      const pid = h.processId ?? '?';
      const marker = { processId: pid, color: PROCESS_COLORS[pid] ?? '#fbbf24' };
      for (const ln of h.lines) {
        const blockedOnLine = (blockedByLine.get(ln) ?? []).some(entry => entry.processId === pid);
        if (blockedOnLine) {
          addMarker(blockedByLine, ln, marker);
        } else {
          addMarker(executingByLine, ln, marker);
        }
      }
    }
  }

  const isActive = highlights.some(h => h.procedure === procedure);

  const filteredProcesses = activeProcesses.filter(p =>
    procedure === 'Changement' ? p.includes('Changement') : p.includes('Traverser')
  );
  const visibleCarProcesses = procedure === 'Traverser'
    ? cars
        .filter(car => car.position !== 'off')
        .map(car => `${car.id} — Traverser(${car.voie})`)
    : [];
  const displayedProcesses = procedure === 'Traverser' ? visibleCarProcesses : filteredProcesses;

  return (
    <div
      className={isActive ? 'cs-card' : 'cs-card'}
      style={{
        border: `2px solid ${isActive ? 'var(--accent-code)' : 'var(--border-color)'}`,
        boxShadow: '3px 3px 0 var(--border-color)',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* header */}
      <div className={isActive ? 'cs-code-header-act' : 'cs-code-header'}
        style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span className="font-mono text-sm font-black cs-text-primary">{title}</span>
        {isActive && (
          <span
            className="text-[10px] font-black px-2 py-0.5 border-2 border-[var(--border-color)] shadow-[1px_1px_0_var(--border-color)]"
            style={{ background: 'var(--accent-code)', color: 'var(--bg-page)' }}
          >
            EN COURS
          </span>
        )}
      </div>

      {/* visible processes */}
      {displayedProcesses.length > 0 && (
        <div className="cs-code-proc-strip px-3 py-1.5 flex flex-wrap gap-1">
          {displayedProcesses.map(p => {
            const pid = p.split(' — ')[0].trim();
            const color = PROCESS_COLORS[pid] ?? '#a78bfa';
            return (
              <span
                key={p}
                className="text-[10px] font-mono font-black px-2 py-0.5 border-2 border-[var(--border-color)] shadow-[1px_1px_0_var(--border-color)]"
                style={{ background: color, color: '#000' }}
              >
                {p}
              </span>
            );
          })}
        </div>
      )}

      {/* code lines */}
      <div className="cs-code-bg overflow-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const executing = executingByLine.get(lineNum) ?? [];
              const blocked = blockedByLine.get(lineNum) ?? [];
              const isHighlighted = executing.length > 0;
              const bgColor = isHighlighted ? executing[0].color : undefined;
              return (
                <tr
                  key={lineNum}
                  style={bgColor ? { backgroundColor: `${bgColor}22` } : undefined}
                >
                  <td className="cs-code-lnum select-none text-right pr-3 pl-3 text-xs w-8 py-0.5">
                    {lineNum}
                  </td>
                  <td
                    className={`pl-3 pr-4 py-0.5 whitespace-pre ${isHighlighted ? 'cs-code-text-hi' : 'cs-code-text'}`}
                  >
                    {executing.map((p, i) => (
                      <span
                        key={i}
                        className="inline-block w-2 h-2 mr-1 mb-0.5 align-middle border border-black"
                        style={{ background: p.color }}
                        title={p.processId}
                      />
                    ))}
                    {line || ' '}
                  </td>
                  <td className="w-16 pr-3 py-0.5 text-right align-middle">
                    {blocked.length > 0 && (
                      <span className="inline-flex items-center justify-end gap-1 min-h-4">
                        {blocked.map((p, i) => (
                          <span
                            key={i}
                            className="inline-block w-2 h-2 border border-black"
                            style={{ background: p.color }}
                            title={`${p.processId} bloqué ici`}
                          />
                        ))}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface Props {
  highlights: CodeHighlight[];
  activeProcesses: string[];
  cars: CarState[];
  semaphoreQueues?: Partial<Record<SemaphoreKey, string[]>>;
}

export default function CodeView({ highlights, activeProcesses, cars, semaphoreQueues }: Props) {
  return (
    <div className="space-y-3 h-full">
      <p className="cs-label mb-3">Code — procédures</p>
      <CodeBlock
        title="Changement()"
        procedure="Changement"
        lines={CHANGEMENT_CODE}
        highlights={highlights}
        activeProcesses={activeProcesses}
        cars={cars}
        semaphoreQueues={semaphoreQueues}
      />
      <CodeBlock
        title="Traverser(voie)"
        procedure="Traverser"
        lines={TRAVERSER_CODE}
        highlights={highlights}
        activeProcesses={activeProcesses}
        cars={cars}
        semaphoreQueues={semaphoreQueues}
      />
    </div>
  );
}

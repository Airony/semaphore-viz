import type { CodeHighlight } from '../types';
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
}

function CodeBlock({ title, procedure, lines, highlights, activeProcesses }: CodeBlockProps) {
  // Map line → [{processId, color}] for per-vehicle highlighting
  const lineProcesses = new Map<number, { processId: string; color: string }[]>();
  for (const h of highlights) {
    if (h.procedure === procedure) {
      const pid = h.processId ?? '?';
      const color = PROCESS_COLORS[pid] ?? '#fbbf24';
      for (const ln of h.lines) {
        const existing = lineProcesses.get(ln) || [];
        if (!existing.some(e => e.processId === pid)) {
          existing.push({ processId: pid, color });
        }
        lineProcesses.set(ln, existing);
      }
    }
  }

  const isActive = highlights.some(h => h.procedure === procedure);

  const filteredProcesses = activeProcesses.filter(p =>
    procedure === 'Changement' ? p.includes('Changement') : p.includes('Traverser')
  );

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

      {/* active processes */}
      {isActive && filteredProcesses.length > 0 && (
        <div className="cs-code-proc-strip px-3 py-1.5 flex flex-wrap gap-1">
          {filteredProcesses.map(p => {
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
              const processes = lineProcesses.get(lineNum) || [];
              const isHighlighted = processes.length > 0;
              const bgColor = isHighlighted ? processes[0].color : undefined;
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
                    {processes.map((p, i) => (
                      <span
                        key={i}
                        className="inline-block w-2 h-2 mr-1 mb-0.5 align-middle border border-black"
                        style={{ background: p.color }}
                        title={p.processId}
                      />
                    ))}
                    {line || ' '}
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
}

export default function CodeView({ highlights, activeProcesses }: Props) {
  return (
    <div className="space-y-3 h-full">
      <p className="cs-label mb-3">Code — procédures</p>
      <CodeBlock
        title="Changement()"
        procedure="Changement"
        lines={CHANGEMENT_CODE}
        highlights={highlights}
        activeProcesses={activeProcesses}
      />
      <CodeBlock
        title="Traverser(voie)"
        procedure="Traverser"
        lines={TRAVERSER_CODE}
        highlights={highlights}
        activeProcesses={activeProcesses}
      />
    </div>
  );
}

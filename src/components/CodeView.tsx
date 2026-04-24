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
      className={`
        rounded-xl overflow-hidden border transition-all duration-300
        ${isActive ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-slate-700'}
      `}
    >
      {/* header */}
      <div
        className={`
          px-4 py-2 flex items-center justify-between
          ${isActive ? 'bg-cyan-900/40' : 'bg-slate-800'}
        `}
      >
        <span className="font-mono text-sm font-bold text-slate-200">{title}</span>
        {isActive && (
          <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-700 rounded px-2 py-0.5">
            en cours
          </span>
        )}
      </div>

      {/* active processes — colored per vehicle */}
      {isActive && filteredProcesses.length > 0 && (
        <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-700 flex flex-wrap gap-1">
          {filteredProcesses.map(p => {
            const pid = p.split(' — ')[0].trim();
            const color = PROCESS_COLORS[pid] ?? '#a78bfa';
            return (
              <span
                key={p}
                className="text-xs rounded px-2 py-0.5 border font-medium"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                  borderColor: `${color}50`,
                }}
              >
                {p}
              </span>
            );
          })}
        </div>
      )}

      {/* code lines */}
      <div className="bg-slate-900 overflow-auto">
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
                  className="transition-colors duration-200"
                  style={bgColor ? { backgroundColor: `${bgColor}15` } : undefined}
                >
                  <td className="select-none text-right pr-3 pl-3 text-slate-600 text-xs w-8 py-0.5 border-r border-slate-800">
                    {lineNum}
                  </td>
                  <td className={`pl-3 pr-4 py-0.5 whitespace-pre ${isHighlighted ? 'text-white' : 'text-slate-300'}`}>
                    {processes.map((p, i) => (
                      <span
                        key={i}
                        className="inline-block w-2 h-2 rounded-full mr-1 mb-0.5 align-middle"
                        style={{ backgroundColor: p.color }}
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
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Code — procédures
      </h3>
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

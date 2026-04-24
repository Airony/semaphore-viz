import type { CodeHighlight } from '../types';
import { CHANGEMENT_CODE, TRAVERSER_CODE } from '../data/code';

interface CodeBlockProps {
  title: string;
  procedure: 'Changement' | 'Traverser';
  lines: string[];
  highlights: CodeHighlight[];
  activeProcesses: string[];
}

function CodeBlock({ title, procedure, lines, highlights, activeProcesses }: CodeBlockProps) {
  // Collect all highlighted line numbers for this procedure (1-based)
  const highlightedLines = new Set<number>();
  for (const h of highlights) {
    if (h.procedure === procedure) {
      for (const ln of h.lines) highlightedLines.add(ln);
    }
  }

  const isActive = highlights.some(h => h.procedure === procedure);

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

      {/* active processes */}
      {isActive && (
        <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-700 flex flex-wrap gap-1">
          {activeProcesses
            .filter(p =>
              procedure === 'Changement' ? p.includes('Changement') : p.includes('Traverser')
            )
            .map(p => (
              <span key={p} className="text-xs bg-violet-900/50 text-violet-300 border border-violet-700 rounded px-2 py-0.5">
                {p}
              </span>
            ))}
        </div>
      )}

      {/* code lines */}
      <div className="bg-slate-900 overflow-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = highlightedLines.has(lineNum);
              return (
                <tr
                  key={lineNum}
                  className={`
                    transition-colors duration-200
                    ${isHighlighted ? 'bg-yellow-400/15' : ''}
                  `}
                >
                  <td className="select-none text-right pr-3 pl-3 text-slate-600 text-xs w-8 py-0.5 border-r border-slate-800">
                    {lineNum}
                  </td>
                  <td className={`pl-3 pr-4 py-0.5 whitespace-pre ${isHighlighted ? 'text-yellow-200' : 'text-slate-300'}`}>
                    {isHighlighted && (
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-2 mb-0.5 align-middle" />
                    )}
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

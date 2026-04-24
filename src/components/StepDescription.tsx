interface Props {
  description: string;
  activeProcesses: string[];
  stepIndex: number;
}

export default function StepDescription({ description, activeProcesses, stepIndex }: Props) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-700 flex items-center justify-center text-white text-xs font-bold border border-cyan-500 mt-0.5">
          {stepIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 leading-relaxed">{description}</p>

          {activeProcesses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeProcesses.map((p) => (
                <span
                  key={p}
                  className="text-xs bg-violet-900/60 text-violet-300 border border-violet-700 rounded-full px-2.5 py-0.5"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

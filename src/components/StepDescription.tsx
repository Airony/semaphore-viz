interface Props {
  description: string;
  activeProcesses: string[];
  stepIndex: number;
}

export default function StepDescription({ description, activeProcesses, stepIndex }: Props) {
  return (
    <div className="cs-card cs-desc-bg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-7 h-7 bg-cyan-500 flex items-center justify-center text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] mt-0.5">
          {stepIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm cs-desc-text leading-relaxed">{description}</p>
          {activeProcesses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeProcesses.map((p) => (
                <span key={p} className="text-xs cs-proc-badge px-2 py-0.5 font-black">
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

interface Props {
  step: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

export default function StepControls({ step, total, onPrev, onNext, onReset }: Props) {
  const isFirst = step === 0;
  const isLast = step === total - 1;

  return (
    <div className="flex items-center gap-3 justify-center">
      <button
        onClick={onReset}
        disabled={isFirst}
        className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-sm font-medium transition-colors border border-slate-600 hover:border-slate-500"
        title="Réinitialiser (R)"
      >
        ↺ Reset
      </button>

      <button
        onClick={onPrev}
        disabled={isFirst}
        className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-sm font-bold transition-colors border border-slate-600 hover:border-slate-500"
        title="Précédent (←)"
      >
        ← Précédent
      </button>

      <div className="flex items-center gap-1.5 min-w-[100px] justify-center">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`
              rounded-full transition-all duration-200
              ${i === step
                ? 'w-3 h-3 bg-cyan-400'
                : i < step
                  ? 'w-2 h-2 bg-slate-500'
                  : 'w-2 h-2 bg-slate-700'}
            `}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={isLast}
        className="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors border border-cyan-600 hover:border-cyan-500"
        title="Suivant (→)"
      >
        Suivant →
      </button>

      <span className="text-xs text-slate-500 font-mono">
        {step + 1} / {total}
      </span>
    </div>
  );
}

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
        className="cs-btn cs-ctrl-btn px-3 py-2 text-xs font-black"
        title="Réinitialiser (R)"
      >
        ↺ Reset
      </button>

      <button
        onClick={onPrev}
        disabled={isFirst}
        className="cs-btn cs-ctrl-btn px-4 py-2 text-xs font-black"
        title="Précédent (←)"
      >
        ← Précédent
      </button>

      <div className="flex items-center gap-1 min-w-[80px] justify-center">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`
              transition-all duration-200 border border-black rounded-none
              ${i === step
                ? 'w-3 h-3 bg-cyan-400 shadow-[1px_1px_0_#000]'
                : i < step
                  ? 'w-2 h-2 cs-dot-done'
                  : 'w-2 h-2 cs-dot-future'}
            `}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={isLast}
        className="cs-btn bg-cyan-600 text-white px-4 py-2 text-xs font-black"
        title="Suivant (→)"
      >
        Suivant →
      </button>

      <span className="text-xs cs-text-faint font-mono font-black">
        {step + 1} / {total}
      </span>
    </div>
  );
}

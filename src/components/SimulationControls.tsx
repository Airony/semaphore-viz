interface Props {
  running: boolean;
  paused: boolean;
  speed: number;
  changementCountdown: number;
  changementPeriod: number;
  passerDuration: number;
  onSpawnCar: (voie: 1 | 2) => void;
  onChangement: () => void;
  onPause: () => void;
  onResume: () => void;
  onSpeedChange: (speed: number) => void;
  onChangementPeriodChange: (seconds: number) => void;
  onPasserDurationChange: (ms: number) => void;
  onReset: () => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2, 3, 4];

export default function SimulationControls({
  running,
  paused,
  speed,
  changementCountdown,
  changementPeriod,
  passerDuration,
  onSpawnCar,
  onChangement,
  onPause,
  onResume,
  onSpeedChange,
  onChangementPeriodChange,
  onPasserDurationChange,
  onReset,
}: Props) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-4">
      {/* Spawn buttons */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Ajouter une voiture
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onSpawnCar(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold
                       rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">→</span>
            Voie 1
          </button>
          <button
            onClick={() => onSpawnCar(2)}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold
                       rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">↓</span>
            Voie 2
          </button>
        </div>
      </div>

      {/* Changement button + countdown */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Changement des feux
        </h3>
        <button
          onClick={onChangement}
          disabled={!running || paused}
          className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500
                     text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors
                     flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Changement()
        </button>
        {running && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-1000"
                style={{ width: `${(1 - changementCountdown / changementPeriod) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 font-mono w-6 text-right">
              {changementCountdown}s
            </span>
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Contrôles
        </h3>
        <div className="flex gap-2">
          {/* Play / Pause */}
          {!running ? (
            <button
              onClick={() => onSpawnCar(1)}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold
                         rounded-lg px-4 py-2 transition-colors"
            >
              ▶ Démarrer
            </button>
          ) : paused ? (
            <button
              onClick={onResume}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold
                         rounded-lg px-4 py-2 transition-colors"
            >
              ▶ Reprendre
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-sm font-semibold
                         rounded-lg px-4 py-2 transition-colors"
            >
              ⏸ Pause
            </button>
          )}

          {/* Reset */}
          <button
            onClick={onReset}
            className="bg-red-800 hover:bg-red-700 text-white text-sm font-semibold
                       rounded-lg px-4 py-2 transition-colors"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Speed control */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Vitesse : <span className="text-white">{speed}×</span>
        </h3>
        <div className="flex gap-1">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`
                flex-1 text-xs font-mono rounded-md py-1.5 transition-colors border
                ${speed === s
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'}
              `}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Passer duration slider */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Durée de traversée :{' '}
          <span className="text-white">{(passerDuration / 1000).toFixed(1)}s</span>
        </h3>
        <input
          type="range"
          min={200}
          max={5000}
          step={100}
          value={passerDuration}
          onChange={e => onPasserDurationChange(Number(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-0.5">
          <span>0.2s</span>
          <span>5s</span>
        </div>
      </div>

      {/* Changement period slider */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Période Changement :{' '}
          <span className="text-white">{changementPeriod}s</span>
        </h3>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={changementPeriod}
          onChange={e => onChangementPeriodChange(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-0.5">
          <span>1s</span>
          <span>30s</span>
        </div>
      </div>
    </div>
  );
}

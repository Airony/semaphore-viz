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
    <div className="cs-card p-3 space-y-3">
      {/* Spawn buttons */}
      <div>
        <p className="cs-label mb-2">Ajouter une voiture</p>
        <div className="flex gap-1.5">
          <button
            onClick={() => onSpawnCar(1)}
            className="cs-btn flex-1 bg-blue-600 text-white px-2 py-2 text-xs font-black"
          >
            → Voie 1
          </button>
          <button
            onClick={() => onSpawnCar(2)}
            className="cs-btn flex-1 bg-amber-600 text-white px-2 py-2 text-xs font-black"
          >
            ↓ Voie 2
          </button>
        </div>
      </div>

      {/* Changement button + countdown */}
      <div>
        <p className="cs-label mb-2">Changement des feux</p>
        <button
          onClick={onChangement}
          disabled={!running || paused}
          className="cs-btn w-full bg-cyan-700 text-white px-3 py-2 text-xs font-black"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Changement()
        </button>
        {running && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="cs-countdown-track flex-1">
              <div
                style={{
                  height: '100%',
                  width: `${(1 - changementCountdown / changementPeriod) * 100}%`,
                  background: 'var(--accent-code)',
                  transition: 'width 1s linear',
                }}
              />
            </div>
            <span className="text-[10px] font-mono font-black w-5 text-right" style={{ color: 'var(--accent-code)' }}>
              {changementCountdown}s
            </span>
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div>
        <p className="cs-label mb-2">Contrôles</p>
        <div className="flex gap-1.5">
          {!running ? (
            <button
              onClick={() => onSpawnCar(1)}
              className="cs-btn flex-1 bg-emerald-700 text-white px-2 py-1.5 text-xs font-black"
            >
              ▶ Démarrer
            </button>
          ) : paused ? (
            <button
              onClick={onResume}
              className="cs-btn flex-1 bg-emerald-700 text-white px-2 py-1.5 text-xs font-black"
            >
              ▶ Reprendre
            </button>
          ) : (
            <button
              onClick={onPause}
              className="cs-btn flex-1 bg-amber-700 text-white px-2 py-1.5 text-xs font-black"
            >
              ⏸ Pause
            </button>
          )}
          <button
            onClick={onReset}
            className="cs-btn bg-red-800 text-white px-3 py-1.5 text-xs font-black"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Speed control */}
      <div>
        <p className="cs-label mb-2">
          Vitesse : <span className="cs-text-primary">{speed}×</span>
        </p>
        <div className="flex gap-0.5">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`cs-btn flex-1 text-[10px] font-mono font-black py-1 ${
                speed === s ? 'bg-violet-600 text-white' : 'cs-speed-inactive'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Passer duration slider */}
      <div>
        <p className="cs-label mb-2">
          Traversée : <span className="cs-text-primary">{(passerDuration / 1000).toFixed(1)}s</span>
        </p>
        <input
          type="range"
          min={200}
          max={5000}
          step={100}
          value={passerDuration}
          onChange={e => onPasserDurationChange(Number(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer h-1"
        />
        <div className="flex justify-between text-[10px] font-black mt-0.5 cs-slider-label">
          <span>0.2s</span><span>5s</span>
        </div>
      </div>

      {/* Changement period slider */}
      <div>
        <p className="cs-label mb-2">
          Période : <span className="cs-text-primary">{changementPeriod}s</span>
        </p>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={changementPeriod}
          onChange={e => onChangementPeriodChange(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer h-1"
        />
        <div className="flex justify-between text-[10px] font-black mt-0.5 cs-slider-label">
          <span>1s</span><span>30s</span>
        </div>
      </div>
    </div>
  );
}

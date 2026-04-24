import type { Scenario } from '../types';

interface Props {
  scenarios: Scenario[];
  current: string;
  onSelect: (id: string) => void;
}

const SCENARIO_COLORS: Record<string, string> = {
  sc1:  'from-blue-900/60 to-blue-800/40 border-blue-700 hover:border-blue-500',
  sc2:  'from-amber-900/60 to-amber-800/40 border-amber-700 hover:border-amber-500',
  sc3:  'from-slate-800/80 to-slate-700/40 border-slate-600 hover:border-slate-400',
  sc4:  'from-violet-900/60 to-violet-800/40 border-violet-700 hover:border-violet-500',
  sc4p: 'from-fuchsia-900/60 to-fuchsia-800/40 border-fuchsia-700 hover:border-fuchsia-500',
  sc5:  'from-emerald-900/60 to-emerald-800/40 border-emerald-700 hover:border-emerald-500',
  sc6:  'from-rose-900/60 to-rose-800/40 border-rose-700 hover:border-rose-500',
};

const ACTIVE_COLORS: Record<string, string> = {
  sc1:  'from-blue-700/80 to-blue-600/60 border-blue-400 shadow-blue-500/30',
  sc2:  'from-amber-700/80 to-amber-600/60 border-amber-400 shadow-amber-500/30',
  sc3:  'from-slate-600/80 to-slate-500/60 border-slate-300 shadow-slate-400/30',
  sc4:  'from-violet-700/80 to-violet-600/60 border-violet-400 shadow-violet-500/30',
  sc4p: 'from-fuchsia-700/80 to-fuchsia-600/60 border-fuchsia-400 shadow-fuchsia-500/30',
  sc5:  'from-emerald-700/80 to-emerald-600/60 border-emerald-400 shadow-emerald-500/30',
  sc6:  'from-rose-700/80 to-rose-600/60 border-rose-400 shadow-rose-500/30',
};

export default function ScenarioSelector({ scenarios, current, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Choisir un scénario
      </h2>
      <div className="flex flex-wrap gap-2">
        {scenarios.map((sc) => {
          const isActive = sc.id === current;
          const colorClass = isActive
            ? ACTIVE_COLORS[sc.id] ?? 'from-slate-600 to-slate-500 border-slate-300'
            : SCENARIO_COLORS[sc.id] ?? 'from-slate-800 to-slate-700 border-slate-600';

          return (
            <button
              key={sc.id}
              onClick={() => onSelect(sc.id)}
              className={`
                bg-gradient-to-br border rounded-lg px-3 py-2 text-left
                transition-all duration-200 cursor-pointer
                ${isActive ? 'shadow-lg ' + colorClass : colorClass}
              `}
            >
              <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {sc.title}
              </div>
              <div className={`text-xs mt-0.5 leading-tight ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                {sc.subtitle}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

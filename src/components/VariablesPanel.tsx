import type { SharedVars } from '../types';

interface Props {
  vars: SharedVars;
  changed: (keyof SharedVars)[];
}

export default function VariablesPanel({ vars, changed }: Props) {
  const feuxChanged = changed.includes('feux');
  const enAttenteChanged = changed.includes('enAttente');

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Variables partagées
      </h3>

      {/* feux */}
      <div
        className={`
          rounded-lg p-3 border transition-all duration-300
          ${feuxChanged ? 'border-yellow-400 bg-yellow-400/10' : 'border-slate-600 bg-slate-700/50'}
        `}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-300">feux</span>
          <div className="flex items-center gap-2">
            <span
              className={`
                w-3 h-3 rounded-full inline-block
                ${vars.feux === 1 ? 'bg-blue-400' : 'bg-amber-400'}
              `}
            />
            <span className="text-lg font-bold font-mono text-white">{vars.feux}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Voie {vars.feux} au&nbsp;
          <span className="text-emerald-400 font-semibold">VERT</span>
          {' '}/ Voie {vars.feux === 1 ? 2 : 1} au&nbsp;
          <span className="text-red-400 font-semibold">ROUGE</span>
        </p>
      </div>

      {/* enAttente */}
      <div
        className={`
          rounded-lg p-3 border transition-all duration-300
          ${enAttenteChanged ? 'border-yellow-400 bg-yellow-400/10' : 'border-slate-600 bg-slate-700/50'}
        `}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-300">enAttente</span>
          <span
            className={`
              text-sm font-bold font-mono px-2 py-0.5 rounded
              ${vars.enAttente
                ? 'bg-orange-900/60 text-orange-300 border border-orange-700'
                : 'bg-slate-700 text-slate-400 border border-slate-600'}
            `}
          >
            {vars.enAttente ? 'true' : 'false'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {vars.enAttente
            ? 'Une voiture attend le changement de feu'
            : 'Aucune voiture en attente'}
        </p>
      </div>
    </div>
  );
}

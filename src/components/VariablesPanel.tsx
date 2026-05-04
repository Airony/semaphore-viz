import type { SharedVars } from '../types';

interface Props {
  vars: SharedVars;
  changed: (keyof SharedVars)[];
  compact?: boolean;
}

export default function VariablesPanel({ vars, changed, compact }: Props) {
  const feuxChanged = changed.includes('feux');
  const enAttenteChanged = changed.includes('enAttente');

  if (compact) {
    return (
      <div className="cs-card p-2.5">
        <p className="cs-label mb-2">Variables</p>
        <div className="flex gap-2">
          <div className={`cs-var-cell ${feuxChanged ? 'cs-var-changed' : 'cs-var-normal'} flex-1 flex items-center justify-between px-2 py-1.5`}>
            <span className="text-[10px] font-mono font-black cs-text-muted">feux</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 border-2 border-black" style={{ background: vars.feux === 1 ? '#3b82f6' : '#f59e0b' }} />
              <span className="text-base font-black font-mono cs-text-primary">{vars.feux}</span>
            </div>
          </div>
          <div className={`cs-var-cell ${enAttenteChanged ? 'cs-var-changed' : 'cs-var-normal'} flex-1 flex items-center justify-between px-2 py-1.5`}>
            <span className="text-[10px] font-mono font-black cs-text-muted">enAttente</span>
            <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 ${vars.enAttente ? 'cs-var-enattente-on' : 'cs-var-enattente-off'}`}>
              {vars.enAttente ? 'true' : 'false'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-card p-3">
      <p className="cs-label mb-3">Variables partagées</p>

      {/* feux */}
      <div className={`cs-var-cell ${feuxChanged ? 'cs-var-changed' : 'cs-var-normal'} mb-2 px-3 py-2.5`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-black cs-text-muted">feux</span>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-black shadow-[1px_1px_0_#000]" style={{ background: vars.feux === 1 ? '#3b82f6' : '#f59e0b' }} />
            <span className="text-2xl font-black font-mono cs-text-primary">{vars.feux}</span>
          </div>
        </div>
        <p className="text-[10px] font-bold mt-1 cs-text-faint">
          Voie {vars.feux} au&nbsp;
          <span className="cs-accent-green font-black">VERT</span>
          {' '}&nbsp;/&nbsp;Voie {vars.feux === 1 ? 2 : 1} au&nbsp;
          <span className="cs-accent-red font-black">ROUGE</span>
        </p>
      </div>

      {/* enAttente */}
      <div className={`cs-var-cell ${enAttenteChanged ? 'cs-var-changed' : 'cs-var-normal'} px-3 py-2.5`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-black cs-text-muted">enAttente</span>
          <span className={`text-sm font-black font-mono px-2 py-0.5 ${vars.enAttente ? 'cs-var-enattente-on' : 'cs-var-enattente-off'}`}>
            {vars.enAttente ? 'true' : 'false'}
          </span>
        </div>
        <p className="text-[10px] font-bold mt-1 cs-text-faint">
          {vars.enAttente ? 'Une voiture attend le changement' : 'Aucune voiture en attente'}
        </p>
      </div>
    </div>
  );
}

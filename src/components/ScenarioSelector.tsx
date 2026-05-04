import type { Scenario } from '../types';

interface Props {
  scenarios: Scenario[];
  current: string;
  onSelect: (id: string) => void;
}

const SCENARIO_COLORS: Record<string, { base: string; active: string }> = {
  sc1:  { base: '#dceaff', active: '#2f6fb6' },
  sc2:  { base: '#fff0db', active: '#9b5f16' },
  sc3:  { base: '#eceaf2', active: '#5f6b7a' },
  sc4:  { base: '#eee8ff', active: '#6b4eb2' },
  sc4p: { base: '#f8e8ff', active: '#8b4cb3' },
  sc5:  { base: '#e3f4e9', active: '#317a4f' },
  sc6:  { base: '#ffe6e4', active: '#ad4f4f' },
};

export default function ScenarioSelector({ scenarios, current, onSelect }: Props) {
  return (
    <div>
      <p className="cs-label mb-2.5">Choisir un scénario</p>
      <div className="flex flex-wrap gap-2">
        {scenarios.map((sc) => {
          const isActive = sc.id === current;
          const { base, active } = SCENARIO_COLORS[sc.id] ?? { base: '#eceaf2', active: '#5f6b7a' };
          const bg = isActive ? active : base;
          const color = isActive ? '#ffffff' : 'var(--sc-label)';
          return (
            <button
              key={sc.id}
              onClick={() => onSelect(sc.id)}
              className="
                text-left cursor-pointer border-2 rounded-[3px] px-3 py-2
                shadow-[3px_3px_0_var(--border-color)]
                hover:shadow-[1px_1px_0_var(--border-color)] hover:translate-x-[2px] hover:translate-y-[2px]
                active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
                transition-[box-shadow,transform] duration-[60ms]
              "
              style={{
                backgroundColor: bg,
                color,
                borderColor: 'var(--border-color)',
                minWidth: 90,
              }}
            >
              <div className="text-[11px] font-black">{sc.title}</div>
              <div className="text-[9px] leading-tight mt-0.5 opacity-80">{sc.subtitle}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

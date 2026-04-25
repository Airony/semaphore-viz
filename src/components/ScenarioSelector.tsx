import type { Scenario } from '../types';

interface Props {
  scenarios: Scenario[];
  current: string;
  onSelect: (id: string) => void;
  theme?: 'dark' | 'light';
}

const SCENARIO_COLORS: Record<string, { base: string; baseLight: string; active: string }> = {
  sc1:  { base: '#111d3a', baseLight: '#dde8ff', active: '#1d4ed8' },
  sc2:  { base: '#261a06', baseLight: '#fff0d0', active: '#b45309' },
  sc3:  { base: '#16162e', baseLight: '#e8e8f0', active: '#475569' },
  sc4:  { base: '#180e36', baseLight: '#ede8ff', active: '#6d28d9' },
  sc4p: { base: '#200e36', baseLight: '#f5e8ff', active: '#9333ea' },
  sc5:  { base: '#091a10', baseLight: '#ddf5e8', active: '#15803d' },
  sc6:  { base: '#1c070d', baseLight: '#ffe8ea', active: '#b91c1c' },
};

export default function ScenarioSelector({ scenarios, current, onSelect, theme }: Props) {
  const isLight = theme === 'light';

  return (
    <div>
      <p className="cs-label mb-2.5">Choisir un scénario</p>
      <div className="flex flex-wrap gap-2">
        {scenarios.map((sc) => {
          const isActive = sc.id === current;
          const { base, baseLight, active } = SCENARIO_COLORS[sc.id] ?? { base: '#16162e', baseLight: '#e8e8f0', active: '#475569' };
          const bg = isActive ? active : (isLight ? baseLight : base);
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

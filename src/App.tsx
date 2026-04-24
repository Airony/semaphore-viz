import { useState, useEffect, useCallback } from 'react';
import { scenarios } from './data/scenarios';
import IntersectionView from './components/IntersectionView';
import SemaphorePanel from './components/SemaphorePanel';
import VariablesPanel from './components/VariablesPanel';
import CodeView from './components/CodeView';
import StepDescription from './components/StepDescription';
import StepControls from './components/StepControls';
import ScenarioSelector from './components/ScenarioSelector';
import DynamicView from './components/DynamicView';

type AppMode = 'scenarios' | 'simulation';

export default function App() {
  const [mode, setMode] = useState<AppMode>('scenarios');
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [stepIndex, setStepIndex] = useState(0);

  const scenario = scenarios.find(s => s.id === scenarioId)!;
  const step = scenario.steps[stepIndex];

  const handleSelectScenario = (id: string) => {
    setScenarioId(id);
    setStepIndex(0);
  };

  const handleNext = useCallback(() => {
    setStepIndex(i => Math.min(i + 1, scenario.steps.length - 1));
  }, [scenario.steps.length]);

  const handlePrev = useCallback(() => {
    setStepIndex(i => Math.max(i - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setStepIndex(0);
  }, []);

  useEffect(() => {
    if (mode !== 'scenarios') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'r' || e.key === 'R') handleReset();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, handleNext, handlePrev, handleReset]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Gestion d'un carrefour par sémaphores
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Systèmes d'exploitation — Synchronisation · Visualisation interactive
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setMode('scenarios')}
              className={`text-xs font-semibold rounded-md px-3 py-1.5 transition-colors ${
                mode === 'scenarios'
                  ? 'bg-slate-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Scénarios
            </button>
            <button
              onClick={() => setMode('simulation')}
              className={`text-xs font-semibold rounded-md px-3 py-1.5 transition-colors ${
                mode === 'simulation'
                  ? 'bg-cyan-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simulation
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {mode === 'scenarios' ? (
          <>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <ScenarioSelector
                scenarios={scenarios}
                current={scenarioId}
                onSelect={handleSelectScenario}
              />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
              <div className="flex flex-col gap-4">
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex-shrink-0">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {scenario.title}: {scenario.subtitle}
                    </span>
                    <span className="text-xs text-slate-600">
                      feux = <span className={step.vars.feux === 1 ? 'text-blue-400 font-bold' : 'text-amber-400 font-bold'}>{step.vars.feux}</span>
                    </span>
                  </div>
                  <IntersectionView cars={step.cars} feux={step.vars.feux} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SemaphorePanel semaphores={step.semaphores} changed={step.changedSemaphores} queues={step.semaphoreQueues} />
                  <VariablesPanel vars={step.vars} changed={step.changedVars} />
                </div>

                <StepDescription
                  description={step.description}
                  activeProcesses={step.activeProcesses}
                  stepIndex={stepIndex}
                />

                <div className="bg-slate-900 rounded-xl border border-slate-800 px-4 py-3">
                  <StepControls
                    step={stepIndex}
                    total={scenario.steps.length}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onReset={handleReset}
                  />
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 overflow-auto">
                <CodeView highlights={step.codeHighlights} activeProcesses={step.activeProcesses} />
              </div>
            </div>
          </>
        ) : (
          <DynamicView />
        )}
      </main>

      <footer className="border-t border-slate-800 px-6 py-3 text-center">
        <p className="text-xs text-slate-600">
          Exercice — Synchronisation par sémaphores · Devoir maison SE
        </p>
      </footer>
    </div>
  );
}

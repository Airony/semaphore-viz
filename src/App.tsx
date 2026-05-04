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
    <div className="min-h-screen cs-page cs-text-primary flex flex-col">
      <header className="cs-page border-b-2 cs-header px-6 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black cs-text-primary uppercase tracking-widest">
              Gestion d'un carrefour par sémaphores
            </h1>
            <p className="text-[10px] cs-text-muted mt-0.5 font-bold uppercase tracking-wider">
              Systèmes d'exploitation — Synchronisation · Visualisation interactive
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('scenarios')}
              className={`cs-btn px-4 py-1.5 text-xs font-black ${
                mode === 'scenarios' ? 'cs-btn-blue' : 'cs-mode-inactive'
              }`}
            >
              Scénarios
            </button>
            <button
              onClick={() => setMode('simulation')}
              className={`cs-btn px-4 py-1.5 text-xs font-black ${
                mode === 'simulation' ? 'cs-btn-cyan' : 'cs-mode-inactive'
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
            <div className="cs-card p-3">
              <ScenarioSelector
                scenarios={scenarios}
                current={scenarioId}
                onSelect={handleSelectScenario}
              />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
              <div className="flex flex-col gap-4">
                <div className="cs-card overflow-hidden flex-shrink-0">
                  <div className="cs-header px-4 py-2 flex items-center justify-between">
                    <span className="cs-label">
                      {scenario.title}: {scenario.subtitle}
                    </span>
                    <span className="text-[10px] cs-text-muted font-bold">
                      feux = <span className={step.vars.feux === 1 ? 'cs-accent-blue font-black' : 'cs-accent-amber font-black'}>{step.vars.feux}</span>
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

                <div className="cs-card px-4 py-3">
                  <StepControls
                    step={stepIndex}
                    total={scenario.steps.length}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onReset={handleReset}
                  />
                </div>
              </div>

              <div className="cs-card p-4 overflow-auto">
                <CodeView
                  highlights={step.codeHighlights}
                  activeProcesses={step.activeProcesses}
                  cars={step.cars}
                  semaphoreQueues={step.semaphoreQueues}
                />
              </div>
            </div>
          </>
        ) : (
          <DynamicView />
        )}
      </main>

      <footer className="border-t-2 cs-header px-6 py-2 text-center">
        <p className="text-[10px] cs-text-faint font-black uppercase tracking-widest">
          Exercice — Synchronisation par sémaphores · Devoir maison SE
        </p>
      </footer>
    </div>
  );
}

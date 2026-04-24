import type { Scenario, SemaphoreValues, SharedVars } from '../types';

// ─── helpers ────────────────────────────────────────────────────────────────

const sem = (
  mutexFeux: number,
  queue1: number,
  queue2: number,
  signalAttente: number
): SemaphoreValues => ({ mutexFeux, queue1, queue2, signalAttente });

const vars = (feux: 1 | 2, enAttente: boolean): SharedVars => ({ feux, enAttente });

// ─── Scénario 1 ─ Feu vert, passage direct ──────────────────────────────────

const scenario1: Scenario = {
  id: 'sc1',
  title: 'Scénario 1',
  subtitle: 'Feu vert — passage direct',
  steps: [
    {
      description: 'État initial. V1 arrive sur la voie 1. Le feu est vert pour la voie 1.',
      activeProcesses: [],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: [],
      vars: vars(1, false),
      changedVars: [],
      cars: [{ id: 'V1', voie: 1, position: 'arriving' }],
      codeHighlights: [],
    },
    {
      description: 'V1 appelle P(queue1). La file est libre (queue1=1→0), V1 entre dans la file.',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(1, 0, 1, 0),
      changedSemaphores: ['queue1'],
      vars: vars(1, false),
      changedVars: [],
      cars: [{ id: 'V1', voie: 1, position: 'queued' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [2], processId: 'V1' }],
    },
    {
      description: 'V1 appelle P(mutexFeux). Le mutex est libre (mutexFeux=1→0).',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(0, 0, 1, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [{ id: 'V1', voie: 1, position: 'waiting_mutex' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [3], processId: 'V1' }],
    },
    {
      description: 'V1 vérifie feux == 1 : VRAI. Elle appelle passer() et traverse le carrefour.',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(0, 0, 1, 0),
      changedSemaphores: [],
      vars: vars(1, false),
      changedVars: [],
      cars: [{ id: 'V1', voie: 1, position: 'passing' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [5, 6], processId: 'V1' }],
    },
    {
      description: 'V1 libère mutexFeux (mutexFeux=0→1).',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(1, 0, 1, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [{ id: 'V1', voie: 1, position: 'passing' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [7], processId: 'V1' }],
    },
    {
      description: 'V1 libère queue1 (queue1=0→1). Le carrefour est à nouveau libre.',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: ['queue1'],
      vars: vars(1, false),
      changedVars: [],
      cars: [{ id: 'V1', voie: 1, position: 'done' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [17], processId: 'V1' }],
    },
  ],
};

// ─── Scénario 2 ─ Feu rouge, attente du changement ──────────────────────────

const scenario2: Scenario = {
  id: 'sc2',
  title: 'Scénario 2',
  subtitle: 'Feu rouge — attente du changement',
  steps: [
    {
      description: 'État initial. V2 arrive sur la voie 2. Le feu est vert pour la voie 1 (rouge pour la voie 2).',
      activeProcesses: [],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: [],
      vars: vars(1, false),
      changedVars: [],
      cars: [{ id: 'V2', voie: 2, position: 'arriving' }],
      codeHighlights: [],
    },
    {
      description: 'V2 appelle P(queue2). La file est libre (queue2=1→0).',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(1, 1, 0, 0),
      changedSemaphores: ['queue2'],
      vars: vars(1, false),
      changedVars: [],
      cars: [{ id: 'V2', voie: 2, position: 'queued' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [2], processId: 'V2' }],
    },
    {
      description: 'V2 appelle P(mutexFeux) (mutexFeux=1→0).',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(0, 1, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [{ id: 'V2', voie: 2, position: 'waiting_mutex' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [3], processId: 'V2' }],
    },
    {
      description: 'V2 vérifie feux == 2 : FAUX (feux=1). Elle pose enAttente = true et libère mutexFeux (mutexFeux=0→1).',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(1, 1, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, true),
      changedVars: ['enAttente'],
      cars: [{ id: 'V2', voie: 2, position: 'waiting_signal' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [8, 9, 10], processId: 'V2' }],
    },
    {
      description: 'V2 se bloque sur P(signalAttente). Elle attend le prochain Changement().',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(1, 1, 0, 0),
      changedSemaphores: [],
      vars: vars(1, true),
      changedVars: [],
      cars: [{ id: 'V2', voie: 2, position: 'waiting_signal' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [11], processId: 'V2' }],
      semaphoreQueues: { signalAttente: ['V2'] },
    },
    {
      description: 'Le processus P appelle Changement(). Il acquiert mutexFeux (mutexFeux=1→0) et inverse le feu : feux = 3-1 = 2.',
      activeProcesses: ['P — Changement()'],
      semaphores: sem(0, 1, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(2, true),
      changedVars: ['feux'],
      cars: [{ id: 'V2', voie: 2, position: 'waiting_signal' }],
      codeHighlights: [{ procedure: 'Changement', lines: [2, 3], processId: 'P' }],
      semaphoreQueues: { signalAttente: ['V2'] },
    },
    {
      description: 'P détecte enAttente = true. Il appelle V(signalAttente) (signalAttente=0→1) pour réveiller V2, SANS libérer mutexFeux.',
      activeProcesses: ['P — Changement()'],
      semaphores: sem(0, 1, 0, 1),
      changedSemaphores: ['signalAttente'],
      vars: vars(2, true),
      changedVars: [],
      cars: [{ id: 'V2', voie: 2, position: 'waiting_signal' }],
      codeHighlights: [{ procedure: 'Changement', lines: [5, 6], processId: 'P' }],
    },
    {
      description: 'V2 se réveille (signalAttente=1→0), remet enAttente = false, et exécute passer().',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(0, 1, 0, 0),
      changedSemaphores: ['signalAttente'],
      vars: vars(2, false),
      changedVars: ['enAttente'],
      cars: [{ id: 'V2', voie: 2, position: 'passing' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [11, 12, 13], processId: 'V2' }],
    },
    {
      description: 'V2 libère mutexFeux (mutexFeux=0→1) — le mutex tenu depuis Changement().',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(1, 1, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(2, false),
      changedVars: [],
      cars: [{ id: 'V2', voie: 2, position: 'passing' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [14], processId: 'V2' }],
    },
    {
      description: 'V2 libère queue2 (queue2=0→1). Traversée terminée.',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: ['queue2'],
      vars: vars(2, false),
      changedVars: [],
      cars: [{ id: 'V2', voie: 2, position: 'done' }],
      codeHighlights: [{ procedure: 'Traverser', lines: [17], processId: 'V2' }],
    },
  ],
};

// ─── Scénario 3 ─ Changement sans voiture en attente ────────────────────────

const scenario3: Scenario = {
  id: 'sc3',
  title: 'Scénario 3',
  subtitle: 'Changement sans voiture en attente',
  steps: [
    {
      description: 'État initial. Le carrefour est libre, aucune voiture, feux=1.',
      activeProcesses: [],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: [],
      vars: vars(1, false),
      changedVars: [],
      cars: [],
      codeHighlights: [],
    },
    {
      description: 'Le processus P appelle Changement(). Il acquiert mutexFeux (mutexFeux=1→0).',
      activeProcesses: ['P — Changement()'],
      semaphores: sem(0, 1, 1, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [],
      codeHighlights: [{ procedure: 'Changement', lines: [2], processId: 'P' }],
    },
    {
      description: 'P inverse le feu : feux = 3-1 = 2.',
      activeProcesses: ['P — Changement()'],
      semaphores: sem(0, 1, 1, 0),
      changedSemaphores: [],
      vars: vars(2, false),
      changedVars: ['feux'],
      cars: [],
      codeHighlights: [{ procedure: 'Changement', lines: [3], processId: 'P' }],
    },
    {
      description: 'P vérifie enAttente : FAUX. Aucune voiture à réveiller. P libère directement mutexFeux (mutexFeux=0→1).',
      activeProcesses: ['P — Changement()'],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(2, false),
      changedVars: [],
      cars: [],
      codeHighlights: [{ procedure: 'Changement', lines: [8, 9], processId: 'P' }],
    },
  ],
};

// ─── Scénario 4 ─ Arrivée simultanée, voiture verte passe en premier ─────────

const scenario4: Scenario = {
  id: 'sc4',
  title: 'Scénario 4',
  subtitle: 'Arrivée simultanée — voie verte obtient mutexFeux en premier',
  steps: [
    {
      description: 'V1 (voie 1) et V2 (voie 2) arrivent simultanément. feux=1 (voie 1 au vert).',
      activeProcesses: [],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: [],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'arriving' },
        { id: 'V2', voie: 2, position: 'arriving' },
      ],
      codeHighlights: [],
    },
    {
      description: 'V1 appelle P(queue1) (queue1=1→0). V2 appelle P(queue2) (queue2=1→0). Chacune entre dans la file de sa voie sans conflit.',
      activeProcesses: ['V1 — Traverser(1)', 'V2 — Traverser(2)'],
      semaphores: sem(1, 0, 0, 0),
      changedSemaphores: ['queue1', 'queue2'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'queued' },
        { id: 'V2', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [2], processId: 'V1' },
        { procedure: 'Traverser', lines: [2], processId: 'V2' },
      ],
    },
    {
      description: 'V1 et V2 appellent toutes deux P(mutexFeux). V1 l\'obtient en premier (mutexFeux=1→0). V2 se bloque en attente du mutex.',
      activeProcesses: ['V1 — Traverser(1)', 'V2 — Traverser(2)'],
      semaphores: sem(0, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'waiting_mutex' },
        { id: 'V2', voie: 2, position: 'waiting_mutex' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [3], processId: 'V1' },
        { procedure: 'Traverser', lines: [3], processId: 'V2' },
      ],
      semaphoreQueues: { mutexFeux: ['V2'] },
    },
    {
      description: 'V1 vérifie feux == 1 : VRAI. Elle exécute passer().',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(0, 0, 0, 0),
      changedSemaphores: [],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'passing' },
        { id: 'V2', voie: 2, position: 'waiting_mutex' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [5, 6], processId: 'V1' },
        { procedure: 'Traverser', lines: [3], processId: 'V2' },
      ],
      semaphoreQueues: { mutexFeux: ['V2'] },
    },
    {
      description: 'V1 libère mutexFeux (mutexFeux=0→1). V2 peut maintenant acquérir le mutex.',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(1, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'passing' },
        { id: 'V2', voie: 2, position: 'waiting_mutex' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [7], processId: 'V1' }],
    },
    {
      description: 'V1 libère queue1 (queue1=0→1). V2 acquiert mutexFeux (mutexFeux=1→0).',
      activeProcesses: ['V1 — Traverser(1)', 'V2 — Traverser(2)'],
      semaphores: sem(0, 1, 0, 0),
      changedSemaphores: ['mutexFeux', 'queue1'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [17], processId: 'V1' },
        { procedure: 'Traverser', lines: [3], processId: 'V2' },
      ],
    },
    {
      description: 'V2 vérifie feux == 2 : FAUX (feux=1). Elle pose enAttente = true et libère mutexFeux (mutexFeux=0→1).',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(1, 1, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, true),
      changedVars: ['enAttente'],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 2, position: 'waiting_signal' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [8, 9, 10], processId: 'V2' }],
    },
    {
      description: 'V2 se bloque sur P(signalAttente). Le processus P exécute Changement() : feux passe à 2, V(signalAttente) réveille V2.',
      activeProcesses: ['P — Changement()', 'V2 — Traverser(2)'],
      semaphores: sem(0, 1, 0, 0),
      changedSemaphores: ['mutexFeux', 'signalAttente'],
      vars: vars(2, true),
      changedVars: ['feux'],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 2, position: 'waiting_signal' },
      ],
      codeHighlights: [
        { procedure: 'Changement', lines: [2, 3, 5, 6], processId: 'P' },
        { procedure: 'Traverser', lines: [11], processId: 'V2' },
      ],
    },
    {
      description: 'V2 se réveille, remet enAttente = false, et exécute passer().',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(0, 1, 0, 0),
      changedSemaphores: ['signalAttente'],
      vars: vars(2, false),
      changedVars: ['enAttente'],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 2, position: 'passing' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [12, 13], processId: 'V2' }],
    },
    {
      description: 'V2 libère mutexFeux (mutexFeux=0→1), puis queue2 (queue2=0→1). Traversée terminée.',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: ['mutexFeux', 'queue2'],
      vars: vars(2, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 2, position: 'done' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [14, 17], processId: 'V2' }],
    },
  ],
};

// ─── Scénario 4' ─ Arrivée simultanée, voiture rouge passe en premier ────────

const scenario4p: Scenario = {
  id: 'sc4p',
  title: "Scénario 4'",
  subtitle: 'Arrivée simultanée — voie rouge obtient mutexFeux en premier',
  steps: [
    {
      description: 'V1 (voie 1, feu vert) et V2 (voie 2, feu rouge) arrivent simultanément. feux=1.',
      activeProcesses: [],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: [],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'arriving' },
        { id: 'V2', voie: 2, position: 'arriving' },
      ],
      codeHighlights: [],
    },
    {
      description: 'V1 appelle P(queue1) (queue1=1→0). V2 appelle P(queue2) (queue2=1→0).',
      activeProcesses: ['V1 — Traverser(1)', 'V2 — Traverser(2)'],
      semaphores: sem(1, 0, 0, 0),
      changedSemaphores: ['queue1', 'queue2'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'queued' },
        { id: 'V2', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [2], processId: 'V1' },
        { procedure: 'Traverser', lines: [2], processId: 'V2' },
      ],
    },
    {
      description: 'Les deux appellent P(mutexFeux). Cette fois V2 l\'obtient en premier (mutexFeux=1→0). V1 se bloque.',
      activeProcesses: ['V1 — Traverser(1)', 'V2 — Traverser(2)'],
      semaphores: sem(0, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'waiting_mutex' },
        { id: 'V2', voie: 2, position: 'waiting_mutex' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [3], processId: 'V1' },
        { procedure: 'Traverser', lines: [3], processId: 'V2' },
      ],
      semaphoreQueues: { mutexFeux: ['V1'] },
    },
    {
      description: 'V2 vérifie feux == 2 : FAUX. Elle pose enAttente = true, libère mutexFeux (mutexFeux=0→1) et se bloque sur P(signalAttente).',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(1, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, true),
      changedVars: ['enAttente'],
      cars: [
        { id: 'V1', voie: 1, position: 'waiting_mutex' },
        { id: 'V2', voie: 2, position: 'waiting_signal' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [8, 9, 10, 11], processId: 'V2' },
        { procedure: 'Traverser', lines: [3], processId: 'V1' },
      ],
      semaphoreQueues: { signalAttente: ['V2'] },
    },
    {
      description: 'V1 acquiert mutexFeux (mutexFeux=1→0). Elle vérifie feux == 1 : VRAI. Elle exécute passer().',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(0, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, true),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'passing' },
        { id: 'V2', voie: 2, position: 'waiting_signal' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [3, 5, 6], processId: 'V1' }],
      semaphoreQueues: { signalAttente: ['V2'] },
    },
    {
      description: 'V1 libère mutexFeux (mutexFeux=0→1), puis queue1 (queue1=0→1).',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(1, 1, 0, 0),
      changedSemaphores: ['mutexFeux', 'queue1'],
      vars: vars(1, true),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 2, position: 'waiting_signal' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [7, 17], processId: 'V1' }],
      semaphoreQueues: { signalAttente: ['V2'] },
    },
    {
      description: 'P exécute Changement() : feux passe à 2 (mutexFeux=1→0), détecte enAttente=true et appelle V(signalAttente) SANS libérer mutexFeux.',
      activeProcesses: ['P — Changement()'],
      semaphores: sem(0, 1, 0, 1),
      changedSemaphores: ['mutexFeux', 'signalAttente'],
      vars: vars(2, true),
      changedVars: ['feux'],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 2, position: 'waiting_signal' },
      ],
      codeHighlights: [{ procedure: 'Changement', lines: [2, 3, 5, 6], processId: 'P' }],
    },
    {
      description: 'V2 se réveille (signalAttente=1→0), remet enAttente = false et exécute passer().',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(0, 1, 0, 0),
      changedSemaphores: ['signalAttente'],
      vars: vars(2, false),
      changedVars: ['enAttente'],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 2, position: 'passing' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [11, 12, 13], processId: 'V2' }],
    },
    {
      description: 'V2 libère mutexFeux (mutexFeux=0→1), puis queue2 (queue2=0→1). Traversée terminée.',
      activeProcesses: ['V2 — Traverser(2)'],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: ['mutexFeux', 'queue2'],
      vars: vars(2, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 2, position: 'done' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [14, 17], processId: 'V2' }],
    },
  ],
};

// ─── Scénario 5 ─ File de 3 voitures sur la même voie ────────────────────────

const scenario5: Scenario = {
  id: 'sc5',
  title: 'Scénario 5',
  subtitle: 'File de 3 voitures sur la voie 1',
  steps: [
    {
      description: 'V1, V2 et V3 arrivent successivement sur la voie 1. feux=1 (voie 1 au vert).',
      activeProcesses: [],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: [],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'arriving' },
        { id: 'V2', voie: 1, position: 'arriving' },
        { id: 'V3', voie: 1, position: 'arriving' },
      ],
      codeHighlights: [],
    },
    {
      description: 'V1 appelle P(queue1) en premier (queue1=1→0). V2 et V3 se bloquent sur P(queue1) — sérialisées derrière V1.',
      activeProcesses: ['V1 — Traverser(1)', 'V2 — Traverser(1)', 'V3 — Traverser(1)'],
      semaphores: sem(1, 0, 1, 0),
      changedSemaphores: ['queue1'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'queued' },
        { id: 'V2', voie: 1, position: 'queued' },
        { id: 'V3', voie: 1, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [2], processId: 'V1' },
        { procedure: 'Traverser', lines: [2], processId: 'V2' },
        { procedure: 'Traverser', lines: [2], processId: 'V3' },
      ],
      semaphoreQueues: { queue1: ['V2', 'V3'] },
    },
    {
      description: 'V1 acquiert mutexFeux (mutexFeux=1→0), vérifie feux==1 : VRAI, exécute passer().',
      activeProcesses: ['V1 — Traverser(1)'],
      semaphores: sem(0, 0, 1, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'passing' },
        { id: 'V2', voie: 1, position: 'queued' },
        { id: 'V3', voie: 1, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [3, 5, 6], processId: 'V1' },
        { procedure: 'Traverser', lines: [2], processId: 'V2' },
        { procedure: 'Traverser', lines: [2], processId: 'V3' },
      ],
      semaphoreQueues: { queue1: ['V2', 'V3'] },
    },
    {
      description: 'V1 libère mutexFeux (mutexFeux=0→1), puis queue1 (queue1=0→1). V2 se débloque sur P(queue1) (queue1=1→0).',
      activeProcesses: ['V1 — Traverser(1)', 'V2 — Traverser(1)'],
      semaphores: sem(1, 0, 1, 0),
      changedSemaphores: ['mutexFeux', 'queue1'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 1, position: 'queued' },
        { id: 'V3', voie: 1, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [7, 17], processId: 'V1' },
        { procedure: 'Traverser', lines: [2], processId: 'V2' },
        { procedure: 'Traverser', lines: [2], processId: 'V3' },
      ],
      semaphoreQueues: { queue1: ['V3'] },
    },
    {
      description: 'V2 acquiert mutexFeux (mutexFeux=1→0), vérifie feux==1 : VRAI, exécute passer().',
      activeProcesses: ['V2 — Traverser(1)'],
      semaphores: sem(0, 0, 1, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 1, position: 'passing' },
        { id: 'V3', voie: 1, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [3, 5, 6], processId: 'V2' },
        { procedure: 'Traverser', lines: [2], processId: 'V3' },
      ],
      semaphoreQueues: { queue1: ['V3'] },
    },
    {
      description: 'V2 libère mutexFeux (mutexFeux=0→1), puis queue1 (queue1=0→1). V3 se débloque sur P(queue1) (queue1=1→0).',
      activeProcesses: ['V2 — Traverser(1)', 'V3 — Traverser(1)'],
      semaphores: sem(1, 0, 1, 0),
      changedSemaphores: ['mutexFeux', 'queue1'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 1, position: 'done' },
        { id: 'V3', voie: 1, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [7, 17], processId: 'V2' },
        { procedure: 'Traverser', lines: [2], processId: 'V3' },
      ],
    },
    {
      description: 'V3 acquiert mutexFeux (mutexFeux=1→0), vérifie feux==1 : VRAI, exécute passer().',
      activeProcesses: ['V3 — Traverser(1)'],
      semaphores: sem(0, 0, 1, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 1, position: 'done' },
        { id: 'V3', voie: 1, position: 'passing' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [3, 5, 6], processId: 'V3' }],
    },
    {
      description: 'V3 libère mutexFeux (mutexFeux=0→1), puis queue1 (queue1=0→1). Toutes les voitures ont traversé.',
      activeProcesses: ['V3 — Traverser(1)'],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: ['mutexFeux', 'queue1'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1', voie: 1, position: 'done' },
        { id: 'V2', voie: 1, position: 'done' },
        { id: 'V3', voie: 1, position: 'done' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [7, 17], processId: 'V3' }],
    },
  ],
};

// ─── Scénario 6 ─ Plusieurs voitures sur les deux voies (additionnel) ─────────
// Sequence: V2A gets mutexFeux first (red light → blocked on signalAttente),
// V1A gets mutexFeux next (green → passes), P does Changement before V1B
// (unblocks V2A), V1B gets mutexFeux (now red → enAttente), V2B passes,
// second Changement unblocks V1B.

const scenario6: Scenario = {
  id: 'sc6',
  title: 'Scénario 6',
  subtitle: 'Plusieurs voitures sur les deux voies (additionnel)',
  steps: [
    // ── Step 0: Initial ──
    {
      description:
        'V1A, V1B (voie 1) et V2A, V2B (voie 2) arrivent. feux=1 (voie 1 au vert).',
      activeProcesses: [],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: [],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1A', voie: 1, position: 'arriving' },
        { id: 'V1B', voie: 1, position: 'arriving' },
        { id: 'V2A', voie: 2, position: 'arriving' },
        { id: 'V2B', voie: 2, position: 'arriving' },
      ],
      codeHighlights: [],
    },
    // ── Step 1: Queue acquisition ──
    {
      description:
        'V1A appelle P(queue1) (queue1=1→0) — V1B se bloque sur P(queue1). V2A appelle P(queue2) (queue2=1→0) — V2B se bloque sur P(queue2).',
      activeProcesses: ['V1A — Traverser(1)', 'V1B — Traverser(1)', 'V2A — Traverser(2)', 'V2B — Traverser(2)'],
      semaphores: sem(1, 0, 0, 0),
      changedSemaphores: ['queue1', 'queue2'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1A', voie: 1, position: 'queued' },
        { id: 'V1B', voie: 1, position: 'queued' },
        { id: 'V2A', voie: 2, position: 'queued' },
        { id: 'V2B', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [2], processId: 'V1A' },
        { procedure: 'Traverser', lines: [2], processId: 'V1B' },
        { procedure: 'Traverser', lines: [2], processId: 'V2A' },
        { procedure: 'Traverser', lines: [2], processId: 'V2B' },
      ],
      semaphoreQueues: { queue1: ['V1B'], queue2: ['V2B'] },
    },
    // ── Step 2: V2A gets mutexFeux first ──
    {
      description:
        'V2A et V1A appellent P(mutexFeux). V2A l\'obtient en premier (mutexFeux=1→0). V1A se bloque sur P(mutexFeux).',
      activeProcesses: ['V1A — Traverser(1)', 'V2A — Traverser(2)'],
      semaphores: sem(0, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1A', voie: 1, position: 'waiting_mutex' },
        { id: 'V1B', voie: 1, position: 'queued' },
        { id: 'V2A', voie: 2, position: 'waiting_mutex' },
        { id: 'V2B', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [3], processId: 'V2A' },
        { procedure: 'Traverser', lines: [3], processId: 'V1A' },
      ],
      semaphoreQueues: { queue1: ['V1B'], queue2: ['V2B'], mutexFeux: ['V1A'] },
    },
    // ── Step 3: V2A feu rouge → enAttente, bloque sur signalAttente ──
    {
      description:
        'V2A vérifie feux==2 : FAUX (feux=1). Elle pose enAttente=true, libère mutexFeux (0→1), et se bloque sur P(signalAttente).',
      activeProcesses: ['V2A — Traverser(2)'],
      semaphores: sem(1, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, true),
      changedVars: ['enAttente'],
      cars: [
        { id: 'V1A', voie: 1, position: 'waiting_mutex' },
        { id: 'V1B', voie: 1, position: 'queued' },
        { id: 'V2A', voie: 2, position: 'waiting_signal' },
        { id: 'V2B', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [8, 9, 10, 11], processId: 'V2A' },
        { procedure: 'Traverser', lines: [3], processId: 'V1A' },
      ],
      semaphoreQueues: { queue1: ['V1B'], queue2: ['V2B'], signalAttente: ['V2A'] },
    },
    // ── Step 4: V1A gets mutexFeux, feu vert, passe ──
    {
      description:
        'V1A acquiert mutexFeux (1→0). Elle vérifie feux==1 : VRAI. Elle exécute passer().',
      activeProcesses: ['V1A — Traverser(1)'],
      semaphores: sem(0, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(1, true),
      changedVars: [],
      cars: [
        { id: 'V1A', voie: 1, position: 'passing' },
        { id: 'V1B', voie: 1, position: 'queued' },
        { id: 'V2A', voie: 2, position: 'waiting_signal' },
        { id: 'V2B', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [3, 5, 6], processId: 'V1A' },
        { procedure: 'Traverser', lines: [11], processId: 'V2A' },
      ],
      semaphoreQueues: { queue1: ['V1B'], queue2: ['V2B'], signalAttente: ['V2A'] },
    },
    // ── Step 5: V1A done, V1B gets queue1 ──
    {
      description:
        'V1A libère mutexFeux (0→1) et queue1 (0→1). V1B se débloque sur P(queue1) (queue1=1→0).',
      activeProcesses: ['V1A — Traverser(1)', 'V1B — Traverser(1)'],
      semaphores: sem(1, 0, 0, 0),
      changedSemaphores: ['mutexFeux', 'queue1'],
      vars: vars(1, true),
      changedVars: [],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'queued' },
        { id: 'V2A', voie: 2, position: 'waiting_signal' },
        { id: 'V2B', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [7, 17], processId: 'V1A' },
        { procedure: 'Traverser', lines: [2], processId: 'V1B' },
      ],
      semaphoreQueues: { queue2: ['V2B'], signalAttente: ['V2A'] },
    },
    // ── Step 6: P Changement() gets mutexFeux BEFORE V1B ──
    {
      description:
        'P appelle Changement() et acquiert mutexFeux (1→0) AVANT V1B. V1B se bloque sur P(mutexFeux). P inverse feux=3-1=2. enAttente=true → V(signalAttente) (0→1) pour réveiller V2A.',
      activeProcesses: ['P — Changement()', 'V1B — Traverser(1)'],
      semaphores: sem(0, 0, 0, 1),
      changedSemaphores: ['mutexFeux', 'signalAttente'],
      vars: vars(2, true),
      changedVars: ['feux'],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'waiting_mutex' },
        { id: 'V2A', voie: 2, position: 'waiting_signal' },
        { id: 'V2B', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Changement', lines: [2, 3, 5, 6], processId: 'P' },
        { procedure: 'Traverser', lines: [3], processId: 'V1B' },
      ],
      semaphoreQueues: { queue2: ['V2B'], mutexFeux: ['V1B'] },
    },
    // ── Step 7: V2A wakes up, passes ──
    {
      description:
        'V2A se réveille (signalAttente=1→0), remet enAttente=false, exécute passer(). mutexFeux reste pris (hérité du Changement).',
      activeProcesses: ['V2A — Traverser(2)'],
      semaphores: sem(0, 0, 0, 0),
      changedSemaphores: ['signalAttente'],
      vars: vars(2, false),
      changedVars: ['enAttente'],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'waiting_mutex' },
        { id: 'V2A', voie: 2, position: 'passing' },
        { id: 'V2B', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [12, 13], processId: 'V2A' },
        { procedure: 'Traverser', lines: [3], processId: 'V1B' },
      ],
      semaphoreQueues: { queue2: ['V2B'], mutexFeux: ['V1B'] },
    },
    // ── Step 8: V2A releases mutexFeux + queue2 → V1B gets mutex, V2B gets queue2 ──
    {
      description:
        'V2A libère mutexFeux (0→1) et queue2 (0→1). V1B acquiert mutexFeux (1→0). V2B acquiert queue2 (1→0).',
      activeProcesses: ['V2A — Traverser(2)', 'V1B — Traverser(1)', 'V2B — Traverser(2)'],
      semaphores: sem(0, 0, 0, 0),
      changedSemaphores: ['mutexFeux', 'queue2'],
      vars: vars(2, false),
      changedVars: [],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'waiting_mutex' },
        { id: 'V2A', voie: 2, position: 'done' },
        { id: 'V2B', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [14, 17], processId: 'V2A' },
        { procedure: 'Traverser', lines: [3], processId: 'V1B' },
        { procedure: 'Traverser', lines: [2], processId: 'V2B' },
      ],
    },
    // ── Step 9: V1B feu rouge → enAttente, bloque sur signalAttente ──
    {
      description:
        'V1B vérifie feux==1 : FAUX (feux=2). Elle pose enAttente=true, libère mutexFeux (0→1), et se bloque sur P(signalAttente).',
      activeProcesses: ['V1B — Traverser(1)'],
      semaphores: sem(1, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(2, true),
      changedVars: ['enAttente'],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'waiting_signal' },
        { id: 'V2A', voie: 2, position: 'done' },
        { id: 'V2B', voie: 2, position: 'queued' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [8, 9, 10, 11], processId: 'V1B' },
      ],
      semaphoreQueues: { signalAttente: ['V1B'] },
    },
    // ── Step 10: V2B gets mutexFeux, feu vert, passe ──
    {
      description:
        'V2B acquiert mutexFeux (1→0). Elle vérifie feux==2 : VRAI. Elle exécute passer().',
      activeProcesses: ['V2B — Traverser(2)'],
      semaphores: sem(0, 0, 0, 0),
      changedSemaphores: ['mutexFeux'],
      vars: vars(2, true),
      changedVars: [],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'waiting_signal' },
        { id: 'V2A', voie: 2, position: 'done' },
        { id: 'V2B', voie: 2, position: 'passing' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [3, 5, 6], processId: 'V2B' },
        { procedure: 'Traverser', lines: [11], processId: 'V1B' },
      ],
      semaphoreQueues: { signalAttente: ['V1B'] },
    },
    // ── Step 11: V2B done ──
    {
      description:
        'V2B libère mutexFeux (0→1) et queue2 (0→1). V2B a traversé.',
      activeProcesses: ['V2B — Traverser(2)'],
      semaphores: sem(1, 0, 1, 0),
      changedSemaphores: ['mutexFeux', 'queue2'],
      vars: vars(2, true),
      changedVars: [],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'waiting_signal' },
        { id: 'V2A', voie: 2, position: 'done' },
        { id: 'V2B', voie: 2, position: 'done' },
      ],
      codeHighlights: [
        { procedure: 'Traverser', lines: [7, 17], processId: 'V2B' },
        { procedure: 'Traverser', lines: [11], processId: 'V1B' },
      ],
      semaphoreQueues: { signalAttente: ['V1B'] },
    },
    // ── Step 12: Second Changement() wakes V1B ──
    {
      description:
        'P appelle Changement() à nouveau. P(mutexFeux) (1→0), feux=3-2=1. enAttente=true → V(signalAttente) (0→1) réveille V1B.',
      activeProcesses: ['P — Changement()'],
      semaphores: sem(0, 0, 1, 1),
      changedSemaphores: ['mutexFeux', 'signalAttente'],
      vars: vars(1, true),
      changedVars: ['feux'],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'waiting_signal' },
        { id: 'V2A', voie: 2, position: 'done' },
        { id: 'V2B', voie: 2, position: 'done' },
      ],
      codeHighlights: [
        { procedure: 'Changement', lines: [2, 3, 5, 6], processId: 'P' },
        { procedure: 'Traverser', lines: [11], processId: 'V1B' },
      ],
    },
    // ── Step 13: V1B wakes up, passes ──
    {
      description:
        'V1B se réveille (signalAttente=1→0), remet enAttente=false, exécute passer().',
      activeProcesses: ['V1B — Traverser(1)'],
      semaphores: sem(0, 0, 1, 0),
      changedSemaphores: ['signalAttente'],
      vars: vars(1, false),
      changedVars: ['enAttente'],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'passing' },
        { id: 'V2A', voie: 2, position: 'done' },
        { id: 'V2B', voie: 2, position: 'done' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [12, 13], processId: 'V1B' }],
    },
    // ── Step 14: V1B done — all cars have crossed ──
    {
      description:
        'V1B libère mutexFeux (0→1) et queue1 (0→1). Toutes les voitures ont traversé.',
      activeProcesses: ['V1B — Traverser(1)'],
      semaphores: sem(1, 1, 1, 0),
      changedSemaphores: ['mutexFeux', 'queue1'],
      vars: vars(1, false),
      changedVars: [],
      cars: [
        { id: 'V1A', voie: 1, position: 'done' },
        { id: 'V1B', voie: 1, position: 'done' },
        { id: 'V2A', voie: 2, position: 'done' },
        { id: 'V2B', voie: 2, position: 'done' },
      ],
      codeHighlights: [{ procedure: 'Traverser', lines: [14, 17], processId: 'V1B' }],
    },
  ],
};

export const scenarios: Scenario[] = [
  scenario1,
  scenario2,
  scenario3,
  scenario4,
  scenario4p,
  scenario5,
  scenario6,
];

/** Lines of Changement() — 1-indexed */
export const CHANGEMENT_CODE = [
  'Changement() {',               // 1
  '  P(mutexFeux);',              // 2
  '  feux = 3 - feux;',           // 3
  '',                              // 4
  '  if (enAttente) {',           // 5
  '    V(signalAttente);',        // 6
  '    // mutexFeux libéré par la voiture',  // 7
  '  } else {',                   // 8
  '    V(mutexFeux);',            // 9
  '  }',                          // 10
  '}',                            // 11
];

/** Lines of Traverser() — 1-indexed */
export const TRAVERSER_CODE = [
  'Traverser(voie) {',                   // 1
  '  P(queues[voie-1]);',               // 2
  '  P(mutexFeux);',                    // 3
  '',                                    // 4
  '  if (feux == voie) {',              // 5
  '    passer();',                      // 6
  '    V(mutexFeux);',                  // 7
  '  } else {',                         // 8
  '    enAttente = true;',              // 9
  '    V(mutexFeux);',                  // 10
  '    P(signalAttente);',              // 11
  '    enAttente = false;',             // 12
  '    passer();',                      // 13
  '    V(mutexFeux);',                  // 14
  '  }',                                // 15
  '',                                   // 16
  '  V(queues[voie-1]);',               // 17
  '}',                                  // 18
];

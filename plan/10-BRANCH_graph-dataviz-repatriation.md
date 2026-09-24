# Feature: Rapatriement graph et dataviz vers le design system

## Objective

- [x] Appliquer le mandat owner du 2026-09-15 : référence DS pour graph et les cinq packages dataviz, noms et frontières de responsabilité conservés.
- [ ] Achever le programme M0–M6 avec adoption consommateur et critères track acceptés.

## Scope / Guardrails

- [x] Worktree autorisé `.repat-wt`, branche `feat/graph-dataviz-repatriation`, base DS `422776869847079891a5be49a8e14313ea1c25a8`.
- [x] Exploiter les inventaires reçus ; compléter seulement exports effectifs, DS et contradictions.
- [x] Sources externes lues ; aucune écriture dans graphify/dataviz/sentropic ni dans le checkout du conducteur.
- [x] Exclure `.astra-inputs/` des commits ; aucune attribution IA dans les messages de commit.
- [x] Adapter les conventions du template harness au dépôt npm : absence de Makefile et de template local ; commandes npm, pas de conventions Docker/API étrangères.
- [x] Track de ce worktree : writer principal Astra expressément mandaté ; autres audits sans écriture track.
- [x] Pas d'import automatique de ce plan qui recréerait une taxonomie ; identités stables et rattachement S1–S7 via les opérations supportées dédiées.

## Branch Scope Boundaries

- [x] Allowed : `spec/*GRAPH_DATAVIZ*`, `plan/10-BRANCH_graph-dataviz-repatriation.md`, `plan/*graph-dataviz*`, `docs/graph-dataviz-*`, `.track/**` via Track uniquement.
- [x] Allowed M1 initial : `packages/graph/**`, `packages/dataviz-core/**`, `package.json`, `package-lock.json` ; runtime source conservé, configuration packaging minimale.
- [x] Conditional M1 suivant : `packages/dataviz-{svelte,react,vue,angular}/**`, scripts/CI packaging nécessaires après compatibilité GeoChart et tests.
- [x] Forbidden : `.astra-inputs/**` au staging, autres checkouts en écriture, journaux/hashes manuels, Makefile/Docker/cursor, changements produit non liés.

## Plan / Todo

- [x] **M0 — Inventaire et réconciliation**
  - [x] Correspondance complète des six surfaces publiques et composants DS, source/destination/décision/clé track.
  - [x] Code/tests/commits WP20 confrontés aux handovers, `partial/unverified` explicite.
  - [x] Vrais IDs S1–S7 ; rapprochement des items existants avant création ; un accountable principal par item.
  - [x] Programme initialisé via API publique Track avec acteur agent ; intégrité et rejeu sans doublons vérifiés.
  - [x] Architecture STUDY, deux DAG Mermaid, modèle formel/pivots et décisions autoportantes.
  - [ ] Revue design owner prescrite fable 5.1 + gemini 3.7 réconciliée par le conducteur avant EVOL.

- [x] **M1 — Rapatriement conservatoire** (PR #61, `7c3fbbcf` ; publication préparée, non déclenchée)
  - [x] `GD-M1-GRAPH` : copier fichiers Git du package avec licence/provenance, conserver 211 exports ESM/CJS/types et tests/golden/bench ; build/pack/import vérifiés.
  - [x] `GD-M1-DATAVIZ-CORE` : copier package avec ses 495 exports et 68 fichiers tests, préserver tsconfig et indépendance ; tests/build/pack/import vérifiés.
  - [x] `GD-M1-PACKAGING` : dépendances workspace locales, lockfile, assets/CSS, workers ; adapter scripts smoke/release/OIDC pour six noms sans collision de publication.
  - [x] `GD-M1-DATAVIZ-SVELTE` : source+tests+doc, peers/CSS ; résoudre `GeoMap`→`GeoChart`, builds/typecheck/SSR consommateur.
  - [x] `GD-M1-DATAVIZ-REACT` : mêmes preuves ; hooks store/SSR/types, pas de core dupliqué.
  - [x] `GD-M1-DATAVIZ-VUE` : mêmes preuves ; events et provide/inject, pas de double émission.
  - [x] `GD-M1-DATAVIZ-ANGULAR` : rapatrier aussi le seam privé, remplacer `file:` DS par workspace, préserver les deux composants et exposer les absences de parité.
  - [x] Gate graph : suites `packages/graph/tests/*.test.ts`, golden Canvas2D/WebGL préflight séparés, `bench/buffers-bench.mjs` ; échecs environnement distingués.
  - [x] Gate core : `packages/dataviz-core/src/*.test.ts` sans cache/parallélisme de fichiers ; tsc sans emit puis build ; import tarball propre.
  - [x] Gate adapters : toutes suites source copiées, public imports + CSS compilés depuis tarballs, build/SSR des consommateurs représentatifs.

- [ ] **M2 — Fondations**
  - [ ] `GD-M2-MODEL` : refs/profils/vues/occurrences/transactions ; fixtures schéma/révisions/inverse et cas rejetés. Cadrage écrit : [SPEC_EVOL_GD_M2_MODEL.md](../spec/SPEC_EVOL_GD_M2_MODEL.md) (D1-A, D3-C appliquées ; paquet `@sentropic/diagram-core` privé).
  - [ ] `GD-M2-PROCESSING` : déplacer Barnes-Hut/hierarchy avec tests existants ; adapter registre et résultats riches avec compat PositionFrame. Cadrage écrit : [SPEC_EVOL_GD_M2_PROCESSING.md](../spec/SPEC_EVOL_GD_M2_PROCESSING.md) ; le calcul FA2 vit encore dans graphify (`src/graph-layout.ts`, `src/hierarchy-layout.ts`, `src/scene-layout.ts`), l'identifiant `force` du paquet publié n'étant qu'un passe-plat rendant un `Float32Array`.
  - [ ] `GD-M2-WORKERS` : snapshot/version/cancel/fallback/rejet périmé et résolution worker dans pack.
  - [ ] `GD-M2-DS-PRESENTATION` : convergence du rendu et des contrats contrôlés sans remonter le store dans les composants.
  - [ ] `GD-M2-CANVAS` : commandes de sélection/édition/ports/annotations ; preview/transaction/persistence séparés.
  - [ ] `GD-M2-PARITY` et `GD-M2-THEMES` : quatre frameworks, a11y/IME/SSR et géométrie/token communes. Retard mesuré : `dataviz-angular` expose 12 composants contre 118 en Svelte, 118 en React et 117 en Vue ; premier lot de 10 livré avec le patron de portage (`packages/dataviz-angular/PATTERN.md`), 107 adaptateurs restants.
  - [ ] Gate : tests invariants, imports sans DOM, absence cycles, contrats multimoteurs, conflits révisions.

- [ ] **M3 — Tranche complète**
  - [ ] `GD-M3-SLICE` : diagramme éditable en SVG/WebGL, saisie HTML, ports/layout/routage et BPMN/ArchiMate natifs.
  - [ ] Gate : même scénario humain et agent via commandes, clavier/a11y/IME, undo/redo, export et mesure performance.

- [ ] **M4 — Interop**
  - [ ] `GD-M4-CODECS` : sous-ensembles versionnés UML/PlantUML, Mermaid, BPMN XML+DI, ArchiMate exchange, draw.io et EA XMI/profils.
  - [ ] Gate : fixtures import/export/round-trip, extensions inconnues et rapports exhaustifs ; aucune perte silencieuse.

- [ ] **M5 — Couverture**
  - [ ] `GD-M5-PROCESSING` : catalogue algorithmes/options relié aux écarts de réalisation ; aucune lib tierce implicite.
  - [ ] `GD-M5-APPS` : catalogue JointJS, scénarios via APIs publiques, écarts de conformité et parité visibles.
  - [ ] Gate : fixture et preuve par capacité revendiquée ; inventaire ≠ implémentation.

- [ ] **M6 — Adoption**
  - [ ] `GD-M6-GRAPHIFY` : basculer renderer/layout/workers, shims vers canonique ; retirer copies après preuve consommateur.
  - [ ] `GD-M6-DATAVIZ` : apps/docs/site consomment versions DS ; filtres/bookmarks/exports/parité ; ancien audit de style ne vaut pas recette de migration.
  - [ ] `GD-M6-SENTROPIC` : auditer ports canvas/comments/ressources/live effectifs et intégrer sans dépendance inverse.
  - [ ] Gate : imports/build/types/pack/usages produits, release OIDC et versions consommées ; retrait source seulement après bascule.

## Feedback Loop

- [x] `attention` : CLI track 0.94.3 attribue les écritures à `human:<git.email>` ; API publique `Track` + `EventStore`, acteur agent et provenance proposée non signée utilisés conformément au mandat prioritaire.
- [x] `attention` : géographie dataviz importe GeoMap alors que main DS exporte GeoChart ; adaptation M1 requise avant résolution locale des wrappers.
- [x] `attention` : WP20 a deux traces FR3 différentes ; grille dataviz indépendante de DS ; aucune clôture globale de conformité déduite.
- [x] `acknowledge` : mandat et progression envoyés au conducteur via h2a ; revue prescriptive et rendu focus/DS confiés au conducteur.
- [ ] `attention` : décisions D1–D4 dans le dossier dédié, sans sélection owner enregistrée par l'agent.

## Final validation

- [x] Vérifier chaque hunk et JSON : aucune omission d'export, aucun chemin de livrable manquant.
- [x] Vérifier `track validate`, DAG, idempotence et attribution agent ; conserver les IDs réutilisés et preuves séparées des statuts historiques.
- [x] Vérifier sous-lot M1 effectivement livré ; documenter toute limite de build/golden/pack/CI/adoption.
- [x] Transmettre checkpoint livré/restant/blocages/IDs/prochaine action et questions au conducteur.

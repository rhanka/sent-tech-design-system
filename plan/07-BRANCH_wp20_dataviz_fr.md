# Feature: WP20 — FR dataviz sequential heatmap + DashboardGrid

## Objective

Finaliser la demande dataviz FR restaurée depuis l'historique Claude/h2a :
HeatmapChart sequential scale, DashboardGrid edit-mode, et découverte de la troisième demande.

## Scope / Guardrails

- Parité Svelte, React, Vue, Angular.
- API backward-compatible.
- Pas de nouveaux tokens globaux pour WP20 ; les rampes restent privées au composant.
- Pas de drag-and-drop framework dans WP20 v1.
- La troisième FR ne doit pas ouvrir de backlog chart adjacent.

## Plan / Todo

- [x] **Heatmap sequential scale**
  - `scale?: "categorical" | "sequential"` livré sur Svelte/React/Vue/Angular.
  - Buckets stables `category1..category8`.
  - Rampe privée `--st-heatmapChart-ramp-*`.

- [x] **DashboardGrid edit-mode**
  - `tiles`, `columns`, `rowHeight`, `gap`, `editable`, `onLayout` livrés sur Svelte/React/Vue/Angular.
  - Contrôles clavier pour move/resize.
  - Normalisation sans mutation de l'entrée.

- [x] **Troisième FR dataviz**
  - Message récupéré via h2a/dataviz.
  - Scope rattaché à la famille heatmap/sequential et fermé dans track.

## Acceptance

- Index packages alignés sur les quatre frameworks.
- Docs catalogue + page DashboardGrid + page Heatmap à jour.
- Track WP20 à 100%.

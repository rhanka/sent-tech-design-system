# Feature: Roadmap Workpackages — Design System Sent Tech

## Objective
Vue d'ensemble trackable de tous les workpackages (WP2 -> WP16) avec statut et %.
Source de verite historique: `docs/workpackages.md`. 1 Lot = 1 WP. `[x]` = 100% ferme ;
`[ ]` = en cours / ouvert (% dans le titre). WP16 (QA pixel-perfect tri-framework) est la
poussee qualite ACTIVE ouverte le 2026-06-08 suite aux bugs owner ; elle prime sur
l'optimisme "100%" de WP2/WP6 sur la qualite visuelle (regressions visuelles rouvertes).

## Scope / Guardrails
- Detail bugs/QA: voir `02-BRANCH_qa-tri-framework` + `03-BRANCH_qa-systematic-pass`.
- Versions publiees: svelte 0.34.0 / react 0.32.0 / vue 0.32.0 / tokens+themes 0.11.0 / skills 0.2.0 / dataviz v0.4.19.

## Plan / Todo (lot-based)
- [x] **Lot WP2 — Site docs UX (100%)**
- [x] **Lot WP3 — Contrat header cross-site (100%, ferme)**
- [x] **Lot WP4 — Chat-UI primitives (100%)**
- [x] **Lot WP5 — Graphics / Charts primitives (100%)**
- [x] **Lot WP6 — Fix-plan bugs visuels (100% historique, MAIS regressions rouvertes par WP16)**
- [ ] **Lot WP7 — Audit DS large 37 refs (80%)**
  - Reste: etendre les findings des references hors P0/P1/P2 ; validation externe couverture 100%.
- [x] **Lot WP8 — Moteur design + skill multi-harness (100%)**
- [x] **Lot WP9 — Surface Chat / Agent (100%)**
- [ ] **Lot WP10 — Theming via moteur design (82%)**
  - Reste: rollout Phase 2 composants hors pilotes ; gouvernance publication client (Airbus = jamais public npmjs, prive).
- [x] **Lot WP11 — Dogfooding moteur publie (100%)**
- [x] **Lot WP12 — Templates docs / slides ESN (100%)**
- [x] **Lot WP13 — Portage React (100%)**
- [x] **Lot WP14 — Chrome documentaire par theme (100%)**
- [x] **Lot WP15 — Integration dataviz BI (100%, ferme v0.4.19)**
- [ ] **Lot WP16 — QA pixel-perfect tri-framework (0%, ACTIVE)**
  - Nouveau WP qualite (2026-06-08): pixel-perfect svelte/react/vue + zero bug visuel, sur 147 pages. Detail dans 02/03-BRANCH. Bloque la communication publique du DS tant que <90% conforme.
  - Inclut aussi le live recent non encore QA: layout onglets docs, parite icones P1+19 (lucide), API Link unifiee, login OAuth (e2e 2FA owner en attente).

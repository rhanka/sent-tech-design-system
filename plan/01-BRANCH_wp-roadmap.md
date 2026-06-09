# Feature: Roadmap Workpackages — Design System Sent Tech

## Objective
Vue d'ensemble TRACKABLE et HONNETE de toutes les activites (WP1 -> WP16 + sous-tracks + livrables
recents). Source historique: `docs/workpackages.md`. 1 Lot = 1 activite. `[x]` = ferme/livre+verifie ;
`[ ]` = ouvert (% dans le titre). NB IMPORTANT (2026-06-08): les "100%" historiques de WP1/WP2/WP6
sur la QUALITE visuelle sont DEMENTIS par la QA owner (6/7 composants verifies ont >=2 bugs). La
qualite "communicable" est portee par WP16 (pixel-perfect tri-framework), qui PRIME et bloque la
communication publique tant que <90% conforme. Detail bugs/QA: `02-BRANCH` + `03-BRANCH`.

## Scope / Guardrails
- Versions publiees: svelte 0.34.0 / react 0.32.0 / vue 0.32.0 / tokens+themes 0.11.0 / skills 0.2.0 / dataviz v0.4.19.
- Distinction: "feature livree" (le composant existe) vs "qualite communicable" (pixel-perfect, zero bug) = WP16.

## Plan / Todo (lot-based)
- [ ] **Lot WP1 — DS Core primitives Svelte (95%, qualite a re-QA)**
  - Livre: IconButton, MenuTriggerButton, Menu/OverflowMenu, MenuPopover, CopyButton, Search, PasswordInput, InlineLoading, ProgressIndicator, PaginationNav, Tag, FileUploader. MAIS QA owner a trouve des bugs (FileUploader hover/parite, CopyButton, Combobox tailles) -> re-QA via WP16.
- [ ] **Lot WP2 — Site docs UX (90%, QA en cours)**
  - Refonte majeure faite (layout onglets route-backed sur 143 pages, "Apercu live" supprime, login OAuth). RESTE: bugs docs (DatePicker onglets absents des Exemples...) + passe QA 147 pages.
- [x] **Lot WP3 — Contrat header cross-site (100%, ferme)**
- [x] **Lot WP4 — Chat-UI primitives (100%)**
- [x] **Lot WP5 — Graphics / Charts primitives (100% feature ; parite a verifier en WP16)**
- [ ] **Lot WP6 — Fix-plan bugs visuels (ROUVERT ~50%)**
  - Le "100%" historique est faux: la QA a trouve des regressions (Calendar grille cassee) et 6/7 composants buggy. Le vrai fix-plan est desormais WP16.
- [ ] **Lot WP7 — Audit DS large 37 refs (80%)**
  - Reste: findings hors P0/P1/P2 ; validation externe couverture 100%.
- [x] **Lot WP8 — Moteur design + skill multi-harness (100% + audit:visual + audit:parity ajoutes)**
- [x] **Lot WP9 — Surface Chat / Agent (100%)**
- [ ] **Lot WP10 — Theming via moteur design (82%)**
  - Reste: rollout Phase 2 hors pilotes ; gouvernance publication client (Airbus = JAMAIS public npmjs, prive).
- [x] **Lot WP11 — Dogfooding moteur publie (100%, routine)**
- [x] **Lot WP12 — Templates docs / slides ESN (100%)**
- [x] **Lot WP13 — Portage React (100% + parite icones + API Link unifiee cette session)**
- [x] **Lot WP14 — Chrome documentaire par theme (100%)**
- [x] **Lot WP15 — Integration dataviz BI (100%, ferme v0.4.19)**
- [ ] **Lot WP16 — QA pixel-perfect tri-framework (~8%, ACTIVE, BLOQUANTE pour la com)**
  - 2/8 bugs owner corriges+verifies (z-index/crop, onglets route-backed) ; 0/147 pages verifiees ; harnais audit:parity en construction. Detail 02/03-BRANCH.
- [ ] **Lot ANTIGRAVITY-FOOTER — Footer docs a reprendre (10%)**
  - Le footer reste "moche" (backlog) ; le reste du suivi header Antigravity (A-E,G,H,I) est ferme 100%.

## Livrables recents (session 2026-06-07/08) — FAIT et LIVE
- [x] **Lot LIV-DOCS-ONGLETS — Layout onglets tri-framework + retrait Apercu live (143 pages, LIVE)**
- [x] **Lot LIV-PARITE-ICONES — Parite icones lucide React/Vue sur 27 composants (P1+19), publie 0.31.0**
- [x] **Lot LIV-LINK-API — API Link unifiee variant+external+disabled 3 fw, publie svelte 0.34/react+vue 0.32**
- [ ] **Lot LIV-OAUTH-LOGIN — Login OAuth/OIDC PKCE sur docs (LIVE localhost ; PROD parquee sur test 2FA owner)**
- [x] **Lot LIV-CI-RATCHET — Design Quality Gate recalibre 100->95 (CI enfin verte)**
- [x] **Lot LIV-AUDIT-CLI — CLI audit visuel headless (design audit:visual) publiee skills 0.2.0**
- [ ] **Lot LIV-HARNAIS-PARITE — Harnais design audit:parity (pixel-diff cross-fw + assertions DOM) EN CONSTRUCTION**
- [x] **Lot LIV-TRACKER — Tracker /track installe (ce fichier + 02/03-BRANCH, .track/)**

## Coordination / externe
- [x] **Lot COORD-DATAVIZ — dataviz BI clos cote DS (v0.4.19, GG codex:dataviz)**
- [ ] **Lot COORD-OAUTH-IDP — IdP: clients enregistres, CORS ouvert ; PROD = attente test 2FA owner -> puis bascule client prod**
- [ ] **Lot COORD-CHATUI — sentropic-chat relance (DS-1..4 livres) ; silence cote chat depuis 06-02**
- [ ] **Lot COORD-DSQA — claude:ds-QA reveille ; brief+tracker a lui transmettre (resoudre son id h2a via discover)**

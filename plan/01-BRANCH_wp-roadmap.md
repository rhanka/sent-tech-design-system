# Feature: Roadmap Workpackages — Design System Sent Tech

## Objective
Roadmap TRACKABLE, numérotation CONTINUE WP1→WP17, statuts HONNETES. Aligné sur la source de vérité
`docs/workpackages.md` (synthèse WP1→WP17). 1 Lot = 1 WP. `[x]` = fermé ; `[ ]` = ouvert (% dans le titre).
Les livrables récents (onglets, parité, Link, OAuth, audit) sont RATTACHES à leur WP (plus de codes
LIV-/COORD-). NB: les "100%" historiques de WP1/WP2/WP6 sur la QUALITE visuelle sont démentis par la QA
owner (6/7 composants buggy) → portée par WP16. Détail bugs: `02-BRANCH` ; 147 pages: `03-BRANCH`.

## Scope / Guardrails
- Versions publiées: svelte 0.34.0 / react 0.32.0 / vue 0.32.0 / tokens+themes 0.11.0 / skills 0.2.0 / dataviz v0.4.19.
- Coordination rattachée: dataviz→WP15, OAuth/IdP→WP17, chat-ui→WP4/WP9, ds-QA→WP16.

## Plan / Todo (lot-based)
- [ ] **Lot WP1 — Primitives Svelte (DS Core) (95%)**
  - 12 primitives Lucide livrées. Re-QA: bugs QA (FileUploader hover/parité, Combobox tailles, CopyButton) → WP16.
- [ ] **Lot WP2 — Site docs : UX, layout, header/footer (90%)**
  - Fait: refonte layout onglets tri-framework route-backed (143 pages), "Aperçu live" retiré, header contractuel. Reste: bugs docs (onglets absents Exemples DatePicker), footer (10%), passe QA 147 pages (WP16).
- [x] **Lot WP3 — Contrat header cross-site (100%, fermé)**
- [x] **Lot WP4 — Primitives Chat-UI (100%)**
- [x] **Lot WP5 — Graphiques / Charts (100% feature ; parité 3 fw à re-vérifier en WP16)**
- [ ] **Lot WP6 — Fix-plan bugs visuels phase 1 (~50% ROUVERT)**
  - "100%" historique démenti par la QA (régression Calendar + 6/7 buggy). Fix-plan actif = WP16.
- [ ] **Lot WP7 — Audit DS large 37 réfs (80%)**
  - Reste: findings hors P0/P1/P2 ; validation externe couverture 100%.
- [x] **Lot WP8 — Moteur design + skill multi-harness (100%)**
  - Inclut les ajouts récents: CLI audit visuel headless (audit:visual, skills 0.2.0), harnais audit:parity (en construction), ratchet CI Design Quality Gate 100→95.
- [x] **Lot WP9 — Surface Chat / Agent (100%)**
- [ ] **Lot WP10 — Theming DSFR/Carbon/Airbus (82%)**
  - Reste: rollout Phase 2 hors pilotes ; gouvernance publication client (Airbus = JAMAIS public npmjs, privé).
- [x] **Lot WP11 — Dogfooding moteur publié (100%, routine)**
- [x] **Lot WP12 — Templates docs / slides ESN (100%)**
- [x] **Lot WP13 — Portage React (100%)**
  - Inclut récents: parité icônes lucide (27 composants, 0.31.0) + API Link unifiée variant+external+disabled (svelte 0.34/react+vue 0.32).
- [x] **Lot WP14 — Chrome documentaire par thème (100%)**
- [x] **Lot WP15 — Intégration dataviz BI (100%, fermé v0.4.19 ; GG codex:dataviz)**
- [ ] **Lot WP16 — QA pixel-perfect tri-framework (~8%, ACTIF, BLOQUANT pour la com)**
  - 2/8 bugs owner corrigés+vérifiés (z-index/crop, onglets route-backed). Harnais audit:parity en construction. Reste: 6 bugs owner + 147 pages × 3 fw (délégué à claude:ds-QA). Détail 02/03-BRANCH.
- [ ] **Lot WP17 — Plateforme feedback docs : login + chat + cerclage + soumission bug (25%)**
  - Fait: login OAuth/OIDC PKCE câblé (LIVE localhost), double-revue sécurité opus+codex. Reste: phases 2-4 (chat feedback, app cerclage diag, chatbot graphify, soumission bug agent-à-agent). Attente: test 2FA owner → bascule client prod IdP (claude:sentropic:cbf32fe0800b).

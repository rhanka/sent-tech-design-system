# Feature: Roadmap Workpackages — Design System Sent Tech

## Objective
Roadmap TRACKABLE, numérotation CONTINUE WP1→WP17, statuts HONNETES. Aligné sur la source de vérité
`docs/workpackages.md` (synthèse WP1→WP17). 1 Lot = 1 WP. `[x]` = fermé ; `[ ]` = ouvert (% dans le titre).
Les livrables récents (onglets, parité, Link, OAuth, audit) sont RATTACHES à leur WP (plus de codes
LIV-/COORD-). NB: les "100%" historiques de WP1/WP2/WP6 sur la QUALITE visuelle sont démentis par la QA
owner (6/7 composants buggy) → portée par WP16. Détail bugs: `02-BRANCH` ; 147 pages: `03-BRANCH`.

## Scope / Guardrails
- Versions publiées: svelte 0.34.3 / react 0.36.4 / vue 0.36.4 / tokens+themes 0.11.0 (tag) / theme-carbon+dsfr 0.2.2 / skills 0.3.2 / dataviz v0.4.19.
- Coordination rattachée: dataviz→WP15, OAuth/IdP→WP17, chat-ui→WP4/WP9, ds-QA→WP16.

## Plan / Todo (lot-based)
- [ ] **Lot WP1 — Primitives Svelte (DS Core) (98%)**
  - 12 primitives Lucide livrées. 2026-06-10: taille→police sm/md/lg (littéraux 13/14/16px), calendar hover lisible (3 fw), OrderedList/UnorderedList items imbriqués réglés (React/Vue acceptaient `label`, canon = `content`), search sobre. Reste: easing ease-out, dark mode (WP10).
- [ ] **Lot WP2 — Site docs : UX, layout, header/footer (96%)**
  - Fait: layout onglets tri-framework route-backed, "Aperçu live" retiré, header contractuel (bouton-icône login). 2026-06-10 (benchmark frontend-design): sidebar mobile en drawer, ramp typo `--docs-text-*`, homepage dégénérifiée, neutres→tokens, skip-link, chrome 100% DS (cartes→Card, onglets→ContentSwitcher). Reste: footer data-form, dark mode.
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
- [ ] **Lot WP16 — QA pixel-perfect tri-framework (~95%)**
  - 2026-06-10: parité **98/100** (était 71). Harnais audit:parity FIABILISÉ (fix capture svelte = attend le layout ; tolérance dimensionnelle = absorbe le jitter d'îles ; skills 0.3.2). Bugs owner réglés+vérifiés: z-index/crop, onglets route-backed, OrderedList/UnorderedList imbriqués, fuites i18n (data-table pager, code-snippet), calendar hover. Benchmark frontend-design livré (67/100, findings traités). Reste: ~5 résiduels (chat-thread/streaming-message = divergence API messages-vs-composition à arbitrer ; popover/menu-popover positionnement ; force-graph non-déterministe) + couche 3 "monkey".
- [ ] **Lot WP17 — Plateforme feedback docs : login + chat + cerclage + soumission bug (25%)**
  - Fait: login OAuth/OIDC PKCE câblé (LIVE localhost), double-revue sécurité opus+codex. Reste: phases 2-4 (chat feedback, app cerclage diag, chatbot graphify, soumission bug agent-à-agent). Attente: test 2FA owner → bascule client prod IdP (claude:sentropic:cbf32fe0800b).

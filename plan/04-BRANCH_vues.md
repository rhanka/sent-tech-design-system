# Feature: WP18 — Section « Vues » (écrans-type préfabriqués)

## Objective
Livrer une section docs `/views` = ~100 écrans-type préfabriqués composés UNIQUEMENT de
composants DS, rendus tri-framework via le pipeline `NodeSpec` existant. Architecture « les
deux » (owner) : **ViewSpec** (sur-couche NodeSpec, 6 gabarits de layout × données) +
**composants-écrans réutilisables** exportés (patrons + ~20 réutilisés). Détail/taxonomie :
`docs/views-taxonomy.md`. Source : deep-research opus 4.8 + codex 5.5 high (2026-06-10).
Statut dans les sous-bullets (PAS dans les titres de lot → import idempotent).

## Scope / Guardrails
- Réutiliser `apps/docs/src/lib/framework/` (examples.ts, SvelteNode, react-island, vue-island,
  nodeToCode) — pas de nouveau moteur de rendu. Parité stricte svelte=react=vue.
- viewtemplater (produit) = package séparé `@sentropic/viewtemplater`, consomme le DS, jamais
  l'inverse. Le MVP docs livre des ViewSpec à données mock d'abord ; le binding PowerBI/Qlik/
  tableau vient après.

## Plan / Todo (lot-based)
- [x] **Lot VUES-INFRA — ViewSpec + table de résolution composants**
  - Étendre NodeSpec en ViewSpec (layout/regions/data). Compléter la table de composants de
    examples.ts/nodeToCode.ts (~70 → tous les composables : FilterBar, KpiCard, Stepper, Drawer,
    SelectableList, Calendar, GaugeChart, BulletChart…) dans les 3 packages. Borné/mécanique.
- [x] **Lot VUES-LAYOUTS — 6 gabarits de layout**
  - `app-shell`, `list-report`, `object-page`, `kanban`, `master-detail`, `dashboard`, `wizard`
    (fonctions data→NodeSpec). C'est ce qui rend les 50+ écrans dérivés quasi gratuits.
  - FAIT (2026-06-19): `apps/docs/src/lib/viewLayouts.ts` — 7 fonctions typées (configs
    pré-localisées → NodeSpec[]). CSS partagé `.vl-*` dans app.css. 0 erreur svelte-check.
    ComponentName étendu (DataGrid, PieChart, Progress). Commit 395d6307.
- [x] **Lot VUES-SECTION — section docs /views + nav**
  - Routes `/views` (index grille) + `/views/<slug>`, entrée nav « Vues » à côté de « Composants »,
    rendu tri-framework + code par fw + composants liés + variantes (loading/empty/error/dense) +
    rendu sous thème (Airbus/Carbon/DSFR).
- [x] **Lot VUES-MVP — 14 écrans prioritaires**
  - App shell, List Report, Object Page, Kanban, Data Explorer, Dashboard exécutif, Master-detail,
    Wizard, Import/mapping, Login, Settings, Facture Odoo, Pipeline CRM, File de tickets.
- [x] **Lot VUES-COMPONENTS — composants-écrans réutilisables exportés**
  - Patrons exportés (ListReportPage, ObjectPage, KanbanBoard, MasterDetail, Wizard, AppShell,
    Dashboard) + ~12 autres réutilisés. 3 fw, parité.
  - FAIT (2026-06-19): 6 composants Svelte (~1097 lignes) + React catalog (+527 lignes) + 6 Vue .ts
    (+628 lignes). tsc 0 erreur, svelte-check 0 erreur. Exportés depuis les 3 index packages.
- [x] **Lot VUES-IMPORT — viewtemplater + cartes Sentropic**
  - Importer la structure ViewTemplateCatalog/Renderer + ViewSpec depuis ~/src/sentropic, et les
    cartes (ConfigItemCard/FieldCard/ScoreCard) comme composants/exemples.
  - Fait : cartes ConfigItemCard/FieldCard/ScoreCard ✓ + AppChrome (chrome de site réutilisable
    dataviz : header marque/nav + contrôles thème/color-mode/langue/github/identité) ✓ — publiés
    svelte 0.34.21 / react+vue 0.36.21, réponse h2a à claude:dataviz. Reste : ViewTemplateCatalog/
    Renderer (composant connecté → réenvelopper présentationnel) + ViewSpec.
- [x] **Lot VUES-CATALOG — backlog 100 écrans (8 domaines)**
  - App-shell(18) · Analytics/BI(18) · CRM(13) · ERP/Stock(12) · Compta(11) · RH(9) ·
    Projet/Helpdesk(9) · Manufacturing(7) · transverses(3). Déclinaison par swap de données sur
    les 6 gabarits une fois le MVP livré.

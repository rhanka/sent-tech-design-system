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
- [ ] **Lot VUES-INFRA — ViewSpec + table de résolution composants**
  - Étendre NodeSpec en ViewSpec (layout/regions/data). Compléter la table de composants de
    examples.ts/nodeToCode.ts (~70 → tous les composables : FilterBar, KpiCard, Stepper, Drawer,
    SelectableList, Calendar, GaugeChart, BulletChart…) dans les 3 packages. Borné/mécanique.
- [ ] **Lot VUES-LAYOUTS — 6 gabarits de layout**
  - `app-shell`, `list-report`, `object-page`, `kanban`, `master-detail`, `dashboard`, `wizard`
    (fonctions data→NodeSpec). C'est ce qui rend les 50+ écrans dérivés quasi gratuits.
- [ ] **Lot VUES-SECTION — section docs /views + nav**
  - Routes `/views` (index grille) + `/views/<slug>`, entrée nav « Vues » à côté de « Composants »,
    rendu tri-framework + code par fw + composants liés + variantes (loading/empty/error/dense) +
    rendu sous thème (Airbus/Carbon/DSFR).
- [ ] **Lot VUES-MVP — 14 écrans prioritaires**
  - App shell, List Report, Object Page, Kanban, Data Explorer, Dashboard exécutif, Master-detail,
    Wizard, Import/mapping, Login, Settings, Facture Odoo, Pipeline CRM, File de tickets.
- [ ] **Lot VUES-COMPONENTS — composants-écrans réutilisables exportés**
  - Patrons exportés (ListReportPage, ObjectPage, KanbanBoard, MasterDetail, Wizard, AppShell,
    Dashboard) + ~12 autres réutilisés. 3 fw, parité.
- [ ] **Lot VUES-IMPORT — viewtemplater + cartes Sentropic**
  - Importer la structure ViewTemplateCatalog/Renderer + ViewSpec depuis ~/src/sentropic, et les
    cartes (ConfigItemCard/FieldCard/ScoreCard) comme composants/exemples.
- [ ] **Lot VUES-CATALOG — backlog 100 écrans (8 domaines)**
  - App-shell(18) · Analytics/BI(18) · CRM(13) · ERP/Stock(12) · Compta(11) · RH(9) ·
    Projet/Helpdesk(9) · Manufacturing(7) · transverses(3). Déclinaison par swap de données sur
    les 6 gabarits une fois le MVP livré.

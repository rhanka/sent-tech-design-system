# Section « Vues » — Taxonomie ~100 écrans-type (synthèse opus 4.8 + codex 5.5 high)

Écrans-type préfabriqués composés **uniquement** de composants DS, rendus en
Svelte/React/Vue via le pipeline `NodeSpec` existant. Objectif owner : **~100
écrans-type pour accélérer le dev d'apps métier** (incl. Odoo/OpenERP + BI).

## Architecture — « les deux » (décision owner)

1. **ViewSpec** = sur-couche déclarative au-dessus de `NodeSpec` (réutilise
   `apps/docs/src/lib/framework/` : `examples.ts`, `SvelteNode.svelte`,
   `react-island.ts`, `vue-island.ts`, `nodeToCode.ts`). **Une définition → 3
   rendus + 3 snippets**, zéro nouvelle dette de portage.
   ```
   ViewSpec = {
     id, name, domain, reference,
     layout: 'app-shell'|'list-report'|'object-page'|'kanban'
           |'master-detail'|'dashboard'|'wizard'|'blank',
     data: { rows, kpis, stages, ... },     // fixtures neutres
     regions: { header?, aside?, main: NodeSpec, drawer?, footer? }
   }
   ```
   **6 gabarits de layout** (fonctions `data → NodeSpec`) → les 100 écrans se
   ramènent à **6 layouts × données**. Le 7e écran d'un type coûte ≈ une fixture.

2. **Composants-écrans réutilisables exportés** (max, par-dessus le ViewSpec) :
   les 5 **patrons** (`ListReportPage`, `ObjectPage`, `KanbanBoard`,
   `MasterDetail`, `Wizard`) + `AppShell` + `Dashboard` + ~12 autres très
   réutilisés. Livrer les patrons d'abord rend les 50+ écrans dérivés quasi
   gratuits (swap de colonnes/champs/données).

**Infra bornée (seul vrai travail)** : compléter la table de résolution de
composants de `examples.ts`/`nodeToCode.ts` (~70 → tous les composables :
FilterBar, KpiCard, Stepper, Drawer, SelectableList, Calendar, GaugeChart,
BulletChart…) dans les 3 packages. Mécanique, pas combinatoire.

Prior art repo : `docs/bi-study/` (étude BI existante) — à brancher.

## MVP — 14 prioritaires (réutilisabilité × valeur)

1. **App shell** (#1) — socle de toutes les vues.
2. **List Report générique** (#12) — patron de >20 écrans (listes Odoo).
3. **Object Page générique** (#11) — patron de toutes les fiches.
4. **Kanban générique** (#37/#82) — signature Odoo.
5. **Data Explorer / pivot** (#22) — vitrine BI (valorise les 36 charts).
6. **Dashboard exécutif** (#19) — KpiCard + charts, vendeur.
7. **Master-detail** (#13) — patron Fiori split.
8. **Wizard multi-étapes** (#8/#98).
9. **Import / mapping de données** (#14) — sujet BI direct.
10. **Login / auth** (#2).
11. **Settings master-detail** (#6).
12. **Facture Odoo** (#63) — écran ERP phare.
13. **Pipeline CRM** (#37) — écran CRM phare.
14. **File de tickets** (#84) — Helpdesk phare.

## Catalogue ~100 écrans (8 domaines)

### 1 — App Shell générique (18)
app-shell · login · sign-up · reset password · 2FA/OTP · settings master-detail ·
admin système · onboarding/wizard · empty/first-run · profil · détail entité
(Object Page) · liste (List Report) · master-detail · import/mapping · confirmation/succès ·
erreurs 403/404/500 · centre de notifications · recherche globale.

### 2 — Analytics / BI (18)
dashboard exécutif · dashboard opérationnel · dashboard temps réel · data explorer/pivot ·
mapping de données/data prep · report builder output · drill-down hiérarchie · chart gallery ·
cohort/rétention heatmap · funnel/conversion · geo/cartographie · Sankey/attribution ·
distribution/stats (histogram/boxplot/violin) · comparaison périodes (YoY) ·
composition (treemap/sunburst) · multivarié (radar/parallèle) · réseau/graphe · catalogue datasets.

### 3 — CRM / Ventes (Odoo Sales/CRM) (13)
pipeline kanban · fiche opportunité · liste opportunités · devis · commande de vente ·
catalogue produits · fiche client · annuaire contacts · activités/agenda · dashboard ventes ·
prévisions/forecast · lead capture · configurateur produit (CPQ).

### 4 — ERP Achats / Stock (Odoo Inventory/Purchase) (12)
liste articles · fiche produit · mouvements de stock · réception · inventaire physique ·
demande d'achat · bon de commande achat · dashboard inventaire · niveaux de stock/réappro ·
fiche fournisseur · traçabilité lots&séries · transferts inter-dépôts.

### 5 — Compta / Finance (Odoo Accounting) (11)
liste factures · facture (lignes+totaux+TVA) · écritures/journal · rapprochement bancaire ·
balance générale · dashboard financier · cash-flow/waterfall · échéancier/aging ·
paiement/encaissement · plan comptable · note de frais.

### 6 — RH (Odoo HR) (9)
annuaire employés · fiche employé · demande de congé · calendrier congés équipe ·
pipeline recrutement · fiche candidat · bulletin de paie · dashboard RH · organigramme.

### 7 — Projet / Helpdesk (Odoo Project/Helpdesk) (9)
kanban tâches · fiche tâche · file de tickets · fiche ticket · timesheet · planning/Gantt ·
dashboard projet · SLA/support · base de connaissances.

### 8 — Manufacturing (Odoo MRP) (7)
ordres de fabrication (liste) · fiche OF · nomenclature (BoM) · planning production ·
ordres de travail · dashboard production (OEE) · contrôle qualité.

### Transverses (3)
formulaire multi-étapes générique · vue calendrier générique · activity/timeline générique.

**Total : 100.** Tous composables avec l'inventaire DS actuel — aucun composant manquant.

## Références
Odoo (vues list/form/kanban/pivot/graph/calendar/gantt/activity), SAP Fiori Elements
(List Report / Object Page / Analytical List Page / Wizard floorplans), Salesforce Lightning,
BI tools (Tableau/PowerBI/Qlik/Metabase/Superset), Carbon (DataTable/EmptyState/list-detail).

> Source : double deep-research opus 4.8 + codex 5.5 high (2026-06-10).

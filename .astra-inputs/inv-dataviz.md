# Inventaire M0 — rhanka/dataviz → rapatriement Sentropic DS (READ-ONLY)

> Audit d'inventaire read-only. Aucun fichier des repos modifié. Généré 2026-09-15.
> Convention d'incertitude : `unverified` (indice présent, à revalider), `source-gap` (aucune source dans le repo), `N-A`.

## 0. Identité du dépôt

- Repo : `/home/antoinefa/src/dataviz`
- Remote logique : `git+https://github.com/rhanka/dataviz.git` (repository de tous les package.json)
- Branche : `main`
- HEAD SHA : `0869ae5b59bb308be7d43fbe0de58c5487e11f25`
- `git describe` : `v0.4.52-3-g0869ae5` (HEAD = dernier tag `v0.4.52` **+ 3 commits non taggués/non publiés** → drift de release, voir §9)
- Status : working tree propre sauf `?? .graphify/` (untracked, hors périmètre).
- 3 derniers commits pertinents non taggués :
  - `0869ae5` feat(dataviz): timeline brush + DashboardFilterBar Monitor contract (React/Vue/Svelte)
  - `a3f464b` feat: add editable dashboard grid
  - (+ `356803a` fix site sombre)
- Monorepo npm workspaces : `packages/*` + `apps/*`. Node ≥ 20 (CI Node 22). `type: module` partout.
- Root `package.json` = `@sentropic/dataviz-root` (private, v0.0.0). Scripts agrégateurs : `build`/`check`/`test`/`lint` (`--workspaces --if-present`) + `verify` = build && check && test. devDeps root : `typescript ^5.9.3`, `vitest ^4.1.5`.

## 1. Vue d'ensemble packages (5)

| Package | Version | private | Publication | Rôle | Framework | Maturité |
|---|---|---|---|---|---|---|
| `@sentropic/dataviz-core` | 0.4.52 | non | npm public (OIDC) — **publié presumé** (`unverified` : `npm view` core a timeouté au retry ; les 3 adaptateurs publiés en dépendent `@0.4.52` → présumé live) | Moteur TS pur agnostique : état inter-vues + builders de données | aucun (TS pur, 0 dep runtime) | Haute |
| `@sentropic/dataviz-svelte` | 0.4.52 | non | **npm public confirmé 0.4.52** (`npm view`) | Adapter Svelte 5 + ~127 composants dashboard | Svelte 5 | Haute |
| `@sentropic/dataviz-react` | 0.4.52 | non | **npm public confirmé 0.4.52** | Adapter React 19 + ~124 composants | React 19 | Haute |
| `@sentropic/dataviz-vue` | 0.4.52 | non | **npm public confirmé 0.4.52** | Adapter Vue 3 + ~123 composants | Vue 3 | Haute |
| `@sentropic/dataviz-angular` | 0.4.52 | **`private: true`** | **PAS sur npm** (privé + dep DS = tarball local) | Adapter Angular signals + 2 composants seulement | Angular 20-22 | **Partielle (POC)** |

Licence : MIT sur les 5 packages (+ fichier `LICENSE` embarqué dans `files`). README racine note « MIT (à confirmer) » → licence MIT effective, mention `unverified` côté README seulement.

## 2. Détail par package

### 2.1 `@sentropic/dataviz-core`
- exports (package.json) : `.` → `{ types: ./dist/index.d.ts, import: ./dist/index.js }` ; `main`+`types` legacy pointant dist ; `sideEffects:false` (tree-shaking préservé).
- `files`: `["dist","LICENSE"]`. `publishConfig.access:public`.
- scripts : build=`tsc -p tsconfig.json` ; check=`tsc --noEmit` ; test=`vitest run src`.
- deps runtime : **AUCUNE** (confirmé par grep : seul import non-relatif = `vitest` dans les tests). ZÉRO framework, ZÉRO DS, ZÉRO tiers → SSR-safe, pur.
- Source : 69 modules `.ts` non-test + **68 fichiers `.test.ts`** (quasi 1:1). Aucun benchmark, aucun dossier fixtures (`source-gap` benchmarks).
- Contrat d'export : `packages/dataviz-core/src/index.ts` (barrel unique, ~640 lignes, familles commentées) — voir §3.

### 2.2 `@sentropic/dataviz-svelte`
- exports : `.` → `{ svelte, types, import }` = `./dist/index.js` ; champ `svelte` top-level ; `sideEffects:["**/*.css"]`.
- scripts : build=`svelte-package --input src && rm dist/*.test.*` ; check=`svelte-check` ; test=`vitest run src`.
- deps runtime : `@sentropic/dataviz-core@0.4.52`, `@sentropic/design-system-svelte@0.34.62`, `@sentropic/design-system-themes@0.11.0`, `jspdf ^4.2.1`, `svg2pdf.js ^2.7.0`. peer : `svelte ^5`.
- Source : 131 fichiers (`.svelte` + helpers `.ts`) non-test, **37 tests**. Barrel `src/index.ts` exporte l'adapter + ~120 composants (voir §5).

### 2.3 `@sentropic/dataviz-react`
- exports : `.` → `{ types, import }`. `sideEffects:false`. scripts tsc + vitest.
- deps : core@0.4.52, `@sentropic/design-system-react@0.36.49`, themes@0.11.0, jspdf, svg2pdf.js. peer `react ^19`.
- Source : 128 non-test, **38 tests**.

### 2.4 `@sentropic/dataviz-vue`
- exports : `.` → `{ types, import }`. `sideEffects:false`. scripts tsc + vitest.
- deps : core@0.4.52, `@sentropic/design-system-vue@0.36.49`, themes@0.11.0, jspdf, svg2pdf.js. peer `vue ^3`.
- Source : 127 non-test, **37 tests**. Composants en `.ts` (render functions, pas de SFC `.vue`).

### 2.5 `@sentropic/dataviz-angular` ⚠ (le point d'attention du M0)
- **`private: true`** → jamais publié npm. exports `.` → `{ types, import }`. `files`:`["dist","LICENSE","README.md"]`.
- **Dépendance DS = tarball local** :
  `"@sentropic/design-system-angular": "file:../../vendor/sentropic-design-system-angular-0.36.51.tgz"`
  → lien de fichier relatif vers `vendor/`. À résoudre lors du rapatriement : la lib DS Angular **n'est pas publiée npm** ; le repo embarque 2 tarballs (`…-0.36.47.tgz` **et** `…-0.36.51.tgz` — le package.json pointe le 0.36.51, le README parle encore du 0.36.47 → incohérence doc `unverified`).
- deps : core@0.4.52, DS-angular (tarball), themes@0.11.0. peer `@angular/core ^20 || ^21 || ^22`. devDeps Angular 21.2.17 + ngc.
- scripts : build=`ngc -p tsconfig.lib.json` (précédé d'un build core) ; test=`vitest`.
- **Couverture limitée (POC/seam)** : source = seulement `adapter.ts` (bridge signals), `index.ts`, `lib/classNames.ts`, `lib/QueryBar.ts`, `lib/DateHistogramChart.ts` → **2 composants** exportés + le store bridge. **5 tests** (dont `angular-dom-smoke.test.ts`). README explicite : « Current scope is intentionally narrow » (bridge + QueryBar + DateHistogramChart). Chemin de sortie documenté : publier DS-angular npm → retirer `private:true` → remplacer `file:` par version publiée → ajouter au workflow publish.

## 3. Inventaire des exports `dataviz-core` (par famille) + destination DS

Granularité = famille de module (mappe 1:1 les groupes du barrel). Consommateurs = les 4 adaptateurs (grep : 489 imports `@sentropic/dataviz-core` depuis les adaptateurs). Deps/licence = aucune (core = 0 dep, MIT). Maturité Haute + tests présents sauf mention. **Destination DS** proposée parmi : dataviz / processing / scène / moteurs / adaptateurs-DS / apps. Décision : rapatrier / adapter / laisser.

### 3a. Cœur d'état inter-vues (LE différenciateur — « ce que le DS n'a pas le droit de porter »)

| Famille / exports | Responsabilité | Dest. DS | Décision |
|---|---|---|---|
| `store.ts` — `createDashboardStore`, `DashboardStore/State`, `FilterSpec/State`, `SelectionState`, `DrillState`, `specToPredicate`, `applyFilters`, `isFilterSpec` | Store observable immutable : filtres + sélection + drill ; snapshot `getState`/`subscribe` | **moteurs** | **rapatrier** (contrat gelé, tests) |
| `crossfilter.ts` — `applyCrossfilter`, `sourcesFor`, `rangeSelectionKey`, `CrossfilterGraph/View`, `CrossfilterSelectionMode` | Graphe brushing-and-linking / scoping déclaratif entre vues | **moteurs** | **rapatrier** |
| `serialize.ts` — `serialize/deserializeFilters`, `…Drill`, `…State` | Round-trip bookmark/URL de l'état | **moteurs** | **rapatrier** |
| `actions.ts` — `DashboardBookmark`, `DashboardAction`, `resolveDashboardBookmarkState`, `applyDashboardBookmark`, `runDashboardAction` | Bookmarks + actions (filtre/URL/set/go-to) | **moteurs** | **rapatrier** |
| `hover.ts` — `createHoverChannel`, `hoverKeyOf`, `HoverChannel` | Canal crosshair inter-panneaux éphémère (non sérialisé) | **moteurs** | **rapatrier** |
| `model.ts` — `DataModel`, `Dimension`, `Measure`, `Cell/Row`, guards, `validateModel`, `findDimension/Measure` | Modèle dimension/mesure, discret/continu, hiérarchies | **moteurs** | **rapatrier** |
| `fields.ts` — `buildFieldPaneTree`, `listFields`, `fieldToPill`, `fieldId/parseFieldId`, types FieldPane | Field pane : arbre de champs, pilules | **moteurs** (+ consommé scène) | **rapatrier** |
| `query.ts` — `buildQueryFilterSpec`, `QueryFilterConfig` ; `describe.ts` — `describeFilterSpec` | Traduction requête→FilterSpec, description lisible | **moteurs** | **rapatrier** |

### 3b. Processing (agrégation / calcul / transforms tabulaires)

| Famille / exports | Responsabilité | Dest. DS | Décision |
|---|---|---|---|
| `aggregate.ts` — `groupBy`, `aggregate`, `aggregateValues`, `extractNumbers`, `groupAggregate` | Moteur agrégation (sum/avg/min/max/count, NaN-safe) | **processing** | **rapatrier** |
| `pivot.ts` — `buildPivotTable` ; `pivotAdvanced.ts` — `buildAdvancedPivotTable` | Pivot / cross-tab, sous-totaux, heat cellule, sparkline | **processing** | **rapatrier** |
| `calculations.ts` — `evaluateCalculationExpression`, `applyCalculatedFields`, `extendModelWithCalculatedFields`, `suggest…`, `applyCalculationBins/Groups/Set`, `calculateTableValues` | Champs calculés, parser expression sûr, table-calcs, bins/groupes/sets | **processing** | **rapatrier** |
| `kpi.ts` — `buildKpiCards` | KPI/delta/goal/sparkline | **processing** | **rapatrier** |
| `conditional-format.ts` — `evaluateConditionalFormat`, `applyConditionalFormat`, `rule`, `rankRule`, guards | Moteur de formatage conditionnel sérialisable (présentation-free) | **processing** | **rapatrier** |

### 3c. Présentation-agnostique : couleur / format / valeur (candidats partagés DS)

| Famille / exports | Responsabilité | Dest. DS | Décision |
|---|---|---|---|
| `color.ts` — `buildSequentialScale`, `buildDivergingScale`, `buildCategoricalScale`, `colorAt`, `makeColorScale`, `sampleScale`, `mix`, `parseHex/toHex`, `RGB` | Échelles couleur OKLab (cat/seq/div), zéro couleur hardcodée | **dataviz** (⚠ chevauche tokens DS) | **adapter** (unifier avec palette DS — dé-doublonner) |
| `format.ts` — `createFormatPanelState`, `updateAxis/Legend/MarkerFormat`, types Format* | État panneau format/axes immutable | **processing** | **rapatrier** |
| `format-value.ts` — `formatValue`, `makeFormatter`, `FORMAT_VALUE_FALLBACK` | Formatage Intl (number/currency/percent/compact/date) | **processing** (⚠ candidat util DS partagé) | **adapter** (évaluer fusion avec i18n DS) |
| `categorical.ts` — `buildCategoricalSeries`, `buildParetoModel`, `buildDivergingBarModel` | Séries catégorielles/combo/pareto/divergentes | **processing** | **rapatrier** |

### 3d. Scène dashboard (layout / objets / annotations)

| Famille / exports | Responsabilité | Dest. DS | Décision |
|---|---|---|---|
| `layout.ts` — `createLayout`, `addPanel/removePanel/movePanel/resizePanel`, `normalizeLayout`, `serialize/deserializeLayout`, `createLayoutState`, `DashboardLayout/PanelLayout/LayoutState`, guards | Grille de panneaux sérialisable (présentation-free) — sous-tend le dashboard edit-mode | **scène** | **rapatrier** |
| `objects.ts` — `buildObjectLayerTree`, `resolveWebFrame`, `resolveDataImage`, panel-state helpers, types Object/WebFrame/DataImage | Calques dashboard : iframe/image data-driven/object-layer panel | **scène** | **rapatrier** |
| `annotations.ts` — `pointAnnotation/label/line/region/shape`, `annotation`, `serialize/deserializeAnnotations`, `isChartAnnotation` | Annotations de chart sérialisables | **scène** | **rapatrier** |

### 3e. Builders de modèles de charts (data → modèle géométrique, présentation-free) — couche `dataviz`/`processing`, **rapatrier** en bloc

~50 builders `buildXxx…` (chacun avec tests + types). Groupes :
- **Séries temporelles / catégoriel** : `timeseries` (buildTimeSeriesModel), `range` (Area/Column range), `streamgraph`, `bump`, `ribbon`, `stateTimeline`, `statusHistory`, `eventFeed`.
- **Part-of-whole / flux / hiérarchie** : `partOfWhole` (PartWhole/Waterfall/Flow/Radar/Rose/Mekko/PackedBubble), `hierarchy` (Org/Treegraph), `variablePie`, `itemChart`, `columnPyramid`, `arcDiagram`, `forceGraph`, `dependencyWheel`, `venn`, `wordCloud`, `polygon`.
- **Distribution / statistique** : `distribution` (Histogram/BoxPlot/Heatmap/Bullet/Gauge), `dateHistogram`, `violin`, `bellCurve`, `correlation`, `scatter`, `scatterMatrix`, `density2d`, `parallelCoordinates`, `animatedBubble`.
- **Financier / observabilité** : `candlestick`, `ohlc`, `hlc`, `renko`, `pointAndFigure`, `gantt`, `timeline`, `tilemap`, `anomalySwimLane`, `flamegraph`, `traceWaterfall`, `decompositionTree`.
- **Analytique overlays** : `analytics` (ReferenceLine/PercentileBand/TrendLine/Forecast/ErrorBars/AnalyticsCluster).
- **Géo** : `geo` (buildGeoPoint/Choropleth/GeoFlow/GeoHexbin/GeoCluster/GeoDensity/GeoJsonLayer + `classify`), `vectorField`, `contour`, `windBarb`.

Consommateurs : adaptateurs (chaque `XxxChart` wrappe le builder). Dest. DS : **dataviz** (les builders) — **rapatrier**. NB : les composants de rendu correspondants relèvent du DS/adaptateurs (§5).

- **Type de contrat UI partagé** : `TimeRange = {from,to,relativeLabel?}` exporté par le core (contrat consommé par les 3 adaptateurs).

## 4. Adaptateurs — modèle d'état partagé (state management)

L'état vit **exclusivement dans `dataviz-core`** (store observable immutable). Chaque adaptateur ne fait QUE ponter ce store sur la réactivité native, puis **ré-exporte toute la surface core** (`export * from '@sentropic/dataviz-core'`) pour un import unique :
- **Svelte** (`adapter.ts`) : `toSvelteStore` (contrat `Readable`), `createDashboard`, `useDashboard`. Runes/subscribe.
- **React** : `useSyncExternalStore` (cf ARCHITECTURE ; `adapter.ts` présent).
- **Vue** : `shallowRef` + `provide/inject` (cf ARCHITECTURE).
- **Angular** (`adapter.ts`) : `toSignalStore` (signal + subscribe→set), `createDashboard`, `provideDashboard`/`injectDashboard` (InjectionToken `DASHBOARD_STORE`), `AngularSignalStore` avec `replace`/`destroy`.
Chaque adaptateur prouve la résolution DS en ré-exportant un type réel du DS (`BarChartTone`) + `TenantTheme` des themes. Modèle = **cœur agnostique unique + adaptateurs minces** (patron tokens→3fw du DS), pas de store dupliqué ×N.

## 5. Adaptateurs — inventaire composants (couche `adaptateurs-DS`)

Barrel `dataviz-svelte/src/index.ts` (parité React/Vue). Familles de composants exportés (⇒ **rapatrier/adapter** vers couche **adaptateurs-DS**, décision par famille) :
- **État inter-vues câblé** : `DashboardFilterBar` (+ `ActiveFilter`/`FilterControl`/`ExportConfig`), `DashboardActiveFilters`, `DashboardGrid` (props `editable`/`onLayoutChange`/`tiles`/`columns` — edit-mode livré, cf §9), `SelectionLegend`, `CrossfilteredBarChart`, `SmallMultiples`, `DrillBarChart`/`DrillBreadcrumb`/`DrillChart` (+ `drill.ts`: `drillLevel/onDrillSelect/drillDepth`).
- **Authoring / filtres** : `QueryBar`, `FieldPane`, `TopNFilter`, `ValueSlicer`, `DateRangeFilter` (`dateRangeToSpec`), `RelativeDateFilter` (`relativeRangeToSpec`, `DEFAULT_RELATIVE_PRESETS`), `RangeSliderFilter` (`numericDomain`, `rangeBoundsToSpec`), `CalculationEditor`, `FormatPanel`, `PalettePicker`.
- **Bookmarks / export / sync** : `BookmarkNavigator`, `ExportMenu` (`rowsToCsv`), `ChartExport` (+ `chart-export.ts` : `serializeSvg`, `svgStringToPngBlob`, `downloadSvg/Png/Blob`, `printElement` ; **PDF via jspdf+svg2pdf.js lazy**), `UrlSync` (+ `url-sync.ts`: `stateToQuery`/`queryToState`/`applyStateToStore`/`read|writeStateToUrl`, `useUrlSync`).
- **Objets / calques** : `WebFrame`, `DataImage`, `ObjectLayerPanel`.
- **Tables / KPI** : `PivotDataTable`, `AdvancedPivotDataTable`, `KpiCardGroup`, `ScoreCard`, `RecordsTable`.
- **Charts** (~90) : catégoriel/combo/flux/part-of-whole/distribution/analytique/financier/observabilité/géo (7 Geo*Map)/hiérarchie/Sparkline/etc. — chacun wrappe un composant DS ; fallback SVG documenté pour les types non exposés par le DS (WP15 a supprimé les fallbacks analytics+geo).

## 6. Bibliothèque vs démo vs produit (apps/)

Toutes les apps sont `private:true`, `version 0.0.0`/`0.1.0` (jamais publiées) → **applications, pas des libs**. Destination : **apps**, décision **laisser** (ou porter comme vitrines DS).
- `apps/docs` (`@sentropic/dataviz-docs`) : **démo** dashboard cross-filter Svelte. dep `dataviz-svelte:*` + DS-svelte 0.34.64.
- `apps/docs-react`, `apps/docs-vue` : mêmes démos React/Vue (parité 3 fw).
- `apps/site` (`@sentropic/dataviz-site`, v0.1.0) : **site docs + galerie** (SvelteKit-like). Structure = `lib/registry/{charts,dashboards,grids,entries}` + `lib/islands` (îlots cross-fw React/Vue/Svelte) + `lib/data` (ex. `market-matrix.ts`) + `routes/{charts,dashboards,grids,guides}/[slug]`. Consomme les 4 packages dataviz + 6 thèmes DS. → **logique produit = registry/galerie de doc**, réutilisable comme référence mais spécifique au site.
- CI : `.github/workflows/pages.yml` (build 3 démos + site → GitHub Pages, live `https://rhanka.github.io/dataviz/`, custom domain `dataviz.sent-tech.ca`).

## 7. Vendor / lockfiles / contrats d'export / distribution

- `vendor/` (4 tarballs, à rapatrier ou re-sourcer) :
  - `sentropic-design-system-angular-0.36.47.tgz` **et** `…-0.36.51.tgz` (dataviz-angular pointe le .51 ; README parle du .47 → doc `unverified`).
  - `sentropic-design-system-theme-canada-0.1.0.tgz`, `…-theme-quebec-0.1.0.tgz` (consommés par `apps/site` via `file:`).
  - ⇒ ces DS/thèmes **non publiés npm** sont un couplage local à résoudre au rapatriement.
- Lockfile : un seul `package-lock.json` racine (~169 Ko), monorepo workspaces.
- Contrats d'export : barrels `index.ts` par package (voir §3/§5). `sideEffects` correct (core/react/vue `false`, svelte `**/*.css`).
- Publication : `.github/workflows/npm-publish.yml` = **npm Trusted Publishing (OIDC, aucun token)**, déclenché sur tag `v*`, avec `verify` + `release-guard` (le tag doit être mergé dans la branche par défaut). Convention = **release lockstep OIDC des 4 packages** (angular exclu car privé).

## 8. Tests / fixtures / benchmarks / doc

- Tests : core **68**, svelte **37**, react **38**, vue **37**, angular **5**. Co-localisés (`*.test.*` à côté de la source). Gate : `vitest run --no-cache --no-file-parallelism` (exigence ARCHITECTURE/ROADMAP). Core visé « 100 % testé ».
- Fixtures dédiées / benchmarks : **aucun dossier** trouvé (`source-gap`). Données de démo dans `apps/site/src/lib/data` et helpers `*Data.ts` par adaptateur.
- Doc dans le repo :
  - `README.md`, `ARCHITECTURE.md` (décision fondatrice DS émet l'intention / dataviz détient l'état), `ROADMAP.md`, `BACKLOG.md`.
  - `docs/audit/dataviz-core-review.md` (revue adversariale Opus 4.8, 2026-06-06 : 3 findings Critiques sur invariants core — gel profond des rows, round-trip range non-finies, divergence contrat — **marqués corrigés avant v0.4.3**).
  - `docs/audit/wp15-ds-handoff.md` (WP15 clos : analytics+geo consomment surfaces DS, fallbacks SVG retirés).
  - `docs/audit/wp20-handover-2026-06-16.md` (voir §9).
  - `docs/chart-ux-qa.md`, `docs/color-scales.md`, `docs/superpowers/plans/*`.
  - `.track/` = ledger local **untracked**, stale (62 events, stop 2026-06-12) — **ne pas traiter comme backlog réel** (dixit handover).

## 9. Réconciliation historique — WP20 (l'écart à revalider)

**Écart signalé** : un ancien handover décrit WP20 dataviz **BLOQUÉ** ; le plan DS le déclare **terminé**. Indices trouvés dans le repo :

- `docs/audit/wp20-handover-2026-06-16.md` (état « Codex takeover ») : solo dataviz épuisé ; **3 items WP20 DS-bloqués** formellement tracés côté DS :
  1. `DashboardGrid` edit-mode (columns + tiles{id,x,y,w,h} + editable + onLayoutChange) → mappe `dataviz-core/layout.ts`.
  2. Heatmap échelle séquentielle (API convenue `scale?: 'categorical'|'sequential'`).
  3. Tooltip nearest-X / crosshair / hide-on-leave (spec `docs/chart-ux-qa.md`).
  DS au dernier check : svelte 0.34.49, react/vue 0.36.45 (NavSystem vague 2).
- `BACKLOG.md` §WP20 : Catégories A/B/C **soldées** ; PDF (v0.4.45), échelles couleur (v0.4.46/47), PalettePicker (v0.4.48), layout core **déjà présent** ; les **3 mêmes items restent 🟡 DS-bloqués** (ACK DS 2026-06-16 02:20).

**État réel sur main (HEAD 0869ae5, revérifié par grep/source) :**
1. **DashboardGrid edit-mode = LIVRÉ** : commit `a3f464b feat: add editable dashboard grid` + `0869ae5` (DashboardFilterBar « Monitor contract » + timeline brush) ; `DashboardGrid.svelte` expose bien `editable`/`onLayoutChange`/`tiles` (+ tests DashboardGrid). ⇒ le point #1 du handover **n'est plus bloqué**.
2. **Heatmap séquentiel = NON évident** : `HeatmapChartProps` (svelte) = `{store,viewId,x,y,measure,legend,label,width,height,class}` → **aucun prop `scale`/`sequential`**. Le core (`colorAt`/`makeColorScale`/`buildSequentialScale`) est prêt mais le prop DS convenu n'apparaît pas côté composant. ⇒ **`unverified` / vraisemblablement encore DS-bloqué**.
3. **Tooltip nearest-X = PARTIEL** : le core fournit le canal crosshair (`hover.ts` : `createHoverChannel`/`hoverKeyOf`) et un « timeline brush » a été ajouté (`0869ae5`), mais **aucun prop `tooltipMode:'nearest-x'`/`crosshair`/`hideTooltipOnLeave`** trouvé sur les composants. ⇒ **`unverified`**.

**Conclusion réconciliation (à revalider)** : l'affirmation « WP20 dataviz terminé » est **partiellement vraie** — 1 des 3 items DS-bloqués est désormais livré (DashboardGrid), **2 restent non confirmés livrés dans le repo** (heatmap séquentiel, tooltip nearest-X). Statut global WP20 dataviz = **`unverified` / partial**, à revalider contre l'état npm/DS courant (le repo est par ailleurs en **drift** : HEAD = v0.4.52 **+3 commits non taggués/non publiés**, dont DashboardGrid — donc la fonctionnalité livrée n'est pas encore dans une release taggée). Cause probable de l'écart : le plan DS reflète l'ACK/la clôture côté DS et les commits post-handover, tandis que le handover fige l'état 2026-06-16.

Autre drift historique noté dans le handover (précédent, réconcilié à l'époque) : après `v0.4.48`, core=0.4.49 / react=0.4.50 / svelte+vue=0.4.48 → réaligné 0.4.50 par Codex. Le même motif se répète maintenant (3 commits au-delà de v0.4.52) → **règle lockstep à re-appliquer avant toute publication**.

## 10. Synthèse migration → couches DS Sentropic

| Couche DS cible | Contenu dataviz | Décision |
|---|---|---|
| **moteurs** | core : store, crossfilter, serialize, actions, hover, model, fields, query, describe | **rapatrier** (contrats gelés, tests exhaustifs) |
| **processing** | core : aggregate, pivot(+advanced), calculations, kpi, conditional-format, format, categorical | **rapatrier** |
| **dataviz** | core : ~50 builders de modèles de charts + geo/vectorField/contour/windBarb ; `color.ts` | **rapatrier** builders ; **adapter** color.ts (dé-doublonner vs tokens DS) |
| **scène** | core : layout, objects, annotations | **rapatrier** |
| **adaptateurs-DS** | `dataviz-svelte`/`react`/`vue` : adapter store + ~120 composants ; `dataviz-angular` (2 composants, POC) | **rapatrier** svelte/react/vue (parité) ; **adapter** angular (résoudre tarball DS + élargir couverture, ou **laisser** en POC jusqu'à publication DS-angular npm) |
| **apps** | `apps/docs*` (démos 3 fw), `apps/site` (registry/galerie), workflows pages | **laisser** (vitrines) ou porter en doc DS |
| **transverse** | `format-value.ts` (Intl) | **adapter** (candidat util partagé DS/i18n) |

Préserver les noms `@sentropic/dataviz-core|svelte|react|vue|angular`.

## 11. Points à revalider (`unverified` / `source-gap`)

- WP20 : heatmap séquentiel (#2) et tooltip nearest-X (#3) non confirmés livrés → **revalider** vs DS/npm courant. DashboardGrid (#1) livré mais **non taggué** (drift). `unverified`.
- `npm view @sentropic/dataviz-core` a timeouté (retry FAIL) alors que svelte/react/vue = 0.4.52 confirmés live et en dépendent → core **présumé publié**, à confirmer réseau. `unverified`.
- dataviz-angular : tarball DS référencé = `0.36.51` (package.json) vs `0.36.47` (README) ; couplage `file:` à résoudre ; DS-angular non publié npm. `unverified` (doc).
- Benchmarks + fixtures dédiées : **absents** du repo. `source-gap`.
- Licence : effective MIT (fichiers LICENSE + champ) ; README racine dit « à confirmer ». `unverified` (mention).
- `.track/` local stale (stop 2026-06-12) → non représentatif ; ne pas utiliser comme backlog.

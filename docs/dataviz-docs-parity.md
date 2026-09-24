# Dataviz — parité de documentation (lot D)

Relevé chiffré : ce que le site public dataviz présente, ce que le site du
design system documente, et l'écart composant par composant.

- Date du relevé : 2026-09-24.
- Sources (lecture seule pour dataviz) :
  - dépôt dataviz `/home/antoinefa/src/dataviz`, branche `main`,
    commit `0869ae5b59bb308be7d43fbe0de58c5487e11f25` ;
  - site public : application `apps/site` (registre
    `src/lib/registry/entries/{charts,grids,dashboards}.ts`), déployée sur
    `https://dataviz.sent-tech.ca` (domaine dans
    `.github/workflows/pages.yml`, `CNAME`), dépôt
    `https://github.com/rhanka/dataviz` ;
  - ce dépôt (worktree `.dvdocs-wt`), branche `feat/docs-dataviz-parity`,
    base `7c3fbbcf` (merge PR #61) : paquets `packages/dataviz-*`,
    catalogue `apps/docs/src/lib/components-catalog.ts`, pages
    `apps/docs/src/routes/components/`.
- Méthode : extraction par script Node des exports d'`index.ts`, des noms du
  registre du site dataviz et des slugs du catalogue/routes DS. Aucune page
  DS n'importe `@sentropic/dataviz-*` (vérifié par recherche : zéro import ;
  les autres mentions de dataviz sont en prose ou dans des exemples
  génériques, sans import de paquet).

## 1. Chiffres clés

| Périmètre | Mesure |
| --- | --- |
| Entrées présentées par le site dataviz | **112** (87 charts + 4 grids + 21 dashboards) |
| Composants exportés `@sentropic/dataviz-svelte` | **118** |
| Composants exportés `@sentropic/dataviz-react` | **118** (+`TimeSeriesLineChart`, −`UrlSync`) |
| Composants exportés `@sentropic/dataviz-vue` | **117** (−`UrlSync`) |
| Composants exportés `@sentropic/dataviz-angular` | **32** (lot 1 : 10 ; lot 2 : 20, générés ; plus `QueryBar` et `DateHistogramChart`, antérieurs) + adaptateur |
| Composants distincts (svelte ∪ react-only) | **119** |
| Entrées au catalogue DS (`components-catalog.ts`) | **203**, toutes natifs DS |
| Routes `apps/docs/src/routes/components/` | **205** dossiers (200 pages dédiées + 4 pages groupes + 1 route dynamique `[slug]` ; 3 entrées catalogue couvertes par page groupe, sans route propre) |
| Adaptateurs dataviz documentés sur le site DS | **0** |
| Slugs DS homonymes d'un adaptateur dataviz | **69** (documentent le composant natif, pas l'adaptateur) |
| Adaptateurs adossés à un composant DS catalogué | **116** (69 homonymes + 47 non homonymes ; seuls `TimeSeriesLineChart`, `UrlSync` et `WebFrame` sans composant DS) |

L'estimation « ~119 composants par framework » est inexacte : elle vaut pour
svelte/react/vue (≈118), pas pour angular (32 après les lots 1 et 2). La parité angular est le
prérequis manquant avant toute page DS (règle de parité des frameworks).

Détail site dataviz (112) : `charts.ts` = 87 fiches (`CHART_ENTRIES`,
slugs `area`…`geo-density`) ; `grids.ts` = 4 (`conditional-format`,
`records-table`, `pivot-table`, `advanced-pivot`) ; `dashboards.ts` = 21
dont 2 vues (`data-explorer`, `full-dashboard`) et 19 composants
(`CrossfilteredBarChart`, `DashboardActiveFilters`, `SelectionLegend`,
`SmallMultiples`, `DrillBarChart`, `KpiCardGroup`, `FieldPane`,
`TopNFilter`, `ValueSlicer`, `RelativeDateFilter`, `RangeSliderFilter`,
`DateRangeFilter`, `BookmarkNavigator`, `FormatPanel`,
`CalculationEditor`, `ExportMenu`, `WebFrame`, `DataImage`,
`ObjectLayerPanel`).

## 2. Conventions d'une page composant DS (relevé, modèle `funnel-chart`)

1. Hero : kicker `Composant · <Catégorie>`, `h1` = nom, `Badge tone="success"`
   `Stable`, intro FR/EN.
2. Section Exemples : `TabbedExample` avec `NodeSpec` (rendu live identique
   Svelte/React/Vue/Angular via `examples.ts`, snippets 4 frameworks).
3. Section API : table `Prop | Type | Défaut | Description` (FR/EN).
4. Section Tokens CSS : table `Variable CSS | Description`, tokens
   `--st-*` uniquement, aucune couleur en dur.
5. `<style>` scopé aux classes, tokens uniquement ; aucun attribut `style`
   littéral (règle CSP `csp-no-style-attr`).
6. Catalogue : entrée `{ name, slug, status, category, groupSlug?,
   description: { fr, en } }` dans `COMPONENTS`, groupe affiché sur
   `/components` et l'accueil (`#components`) via `docs-navigation.ts`.
7. Bilinguisme FR/EN sur chaque page (ternaires `locale.value` ou clés `t()`).

Une page adaptateur dataviz ne peut pas suivre tel quel le point 2 : les
adaptateurs consomment un store `dataviz-core`, `apps/docs` ne dépend
d'aucun paquet `@sentropic/dataviz-*`, et `examples.ts` ne sait rendre que
des composants DS. Voir §5 (prérequis).

## 3. Écart composant par composant

Référence composants = exports valeur d'`index.ts` svelte (118) +
`TimeSeriesLineChart` (react-only) = 119. « Route DS » homonyme signifie :
même slug, mais page du composant **natif** DS (props par valeur), pas de
l'adaptateur (props store). La colonne « composant DS sous-jacent » donne,
pour chaque adaptateur, le composant DS catalogué qu'il compose (imports
`from '@sentropic/design-system-svelte'` mesurés dans
`packages/dataviz-svelte/src/lib/`, homonyme natif pour les 69 lignes
homonymes). Mesure : **116 des 119 adaptateurs** s'adossent ainsi à un
composant DS déjà catalogué (69 homonymes et 47 non homonymes) ; seuls
`TimeSeriesLineChart` (react-only, sans import DS), `UrlSync` (synchro
d'URL sans rendu) et `WebFrame` (`iframe` direct) n'en ont pas. Cas limites :
l'adaptateur `ScoreCard` compose `KpiCard` (homonyme natif `ScoreCard`
catalogué) ; `DashboardGrid` et `DataImage` n'importent aucun composant DS
mais ont un homonyme natif catalogué ; les adaptateurs `Geo*` importent
`GeoMap` (DS épinglé 0.34.62, renommé `GeoChart` depuis). Statut global :
**119 « à documenter », 0 « déjà documenté »** — mais ce sont 119 API
d'adaptateur à documenter, pas 119 surfaces inédites.

| Composant | Site dataviz | Route DS | Composant DS sous-jacent | Statut | Raison / note |
| --- | --- | --- | --- | --- | --- |
| AdvancedPivotDataTable | grids | aucune | DataTable | à documenter | présenté (grids), sans page DS |
| AnalyticsClusterPlot | charts | aucune | ScatterPlot | à documenter | présenté (charts), sans page DS |
| AnimatedBubbleChart | charts | aucune | ScatterPlot | à documenter | présenté (charts), sans page DS |
| AnomalySwimLaneChart | charts | homonyme (natif DS) | AnomalySwimLaneChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ArcDiagramChart | charts | homonyme (natif DS) | ArcDiagramChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| AreaChart | charts | homonyme (natif DS) | AreaChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| AreaRangeChart | charts | homonyme (natif DS) | AreaRangeChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| AreaSplineRangeChart | charts | homonyme (natif DS) | AreaSplineRangeChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| BellCurveChart | charts | homonyme (natif DS) | BellCurveChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| BookmarkNavigator | dashboards | aucune | Button | à documenter | présenté (vues dashboards), sans page DS |
| BoxPlotChart | charts | homonyme (natif DS) | BoxPlotChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| BulletChart | charts | homonyme (natif DS) | BulletChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| BumpChart | charts | homonyme (natif DS) | BumpChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| CalculationEditor | dashboards | aucune | Button, Input, Select, Textarea | à documenter | présenté (vues dashboards), sans page DS |
| CalendarHeatmapChart | charts | homonyme (natif DS) | CalendarHeatmapChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| CandlestickChart | charts | homonyme (natif DS) | CandlestickChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ChartExport | non présenté | aucune | Button, Inline | à documenter | exporté mais non présenté sur le site dataviz, sans page DS |
| ChordChart | charts | aucune | ChordDiagram | à documenter | présenté (charts), sans page DS |
| ChoroplethMap | charts | aucune | GeoChart | à documenter | présenté (charts), sans page DS |
| ColumnPyramidChart | charts | homonyme (natif DS) | ColumnPyramidChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ColumnRangeChart | charts | homonyme (natif DS) | ColumnRangeChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ComboChart | charts | homonyme (natif DS) | ComboChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ContourChart | charts | homonyme (natif DS) | ContourChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| CorrelationMatrix | charts | aucune | HeatmapChart | à documenter | présenté (charts), sans page DS |
| CrossfilteredBarChart | dashboards | aucune | BarChart | à documenter | présenté (vues dashboards), sans page DS |
| DashboardActiveFilters | dashboards | aucune | FilterBar, FilterPill | à documenter | présenté (vues dashboards), sans page DS |
| DashboardFilterBar | non présenté | aucune | Search, DatePicker, Select, MultiSelect, Button, FilterBar, FilterPill | à documenter | exporté mais non présenté sur le site dataviz, sans page DS |
| DashboardGrid | non présenté | homonyme (natif DS) | DashboardGrid | à documenter | aucune entrée au registre (seulement cité dans l’entrée `full-dashboard`) ; homonyme natif DS |
| DataImage | dashboards | homonyme (natif DS) | DataImage | à documenter | présenté (vues dashboards), sans page DS ; homonyme natif DS |
| DateHistogramChart | non présenté | aucune | BarChart, DatePicker | à documenter | exporté mais non présenté sur le site dataviz, sans page DS |
| DateRangeFilter | dashboards | aucune | DatePicker | à documenter | présenté (vues dashboards), sans page DS |
| DecompositionTreeChart | charts | homonyme (natif DS) | DecompositionTreeChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| Density2DChart | charts | homonyme (natif DS) | Density2DChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| DependencyWheelChart | charts | homonyme (natif DS) | DependencyWheelChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| DivergingBarChart | charts | aucune | DivergentBarChart | à documenter | présenté (charts), sans page DS |
| DonutChart | charts | homonyme (natif DS) | DonutChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| DrillBarChart | dashboards | aucune | BarChart | à documenter | présenté (vues dashboards), sans page DS |
| DrillBreadcrumb | non présenté | aucune | Breadcrumb, Button, Inline | à documenter | aucune entrée au registre (seulement cité dans le code de l’entrée `drill`), sans page DS |
| DrillChart | non présenté | aucune | Button, Inline | à documenter | exporté mais non présenté sur le site dataviz, sans page DS |
| DumbbellChart | charts | homonyme (natif DS) | DumbbellChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ErrorBarsChart | charts | aucune | BarChart | à documenter | présenté (charts), sans page DS |
| EventFeedPanel | charts | homonyme (natif DS) | EventFeedPanel | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ExportMenu | dashboards | aucune | Button | à documenter | présenté (vues dashboards), sans page DS |
| FieldPane | dashboards | aucune | TreeView | à documenter | présenté (vues dashboards), sans page DS |
| FlamegraphChart | charts | homonyme (natif DS) | FlamegraphChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ForceGraph | charts | homonyme (natif DS) | ForceGraph | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ForecastLineChart | charts | aucune | LineChart | à documenter | présenté (charts), sans page DS |
| FormatPanel | dashboards | aucune | Checkbox, Input, Select | à documenter | présenté (vues dashboards), sans page DS |
| FunnelChart | charts | homonyme (natif DS) | FunnelChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| GanttChart | charts | homonyme (natif DS) | GanttChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| GaugeChart | charts | homonyme (natif DS) | GaugeChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| GeoClusterMap | charts | aucune | GeoChart | à documenter | présenté (charts), sans page DS |
| GeoDensityMap | charts | aucune | GeoChart | à documenter | présenté (charts), sans page DS |
| GeoFlowMap | charts | aucune | GeoChart | à documenter | présenté (charts), sans page DS |
| GeoHexbinMap | charts | aucune | GeoChart | à documenter | présenté (charts), sans page DS |
| GeoJsonMap | non présenté | aucune | GeoChart | à documenter | exporté mais non présenté sur le site dataviz, sans page DS |
| GeoPointMap | charts | aucune | GeoChart | à documenter | présenté (charts), sans page DS |
| HLCChart | charts | homonyme (natif DS) | HLCChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| HeatmapChart | charts | homonyme (natif DS) | HeatmapChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| HeikinAshiChart | charts | homonyme (natif DS) | HeikinAshiChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| HistogramChart | charts | homonyme (natif DS) | HistogramChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| HollowCandlestickChart | charts | homonyme (natif DS) | HollowCandlestickChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ItemChart | charts | homonyme (natif DS) | ItemChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| KpiCardGroup | dashboards | aucune | KpiCard | à documenter | présenté (vues dashboards), sans page DS |
| LollipopChart | charts | homonyme (natif DS) | LollipopChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| MekkoChart | charts | aucune | MarimekkoChart | à documenter | présenté (charts), sans page DS |
| OHLCChart | charts | homonyme (natif DS) | OHLCChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ObjectLayerPanel | dashboards | aucune | Button, TreeView | à documenter | présenté (vues dashboards), sans page DS |
| OrganizationChart | charts | homonyme (natif DS) | OrganizationChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| PackedBubbleChart | charts | aucune | PackedBubblesChart | à documenter | présenté (charts), sans page DS |
| PalettePicker | charts | aucune | Stack, Inline, ColorSwatch, ColorScaleBar | à documenter | présenté (charts), sans page DS |
| ParallelCoordinatesChart | charts | homonyme (natif DS) | ParallelCoordinatesChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ParetoChart | charts | homonyme (natif DS) | ParetoChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| PercentileBandChart | charts | aucune | LineChart | à documenter | présenté (charts), sans page DS |
| PivotDataTable | grids | aucune | DataTable | à documenter | présenté (grids), sans page DS |
| PointAndFigureChart | charts | homonyme (natif DS) | PointAndFigureChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| PolygonChart | charts | homonyme (natif DS) | PolygonChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| QueryBar | non présenté | aucune | Search | à documenter | exporté mais non présenté sur le site dataviz, sans page DS |
| RadarChart | charts | homonyme (natif DS) | RadarChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| RangeSliderFilter | dashboards | aucune | RangeSlider | à documenter | présenté (vues dashboards), sans page DS |
| RecordsTable | grids | aucune | DataTable | à documenter | présenté (grids), sans page DS |
| ReferenceLineChart | charts | aucune | LineChart | à documenter | présenté (charts), sans page DS |
| RelativeDateFilter | dashboards | aucune | Select | à documenter | présenté (vues dashboards), sans page DS |
| RenkoChart | charts | homonyme (natif DS) | RenkoChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| RibbonChart | charts | homonyme (natif DS) | RibbonChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| RoseChart | charts | homonyme (natif DS) | RoseChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| SankeyChart | charts | homonyme (natif DS) | SankeyChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ScatterPlot | charts | homonyme (natif DS) | ScatterPlot | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ScatterPlotMatrix | charts | aucune | ScatterPlot | à documenter | présenté (charts), sans page DS |
| ScoreCard | charts | homonyme (natif DS) | ScoreCard | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| SelectionLegend | dashboards | aucune | Inline, SelectionChip | à documenter | présenté (vues dashboards), sans page DS |
| SmallMultiples | dashboards | aucune | Grid, BarChart | à documenter | présenté (vues dashboards), sans page DS |
| SolidGaugeChart | charts | homonyme (natif DS) | SolidGaugeChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| Sparkline | charts | homonyme (natif DS) | Sparkline | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| StackedBarChart | charts | homonyme (natif DS) | StackedBarChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| StateTimelineChart | charts | homonyme (natif DS) | StateTimelineChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| StatusHistoryChart | charts | homonyme (natif DS) | StatusHistoryChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| StepLineChart | charts | homonyme (natif DS) | StepLineChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| StreamgraphChart | charts | homonyme (natif DS) | StreamgraphChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| SunburstChart | charts | homonyme (natif DS) | SunburstChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| TileMapChart | charts | homonyme (natif DS) | TileMapChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| TimelineChart | charts | homonyme (natif DS) | TimelineChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| TopNFilter | dashboards | aucune | NumberInput | à documenter | présenté (vues dashboards), sans page DS |
| TraceWaterfallChart | charts | homonyme (natif DS) | TraceWaterfallChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| TreegraphChart | charts | homonyme (natif DS) | TreegraphChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| TreemapChart | charts | homonyme (natif DS) | TreemapChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| TrendLineChart | charts | aucune | LineChart | à documenter | présenté (charts), sans page DS |
| UrlSync | non présenté | aucune | — | à documenter | absent react/vue ; à aligner avant page |
| ValueSlicer | dashboards | aucune | CheckboxGroup | à documenter | présenté (vues dashboards), sans page DS |
| VariablePieChart | charts | homonyme (natif DS) | VariablePieChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| VectorFieldChart | charts | homonyme (natif DS) | VectorFieldChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| VennChart | charts | homonyme (natif DS) | VennChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| ViolinChart | charts | homonyme (natif DS) | ViolinChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| WaffleChart | charts | homonyme (natif DS) | WaffleChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| WaterfallChart | charts | homonyme (natif DS) | WaterfallChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| WebFrame | dashboards | aucune | — | à documenter | présenté (vues dashboards), sans page DS |
| WindBarbChart | charts | homonyme (natif DS) | WindBarbChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| WordCloudChart | charts | homonyme (natif DS) | WordCloudChart | à documenter | homonyme : la page DS documente le composant natif (props value), pas l’adaptateur store |
| TimeSeriesLineChart | non présenté | aucune | — | à documenter | react-only ; à aligner svelte/vue avant page |

Synthèse du tableau : 119 « à documenter », 0 « déjà documenté » —
soit 119 API d'adaptateur à documenter, pas 119 surfaces inédites : 116
s'adossent à un composant DS déjà catalogué (colonne « composant DS
sous-jacent »).
Statut N-A : uniquement les utilitaires non-composants, exclus du décompte
(`rowsToCsv`, `serializeSvg`, `svgStringToBlob`, `svgStringToPngBlob`,
`downloadBlob`, `downloadSvg`, `downloadPng`, `printElement`,
`stateToQuery`, `queryToState`, `applyStateToStore`, `readStateFromUrl`,
`writeStateToUrl`, `readLocationSearch`, `drillLevel`, `onDrillSelect`,
`drillDepth`, `numericDomain`, `rangeBoundsToSpec`, `dateRangeToSpec`,
`relativeRangeToSpec`, `useUrlSync`, constantes `DEFAULT_*`,
`DASHBOARD_STORE`, fonctions d'adaptateur `createDashboard`,
`injectDashboard`, `provideDashboard`, `toSignalStore`).

## 4. Ordre de priorité (écart restant)

- **P0 — Renvoi (livré, §6).** Liens DS → site dataviz et dépôt ; l'inverse
  est fait par un autre agent sur le dépôt dataviz.
- **P1 — Parité angular (prérequis, hors lot D).** `dataviz-angular`
  n'exporte que 32/119 composants (lots 1 et 2 livrés ; 87 restants, patron de portage
  dans `packages/dataviz-angular/PATTERN.md`). Sans la suite, aucune page DS ne
  peut satisfaire la règle de parité des frameworks au-delà de ces 32. Recommandé
  avant les lots P2 ; à défaut, pages avec mention de couverture explicite
  (décision owner).
- **P2 — Pages DS, par lots.** Prérequis infra : dépendances workspace
  `@sentropic/dataviz-*` dans `apps/docs`, support NodeSpec store-based dans
  `examples.ts` (4 frameworks), index de recherche, conventions §2.
  Ordre suggéré : A. charts store-based présentés (87, par familles :
  catégoriels, part-of-whole, temporels/financiers, distributions,
  hiérarchies/réseaux, géo) ; B. dashboard/filtres (19 + 2 vues) ;
  C. tables/pivots (3 + conditional-format) ; D. géo (7, recouvre A
  partiellement) ; E. infra non présentée (ChartExport, UrlSync, DrillChart,
  DashboardFilterBar, QueryBar, DateHistogramChart, GeoJsonMap) +
  alignements (`TimeSeriesLineChart`, `UrlSync`).
- Cas particulier homonymes (69) : chaque page adaptateur doit distinguer
  explicitement le natif DS (props par valeur) de l'adaptateur (props store),
  avec renvoi croisé. Pour les 47 non homonymes adossés, la page adaptateur
  part du composant DS sous-jacent (colonne dédiée) et documente la couche
  store par-dessus.

## 5. Prérequis d'infra pour les lots P2 (non livrés ici)

- `apps/docs/package.json` : ajouter les workspaces `@sentropic/dataviz-*`
  utilisés par les démos live (décision d'architecture : poids du bundle
  docs, SSR, styles).
- `apps/docs/src/lib/framework/examples.ts` : constructeurs NodeSpec
  store-based + snippets svelte/react/vue/angular par composant.
- `docs-search-index.ts`, `i18n.ts`, `components-catalog.ts` (catégorie
  `data`, `groupSlug` le cas échéant).

## 6. Renvoi (livré)

- Depuis le site DS : encart « Dataviz » sur la page catalogue
  (`/components`) et la section composants de l'accueil. Les deux pointent
  vers les paquets publiés (`https://www.npmjs.com/package/@sentropic/dataviz-core`)
  et vers les sources de ce dépôt
  (`https://github.com/rhanka/sent-tech-design-system/tree/main/packages`).
  Aucun lien ne pointe plus vers `dataviz.sent-tech.ca` : mesuré le 2026-09-24,
  la racine répond 200 avec une page de renvoi vers
  `design-system.sent-tech.ca/components`, et tout chemin profond répond
  **404** en servant le même corps (`/charts`, `/charts/`,
  `/charts/treemap`, et n'importe quelle URL inconnue) — GitHub Pages sert
  son repli `404.html` avec le code 404, qu'un hébergeur statique ne peut pas
  transformer en 301. Les pages `header` et `app-chrome` mentionnent encore
  le domaine en prose, sans lien.
- Depuis le site dataviz : livré en amont (dataviz #18) — la page de renvoi est
  servie à la racine **et** comme repli 404, donc toute URL du domaine mène au
  design system, avec et sans JavaScript.

## 7. Lots livrés et vérifications

- Lot D1 (commit 1) : le présent document d'inventaire.
- Lot D2 (commit 2) : renvoi DS → dataviz (catalogue + accueil).
- Commandes et résultats : voir rapport de session (ci-dessous au moment de
  la livraison ; mis à jour à chaque lot).

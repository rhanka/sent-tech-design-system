# M0 — Audit des surfaces graphes et dataviz du design system

Date : 2026-09-15. Base vérifiée : `422776869847079891a5be49a8e14313ea1c25a8`, branche `feat/graph-dataviz-repatriation`. Audit borné au DS et aux contrats consommateurs nécessaires pour réconcilier WP20 ; les inventaires graphify/dataviz fournis restent les entrées de référence.

## Résultat

Le DS possède déjà les primitives SVG, graphes et tableaux de bord à réutiliser. Leur présence dans quatre barrels ne prouve pas leur parité de comportement. **WP20 global reste `partial`** : l’échelle séquentielle existe côté DS mais les wrappers dataviz ne la transmettent pas ; le dashboard éditable existe dans deux implémentations distinctes ; le hover contrôlé existe mais ne satisfait pas le contrat nearest-X du handover. La spec DS a de plus remplacé le troisième besoin par une extension heatmap, sans preuve documentaire permettant d’assimiler les deux demandes.

La connexion des packages dataviz au DS courant rencontre un écart immédiat d’import : les adaptateurs utilisent `GeoMap` et ses types, retirés du barrel courant au profit de `GeoChart`. Ce point doit entrer dans le lot de compatibilité M1.

## 1. Périmètre, méthode et inventaire export par export

Le tableau [graph-dataviz-ds-exports.json](graph-dataviz-ds-exports.json) contient une ligne par export public pertinent : package, framework, symbole runtime/type, barrel et ligne, fichier source, implémentation lorsque le fichier délègue à `catalog`, destination, décision et clé de rapprochement track. Les références textuelles aux tests y sont distinguées des tests exécutés. Les `track_id` sont désormais résolus par la réconciliation centrale dans ce worktree ; les écritures et le rejeu sont consignés dans `graph-dataviz-track-sync.json`.

| Package | Version source | Exports sélectionnés | Runtime | Types |
|---|---:|---:|---:|---:|
| `@sentropic/design-system-svelte` | 0.35.0 | 319 | 93 | 226 |
| `@sentropic/design-system-react` | 0.37.0 | 390 | 92 | 298 |
| `@sentropic/design-system-vue` | 0.37.0 | 402 | 93 | 309 |
| `@sentropic/design-system-angular` | 0.37.0 | 406 | 93 | 313 |
| `apps/docs/DiagramAnnotator` | application privée | 3 | composant + méthodes `clear`, `toPNG` | N-A |

Total : **1 517 exports des packages + 3 entrées de composant applicatif**. La sélection couvre les composants chart/graph/diagram, les helpers publics associés et les primitives adjacentes de dashboard, données, filtres, plage temporelle, média et hiérarchie. Les autres composants UI génériques ne sont pas dans ce sous-inventaire. Les quatre barrels n’utilisent pas d’`export *` ; les clauses d’exports nommés ont été lues directement, sans inférer d’export public à partir du seul nom d’un fichier.

Décision par défaut : conserver chaque nom/publication `@sentropic/design-system-*` et réutiliser le rendu existant ; porter les calculs purs vers les couches communes par tranches compatibles, sous `GD-M2-DS-PRESENTATION`. Les écarts de comportement dépendent de `GD-M2-PARITY`. L’extraction éventuelle du cerclage applicatif dépend de `GD-M2-CANVAS`.

### Catalogue runtime couvert

Les 93 noms distincts, incluant deux helpers publics, se répartissent ainsi. Le JSON reste le détail autoritatif de la présence par framework.

- Graphes/flux/hiérarchies : `ForceGraph`, `GraphLegend`, `ArcDiagramChart`, `ChordDiagram`, `DependencyWheelChart`, `SankeyChart`, `OrganizationChart`, `TreegraphChart`, `TreemapChart`, `SunburstChart`, `DecompositionTreeChart`, `PackedBubblesChart`, `TreeView`, `nodeShapePath`, `edgeDashArray`.
- Séries/catégories : `AreaChart`, `AreaRangeChart`, `AreaSplineRangeChart`, `BarChart`, `BumpChart`, `ColumnPyramidChart`, `ColumnRangeChart`, `ComboChart`, `DivergentBarChart`, `DumbbellChart`, `LineChart`, `LollipopChart`, `ParetoChart`, `RibbonChart`, `Sparkline`, `StackedBarChart`, `StepLineChart`, `StreamgraphChart`, `WaterfallChart`.
- Parts/distributions/statistiques : `BellCurveChart`, `BoxPlotChart`, `BulletChart`, `Density2DChart`, `DonutChart`, `ErrorBarChart`, `FunnelChart`, `GaugeChart`, `HeatmapChart`, `HistogramChart`, `ItemChart`, `MarimekkoChart`, `ParallelCoordinatesChart`, `PolygonChart`, `RadarChart`, `RoseChart`, `ScatterPlot`, `SolidGaugeChart`, `VariablePieChart`, `VennChart`, `ViolinChart`, `WaffleChart`, `WordCloudChart`.
- Financier/temps/observabilité : `AnomalySwimLaneChart`, `CalendarHeatmapChart`, `CandlestickChart`, `EventFeedPanel`, `FlamegraphChart`, `GanttChart`, `HLCChart`, `HeikinAshiChart`, `HollowCandlestickChart`, `OHLCChart`, `PointAndFigureChart`, `RenkoChart`, `StateTimelineChart`, `StatusHistoryChart`, `TimelineChart`, `TraceWaterfallChart`.
- Géographie/champs : `ContourChart`, `GeoChart`, `TileMapChart`, `VectorFieldChart`, `WindBarbChart`.
- Dashboard/présentation/filtres : `ColorScaleBar`, `ColorSwatch`, `Dashboard`, `DashboardGrid`, `DataImage`, `DataTable`, `Embed`, `FieldCard`, `FilterBar`, `FilterPill`, `KpiCard`, `RangeSlider`, `ScoreCard`, `SelectionChip`, `TimeRangePicker`.

`Dashboard` est absent du barrel React ; la différence explique le nombre runtime 92/93 et doit rester visible, sans créer une implémentation opportuniste durant M0. Plusieurs types `*Props` publics React/Vue/Angular ne sont pas exportés par le barrel Svelte (ex. `ForceGraphProps`, `GraphLegendProps`, `ArcDiagramChartProps`, `ChordDiagramProps`, `HeatmapChartProps`). `DashboardGridProps` et `DashboardGridTile` sont bien publics sur les quatre frameworks. Ce sont des différences de surface, distinctes des problèmes de comportement.

## 2. Contrats existants et décisions de réemploi

| Surface | Contrat et comportement vérifiés dans le code | Destination/décision |
|---|---|---|
| `ForceGraph` | `nodes` identifiés, `edges{source,target,relation?,weak?,dash?,emphasis?,width?}`, formes/tons/poids, positions fixes `fx/fy`, sélection/focus et callbacks. Simulation locale Coulomb + ressorts + gravité, paires O(n²), seed, SVG. Aucun document métier, profil ou moteur de codec. | Garder le composant public contrôlé pour données/sélection ; migrer la simulation/géométrie vers processing/scène par tranche compatible. Ne pas assimiler ce renderer SVG au package WebGL/Canvas2D `@sentropic/graph`. |
| `GraphLegend` | `entries: ForceGraphLegendEntry[]`, `title?`, formes et traits. Svelte/Vue/Angular importent les helpers de forme/trait depuis ForceGraph ; React les fournit via `catalog.tsx`. | Conserver l’API ; extraire les helpers purs communs avec compat, pour supprimer le couplage légende→module composant ForceGraph. Coût bundle actuel `unverified`. |
| `ArcDiagramChart` | `data:{from,to,weight}[]`, `labels?`, dimensions ; nœuds dérivés dans l’ordre d’apparition, degré pondéré, arcs SVG sur axe horizontal. Poids non finis ou ≤0 filtrés sans diagnostic public. | Garder le chart. Le calcul de projection/route peut réutiliser des phases communes ; ce n’est pas un modèle sémantique générique. |
| `ChordDiagram` | `data:{from,to,value}[]`, `labels?`, dimensions ; arcs proportionnels aux flux entrants+sortants, rubans SVG quadratiques, garde finie positive. | Garder le chart et ses types. Adapter explicitement vers une projection processing ; aucun remplacement implicite par un graphe orienté générique. |
| `DashboardGrid` DS | `tiles{id,x,y,w,h,title?,description?,value?}`, `columns=12`, `rowHeight=88`, `gap=16`, `editable`, `onLayout`. Contrôles boutons move/resize d’une unité. Coordonnées normalisées, collisions autorisées. Contenu texte, état local d’édition. Vue émet aussi `layout`; Angular `layoutChange`. | Conserver nom/contrat ; étendre puis déléguer sans casser dataviz. État dashboard durable reste dans dataviz-core. Corriger le défaut SSR Svelte avant d’affirmer une parité vérifiée. |
| `HeatmapChart` | `data:{x,y,value,tone?}[]`, `scale:'categorical'|'sequential'`, huit buckets, valeurs finies pour domaine ; bucket 1 pour domaine plat/non-fini. Rampe `--st-heatmapChart-ramp-1..8` ; défaut catégoriel. | DS conserve le rendu et les tokens ; dataviz transmet explicitement le choix de scale. Ne pas déplacer son store dans les composants. |
| `ChartAnnotation` | Union discriminée point/label/line/region/shape en espace données ; types recopiés localement. Résolveur vers primitives pixels, sans DOM, qui omet les coordonnées rejetées sans rapport public. | Conserver le contrat dataviz actuel et partager ses définitions sans cycle ; futur modèle d’annotation scène via conversion explicite. Ne pas assimiler annotations chart, capture PNG et annotation sémantique du document. |
| `chartCrosshair` | Helper privé du package : `keyForX`, `indexForHoverKey`, `resolveActiveIndex`, `isControlled`. Contrat public des charts `hoverKey`/`onHoverKeyChange` ; aucune réexportation de ces fonctions au barrel. | Réutiliser pour la liaison inter-vues ; état/canal de hover appartient à dataviz-core. Ajouter le choix géométrique nearest-X séparément. |
| `DiagramAnnotator` | Application SvelteKit ; `src/alt/width/height/stroke/lineWidth`, outils ellipse/rect, pointer capture et dessin Canvas2D. État local shapes/draft, `clear()` et composition image+formes par `toPNG()`. | Garder la recette docs ; extraire à terme les commandes/gestes génériques sous `GD-M2-CANVAS`. Pas d’import `$app/environment` dans le cœur. Aucun export de package, persistance, undo/redo, choix occurrence/entité/vue ou commande agent existant. |

Sources principales : `packages/components-svelte/src/lib/{ForceGraph,GraphLegend,ArcDiagramChart,ChordDiagram,DashboardGrid,HeatmapChart}.svelte`, `chartAnnotations.ts`, `chartCrosshair.ts` ; fichiers homologues React/Vue/Angular. **React ForceGraph est une façade vers `packages/components-react/src/catalog.tsx`**, pas une seconde implémentation dans `ForceGraph.tsx`. Application : `apps/docs/src/lib/feedback/DiagramAnnotator.svelte`.

La simulation ForceGraph est copiée dans quatre implémentations framework (React dans catalog). La seed dépend des IDs triés, mais l’initialisation place les nœuds selon l’index d’entrée : aucune stabilité incrémentale sous ajout/retrait ou permutation n’est prouvée par ce mécanisme seul. Le futur registre doit distinguer déterminisme à entrée identique, stabilité incrémentale et application d’un snapshot worker révisionné.

### Dépendances tierces DS déjà présentes

Les manifests de ces quatre packages déclarent themes et les peers framework ; Svelte/React/Vue ont respectivement `@lucide/svelte`, `lucide-react`, `lucide-vue-next` en runtime. Angular a les peers `@angular/core` et `@angular/common`. Aucune dépendance runtime ELK, Graphviz, diagram-js, JointJS ou D3 n’y est déclarée. Les calculs examinés sont des implémentations Sentropic locales. Aucun remplacement de dépendance n’est effectué durant cet audit. Les dépendances PDF dataviz restent celles de l’inventaire fourni.

## 3. Réconciliation WP20 avec les preuves

| Besoin du handover dataviz | État DS à la base auditée | État consommateur source fourni puis relu ciblément | Résultat de rapprochement |
|---|---|---|---|
| Dashboard edit mode | Existe sur 4 frameworks : `tiles` + `onLayout`; tests ciblés DS non retrouvés. SSR Svelte reproduit vide. | Le commit dataviz `a3f464b` ajoute **sa propre implémentation** `layout:DashboardLayout`, `panels`, `onLayoutChange`, contenu custom et pointer drag ; importe les opérations core, sans importer DS DashboardGrid. | Livraison fonctionnelle source `partial` pour adoption DS. Deux implémentations actives, contrats non substituables. L’inventaire fourni doit être corrigé sur le détail `tiles/columns` externe. |
| Heatmap sequential | `scale` implémenté sur 4 frameworks ; CSS privé tokenisé. | Svelte/React/Vue importent DsHeatmapChart mais leur `HeatmapChartProps` n’a pas `scale` et le rendu ne le transmet pas. Angular dataviz ne possède pas ce composant. | DS livré en source, consommation **not covered**. Ce n’est plus une absence de primitive DS ; le passage de contrat est à réaliser. |
| Tooltip nearest-X/crosshair/hide-on-leave | Crosshair et hover contrôlés existants ; pointerleave émet null. LineChart sélectionne `data-chart-index` sur la cible, sans utiliser clientX/clientY. | `docs/chart-ux-qa.md:21,48,60` exige capture plein plot, snap X, multiseries, limites, clavier et touch. | **partial** : la présence de crosshair ne réalise pas nearest-X. Exécution de la méthode actuelle : deux X différents sur même cible sans index produisent `[0,0]`. |
| Identité de la 3e FR | `spec/SPEC_EVOL_WP20_DATAVIZ_FR.md` D6 et `plan/07-BRANCH_wp20_dataviz_fr.md` la déclarent récupérée/fermée comme extension heatmap/sequential. | Handover `docs/audit/wp20-handover-2026-06-16.md:26-32` nomme explicitement tooltip nearest-X/crosshair/hide-on-leave. | **source-gap de rapprochement** : l’extension heatmap ne constitue pas une preuve d’annulation/remplacement du besoin tooltip. Conserver les faits historiques, rattacher le résiduel concret. |

IDs historiques communiqués par la réconciliation centrale : heatmap `01KTV0000000000000000010`, grid `01KTV0000000000000000020`, FR3 `01KTV0000000000000000030`, actuellement `done` avec acceptance `unknown`. Ce sous-audit ne les a ni lus via Track, ni modifiés : ces IDs doivent être validés dans le rapport central. Leurs statuts historiques ne prouvent pas l’acceptation du programme complet.

### Historique Git vérifié

- `bbe1505dcc431b7cd84296557198ebe9603927e5` : FR-3 hoverKey/onHoverKeyChange et crosshair tri-framework sur Bar/Line/Area. Présence dans l’ascendance HEAD vérifiée par `git merge-base --is-ancestor` (exit 0).
- `1df0bc041a605a2083184fa6becfec3257c47005` : intégration « Finalize WP19 WP20 WP23 dataviz guardrails », ajout DashboardGrid et sequential, spec et plan WP20, Angular. Ascendance HEAD vérifiée (exit 0). Le diff n’ajoute pas de tests DashboardGrid/Heatmap sequential ; les tests ajoutés concernent notamment Angular BarChart/Search.
- `c73a66899189ea1374a10be8240f4190c119203d` : commit de travail apparenté trouvé par `git log --all`; ne pas le compter comme livraison indépendante ni comme preuve d’ascendance HEAD.
- `a2383af2a48723bfb52382eee965a7a52eec87a8` : ajout WP17 cerclage/feedback, dernier commit touchant DiagramAnnotator trouvé dans le log du fichier.
- `ad55ee8d8c35b736ef0c0b93e15d4bfe8ebfb5f9` : dernier commit touchant ForceGraph Angular, correctif d’échelle des nœuds ; ne constitue pas une preuve d’implémentation des callbacks.
- `2d5e9d6638d0da3a33b22f3771348f0415839b94` : renommage GeoMap→GeoChart dans quatre frameworks ; `422776869847079891a5be49a8e14313ea1c25a8` : versions mineures des packages pour ce changement. Les packages dataviz du snapshot `0869ae5b59bb308be7d43fbe0de58c5487e11f25` pinnaient des versions antérieures (inventaire fourni) ; une simple redirection workspace révèle ce décalage.

## 4. Écarts concrets à porter dans les lots

| Clé finding | Écart / conséquence | Portage et critère observable |
|---|---|---|
| DS-01 | `GeoMap`/`GeoMapFeature`/`GeoMapFlow`/`GeoMapLayer`/`GeoMapPoint` restent importés dans les adaptateurs dataviz ; ces exports ont été renommés. L’alignement workspace ne peut être validé tel quel. | M1 compatibilité, propriétaire principal outillage/intégration ; migrer les imports internes et/ou fournir compat explicitement choisie, puis build/types et smoke des 7 wrappers géo ×3. Ne pas renommer les exports publics dataviz `*Map`. |
| DS-02 | DS Grid et dataviz Grid sont deux implémentations. Le contrat dataviz est plus riche et possède déjà pointer drag et contenu custom. | `GD-M2-DS-PRESENTATION`, S1 ; parité prise en charge par S2 après livraison S1. Une grille canonique consommée par les deux façades ; conserver callback/normalisation/clavier/contenu/drag existants, vérifier dataviz-core propriétaire de l’état. |
| DS-03 | DS Grid Svelte SSR : tuiles initialisées seulement dans `$effect` client. Un input d’une tuile donne 0 article serveur. | `GD-M2-PARITY`, S2 ; rendu SSR contient les tuiles et pas de mismatch d’hydratation ; le parent reste propriétaire de la synchronisation track. |
| DS-04 | Tooltip plein plot nearest-X absent dans la méthode LineChart auditée ; lecture d’attribut null devient index 0. | Rapprocher FR3 historique + `GD-M2-DS-PRESENTATION`; tester déplacement X loin des marks, sortie/blur, contrôle parent, multi-séries et limites. La correction de null seule ne remplit pas nearest-X. |
| DS-05 | ForceGraph Angular expose `mergePair`, `onMergeComplete`, `onEdgeHover` mais ils apparaissent seulement dans types/@Input ; aucun traitement/émission correspondant. | `GD-M2-PARITY`, S2 ; tests comportementaux équivalents Svelte/React/Vue pour animation/callback unique et hover d’arête. API présente ≠ comportement présent. |
| DS-06 | Types d’annotations, calculs de géométrie/layout et tokens locaux sont recopiés. Les annotations chart n’ont pas d’identité sémantique/rapport de conversion. | `GD-M2-DS-PRESENTATION`, S1 ; extraire les responsabilités pures derrière des façades compatibles, sans cycle vers dataviz-state ni app. Conserver les 5 variantes actuelles. |
| DS-07 | DiagramAnnotator reste une recette de capture avec état et APIs Canvas/DOM locaux, couleurs de fallback et dépendance SvelteKit. | `GD-M2-CANVAS`, S1 ; définir adaptation image/caméra et commandes typées ; garder capture/export dans la recette jusqu’à API publique prouvée. Le clavier ne crée pas aujourd’hui de formes. |
| DS-08 | Heatmap sequential n’est pas transmis par les wrappers dataviz. | Compléter l’item heatmap historique avec dépendance adoption dataviz ; prouver prop et rendu dans les trois adaptateurs existants, expliciter le périmètre Angular manquant. |

Ces écarts ne demandent pas d’arbitrage avant l’import conservateur M1. Le choix de la grille canonique, de ses façades de compat et du calendrier d’unification nécessite une décision concrète lorsque le contrat de contenu/édition sera décrit. Recommandation réversible : préserver les deux APIs publiques pendant le rapatriement, puis faire déléguer une façade vers l’implémentation canonique. Objection principale : la coexistence prolongée entretiendrait les divergences ; chaque tranche doit donc avoir une preuve de délégation et une date de retrait de l’ancienne implémentation interne.

## 5. Tests : présence, exécution et limites

### Exécutions de cette session

Runner : Vitest **4.1.6**. Les premiers essais utilisaient l’installation du checkout parent par chemin absolu. Après installation des dépendances npm dans le worktree par l’exécutant principal, les cinq suites Svelte ont été rejouées avec le runner local. Options identiques : `run --configLoader runner --no-cache --no-file-parallelism`.

| Périmètre | Résultat exécuté |
|---|---|
| React `src/{chartCrosshair,ArcDiagramChart,ChordPackedBubbles,ChartAnnotations}.test.tsx` | **4 fichiers / 45 tests PASS**, 3,58 s. |
| Vue `src/{chartCrosshair,ArcDiagramChart,ChordPackedBubbles,ChartAnnotations}.test.ts` | **4 fichiers / 45 tests PASS**, 3,30 s. |
| React `catalog.test.tsx`, filtre `ForceGraph` ou `GraphLegend` | **18 tests PASS**, 13 hors filtre ; 4,63 s. |
| Vue `behavior.test.ts`, filtre `ForceGraph` ou `GraphLegend` | **30 tests PASS**, 444 hors filtre ; 4,57 s. |
| Svelte mêmes 4 + `ForceGraph.test.ts` — essais initiaux, runner parent | **0 test exécuté** : 5 suites échouent au chargement du setup `/@fs/home/antoinefa/src/sent-tech-design-system/node_modules/@testing-library/svelte/src/vitest.js`. Un second essai `--globals` rencontre la même erreur. Limite de résolution de cet environnement initial. |
| Svelte mêmes 4 + `ForceGraph.test.ts` — rejeu avec runner local | **5 fichiers / 118 tests PASS**, 8,93 s, exit 0. Le chargement auparavant bloqué fonctionne avec les dépendances locales. Le compilateur signale les avertissements a11y existants sur les `<rect>` de AreaChart, BarChart et LineChart (tabindex/écouteurs sur élément non interactif) ; aucune correction runtime effectuée. |
| Svelte DashboardGrid SSR | Vrai compilateur `svelte/compiler`, génération serveur du fichier audité, puis `svelte/server.render`. 1 tuile avec titre sentinelle en entrée → 0 classe tile, titre absent. **Défaut reproduit.** |
| Svelte LineChart handler | Corps actuel `handleVisualPointerMove` extrait et transpilé avec TypeScript ; cible simulée sans attribut, événements aux X 10 et 290. Résultat indices `[0,0]`; la méthode ne consulte aucune coordonnée. **Écart de contrat reproduit**, pas un test navigateur complet. |

Commande reproductible React (adapter suffixes et cwd pour Vue) :

```sh
node /home/antoinefa/src/sent-tech-design-system/node_modules/vitest/vitest.mjs run --configLoader runner --no-cache --no-file-parallelism src/chartCrosshair.test.tsx src/ArcDiagramChart.test.tsx src/ChordPackedBubbles.test.tsx src/ChartAnnotations.test.tsx
```

Commande du rejeu Svelte, depuis `packages/components-svelte` :

```sh
node ../../node_modules/vitest/vitest.mjs run --configLoader runner --no-cache --no-file-parallelism src/chartCrosshair.test.ts src/ForceGraph.test.ts src/ArcDiagramChart.test.ts src/ChordPackedBubbles.test.ts src/ChartAnnotations.test.ts
```

Les **256 tests verts** (138 React/Vue + 118 Svelte) prouvent leurs assertions ciblées, pas la livraison de WP20, ni un rendu navigateur, ni la performance, ni une publication npm. Aucun build global, test Angular, publication, CI distante ou test d’adoption graphify n’a été exécuté par ce sous-audit.

### Couverture présente et limites des tests

- ForceGraph/GraphLegend : Svelte `ForceGraph.test.ts` ; React `catalog.test.tsx` inclut sélection, edge hover, repulsion et mergePair ; Vue `behavior.test.ts` inclut ForceGraph/GraphLegend. Angular `index.test.ts` vérifie la présence de composants/helpers, sans prouver les callbacks de ForceGraph.
- ArcDiagramChart : fichiers dédiés tri-framework. ChordDiagram : `ChordPackedBubbles.test.*` tri-framework. Annotations : `ChartAnnotations.test.*` tri-framework. Hover : `chartCrosshair.test.*` tri-framework.
- Aucun test faisant référence à `DashboardGrid` ou `sequential` n’a été retrouvé dans les sources tests DS ou `scripts/*test*`. Les tests de heatmap générique ne constituent pas une preuve des cas de domaine/rampe WP20.
- DiagramAnnotator : aucun test dédié trouvé. Le fichier ne propose ni sérialisation de shapes ni commandes publiques d’édition indépendantes du composant.

## 6. Limites et suite

Les sources hors worktree nécessaires aux vérifications ciblées étaient accessibles en lecture. Aucune correction du code, écriture track, attribution d’action à un humain, modification d’inventaire fourni ou commit n’a été effectué par ce sous-audit. La carte JSON porte des clés stables, pas des IDs inventés.

Prochaine action : intégrer les findings au plan central avec les vrais IDs track, aligner les imports géo pour le premier lot réalisable, puis établir les tests manquants de compatibilité et de parité avant de remplacer une des implémentations de grille. Le programme de rapatriement reste ouvert.

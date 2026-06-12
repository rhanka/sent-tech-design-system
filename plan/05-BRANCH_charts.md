# Feature: WP19 — Complétion charts (gap Highcharts) [sous-WP dataviz]

## Objective
Compléter la couverture des types de charts du DS vers le catalogue de référence **Highcharts**
(https://www.highcharts.com). DS actuel = 34 charts ; Highcharts ≈75 types → **~37 manquants
(~22 prioritaires)**. Sous-WP de la couche dataviz (WP15). Recensement + gap : `docs/charts-highcharts-gap.md`.
Tous en SVG custom + parité tri-framework, réutilisant axes/`chartScale`/`chartContrast`/`GraphLegend`.
Statut dans les sous-bullets (PAS dans les titres → import idempotent).

## Scope / Guardrails
- Réutiliser les primitives existantes (échelles, contraste, légende) ; parité svelte=react=vue stricte.
- 3D et indicateurs techniques (sma/ema/macd…) HORS scope.
- Charts différenciateurs DS conservés (ForceGraph, Marimekko, CalendarHeatmap, Bump, Chord, ParallelCoords, Violin).

## Plan / Todo (lot-based)
- [x] **Lot CHART-MVP — 12 charts prioritaires**
  - columnrange, arearange, dumbbell, bellcurve, errorbar, ohlc, hollow-candlestick, streamgraph,
    dependencywheel, organization (org-chart), xrange/Gantt, timeline. Maximise valeur BI/finance/réseau/planning.
  - Fait : 12/12 ✓ — columnrange, arearange, dumbbell, errorbar, bellcurve, ohlc, hollow-candlestick,
    streamgraph, dependencywheel, organization, gantt (xrange), timeline. MVP charts complet.
  - Secondaires livrés (vague 2) : heikinashi (finance), arcdiagram + treegraph (réseau/hiérarchie),
    variablepie (ranges). Vague 3 (CHART-RANGES bouclé) : areasplinerange, columnpyramid, polygon,
    tilemap. → 20 charts WP19 au total. Restent : hlc, item, wordcloud, venn/euler + maps + niche.
- [x] **Lot CHART-RANGES — core ranges & variantes**
  - columnrange, arearange, areasplinerange, dumbbell, columnpyramid, variablepie, polygon. Effort faible (axes existants). ✓ 7/7 livrés.
- [x] **Lot CHART-STATS — statistique** ✓ bellcurve, errorbar livrés/publiés.
  - bellcurve, errorbar (complètent BoxPlot/Histogram/Violin).
- [x] **Lot CHART-FINANCE — financier** ✓ ohlc, hlc, hollowcandlestick, heikinashi livrés/publiés.
  - ohlc/hlc, hollowcandlestick, heikinashi (réutilisent CandlestickChart). renko/pointandfigure/flags = différé.
- [x] **Lot CHART-NETWORK — réseau/flux** ✓ streamgraph, dependencywheel, arcdiagram, organization, treegraph livrés/publiés.
  - streamgraph, dependencywheel, arcdiagram, organization, treegraph (voisins Sankey/Chord/ForceGraph).
- [x] **Lot CHART-PLANNING — planning & spécialisés** ✓ gantt, timeline, item, wordcloud, venn, tilemap livrés/publiés.
  - xrange/Gantt (priorité projet), timeline, item (parlement), wordcloud, venn/euler, tilemap.
- [ ] **Lot CHART-MAPS — surcouches GeoMap**
  - mapline, mappoint, mapbubble, flowmap, geoheatmap, tiledwebmap (fond OSM tuilé).
- [ ] **Lot CHART-NICHE — différable**
  - windbarb, vector, contour, pictorial, variwide, pyramid, renko, pointandfigure, flags, 3D.
- [ ] **Lot CHART-DATAVIZ-FR — « classe Highcharts » (demande dataviz, tri-fw, props sur charts existants)**
  - FR-1 annotations ✓ (point/label/line/region/shape sur Line/Area/Bar, publié 0.34.23/0.36.24).
    FR-2 data labels ✓ (dataLabels sur Bar/Line/Area/Donut/Stacked, publié 0.34.24/0.36.25).
    FR-3 crosshair contrôlé ✓ (hoverKey/onHoverKeyChange, publié 0.34.25/0.36.26).
    FR-4 légende interactive ✓ (hiddenSeries/onToggleSeries sur StackedBar/Combo, publié 0.34.26/0.36.27).
    FR-5 a11y datapoint-nav ✓ (roving tabindex + sélection clavier sur Bar/Line/Area, publié 0.34.27/0.36.28).
    → FR-1..5 COMPLETS et publiés. Reste lot 2 = étendre ces 5 props aux autres charts à séries
    (Scatter, OHLC/Candle, Combo, etc.) selon priorités dataviz.

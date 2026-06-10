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
- [ ] **Lot CHART-RANGES — core ranges & variantes**
  - columnrange, arearange, areasplinerange, dumbbell, columnpyramid, variablepie, polygon. Effort faible (axes existants).
- [ ] **Lot CHART-STATS — statistique**
  - bellcurve, errorbar (complètent BoxPlot/Histogram/Violin).
- [ ] **Lot CHART-FINANCE — financier**
  - ohlc/hlc, hollowcandlestick, heikinashi (réutilisent CandlestickChart). renko/pointandfigure/flags = différé.
- [ ] **Lot CHART-NETWORK — réseau/flux**
  - streamgraph, dependencywheel, arcdiagram, organization, treegraph (voisins Sankey/Chord/ForceGraph).
- [ ] **Lot CHART-PLANNING — planning & spécialisés**
  - xrange/Gantt (priorité projet), timeline, item (parlement), wordcloud, venn/euler, tilemap.
- [ ] **Lot CHART-MAPS — surcouches GeoMap**
  - mapline, mappoint, mapbubble, flowmap, geoheatmap, tiledwebmap (fond OSM tuilé).
- [ ] **Lot CHART-NICHE — différable**
  - windbarb, vector, contour, pictorial, variwide, pyramid, renko, pointandfigure, flags, 3D.

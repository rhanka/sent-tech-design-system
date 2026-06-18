# Recensement charts — DS vs Highcharts (gap & complétion)

Source : https://www.highcharts.com (core + Stock + Maps + Gantt). Deep-research opus 2026-06-10.
Les charts du DS sont en **SVG custom** (aucune dép d3/echarts), **parité tri-framework**.

## DS actuel — 34 charts
AreaChart · BarChart · BoxPlotChart · BulletChart · BumpChart · CalendarHeatmapChart ·
CandlestickChart · ChordDiagram · ComboChart · DivergentBarChart · DonutChart · ForceGraph ·
FunnelChart · GaugeChart · GeoMap · HeatmapChart · HistogramChart · LineChart · LollipopChart ·
MarimekkoChart · PackedBubblesChart · ParallelCoordinatesChart · ParetoChart · RadarChart ·
RoseChart · SankeyChart · ScatterPlot · Sparkline · StackedBarChart · StepLineChart ·
SunburstChart · TreemapChart · ViolinChart · WaterfallChart.

## Highcharts ≈75 types distincts → gap initial (révisé après audit GeoMap et Wave B)

### État WP19 clos
- **Ranges** : columnrange, arearange, areasplinerange, dumbbell, columnpyramid, variablepie, polygon livrés.
- **Statistique** : bellcurve, errorbar livrés.
- **Financier** : ohlc/hlc, hollowcandlestick, heikinashi, renko, pointandfigure livrés.
- **Réseau/flux** : streamgraph, dependencywheel, arcdiagram, organization, treegraph livrés.
- **Planning/spécialisés** : xrange/**Gantt**, timeline, item, wordcloud, venn/euler, tilemap livrés.
- **Maps** : `mapline`, `mappoint`, `mapbubble`, `flowmap`, `geoheatmap` couverts via `GeoMap`.
- **Niche Wave B** : windbarb, vector field, contour/isolines livrés.
- **Rebaselinés hors WP19** : `tiledwebmap` (fond raster/provider réseau), pictorial, flags, 3D.

### Niche / rebaseliné
- Livrés Wave B : windbarb, vector field, contour/isolines, renko, pointandfigure.
- Déjà couverts/voisins DS : columnpyramid, variablepie, polygon, variwide (Marimekko proche), pyramid (Funnel proche).
- Hors scope WP19 : pictorial (illustratif), flags (annotation stock spécifique), 3D (scatter3d/cylinder/funnel3d/pyramid3d).

### Maps déjà couvertes via `GeoMap` (équivalents fonctionnels)
- `mapline` → couche `geojson` avec géométries `LineString` / `MultiLineString`.
- `mappoint` → couche `points`, ou `geojson` avec `Point` / `MultiPoint` si la donnée arrive déjà en GeoJSON.
- `mapbubble` → couche `points` avec rayon drivé par `value` (`minRadius` / `maxRadius`) ou `r` explicite.
- `flowmap` → couche `flow`.
- `geoheatmap` → couche `density` ; `hexbin` couvre l'alternative agrégée par cellules.
- `tiledwebmap` reste hors couverture : `GeoMap` est un rendu SVG pur, sans provider ni fond raster/tuilé.
- Parité constatée sur ces équivalents en Svelte / React / Vue ; Angular aligne désormais le même rendu cartographique SVG tokenisé et la même liste de valeurs accessible.

### Acceptation WP19 — GeoMap
- Accepté pour clôture DS : `GeoMap` couvre fonctionnellement les surcouches Highcharts Maps `mapline`, `mappoint`, `mapbubble`, `flowmap` et `geoheatmap` en rendu SVG pur.
- `tiledwebmap` est formellement **hors scope WP19** : dépend d'un provider, d'URL de tuiles et potentiellement d'accès réseau ; ce n'est pas compatible avec la surface DS purement SVG/tokenisée.

### Différenciateurs DS (pas d'équivalent HC direct)
ForceGraph, MarimekkoChart, CalendarHeatmapChart (style GitHub), BumpChart (rankings),
ParallelCoordinatesChart, ChordDiagram, ViolinChart, StepLineChart, DivergentBarChart, ComboChart.

## MVP recommandé — 12 charts
columnrange · arearange · dumbbell · bellcurve · errorbar · ohlc · hollow-candlestick ·
streamgraph · dependencywheel · organization (org-chart) · **Gantt/xrange** · timeline.
→ Maximise la valeur (intervalles BI, suite stats, finance OHLC, flux/réseau, planning Gantt) en
réutilisant les primitives existantes (axes, `chartScale`, `chartContrast`, `GraphLegend`).
Parité tri-framework comme les 34 existants.

## Ordre de complétion réalisé

Lots MVP → ranges/stat/finance/network/planning → validation maps (`GeoMap` clos, `tiledwebmap` hors scope) → niche Wave B. WP19 est clos dans track.

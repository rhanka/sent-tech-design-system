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

## Highcharts ≈75 types distincts → ~37 manquants (~22 prioritaires)

### Manquants prioritaires (forte valeur)
- **Ranges** (core, effort faible) : columnrange, arearange, areasplinerange, dumbbell.
- **Statistique** : bellcurve, errorbar.
- **Financier** : ohlc/hlc, hollowcandlestick, heikinashi.
- **Réseau/flux** : streamgraph, dependencywheel, arcdiagram, organization, treegraph.
- **Planning/spécialisés** : xrange/**Gantt** (pièce stratégique), timeline, item (parlement), wordcloud, venn/euler, tilemap.
- **Maps** (surcouches GeoMap) : mapline, mappoint, mapbubble, flowmap, geoheatmap, tiledwebmap.

### Niche / différable
windbarb, vector, contour, pictorial, variwide (Marimekko proche), pyramid (Funnel proche),
columnpyramid, variablepie, polygon, renko, pointandfigure, flags, 3D (scatter3d/cylinder/funnel3d/pyramid3d).

### Différenciateurs DS (pas d'équivalent HC direct)
ForceGraph, MarimekkoChart, CalendarHeatmapChart (style GitHub), BumpChart (rankings),
ParallelCoordinatesChart, ChordDiagram, ViolinChart, StepLineChart, DivergentBarChart, ComboChart.

## MVP recommandé — 12 charts
columnrange · arearange · dumbbell · bellcurve · errorbar · ohlc · hollow-candlestick ·
streamgraph · dependencywheel · organization (org-chart) · **Gantt/xrange** · timeline.
→ Maximise la valeur (intervalles BI, suite stats, finance OHLC, flux/réseau, planning Gantt) en
réutilisant les primitives existantes (axes, `chartScale`, `chartContrast`, `GraphLegend`).
Parité tri-framework comme les 34 existants.

## Ordre de complétion : Lots 1-4 (MVP) → Lot 6 (maps) → Lot 5 restant → niche.

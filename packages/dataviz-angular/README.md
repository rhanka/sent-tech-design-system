# `@sentropic/dataviz-angular`

Angular adapter for `@sentropic/dataviz-core`, built against
`@sentropic/design-system-angular`.

Scope is still a subset of the Vue/React/Svelte adapters. **57 of 119** ported,
62 remaining — `node tools/dataviz-angular-port/classify.mjs` prints the count and
how much of the remainder the generator can read:

- signal-based bridge for the core dashboard store
  (`createDashboard`, `toSignalStore`, `provideDashboard`, `injectDashboard`)
- categorical and part-of-whole charts: `AreaChart`, `ColumnPyramidChart`,
  `DateHistogramChart`, `DonutChart`, `FunnelChart`, `MekkoChart`,
  `PackedBubbleChart`, `RoseChart`, `SunburstChart`, `TreemapChart`,
  `VariablePieChart`, `WaffleChart`, `WaterfallChart`
- flow, hierarchy and relation charts: `ArcDiagramChart`,
  `DecompositionTreeChart`, `DependencyWheelChart`, `FlamegraphChart`,
  `OrganizationChart`, `SankeyChart`, `TreegraphChart`
- distribution and gauge charts: `BellCurveChart`, `ContourChart`,
  `Density2DChart`, `GaugeChart`, `SolidGaugeChart`, `ViolinChart`
- time and state charts: `BumpChart`, `GanttChart`, `StateTimelineChart`,
  `StatusHistoryChart`, `StreamgraphChart`, `TimelineChart`
- range charts: `AreaRangeChart`, `AreaSplineRangeChart`, `ColumnRangeChart`,
  `DumbbellChart`
- OHLC-family charts: `CandlestickChart`, `HeikinAshiChart`,
  `HollowCandlestickChart`, `HLCChart`, `OHLCChart`, `RenkoChart`
- distribution and relation charts: `HeatmapChart`, `ScatterPlot`
- geo maps: `ChoroplethMap`, `GeoClusterMap`, `GeoDensityMap`, `GeoFlowMap`,
  `GeoHexbinMap`, `GeoJsonMap`, `GeoPointMap`
- controls: `QueryBar`, `DashboardFilterBar`, `DateRangeFilter`
- panels: `KpiCardGroup`, `RecordsTable`, `SelectionLegend`

Every adapter keeps the prop names and types of its Vue/React counterpart and
delegates all rendering to a `@sentropic/design-system-angular` component.
[`PATTERN.md`](./PATTERN.md) is the recipe, the trap list and the debt ledger;
`tools/dataviz-angular-port/` generates a new lot from descriptors, and
`tools/dataviz-angular-parity/` measures the result against the React adapters.

## Current packaging seam

`@sentropic/design-system-angular` provides the real Angular DOM these wrappers
render. Consumers must load the DS CSS once:

```ts
import '@sentropic/design-system-angular/styles.css';
```

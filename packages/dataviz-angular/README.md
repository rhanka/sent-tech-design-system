# `@sentropic/dataviz-angular`

Angular adapter for `@sentropic/dataviz-core`, built against
`@sentropic/design-system-angular`.

Scope is still a subset of the Vue/React/Svelte adapters. Ported so far:

- signal-based bridge for the core dashboard store
  (`createDashboard`, `toSignalStore`, `provideDashboard`, `injectDashboard`)
- charts: `AreaChart`, `DateHistogramChart`, `DonutChart`, `HeatmapChart`,
  `ScatterPlot`, `TreemapChart`
- controls: `QueryBar`, `DashboardFilterBar`, `DateRangeFilter`
- panels: `KpiCardGroup`, `RecordsTable`, `SelectionLegend`

Every adapter keeps the prop names and types of its Vue/React counterpart and
delegates all rendering to a `@sentropic/design-system-angular` component.
[`PATTERN.md`](./PATTERN.md) is the recipe (and the trap list) for porting the
next ones.

## Current packaging seam

`@sentropic/design-system-angular` provides the real Angular DOM these wrappers
render (`Search`, `BarChart`, `AreaChart`, `DonutChart`, `HeatmapChart`,
`ScatterPlot`, `TreemapChart`, `DataTable`, `DatePicker`, `KpiCard`, `Inline`,
`SelectionChip`, `Select`, `MultiSelect`, `Button`, `FilterBar`, `FilterPill`).
Consumers must load the DS CSS once:

```ts
import '@sentropic/design-system-angular/styles.css';
```

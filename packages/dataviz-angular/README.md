# `@sentropic/dataviz-angular`

Angular adapter for `@sentropic/dataviz-core`, built against
`@sentropic/design-system-angular`.

Current scope is intentionally narrow:

- signal-based bridge for the core dashboard store
- `QueryBar`
- `DateHistogramChart`

## Current packaging seam

`@sentropic/design-system-angular@0.37.1` contains real Angular `Search` and
`BarChart` DOM for the dataviz `QueryBar` and `DateHistogramChart` wrappers.
Consumers must load the DS CSS once:

```ts
import '@sentropic/design-system-angular/styles.css';
```

# SPEC EVOL WP20 - Dataviz FR: Heatmap sequential scale + DashboardGrid edit-mode

## Context

WP20 was restored from the Claude handover as a follow-up dataviz feature request:

- `HeatmapChart`: add `scale?: "categorical" | "sequential"` and a continuous DS-encapsulated ramp.
- `DashboardGrid`: add a canvas edit mode with `columns` and `tiles { id, x, y, w, h }`, plus `editable` and `onLayout`.
- Third FR dataviz: recovered through the h2a/dataviz follow-up and handled as the sequential
  heatmap-like extension tracked with WP20.

This EVOL spec is the canonical WP20 contract. The execution plan is recorded in
`plan/07-BRANCH_wp20_dataviz_fr.md`; track owns the realization state.

## Decisions

### D1 - Heatmap scale is backward compatible

`HeatmapChart` keeps the current categorical behavior by default.

API:

```ts
type HeatmapChartScale = "categorical" | "sequential";

type HeatmapChartProps = {
  data: HeatmapChartDatum[];
  label: string;
  scale?: HeatmapChartScale;
};
```

Rules:

- `scale` defaults to `"categorical"`.
- Existing `datum.tone` remains honored in categorical mode.
- In categorical mode, a datum without `tone` keeps the legacy value-derived fallback bucket so existing renders do not change unexpectedly.
- Sequential mode ignores `datum.tone` and maps finite values to 8 ordered intensity buckets.
- Non-finite values and flat domains fall back to bucket 1.
- Labels and DOM class families remain stable.

### D2 - Sequential ramp is DS-tokenized and private to HeatmapChart

The component exposes a private, theme-overridable ramp contract without local hex values.

Rules:

- Bucket classes remain `category1` to `category8` for DOM compatibility.
- Sequential mode adds modifier classes so CSS can switch the fill source without changing markup shape.
- The ramp is resolved through `--st-heatmapChart-ramp-1` ... `--st-heatmapChart-ramp-8`.
- Default ramp values are generated from DS semantic tokens, using one DS color source blended with the DS surface token from low to high intensity.
- No local hex values are introduced.
- Themes may override the private ramp variables before a future global `semantic.data.sequential*` token migration.
- Categorical mode continues to use `--st-semantic-data-category1` ... `--st-semantic-data-category8`.

### D3 - DashboardGrid is layout-first and data-driven

`DashboardGrid` is a reusable dashboard canvas primitive, not a chart engine.

API:

```ts
type DashboardGridTile = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  description?: string;
  value?: string;
};

type DashboardGridProps = {
  tiles: DashboardGridTile[];
  columns?: number;
  rowHeight?: number;
  gap?: number;
  editable?: boolean;
  label?: string;
  onLayout?: (tiles: DashboardGridTile[]) => void;
};
```

Rules:

- Coordinates are 0-based grid units.
- `columns` defaults to 12.
- `rowHeight` defaults to 88px.
- `gap` defaults to 16px.
- Normalization clamps every tile to `x >= 0`, `y >= 0`, `w >= 1`, `h >= 1`, `w <= columns`, and `x + w <= columns`.
- The input tile array is never mutated.
- The normalized output preserves input order.
- Collisions are allowed in WP20 v1 and render as CSS-grid overlays; collision solving is intentionally out of scope.
- The component renders accessible dashboard tiles with stable text fallback.

### D4 - Edit mode is progressive

The first edit mode provides practical layout mutation without committing to a full drag-and-drop framework.

Rules:

- When `editable=false`, tiles are static.
- When `editable=true`, each tile exposes move and resize controls.
- Controls are regular buttons, keyboard-accessible by default, with explicit labels.
- Move controls change one grid unit per activation.
- Resize controls change one grid unit per activation.
- The callback fires once per committed button activation.
- The callback receives the full normalized layout after every change, in stable input order.
- Per-framework event shape follows local conventions while preserving the same semantic API:
  - Svelte: `onLayout?: (tiles) => void`
  - React: `onLayout?: (tiles) => void`
  - Vue: `onLayout?: (tiles) => void`, plus a `layout` emit with the exact same payload
  - Angular: `@Input() onLayout?` and `@Output() layoutChange`; both receive the same normalized payload when both are provided

### D5 - Angular parity is in scope

WP20 must land across Svelte, React, Vue, and Angular because Angular components already exist for the dataviz family and AppShell/NavSystem exports are present.

Rules:

- No Svelte-only delivery for WP20.
- Exports must be added in every framework index.
- Angular selector for DashboardGrid is `st-dashboard-grid`.
- Angular Heatmap must expose the same `scale` input and no longer be API-only for this feature slice.
- Docs examples may initially show Svelte/React/Vue if the existing docs framework lacks Angular tabs, but the Angular package API must exist.

### D6 - Third FR discovery is closed

The third dataviz request was not implemented from guesswork: it was recovered through the
h2a/dataviz thread and closed in track before WP20 finalization.

Rules:

- Keep the recovered scope tied to the heatmap/sequential dataviz family.
- Do not expand WP20 into unrelated chart backlog items.
- Future dataviz requests must become separate WPs or child items.

## Acceptance

- Heatmap `scale` prop exists in Svelte/React/Vue/Angular.
- Sequential mode renders the same bucket classes from the same finite domain rules across all four frameworks.
- Sequential mode uses `--st-heatmapChart-ramp-*` variables and no local hex.
- DashboardGrid exists in Svelte/React/Vue/Angular.
- DashboardGrid has static layout, normalized coordinates, keyboard-accessible edit controls, and layout callback/output.
- All four framework package indexes export the new/updated public types.
- WP20 track may be marked done only once Heatmap sequential scale, DashboardGrid edit-mode, and the recovered third FR discovery/extension are closed.

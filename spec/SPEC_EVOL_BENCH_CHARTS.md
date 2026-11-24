# SPEC EVOL — BENCH-CHARTS: four bench-result charts as catalogue elements, readable on a phone, inline in a Focus dossier

Track: DS `01M81ZJ6Z9N86735R24Z2CWH7X`. Peer item (Focus kit side): `01M81ZHEJXAKVG024M3E1N68MJ`.
Requirements: `scratchpad/bench-charts/REQUIREMENTS.md` (owner need R15, 22/11, plus addendum).
Measured against `origin/main` at `54144e188` (elements `0.3.3`, design-system-svelte `0.45.0`, dataviz-core `0.5.0`).

Status marks used below: **[MEASURED]** read in the repository at that commit; **[JUDGMENT]** a choice made by this
spec; `unverified` / `unknown` a fact this spec could not establish from the repository.

---

## 1. Summary

Four new catalogue components, each a closed A2UI v0.9.1 entry with a custom element, on the `TimeSeriesChart`
(EZ-1) pattern:

| # | Owner need | Component / element | Primitive reused | Missing capability |
|---|---|---|---|---|
| 1 | Precision-recall scatter with iso-F1 curves | `PrecisionRecallChart` / `st-precision-recall-chart` | `ScatterPlot` | `curves` overlay (open polylines in data space), `xDomain` / `yDomain`, per-datum `marker` / `filled` / `labelPosition`, `yLabelPlacement`, `tooltip` switch |
| 2 | F1 vs cost, log x axis | `ScoreCostChart` / `st-score-cost-chart` | `ScatterPlot` | the row-1 list plus `xScale: "log"` on the x axis and `ChartCurve.variant` |
| 3 | Sorted recall, rank-curve style | `RankCurveChart` / `st-rank-curve-chart` | `LineChart` | rank preset (sort, rank, quantile summary) in `dataviz-core`; `tooltip` switch |
| 4 | Acceptance rate | `AcceptanceRateChart` / `st-acceptance-rate-chart` | `BulletChart` | optional `target`, `domain`, `intervals`, value labels, stacked-label layout, keyboard navigation, `tooltip` switch (§6.4); a rate preset in `dataviz-core` |

The full list of missing primitive capabilities, with the lot that delivers each, is in §13.

Cross-cutting work: a shared chart frame in elements that carries the `0.3.3` sizing rules (natural size, never
enlarged, `Tout voir`, `Plein écran`) over to charts through a natural-size wrapper (§7.1), a static SVG renderer
for the interim embedded attachment, literal fallbacks on the chart tokens, and the Focus-side inline hook.

Total effort: **23.0 person-days** over 7 lots (§14). Lots B1–B3 deliver the four charts as an embedded SVG in a
dossier (11.0 days); the inline target needs the peer item.

## 2. Scope

In scope: the four contracts, their validators, text fallbacks, elements, the primitive capabilities listed in §13, the
`dataviz-core` presets, the chart frame, the static SVG renderer, the kit change that previews an SVG attachment, the
catalogue / skill / `ui://` projection, tests, and the 4-framework alignment of the primitive capabilities.

Not covered:

- The Focus document schema. The inline node kind is owned by `@sentropic/focus` (pinned `0.6.0` in elements
  **[MEASURED]**), outside this repository. This spec states what the DS consumes (§9.2), not the schema.
- Computing precision, recall, F1, cost or acceptance from raw bench output. The producer sends final numbers.
- Trend of a rate over time: `TimeSeriesChart` already covers it.
- Interaction beyond hover, keyboard navigation and the sizing controls (no brushing, no cross-filter).
- `mode: "preview"` itself: it is reserved by the render standard §10.3 and refused today (§11).

## 3. Starting point [MEASURED]

- `packages/dataviz-svelte/src/lib/ScatterPlot.svelte` is a store-bound adapter: it calls `buildScatterModel`
  (`packages/dataviz-core/src/scatter.ts`) and renders the design-system `ScatterPlot`
  (`packages/components-svelte/src/lib/ScatterPlot.svelte`). The chart capabilities live in `components-*`, the data
  shaping in `dataviz-core`, the store binding in `dataviz-*`.
- `ScatterPlot` props: `data` (`x`, `y`, `label?`, `tone?`, `r?`), `centroids`, `annotations`, `dataLabels`,
  `hoverKey`, `keyboardNav`, `xLabel`, `yLabel`, default size 480 × 280. Both axes are linear only; there is no
  `domain` prop; ticks come from a local `niceTicks`. A datum carries only `tone` and `r`: no marker shape, no
  filled / hollow variant. There is no legend. The y-axis title is rotated (`rotate(-90 …)`). Hover shows a floating
  tooltip; `hoverKey` / `onHoverKeyChange` / `onSelectKey` exist.
- `ScatterPlot`, `LineChart` and `BulletChart` are fluid: the root is `width: 100%` and the plot is
  `<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">`, with a
  second navigation-overlay SVG and a tooltip `<div>` beside it. The `width` / `height` props set the viewBox, not a
  pixel size. `time-series-chart.svelte` is fluid too. So the chart root has no direct child SVG with pixel
  `width` / `height` attributes, and a `> svg` selector on a frame does not reach the plot.
- `ChartAnnotation` (`chartAnnotations.ts`) has `point`, `label`, `line`, `region`, `shape`. `shape` is a **closed**
  polygon; there is no open curve. `ChartAnnotationMarker` is circle / square / diamond: no triangle. `line` and
  `region` take `axis: "x" | "y"`.
- `ChartScale = "linear" | "log"` exists on `LineChart` and `BarChart`, on the **value (y) axis only**. `LineChart`
  is single-series, accepts numeric `x`, `xDomain`, `domain`, `referenceLines`, `bands`, `goalLine`,
  `annotations`. `bands` cover the value axis only. `keyboardNav` walks the data points. The log helpers
  (`logTicks`, `fixedLogTicks`, `smallestPositive`) are **local copies** inside `LineChart` and inside `BarChart`,
  in every component package; they emit power-of-ten ticks only.
- `BulletChart` takes `data: { label, value, target, ranges? }[]`: `target: number` is **required** (a datum with
  a non-finite target is skipped), the domain is derived from the data (no domain prop), there are no interval
  whiskers and no value text at the bar end, the label margin is fixed at 80 px (no label-above layout), the tooltip
  prints `value: … / target: …`, and there is no `keyboardNav`. `GaugeChart` shows one value with thresholds.
  `ReferenceLineChart` and `Sparkline` exist in the dataviz packages; `ScatterPlot`, `LineChart`, `BulletChart`,
  `GaugeChart`, `Sparkline` exist in the Svelte, React, Vue and Angular component packages.
- Elements contracts: `src/contracts/time-series-chart.ts` declares the props interface with JSDoc bounds
  (`@minLength`, `@minItems`, `@asType integer`, `@minimum`, `@maximum`) and a `ContractModule` with
  `metadata: { contract: "1.0", element, engine: "core", events: [], fallback: "text" }`; the three non-Svelte
  frameworks are `no-counterpart`. Cross-record rules live in `src/validate/time-series.ts`. The text fallback is
  `formatTimeSeriesMarkdown` with `TIME_SERIES_FALLBACK_LIMIT_BYTES = 4096`; it **throws** when the table exceeds it.
- Focus kit sizing in `0.3.3` (`dossier-page.css`, `engines/dossier-diagrams.ts`,
  `tests/dossier-diagram-sizing.test.ts`): `.st-dossier__diagramViewport > svg { width: auto; max-width: 100%;
  height: auto }`, explicit `width` / `height` / `viewBox` on the SVG, `touch-action: pinch-zoom`, a `Tout voir`
  toggle (`data-view-all="true"`, `max-height: 70vh`, no scroll), `Plein écran` offered while view-all stands, a
  fixed-overlay fallback when the Fullscreen API is absent, Escape leaves fullscreen then view-all, `aria-pressed`
  on both buttons, no animation, and `print` as the only media query. The browser suite measures at 390, 820 and
  1280 px.
- Token fallbacks: `0.3.3` added light literals in `dossier-page.css`, `engines/dossier.css` and
  `time-series-chart.svelte` only. `ScatterPlot.svelte` still uses `var(--st-semantic-text-secondary)` and
  `var(--st-semantic-data-category1..8)` with **no literal fallback**.
- Focus dossier node kinds rendered by the kit: `prose`, `diagram`, `question`, `option`, `optionSet`, `outcome`,
  `amendmentTrace`. There is no chart kind; an unknown kind renders as a `st-dossier__unknownSection` text box.
  Evidence sources preview `image/png` and `image/jpeg` through `<img>`; any other media type, `image/svg+xml`
  included, is printed as decoded text in a `<pre>`.
- Render standard: closed schemas (`unevaluatedProperties: false`), envelope ≤ 1 MiB, `render` text `content`
  ≤ 4 KiB, resource `ui://sentropic/render/v1` with the per-component fallback `ui://sentropic/<id>/v1` and tool
  `render_<id>`, `mode: "preview"` refused with `unsupported-mode`, `tool-input-partial` ignored. §8.2 defines the `render` text `content` as a text
  summary (component, counts, validation result), not as a data table.
- `appendDossierEvidence` appends sources to the evidence list at the dossier root, not inside the section that
  cites them.

## 4. Decisions [JUDGMENT]

- **D1 — Domain-named contracts over generic primitives.** The catalogue gets four small closed contracts named
  after the bench reading, not a generic "scatter with options" entry. A producer fills five fields per point and
  cannot mis-set an axis. The generic capabilities (`curves`, `xScale`) land in the primitives, where other charts
  reuse them.
- **D2 — `curves` is a `ScatterPlot` prop, not a new `ChartAnnotation` kind.** Extending the shared union would
  change the catalogued `BarChart` `annotations` schema and force a `BarChart` contract minor. Rejected for this lot.
- **D3 — The element computes derived values.** F1 is computed from precision and recall by the element and the
  fallback, never sent. Ranks are computed from values. An accepted/total pair gives the rate. One source of each
  number, so the plot and the table cannot disagree.
- **D4 — The text fallback never throws.** Unlike `formatTimeSeriesMarkdown`, the four formatters are total: they
  emit a summary line, then rows in a fixed order while the budget holds, then one trailer row giving the omitted count (§5.4). A rank
  curve of 300 items must still render. This diverges from EZ-1 on purpose; see open question Q2.
- **D5 — Layout tiers instead of scaling.** A chart is laid out at one of three fixed natural widths and is never
  scaled above 1. This is how "never enlarged" and phone readability hold together (§7).
- **D6 — No animation**, as in the `0.3.3` kit; reduced motion needs no override.

## 5. Common contract rules

### 5.1 Shape

Each component follows `time-series-chart.ts`: one props interface with JSDoc bounds in
`packages/elements/src/contracts/<id>.ts`, a `ContractModule` registered in `contracts/index.ts`, generated
`schemas/<Name>.v1.json` and catalogue entry, `metadata: { contract: "1.0", engine: "core", events: [],
fallback: "text" }`. `events` is empty: hover and keyboard navigation stay local, as for `TimeSeriesChart`.

Every object is closed (`additionalProperties: false`, `unevaluatedProperties: false` on the component). Every array
has `minItems` and `maxItems`; every string has `minLength` and `maxLength`; every number is finite with `minimum`
and `maximum`. No property carries markup, a URL, a colour or a pixel size: theme and size belong to the host and the
frame (render standard §4.1, §6.5).

### 5.2 Shared types

```ts
/** Stable identifier, unique within the chart. @minLength 1 @maxLength 64 @pattern ^[A-Za-z0-9._:-]+$ */
type BenchId = string;
/** Human-readable name. @minLength 1 @maxLength 80 */
type BenchLabel = string;
/** A proportion. @minimum 0 @maximum 1 */
type UnitInterval = number;
/** An iso-F1 level, strictly inside (0, 1). @exclusiveMinimum 0 @exclusiveMaximum 1 */
type IsoF1Level = number;
/** Optional grouping; drives the categorical tone (category1..8) in first-appearance order. */
interface BenchGroup { id: BenchId; label: BenchLabel }   // groups: @maxItems 8
```

Bounds on array items are carried by **typed aliases** (`values: UnitInterval[]`, `isoF1: IsoF1Level[]`), never by a
JSDoc sentence on a `number[]`: `ts-json-schema-generator` emits item bounds only from the item type. A contract
test asserts, on each generated schema, that `items` of these arrays carries the expected `minimum` / `maximum` /
`exclusiveMinimum` / `exclusiveMaximum` (§15).

Tones are never set by the producer. A point references a group by `groupId`; the element assigns
`category1..category8` in `groups` order and adds a distinct marker shape per group (circle, square, diamond,
triangle, then repeated with a hollow variant), so a group is never told apart by colour alone. Marker shape and
the hollow variant are **missing in `ScatterPlot`** today (§3): they are the per-datum `marker` and `filled`
capabilities of §6.1. `ScoreCostChart` uses `filled` for the frontier, so there its groups cycle through the four
shapes only (groups 5–8 repeat a shape and differ by colour and by the legend order; stated in the table caption).

### 5.3 Semantic validation

One validator per component in `src/validate/`, returning the standard diagnostic shape
(`code: "semantic-invalid"`, JSON Pointer `path`, `source: "catalog"`): unique ids, `groupId` resolves, and the
per-chart rules listed in §6. An invalid envelope renders the error panel, never a blank or partial chart.

### 5.4 Text fallback (≤ 4 KiB, deterministic, total)

Two exported pure functions per component, no locale, no clock: `format<Name>Summary(props): string` (one line) and
`format<Name>Markdown(props): string` (the summary line, one blank line, then the table):

0. The summary line follows render standard §8.2 (component, counts, validation result), for example
   `PrecisionRecallChart "<label>": 12 points, 3 groups; valid.` It is bounded by the schema bounds to ≤ 512 UTF-8
   bytes. It is produced only for a valid envelope; an invalid one yields diagnostics (§11).
1. The table starts with a fixed header row, then the separator, then zero or more summary rows defined per chart.
2. Data rows follow in the **canonical order** stated per chart, cells escaped with the EZ-1 `markdownCell` rule.
3. Numbers print with a fixed format: proportions as `0.000` (three decimals, half-even on the decimal string),
   costs with up to 4 significant digits, counts as integers. No thousands separator.
4. The 4096-byte budget covers the **whole output**: summary line, blank line and table. A row is appended only if
   the whole output plus that row plus the trailer stays ≤ 4096 UTF-8 bytes. When at least one row is left out, the
   last line is `| … | <n> rows omitted |` padded to the column count.
5. Header, separator, summary rows and trailer together are bounded by the schema bounds to ≤ 2560 bytes in the worst
   case (four rank-curve summary rows, every label at `maxLength` and fully escaped); with the summary line and the
   blank line the fixed part is ≤ 3073 bytes, so the formatter always returns a valid output within the limit.

The same rows, in the same order and number format, feed the accessible HTML table of the element, which is not
truncated. The MCP `render` text `content` is the output of `format<Name>Markdown`: the §8.2 summary line first,
then the table as additional text, both inside the ≤ 4 KiB limit. Render standard §8.2 only requires the summary;
appending the table is a choice of this spec **[JUDGMENT]** and needs no change in the h2a module as long as the
4 KiB limit holds.

## 6. The four charts

### 6.1 `PrecisionRecallChart` — precision-recall scatter with iso-F1 curves

**Contract.**

```ts
interface PrecisionRecallPoint {
  id: BenchId;
  label: BenchLabel;
  precision: UnitInterval;
  recall: UnitInterval;
  groupId?: BenchId;
}
interface PrecisionRecallChartProps {
  label: BenchLabel;                       // chart name and accessible name
  /** @minItems 1 @maxItems 200 */
  points: PrecisionRecallPoint[];
  /** @maxItems 8 */
  groups?: BenchGroup[];
  /** Iso-F1 levels, strictly increasing. Default [0.2, 0.4, 0.6, 0.8]. @maxItems 9 */
  isoF1?: IsoF1Level[];
  /** "unit" = both axes [0, 1] (default). "fit" = tight domain around the points. */
  domain?: "unit" | "fit";
}
```

Semantic rules: unique point ids; `groupId` resolves; `isoF1` strictly increasing. A point with precision and recall
both 0 is valid (F1 = 0).

**Rendering.** x = recall, y = precision, equal-length axes (square plot), so an iso-F1 curve keeps its familiar
shape. With `domain: "fit"`, each axis runs from the minimum value rounded down to the nearest 0.05 to the maximum
rounded up to the nearest 0.05, at least 0.10 wide, and both axes share the same span; an axis-break mark is drawn
at any axis origin above 0 and the table caption states the domain.

**Missing capabilities — iso curves overlay, domains, markers.**

- `dataviz-core`: `isoF1Curve(level, domain, samples = 64): { x: number; y: number }[]`. For F1 = `f`, precision
  `p = f·r / (2r − f)` for recall `r` in `(f/2, 1]`. Samples are spaced evenly in **pixel-relevant** terms: half by
  recall, half by precision, merged and sorted, so the steep branch near `r → f/2` is not under-sampled. Points
  outside the domain are clipped at the domain edge by linear interpolation. Pure and deterministic.
- `ScatterPlot`: new optional prop `curves?: ChartCurve[]`,
  `ChartCurve = { points: { x: number; y: number }[]; label?: string; labelAt?: "start" | "end";
  variant?: "reference" | "emphasis" }`. Drawn as an open `<path>` behind the points, in a dedicated
  `<g class="st-scatterPlot__curves">`, `aria-hidden`, never part of the hover or keyboard order, never folded into
  the axis domain. The label sits at the chosen end, inside the plot. `variant: "reference"` (default) is neutral,
  dashed, 1 px (`--st-semantic-border-default`): the iso curves. `variant: "emphasis"` is solid, 2 px,
  `--st-semantic-text-primary`: the frontier of §6.2. Both variants share every other rule above.
- `ScatterPlot`: new optional props `xDomain?: [number, number]` and `yDomain?: [number, number]` (same semantics as
  `LineChart.domain`), needed for the fixed `[0, 1]` axes.
- `ScatterPlot` datum: new optional `marker?: "circle" | "square" | "diamond" | "triangle"` (default `"circle"`,
  unchanged) and `filled?: boolean` (default `true`, unchanged; `false` draws the outline in the tone over the
  surface colour). The hit target and the focus ring are the same for every shape. Four frameworks (§13).

Iso curves use `variant: "reference"` and are labelled `F1 0.8` at their upper end.

**Behaviours assigned between primitive and element.** None of these exists in `ScatterPlot` today (§3); each has
one owner:

| Behaviour | Owner | Mechanism |
|---|---|---|
| Legend (groups, plus the single `F1` entry) | element-owned layer | HTML list beside or below the plot inside the chart frame; glyphs drawn with the marker path helper exported by `components-svelte`, so legend and plot shapes are one geometry. No primitive legend. |
| Horizontal y-axis title | primitive prop | `yLabelPlacement?: "side" \| "top"` (`"side"` default = today's rotated title; `"top"` sets it horizontally above the axis and reserves the top margin). |
| Fixed read-out line in place of the tooltip | element-owned layer + primitive prop | The element renders the line under the plot from `onHoverKeyChange` / `onSelectKey` (existing). The primitive gets `tooltip?: boolean` (default `true`, unchanged) to switch the floating tooltip off; the crosshair and focus ring stay. Same prop on `LineChart` and `BulletChart`. |
| All-or-nothing label collision | element decides, primitive draws | `dataviz-core`: `placePointLabels(points, boxes, plot)` runs the collision test and returns one position per point or `null`. The primitive gets a per-datum `labelPosition?: "top" \| "right" \| "bottom" \| "left"` (default `"top"`) honoured by `dataLabels`; it runs no collision logic itself. |

**Point labels.** Direct labels are drawn only if a deterministic collision test passes for every point at the
current tier (label box against label boxes, points and plot edges, four candidate positions tried in a fixed
order; text widths come from a fixed per-character width table, so the result does not depend on the font actually
loaded). Otherwise every point shows its 1-based index in `points` order and the table carries the same `#` column.
All or nothing: never a mix of labelled and unlabelled points.

**Fallback.** Header `| # | Label | Group | Precision | Recall | F1 |`. Canonical order: F1 descending, then id
ascending. `#` is the index in `points` order, so it matches the plot.

### 6.2 `ScoreCostChart` — F1 vs cost on a logarithmic x axis

**Contract.**

```ts
interface ScoreCostPoint {
  id: BenchId;
  label: BenchLabel;
  /** Strictly positive cost in `costUnit`. @exclusiveMinimum 0 @maximum 1e12 */
  cost: number;
  /** The score (F1 by default). */
  score: UnitInterval;
  groupId?: BenchId;
}
interface ScoreCostChartProps {
  label: BenchLabel;
  /** @minItems 1 @maxItems 200 */
  points: ScoreCostPoint[];
  /** @maxItems 8 */
  groups?: BenchGroup[];
  /** Axis title of the score. Default "F1". @maxLength 24 */
  scoreLabel?: string;
  /** Unit printed on the cost axis and in the table, e.g. "USD per 1k items". @minLength 1 @maxLength 32 */
  costUnit: string;
  /** Draw the Pareto frontier (lowest cost for a given score or better). Default true. */
  frontier?: boolean;
}
```

Semantic rules: unique ids; `groupId` resolves. `cost > 0` is in the schema (`exclusiveMinimum`), so the log axis
never meets a non-positive value: nothing is clamped or dropped silently.

**Missing capability — log x axis.**

- **One log implementation, not a third.** The log helpers already exist as local copies in `LineChart` and
  `BarChart` in every component package (§3). They are extracted into one mirrored module per package,
  `chartScale.ts` (the `chartAnnotations.ts` pattern): `logTicks`, `fixedLogTicks`, `smallestPositive`, plus
  `scaleLog(v, d0, d1, r0, r1)` and `formatLogTick`. `LineChart`, `BarChart` and `ScatterPlot` all import it.
  No `logScale` / `logTicks` is added to `dataviz-core`.
- **`LineChart` and `BarChart` ticks do not change.** The extraction is behaviour-preserving: same power-of-ten
  ticks, same domain handling, same tick labels (their own `formatTick`), asserted by their existing snapshot tests
  passing unchanged. The two additions below are opt-in and used by `ScatterPlot` only.
- Tick rules on the `ScatterPlot` log axis: major ticks at powers of ten and the domain extended to the enclosing
  powers of ten, exactly as the existing helper does (a single-value domain spans the enclosing decade, as today).
  Opt-in `logTicks(min, max, { minor: true })`: when the domain spans less than two decades, ticks at 2 and 5 are
  added and labelled, and the domain is extended to the enclosing {1, 2, 5} mantissa ticks instead. Default
  `minor: false` returns today's output.
- `ScatterPlot`: new optional prop `xScale?: ChartScale` (`"linear"` default, unchanged). Under `"log"`, data with
  `x ≤ 0` is excluded from the plot and from the domain **and** listed in the accessible data list as "not plotted";
  `annotations`, `centroids` and `curves` are positioned through the same scale. `yScale` is not added (no need).
  The `ChartScale` type is reused from `LineChart` / `BarChart`.
- Tick labels on the `ScatterPlot` log axis use `formatLogTick` (compact notation: `0.001`, `0.01`, `0.1`, `1`,
  `10`, `100`, `1k`, `10k`, `1M`). The axis title is `Cost (<costUnit>, log scale)`: the scale type is always
  written.

**Frontier.** `dataviz-core`: `paretoFrontier(points, { minimize: "cost", maximize: "score" })` returns the ids on
the frontier ordered by cost **and the precomputed step points** (`steps: { x: number; y: number }[]` in data
space: from each frontier point horizontally to the next point's cost, then vertically to its score). The
primitive does no frontier maths. The element passes `steps` as one `ChartCurve` with `variant: "emphasis"`
(§6.1); under `xScale: "log"` the horizontal and vertical segments stay straight, so no resampling is needed.
Frontier points get `filled: true`, dominated points `filled: false` (§6.1). The table has a `Frontier` column
(`yes` / `no`).

**Fallback.** Header `| # | Label | Group | Cost (<costUnit>) | <scoreLabel> | Frontier |`. Canonical order:
frontier points first by cost ascending, then the others by score descending, then id.

### 6.3 `RankCurveChart` — sorted recall as a rank curve

**Contract.**

```ts
interface RankCurveSeries {
  id: BenchId;
  label: BenchLabel;
  /** One value per evaluated item, in any order. @minItems 1 @maxItems 2000 */
  values: UnitInterval[];
}
interface RankCurveChartProps {
  label: BenchLabel;
  /** @minItems 1 @maxItems 4 */
  series: RankCurveSeries[];
  /** Axis title of the value. Default "Recall". @maxLength 24 */
  valueLabel?: string;
  /** Noun for one ranked item, e.g. "query". Default "item". @maxLength 24 */
  itemLabel?: string;
  /** x axis: absolute rank (default) or rank as a share of the series length. */
  rankAxis?: "rank" | "percent";
}
```

Values carry no item identity on purpose: the curve shows a distribution, not a lookup, and 2000 ids would spend the
envelope and the table for nothing. Semantic rules: unique series ids; with `rankAxis: "rank"` and several series of
different lengths, a `warning` diagnostic recommends `"percent"` (the chart still renders).

**Missing capability — rank preset.** `dataviz-core`: `buildRankCurve(values, { axis })` sorts descending (stable,
ties keep input order), assigns ranks `1..n` (or `rank / n`), and returns the points plus a summary: `n`, `mean`,
`min`, `p10`, `median`, `p90`, `max` (quantiles by linear interpolation on the sorted values, method fixed and
documented) and `zeroCount`. No new `LineChart` capability beyond the shared `tooltip` switch (§6.1) and the literal fallbacks:
the element composes `LineChart` with `xDomain`, `domain: [0, 1]`, `smooth: false`, `referenceLines` and
`annotations`.

**Rendering.** One `LineChart` per series, **stacked as small multiples sharing both domains**, exactly as
`TimeSeriesChart` stacks its series — `LineChart` is single-series **[MEASURED]** and this lot does not add an
overlay mode. Each panel draws the curve as a step-free polyline (no point markers above 60 values), a `median`
reference line with its value, and a shaded band over the ranks where the value is 0 (the "missed" tail), labelled
with `zeroCount`. Mechanism: `LineChart` `bands` only cover the value axis (§3), so the tail is one `annotations`
entry `{ kind: "region", axis: "x", from: <first zero rank>, to: <last rank>, label: "<zeroCount> at 0" }`
(with `rankAxis: "percent"`, the same bounds as shares); it spans the full plot height and sits behind the curve.
No region is emitted when `zeroCount` is 0.

**Keyboard navigation of the summary marks.** `LineChart` `keyboardNav` walks data points, which is not what this
chart needs, so it stays **off**. The element owns the navigation: under each panel, a summary strip lists min,
P10, median, P90 and max as a roving-tabindex group (one tab stop per chart, arrows across marks and panels,
Home / End, Escape). Focusing a mark sets the panel's controlled `hoverKey` to the drawn vertex nearest to that
statistic, so the existing crosshair shows where it sits on the curve, and updates the read-out line. No
`LineChart` change. With up to 4 series the panels stay comparable because the y axis is fixed to `[0, 1]`.

Above 400 values per series the drawn path is decimated to at most 400 vertices by keeping, per pixel column, the
first, minimum, maximum and last value (order-preserving), so the visible outline is unchanged. The table and the
summary always use every value.

**Fallback.** Header `| Series | n | Mean | Min | P10 | Median | P90 | Max | Zeros |`, one summary row per series
(at most 4 rows, always present). No per-item rows: the summary is the fallback. The HTML table of the element shows
the same summary; a `<details>` below lists the sorted values per series for assistive and copy use.

### 6.4 `AcceptanceRateChart` — acceptance rate

**Contract.**

```ts
interface AcceptanceRateItem {
  id: BenchId;
  label: BenchLabel;
  /** @asType integer @minimum 0 @maximum 1000000000 */
  accepted: number;
  /** @asType integer @minimum 1 @maximum 1000000000 */
  total: number;
}
interface AcceptanceRateChartProps {
  label: BenchLabel;
  /** @minItems 1 @maxItems 24 */
  items: AcceptanceRateItem[];
  /** Target rate, drawn as the bullet target on every row. */
  target?: UnitInterval;
  /** Row order: as given (default) or by rate descending. */
  order?: "given" | "rate";
  /** Name of the accepted outcome in labels. Default "accepted". @maxLength 24 */
  acceptedLabel?: string;
}
```

Counts are sent, not a rate: the rate is `accepted / total` computed once, and the denominator is always shown.
Semantic rules: unique ids; `accepted ≤ total`.

**Primitive.** `BulletChart`, horizontal, one row per item, `value = rate`, `target = target`, no qualitative
`ranges` in v1.

**Missing capabilities in `BulletChart`** (§3; all additive and optional, absent ⇒ rendering unchanged; four
frameworks, §13):

| Capability | Addition |
|---|---|
| Optional target | `target?: number` on the datum. Absent ⇒ no target mark, the datum is still drawn (today it is skipped), and tooltip / data-list text omit the target part. |
| Fixed domain | `domain?: [number, number]` (same semantics as `LineChart.domain`); here `[0, 1]`. |
| Interval whiskers | `interval?: [number, number]` on the datum, drawn as a thin whisker with end caps on the bar, `aria-hidden`, clipped to the domain. |
| Value text at the bar end | `valueLabels?: boolean` with `valueText?: string` on the datum (the element supplies `82.5 % (330/400)`); placed after the bar end, or inside the plot edge when it would overflow. |
| Stacked-label layout | `labelPlacement?: "side" \| "above"` (`"side"` default = today's fixed 80 px margin; `"above"` puts the label, wrapped to two lines, over the bar and frees the left margin). |
| Keyboard navigation | `keyboardNav?`, `hoverKey?`, `onHoverKeyChange?`, `onSelectKey?`, with the same contract as `ScatterPlot` (roving focus over rows, visible focus ring). |
| Tooltip switch | `tooltip?: boolean` (§6.1). |
| Tick format | `tickFormat?: "number" \| "percent"` for the 0–100 % axis labels. |

`dataviz-core`: `buildAcceptanceRates(items, { order })` returns rate, the printed percentage and the Wilson 95 %
interval. The interval is passed as the datum `interval`, drawn as a thin whisker on the bar and printed in the table; it keeps a 3/4 from reading like a 300/400. One item renders as a
single bullet row, not as a gauge: the same reading at every count.

The value axis is fixed to `[0, 1]`, ticks at 0, 25, 50, 75, 100 %. Each row prints `82.5 % (330/400)` at the bar
end, in text, so the chart reads without the axis on a phone.

`GaugeChart` is not used: a dial costs height on a phone and compares poorly across rows. `ReferenceLineChart` and
`Sparkline` are not needed by these four charts.

**Fallback.** Header `| Label | Accepted | Total | Rate | 95 % interval | Target |`. Canonical order: the rendered
row order.

## 7. Sizing, phone readability, zoom and `Tout voir`

### 7.1 Layout tiers [JUDGMENT]

"Natural size, never enlarged" was defined for diagrams, whose natural size comes from their layout. A chart has no
intrinsic size, and a 640 px chart shrunk into a 342 px phone column would bring 11 px tick labels to 6 px. So each
chart declares **three fixed natural widths**, each a complete layout with text at design size:

| Tier | Natural width | Used when the available inline width is |
|---|---:|---|
| `compact` | 336 px | < 480 px |
| `regular` | 640 px | 480 px to < 960 px |
| `wide` | 960 px | ≥ 960 px (fullscreen only inside a dossier, whose column is 72ch) |

The table above gives the tier **thresholds** and the default width. The natural size actually used is per chart
(width × height, px); it is the only size the frame, the tests and the acceptance criteria refer to:

| Chart | `compact` | `regular` | `wide` |
|---|---:|---:|---:|
| `PrecisionRecallChart` (square) | 336 × 336 | 520 × 520 | 640 × 640 |
| `ScoreCostChart` | 336 × 280 | 640 × 400 | 960 × 520 |
| `RankCurveChart`, per panel (*p* panels stacked: height × *p*) | 336 × 200 | 640 × 240 | 960 × 280 |
| `AcceptanceRateChart`, *n* rows | 336 × (56 + 40 *n*) | 640 × (56 + 40 *n*) | 960 × (56 + 40 *n*) |

Legend, read-out line and table are outside these boxes. `PrecisionRecallChart` is the only chart narrower than
the tier default: it stays square, so its width is 520 px in `regular` and 640 px in `wide`.

Page context decides the tier, so each acceptance criterion names its page (§16):

| Viewport | Standalone page (shell) | Dossier page (72ch column) |
|---:|---|---|
| 390 px | `compact` | `compact` |
| 820 px | `regular` | `regular`, shrunk when the column is under the natural width |
| 1280 px | `wide` | `regular`: the 72ch column can be under 640 px, so the chart can render below its natural width; `wide` only in `Plein écran` |

Rules. They reach the same result as `0.3.3` (natural size, never enlarged) by a different mechanism, because the
primitives are fluid (§3): the plot SVG has `width="100%" height="100%"`, sits below the root beside an overlay SVG
and a tooltip `<div>`, and carries no pixel size. "Explicit `width` / `height` on the SVG" and a `> svg` selector
therefore do not apply to an inline chart.

- **Natural-size wrapper, no primitive change [JUDGMENT].** The chart frame renders
  `<div class="st-chartFrame__natural">` around the primitive and sets on it, inline from the tier,
  `width: <W>px; max-width: 100%; aspect-ratio: <W> / <H>`. The element passes the same `<W>` and `<H>` as the
  primitive's `width` / `height` props, so the viewBox equals the natural size and one viewBox unit is one CSS
  pixel at scale 1. The fluid primitive fills the wrapper; overlay SVG and tooltip follow, since they are positioned
  in the same box. The kit and frame CSS target `.st-chartFrame__natural` in place of `> svg`. The alternative, a
  pixel-size mode in each primitive, was rejected: it is a change in three primitives × four frameworks for the same
  result.
- The wrapper is never wider than `<W>`, so the chart is never scaled above 1; under the natural width it shrinks,
  and the tier switch at 480 px keeps the scale factor ≥ 0.70 for any container ≥ 236 px wide.
- The static SVG of §9.1 is the one case that does carry explicit `width` / `height` / `viewBox`; it is shown
  through `<img>` and sized by the `0.3.3` rule (`width: auto; max-width: 100%; height: auto`).
- The tier is chosen in script from the measured container width (`ResizeObserver`), not by a media query: the kit
  CSS keeps `print` as its only media query and the `0.3.3` sizing test stays green unchanged.
- A tier change re-lays out the chart (ticks, label mode, legend position). It is not a zoom and is not animated.

### 7.2 Phone readability (390 px)

Measured at the `compact` tier at scale 1 (column ≥ 336 px):

- tick, legend and data-label text ≥ 11 px; axis titles ≥ 12 px; no rotated tick label; the y-axis title is set
  horizontally above the axis instead of rotated (`yLabelPlacement: "top"`, §6.1);
- at most 5 ticks per axis (`unit` scatter axes use 0, 0.25, 0.5, 0.75, 1; the log axis labels majors only);
- point hit target 24 × 24 px around a 4 px marker; keyboard and touch reach the same points;
- the legend (element-owned, §6.1) moves below the plot, one group per line, marker shape plus colour;
- iso-F1 labels shorten to the level (`0.8`), with one `F1` legend entry;
- `AcceptanceRateChart` row labels wrap to two lines above the bar instead of taking a left margin
  (`labelPlacement: "above"`, §6.4);
- the tooltip is replaced by a fixed read-out line under the plot (tap a point, the line shows label and values),
  so a finger never hides what it reads (`tooltip: false` plus the element-owned line, §6.1).

### 7.3 `Tout voir`, `Plein écran`, zoom

A shared frame wraps every chart: `chart-frame.ts` in elements, extracted from `attachViewAll` in
`engines/dossier-diagrams.ts` so diagrams and charts run one implementation and one wording (`Tout voir`,
`Plein écran`).

- **Default**: the chart's natural size at the tier (§7.1), shrunk to the column when needed. A `RankCurveChart` with 4 panels or an
  `AcceptanceRateChart` with 24 rows is taller than a phone screen and scrolls with the page.
- **`Tout voir`**: the whole chart with no scroll, `max-height: 70vh`, aspect ratio kept, never enlarged,
  `aria-pressed`. On the wrapper this is `width: min(<W>px, 100%, 70vh × <W> / <H>)`. For a tall chart this is the overview; for a chart already whole on screen the toggle is still
  shown and has no visual effect, so the control set is the same on every figure.
- **`Plein écran`**: offered while view-all stands. **[JUDGMENT] — this diverges from `0.3.3`**, where fullscreen
  only shrinks the figure to fit and never changes its layout. For an inline chart the frame re-measures and picks
  the largest tier that fits the screen (a phone in landscape reaches `regular`), then applies
  `max-width: 100%; max-height: 100%`. Reason: a chart has several complete layouts and a diagram has one; showing
  the `compact` layout on a full screen would waste it. The re-layout is a chart-only hook of the frame: diagrams
  and the static SVG keep the `0.3.3` shrink-only behaviour. What stays as in `0.3.3`: the control, its wording, its
  availability rule, the Escape order, and the fixed-overlay fallback when the Fullscreen API is missing
  (`file://`, artifact, headless).
- **Zoom**: `touch-action: pinch-zoom` on the viewport, native pinch only. No custom zoom or pan handler, no wheel
  capture. The data-level answer to a dense cluster is `domain: "fit"` (§6.1), chosen by the producer.
- **Keyboard**: Escape leaves fullscreen, then view-all; both buttons are native `<button>`s.

The static SVG interim cannot change tier; see §9.1.

## 8. Theme, light and dark [JUDGMENT]

- Every colour is a token with the design-system light literal as fallback, as `0.3.3` did for the kit CSS:
  `var(--st-semantic-text-secondary, #475569)`, `var(--st-semantic-surface-default, #ffffff)`,
  `var(--st-semantic-border-subtle, #e2e8f0)`, `var(--st-semantic-data-category1, #4E79A7)` and so on for
  `category2..8`, the feedback tones and `text-primary`. Lot B2 adds these fallbacks to `ScatterPlot`, `LineChart`
  and `BulletChart` styles in the four frameworks; a guard test fails on any `var(--st-semantic-*)` without a
  literal in the files the elements bundle imports.
- Dark comes from the tokens: the element root sets `data-color-mode` from `hostConfig.colorScheme` and adopts the
  theme sheet (`theme.ts`), which already defines the dark values. No chart-specific dark rule.
- Without any themed host and without `hostConfig`, the literals give the light rendering. Dark in that case is
  `not covered` for the inline element, as for the rest of the `0.3.3` kit.
- Marks never rely on colour alone: marker shape per group, dashed iso curves, filled versus hollow frontier
  markers, a text value on every acceptance row. Contrast targets: text ≥ 4.5:1, marks and curves ≥ 3:1 against the
  surface, checked in both modes for the default theme.

## 9. Rendering in a Focus dossier

### 9.1 Interim — embedded SVG attachment (lot B3)

- Elements exports a pure static renderer, Node and browser, no DOM:
  `renderBenchChartSvg(component, props, { tier = "compact", colorScheme = "light" }): string`. It validates with
  the same schema and semantic validator, uses the same `dataviz-core` presets, the same `chartScale.ts` helpers
  (imported from `components-svelte`) and the same natural sizes (§7.1) as the element, and returns one self-contained SVG: explicit `width` / `height` / `viewBox`, `role="img"`, `<title>` =
  `label`, `<desc>` = a one-sentence summary, an opaque surface rectangle, **literal colours only** (the default
  theme's light or dark literals), system font stack, no script, no `foreignObject`, no external reference, no
  `data:` URI inside. Same input, same bytes.
- The producer attaches it to the dossier as an evidence source with `mediaType: "image/svg+xml"`, `alt` = the
  chart label, and puts the Markdown fallback of §5.4 in the section as a prose table, which is the accessible data.
  Whether the pinned Focus schema accepts that media type on a source is `unverified` (peer item).
- **Where the image renders.** `appendDossierEvidence` appends sources to the evidence list at the dossier root
  (§3), so the image is **not** next to the section's table: it renders in the evidence list, inside the chart
  frame on the evidence preview. The section keeps the table and refers to the image by the evidence entry (its
  label, and a link to it when the dossier supports one). Image-to-table adjacency is `unverified` until the peer
  item confirms a way to cite or place a source inside a section; whether a section can link to an evidence entry is
  `unverified` too. This spec does not claim adjacency for the interim.
- Kit change: `dossier-evidence.ts` previews `image/svg+xml` through `<img src="data:image/svg+xml;base64,…">`,
  like PNG and JPEG. An SVG loaded by `<img>` runs no script and loads no sub-resource, so no SVG sanitizer is
  needed. The evidence preview sits in the chart frame, so `Tout voir`, `Plein écran` and pinch zoom apply; the CSS
  rules of `.st-dossier__diagramViewport > svg` are extended to `> img` (the static SVG carries explicit
  `width` / `height`, so the `0.3.3` rule applies to it as is).
- Limits, stated in the rendered caption (`Static chart`): one tier, chosen at generation time (default `compact`,
  legible on a phone and deliberately small on a desktop, since nothing is enlarged); no hover or keyboard point
  navigation; colour scheme fixed at generation time, so it does not follow the host theme. `Plein écran` shows the
  same image, not a larger layout.

### 9.2 Target — inline (lot B6, depends on the peer item)

- A dossier section references a chart by carrying the catalogue component object (`component` plus its props),
  under a node kind defined by `@sentropic/focus`. The kind name and schema are the peer item's; the DS requires
  only that the payload is the unchanged catalogue component object and that the node has `id` and `alt`.
- Kit: `focus-renderer.ts` gets a `face.charts` map, built like `face.diagrams`: for each chart node the kit
  validates the payload with the element validator and mounts the same Svelte chart component inside the chart
  frame, in a `<figure class="st-dossier__chart">` with the `alt` as `figcaption`. No nested custom element and no
  second copy of the runtime.
- Fallbacks, in order: payload invalid → the diagnostics panel in place of the figure, the rest of the dossier
  renders; chart engine missing from the kit build → the Markdown fallback table rendered as an HTML table; kind
  unknown to an older kit → today's `st-dossier__unknownSection` box (existing behaviour). A dossier never fails
  whole because of one chart.
- Print (`@media print`, already in the kit): view-all and fullscreen are reset, the chart prints at the `regular`
  tier followed by its full table.
- Review mode: the figure is a comment target like a diagram figure; the frame buttons carry
  `data-review-passthrough`.
- Offline: the charts are in the kit's inlined bundle, no network request. Budget: the four charts add ≤ 25 kB gzip
  to the dossier shell and ≤ 20 kB gzip to a chart shell (EZ-1 measured `TimeSeriesChart` at 99 585 B gzip
  complete); measured and recorded in the evidence file.

## 10. Accessibility

- The figure has an accessible name (`label`) and a generated one-sentence description: count, best point or
  summary statistic, target met or not. Generated from the data by a pure function, same text in the SVG `<desc>`.
- The data table is always in the DOM after the plot, with `<caption>`, `scope="col"` headers and the same order and
  formatting as the fallback. It is the primary non-visual path; the plot's decorative layers (grid, iso curves,
  frontier line, whiskers) are `aria-hidden`.
- Keyboard: the chart is one tab stop (roving tabindex); arrows move between points in table order, Home / End
  jump, Escape leaves. The focused point is announced with its label and values and has a visible 2 px focus ring
  with ≥ 3:1 contrast. Source of the navigation per chart: the existing `keyboardNav` of `ScatterPlot` for charts 1
  and 2; the **new** `keyboardNav` of `BulletChart` for chart 4 (§6.4, missing today); the element-owned summary
  strip for `RankCurveChart` (§6.3), which navigates the summary marks (min, P10, median, P90, max), not 2000
  points, with `LineChart` `keyboardNav` off.
- The frame buttons are native buttons with `aria-pressed` and `aria-controls`; fullscreen traps nothing and
  returns focus to its button on exit.
- Reflow: no horizontal page scroll at 320 px CSS width; text respects user font scaling up to 200 % (the chart
  drops to numeric point keys before it clips a label).
- Target: WCAG 2.2 AA for the default theme in both modes, checked by the browser suite's contrast assertions and
  one manual screen-reader pass per chart, recorded as `partial` until done.

## 11. A2UI catalogue and `ui://`

- Four entries in `catalog.json` in the A2UI v0.9.1 form of the render standard §5.2, generated by the existing
  generator from the contract modules; four standalone schemas `schemas/<Name>.v1.json`; `catalog:check` covers
  them. `x-sentropic`: `{ contract: "1.0", element: "st-…-chart", engine: "core", events: [], fallback: "text",
  parity, schema, example }`. The three other frameworks are `no-counterpart` for the composed element, as for
  `TimeSeriesChart`; parity of the underlying primitives is proven separately (§13).
- No data binding, no child references, literals only (render standard §4.2). Envelope ≤ 1 MiB: the largest valid
  `RankCurveChart` (4 × 2000 values) is under 80 KiB.
- MCP: the components appear in `list_components` and `get_schema`; `render` accepts them through `anyComponent`
  and serves them from `ui://sentropic/render/v1`. Under the per-component fallback of §8.3 the resources are
  `ui://sentropic/precision-recall-chart/v1`, `ui://sentropic/score-cost-chart/v1`,
  `ui://sentropic/rank-curve-chart/v1`, `ui://sentropic/acceptance-rate-chart/v1`, with tools
  `render_PrecisionRecallChart` and so on. The resource HTML and tool wiring are built by the h2a module, not here;
  the DS ships the four shells in `dist/shells/manifest.json`.
- `render` text `content` is the §5.4 output: the render standard §8.2 summary line, then the fallback table, both
  inside the 4 KiB limit; `isError: true` with diagnostics on an invalid envelope.
- A2UI SDK acceptance: the four fixtures are added to `tests/a2ui-sdk.test.ts` (SDK `0.14.0`, as EZ-1).
- Skill `sentropic-render` (`skill/SKILL.md`): a routing paragraph (bench precision and recall per system → 
  `PrecisionRecallChart`; score against cost → `ScoreCostChart`; per-item recall distribution → `RankCurveChart`;
  accepted counts → `AcceptanceRateChart`), the rules "send counts, not rates", "never send F1 with precision and
  recall" and "cost must be strictly positive", and one fixture link per chart.
- Canvas norm (live-collab spec §3.2, R-DESC-4): nothing is hand-written in a host catalogue; hosts import the
  generated entries at a pinned elements version.

## 12. Streaming render

- **Today**: `mode: "preview"` is refused with `unsupported-mode` and `tool-input-partial` is ignored. The four
  elements render once, on the complete validated envelope. Because `tool-input-partial` is ignored, the shell knows
  neither the component, nor its tier, nor its height before `tool-input`: no size-stable skeleton is possible and
  none is claimed. Until `tool-input` the shell shows only a generic frame placeholder (`aria-busy="true"`, no
  axes, no chart-specific size); the final render replaces it and a layout shift at that moment is not excluded.
- **When `preview` exists** (render standard §10.3, not built by this spec), these rules make the four charts
  preview-ready without a contract change:
  - arrays are append-only prefixes; the element renders every complete item it has and ignores a trailing
    incomplete one;
  - domains that do not depend on data stay fixed (`[0, 1]` axes, acceptance axis); the log cost domain only ever
    widens, by whole major ticks; `domain: "fit"` renders as `"unit"` until the final envelope;
  - `RankCurveChart` re-sorts the prefix on each update, with no transition; its summary row is marked partial;
  - the frontier and the Wilson intervals are recomputed per update; the text fallback is produced only from the
    final envelope;
  - a preview never validates semantics and never emits an event; the final snapshot replaces it entirely.
- Performance budget: first render of the largest valid envelope of each chart ≤ 100 ms script time on the suite's
  reference machine; a prefix update ≤ 16 ms up to 200 points.

## 13. Four-framework plan

The composed elements are Svelte-compiled custom elements and are framework-neutral by construction. What must
exist in the four frameworks is the primitive capability and the shared maths:

| Piece | Where | Svelte | React | Vue | Angular |
|---|---|---|---|---|---|
| `isoF1Curve`, `paretoFrontier` (ids + step points), `buildRankCurve`, `buildAcceptanceRates`, `placePointLabels` | `dataviz-core` (pure, one copy) | shared | shared | shared | shared |
| `chartScale.ts`: log helpers **extracted** from `LineChart` / `BarChart` (`logTicks`, `fixedLogTicks`, `smallestPositive`), plus `scaleLog`, `formatLogTick`, opt-in `minor`; `LineChart` and `BarChart` rewired to it, output unchanged | `components-*` (mirrored, one vector file) | B2 (reference) | B5 | B5 | B5 |
| `ScatterPlot`: `curves` with `ChartCurve.variant`, `xScale`, `xDomain`, `yDomain` | `components-*` | B2 (reference) | B5 | B5 | B5 |
| `ScatterPlot` datum: `marker` (circle / square / diamond / triangle), `filled`, `labelPosition`; exported marker path helper | `components-*` | B2 | B5 | B5 | B5 |
| `ScatterPlot`: `yLabelPlacement` | `components-*` | B2 | B5 | B5 | B5 |
| `tooltip` switch on `ScatterPlot`, `LineChart`, `BulletChart` | `components-*` | B2 | B5 | B5 | B5 |
| `BulletChart`: optional `target`, `domain`, `interval`, `valueLabels` / `valueText`, `labelPlacement`, `tickFormat`, `keyboardNav` / `hoverKey` / `onHoverKeyChange` / `onSelectKey` | `components-*` | B2 | B5 | B5 | B5 |
| Literal fallbacks on `ScatterPlot`, `LineChart`, `BulletChart` | `components-*` styles | B2 | B5 | B5 | B5 |
| Store-bound props (pass-through of the new `ScatterPlot` and `BulletChart` props) | `dataviz-*` adapters | B2 | B5 | B5 | B5 |
| Natural-size wrapper `.st-chartFrame__natural`, legend layer, read-out line, rank summary strip | `elements` only (Svelte-compiled, framework-neutral) | B2 | — | — | — |
| Preset adapters `PrecisionRecallChart`, `ScoreCostChart`, `RankCurveChart`, `AcceptanceRateChart` | `dataviz-*` | B2 | B5 | B5 | B5 |

- Svelte is the reference; React, Vue and Angular follow in B5 with the existing parity guard and the golden
  fixtures of `dataviz-vue/bench` extended to the new props. The component index is regenerated (`index:check`).
- The component packages do not import `dataviz-core` today (`chartAnnotations.ts` is mirrored per package). The log
  helpers are therefore not added to `dataviz-core`: the copies already local to `LineChart` and `BarChart` are
  extracted into one mirrored `chartScale.ts` per package and reused by `ScatterPlot` (§6.2), with one shared test
  vector file asserting identical output in the four packages. There is one log implementation per package after
  this lot, where there are two local copies today. The presets stay in `dataviz-core` only.
- Sizing needs no primitive change in any framework: it is done by the elements-side wrapper (§7.1).
- `BulletChart` had no change planned in the first draft of this spec; its eight additions (§6.4) and the
  `ScatterPlot` additions of §6.1 are the reason B2 and B5 were re-estimated (§14).
- Preact packages exist (`components-preact`, `dataviz-preact`); they are outside the four catalogued frameworks
  and are `not covered` by this lot.
- New props are additive and optional: absent ⇒ rendering unchanged, asserted by the existing snapshot tests.

## 14. Lots and effort

| Lot | Content | Depends on | Effort |
|---|---|---|---:|
| **B1** | `dataviz-core` presets and maths (five functions, test vectors); the four contract modules, schemas, catalogue entries, semantic validators, Markdown formatters, fixtures | — | 3.5 d |
| **B2** | Svelte primitives: `chartScale.ts` extraction (`LineChart` / `BarChart` rewired, output unchanged); `ScatterPlot` `curves` + `variant` / `xScale` / domains / `marker` / `filled` / `labelPosition` / `yLabelPlacement`; `tooltip` switch on three primitives; `BulletChart` additions (§6.4); literal fallbacks, token guard; natural-size wrapper, legend layer, read-out line, rank summary strip; the four Svelte element compositions and custom elements; shells; dataviz-svelte adapters | B1 | 5.5 d |
| **B3** | Chart frame extracted from `attachViewAll` (diagrams unchanged); layout tiers; `renderBenchChartSvg`; kit preview of `image/svg+xml` evidence; browser suite at 390 / 820 / 1280 | B2 | 2.0 d |
| **B4** | Catalogue projection checks, A2UI SDK fixtures, skill text, `ui://` shells in the manifest, evidence file with shell sizes | B2 | 1.5 d |
| **B5** | React, Vue, Angular: every primitive row of §13 (`chartScale.ts`, `ScatterPlot` additions, `tooltip` switch, `BulletChart` additions), fallbacks, adapters, parity guard, goldens, component index | B2 | 7.0 d |
| **B6** | Inline in the Focus kit: `face.charts`, fallbacks, print, review passthrough, dossier fixtures and suite | B3, peer item `01M81ZHEJXAKVG024M3E1N68MJ` | 2.5 d |
| **B7** | Accessibility pass (contrast in both modes, screen-reader pass per chart), docs page with the four live examples | B3 | 1.0 d |
| | **Total** | | **23.0 d** |

Re-estimate after review: B2 4.0 → 5.5 d (+1.5 d: `BulletChart` additions, markers and filled variant,
`yLabelPlacement`, `tooltip` switch, `chartScale.ts` extraction, natural-size wrapper and element-owned layers) and
B5 5.0 → 7.0 d (+2.0 d: the same primitive additions in three more frameworks, `BulletChart` included, which had no
change planned). Total 19.5 → 23.0 d.

Critical path to the owner's first look (embedded SVG in a dossier): B1 → B2 → B3 = 11.0 days. B4, B5 and B7 run in
parallel after B2 / B3. B6 starts when the peer item fixes the node kind. Releases: one elements minor after B3
(`0.4.0`, new public exports), one after B6; component and dataviz packages take a minor with B2 / B5.

## 15. Tests

- **Unit (`dataviz-core`)**: iso-F1 points satisfy `2pr/(p+r) = f` within 1e-9 and stay in the domain; frontier on
  ties and duplicates, and its step points (axis-aligned segments, first and last step); `placePointLabels` returns
  `null` as soon as one point cannot be placed; rank preset stability on
  ties, quantiles against hand-computed vectors; Wilson interval at 0/n, n/n and 1/1.
- **Unit (`chartScale.ts`, shared vector file, each component package)**: log ticks for one, two and nine decades
  and for a single value, with and without `minor`; `formatLogTick`; with `minor` absent the output equals the
  pre-extraction `LineChart` / `BarChart` helpers on the same vectors.
- **Primitives**: `BulletChart` with no `target` draws the row and no target mark; `domain`, `interval`,
  `valueLabels`, `labelPlacement: "above"` and keyboard navigation each have a rendering test; `ScatterPlot`
  `marker` × `filled` matrix, `yLabelPlacement: "top"`, `tooltip: false`, `curves` in both variants.
- **Contract (elements)**: per chart, a valid fixture set (minimal, typical, maximal) and a refusal set: unknown
  property at every object level, each bound exceeded by one, duplicate id, dangling `groupId`, `accepted > total`,
  `cost = 0`, non-increasing `isoF1`. **Item bounds**: the generated schema of `RankCurveSeries.values` has
  `items.minimum = 0` and `items.maximum = 1`, and that of `isoF1` has `items.exclusiveMinimum = 0` and
  `items.exclusiveMaximum = 1`; a value of `1.2` in `values` and a level of `0` or `1` in `isoF1` are refused by
  the schema, not by the semantic validator. Standalone schema equals the catalogue entry after canonical sorting;
  `catalog:check` is clean.
- **Fallback**: byte-exact golden per fixture; the first line is the §8.2 summary line; the maximal fixture and a
  worst-case fixture (every label at `maxLength`, every character escaped) both return ≤ 4096 bytes **summary line
  included**, with a correct omitted count; same input twice
  gives the same bytes; the HTML table and the Markdown rows match cell for cell.
- **Static SVG**: byte-exact golden per fixture, tier and colour scheme; no `<script>`, `foreignObject`, `href`,
  `style` attribute or `url(` outside local ids; explicit `width` / `height` / `viewBox`.
- **Browser suite (`chromium-suite.mjs`), at 390, 820 and 1280 px**, light and dark, per chart, standalone shell
  and dossier page:
  - the tier matches the measured column and the page context table of §7.1; the rendered width of
    `.st-chartFrame__natural` ≤ the chart's natural width (never enlarged) and its box keeps the natural aspect
    ratio; no horizontal page scroll;
  - computed font size of every tick and label ≥ 11 px × scale, and scale ≥ 0.70;
  - point coordinates equal the expected pixel positions for the fixture (the EZ-1 coordinate check), including two
    log-axis points one decade apart being one major-tick interval apart;
  - `Tout voir` fits the chart in the viewport with no scroll and no enlargement; `Plein écran` (native and overlay
    fallback) picks the expected tier for an inline chart and leaves the static SVG and the diagrams shrink-only;
    Escape order; `aria-pressed` states;
  - no secondary network request; zero CSP violation in the qualified shells;
  - with all `--st-*` tokens removed, computed colours equal the light literals;
  - before `tool-input`, the shell shows the generic placeholder with `aria-busy="true"` and no axes.
- **Regression**: `tests/dossier-diagram-sizing.test.ts` and the diagram sizing cases of the suite pass unchanged
  after the frame extraction; primitive snapshot tests unchanged when the new props are absent, `LineChart` and
  `BarChart` log-axis snapshots included after the `chartScale.ts` extraction.
- **Parity (B5)**: the guard compares the new props across the four frameworks; goldens equal across frameworks for
  the shared fixtures.

Each RED witness is recorded first (a failing test on the pre-change tree), as in the EZ-1 evidence file.

## 16. Acceptance criteria the owner can look at

One page per chart plus one dossier page, served by the suite's static server and published as screenshots in the
PR, at **390, 820 and 1280 px**, light and dark (4 charts × 3 widths × 2 modes, plus the dossier).

"Page" names the context that fixes the tier (§7.1): **S** = standalone chart page, **D** = dossier page.

| # | What to look at | Page | Passes when |
|---|---|---|---|
| AC-1 | Precision-recall, 390 px | S, D | Square plot fills the column without horizontal scroll; iso-F1 curves at 0.2 / 0.4 / 0.6 / 0.8 are dashed and labelled; every point is either named or numbered, and the number is in the table below |
| AC-2 | Precision-recall, 1280 px | S | `wide` tier: the chart is 640 × 640 px, not stretched to the page; labels are direct when they fit. On the dossier page at 1280 px the same chart is at the `regular` tier, 520 px wide or the column width if that is lower, never wider |
| AC-3 | F1 vs cost, all widths | S | The x axis reads `log scale` in its title; ticks are powers of ten; the frontier is a solid stepped line through filled markers, dominated points are hollow; a point at 10× the cost sits one major tick to the right |
| AC-4 | Rank curve, 390 px | S, D | One panel per series, same y axis 0 to 1; the median line carries its value; the zero tail is shaded with its count; the summary table shows n, mean, quantiles |
| AC-5 | Acceptance rate, 390 px | S, D | Each row shows the bar, the target mark and the text `82.5 % (330/400)`; a 3/4 row shows a visibly wider interval whisker than a 300/400 row |
| AC-6 | Any chart, 390 px | S, D | Tick and label text is readable without zooming (≥ 11 px); pinch zoom works on the plot |
| AC-7 | Any chart | S, D | `Tout voir` shows the whole chart with no scroll, same wording and behaviour as on a dossier diagram; `Plein écran` appears only then (its re-layout, AC-8, is the one behaviour that differs from a diagram); Escape leaves fullscreen, then view-all |
| AC-8 | Phone in landscape, `Plein écran` | S, D (inline) | The chart re-lays out at the `regular` tier; text size is unchanged, not magnified. This is a choice of this spec, not `0.3.3` behaviour (§7.3); the interim static SVG does not re-lay out |
| AC-9 | Dark mode | S, D (inline) | Surface, text, grid and the eight categories follow the theme; groups remain distinguishable by marker shape |
| AC-10 | Page with no theme stylesheet | S | Chart renders in the light literals, styled, not black-on-transparent |
| AC-11 | Dossier with the embedded SVG (interim) | D | The chart shows in the evidence list as an image at its natural size with the caption `Static chart` and `Tout voir` available; the data table is in the section and names the evidence entry; the file opens offline from disk. Image next to the table is `unverified` (peer item) and is not part of this criterion |
| AC-12 | Dossier with the inline chart (B6) | D | Same figure, now with point read-out and keyboard navigation, following the host theme; a deliberately invalid chart shows its diagnostics and the rest of the dossier still renders |
| AC-13 | Text host | text host (no page) | The `render` tool answer is one summary line (component, counts, validation result) followed by a Markdown table, under 4 KiB in total, with an omitted-rows line when cut |
| AC-14 | Keyboard only | S, D (inline) | Tab reaches the chart once, arrows walk the points (rows for the acceptance rate, summary marks for the rank curve), the focus ring is visible, the read-out line updates |

Fixtures use synthetic systems named `System A` … `System H` and synthetic numbers; no client or bench content is
committed.

## 17. Risks

- **Peer dependency.** The inline target waits on a Focus node kind outside this repository. Mitigation: B1–B5 and
  B7 do not depend on it; the interim (B3) delivers the owner need in a dossier.
- **`image/svg+xml` as an evidence source** may be refused by the pinned Focus validator (`unverified`). Fallback:
  the producer attaches the same SVG rasterised to PNG at 2× (already previewed by the kit), at the cost of text
  sharpness under pinch zoom.
- **Frame extraction** touches code that has just shipped in `0.3.3`. Mitigation: the diagram tests pass unchanged
  before any chart uses the frame; the extraction is its own commit.
- **Label collisions** on dense scatters. Mitigation: the all-or-nothing numeric fallback and `domain: "fit"`;
  the 200-point bound.
- **Four-framework drift** on log ticks mirrored per package. Mitigation: one shared vector file, asserted in each
  package.
- **`chartScale.ts` extraction** touches `LineChart` and `BarChart`, which other catalogued charts use. Mitigation:
  behaviour-preserving extraction in its own commit, existing log-axis snapshots unchanged.
- **`BulletChart` surface growth** (eight optional props in four frameworks). Mitigation: all additive, defaults
  reproduce today's rendering, parity guard extended in B5.
- **Interim image away from its table** (§9.1). Mitigation: the section names the evidence entry; the inline target
  (B6) puts the figure in the section.

## 18. Open questions for the owner

1. **Acceptance rate — what is one row?** This spec assumes a row is one system or configuration with an
   accepted / total count and an optional common target (§6.4). If the need is instead one rate with its breakdown
   by reason of refusal, or a rate per run over time, the contract changes (a stacked bar, or `TimeSeriesChart`).
   Recommendation: keep rows = systems.
2. **Text fallback over 4 KiB — cut or refuse?** EZ-1 refuses the render when the table exceeds 4 KiB. This spec
   cuts deterministically and states the omitted count (D4), so a large bench always renders. Recommendation: cut;
   confirm that a truncated text table is acceptable in a text-only host.
3. **Interim size on desktop.** The embedded SVG is generated once, at the phone-legible `compact` tier (336 px),
   and stays that small on a desktop because nothing is enlarged (§9.1). Alternative: generate at `regular`
   (640 px), better on desktop, shrunk to about half size on a phone and read through `Tout voir` and pinch zoom.
   Recommendation: `compact` until the inline lot lands.

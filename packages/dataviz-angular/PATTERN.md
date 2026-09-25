# Porting a store-driven adapter to `@sentropic/dataviz-angular`

This is the recipe used to port the first thirty-two adapters, in two lots: ten
written by hand (the first lot, one per family of the pattern) and twenty
generated from a descriptor (the second, see "Adding a lot"). Follow it for the
next lots — every step below exists because something broke without it.

An adapter in this package is **state wiring, not rendering**. It reads a
`DashboardStore`, derives a plain array with the framework-free helpers, and
hands that array to a `@sentropic/design-system-angular` component. It owns no
SVG, no colour, no layout.

---

## 0. Before writing a line

1. Read the three existing implementations of the component:
   `packages/dataviz-vue/src/lib/<Name>.ts`,
   `packages/dataviz-react/src/lib/<Name>.tsx`,
   `packages/dataviz-svelte/src/lib/<Name>.svelte`.
   The prop names and types are the contract; Angular only changes the syntax.
2. Check that the DS Angular component exists **before** designing the template:

   ```
   git grep -n "<Name>" packages/components-angular/src/index.ts
   ```

   If it is absent, stop and report the gap. Do not invent a DS component and do
   not hand-roll the markup in the adapter. Five of this lot's ten targets
   (`DashboardFilterBar`, `DateRangeFilter`, `RecordsTable`, `KpiCardGroup`,
   `SelectionLegend`) are *compositions*: they have no same-named DS component
   and compose DS primitives instead (`Search`/`DatePicker`/`Select`/
   `MultiSelect`/`Button`/`FilterBar`/`FilterPill`, `DatePicker`, `DataTable`,
   `KpiCard`, `Inline`+`SelectionChip`). Read the React/Vue source to learn which
   primitives, and in which order.
3. Check the DS component's **inputs** (not only its `…Props` type):

   ```
   grep -nE '@NgInput|@Output|selector:' packages/components-angular/src/<Name>.ts
   ```

   The public input name is the alias when there is one (`@NgInput("class")
   classInput` is bound as `[class]`), and the callbacks are sometimes an
   `@Input` function (`[onClear]`), sometimes an `@Output` (`(modelValueChange)`),
   sometimes both.

---

## 1. Skeleton

```ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Xxx as DsXxx, type XxxDatum } from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type XxxProps = { /* same names + types as the Vue/React props */ };

@Component({
  selector: 'st-dataviz-xxx',
  standalone: true,
  imports: [DsXxx],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<st-xxx [data]="data" [label]="label" [class]="classInput"></st-xxx>`,
})
export class Xxx implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'Xxx';

  private readonly changeDetector = inject(ChangeDetectorRef);
  private signals?: AngularSignalStore;
  private unsubscribe: () => void = () => {};

  @NgInput({ required: true }) set store(value: DashboardStore) {
    if (this.signals) this.signals.replace(value);
    else this.signals = toSignalStore(value);
    this.unsubscribe();
    this.unsubscribe = value.subscribe(() => {
      this.recompute();
      this.changeDetector.markForCheck();
    });
  }

  get store(): DashboardStore {
    if (!this.signals) throw new Error('Xxx: store is required.');
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: XxxDatum[] = [];

  ngOnInit(): void { this.recompute(); }
  ngOnChanges(): void { this.recompute(); }
  ngOnDestroy(): void { this.unsubscribe(); this.signals?.destroy(); }

  private recompute(): void {
    if (!this.signals) return;
    void this.signals.state();
    this.data = /* framework-free derivation */;
  }
}
```

Naming: selector `st-dataviz-<kebab-name>`, class = the React/Vue name, DS import
aliased `Ds<Name>` when the names collide (they usually do), `stComponentName`
static field (asserted by `src/index.test.ts`).

## 2. Reading the store

* Always through `../adapter.js`: `toSignalStore(store)` for a `store` input,
  `injectDashboard()` when the store comes from the injector.
* The rows are `signals.store.applyCrossfilter(this.viewId)`, the model is
  `signals.store.model`, the selections are `signals.state().selections`.
* `void this.signals.state()` at the top of `recompute()` keeps the read of the
  state signal explicit even when only `applyCrossfilter` is used.

## 3. Deriving the data

Reuse, never re-derive:

* `@sentropic/dataviz-core` for the model builders
  (`buildScatterModel`, `buildKpiCards`, `buildDateHistogramModel`,
  `evaluateConditionalFormat`, `findMeasure`, …).
* `./categoricalData.js`, `./partOfWholeData.js`, `./distributionData.js` for the
  "safe" wrappers and the DS shape mappers (`buildSafePartWholeModel`,
  `toPartWholeData`, `toTreemapData`, `buildHeatmapData`,
  `toSimpleCategoricalPoints`, …). These three files are **byte-identical
  copies** of the ones in `dataviz-vue`, `dataviz-react` and `dataviz-svelte`.
  Keep them that way:

  ```
  for f in categoricalData partOfWholeData distributionData; do
    diff packages/dataviz-vue/src/lib/$f.ts packages/dataviz-angular/src/lib/$f.ts
  done
  ```

  If a next lot needs `drill.ts`, copy it the same way instead of rewriting it.

## 4. Delegating to the DS component

* One `<st-…>` element per DS component, every input bound, nothing computed in
  the template.
* Wrapper elements the adapter owns itself (the `<div>` of `KpiCardGroup` and
  `DashboardFilterBar`) carry `[attr.class]` (see trap 7).
* Callbacks that are React-style props stay React-style inputs
  (`onQueryChange`, `onSelectKey`, …): that is the cross-framework contract.

## 5. Test

One `src/lib/<Name>.test.ts` that **mounts** the component:

```ts
import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Xxx } from '../../dist/lib/Xxx.js';   // built output, not the source

class XxxHost { readonly store = newStore(); }
Component({ standalone: true, imports: [Xxx], template: `…` })(XxxHost);
```

Assert three things: the DS root element and its classes, the key DS sub-elements
(one `<rect>`/`<circle>`/`<td>` per datum), and the **accessible value list**
(`ul.st-chartDataList > li` for the charts, the chip/cell/th text for the
others). Add one test that mutates the store after the first
`detectChanges()` and asserts the render followed.

The structural guard `src/lib/adapter-pattern.test.ts` enforces the shape of
every adapter from its source: no getter but the `store` accessor, `ngOnInit` and
`ngOnChanges` both calling the same **private** derivation method, an
`ngOnDestroy` that unsubscribes exactly when the adapter subscribes, and no
inline style or hard-coded colour. Add the new file to the expected list in its
first case — the guard cross-checks that list against `src/index.ts`, so a new
adapter cannot slip past it, and the failure tells you which file is missing.

## 6. Exports

Add the component and its `…Props` type to `src/index.ts`, plus any pure helper
the reference packages export (`dateRangeToSpec` is exported by
`dataviz-react`/`dataviz-vue`, so it is exported here too). Do **not** export the
three data-helper modules: the reference packages do not. `src/index.test.ts`'s
`components` table names the twelve adapters of the first lot explicitly and is
**not** the whole surface — it was read as such for four lots. What does cover the
surface is the sweep next to it, which requires every export carrying
`stComponentName` to carry its own export name, and refuses to run on fewer than
eighty of them. `src/lib/adapter-pattern.test.ts` cross-checks `src/index.ts`
against the files on disk, so a new adapter cannot be exported without a file or
written without an export.

---

## Traps actually hit while porting

1. **DS class-field defaults are destroyed by an `undefined` binding.**
   `KpiCard` declares `format: KpiCardFormat = "number"` and `size: KpiCardSize =
   "md"` as class fields and renders `st-kpiCard--${this.size}`. Binding
   `[size]="size"` with `size === undefined` renders
   `class="st-kpiCard st-kpiCard--undefined"`, where React/Vue would fall back to
   their default prop. Resolve the DS default in `recompute()`
   (`this.sizeValue = this.size ?? 'md'`). Components that resolve internally
   (`DataTable` does `this.size ?? "md"`) need no guard — check before adding one.
2. **A store mutation is not an `@Input` change.** `ngOnChanges` never fires when
   the store notifies, so the subscription in the `store` setter is what keeps
   the view live. Subscribe **after** `toSignalStore()` / `signals.replace()` so
   that the signal store's own subscriber runs first and `signals.state()` is
   already fresh inside the callback. Always `markForCheck()` — the components
   are `OnPush`.
3. **`ngOnChanges` runs before `ngOnInit`.** `recompute()` is called with the
   store input possibly still unset, so it must `return` early
   (`if (!this.signals) return;`). Keeping the `recompute()` in `ngOnInit` too is
   what makes a store-only component (`SelectionLegend`) render on first paint.
4. **`viewId` is what makes cross-filtering work.** `applyCrossfilter(undefined)`
   applies the *filters* but ignores every view *selection*. A `KpiCardGroup`
   test that toggled a selection in another view and expected the aggregate to
   move failed until `viewId` was passed. When the reference props make `viewId`
   optional, keep it optional — but pass it in the tests.
5. **`[class]` does reach a DS input named `class`, but loses token order.**
   Verified: with `class="my-chart"` on `<st-dataviz-area-chart>`, the DS root
   div renders `class="my-chart st-areaChart st-areaChart--category1"` while
   React renders `class="st-areaChart st-areaChart--category1 my-chart"` — same
   tokens, different order, because Angular's class binding diffs tokens instead
   of writing the string. Compare class **token sets**, never the raw string.
   Side effect: the static attribute also stays on the adapter's own
   `<st-dataviz-*>` host element, so the token appears twice in the DOM. React
   and Vue have no host element at all.
6. **ARIA has to be an input on the DS component, and bound as a property.**
   React and Vue spread arbitrary attributes onto the element they render; Angular
   has no spread, so a DS layout primitive must *declare* the ARIA attributes.
   `Inline` now declares `role`, `aria-label`, `aria-labelledby` and
   `aria-describedby` and puts them on its rendered `.st-inline` div. Bind them as
   **properties** (`[role]="'group'"`, `[aria-label]="label"`): a static attribute
   both feeds the input and stays on the `<st-dataviz-*>`/`<st-*>` host element, so
   it ends up in the DOM twice. When a DS component you need lacks the ARIA input,
   add it there — do not work around it in the adapter.
7. **`class=""` vs no `class` attribute.** React renders `className={undefined}`
   as no attribute; an Angular `[class]="x"` on a plain element renders
   `class=""`. On a wrapper div the adapter owns, use
   `[attr.class]="classInput ?? null"` (that is what `KpiCardGroup` does) to keep
   the rendered attribute set identical.
8. **Never narrow a discriminated union in the template.** `DashboardFilterBar`'s
   `FilterControl` union is flattened in `recompute()` into a
   `FilterControlView` (all fields present, `kind` kept as the discriminant) and
   the template only `@switch`es on `view.kind`. This satisfies both
   `strictTemplates` and the "no derivation in the template" rule, and it is
   where the per-control `SelectOption[]` and the per-chip `remove` closures are
   built.
9. **Tests must import from `dist/`, and declare the host imperatively.**
   `vitest` transpiles the test file without the Angular decorator pass, so a
   `@Component`-decorated host class in a `.test.ts` is not compiled. Use
   `Component({...})(HostClass)` and `import '@angular/compiler'` for the JIT.
   The adapters themselves are imported from `../../dist/lib/<Name>.js`, which is
   why `npm test` runs `npm run build` first.
10. **Keep the Angular version pinned and single.** The package pins the exact
    Angular version used by `components-angular`; a second, nested Angular
    runtime makes `TestBed.initTestEnvironment` fail. Never relax the pin to a
    caret range, never add a second Angular version to the manifest.
11. **This test setup has no zone.js, so `detectChanges()` only refreshes dirty
    views.** Mutating a plain field on the TestBed host and calling
    `fixture.detectChanges()` does **not** update the child's inputs: the host
    view is not dirty, so its bindings are never re-evaluated and the adapter's
    `ngOnChanges` never fires. Call `fixture.changeDetectorRef.markForCheck()`
    first (the `DateRangeFilter` dimension-switch test does). The same mechanism
    is why the store subscription in the `store` setter must call
    `markForCheck()`: without it, a store mutation would recompute the fields and
    never repaint.
12. **Mirror the React effect dependency list, not just the mount.** React's
    `DateRangeFilter` re-applies its filter on `[store, dimension, range]`, so
    the Angular one applies in `ngOnInit` **and** in `ngOnChanges`; with only
    `ngOnInit`, switching `dimension` at runtime silently left the new dimension
    unfiltered. When porting a React adapter that uses `useEffect`, read its
    dependency array and map each entry to an Angular lifecycle hook or to the
    store subscription.
13. **A divergence visible from an adapter is usually a DS bug worth fixing.**
    Measure with the bare-DS control first (same inputs, no adapter): when the
    adapter's diff count equals the bare count, the fix belongs in
    `packages/components-angular`. Seven such fixes came out of the first two lots,
    and two of them were defects rather than cosmetics:
    `chartScale.buildSmoothPath` was a stub returning `buildLinearPath`, so every
    smoothing Angular chart — `AreaSplineRangeChart` above all — drew straight
    segments where React draws Béziers; and `RenkoChart` read its value list as
    `DOWN 104.8 -> 105` where React reads `▼ 104.8 → 105`. The others were the
    `Inline` ARIA inputs, the close-icon path, and a sweep of **21** charts whose
    accessible data list did not use React's shared `Data values for <label>`
    wording. Sweep the whole class when you find one: the second lot re-found the
    same wording bug in three more spellings the first sweep's grep had missed.

## Adding a lot

Do not hand-copy the skeleton. `tools/dataviz-angular-port/` extracts a descriptor
from each `dataviz-vue` adapter and emits the Angular one; its README has the
procedure and the list of shapes it refuses. The second lot's twenty adapters came
out of it with no hand editing and passed `ngc` with `strictTemplates` on the first
run. Two lessons are baked into the extractor and worth knowing when reading its
output:

- `import type { A, B }` marks the whole clause as types, while
  `import { type A, b }` marks them one by one. Both spellings occur in the Vue
  sources; reading only the second loses a type import.
- a prop bound straight through to a DS input takes **that input's** declared
  type, not the Vue `Props` alias's. Several aliases widen it to `string` and cast
  with `as any` at the `h()` call (`tone?: string` against `AreaRangeChartTone`);
  Angular cannot cast inside a template, and stating the union the DS component
  honours is the better contract for the same accepted values.

Tests are table-driven: `src/lib/generated-adapters.test.ts` holds one row per
adapter and asserts the same things for all of them, including that a selection in
another cross-filter view changes what is rendered. Its **name is historical**: lot
5 hand-wrote eight adapters the generator refuses and they are rows in that same
table, because what the table needs is the shape (store → builder → one DS
component), not the author. An adapter whose DS component renders no value list
cannot be a row that proves anything — lot 5's `Sparkline` and `ScoreCard` have
their own `<Name>.test.ts` instead, asserting the accessible name on the DS root
and the redrawn path or re-aggregated number.


---

## Proving parity with React or Vue

The harness lives in `tools/dataviz-angular-parity/` and is one command:

```sh
npm run build && npm run parity:dataviz-angular
```

It renders each Angular adapter with `TestBed` (jsdom) and its React counterpart
with `renderToStaticMarkup`, from the same fixture and the same props, then
compares (a) the flattened markup entry by entry, (b) the user- and
AT-visible content signature, and (c) the same comparison on the **bare DS
components**, which is what attributes a residual difference to
`components-angular` rather than to the adapter. Expected counts are asserted, so
the harness is also a regression gate; it regenerates
`tools/dataviz-angular-parity/PARITY.md`.

Every count depends on the normalisation in
`tools/dataviz-angular-parity/normalize.ts` — a stricter or looser allowlist moves
the numbers without changing the conclusions. Read that file before quoting a
figure, and add a new lot's adapters as new cases there.

`PARITY.md` carries the current table; do not restate its numbers elsewhere, cite
it. Read it for which adapters match React entry for entry, which match only on
content signature, and what the residue is attributed to. Where a residue is
attributed to the design system, the bare-DS control column proves it — and, as
trap 13 says, that is usually a DS bug to fix rather than an exception to record.

### What the render harness cannot see

Three blind spots are properties of measuring **rendered markup**, not accidents of
a lot. All three bit this package, and a sweep validated only by the harness cannot
be called complete because of them:

1. **Text that only exists on hover.** An Angular tooltip is rendered but empty
   without a pointer, so no text node exists in a static render and the content
   signature has nothing to compare. `RenkoChart`'s tooltip kept `UP`/`DOWN` and
   `->` for a whole review round after its data list had been aligned, and the
   harness reported that adapter as clean on content signature.
2. **Components outside the adapters the harness mounts.** `PARITY.md` covers the
   ported adapters and nothing else. `PointAndFigureChart` read `X 104.8 -> 105`
   against React's `X 104.8 → 105` and no measurement touched it.
3. **A saturated diff count downstream of a structural divergence.** `diff()` in
   `normalize.ts` compares the two flattened lists **position by position**, not by
   alignment. As soon as one framework emits elements the other does not, every
   entry after that point counts as a difference whatever it contains: the count
   stops measuring anything downstream. `TimelineChart` proves it — React emits
   five `tickLabel` text nodes Angular does not, so aligning Angular's data list on
   React's `${position}: ${label}` spelling (Angular printed the label alone and
   dropped the position a reader needs) moved **no count at all**: 59 markup /
   12 signature before and after, the suite green either way. A repair nothing
   measures can be silently undone, so the data list is now asserted on its own, by
   its `aria-label` rather than by position, in the
   `the accessible data list is identical, independently of markup position` test.
   Reverting that repair turns that test red while 59/12 stay exactly where they
   are. **When a count is nonzero, do not read a change in it as the only proof: ask
   first whether the property you changed is upstream or downstream of the
   divergence that count already absorbs.**

`scripts/verify-angular-react-glyphs.test.mjs` closes that class by reading the two
**sources** instead of the two renders: it compares each glyph token per component,
both ways, over **223** pairs — so a token both frameworks use (the
`SankeyChart`'s `source -> target`) is not a finding. Comments are stripped first,
because prose uses arrows far more than rendered strings do and comparing raw files
reports 58 files of noise.

That gate had three blind spots of its own, all closed in lot 4 and all worth
remembering, because each one made it report success over an unchecked comparison:

4. **A React file that only re-exports.** 80 of the 223 React counterparts are
   `export { X } from "./catalog.js"`, with the implementation in `catalog.tsx`.
   For those the gate compared an Angular component against an eleven-line
   re-export — including `ForceGraph`, a chart. A shim is now resolved to its slice
   of `catalog.tsx`, and an unresolvable shim fails the gate.
5. **Presence is not occurrence.** The gate asks whether a token appears in a file.
   A component that spells a glyph correctly in its data list and wrongly in its
   tooltip passes: re-adding `deg` to `VectorFieldChart`'s data list left the
   substring set unchanged, because the tooltip still had `°`. Two regex tokens
   now catch the ASCII stand-in itself (a unit right after an interpolation, a
   hyphen used as a separator between two rendered values), and that is what found
   the third VectorFieldChart divergence — hover-only, so invisible to the render
   harness.
6. **A regex token is only as wide as its character class.** The separator-dash
   token first accepted an interpolation or an alphanumeric after the hyphen. That
   left `VectorFieldChart`'s own data list outside it: `y ${datum.y} · |v| ${…}`
   turns into `} - |`, and `|` was not in the class. Both failure modes of blind
   spot 5 then stacked — presence of `·` was unchanged because the tooltip still
   spelled it, and the regex did not fire — so the whole gate passed **6/6 on that
   regression**. `|` is in the class now, and the addition is measured, not
   assumed: over the 223 pairs, both sides each, the widened form matches the same
   four places as the narrow one (`DatePicker`, `Transcription`, symmetric on both
   frameworks, hence silent) and one more only when the regression is present.
   A test in the gate file asserts both directions, so neither can be lost again.
   **Widening a token is not free**: a false finding sends a reader to correct code,
   which is worse than a missed one, so widen by the character a measured defect
   needs and re-measure the whole corpus, never by "any character".

Widening a gate's vocabulary is cheap and pays immediately: `°`, `·`, `—` and `×`
raised eleven findings, of which four were spelling variants that render
identically (`\xB7`, `&#xD7;`, an HTML comment in a template, a `console.warn`
argument). Normalise those four cases rather than exempt the components, and each
normalisation keeps a test proving it kills a measured false finding.

When a divergence is about *text a person reads*, prefer a source-level comparison:
it sees hovered states, and it sees components no adapter has reached yet.

## Known debt

Each item carries the cost the parity harness measures for it, so a lot can pick
the cheapest win. Four items are closed: `Inline` now takes ARIA inputs, the
`display:none` visibility gates are gone, the shared `st-graphLegend` block is no
longer hidden from assistive technology (`ArcDiagramChart` and
`DependencyWheelChart` went from 49 markup / 9 signature / 49 bare-DS entries each
to 0 / 0 / 0, and both stay in the harness's control-equality list so the repair
cannot silently reopen), and seven reader-visible strings in components-angular now
match the React spelling.

- **`NG-A11Y-FORCEGRAPH` — a graph's nodes are unreachable and unannounced in
  Angular.** React's `ForceGraph` node shape carries `tabIndex=0`,
  `role="button"`, `aria-label` and `aria-pressed`, so a keyboard user reaches a
  node and a screen reader names it; the Angular node carries none of the four.
  React also renders an invisible wider `st-forceGraph__edgeHit` path per edge
  (`role="presentation"`) for hover, and Angular renders none. Cost: **42 markup
  and 8 content-signature entries** on `ForceGraph`, equal to its bare-DS control,
  so the whole residue sits in `packages/components-angular/src/ForceGraph.ts` and
  none of it in the adapter. **The most valuable open item, and an accessibility
  defect rather than a cosmetic one** — the same class as the legend repair closed
  above.

  This is a deficit that predates the Angular adapter, not a regression it
  introduced; but the adapter newly *exposes* it, so it is carried as a named
  follow-up rather than as a closed observation. What the next lot has to port,
  and nothing beyond it:

  | to port | from | into |
  | --- | --- | --- |
  | `tabIndex=0`, `role="button"`, `aria-label`, `aria-pressed` on the node shape | `packages/components-react/src/catalog.tsx`, `ForceGraph` | `packages/components-angular/src/ForceGraph.ts` |
  | `focus`, `blur` and `keydown` handling (the node is operable, not only focusable) | same | same |
  | the per-edge `st-forceGraph__edgeHit` path, `role="presentation"`, wider than the visible edge, for hover | same | same |

  Acceptance is the number, not a reading: `npm run parity:dataviz-angular` must
  take `ForceGraph` from 42 markup / 8 signature to 0 / 0 **and** its bare-DS
  control with it, exactly as `ArcDiagramChart` and `DependencyWheelChart` went
  49 / 9 / 49 → 0 / 0 / 0. It stays in the harness's control-equality list, so a
  repair in the adapter instead of the DS component fails the gate. Tracked in
  `plan/10-BRANCH_graph-dataviz-repatriation.md` under `GD-M2-PARITY`.
- **React warns where Angular is silent.** `NavActionStack`'s React implementation
  logs a warning when several `primary` actions are passed and degrades the extras;
  the Angular one has no such warning. Developer-facing, so outside the glyph
  gate's remit, which is why that gate drops `console.*` arguments.
- **`data-chart-key` / `data-chart-index` are Angular-only.** Angular tags each
  datum group with an index attribute React does not emit: 3 entries each on
  `VectorFieldChart`, `WindBarbChart`, `OHLCChart` and `DumbbellChart`. Harmless
  for a reader; pick one convention across the two frameworks.
- **The two frameworks draw a different timeline.** Angular uses
  connector + marker + label, React tick + tickLabel. Cost: 59 entries on
  `TimelineChart`. A design divergence to arbitrate, not a wiring bug.
- **`TreemapChart` and the `DashboardFilterBar` primitives** still differ inside
  the DS components (76 and 106 entries, both equal to their bare-DS controls).
- **components-react puts colour and size in inline styles** where Angular uses
  attributes or the stylesheet: `MekkoChart`'s cell label `style="fill:…"` (3
  entries) and `DumbbellChart`'s `style="font-size:…"` (3 entries, and the shared
  stylesheet already carries that exact value). Angular's form is the one the
  repository's `csp-no-style-attr` posture wants, so these are `components-react`
  fixes.
- **The data helpers are duplicated, not shared.** `categoricalData.ts`,
  `partOfWholeData.ts`, `distributionData.ts`, `geoMapLayers.ts` and
  `analyticsDsData.ts` exist once per adapter package. None of their exported symbols is in `@sentropic/dataviz-core`,
  and all four packages already depend on it, so the resolution is to promote them.
  `scripts/verify-dataviz-helper-copies.test.mjs` pins every copy until then.
- **`ChartDataList` renders an empty `<ul>`** where React renders nothing. No
  adapter in the current lots produces an empty list.
- **Four DS components render no accessible value list at all**: `EventFeedPanel`
  (a feed), `ForceGraph`, `Sparkline` and `KpiCard` (the last two carry their
  accessible name on the root element instead). Their adapters therefore cannot
  assert one, and `generated-adapters.test.ts` carries `listAria: null` for the two
  it holds — the absence is asserted, and their reactivity proof moves to their
  datum elements. In the parity harness the same four (plus the five non-chart
  cases) are named in `NO_DATA_LIST`, which is what stops the list-identity
  assertion from passing on empty-vs-empty. Inventing a list in the adapter would
  be the divergence.
- **`Flex` and `Stack` have no ARIA inputs** — the same one-line change `Inline`
  received, when an adapter needs it.
- **`DateRangeFilter`: React serialises `value=""`** on the readonly input where
  Angular sets the property. One entry, no behavioural difference.
- **The DS `Sparkline` root is a `div` in Angular and a `span` in React.** Cost:
  **2 entries** on `Sparkline`, equal to its bare-DS control. Not cosmetic in CSS
  terms — one is block, the other inline — so it is an arbitration between the two
  `packages/components-*` implementations, not an adapter fix. Measured in lot 5.
- **The DS `StepLineChart` line path differs in both spelling and stroke.** React
  writes `H`/`V` shorthand and sets `stroke-width`, `stroke-linecap` and
  `stroke-linejoin` on the path; Angular writes explicit `L` segments and sets
  none of the three, so the same geometry renders with a different stroke. Cost:
  **1 entry** on `StepLineChart`, equal to its bare-DS control. Measured in lot 5.
- **components-react repeats a tone class on each diverging bar.**
  `st-divergentBarChart__bar--positive` appears twice in the React class list and
  once in the Angular one. Cost: **2 entries** on `DivergingBarChart`, equal to its
  bare-DS control. A `components-react` fix, and the cheapest of the three.

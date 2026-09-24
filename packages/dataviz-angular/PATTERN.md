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
three data-helper modules: the reference packages do not. `src/index.test.ts`
asserts the whole surface — add the new name to its `components` table.

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
another cross-filter view changes what is rendered.


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

Two blind spots are properties of measuring **rendered markup**, not accidents of a
lot. Both bit this package, and a sweep validated only by the harness cannot be
called complete because of them:

1. **Text that only exists on hover.** An Angular tooltip is rendered but empty
   without a pointer, so no text node exists in a static render and the content
   signature has nothing to compare. `RenkoChart`'s tooltip kept `UP`/`DOWN` and
   `->` for a whole review round after its data list had been aligned, and the
   harness reported that adapter as clean on content signature.
2. **Components outside the adapters the harness mounts.** `PARITY.md` covers the
   ported adapters and nothing else. `PointAndFigureChart` read `X 104.8 -> 105`
   against React's `X 104.8 → 105` and no measurement touched it.

`scripts/verify-angular-react-glyphs.test.mjs` closes that class by reading the two
**sources** instead of the two renders: it compares the presence of each direction
token per component, both ways, over **224** components — so a token both
frameworks use (the `SankeyChart`'s `source -> target`) is not a finding. Comments
are stripped first, because prose uses arrows far more than rendered strings do and
comparing raw files reports 58 files of noise.

When a divergence is about *text a person reads*, prefer a source-level comparison:
it sees hovered states, and it sees components no adapter has reached yet.

## Known debt

- **The data helpers are duplicated, not shared.** `categoricalData.ts`,
  `partOfWholeData.ts` and `distributionData.ts` exist once per adapter package,
  byte-identical; `geoMapLayers.ts` too, except for its design-system type import.
  None of their exported symbols exists in `@sentropic/dataviz-core`, and all four
  adapter packages already depend on core, so the resolution is to promote them and
  delete the copies. Until then `scripts/verify-dataviz-helper-copies.test.mjs`
  pins every copy — byte-for-byte for the three, modulo the one import line for
  `geoMapLayers.ts`. Do not edit one package's copy.
- **`data-chart-index` is Angular-only on some charts.** `OHLCChart` and
  `DumbbellChart` emit it on each mark; their React counterparts do not, which is
  the whole of their residual markup difference (3 entries each, equal to the bare
  DS control). React already uses the attribute on other charts, so adding it there
  is the likely resolution; it is a `components-react` change.
- **Angular renders tooltips always, React only on hover.** The Angular
  `RenkoChart` keeps a hidden `__tooltip` in the DOM (`[style.display]`), React
  omits it until hovered: 7 of `RenkoChart`'s entries, and probably most of
  `HeatmapChart`'s 27. One pattern, several components.
- **`ChartDataList` empty-list behaviour.** React's shared helper renders nothing
  when the item list is empty; the Angular charts render an empty `<ul>`. No
  adapter in the current lots produces an empty list.
- **`Flex` and `Stack` have no ARIA inputs** (trap 6 closed this for `Inline`
  only). Same one-line change when an adapter needs it.


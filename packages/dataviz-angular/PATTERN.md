# Porting a store-driven adapter to `@sentropic/dataviz-angular`

This is the recipe used to port the first ten adapters of the lot
(`AreaChart`, `DonutChart`, `HeatmapChart`, `ScatterPlot`, `TreemapChart`,
`DashboardFilterBar`, `DateRangeFilter`, `RecordsTable`, `KpiCardGroup`,
`SelectionLegend`). Follow it verbatim for the next lots: every step below
exists because something broke without it.

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

## 6. Exports

Add the component and its `…Props` type to `src/index.ts`, plus any pure helper
the reference packages export (`dateRangeToSpec` is exported by
`dataviz-react`/`dataviz-vue`, so it is exported here too). Do **not** export the
three data-helper modules: the reference packages do not. `src/index.test.ts`
asserts the whole surface — add the new name to its `components` table.

---

## Traps actually hit while porting these ten

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
6. **ARIA attributes cannot be pushed into a DS component's inner element.**
   `SelectionLegend` passes `role="group"` + `aria-label` to `Inline`; DS Angular
   `Inline` only accepts `gap/align/justify/wrap/as/class`, so the two attributes
   land on the `<st-inline>` host element instead of the `.st-inline` div that
   React/Vue decorate. Assistive technology still finds the labelled group; the
   markup position differs. Closing this needs an ARIA input on
   `components-angular/src/Inline.ts`, i.e. a DS change, not an adapter change.
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
13. **Two DS-level divergences are visible from the adapters and are not ours.**
    `components-angular`'s `HeatmapChart` and `TreemapChart` label their
    accessible data list `"<label> data"`, where `components-react` labels it
    `"Data values for <label>"`. The Angular tests assert the Angular wording
    with a comment pointing at the divergence, rather than pretending parity.

---

## Proving parity with React or Vue

The adapters are compared by **rendered markup**, attribute by attribute, against
`@sentropic/dataviz-react`. Method (run from a scratch directory outside the
package so that no React dependency enters this package's manifest):

1. Render the Angular adapter with `TestBed` (jsdom) and the React adapter with
   `renderToStaticMarkup`, from the **same** fixture data and the same props.
2. Flatten both DOMs into an order-sensitive list of
   `<tag attr="value" …>` / `#text` entries, with a short, explicit allowlist for
   differences that belong to the DS packages rather than to the adapters:
   `data-st-component` (emitted by every DS Angular component, by no DS React
   one), generated ids (Angular counter / `Math.random()` vs React `useId()`),
   `style` formatting (`a: b;` vs `a:b`), the empty `class=""` React renders, and
   the `xmlns`/`lucide-*` class the React icon helper carries. Unwrap the
   `<st-*>` host elements, drop comment nodes, sort attributes and class tokens.
3. Diff position by position, and diff a second, weaker signature: every text
   node plus every `aria-label`/`placeholder`/`title`/`alt` value, in document
   order — the user- and AT-visible content, independent of the wrapper
   elements the DS chose.
4. Run the same comparison on the **DS components alone**, with identical inputs.
   A diff count that is identical at both levels proves the divergence lives
   below the adapter.

Result for this lot: five adapters (`AreaChart`, `DonutChart`, `ScatterPlot`,
`KpiCardGroup`, `RecordsTable`) match React with **zero** differing entries, class
passthrough included. `DashboardFilterBar` matches on content signature with zero
differences while its markup differs only inside the DS primitives.
`HeatmapChart` and `TreemapChart` show exactly the same diff count as the bare DS
components (28 and 76), i.e. no adapter-attributable difference.
`DateRangeFilter` differs by one entry (React serialises `value=""` on the
readonly input, Angular sets the property). `SelectionLegend` differs by trap 6
plus the DS `SelectionChip` icon path.

# dataviz-angular port generator

Turns a `dataviz-vue` adapter into a `dataviz-angular` adapter through a
reviewable descriptor, instead of hand-copying the same skeleton per component.

```sh
# 1. read the Vue sources and write descriptors.json
node tools/dataviz-angular-port/extract.mjs AreaRangeChart ColumnRangeChart …

# 2. emit packages/dataviz-angular/src/lib/<Name>.ts from it
node tools/dataviz-angular-port/emit.mjs
```

## Why a descriptor

The adapters are state wiring: read the store, derive an array with a
framework-free builder, hand it to a design-system component. Everything that
differs between two adapters of the same family is data — the component name, the
DS component, the builder, the config keys, the prop list. `extract.mjs` recovers
that data from the Vue source; `emit.mjs` is deliberately dumb and renders it.
**Review `descriptors.json`, not the emitter.**

## What extract.mjs reads, and from where

| Descriptor field | Source of truth |
| --- | --- |
| prop names and TS types | the Vue `export type <Name>Props` alias — the cross-framework API contract |
| required / default | the Vue `props: { … }` runtime block |
| DS component + its selector | the Vue `@sentropic/design-system-vue` import, then `selector:` in `packages/components-angular/src/<Ds>.ts` |
| derivation (builder, wrap, config) | the `setup()` body |
| bindings | the trailing `h(Ds…, { … })` call, with Vue's `as any` casts dropped |
| derived field's type | the declared type of the DS `@Input` that consumes it, read from components-angular |

## What it refuses

`extract.mjs` throws rather than guess. It recognises four derivation shapes —
`builder(model, rows, cfg)`, `wrap(builder(model, rows, cfg))`,
`layerFn(store, viewId, cfg)`, and the same builder call written **inline inside an
h() binding** with no `const` — and four binding shapes: the derived value itself,
`[derived]` handed to a plural input, `mapClass('st-x', props.class)`, and a
**member of the derived model** (`model.items`, `wrap(model.items)`), including the
case where several inputs read different members of one model. It anchors the
reactivity read on `void <anything>.value`, since each adapter names that local
itself. A component whose `setup()` does
anything else (local state, several `h()` calls, emitted events, slots) is reported
as a skip and must be written by hand.

Ask the tool how far it reaches, rather than estimating:

```sh
node tools/dataviz-angular-port/classify.mjs          # add --names for the lists
```

It runs the real `extract()` over every pending adapter and prints what it reads,
what it refuses and why. The arc so far: the third lot widened the vocabulary from
**28 of 87** readable to **41 of 87** and ported 25 of them; the fourth widened it
again, from **16 of 62** to **21 of 62**.

That second widening is much smaller than the first, and the refusal table says why:
the vocabulary is close to its natural limit. Of the 41 still refused, **16 never
read the dashboard signal at all** — stateful panels and filters
(`BookmarkNavigator`, `CalculationEditor`, `FormatPanel`, `FieldPane`,
`ExportMenu`, `TopNFilter`, `ValueSlicer`, …) that hold local state and will not
benefit from a generator; **10 build their data bespoke** (a hand-written array
literal, a `.map()` over the model, positional builder arguments with
post-processing); and **9 are structural** — 3 render several charts from one
adapter, 3 have no `Props` alias, 2 exist in one framework only, 1 imports no
design-system component. The cheapest widening left is positional builder arguments
(`builder(model, rows, props.date, props.measure)`), worth one or two components.

What is still refused is mostly *not* the same kind of component: 16 have no
`void <state>.value` read at all — they are stateful panels and filters
(`BookmarkNavigator`, `CalculationEditor`, `FormatPanel`, `FieldPane`,
`ExportMenu`, `TopNFilter`, …) that hold local state and belong in hand-written
code; 3 render several charts from one adapter (`ScatterPlotMatrix`,
`AnimatedBubbleChart`, `AdvancedPivotDataTable`); 3 have no `Props` alias; 2 exist
in one framework only and have no Vue source to read. The remaining 8 "no binding
consumes the derived …" are the next cheap widening if a lot needs them.

## Adding a lot

1. Run `extract.mjs` with the names. Read the printed one-line-per-component
   summary and then `descriptors.json`; a `SKIP` line means hand-writing.
2. Run `emit.mjs`, then `npm run check -w @sentropic/dataviz-angular`. The
   emitted files are committed: they are the source, not a build artefact.
3. Add each adapter to `packages/dataviz-angular/src/index.ts`, to the expected
   list in `src/lib/adapter-pattern.test.ts`, to the family table in
   `src/lib/generated-adapters.test.ts`, and to
   `tools/dataviz-angular-parity/parity.test.ts`.
4. Declare every new file in `docs/graph-dataviz-m1-provenance.json`.

## Editing an emitted adapter

Prefer changing the descriptor and re-emitting. If an adapter needs something the
descriptor cannot express, delete its entry from `descriptors.json` so the next
run does not overwrite the hand-written file, and say so in its header comment.

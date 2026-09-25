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

### Exit codes

The refusal is loud on stderr, and it is also in the exit code — a refusal that
only prints is invisible to anything that checks `$?`, and a whole lot the tool
rejects would otherwise look like a successful run:

| rc | meaning |
| --- | --- |
| `0` | at least one component was extracted; `descriptors.json` was rewritten. A `SKIP` inside the batch is a normal outcome — that adapter is hand-work — and the summary line names the refused ones. |
| `1` | **nothing** was extracted although components were named: every one was refused. `descriptors.json` is left untouched. |
| `2` | no component was named at all (running with no names would overwrite the ledger with an empty list). |

Ask the tool how far it reaches, rather than estimating:

```sh
node tools/dataviz-angular-port/classify.mjs          # add --names for the lists
```

It runs the real `extract()` over every pending adapter and prints what it reads,
what it refuses and why. The arc, measured by the tool itself at the end of each
lot: the third widened the vocabulary from **28 of 87** readable to **41 of 87** and
ported 25 of them; the fourth widened it again, from **16 of 62** to **21 of 62**,
and ported all 21 — minus two that the tightening then refused on purpose
(`StackedBarChart`'s `measures: [props.measure]`, `ComboChart`'s pass-through
`bars`/`lines`), so nineteen shipped.

**The lever is now spent, and that is a measurement, not an impression.** After the
fourth lot the tool reads **0 of the 43 pending**. The refusal table says why, and
it is a different population from the one the generator was built for:

    16  no `void <state>.value` marker           stateful panels and filters
    10  setup body matches no supported shape    bespoke data building
     6  a binding reads a prop the descriptor cannot express
     3  no trailing h() call                     several charts per adapter
     3  no Props type alias
     2  no dataviz-vue source                    one-framework-only components
     2  two wrapping calls / non-`props.x` config entry
     1  no design-system-vue import

The 16 without a signal read (`BookmarkNavigator`, `CalculationEditor`,
`FormatPanel`, `FieldPane`, `ExportMenu`, `TopNFilter`, `ValueSlicer`, …) hold
local state; a descriptor has nothing to say about them. Widening further would
mean teaching the extractor to read hand-written data construction, which is
writing the adapter twice. The remaining 43 are hand-work.

Lot 5 took the first slice of that hand-work: **eight** of the ten refused with
`setup body matches no supported shape`, leaving `union 119 / ported 84 /
pending 35`. Two of the ten were dropped after reading them, and the reason is
worth keeping, because it is the shape of the rest of that class:
`DrillChart` delegates to `DrillBarChart` (not ported) and needs `drill.ts`
(not copied into this package), and `SmallMultiples` needs `role` and
`aria-label` on the DS `Grid`, which it does not declare — so parity with Vue is
unreachable without changing `packages/components-angular`. A slice of eight
measured is worth more than ten announced.

Lot 7 took the **six** refused with `binding '<name>' reads '<name>', which the
descriptor cannot express` — `ComboChart` (`bars`/`lines`), `PivotDataTable`
(`columns`), and `ErrorBarsChart` / `PercentileBandChart` / `ReferenceLineChart`
/ `TrendLineChart` (`data`) — leaving `union 119 / ported 90 / pending 29`. Every
one of the six has the rest of the shape the descriptor targets — the `void
<state>.value` marker, a single terminal `h()`, an existing
`packages/components-angular` component with the inputs the binding needs — and
is refused only because its `data`/`bars`/`lines`/`columns` binding is a
`.map()`, a `.filter().map()`, or a multi-member array literal built from the
derived model, not a bare member read or the descriptor's one supported
wrapping call. That is ordinary hand-work inside the same recipe PATTERN.md
already documents (§3 "Reuse, never re-derive"), not a new shape: none of the
six needed a change to `packages/components-angular`, so none was dropped.
`PivotDataTable` is the one Angular-specific wrinkle worth naming: its Vue/React
source shadows the pivot-config `rows`/`columns` props with a `let` of the same
name inside the derivation, which Angular's class fields cannot do — the ported
adapter keeps the public `rows`/`columns` `@Input`s and names the DS-facing
derived arrays `tableRows`/`tableColumns` instead.

## Adding a lot

1. Run `extract.mjs` with the names. Read the printed one-line-per-component
   summary and then `descriptors.json`; a `SKIP` line means hand-writing.
2. Run `emit.mjs`, then `npm run check -w @sentropic/dataviz-angular`. The
   emitted files are committed: they are the source, not a build artefact.
3. Add each adapter to `packages/dataviz-angular/src/index.ts`, to the expected
   list in `src/lib/adapter-pattern.test.ts`, to the family table in
   `src/lib/generated-adapters.test.ts` (that file's name is historical — it holds
   hand-written adapters of the same shape too), and to
   `tools/dataviz-angular-parity/parity.test.ts`. An adapter whose DS component
   renders no value list cannot be proved by that table: give it its own
   `<Name>.test.ts` and name it in the harness's `NO_DATA_LIST`.
4. Declare every new file in `docs/graph-dataviz-m1-provenance.json`.

## Editing an emitted adapter

Prefer changing the descriptor and re-emitting. If an adapter needs something the
descriptor cannot express, delete its entry from `descriptors.json` so the next
run does not overwrite the hand-written file, and say so in its header comment.

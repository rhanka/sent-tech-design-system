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

`extract.mjs` throws rather than guess. It recognises three derivation shapes —
`builder(model, rows, cfg)`, `wrap(builder(model, rows, cfg))`, and
`layerFn(store, viewId, cfg)` — plus two binding shapes, `[derived]` handed to a
plural input and `mapClass('st-x', props.class)`. A component whose `setup()` does
anything else (local state, several `h()` calls, emitted events, slots) is
reported as a skip and must be written by hand. Of the 106 adapters left after the
first lot, a classification pass put 85 in the generatable set and 21 outside it.

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

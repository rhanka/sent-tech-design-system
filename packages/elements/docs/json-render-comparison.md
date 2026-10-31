# json-render comparison (§6.2) — L2 note

The spec (§6.2) requires recording how the same catalogue component renders
through the third-party `@json-render` stack, and why this package keeps its
own JSON-render route. This note is that record. **json-render is not
adopted** — the comparison is informational; nothing in the package depends
on it.

## What was measured

The probe (a throwaway harness, not shipped) rendered the design system's
`BarChart` through `@json-render/core` 0.21.3 + `@json-render/svelte`
0.21.3 (Vercel Labs, Apache-2.0), catalogue schema expressed in **Zod**
(core's own nested copy, 4.6.7 — the package requires `zod ^4`), with the
same fixture the Chromium suite uses for P-DATA:

- their own `validateSpec(spec, { schema, catalog })` — result `valid: true`,
  no issues;
- their `CatalogRenderer` mounted with a registry that maps the catalogue
  entry to the real `BarChart` — rendered: SVG present, 3 bars, zero
  console errors.

### Runtime size

| Route | raw | gzip | What is in it |
| --- | --- | --- | --- |
| json-render (`@json-render/core` + `@json-render/svelte` + zod 4.6.7 + `BarChart` + adapter) | 216,506 B | 65,372 B (+ 1,747 B CSS) | spec-tree rendering, Zod catalogue validation, one component |
| This package, core chunk (`elements.js` — envelope validator, error panel, theme scoping, shadow-DOM wrapper, `st-bar-chart`) | 239,084 B | 53,435 B | everything above EXCEPT their renderer, PLUS envelope semantics (§4.4), §4.5 refusal panel, §6.3 theme adoption in shadow roots, §4.6 intent events |

\* raw/gzip of the current build; the authoritative record is
`dist/browser/sri.json` (core: 239,084 B raw / 53,435 B gzip / 40,402 B brotli).

Their route costs ~12 kB gzip MORE than our entire core while covering less:
no envelope document semantics, no refusal/error panel, no shadow-DOM
isolation, no theme scoping, no intent events, no lazy engine boundary. A
page would still need our validator, panel and wrapper layers on top.

## Schema form

- **Our route (L1)**: JSON Schema 2020-12 documents (catalogue, envelope,
  common types), generated from the components' source, validated by the
  package's validator — the same schemas a host can reuse server-side.
- **json-render**: a catalogue is a map of **Zod schemas** (one per
  component) plus their own `defineSchema`/`defineCatalog` DSL; specs are
  **flat element trees** (`{ root, elements: { key: { type, props,
  children, visible?, repeat? } } }`) rather than the envelope's nested
  document; state model and action bindings are separate spec-level
  constructs. Zod schemas are TypeScript-first and cannot be transported to
  a host as data the way JSON Schema can (§11.3 P-DATA: the envelope is the
  payload).

## Catalogue mapping (what adopting would require)

- Every catalogue component must be re-expressed as a Zod props schema.
  The 2020-12 entries (generated, versioned, reused by the host) would
  duplicate as hand-written Zod objects with no generation path — two
  sources of truth for the same contract.
- json-render components do not receive their props flat: the registry calls
  them with their `BaseComponentProps` contract
  (`{ props, children, emit, on, bindings, loading }`). A design-system
  component registered directly renders nothing (its `data` prop stays
  undefined under `props.props.data`); the probe needed a per-component
  Svelte adapter to spread `props.props` and translate callbacks. The whole
  `packages/components-*` surface would need such adapters.
- Component callbacks cannot ride the spec (it is data); json-render routes
  them through its action registry (`on` bindings + `emit`), which is a
  different model from §4.6's closed intent events (`st-intent` with a
  closed detail shape, composed through the shadow boundary).
- Envelope semantics (§4.4), the §4.5 refusal panel, §6.3/§6.4 isolation
  and §6.5 hostConfig have no counterpart in the stack.

## Verdict

Not adopted: 0.x-versioned Labs packages, a spec format of its own, a Zod 4
peer dependency (the worktree's own hoisted zod is 3.x — two majors would
coexist), a component contract that forces adapters over every DS
component, and a route that is heavier than our core while covering less.
The comparison is recorded here so the decision can be revisited with
numbers if json-render stabilizes.


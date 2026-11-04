# @sentropic/design-system-component-index (private, K1a + K1b)

Hand-authored `component-entry/v1` + `component-index/v1` schemas and the
deterministic generator that emits `generated/component-index.json` plus
`generated/entries/<componentId>.json` from the docs catalogue, the eight
framework barrels, the Elements catalogue and the overlay. K1b adds the
hand-authored `component-contract/v1` + `component-contract-index/v1`
schemas and derived per-framework contracts
(`generated/contracts/<componentId>.json` plus
`generated/component-contract-index.json`). Drift turns CI red via
`scripts/component-index.test.mjs`.

No entry is hosted or published by this package: every generated entry is
`doc-only`, and nothing here is exposed as an MCP surface.

Frozen values (k1a-spec-frozen.md): `producerId` is `"sentropic-ds"`; every
DS entry carries `scope: "generic"`, `visibility: "public"` (no
`scopePolicyRef`), `dataClass: "public-safe"`, and the four-key parity map
(`svelte`, `react`, `vue`, `angular` each `match`, `source-of-truth`,
`no-counterpart` or `missing`). `frameworks[]` is the present-keys
projection of the map. The generator and the schemas reject every retired
predecessor value (`"ds"`, `"approved"`, `"tenant-scoped"`, any `tenant`
field, string parity, `"dataviz"`/`"not-applicable"`/`"mismatch"` parity
values, `"none"`/`"non-personal"`/`"personal"` data classes,
`frameworks` containing `"js"`).

## Commands

- `npm run build -w @sentropic/design-system-component-index` — compile the generator (`tsc`).
- `npm run index:generate -w @sentropic/design-system-component-index` — regenerate and write every artifact (K1a entries and index, then contracts and contract index).
- `npm run index:check -w @sentropic/design-system-component-index` — regenerate in memory and exit 1 on any stale, missing or unexpected file, K1a and contracts alike. `--root <dir>` redirects only the committed-artifact reads, for negative tests.
- `npm test -w @sentropic/design-system-component-index` — package suite (`vitest run`).
- Declaration builds first: the contract extractor reads the built `.d.ts` of the eight component packages (`npm run build -w @sentropic/design-system-svelte` and the react, vue, angular, dataviz-svelte, dataviz-react, dataviz-vue, dataviz-angular workspaces). `dist/` stays uncommitted.

## Input / output map

Inputs (all committed, read from the generation checkout):

- `apps/docs/src/lib/components-catalog.ts` — editorial source (parsed with the TypeScript compiler API).
- `packages/components-{svelte,react,vue,angular}/src/index.ts` and `packages/dataviz-{svelte,react,vue,angular}/src/index.ts` — presence and source-file resolution. The contract extractor additionally reads each delivery source's barrel re-export to recover the component identifier (names and paths only, never type structure).
- Framework, dataviz, tokens, themes and Elements manifests — exact version pins.
- `packages/elements/catalog.json` + `packages/elements/schemas/*.v1.json` — Elements contracts (including the `no-counterpart` parity roles).
- `catalog-overlay.json` — non-catalogue entries and reviewed exclusions.
- `parity-baseline.json` — expected parity maps and barrel-only inventory, format version 2 (reviewed data; the generator never writes it).
- `schemas/component-contract.v1.json`, `schemas/component-contract-index.v1.json` — the K1b contract schemas (hand-authored, reviewed).
- `contract-baseline.json` — expected per-framework completeness plus full member lists for the witness components (reviewed data; the generator never writes it).
- Built declarations (`packages/*-{svelte,react,vue,angular}/dist/**/*.d.ts`) — the only type input to the extractor, via the TypeScript compiler API.

Outputs (committed, byte-deterministic): `generated/component-index.json`, `generated/entries/*.json`, `generated/contracts/*.json` (one per population entry), `generated/component-contract-index.json`.

## Contracts (K1b)

Every contract is `contractSource: "derived"`: the generator never emits
`published`, and the schema keeps that value only as vocabulary the DS
profile refuses to mint. Each framework cell carries `complete`, `partial`
or `none` completeness with itemised losses (`dropped`, `replaced`,
`unresolved` rows plus `warnings` and `limitations`); a `none` cell names
its reason (`absent`, `no-props-type`) and pins the searched barrel bytes,
never a fabricated declaration. `entryDigest` joins each contract to its
K1a entry, and the contract index mirrors every row back to its document
(entryDigest, contractDigest, per-framework completeness) with counts that
sum to the population per framework (see the generated contract index for
the numbers; no counts are hand-maintained here).

No derived contract is a published or validatable render contract: the
documents describe declaration-derived surfaces (props as JSON Schema,
slots, events, bindable names) with explicit losses, not executable or
hosted behavior.

## Filter projections (K2; recorded here, implemented there)

No K1a code mints a `js` framework value or an `origin` field: entry
`frameworks[]`, delivery `framework` and parity keys stay four-valued, and
no schema, constant, entry or test carries a `js` enum value, an `origin`
field or a `ds-dataviz` value.

- `framework=js` (K2 list filter over the five build targets) matches an
  entry exactly when its `delivery[]` contains an `element` channel: today
  that is `bar-chart` (`st-bar-chart`) plus `bpmn-canvas` and
  `decision-dossier` when those entries are emitted. The `js` target is
  vanilla ESM plus Elements custom-element registration with no framework
  runtime. Dataviz provenance stays in `delivery[].package`
  (`@sentropic/dataviz-*`) and never adds a framework value.
- `origin` (K2 list filter and output projection) is derived, never stored:
  `producer` when `producerId` is not `sentropic-ds`; `ds-geo` is reserved
  for `geo-map` from `packages/components-geo-svelte`;
  `ds-elements` for entries with an `element` delivery and no native
  `source` delivery; `ds-native` for everything else. All dataviz entries
  take `origin: ds-native` with `doc-only`; their provenance lives in
  `delivery[].package` (`@sentropic/dataviz-*`).

## Fail-closed rules

Missing input fails loudly: absent source file, range version, missing or
empty or over-280 bilingual text, overlay collision with a catalogue slug,
baseline mismatch, stale baseline row, version-1 baseline, an
exported-nowhere row (all `missing` with no dataviz delivery), a present
geo package (conductor Q8 OUT). Excluded overlay rows (`bpmn-canvas`,
`decision-dossier`, `geo-map`) are logged to stderr on every generation
and emitted nowhere; no digest is fabricated for them. `--check`
additionally refuses unexpected entry files. Contract-side rules: a
population component missing from `contract-baseline.json` fails loudly
naming the component; a baseline deviation names the component and
framework; `complete` with a non-empty loss list, a missing limitations
entry, or any `published` contract is a generator error; hand-edited or
deleted contract documents and stray files under `generated/contracts/`
turn `--check` red naming the file. Resource-address prose: DS
entries live under `components://sentropic-ds/<slug>@<sha256>` (K5a).

## Lockfile note

`package-lock.json` lists this workspace (`@sentropic/design-system-component-index`,
`private`, `0.2.0`) so `npm ci` passes. The K1a repair also syncs one
pre-existing stale line the base commit already carried
(`packages/elements` `0.1.0` → `0.2.0`, matching its manifest at the base);
no dependency version, integrity or resolution changed.

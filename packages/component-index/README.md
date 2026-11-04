# @sentropic/design-system-component-index (private, K1a)

Hand-authored `component-entry/v1` + `component-index/v1` schemas and the
deterministic generator that emits `generated/component-index.json` plus
`generated/entries/<componentId>.json` from the docs catalogue, the eight
framework barrels, the Elements catalogue and the overlay. Drift turns CI
red via `scripts/component-index.test.mjs`.

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

- `npm run index:generate -w @sentropic/design-system-component-index` — regenerate and write every artifact.
- `npm run index:check -w @sentropic/design-system-component-index` — regenerate in memory and exit 1 on any stale, missing or unexpected file.
- `npm test -w @sentropic/design-system-component-index` — package suite (`vitest run`).

## Input / output map

Inputs (all committed, read from the generation checkout):

- `apps/docs/src/lib/components-catalog.ts` — editorial source (parsed with the TypeScript compiler API).
- `packages/components-{svelte,react,vue,angular}/src/index.ts` and `packages/dataviz-{svelte,react,vue,angular}/src/index.ts` — presence and source-file resolution.
- Framework, dataviz, tokens, themes and Elements manifests — exact version pins.
- `packages/elements/catalog.json` + `packages/elements/schemas/*.v1.json` — Elements contracts (including the `no-counterpart` parity roles).
- `catalog-overlay.json` — non-catalogue entries and reviewed exclusions.
- `parity-baseline.json` — expected parity maps and barrel-only inventory, format version 2 (reviewed data; the generator never writes it).

Outputs (committed, byte-deterministic): `generated/component-index.json`, `generated/entries/*.json`.

## Filter projections (K2; recorded here, implemented there)

No K1a code mints a `js` framework value or an `origin` field: entry
`frameworks[]`, delivery `framework` and parity keys stay four-valued, and
no schema, constant, entry or test carries a `js` enum value, an `origin`
field or a `ds-dataviz` value.

- `framework=js` (K2 list filter over the five build targets) matches an
  entry exactly when its `delivery[]` contains an `element` channel: today
  that is `bar-chart` (`st-bar-chart`) plus `bpmn-canvas` and
  `decision-dossier` when those entries are emitted. Dataviz provenance
  stays in `delivery[].package` (`@sentropic/dataviz-*`) and never adds a
  framework value.
- `origin` (K2 list filter and output projection) is derived, never stored:
  `producer` when `producerId` is not `sentropic-ds`; `ds-geo` only for
  `geo-map`; `ds-elements` for entries with an `element` delivery and no
  native `source` delivery; `ds-native` for everything else, including all
  dataviz entries. The review sentence that dataviz "rides `origin:
  ds-geo`" is `contested — pending sentropic/owner`: it is not adopted,
  because `ds-geo` names the unrelated single-component geo adapter
  package. The exact alternative, if a dedicated dataviz filter is
  required, is a versioned K2-only `ds-dataviz` value (same
  delivery-package predicate) — never a reuse of `ds-geo`, and still no
  change to any DS entry or digest either way.

## Fail-closed rules

Missing input fails loudly: absent source file, range version, missing or
empty or over-280 bilingual text, overlay collision with a catalogue slug,
baseline mismatch, stale baseline row, version-1 baseline, an
exported-nowhere row (all `missing` with no dataviz delivery), a present
geo package (conductor Q8 OUT). Excluded overlay rows (`bpmn-canvas`,
`decision-dossier`, `geo-map`) are logged to stderr on every generation
and emitted nowhere; no digest is fabricated for them. `--check`
additionally refuses unexpected entry files. Resource-address prose: DS
entries live under `components://sentropic-ds/<slug>@<sha256>` (K5a).

## Lockfile note

`package-lock.json` lists this workspace (`@sentropic/design-system-component-index`,
`private`, `0.1.0`) so `npm ci` passes. The repair also syncs one
pre-existing stale line the base commit already carried
(`packages/elements` `0.1.0` → `0.2.0`, matching its manifest at the base);
no dependency version, integrity or resolution changed.

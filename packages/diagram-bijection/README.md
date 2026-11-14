# @sentropic/diagram-bijection

The B2 bijection demonstration harness (frozen spec:
`spec/SPEC_EVOL_DL01_BIJECTION_HARNESS.md`). It runs the S0–S6 steps of the
bijection unit — the authored record set compared on RFC 8785 bytes — over
committed fixtures and format codecs, and emits the loss report
`ds.diagram-bijection-report/1`.

## Why this package is private

`"private": true` is a standalone state, like `@sentropic/diagram-canvas`:
the harness is a qualification replay, not a published codec. Nothing in the
plan asks for publication, and production codecs of later lots (scene SVG,
draw.io, PlantUML, Open Exchange) are placed per lot, not here.

## Why a package, and not `scripts/` or `tools/`

The harness imports DS workspace code at the DS commit under test
(`@sentropic/diagram-core`, `@sentropic/diagram-canvas`,
`@sentropic/design-system-svelte/diagram-render`); only a workspace can depend
on them. `scripts/ci-affected-workspaces.mjs` then expands a change to those
packages into a rerun of this workspace's witnesses in the `verify` shards
with no extra wiring.

## Layout

- `src/` — typed library: harness, report, pins, formats, anon, structure,
  projection, bpmn. Type-checked and tested (`tsconfig.json` includes `src`
  and `tests` only).
- `rawgate/` — the raw-label gate `dl-rawgate/1`: one plain ESM file, zero
  dependency, never type-checked by the workspace (it must run in CI with no
  `npm install`).
- `vendor/` — DL-1 commit-pin mode only.
- `preview/` — DL-1, not a workspace: own lockfile, installed only by the
  G-T5 step.
- `bin/` — thin launchers over `dist/`.
- `fixtures/`, `tests/` — pins, structures, scenes, conformance vectors,
  goldens and the W-DL0.* witnesses.

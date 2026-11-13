# ERD — erd@1 notation

## Objective
Deliver entity-table diagrams with field ports and crow’s-foot relationships through the shared diagram engine and the Svelte and Vue DiagramSceneFigure hosts.

## Completed lots
- [x] Define and export erd@1, its registry integration, validation, typed cardinalities, field metadata and Engram scene conversion.
- [x] Preserve all five acceptance scenes, their entities, fields, keys and relationships in the vendored fixture.
- [x] Implement measured entity tables, field anchors, crow’s-foot geometry, folding, self loops and dense orthogonal routing in diagram-canvas.
- [x] Integrate shared rendering, accessible fallback tables and fold controls in Svelte and Vue.
- [x] Add ERD tokens and regressions for conversion, validation, geometry, routing and framework parity.
- [x] Merge origin/main 00900974 (PR #270 endpoint provenance), preserving the provenance contract and ERD behavior; recompute receipt file hashes from merged UTF-8 contents.
- [x] Regenerate component-index artifacts from merged sources.

## Checks
- [x] npm ci and node scripts/ensure-theme-dists.mjs; no lockfile repair required.
- [x] Builds: diagram-core, diagram-canvas, Svelte, Vue and component-index.
- [x] notices:generate, index:generate, index:check and licensing:check (22 publishable packages).
- [x] diagram-core: 43 files / 657 passed, including the receipt hash gate and endpoint provenance.
- [x] diagram-canvas: 40 files / 466 passed, 1 existing skip.
- [x] Svelte diagram/ERD selection: 8 files / 361 passed.
- [x] Full Vue suite: 109 files / 1,749 passed.
- [x] Core/canvas type checks and Vue published-type build.
- [x] Both svelte-check configurations: 0 errors; main has 26 warnings, parity has 0.
- [x] Component-index: 15 files / 138 passed.
- [x] node --test scripts/component-index.test.mjs scripts/verify-deps-published.test.mjs: 22 passed.
- [x] git diff --check.

 No root test command, browser, Track command or release tags are part of this work.

## Versions
Planned minor releases: diagram-core, diagram-canvas, design-system-svelte and design-system-vue. Release tags require owner confirmation.

## Detailed implementation evidence
See spec/ERD-BUILD-NOTES.md for the ERD contract, design decisions, fixture counts and prior regression evidence.

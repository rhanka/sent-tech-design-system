# DC-2b Svelte integration into the merged L4 host

Validated on 2026-11-12 in `.dc2b-build`, branch `feat/dc2b-performance`.

## Merge and reconciliation

`git fetch origin` followed by `git merge origin/main` produced merge commit
`9c8d7ade` with parents `0bb9f37e` and `24c20dc2` (PR #265). No manual conflicts
occurred. Git merged `components-svelte/src/lib/diagramCardModel.ts` and
`diagram-canvas/{README.md,package.json,tests/no-dom.test.ts}` automatically.
Main's publishable canvas manifest, L4 host and 18 px edge-label geometry are
preserved alongside the DC-2b cache, measurer version and scene-model subpath.
All 1,702 Track event IDs survive; both parents and the merge have the same log
blob. Track acceptance was not rewritten from this concurrent worktree.

The Svelte patch is applied to real source: owned/injected cache, parent-bound
content size, size-change notifications, disposal, exports, fixtures and tests.
Host runtime and public scene types use the engine's shared scene model.
The Svelte patch sections were checked in reverse before removal. The remaining
nine sections are unchanged Vue-related changes, including the shared measurer
prerequisite introduced on the Vue branch. No Vue host changes were applied.

Component-index generation required adding the new `createLayoutCache` utility
to its barrel-only inventory and building its dataviz declaration prerequisites.
Generated contract changes include the new cache/size surface and source digests;
the time-series contract has only declaration-digest changes from the fresh build.

## Mounted Svelte measurements

Node 22.22.1 / Vitest 4.1.11 / jsdom, using the actual Svelte host. No browser was
started. These are Node/jsdom measurements, not browser paint or device timings.

| Gate | Observed | Threshold |
| --- | --- | --- |
| AC-P1, 240 complete fold/unfold cycles, median of 3 | 1.903 MiB; samples 4.344 / 1.903 / 1.627 | <= 5 MiB |
| Mounted idle heap, 60 s virtual + 500 ms real drain, median of 3 | -0.175 MiB; samples -0.175 / -0.181 / -0.172 | <= 1 MiB |
| AC-P5, ten mount/fold/zoom/unmount cycles per sample | -3.320 / -2.020 / 0.171 MiB; median -2.020, worst 0.171 | <= 2 MiB on every sample |
| AC-P4, 120 pan + 120 zoom events and resize | 2.458 ms p95 per pan/zoom pair; 0 cache/layout/measurement/size changes | <= 16.7 ms; 0 layout work |
| Idle after a 240 ms animated fold transition, 60 s virtual | 0 timeout / interval / RAF / observer / layout activity | 0 |
| Parent binding and notification, mount/fold/unfold | exactly 1 each; smaller folded size; restored expanded size | 1 / 1 / 1 |
| Unmount | 0 owned-cache entries/bytes, observed targets or pending timers; listener baseline restored | 0 |

AC-P1 uses the seven-node mounted contract fixture with reduced motion. It
warms both fold states before sampling, then requires 480 additional cache hits,
two entries, unchanged misses and no evictions. The separate transition/idle
contract exercises animation. Heap measurements force two V8 collections with
a macrotask between; spy histories release DOM references before sampling.
Negative heap deltas represent memory returned by collection. Injected caches
remain owned by the caller and are explicitly disposed by the test.

## Engine/model measurements

| Gate | Observed | Threshold |
| --- | --- | --- |
| Cache + projection, 240 fold/unfold cycles, median of 3 | 0.294 MiB | <= 5 MiB |
| Cache idle heap, median of 3 | -0.003 MiB | <= 1 MiB |
| 240 cached revisits | 0.087 ms p95; 2 entries / 91,807 bytes | <= 5 ms; capacity 32 entries / 16 MiB |
| Cold vue-globale/after | median 212.823 ms / worst 293.596 ms | < 1,800 ms; worker trigger 900 ms |
| Cold largeDocumentSpec | median 71.068 ms / worst 82.583 ms | < 1,800 ms; worker trigger 900 ms |
| Engine disposal, median of 3 | 0.207 MiB | <= 2 MiB |
| Engine/model interaction workload | 600 actions / 240 stress toggles; worst 262.765 ms | < 1,800 ms |

## Validation results

- `npm ci`: pass using the exact owner-specified cache. npm reported two engine
  advisories (`abbrev`/`nopt` need Node 22.22.2 or newer) and 22 audit findings;
  no dependency versions were changed.
- Builds: tokens, diagram-core, diagram-canvas, Svelte, React, Vue, Angular and
  component-index all pass. Dataviz core and four adapters also build as index
  generation prerequisites.
- Diagram-canvas Vitest: 39 suites, 449 passed / 1 skipped.
- Svelte `DiagramSceneFigure.test.ts` + `DiagramSceneFigure.ssr.test.ts`: 46 passed.
- Svelte check: 0 errors / 26 warnings in main; 0 errors / 0 warnings in parity.
- Component-index generate/check: pass, 430 fresh artifacts.
- Notices generation and licensing check: pass, 22 publishable packages.
- Diff whitespace check: pass. No independent peer consensus is claimed; no h2a
  launch tool was exposed in this session.

The mounted measurement command, run from `packages/components-svelte`, is:

```sh
rtk proxy node ../../node_modules/vitest/vitest.mjs run \
  src/lib/DiagramSceneFigure.test.ts src/lib/DiagramSceneFigure.ssr.test.ts \
  --silent=false --reporter=verbose
```

The canvas campaign uses `rtk npx vitest run --config
packages/diagram-canvas/vitest.config.ts`. Set the npm cache exactly as documented
in `DC2B_HOST_WIRING.md` before npm/npx commands. Full local logs are retained in
`node_modules/.cache/dc2b/` (ignored). Vue mounted integration and its remaining
AC-P1 campaign wait for the Vue diagram-library branch; its current base package
build is validated above.

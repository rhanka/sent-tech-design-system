# DC-2b host handoff

The requested base contains DC-2a L2/L3 but neither scene host. The engine and
shared model are implemented in this worktree; `DC2B_HOST_WIRING.patch` carries
the host integration against the existing Svelte PR #265 and Vue branch files.
No source in either other worktree was modified.

## Files delivered in this worktree

- `packages/diagram-canvas/src/layout/cache.ts`
- `packages/diagram-canvas/src/layout/index.ts`
- `packages/diagram-canvas/src/layout/measure.ts`
- `packages/diagram-canvas/src/layout/types.ts`
- `packages/diagram-canvas/src/presentation/diagramSceneModel.ts`
- `packages/diagram-canvas/package.json`
- `packages/diagram-canvas/README.md`
- `packages/diagram-canvas/tests/layout/cache.test.ts`
- `packages/diagram-canvas/tests/layout/cache-performance.test.ts`
- `packages/diagram-canvas/tests/presentation/diagramSceneModel.test.ts`
- `packages/diagram-canvas/tests/no-dom.test.ts`
- `packages/components-svelte/src/lib/diagramCardModel.ts`
- `BRANCH.md`
- `patches/DC2B_HOST_WIRING.patch`
- `patches/DC2B_HOST_WIRING.md`
- `patches/DC2B_REVIEW.md` (peer selection unavailable; no consensus claimed)

The patch changes five files:

- `components-svelte/src/lib/DiagramSceneFigure.svelte`: shared canvas model,
  instance-owned or injected cache, bindable `contentSize`, change-only callback,
  and owned-cache/gesture teardown.
- `components-svelte/src/lib/DiagramSceneFigure.test.ts`: consume the same model;
  add camera/resize size-publication and cache/listener ownership regressions.
- `components-vue/src/DiagramSceneFigure.vue` and `.types.ts`: same cache seam,
  content-size callback, `sizeChange` and `update:contentSize` emissions, teardown.
- `diagram-canvas/src/presentation/diagramCardModel.ts`: optional version tag on
  the shared measurer supplied by the Vue branch. The local Svelte measurer is
  already tagged by this implementation.

The Vue reference already captures `mountedViewport` at wheel registration and
removes the listener through that captured element on unmount. The patch keeps
that correction. Neither host's resize or gesture path calls layout. An injected
cache remains the caller's property; unmount disposes only `ownedCache`.

## Applying

After integrating the engine changes, PR #265 and `feat/diagram-vue`, the
conductor runs from the integration worktree:

```sh
rtk git apply --check patches/DC2B_HOST_WIRING.patch
rtk git apply patches/DC2B_HOST_WIRING.patch
```

The Vue branch also introduces `diagram-canvas/src/presentation/diagramSceneModel.ts`.
When reconciling that added file, keep this implementation: it retains the
existing pure camera/transition API and adds the cache seam, size API and emitted
label fast path. Keep the `./diagramSceneModel` manifest export alongside the
Vue branch's `./diagramCardModel` export. The patch points Svelte directly to the
shared subpath; its old local scene-model file is no longer used by the figure.

Patch anchors were read from `.dc2a-l4-wt` (Svelte) and `.diag-vue-wt` (Vue).
Applicability was checked against a local composite of those exact base files.
The patch can need context adjustment if either host changes before integration.

## Verification performed

- Engine: all 39 package suites passed (446 tests, one existing skipped dense
  benchmark). After the final additions, all five affected suites passed again
  (46 tests). No timeout changed.
- Engine check: `npx tsc -p tsconfig.check.json`; engine and Svelte builds passed.
- Svelte patch: materialised temporarily **inside this worktree**, then removed.
  Its host suite passed 36 tests; the package campaign passed 135 suites / 2,027
  tests including that host suite. `svelte-check` passed both configurations with
  zero errors (26 accessibility warnings in the main configuration, zero in
  parity). Workspace prerequisites were built locally; no dependencies added.
- Vue patch: script and template compiled with `@vue/compiler-sfc`, resolving
  the patched props and shared canvas types. Vue mounting/package tests were
  not run: the Vue host and its branch-specific harness are absent on this base.
- Tests run in Node or Node/jsdom; no browser run. No commits, pushes or stashes.

## Integration gates still required

Owner: conductor for host integration, then each host maintainer for its package
gates. Apply the patch, build `diagram-canvas`, and run package-scoped Vitest plus
the Svelte and Vue package checks. Validate Vue `v-model:contentSize`, emitted
size events and wheel removal when the template ref has already become null.

Full **mounted-host** AC-P1/P2/P5 remain integration gates in both frameworks:
240 fold/unfold cycles with ≤ 5 MiB growth, 60 s idle with ≤ 1 MiB growth and zero
callbacks, and ten mount/fold/zoom/unmount cycles with ≤ 2 MiB growth and exact
listener/observer baselines. Engine/model measurements do not substitute for
those mounted-host measurements. Also verify Svelte `bind:contentSize` through a
parent binding, Vue change-only emissions, and the complete wheel/pinch/public
zoom handler script. The supplied Svelte regressions already cover 120 scroll +
120 Ctrl-wheel events, resize, callbacks and basic owned/external cache teardown.

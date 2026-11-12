# DC-2b host handoff after review

The engine changes live on feat/dc2b-performance. The hosts are absent on this
base, so DC2B_HOST_WIRING.patch delivers the integration against the Svelte
PR #265 and feat/diagram-vue sources. All materialisation, tests and builds were
performed inside .dc2b-build; other checkouts supplied read-only source and
already-installed integration dependencies. Temporary source overlays are removed
before handoff. No browser, root test campaign, dependency installation, commit,
push or stash was used.

## Review corrections

| Finding | Fix | Failing-first regression and final check |
| --- | --- | --- |
| BF-1 | Named structural SceneLayoutCache boundary; LayoutCacheConfig aliases existing options. Both host barrels and the generated Vapor JS/types export the factory and companion types. Vue props no longer name LayoutCache directly. | Canvas consumer initially failed TS2305 for both missing types. The Svelte package checker compiles consumer imports from its real barrel. Vue's published consumer fixture imports the classic and Vapor factory/types under skipLibCheck: false; actual emitted declarations pass the diagram-core exclusion guard. |
| BF-2 | Vue emits sizeChange once and update:contentSize once; removes the direct callback call and duplicate callback prop declaration. | Both an @size-change parent and an onSizeChange vnode listener initially received 2 calls instead of 1. Corrected classic tests pass; built Vapor modules also publish exactly 1/1/1 on mount/fold/unfold. |
| BF-3 | Cache key includes effective hints.rankGap ?? metrics.rankGap. | rankGap 48 -> 96 initially returned the same object. It now records 2 misses and matches a fresh result; an overridden metrics.rankGap preserves the hit. |
| BF-4 | Shared mounted contract, parent binding fixture, complete Vue suite and built Vapor size regression are included in the patch. | Unwired hosts failed publication/cache assertions. Both corrected hosts pass binding, fold/unfold, camera isolation, post-transition idle, three independent ten-cycle disposal samples and injected-cache ownership tests. |
| NB-1 | Every stress-loop layout result is projected through resolveScene. The measurement spy releases its arguments/results after each call. | The projection guard initially observed 0 calls instead of 1,452; the complete workload now passes the original heap bounds. |

NB-2 remains optional: the current single recent orientation alias bounds
retention and the compatibility lookup already recognises older compatible
orientation maps. An unrestricted alias Set would weaken that bound.

## Patch contents and application

The 16 patch files cover both figures, Vue props, both public barrels, the Vapor
export generator, Vue's published-types gate and consumer fixture, Svelte's test
configuration/package-file exclusion, both mounted suites, shared test support,
the Svelte binding fixture, the Vapor runtime regression and the shared card
measurer version tag. Test support is excluded from the published Svelte package.

After integrating this engine, PR #265 and feat/diagram-vue:

```sh
rtk git apply --check patches/DC2B_HOST_WIRING.patch
rtk git apply patches/DC2B_HOST_WIRING.patch
```

The patch was applied to a fresh local composite of its reference base files;
all 16 resulting files matched the tested sources byte for byte. Keep this
branch's diagramSceneModel implementation and its manifest subpath when
reconciling the Vue branch's independently introduced shared model. The host
patch expects the integration branch's other canvas/graph/elements exports.

## Verification and measured thresholds

Verified on 2026-11-12 using Node/jsdom only, with existing timeouts unchanged.

- diagram-canvas: 39 suites, 449 passed / 1 existing skipped; tsc check and build pass.
- Svelte: 42 mounted-host tests pass; both svelte-check configurations pass
  (0 errors; 26 accessibility warnings in main, 0 in parity); package build passes.
- Vue: 7 classic mounted-host tests pass under both installed Vue 3.5 and the
  integration branch's Vue 3.6; the new built Vapor regression passes in jsdom.
  The full integration package build passes, including vue-tsc, classic/Vapor SFC
  generation and strict published-type consumer checks. Existing Vue 3.6,
  graph/elements and presentation prerequisites were staged locally without
  installing dependencies or changing their source.

| Measurement | Observed | Threshold |
| --- | --- | --- |
| Canvas + projection, 240 full fold/unfold cycles, median of 3 | 0.239 MiB (samples 0.156 / 0.239 / 0.287) | <= 5 MiB |
| Canvas idle heap, 60 s virtual + 500 ms real drain, median of 3 | -0.003 MiB (samples -0.006 / -0.003 / 0.038) | <= 1 MiB |
| Revisit, 240 hits | 0.098 ms p95; 2 entries / 91,807 bytes | <= 5 ms; default capacity 32 entries / 16 MiB |
| Cold vue-globale/after | median 198.878 ms / worst 245.786 ms | < 1,800 ms; worker trigger 900 ms |
| Cold largeDocumentSpec | median 61.465 ms / worst 64.943 ms | < 1,800 ms; worker trigger 900 ms |
| Engine, ten create/fold/dispose cycles, median of 3 | 0.194 MiB; 0 entries / bytes | <= 2 MiB |
| Svelte mounted, ten mount/fold/zoom/unmount cycles | median -0.893 MiB; samples -1.343 / -0.253 / -0.893 | <= 2 MiB on every sample |
| Vue mounted, ten mount/fold/zoom/unmount cycles | median 0.467 MiB; samples 1.203 / -4.895 / 0.467 | <= 2 MiB on every sample |
| Both mounted hosts after a 240 ms transition + 60 s virtual idle | 0 new timeouts / intervals / RAF / observer construction or observation / layout calls | 0 |
| Both mounted hosts, 120 pan + 120 zoom events and resize | 0 layout / measurement / size emissions; bound size unchanged | 0 |
| Parent content-size binding and notifications | exactly 1 each at mount, fold, unfold; smaller folded size, restored expanded size | 1 / 1 / 1 |
| Every unmount | 0 owned-cache entries / bytes / observed targets / pending timers; exact imperative listener baseline | 0 |

Heap readings force two V8 collections separated by a macrotask. Lifecycle tests
release all spy-retained DOM references before sampling and drain jsdom's
zero-delay selectionchange after removal. A leaked transition RAF remains
pending at 16 ms and would fail. Listener instrumentation covers every window
listener and the imperative viewport wheel registration (target, function and
capture flag); framework template handlers belong to detached nodes. Vue tests
explicitly clear viewportEl before unmount and still require wheel removal.
Negative heap deltas mean that collection returned memory.

Mounted AC-P1's separate 240-cycle/idle retained-heap campaign on each complete
framework remains a conductor integration acceptance check. The completed
cache + projection measurement and mounted ten-cycle AC-P5 measurement are
reported separately from that campaign. No browser run is implied.

## Reproduction

Set the owner's npm cache before every npm/npx invocation:

```sh
export npm_config_cache=/home/antoinefa/.cache-tmp/claude-1000/-home-antoinefa-src-sent-tech-design-system/fe9b0873-fc2a-40be-844a-6728d7f3f06f/scratchpad/npm-cache
rtk npx vitest run --config packages/diagram-canvas/vitest.config.ts
rtk npx tsc -p packages/diagram-canvas/tsconfig.check.json
rtk npm run build --workspace packages/diagram-canvas
rtk npm exec --workspace packages/components-svelte -- vitest run src/lib/DiagramSceneFigure.test.ts
rtk npm run check --workspace packages/components-svelte
rtk npm run build --workspace packages/components-svelte
rtk npm exec --workspace packages/components-vue -- vitest run --project=components src/DiagramSceneFigure.test.ts
rtk npm run build --workspace packages/components-vue
rtk npm exec --workspace packages/components-vue -- vitest run --project=vapor src/vapor-runtime.test.ts -t DC-2b
```

The host commands apply after integration; the required host source and the
Vue branch's installed toolchain are not part of this base checkout.

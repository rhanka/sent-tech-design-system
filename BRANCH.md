# DC-2b — diagram performance

## Objective
- [x] Deliver the DC-2b engine and separate host integration patch, with the owner thresholds unchanged.

## Scope / Guardrails
- [x] Work only in this worktree; owner now authorizes merge and wiring commits; no push, stash, browser, Python or dependency addition.
- [x] Allowed: diagram-canvas cache, presentation model, tests and README; Svelte measurer version; conductor host patch and evidence.
- [x] Forbidden: placement, docking, routing bodies, confidential fixtures, environment and key files, root test command.
- [x] Svelte host source is now merged from main and wired permanently; Vue integration remains a separate patch.

## Lots
- [x] L0: install dependencies, verify fingerprint seam and reference scenes; hosts and shared model absent on this base.
- [x] L1: bounded instance cache and optional measurer versions; gate: compiler and no-DOM guard.
- [x] L2: cache correctness, fixed-point revisits, LRU and V8 memory/latency tests; gate: scoped Node Vitest.
- [x] L3: shared model, content size, label fast path and separate host patch; gate: model tests and patch applicability.
- [x] L4: README with measured evidence and host handoff.
- [x] L5: package Vitest, diagram-canvas type check, diagram-canvas and Svelte builds; inspect every diff hunk.

## Feedback Loop
- [x] Use package-scoped Vitest commands throughout; retain existing timeouts.
- [x] Missing hosts: conductor applies the separate host patch after integrating PR #265 and feat/diagram-vue.
- [x] Review BF-1/BF-2/BF-3/BF-4 corrected with failing-first regressions; NB-1 extends the heap workload through scene projection.
- [x] Mounted-host idle/camera/binding/lifecycle gates run in Node/jsdom for Svelte and Vue; the published Vapor size regression also passes.
- [x] Host published types and builds checked on a temporary composite inside this worktree; integration prerequisites reused read-only.
- [x] Remaining mounted-host AC-P1 stress/idle heap campaign is distinguished from the completed canvas/model gate in patches/DC2B_HOST_WIRING.md.

## Svelte integration after PR #265
- [x] Fetch and merge origin/main; no manual conflicts; retain engine/main APIs and DC-2b cache.
- [x] Apply Svelte wiring, binding fixture, mounted contract, package exclusions and public exports; retain only Vue-related patch sections.
- [x] npm ci with the owner-specified cache; all eight requested package builds pass.
- [x] Canvas: 39 suites, 449 passed / 1 skipped. Targeted Svelte host + SSR: 46 passed; both svelte-check configurations pass.
- [x] Mounted AC-P1: 240 complete fold/unfold cycles, three samples, reduced motion; median 1.903 MiB <= 5 MiB and idle -0.175 MiB <= 1 MiB. Animated idle activity is tested separately.
- [x] Mounted camera: 2.458 ms p95 <= 16.7 ms; AC-P5 worst sample 0.171 MiB <= 2 MiB; no retained host resources.
- [x] Component-index generation/check pass (430 fresh artifacts); notices and licensing pass (22 publishable packages).
- [x] Detailed scope, measurements and reproduction: patches/DC2B_SVELTE_INTEGRATION.md.

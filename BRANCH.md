# DC-2b — diagram performance

## Objective
- [x] Deliver the DC-2b engine and separate host integration patch, with the owner thresholds unchanged.

## Scope / Guardrails
- [x] Work only in this worktree; no commit, push, stash, browser, Python or dependency addition.
- [x] Allowed: diagram-canvas cache, presentation model, tests and README; Svelte measurer version; conductor host patch and evidence.
- [x] Forbidden: placement, docking, routing bodies, confidential fixtures, environment and key files, root test command.
- [x] Conditional: host source absent from main is delivered as a separate patch against the existing host worktrees.

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
- [x] Mounted-host memory/idle/lifecycle and Vue runtime gates are explicitly assigned in patches/DC2B_HOST_WIRING.md.

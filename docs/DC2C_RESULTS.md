# DC-2c.1 review corrections and verification

Branch: feat/dc2c-numbered-flows. Review target: 16ce63cf. Package versions are unchanged.
Review: scratchpad/diag-lib/REVIEW-dc2c1-astra.md, read from its final verdict.
The owner's correction request supersedes the earlier Vue deferral in BRANCH.md.

## Finding → fix → regression

| Review finding | Correction | Failing-first evidence and regression |
|---|---|---|
| P1: required Vue implementation absent | Export Vue DiagramSceneFigure, using the shared scene, reducer, highlighting, camera, frozen card geometry and token styles; add its internal canvas dependency | Vue test initially failed to resolve the missing host. Both hosts now execute 52 shared cases through one runner; 53 cross-host tests compare the complete normalized scene and navigator, including a no-flow scene. Vue SSR renders arrows and badge text without DOM globals. |
| P2: compatibility layout accepts invalid flow semantics | Run document and flow validation in layoutDocument and diagnoseLabels | Missing/duplicate step tests initially received laid-out instead of refused. Both entry points now reject with flow-step-missing / flow-step-duplicate; the valid compatibility warning remains tested. |
| P2: controlled navigation announces a proposal | Keep navigation proposals pending; announce the committed cursor after parent acceptance | The live-region assertion initially received Step 1 while readout and pressed target stayed empty. Both hosts now assert the full callback payload, readout, exact pressed badge and announcement together before and after delayed acceptance. |
| P2: scenario-only filtering dims plain links | Limit filter-only edge dimming to flow edges and bundles, while preserving untouched-box dimming | The mixed plain-link/two-scenario test initially included occurrence:plain in dimmed. Exact primary, related and dimmed sets now exclude it. |
| P2: acceptance assertions too weak | Require feasible badge placement, assert impossible omission, check every shared case's exact callback payload and selected target, add controlled scenario spies and full filter-leave sets | A temporary always-undefined placement mutation fails the new feasible-boundary assertion; restoring the implementation passes. Controlled scenario tests also exposed and fixed Svelte's stale native select value during rejected/accepted proposals. |

Additional review coverage: U-channel slot/request sequences, pairwise conflict
checks with the measured path's outside lanes, reversed input; four external
routes across fold/unfold, original ends and a cross-child internal step; omitted
singleton/count badges, retained members and recentered carrier docks; exact
highlight sets for own-edge, bundle-only, bundle-member, internal, node, filter
and empty states. The no-flow DC-2a fixtures and Svelte pre-flow DOM snapshot pass.

## Package suites

All commands use the owner-specified npm_config_cache and package scope.

| Workspace | Files | Passed | Skipped |
|---|---:|---:|---:|
| diagram-core | 44 | 556 | 0 |
| diagram-canvas | 45 | 486 | 1 |
| components-svelte | 138 | 2149 | 0 |
| components-vue | 104 | 1642 | 0 |
| tokens | 3 | 20 | 0 |
| themes | 1 | 7 | 0 |
| component-index | 15 | 136 | 0 |

Command pattern: npm test --workspace packages/<workspace> -- --maxWorkers=2.
Final scoped reruns also cover strengthened flow-order/highlight assertions and
the restored badge-placement implementation. Both host workload tests execute
200 hover/focus/selection/filter/navigation changes with no layout, scene
resolution, cache layout/miss, timer or RAF work, then check retained-selection
idle behavior.

## Build and packaging gates

- Core, canvas, tokens, Vue and component-index type checks pass. Canvas source
  still compiles without DOM or Node types; its DOM test runner has a separate,
  unpublished build output.
- Both Svelte checks pass: zero errors; 26 warnings in other components in the
  main check and zero warnings in the parity check.
- Core, canvas (including both unpublished support outputs), tokens, themes,
  Svelte, Vue and component-index builds pass. Existing sibling declaration
  builds supply the other framework inputs to the index generator.
- Component-index generate/check passes for 430 artifacts. Vue's scene entry
  and declaration-derived props/callbacks now appear in the generated contract.
  Small unrelated declaration digest changes are emitted by the required build.
- Third-party notices generation and licensing pass for all 22 publishable
  packages, including license files in tarballs.
- git diff --check passes. Test support remains outside published dist and has
  no package export. No third-party dependency or package version was added.

Rendered appearance is not covered: no browser was launched. No root test,
Track command, Python, stash, push, tag or publication was used. DC-2c.2 remains
outside this branch. The supplied independent review was addressed; no new h2a
consensus review is claimed.

## Merge with Vue classic/Vapor foundation (#279)

The numbered-flow scene and its internal card/zone renderers now use compiled
SFC templates. The shared flow reducer, layout/cache, geometry and callbacks
are retained; the public scene wrapper keeps the existing no-flow host.
K25 keeps its original baseline and shrink-only rule. The published Vapor
numbered-flow navigation witness runs without the interop plugin.
Cross-host parity compiles the internal Vue SFC alongside the Svelte host.
Vue pack smoke derives its minimum export count from the public source barrel,
while still checking all emitted files in the tarball.

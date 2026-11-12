# DC-2c.1 acceptance evidence

Base: d9a04d2e (the requested origin/main at task start). Local branch:
feat/dc2c-numbered-flows. No versions were changed. Remote tracking main later
advanced through the wave-1 release; those version-bump commits were not merged
into this scoped implementation.

## AC → tests

| AC | Evidence | Result / boundary |
|---|---|---|
| A1 | diagram-core/tests/flows.test.ts; flows/refinement-review.test.ts; diagram-canvas/tests/layout/flows.test.ts | Refinement, inherited constraints, frozen presentation adapter boundary, both layout paths, folding and scene projection pass |
| A2 | diagram-core/tests/flows.test.ts | Every flow diagnostic, valid negatives, idempotence and unchanged conflict document pass |
| A3 | diagram-core/tests/flows.test.ts; flows/mapping.test.ts | Authored rank, reversed ids, implicit/explicit scenarios, omitted kind, 20 seeded shuffles pass |
| A4 | diagram-core/tests/flows/mapping.ts and mapping.test.ts | Four hand-written facts tables, diamond branches/join, initial and same-component self steps, loop and multiple starts pass |
| A5 | diagram-canvas/tests/layout/flow-order.test.ts; flows.test.ts | Four facing/opposite steps, mixed fixed positions, both U-channel signs, shared port slots, input reversal, pairwise route conflicts and self steps pass |
| A6 | diagram-canvas/tests/layout/flows.test.ts | Cap-4 fan-out, fold reason precedence, original ends, 3/1 direction counts, two arrows, internal targets and cache revisit identity pass |
| A7 | diagram-canvas/tests/layout/flow-summaries.test.ts; flow-review.test.ts | Both directions, mixed ordinary link, active-key conflicts, fan-out independence and suppressed member/carrier labels pass |
| A8 | diagram-canvas/tests/layout/flow-badges.test.ts; flows.test.ts | Source-first segment, 999z, two templates, occupancy and within/limit boundaries pass |
| A9 | diagram-canvas/tests/layout/flows.test.ts | One whole-view obstructed repair, retained members/targets, omitted badges and no mark overlap pass |
| A10 | diagram-canvas/tests/layout/dc2a/*; layout/cache.test.ts; flows.test.ts; components-svelte DiagramSceneFigure.flows.test.ts | Eight after.json scene digests retained; deterministic bytes and flow geometry cache keys pass; interaction workload adds no cache misses |
| A11 | diagram-canvas/tests/presentation/flowModel.test.ts; layout/flow-review.test.ts | Precedence, bundle/internal identities, reducer emissions, sets, descriptions, static SVG, target sizes and logical node retargeting pass |
| A12 | diagram-canvas/test-support/flowHostCases.ts; components-svelte DiagramSceneFigure.flows.test.ts and DiagramSceneFigure.ssr.test.ts | Svelte adapter, controlled state, removal/focus repair, keyboard, native-button contract, touch, descriptions, no nested buttons and origin/main normalized no-flow DOM pass. Vue adapter and cross-host DOM comparison pending #267 integration |
| A13 | components-svelte DiagramSceneFigure.flows.test.ts and DiagramSceneFigure.test.ts; canvas presentation/flowModel.test.ts | 200 hover/focus/selection/filter/navigation changes: zero layout/scene/cache work, timers or RAF; retained-selection virtual idle and existing DC-2b mounted campaign pass |
| A14 | tokens/src/flow-tokens.test.ts; Svelte source-discipline and SSR tests; canvas flowModel.test.ts | Frozen numbers, contrast in all shipped modes, no motion/visual literals in flow CSS, focusability and pure/static arrow+badge output pass. Vue SSR and final cross-host literal gate remain pending |

Paths in this table are relative to packages/ unless otherwise qualified. The
unpublished support table contains 47 shared cases, each with written expectations.
Node/jsdom supplies a native button's click when checking Enter/Space contracts;
no browser keyboard default-action behavior or rendered appearance is claimed.

## Commands and results

- `npm test --workspace packages/diagram-core`: 44 files, 556 passed.
- `npm test --workspace packages/diagram-canvas`: 45 files, 481 passed / 1 skipped;
  the subsequently added four-facing/opposite-direction regression also passes
  (flow-order.test.ts now has 5 passing tests; 482 distinct passing canvas tests).
- Final targeted Svelte: 4 files, 301 passed, including 51 flow host tests and
  all 47 shared cases. The 200-change workload includes scenario changes.
- Token package Vitest: 3 files, 20 passed, including all shipped theme modes.
- Core and canvas package tsc checks pass; tokens tsc check passes.
- Both Svelte checks pass: 0 errors (main check reports 26 warnings in other
  component files; parity check reports 0 warnings).
- Core, canvas (including unpublished support), tokens, themes, DSFR, Svelte,
  graph, rich-text, dataviz-core and declaration prerequisites build successfully.
- Standalone Svelte reference: compile and svelte-check, 0 errors / 0 warnings.
- Component-index generate/check: 430 artifacts fresh. Generated ForceGraph
  changes only reorder two equivalent enum arrays as a compiler consequence.
- Notices generation and licensing: pass for all 22 publishable packages.
- `git diff --check`: pass. All five affected package versions match the base.

Reproduction for the targeted host run:

```sh
cd packages/components-svelte
npx vitest run src/lib/DiagramSceneFigure.flows.test.ts src/lib/DiagramSceneFigure.ssr.test.ts src/lib/DiagramSceneFigure.test.ts src/lib/diagram-card-parity/diagram-card-parity.test.ts
```

No browser, root npm test, Python, stash, version bump or push was used. npm ci
ran once with the owner-specified cache. Rendered appearance is not covered.

## Remaining work

Vue: integrate after #267, bind the shared model and same case table, compare
normalized DOM, and run Vue SSR/controlled-state/focus/budget/token gates.
DC-2c.2: data ownership/state matrix, detail/fold overrides, finite opt-in dash
pulses and cancellation/completion behavior. See DC2C_NUMBERED_FLOWS.md for the
bounded handoffs and DC2C_REVIEW.md for the two design-verification rounds and
Astra3 resolution. Harness h2a consensus review remains unavailable in this session.

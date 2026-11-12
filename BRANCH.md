# DC-2c.1 — numbered parallel flows

## Objective
- [ ] Implement DC-2c.1 revision 3 A1–A14 in the engine and Svelte; prepare Vue's shared model.

## Scope / Guardrails
- [x] Work only in this worktree, no versions, push, stash, browser, Python or root test.
- [x] npm ci once using the specified cache (completed); §11 defaults apply.
- [x] Monitor external REVIEW-dc2c-astra3.md and resolve blocking findings if it appears.

## Branch Scope Boundaries
- [x] Allowed: diagram-core, diagram-canvas, components-svelte, tokens, generated theme CSS, component-index, docs, changelogs, notices, plan.
- [x] Forbidden: Vue host before #267, DC-2c.2, dependencies, versions, unrelated changes.
- [x] Conditional: directly required generator inputs and outputs, with verification.

## Lots
- [x] L0: relation readers, diagnostic codes, parallel slots, Select, token modes.
- [x] L1: relation refinement through validation, folds, layouts, summaries and scenes.
- [x] L2: flow definitions, validation, index, mapping fixtures and facts.
- [x] L3: tokens and contrast gates.
- [x] L4: flow runs, bundles, arrows, badges, repair, cache (A5–A10).
- [x] L5: pure presentation model, static marks, shared host cases (A11).
- [x] L6: Svelte interaction, accessibility, controlled state, budget (A12–A14).
- [x] L7: Vue handoff after #267, parity pending.
- [x] L8: docs, changelogs, index, notices, licensing.
- [x] L9: review fixes, scoped Vitest, tsc, Svelte checks, builds, AC evidence.

## Feedback Loop
- [x] L0: attribute-not-in-schema and type-definition-conflict exist; reserved/ambiguous need new codes.
- [x] L0: parallelRelations marks every relation in a parallel pair; exclude shared port slots from flow runs.
- [x] L0: DS Select exists in both hosts; light/dark token builders use createComponent.
- [x] Existing reviewed revision-3 design governs; owner's plain commits override harness wrapper.
- [x] Rendered appearance: not covered (browsers prohibited).
- [x] Astra3: internal step identity, equal-end classification, single occurrence, absent-step exclusion and scenario metadata rules implemented.
- [x] Two independent design-verification passes reconciled; h2a consensus unavailable (launcher absent), no consensus claimed.
- [x] Frozen presentation adapter bytes retained; the relation-resolution boundary supplies its effective semantic types.
- [x] BRDC2C-EX1: keep the cohesive Svelte host change and generated artifacts in complete commits even above the planning line budget; impact is review size only, rollback is git revert of that local commit.
- [x] Gates: core 556; canvas 481 plus one later four-flow regression (482), one existing skip; targeted Svelte 301; tokens 20; tsc, both Svelte checks, builds, 430 index artifacts, notices and licensing pass.

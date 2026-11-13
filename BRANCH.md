# DC-2c.1 — numbered parallel flows

## Objective
- [x] Correct the independent DC-2c.1 review in the engine and both hosts, with failing-first regressions and scoped verification.

## Scope / Guardrails
- [x] Work only in this worktree, no versions, push, stash, browser, Python or root test.
- [x] npm ci once using the specified cache (completed); §11 defaults apply.
- [x] Monitor external REVIEW-dc2c-astra3.md and resolve blocking findings if it appears.

## Branch Scope Boundaries
- [x] Allowed: diagram-core, diagram-canvas, Svelte/Vue hosts, tokens, generated theme CSS, component-index, docs, changelogs, notices, plan, directly required build/test support.
- [x] Forbidden: DC-2c.2, third-party dependencies, versions, unrelated changes. Owner's review-correction request supersedes the earlier Vue deferral and permits its canvas workspace dependency.
- [x] Conditional: directly required generator inputs and outputs, with verification.

## Lots
- [x] L0: relation readers, diagnostic codes, parallel slots, Select, token modes.
- [x] L1: relation refinement through validation, folds, layouts, summaries and scenes.
- [x] L2: flow definitions, validation, index, mapping fixtures and facts.
- [x] L3: tokens and contrast gates.
- [x] L4: flow runs, bundles, arrows, badges, repair, cache (A5–A10).
- [x] L5: pure presentation model, static marks, shared host cases (A11).
- [x] L6: Svelte interaction, accessibility, controlled state, budget (A12–A14).
- [x] L7: Vue host, shared cases/assertions, normalized DOM parity, SSR, controlled state, focus and budget gates.
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
- [x] Independent review corrections: all five verdict findings addressed. See docs/DC2C_RESULTS.md for the failing-first evidence, added coverage and current gate results.
- [x] Final package suites: core 556, canvas 486 (1 skip), Svelte 2149, Vue 1642, tokens 20, themes 7, component-index 136; 52 shared host cases and 53 DOM parity cases.

## Main integration — PR #270 endpoint provenance

The owner authorizes this merge commit and push to update PR #272; earlier no-push guardrails above describe the prior implementation phase. The DC-2c objective and completed lots are retained.

- [x] Merge origin/main 00900974 into feat/dc2c-numbered-flows, preserving endpoint provenance and numbered parallel flows.
- [x] Resolve BRANCH.md with this branch’s DC-2c content, recompute receipt hashes from merged UTF-8 file contents, and regenerate the three conflicting component-index artifacts.
- [x] npm ci and ensure-theme-dists; no lockfile repair required.
- [x] Core, canvas, Svelte, Vue and component-index builds, plus unpublished canvas test/host support builds.
- [x] notices:generate, index:generate, index:check and licensing:check (22 publishable packages).
- [x] diagram-core: 45 files / 657 passed, including receipt, provenance and flow validation.
- [x] diagram-canvas: 45 files / 486 passed, 1 existing skip, including DC-2c flow tests.
- [x] Svelte diagram/flow selection: 9 files / 468 passed, including shared host and cross-framework parity.
- [x] Full Vue suite: 110 files / 1,805 passed.
- [x] Core/canvas type checks, both svelte-check configurations and Vue published-type build; Svelte main has 0 errors / 26 warnings, parity has 0 errors / 0 warnings.
- [x] Component-index: 15 files / 138 passed.
- [x] node --test scripts/component-index.test.mjs scripts/verify-deps-published.test.mjs: 22 passed.
- [x] git diff --check.

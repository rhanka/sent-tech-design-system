# Endpoint provenance

## Objective
- [x] Implement endpoint provenance AC-01–51 from SPEC_EVOL_DIAGRAM_CORE_ENDPOINT_PROVENANCE.md with confirmed D-1–D-9.

## Scope / Guardrails
- [x] Work only in this worktree on feat/endpoint-provenance; retain package versions and dependency pins.
- [x] Install once with the prescribed npm cache; no browser, root test command, Python, stash, push, confidential fixtures, environment or credential files.

## Branch Scope Boundaries
- [x] Allowed: diagram-core types, evaluator, schema @3 text/digest, tests, README and verification receipts; generated component-index/notices only when required.
- [x] Forbidden: unrelated packages, routing/rendering, semantic cardinality enforcement, @1/@2 schema changes, version bumps, tags and publishing.
- [x] Conditional: diagram-canvas verification and lockfile inspection; no dependency changes unless directly necessary.

## Lots
- [x] L1: profile/view DATA types, five declaration checks, schema @3 text and digest; profiles and schema conformance tests, tsc gate.
- [x] L2: indexed document-only iterative chain walks, pairing and single-chain selection; endpoint-provenance AC-01–11,15–17,21–27,36–47,50 gate.
- [x] L3: registry membership, entity-scoped repo, sorted carrier set; endpoint-provenance AC-12–14,28–32,51 gate.
- [x] L4: verbatim chain carriage in all projection/stripping branches and replacement inverses; folded-view/commands AC-48–49 gate.
- [x] L5: old bytes and fold regressions AC-18–19; all diagram-core and diagram-canvas Vitest, tsc and builds gate.
- [x] L6: scoped README, AC-to-test evidence, component-index generate/check, notices and licensing; inspect diff and commit without push.

## Feedback Loop
- [x] Baseline d9a04d2e equals origin/main; referenced helpers, provenance dispatch, projection and inverse seams verified.
- [x] npm ci --no-audit --no-fund completed once; existing Node engine/deprecation warnings recorded in command evidence.
- [x] Spec decisions confirmed by owner; normative predicate ids appear only in test DATA.
- [x] Source audit and diagnostic/selection regressions complete; strict schema compilation, exact canonical schema text and package inclusion verified.
- [x] Final core: 639/639 tests; canvas: 449 passed, one existing skip; package tsc/builds, 430 index artifacts, notices and 22-package licensing pass.
- [x] Index generation initially needed declaration builds; five prerequisites and eight component/dataviz workspace builds completed, then generate/check passed.
- [x] Schema guard receipt refreshed for current source hashes; @1/@2 schema bytes, presentation pin, package versions and lockfile unchanged.
- [x] Independent consensus selection failed: exact author model/effort unavailable and no h2a_run MCP tool exposed; no peer verdict claimed. Evidence records this limitation.
- [x] Track sidecar import remains with the conductor under the concurrent-worktree single-writer rule; this BRANCH.md is the mergeable source artifact.

---
status: selection-failed
review-author:
  host: codex
  model: unavailable
  effort: unavailable
target-ref: feat/endpoint-provenance working tree at d9a04d2e before this dossier header
target-diff-sha256: 151af0b550ae31e109aacc3583acc200338898fbd29255f650d3a5cea8267bb5
legs: []
observed-failure: Exact author model and effort unavailable; no h2a_run MCP tool exposed. No independent consensus dispatched.
---

# Endpoint provenance verification

Implemented lots L1–L6 against `SPEC_EVOL_DIAGRAM_CORE_ENDPOINT_PROVENANCE.md`,
AC-01–51 and confirmed D-1–D-9. Baseline at start: `origin/main` at
`d9a04d2e00224e5f1e2402a6559ca0b27f08a508`; branch: `feat/endpoint-provenance`.
Package versions, downstream dependency pins and `package-lock.json` are unchanged.

The implementation adds the optional view witness and profile DATA hook,
profile-scoped iterative walks with branch-local visits, all four selection
modes, registry/source-qualified aggregate membership and carrier checks,
verbatim projection/removal/inverse carriage, and an exact-pin schema successor.
The four engram predicate identities are test DATA only.

## Schema artifact

`schemas/diagram-view-schema-3.json` contains the exact canonical text, with no
trailing newline. Its raw-file and canonical-value SHA-256 are both:

```
b415c05197692baa5f74ab35e3150ce58079cf9f06201df5e581d222a8d2c0df
```

`schemas/diagram-view-schema-3.sha256` carries that digest. Both static artifacts
have package export paths and are included by `npm pack --dry-run`. The private
resolver admits @3 by exact id/version/digest. Tests compile the schema with
strict Ajv 2020-12 and cover every pairing row. Frozen @1/@2 schema values,
fixtures, digests, canonical bytes and the presentation pin are unchanged.
The existing receipt's implementation-file hashes were refreshed.

## AC to test mapping

Unless a different file is named, each row is an `AC-NN`-named test in
[`tests/endpoint-provenance.test.ts`](tests/endpoint-provenance.test.ts), using
[`tests/endpoint-provenance-fixtures.ts`](tests/endpoint-provenance-fixtures.ts).
Refusals assert exact code, severity, endpoint path, message, refs and scalar
details; acceptance asserts an empty diagnostic array.

| AC | Test / observable assertion |
| --- | --- |
| 01 | P1 accepts the unique exposer. |
| 02 | P1 unrelated end: `chain-not-proven`, `expectedEnd`. |
| 03 | Forged hop: `chain-hop-mismatch`, index 0 and breaking hop in refs. |
| 04 | Undrawn package, mixed `managedIn`/`partOf` repeat, ordered hops to repo. |
| 05 | Drawn repo beats drawn runtime; runtime claim fails before hops. |
| 06 | Only drawn runtime accepted when repo is undrawn. |
| 07 | Two drawn runtimes: `chain-ambiguous`, sorted candidate refs, scalar count. |
| 08 | No admitted end drawn: `chain-not-proven`. |
| 09 | First-drawn accepts the exposer on a proven external chain. |
| 10 | Undrawn exposer, drawn external system, full hops accepted. |
| 11 | Earlier drawn exposer blocks lifting to system, `earlierDrawn`. |
| 12 | Three registry members, sorted set, smallest carrier accepted. |
| 13 | Omitted and extra member cases: exact counts and first differing ref. |
| 14 | Unsorted complete members refused without reordering. |
| 15 | Unknown id, absent declarations, empty declarations all `chain-not-declared`. |
| 16 | `partOf` cycle terminates with only `chain-not-proven`. |
| 17 | Chain remains valid when its drawing is grouped/folded and filters/camera change. |
| 18 | Row 8 retains the fold pairing template; existing folded-view and all M1c suites pass. |
| 19 | Four unchanged baseline fixtures retain fixed content-byte SHA-256 and empty document/view validation output; existing canonical/plain suites pass. |
| 20 | `tests/profiles.test.ts`: all five declaration checks, empty/duplicate ids, unknown/empty type/step lists, attributes, aggregation paths/sort, and function serialisation refusal. |
| 21 | No exposer in the document: `chain-not-proven`. |
| 22 | Two distinct exposers, including an undrawn one: `chain-not-proven`, `cause: cardinality`; no semantic cardinality diagnostic. |
| 23 | Stops at first repo; extra hop past it fails at recomputed length. |
| 24 | Swapped hops fail at index 0. |
| 25 | Two drawn repos in the selected alternative: ambiguous with both candidates. |
| 26 | Drawn non-admitted intermediate blocks the external lift, `blockingDrawn`. |
| 27 | Non-external system drawn at/before claimed end: not proven. |
| 28 | Non-registry target excluded; declaring that member fails, omitting it accepts. |
| 29 | Second member used as carrier fails with equal counts and expected carrier ref. |
| 30 | Source reaching another repo excluded from this repo's member set. |
| 31 | Recomputed N=0 fails aggregation before carrier hops. |
| 32 | Second occurrence of the same repo entity accepted. |
| 33 | Members on non-aggregate fail after lookup; unknown predicate retains lookup priority. |
| 34 | Aggregate without members: `chain-hop-mismatch`. |
| 35 | Predicate outside declared relation types: `chain-hop-mismatch`. |
| 36 | Empty hops on an otherwise proven chain: `chain-not-proven`. |
| 37 | Semantic target alone: fold-template `provenance-missing`. |
| 38 | Source occurrence alone: same fold-template refusal. |
| 39 | Chain witness alone: same fold-template refusal. |
| 40 | Source occurrence plus chain, no semantic target: same fold-template refusal. |
| 41 | Dangling drawn relation: only its relation-reference diagnostic, no endpoint diagnostic. |
| 42 | Colliding types in another profile cannot contribute relations, intermediates or ends. |
| 43 | Start/end profile supertypes and document refinements accepted; unresolved type cannot match. |
| 44 | Enum string constraint matches; text `true` cannot satisfy boolean true. |
| 45 | Diamond revisits a repo at the repeated-step state on a second branch; only that branch satisfies the required hop. |
| 46 | Parallel relations remain distinct, first UTF-16 relation chosen; second claim fails. |
| 47 | Earlier drawn exposer takes precedence over forged hop order. |
| 48 | `tests/folded-view.test.ts`, `AC-48 verbatim chain carriage`: unrelated fold, aggregate fold/unfold, internal/hidden/visible branches, and invalid chain preserved for validation. |
| 49 | `tests/commands-inverse.test.ts`, `AC-49 chain carriage`: mixed fold/chain replacement plus inverse restores content bytes; direct repair and unrelated removal plus inverse retain chain bytes. View-only document revision remains unchanged. |
| 50 | Remove every entity occurrence except D; document-only proof still accepts. |
| 51 | Declared empty members with N=3: aggregation mismatch, counts 3/0. |

Additional cases cover source/target tuple precedence over member relation id,
relation-type precedence over hop id, dangling hop/member priority, semantic-target
and missing-drawing priority, port owner resolution, first-successful-branch
selection, and a 12,000-hop path without recursive traversal.

## Commands and results

All shell commands were invoked through `rtk`. The commands below show their
underlying npm/node invocations. Package test commands were scoped throughout.

| Command | Result |
| --- | --- |
| `export npm_config_cache=/home/antoinefa/.cache-tmp/claude-1000/-home-antoinefa-src-sent-tech-design-system/fe9b0873-fc2a-40be-844a-6728d7f3f06f/scratchpad/npm-cache; npm ci --no-audit --no-fund` | Executed once, 767 packages installed. |
| `npm run --workspace @sentropic/diagram-core test` | 42 suites, 639 passed. |
| `npm run --workspace @sentropic/diagram-canvas test` | 39 suites, 449 passed, one existing skip; final run 68.91 s. |
| `npm run --workspace @sentropic/diagram-core check` | TypeScript source and test checks passed. |
| `npm run --workspace @sentropic/diagram-core build` | Passed, including no-DOM/no-runtime-dependency source boundary. |
| `npm run --workspace @sentropic/diagram-canvas check` | TypeScript source and test checks passed. |
| `npm run --workspace @sentropic/diagram-canvas build` | Passed. |
| `node --test scripts/diagram-view-schema-conformance.test.mjs` | 15 passed, old @1/@2 matrix and built-core guard. |
| `npm run --workspace @sentropic/diagram-core test -- tests/view-schema-conformance.test.ts` | 23 passed, including final exact canonical schema file and strict compilation. |
| `npm run build --workspace @sentropic/design-system-tokens --workspace @sentropic/design-system-themes --workspace @sentropic/graph --workspace @sentropic/design-system-rich-text --workspace @sentropic/dataviz-core` | Five declaration/build prerequisites passed. |
| `npm run build --workspace @sentropic/design-system-svelte --workspace @sentropic/design-system-react --workspace @sentropic/design-system-vue --workspace @sentropic/design-system-angular --workspace @sentropic/dataviz-svelte --workspace @sentropic/dataviz-react --workspace @sentropic/dataviz-vue --workspace @sentropic/dataviz-angular` | All eight passed. |
| `npm run --workspace @sentropic/design-system-component-index build` | Passed. |
| `npm run --workspace @sentropic/design-system-component-index index:generate` | Passed after building prerequisite declarations; changed only the diagram-scene contract and its contract index. Unchanged entry-index bytes retained. |
| `npm run --workspace @sentropic/design-system-component-index index:check` | 430 artifacts fresh, including after retaining the unchanged entry-index stamp. |
| `npm run notices:generate` | 22 publishable packages; no committed notice changes. |
| `npm run licensing:check` | Passed for 22 publishable packages, including tarball licence/notice presence. |
| `npm pack --workspace @sentropic/diagram-core --dry-run --json` | Passed, 76 files including the @3 schema text and digest; no package published. |
| `npm ls @sentropic/diagram-core --all` | Core 0.1.0 workspace linked; canvas exact 0.1.0 dependency deduped to it; lockfile unchanged. |
| `harness check scope`, `harness check branch`, `git diff --check` | Passed. |

Focused tests were also run while developing profile checks, endpoint diagnostics,
fold carriage and inverses. The initial carriage tests reproduced the baseline
refusal/stripping, then passed after L4. Fixture/type assertion errors, an outdated
next-schema-version negative, manifest file-list assertion, source-hash receipt,
and a strict-schema required-property issue were corrected and reverified. The
initial index generation failure was missing declaration output, resolved by the
listed builds. No timeout was increased.

Non-fatal command output included npm config/engine/deprecation warnings,
Angular template diagnostics, and the index generator's existing date-time format
warnings and declared exclusions. No browser, Chromium, root npm test, Python,
stash, version bump, tag, push or registry publish was used. Existing fixtures and
the confidential paths excluded by the owner were left untouched.

## Review and handoff

Source audit checked pairing/ref-resolution/lookup/selection/hop priority,
branch-local cycle handling, profile isolation, scalar diagnostics, aggregate
carrier ordering, carriage branches, old schema bytes and package contents.
Independent consensus review was not dispatched: the exact author model/effort
are unavailable and no `h2a_run` MCP tool is exposed. This is a review selection
failure, with no peer verdict or consensus claim.

`BRANCH.md` is the mergeable lot/progress artifact. Track sidecar import stays
with the conductor under the concurrent-worktree single-writer rule. Release
versioning, downstream pin changes and publishing remain with the conductor.

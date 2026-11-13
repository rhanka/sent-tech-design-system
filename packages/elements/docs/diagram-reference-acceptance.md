# DecisionDossier diagram references: DS acceptance

Target: elements **0.3.0**, Focus **0.6.0**, DecisionDossier contract **1.1**,
embedded schema **1.1.0**. Normative source:
`SPEC_EVOL_DOSSIER_DIAGRAM_REF.md`, DS criteria B1–B17.

## Independent review corrections

Reviewed base: `f9d1702e`, independent verdict **NON FUSIONNABLE**.

| Finding | Fix | Failing-first witness and result |
| --- | --- | --- |
| P1: the public element refuses contract 1.1 and the new document fields | Pin the owner's 1.1.0 schema and digest, declare contract 1.1, regenerate catalogue and standalone | Existing B1/B7/B8/B16/B17 and runtime assertions reproduced the refusal before the fix; all pass afterwards |
| P1: manifest, lockfile and installation disagree; versions are stale | Elements 0.3.0 and Focus 0.6.0 agree across manifest, lockfile and installed package; lockfile uses a checked-in owner build archive | New consistency regression failed on locked 0.5.0 versus declared 0.6.0-rc.1; passes after the fix and a clean `npm ci` |
| P2: Gantt markers escape the viewport or produce infinite coordinates | Include marker in both domain bounds after normalization | Seven cases at default and extreme widths; six failed before the fix, all seven pass afterwards |

## Second review correction

Reviewed base: `54bfacfa`, independent verdict **FUSIONNABLE AVEC CORRECTIFS**.

| Finding | Fix | Failing-first witness and result |
| --- | --- | --- |
| P2: three tasks at `height: Number.MAX_VALUE` produce an infinite third-bar y coordinate | Divide the task index by the task count before multiplying by the available height | Three resolver-to-SVG cases at height 320, half the finite maximum and the finite maximum; the maximum failed with `Infinity` before the fix, all three pass afterwards |

The regression verifies accepted props, resolved state without diagnostics,
three evenly spaced task bars, positive bar heights, bounded bar extents,
marker height, and finite horizontal and vertical SVG geometry.

The second correction pass ran in `.elements03-wt` with the specified npm
cache and no browser launch, root test command, or Track command:

| Command | Result |
| --- | --- |
| Elements Vitest, `tests/diagram-reference.test.ts -t "finite vertical geometry"` | Before: 1 failed, 2 passed; after: 3 passed |
| `npm run test -w packages/elements` | 307 passed across 18 files, no failures or skips |
| `npm run check -w packages/elements` | Pass: Node and DOM TypeScript projects |
| `npm run build -w packages/elements` | Pass: Node and browser bundle; core 56,869 / 153,600 gzip bytes |
| Elements `catalog:generate` and `catalog:check` | Pass: 6 fresh artifacts, no catalog diff |
| Component-index `build`, `index:generate` and `index:check` | Pass: 430 fresh artifacts; only source-commit stamps changed |
| `npm run test -w packages/component-index` | 136 passed across 15 files |
| `node --test scripts/elements-catalog.test.mjs scripts/elements-browser-artifacts.test.mjs scripts/elements-publish-tarball.test.mjs` | 18 passed, no failures or skips |
| `npm run notices:generate` and `npm run licensing:check` | Pass: 22 publishable packages, no notice diff |

## Installation source and release prerequisite

On 2026-11-12, npm metadata and the stable Focus 0.6.0 tarball URL returned
404. The root lockfile instead resolves the exact 0.6.0 dependency to
`vendor/sentropic-focus-0.6.0.tgz`, packed from the clean owner build at
`rhanka/h2a` commit `e49612b3811dc40b501c54400ebf086d74ec4839`.
The archive, its measured integrity, schema digest and provenance are
documented in [vendor/README.md](../vendor/README.md). No owner files were
modified. The archive is committed for reproducible checkout installation;
it is excluded from the published Elements package.

**Publication remains blocked.** Owner: Focus publisher. Publish Focus
0.6.0, refresh the lockfile against the registry artifact, and rerun the
checks below before publishing Elements 0.3.0. Local acceptance below uses
the owner build, not a registry publication or a substitute validator.

Focus 0.6 also tightens its presentation readability gate. The five small
presentation fixtures now include the required takeaway. The historical
Track fixture stays byte-identical. Its 51-section order, 73 option labels,
outcome and 24 recommendations are compared to a frozen projection of the
published Focus 0.5.0 HTML renderer, recorded in
`tests/fixtures/dossier-track-presentation.json` with its input digest.
The suite separately asserts that the real Focus 0.6 legacy profile accepts
that input and its strict presentation renderer refuses it. Other
presentation fixtures still compare directly with Focus 0.6 rendering.

## Acceptance mapping

| AC | Witness | Current result |
| --- | --- | --- |
| B1 | `diagram-contract.test.ts`: reference/inputs/criterion through embed + real focus; existing `dossier-track.test.ts` | Pass; Track fixture unchanged |
| B2 | `diagram-reference.test.ts`: verbatim resolver context, SVG bars, bare/root equivalence | Pass |
| B3 | Same: ten-case fallback matrix, exact single warning and section path | Pass |
| B4 | Same: late destroy and replacement discard; render-action re-ingest | Pass |
| B5 | Same: stubbed F1 hydrate refusal | Pass |
| B6 | Same: named no-resolver fallback, existing inline `<pre>` | Pass |
| B7 | `diagram-contract.test.ts`: installed schema id/hash/runtime pin; `catalog:check` | Pass |
| B8 | Same: 32-shape AJV/interpreter corpus, construction audit and pointer/keyword equality | Pass |
| B9 | `diagram-reference.test.ts`: reserved/unsupported short-circuit; `catalog.test.ts`: three entries | Pass |
| B10 | `diagram-reference.test.ts`: generated Gantt contract fixture, missing/blank task, non-finite times, class, 501 tasks | Pass |
| B11 | Same: function/cycle/DOM/UTF-8 budget failures and inclusive limit; runtime ready with never-settling resolver | Pass |
| B12 | Same: old resolver discard, mixed resolved/pending replacement, terminal preservation; action select/fold/replacement | Pass |
| B13 | Same: lazy engine load, F1/serialization, import/serialization/mount discard; `diagram-bpmn.test.ts`: actual adapter signal and cleanup with canvas stub | Pass with stubs |
| B14 | `diagram-reference.test.ts`: literal script/img/handler/href strings and attribute inspection | Pass |
| B15 | Same: persistent caption, placeholder and SVG names, task list, polite region, focus retained | Pass with jsdom |
| B16 | `diagram-contract.test.ts`: structural error vs host-warning surfaces; runtime warning forwarding | Pass |
| B17 | Same: J1-shaped G3 at 1.1, pre-1.1 unsupported-contract, legacy envelope | Pass |

## Command results (first correction pass)

All commands ran in `.elements03-wt`. Shell commands used the RTK prefix.

| Command | Result |
| --- | --- |
| `npm view @sentropic/focus@0.6.0 ...` and direct tarball HEAD | E404 / HTTP 404; owner build archive used locally |
| `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` | Pass with exact 0.6.0 manifest and local archive resolution |
| `npm ci --ignore-scripts --no-audit --no-fund` | Pass: 767 packages from consistent manifests/lockfile; engine/deprecation/config warnings |
| `npm run check --workspace packages/elements` | Pass, Node and DOM projects |
| `npm run build --workspace packages/elements` | Pass, Node + browser assets; no browser launched |
| `npm run test --workspace packages/elements` | **304 pass, 18 files, zero failures or skips** |
| `npm run test --workspace packages/elements -- tests/diagram-contract.test.ts tests/diagram-reference.test.ts tests/catalog.test.ts` | 110 pass, including public runtime integration |
| `npm run catalog:generate --workspace packages/elements` | Pass against owner schema 1.1.0 |
| `npm run catalog:check --workspace packages/elements` | Pass: 6 artifacts fresh |
| `npm run build --workspace packages/component-index` | Pass |
| `npm run index:generate --workspace packages/component-index` | Pass using existing built framework declarations; 430 artifacts |
| `npm run index:check --workspace packages/component-index` | Pass; date-time format warnings and declared excluded entries |
| `npm run test --workspace packages/component-index` | 136 pass across 15 files |
| `node --test scripts/elements-catalog.test.mjs scripts/elements-browser-artifacts.test.mjs scripts/elements-publish-tarball.test.mjs` | 18 pass: catalogue, plain Node exports, negative drift checks, bundle freshness/SRI/CSP/budget and packed contents |
| `npm run notices:generate` | Pass: 22 publishable packages; no notice diff |
| `npm run licensing:check` | Pass: 22 publishable packages |
| `git diff --check` | Pass |

`envelope.json` and `tests/fixtures/dossier-track.json` remain byte-identical
to the branch base. Real-browser, live BPMN pixels/hydration and live host
storage round-trip remain outside the specified gate.

## Review status

The supplied independent review was reproduced and its three findings
addressed as above. Fresh consensus review status: `selection-failed`.
The harness review skill requires exact author model/effort metadata and
launches through an h2a MCP tool. Exact metadata and that tool are
unavailable in this session, so no new peer consensus is claimed.

# DecisionDossier diagram references: DS acceptance

Target: elements 0.3.0 delivery lot, with no elements version bump in this
branch. Normative source: `SPEC_EVOL_DOSSIER_DIAGRAM_REF.md`, DS criteria B1–B17.

## Integration blocker

On 2026-11-12 the npm registry returned E404/ETARGET for
`@sentropic/focus@0.6.0-rc.1`, including its direct tarball URL. An uncached
metadata request reported `latest: 0.5.0`, `next: 0.5.0-rc.5`.
The manifest records the requested pin, but the lockfile and installed
validator remain at 0.5.0. This branch is incomplete and must not release.

The single `npm ci --no-audit --no-fund` run used the checked-in 0.5.0
manifest/lockfile pair to verify the independent renderer changes. The
requested manifest pin was restored afterwards. The supplied cache path
was exported before installation. No substitute owner schema, digest or
package integrity was fabricated.

Owner: focus publisher. Required handoff: make the exact 0.6.0-rc.1 release
available from a registry or provide its published tarball URL. The DS
continuation is bounded: install it and update the lockfile, read and pin
its 1.1.0 schema SHA-256, update `decision-dossier.ts` metadata to contract
1.1 and schema id 1.1.0, regenerate the catalogue/standalone, update the
existing catalogue pin assertions, and rerun the commands below. Before
release the conductor must replace the prerelease pin with stable 0.6.0.

## Acceptance mapping

| AC | Witness | Current result |
| --- | --- | --- |
| B1 | `diagram-contract.test.ts`: reference/inputs/criterion through embed + real focus; existing `dossier-track.test.ts` | New shapes blocked by focus/catalogue 1.0; Track fixture unchanged |
| B2 | `diagram-reference.test.ts`: verbatim resolver context, SVG bars, bare/root equivalence | Pass |
| B3 | Same: ten-case fallback matrix, exact single warning and section path | Pass |
| B4 | Same: late destroy and replacement discard; render-action re-ingest | Direct renderer passes; runtime acceptance blocked |
| B5 | Same: stubbed F1 hydrate refusal | Pass |
| B6 | Same: named no-resolver fallback, existing inline `<pre>` | Pass |
| B7 | `diagram-contract.test.ts`: installed schema id/hash/runtime pin; `catalog:check` | 1.1 pin blocked; legacy catalogue freshness passes |
| B8 | Same: 32-shape AJV/interpreter corpus, construction audit and pointer/keyword equality | Legacy seams agree; new verdict expectations blocked by old embed |
| B9 | `diagram-reference.test.ts`: reserved/unsupported short-circuit; `catalog.test.ts`: three entries | Pass |
| B10 | `diagram-reference.test.ts`: generated Gantt contract fixture, missing/blank task, non-finite times, class, 501 tasks | Pass |
| B11 | Same: function/cycle/DOM/UTF-8 budget failures and inclusive limit; runtime ready with never-settling resolver | Payload checks pass; runtime ready acceptance blocked |
| B12 | Same: old resolver discard, mixed resolved/pending replacement, terminal preservation; action select/fold/replacement | Direct renderer passes; action acceptance blocked |
| B13 | Same: lazy engine load, F1/serialization, import/serialization/mount discard; `diagram-bpmn.test.ts`: actual adapter signal and cleanup with canvas stub | Pass with stubs |
| B14 | `diagram-reference.test.ts`: literal script/img/handler/href strings and attribute inspection | Pass |
| B15 | Same: persistent caption, placeholder and SVG names, task list, polite region, focus retained | Pass with jsdom |
| B16 | `diagram-contract.test.ts`: structural error vs host-warning surfaces; runtime warning forwarding | Schema/runtime acceptance blocked; direct renderer warning shape passes |
| B17 | Same: J1-shaped G3 at 1.1, pre-1.1 unsupported-contract, legacy envelope | Blocked by old catalogue |

## Command results

All commands ran in `.elements03-wt`. Shell commands used the RTK prefix.

| Command | Result |
| --- | --- |
| `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` with requested pin | Failed: ETARGET, requested focus release absent |
| `npm view @sentropic/focus@0.6.0-rc.1 ... --prefer-online` and direct tarball HEAD | E404 / HTTP 404 |
| `npm ci --no-audit --no-fund` once, against checked-in dependency pair | Pass: 767 packages; engine/deprecation/config warnings |
| `npm run check --workspace packages/elements` | Pass after test return-type annotations |
| `npm run build --workspace packages/elements` | Pass, Node + browser assets; no browser launched |
| `npm run test --workspace packages/elements` | 279 pass, 16 fail; the new focus/contract integration expectations remain red |
| `npm run test --workspace packages/elements -- tests/diagram-reference.test.ts -t 'diagram-by-reference\|Gantt checker\|BPMN delegation'` | 39 pass; 3 runtime integration tests excluded by this filter |
| `npm run test --workspace packages/elements -- tests/diagram-bpmn.test.ts` | 3 pass; duplicate destroy caught and fixed before rerun |
| `npm run catalog:generate --workspace packages/elements` | Pass against installed legacy owner schema; no schema-content changes |
| `npm run catalog:check --workspace packages/elements` | Pass: 6 artifacts fresh, still legacy schema |
| `npm run build --workspace packages/component-index` | Pass |
| `node scripts/run-workspaces.mjs build --workspaces=...` for component/framework/dataviz declaration prerequisites | Pass; Angular/Svelte warnings |
| `npm run index:generate --workspace packages/component-index` | Pass after building declarations; 430 artifacts |
| `npm run index:check --workspace packages/component-index` | Pass; date-time format warnings and declared excluded entries |
| `npm run test --workspace packages/component-index` | 136 pass across 15 files |
| `node --test scripts/elements-browser-artifacts.test.mjs` | 4 pass: freshness, SRI, pack contents, CSP scan and size |
| `npm run notices:generate` | Pass: 22 publishable packages; no notice diff on baseline dependencies |
| `npm run licensing:check` | Pass: 22 publishable packages |
| `git diff --check` | Pass |

`envelope.json` and `tests/fixtures/dossier-track.json` remain byte-identical
to the branch base. Real-browser, live BPMN pixels/hydration and live host
storage round-trip remain outside the specified gate.

## Review status

Status: `selection-failed`. The harness review skill requires exact author
model/effort metadata and launches through an h2a MCP tool. Exact metadata
and that tool are unavailable in this session, so no peer consensus is
claimed. The implementation received a local source/lifecycle review plus
the executable checks above.

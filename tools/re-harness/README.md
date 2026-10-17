# RE harness — common differential parity harness (Lot L0)

## Model

**The harness defines no diagram model.** It has no semantic schema and no
canonical form of its own for BPMN, xyflow or JointJS (owner rule,
2026-10-17: our model must map the XML without carrying the XML's weight
internally, and no additional model is invented).

- **The metamodel is `packages/diagram-core`** (`DiagramState`, profiles,
  commands, `src/canonical.ts`, `src/view.ts`; see
  `packages/diagram-core/README.md`). BPMN enters it through **A′**:
  `spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md` (profiles generated from the
  bpmn-moddle descriptors, moddle JSON F1 ↔ `DiagramState` exchange through
  the proposed private package `@sentropic/diagram-bpmn-moddle`; §2, §4,
  §5, lots in §13).
- **BPMN reference**: the compared model is the moddle tree of the real
  library (`modeler.getDefinitions()`), projected **mechanically by the
  bpmn-moddle descriptors** (`projectModdle` in `harness-page.html`:
  `$type`, every declared property carrying a value — own or descriptor
  default —, references as ids, DI included; virtual properties skipped
  and empty collections equal to absent ones, both by moddle semantics).
  The XML is an input (`fixtures/bpmn/*.bpmn`, loaded verbatim by
  `importXML`) and a boundary check (`saveXML` → `moddle.fromXML` →
  projection must equal the live tree), never the internal model.
- **BPMN candidate**: `DiagramState` through the A′ codec
  (`toDiagramState` / `toModdleJson`), delivered by lot L3 of
  `SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md` §13. It does not exist yet: at L0
  the candidate runner declares `unsupported` citing that lot
  (`CANDIDATE_STATUS` in `src/runners.mjs`), and no ad hoc converter
  stands in for it.
- **xyflow and JointJS**: the reference is compared on its own native
  outputs — the xyflow store state (nodes, edges, viewport) and JointJS
  `graph.toJSON()` — canonicalised by key sorting only, without renaming
  or reinterpreting anything. The candidate will reach them through
  `DiagramState` and the adapters of later lots (`unsupported` at L0).
- `schemas/fixture-model.schema.json` describes only the fixture
  **envelope** (id, library, the reference's native `input`, run options);
  operation scripts live in `schemas/fixture-ops.schema.json`.

One harness shared by the three reverse-engineering programmes
(bpmn-js, xyflow, JointJS → `@sentropic/graph`). It builds the means of
proof only: no parity entry is implemented here, and no verdict in this
directory upgrades an inventory `status`. A behaviour is `covered` only
when a later lot proves it candidate-against-reference; at L0 the
candidate runner is a stub that declares `unsupported` per entry.

Normative sources (read before changing anything):

- `spec/SPEC_RE_BPMN_JS_PARITY.md` §8 (harness) and §9 (line L0)
- `spec/SPEC_RE_XYFLOW_PARITY.md` §6 (harness) and §8 (line L0)
- `spec/SPEC_RE_JOINTJS_PARITY.md` §4 (contracts), §5 (harness) and §6 (Lot 0)

## Real oracles (prerequisite)

The reference side runs the REAL pinned libraries, never a rewritten
engine. The libraries are installed **outside** the repository, read-only,
under `.ds-scrap/re-oracles/` at the repository root, at the exact spec
versions: bpmn-js 18.31.0, diagram-js 15.28.1, bpmn-moddle 10.3.1,
@xyflow/system 0.0.83, @xyflow/react 12.12.0, @xyflow/svelte 1.7.0,
react and react-dom 19.2.0, svelte 5.56.4, @joint/core 4.3.3,
esbuild 0.25.12. `build-bundles.mjs` bundles them for the browser with
that esbuild; the bundles land in `tools/re-harness/bundles/`, which is
git-ignored (`tools/re-harness/.gitignore`): the build script is
committed, the bundles never are, and no library code is copied into the
repository. No dependency is added to any repository manifest.

Recreating the oracle installation is a **manual, one-time step for a
human** (it needs network access; CI without network must not run it —
without the bundles the gates below report `unknown`, never green):

```bash
# from the repository root (not a worktree)
mkdir -p .ds-scrap/re-oracles
npm install --prefix .ds-scrap/re-oracles --save-exact \
  bpmn-js@18.31.0 diagram-js@15.28.1 bpmn-moddle@10.3.1 \
  @xyflow/system@0.0.83 @xyflow/react@12.12.0 @xyflow/svelte@1.7.0 \
  react@19.2.0 react-dom@19.2.0 svelte@5.56.4 \
  @joint/core@4.3.3 esbuild@0.25.12
node tools/re-harness/build-bundles.mjs   # offline; RE_ORACLES_DIR overrides the location
```

Headless Chrome is the second prerequisite (the real bpmn-js/xyflow
oracles need a DOM/SVG engine): `playwright-core` comes from the
repository lockfile and drives the system Chromium.

## Layout

| Path | Content |
|---|---|
| `schemas/` | Versioned JSON schemas (v1): `fixture-model` (fixture envelope only: id, library, native `input` — `.bpmn` file, xyflow flow input, JointJS graph JSON), `fixture-ops` (operation scripts, `undo`/`redo` first-class), `fixture-pointer` (pointer/keyboard scripts in viewport coordinates), `scenario`, `report`. Every fixture is validated against its schema before a run. |
| `contracts/` | Frozen JointJS Lot-0 contracts (display list, camera, magnet descriptor), one versioned schema each, with the spec section and line cited per property; `jointjs-event-projection.json` freezes the §5.5 events→effects projection used by the JointJS journal. |
| `fixtures/` | Native reference inputs. `bpmn/` holds the first corpus as complete BPMN 2.0 XML files with BPMNDI (task, events, gateways, pools/lanes, collapsed subprocess, expanded subprocess, data objects, annotations), one envelope and one `*-edit.ops.json` script per file whose targets all exist in that file; `xyflow/` holds one fixture per inventory example (93, generated by `gen-xyflow-fixtures.mjs` from the pinned example sources; non-extractable examples are `unknown` with their cause); `jointjs/` holds native `dia.Graph` JSON; `scenarios/` names, per scenario, the inventory entries it exercises. |
| `bundle-entries/` | Committed bundle entry points: real bpmn-js Modeler + CSS, @xyflow/react with a small controlled host, @xyflow/svelte with a small host component, @joint/core. Bundled by `build-bundles.mjs` from `RE_ORACLES_DIR`. |
| `build-bundles.mjs` | Builds one browser bundle per oracle with the oracles' esbuild (Svelte components compiled by the pinned svelte compiler through an esbuild plugin; every bare import resolved oracle-first so no repository copy of react/svelte can leak in). Records per-library `built`/`unknown` + cause in `bundles/manifest.json`. |
| `harness-page.html` | The page the real oracles run in. Adapters: bpmn-js via `importXML` of the fixture file verbatim, `modeling`/`commandStack` for the operations (undo/redo included), `eventBus` journal, the descriptor projection of `getDefinitions()` as model, `elementRegistry` + `canvas.viewbox()` for geometry, `saveXML` for the round trip; xyflow via the library store (model), `onNodesChange`/`onEdgesChange`/`onConnect`/`onInit` (journal, change objects verbatim), a real pointer drag for `move`, the DOM bounds of the nodes and the rendered SVG edge paths; JointJS via `graph.fromJSON`/`graph.toJSON()`, `dia.Graph` events projected by the frozen contract, `paper.findViewByModel(...).getBBox()` and the link view route. Pixels are a screenshot of the rendered container, taken by the Node runner. |
| `src/oracles.mjs` | Oracle resolution (`RE_ORACLES_DIR`, default `<repoRoot>/.ds-scrap/re-oracles`), expected versions, per-library bundle status. |
| `src/runners.mjs` | Runner adapters: the real in-page runners (with the container screenshot) and the candidate stub (`unsupported`, `CANDIDATE_STATUS`). |
| `src/comparators.mjs` | The comparators in spec strength order: model (key-sorted, floats at 1e-6, a key on one side only fails), event log (ordered names, payload keys and values at 1e-6, bijective id-correspondence), geometry (bounds ±1 CSS px, xyflow rendered geometry ±0.5 px, DOM bounds, waypoints with JointJS per-function rounding then 1e-6, SVG edge paths parsed and compared at 1e-6; anything present on one side only fails; text metrics excluded until the font decision), pixels (secondary signal, per-fixture threshold, missing capture = `unknown`). |
| `src/chrome.mjs` | Headless-Chrome driver: `playwright-core` from the repository lockfile when present, then `puppeteer-core`. Real-oracle bootstrap: fixed seed, reduced motion forced, native clocks/rAF (the real libraries schedule on them). |
| `verify-coverage.mjs` | Scenario → inventory coverage verifier (same style as `tools/re-*/verify.mjs`). Reports the P0/P1 gap per library; fails only with `--strict`. |

## Commands

```bash
node tools/re-harness/build-bundles.mjs               # build the real-oracle bundles (offline)
node tools/re-harness/src/harness.mjs run             # REAL gates: bpmn 8 + xyflow 93 + jointjs auto-parity
node tools/re-harness/src/harness.mjs run --only=bpmn --dump=/tmp/dir  # partial run for iteration (never archived)
node tools/re-harness/src/harness.mjs selftest        # REAL JointJS gate: injected divergences on real output
node tools/re-harness/gen-xyflow-fixtures.mjs         # regenerate the 93 xyflow fixtures from the pinned sources
node tools/re-harness/src/harness.mjs coverage        # scenario -> inventory gap report
node tools/re-harness/verify-coverage.mjs             # same, gate-style entry point
node --test tools/re-harness/tests/harness.test.mjs   # focused unit tests + the oracle guard
npm run re:harness                                    # root alias for the real gates
npm run re:harness:selftest                           # root alias: selftest + coverage
```

Every run writes a small deterministic JSON report under
`docs/re/harness-runs/` (keys sorted, no timestamps, no absolute paths):

| Report | Oracle | Meaning |
|---|---|---|
| `self-parity.json` | `real` | Gate: two independent runs of each real library, compared. bpmn-js auto-parity incl. undo/redo chains and the XML round trip on the 8 fixtures; xyflow on the 93 example fixtures; JointJS on its graph fixture. Carries `candidate` (`unsupported` per library, with the delivering lot). |
| `xyflow-examples.json` | `real` | Gate detail: the executed example fixtures with their archived real outputs (store state, geometry, DOM bounds, edge paths, viewport), plus the exact list of fixtures that did not run, each with its cause. |
| `selftest.json` | `real` | Gate: divergences injected into REAL @joint/core output must be detected on all four comparators (with an identical-output control). |

Gate reports carry `oracle: "real"` and `oracleVersions` read from the
oracle packages' own `package.json` files; each scenario repeats
`oracle: "real"` with its library version. A report is validated against
`schemas/report.schema.json`; the gate guard (`assertGateReport`) also
requires a non-empty scenario list, every scenario `pass`, no skipped
operation and `oracleVersions` equal to the pinned versions. A skipped
operation fails its scenario. When an oracle cannot run (bundle not built,
Chrome absent, library error), its scenarios are reported `unknown` with
the cause and the command exits non-zero. The unit suite accepts an
archived gate report only when it is green, or when its sole non-green
scenarios are `unknown` with `causeKind: "fixture-extraction"` (an
example that cannot be reproduced from data): such a gate is reported
`unknown`, never green.

## Gate status (recorded, with evidence)

Self-parity of the REAL libraries only (reference against itself): no
inventory entry becomes `covered` from these verdicts, and the candidate
side is `unsupported` at L0.

- bpmn-js 18.31.0: `pass` on the 8 fixtures — model (descriptor projection
  of the moddle tree), event journal of 273–290 real `eventBus` events
  (all event types, not only `commandStack.*`), geometry, pixels,
  byte-identical `saveXML` across the two runs and the XML round trip;
  operation scripts with undo/redo, no skipped operation.
  Command: `node tools/re-harness/src/harness.mjs run`.
- xyflow (@xyflow/react 12.12.0, @xyflow/svelte 1.7.0): `unknown` as a
  gate — 59 of the 93 example fixtures `pass` (store state, 1–26 journal
  events, DOM bounds, SVG edge paths, pixels; 54 of them with a real
  pointer drag), 34 are `unknown` by fixture: 23 use custom node/edge
  types (application components), 11 have a computed or non-literal
  initial graph. Same command; details in `xyflow-examples.json`.
- JointJS (@joint/core 4.3.3): self-parity `pass` on `jointjs-basic`
  (`graph.toJSON()`, projected journal, geometry with manhattan rounding,
  pixels); divergence selftest `pass` — model, geometry and event
  divergences injected into the real output, and a fill changed through
  the real `attr` API captured by container screenshot, are all
  detected; the identical-output control passes. Command:
  `node tools/re-harness/src/harness.mjs selftest`. Undo/redo is not part
  of the JointJS gate: @joint/core ships no command manager.

Two consecutive full runs give identical verdicts; only sub-threshold
pixel mismatch ratios (≤ 0.0002, threshold 0.01) vary between them.

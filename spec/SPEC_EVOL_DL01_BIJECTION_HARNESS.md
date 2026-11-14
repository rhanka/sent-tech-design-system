# DL-0 and DL-1 (DS side) — frozen implementation spec

| Field | Value |
| --- | --- |
| Status | Frozen implementation spec, revision 2. Written 2026-11-07 by the design-system design agent. No code, fixture, test or workflow was written or run for it; every measurement below was a read-only command. Revision 2 applies the Argon review of revision 1 (sha256 `453cb9009ba8c578dcc20c439507cdea784be8dde5f6696a00c666f61dc7d8a8`) and the engram interface update of 2026-11-07; the review ledger is the last section. |
| Lots | B2 demonstration plan: DL-0 (DS, at most 3 days) and the DS half of DL-1 (lot shared with engram, 7 days in total, PLAN:186-187). |
| Owner basis | Decision B, orientation B2 (DLR-005, DLR-006). Q4 « Replié + exceptions » (DLR-380). Q5 « S2-target anonymisé + 711 » (DLR-381). Q6 « Plus tard » (DLR-382). Q7: Decision C D2–D6 ratified with the DS conditions D3 (every export byte-identical at a pinned version) and D6 (no new card shape) (DLR-383). DLR-161 « sans trace dans un commit ». |
| Frozen inputs | PLAN = `scratchpad/diag-lib/b2-demo-plan.md` (sha256 `96348c6b3ebe46d75eaaa62e38da281c3bb071aac29fb4fa8fc7be3f55ab0589`). P2 = P-2 r3 `P2-PARTITION-NOTE.r3.md` (sha256 `9523c19784c51e4f2955c324f8b1345be433d2b6dc139375595c9bca37ce820b`, Argon ACCEPT). REG = `docs/diagram-library/OWNER-REQUIREMENTS.md`, merged to main by PR #255 (merge commit `0ee8b185`), read at `28651ae0` of its branch (sha256 `be93638cb88806926f1508e708f94613b6830ce82c8acb20bad1f95f26b96308`). |
| Not final | IFACE = engram codec interface (`dl01-engram-interface.md`, sha256 `c31cffe6f378f825cabed2d5fe0bee9e4f9109b674aa96afd133767773e2ac4f`), including its « Update 2026-11-07 » that supersedes the first names. The announced names are written once, in `engram.pin.json`, and verified at the engram merge sha (§3.1). |
| Stack | Node 22 and TypeScript only, zero Python. No network at test time except loopback. Browser steps run in CI only; a local run reports « not run (host GPU) », never a pass. |
| Tags | [FACT] measured at the cited source; [JUDGMENT] design choice of this spec; `proposed` new symbol, file, field or code; `unverified`, `not covered`, `source-gap` as in P2. |
| Confidentiality | S2-target is Airbus content. This spec cites it by path, sha256 and structural counts only. It holds no label, name, identifier or text of it. |

## 0. Facts that shape this spec

| # | Fact | Source |
| --- | --- | --- |
| F-1 | The register is merged to main by PR #255, merge commit `0ee8b185` (coordinator, 2026-11-07). The local ref `origin/main` (`e79b9142`) was stale and the merge object is absent from the local clone, so this spec reads the register at its branch head `28651ae0`. | coordinator message; `git cat-file -t 0ee8b185` fails locally; `git log --all -- docs/diagram-library/OWNER-REQUIREMENTS.md` |
| F-2 | engram `main` = `90e6882b` (lot 3). `./archi` exports `types` and `import` only, no `require` arm. The tsup ESM block builds `archi` with `splitting: true`; the CJS block builds it with `splitting: false`. The source closure of `src/archi.ts` is 23 files; its only external import is `node:crypto`. | ENG `package.json:51-54`; `tsup.config.ts:56-57, :79, :88-89, :95`; closure measured with `git show` |
| F-3 | `@sentropic/engram/archi` exports `checkArchi`, `projectArchiCards`, `archiSummaries`, `checkArchiView`, `ARCHI_V1`, `ARCHI_V1_PIN`, `ARCHI_CARDS_CONTENT`, `ARCHI_CARDS_PIN`, `GENERIC_V2`, `CONTRACT_PIN` and types. It does not export `buildArchiSourceView` nor the `ArchiViewSpec` type. | ENG `src/archi.ts:3-38`; `archi-view.ts:86, :131` |
| F-4 | `projectArchiCards` returns `{ outcome: "ok", diagram, measures }` or `{ outcome: "refused", diagnostics }`. It carries no render options (P2 §10 A4 not landed). `ArchiViewSpec` has no `layout` field (P2 §10 A3 is in flight, uncommitted, in the engram codec worktree). | ENG `archi-cards.ts:95-104, :458`; `archi-view.ts:86-93` |
| F-5 | When this spec was first written, the codec was not committed (branch `feat/archi-mermaid-codec` at `90e6882b`, uncommitted work in its worktree). engram's own build brief states: « The G-T5 GitHub-Mermaid witness is the DS's part. » The IFACE update of 2026-11-07 announces, at the merge sha: a new zero-dependency subpath `@sentropic/engram/archi-mermaid`; `buildArchiSourceView`, `ArchiViewSpec` and `ArchiManifest` exported from `@sentropic/engram/archi`; `proposed` and `toggleLabel` carried by `projectArchiCards`. F-3 and F-4 describe `90e6882b` only. | engram worktree `graphify-wt-archi`, `.archi-dl1-BRIEF.md`; IFACE « Update 2026-11-07 » |
| F-6 | archi-cards@1 allocates one line to each card slot (kicker and title 358 px, body, detail and footer 428 px), and one line to the folded zone kicker and title (290 px). | ENG `archi-cards-data.ts:337-355` |
| F-7 | Every archi@1 card kind needs at least one detail item (`runtime` → `runsOn`), else `archi-detail-missing`. Every non-actor entity needs an effective repo or an `ownedBy`, a `repo` needs `ownedBy`, a `host` needs `operatedBy`, else `archi-footer-missing`. The only card-to-card arrow of the closed matrix with one kind on both ends is `invokes` (runtime → runtime); its label must start with the verb (`archi-edge-verb`). | ENG `archi-cards-data.ts:305-313`; `archi-check.ts:117-205`; `archi-profile.ts:38-73` |
| F-8 | Mermaid 11.15.0 defaults: `maxTextSize` 50 000 characters, `maxEdges` 500; browser bundles `dist/mermaid.min.js` and `dist/mermaid.esm.min.mjs`. Measured on a local install outside the DS. The Mermaid version GitHub renders is `unverified` here (no network). | `node_modules/mermaid` 11.15.0 under `~/src/openerp` |
| F-9 | S2-target structure (pinned file, §2.4): 73 entities = 22 zones + 51 cards; 54 relations, all card → card, all solid, all labelled, no duplicate endpoint pair, no self loop, no link between an ancestor and its descendant. Zones by depth 0/1/2: 4/4/14. Cards by depth 1/2/3: 5/6/40. Zones holding cards only / zones only / both / nothing: 17/3/2/0; at most 9 children per zone. 42 cards carry one of 3 tint values, 9 cards and every zone carry none. | read-only counting of `ds-fixtures/S2-target.json` |
| F-10 | The pinned S2-target file holds no fold data. The default folds of that scene live in a second file, `governance-kit/hrpn/defaults.js`: one entry of 7 identifiers for this scene, 5 of which name zones of the pinned fixture and 2 of which name nothing in it. | same method, ids compared, never printed |
| F-11 | #711 central scene: 10 groups (depth 0/1/2: 5/4/1), 28 nodes (depth 1/2/3: 16/9/3), 50 edges, every edge node → node. Every edge has `class: 'reject'`, drawn dashed (`stroke-dasharray="4 5"`), and the scene legend reads « pointillés : raccordements proposés ». First display folds every group. Node tones: identity 3, proposal 16, neutral 9; group tones: proposal 4, identity 1, neutral 5. | GC `governance-central.js` @`4138a0ec`; ASVG `architecture-svg.js:49`; AF `ArchitectureFigure.svelte:12` |
| F-12 | The brief names the fold-exception annotation `%% @dl view fold-open`. Frozen P2 spells it `%% @dl expanded <EID>` inside a view block, and refuses any other fold syntax. This spec follows P2 (CP-11). | P2:191, :485-497 |
| F-13 | No commit touches `packages/diagram-core` between engram's DS pin `7c5a8c82` (engram `e46d8220`, archi lot 1) and DS `origin/main` `e79b9142`. | `git rev-list --count 7c5a8c82..origin/main -- packages/diagram-core` = 0 |
| F-14 | CI precedents: `graph-golden.yml` on `origin/main` (Chrome via `browser-actions/setup-chrome` pinned by sha, `CHROME_BIN`, a `*_REQUIRE_CHROME` switch); the AS-1 branch (`feat/as1-comment-mode` @`ab17f6f6`, not yet on `origin/main`) runs `node <file>.browser.test.mjs` witnesses in `verify.yml` shards. `scripts/run-script-guards.mjs` runs `scripts/*.test.mjs` in the unsharded `licensing` job; `scripts/verify-workflow-invariants.test.mjs` requires full-sha action pins and a top-level `permissions:`. | `.github/workflows/graph-golden.yml:55-76`; AS-1 `verify.yml:197-213`; `verify-workflow-invariants.test.mjs:618, :670` |

## 1. Placement: one private workspace package

**Decision** [JUDGMENT]: `packages/diagram-bijection/`, package `@sentropic/diagram-bijection` 0.1.0, `"private": true`, never published.

Why a package, and not `scripts/` or `tools/`:
- The harness imports DS workspace code at the DS commit under test: `@sentropic/diagram-core` (public), `@sentropic/diagram-canvas` (private) and `@sentropic/design-system-svelte/diagram-render` (pure renderers). Only a workspace can depend on them. This is the DS qualification replay of P-3 (PLAN:205).
- `scripts/ci-affected-workspaces.mjs` expands a change to its local dependents. A change to diagram-core, diagram-canvas or the card model then reruns the bijection witnesses in the `verify` shards with no extra wiring.
- `scripts/*.test.mjs` holds dependency-free repository guards that read the whole tree. The harness is a typed library with fixtures, codecs and CLIs. `tools/` folders are not workspaces, and no `verify.yml` step runs `tools/re-harness` (measured), so a harness there would run nowhere by default.
- Private, like `diagram-canvas` (owner 05/11, CHK:303) and the planned `@sentropic/diagram-bpmn-moddle` (PLAN:40). Nothing in PLAN asks for publication. Production codecs of later lots (scene SVG, draw.io, PlantUML, Open Exchange) are not placed here; their home is decided per lot (the proposed architecture DAG already names a `diagram-codecs` node, `docs/graph-dataviz-architecture-dag.json`).
- `verify.yml` path filters already cover `packages/**`, so every fixture under the package triggers the guards.

```text
packages/diagram-bijection/
  package.json  tsconfig.json  vitest.config.ts
  bin/dl-harness.mjs  bin/dl-anon.mjs          # thin launchers over dist/
  src/
    harness/   types.ts run.ts fold-states.ts verdict.ts model.ts goldens.ts
    report/    schema.ts validate.ts markdown.ts write.ts
    pins/      fixture-pins.ts engram-port.ts engram-types.ts
    formats/   stub-json.ts mermaid-strict.ts
    anon/      hrpn-fixture.ts out-of-repo.ts cli.ts
    structure/ types.ts lift.ts extract-central.ts
    projection/ folds.ts hints.ts to-ds-props.ts render-occurrences.ts
    bpmn/      xml-count.ts select.ts
  rawgate/     dl-rawgate.mjs dl-rawgate.d.mts digests.json   # plain ESM, zero dependency
  vendor/engram/<sha12>/archi.cjs  archi-mermaid.cjs           # DL-1, commit-pin mode only (§3.1)
  fixtures/
    pins.json  engram.pin.json  bpmn-selection.json
    structures/ s2-target-anon.structure.json s2-target-anon.provenance.json
                central-711.structure.json central-711.provenance.json
    scenes/     s2-target-anon.mmd central-711.mmd
    mermaid-strict/ manifest.json  <case>/input.mmd  <case>/expected/...
    synthetic/  hrpn-shaped.raw.json  hrpn-shaped.defaults.txt  tiny.structure.json
    report-vectors/  *.report.json
    goldens/stub-json/*.json
  preview/      # DL-1, NOT a workspace: own lockfile, installed only by the G-T5 step
    package.json package-lock.json mermaid-preview.pin.json g-t5.browser.mjs
  tests/*.test.ts
```

Scope of the workspace scripts: `vitest.config.ts` includes `tests/**/*.test.ts` only, and `tsconfig.json` includes `src` and `tests` only, so `preview/`, `rawgate/` and `vendor/` never run or type-check in the `verify` shards.

`package.json` (workspace dependencies pinned exactly, as `diagram-canvas` does; tool ranges as at the root):

```json
{
  "name": "@sentropic/diagram-bijection",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "license": "MIT",
  "scripts": { "build": "tsc -p tsconfig.json", "check": "tsc -p tsconfig.json --noEmit", "test": "vitest run" },
  "dependencies": {
    "@sentropic/design-system-svelte": "0.37.0",
    "@sentropic/diagram-canvas": "0.1.0",
    "@sentropic/diagram-core": "0.1.0"
  },
  "devDependencies": { "ajv": "8.20.0", "typescript": "^5.9.3", "vitest": "^4.1.11" }
}
```

Files outside the package: `.github/workflows/raw-label-gate.yml` (DL-0), `.github/workflows/diagram-bijection.yml` (DL-0 harness job, DL-1 G-T5 steps), new cases in `scripts/verify-workflow-invariants.test.mjs` (DL-0, DL-1), and the repository guard `scripts/dl-view-schema-pin.test.mjs` (DL-1, §3.5 L8). The DAG file is documentation only (no guard reads it: one comment in `scripts/verify-layering.test.mjs:14`); DL-0 adds the node `diagram-bijection` with its three edges so the declared architecture stays complete.

## 2. DL-0 (DS)

### 2.1 Harness skeleton S0–S6

The bijection unit is the authored record set compared on RFC 8785 bytes (P2 §1, IFACE). The DS computes those bytes with `canonicalBytes` of `@sentropic/diagram-core` (RFC 8785, `src/sha256.ts:69`).

```ts
// src/harness/types.ts
export type StepId = "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6";
export type StepStatus = "pass" | "fail" | "not-run" | "not-applicable";
export type NotRunReason =
  | "host GPU"
  | "engram pin pending"
  | "foreign tool not pinned"
  | "raw fixture unavailable"
  | "rawgate key absent"
  | "dependency lot missing"
  | "prerequisite failed";

export interface HarnessDiagnostic {
  readonly origin: "ds-harness" | "engram" | "diagram-core" | "ds-render" | "stub";
  readonly code: string;
  readonly path?: string;
  readonly message: string;
}
export type Outcome<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly diagnostics: readonly HarnessDiagnostic[] };

/** One persisted record (P2 §1): "manifest.json", "document.json", "view-specs/<local>.json"; "structure.json" for the stub. */
export interface CanonicalRecord { readonly name: string; readonly jcs: string }
/** The canonical model M: records ascending by name, names unique. */
export interface CanonicalModel { readonly records: readonly CanonicalRecord[] }

export interface FoldContext {
  readonly view: string;                         // view ref, e.g. "view:main"
  readonly containers: readonly string[];        // D(v), entity refs ascending (§3.3 FD-7)
  readonly defaultCollapsed: readonly string[];  // collapsed(v) ⊆ D(v), ascending
}
export type FoldStateId = "default" | "all-expanded" | "all-folded" | `toggle:${string}`;
export interface FoldState { readonly id: FoldStateId; readonly view: string; readonly collapsed: readonly string[] }

export interface LoadedFixture { readonly model: CanonicalModel; readonly folds: readonly FoldContext[] }
export interface ExportedFile { readonly bytes: Uint8Array; readonly mediaType: string }
export interface ImportedFile { readonly model: CanonicalModel; readonly fold: FoldState }

export interface JsonPatchOp { readonly op: "add" | "remove" | "replace"; readonly path: string; readonly value?: unknown }
export type ProbeExpectation =
  | { readonly kind: "model"; readonly record: string; readonly patch: readonly JsonPatchOp[] }
  | { readonly kind: "refused"; readonly code: string };
export interface EditProbe {
  readonly id: string;
  readonly kind: "allowed" | "forbidden";
  readonly what: string;                         // one English sentence, copied into the report
  apply(file: ExportedFile): ExportedFile;
  readonly expect: ProbeExpectation;
}
export interface ForeignSave {
  readonly tool: string;
  readonly version: string;
  save(file: ExportedFile): Promise<ExportedFile>;
}
export interface FormatCodec {
  readonly format: string;                       // "stub-json", "mermaid-strict", ...
  readonly chain: readonly string[];
  /** false for the committed text: it carries the default fold state of each view only. */
  readonly perFoldState: boolean;
  exportFile(model: CanonicalModel, fold: FoldState): Outcome<ExportedFile>;
  importFile(file: ExportedFile): Outcome<ImportedFile>;
  readonly probes: readonly EditProbe[];
  /** undefined: S5 not-run "foreign tool not pinned"; "not-applicable": no foreign tool exists for the format. */
  readonly foreignSave?: ForeignSave | "not-applicable";
}
export interface SceneRenderer {
  readonly id: string;                           // e.g. "ds-occurrences@0.37.0"
  render(model: CanonicalModel, fold: FoldState): Outcome<{ readonly svg: string }>;
}
export interface GoldenStore { digest(format: string, fixtureId: string, fold: FoldState): string | undefined }

export interface HarnessRun {
  readonly fixture: FixturePin;
  readonly load: (bytes: Uint8Array) => Outcome<LoadedFixture>;
  readonly codec: FormatCodec;
  readonly renderer?: SceneRenderer;             // absent: S6 not-run "dependency lot missing"
  readonly goldens: GoldenStore;
  readonly pins: ReportPins;
  readonly losses: readonly LossEntry[];         // declared data per format (§2.3)
  readonly checks?: readonly CheckResult[];      // CI-side checks injected by the CLI (G-T5)
  readonly unverified?: readonly string[];       // declared facts outside the steps
}
export interface HarnessIo {
  readFixture(pin: FixturePin): Promise<Uint8Array | { readonly unavailable: "raw fixture unavailable" }>;
}

// src/harness/run.ts, fold-states.ts, verdict.ts, model.ts
export function runHarness(run: HarnessRun, io: HarnessIo): Promise<BijectionReport>;
export function enumerateFoldStates(ctx: FoldContext): readonly FoldState[];
export function computeVerdict(
  steps: Readonly<Record<StepId, StepResult>>,
  checks: readonly CheckResult[],
  pins: ReportPins,
  declared: readonly string[],
): { readonly verdict: Verdict; readonly unverified: readonly string[] };
export function modelFromRecords(values: Readonly<Record<string, unknown>>): CanonicalModel;
export function modelsEqual(a: CanonicalModel, b: CanonicalModel):
  { readonly equal: true } | { readonly equal: false; readonly firstDifferingRecord: string };
```

Algorithm of `runHarness` (PLAN §5.1, made exact):

| Step | Action | Pass rule | Failure code |
| --- | --- | --- | --- |
| S0 | `readFixture`; check sha256 and byte length against the pin; `load(bytes)`. | Digest and length match; zero diagnostics. | `harness-pin-mismatch`, or the loader's codes. Unavailable bytes: S0 `not-run`, reason « raw fixture unavailable ». A failed S0 sets S1–S6 to `not-run`, reason « prerequisite failed »; an unrun S0 sets them to `not-run` with S0's reason. |
| S1 | For each fold state `s`: `F = exportFile(M, s)`. | `sha256(F)` equals the golden digest. A missing golden is a failure, never an automatic accept. | `harness-golden-missing`, `harness-golden-mismatch` |
| S2 | X1: `I = importFile(F)`. | `modelsEqual(I.model, M)` and `I.fold` equals `s`, for every exported state; at least one state is exported. | `harness-x1-mismatch`; `harness-vacuous` when no state is exported |
| S3 | X2: `F2 = exportFile(I.model, I.fold)`. | `F2.bytes` equals `F.bytes`, for every exported state; at least one state is exported. | `harness-x2-mismatch`; `harness-vacuous` |
| S4 | Each probe applied to the export of the first view's default state, then imported. | Allowed: the import equals M with the patch applied to the named record. Forbidden: refused, and the set of returned codes is exactly the declared code. At least one allowed and one forbidden probe, and every probe behaves (`done = of ≥ 1` for both fractions). | `harness-probe-unexpected`; `harness-vacuous` when a fraction is `0/0` |
| S5 | `foreignSave` defined: save, import. | Semantic X1 only (models equal). | `harness-foreign-mismatch` |
| S6 | Render M and `I.model` for each fold state. | Same sha256, zero refusal. | `harness-render-mismatch`, `harness-render-refused` |

Fold states: when `perFoldState` is true, `enumerateFoldStates` returns, in this order, `default` (collapsed = `defaultCollapsed`), `all-expanded` (∅), `all-folded` (D), then one `toggle:<EID>` per container c of D in ascending order (default with c toggled). Its length is 3 + |D|: 25 for S2-target-anon, 13 for central-711. Identical sets keep their own entries (for central-711, `default` equals `all-folded`); the report counts entries. When `perFoldState` is false, S1–S3 and S6 run on each view's `default` state only. The report copies `perFoldState`, and its `foldStates` is the number of states actually exported: 3 + |D| per view when `perFoldState` is true, one per view otherwise (25 for the S2-target-anon stub run, 1 for its text run).

Verdict (computed, never typed):
- `not demonstrated` when S0 is not `pass`, or any step or check is `fail` (a vacuous step is a `fail`, table above), or `x1.fail + x2.fail > 0`.
- `demonstrated` when S0–S4 and S6 are `pass` (so `x1.pass ≥ 1`, `x2.pass ≥ 1` and both edit fractions are complete with `of ≥ 1`), S5 is `pass`, `not-run` or `not-applicable`, every check is `pass` or `not-applicable`, and `pins.dsCommit` is not dirty.
- `partial` otherwise.
- `unverified` = « `<step> not run (<reason>)` » for every `not-run` step, the same for every `not-run` check, « dsCommit dirty » when it applies, then the declared strings, sorted and unique.

`runHarness` validates its own report (§2.3) before returning it; a report that fails validation is a harness defect (thrown), never written.

### 2.2 Stub format `stub-json/1`

The stub proves the skeleton without any codec. It is an identity codec over canonical JSON.

```ts
// src/formats/stub-json.ts
export const STUB_FORMAT = "stub-json";
export function stubJsonCodec(): FormatCodec;
export function loadStructureFixture(bytes: Uint8Array): Outcome<LoadedFixture>;   // §3.5 SceneStructure → one record "structure.json"
export function stubCardsRenderer(): SceneRenderer;                                // id "stub-cards@0.37.0"
```

- Export: the UTF-8 bytes of `canonicalBytes({ format: "stub-json/1", fold: { view, collapsed }, records: { <name>: JSON.parse(jcs) } })` followed by one LF.
- Import: exactly one final LF; the bytes must equal the canonical re-serialisation, else `stub-noncanonical`; keys exactly `format`, `fold`, `records`, else `stub-edit-unsupported`.
- Probes: allowed `rename-first-card` (patch `/cards/0/name` of record `structure.json`); forbidden `extra-key` (`stub-edit-unsupported`); forbidden `pretty-print` (`stub-noncanonical`).
- `foreignSave`: undefined, so S5 reports « not run (foreign tool not pinned) » and the path of an unverified step is exercised.
- Renderer: for each zone, `renderZoneSvg({ entityId, title: name, subtitle: role, collapsed }, { children: [] })`; for each card, `renderCardSvg({ entityId, title: name, body: [role] })`; both from `@sentropic/design-system-svelte/diagram-render` 0.37.0 with the default measurer (RCS:226, RZS:244); SVG strings concatenated in id order.
- DL-0 runs it on `s2-target-anon.structure.json` (25 states) and `synthetic/tiny.structure.json` (2 nested zones, 3 cards, 2 relations: 5 states). DL-1 adds `central-711.structure.json` (13 states).
- Goldens: `fixtures/goldens/stub-json/<fixture id>.json` = `{ "schema": "ds.bijection-goldens/1", "format", "fixture": { "id", "sha256" }, "digests": { "<view>|<fold state id>": "<sha256>" } }`, written only by `dl-harness.mjs goldens --update` and reviewed in the diff.

### 2.3 Loss report `ds.diagram-bijection-report/1`

Refinements of the PLAN §5.2 example [JUDGMENT]: `allowedMapped` and `forbiddenRefused` become integer pairs instead of « 4/4 » strings; a `steps` object gives each of S0–S6 a closed status; `checks` carries G-T5; `perFoldState` says whether `foldStates` counts the 3 + |D| states or one state per view; `verdict` is a closed enum computed by §2.1. Every other field keeps its PLAN name.

```ts
// src/report/schema.ts (types mirror the JSON Schema below)
export type Verdict = "demonstrated" | "partial" | "not demonstrated";
export type LossClass = "native" | "kept via property" | "kept via payload" | "regenerated (derived)" | "refused" | "not representable";
export interface StepResult { readonly status: StepStatus; readonly reason?: NotRunReason; readonly pass?: number; readonly fail?: number; readonly codes?: readonly string[] }
export interface CheckResult { readonly id: "G-T5"; readonly status: StepStatus; readonly reason?: NotRunReason }
export interface LossEntry { readonly what: string; readonly class: LossClass; readonly code?: string; readonly example?: string; readonly count?: number }
export interface Fraction { readonly done: number; readonly of: number }
export interface ReportPins {
  readonly dsCommit: string;        // 40 hex, optionally "+dirty"
  readonly engram: string;          // "commit:<40 hex>[ archi-mermaid:<64 hex>] archi:<64 hex>" | "npm:@sentropic/engram@x.y.z" | "pending" | "not-applicable"
  readonly bpmnCanvas: string;      // "npm:@sentropic/bpmn-canvas@x.y.z" | "not-applicable"
  readonly mermaidPreview: string;  // "npm:mermaid@x.y.z" | "not-applicable"
  readonly rasterizer: string;      // "chrome:<version>" | "not-run" | "not-applicable"
}
export interface BijectionReport {
  readonly schema: "ds.diagram-bijection-report/1";
  readonly format: string;
  readonly chain: readonly string[];
  readonly fixture: { readonly id: string; readonly path: string; readonly sha256: string };
  readonly pins: ReportPins;
  readonly perFoldState: boolean;
  readonly foldStates: number;                  // states actually exported (§2.1)
  readonly steps: Readonly<Record<StepId, StepResult>>;
  readonly x1: { readonly pass: number; readonly fail: number };
  readonly x2: { readonly pass: number; readonly fail: number };
  readonly editSubset: { readonly allowedMapped: Fraction; readonly forbiddenRefused: Fraction; readonly codes: readonly string[] };
  readonly checks: readonly CheckResult[];
  readonly losses: readonly LossEntry[];
  readonly unverified: readonly string[];
  readonly verdict: Verdict;
}
export const REPORT_SCHEMA: Readonly<Record<string, unknown>>;   // the schema below, frozen
// src/report/validate.ts, markdown.ts, write.ts
export function validateReport(value: unknown): Outcome<BijectionReport>;
export function renderReportMarkdown(report: BijectionReport, source: { readonly jsonPath: string; readonly jsonSha256: string }): string;
export function writeReport(report: BijectionReport, outDir: string): Promise<{ readonly jsonPath: string; readonly mdPath: string }>;
export function checkGeneratedReports(dir: string): Outcome<{ readonly checked: number }>;
```

JSON Schema (draft 2020-12), compiled with `new Ajv2020({ allErrors: true, strict: true })` as in `scripts/diagram-view-schema-conformance.test.mjs:55` (branches use `oneOf` so that strict mode accepts every `required`):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:sentropic:ds.diagram-bijection-report:1",
  "title": "ds.diagram-bijection-report/1",
  "type": "object",
  "additionalProperties": false,
  "required": ["schema", "format", "chain", "fixture", "pins", "perFoldState", "foldStates", "steps", "x1", "x2", "editSubset", "checks", "losses", "unverified", "verdict"],
  "properties": {
    "schema": { "const": "ds.diagram-bijection-report/1" },
    "format": { "$ref": "#/$defs/key" },
    "chain": { "type": "array", "minItems": 2, "items": { "$ref": "#/$defs/key" } },
    "fixture": {
      "type": "object", "additionalProperties": false, "required": ["id", "path", "sha256"],
      "properties": { "id": { "$ref": "#/$defs/key" }, "path": { "type": "string", "minLength": 1 }, "sha256": { "$ref": "#/$defs/sha256" } }
    },
    "pins": {
      "type": "object", "additionalProperties": false,
      "required": ["dsCommit", "engram", "bpmnCanvas", "mermaidPreview", "rasterizer"],
      "properties": {
        "dsCommit": { "type": "string", "pattern": "^[0-9a-f]{40}(\\+dirty)?$" },
        "engram": { "type": "string", "pattern": "^(commit:[0-9a-f]{40}( archi-mermaid:[0-9a-f]{64})? archi:[0-9a-f]{64}|npm:@sentropic/engram@[0-9]+\\.[0-9]+\\.[0-9]+|pending|not-applicable)$" },
        "bpmnCanvas": { "type": "string", "pattern": "^(npm:@sentropic/bpmn-canvas@[0-9]+\\.[0-9]+\\.[0-9]+|not-applicable)$" },
        "mermaidPreview": { "type": "string", "pattern": "^(npm:mermaid@[0-9]+\\.[0-9]+\\.[0-9]+|not-applicable)$" },
        "rasterizer": { "type": "string", "pattern": "^(chrome:[0-9.]+|not-run|not-applicable)$" }
      }
    },
    "perFoldState": { "type": "boolean" },
    "foldStates": { "type": "integer", "minimum": 1 },
    "steps": {
      "type": "object", "additionalProperties": false,
      "required": ["S0", "S1", "S2", "S3", "S4", "S5", "S6"],
      "properties": {
        "S0": { "$ref": "#/$defs/step" }, "S1": { "$ref": "#/$defs/step" }, "S2": { "$ref": "#/$defs/step" },
        "S3": { "$ref": "#/$defs/step" }, "S4": { "$ref": "#/$defs/step" }, "S5": { "$ref": "#/$defs/step" },
        "S6": { "$ref": "#/$defs/step" }
      }
    },
    "x1": { "$ref": "#/$defs/tally" },
    "x2": { "$ref": "#/$defs/tally" },
    "editSubset": {
      "type": "object", "additionalProperties": false, "required": ["allowedMapped", "forbiddenRefused", "codes"],
      "properties": {
        "allowedMapped": { "$ref": "#/$defs/fraction" },
        "forbiddenRefused": { "$ref": "#/$defs/fraction" },
        "codes": { "type": "array", "uniqueItems": true, "items": { "$ref": "#/$defs/code" } }
      }
    },
    "checks": { "type": "array", "items": { "$ref": "#/$defs/check" } },
    "losses": { "type": "array", "items": { "$ref": "#/$defs/loss" } },
    "unverified": { "type": "array", "uniqueItems": true, "items": { "type": "string", "minLength": 1, "maxLength": 200 } },
    "verdict": { "enum": ["demonstrated", "partial", "not demonstrated"] }
  },
  "$defs": {
    "key": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$", "maxLength": 64 },
    "code": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$", "maxLength": 64 },
    "sha256": { "type": "string", "pattern": "^[0-9a-f]{64}$" },
    "count": { "type": "integer", "minimum": 0 },
    "tally": { "type": "object", "additionalProperties": false, "required": ["pass", "fail"], "properties": { "pass": { "$ref": "#/$defs/count" }, "fail": { "$ref": "#/$defs/count" } } },
    "fraction": { "type": "object", "additionalProperties": false, "required": ["done", "of"], "properties": { "done": { "$ref": "#/$defs/count" }, "of": { "$ref": "#/$defs/count" } } },
    "reason": { "enum": ["host GPU", "engram pin pending", "foreign tool not pinned", "raw fixture unavailable", "rawgate key absent", "dependency lot missing", "prerequisite failed"] },
    "codes": { "type": "array", "uniqueItems": true, "items": { "$ref": "#/$defs/code" } },
    "step": {
      "oneOf": [
        { "type": "object", "additionalProperties": false, "required": ["status"],
          "properties": { "status": { "enum": ["pass", "fail", "not-applicable"] }, "pass": { "$ref": "#/$defs/count" }, "fail": { "$ref": "#/$defs/count" }, "codes": { "$ref": "#/$defs/codes" } } },
        { "type": "object", "additionalProperties": false, "required": ["status", "reason"],
          "properties": { "status": { "const": "not-run" }, "reason": { "$ref": "#/$defs/reason" } } }
      ]
    },
    "check": {
      "oneOf": [
        { "type": "object", "additionalProperties": false, "required": ["id", "status"],
          "properties": { "id": { "const": "G-T5" }, "status": { "enum": ["pass", "fail", "not-applicable"] } } },
        { "type": "object", "additionalProperties": false, "required": ["id", "status", "reason"],
          "properties": { "id": { "const": "G-T5" }, "status": { "const": "not-run" }, "reason": { "$ref": "#/$defs/reason" } } }
      ]
    },
    "loss": {
      "oneOf": [
        { "type": "object", "additionalProperties": false, "required": ["what", "class", "code"],
          "properties": { "what": { "type": "string", "minLength": 1, "maxLength": 200 }, "class": { "const": "refused" }, "code": { "$ref": "#/$defs/code" }, "example": { "type": "string", "minLength": 1 }, "count": { "$ref": "#/$defs/count" } } },
        { "type": "object", "additionalProperties": false, "required": ["what", "class"],
          "properties": { "what": { "type": "string", "minLength": 1, "maxLength": 200 }, "class": { "enum": ["native", "kept via property", "kept via payload", "regenerated (derived)", "not representable"] }, "example": { "type": "string", "minLength": 1 }, "count": { "$ref": "#/$defs/count" } } }
      ]
    }
  }
}
```

`validateReport` adds the checks a schema cannot state: `done ≤ of` in both fractions; `verdict` and `unverified` equal `computeVerdict(...)`; when S2 ran, `x1.pass + x1.fail` equals `foldStates` (same for S3 and `x2`); every code in `editSubset.codes` is declared by a `refused` loss. A `refused` loss may carry a code that S4 never exercises, such as the print refusal `mermaid-strict-unrepresentable` (P2:539).

Markdown: generated, never hand-written.
- First line, the stamp: `<!-- generated by @sentropic/diagram-bijection report-md/1 from <jsonPath> sha256 <jsonSha256>; do not edit -->`.
- Then, in this order: a summary table (format, chain, fixture path and the first 12 hex of its sha256, pins, per-fold-state flag, fold states, X1, X2, edit subset, verdict); the steps table (step, status, reason, pass, fail, codes); the checks table; the losses table (what, class, code, example, count); a « Not verified » list.
- Deterministic: LF only, no timestamp, cell text with `|` written `\|`, paths and codes in backticks.
- `checkGeneratedReports` fails with `report-md-hand-edited` when a `*.report.md` body differs from `renderReportMarkdown` of its sibling JSON or when the stamp digest differs, and with `report-md-orphan` when the sibling JSON is missing.

Where reports live: CI artefacts of `diagram-bijection.yml` (§4) and local output directories. DL-0 and DL-1 commit no report: a report records the DS commit it measured, which cannot be the commit that holds it. DL-7 may archive them, stamp rule included.

### 2.4 Fixture pins `ds.fixture-pins/1`

```ts
// src/pins/fixture-pins.ts
export type PinRoot =
  | { readonly kind: "repo" }
  | { readonly kind: "env-dir"; readonly env: "DL_HRPN_ROOT" | "DL_SENTROPIC_ROOT" | "DL_BPMN_CANVAS_ROOT" }
  | { readonly kind: "env-git"; readonly env: "DL_HRPN_ROOT" | "DL_SENTROPIC_ROOT" | "DL_BPMN_CANVAS_ROOT"; readonly commit: string };
export interface FixturePin {
  readonly id: string;                                   // key, unique in the file
  readonly root: PinRoot;
  readonly path: string;                                 // POSIX, relative to the root, no "." or ".." segment
  readonly sha256: string;
  readonly bytes: number;
  readonly confidentiality: "public" | "confidential-raw";
}
export interface FixturePinFile { readonly schema: "ds.fixture-pins/1"; readonly pins: readonly FixturePin[] }
export function readFixturePins(file?: string): FixturePinFile;
export function verifyFixturePin(pin: FixturePin, env: Readonly<Record<string, string | undefined>>): Promise<
  | { readonly status: "pass" }
  | { readonly status: "fail"; readonly actualSha256: string; readonly actualBytes: number }
  | { readonly status: "not-run"; readonly reason: "raw fixture unavailable" }>;
```

- `env-git` reads `git -C $ENV show <commit>:<path>`; `env-dir` reads the work-tree file. A missing variable or file gives `not-run`, never `pass`.
- `confidential-raw` pins are read only on the operator host; CI has no such variable, so they report `not-run`.
- The pins file holds no repository name and no raw content: the root is an environment variable.

Initial pins (values measured for this spec):

| id | root | path | sha256 | bytes | confidentiality |
| --- | --- | --- | --- | ---: | --- |
| `s2-target-raw` | env-dir `DL_HRPN_ROOT` | `docs/architecture/hrpn/ds-fixtures/S2-target.json` | `28a7271dd0bec89fa9ad435174a614ab4a40b346b10724da95736f9c55b574d9` | 39878 | confidential-raw |
| `s2-target-folds-raw` | env-dir `DL_HRPN_ROOT` | `docs/ard/decision/focus/governance-kit/hrpn/defaults.js` | `cff42f4227cb0b206ff61036a0be8ecfea0fd2bac1d6b5ea1b058db553b5c671` | 1138 | confidential-raw |
| `s2-target-scenes-raw` | env-dir `DL_HRPN_ROOT` | `docs/architecture/hrpn/SCENES.md` | `224bcaac70e397e771d88273219483eea808c0aa31cdcdc6d61d47f645d94853` | 21162 | confidential-raw |
| `s2-target-engram-semantic-raw` | env-dir `DL_HRPN_ROOT` | `docs/architecture/hrpn/engram/S2-target.semantic.json` | `46f64154bb6592d49ccda5633b2c4d4205fb1c6752ef218be31d6757923ecf91` | 63446 | confidential-raw |
| `s2-target-engram-view-raw` | env-dir `DL_HRPN_ROOT` | `docs/architecture/hrpn/engram/S2-target.view.json` | `82930614efe070bdb8e5acce3aecea29dfdb2d1ab625b7d376507f97fb6f8b50` | 23837 | confidential-raw |
| `central-711-source` | env-git `DL_SENTROPIC_ROOT` @ `4138a0ecba9c5b37409abb5ac00f732d02b7dc8d` | `docs/governance/kit/src/governance-central.js` | `8648b0935735a386afa843e7221234406c1c61fbe48fa5bc7c4172743b0c3f1c` | 14781 | public |

The five raw files are tracked and clean in their repository; the first two last changed at `e5eaca3` (2026-10-22), read at `faf21b6f`. The three extra raw files are token sources for the raw-label gate only (§2.7): the engram triple there is an older generic@1 cut (56 entities, 82 relations), not an anonymiser input. Repo pins (`root: repo`) are written for every committed structure, scene text and conformance file, in the same commit as the file.

### 2.5 The S2-target-anon generator

Pure core, CLI around it. Raw values never leave memory except into the out-of-repo directory of §2.6.

```ts
// src/anon/hrpn-fixture.ts
export interface AnonymiseInput {
  readonly sceneId: "s2-target-anon";
  readonly language: "fr";
  readonly fixture: { readonly pin: FixturePin; readonly bytes: Uint8Array };
  readonly folds: { readonly pin: FixturePin; readonly bytes: Uint8Array };
}
export type AnonField = "entity.id" | "entity.label" | "relation.id" | "relation.label" | "tint" | "fold.id";
export interface AnonMapping {
  readonly schema: "ds.anon-mapping/1";
  readonly fixture: { readonly pinId: string; readonly sha256: string };
  readonly entries: readonly { readonly field: AnonField; readonly raw: string; readonly anon: string }[];
}
export interface AnonymiseOutput {
  readonly structure: SceneStructure;        // committed (§3.5 type)
  readonly provenance: SceneProvenance;      // committed, counts and digests only
  readonly mapping: AnonMapping;             // out of repo only
  readonly rawStrings: readonly string[];    // out of repo only: input of the digest builder (§2.7)
  readonly rawIdentifiers: readonly string[];  // out of repo only: identifier fields for the digest builder (§2.7)
  readonly unresolvedFoldIds: readonly string[];  // out of repo only
}
export type AnonRefusal =
  | "anon-pin-mismatch" | "anon-ci-refused" | "anon-field-unknown" | "anon-value-invalid"
  | "anon-structure-invalid" | "anon-fold-source-unreadable" | "anon-raw-token-in-output"
  | "anon-path-in-git-work-tree" | "anon-home-not-absolute" | "anon-home-permissions";
export function anonymiseHrpnFixture(input: AnonymiseInput):
  | { readonly ok: true; readonly value: AnonymiseOutput }
  | { readonly ok: false; readonly refusal: AnonRefusal; readonly message: string };   // message never holds a raw value

export interface SceneProvenance {
  readonly schema: "ds.scene-provenance/1";
  readonly sceneId: string;
  readonly kind: "anonymised" | "transcribed";
  readonly structure: { readonly path: string; readonly sha256: string };
  readonly inputs: readonly { readonly pinId: string; readonly sha256: string }[];
  readonly generator: { readonly name: "@sentropic/diagram-bijection"; readonly version: string; readonly dsCommit: string };
  readonly counts: StructureCounts;          // measured on the raw input (§3.5 type)
  readonly folds: { readonly sourceIds: number; readonly resolved: number; readonly unresolved: number };
  readonly rawgate?: { readonly keyId: string; readonly digests: number; readonly baselineCommit: string; readonly baselinePresent: number; readonly outputScan: "pass" };
}
```

Raw field handling, closed and fail-closed (any other key or value type: `anon-field-unknown` or `anon-value-invalid`):

| Raw field | Handling | Structure field |
| --- | --- | --- |
| entity `id` | replaced: zones `z01`…`z22`, cards `c01`…`c51` | `id` |
| entity `kind` (`zone` \| `card`) | kept as the record class | zones or cards list |
| entity `parent` | mapped through the id map | `parent` |
| entity `label` | replaced: `Zone NN`, `Carte NN` | `name` |
| entity `tint` | replaced by category, in order of first appearance: `teinte-a`, `teinte-b`, `teinte-c` | `category` |
| card `role`, `name`, `detail`, `footer`, `code`, `store`; zone `detail`, `footer`, `code` | dropped: kit faces, projected by engram from the model (DLR-352) | synthetic `role`: `Rôle de la zone NN`, `Rôle de la carte NN` |
| relation `id` | replaced: `r01`…`r54` | `id` |
| relation `from`, `to` | mapped | `from`, `to` |
| relation `label` | replaced: `flux NN` | `label` |
| relation `style` (`solid` \| `dashed`) | `current` \| `proposed` | `lifecycle` |
| `schema`, `profile`, `profileMapping`, `coordinates`, `scene`, `source`, `counts` | dropped (counts are recomputed) | none |
| `zoneHierarchy` | read for order only | traversal order |
| entity lifecycle | absent at the source | `current` |

- Numbering: one pre-order walk of `zoneHierarchy` (roots in listed order; for each zone, the zone, then its `cards` in listed order, then its `zones`). Relations in source array order. Width = digits of the count, at least 2.
- Folds: `folds.bytes` is read as text, never imported or evaluated. Exactly one line must match `^\s*'<k>':\s*\[\s*('[A-Z0-9_]+'\s*,?\s*)*\],?\s*$`, where `<k>` is the raw fixture's `scene.id`; zero or several matches give `anon-fold-source-unreadable`. Identifiers naming a zone of the fixture are folded; the others are counted as unresolved (`source-gap`), and their raw values go to `run.json` only. `expanded` = zones that are not folded, as anonymised ids, ascending.
- Legend: title `Teintes`; keys `Teinte A`, `Teinte B`, `Teinte C` with tokens `st-semantic-data-category1`…`3` (the DS token form of P2:462-464).
- Language `fr`; `evidence` = `ds:s2-target-anon (anonymised structure)`.
- Output self-scan: before any write, every string of the structure is tokenised by §2.7 and compared with the distinctive raw token set; a hit gives `anon-raw-token-in-output` and nothing is written.
- Determinism: no clock and no randomness enter a committed byte. Same raw bytes give the same structure and mapping bytes. The provenance differs between runs only in `generator.dsCommit` and in the `rawgate` block (key id, baseline commit).
- The CLI commands `generate` and `verify` refuse with `anon-ci-refused` when `CI=true`: the raw input exists only on the operator host. The pure core `anonymiseHrpnFixture` never reads the environment or the disk (it receives bytes), so W-DL0.8 runs in the CI shards on the synthetic fixture.
- The CLI prints counts and paths only, never a raw value.

```text
node packages/diagram-bijection/bin/dl-anon.mjs generate \
  --fixture-pin s2-target-raw --folds-pin s2-target-folds-raw \
  --extra-raw s2-target-scenes-raw,s2-target-engram-semantic-raw,s2-target-engram-view-raw \
  [--baseline <DS commit, default: git merge-base HEAD origin/main>]
node packages/diagram-bijection/bin/dl-anon.mjs verify      # operator host: re-run, compare bytes and counts
node packages/diagram-bijection/bin/dl-anon.mjs rawgate-key --new
```

Committed outputs: `fixtures/structures/s2-target-anon.structure.json` (RFC 8785 bytes + LF), `fixtures/structures/s2-target-anon.provenance.json`, `rawgate/digests.json`, and the matching pins. Nothing is derived from the three extra raw files: they are token sources of the gate only (§2.7). No anonymised copy of the engram view or semantic file of S2-target is produced or committed.

Counts the generator preserves (raw values are those of F-9 and F-10):

| Count | Raw (pinned) | S2-target-anon |
| --- | --- | --- |
| zones; cards; relations | 22; 51; 54 | same |
| zones by depth 0/1/2; cards by depth 1/2/3 | 4/4/14; 5/6/40 | same |
| zones holding cards only / zones only / both / nothing; max children | 17/3/2/0; 9 | same |
| relations: card → card; labelled; duplicate pairs; self loops; ancestor links | 54; 54; 0; 0; 0 | same |
| cards with a tint / without; tint categories; zones with a tint | 42/9; 3; 0 | same (`teinte-a`…`c`) |
| entities and relations whose lifecycle is not `current` | 0 and 0 | 0 and 0 |
| fold source ids for the scene: resolved / unresolved | 5 / 2 | collapsed 5, `expanded` exceptions 17 |

Losses of the anonymisation, stated plainly: labels, roles and every kit face are replaced or dropped; label lengths are not kept, so the text-fit stress of the real labels is not reproduced (DC-1 overflow witnesses keep that role); the source child order across kinds and the hrpn layout data are not carried.

### 2.6 Out-of-repo directory: convention and refusal

```ts
// src/anon/out-of-repo.ts
export function resolveAnonHome(env: Readonly<Record<string, string | undefined>>): string;
export type OutOfRepoCheck =
  | { readonly ok: true; readonly realPath: string }
  | { readonly ok: false; readonly code: "anon-path-in-git-work-tree" | "anon-home-not-absolute" | "anon-home-permissions"; readonly message: string };
export function assertOutsideGitWorkTrees(path: string, env: Readonly<Record<string, string | undefined>>): OutOfRepoCheck;
```

Convention:
- Home = `$DL_ANON_HOME` when set; else `$XDG_DATA_HOME/sentropic/dl-anon` when `XDG_DATA_HOME` is set and absolute; else `$HOME/.local/share/sentropic/dl-anon`.
- Layout: `<home>/rawgate/key.hex`; `<home>/<sceneId>/<first 12 hex of the raw sha256>/mapping.json`, `run.json` (counts, unresolved fold ids, run time), `raw-strings.json`.
- Modes: directories 0700, files 0600, written with exclusive create then rename.

Refusal, before every write:
1. A relative path gives `anon-home-not-absolute`.
2. `GIT_DIR`, `GIT_WORK_TREE` or `GIT_COMMON_DIR` set in the environment gives `anon-path-in-git-work-tree`.
3. Resolve the real path of the nearest existing ancestor. If it or any ancestor up to `/` holds an entry named `.git` (directory, file or link), refuse with `anon-path-in-git-work-tree`. This covers linked worktrees, whose `.git` is a file.
4. When `git` is on `PATH`, `git -C <that ancestor> rev-parse --is-inside-work-tree` printing `true` also refuses.
5. An existing directory of the home chain with any group or other permission bit set gives `anon-home-permissions`.
6. Steps 3–4 run again on the final real path after the directories are created, so that a link swapped in between is caught.

### 2.7 Raw-label gate `dl-rawgate/1`

Goal: fail any commit that carries an S2-target label, without the repository ever holding those labels.

Why keyed digests, not a public salt [JUDGMENT]. Label words have little entropy. With a committed salt, anyone can hash a dictionary of candidate words (product names, acronyms, team names) and learn which ones occur in the labels. That confirmation oracle is itself a trace of Airbus content in a commit (DLR-161). A secret key turns each digest into a keyed pseudo-random value (HMAC-SHA-256): without the key, the committed list reveals only its length.

Implementation: one plain ESM file, zero dependency (`node:crypto`, `node:fs`, `node:child_process` only), shared by the generator and the gate.

```ts
// rawgate/dl-rawgate.d.mts (types of rawgate/dl-rawgate.mjs)
export const RAWGATE_SCHEMA: "dl-rawgate/1";
export interface RawgateRule { readonly minWordLength: 4; readonly minIdLength: 2; readonly ngramSizes: readonly number[] }
export interface RawgateItem { readonly kind: "word" | "ngram" | "id"; readonly token: string; readonly line: number }   // line: 1-based
export function tokenise(text: string, rule: RawgateRule): RawgateItem[];
export function digest(key: Uint8Array, kind: "text" | "id", token: string): string;   // 32 hex
export function keyId(key: Uint8Array): string;                                       // 16 hex
export interface RawgateDigestFile {
  readonly schema: "dl-rawgate/1";
  readonly keyId: string;
  readonly baselineCommit: string;
  readonly minWordLength: 4;
  readonly minIdLength: 2;
  readonly ngramSizes: readonly number[];
  readonly count: number;
  readonly digests: readonly string[];                              // ascending, unique, both classes mixed
  readonly allow: readonly { readonly digest: string; readonly reason: string }[];
}
export function buildDigestFile(input: {
  readonly key: Uint8Array;
  readonly rawStrings: readonly string[];        // every string of the pinned raw inputs
  readonly rawIdentifiers: readonly string[];    // entity ids, codes, relation ids, fold-source ids
  readonly baseline: { readonly commit: string; readonly texts: Iterable<string> };
}): { readonly file: RawgateDigestFile; readonly baselinePresent: number };
export interface RawgateHit { readonly file: string; readonly line: number; readonly kind: "word" | "ngram" | "id" | "commit-message"; readonly digestPrefix: string }
export function parseRange(spec: string): { readonly base: string | null; readonly head: string };   // "<a>..<b>" or "<b>"
export function scanTree(input: { readonly key: Uint8Array; readonly file: RawgateDigestFile; readonly repoRoot: string }): { readonly hits: readonly RawgateHit[]; readonly files: number };
export function scanCommitMessages(input: { readonly key: Uint8Array; readonly file: RawgateDigestFile; readonly repoRoot: string; readonly range: string }): { readonly hits: readonly RawgateHit[]; readonly commits: number };
```

Scheme:
1. `tokenise(text)` reads the text line by line (lines split on LF and numbered from 1). Each line is NFKC-normalised. Its maximal runs of `[\p{L}\p{N}]` give two item kinds: lower-cased runs of at least 4 code points are `word` items; case-kept runs of at least 2 code points are `id` items. The lower-cased runs of the whole file, in order and across line breaks, give `ngram` items: every window of n consecutive runs, for n in `ngramSizes`, joined by one space. Every item carries the line where its first character sits, so hit lines are deterministic.
2. Raw text set R_text (operator host): the words of every string of the pinned raw inputs (fixture, fold source and the three extra raw files), plus each whole raw string of 2 to 6 runs, plus the 6-run windows of longer strings. `ngramSizes` = the run counts that occur in R_text.
3. Raw identifier set R_id: the case-kept runs of at least 2 code points of the identifier fields of the fixture and of the fold source (entity ids, entity codes, relation ids, fold-source identifiers). Measured on the pinned fixture (counts only): 73 distinct identifier tokens have 2 or 3 code points, so the text class alone never guarded them as standalone tokens; no identifier has 1 code point.
4. Baseline: the word, n-gram and identifier items of every tracked text blob of the DS at `baselineCommit` (read with `git ls-tree` and `git cat-file --batch`, no checkout). A blob is binary when its first 8000 bytes hold a NUL byte. Measured: 56 of the 73 short identifier tokens already occur as case-sensitive words in DS `origin/main`; the identifier class therefore adds 17 guarded short tokens.
5. Distinctive set D = (R_text \ baseline text items) ∪ (R_id \ baseline identifier items). `digests` = sorted unique `digest(K, class, t)` for t in D, where `digest(K, class, t)` = the first 32 hex of HMAC-SHA-256(K, `"dl-rawgate/1\u0000" + class + "\u0000" + t`), `class` being `text` or `id`. The class sits inside the HMAC, so the committed list does not reveal how many digests each class holds. `keyId` = the first 16 hex of HMAC-SHA-256(K, `"dl-rawgate/1 key-id"`).
6. Gate: tokenise every tracked text file of the checkout (`git ls-files`, binary rule above, `rawgate/digests.json` itself excluded), digest each distinct item in its class, and report a hit for any digest in `digests` and not in `allow`. Hits are sorted by path, line, kind and digest prefix, one hit per path, line and digest.
7. Commits: `--commits=<a>..<b>` scans every commit message of the range; `--commits=<b>` scans that one commit. An empty, all-zero or unknown `<a>` falls back to `<b>` alone, with a notice. The tree scan always runs, so the content side never depends on the range.
8. Output: path, line and digest prefix of each hit; the matched text is never printed. Exit 0 pass, 1 hit or invalid file or key mismatch or required key absent, 3 « not run (key absent) ».

Key handling:
- K = 32 random bytes in hex, created by `dl-anon.mjs rawgate-key --new` in `<home>/rawgate/key.hex` (0600); only `keyId` is printed.
- The gate reads `DL_RAWGATE_KEY` (CI secret), else `DL_RAWGATE_KEY_FILE`, else `<home>/rawgate/key.hex`. `keyId(K)` must equal the file's `keyId`.
- `DL_RAWGATE_REQUIRED=1` (set in CI) turns an absent key into exit 1.
- The repository secret `DL_RAWGATE_KEY` is set by whoever holds admin rights on the repository: `gh secret set DL_RAWGATE_KEY < <home>/rawgate/key.hex`.
- Rotation cycle: a new key at every regeneration of S2-target-anon, and at once on any suspected exposure. One PR carries the new `digests.json` and its new provenance; the secret is updated just before that PR's checks run. Main is red in that short window; that is accepted.
- `allow` entries are written by the operator from an out-of-repo token file, so no allowed token is ever written in the repository. The `reason` text must not digest to the allowed digest.

When it runs:
- Before every push from the operator host: `node packages/diagram-bijection/rawgate/dl-rawgate.mjs scan --tree --commits=@{u}..HEAD`. This is the barrier of Q5 option A, « Un contrôle automatique cherche les étiquettes d'origine avant chaque envoi. » (OQ:44).
- In CI on every pull request and every push to main, without any path filter (§4). CI is the backstop: it runs after the push and cannot undo it. A hit after a push needs the branch history rewritten and the PR refs dropped.
- The generator's output self-scan (§2.5).

Limits, stated plainly:
- Text words under 4 code points are guarded only inside phrases; identifier tokens are guarded from 2 code points, case-sensitive.
- A new legitimate use of a distinctive short identifier is a hit. It is cleared with an `allow` entry (digest and reason), never by deleting digests.
- A raw word or identifier already present in the DS tree at the baseline is not guarded. The provenance records how many there are (`baselinePresent`); the words themselves stay out of the repository.
- Paraphrases, translations and pixels are not detected: binary files are skipped. Images of the anonymised scene are rendered from the anonymised text only, so they carry no raw label by construction.

### 2.8 BPMN fixture selection (criteria; the choice is a DL-0 task)

- Scope: every `*.bpmn` file tracked by `@sentropic/bpmn-canvas` at a pinned commit (55 files at `05f737885bd44fddea84bf1b4d55ae5428704855`, measured). By name, the four files of the E3 corpus (`experiments/e3/corpus`) each target one feature; none was opened for this spec.
- Criteria, all required: C1 at least two pools (`participant` elements with a `processRef` inside one `collaboration`); C2 at least one `messageFlow`; C3 at least one sub-process (`subProcess`, `transaction` or `adHocSubProcess`); C4 at least two `BPMNDiagram` elements.
- Counting: namespace-aware start-tag counts. The BPMN 2.0 model namespace is `http://www.omg.org/spec/BPMN/20100524/MODEL`, the DI namespace `http://www.omg.org/spec/BPMN/20100524/DI`. Prefixes resolve from `xmlns` declarations; comments, CDATA and processing instructions are skipped; DTDs are refused. Flow nodes = local names ending in `Task`, `Event` (not `EventDefinition`) or `Gateway`, plus `task`, `subProcess`, `transaction`, `adHocSubProcess` and `callActivity`.
- Tie-break: most flow nodes, then most `BPMNDiagram`, then path bytes ascending.
- Record `fixtures/bpmn-selection.json` (`ds.bpmn-selection/1`): repository, commit, file count, one candidate row per file {path, sha256, bytes, counts, C1–C4}, then `selected` {path, sha256} or `null` with `gap: "no-file-meets-all-criteria"` (`source-gap`, never an approximation). The F1 fixed point on the selected file is confirmed at DL-3a S0; a failure there re-runs this selection without that file.

```ts
// src/bpmn/xml-count.ts, select.ts
export interface BpmnCounts { readonly pools: number; readonly messageFlows: number; readonly subProcesses: number; readonly diagrams: number; readonly flowNodes: number }
export function countBpmn(xml: string): { readonly ok: true; readonly counts: BpmnCounts } | { readonly ok: false; readonly code: "bpmn-xml-unreadable" | "bpmn-dtd-refused" };
export interface BpmnCandidate { readonly path: string; readonly sha256: string; readonly bytes: number; readonly counts: BpmnCounts; readonly criteria: { readonly c1: boolean; readonly c2: boolean; readonly c3: boolean; readonly c4: boolean } }
export function selectBpmnFixture(candidates: readonly BpmnCandidate[]): { readonly selected: BpmnCandidate | null; readonly gap?: "no-file-meets-all-criteria" };
```

### 2.9 DL-0 witnesses (each RED until its code exists, and RED again on the stated condition)

| Id | Witness | RED when |
| --- | --- | --- |
| W-DL0.1 | `runHarness` with `stub-json` on `s2-target-anon.structure.json` and `tiny.structure.json`: every step has a status, the report validates, S5 is `not-run` « foreign tool not pinned », S6 is `pass`, X1 and X2 are 25/0 and 5/0. | a step is missing, a status differs, or the report fails validation |
| W-DL0.2 | Three broken stub codecs: import drops one record entry; re-export appends one byte; a forbidden probe is accepted. Each gives verdict `not demonstrated` with the failing step named. | any broken codec yields `pass` or `partial` |
| W-DL0.3 | `enumerateFoldStates` gives 25 states for S2-target-anon and 13 for a context of 10 containers without exception (the central-711 shape), in the stated order; each toggle differs from `default` by exactly one container. | count, order or content differs |
| W-DL0.4 | The schema accepts the valid vectors of `fixtures/report-vectors/` (one per-fold-state report, one text report) and rejects seven invalid ones: unknown key, missing S6, missing `perFoldState`, `refused` loss without `code`, verdict outside the enum, `not-run` step without `reason`, sha256 of 63 hex. `validateReport` also rejects an X1 tally that differs from `foldStates`, and an `editSubset` code with no `refused` loss, while it accepts a `refused` loss whose code S4 never exercised. | an invalid vector is accepted or a valid one rejected |
| W-DL0.5 | `computeVerdict` matrix: any `fail` gives `not demonstrated`; all `pass` with S5 `not-run` gives `demonstrated` with S5 listed; S6 `not-run` gives `partial`; a dirty commit gives at most `partial`; a codec that exports no state, or a probe list with no forbidden probe, gives `harness-vacuous` and `not demonstrated`. `validateReport` rejects a report whose verdict differs from the computed one. | any row differs |
| W-DL0.6 | `renderReportMarkdown` twice gives the same bytes; `checkGeneratedReports` fails on a hand-edited copy and on an orphan `.md`. | a hand edit passes |
| W-DL0.7 | Every `repo` pin matches its file; a one-byte change of a temporary copy is caught; a `confidential-raw` pin reports `not-run` without its variable and is never `pass` unread. | a mismatch passes, or a raw pin passes unread |
| W-DL0.8 | On the synthetic hrpn-shaped raw fixture (invented labels): two runs at one commit with one key give identical structure, provenance and mapping bytes; every count of §2.5 is preserved; an unknown raw key gives `anon-field-unknown`; a planted canary label never appears in a refusal message or in the outputs; with `CI=true` the core still processes the synthetic bytes, while the CLI `generate` exits with `anon-ci-refused`. | any difference, a canary leaks, or the core reads the environment |
| W-DL0.9 | `assertOutsideGitWorkTrees` refuses a path in the DS checkout, in a temporary `git init` repository, through a link into a work tree, under a directory holding a `.git` file, and with `GIT_DIR` set; it accepts a plain temporary directory, and a home whose whole parent chain does not exist yet (the check runs on the nearest existing ancestor, without `ENOENT`), and creates it 0700. | an in-tree path is accepted, or a missing parent chain throws |
| W-DL0.10 | Gate mechanism with a key and canary tokens generated at test time: a planted canary word, a canary phrase split across two lines, a canary identifier of 2 characters (case-sensitive: its lower-case form is no hit) and a canary commit message each fail with the expected path and line; no canary passes; `--commits=<b>`, an empty base (`..<b>`), an all-zero base and an unknown base each scan `<b>` alone; a key-id mismatch fails; no key with `DL_RAWGATE_REQUIRED=1` exits 1, without it exits 3 « not run (key absent) »; an allowed digest passes. | any case differs |
| W-DL0.11 | `raw-label-gate.yml` has no `paths` or `paths-ignore` filter, runs on `pull_request` and on `push` to main, installs no npm package, and exposes `DL_RAWGATE_KEY` to the gate step only (new cases in `scripts/verify-workflow-invariants.test.mjs`). The real run is green on the PR that lands the anonymised structure. | a filter appears, the secret reaches another step, or the real run fails |
| W-DL0.12 | CI: the counts of the committed structure equal its provenance counts, and its sha256 equals `provenance.structure.sha256`. Operator host: `dl-anon.mjs verify` re-runs the generator on the raw pins and finds the same bytes. | a hand edit of the structure, or a drift from the raw pins |
| W-DL0.13 | `countBpmn` on four synthetic vectors (prefixed names, default namespace, a tag inside a comment, a tag inside CDATA) and the DTD refusal; `bpmn-selection.json` validates and its selected row meets C1–C4 under the tie-break. | a count or the selection rule differs |

### 2.10 DL-0 tasks and sizing (at most 3 days)

| Task | Content | Days |
| --- | --- | ---: |
| T0.1 | Package scaffold, pins file and guard, synthetic fixtures | 0.25 |
| T0.2 | Harness types, `runHarness`, fold states, verdict | 0.75 |
| T0.3 | Stub format, probes, stub renderer, broken-codec witnesses | 0.25 |
| T0.4 | Report schema, validation, Markdown, stamp guard, vectors | 0.5 |
| T0.5 | Anonymiser, out-of-repo guard, provenance, first real run on the operator host | 0.5 |
| T0.6 | Raw-label gate, digest builder, `raw-label-gate.yml`, invariant cases, key and secret procedure | 0.5 |
| T0.7 | BPMN counter, scan on the operator host, selection record | 0.25 |
| | **DL-0 total** | **3.0** |

Order inside DL-0: T0.6 lands, with its real digests and a green CI run, before or with the PR that commits `s2-target-anon.structure.json`.

## 3. DL-1 (DS half)

### 3.1 Interface contract with the engram codec

Interface (IFACE « Update 2026-11-07 », which supersedes the first names; engram confirmed CP-3, CP-4, CP-5 and CP-11):
- Codec: subpath `@sentropic/engram/archi-mermaid`, zero dependency (no `node:crypto`), browser-safe. Functions `parseArchiMermaid(text)`, `printArchiMermaid(triple)` and `formatArchiMermaid(text, { check })`.
- Views and cards: subpath `@sentropic/engram/archi`. `checkArchi`, `checkArchiView`, `projectArchiCards` (which now carries `proposed` and `toggleLabel`), `archiSummaries`, `buildArchiSourceView`; the constants `ARCHI_CARDS_CONTENT`, `ARCHI_V1_PIN`, `ARCHI_CARDS_PIN`, `GENERIC_V2`, `CONTRACT_PIN`; the types `ArchiViewSpec` and `ArchiManifest`.
- Every codec function returns `{ ok: true, value } | { ok: false, diagnostics: EngramDiagnostic[] }` and never throws, prototype keys included. Grammar `engram.archi-mermaid/1` (P2). engram reports three fixtures plus 600 generated cases that round-trip byte for byte.

Pin modes (P-3 rule: a published version for published code, commit + sha256 for unpublished code):

| Phase | Pin | What the DS loads |
| --- | --- | --- |
| A, now until the codec merge | engram `90e6882b` (lot 3): `dist/archi.cjs` only | the lot-3 functions and constants. The codec roles, `buildArchiSourceView` and the render options do not exist yet; every witness that needs them reports « not run (engram pin pending) ». |
| B, from the merge sha sent by gr-conductor | merge sha + sha256 of `dist/archi-mermaid.cjs` and of `dist/archi.cjs`, with engram's reproducible-build check at that sha (CP-3) | every role of the table below |
| C, after the next engram minor on npm | `@sentropic/engram@x.y.z`, exact, lockfile integrity | the two subpaths; the vendored files are deleted in the same PR (dependency weight: CP-14) |

Why CJS files (DS proposal, now engram's pins too, CP-2): the ESM build of `90e6882b` splits shared chunks (F-2), so the digest of one ESM file does not cover the code it imports. A non-split CJS file is self-contained. W-DL1.1 checks it: `archi-mermaid.cjs` holds no `require(` call at all, and `archi.cjs` requires `node:crypto` only.

Roles and names. The names below are those IFACE announces. They are written once, in `fixtures/engram.pin.json`, and checked against the modules at the merge sha.

| Role | Module | Announced name | DS call |
| --- | --- | --- | --- |
| `parse` | archi-mermaid | `parseArchiMermaid` | `parseArchiMermaid(text)` |
| `print` | archi-mermaid | `printArchiMermaid` | `printArchiMermaid(triple)` |
| `canonical` | archi-mermaid | `formatArchiMermaid` | `formatArchiMermaid(text, { check: false })`: the canonical text |
| `fmt` | archi-mermaid | `formatArchiMermaid` | `formatArchiMermaid(text, { check: true })`: success iff fmt(t) = t, else `mermaid-strict-noncanonical` |
| `checkArchi` | archi | `checkArchi` | `checkArchi(document, <archiCardsContent>, language)` (ENG `archi-check.ts:117-121`) |
| `checkArchiView` | archi | `checkArchiView` | `checkArchiView(document, view, binding, <ArchiDsPort>)` |
| `projectArchiCards` | archi | `projectArchiCards` | `projectArchiCards(document, sourceView, binding)` |
| `archiSummaries` | archi | `archiSummaries` | `archiSummaries(document, sourceView, collapsed, <ArchiDsPort>, language)` |
| `buildSourceView` | archi | `buildArchiSourceView` | `buildArchiSourceView(document, spec)` |
| `archiCardsContent`, `archiV1Pin`, `archiCardsPin`, `genericV2`, `contractPin` | archi | `ARCHI_CARDS_CONTENT`, `ARCHI_V1_PIN`, `ARCHI_CARDS_PIN`, `GENERIC_V2`, `CONTRACT_PIN` | constants |
| `viewSchemaPin` | archi | none announced (CP-13) | constant, or the `viewSchemaPin` value of the pin file (§3.5 L8) |

The value returned by `formatArchiMermaid` in check mode is confirmed at the merge sha (CP-1); the adapter maps any `ok: true` to `CodecOutcome<true>`.

```ts
// src/pins/engram-port.ts — the only module that reads the vendored files or holds an engram name
export type EngramRole =
  | "parse" | "print" | "canonical" | "fmt"
  | "checkArchi" | "checkArchiView" | "projectArchiCards" | "archiSummaries" | "buildSourceView"
  | "archiCardsContent" | "archiV1Pin" | "archiCardsPin" | "genericV2" | "contractPin" | "viewSchemaPin";
export interface PinLike { readonly id: string; readonly version: string; readonly contentDigest: string }
export interface EngramCodecPin {
  readonly schema: "ds.engram-codec-pin/2";
  readonly mode: "commit" | "npm";
  readonly repository: "rhanka/engram";
  readonly commit: string | null;                        // 40 hex; null only before phase A is recorded
  readonly files: readonly {
    readonly path: string;                               // vendor/engram/<sha12>/<file>
    readonly sha256: string;
    readonly builtFrom: "dist/archi-mermaid.cjs" | "dist/archi.cjs";
    readonly subpath: "@sentropic/engram/archi-mermaid" | "@sentropic/engram/archi";
  }[];
  readonly reproducibleBuild: { readonly checkedBy: "engram" | "ds"; readonly ref: string } | null;
  readonly npm: { readonly name: "@sentropic/engram"; readonly version: string } | null;
  readonly grammar: "engram.archi-mermaid/1";
  readonly exports: Readonly<Record<EngramRole, { readonly module: "archi-mermaid" | "archi"; readonly name: string } | null>>;
  readonly viewSchemaPin: PinLike | null;                // recorded at the bump while engram exports no view-schema constant
  readonly supplied: { readonly by: "gr-conductor" | "ds-rebuild"; readonly on: string; readonly ref: string };
}
export interface EngramDiagnosticLike {
  readonly origin: "engram"; readonly code: string; readonly severity: "error" | "warning" | "info";
  readonly path?: string; readonly subjectRef: string; readonly message: string;
}
export type CodecOutcome<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly diagnostics: readonly EngramDiagnosticLike[] };
export interface EngramCodecPort {
  parse(text: string): CodecOutcome<ArchiTriple>;
  print(triple: ArchiTriple): CodecOutcome<string>;
  canonical(text: string): CodecOutcome<string>;
  check(text: string): CodecOutcome<true>;
}
export interface ArchiRenderOptions { readonly proposed?: true; readonly toggleLabel?: string }
// DS method names on purpose: no other module may hold an engram name (W-DL1.10).
export interface EngramArchiPort {
  check(document: unknown, language: "fr" | "en"): readonly EngramDiagnosticLike[];              // role checkArchi, cards content passed
  checkView(document: unknown, view: unknown, binding: unknown): readonly EngramDiagnosticLike[]; // role checkArchiView
  projectCards(document: unknown, sourceView: unknown, binding: unknown):                         // role projectArchiCards
    | { readonly outcome: "ok"; readonly diagram: unknown; readonly measures: unknown;
        readonly renderOptions: Readonly<Record<string, ArchiRenderOptions>> }   // per occurrence, read from engram's output by the adapter
    | { readonly outcome: "refused"; readonly diagnostics: readonly EngramDiagnosticLike[] };
  summaries(document: unknown, sourceView: unknown, collapsed: readonly string[], language: "fr" | "en"): unknown;  // role archiSummaries
  sourceView(document: unknown, spec: unknown): unknown;                                          // role buildSourceView
  readonly pins: { readonly archi: PinLike; readonly generic: PinLike; readonly cards: PinLike; readonly contract: PinLike; readonly viewSchema: PinLike };
}
export type EngramLoad =
  | { readonly status: "loaded"; readonly pin: EngramCodecPin; readonly codec: EngramCodecPort; readonly archi: EngramArchiPort }
  | { readonly status: "pending"; readonly pin: EngramCodecPin; readonly reason: "engram pin pending" }   // phase A, or a missing role
  | { readonly status: "invalid"; readonly code: "engram-pin-invalid" | "engram-pin-digest-mismatch" | "engram-pin-closure" | "engram-pin-export-missing" | "engram-pin-grammar-mismatch"; readonly message: string };
export function loadEngram(pinFile?: string): EngramLoad;
export function loadEngramArchiOnly(pinFile?: string): { readonly status: "loaded"; readonly archiOnly: Pick<EngramArchiPort, "check" | "pins"> } | Exclude<EngramLoad, { status: "loaded" }>;   // phase A lift checks
```

Rules:
- Loading: for each pinned file, read the bytes, check the sha256 and the closure rule above, then `createRequire(import.meta.url)` on its absolute path. Node only.
- No catch around a codec call: a throw breaks the IFACE contract, so the harness records `engram-contract-throw` and the witness fails.
- The DS diagram-core functions `projectView`, `classifyInternalRelations`, `analyzeSummaries` and `createProfileRegistry` (workspace, DS commit under test) are injected as engram's `ArchiDsPort`.
- Names: every engram name, functions and constants alike, exists only in `engram.pin.json`. `engram-port.ts` reads a module member only as `module[pin.exports[role].name]`. No other DS module holds an engram name, requires `vendor/engram` or calls `createRequire` (W-DL1.10).
- Types: the DS declares its own structural types in `src/pins/engram-types.ts` (`ArchiViewSpecLike`, `ArchiManifestLike` and the document shapes), as `diagramCardModel.ts` does for `EntityPresentation` (DCM:86-101); it never compiles against engram's declaration files.
- Coherence: engram's archi lots are qualified against DS `7c5a8c82bf2abc71bf0963e3fcfc395c48fcf6af`. The harness compares tree ids: `git rev-parse <dsCommit>:packages/diagram-core` against `git rev-parse 7c5a8c82bf2abc71bf0963e3fcfc395c48fcf6af:packages/diagram-core` (both `80354cf2c87818dc6fed9894fb363ff49f1b1667` today, F-13). A difference is reported as « diagram-core drift against the engram DS pin ».

Pin update procedure (each phase change and each later bump, one PR):
1. gr-conductor sends the merge sha, the sha256 of `dist/archi-mermaid.cjs` and of `dist/archi.cjs`, the reference of engram's reproducible-build check at that sha, the role → name table and the grammar id. The message reference goes into `supplied.ref`.
2. The DS operator obtains the bytes of both files: gr-conductor supplies them, or the DS rebuilds them from a clone of engram at that sha in a scratch directory outside every work tree. Each sha256 must equal the supplied one.
3. `node packages/diagram-bijection/bin/dl-harness.mjs pin-engram --commit <sha> --codec-cjs <path> --codec-sha256 <hex> --archi-cjs <path> --archi-sha256 <hex> --exports <file>` checks both digests and both closures, writes `vendor/engram/<sha12>/archi-mermaid.cjs`, `vendor/engram/<sha12>/archi.cjs` and `fixtures/engram.pin.json`, and removes the previous vendored directory.
4. The conformance, lift and projection witnesses run. An expected file changes only with a P2 grammar revision; any other difference is a codec finding sent to gr-conductor, never an edited expectation.
5. Reports regenerate with the new `pins.engram`.

The other direction (P-3): engram CI consumes the DS conformance fixtures at `{ dsCommit, manifest sha256 }`. Every file is listed with its sha256 in `fixtures/mermaid-strict/manifest.json`. DL-0 and DL-1 inject no DS codec into engram CI; for later lots, published DS packages are pinned by npm version and private ones (`diagram-canvas`, `diagram-bijection`) by DS commit + sha256 of their built files.

### 3.2 Conformance fixtures for the codec

```ts
// fixtures/mermaid-strict/manifest.json, type in src/formats/mermaid-strict.ts
export interface ConformanceManifest {
  readonly schema: "ds.mermaid-strict-conformance/1";
  readonly grammar: "engram.archi-mermaid/1";
  readonly partitionNote: { readonly path: "P2-PARTITION-NOTE.r3.md"; readonly sha256: "9523c19784c51e4f2955c324f8b1345be433d2b6dc139375595c9bca37ce820b" };
  readonly cases: readonly ConformanceCase[];
}
export interface ConformanceCase {
  readonly id: string;
  readonly mode: "parse" | "check" | "print";
  readonly targets: readonly string[];     // closed codes, or P2 rules such as "K3", "M2", "§5"
  readonly semantic: boolean;              // also valid for checkArchi, checkArchiView and projectArchiCards
  readonly files: readonly { readonly path: string; readonly sha256: string }[];
}
export function runConformanceCase(port: EngramCodecPort, c: ConformanceCase, root: string): Outcome<{ readonly caseId: string }>;
```

Expectation files: `expected/manifest.json`, `expected/document.json` and `expected/view-specs/<local>.json` hold RFC 8785 bytes plus one LF; `expected/diagnostics.json` holds an RFC 8785 array of `{ code, path }`; `expected/fmt.mmd` holds a canonical text. Expected JSON is written by the DS from P2, never produced by the codec under test.

Diagnostic match rule: the codec never throws. On refusal it returns no triple. Every diagnostic has origin `engram` and severity `error`. The list of `{ code, path }` sorted by path then code equals the expected list. `path` is the RFC 6901 pointer `/<0-based line index>` for parse and check findings (P2:526), and a pointer into `{ manifest, document, viewSpecs }` for print findings (CP-7). Messages are free text and not compared. Each invalid case holds one defect only.

| Case | Mode | Target | Content |
| --- | --- | --- | --- |
| `v01-minimal` | parse | O1–O4 | head, one repo, one system with one runtime, one view |
| `v02-placements` | parse | P2 §3.3, §4.5 | `nest` with attributes, `edge` with trigger and label, two `invokes` on one endpoint pair, `rel` (managedIn, runsOn, ownedBy, accesses read) |
| `v03-lifecycle` | parse | P2 §3.2, §3.5, K11 | proposed and retired records, `-.->`, class block on a subgraph id, `current` omitted |
| `v04-legend` | parse | M3, P2 §3.4 | generic@2 legend, two keys, `contains` with no attribute, `category`, `legend`, `key` and `token` lines, generic pin |
| `v05-folds` | parse | P2 §5 rules 1–7 | three views: no `expanded` line (collapsed = D), every drawn container expanded (collapsed = ∅), partial with a drawn host that has no child |
| `v06-layout` | parse | P2 §3.4, §4.5 example, M11 | `stretch`, `gap`, `order` with children and `order` alone, nested groups with interleaved `item` and `group … in` lines |
| `v07-escapes` | parse | P2 §4.4, K9; the G-T5 witness (§3.7) | escape sets in a node label, a subgraph title, an edge label and an annotation value; an empty subgraph |
| `v08-semantic` | parse | §3.4 projection fixture | `draw` = system S, runtimes R1 and R2, host H; H has no child. R1 is `proposed` with category `k1`; R2 is `current` with no category. The repo, the actor, the legend and its two keys `k1` and `k2` are not drawn. S is `managedIn` the repo; R1 and R2 are `partOf` S and `runsOn` H; H is `operatedBy` the actor; the repo is `ownedBy` the actor; R1 `invokes` R2. Also `expected/ds-props.json` and `expected/perturbations.json` |
| `i01-invalid` | parse | `mermaid-strict-invalid` | a raw `[` in a node label |
| `i02-unsupported-style` | parse | `mermaid-strict-unsupported` | a `style` statement |
| `i03-unsupported-directive` | parse | `mermaid-strict-unsupported` | a `%%{…}%%` line |
| `i04-fold-map` | parse | `mermaid-strict-annotation-unknown` | a per-zone fold line `%% @dl fold <EID> true` (full fold map refused, P2:493) |
| `i05-fold-open` | parse | `mermaid-strict-annotation-unknown` | a `%% @dl fold-open <EID>` line (F-12) |
| `i06-duplicate` | parse | `mermaid-strict-duplicate` | one EID defined twice |
| `i07-duplicate-datum` | parse | `mermaid-strict-duplicate-datum` | a `name` annotation line |
| `i08-orphan-ref` | parse | `mermaid-strict-orphan-ref` | `expanded` naming a drawn runtime, not a container |
| `i09-placement-drift` | parse | `mermaid-strict-placement-drift` | a runtime written as `subgraph` |
| `i10-style-drift` | parse | `mermaid-strict-style-drift` | `-->` on a relation whose lifecycle is proposed |
| `n01-indent` | check | `mermaid-strict-noncanonical` (K4) | a tree line indented by 3 spaces; `expected/fmt.mmd` |
| `n02-draw-order` | check | `mermaid-strict-noncanonical` (K8) | `draw` lines out of order |
| `n03-blank-line` | check | `mermaid-strict-noncanonical` (K3) | a doubled empty line |
| `p01-type-definitions` | print | `mermaid-strict-unrepresentable` (M2) | a triple whose `typeDefinitions` is not empty |

The ten codes of P2 §7 are each targeted at least once (W-DL1.2). For check cases, `canonical(t)` must equal `expected/fmt.mmd` and `check(fmt)` must pass, so that fmt is idempotent (O4).

### 3.3 Fold and hint semantics as the DS consumes them

Folds (owner Q4, DLR-380; P2 §5):
- FD-1. The DS never reads fold syntax. It reads `ArchiViewSpec.collapsed`, which the codec derives as D(v) \ X(v).
- FD-2. First display (the DC-3 viewer, and the harness `default` state) folds exactly `collapsed(v)`.
- FD-3. A view with no `expanded` line folds every drawn container.
- FD-4. `expanded` lines list exceptions only: the containers shown expanded at first display.
- FD-5. A full fold map is refused by the codec (`i04`, `i05`). The DS API has no input for one: `collapsed` is a set.
- FD-6. A drawn container with no drawn child keeps its fold membership. It renders without a toggle, because engram gives it no `toggleLabel` (DLR-027).
- FD-7. D(v), needed for `all-expanded`, `all-folded` and toggles, is the set of drawn entities whose occurrence carries a fold group in engram's derived source view (`buildArchiSourceView`, SPEC §5.2; exported from phase B, CP-4 accepted). In phase A, the fold witnesses on engram output report « not run (engram pin pending) ». The DL-0 stub takes D from the zones of its structure and does not depend on engram.
- FD-8. Entity refs become occurrence refs through the source view's `entityOccurrences`, never by recomputing `occurrence:o-<local>`. They feed `LayoutOptions.collapsed` (LTYPES:117-118) and `DiagramZoneProps.collapsed` (DCM:1064).

Hints (P2 §3.4, §10 A3; DS-owned semantics, PLAN:75):
- H-1. `ArchiViewSpec.layout` maps field by field to diagram-canvas `LayoutHints` (HINTS:20-29): `ordering`, `grouping` (id, direction, items mixing refs and subgroups in order, `stretch`, `gapAfter`), `stretch`, `cardGapX`, `cardGapY`, `zoneGapX`, `zoneGapY`, `rankGap`.
- H-2. Hints are inputs, never coordinates (HINTS:1-6). `validateHints` runs with the scope of the view's drawn tree: roots are drawn entities without a drawn ancestor in the active hierarchy, and `parentOf` is the nearest drawn ancestor. A refusal is the DS-native `layout-hint-invalid`, reported and never corrected. A hint naming an entity that is not drawn is such a refusal.
- H-3. No `layout`: the DS defaults apply (DC-2: expanded-zone children in rows, DLR-044).
- H-4. If the pinned `ArchiViewSpec` has no `layout` field, the hint witnesses report « not run (engram pin pending) ».

```ts
// src/projection/folds.ts, hints.ts
export function foldContextOf(viewSpec: ArchiViewSpecLike, sourceView: NativeViewDocumentLike | null, profiles: ProfileFlagsLike): FoldContext;
export function toOccurrenceRefs(entityRefs: readonly string[], sourceView: NativeViewDocumentLike): readonly string[];
export function toLayoutHints(layout: ArchiLayoutLike | undefined): LayoutHints | undefined;   // LayoutHints from @sentropic/diagram-canvas
export function hintScopeOf(sourceView: NativeViewDocumentLike): HintScope;                   // HintScope from @sentropic/diagram-canvas
export function validateViewHints(layout: ArchiLayoutLike | undefined, sourceView: NativeViewDocumentLike): readonly LayoutRefusal[];
```

### 3.4 Projection to `DiagramCardProps` and `DiagramZoneProps`

One home per datum (P2 §6): the DS projection reads engram outputs and the fold state. It never reads the text and never derives a face, a status mark or a render option.

```ts
// src/projection/to-ds-props.ts
import type { DiagramCardProps, DiagramZoneProps, DiagramGlyphPaths } from "@sentropic/design-system-svelte/diagram-render";
import type { ArchiRenderOptions } from "../pins/engram-port.js";
export interface DsProjectionInput {
  readonly document: NativeSemanticDocumentLike;                 // parsed triple (codec)
  readonly sourceView: NativeViewDocumentLike;                   // engram derived source view
  readonly presentation: ArchiDiagramPresentationLike;           // projectArchiCards(...).diagram
  readonly renderOptions: Readonly<Record<string, ArchiRenderOptions>>;  // projectArchiCards(...).renderOptions, per occurrence (CP-5)
  readonly collapsed: ReadonlySet<string>;                       // entity refs, the fold state
  readonly resolveGlyph?: (name: string) => DiagramGlyphPaths | undefined;
}
export type DsOccurrence =
  | { readonly kind: "card"; readonly occurrence: string; readonly entity: string; readonly props: DiagramCardProps }
  | { readonly kind: "zone"; readonly occurrence: string; readonly entity: string; readonly props: DiagramZoneProps }
  | { readonly kind: "label"; readonly occurrence: string; readonly entity: string };
export function projectToDsProps(input: DsProjectionInput): readonly DsOccurrence[];   // ascending by occurrence ref
// src/projection/render-occurrences.ts
export function occurrenceRenderer(port: EngramArchiPort, codec: EngramCodecPort): SceneRenderer;   // id "ds-occurrences@0.37.0"
```

| DS prop (0.37.0) | Value | Home of the input |
| --- | --- | --- |
| `entityId` | the occurrence ref | engram source view |
| `kicker`, `body` + `detailCount`, `subtitle`, `footer`, `icon`, `tone` | `projectCardProps` / `projectZoneProps` (DCM:173, :1505) over the presentation entry | engram `projectArchiCards` |
| `title` | `text.title`, else the entity `name` (`text.title ?? name`, ENG `archi-cards.ts:43-56`) | engram presentation; the document name (visible label) |
| `iconGlyph` | `resolveGlyph(icon)` when a resolver is injected; S6 renders through `render*SvgFromPresentation`, which resolves glyphs inside the DS (RCS:263, RZS:276) | DS `./diagram-icons` registry |
| `proposed` | `renderOptions[occ].proposed` | engram `projectArchiCards` output (phase B; CP-5 accepted) |
| `toggle` | never set for a leaf card (DLR-027) | none |
| `toggleLabel` | `renderOptions[occ].toggleLabel` | engram `projectArchiCards` output (phase B) |
| `collapsed` | `collapsed.has(entity)` | fold state (§3.3) |
| `align` | never set: DS default `"left"` (DCM:145) | none |
| `bodyMode` | DS-internal (DCM:1085-1101) | none |
| `x`, `y`, `width`, `height` | never set in DL-1: DS layout output (DL-2, DC-2) | none |
| `legend-key` form | `{ kind: "label" }`, as `projectCardProps` does in 0.37.0 | none |

Single-home perturbations (`v08-semantic/expected/perturbations.json`): each row changes one homed datum (P2 §3) of the parsed triple, prints it with the codec so that every derived spelling follows (dashes, class block), parses it back, runs the engram projection and `projectToDsProps`, and lists exactly the `(occurrence, prop)` pairs that must change.

| Edit | Pairs that change |
| --- | --- |
| E1 name of runtime R2 | R2.title |
| E2 name of host H | H.title; R1.body; R2.body (detail « sur H ») |
| E3 role of R1 | R1.body |
| E4 role of system S | S.subtitle |
| E5 lifecycle of R2 → proposed | R2.title (status mark); R2.proposed |
| E6 category of R1 → second key | R1.tone |
| E7 add H to the `expanded` exceptions | H.collapsed |
| E8 name of the repo | the `footer` of S, R1 and R2 |
| E9 one evidence item of R1 | none |

### 3.5 Scene structures, the lift and the two committed texts

```ts
// src/structure/types.ts
export type Lifecycle = "current" | "proposed" | "retired";
export interface StructureEntity {
  readonly id: string;                 // ^[a-z][a-z0-9-]*$, at most 34 characters, never "dl-…"
  readonly parent: string | null;      // a zone id
  readonly name: string;
  readonly shortName?: string;         // at most 40 characters
  readonly role: string;
  readonly lifecycle: Lifecycle;
  readonly category?: string;          // declared in legend.keys
}
export interface StructureRelation { readonly id: string; readonly from: string; readonly to: string; readonly label?: string; readonly lifecycle: Lifecycle }
export interface SceneStructure {
  readonly schema: "ds.scene-structure/1";
  readonly sceneId: string;
  readonly language: "fr" | "en";
  readonly evidence: string;           // at most 200 characters, written on every lifted record
  readonly zones: readonly StructureEntity[];      // traversal order
  readonly cards: readonly StructureEntity[];      // traversal order
  readonly relations: readonly StructureRelation[];
  readonly expanded: readonly string[];            // Q4 exceptions, zone ids ascending
  readonly legend?: { readonly title: string; readonly keys: readonly { readonly category: string; readonly name: string; readonly token: string }[] };
}
export interface StructureCounts {
  readonly zones: number; readonly cards: number; readonly relations: number;
  readonly zonesByDepth: readonly number[]; readonly cardsByDepth: readonly number[];
  readonly zoneContent: { readonly cardsOnly: number; readonly zonesOnly: number; readonly both: number; readonly empty: number };
  readonly maxChildren: number;
  readonly categorised: number; readonly categories: number;
  readonly notCurrent: { readonly entities: number; readonly relations: number };
  readonly expanded: number; readonly collapsed: number;
}
export function validateStructure(value: unknown): Outcome<SceneStructure>;
export function countStructure(s: SceneStructure): StructureCounts;
// src/structure/extract-central.ts — operator host only
export function extractCentral711(source: { readonly pin: FixturePin; readonly bytes: Uint8Array }): Promise<Outcome<{ readonly structure: SceneStructure; readonly provenance: SceneProvenance }>>;
// src/structure/lift.ts
export const LIFT_RULE = "ds.archi-lift/1";
export interface ArchiTriple {
  readonly manifest: Readonly<Record<string, unknown>>;
  readonly document: Readonly<Record<string, unknown>>;
  readonly viewSpecs: readonly Readonly<Record<string, unknown>>[];   // ascending by viewId
}
export interface LiftPins { readonly archi: PinLike; readonly generic: PinLike; readonly cards: PinLike; readonly viewSchema: PinLike }
export type LiftRefusal = "lift-id-invalid" | "lift-id-collision" | "lift-reference-unknown" | "lift-category-undeclared" | "lift-value-invalid";
export function liftToArchi(s: SceneStructure, pins: LiftPins): Outcome<ArchiTriple>;
export function tripleToModel(t: ArchiTriple): CanonicalModel;
export function modelToTriple(m: CanonicalModel): Outcome<ArchiTriple>;
```

`ds.archi-lift/1` [JUDGMENT]. It is a uniform structural lift, so that both scenes enter the print domain M and the archi@1 checks without any per-entity modelling. It is the stand-in for P2-O9 (modelled kinds, DS + h2a), not a modelling of either system.

| Rule | Lift |
| --- | --- |
| L1 | `document:<sceneId>`, schema 1.1, revision 0, `profileRefs` = `["archi@1"]`, plus `"generic@2"` when a legend exists; `typeDefinitions`, `ports`, `resources` `{}`, `extensions` `[]`. |
| L2 | Zone → `system`: `name`, `shortName` when present, `role`, `lifecycle`, `evidence` [E], `category` when present. |
| L3 | Card → `runtime` of form `daemon`, same attributes. The only arrow of the closed matrix between two cards of one kind is `invokes` (F-7). |
| L4 | Each parent link → `partOf` `relation:dl-po-<id>`, lifecycle current, evidence [E]. |
| L5 | Each relation → `invokes` `relation:<id>`: lifecycle, evidence [E], `trigger` `command`, `label` = the verb of the pinned label table (fr « lance »), followed by « · » and the source label when there is one. |
| L6 | Scaffolding, never drawn: `entity:dl-repo` (repo), `entity:dl-team` (actor, form `team`), `entity:dl-host` (host, form `cloud-project`); `ownedBy` repo → team, `operatedBy` host → team; `managedIn` from each root zone to the repo; `runsOn` from each card to the host. Names and roles come from one fixed table: fr « Dépôt de démonstration », « Équipe de démonstration », « Hôte de démonstration ». |
| L7 | When a category exists: generic@2 `entity:dl-legend` (`name` = the legend title); one `entity:dl-key-<category>` per legend key of the structure, with `name` = the key name (at most 120 characters) and `category` = the key category, and no `description` (optional in generic@2: `generic2.ts:75-80`); one `contains` `relation:dl-ct-<category>` per key, with `attributes: {}`. The keys always come from the structure, never from a fixed table: `teinte-a` to `teinte-c` for S2-target-anon, `identite` and `proposition` for central-711. The legend is not drawn (as in FX `roles-teintes`, P2:436-464). |
| L8 | Manifest: language, `owningRepo` = `entity:dl-repo`, `document.json`, `["view-specs/main.json"]`, profile pins and cards pin from the engram port. View-schema pin: `EngramArchiPort.pins.viewSchema`, i.e. engram's constant if engram exports one, else the `viewSchemaPin` value recorded in `engram.pin.json` at the pin bump, copied from engram's own manifests at that sha. The package never imports diagram-core's view-schema module, which is private and not exported (`view-schema-pin.ts:15-16`; diagram-core `package.json:20-25` exports `.` only). A repository guard, `scripts/dl-view-schema-pin.test.mjs`, imports the built `packages/diagram-core/dist/view-schema-pin.js` by file URL, as `scripts/diagram-view-schema-conformance.test.mjs:39` already does, and checks that the recorded pin equals `DIAGRAM_VIEW_SCHEMA_V2_PIN` (CP-13). |
| L9 | One view `view:main`, hierarchy `archi-composition`; `draw` = every zone and card, ascending; `collapsed` = zones \ `expanded`; legend block when L7 applies (legendRef, title, key order, tokens ascending by category); no `layout`. |
| L10 | A structure id starting with `dl-`, an id longer than 34 characters, a collision between ids or an unknown reference gives a refusal. |

Resulting record counts:

| | S2-target-anon | central-711 |
| --- | ---: | ---: |
| drawn containers (D) / drawn runtimes / visible arrows | 22 / 51 / 54 | 10 / 28 / 50 |
| document entities (structure + scaffolding + legend) | 73 + 3 + 4 = 80 | 38 + 3 + 3 = 44 |
| relations: partOf, invokes, managedIn, runsOn, ownedBy, operatedBy, contains | 69, 54, 4, 51, 1, 1, 3 = 183 | 33, 50, 5, 28, 1, 1, 2 = 120 |
| text blocks: `nest` / `edge` / `rel` | 72 / 54 / 57 | 35 / 50 / 35 |
| fold states (3 + D) | 25 | 13 |

central-711 extraction (operator host; GC is our own code, pinned by sha256): the extractor writes the pinned bytes and two stub modules (`governance-layout.js` exporting `packGovernanceScene = s => s`, `architecture-layout.js` exporting `nodeContent` and `groupContent` as size-only stubs) into a scratch directory outside every work tree, imports the file and calls `buildGovernanceCentral()`. Raw data is never executed: the S2-target inputs are only parsed.

| Source (GC @`4138a0ec`) | Structure |
| --- | --- |
| group or node id; `parentId` | `id`; `parent` |
| group `title`; node `data.title` | `name` |
| root group title holding « · » | `shortName` = its first segment (the kit's own convention at GC:109; it keeps « Système · <root> » kickers inside one line, F-6) |
| group `subtitle`; node `data.function` | `role` |
| tone `neutral` / `identity` / `proposal` | no category / `identite` / `proposition` |
| edge `id`, `source`, `target`, `label` | relation `id`, `from`, `to`, `label` |
| edge class `reject` / none / any other | `proposed` / `current` / refusal |
| entity lifecycle | `current` (no source field) |
| first display folds every group (AF:12) | `expanded` = [] |
| scene legend | keys `identite` « Sécurité et mandats » (`st-semantic-data-category1`), `proposition` « Cible ou qualification en cours » (`…category2`); colour parity with the #711 render is not claimed (DC-3) |
| node `detail`, `status`, positions, sizes, `fontScale`, `cardIcon`, `kicker`, `cardFooter`, `summaryLabels`, `overviewEdges`, captions, legend sentence, `bands`, `junctions` | not carried (losses below) |

Committed texts: `fixtures/scenes/s2-target-anon.mmd` and `fixtures/scenes/central-711.mmd` are always `print(liftToArchi(structure))`. CI recomputes both and compares bytes, so neither is ever written or copied by hand (W-DL1.11).

Losses of the lift (report entries of the text format): every card reads as a runtime and every zone as a system, so kickers, icons and footers are generic; every arrow is `invokes`, and its visible label gains the verb prefix; the kit detail lines, status badges, custom summary labels, overview edge subset and captions of #711 are `not representable` in archi@1; the GitHub preview also shows the three scaffolding entities and the legend, as nodes and subgraphs without any arrow.

### 3.6 The committed text in the harness (T1)

```ts
// src/formats/mermaid-strict.ts
export function mermaidStrictCodec(load: Extract<EngramLoad, { status: "loaded" }>): FormatCodec | { readonly notRun: "engram pin pending" };
export function loadSceneText(load: EngramLoad): (bytes: Uint8Array) => Outcome<LoadedFixture>;
```

- `perFoldState: false`: the text carries the default fold state of each view only; export fold states belong to DL-2 and later.
- S0 parses the committed text, with zero diagnostics (O3). S1 checks that print of the parsed triple equals the committed bytes (O2). S2 checks that parse of print equals M on per-record bytes (O1, O5). S3 checks that print of parse of F equals F (O2). `check(t)` passes on every committed text (O4). SER:424-428 defines O1–O5.
- S4 probes, anchored on a literal line prefix (never on a line number); the import is `parse`. Allowed, each with its RFC 6902 patch and written at its canonical position so the edited text stays canonical: rename a card; change a role; add an evidence item; add an `expanded` exception; remove one `expanded` exception when the text has one (S2-target-anon), else add a second one (central-711). Forbidden, each with its code: a raw `[` in a label (`mermaid-strict-invalid`); a fold map line (`mermaid-strict-annotation-unknown`); a `name` annotation (`mermaid-strict-duplicate-datum`); `-.->` on a current relation (`mermaid-strict-style-drift`); a free `%% note` comment (`mermaid-strict-unsupported`); a `%%{…}%%` directive (`mermaid-strict-unsupported`); an edge line moved into the tree (`mermaid-strict-invalid`). Expected tally: 5/5 and 7/7.
- S5 `not-applicable`: no foreign tool saves the text; the GitHub preview is read-only and is check G-T5.
- S6 uses `occurrenceRenderer`: every drawn occurrence in its default state, cards through `renderCardSvgFromPresentation`, zones through `renderZoneSvgFromPresentation` with no children, concatenated by occurrence ref, before and after X1. The report declares « S6 scene render (DC-2) » as unverified. T1 runs from phase B only, when the codec, the source view and the render options are all pinned.

### 3.7 G-T5: the witness fixture and its CI run

Witness fixture = `v07-escapes` (P2:552). Decoded values, so that a textContent search is unambiguous:
- the node label `node ` followed by `"`, `#`, `&`, `<`, `>`, `[`, `]`, backtick, `{`, `|`, U+2028, U+2029, then `(`, `)`, `}`, `;`, `:`, `%`;
- the subgraph title: the same sequence after `zone `;
- the edge label: the same sequence after `lance · edge `;
- one annotation value (a `role`) holding `"`, `\`, `{`, U+2028 and U+2029.

In the text, the twelve VSTRING codes `#34;` `#35;` `#38;` `#60;` `#62;` `#91;` `#93;` `#96;` `#123;` `#124;` `#8232;` `#8233;` appear in each of the three labels; `expected/document.json` holds the decoded values. The fixture also holds an empty subgraph (a drawn host without child) and a class block on a subgraph id: the items P2:589 lists as `unverified`.

Corpus: every valid case of the conformance manifest, plus both scene texts, taken from the pins file with a floor on the count (10 at DL-1).

`preview/mermaid-preview.pin.json`:

```json
{
  "schema": "ds.mermaid-preview-pin/1",
  "npm": { "name": "mermaid", "version": "<exact>" },
  "github": { "observedVersion": "<x.y.z or null>", "observedOn": "<YYYY-MM-DD or null>", "method": "a ```mermaid info``` block rendered on github.com" },
  "config": { "startOnLoad": false, "securityLevel": "strict" },
  "puppeteerCore": "<exact, equal to the root lockfile version>"
}
```

- The value is set at DL-1 start by an agent with network access. Rendering an `info` block on GitHub to read the version is `unverified` as a method here (no network). Rule: `npm.version` must equal `github.observedVersion`. While `observedVersion` is null, G-T5 can pass at the npm version, but the report lists « GitHub Mermaid version parity » as unverified.
- `preview/` has its own `package.json` and `package-lock.json` (mermaid and puppeteer-core, exact) and is not a workspace. Only the G-T5 step installs it, with `npm ci --ignore-scripts`. Mermaid and its dependency tree therefore stay out of the root lockfile and out of every other job.

`preview/g-t5.browser.mjs` (plain ESM) procedure:
1. Find Chromium (`CHROME_BIN`, then the usual candidates). None found: exit 1 when `DL_REQUIRE_BROWSER=1`; otherwise print `G-T5: not run (host GPU)`, write `status: "not-run", reason: "host GPU"` and exit 3.
2. The installed `mermaid/package.json` version equals the pin, else exit 1.
3. Serve the bundle and the corpus on 127.0.0.1; puppeteer aborts every request to another host.
4. For each text: `mermaid.parse`, then `mermaid.render` with a fixed id. Record its character count against `maxTextSize` of the pinned version (50 000 in 11.15.0, F-8).
5. Escape checks: each decoded value equals the full textContent of one element of the SVG.
6. Comment invariance: the SVG of the text equals, byte for byte, the SVG of the same text with every `%% @dl` line removed, rendered with the same id.
7. Two informational probes record observed behaviour without gating: a raw `]` in a subgraph title, and a `%%{` sequence inside a label (the two Mermaid behaviours P2:249-250 marks `unverified`).
8. Write `ds.g-t5-report/1`: status, reason, Mermaid version, Chrome version, config, one case row per text {path, sha256, characters, parse, render}, escape results, comment invariance, probes. Exit 0 pass, 1 fail.

CI runs it in `diagram-bijection.yml` (§4), on a real Chromium, with `DL_REQUIRE_BROWSER=1`. The harness CLI then reads that report as check G-T5 of the two text reports. A local run of the same file reports « not run (host GPU) » and exits 3; the T1 verdict is then `partial`, never `demonstrated`.

### 3.8 DL-1 witnesses

| Id | Witness | RED when |
| --- | --- | --- |
| W-DL1.1 | `loadEngram`: each vendored file (`archi-mermaid.cjs`, `archi.cjs`) matches its pin; the commit is 40 hex; the closure rule holds (no `require(` in `archi-mermaid.cjs`, `node:crypto` only in `archi.cjs`); every role of the pin resolves to a function or a constant of its named module; the grammar id matches; `git rev-parse <dsCommit>:packages/diagram-core` equals `git rev-parse 7c5a8c82bf2abc71bf0963e3fcfc395c48fcf6af:packages/diagram-core`, or the drift is reported. In phase A, `loadEngram` returns `pending` and `loadEngramArchiOnly` loads `archi.cjs` alone. | a digest mismatch, a closure breach, a missing export, or a silent drift |
| W-DL1.2 | The conformance manifest lists every file with its sha256; each `i*` case has one target; the targeted codes equal the ten codes of P2 §7; each valid case has a full expected record set. | a code without a case, a case without expectation, or a digest mismatch |
| W-DL1.3 | Valid cases: parse gives the expected records byte for byte (O1, O3); print of them gives the input (O2); `check` passes (O4). | any byte differs |
| W-DL1.4 | Invalid cases: the diagnostic match rule of §3.2 holds; parse does not throw and returns no triple. | otherwise |
| W-DL1.5 | Check cases: `mermaid-strict-noncanonical` at the expected line; `canonical(t)` equals `expected/fmt.mmd`; `check` passes on it. | otherwise |
| W-DL1.6 | `p01`: print returns `mermaid-strict-unrepresentable` at the expected pointer. | otherwise |
| W-DL1.7 | `v05-folds`: collapsed = D, ∅ and D \ X in the three views; the childless host keeps its membership; `projectToDsProps` sets `collapsed` exactly; `toOccurrenceRefs` takes refs from the source view. | otherwise |
| W-DL1.8 | `v06-layout`: `toLayoutHints` keeps the interleaved order and the empty `order`; `validateViewHints` accepts it; a mutant hint across sibling scopes gives `layout-hint-invalid`; « not run (engram pin pending) » without A3. | otherwise |
| W-DL1.9 | `v08-semantic`: `projectToDsProps` equals `expected/ds-props.json`; each perturbation row changes exactly its listed pairs. Phase A: « not run (engram pin pending) ». | an extra or a missing change |
| W-DL1.10 | No second parser and one home for engram names: no file under `src/` except `pins/engram-port.ts` holds `@dl`, a Mermaid statement pattern, `vendor/engram` or `createRequire`; `engram-port.ts` reaches a loaded module only as `module[pin.exports[role].name]`; no other `src/` file holds an engram name of the pin file as an identifier or a string literal (checked with the TypeScript scanner, comments excluded); the projection imports nothing from the codec. | a match |
| W-DL1.11 | CI recomputes `print(liftToArchi(structure))` for both scenes and compares bytes with the committed `.mmd`; the T1 harness runs S0–S4 green on both (O1–O5). | a byte differs or a step fails |
| W-DL1.12 | At the engram pin, for both lifted triples: `checkArchi` = [] (from phase A), `checkArchiView` = [] (from phase B), and the counts of §3.5. S2-target-anon: `projectArchiCards` outcome `ok` (phase B). central-711: `ok`, or its refusals equal the committed gap ledger `central-711.projection-gaps.json` (codes and occurrences, the `deviations.json` pattern of `tools/re-harness`). | a diagnostic appears, a count differs, or the gap list changes |
| W-DL1.13 | Operator host: `extractCentral711` on the pinned GC bytes reproduces `central-711.structure.json`, and its counts equal F-11. | a byte or a count differs |
| W-DL1.14 | G-T5 in CI: every corpus text parses and renders; the three decoded labels are found; comment invariance holds; the installed Mermaid equals the pin. Locally: « not run (host GPU) », exit 3. | any failure in CI, or a local `pass` without a browser |
| W-DL1.15 | `diagram-bijection.yml` keeps `packages/diagram-bijection/**` in its paths, sets `DL_REQUIRE_BROWSER: "1"` and `CHROME_BIN` on the G-T5 step, installs `preview/` with `--ignore-scripts`, and pins every action by full sha (new cases in `scripts/verify-workflow-invariants.test.mjs`). | a condition is loosened or removed |
| W-DL1.16 | `scripts/dl-view-schema-pin.test.mjs`: the view-schema pin the lift uses (`engram.pin.json`, or engram's constant) equals `DIAGRAM_VIEW_SCHEMA_V2_PIN` of the built diagram-core, imported by file URL. | the two pins differ, or no pin is available |

### 3.9 DL-1 DS tasks and sizing

| Task | Content | Days |
| --- | --- | ---: |
| T1.1 | Engram port over the two subpaths, pin file, `pin-engram` with both files and their closure check, phase A vendoring of `archi.cjs` at `90e6882b` | 0.5 |
| T1.2 | Conformance fixtures: 8 valid, 10 invalid, 3 check, 1 print, with expectations | 1.0 |
| T1.3 | Fold and hint adapters, `projectToDsProps`, perturbation table, no-second-parser guard | 0.75 |
| T1.4 | Structure types, central-711 extractor, `ds.archi-lift/1`, lift validity witnesses, gap ledger, view-schema pin guard | 0.5 |
| T1.5 | G-T5 witness, preview pin, `diagram-bijection.yml` steps, invariant cases | 0.5 |
| T1.6 | T1 format in the harness, scene texts printed at the merge sha, reports | 0.25 |
| | **DS half of DL-1** | **3.5** |

T1.1–T1.5 can start before the codec merge. T1.6, W-DL1.3–W-DL1.6 and W-DL1.11 wait for phase B. The plan's 7-day lot holds if the engram half stays within 3.5 days (CP-15).

## 4. Test placement and CI wiring

| File | Runner | Where it runs | Witnesses |
| --- | --- | --- | --- |
| `packages/diagram-bijection/tests/harness.test.ts` | vitest | `verify` shards (workspace `test`) | W-DL0.1–0.3, 0.5 |
| `tests/report.test.ts` | vitest | shards | W-DL0.4, 0.6 |
| `tests/pins.test.ts` | vitest | shards | W-DL0.7 |
| `tests/anon.test.ts`, `tests/out-of-repo.test.ts` | vitest | shards | W-DL0.8, 0.9, 0.12 (CI half) |
| `tests/rawgate.test.ts` | vitest | shards | W-DL0.10 |
| `tests/bpmn.test.ts` | vitest | shards | W-DL0.13 |
| `tests/engram-pin.test.ts` | vitest | shards | W-DL1.1 |
| `tests/conformance.test.ts` | vitest | shards | W-DL1.2–1.6 |
| `tests/folds-hints.test.ts`, `tests/projection.test.ts` | vitest | shards | W-DL1.7–1.9 |
| `tests/no-second-parser.test.ts`, `tests/scenes.test.ts` | vitest | shards | W-DL1.10–1.12 |
| `scripts/verify-workflow-invariants.test.mjs` (new cases) | node --test | `licensing` job, via `run-script-guards.mjs` | W-DL0.11, W-DL1.15 |
| `scripts/dl-view-schema-pin.test.mjs` | node --test | `licensing` job, via `run-script-guards.mjs` | W-DL1.16 |
| `.github/workflows/raw-label-gate.yml` | node, no npm install | every PR and push to main | W-DL0.11 (real run) |
| `preview/g-t5.browser.mjs` | node + Chromium | `diagram-bijection.yml` | W-DL1.14 |
| `bin/dl-harness.mjs run --all` | node | `diagram-bijection.yml` | report artefacts |
| `bin/dl-anon.mjs verify`, `extractCentral711` | node | operator host only | W-DL0.12 (raw half), W-DL1.13 |

`raw-label-gate.yml` (DL-0):

```yaml
name: Raw-label gate
on:
  pull_request:
  push:
    branches: ["main"]
  workflow_dispatch:
permissions:
  contents: read
jobs:
  raw-label-gate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: "22"
      # No npm install: the only code that sees the secret is the dependency-free DS gate.
      - name: Raw-label gate (dl-rawgate/1)
        env:
          DL_RAWGATE_KEY: ${{ secrets.DL_RAWGATE_KEY }}
          DL_RAWGATE_REQUIRED: "1"
          EVENT: ${{ github.event_name }}
          PR_BASE: ${{ github.event.pull_request.base.sha }}
          PR_HEAD: ${{ github.event.pull_request.head.sha }}
          PUSH_BEFORE: ${{ github.event.before }}
          HEAD_SHA: ${{ github.sha }}
        run: |
          case "$EVENT" in
            pull_request) RANGE="$PR_BASE..$PR_HEAD" ;;
            push)         RANGE="$PUSH_BEFORE..$HEAD_SHA" ;;
            *)            RANGE="$HEAD_SHA" ;;
          esac
          node packages/diagram-bijection/rawgate/dl-rawgate.mjs scan --tree --commits="$RANGE"
```

The range comes from environment variables, never from an expression spliced into the script. `workflow_dispatch` scans the tree and the one commit at `HEAD_SHA`. On `push`, an empty, all-zero or unknown `before` falls back to `HEAD_SHA` alone (§2.7 item 7). A pull request from a fork gets no secret and fails closed; the repository works from same-repository branches.

`diagram-bijection.yml` (DL-0 creates the job without the three Chrome and preview steps; DL-1 adds them):

```yaml
name: Diagram bijection (harness reports, G-T5 preview)
on:
  push:
    branches: ["main"]
    paths:
      - "packages/diagram-bijection/**"
      - "packages/diagram-core/**"
      - "packages/diagram-canvas/**"
      - "packages/components-svelte/src/lib/diagramCardModel.ts"
      - "packages/components-svelte/src/lib/diagram-render/**"
      - "packages/components-svelte/src/lib/diagram-icons/**"
      - ".github/workflows/diagram-bijection.yml"
      - "package-lock.json"
  pull_request:
    paths:
      - "packages/diagram-bijection/**"
      - "packages/diagram-core/**"
      - "packages/diagram-canvas/**"
      - "packages/components-svelte/src/lib/diagramCardModel.ts"
      - "packages/components-svelte/src/lib/diagram-render/**"
      - "packages/components-svelte/src/lib/diagram-icons/**"
      - ".github/workflows/diagram-bijection.yml"
      - "package-lock.json"
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: diagram-bijection-${{ github.ref }}
  cancel-in-progress: true
jobs:
  bijection:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: "22"
          cache: "npm"
      - name: Set up Chrome (G-T5 preview witness)
        id: setup-chrome
        uses: browser-actions/setup-chrome@48ad923757ca74d66703209fe939badbdf80f2f4 # v2.2.0
        with:
          chrome-version: stable
          install-dependencies: true
      - run: npm ci
      - name: Build the harness and its workspace dependencies
        run: node scripts/ensure-theme-dists.mjs --workspaces=@sentropic/diagram-bijection
      - name: Install the pinned Mermaid preview (own lockfile, no install scripts)
        run: npm ci --prefix packages/diagram-bijection/preview --ignore-scripts --no-audit --no-fund
      - name: G-T5 preview witness (pinned Mermaid, headless Chromium)
        env:
          CHROME_BIN: ${{ steps.setup-chrome.outputs.chrome-path }}
          DL_REQUIRE_BROWSER: "1"
        run: node packages/diagram-bijection/preview/g-t5.browser.mjs --report="$RUNNER_TEMP/g-t5.json"
      - name: Harness reports (S0–S6) for every format and fixture
        run: node packages/diagram-bijection/bin/dl-harness.mjs run --all --checks="$RUNNER_TEMP/g-t5.json" --out="$RUNNER_TEMP/dl-reports"
      - name: Upload reports
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with:
          name: diagram-bijection-reports
          path: |
            ${{ runner.temp }}/dl-reports
            ${{ runner.temp }}/g-t5.json
```

The build line reuses the entry point `verify.yml` already uses; DL-0 confirms that it builds the new workspace with its dependencies. The Chrome channel floats (`stable`), as in the existing workflows: G-T5 asserts parse, render, text content and comment invariance within one run, not pixels. Raster lots (DL-4) pin an exact Chrome for Testing version. Ordinary unit witnesses need nothing new: the workspace `test` script runs in the existing `verify` shards.

## 5. Risks of DL-0 and DL-1

| Id | Risk | Mitigation |
| --- | --- | --- |
| R-DL-1 | A raw label is pushed before CI sees it (CI runs after the push). | Pre-push gate on the operator host; generator output self-scan; CI on every PR and push; documented history cleanup. |
| R-DL-2 | Gate blind spots: words under 4 code points, words already in the DS tree, pixels, paraphrases. | Phrases; three extra raw token sources; images rendered from the anonymised text only; `baselinePresent` recorded. |
| R-DL-3 | The secret leaks through an edited workflow in a PR. | Dependency-free gate step; the key protects only the digest list; rotation on any suspicion. |
| R-DL-4 | Codec names or return shapes change at the merge sha. | One port module; names only in the pin file; codec witnesses « not run » until phase B. |
| R-DL-5 | An ESM pin misses the shared chunks. | Pin and load the non-split `dist/archi-mermaid.cjs` and `dist/archi.cjs` (F-2), now engram's pins too; W-DL1.1 checks their closure. |
| R-DL-6 | The uniform lift makes the #711 faces generic, and #711 titles or roles may exceed the one-line allocations of archi-cards@1 (F-6). | `shortName` rule for root groups; overflows ledgered, never truncated; P2-O9 follow-up; the dossier states it in one sentence. |
| R-DL-7 | The S2-target-anon text nears `maxTextSize` (50 000 characters in Mermaid 11.15.0; about 31 000 estimated for S2-target-anon, evidence lines included), or GitHub uses a lower limit. | G-T5 records the character count of each text; a refusal there is a finding against annotation verbosity. |
| R-DL-8 | GitHub's Mermaid version cannot be observed offline. | Procedure at DL-1 start; parity reported unverified until observed. |
| R-DL-9 | Two fold identifiers of the S2-target source name nothing (F-10). | Counted as `source-gap` at the pins; any source change breaks the pin and forces a reviewed regeneration. |
| R-DL-10 | The DS diagram-core drifts from engram's DS pin. | W-DL1.1 reports the drift; co-planning re-pin. |

## 6. Open points for co-planning with gr-conductor

Status after the IFACE update of 2026-11-07 and the engram confirmations relayed by the coordinator.

| Id | Point | DS proposal | Status |
| --- | --- | --- | --- |
| CP-1 | Export names and return shapes of the codec. | Names as announced by IFACE (§3.1 table), written once in `engram.pin.json` and checked at the merge sha; the DS adapts the port, never the fixtures. | Open for one detail: the value returned by `formatArchiMermaid` in check mode. |
| CP-2 | Artefact to pin before npm: a split ESM file does not pin its chunks. | Pin and load the CJS files. | Closed: IFACE pins `dist/archi-mermaid.cjs` and `dist/archi.cjs`. |
| CP-3 | Reproducible build of the pinned files. | engram checks it at the merge sha; the DS compares the digests and may rebuild in a scratch clone. | Closed: confirmed by engram. |
| CP-4 | `buildArchiSourceView` and `ArchiViewSpec` missing from `@sentropic/engram/archi` (F-3). | Export them. | Closed: exported at the merge sha, with `ArchiManifest`. Phase A witnesses that need them stay « not run (engram pin pending) ». |
| CP-5 | Render options missing from `projectArchiCards` (F-4). | Carry `proposed` and `toggleLabel`; the DS never derives them. | Closed: carried at the merge sha. Their exact place in the output is read by the port adapter. |
| CP-6 | Shape of `ArchiViewSpec.layout` (A3). | Field names exactly as HINTS:12-29. | Open: confirm at the merge sha. |
| CP-7 | Diagnostic match: 0-based line index, one diagnostic per single-defect mutant, root of print pointers. | As §3.2; agree the cascade list if the codec reports more than one finding. | Open. |
| CP-8 | G-T5 ownership and fixture exchange. | The DS runs G-T5 (F-5); engram G-T3 and G-T4 import the DS conformance manifest at `{ dsCommit, manifest sha256 }`. | Open for the fixture exchange. |
| CP-9 | One Mermaid pin for both CIs. | `preview/mermaid-preview.pin.json` is the single home. | Open. |
| CP-10 | `ds.archi-lift/1` as the archi@1 form of both scenes (stand-in for P2-O9). | engram confirms that the scaffolding (repo, team, host, undrawn legend) is the accepted minimum and that both triples pass its checks at the pin. | Open. |
| CP-11 | Spelling of the fold-exception line. | P2: `%% @dl expanded <EID>`; `fold-open` refused (`i05`). | Closed: confirmed by engram. |
| CP-12 | Visible form of `invokes` labels (`archi-edge-verb`). | « lance · <label> » in fr. | Open: confirm the visible spelling. |
| CP-13 | Source of the view-schema pin in lifted manifests. | engram's constant if exported; else the value recorded in `engram.pin.json`, checked by `scripts/dl-view-schema-pin.test.mjs` against the private DS pin (§3.5 L8). | Open: does `@sentropic/engram/archi` export a view-schema pin? |
| CP-14 | npm phase cost: `@sentropic/engram` declares 19 runtime dependencies and 14 peer dependencies (measured at `90e6882b`). | A zero-dependency package for the two subpaths; else an isolated install like `preview/`; else keep the commit-pin mode. | Open. |
| CP-15 | Lot total. | DS half 3.5 days; the 7-day lot holds if the engram half stays within 3.5 days. | Open. |
| CP-16 | Canonical bytes of the bijection unit. | The DS compares with diagram-core `canonicalBytes` (RFC 8785); an engram export of its own function would allow a cross-check (O5). | Open. |

## 7. Decisions that need the owner

None. Notes:
- D-B2-1 (annotation form: comment lines or node data) stays the question already scheduled in the DL-7 dossier (PLAN:242; P2-O1). This spec does not depend on it: a switch rewrites the grammar section of P2 and regenerates the fixtures, nothing else.
- Operational prerequisite, not a decision: one repository secret, `DL_RAWGATE_KEY`, set by whoever holds admin rights on the repository (§2.7).

## Appendix A — Sources read for this spec

| Key | Source | sha256 or pin |
| --- | --- | --- |
| PLAN | `/home/antoinefa/src/sent-tech-design-system/scratchpad/diag-lib/b2-demo-plan.md` | `96348c6b3ebe46d75eaaa62e38da281c3bb071aac29fb4fa8fc7be3f55ab0589` |
| P2 | `/home/antoinefa/src/graphify/.graphify/scratch/design/archi-card-semantics/P2-PARTITION-NOTE.r3.md` | `9523c19784c51e4f2955c324f8b1345be433d2b6dc139375595c9bca37ce820b` |
| REG | `.dlreg-wt/docs/diagram-library/OWNER-REQUIREMENTS.md`, read at branch `docs/diagram-library-register` @ `28651ae0`; merged to main by PR #255, merge commit `0ee8b185` (absent from the local clone) | `be93638cb88806926f1508e708f94613b6830ce82c8acb20bad1f95f26b96308` |
| OQ | `/home/antoinefa/src/sent-tech-design-system/scratchpad/diag-lib/owner-questions.md` | `2f11bded10b42c9621d5601ee75aeea6266e2004461493f33ce7889588cd2fcb` |
| BRIEF | `scratchpad/diag-lib/dl01-spec-brief.txt` | `28480885ff56c8c31d6c7641823cd266b8bf0b5cfca8c4aa3fe9bbb74f84e462` |
| IFACE | `scratchpad/diag-lib/dl01-engram-interface.md`, with its « Update 2026-11-07 » | `c31cffe6f378f825cabed2d5fe0bee9e4f9109b674aa96afd133767773e2ac4f` |
| REV | `scratchpad/diag-lib/dl01-review-argon.out` (Argon review of revision 1) | `c2f686ce689b11842a6f1941992342a88fa4a3cf40be1270515f40bae6d0a432` |
| G2 | `packages/diagram-core/src/profiles/generic2.ts` @ `origin/main` (legend-key attributes at lines 75-80) | `d5a85feb48a6d068c8ed9e88de936e2ab074b38f110d8cbb8bcbc55d9d9770f4` |
| VSP | `packages/diagram-core/src/view-schema-pin.ts` @ `origin/main` (private header at lines 15-16) | `ae163797f25e84b975c7df701173f9135a044d294173a7fa3ed68c4551e34aa6` |
| DCP | `packages/diagram-core/package.json` @ `origin/main` (exports at lines 20-25) | `0b406da1fb2f537efaa6ee694044a6a9141c26571fd5dc3993dd2c1e35b0ba2a` |
| DCM | `packages/components-svelte/src/lib/diagramCardModel.ts` @ `svelte-v0.37.0` (`bbf8b390`) | `fd764c90f01b632a0c019375eb8409590d0f66ff8e1f03e9c3feadd69a15edc5` |
| DRI | `packages/components-svelte/src/lib/diagram-render/index.ts` @ `svelte-v0.37.0` | `b39127656c69898ce52716c5339f65130ef152ab0d61a5ccf0ab068a124e711d` |
| RCS | `…/diagram-render/renderCardSvg.ts` @ `svelte-v0.37.0` | `59e6e7b5a62516733c592861bb8c06fe639f5a2cb24a4bc10195b2d27893e5c0` |
| RZS | `…/diagram-render/renderZoneSvg.ts` @ `svelte-v0.37.0` | `209ed264a04f3c27a2e3eb2b266941a66bbc0509ce6c04cb8ad6f339946fef23` |
| HINTS | `packages/diagram-canvas/src/layout/hints.ts` @ `origin/main` `e79b9142` | `9b5501dccbcb306d20cbe25dd463674fc8cbab1ca41e1f0e298e3ecc49d85727` |
| LTYPES | `packages/diagram-canvas/src/layout/types.ts` @ `origin/main` | `afd92733c02c467828f00362f495d49c09a5d9a792ef154a77a5f5be10f676c4` |
| JCS | `packages/diagram-core/src/sha256.ts` @ `origin/main` | `f1b912415b240b7b32a41c4706923e31a51be2e90fb9d2eea9e457b5e6d29aaf` |
| ENG archi.ts | engram (`rhanka/engram`) `main` `90e6882be2c7c81c6f268851c28606d42045bd9a`: `src/archi.ts` | `6c48008378513a79068d7ddb2677430bc64b397dddd19cc1070c97d34fc51033` |
| ENG tsup | same commit: `tsup.config.ts` | `f958509b4fac03f6dac4787e34b1d9e28fba3a8a4ef94f5750ceaffc31dfade1` |
| ENG package | same commit: `package.json` | `8bd6471a453fd6777b100057a06db3acf2383dce37ecd52c531ccd66085000b9` |
| ENG view | same commit: `src/ontology-guardian/archi-view.ts` | `0e670ceb3b132419005f75ab9aeb9cfb62bf5a8bced6ac137aa438c030ab6462` |
| ENG cards | same commit: `src/ontology-guardian/archi-cards.ts` | `d6c4222587765b8a630f2ca7a90a77a7312a21d915d77b8f27268f52df74c691` |
| ENG check | same commit: `src/ontology-guardian/archi-check.ts` | `654ef32e7b9bc89958cb67663fbc2a37d238e8d82f2c2af881807fe4ba5b39b3` |
| ENG profile | same commit: `src/ontology-guardian/archi-profile.ts` | `7cb3874da68338ae37dfa8ddd12d605db91308245cbd6e7b54537f3a7ebbfb4a` |
| ENG cards-data | same commit: `src/ontology-guardian/archi-cards-data.ts` | `a27a9c97accb4e3d596989f3b6c8901466fa59d828784c4f3257686d1ade04b7` |
| GC | sentropic `4138a0ecba9c5b37409abb5ac00f732d02b7dc8d`: `docs/governance/kit/src/governance-central.js` | `8648b0935735a386afa843e7221234406c1c61fbe48fa5bc7c4172743b0c3f1c` |
| AF | same commit: `docs/governance/kit/src/ArchitectureFigure.svelte` | `a7e0e98efddb2df2676b78a3666934f53ec0203e520a055de87fe02619056be9` |
| ASVG | same commit: `docs/governance/kit/src/architecture-svg.js` | `9fa5d5c74709ab106dcd087430eb815164844d1ab2a2e0da582b5cdc6f1b0c8a` |
| SER | `/home/antoinefa/src/h2a/tmp/h-cond/archi-skill/SERIALIZATION.md`, lines 424-428 (O1–O5) | `2cf83b2c6ca3a4c2b74897321701613baf3d3fca483f3608572f7ed53ad5b4a3` |
| Raw S2 | the five `confidential-raw` pins of §2.4 under `/home/antoinefa/src/airbus-genair-hrpolnav/` (HEAD `faf21b6f`) | digests in §2.4; read for structure only |
| BPMN | `/home/antoinefa/src/bpmn-canvas` @ `05f737885bd44fddea84bf1b4d55ae5428704855` (file list only) | 55 tracked `*.bpmn` |
| Mermaid | `node_modules/mermaid` 11.15.0 under `/home/antoinefa/src/openerp` (defaults only) | version 11.15.0 |

## Review ledger (Argon review of revision 1)

Source: REV (sha256 `c2f686ce…a432`), verdict CHANGES, 8 blocking and 2 non-blocking findings, on revision 1 (sha256 `453cb900…d8a8`, 1257 lines). « r1:n » is a line of revision 1, the reviewed file; « r2:n » is a line of this revision. Every check below was made against the primary source named, read-only.

Several findings quote text that revision 1 does not contain (`anonymiseS2Target` and its steps, `realpathSync(...)`, a `store` or `service` form in the lift, `verifyDiagramCoreBaseline`, a `diagram-bijection-browser` job, a `one-collapsed` state). Those parts are pushed back with the lines that revision 1 does hold. One finding also names three raw category values of the S2-target fixture; this ledger does not repeat them, and REV must stay out of every commit.

| # | Severity | Finding | Status | Evidence and change |
| --- | --- | --- | --- | --- |
| 1 | blocking | Anonymiser steps 4–5 rekey the engram view and semantic files and leak raw occurrence keys. | Pushed back, with one clarifying sentence. | r1:521-522 are two rows of the counts table; revision 1 has no `anonymiseS2Target`, no step 4 or 5, no rekeying and no `extensions` rebuild. The generator's only structural input is the ds-fixture plus the fold file (r1:435-440 `AnonymiseInput`); the engram view and semantic files are pinned as gate token sources only (r1:427). The finding's premise is also contradicted by the file itself, measured by counts only: its top level holds a `relationOccurrences` map of 31 entries, and none of its 56 `entityOccurrences` keys starts with `occurrence:link.`. New sentence: no anonymised copy of those files is produced or committed (r2:516). |
| 2 | blocking | The gate never guards 2–3 character identifiers, and `workflow_dispatch` yields the range `..<sha>`. | Fixed, both points. | Measured on the pinned fixture (counts only): 73 distinct identifier tokens of 2 or 3 code points (entity ids, codes, relation-id parts), none guarded by the 4-code-point word rule (r1:589); 56 of them already occur as case-sensitive words in DS `origin/main`. New: a case-sensitive identifier class from 2 code points, with HMAC class separation, and deterministic per-line attribution (r2:596-602, limits r2:619). Range: `parseRange` accepts `<a>..<b>` or `<b>`; an empty, all-zero or unknown `<a>` falls back to `<b>` (r2:602). The workflow sets the range per event through environment variables, and `workflow_dispatch` scans `HEAD_SHA` (r2:1156-1164). Witness W-DL0.10 extended (r2:653). |
| 3 | blocking | `assertOutsideGitWorkTree` throws `ENOENT` when the home does not exist yet. | Pushed back, with a new witness case. | Revision 1 holds no `realpathSync(existsSync(abs) ? abs : path.dirname(abs))` and no `execFileSync`. It already resolves « the real path of the nearest existing ancestor » (r1:546) and runs `git -C <that ancestor>` (r1:547). Its home is `$HOME/.local/share/sentropic/dl-anon` (r1:539), not the cache path the finding cites. W-DL0.9 now also requires a home whose whole parent chain is missing to pass without `ENOENT` (r2:652). |
| 4 | blocking | Tally check vs `foldStates` for text runs, refused-code subset rule, vacuous `demonstrated`. | Fixed, three points. | 4.1: the report now carries `perFoldState`, and `foldStates` is defined as the number of states actually exported (r2:216; schema r2:319); `validateReport` compares X1 and X2 tallies with `foldStates` (r2:382). 4.2: inverted, every `editSubset` code must be declared by a `refused` loss, and a print refusal such as `mermaid-strict-unrepresentable` (P2:539) may be declared without a probe (r2:382). 4.3: S2, S3 and S4 now fail with `harness-vacuous` on a 0/0 tally, and `demonstrated` needs `x1.pass ≥ 1`, `x2.pass ≥ 1` and both edit fractions complete with `of ≥ 1` (r2:210-212, r2:220). Revision 1 has no `roundTrip` fraction, so that part of the fix has no object. Witnesses W-DL0.4 and W-DL0.5 extended (r2:647-648). |
| 5 | blocking | The lift produces invalid archi@1 or generic@2 triples (five points). | 5.1–5.4 pushed back, with L7 made explicit. 5.5 fixed. | 5.1: L3 assigns `runtime` of form `daemon` (r1:931), a form archi@1 declares (ENG `archi-profile.ts:38-50`). 5.2 and 5.3: the lift creates no `store`, no `uses`, and the actor `dl-team` is only the target of `ownedBy` and `operatedBy` (r1:934); every relation becomes `invokes` (r1:933). 5.4: in generic@2 a legend-key requires `name` (at most 120 characters) and `category`, while `description` is optional (G2:75-80). L7 already took its keys from the structure (r1:935), not from a fixed list. The categories of central-711 come from the kit tones measured in GC (F-11), and PLAN:56 lists no tint for #711. L7 now states the attributes explicitly (r2:979). 5.5 is right: `view-schema-pin.ts` is private (VSP:15-16) and diagram-core exports `.` only (DCP:20-25). L8 now takes the pin from engram's constant, or from the value recorded in `engram.pin.json`, checked by the new repository guard `scripts/dl-view-schema-pin.test.mjs` (r2:980, W-DL1.16 r2:1086, CP-13 r2:1273). |
| 6 | blocking | The engram contract ignores the IFACE update; the cited IFACE digest has 65 characters; constants are missing from the pin's names. | Fixed. | The cited digest had 65 characters (measured with `wc -c`): a copy error. It is replaced by the 64-hex digest of the current IFACE file (r2:9; Appendix A). The IFACE « Update 2026-11-07 » is applied (r2:677-780): two subpaths and two pinned CJS files with a closure check; the announced names and the `{ check }` mapping of `formatArchiMermaid`; the never-throw union; CP-3, CP-4, CP-5 and CP-11 confirmed. Every engram name, constants included (`ARCHI_CARDS_CONTENT`, `ARCHI_V1_PIN`, `ARCHI_CARDS_PIN`, `GENERIC_V2`, `CONTRACT_PIN`), is now a role of `engram.pin.json` (r2:692-706, r2:717). The `checkArchi` call passes the cards content explicitly (ENG `archi-check.ts:117-121`). W-DL1.10 now checks that `engram-port.ts` reaches modules only through `pin.exports` (r2:1080). |
| 7 | blocking | The diagram-core coherence check compares a tree id with a commit id. | Pushed back; command made explicit. | r1:729 compares « the tree id of `packages/diagram-core` at the DS commit under test with the one at `7c5a8c82` », i.e. tree with tree. Measured: `git rev-parse 7c5a8c82:packages/diagram-core` and `git rev-parse origin/main:packages/diagram-core` both give `80354cf2c87818dc6fed9894fb363ff49f1b1667`. The full sha the finding gives for `7c5a8c82` is not the DS commit: `git rev-parse 7c5a8c82` gives `7c5a8c82bf2abc71bf0963e3fcfc395c48fcf6af`, and PLAN:45 holds no such sha. The command now names the full sha (r2:773, W-DL1.1 r2:1071). |
| 8 | blocking | The browser job skips the theme build, runs the browser file through `npm test`, and gates on `CI=true`. | Pushed back; one related defect fixed. | Revision 1 holds no `diagram-bijection-browser` job, no `npm test --workspace … -- …browser.test.ts`, no vitest `exclude`, and no `CI === "true"` gate for G-T5. Its workflow already runs `node scripts/ensure-theme-dists.mjs --workspaces=@sentropic/diagram-bijection` after `npm ci` (r1:1161-1162). G-T5 is a plain node script gated on finding Chromium and on `DL_REQUIRE_BROWSER` (r1:1012). Related defect found while checking 8.3: revision 1 listed the `CI=true` refusal among the generator rules (r1:499), which would stop W-DL0.8 in the CI shards if the core applied it. The refusal now belongs to the CLI only, and the core reads neither the environment nor the disk (r2:504, W-DL0.8 r2:651). The vitest and tsc scopes are now explicit (r2:73). |
| 9 | non-blocking | `all-folded` is `D` at r1:214 but `D \ roots` at r1:814. | Pushed back. | r1:814 is the signature of `hintScopeOf`. Revision 1 holds no statement that roots stay expanded in `all-folded`, and no `one-collapsed` state. `all-folded` is D throughout (r1:214, r2:216), consistent with P2 §5 and FD-3 (r2:840). |
| 10 | non-blocking | `v08-semantic` is underspecified for E5, E6 and E8. | Fixed. | The fixture row now fixes `draw` = S, R1, R2, H; R1 `proposed` with category `k1`; R2 `current` with no category; the repo, the actor, the legend and its keys `k1` and `k2` undrawn; and the relations that E2 and E8 rely on (r2:817). E5 and E6 are therefore real changes, and E8 cannot touch a drawn repo. |

Changes made outside the findings: the IFACE update and engram's confirmations (§3.1, §6); the register merge by PR #255, merge commit `0ee8b185` (header, F-1, Appendix A); the report's `pins.engram` form, now with two file digests (§2.3).

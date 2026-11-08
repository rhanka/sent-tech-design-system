// Harness types, verbatim from SPEC_EVOL_DL01_BIJECTION_HARNESS §2.1.
import type { FixturePin } from "../pins/fixture-pins.js";
import type { CheckResult, LossEntry, ReportPins } from "../report/schema.js";

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
  readonly path?: string | undefined;
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
  readonly view: string; // view ref, e.g. "view:main"
  readonly containers: readonly string[]; // D(v), entity refs ascending (§3.3 FD-7)
  readonly defaultCollapsed: readonly string[]; // collapsed(v) ⊆ D(v), ascending
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
  readonly what: string; // one English sentence, copied into the report
  apply(file: ExportedFile): ExportedFile;
  readonly expect: ProbeExpectation;
}
export interface ForeignSave {
  readonly tool: string;
  readonly version: string;
  save(file: ExportedFile): Promise<ExportedFile>;
}
export interface FormatCodec {
  readonly format: string; // "stub-json", "mermaid-strict", ...
  readonly chain: readonly string[];
  /** false for the committed text: it carries the default fold state of each view only. */
  readonly perFoldState: boolean;
  exportFile(model: CanonicalModel, fold: FoldState): Outcome<ExportedFile>;
  importFile(file: ExportedFile): Outcome<ImportedFile>;
  readonly probes: readonly EditProbe[];
  /** undefined: S5 not-run "foreign tool not pinned"; "not-applicable": no foreign tool exists for the format. */
  readonly foreignSave?: ForeignSave | "not-applicable" | undefined;
}
export interface SceneRenderer {
  readonly id: string; // e.g. "ds-occurrences@0.37.0"
  render(model: CanonicalModel, fold: FoldState): Outcome<{ readonly svg: string }>;
}
export interface GoldenStore { digest(format: string, fixtureId: string, fold: FoldState): string | undefined }

export interface HarnessRun {
  readonly fixture: FixturePin;
  readonly load: (bytes: Uint8Array) => Outcome<LoadedFixture>;
  readonly codec: FormatCodec;
  readonly renderer?: SceneRenderer | undefined; // absent: S6 not-run "dependency lot missing"
  readonly goldens: GoldenStore;
  readonly pins: ReportPins;
  readonly losses: readonly LossEntry[]; // declared data per format (§2.3)
  readonly checks?: readonly CheckResult[] | undefined; // CI-side checks injected by the CLI (G-T5)
  readonly unverified?: readonly string[] | undefined; // declared facts outside the steps
}
export interface HarnessIo {
  readFixture(pin: FixturePin): Promise<Uint8Array | { readonly unavailable: "raw fixture unavailable" }>;
}

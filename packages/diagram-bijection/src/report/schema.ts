// Loss report `ds.diagram-bijection-report/1` (§2.3): types mirror the frozen
// JSON Schema below (REPORT_SCHEMA).
import type { NotRunReason, StepStatus } from "../harness/types.js";

export type Verdict = "demonstrated" | "partial" | "not demonstrated";
export type LossClass = "native" | "kept via property" | "kept via payload" | "regenerated (derived)" | "refused" | "not representable";
export interface StepResult {
  readonly status: StepStatus;
  readonly reason?: NotRunReason | undefined;
  readonly pass?: number | undefined;
  readonly fail?: number | undefined;
  readonly codes?: readonly string[] | undefined;
}
export interface CheckResult {
  readonly id: "G-T5";
  readonly status: StepStatus;
  readonly reason?: NotRunReason | undefined;
}
export interface LossEntry {
  readonly what: string;
  readonly class: LossClass;
  readonly code?: string | undefined;
  readonly example?: string | undefined;
  readonly count?: number | undefined;
}
export interface Fraction { readonly done: number; readonly of: number }
export interface ReportPins {
  readonly dsCommit: string; // 40 hex, optionally "+dirty"
  readonly engram: string; // "commit:<40 hex>[ archi-mermaid:<64 hex>] archi:<64 hex>" | "npm:@sentropic/engram@x.y.z" | "pending" | "not-applicable"
  readonly bpmnCanvas: string; // "npm:@sentropic/bpmn-canvas@x.y.z" | "not-applicable"
  readonly mermaidPreview: string; // "npm:mermaid@x.y.z" | "not-applicable"
  readonly rasterizer: string; // "chrome:<version>" | "not-run" | "not-applicable"
}
export interface BijectionReport {
  readonly schema: "ds.diagram-bijection-report/1";
  readonly format: string;
  readonly chain: readonly string[];
  readonly fixture: { readonly id: string; readonly path: string; readonly sha256: string };
  readonly pins: ReportPins;
  readonly perFoldState: boolean;
  readonly foldStates: number; // states actually exported (§2.1)
  readonly steps: Readonly<Record<"S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6", StepResult>>;
  readonly x1: { readonly pass: number; readonly fail: number };
  readonly x2: { readonly pass: number; readonly fail: number };
  readonly editSubset: { readonly allowedMapped: Fraction; readonly forbiddenRefused: Fraction; readonly codes: readonly string[] };
  readonly checks: readonly CheckResult[];
  readonly losses: readonly LossEntry[];
  readonly unverified: readonly string[];
  readonly verdict: Verdict;
}

/** The frozen JSON Schema (draft 2020-12), compiled with Ajv2020 strict. */
export const REPORT_SCHEMA: Readonly<Record<string, unknown>> = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:sentropic:ds.diagram-bijection-report:1",
  title: "ds.diagram-bijection-report/1",
  type: "object",
  additionalProperties: false,
  required: ["schema", "format", "chain", "fixture", "pins", "perFoldState", "foldStates", "steps", "x1", "x2", "editSubset", "checks", "losses", "unverified", "verdict"],
  properties: {
    schema: { const: "ds.diagram-bijection-report/1" },
    format: { $ref: "#/$defs/key" },
    chain: { type: "array", minItems: 2, items: { $ref: "#/$defs/key" } },
    fixture: {
      type: "object",
      additionalProperties: false,
      required: ["id", "path", "sha256"],
      properties: { id: { $ref: "#/$defs/key" }, path: { type: "string", minLength: 1 }, sha256: { $ref: "#/$defs/sha256" } },
    },
    pins: {
      type: "object",
      additionalProperties: false,
      required: ["dsCommit", "engram", "bpmnCanvas", "mermaidPreview", "rasterizer"],
      properties: {
        dsCommit: { type: "string", pattern: "^[0-9a-f]{40}(\\+dirty)?$" },
        engram: { type: "string", pattern: "^(commit:[0-9a-f]{40}( archi-mermaid:[0-9a-f]{64})? archi:[0-9a-f]{64}|npm:@sentropic/engram@[0-9]+\\.[0-9]+\\.[0-9]+|pending|not-applicable)$" },
        bpmnCanvas: { type: "string", pattern: "^(npm:@sentropic/bpmn-canvas@[0-9]+\\.[0-9]+\\.[0-9]+|not-applicable)$" },
        mermaidPreview: { type: "string", pattern: "^(npm:mermaid@[0-9]+\\.[0-9]+\\.[0-9]+|not-applicable)$" },
        rasterizer: { type: "string", pattern: "^(chrome:[0-9.]+|not-run|not-applicable)$" },
      },
    },
    perFoldState: { type: "boolean" },
    foldStates: { type: "integer", minimum: 1 },
    steps: {
      type: "object",
      additionalProperties: false,
      required: ["S0", "S1", "S2", "S3", "S4", "S5", "S6"],
      properties: {
        S0: { $ref: "#/$defs/step" },
        S1: { $ref: "#/$defs/step" },
        S2: { $ref: "#/$defs/step" },
        S3: { $ref: "#/$defs/step" },
        S4: { $ref: "#/$defs/step" },
        S5: { $ref: "#/$defs/step" },
        S6: { $ref: "#/$defs/step" },
      },
    },
    x1: { $ref: "#/$defs/tally" },
    x2: { $ref: "#/$defs/tally" },
    editSubset: {
      type: "object",
      additionalProperties: false,
      required: ["allowedMapped", "forbiddenRefused", "codes"],
      properties: {
        allowedMapped: { $ref: "#/$defs/fraction" },
        forbiddenRefused: { $ref: "#/$defs/fraction" },
        codes: { type: "array", uniqueItems: true, items: { $ref: "#/$defs/code" } },
      },
    },
    checks: { type: "array", items: { $ref: "#/$defs/check" } },
    losses: { type: "array", items: { $ref: "#/$defs/loss" } },
    unverified: { type: "array", uniqueItems: true, items: { type: "string", minLength: 1, maxLength: 200 } },
    verdict: { enum: ["demonstrated", "partial", "not demonstrated"] },
  },
  $defs: {
    key: { type: "string", pattern: "^[a-z][a-z0-9-]*$", maxLength: 64 },
    code: { type: "string", pattern: "^[a-z][a-z0-9-]*$", maxLength: 64 },
    sha256: { type: "string", pattern: "^[0-9a-f]{64}$" },
    count: { type: "integer", minimum: 0 },
    tally: {
      type: "object",
      additionalProperties: false,
      required: ["pass", "fail"],
      properties: { pass: { $ref: "#/$defs/count" }, fail: { $ref: "#/$defs/count" } },
    },
    fraction: {
      type: "object",
      additionalProperties: false,
      required: ["done", "of"],
      properties: { done: { $ref: "#/$defs/count" }, of: { $ref: "#/$defs/count" } },
    },
    reason: {
      enum: ["host GPU", "engram pin pending", "foreign tool not pinned", "raw fixture unavailable", "rawgate key absent", "dependency lot missing", "prerequisite failed"],
    },
    codes: { type: "array", uniqueItems: true, items: { $ref: "#/$defs/code" } },
    step: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["status"],
          properties: {
            status: { enum: ["pass", "fail", "not-applicable"] },
            pass: { $ref: "#/$defs/count" },
            fail: { $ref: "#/$defs/count" },
            codes: { $ref: "#/$defs/codes" },
          },
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["status", "reason"],
          properties: { status: { const: "not-run" }, reason: { $ref: "#/$defs/reason" } },
        },
      ],
    },
    check: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["id", "status"],
          properties: { id: { const: "G-T5" }, status: { enum: ["pass", "fail", "not-applicable"] } },
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["id", "status", "reason"],
          properties: { id: { const: "G-T5" }, status: { const: "not-run" }, reason: { $ref: "#/$defs/reason" } },
        },
      ],
    },
    loss: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["what", "class", "code"],
          properties: {
            what: { type: "string", minLength: 1, maxLength: 200 },
            class: { const: "refused" },
            code: { $ref: "#/$defs/code" },
            example: { type: "string", minLength: 1 },
            count: { $ref: "#/$defs/count" },
          },
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["what", "class"],
          properties: {
            what: { type: "string", minLength: 1, maxLength: 200 },
            class: { enum: ["native", "kept via property", "kept via payload", "regenerated (derived)", "not representable"] },
            example: { type: "string", minLength: 1 },
            count: { $ref: "#/$defs/count" },
          },
        },
      ],
    },
  },
};

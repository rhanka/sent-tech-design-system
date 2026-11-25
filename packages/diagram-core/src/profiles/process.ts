import { canonicalise } from "../canonical.js";
import { type Diagnostic, diagnostic } from "../diagnostics.js";
import type { PreservedExtension, SemanticDocument } from "../document.js";
import { hashContent } from "../hash.js";
import { DIAGRAM_NOTATION_VOCABULARY, type NotationBlock } from "../notation.js";
import type { Profile } from "../profile.js";

export const PROCESS_PROFILE_ID = "process@1" as const;
export const PROCESS_STEP_KINDS = ["task", "start", "end", "decision", "subprocess"] as const;
export type ProcessStepKind = (typeof PROCESS_STEP_KINDS)[number];

export const PROCESS_TRANSITION_KINDS = ["normal", "retry", "exception"] as const;
export type ProcessTransitionKind = (typeof PROCESS_TRANSITION_KINDS)[number];

export const PROCESS_FLOW_EXTENSION_NAMESPACE = "sentropic:process-flow" as const;
export const PROCESS_FLOW_EXTENSION_VERSION = "1" as const;
export const PROCESS_FLOW_DIRECTIONS = ["LR", "TB"] as const;
export type ProcessFlowDirection = (typeof PROCESS_FLOW_DIRECTIONS)[number];

export interface ProcessFlowExtensionPayload {
  readonly direction?: ProcessFlowDirection;
  readonly numbered?: boolean;
}

/**
 * `process@1` — simple-box process flow profile backed by `diagram-notation@1`.
 *
 * `lane` omits `container: true` deliberately so steps rank globally on a
 * single level and swimlanes project as cross-axis bands.
 */
export const processProfile: Profile = {
  id: PROCESS_PROFILE_ID,
  name: "process",
  version: 1,
  completeness: "complete",
  entityTypes: [
    {
      id: "step",
      label: "Step",
      attributes: [
        { name: "name", kind: "text", required: true, maxLength: 200 },
        { name: "kind", kind: "enum", values: PROCESS_STEP_KINDS },
        { name: "subtitle", kind: "text", maxLength: 200 },
        { name: "stepNumber", kind: "text", maxLength: 16 },
      ],
    },
    {
      id: "lane",
      label: "Lane",
      attributes: [
        { name: "name", kind: "text", required: true, maxLength: 200 },
        { name: "order", kind: "quantity", units: ["index"], integer: true, min: 0 },
      ],
    },
  ],
  portTypes: [],
  relationTypes: [
    {
      id: "transition",
      label: "Transition",
      direction: "directed",
      roles: [
        { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["step"] },
        { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["step"] },
      ],
      attributes: [
        { name: "label", kind: "text", maxLength: 120 },
        { name: "kind", kind: "enum", values: PROCESS_TRANSITION_KINDS },
        { name: "emphasis", kind: "enum", values: ["default", "emphasis"] },
      ],
    },
    {
      id: "inLane",
      label: "In lane",
      direction: "directed",
      roles: [
        { role: "lane", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["lane"] },
        { role: "step", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["step"] },
      ],
      hierarchy: {
        id: "laneMembership",
        shape: "tree",
        parentRole: "lane",
        childRole: "step",
      },
    },
  ],
  constraints: [
    {
      kind: "hierarchy",
      relationType: "inLane",
      hierarchyId: "laneMembership",
      parentRole: "lane",
      childRole: "step",
    },
    { kind: "acyclic-hierarchy", hierarchyId: "laneMembership" },
  ],
  limits: {
    maxEntities: 1000,
    maxRelations: 5000,
    maxEndpointsPerRelation: 2,
  },
  notes: [
    "Simple-box process flow profile (non-BPMN) executing diagram-notation@1.",
  ],
};

/** Embedded `diagram-notation@1` block binding `process@1` types to visual roles. */
export const processNotation: NotationBlock = {
  vocabulary: DIAGRAM_NOTATION_VOCABULARY,
  mode: "strict",
  entityTypes: {
    step: {
      role: "flow-node",
      nature: "activity",
      variant: {
        attribute: "kind",
        values: {
          task: "task",
          start: "start",
          end: "end",
          decision: "decision",
          subprocess: "subprocess",
        },
        default: "task",
      },
    },
    lane: {
      role: "lane",
      nature: "responsibility",
      holds: ["flow-node"],
    },
  },
  relationTypes: {
    transition: {
      encoding: "arrow",
      ends: "arrow",
      provisional: { attribute: "kind", equals: "retry" },
    },
    inLane: {
      encoding: "containment",
    },
  },
};

/** Build a validated document-scoped `sentropic:process-flow` extension. */
export function createProcessFlowExtension(payload: ProcessFlowExtensionPayload): PreservedExtension {
  const source = canonicalise({
    ...(payload.direction === undefined ? {} : { direction: payload.direction }),
    ...(payload.numbered === undefined ? {} : { numbered: payload.numbered }),
  });
  return {
    namespace: PROCESS_FLOW_EXTENSION_NAMESPACE,
    schemaVersion: PROCESS_FLOW_EXTENSION_VERSION,
    scope: { kind: "document" },
    validation: "validated",
    contentHash: hashContent(source),
    source,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/** Validate a `sentropic:process-flow` preserved extension payload and envelope. */
export function validateProcessFlowExtension(
  extension: PreservedExtension,
  path: string,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (extension.schemaVersion !== PROCESS_FLOW_EXTENSION_VERSION) {
    diagnostics.push(
      diagnostic({
        code: "extension-unsupported",
        path: `${path}.schemaVersion`,
        message: `${PROCESS_FLOW_EXTENSION_NAMESPACE} supports schemaVersion ${PROCESS_FLOW_EXTENSION_VERSION}, got ${extension.schemaVersion}`,
      }),
    );
  }
  if (extension.scope.kind !== "document") {
    diagnostics.push(
      diagnostic({
        code: "type-definition-conflict",
        path: `${path}.scope`,
        message: `${PROCESS_FLOW_EXTENSION_NAMESPACE} must be document-scoped`,
      }),
    );
  }
  if (extension.validation !== "validated") {
    diagnostics.push(
      diagnostic({
        code: "type-definition-conflict",
        path: `${path}.validation`,
        message: `${PROCESS_FLOW_EXTENSION_NAMESPACE} must have validation "validated"`,
      }),
    );
  }
  if (extension.source === undefined) {
    diagnostics.push(
      diagnostic({
        code: "extension-source-not-retained",
        path: `${path}.source`,
        message: `${PROCESS_FLOW_EXTENSION_NAMESPACE} requires retained source JSON`,
      }),
    );
    return diagnostics;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(extension.source);
  } catch {
    diagnostics.push(
      diagnostic({
        code: "value-not-serialisable",
        path: `${path}.source`,
        message: `${PROCESS_FLOW_EXTENSION_NAMESPACE} source must be valid JSON`,
      }),
    );
    return diagnostics;
  }
  if (!isPlainObject(parsed)) {
    diagnostics.push(
      diagnostic({
        code: "type-definition-conflict",
        path: `${path}.source`,
        message: `${PROCESS_FLOW_EXTENSION_NAMESPACE} payload must be a JSON object`,
      }),
    );
    return diagnostics;
  }
  for (const key of Object.keys(parsed)) {
    if (key !== "direction" && key !== "numbered") {
      diagnostics.push(
        diagnostic({
          code: "type-definition-conflict",
          path: `${path}.source.${key}`,
          message: `unknown ${PROCESS_FLOW_EXTENSION_NAMESPACE} field ${key}`,
        }),
      );
    }
  }
  if (
    parsed["direction"] !== undefined &&
    (typeof parsed["direction"] !== "string" ||
      !(PROCESS_FLOW_DIRECTIONS as readonly string[]).includes(parsed["direction"]))
  ) {
    diagnostics.push(
      diagnostic({
        code: "enum-value-not-allowed",
        path: `${path}.source.direction`,
        message: `direction must be "LR" or "TB", got ${JSON.stringify(parsed["direction"])}`,
      }),
    );
  }
  if (parsed["numbered"] !== undefined && typeof parsed["numbered"] !== "boolean") {
    diagnostics.push(
      diagnostic({
        code: "attribute-type-mismatch",
        path: `${path}.source.numbered`,
        message: `numbered must be a boolean`,
      }),
    );
  }
  return diagnostics;
}

/** Read validated `sentropic:process-flow` options from a document, if present and valid. */
export function parseProcessFlowExtension(
  document: SemanticDocument,
): ProcessFlowExtensionPayload | undefined {
  const ext = document.extensions.find(
    (entry) =>
      entry.namespace === PROCESS_FLOW_EXTENSION_NAMESPACE &&
      entry.schemaVersion === PROCESS_FLOW_EXTENSION_VERSION &&
      entry.scope.kind === "document" &&
      entry.validation === "validated",
  );
  if (ext === undefined || validateProcessFlowExtension(ext, "extensions").length > 0 || ext.source === undefined) {
    return undefined;
  }
  const parsed = JSON.parse(ext.source) as Record<string, unknown>;
  return {
    ...(parsed["direction"] === undefined ? {} : { direction: parsed["direction"] as ProcessFlowDirection }),
    ...(parsed["numbered"] === undefined ? {} : { numbered: parsed["numbered"] as boolean }),
  };
}

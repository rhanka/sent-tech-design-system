/**
 * M1-d shared test helpers: diagram-presentation inputs, recording line
 * measurers and the measured-layout call wrapper. English in code.
 */
import {
  CURRENT_SCHEMA_VERSION,
  defaultProfileRegistry,
  documentRef,
  entityRef,
  formatDiagnostics,
  GENERIC_PROFILE_ID,
  occurrenceRef,
  relationRef,
  validateView,
  type Entity,
  type Relation,
  type DiagramForm,
  type DiagramPresentation,
  type EntityRef,
  type OccurrenceRef,
  type PresentationText,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";
import { expect } from "vitest";

import {
  layoutDocument,
  type HeaderMeasurement,
  type LayoutHints,
  type LineLayout,
  type LineMeasurer,
  type MeasureRequest,
  type SlotMeasurement,
  type TextRole,
} from "../../src/index.js";
import { measure } from "./fixtures.js";

export const occurrenceOfEntity = (local: string): OccurrenceRef => occurrenceRef(`e.${local}`);

export function makePresentation(spec: {
  readonly forms: Readonly<Record<string, DiagramForm>>;
  readonly texts?: Readonly<Record<string, PresentationText>>;
  readonly legends?: Readonly<Record<string, readonly string[]>>;
}): DiagramPresentation {
  const entities: Record<string, { form: DiagramForm; text: PresentationText }> = {};
  for (const [local, form] of Object.entries(spec.forms)) {
    entities[occurrenceOfEntity(local)] = { form, text: spec.texts?.[local] ?? {} };
  }
  const legends: Record<string, { order: readonly EntityRef[] }> = {};
  for (const [local, order] of Object.entries(spec.legends ?? {})) {
    legends[occurrenceOfEntity(local)] = { order: order.map((entry) => entityRef(entry)) };
  }
  return {
    contractPin: { id: "diagram-presentation", version: "1", contentDigest: "0".repeat(64) },
    entities,
    legends,
    categoryTokens: [],
  };
}

/** A word-wrapping measurer over spaces; records every request in order. */
export function wordWrapMeasurer(options: {
  readonly charWidth?: number;
  readonly lineHeights?: Readonly<Partial<Record<TextRole, number>>>;
} = {}): LineMeasurer & { readonly calls: MeasureRequest[] } {
  const charWidth = options.charWidth ?? 8;
  const calls: MeasureRequest[] = [];
  const measurer = ((request: MeasureRequest): LineLayout => {
    calls.push({ ...request });
    const lineHeight = options.lineHeights?.[request.role] ?? 16;
    const capacity = Math.max(1, Math.floor(request.availableWidth / charWidth));
    const words = request.text.split(" ").filter((word) => word.length > 0);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const next = current === "" ? word : `${current} ${word}`;
      if (next.length <= capacity || current === "") {
        current = next.length <= capacity ? next : word;
        if (next.length > capacity && current === word && word.length > capacity) {
          // A single long word still occupies one line; characters are kept.
          lines.push(word);
          current = "";
        }
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current !== "") lines.push(current);
    if (lines.length === 0) lines.push("");
    const width = Math.max(...lines.map((line) => line.length * charWidth));
    return { lines, width, height: lines.length * lineHeight, overflow: lines.length > request.allocatedLines };
  }) as LineMeasurer & { readonly calls: MeasureRequest[] };
  (measurer as { calls?: MeasureRequest[] }).calls = calls;
  return measurer;
}

/** A measurer returning a fixed line count per role; heights differ by role count. */
export function fixedLinesMeasurer(linesByRole: Readonly<Partial<Record<TextRole, number>>>): LineMeasurer {
  return (request: MeasureRequest): LineLayout => {
    const count = linesByRole[request.role] ?? 1;
    const lines = Array.from({ length: count }, (_, index) => `${request.text}#${index}`);
    return { lines, width: 10 * count, height: 10 * count, overflow: count > request.allocatedLines };
  };
}

export interface Measured {
  readonly view: ViewDocument;
  readonly headers: readonly HeaderMeasurement[];
  readonly slots: readonly SlotMeasurement[];
  readonly warnings: readonly { code: string; refs: readonly string[]; message: string }[];
  readonly fit: { direction: string; width: number; height: number };
}

export function layMeasured(
  document: SemanticDocument,
  presentation: DiagramPresentation,
  measureLines: LineMeasurer,
  extra: {
    readonly collapsed?: readonly OccurrenceRef[];
    readonly hints?: LayoutHints;
    readonly targetWidth?: number;
  } = {},
): Measured {
  const result = layoutDocument(document, {
    registry: defaultProfileRegistry,
    measureText: measure,
    targetWidth: extra.targetWidth ?? 4000,
    presentation,
    measureLines,
    ...(extra.collapsed !== undefined ? { collapsed: extra.collapsed } : {}),
    ...(extra.hints !== undefined ? { hints: extra.hints } : {}),
  });
  if (result.status !== "laid-out") throw new Error(`refused: ${JSON.stringify(result)}`);
  if (result.measurements === undefined) throw new Error("measured layout carries no measurements");
  const diagnostics = validateView(result.view, document, { registry: defaultProfileRegistry });
  expect(formatDiagnostics(diagnostics)).toBe("");
  return {
    view: result.view,
    headers: result.measurements.headers,
    slots: result.measurements.slots,
    warnings: [...result.warnings],
    fit: { direction: result.fit.direction, width: result.fit.width, height: result.fit.height },
  };
}

export function geometryOf(view: ViewDocument, local: string): { x: number; y: number; width: number; height: number } {
  const occurrence = view.entityOccurrences[occurrenceOfEntity(local)];
  if (occurrence === undefined) throw new Error(`no occurrence for ${local}`);
  return occurrence.geometry;
}

/** A document with containers, leaves and labelled links for measured layout. */
export function buildMeasuredDocument(): SemanticDocument {
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const add = (local: string, type: "node" | "container", name?: string): void => {
    const ref = entityRef(local);
    entities[ref] = {
      id: ref,
      profile: GENERIC_PROFILE_ID,
      type,
      attributes: { name: { kind: "text", value: name ?? local } },
    };
  };
  add("C", "container", "Container");
  add("a", "node", "Alpha");
  add("b", "node", "Beta");
  add("lone", "node", "Lone");
  for (const child of ["a", "b"]) {
    const relation = relationRef(`contains.${child}`);
    relations[relation] = {
      id: relation,
      profile: GENERIC_PROFILE_ID,
      type: "contains",
      endpoints: [
        { role: "parent", target: entityRef("C") },
        { role: "child", target: entityRef(child) },
      ],
      attributes: {},
    };
  }
  const link = relationRef("l1");
  relations[link] = {
    id: link,
    profile: GENERIC_PROFILE_ID,
    type: "link",
    endpoints: [
      { role: "source", target: entityRef("a") },
      { role: "target", target: entityRef("lone") },
    ],
    attributes: { label: { kind: "text", value: "a to lone" } },
  };
  return {
    documentId: documentRef("m1d-fixture"),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: [GENERIC_PROFILE_ID],
    typeDefinitions: {},
    entities,
    relations,
    ports: {},
    resources: {},
    extensions: [],
  };
}

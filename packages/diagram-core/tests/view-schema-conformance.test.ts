/**
 * DS semantics for the @2 summary shapes (Engram spec `SPEC_V2.md`
 * sections 3.1, 3.2 and 6.2; DS share of Engram lot 3, DS side; item 3).
 *
 * This suite asserts only what the native DS validation reports, with no
 * schema oracle and no third-party import. The shape matrix against the
 * exact vendored @1 / @2 schemas (accepted by @2, refused by @1) lives in
 * the repository guard `scripts/diagram-view-schema-conformance.test.mjs`,
 * which compiles the exact schemas with the root-declared 2020-12 validator
 * against the built `packages/diagram-core/dist/`. Every shape case there
 * has its DS-semantic counterpart below.
 *
 * DS evidence reused (not duplicated): `tests/folded-view.test.ts` (B.4
 * source-valid summary at 1224-1284, B.5 duplicate key at 1286-1382,
 * B.6 summary arms at 1384-1671), `tests/m1c-pass2.test.ts` (C.6 negatives
 * at 765-1180, B.6/B.7 at 1181-1334), `tests/model-shape.test.ts:114-123`
 * (`summaryLabels` as the only optional top-level field),
 * `tests/m1c-pass3-reprojection.test.ts:130-186`,
 * `tests/m1c-pass3-stale-source.test.ts:18-76`,
 * `tests/m1c-pass3-absent-collapsed.test.ts:111-146`,
 * `tests/m1c-pass3-redo-chain.test.ts:12-43`. The builders below follow the
 * B.4 `foldDocument`/`foldSourceView` pattern with a two-relation scene so
 * the sorted/distinct obligations are exercisable.
 */
import { describe, expect, it } from "vitest";
import {
  createView,
  entityRef,
  generic2Profile,
  occurrenceRef,
  relationRef,
  validateView,
  viewRef,
  type SemanticDocument,
  type ViewDocument,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions } from "./m3-helpers.js";

const options = () => scopedOptions([generic2Profile]);

function conformanceDocument(): SemanticDocument {
  const base = baseDocument(["generic@2"]);
  return {
    ...base,
    revision: 1,
    entities: {
      "entity:a": ent("a", "generic@2", "node", { name: { kind: "text", value: "A" } }),
      "entity:b": ent("b", "generic@2", "node", { name: { kind: "text", value: "B" } }),
    },
    relations: {
      "relation:r1": rel("r1", "generic@2", "link", [
        { role: "source", target: "entity:a" },
        { role: "target", target: "entity:b" },
      ]),
      "relation:r2": rel("r2", "generic@2", "link", [
        { role: "source", target: "entity:a" },
        { role: "target", target: "entity:b" },
      ]),
    },
    ports: {},
  };
}

function conformanceView(
  document: SemanticDocument,
  summaryLabels?: ViewDocument["summaryLabels"],
): ViewDocument {
  const view = createView({ viewId: viewRef("conform"), semanticDocumentId: document.documentId });
  return {
    ...view,
    revision: document.revision,
    entityOccurrences: {
      "occurrence:a": {
        id: occurrenceRef("a"),
        entity: entityRef("a"),
        geometry: { x: 0, y: 0, width: 460, height: 200 },
      },
      "occurrence:b": {
        id: occurrenceRef("b"),
        entity: entityRef("b"),
        geometry: { x: 540, y: 0, width: 460, height: 200 },
      },
    },
    relationOccurrences: {
      "occurrence:o1": {
        id: occurrenceRef("o1"),
        relation: relationRef("r1"),
        endpoints: [
          { role: "source", occurrence: occurrenceRef("a") },
          { role: "target", occurrence: occurrenceRef("b") },
        ],
      },
      "occurrence:o2": {
        id: occurrenceRef("o2"),
        relation: relationRef("r2"),
        endpoints: [
          { role: "source", occurrence: occurrenceRef("a") },
          { role: "target", occurrence: occurrenceRef("b") },
        ],
      },
    },
    portOccurrences: {},
    groups: {},
    filters: [],
    ...(summaryLabels === undefined ? {} : { summaryLabels }),
  };
}

function validSummary(): NonNullable<ViewDocument["summaryLabels"]> {
  return {
    "sum:ok": {
      id: "sum:ok",
      sourceOccurrence: occurrenceRef("a"),
      targetOccurrence: occurrenceRef("b"),
      label: "Kept",
      relationIds: [relationRef("r1"), relationRef("r2")],
    },
  };
}

function dsCheckOf(view: ViewDocument, document: SemanticDocument, id: string): string | undefined {
  const diagnostics = validateView(view, document, options());
  const entry = diagnostics.find((item) => item.path === `summaryLabels.${id}`);
  if (entry === undefined) return undefined;
  const details = entry.details as { check?: string } | undefined;
  return details?.check ?? entry.code;
}

describe("view-schema @2 DS semantics (native validation only)", () => {
  it("keeps a DS-valid summary free of diagnostics", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, validSummary());
    expect(validateView(view, document, options())).toEqual([]);
  });

  it("refuses duplicate relationIds with summary-constituents-mismatch", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:dup": {
        id: "sum:dup",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Kept",
        relationIds: [relationRef("r1"), relationRef("r1")],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(dsCheckOf(view, document, "sum:dup")).toBe("summary-constituents-mismatch");
  });

  it("refuses unsorted relationIds with summary-constituents-mismatch", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:unsorted": {
        id: "sum:unsorted",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Kept",
        relationIds: [relationRef("r2"), relationRef("r1")],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(dsCheckOf(view, document, "sum:unsorted")).toBe("summary-constituents-mismatch");
  });

  it("refuses duplicate relationOccurrences with summary-constituents-mismatch", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:dup-occ": {
        id: "sum:dup-occ",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Kept",
        relationIds: [relationRef("r1"), relationRef("r2")],
        relationOccurrences: [occurrenceRef("o1"), occurrenceRef("o1")],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(dsCheckOf(view, document, "sum:dup-occ")).toBe("summary-constituents-mismatch");
  });

  it("refuses unsorted relationOccurrences with summary-constituents-mismatch", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:unsorted-occ": {
        id: "sum:unsorted-occ",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Kept",
        relationIds: [relationRef("r1"), relationRef("r2")],
        relationOccurrences: [occurrenceRef("o2"), occurrenceRef("o1")],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(dsCheckOf(view, document, "sum:unsorted-occ")).toBe("summary-constituents-mismatch");
  });

  it("accepts a valid non-empty relationOccurrences matching relationIds with no diagnostic", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:occ-ok": {
        id: "sum:occ-ok",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Kept",
        relationIds: [relationRef("r1"), relationRef("r2")],
        relationOccurrences: [occurrenceRef("o1"), occurrenceRef("o2")],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(validateView(view, document, options())).toEqual([]);
  });

  it("keeps an empty label free of diagnostics", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:empty-label": {
        id: "sum:empty-label",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "",
        relationIds: [relationRef("r1"), relationRef("r2")],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(validateView(view, document, options())).toEqual([]);
  });

  it("refuses an id-less summary with record-key-mismatch at its storage key", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:noid": {
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Kept",
        relationIds: [relationRef("r1"), relationRef("r2")],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    const diagnostics = validateView(view, document, options());
    expect(diagnostics.some((item) => item.code === "record-key-mismatch" && item.path === "summaryLabels.sum:noid")).toBe(
      true,
    );
  });

  it("refuses an empty relationOccurrences list with summary-constituents-mismatch", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:empty-occ": {
        id: "sum:empty-occ",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Kept",
        relationIds: [relationRef("r1"), relationRef("r2")],
        relationOccurrences: [],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(dsCheckOf(view, document, "sum:empty-occ")).toBe("summary-constituents-mismatch");
  });

  it("refuses a duplicate source triple with summary-duplicate-key", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:one": {
        id: "sum:one",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "One",
        relationIds: [relationRef("r1"), relationRef("r2")],
      },
      "sum:two": {
        id: "sum:two",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Two",
        relationIds: [relationRef("r1"), relationRef("r2")],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(dsCheckOf(view, document, "sum:two")).toBe("summary-duplicate-key");
  });

  it("reports summary-duplicate-key first for a duplicate triple carrying relationOccurrences: []", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:one": {
        id: "sum:one",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "One",
        relationIds: [relationRef("r1"), relationRef("r2")],
      },
      "sum:two": {
        id: "sum:two",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Two",
        relationIds: [relationRef("r1"), relationRef("r2")],
        relationOccurrences: [],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(dsCheckOf(view, document, "sum:two")).toBe("summary-duplicate-key");
  });

  it("refuses an id/key disagreement with record-key-mismatch", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:key": {
        id: "sum:other",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Kept",
        relationIds: [relationRef("r1"), relationRef("r2")],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    const diagnostics = validateView(view, document, options());
    expect(diagnostics.some((item) => item.code === "record-key-mismatch" && item.path === "summaryLabels.sum:key")).toBe(
      true,
    );
  });

  it("refuses empty relationIds with summary-constituents-mismatch", () => {
    const document = conformanceDocument();
    const view = conformanceView(document, {
      "sum:no-rel": {
        id: "sum:no-rel",
        sourceOccurrence: occurrenceRef("a"),
        targetOccurrence: occurrenceRef("b"),
        label: "Kept",
        relationIds: [],
      },
    } as unknown as ViewDocument["summaryLabels"]);
    expect(dsCheckOf(view, document, "sum:no-rel")).toBe("summary-constituents-mismatch");
  });
});

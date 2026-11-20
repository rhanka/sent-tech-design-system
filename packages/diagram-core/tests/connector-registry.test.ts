import { describe, expect, it } from "vitest";
import {
  ARROWHEAD_KINDS,
  ARROWHEAD_REGISTRY,
  createView,
  DASH_PATTERN_REGISTRY,
  DIAGRAM_NOTATION_PIN,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  entityRef,
  foldGroupId,
  generic2Profile,
  isArrowheadKind,
  isLinkEmphasis,
  isStrokeStyle,
  LINK_EMPHASIS_KINDS,
  LINK_EMPHASIS_REGISTRY,
  occurrenceRef,
  projectView,
  relationRef,
  resolveArrowhead,
  resolveDashPattern,
  resolveLinkEmphasis,
  serialiseView,
  STROKE_STYLES,
  validateView,
  viewRef,
  type SemanticDocument,
  type ViewDocument,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions } from "./m3-helpers.js";

const options = () => scopedOptions([generic2Profile]);

function sampleDocument(): SemanticDocument {
  const base = baseDocument(["generic@2"]);
  return {
    ...base,
    revision: 1,
    entities: {
      "entity:zone": ent("zone", "generic@2", "container", { name: { kind: "text", value: "Zone" } }),
      "entity:a": ent("a", "generic@2", "node", { name: { kind: "text", value: "A" } }),
      "entity:b": ent("b", "generic@2", "node", { name: { kind: "text", value: "B" } }),
      "entity:ext": ent("ext", "generic@2", "node", { name: { kind: "text", value: "Ext" } }),
    },
    relations: {
      "relation:contains.a": rel("contains.a", "generic@2", "contains", [
        { role: "parent", target: "entity:zone" },
        { role: "child", target: "entity:a" },
      ]),
      "relation:contains.b": rel("contains.b", "generic@2", "contains", [
        { role: "parent", target: "entity:zone" },
        { role: "child", target: "entity:b" },
      ]),
      "relation:internal": rel("internal", "generic@2", "link", [
        { role: "source", target: "entity:a" },
        { role: "target", target: "entity:b" },
      ]),
      "relation:cross": rel("cross", "generic@2", "link", [
        { role: "source", target: "entity:a" },
        { role: "target", target: "entity:ext" },
      ]),
    },
    ports: {},
  };
}

function sampleView(
  document: SemanticDocument,
  overrides: {
    readonly internal?: Record<string, unknown>;
    readonly cross?: Record<string, unknown>;
    readonly withDiagramPresentation?: boolean;
  } = {},
): ViewDocument {
  const groupId = foldGroupId(occurrenceRef("zone"));
  const base = createView({ viewId: viewRef("conn"), semanticDocumentId: document.documentId });
  return {
    ...base,
    revision: document.revision,
    entityOccurrences: {
      "occurrence:zone": { id: occurrenceRef("zone"), entity: entityRef("zone"), geometry: { x: 0, y: 0, width: 600, height: 400 } },
      "occurrence:a": { id: occurrenceRef("a"), entity: entityRef("a"), group: groupId, geometry: { x: 20, y: 80, width: 200, height: 100 } },
      "occurrence:b": { id: occurrenceRef("b"), entity: entityRef("b"), group: groupId, geometry: { x: 260, y: 80, width: 200, height: 100 } },
      "occurrence:ext": { id: occurrenceRef("ext"), entity: entityRef("ext"), geometry: { x: 700, y: 80, width: 200, height: 100 } },
    },
    relationOccurrences: {
      "occurrence:r.internal": {
        id: occurrenceRef("r.internal"),
        relation: relationRef("internal"),
        endpoints: [
          { role: "source", occurrence: occurrenceRef("a") },
          { role: "target", occurrence: occurrenceRef("b") },
        ],
        ...(overrides.internal ?? {}),
      } as ViewDocument["relationOccurrences"][string],
      "occurrence:r.cross": {
        id: occurrenceRef("r.cross"),
        relation: relationRef("cross"),
        endpoints: [
          { role: "source", occurrence: occurrenceRef("a") },
          { role: "target", occurrence: occurrenceRef("ext") },
        ],
        ...(overrides.cross ?? {}),
      } as ViewDocument["relationOccurrences"][string],
    },
    groups: {
      [groupId]: { id: groupId, occurrence: occurrenceRef("zone") },
    },
    presentation: {
      ...base.presentation,
      ...(overrides.withDiagramPresentation
        ? {
            diagram: {
              contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
              entities: {
                "occurrence:zone": { form: "container" as const, text: { title: "Zone" } },
                "occurrence:a": { form: "card" as const, text: { title: "A" } },
                "occurrence:b": { form: "card" as const, text: { title: "B" } },
                "occurrence:ext": { form: "card" as const, text: { title: "Ext" } },
              },
              legends: {},
              categoryTokens: [],
            },
          }
        : {}),
    },
  };
}

describe("DE-2 closed connector registries", () => {
  it("exposes closed, deeply frozen dash, arrowhead and emphasis registries", () => {
    expect(STROKE_STYLES).toEqual(["solid", "dashed", "dotted"]);
    expect(ARROWHEAD_KINDS).toEqual(["arrow", "none"]);
    expect(LINK_EMPHASIS_KINDS).toEqual(["default", "emphasis"]);

    expect(Object.isFrozen(DASH_PATTERN_REGISTRY)).toBe(true);
    expect(Object.isFrozen(DASH_PATTERN_REGISTRY.dashed.dashArray)).toBe(true);
    expect(Object.isFrozen(ARROWHEAD_REGISTRY)).toBe(true);
    expect(Object.isFrozen(LINK_EMPHASIS_REGISTRY)).toBe(true);

    // Dashed preserves its "proposed" semantic meaning; emphasis never alters dash.
    expect(DASH_PATTERN_REGISTRY.solid).toEqual({ style: "solid", meaning: "default", dashArray: [] });
    expect(DASH_PATTERN_REGISTRY.dashed).toEqual({ style: "dashed", meaning: "proposed", dashArray: [8, 6], tokenName: "linkDashDashed" });
    expect(DASH_PATTERN_REGISTRY.dotted).toEqual({ style: "dotted", meaning: "dotted", dashArray: [2, 5], tokenName: "linkDashDotted" });

    expect(ARROWHEAD_REGISTRY.arrow).toMatchObject({ canonicalKind: "arrow", shape: "triangle", fill: "stroke", outlined: false });
    expect(ARROWHEAD_REGISTRY.none).toMatchObject({ canonicalKind: "none", shape: "none", fill: "none", outlined: false });

    expect(LINK_EMPHASIS_REGISTRY.default).toEqual({ emphasis: "default", strokeToken: "edgeStroke", widthToken: "linkStrokeWidth", changesDash: false });
    expect(LINK_EMPHASIS_REGISTRY.emphasis).toEqual({ emphasis: "emphasis", strokeToken: "linkEmphasisStroke", widthToken: "linkEmphasisStrokeWidth", changesDash: false });
  });

  it("resolves valid registry words and rejects unknown words, N2-reserved heads, or raw geometry", () => {
    expect(resolveDashPattern(undefined)).toEqual(DASH_PATTERN_REGISTRY.solid);
    expect(resolveDashPattern("dashed")).toEqual(DASH_PATTERN_REGISTRY.dashed);
    expect(resolveDashPattern("dotted")).toEqual(DASH_PATTERN_REGISTRY.dotted);
    expect(resolveDashPattern("8 6")).toBeUndefined();
    expect(resolveDashPattern("wavy")).toBeUndefined();
    expect(isStrokeStyle("2 5")).toBe(false);

    expect(resolveArrowhead(undefined)).toEqual(ARROWHEAD_REGISTRY.arrow);
    expect(resolveArrowhead("arrow")).toEqual(ARROWHEAD_REGISTRY.arrow);
    expect(resolveArrowhead("none")).toEqual(ARROWHEAD_REGISTRY.none);
    // D-5 open: additional heads are reserved for N2 and refused in @4.
    expect(resolveArrowhead("filled-triangle")).toBeUndefined();
    expect(resolveArrowhead("open-triangle")).toBeUndefined();
    expect(resolveArrowhead("M0 0L10 5L0 10Z")).toBeUndefined();
    expect(resolveArrowhead("diamond")).toBeUndefined();
    expect(isArrowheadKind("open-triangle")).toBe(false);
    expect(isArrowheadKind("M0 0L10 5L0 10Z")).toBe(false);

    expect(resolveLinkEmphasis(undefined)).toEqual(LINK_EMPHASIS_REGISTRY.default);
    expect(resolveLinkEmphasis("emphasis")).toEqual(LINK_EMPHASIS_REGISTRY.emphasis);
    expect(resolveLinkEmphasis("dashed")).toBeUndefined();
    expect(resolveLinkEmphasis("#2563eb")).toBeUndefined();
    expect(isLinkEmphasis("dashed")).toBe(false);
  });

  it("keeps diagram-notation@1 untouched", () => {
    expect(DIAGRAM_NOTATION_PIN).toEqual({
      id: "diagram-notation",
      version: "1",
      contentDigest: DIAGRAM_NOTATION_PIN.contentDigest,
    });
    expect(DIAGRAM_NOTATION_PIN.version).toBe("1");
  });
});

describe("DE-2 view validation and fold projection", () => {
  for (const withDiagramPresentation of [false, true]) {
    it(`accepts all valid connector words (withDiagramPresentation=${withDiagramPresentation})`, () => {
      const doc = sampleDocument();
      const view = sampleView(doc, {
        withDiagramPresentation,
        internal: { strokeStyle: "dotted", arrowhead: "arrow", emphasis: "default" },
        cross: { strokeStyle: "dashed", arrowhead: "none", emphasis: "emphasis" },
      });
      expect(validateView(view, doc, options())).toEqual([]);
    });

    it(`refuses raw geometry, N2-reserved arrowheads, and unknown connector words (withDiagramPresentation=${withDiagramPresentation})`, () => {
      const doc = sampleDocument();
      const view = sampleView(doc, {
        withDiagramPresentation,
        cross: { strokeStyle: "8 6", arrowhead: "M0 0L10 5L0 10Z", emphasis: "dashed" },
      });
      const diagnostics = validateView(view, doc, options());
      expect(diagnostics.map((d) => d.path).sort()).toEqual([
        "relationOccurrences.occurrence:r.cross.arrowhead",
        "relationOccurrences.occurrence:r.cross.emphasis",
        "relationOccurrences.occurrence:r.cross.strokeStyle",
      ]);
      for (const entry of diagnostics) {
        expect((entry.details as { check?: string } | undefined)?.check).toBe("presentation-shape-invalid");
      }

      for (const reserved of ["filled-triangle", "open-triangle"]) {
        const reservedView = sampleView(doc, {
          withDiagramPresentation,
          cross: { arrowhead: reserved },
        });
        expect(validateView(reservedView, doc, options()).map((d) => d.path)).toEqual([
          "relationOccurrences.occurrence:r.cross.arrowhead",
        ]);
      }
    });
  }

  it("preserves strokeStyle, arrowhead and emphasis byte-for-byte across fold and unfold", () => {
    const doc = sampleDocument();
    const source = sampleView(doc, {
      internal: { strokeStyle: "dotted", arrowhead: "arrow", emphasis: "emphasis" },
      cross: { strokeStyle: "dashed", arrowhead: "none", emphasis: "emphasis" },
    });
    const folded = projectView(doc, source, [occurrenceRef("zone")]);
    expect(validateView(folded, doc, options())).toEqual([]);
    expect(folded.relationOccurrences["occurrence:r.internal"]).toMatchObject({
      strokeStyle: "dotted",
      arrowhead: "arrow",
      emphasis: "emphasis",
    });
    expect(folded.relationOccurrences["occurrence:r.cross"]).toMatchObject({
      strokeStyle: "dashed",
      arrowhead: "none",
      emphasis: "emphasis",
    });
    expect(folded.relationOccurrences["occurrence:r.cross"]?.endpoints[0]).toMatchObject({
      occurrence: occurrenceRef("zone"),
      sourceOccurrence: occurrenceRef("a"),
    });

    const unfolded = projectView(doc, source, []);
    expect(validateView(unfolded, doc, options())).toEqual([]);
    expect(serialiseView(unfolded)).toBe(serialiseView(source));
  });

  it("preserves absence of arrowhead and emphasis byte-for-byte", () => {
    const doc = sampleDocument();
    const source = sampleView(doc);
    const projected = projectView(doc, source, [occurrenceRef("zone")]);
    const text = serialiseView(projected);
    expect(text).not.toContain("strokeStyle");
    expect(text).not.toContain("arrowhead");
    expect(text).not.toContain("emphasis");
  });

  it("keeps frozen diagram-presentation@1 refusing dotted, arrowhead, emphasis, and summary dotted while @2 admits them", () => {
    const doc = sampleDocument();
    const v2 = sampleView(doc, {
      withDiagramPresentation: true,
      internal: { strokeStyle: "dotted", arrowhead: "none", emphasis: "emphasis" },
    });
    const v2WithSummary = {
      ...v2,
      summaryLabels: {
        "sum:zone": {
          id: "sum:zone",
          sourceOccurrence: occurrenceRef("a"),
          targetOccurrence: occurrenceRef("b"),
          label: "Summary",
          relationIds: [doc.relations["relation:internal" as never]!.id],
          strokeStyle: "dotted" as const,
        },
      },
    };
    expect(validateView(v2WithSummary, doc, options())).toEqual([]);
    const v1 = {
      ...v2WithSummary,
      presentation: {
        ...v2WithSummary.presentation,
        diagram: { ...v2WithSummary.presentation.diagram!, contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN } },
      },
    };
    expect(validateView(v1, doc, options()).map((d) => d.path).sort()).toEqual([
      "relationOccurrences.occurrence:r.internal.arrowhead",
      "relationOccurrences.occurrence:r.internal.emphasis",
      "relationOccurrences.occurrence:r.internal.strokeStyle",
      "summaryLabels.sum:zone.strokeStyle",
    ]);
  });
});

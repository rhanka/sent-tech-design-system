/**
 * The engine's input/output contract (SPEC §10.5, "Input"): a `generic@1`
 * `SemanticDocument` with no view goes through `validateDocument`; an invalid
 * one is refused with those diagnostics; the output is a `ViewDocument` that
 * `diagram-core` accepts and that the existing scene builder draws.
 */
import {
  GENERIC_PROFILE_ID,
  createState,
  defaultProfileRegistry,
  entityRef,
  formatDiagnostics,
  occurrenceRef,
  relationRef,
  serialiseDocument,
  validateState,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  bendCount,
  buildScene,
  layoutDocument,
  portAnchorPoint,
  relationRoute,
  sceneEdges,
  sceneOccurrenceCount,
} from "../../src/index.js";
import { sampleDocument } from "../fixtures.js";
import { WIDE, buildDocument, isOrthogonal, lay, measure, rectOf, routeOf, sideOfPoint } from "./fixtures.js";

const options = { registry: defaultProfileRegistry, measureText: measure, targetWidth: WIDE };

describe("input", () => {
  it("refuses an invalid document with diagram-core's own diagnostics, verbatim", () => {
    const valid = buildDocument({ nodes: ["a", "b"], links: [["r1", "a", "b"]] });
    const dangling: SemanticDocument = {
      ...valid,
      relations: {
        ...valid.relations,
        [relationRef("r2")]: {
          id: relationRef("r2"),
          profile: GENERIC_PROFILE_ID,
          type: "link",
          endpoints: [
            { role: "source", target: entityRef("a") },
            { role: "target", target: entityRef("ghost") },
          ],
          attributes: {},
        },
      },
    };
    const result = layoutDocument(dangling, options);
    expect(result.status).toBe("refused");
    if (result.status !== "refused") return;
    expect(result.refusals.map((refusal) => refusal.code)).toEqual(["document-invalid"]);
    expect(result.diagnostics.map((entry) => entry.code)).toContain("dangling-reference");
  });

  it("refuses, by name, a relation type it does not lay out instead of dropping it", () => {
    const valid = buildDocument({ nodes: ["a", "b", "c"], links: [] });
    const withAssociation: SemanticDocument = {
      ...valid,
      relations: {
        [relationRef("as1")]: {
          id: relationRef("as1"),
          profile: GENERIC_PROFILE_ID,
          type: "association",
          endpoints: ["a", "b", "c"].map((id) => ({ role: "member", target: entityRef(id) })),
          attributes: {},
        },
      },
    };
    const result = layoutDocument(withAssociation, options);
    expect(result.status).toBe("refused");
    if (result.status !== "refused") return;
    expect(result.refusals).toEqual([
      expect.objectContaining({ code: "relation-type-unsupported", refs: [relationRef("as1")] }),
    ]);
  });

  it("refuses a zero, negative or non-finite target width as target-width-invalid, with no view and no scale", () => {
    for (const targetWidth of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const result = layoutDocument(buildDocument({ nodes: ["a"], links: [] }), { ...options, targetWidth });
      expect(result.status).toBe("refused");
      if (result.status !== "refused") continue;
      expect(result.refusals.map((refusal) => [refusal.code, refusal.path])).toEqual([["target-width-invalid", "targetWidth"]]);
      expect("view" in result).toBe(false);
      expect("fit" in result).toBe(false);
    }
  });

  it("never mutates the document it lays out", () => {
    const document = buildDocument({ nodes: ["a", "b"], containers: { k: ["b"] }, links: [["r1", "a", "b", "x"]] });
    const before = serialiseDocument(document);
    lay(document, WIDE);
    expect(serialiseDocument(document)).toBe(before);
  });
});

describe("output", () => {
  it("is a ViewDocument diagram-core accepts, at the document's revision", () => {
    const document = buildDocument({ nodes: ["a", "b"], containers: { k: ["a"] }, links: [["r1", "a", "b"]], revision: 7 });
    const { view } = lay(document, WIDE);
    expect(view.revision).toBe(7);
    expect(view.semanticDocumentId).toBe(document.documentId);
    const diagnostics = validateState(createState(document, [view]), { registry: defaultProfileRegistry });
    expect(formatDiagnostics(diagnostics)).toBe("");
  });

  it("paints containers under nodes, the outermost lowest", () => {
    const document = buildDocument({ nodes: ["n"], containers: { outer: ["inner"], inner: ["n"] }, links: [] });
    const { view } = lay(document, WIDE);
    const z = (id: string) => view.entityOccurrences[occurrenceRef(`e.${id}`)]!.z!;
    expect(z("outer")).toBeLessThan(z("inner"));
    expect(z("inner")).toBeLessThan(z("n"));
    expect(z("n")).toBe(0);
  });

  it("nests every child inside its container's content box, below the title band", () => {
    const document = buildDocument({ nodes: ["n1", "n2"], containers: { outer: ["inner", "n2"], inner: ["n1"] }, links: [["r1", "n1", "n2"]] });
    const { view } = lay(document, WIDE);
    const rect = (id: string) => view.entityOccurrences[occurrenceRef(`e.${id}`)]!.geometry;
    const title = measure("x", "container-title").height + 12;
    for (const [child, parent] of [
      ["inner", "outer"],
      ["n2", "outer"],
      ["n1", "inner"],
    ] as const) {
      const c = rect(child);
      const p = rect(parent);
      expect(c.x).toBeGreaterThanOrEqual(p.x);
      expect(c.y).toBeGreaterThanOrEqual(p.y + title);
      expect(c.x + c.width).toBeLessThanOrEqual(p.x + p.width);
      expect(c.y + c.height).toBeLessThanOrEqual(p.y + p.height);
    }
  });

  it("docks a link that targets a semantic port through an injective per-end occurrence (429c92a2)", () => {
    // The scene suites' own fixture: r1 joins port pa (on a) to port pb (on b).
    // `0b785150`: r1 and r2 share the unordered entity pair, so r1 is parallel
    // and each of its port ends takes its own occurrence identified by relation
    // and role — never the shared port slot. `429c92a2` encodes the ids
    // injectively: `p.e.<len>.<port>.<len>.<relation>.<role>`.
    const document = sampleDocument();
    const { view } = lay(document, WIDE);
    const ports = Object.values(view.portOccurrences);
    expect(ports.map((port) => port.port).sort()).toEqual(["port:pa", "port:pb"]);
    const relation = Object.values(view.relationOccurrences).find((occurrence) => occurrence.relation === "relation:r1")!;
    expect(relation.endpoints.map((endpoint) => endpoint.occurrence).sort()).toEqual([
      occurrenceRef("p.e.2.pa.2.r1.source"),
      occurrenceRef("p.e.2.pb.2.r1.target"),
    ]);
    const route = relationRoute(view, relation.id)!;
    const pa = view.portOccurrences[occurrenceRef("p.e.2.pa.2.r1.source")]!;
    const owner = view.entityOccurrences[pa.ownerOccurrence]!;
    expect(route[0]).toEqual(portAnchorPoint(owner.geometry, pa.side, pa.anchor));
    expect(pa.side).toBe("east");
    expect(pa.anchor).toBeGreaterThan(0);
    expect(pa.anchor).toBeLessThan(1);
    // The parallel companion r2 carries no port: it stays on entity occurrences.
    const companion = Object.values(view.relationOccurrences).find((occurrence) => occurrence.relation === "relation:r2")!;
    expect(companion.endpoints.map((endpoint) => endpoint.occurrence).sort()).toEqual([
      occurrenceRef("e.a"),
      occurrenceRef("e.b"),
    ]);
  });

  it("routes a self-loop out of the flow exit side and back on the side before it", () => {
    const { view, warnings } = lay(buildDocument({ nodes: ["a"], links: [["r1", "a", "a"]] }), WIDE);
    expect(warnings).toEqual([]);
    const route = routeOf(view, "r1");
    const rect = rectOf(view, "a");
    expect(isOrthogonal(route)).toBe(true);
    expect(sideOfPoint(rect, route[0]!)).toBe("east");
    expect(sideOfPoint(rect, route[route.length - 1]!)).toBe("north");
    expect(bendCount(route)).toBe(3);
  });

  it("routes a link between a container and its own child inside the container", () => {
    const document = buildDocument({ nodes: ["n", "m"], containers: { k: ["n", "m"] }, links: [["r1", "k", "n"], ["r2", "m", "k"], ["r3", "n", "m"]] });
    const { view, warnings } = lay(document, WIDE);
    expect(warnings).toEqual([]);
    const k = rectOf(view, "k");
    for (const relation of ["r1", "r2"]) {
      const route = routeOf(view, relation);
      expect(isOrthogonal(route)).toBe(true);
      for (const point of route) {
        expect(point.x).toBeGreaterThanOrEqual(k.x);
        expect(point.x).toBeLessThanOrEqual(k.x + k.width);
        expect(point.y).toBeGreaterThanOrEqual(k.y);
        expect(point.y).toBeLessThanOrEqual(k.y + k.height);
      }
    }
  });

  it("is drawn by the existing scene builder with every occurrence conserved", () => {
    const document = sampleDocument();
    const { view } = lay(document, WIDE);
    const frame = buildScene(createState(document, [view]), view.viewId);
    expect(frame.exclusions).toEqual([]);
    expect(sceneOccurrenceCount(frame)).toBe(
      Object.keys(view.entityOccurrences).length +
        Object.keys(view.relationOccurrences).length +
        Object.keys(view.portOccurrences).length,
    );
    // A port-docked edge's scene path IS the engine's route, end to end.
    const edge = sceneEdges(frame).find((item) => item.relation === "relation:r1")!;
    expect(edge.path).toEqual(relationRoute(view, edge.occurrence));
  });
});

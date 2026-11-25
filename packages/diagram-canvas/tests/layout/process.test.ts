import { describe, expect, it } from "vitest";
import {
  createDocument,
  createProcessFlowExtension,
  documentRef,
  entityRef,
  enumeration,
  m3ProfileRegistry,
  PROCESS_PROFILE_ID,
  quantity,
  relationRef,
  serialiseView,
  shippedExecutorBindings,
  text,
  validateDocument,
  validateView,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { layoutMeasured } from "../../src/layout/measured.js";
import { relationRoute } from "../../src/layout/labels.js";
import { cardLineMeasurer } from "../../src/presentation/diagramCardModel.js";
import type { LayoutOptions } from "../../src/layout/types.js";
import type { Vec2 } from "../../src/transform.js";
import { layoutProcess, PROCESS_LAYOUT_SPACING } from "../../src/layout/process.js";

const baseOptions = (targetWidth = 640): LayoutOptions => ({
  registry: m3ProfileRegistry,
  bindings: shippedExecutorBindings,
  measureText: (value) => ({ width: value.length * 7.5, height: 18 }),
  measureLines: cardLineMeasurer(),
  targetWidth,
});

function linearDoc(count: number): SemanticDocument {
  const base = createDocument({ documentId: documentRef(`linear-${count}`), profileRefs: [PROCESS_PROFILE_ID] });
  const entities: Record<string, SemanticDocument["entities"][string]> = {};
  const relations: Record<string, SemanticDocument["relations"][string]> = {};
  for (let i = 0; i < count; i += 1) {
    const id = `s${i + 1}`;
    entities[`entity:${id}`] = {
      id: entityRef(id),
      profile: PROCESS_PROFILE_ID,
      type: "step",
      attributes: {
        name: text(`Step ${i + 1}`),
        kind: enumeration(i === 0 ? "start" : i === count - 1 ? "end" : "task"),
      },
    };
    if (i > 0) {
      const prev = `s${i}`;
      relations[`relation:${prev}.${id}`] = {
        id: relationRef(`${prev}.${id}`),
        profile: PROCESS_PROFILE_ID,
        type: "transition",
        endpoints: [
          { role: "source", target: entityRef(prev) },
          { role: "target", target: entityRef(id) },
        ],
        attributes: {},
      };
    }
  }
  return { ...base, entities, relations };
}

function segmentIntersection(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): boolean {
  // Proper crossing check for non-collinear segments that do not share an endpoint.
  const samePoint = (p: Vec2, q: Vec2) => Math.abs(p.x - q.x) < 1e-6 && Math.abs(p.y - q.y) < 1e-6;
  if (samePoint(a1, b1) || samePoint(a1, b2) || samePoint(a2, b1) || samePoint(a2, b2)) return false;
  const ccw = (p1: Vec2, p2: Vec2, p3: Vec2) => (p3.y - p1.y) * (p2.x - p1.x) - (p2.y - p1.y) * (p3.x - p1.x);
  const d1 = ccw(a1, a2, b1);
  const d2 = ccw(a1, a2, b2);
  const d3 = ccw(b1, b2, a1);
  const d4 = ccw(b1, b2, a2);
  return ((d1 > 1e-6 && d2 < -1e-6) || (d1 < -1e-6 && d2 > 1e-6)) &&
    ((d3 > 1e-6 && d4 < -1e-6) || (d3 < -1e-6 && d4 > 1e-6));
}

function countRouteCrossings(routes: readonly (readonly Vec2[])[]): number {
  let crossings = 0;
  for (let i = 0; i < routes.length; i += 1) {
    const r1 = routes[i]!;
    for (let j = i + 1; j < routes.length; j += 1) {
      const r2 = routes[j]!;
      for (let s1 = 0; s1 + 1 < r1.length; s1 += 1) {
        for (let s2 = 0; s2 + 1 < r2.length; s2 += 1) {
          if (segmentIntersection(r1[s1]!, r1[s1 + 1]!, r2[s2]!, r2[s2 + 1]!)) crossings += 1;
        }
      }
    }
  }
  return crossings;
}

describe("layout/process.ts (L1b)", () => {
  it("lays out 3 linear steps left-to-right at targetWidth 640 with 48px rank gap and straight connectors", () => {
    const doc = linearDoc(3);
    expect(validateDocument(doc, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);
    const result = layoutMeasured(doc, baseOptions(640));
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    expect(result.fit.direction).toBe("left-to-right");
    expect(result.fit.zoom).toBe(1);
    expect(validateView(result.view, doc, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);
    const g1 = result.view.entityOccurrences["occurrence:e.s1"]!.geometry;
    const g2 = result.view.entityOccurrences["occurrence:e.s2"]!.geometry;
    const g3 = result.view.entityOccurrences["occurrence:e.s3"]!.geometry;
    expect(g2.x - (g1.x + g1.width)).toBe(PROCESS_LAYOUT_SPACING.rankGap);
    expect(g3.x - (g2.x + g2.width)).toBe(PROCESS_LAYOUT_SPACING.rankGap);
    expect(PROCESS_LAYOUT_SPACING.rankGap).toBe(48);
    expect(PROCESS_LAYOUT_SPACING.siblingGap).toBe(24);
    expect(g1.y).toBe(g2.y);
    expect(g2.y).toBe(g3.y);
    const r12 = relationRoute(result.view, result.view.relationOccurrences["occurrence:r.s1.s2"]!.id)!;
    expect(r12).toHaveLength(2);
    expect(r12[0]!.y).toBe(r12[1]!.y);
  });

  it("applies rule P-R1: switches 5 linear steps to top-to-bottom at 640px and keeps LR at 1440px", () => {
    const doc = linearDoc(5);
    const narrow = layoutProcess(doc, baseOptions(640));
    expect(narrow.status).toBe("laid-out");
    if (narrow.status !== "laid-out") return;
    expect(narrow.fit.direction).toBe("top-to-bottom");
    expect(narrow.fit.zoom).toBeGreaterThanOrEqual(0.9);
    const g1 = narrow.view.entityOccurrences["occurrence:e.s1"]!.geometry;
    const g2 = narrow.view.entityOccurrences["occurrence:e.s2"]!.geometry;
    expect(g2.y - (g1.y + g1.height)).toBe(PROCESS_LAYOUT_SPACING.rankGap);

    const wide = layoutProcess(doc, baseOptions(1440));
    expect(wide.status).toBe("laid-out");
    if (wide.status !== "laid-out") return;
    expect(wide.fit.direction).toBe("left-to-right");
  });

  it("handles branching and merging with centred cross-axis ranks, 24px sibling gap, and 0 crossings", () => {
    const base = createDocument({ documentId: documentRef("branch"), profileRefs: [PROCESS_PROFILE_ID] });
    const doc: SemanticDocument = {
      ...base,
      entities: {
        "entity:start": { id: entityRef("start"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Start"), kind: enumeration("start") } },
        "entity:check": { id: entityRef("check"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Check"), kind: enumeration("decision") } },
        "entity:left": { id: entityRef("left"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Path A"), kind: enumeration("task") } },
        "entity:right": { id: entityRef("right"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Path B"), kind: enumeration("task") } },
        "entity:merge": { id: entityRef("merge"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Complete"), kind: enumeration("end") } },
      },
      relations: {
        "relation:start.check": { id: relationRef("start.check"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("start") }, { role: "target", target: entityRef("check") }], attributes: {} },
        "relation:check.left": { id: relationRef("check.left"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("check") }, { role: "target", target: entityRef("left") }], attributes: { label: text("Yes") } },
        "relation:check.right": { id: relationRef("check.right"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("check") }, { role: "target", target: entityRef("right") }], attributes: { label: text("No") } },
        "relation:left.merge": { id: relationRef("left.merge"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("left") }, { role: "target", target: entityRef("merge") }], attributes: {} },
        "relation:right.merge": { id: relationRef("right.merge"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("right") }, { role: "target", target: entityRef("merge") }], attributes: {} },
      },
      extensions: [createProcessFlowExtension({ direction: "LR" })],
    };
    const result = layoutProcess(doc, baseOptions(1440));
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    expect(validateView(result.view, doc, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);
    const routes = Object.values(result.view.relationOccurrences).map((o) => relationRoute(result.view, o.id)!);
    expect(countRouteCrossings(routes)).toBe(0);
    const gl = result.view.entityOccurrences["occurrence:e.left"]!.geometry;
    const gr = result.view.entityOccurrences["occurrence:e.right"]!.geometry;
    const [top, bottom] = gl.y < gr.y ? [gl, gr] : [gr, gl];
    expect(bottom.y - (top.y + top.height)).toBe(PROCESS_LAYOUT_SPACING.siblingGap);
  });

  it("preserves forward main path when retry edge is declared first", () => {
    const base = createDocument({ documentId: documentRef("retry-first"), profileRefs: [PROCESS_PROFILE_ID] });
    const doc: SemanticDocument = {
      ...base,
      entities: {
        "entity:intake": { id: entityRef("intake"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Intake"), kind: enumeration("start") } },
        "entity:review": { id: entityRef("review"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Review"), kind: enumeration("task") } },
        "entity:decide": { id: entityRef("decide"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Decide"), kind: enumeration("decision") } },
        "entity:done": { id: entityRef("done"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Done"), kind: enumeration("end") } },
      },
      relations: {
        // Declared FIRST alphabetically and in insertion order:
        "relation:decide.review": { id: relationRef("decide.review"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("decide") }, { role: "target", target: entityRef("review") }], attributes: { label: text("Retry"), kind: enumeration("retry") } },
        "relation:intake.review": { id: relationRef("intake.review"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("intake") }, { role: "target", target: entityRef("review") }], attributes: {} },
        "relation:review.decide": { id: relationRef("review.decide"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("review") }, { role: "target", target: entityRef("decide") }], attributes: {} },
        "relation:decide.done": { id: relationRef("decide.done"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("decide") }, { role: "target", target: entityRef("done") }], attributes: {} },
      },
      extensions: [createProcessFlowExtension({ direction: "LR" })],
    };
    const result = layoutProcess(doc, baseOptions(1440));
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    const xOf = (id: string) => result.view.entityOccurrences[`occurrence:e.${id}`]!.geometry.x;
    expect(xOf("intake")).toBeLessThan(xOf("review"));
    expect(xOf("review")).toBeLessThan(xOf("decide"));
    expect(xOf("decide")).toBeLessThan(xOf("done"));
    const retryOcc = result.view.relationOccurrences["occurrence:r.decide.review"]!;
    expect(retryOcc.strokeStyle).toBe("dashed");
    const routes = Object.values(result.view.relationOccurrences).map((o) => relationRoute(result.view, o.id)!);
    expect(countRouteCrossings(routes)).toBe(0);
  });

  it("handles 12+ edges cleanly with 0 crossings", () => {
    const base = createDocument({ documentId: documentRef("dense-12"), profileRefs: [PROCESS_PROFILE_ID] });
    const stepIds = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"];
    const entities = Object.fromEntries(
      stepIds.map((id, i) => [
        `entity:${id}`,
        {
          id: entityRef(id),
          profile: PROCESS_PROFILE_ID,
          type: "step",
          attributes: { name: text(`Step ${i + 1}`), kind: enumeration(i === 0 ? "start" : i === stepIds.length - 1 ? "end" : "task") },
        },
      ]),
    );
    const pairs: [string, string, string?][] = [
      ["s1", "s2"], ["s2", "s3"], ["s2", "s4"],
      ["s3", "s5"], ["s4", "s5"],
      ["s5", "s6"], ["s5", "s7"],
      ["s6", "s8"], ["s7", "s8"],
      ["s8", "s9"],
      ["s6", "s3", "retry"],
      ["s7", "s4", "retry"],
    ];
    const relations = Object.fromEntries(
      pairs.map(([from, to, kind]) => [
        `relation:${from}.${to}`,
        {
          id: relationRef(`${from}.${to}`),
          profile: PROCESS_PROFILE_ID,
          type: "transition",
          endpoints: [{ role: "source", target: entityRef(from) }, { role: "target", target: entityRef(to) }],
          attributes: kind ? { kind: enumeration(kind), label: text("Retry") } : {},
        },
      ]),
    );
    const doc: SemanticDocument = { ...base, entities, relations, extensions: [createProcessFlowExtension({ direction: "LR" })] };
    expect(Object.keys(doc.relations)).toHaveLength(12);
    const result = layoutProcess(doc, baseOptions(1440));
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    expect(validateView(result.view, doc, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);
    const routes = Object.values(result.view.relationOccurrences).map((o) => relationRoute(result.view, o.id)!);
    expect(countRouteCrossings(routes)).toBe(0);
  });

  it("projects cross-lane transitions with barycentre lane ordering and deterministic bytes", () => {
    const base = createDocument({ documentId: documentRef("lanes"), profileRefs: [PROCESS_PROFILE_ID] });
    const doc: SemanticDocument = {
      ...base,
      entities: {
        "entity:laneB": { id: entityRef("laneB"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Back Office") } },
        "entity:laneA": { id: entityRef("laneA"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Front Office") } },
        "entity:a1": { id: entityRef("a1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Receive"), kind: enumeration("start") } },
        "entity:b1": { id: entityRef("b1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Verify"), kind: enumeration("task") } },
        "entity:a2": { id: entityRef("a2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Notify"), kind: enumeration("end") } },
      },
      relations: {
        "relation:laneA.a1": { id: relationRef("laneA.a1"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("laneA") }, { role: "step", target: entityRef("a1") }], attributes: {} },
        "relation:laneB.b1": { id: relationRef("laneB.b1"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("laneB") }, { role: "step", target: entityRef("b1") }], attributes: {} },
        "relation:laneA.a2": { id: relationRef("laneA.a2"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("laneA") }, { role: "step", target: entityRef("a2") }], attributes: {} },
        "relation:a1.b1": { id: relationRef("a1.b1"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("a1") }, { role: "target", target: entityRef("b1") }], attributes: { label: text("Handoff") } },
        "relation:b1.a2": { id: relationRef("b1.a2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("b1") }, { role: "target", target: entityRef("a2") }], attributes: {} },
      },
      extensions: [createProcessFlowExtension({ direction: "LR" })],
    };
    const r1 = layoutProcess(doc, baseOptions(1440));
    expect(r1.status).toBe("laid-out");
    if (r1.status !== "laid-out") return;
    expect(validateView(r1.view, doc, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);
    const routes = Object.values(r1.view.relationOccurrences).map((o) => relationRoute(r1.view, o.id)!);
    expect(countRouteCrossings(routes)).toBe(0);

    // Reversed key insertion order produces identical view bytes
    const reversedDoc: SemanticDocument = {
      ...doc,
      entities: Object.fromEntries(Object.entries(doc.entities).reverse()),
      relations: Object.fromEntries(Object.entries(doc.relations).reverse()),
    };
    const r2 = layoutProcess(reversedDoc, baseOptions(1440));
    expect(r2.status).toBe("laid-out");
    if (r2.status !== "laid-out") return;
    expect(serialiseView(r2.view)).toBe(serialiseView(r1.view));

    // Authored lane order overrides barycentre order
    const orderedDoc: SemanticDocument = {
      ...doc,
      entities: {
        ...doc.entities,
        "entity:laneB": { id: entityRef("laneB"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Back Office"), order: quantity(0, "index") } },
        "entity:laneA": { id: entityRef("laneA"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Front Office"), order: quantity(1, "index") } },
      },
    };
    const r3 = layoutProcess(orderedDoc, baseOptions(1440));
    expect(r3.status).toBe("laid-out");
    if (r3.status !== "laid-out") return;
    expect(r3.view.entityOccurrences["occurrence:e.laneB"]!.geometry.y).toBeLessThan(
      r3.view.entityOccurrences["occurrence:e.laneA"]!.geometry.y,
    );
  });

  const segmentIntersectsRectInterior = (
    p1: Vec2,
    p2: Vec2,
    rect: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
  ): boolean => {
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    const eps = 0.5;
    return maxX > rect.x + eps && minX < rect.x + rect.width - eps && maxY > rect.y + eps && minY < rect.y + rect.height - eps;
  };

  const assertCleanRoutes = (result: Extract<ReturnType<typeof layoutProcess>, { status: "laid-out" }>, doc: SemanticDocument) => {
    const stepRects = new Map<string, { readonly x: number; readonly y: number; readonly width: number; readonly height: number }>();
    for (const occ of Object.values(result.view.entityOccurrences)) {
      if (doc.entities[occ.entity]?.type === "step") stepRects.set(occ.id, occ.geometry);
    }
    const routes: (readonly Vec2[])[] = [];
    for (const relOcc of Object.values(result.view.relationOccurrences)) {
      const pts = relationRoute(result.view, relOcc.id)!;
      routes.push(pts);
      const endpointIds = new Set(relOcc.endpoints.map((ep) => ep.occurrence as string));
      for (const [occId, rect] of stepRects) {
        if (endpointIds.has(occId)) continue;
        for (let i = 0; i + 1 < pts.length; i += 1) {
          expect(
            segmentIntersectsRectInterior(pts[i]!, pts[i + 1]!, rect),
            `${relOcc.id} segment ${i} pierces ${occId}`,
          ).toBe(false);
        }
      }
    }
    expect(countRouteCrossings(routes)).toBe(0);
  };

  it("prefixes relation occurrences with r. so e -> foo never collides with entity:foo", () => {
    const base = createDocument({ documentId: documentRef("e-foo"), profileRefs: [PROCESS_PROFILE_ID] });
    const doc: SemanticDocument = {
      ...base,
      entities: {
        "entity:e": { id: entityRef("e"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Start"), kind: enumeration("start") } },
        "entity:foo": { id: entityRef("foo"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Foo"), kind: enumeration("end") } },
      },
      relations: {
        "relation:e.foo": {
          id: relationRef("e.foo"),
          profile: PROCESS_PROFILE_ID,
          type: "transition",
          endpoints: [{ role: "source", target: entityRef("e") }, { role: "target", target: entityRef("foo") }],
          attributes: {},
        },
      },
    };
    const result = layoutProcess(doc, baseOptions(640));
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    expect(validateView(result.view, doc, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings })).toEqual([]);
    expect(result.view.relationOccurrences["occurrence:r.e.foo"]).toBeDefined();
  });

  it("routes same-lane and multi-rank (>=3) skip edges around intermediate boxes with lanes", () => {
    const base = createDocument({ documentId: documentRef("skip-in-lane"), profileRefs: [PROCESS_PROFILE_ID] });
    const doc: SemanticDocument = {
      ...base,
      entities: {
        "entity:l1": { id: entityRef("l1"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Main") } },
        "entity:s1": { id: entityRef("s1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("One"), kind: enumeration("start") } },
        "entity:s2": { id: entityRef("s2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Two") } },
        "entity:s3": { id: entityRef("s3"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Three") } },
        "entity:s4": { id: entityRef("s4"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("Four"), kind: enumeration("end") } },
      },
      relations: {
        "relation:l1.s1": { id: relationRef("l1.s1"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l1") }, { role: "step", target: entityRef("s1") }], attributes: {} },
        "relation:l1.s2": { id: relationRef("l1.s2"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l1") }, { role: "step", target: entityRef("s2") }], attributes: {} },
        "relation:l1.s3": { id: relationRef("l1.s3"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l1") }, { role: "step", target: entityRef("s3") }], attributes: {} },
        "relation:l1.s4": { id: relationRef("l1.s4"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l1") }, { role: "step", target: entityRef("s4") }], attributes: {} },
        "relation:s1.s2": { id: relationRef("s1.s2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("s2") }], attributes: {} },
        "relation:s2.s3": { id: relationRef("s2.s3"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s2") }, { role: "target", target: entityRef("s3") }], attributes: {} },
        "relation:s3.s4": { id: relationRef("s3.s4"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s3") }, { role: "target", target: entityRef("s4") }], attributes: {} },
        "relation:s1.s3": { id: relationRef("s1.s3"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("s3") }], attributes: {} },
        "relation:s1.s4": { id: relationRef("s1.s4"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("s4") }], attributes: {} },
      },
      extensions: [createProcessFlowExtension({ direction: "LR" })],
    };
    const result = layoutProcess(doc, baseOptions(1440));
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    assertCleanRoutes(result, doc);
  });

  it("routes interior-lane and cross-lane back-edges without piercing other lanes' steps", () => {
    const base = createDocument({ documentId: documentRef("lane-back"), profileRefs: [PROCESS_PROFILE_ID] });
    const doc: SemanticDocument = {
      ...base,
      entities: {
        "entity:l1": { id: entityRef("l1"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Top"), order: quantity(0, "index") } },
        "entity:l2": { id: entityRef("l2"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Mid"), order: quantity(1, "index") } },
        "entity:l3": { id: entityRef("l3"), profile: PROCESS_PROFILE_ID, type: "lane", attributes: { name: text("Bot"), order: quantity(2, "index") } },
        "entity:a1": { id: entityRef("a1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("A1"), kind: enumeration("start") } },
        "entity:a2": { id: entityRef("a2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("A2") } },
        "entity:a3": { id: entityRef("a3"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("A3") } },
        "entity:b1": { id: entityRef("b1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("B1") } },
        "entity:b2": { id: entityRef("b2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("B2") } },
        "entity:b3": { id: entityRef("b3"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("B3") } },
        "entity:c1": { id: entityRef("c1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("C1") } },
        "entity:c2": { id: entityRef("c2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("C2"), kind: enumeration("end") } },
      },
      relations: {
        "relation:l1.a1": { id: relationRef("l1.a1"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l1") }, { role: "step", target: entityRef("a1") }], attributes: {} },
        "relation:l1.a2": { id: relationRef("l1.a2"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l1") }, { role: "step", target: entityRef("a2") }], attributes: {} },
        "relation:l1.a3": { id: relationRef("l1.a3"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l1") }, { role: "step", target: entityRef("a3") }], attributes: {} },
        "relation:l2.b1": { id: relationRef("l2.b1"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l2") }, { role: "step", target: entityRef("b1") }], attributes: {} },
        "relation:l2.b2": { id: relationRef("l2.b2"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l2") }, { role: "step", target: entityRef("b2") }], attributes: {} },
        "relation:l2.b3": { id: relationRef("l2.b3"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l2") }, { role: "step", target: entityRef("b3") }], attributes: {} },
        "relation:l3.c1": { id: relationRef("l3.c1"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l3") }, { role: "step", target: entityRef("c1") }], attributes: {} },
        "relation:l3.c2": { id: relationRef("l3.c2"), profile: PROCESS_PROFILE_ID, type: "inLane", endpoints: [{ role: "lane", target: entityRef("l3") }, { role: "step", target: entityRef("c2") }], attributes: {} },
        "relation:a1.a2": { id: relationRef("a1.a2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("a1") }, { role: "target", target: entityRef("a2") }], attributes: {} },
        "relation:a2.a3": { id: relationRef("a2.a3"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("a2") }, { role: "target", target: entityRef("a3") }], attributes: {} },
        "relation:a1.b1": { id: relationRef("a1.b1"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("a1") }, { role: "target", target: entityRef("b1") }], attributes: {} },
        "relation:b1.b2": { id: relationRef("b1.b2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("b1") }, { role: "target", target: entityRef("b2") }], attributes: {} },
        "relation:b2.b3": { id: relationRef("b2.b3"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("b2") }, { role: "target", target: entityRef("b3") }], attributes: {} },
        "relation:b1.c1": { id: relationRef("b1.c1"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("b1") }, { role: "target", target: entityRef("c1") }], attributes: {} },
        "relation:c1.c2": { id: relationRef("c1.c2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("c1") }, { role: "target", target: entityRef("c2") }], attributes: {} },
        // Same-lane back-edge in middle lane l2 + cross-lane back-edge b3 -> a1
        "relation:b2.b1": { id: relationRef("b2.b1"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("b2") }, { role: "target", target: entityRef("b1") }], attributes: { kind: enumeration("retry") } },
        "relation:b3.a1": { id: relationRef("b3.a1"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("b3") }, { role: "target", target: entityRef("a1") }], attributes: { kind: enumeration("exception") } },
      },
      extensions: [createProcessFlowExtension({ direction: "LR" })],
    };
    const result = layoutProcess(doc, baseOptions(1440));
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    assertCleanRoutes(result, doc);
    const l2Rect = result.view.entityOccurrences["occurrence:e.l2"]!.geometry;
    const b2b1Pts = relationRoute(result.view, result.view.relationOccurrences["occurrence:r.b2.b1"]!.id)!;
    for (const pt of b2b1Pts) {
      expect(pt.y).toBeGreaterThanOrEqual(l2Rect.y);
      expect(pt.y).toBeLessThanOrEqual(l2Rect.y + l2Rect.height);
    }
  });

  it("keeps multiple same-side back-edges non-crossing with distinct dock points", () => {
    const base = createDocument({ documentId: documentRef("multi-back"), profileRefs: [PROCESS_PROFILE_ID] });
    const doc: SemanticDocument = {
      ...base,
      entities: {
        "entity:s1": { id: entityRef("s1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("S1"), kind: enumeration("start") } },
        "entity:s2": { id: entityRef("s2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("S2") } },
        "entity:s3": { id: entityRef("s3"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("S3"), kind: enumeration("end") } },
      },
      relations: {
        "relation:s1.s2": { id: relationRef("s1.s2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("s2") }], attributes: {} },
        "relation:s2.s3": { id: relationRef("s2.s3"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s2") }, { role: "target", target: entityRef("s3") }], attributes: {} },
        // Alphabetically reverse order: a_s3_s2 before z_s2_s1 and z_s3_s1
        "relation:a.s3.s2": { id: relationRef("a.s3.s2"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s3") }, { role: "target", target: entityRef("s2") }], attributes: { kind: enumeration("retry") } },
        "relation:z.s2.s1": { id: relationRef("z.s2.s1"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s2") }, { role: "target", target: entityRef("s1") }], attributes: { kind: enumeration("retry") } },
        "relation:z.s3.s1": { id: relationRef("z.s3.s1"), profile: PROCESS_PROFILE_ID, type: "transition", endpoints: [{ role: "source", target: entityRef("s3") }, { role: "target", target: entityRef("s1") }], attributes: { kind: enumeration("exception") } },
      },
      extensions: [createProcessFlowExtension({ direction: "LR" })],
    };
    const result = layoutProcess(doc, baseOptions(1440));
    expect(result.status).toBe("laid-out");
    if (result.status !== "laid-out") return;
    assertCleanRoutes(result, doc);
    const backDocks: string[] = [];
    for (const relOcc of Object.values(result.view.relationOccurrences)) {
      if (relOcc.strokeStyle !== "dashed") continue;
      const pts = relationRoute(result.view, relOcc.id)!;
      backDocks.push(`${Math.round(pts[0]!.x * 100)},${Math.round(pts[0]!.y * 100)}`);
      backDocks.push(`${Math.round(pts.at(-1)!.x * 100)},${Math.round(pts.at(-1)!.y * 100)}`);
    }
    expect(new Set(backDocks).size).toBe(backDocks.length);
  });

  it("caps LR label rank gaps as integers and does not widen TB rank gaps by label width", () => {
    const base = createDocument({ documentId: documentRef("tb-label"), profileRefs: [PROCESS_PROFILE_ID] });
    const doc: SemanticDocument = {
      ...base,
      entities: {
        "entity:s1": { id: entityRef("s1"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("S1"), kind: enumeration("start") } },
        "entity:s2": { id: entityRef("s2"), profile: PROCESS_PROFILE_ID, type: "step", attributes: { name: text("S2"), kind: enumeration("end") } },
      },
      relations: {
        "relation:s1.s2": {
          id: relationRef("s1.s2"),
          profile: PROCESS_PROFILE_ID,
          type: "transition",
          endpoints: [{ role: "source", target: entityRef("s1") }, { role: "target", target: entityRef("s2") }],
          attributes: { label: text("Very long transition condition label exceeding normal rank gap") },
        },
      },
    };
    const tb = layoutProcess(doc, baseOptions(640));
    expect(tb.status).toBe("laid-out");
    if (tb.status !== "laid-out") return;
    // Narrow to force TB
    const tbForced = layoutProcess({ ...doc, extensions: [createProcessFlowExtension({ direction: "TB" })] }, baseOptions(640));
    expect(tbForced.status).toBe("laid-out");
    if (tbForced.status !== "laid-out") return;
    const g1 = tbForced.view.entityOccurrences["occurrence:e.s1"]!.geometry;
    const g2 = tbForced.view.entityOccurrences["occurrence:e.s2"]!.geometry;
    expect(g2.y - (g1.y + g1.height)).toBe(PROCESS_LAYOUT_SPACING.rankGap);

    const lrForced = layoutProcess({ ...doc, extensions: [createProcessFlowExtension({ direction: "LR" })] }, baseOptions(1440));
    expect(lrForced.status).toBe("laid-out");
    if (lrForced.status !== "laid-out") return;
    const lg1 = lrForced.view.entityOccurrences["occurrence:e.s1"]!.geometry;
    const lg2 = lrForced.view.entityOccurrences["occurrence:e.s2"]!.geometry;
    const lrGap = lg2.x - (lg1.x + lg1.width);
    expect(Number.isInteger(lrGap)).toBe(true);
    expect(lrGap).toBeLessThanOrEqual(160);
  });
});

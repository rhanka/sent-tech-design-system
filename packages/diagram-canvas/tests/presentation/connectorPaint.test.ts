import { convertEngramErdScene, m3ProfileRegistry, shippedExecutorBindings, type OccurrenceRef } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import type { Rect, Vec2 } from "../../src/index.js";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "../../src/presentation/diagramCardModel.js";
import { CONNECTOR_MASK_MARGIN, layoutScene, resolveScene, sceneConnectorMask, sceneNodesOnPlane, scenePaintPlane,
  type SceneLaidOut, type SceneLayoutInput, type SceneModel } from "../../src/presentation/diagramSceneModel.js";
import { renderSceneSvg } from "../../src/presentation/renderSceneSvg.js";
import { flowFixture } from "../../test-support/flowFixture.js";
import { nestedZoneFixture } from "../../test-support/nestedZoneFixture.js";
import { hCondInput } from "../layout/dc2a/h-cond.js";

const measureLines = cardLineMeasurer(sceneCardMeasure(defaultCardMeasure));
const TOLERANCE = 0.01;

function drawn(input: SceneLayoutInput): { result: SceneLaidOut; scene: SceneModel } {
  const result = layoutScene(input);
  if (result.status !== "laid-out") throw new Error("fixture refused: " + JSON.stringify(result.refusals));
  return { result, scene: resolveScene(result, input) };
}

/** Distance from a point to the border of a rectangle (0 on the border, inside or outside alike). */
function borderDistance(point: Vec2, rect: Rect): number {
  const dx = Math.max(rect.x - point.x, 0, point.x - rect.x - rect.width);
  const dy = Math.max(rect.y - point.y, 0, point.y - rect.y - rect.height);
  if (dx > 0 || dy > 0) return Math.hypot(dx, dy);
  return Math.min(point.x - rect.x, rect.x + rect.width - point.x, point.y - rect.y, rect.y + rect.height - point.y);
}

/** The two visible boxes a drawn relation joins, in route order (ascending role, as `relationRoute`). */
function endsOf(result: SceneLaidOut, occurrence: string): readonly [string, string] {
  const relation = result.view.relationOccurrences[occurrence as OccurrenceRef]!;
  const ends = [...relation.endpoints].sort((a, b) => (a.role < b.role ? -1 : a.role > b.role ? 1 : 0))
    .map((end) => result.view.portOccurrences[end.occurrence]?.ownerOccurrence ?? end.occurrence);
  return [ends[0]!, ends[ends.length - 1]!];
}

/** Every drawn connector starts on the border of one endpoint box and ends on the border of the other. */
function expectAttached(result: SceneLaidOut, scene: SceneModel): void {
  const rects = new Map(scene.nodes.map((node) => [node.occurrence as string, node.rect]));
  for (const edge of scene.edges) {
    expect(edge.points.length, `${edge.occurrence} route`).toBeGreaterThanOrEqual(2);
    const [first, last] = endsOf(result, edge.occurrence);
    expect(rects.has(first), `${edge.occurrence} first end ${first} is drawn`).toBe(true);
    expect(rects.has(last), `${edge.occurrence} last end ${last} is drawn`).toBe(true);
    expect(borderDistance(edge.points[0]!, rects.get(first)!), `${edge.occurrence} leaves ${first}`).toBeLessThanOrEqual(TOLERANCE);
    expect(borderDistance(edge.points[edge.points.length - 1]!, rects.get(last)!), `${edge.occurrence} reaches ${last}`).toBeLessThanOrEqual(TOLERANCE);
  }
  // A label is the label of a drawn connector: it never paints alone.
  const edges = new Set(scene.edges.map((edge) => edge.occurrence as string));
  for (const label of scene.labels) expect(edges.has(label.occurrence), `${label.occurrence} label has a connector`).toBe(true);
}

/** Position of every `data-scene-occurrence` group and of every connector in a standalone SVG. */
function svgOrder(svg: string) {
  const nodes = new Map([...svg.matchAll(/<g data-scene-occurrence="([^"]+)"/g)].map((match) => [match[1]!, match.index]));
  const edges = [...svg.matchAll(/<polyline data-scene-edge="/g)].map((match) => match.index);
  return { nodes, firstEdge: Math.min(...edges), lastEdge: Math.max(...edges), edges: edges.length };
}

describe("connector paint in nested zones", () => {
  for (const outside of [false, true]) {
    const name = outside ? "with a route leaving the nested zone" : "with every relation inside the nested zone";
    it(`should route every class relation between its two cards ${name}`, () => {
      const fixture = nestedZoneFixture({ outside });
      const { result, scene } = drawn({ ...fixture, measureLines, collapsed: [] });
      expect(result.warnings.filter((warning) => warning.code === "route-obstructed")).toEqual([]);
      expect(scene.edges.map((edge) => edge.occurrence).sort()).toEqual(fixture.relations.map((relation) => relation.occurrence).sort());
      expect(scene.labels.map((label) => label.occurrence).sort()).toEqual(fixture.relations.map((relation) => relation.occurrence).sort());
      for (const relation of fixture.relations) expect(endsOf(result, relation.occurrence)).toEqual(relation.ends);
      expectAttached(result, scene);
    });

    it(`should paint both zone frames under the connectors and every card above them ${name}`, () => {
      const fixture = nestedZoneFixture({ outside });
      const input = { ...fixture, measureLines, collapsed: [] };
      const { scene } = drawn(input);
      expect(sceneNodesOnPlane(scene.nodes, "frame").map((node) => node.occurrence)).toEqual(fixture.zones);
      expect(sceneNodesOnPlane(scene.nodes, "box").map((node) => node.occurrence).sort()).toEqual([...fixture.cards].sort());
      // The defect: every route of the nested classes lies inside the opaque
      // surface of the zone that holds them, so a zone painted after the
      // connectors hides it from end to end.
      const ontology = scene.nodes.find((node) => node.occurrence === fixture.zones[1])!.rect;
      const inside = scene.edges.filter((edge) => edge.points.every((point) => point.x > ontology.x && point.x < ontology.x + ontology.width
        && point.y > ontology.y && point.y < ontology.y + ontology.height));
      expect(inside.length).toBe(outside ? fixture.relations.length - 1 : fixture.relations.length);

      const { svg } = renderSceneSvg(input);
      const order = svgOrder(svg);
      expect(order.edges).toBe(fixture.relations.length);
      for (const zone of fixture.zones) expect(order.nodes.get(zone)!, `${zone} frame under the connectors`).toBeLessThan(order.firstEdge);
      for (const card of fixture.cards) expect(order.nodes.get(card)!, `${card} above the connectors`).toBeGreaterThan(order.lastEdge);
    });
  }

  it("should keep a collapsed zone on the box plane, above the connectors that reach it", () => {
    const fixture = nestedZoneFixture({ outside: true });
    const input = { ...fixture, measureLines, collapsed: [fixture.zones[1]!] };
    const { result, scene } = drawn(input);
    const ontology = scene.nodes.find((node) => node.occurrence === fixture.zones[1])!;
    expect(ontology.collapsed).toBe(true);
    expect(scenePaintPlane(ontology)).toBe("box");
    expect(sceneNodesOnPlane(scene.nodes, "frame").map((node) => node.occurrence)).toEqual([fixture.zones[0]]);
    // The only relation left joins the collapsed ontology to the outside card.
    expect(scene.edges).toHaveLength(1);
    expect([...endsOf(result, scene.edges[0]!.occurrence)].sort()).toEqual([fixture.cards[fixture.cards.length - 1]!, fixture.zones[1]!].sort());
    expectAttached(result, scene);
    const order = svgOrder(renderSceneSvg(input).svg);
    expect(order.nodes.get(fixture.zones[0]!)!).toBeLessThan(order.firstEdge);
    expect(order.nodes.get(fixture.zones[1]!)!).toBeGreaterThan(order.lastEdge);
  });
});

/** Length of a route inside a rectangle (axis-aligned segments, as the router emits them). */
function lengthInside(points: readonly Vec2[], rect: Rect): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]!, b = points[i]!;
    const x = Math.min(Math.max(a.x, b.x), rect.x + rect.width) - Math.max(Math.min(a.x, b.x), rect.x);
    const y = Math.min(Math.max(a.y, b.y), rect.y + rect.height) - Math.max(Math.min(a.y, b.y), rect.y);
    if (x >= 0 && y >= 0) total += Math.max(x, y);
  }
  return total;
}

describe("connector mask over zone footers", () => {
  it("should cut the footer text of both nested zones out of the connector layer", () => {
    const fixture = nestedZoneFixture();
    const input = { ...fixture, measureLines, collapsed: [] };
    const { result, scene } = drawn(input);
    expect(scene.connectorCutouts).toHaveLength(fixture.zones.length);
    const footers = new Map(result.measurements!.slots.filter((slot) => slot.role === "footer").map((slot) => [slot.occurrence as string, slot.layout]));
    fixture.zones.forEach((zone, index) => {
      const frame = scene.nodes.find((node) => node.occurrence === zone)!.rect;
      const cutout = scene.connectorCutouts[index]!;
      const footer = footers.get(zone)!;
      // Wider and taller than the measured footer line, and seated at the bottom of its own frame.
      expect(cutout.width).toBeGreaterThan(footer.width);
      expect(cutout.width).toBeLessThan(footer.width + 24);
      expect(cutout.height).toBeGreaterThan(footer.height);
      expect(cutout.x).toBeGreaterThan(frame.x);
      expect(cutout.y + cutout.height).toBeLessThanOrEqual(frame.y + frame.height);
      expect(cutout.y).toBeGreaterThan(frame.y + frame.height - 64);
      // No class relation of the fixture runs through a footer: nothing is hidden here.
      for (const edge of scene.edges) expect(lengthInside(edge.points, cutout), `${edge.occurrence} clear of ${zone} footer`).toBe(0);
    });
    const mask = sceneConnectorMask(scene)!;
    expect(mask.cutouts).toBe(scene.connectorCutouts);
    expect(mask.region).toEqual({ x: scene.bounds!.x - CONNECTOR_MASK_MARGIN, y: scene.bounds!.y - CONNECTOR_MASK_MARGIN,
      width: scene.bounds!.width + 2 * CONNECTOR_MASK_MARGIN, height: scene.bounds!.height + 2 * CONNECTOR_MASK_MARGIN });

    const { svg } = renderSceneSvg(input);
    expect(svg.match(/<rect data-scene-cutout=""/g)).toHaveLength(fixture.zones.length);
    const group = svg.indexOf('<g data-scene-connectors="" mask="url(#scene-connector-mask)">');
    expect(group).toBeGreaterThan(svg.indexOf('<mask id="scene-connector-mask" maskUnits="userSpaceOnUse"'));
    expect(group).toBeLessThan(svgOrder(svg).firstEdge);
  });

  for (const name of ["architecture", "ontology"] as const) {
    it(`should hide only the run of a route behind a footer text in ${name}/unfolded, never a whole connector`, () => {
      const { scene } = drawn(hCondInput(name, false));
      // These scenes route connectors through zone footers: painted above the
      // frame without a mask, a line would strike through the footer text.
      const crossing = scene.edges.filter((edge) => scene.connectorCutouts.some((cutout) => lengthInside(edge.points, cutout) > 0));
      expect(crossing.length).toBeGreaterThan(0);
      for (const edge of scene.edges) {
        const length = edge.points.slice(1).reduce((sum, point, i) => sum + Math.hypot(point.x - edge.points[i]!.x, point.y - edge.points[i]!.y), 0);
        const hidden = scene.connectorCutouts.reduce((sum, cutout) => sum + lengthInside(edge.points, cutout), 0);
        expect(hidden, `${edge.occurrence} stays mostly painted`).toBeLessThan(length / 2);
      }
    });
  }

  it("should need no mask for a scene without a zone footer", () => {
    const source = flowFixture(3, { labels: true, folded: true, reverse: true });
    const input = { document: source.document, presentation: source.presentation, registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings, measureLines, collapsed: [], flows: { fanOutMax: 4 } };
    const { scene } = drawn(input);
    expect(sceneNodesOnPlane(scene.nodes, "frame")).toHaveLength(1);
    expect(scene.connectorCutouts).toEqual([]);
    expect(sceneConnectorMask(scene)).toBeUndefined();
    const { svg } = renderSceneSvg(input);
    expect(svg).not.toContain("<mask");
    expect(svg).toContain('<g data-scene-connectors="">');
  });
});

describe("connector attachment across profiles", () => {
  for (const name of ["architecture", "ontology"] as const) for (const folded of [false, true]) {
    it(`should attach every generic@2 connector of ${name}/${folded ? "folded" : "unfolded"} to its two boxes`, () => {
      const { result, scene } = drawn(hCondInput(name, folded));
      expect(scene.edges.length).toBeGreaterThan(0);
      expectAttached(result, scene);
    });
  }

  for (const count of [3, 6]) {
    it(`should attach every numbered flow connector with ${count} steps to its two boxes`, () => {
      const source = flowFixture(count, { labels: true, folded: true, reverse: true });
      const { result, scene } = drawn({ document: source.document, presentation: source.presentation, registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings, measureLines, collapsed: [], flows: { fanOutMax: 4 } });
      expect(scene.edges.length).toBeGreaterThan(0);
      expectAttached(result, scene);
    });
  }

  it("should attach every erd@1 relationship to the two entity cards it joins", () => {
    const field = (name: string, pk = false, fk: { class: string; field: string } | null = null) => ({ name, type: "uuid", pk, fk, nullable: false });
    const source = convertEngramErdScene({ id: "library", container: "library", classes: [
      { name: "author", fields: [field("authorId", true), field("name")] },
      { name: "book", fields: [field("bookId", true), field("authorId", false, { class: "author", field: "authorId" }), field("title")] },
      { name: "loan", fields: [field("loanId", true), field("bookId", false, { class: "book", field: "bookId" })] },
    ], relations: [
      { name: "writtenBy", roleLabel: "written by", from: { class: "book", cardinality: "0..n" }, to: { class: "author", cardinality: "1" } },
      { name: "loanOf", roleLabel: "loan of", from: { class: "loan", cardinality: "0..n" }, to: { class: "book", cardinality: "1" } },
    ] });
    const { result, scene } = drawn({ document: source.document, view: source.view, presentation: source.presentation,
      registry: m3ProfileRegistry, bindings: shippedExecutorBindings, measureLines, collapsed: [] });
    expect(scene.nodes.every((node) => node.kind === "erd")).toBe(true);
    // erd@1 has no zone: every node is an atomic box, above the connectors.
    expect(sceneNodesOnPlane(scene.nodes, "frame")).toEqual([]);
    expect(scene.edges).toHaveLength(2);
    expect(scene.edges.every((edge) => edge.markers !== undefined)).toBe(true);
    expectAttached(result, scene);
  });
});

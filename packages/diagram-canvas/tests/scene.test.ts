/**
 * The scene frame: resolved geometry, port anchors, relation routes, paint order,
 * conservation, and a revision that moves for a geometry change and not for a
 * camera change.
 */
import { describe, expect, it } from "vitest";

import {
  DEFAULT_PORT_SIZE,
  UnknownViewError,
  buildScene,
  comparePaintOrder,
  portAnchorPoint,
  sceneEdges,
  sceneItemOf,
  sceneNodes,
  sceneOccurrenceCount,
  scenePorts,
  type SceneEdge,
  type SceneNode,
  type ScenePort,
} from "../src/scene.js";
import { createState, viewRef } from "@sentropic/diagram-core";
import {
  ENTITY_A,
  OCC_A,
  OCC_B,
  OCC_C,
  OCC_E1,
  OCC_E2,
  OCC_PA,
  OCC_PB,
  VIEW,
  occurrenceCount,
  sampleDocument,
  sampleState,
  sampleView,
} from "./fixtures.js";

const frameOf = (overrides: Parameters<typeof sampleView>[0] = {}) => buildScene(sampleState(overrides), VIEW);

describe("the frame's identity and provenance", () => {
  const frame = frameOf();

  it("names the view, the document and both revisions", () => {
    expect(frame.view).toBe(VIEW);
    expect(frame.semanticDocument).toBe("document:d1");
    expect(frame.documentRevision).toBe(3);
    expect(frame.viewRevision).toBe(3);
  });

  it("carries the occurrence -> semantic reference on every item (invariant 7)", () => {
    for (const item of frame.items) {
      expect(item.occurrence.startsWith("occurrence:")).toBe(true);
      const semantic = item.kind === "node" ? item.entity : item.kind === "edge" ? item.relation : item.port;
      expect(semantic.includes(":")).toBe(true);
    }
    expect((sceneItemOf(frame, OCC_A) as SceneNode).entity).toBe(ENTITY_A);
    expect(sceneItemOf(frame, "occurrence:absent" as typeof OCC_A)).toBeUndefined();
  });

  it("throws on a view the state does not hold, rather than returning an empty scene", () => {
    // An empty frame would be indistinguishable from a legitimately empty view,
    // so a missing view refuses loudly and names itself. Both call shapes are
    // covered: an unknown reference, and a state holding no view at all.
    expect(() => buildScene(sampleState(), viewRef("nope"))).toThrow(UnknownViewError);
    expect(() => buildScene(sampleState(), viewRef("nope"))).toThrow(/view:nope/);
    expect(() => buildScene(createState(sampleDocument(), []), VIEW)).toThrow(UnknownViewError);
  });
});

describe("conservation: every occurrence is placed or reported, exactly once", () => {
  it("holds with no filters", () => {
    const frame = frameOf();
    expect(sceneOccurrenceCount(frame)).toBe(occurrenceCount(sampleView()));
    expect(frame.exclusions).toEqual([]);
    expect(frame.items).toHaveLength(7);
  });

  it("holds under the hardest cascade, where most of the view is gone", () => {
    const frame = frameOf({
      filters: [{ id: "f1", kind: "entity-type", types: ["container"], mode: "include" }],
      collapseGroup: true,
    });
    expect(sceneOccurrenceCount(frame)).toBe(occurrenceCount(sampleView()));
    // Not vacuous the other way either: something IS still drawn.
    expect(frame.items.length).toBeGreaterThan(0);
    expect(new Set(frame.items.map((item) => item.occurrence)).size).toBe(frame.items.length);
  });
});

describe("resolved node geometry", () => {
  it("normalises a persisted negative extent instead of producing an empty span", () => {
    const view = sampleView();
    const state = createState(sampleDocument(), [
      {
        ...view,
        entityOccurrences: {
          ...view.entityOccurrences,
          [OCC_B]: { ...view.entityOccurrences[OCC_B]!, geometry: { x: 140, y: 20, width: -40, height: -20 } },
        },
      },
    ]);
    const node = sceneItemOf(buildScene(state, VIEW), OCC_B) as SceneNode;
    expect(node.rect).toEqual({ x: 100, y: 0, width: 40, height: 20 });
  });

  it("excludes a non-finite rectangle AND emits diagram-core's value-not-finite code", () => {
    const view = sampleView();
    const state = createState(sampleDocument(), [
      {
        ...view,
        entityOccurrences: {
          ...view.entityOccurrences,
          [OCC_B]: { ...view.entityOccurrences[OCC_B]!, geometry: { x: 0, y: 0, width: Number.NaN, height: 10 } },
        },
      },
    ]);
    const frame = buildScene(state, VIEW);
    expect(frame.exclusions).toContainEqual({ occurrence: OCC_B, kind: "entity", reason: "geometry-not-finite" });
    expect(frame.diagnostics.map((entry) => entry.code)).toContain("value-not-finite");
    // The cascade follows: B's port and the two links that reach it go too.
    expect(frame.exclusions.find((entry) => entry.occurrence === OCC_PB)?.reason).toBe("owner-hidden");
    expect(sceneOccurrenceCount(frame)).toBe(occurrenceCount(view));
  });
});

describe("port anchors, resolved from the owner rectangle", () => {
  const frame = frameOf();

  it("places the two fixture ports where the rectangles say", () => {
    const pa = sceneItemOf(frame, OCC_PA) as ScenePort;
    const pb = sceneItemOf(frame, OCC_PB) as ScenePort;
    // A is (0,0) 40x20, east side at anchor 0.5 -> (40, 10).
    expect(pa.anchorPoint).toEqual({ x: 40, y: 10 });
    // B is (100,0) 40x20, west side at anchor 0.5 -> (100, 10).
    expect(pb.anchorPoint).toEqual({ x: 100, y: 10 });
    expect(pa.rect).toEqual({ x: 40 - DEFAULT_PORT_SIZE / 2, y: 10 - DEFAULT_PORT_SIZE / 2, width: 8, height: 8 });
  });

  it("reads anchor 0 from the west end on north/south and from the north end on east/west", () => {
    const rect = { x: 10, y: 20, width: 100, height: 40 };
    expect(portAnchorPoint(rect, "north", 0)).toEqual({ x: 10, y: 20 });
    expect(portAnchorPoint(rect, "north", 1)).toEqual({ x: 110, y: 20 });
    expect(portAnchorPoint(rect, "south", 0.25)).toEqual({ x: 35, y: 60 });
    expect(portAnchorPoint(rect, "west", 0)).toEqual({ x: 10, y: 20 });
    expect(portAnchorPoint(rect, "east", 1)).toEqual({ x: 110, y: 60 });
  });

  it("clamps an out-of-range anchor onto the side rather than off the shape", () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };
    expect(portAnchorPoint(rect, "north", -3)).toEqual({ x: 0, y: 0 });
    expect(portAnchorPoint(rect, "north", 4)).toEqual({ x: 10, y: 0 });
  });

  it("inherits the owner's plane, so a port never paints under its own shape", () => {
    const pa = sceneItemOf(frame, OCC_PA) as ScenePort;
    const a = sceneItemOf(frame, OCC_A) as SceneNode;
    expect(pa.z).toBe(a.z);
    expect(frame.items.indexOf(pa)).toBeGreaterThan(frame.items.indexOf(a));
  });
});

describe("relation routes", () => {
  const frame = frameOf();

  it("runs a port-to-port link between the two port anchors", () => {
    const e1 = sceneItemOf(frame, OCC_E1) as SceneEdge;
    expect(e1.path).toEqual([{ x: 40, y: 10 }, { x: 100, y: 10 }]);
    expect(e1.bounds).toEqual({ x: 40, y: 10, width: 60, height: 0 });
  });

  it("runs an entity-to-entity link between rectangle centres, through its waypoint", () => {
    const e2 = sceneItemOf(frame, OCC_E2) as SceneEdge;
    expect(e2.path).toEqual([{ x: 20, y: 10 }, { x: 70, y: -40 }, { x: 120, y: 10 }]);
    expect(e2.bounds).toEqual({ x: 20, y: -40, width: 100, height: 50 });
  });

  it("visits the endpoints in role order, not in array order", () => {
    const view = sampleView();
    const reversed = {
      ...view,
      relationOccurrences: {
        ...view.relationOccurrences,
        [OCC_E1]: {
          ...view.relationOccurrences[OCC_E1]!,
          // The same two endpoints, written the other way round.
          endpoints: [
            { role: "target", occurrence: OCC_PB },
            { role: "source", occurrence: OCC_PA },
          ],
        },
      },
    };
    const swapped = buildScene(createState(sampleDocument(), [reversed]), VIEW);
    expect((sceneItemOf(swapped, OCC_E1) as SceneEdge).path).toEqual(
      (sceneItemOf(frame, OCC_E1) as SceneEdge).path,
    );
    // And the whole frame is byte-identical, which is the point of the rule.
    expect(swapped.sceneRevision).toBe(frame.sceneRevision);
  });

  it("drops a non-finite waypoint from the route and reports it", () => {
    const view = sampleView();
    const state = createState(sampleDocument(), [
      {
        ...view,
        relationOccurrences: {
          ...view.relationOccurrences,
          [OCC_E2]: {
            ...view.relationOccurrences[OCC_E2]!,
            waypoints: [{ x: 70, y: Number.POSITIVE_INFINITY }],
          },
        },
      },
    ]);
    const built = buildScene(state, VIEW);
    const e2 = sceneItemOf(built, OCC_E2) as SceneEdge;
    expect(e2.path).toEqual([{ x: 20, y: 10 }, { x: 120, y: 10 }]);
    expect(built.diagnostics.some((entry) => entry.path.endsWith(".waypoints"))).toBe(true);
    // Reported, not silently ignored: the edge is still drawn, so it must not
    // also appear as an exclusion.
    expect(built.exclusions.some((entry) => entry.occurrence === OCC_E2)).toBe(false);
  });
});

describe("paint order", () => {
  const frame = frameOf();

  it("is a total order with no ties left", () => {
    for (let index = 1; index < frame.items.length; index += 1) {
      expect(comparePaintOrder(frame.items[index - 1]!, frame.items[index]!)).toBeLessThan(0);
    }
  });

  it("puts the z = -1 container under everything and the z = 1 node above its neighbour", () => {
    const order = frame.items.map((item) => item.occurrence);
    expect(order.indexOf(OCC_C)).toBe(0);
    expect(order.indexOf(OCC_A)).toBeGreaterThan(order.indexOf(OCC_B));
  });

  it("puts an edge in the lowest plane of the occurrences it joins", () => {
    // e2 joins A (z = 1) and B (z = 0): its plane is 0, so it paints under A.
    const e2 = sceneItemOf(frame, OCC_E2) as SceneEdge;
    expect(e2.z).toBe(0);
    expect(frame.items.indexOf(e2)).toBeLessThan(frame.items.indexOf(sceneItemOf(frame, OCC_A)!));
  });

  it("separates the three kinds within one plane: edge, then node, then port", () => {
    const plane = frame.items.filter((item) => item.z === 0);
    const kinds = plane.map((item) => item.kind);
    expect(kinds.indexOf("edge")).toBeLessThan(kinds.indexOf("node"));
  });

  it("splits the frame into the three kinds without losing an item", () => {
    expect(sceneNodes(frame)).toHaveLength(3);
    expect(scenePorts(frame)).toHaveLength(2);
    expect(sceneEdges(frame)).toHaveLength(2);
    expect(sceneNodes(frame).length + scenePorts(frame).length + sceneEdges(frame).length).toBe(frame.items.length);
  });
});

describe("bounds", () => {
  it("covers every item, including a waypoint outside every rectangle", () => {
    const frame = frameOf();
    // The waypoint at y = -40 is above every rectangle, so the bounds must reach it.
    expect(frame.bounds).toEqual({ x: 0, y: -40, width: 200, height: 140 });
  });

  it("is absent for an empty scene, rather than a zero rectangle at the origin", () => {
    const view = sampleView();
    const emptied = { ...view, entityOccurrences: {}, portOccurrences: {}, relationOccurrences: {} };
    const frame = buildScene(createState(sampleDocument(), [emptied]), VIEW);
    expect(frame.items).toEqual([]);
    expect(frame.bounds).toBeUndefined();
    expect(sceneOccurrenceCount(frame)).toBe(0);
  });
});

describe("sceneRevision", () => {
  it("does not move when only the camera moves - the reason the frame holds none", () => {
    const view = sampleView();
    const panned = { ...view, presentation: { camera: { x: 900, y: -50, zoom: 4.5 } } };
    expect(buildScene(createState(sampleDocument(), [panned]), VIEW).sceneRevision).toBe(
      buildScene(createState(sampleDocument(), [view]), VIEW).sceneRevision,
    );
  });

  it("moves when one coordinate moves by one unit", () => {
    const view = sampleView();
    const nudged = {
      ...view,
      entityOccurrences: {
        ...view.entityOccurrences,
        [OCC_B]: {
          ...view.entityOccurrences[OCC_B]!,
          geometry: { ...view.entityOccurrences[OCC_B]!.geometry, x: 101 },
        },
      },
    };
    expect(buildScene(createState(sampleDocument(), [nudged]), VIEW).sceneRevision).not.toBe(
      frameOf().sceneRevision,
    );
  });

  it("moves when a revision moves, so a renderer cannot reuse a stale frame", () => {
    const document = { ...sampleDocument(), revision: 4 };
    const view = { ...sampleView(), revision: 4 };
    expect(buildScene(createState(document, [view]), VIEW).sceneRevision).not.toBe(frameOf().sceneRevision);
  });

  it("is stable across two builds of the same input, byte for byte", () => {
    const first = frameOf();
    const second = frameOf();
    expect(second.sceneRevision).toBe(first.sceneRevision);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("is unchanged by the order the view's records were written in", () => {
    const view = sampleView();
    const reordered = {
      ...view,
      entityOccurrences: Object.fromEntries(Object.entries(view.entityOccurrences).reverse()),
    } as typeof view;
    expect(buildScene(createState(sampleDocument(), [reordered]), VIEW).sceneRevision).toBe(frameOf().sceneRevision);
  });
});

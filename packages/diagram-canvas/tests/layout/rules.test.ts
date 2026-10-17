/**
 * One fixture per rule, L-R1 to L-R11 (SPEC §10.5, AC-L8), asserted on the
 * GEOMETRY of the `ViewDocument` the engine returns — dock points, bend counts,
 * rectangles, label boxes, zoom — never on a snapshot alone. Every view is
 * validated by `diagram-core` inside `lay()`.
 */
import { VIEW_DOCUMENT_FIELDS, entityRef, occurrenceRef } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_LAYOUT_METRICS,
  bendCount,
  edgeLabelPlacement,
  rectsIntersect,
  type LayoutOptions,
  type Rect,
  type Vec2,
} from "../../src/index.js";
import {
  WIDE,
  buildDocument,
  centreOf,
  isOrthogonal,
  lay,
  measure,
  minimalBends,
  rectOf,
  routeCrossesInterior,
  routeOf,
  sharesSegment,
  sideOfPoint,
} from "./fixtures.js";

const first = (route: readonly Vec2[]) => route[0]!;
const last = (route: readonly Vec2[]) => route[route.length - 1]!;

describe("L-R1 — a lone edge docks at the centre of its side", () => {
  // c -> a -> b, left to right: every side carries exactly one edge.
  const document = buildDocument({ nodes: ["a", "b", "c"], links: [["r1", "a", "b"], ["r2", "c", "a"]] });
  const { view, fit } = lay(document, WIDE);

  it("lays the chain out left to right", () => {
    expect(fit.direction).toBe("left-to-right");
  });

  it("docks both ends of each edge at the exact centre of the side it uses", () => {
    for (const [relation, source, target] of [
      ["r1", "a", "b"],
      ["r2", "c", "a"],
    ] as const) {
      const route = routeOf(view, relation);
      const from = rectOf(view, source);
      const to = rectOf(view, target);
      expect(sideOfPoint(from, first(route))).toBe("east");
      expect(sideOfPoint(to, last(route))).toBe("west");
      expect(first(route)).toEqual({ x: from.x + from.width, y: centreOf(from).y });
      expect(last(route)).toEqual({ x: to.x, y: centreOf(to).y });
    }
  });
});

describe("L-R2 — edges sharing a side spread symmetrically about its centre", () => {
  // h has three edges on its east side, g has two.
  const document = buildDocument({
    nodes: ["h", "x", "y", "z", "g", "p", "q"],
    links: [
      ["h1", "h", "x"],
      ["h2", "h", "y"],
      ["h3", "h", "z"],
      ["g1", "g", "p"],
      ["g2", "g", "q"],
    ],
  });
  const { view } = lay(document, WIDE);

  const offsets = (node: string, relations: readonly string[]) => {
    const rect = rectOf(view, node);
    return relations
      .map((relation) => {
        const dock = first(routeOf(view, relation));
        expect(sideOfPoint(rect, dock)).toBe("east");
        return dock.y - centreOf(rect).y;
      })
      .sort((a, b) => a - b);
  };

  it("three ends: the middle one at the centre, the outer two at equal and opposite offsets", () => {
    const [low, middle, high] = offsets("h", ["h1", "h2", "h3"]) as [number, number, number];
    expect(middle).toBe(0);
    expect(low).toBeLessThan(0);
    expect(low + high).toBe(0);
    expect(middle - low).toBe(high - middle);
  });

  it("two ends: equal and opposite offsets, none at the centre", () => {
    const [low, high] = offsets("g", ["g1", "g2"]) as [number, number];
    expect(low).toBeLessThan(0);
    expect(low + high).toBe(0);
  });

  it("every slot stays on its side", () => {
    for (const relation of ["h1", "h2", "h3", "g1", "g2"]) {
      const rect = rectOf(view, relation.startsWith("h") ? "h" : "g");
      const dock = first(routeOf(view, relation));
      expect(dock.y).toBeGreaterThan(rect.y);
      expect(dock.y).toBeLessThan(rect.y + rect.height);
    }
  });
});

describe("L-R3 — once docked, the route has the fewest bends", () => {
  // A diamond (no obstacle between facing sides) plus a long edge a -> d that
  // must pass the middle rank, where b and c are obstacles.
  const document = buildDocument({
    nodes: ["a", "b", "c", "d"],
    links: [
      ["r1", "a", "b"],
      ["r2", "a", "c"],
      ["r3", "b", "d"],
      ["r4", "c", "d"],
      ["r5", "a", "d"],
    ],
  });
  const { view } = lay(document, WIDE);

  const ends: Readonly<Record<string, readonly [string, string]>> = {
    r1: ["a", "b"],
    r2: ["a", "c"],
    r3: ["b", "d"],
    r4: ["c", "d"],
    r5: ["a", "d"],
  };

  it("every route is orthogonal and has exactly the bends the independent oracle says are needed", () => {
    const obstacles = ["a", "b", "c", "d"].map((id) => rectOf(view, id));
    for (const [relation, [source, target]] of Object.entries(ends)) {
      const route = routeOf(view, relation);
      expect(isOrthogonal(route)).toBe(true);
      const needed = minimalBends(
        first(route),
        rectOf(view, source),
        last(route),
        rectOf(view, target),
        obstacles,
        DEFAULT_LAYOUT_METRICS.clearance,
      );
      expect(bendCount(route), relation).toBe(needed);
    }
  });

  it("the oracle is not constant: without the middle rank as obstacles it would allow the long edge fewer bends", () => {
    const route = routeOf(view, "r5");
    const withObstacles = minimalBends(first(route), rectOf(view, "a"), last(route), rectOf(view, "d"), ["a", "b", "c", "d"].map((id) => rectOf(view, id)), DEFAULT_LAYOUT_METRICS.clearance);
    const without = minimalBends(first(route), rectOf(view, "a"), last(route), rectOf(view, "d"), [], DEFAULT_LAYOUT_METRICS.clearance);
    expect(without).toBeLessThan(withObstacles);
  });

  it("where nothing stands between facing docks, that minimum is the obstacle-free one: 0 level, 2 otherwise", () => {
    for (const relation of ["r1", "r2", "r3", "r4"]) {
      const route = routeOf(view, relation);
      expect(bendCount(route)).toBe(first(route).y === last(route).y ? 0 : 2);
    }
  });

  it("the long edge goes round the middle rank instead of through it", () => {
    const route = routeOf(view, "r5");
    expect(routeCrossesInterior(route, rectOf(view, "b"))).toBe(false);
    expect(routeCrossesInterior(route, rectOf(view, "c"))).toBe(false);
  });

  it("a straight chain has no bend at all", () => {
    const chain = lay(buildDocument({ nodes: ["s", "t", "u"], links: [["c1", "s", "t"], ["c2", "t", "u"]] }), WIDE).view;
    expect(bendCount(routeOf(chain, "c1"))).toBe(0);
    expect(bendCount(routeOf(chain, "c2"))).toBe(0);
  });
});

describe("L-R4 — sibling containers in one row are top-aligned and stretched to the row height", () => {
  it("top to bottom: the containers of one rank share the rank's top and its height", () => {
    // Three unlinked containers: one rank, one row. k2 holds a two-node chain,
    // so top-to-bottom it is the tallest.
    const document = buildDocument({
      nodes: ["n1", "n2", "n3", "n4"],
      containers: { k1: ["n1"], k2: ["n2", "n3"], k3: ["n4"] },
      links: [["r1", "n2", "n3"]],
    });
    const { view, fit } = lay(document, 390);
    expect(fit.direction).toBe("top-to-bottom");
    const rows = ["k1", "k2", "k3"].map((id) => rectOf(view, id));
    const tallestNatural = rectOf(view, "k2").height;
    for (const rect of rows) {
      expect(rect.y).toBe(rows[0]!.y);
      expect(rect.height).toBe(tallestNatural);
    }
    // And the stretch is real: k1's own content (one node) is far shorter.
    const k1Content = rectOf(view, "n1");
    expect(k1Content.height + 2 * DEFAULT_LAYOUT_METRICS.containerPadding).toBeLessThan(rows[0]!.height);
  });

  it("left to right: linked containers side by side share a top and a height", () => {
    // a holds one node, b holds two stacked unlinked nodes: b is taller.
    const document = buildDocument({
      nodes: ["x", "y", "z"],
      containers: { a: ["x"], b: ["y", "z"] },
      links: [["r1", "x", "y"]],
    });
    const { view, fit } = lay(document, WIDE);
    expect(fit.direction).toBe("left-to-right");
    const a = rectOf(view, "a");
    const b = rectOf(view, "b");
    expect(a.x + a.width).toBeLessThan(b.x);
    expect(a.y).toBe(b.y);
    expect(a.height).toBe(b.height);
    // Content still inside its container after the stretch.
    for (const [inner, outer] of [
      ["x", a],
      ["y", b],
      ["z", b],
    ] as const) {
      const rect = rectOf(view, inner);
      expect(rect.y).toBeGreaterThanOrEqual(outer.y);
      expect(rect.y + rect.height).toBeLessThanOrEqual(outer.y + outer.height);
    }
  });
});

describe("L-R5 — flow direction from the graph and the target width", () => {
  // Four nodes with 10-character names: 104 px each at 8 px per character.
  const document = buildDocument({
    nodes: ["a", "b", "c", "d"],
    names: { a: "alpha-node", b: "bravo-node", c: "charlienod", d: "delta-node" },
    links: [["r1", "a", "b"], ["r2", "b", "c"], ["r3", "c", "d"]],
  });

  it("left to right when that drawing fits the target width at scale 1", () => {
    const { view, fit } = lay(document, 1000);
    expect(fit.direction).toBe("left-to-right");
    expect(fit.width).toBeLessThanOrEqual(1000);
    const xs = ["a", "b", "c", "d"].map((id) => rectOf(view, id).x);
    expect([...xs].sort((p, q) => p - q)).toEqual(xs);
    expect(new Set(["a", "b", "c", "d"].map((id) => centreOf(rectOf(view, id)).y)).size).toBe(1);
  });

  it("top to bottom when the left-to-right drawing is wider than the target", () => {
    const leftToRightWidth = lay(document, 1000).fit.width;
    const { view, fit } = lay(document, leftToRightWidth - 1);
    expect(leftToRightWidth - 1).toBeGreaterThan(390);
    expect(fit.direction).toBe("top-to-bottom");
    const ys = ["a", "b", "c", "d"].map((id) => rectOf(view, id).y);
    expect([...ys].sort((p, q) => p - q)).toEqual(ys);
    expect(new Set(["a", "b", "c", "d"].map((id) => centreOf(rectOf(view, id)).x)).size).toBe(1);
  });

  it("the boundary is inclusive: exactly the left-to-right width keeps left to right", () => {
    const leftToRightWidth = lay(document, 1000).fit.width;
    expect(lay(document, leftToRightWidth).fit.direction).toBe("left-to-right");
  });

  it("nothing in the options can force a direction", () => {
    // @ts-expect-error -- L-R5: the direction is not an input.
    const options: LayoutOptions = { direction: "left-to-right", registry: undefined!, measureText: measure, targetWidth: 1 };
    expect(options).toBeDefined();
  });
});

describe("L-R6 — rank by longest path, cycles broken on the greatest relation id, barycentre order", () => {
  it("rank is the longest path from a source", () => {
    const { view } = lay(buildDocument({ nodes: ["a", "b", "c"], links: [["r1", "a", "b"], ["r2", "b", "c"], ["r3", "a", "c"]] }), WIDE);
    expect(rectOf(view, "a").x).toBeLessThan(rectOf(view, "b").x);
    expect(rectOf(view, "b").x).toBeLessThan(rectOf(view, "c").x);
  });

  it("a cycle is broken by reversing the edge with the greatest relation id", () => {
    // x -> y (c1), y -> z (c3), z -> x (c2): c3 is reversed, so z is the source.
    const { view } = lay(
      buildDocument({ nodes: ["x", "y", "z"], links: [["c1", "x", "y"], ["c3", "y", "z"], ["c2", "z", "x"]] }),
      WIDE,
    );
    expect(rectOf(view, "z").x).toBeLessThan(rectOf(view, "x").x);
    expect(rectOf(view, "x").x).toBeLessThan(rectOf(view, "y").x);
    // Renaming so that z -> x carries the greatest id reverses that one instead.
    const renamed = lay(
      buildDocument({ nodes: ["x", "y", "z"], links: [["c1", "x", "y"], ["c2", "y", "z"], ["c3", "z", "x"]] }),
      WIDE,
    ).view;
    expect(rectOf(renamed, "x").x).toBeLessThan(rectOf(renamed, "y").x);
    expect(rectOf(renamed, "y").x).toBeLessThan(rectOf(renamed, "z").x);
  });

  it("barycentre sweeps remove a crossing that id order would make", () => {
    // Sources p < q; p -> v, q -> u. Id order in rank 1 (u, v) would cross.
    const { view } = lay(buildDocument({ nodes: ["p", "q", "u", "v"], links: [["r1", "p", "v"], ["r2", "q", "u"]] }), WIDE);
    expect(rectOf(view, "p").y).toBeLessThan(rectOf(view, "q").y);
    expect(rectOf(view, "v").y).toBeLessThan(rectOf(view, "u").y);
  });

  it("ties are broken by entity id", () => {
    const { view } = lay(buildDocument({ nodes: ["m2", "m1", "m3"], links: [] }), WIDE);
    expect(rectOf(view, "m1").y).toBeLessThan(rectOf(view, "m2").y);
    expect(rectOf(view, "m2").y).toBeLessThan(rectOf(view, "m3").y);
  });
});

describe("L-R7 — target width and phone fallback", () => {
  const fan = (count: number) =>
    buildDocument({
      nodes: ["root", ...Array.from({ length: count }, (_, index) => `leaf${index}`)],
      links: Array.from({ length: count }, (_, index) => [`r${index}`, "root", `leaf${index}`] as const),
    });

  it("from 320 to 390 px the drawing is top to bottom, even when left to right would fit", () => {
    const chain = buildDocument({ nodes: ["a", "b"], links: [["r1", "a", "b"]] });
    expect(lay(chain, WIDE).fit.width).toBeLessThan(320);
    for (const width of [320, 350, 390]) {
      const { view, fit } = lay(chain, width);
      expect(fit.phone).toBe(true);
      expect(fit.direction).toBe("top-to-bottom");
      expect(rectOf(view, "a").y + rectOf(view, "a").height).toBeLessThan(rectOf(view, "b").y);
    }
    expect(lay(chain, 391).fit.direction).toBe("left-to-right");
  });

  it("still too wide: scales down, no further than 0.75, then pans", () => {
    const { view, fit } = lay(fan(8), 320);
    expect(fit.direction).toBe("top-to-bottom");
    expect(fit.width).toBeGreaterThan(320 / 0.75);
    expect(fit.zoom).toBe(0.75);
    expect(view.presentation.camera.zoom).toBe(0.75);
    expect(fit.pans).toBe(true);
  });

  it("slightly too wide: scales down just enough, and does not pan", () => {
    const { view, fit } = lay(fan(4), 320);
    expect(fit.width).toBeGreaterThan(320);
    expect(fit.width * 0.75).toBeLessThanOrEqual(320);
    expect(fit.zoom).toBe(320 / fit.width);
    expect(view.presentation.camera.zoom).toBe(fit.zoom);
    expect(fit.pans).toBe(false);
    expect(fit.width * fit.zoom).toBeLessThanOrEqual(320);
  });

  it("the scaled drawing never exceeds the target unless the host is told to pan", () => {
    for (const count of [1, 2, 3, 4, 5, 6, 8, 12]) {
      for (const width of [320, 390]) {
        const { fit } = lay(fan(count), width);
        expect(fit.width * fit.zoom <= width || fit.pans).toBe(true);
        expect(fit.zoom).toBeGreaterThanOrEqual(0.75);
        expect(fit.zoom).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("L-R8 — an edge between containers crosses only its own ancestors", () => {
  // a1 sits in a1c, inside group a; b1 sits in group b; m holds m1 and lies on
  // the straight line between them, with n beside it.
  const document = buildDocument({
    nodes: ["a1", "b1", "m1", "n"],
    containers: { a: ["a1c"], a1c: ["a1"], b: ["b1"], m: ["m1"] },
    links: [
      ["r1", "a1", "m1"],
      ["r2", "m1", "b1"],
      ["r3", "a1", "b1"],
      ["r4", "a1", "n"],
      ["r5", "n", "b1"],
    ],
  });
  const { view, warnings } = lay(document, WIDE);
  const ancestors: Readonly<Record<string, readonly string[]>> = { a1: ["a1c", "a"], b1: ["b"], m1: ["m"], n: [] };
  const ends: Readonly<Record<string, readonly [string, string]>> = {
    r1: ["a1", "m1"],
    r2: ["m1", "b1"],
    r3: ["a1", "b1"],
    r4: ["a1", "n"],
    r5: ["n", "b1"],
  };
  const all = ["a1", "b1", "m1", "n", "a", "a1c", "b", "m"];

  it("no route enters a shape that is neither an end nor an ancestor of an end", () => {
    expect(warnings).toEqual([]);
    for (const [relation, [source, target]] of Object.entries(ends)) {
      const route = routeOf(view, relation);
      const allowed = new Set([source, target, ...ancestors[source]!, ...ancestors[target]!]);
      for (const shape of all) {
        if (allowed.has(shape)) continue;
        expect(routeCrossesInterior(route, rectOf(view, shape)), `${relation} through ${shape}`).toBe(false);
      }
    }
  });

  it("the long edge does leave its own containers: it crosses their boundaries", () => {
    const route = routeOf(view, "r3");
    const a = rectOf(view, "a");
    const b = rectOf(view, "b");
    const inside = (point: Vec2, rect: Rect) =>
      point.x > rect.x && point.x < rect.x + rect.width && point.y > rect.y && point.y < rect.y + rect.height;
    expect(inside(first(route), a)).toBe(true);
    expect(inside(last(route), b)).toBe(true);
    expect(routeCrossesInterior(route, rectOf(view, "m"))).toBe(false);
    expect(routeCrossesInterior(route, rectOf(view, "m1"))).toBe(false);
  });
});

describe("L-R9 — parallel edges take distinct slots and never share a segment", () => {
  // Three a -> b edges and one b -> a edge between the same two nodes.
  const document = buildDocument({
    nodes: ["a", "b"],
    links: [
      ["r1", "a", "b"],
      ["r2", "a", "b"],
      ["r3", "a", "b"],
      ["r4", "b", "a"],
    ],
  });
  const { view } = lay(document, WIDE);
  const relations = ["r1", "r2", "r3", "r4"];
  const routes = relations.map((relation) => routeOf(view, relation));
  const aEnd = (index: number) => (relations[index] === "r4" ? last(routes[index]!) : first(routes[index]!));
  const bEnd = (index: number) => (relations[index] === "r4" ? first(routes[index]!) : last(routes[index]!));

  it("distinct docking slots at both ends", () => {
    const keys = (points: readonly Vec2[]) => new Set(points.map((point) => `${point.x},${point.y}`));
    expect(keys(relations.map((_, index) => aEnd(index))).size).toBe(4);
    expect(keys(relations.map((_, index) => bEnd(index))).size).toBe(4);
  });

  it("the slots of each side spread symmetrically about its centre (L-R2)", () => {
    for (const [node, end] of [
      ["a", aEnd],
      ["b", bEnd],
    ] as const) {
      const centre = centreOf(rectOf(view, node)).y;
      const offsets = relations.map((_, index) => end(index).y - centre).sort((p, q) => p - q);
      expect(offsets[0]! + offsets[3]!).toBe(0);
      expect(offsets[1]! + offsets[2]!).toBe(0);
    }
  });

  it("no two of them share a segment", () => {
    for (let i = 0; i < routes.length; i += 1) {
      for (let j = i + 1; j < routes.length; j += 1) {
        expect(sharesSegment(routes[i]!, routes[j]!), `${relations[i]} / ${relations[j]}`).toBe(false);
      }
    }
  });
});

describe("L-R10 — a label sits centred on the longest segment and overlaps nothing", () => {
  const LONG = "a rather long edge label"; // 24 characters: 168 px, far more than the base gap
  const labelled = buildDocument({
    nodes: ["a", "b", "c", "d"],
    containers: { k: ["b"] },
    links: [
      ["r1", "a", "b", LONG],
      ["r2", "c", "d", "short"],
      ["r3", "a", "d", "third label"],
    ],
  });
  const plain = buildDocument({
    nodes: ["a", "b", "c", "d"],
    containers: { k: ["b"] },
    links: [
      ["r1", "a", "b"],
      ["r2", "c", "d"],
      ["r3", "a", "d"],
    ],
  });
  const { view, warnings } = lay(labelled, WIDE);
  const margin = DEFAULT_LAYOUT_METRICS.labelMargin;
  const labels = [
    ["r1", LONG],
    ["r2", "short"],
    ["r3", "third label"],
  ] as const;
  const boxes = labels.map(([relation, text]) => {
    const route = routeOf(view, relation);
    const size = measure(text, "edge-label");
    return { relation, route, size, placement: edgeLabelPlacement(route, size)! };
  });

  it("is centred on the longest segment of its route", () => {
    for (const { route, placement, size } of boxes) {
      const lengths = route.slice(1).map((point, index) => Math.abs(point.x - route[index]!.x) + Math.abs(point.y - route[index]!.y));
      expect(lengths[placement.segment]).toBe(Math.max(...lengths));
      const a = route[placement.segment]!;
      const b = route[placement.segment + 1]!;
      expect(placement.centre).toEqual({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      expect(placement.box.x + size.width / 2).toBe(placement.centre.x);
      expect(placement.box.y + size.height / 2).toBe(placement.centre.y);
    }
  });

  it("the router lengthened the segment until the label fits on it", () => {
    expect(warnings).toEqual([]);
    const { route, placement, size } = boxes[0]!;
    const a = route[placement.segment]!;
    const b = route[placement.segment + 1]!;
    expect(a.y).toBe(b.y);
    expect(Math.abs(b.x - a.x)).toBeGreaterThanOrEqual(size.width + 2 * margin);
    // The same graph without labels has a far shorter gap: the segment was lengthened.
    const unlabelled = lay(plain, WIDE).view;
    const gap = (v: typeof view) => rectOf(v, "k").x - (rectOf(v, "a").x + rectOf(v, "a").width);
    expect(gap(view)).toBeGreaterThan(gap(unlabelled));
    expect(gap(unlabelled)).toBeLessThan(size.width);
  });

  it("never overlaps a node, a container title or another label", () => {
    const titleHeight = measure("k", "container-title").height + 2 * DEFAULT_LAYOUT_METRICS.titlePaddingY;
    const k = rectOf(view, "k");
    const blockers: Rect[] = [
      ...["a", "b", "c", "d"].map((id) => rectOf(view, id)),
      { x: k.x, y: k.y, width: k.width, height: titleHeight },
    ];
    for (const { relation, placement } of boxes) {
      for (const blocker of blockers) expect(rectsIntersect(placement.box, blocker), relation).toBe(false);
    }
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        expect(rectsIntersect(boxes[i]!.placement.box, boxes[j]!.placement.box)).toBe(false);
      }
    }
  });
});

describe("L-R11 — no legend", () => {
  const document = buildDocument({
    nodes: ["a", "b", "c"],
    containers: { k: ["b", "c"] },
    links: [["r1", "a", "b", "uses"], ["r2", "b", "c"]],
  });
  const { view } = lay(document, WIDE);

  it("the view holds exactly the document's drawings and nothing that could be a legend", () => {
    expect(Object.keys(view).sort()).toEqual([...VIEW_DOCUMENT_FIELDS].sort());
    expect(Object.values(view.entityOccurrences).map((occurrence) => occurrence.entity).sort()).toEqual(
      ["a", "b", "c", "k"].map((id) => entityRef(id)).sort(),
    );
    expect(Object.keys(view.relationOccurrences).sort()).toEqual([occurrenceRef("r.r1"), occurrenceRef("r.r2")]);
    expect(view.portOccurrences).toEqual({});
    expect(view.groups).toEqual({});
    expect(view.filters).toEqual([]);
  });

  it("the options offer no legend switch", () => {
    // @ts-expect-error -- L-R11: generic@1 declares no kind a legend could explain.
    const options: LayoutOptions = { legend: true, registry: undefined!, measureText: measure, targetWidth: 1 };
    expect(options).toBeDefined();
  });
});

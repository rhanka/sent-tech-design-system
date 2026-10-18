/**
 * Amended §10.5 / AC-L8 edge cases (SPEC §10.5 L-R1–L-R11 as amended in
 * `fbc923b1`): one fixture per listed case, asserted on the geometry of the
 * `ViewDocument` the engine returns — never on warning absence alone. Every
 * view is validated by `diagram-core` inside `lay()`. Cases the existing
 * suites already pin (lone-edge centre, symmetric spread, narrower-wins, the
 * `x4` budget hand-off, no legend) are not repeated here.
 */
import { defaultProfileRegistry, entityRef, occurrenceRef, portRef, relationRef, serialiseView, type EntityRef } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  BARYCENTRE_SWEEPS,
  DEFAULT_LAYOUT_METRICS,
  ROW_FILL_ROUNDS,
  bendCount,
  chooseRankGap,
  diagnoseLabels,
  orderLevel,
  placeEdgeLabels,
  residualUnplaceable,
  routeEdges,
  sideToward,
  type Vec2,
} from "../../src/index.js";
import {
  buildDocument,
  centreOf,
  lay,
  measure,
  minimalBends,
  rectOf,
  routeOf,
  shuffled,
  sideOfPoint,
  type DocSpec,
} from "./fixtures.js";
const first = (route: readonly Vec2[]): Vec2 => route[0]!;
const last = (route: readonly Vec2[]): Vec2 => route[route.length - 1]!;

/** `diagnoseLabels` on the tests' measurer, or the refusal message. */
const diagnosed = (spec: Parameters<typeof buildDocument>[0], targetWidth: number) => {
  const document = buildDocument(spec);
  const laid = lay(document, targetWidth);
  const diagnosis = diagnoseLabels(document, { registry: defaultProfileRegistry, measureText: measure, targetWidth });
  if (diagnosis.status !== "diagnosed") throw new Error(`refused: ${JSON.stringify(diagnosis.refusals)}`);
  return { document, laid, diagnosis };
};

describe("L-R1 — side choice: separated pair, ancestor pair, self-loop", () => {
  it("a separated pair takes the flow side", () => {
    const { view } = lay(buildDocument({ nodes: ["a", "b"], links: [["r1", "a", "b"]] }), 4000);
    expect(sideOfPoint(rectOf(view, "a"), first(routeOf(view, "r1")))).toBe("east");
    expect(sideOfPoint(rectOf(view, "b"), last(routeOf(view, "r1")))).toBe("west");
  });

  it("an ancestor pair takes the inner entity's nearest wall, ties east first", () => {
    // `n` sits 16 px from the east, south and west walls of `k` (98-0 and
    // 146-130 against 16-0 and 96-80): the three-way tie resolves east.
    const { view } = lay(
      buildDocument({ nodes: ["n", "m"], containers: { k: ["n", "m"] }, links: [["r1", "k", "n"]] }),
      4000,
    );
    const route = routeOf(view, "r1");
    const k = rectOf(view, "k");
    const n = rectOf(view, "n");
    expect(sideOfPoint(k, first(route))).toBe("east");
    expect(sideOfPoint(n, last(route))).toBe("east");
    // The container end exits inward, the inner end outward.
    expect(first(route).x).toBe(k.x + k.width);
    expect(route[1]!.x).toBeLessThan(first(route).x);
    expect(last(route).x).toBe(n.x + n.width);
  });

  it("sideToward branches on separation, overlap and centre offset", () => {
    const self = { x: 0, y: 0, width: 10, height: 10 };
    // Separated on the flow axis: the flow side first.
    expect(sideToward(self, { x: 20, y: 0, width: 10, height: 10 }, "left-to-right")).toBe("east");
    expect(sideToward(self, { x: 0, y: 20, width: 10, height: 10 }, "top-to-bottom")).toBe("south");
    // Overlap along the flow, separated across: the cross side. Columns never
    // overlap along the flow (a rank gap separates them), so no drawing
    // reaches this branch end to end — a 4000-document fuzz found no
    // cross-side dock on overlapping rectangles — and the rule is pinned here.
    expect(sideToward(self, { x: 5, y: 20, width: 10, height: 10 }, "left-to-right")).toBe("south");
    // Overlap on both axes: the axis of the greater centre offset.
    expect(sideToward(self, { x: 2, y: 1, width: 10, height: 10 }, "left-to-right")).toBe("east");
    expect(sideToward(self, { x: 1, y: 2, width: 10, height: 10 }, "left-to-right")).toBe("south");
    // An exact offset tie goes horizontal, then by sign.
    expect(sideToward(self, { x: 3, y: 3, width: 10, height: 10 }, "left-to-right")).toBe("east");
    expect(sideToward(self, { x: -3, y: -3, width: 10, height: 10 }, "left-to-right")).toBe("west");
    expect(sideToward(self, { x: 0, y: 6, width: 10, height: 3 }, "top-to-bottom")).toBe("south");
  });
});

describe("L-R2 — slot order on an exact tie, port sharing, side growth", () => {
  it("an exact other-centre tie breaks by slot key", () => {
    // Two parallel edges: the other centre is identical, so `r1#source`
    // sorts before `r2#source`, and the same at the target end.
    const { view } = lay(buildDocument({ nodes: ["root", "x"], links: [["r1", "root", "x"], ["r2", "root", "x"]] }), 4000);
    const root = rectOf(view, "root");
    const r1 = routeOf(view, "r1");
    const r2 = routeOf(view, "r2");
    expect(first(r1).x).toBe(root.x + root.width);
    expect(first(r2).x).toBe(root.x + root.width);
    expect(first(r1).y).toBeLessThan(first(r2).y);
    expect(first(r1).y + first(r2).y).toBe(2 * centreOf(root).y);
    expect(last(r1).y).toBeLessThan(last(r2).y);
  });

  it("ends on one semantic port share a single slot, whatever the order", () => {
    const document = buildDocument({
      nodes: ["a", "b", "c"],
      ports: { pa: "a" },
      links: [["r1", "pa", "b"], ["r2", "pa", "c"]],
    });
    const { view } = lay(document, 4000);
    const ports = Object.values(view.portOccurrences);
    expect(ports.map((port) => port.port)).toEqual([portRef("pa")]);
    expect(ports[0]!.order).toBe(0);
    expect(ports[0]!.anchor).toBe(0.5);
    const a = rectOf(view, "a");
    const anchor = { x: a.x + a.width, y: a.y + a.height / 2 };
    expect(first(routeOf(view, "r1"))).toEqual(anchor);
    expect(first(routeOf(view, "r2"))).toEqual(anchor);
    // Insertion order never leaks: shuffled records lay out identically.
    const reference = serialiseView(view);
    expect(serialiseView(lay(shuffled(document, 7), 4000).view)).toBe(reference);
  });

  it("a node side too short for its slots grows to s(n+1) and keeps every slot on side", () => {
    const leaves = ["l0", "l1", "l2", "l3", "l4", "l5"];
    const { view, warnings } = lay(
      buildDocument({ nodes: ["a", ...leaves], links: leaves.map((leaf, index) => [`r${index}`, "a", leaf] as const) }),
      4000,
    );
    expect(warnings).toEqual([]);
    // Six slots at the default spacing: 12 * 7 = 84 past the 64 px side.
    const a = rectOf(view, "a");
    expect(a.height).toBe(84);
    const ys = leaves.map((leaf, index) => first(routeOf(view, `r${index}`)).y);
    expect(ys).toEqual([126, 138, 150, 162, 174, 186]);
    for (const y of ys) {
      expect(y).toBeGreaterThan(a.y);
      expect(y).toBeLessThan(a.y + a.height);
    }
  });
});

describe("L-R3 — the route tie-break between two equal-cost routes", () => {
  it("two mirror routes tie on cost; the frontier order picks the northern one", () => {
    // Hand-placed symmetric inputs: the straight line is blocked by `B`. The
    // construction mirrors exactly about `y = 0`, so passing over and passing
    // under tie on every cost the search sees. The A* frontier pops
    // increasing estimated total cost, then increasing (row, column, heading
    // east, south, west, north): at the decisive pop the northern state sorts
    // first, its goal push lands first, and the strict goal update keeps it.
    // (The search returns the northern 256 px route, not the shorter
    // bend-optimal one: only the bend count is optimal, per the rule.)
    const s = { x: -64, y: -16, width: 64, height: 32 };
    const t = { x: 200, y: -16, width: 64, height: 32 };
    const blocker = { x: 80, y: -20, width: 40, height: 40 };
    const outcome = routeEdges({
      rects: new Map([
        [entityRef("s"), s],
        [entityRef("t"), t],
        [entityRef("m"), blocker],
      ]),
      requests: [
        {
          id: relationRef("r9"),
          pairKey: "entity:s|entity:t",
          start: { x: 0, y: 0 },
          startExit: { x: 1, y: 0 },
          end: { x: 200, y: 0 },
          endExit: { x: -1, y: 0 },
          passable: new Set<EntityRef>(),
        },
      ],
      clearance: 8,
    });
    expect(outcome.obstructed).toEqual([]);
    const route = outcome.routes.get(relationRef("r9"))!;
    // The northern mirror won: no point dips below the axis.
    for (const point of route) expect(point.y).toBeLessThanOrEqual(0);
    expect(bendCount(route)).toBe(4);
    expect(minimalBends({ x: 0, y: 0 }, s, { x: 200, y: 0 }, t, [s, t, blocker], 8)).toBe(4);
    const length = route.slice(1).reduce((total, point, index) => total + Math.abs(point.x - route[index]!.x) + Math.abs(point.y - route[index]!.y), 0);
    expect(length).toBe(256);
  });
});

describe("L-R4 — row constitution and the 20-round bound", () => {
  it("top to bottom, one rank is one row: same start, stretched to the rank extent", () => {
    // A six-link chain is far wider left-to-right than the container row is
    // top-to-bottom; the two unlinked containers share one rank and form one
    // row across it, the shorter stretched to the rank extent.
    const document = buildDocument({
      nodes: ["c1", "c2", "c3", "c4", "c5", "c6", "a", "b", "c"],
      containers: { k1: ["a"], k2: ["b", "c"] },
      links: [["r1", "c1", "c2"], ["r2", "c2", "c3"], ["r3", "c3", "c4"], ["r4", "c4", "c5"], ["r5", "c5", "c6"]],
    });
    const { view, fit } = lay(document, 320);
    expect(fit.direction).toBe("top-to-bottom");
    const k1 = rectOf(view, "k1");
    const k2 = rectOf(view, "k2");
    expect(k1.y).toBe(k2.y);
    expect(k1.height).toBe(k2.height);
  });

  it("left to right, an overlap chain across three ranks is one row", () => {
    // `kB` (rank 0) links into tall `kA` (rank 1), which links on to `kD`
    // (rank 2): the three overlap pair by pair and share one cross start and
    // one cross size, the short pair stretched to the row.
    const document = buildDocument({
      nodes: ["aB", "a1", "a2", "a3", "a4", "a5", "dD"],
      containers: { kA: ["a1", "a2", "a3", "a4", "a5"], kB: ["aB"], kD: ["dD"] },
      links: [["r1", "aB", "a1"], ["r2", "a5", "dD"]],
    });
    const { view, warnings } = lay(document, 4000);
    expect(warnings).toEqual([]);
    const kA = rectOf(view, "kA");
    const kB = rectOf(view, "kB");
    const kD = rectOf(view, "kD");
    expect(kB.y).toBe(kA.y);
    expect(kD.y).toBe(kA.y);
    expect(kB.height).toBe(kA.height);
    expect(kD.height).toBe(kA.height);
  });

  it("alignment iterates to a fixed point within 20 rounds", () => {
    expect(ROW_FILL_ROUNDS).toBe(20);
  });
});

describe("L-R5/L-R7 — scale boundary, widened-width comparison, empty drawing", () => {
  const singleWide = () => buildDocument({ nodes: ["only"], names: { only: "n".repeat(57) }, links: [] });

  it("exactly B = W / 0.75 scales to 0.75 with no pan; just above it pans", () => {
    // One 57-character node is 480 px wide in both directions (the width tie
    // picks top-to-bottom): at W = 360, B = W / 0.75 exactly.
    const { view, fit } = lay(singleWide(), 360);
    expect(fit.direction).toBe("top-to-bottom");
    expect(fit.width).toBe(480);
    expect(fit.zoom).toBe(0.75);
    expect(view.presentation.camera.zoom).toBe(0.75);
    expect(fit.pans).toBe(false);
    const past = lay(singleWide(), 359).fit;
    expect(past.width).toBe(480);
    expect(past.zoom).toBe(0.75);
    expect(past.pans).toBe(true);
  });

  it("a drawing that fits before its labels is compared at its widened width", () => {
    // The 40-character label needs widening: the finalized left-to-right
    // drawing is 536 px however wide the target is, while the bare drawing
    // (the same geometry the first round starts from) is 304 px.
    const label = "L".repeat(40);
    const bare = buildDocument({ nodes: ["a", "b", "c"], links: [["r1", "a", "b"], ["r2", "b", "c"]] });
    const bareFit = lay(bare, 500).fit;
    expect(bareFit.direction).toBe("left-to-right");
    expect(bareFit.width).toBe(304);
    const labeled = buildDocument({ nodes: ["a", "b", "c"], links: [["r1", "a", "b", label], ["r2", "b", "c"]] });
    expect(lay(labeled, 8000).fit.width).toBe(536);
    // At 500 px the pre-label drawing fits but the finalized one does not,
    // and top-to-bottom does: the finalized width decides, not the first
    // round's.
    const { fit, warnings } = lay(labeled, 500);
    expect(warnings).toEqual([]);
    expect(fit.direction).toBe("top-to-bottom");
    expect(fit.width).toBeLessThanOrEqual(500);
    expect(fit.zoom).toBe(1);
  });

  it("an empty document is left-to-right at zoom 1 with no pan", () => {
    const { view, fit, warnings } = lay(buildDocument({ nodes: [], links: [] }), 1200);
    expect(warnings).toEqual([]);
    expect(fit.direction).toBe("left-to-right");
    expect(fit.width).toBe(0);
    expect(fit.height).toBe(0);
    expect(fit.zoom).toBe(1);
    expect(fit.pans).toBe(false);
    expect(Object.keys(view.entityOccurrences)).toEqual([]);
    expect(Object.keys(view.relationOccurrences)).toEqual([]);
  });
});

describe("L-R6 — self-loops, interleaved cycles, dummies, barycentre", () => {
  it("a self-loop takes no rank, makes no dummy and keeps its direction", () => {
    const order = orderLevel(["a", "b"], [
      { id: "r1", from: "a", to: "b" },
      { id: "r2", from: "b", to: "b" },
    ]);
    expect(order.rankOf.get("b")).toBe(1);
    expect([...order.dummies]).toEqual([]);
    expect([...order.reversed]).toEqual([]);
    const { view } = lay(buildDocument({ nodes: ["a", "b"], links: [["r1", "a", "b"], ["r2", "b", "b"]] }), 4000);
    const route = routeOf(view, "r2");
    expect(sideOfPoint(rectOf(view, "b"), first(route))).toBe("east");
    expect(sideOfPoint(rectOf(view, "b"), last(route))).toBe("north");
    const occurrence = view.relationOccurrences[occurrenceRef("r.r2")]!;
    expect(occurrence.endpoints.map((endpoint) => endpoint.role)).toEqual(["source", "target"]);
  });

  it("two interleaved cycles break in ascending relation id order", () => {
    // `r2` closes the a-b cycle after `r1`, `r4` closes the b-c cycle after
    // `r3`: each reversed id is the greatest on its cycle.
    const order = orderLevel(["a", "b", "c"], [
      { id: "r1", from: "a", to: "b" },
      { id: "r2", from: "b", to: "a" },
      { id: "r3", from: "b", to: "c" },
      { id: "r4", from: "c", to: "b" },
    ]);
    expect([...order.reversed].sort()).toEqual(["r2", "r4"]);
    expect(order.ranks).toEqual([["a"], ["b"], ["c"]]);
    expect(order.crossings).toBe(0);
  });

  it("a long edge gets one dummy per intermediate rank, sorting after entities", () => {
    const order = orderLevel(["a", "b", "c", "e"], [
      { id: "r1", from: "a", to: "b" },
      { id: "r2", from: "b", to: "c" },
      { id: "r3", from: "c", to: "e" },
      { id: "r9", from: "a", to: "e" },
    ]);
    expect([...order.dummies].sort()).toEqual(["~r9~1", "~r9~2"]);
    expect(order.rankOf.get("~r9~1")).toBe(1);
    expect(order.rankOf.get("~r9~2")).toBe(2);
    expect(order.ranks).toEqual([["a"], ["b", "~r9~1"], ["c", "~r9~2"], ["e"]]);
  });

  it("barycentre sorts by weight, ties by key, from a key-sorted start, at most 24 sweeps", () => {
    expect(BARYCENTRE_SWEEPS).toBe(24);
    // `p` follows `v` (position 1), `q` follows `u` (position 0): weight
    // overrules the `p < q` key order.
    expect(
      orderLevel(["p", "q", "u", "v"], [
        { id: "a", from: "u", to: "q" },
        { id: "b", from: "v", to: "p" },
      ]).ranks,
    ).toEqual([["u", "v"], ["q", "p"]]);
    // Equal weights fall back to the key.
    expect(
      orderLevel(["m", "x", "y"], [
        { id: "r1", from: "m", to: "x" },
        { id: "r2", from: "m", to: "y" },
      ]).ranks,
    ).toEqual([["m"], ["x", "y"]]);
    // Members given unsorted with nothing to sweep still start sorted: with
    // zero crossings no sweep runs, so the order is the initial one.
    expect(orderLevel(["y", "x", "m"], []).ranks).toEqual([["m", "x", "y"]]);
  });
});

describe("L-R10 — segment order, contested segment, canonical gap", () => {
  it("two segments of equal length: the ascending segment index wins", () => {
    // Both 100 px segments hold the 90 px label; the decreasing-length order
    // ties, and the source-side segment, index 0, takes it. (End to end, an
    // exact tie needs a symmetric grid the placement never promises, and a
    // container body never blocks: only nodes and title bands do.)
    const route = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];
    const choices = placeEdgeLabels(
      [
        { id: relationRef("r1"), route, size: { width: 90, height: 16 } },
        { id: relationRef("r2"), route, size: { width: 90, height: 16 } },
      ],
      [],
      DEFAULT_LAYOUT_METRICS.labelMargin,
    );
    expect(choices.get(relationRef("r1"))!.segment).toBe(0);
    expect(choices.get(relationRef("r1"))!.centre).toEqual({ x: 50, y: 0 });
    expect(choices.get(relationRef("r2"))!.segment).toBe(1);
  });

  it("two labels competing for one segment: the ascending relation id wins", () => {
    const one = [{ x: 0, y: 0 }, { x: 200, y: 0 }];
    const entries = [
      { id: relationRef("r1"), route: one, size: { width: 100, height: 16 } },
      { id: relationRef("r2"), route: one, size: { width: 100, height: 16 } },
    ];
    const single = placeEdgeLabels(entries, [], DEFAULT_LAYOUT_METRICS.labelMargin);
    expect(single.get(relationRef("r1"))!.segment).toBe(0);
    expect(single.get(relationRef("r2"))).toBeUndefined();
    const two = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];
    const split = placeEdgeLabels(
      [
        { id: relationRef("r1"), route: two, size: { width: 90, height: 16 } },
        { id: relationRef("r2"), route: two, size: { width: 90, height: 16 } },
      ],
      [],
      DEFAULT_LAYOUT_METRICS.labelMargin,
    );
    expect(split.get(relationRef("r1"))!.segment).toBe(0);
    expect(split.get(relationRef("r2"))!.segment).toBe(1);
  });

  it("the canonical gap prefers nearness, then depth, then rank, keeping ties", () => {
    expect(chooseRankGap(undefined, { rank: 2, distance: 5, depth: 0 })).toEqual({ rank: 2, distance: 5, depth: 0 });
    const current = { rank: 1, distance: 3, depth: 0 };
    expect(chooseRankGap(current, { rank: 0, distance: 5, depth: 0 })).toBe(current);
    expect(chooseRankGap(current, { rank: 7, distance: 1, depth: 0 })).toEqual({ rank: 7, distance: 1, depth: 0 });
    expect(chooseRankGap(current, { rank: 0, distance: 3, depth: 1 })).toEqual({ rank: 0, distance: 3, depth: 1 });
    const deep = { rank: 2, distance: 3, depth: 1 };
    expect(chooseRankGap(deep, { rank: 0, distance: 3, depth: 1 })).toEqual({ rank: 0, distance: 3, depth: 1 });
    expect(chooseRankGap(deep, { rank: 9, distance: 3, depth: 1 })).toBe(deep);
    expect(chooseRankGap(deep, { ...deep })).toBe(deep);
  });
});

describe("L-R10 — one label-unplaced fixture per residual reason (a)–(e)", () => {
  // Every fixture below re-evaluates the residual predicate on the final
  // geometry: the warning carries `label-unplaced` with the relation as its
  // sole ref, and `residualUnplaceable` holds over the diagnosed segments.
  // Short terminal stubs systematically close with (a)/(b); the assertions
  // pin the determinative reason on the longest segment.
  const longestReasons = (spec: Parameters<typeof buildDocument>[0], id: string): readonly string[] => {
    const { laid, diagnosis } = diagnosed(spec, 8000);
    const outcome = diagnosis.outcomes.get(relationRef(id))!;
    expect(outcome.outcome).toBe("label-unplaced");
    const route = routeOf(laid.view, id);
    let longest = 0;
    let longestIndex = 0;
    route.slice(1).forEach((point, index) => {
      const length = Math.abs(point.x - route[index]!.x) + Math.abs(point.y - route[index]!.y);
      if (length > longest) {
        longest = length;
        longestIndex = index;
      }
    });
    return outcome.segments.find((segment) => segment.segment === longestIndex)!.reasons;
  };

  it("(a) a segment across the flow that is too short", () => {
    // The wall-crossing jog is vertical — across the left-to-right flow —
    // and shorter than the label: it is never lengthened.
    const spec: DocSpec = { nodes: ["n"], containers: { k: ["n"] }, links: [["r1", "k", "n", "LLLLL"]] };
    const { laid, diagnosis } = diagnosed(spec, 8000);
    expect(laid.warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([["label-unplaced", relationRef("r1")]]);
    expect(longestReasons(spec, "r1")).toContain("a");
    expect(residualUnplaceable(diagnosis.outcomes.get(relationRef("r1"))!.segments)).toBe(true);
  });

  it("(b) no rank gap crosses or holds the segment", () => {
    // A lone labeled self-loop: the longest segment's widening search finds
    // no rank gap at any containing level.
    const spec: DocSpec = { nodes: ["n1"], links: [["r1", "n1", "n1", "LLLL"]] };
    const { laid, diagnosis } = diagnosed(spec, 8000);
    expect(laid.warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([["label-unplaced", relationRef("r1")]]);
    const outcome = diagnosis.outcomes.get(relationRef("r1"))!;
    expect(longestReasons(spec, "r1")).toEqual(["b"]);
    expect(residualUnplaceable(outcome.segments)).toBe(true);
  });

  it("(c) a blocking shape spans the padded label on both sides", () => {
    const spec: DocSpec = {
      nodes: ["n0", "n1", "n2"],
      links: [["r0", "n0", "n1", "L".repeat(14)], ["r2", "n0", "n2", "L".repeat(20)], ["r4", "n0", "n0", "L".repeat(40)]],
    };
    const { laid, diagnosis } = diagnosed(spec, 8000);
    expect(laid.warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([["label-unplaced", relationRef("r4")]]);
    expect(longestReasons(spec, "r4")).toEqual(["c"]);
    expect(residualUnplaceable(diagnosis.outcomes.get(relationRef("r4"))!.segments)).toBe(true);
  });

  it("(d) the lane and the blocker share one member, so no sibling gap separates them", () => {
    const spec: DocSpec = {
      nodes: ["n0", "n1", "n2"],
      links: [
        ["r0", "n0", "n2", "L".repeat(28)],
        ["r1", "n0", "n2", "L".repeat(16)],
        ["r2", "n2", "n2", "L".repeat(9)],
        ["r3", "n1", "n1", "L".repeat(18)],
        ["r4", "n0", "n1", "L".repeat(32)],
      ],
    };
    const { laid, diagnosis } = diagnosed(spec, 8000);
    // `r2` and `r3` stay unplaced too, each under its own sole-ref warning;
    // the (d) case is `r1`, closed on every segment.
    const outcome = diagnosis.outcomes.get(relationRef("r1"))!;
    expect(outcome.outcome).toBe("label-unplaced");
    expect(outcome.segments.map((segment) => segment.reasons)).toEqual([["d"], ["d"], ["d"]]);
    for (const [id, other] of diagnosis.outcomes) {
      if (other.outcome === "label-unplaced") {
        expect(residualUnplaceable(other.segments), id).toBe(true);
        expect(laid.warnings.filter((warning) => warning.refs.includes(id))).toHaveLength(1);
      }
    }
  });

  it("(e) the required lengthening exceeds the cap beside a grown shape", () => {
    // `r4`'s 36-character label grows its ends' sides; the small `r2` label
    // riding beside that grown shape needs more than four times its
    // lengthening budget to clear it: the amount is rejected, not clamped.
    const spec: DocSpec = {
      nodes: ["n0", "n1", "n2"],
      links: [["r2", "n0", "n0", "LLLLLL"], ["r4", "n2", "n1", "L".repeat(36)], ["r5", "n0", "n0", "L".repeat(32)]],
    };
    const { laid, diagnosis } = diagnosed(spec, 8000);
    expect(
      laid.warnings.map((warning) => [warning.code, ...warning.refs]).sort(),
    ).toEqual(
      [["label-unplaced", relationRef("r2")], ["label-unplaced", relationRef("r5")], ["route-obstructed", relationRef("r5")]].sort(),
    );
    const outcome = diagnosis.outcomes.get(relationRef("r2"))!;
    expect(outcome.outcome).toBe("label-unplaced");
    expect(longestReasons(spec, "r2")).toEqual(["e"]);
    expect(residualUnplaceable(outcome.segments)).toBe(true);
    expect(residualUnplaceable(diagnosis.outcomes.get(relationRef("r5"))!.segments)).toBe(true);
  });
});

describe("L-R3/L-R8 — route-obstructed is an accepted exception, not a claim", () => {
  it("a second self-loop locked out of its pair's corridor falls back to the elbow", () => {
    // Two unlabeled self-loops on the same pair: `r1` is routed first and
    // occupies the corridor grid units, which L-R9 forbids to `r4`. The grid
    // holds no route for `r4`, so the engine draws the two-clearance-point
    // elbow and reports it under that code — the sole warning.
    const { view, warnings } = lay(buildDocument({ nodes: ["n0", "n1"], links: [["r1", "n0", "n0"], ["r4", "n0", "n0"]] }), 8000);
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([["route-obstructed", relationRef("r4")]]);
    const route = routeOf(view, "r4");
    expect(route).toEqual([{ x: 64, y: 24 }, { x: 38, y: 24 }, { x: 38, y: 0 }]);
    // The elbow leaves the east dock, turns once, and enters the north dock.
    expect(sideOfPoint(rectOf(view, "n0"), first(route))).toBe("east");
    expect(sideOfPoint(rectOf(view, "n0"), last(route))).toBe("north");
    expect(route[1]).toEqual({ x: last(route).x, y: first(route).y });
    // The first loop routes normally around the node.
    const firstRoute = routeOf(view, "r1");
    expect(firstRoute.length).toBeGreaterThan(3);
    expect(bendCount(firstRoute)).toBeGreaterThan(1);
  });
});

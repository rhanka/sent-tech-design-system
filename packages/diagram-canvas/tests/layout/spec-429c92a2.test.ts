/**
 * Third-spec-amendment regressions (`429c92a2`, §10.5, AC-L8).
 *
 * Each sol pass-3 scenario and each new AC-L8 fixture becomes a test that
 * fails on `90fedc2e` and passes after the fix. Every view is validated by
 * `diagram-core` inside `lay()`.
 */
import { entityRef, occurrenceRef, relationRef } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { bendCount, routeEdges } from "../../src/index.js";
import { DEFAULT_LAYOUT_METRICS } from "../../src/index.js";
import {
  buildDocument,
  isOrthogonal,
  lay,
  measure,
  rectOf,
  replayLabelBoxes,
  routeOf,
  sharesSegment,
} from "./fixtures.js";

describe("429c92a2 port ids — sol pass-3 finding 1 (blocking collision)", () => {
  // Nodes `a,b,c`, port `p` on `a`, port `p.r1.source` on `c`;
  // `r1:p→b`, `r2:p→b`, `r3:p.r1.source→b`. Before the injective encoding the
  // parallel end of `r1` and the shared occurrence of the second port both
  // took `occurrence:p.p.r1.source`, so `r3` was wired to `a` instead of `c`.
  it("keeps every port occurrence distinct and wires r3 to c", () => {
    const document = buildDocument({
      nodes: ["a", "b", "c"],
      ports: { p: "a", "p.r1.source": "c" },
      links: [["r1", "p", "b"], ["r2", "p", "b"], ["r3", "p.r1.source", "b"]],
    });
    const { view, warnings } = lay(document, 8000);
    // `r1` and `r2` share the entity dock on `b`, so their terminal joins
    // coincide: under the full-route rule `r2` (ascending id loses) is
    // `route-obstructed` — the only exit. The old router shared the segment
    // silently, and the old ids wired `r3` to `a`.
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["route-obstructed", relationRef("r2")],
    ]);
    // Three occurrences, pairwise distinct: the `p.s.`/`p.e.` prefixes and the
    // length fields keep the shared `p.r1.source` slot apart from `r1`'s
    // per-end occurrence. (`r3` is alone on its port, so it takes the shared
    // slot; `r1`/`r2` are parallel on `p`, so each takes a per-end slot.)
    const ids = Object.keys(view.portOccurrences).sort();
    expect(ids).toEqual(
      ["p.e.1.p.2.r1.source", "p.e.1.p.2.r2.source", "p.s.11.p.r1.source"]
        .map((id) => occurrenceRef(id))
        .sort(),
    );
    // `r3`'s source sits on the `c` port, owned by `c` — not `a`.
    const r3 = Object.values(view.relationOccurrences).find(
      (occurrence) => occurrence.relation === relationRef("r3"),
    )!;
    const source = r3.endpoints.find((endpoint) => endpoint.role === "source")!;
    expect(source.occurrence).toBe(occurrenceRef("p.s.11.p.r1.source"));
    const occurrence = view.portOccurrences[source.occurrence]!;
    expect(occurrence.port).toBe("port:p.r1.source");
    const owner = view.entityOccurrences[occurrence.ownerOccurrence]!;
    expect(owner.entity).toBe("entity:c");
    // `r1` and `r3` (distinct pairs) route cleanly and orthogonally.
    expect(isOrthogonal(routeOf(view, "r1"))).toBe(true);
    expect(isOrthogonal(routeOf(view, "r3"))).toBe(true);
  });
});

describe("429c92a2 lexicographic cost — a route beyond the old BEND threshold (sol pass-4 finding 3)", () => {
  // The previous version of this test passed with the old `BEND = 10^7`
  // scalar engine: `r1` detoured at `y=-8`, so `r2`'s corridor at `y=16`
  // carried no occupancy penalty and both routers agreed. Here `r1`'s ends
  // admit `c,d` as passable (their ancestor position), so its straight
  // corridor is allowed and `r1` occupies every unit of `r2`'s straight:
  // `r2`'s 0-bend straight is penalty-weighted to ~72M while an admissible
  // 4-bend detour weighs ~24M. The old scalar (`bends·10^7 + length`) picks
  // the detour (64M < 72M); the specified `(bends, length)` pair keeps the
  // straight route (0 bends < 4 bends). Both weighted costs are recomputed
  // below from the fixture geometry, never read from the engine.
  it("prefers fewer bends however long the weighted length", () => {
    const M = 1_000_000;
    const rects = new Map([
      [entityRef("a"), { x: 0, y: 0, width: 64, height: 32 }],
      [entityRef("b"), { x: 48 * M, y: 0, width: 64, height: 32 }],
      [entityRef("c"), { x: 10 * M, y: 0, width: 64, height: 32 }],
      [entityRef("d"), { x: 34 * M, y: 0, width: 64, height: 32 }],
    ]);
    const outcome = routeEdges({
      rects,
      clearance: 8,
      requests: [
        {
          id: relationRef("r1"),
          pairKey: `${entityRef("a")}|${entityRef("b")}`,
          start: { x: 64, y: 16 },
          startExit: { x: 1, y: 0 },
          end: { x: 48 * M, y: 16 },
          endExit: { x: -1, y: 0 },
          passable: new Set([entityRef("c"), entityRef("d")]),
        },
        {
          id: relationRef("r2"),
          pairKey: `${entityRef("c")}|${entityRef("d")}`,
          start: { x: 10 * M + 64, y: 16 },
          startExit: { x: 1, y: 0 },
          end: { x: 34 * M, y: 16 },
          endExit: { x: -1, y: 0 },
          passable: new Set(),
        },
      ],
    });
    expect(outcome.obstructed).toEqual([]);
    const r1 = outcome.routes.get(relationRef("r1"))!;
    const r2 = outcome.routes.get(relationRef("r2"))!;
    expect(isOrthogonal(r1)).toBe(true);
    expect(isOrthogonal(r2)).toBe(true);
    // `r1` runs straight through the admitted corridor, occupying it first.
    expect(bendCount(r1)).toBe(0);
    expect(r1).toEqual([{ x: 64, y: 16 }, { x: 48 * M, y: 16 }]);
    // The lexicographic router keeps `r2`'s straight corridor despite its
    // penalty weight; the old scalar detours.
    expect(bendCount(r2)).toBe(0);
    expect(r2).toEqual([{ x: 10 * M + 64, y: 16 }, { x: 34 * M, y: 16 }]);
    // Independently: clearance points are the docks pushed `8` along their
    // exits, so the straight grid run is `(10M+72,16) → (34M-8,16)`.
    const straightLen = 34 * M - 8 - (10 * M + 72);
    expect(straightLen).toBe(23_999_920);
    // Every unit of that run is used by `r1` (its straight covers
    // `x ∈ [72, 48M-8]` at `y=16`), so each costs three times its length.
    const weightedStraight = 3 * straightLen;
    expect(weightedStraight).toBe(71_999_760);
    // An admissible 4-bend detour leaves east, dips to the grown boundary
    // `y=-8`, runs it, and climbs back: two `24` verticals plus the same
    // horizontal, every unit free.
    const detourLen = 24 + straightLen + 24;
    const detourBends = 4;
    expect(detourLen).toBe(23_999_968);
    // The excess over a route with two more bends is past `2·10^7` (here four
    // more bends, past `4·10^7` a fortiori), and the old scalar flips:
    expect(weightedStraight - detourLen).toBeGreaterThan(2 * 10 ** 7);
    expect(0 * 10 ** 7 + weightedStraight).toBeGreaterThan(detourBends * 10 ** 7 + detourLen);
  });
});

describe("5da2d33a expected-fallback fixture — a,b:A→B c:A→D d:C→B at W=320 (sol pass-4 finding 5)", () => {
  it("routes a cleanly and reports the sole route-obstructed fallback for b", () => {
    const document = buildDocument({
      nodes: ["A", "B", "C", "D"],
      links: [["a", "A", "B"], ["b", "A", "B"], ["c", "A", "D"], ["d", "C", "B"]],
    });
    const { view, warnings } = lay(document, 320);
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["route-obstructed", relationRef("b")],
    ]);
    // `a` (ascending id wins the pair) routes cleanly and orthogonally.
    const a = routeOf(view, "a");
    expect(isOrthogonal(a)).toBe(true);
    // The obstructed elbow is the only exit; it carries no label claim.
    const b = routeOf(view, "b");
    expect(isOrthogonal(b)).toBe(true);
    // Same slot order at both ends: `a` docks above `b` on each side.
    expect(a[0]!.y).toBeLessThan(b[0]!.y);
    expect(a[a.length - 1]!.y).toBeLessThan(b[b.length - 1]!.y);
  });
});

describe("5da2d33a clean parallel pair — a,b:A→B c:A→C at W=320 (sol pass-4 finding 5)", () => {
  it("reports no warning and routes a and b exactly", () => {
    const document = buildDocument({
      nodes: ["A", "B", "C"],
      links: [["a", "A", "B"], ["b", "A", "B"], ["c", "A", "C"]],
    });
    const { view, warnings } = lay(document, 320);
    expect(warnings).toEqual([]);
    const a = routeOf(view, "a");
    const b = routeOf(view, "b");
    expect(isOrthogonal(a)).toBe(true);
    expect(isOrthogonal(b)).toBe(true);
    // Exact routes from AC-L8, up to floating-point placement noise: every
    // coordinate lands within a hair of the specified integer.
    const expectedA = [
      { x: 64, y: 35 },
      { x: 72, y: 35 },
      { x: 72, y: 12 },
      { x: 120, y: 12 },
    ];
    const expectedB = [
      { x: 64, y: 47 },
      { x: 92, y: 47 },
      { x: 92, y: 24 },
      { x: 120, y: 24 },
    ];
    expect(a).toHaveLength(expectedA.length);
    expect(b).toHaveLength(expectedB.length);
    for (const [got, want] of a.map((point, index) => [point, expectedA[index]!] as const)) {
      expect(Math.abs(got.x - want.x)).toBeLessThan(1e-9);
      expect(Math.abs(got.y - want.y)).toBeLessThan(1e-9);
    }
    for (const [got, want] of b.map((point, index) => [point, expectedB[index]!] as const)) {
      expect(Math.abs(got.x - want.x)).toBeLessThan(1e-9);
      expect(Math.abs(got.y - want.y)).toBeLessThan(1e-9);
    }
    // Same slot order at both ends, and no shared segment dock to dock.
    expect(a[0]!.y).toBeLessThan(b[0]!.y);
    expect(a[a.length - 1]!.y).toBeLessThan(b[b.length - 1]!.y);
    expect(sharesSegment(a, b)).toBe(false);
  });
});

describe("sol pass-4 finding 1 — a fallback reserves its units for the routes that follow", () => {
  // With the fixture metrics and measurer at `targetWidth=320`, `r1`
  // correctly takes the fallback, but the unfixed engine joins only
  // `pairFull` without reserving the fallback's units in `occupancy`: `r2`
  // then receives a 3-bend route mounting at `x=72` with no warning, while
  // the admissible 3-bend route mounting at `x=103.5` costs less (183
  // against 200 weighted). Reserving the fallback selects the best route.
  it("routes r2 at x=103.5 once r1's fallback holds the corridor", () => {
    const document = buildDocument({
      nodes: ["n0", "n2"],
      links: [
        ["r0", "n2", "n0", "LLLLLLLLL"],
        ["r1", "n0", "n2"],
        ["r2", "n2", "n2"],
        ["r4", "n2", "n2"],
        ["r7", "n2", "n2"],
      ],
    });
    const { view, warnings } = lay(document, 320);
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["route-obstructed", relationRef("r1")],
      ["route-obstructed", relationRef("r4")],
      ["route-obstructed", relationRef("r7")],
    ]);
    // `r1` holds the fallback elbow; `r2` takes the admissible route.
    expect(routeOf(view, "r1")).toEqual([
      { x: 143, y: 70 },
      { x: 72, y: 70 },
      { x: 72, y: 40 },
      { x: 64, y: 40 },
    ]);
    expect(routeOf(view, "r2")).toEqual([
      { x: 64, y: 60 },
      { x: 103.5, y: 60 },
      { x: 103.5, y: -8 },
      { x: 20, y: -8 },
      { x: 20, y: 0 },
    ]);
  });
});

describe("sol pass-4 finding 4 — strict tie-break, no tolerance", () => {
  // Without labels or ports at width 320, the tolerant engine mounts `r4`
  // at `x=72`; the strict comparisons the spec prescribes mount it at
  // `x=92`.
  it("mounts r4 at x=92 under exact comparisons", () => {
    const document = buildDocument({
      nodes: ["n0", "n1", "n2", "n3", "n4"],
      links: [
        ["r0", "n1", "n2"],
        ["r1", "n4", "n3"],
        ["r2", "n1", "n2"],
        ["r3", "n2", "n1"],
        ["r4", "n1", "n0"],
      ],
    });
    const { view, warnings } = lay(document, 320);
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["route-obstructed", relationRef("r2")],
    ]);
    const r4 = routeOf(view, "r4");
    expect(isOrthogonal(r4)).toBe(true);
    expect(r4[1]!.x).toBe(92);
    expect(r4[2]!.x).toBe(92);
    expect(r4).toEqual([
      { x: 64, y: 35.333333333333336 },
      { x: 92, y: 35.333333333333336 },
      { x: 92, y: 16 },
      { x: 120, y: 16 },
    ]);
  });
});

describe("429c92a2 camera — loops at W=100", () => {
  it("a lone self-loop starts the camera at (0,-8)", () => {
    const { view, warnings } = lay(buildDocument({ nodes: ["n0"], links: [["r0", "n0", "n0"]] }), 100);
    expect(warnings).toEqual([]);
    expect(view.presentation.camera).toEqual({ x: 0, y: -8, zoom: 1 });
    const route = routeOf(view, "r0");
    expect(route).toEqual([
      { x: 64, y: 16 },
      { x: 72, y: 16 },
      { x: 72, y: -8 },
      { x: 32, y: -8 },
      { x: 32, y: 0 },
    ]);
  });

  it("a self-loop beside a sibling edge overflows left: U.x=[-8,64]", () => {
    const document = buildDocument({
      nodes: ["n0", "n1"],
      links: [["e1", "n0", "n1"], ["r0", "n0", "n0"]],
    });
    const { view, warnings } = lay(document, 100);
    expect(warnings).toEqual([]);
    // The union reaches the west clearance `x=-8` while the entities end at
    // `x=64`: the camera starts at `xmin`.
    expect(view.presentation.camera.x).toBe(-8);
    const xs = [
      ...Object.values(view.entityOccurrences).flatMap((occurrence) => [
        (occurrence.geometry as { x: number }).x,
        (occurrence.geometry as { x: number; width: number }).x +
          (occurrence.geometry as { x: number; width: number }).width,
      ]),
      ...routeOf(view, "r0").map((point) => point.x),
      ...routeOf(view, "e1").map((point) => point.x),
    ];
    expect(Math.min(...xs)).toBe(-8);
    expect(Math.max(...Object.values(view.entityOccurrences).map((o) => (o.geometry as { x: number; width: number }).x + (o.geometry as { x: number; width: number }).width))).toBe(64);
  });
});

describe("sol pass-4 finding 2 — independent enumeration for every segment of (a)–(d)", () => {
  // AC-L8 demands, per `label-unplaced` fixture, an enumeration of the final
  // levels — every rank gap, every T-sibling candidate (the no-canonical-gap
  // list included) and every sibling gap set re-derived from the placed
  // geometry, not from the engine's own search — showing no admissible
  // transformation at or under the cap for any segment, with the deficits
  // (`D_len`, `D_gap`, along-flow shape deficits, `D_cross`) and the caps
  // (`4·(labelMain + 2m)` on ranks, `4·(crossSize + 2m)` on siblings)
  // recomputed from the spec formulas. Levels below are read from the
  // fixture specs (document input), ranks and members from the final view
  // geometry, never from `diagnoseLabels`.
  const margin = DEFAULT_LAYOUT_METRICS.labelMargin;
  expect(margin).toBe(4);

  interface Audited {
    readonly index: number;
    readonly len: number;
    readonly horizontal: boolean;
    readonly along: number;
    readonly threshold: number;
    readonly short: boolean;
    readonly centre: { x: number; y: number };
    readonly padded: { x: number; y: number; width: number; height: number };
    readonly hitNodes: readonly string[];
    readonly crossNeeds: readonly number[];
    readonly siblingCap: number;
    readonly rankCap: number;
  }

  const audit = (
    view: ReturnType<typeof lay>["view"],
    document: Parameters<typeof replayLabelBoxes>[0],
    relation: string,
    label: string,
    nodeIds: readonly string[],
    titleBands: readonly { x: number; y: number; width: number; height: number }[] = [],
    leftToRight = true,
  ): Audited[] => {
    const size = measure(label, "edge-label");
    // Caps follow the flow, like the engine: the rank cap scales the label
    // size along the flow, the sibling cap its size across the flow, on every
    // segment whatever that segment's own orientation.
    const flowMain = leftToRight ? size.width : size.height;
    const flowCross = leftToRight ? size.height : size.width;
    const route = routeOf(view, relation);
    expect(isOrthogonal(route)).toBe(true);
    const nodeRects = new Map(nodeIds.map((id) => [id, rectOf(view, id)] as const));
    const placed = replayLabelBoxes(document, view, measure);
    const out: Audited[] = [];
    for (let index = 0; index < route.length - 1; index += 1) {
      const a = route[index]!;
      const b = route[index + 1]!;
      const horizontal = a.y === b.y;
      const len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
      const along = horizontal ? size.width : size.height;
      const threshold = along + 2 * margin;
      const centre = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const box = { x: centre.x - size.width / 2, y: centre.y - size.height / 2, width: size.width, height: size.height };
      const padded = { x: box.x - margin, y: box.y - margin, width: box.width + 2 * margin, height: box.height + 2 * margin };
      const hits = (rect: { x: number; y: number; width: number; height: number }): boolean =>
        padded.x < rect.x + rect.width && padded.x + padded.width > rect.x && padded.y < rect.y + rect.height && padded.y + padded.height > rect.y;
      const hitNodes = [...nodeRects].filter(([, rect]) => hits(rect)).map(([id]) => id);
      for (const band of titleBands) expect(hits(band)).toBe(false);
      const crossNeeds: number[] = [];
      for (const [, rect] of nodeRects) {
        if (!hits(rect)) continue;
        const shapeStart = horizontal ? rect.y : rect.x;
        const shapeEnd = shapeStart + (horizontal ? rect.height : rect.width);
        const paddedStart = horizontal ? padded.y : padded.x;
        const paddedEnd = paddedStart + (horizontal ? padded.height : padded.width);
        crossNeeds.push(Math.min(paddedEnd - shapeStart, shapeEnd - paddedStart) + 2 * margin);
      }
      for (const [id, other] of placed) {
        if (id === `relation:${relation}`) continue;
        const shapeStart = horizontal ? other.y : other.x;
        const shapeEnd = shapeStart + (horizontal ? other.height : other.width);
        const paddedStart = horizontal ? padded.y : padded.x;
        const paddedEnd = paddedStart + (horizontal ? padded.height : padded.width);
        if (hits(other)) {
          const otherCross = horizontal ? other.height : other.width;
          const lane = horizontal ? centre.y : centre.x;
          const otherLane = horizontal ? other.y + other.height / 2 : other.x + other.width / 2;
          const crossSize = horizontal ? size.height : size.width;
          crossNeeds.push((crossSize + otherCross) / 2 + 2 * margin - Math.abs(lane - otherLane));
        }
      }
      out.push({
        index, len, horizontal, along, threshold, short: len < threshold, centre, padded, hitNodes, crossNeeds,
        siblingCap: 4 * (flowCross + 2 * margin),
        rankCap: 4 * (flowMain + 2 * margin),
      });
    }
    return out;
  };

  it("(a) every segment audited: the across-flow shortfall closes under (a), rank gaps are absent, siblings empty", () => {
    const spec = { nodes: ["n"], containers: { k: ["n"] }, links: [["r1", "k", "n", "LLLLL"]] } as const;
    const document = buildDocument(spec);
    const { view, warnings, fit } = lay(document, 8000);
    expect(fit.direction).toBe("left-to-right");
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["label-unplaced", relationRef("r1")],
    ]);
    // Levels from the fixture spec: root holds `{k}`, `k` holds `{n}` — one
    // rank of one member each, so no rank gap and no sibling gap at any
    // level: the T-sibling candidate list is empty for every segment.
    expect(Object.keys(view.entityOccurrences).sort()).toEqual(["e.k", "e.n"].map((id) => `occurrence:${id}`).sort());
    // The container title band never blocks: `k`'s band is its top 26 px.
    const k = rectOf(view, "k");
    const band = { x: k.x, y: k.y, width: k.width, height: measure("k", "container-title").height + 2 * DEFAULT_LAYOUT_METRICS.titlePaddingY };
    expect(band.height).toBe(26);
    const segments = audit(view, document, "r1", "LLLLL", ["n"], [band]);
    expect(segments.map((segment) => segment.len)).toEqual([8, 13, 8]);
    // Thresholds use the size ALONG the segment: height (16) across the
    // flow, not the label width (35). The old test compared against the
    // width; the spec threshold is `height + 2·margin = 24`.
    expect(segments[1]!.horizontal).toBe(false);
    expect(segments[1]!.along).toBe(measure("LLLLL", "edge-label").height);
    expect(segments[1]!.threshold).toBe(16 + 2 * margin);
    expect(segments[1]!.short).toBe(true);
    expect(segments[1]!.len).toBeLessThan(16 + 2 * margin);
    // No rank gap at any level crosses or holds segments 0 and 2 (both
    // flow-aligned and short: `D_len` 35 and 35, rank cap 172, yet no gap
    // to lengthen) — reason (b) on both.
    for (const index of [0, 2]) {
      expect(segments[index]!.horizontal).toBe(true);
      expect(segments[index]!.short).toBe(true);
      expect(segments[index]!.threshold).toBe(35 + 2 * margin);
      expect(segments[index]!.rankCap).toBe(4 * (35 + 2 * margin));
    }
    // Cross deficits stay at or under the sibling cap (`4·(16 + 8) = 96`)
    // with an empty candidate list, so no sibling amount is requestable on
    // any segment — reason (d) everywhere a cross deficit stands.
    for (const segment of segments) {
      expect(segment.hitNodes).toContain("n");
      for (const need of segment.crossNeeds) {
        expect(need).toBeGreaterThan(0);
        expect(need).toBeLessThanOrEqual(segment.siblingCap);
      }
      expect(segment.siblingCap).toBe(96);
    }
    expect(segments[1]!.crossNeeds).toEqual([21.5]);
    expect(segments[0]!.crossNeeds).toEqual([23]);
    // Segment 2's blocker spans the padded box on both cross sides and its
    // owner `n` is the lane's own target member — reason (c) there.
    const n = rectOf(view, "n");
    const padded2 = segments[2]!.padded;
    expect(n.y).toBeLessThanOrEqual(padded2.y);
    expect(n.y + n.height).toBeGreaterThanOrEqual(padded2.y + padded2.height);
  });

  it("(b) every segment audited: one rank of one member, no gaps, no candidates", () => {
    const spec = { nodes: ["n1"], links: [["r1", "n1", "n1", "LLLL"]] } as const;
    const document = buildDocument(spec);
    const { view, warnings, fit } = lay(document, 8000);
    expect(fit.direction).toBe("left-to-right");
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["label-unplaced", relationRef("r1")],
    ]);
    // One rank, one member: zero rank gaps and zero sibling gaps anywhere,
    // so the T-sibling candidate list is empty for every segment.
    const xs = new Set(Object.values(view.entityOccurrences).map((o) => o.geometry.x));
    expect([...xs]).toEqual([0]);
    const segments = audit(view, document, "r1", "LLLL", ["n1"]);
    expect(segments.map((segment) => segment.len)).toEqual([8, 24, 40, 8]);
    // Segment 1 is vertical of length 24: exactly `height + 2·margin`, so it
    // is NOT short — no (a) there, only (d).
    expect(segments[1]!.horizontal).toBe(false);
    expect(segments[1]!.threshold).toBe(24);
    expect(segments[1]!.short).toBe(false);
    // Segment 2 is flow-aligned of length 40 over a 36 threshold: not short,
    // yet blocked with no gap to lengthen into — (b) with (d).
    expect(segments[2]!.horizontal).toBe(true);
    expect(segments[2]!.threshold).toBe(36);
    expect(segments[2]!.short).toBe(false);
    expect(segments[2]!.hitNodes).toContain("n1");
    // Segment 3 is vertical of length 8 under 24: short across the flow —
    // (a) with (d).
    expect(segments[3]!.horizontal).toBe(false);
    expect(segments[3]!.short).toBe(true);
    // Every cross deficit is positive and at or under the sibling cap 96
    // with no candidate to spend it on.
    for (const segment of segments) {
      expect(segment.hitNodes).toContain("n1");
      expect(segment.siblingCap).toBe(96);
      for (const need of segment.crossNeeds) {
        expect(need).toBeGreaterThan(0);
        expect(need).toBeLessThanOrEqual(96);
      }
    }
    expect(segments[0]!.crossNeeds).toEqual([36]);
    expect(segments[1]!.crossNeeds).toEqual([18]);
    expect(segments[2]!.crossNeeds).toEqual([12]);
    expect(segments[3]!.crossNeeds).toEqual([58]);
    // The lane's only neighbour at every level is its own member `n1`.
    expect(rectOf(view, "n1")).toEqual({ x: 0, y: 0, width: 64, height: 32 });
  });

  it("(c) both segments audited: the grown lane member spans the padded label on both sides", () => {
    const spec = {
      nodes: ["n0", "n1", "n2"],
      links: [["r2", "n0", "n0", "LLLLLL"], ["r4", "n2", "n1", "L".repeat(36)], ["r5", "n0", "n0", "L".repeat(32)]],
    } as const;
    const document = buildDocument(spec);
    const { view, warnings, fit } = lay(document, 8000);
    expect(fit.direction).toBe("left-to-right");
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["route-obstructed", relationRef("r5")],
      ["label-budget-exhausted", relationRef("r2")],
      ["label-unplaced", relationRef("r5")],
    ]);
    const label = "L".repeat(32);
    const size = measure(label, "edge-label");
    const segments = audit(view, document, "r5", label, ["n0", "n1", "n2"]);
    expect(segments).toHaveLength(2);
    // Segment 0 is flow-aligned and short (`D_len` positive) with a rank cap
    // far above it, yet lengthens nothing: no rank gap crosses or holds it.
    expect(segments[0]!.horizontal).toBe(true);
    expect(segments[0]!.threshold).toBe(size.width + 2 * margin);
    expect(segments[0]!.short).toBe(true);
    const dLen = size.width + 2 * margin - segments[0]!.len;
    expect(dLen).toBeGreaterThan(0);
    expect(dLen).toBeLessThanOrEqual(segments[0]!.rankCap);
    // On both segments the lane's own grown node `n0` spans the padded box
    // on both cross sides — reason (c) — and `n0` owns the lane's ends, so
    // the lane moves with the blocker under any sibling widening and the
    // shape need is never spent (it is not even computed).
    const node = rectOf(view, "n0");
    expect(node.width).toBeGreaterThan(size.width);
    for (const segment of segments) {
      expect(segment.hitNodes).toEqual(["n0"]);
      // Spanning is read on the cross axis: `y` for the horizontal segment,
      // `x` for the vertical one.
      const shapeStart = segment.horizontal ? node.y : node.x;
      const shapeEnd = shapeStart + (segment.horizontal ? node.height : node.width);
      const paddedStart = segment.horizontal ? segment.padded.y : segment.padded.x;
      const paddedEnd = paddedStart + (segment.horizontal ? segment.padded.height : segment.padded.width);
      expect(shapeStart).toBeLessThanOrEqual(paddedStart);
      expect(shapeEnd).toBeGreaterThanOrEqual(paddedEnd);
    }
    // The exempt shape needs, recomputed: segment 0 (`D_cross` on `y`) is
    // under the sibling cap, segment 1 (`D_cross` on `x`, deep inside the
    // grown lane member) is far over it — both unspendable under (c).
    expect(segments[0]!.crossNeeds[0]).toBe(40);
    expect(segments[1]!.crossNeeds[0]).toBe(352);
    expect(segments[0]!.siblingCap).toBe(96);
    // NOT COVERED here: re-deriving, from view x-groups alone, which
    // placement rank gaps cross or hold segment 0 of this widened geometry
    // (`n0` spans three view x-groups after L-R10 growth). The (b) half of
    // segment 0 rests on the engine's gap search; every deficit, cap,
    // spanning fact and ownership fact above is re-derived.
  });

  it("(d) every segment audited: the (root,1) candidate resolves lane and blocker to one member", () => {
    const spec = {
      nodes: ["n0", "n1", "n2"],
      links: [
        ["r0", "n0", "n1", "L".repeat(28)],
        ["r1", "n0", "n2", "L".repeat(16)],
        ["r2", "n2", "n2", "L".repeat(9)],
        ["r3", "n1", "n1", "L".repeat(18)],
        ["r4", "n0", "n1", "L".repeat(32)],
      ],
    } as const;
    const document = buildDocument(spec);
    const { view, warnings, fit } = lay(document, 8000);
    expect(fit.direction).toBe("left-to-right");
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["label-unplaced", relationRef("r2")],
      ["label-unplaced", relationRef("r3")],
    ]);
    // Levels from the fixture spec: the single root level. Ranks from the
    // final view x-groups: rank 0 holds `{n0}`, rank 1 holds `{n1, n2}`.
    // Only rank 1 holds a sibling gap (`n1|n2`), so the no-canonical-gap
    // T-sibling candidate list for these segments is exactly `[(root, 1)]`.
    const byX = new Map<number, string[]>();
    for (const id of ["n0", "n1", "n2"]) {
      const rect = rectOf(view, id);
      const list = byX.get(rect.x) ?? [];
      list.push(id);
      byX.set(rect.x, list);
    }
    expect([...byX.keys()].sort((x, y) => x - y)).toHaveLength(2);
    expect(byX.get(324)!.sort()).toEqual(["n1", "n2"]);
    const label = "L".repeat(9);
    const size = measure(label, "edge-label");
    const segments = audit(view, document, "r2", label, ["n0", "n1", "n2"]);
    expect(segments.map((segment) => segment.len)).toEqual([8, 38, 40, 8]);
    // Segment 0 is flow-aligned and short (`D_len = 71 - 8 = 63`, rank cap
    // 284): no view-derived rank gap crosses it — the `x ∈ [64, 324]`
    // interval ends before the segment starts — reason (b).
    expect(segments[0]!.horizontal).toBe(true);
    expect(segments[0]!.threshold).toBe(size.width + 2 * margin);
    expect(segments[0]!.short).toBe(true);
    expect(size.width + 2 * margin - segments[0]!.len).toBe(63);
    // Segment 1 is vertical of length 38 over a 24 threshold: not short, so
    // no (a) and no T-rank need; its cross deficit (12, under cap 96) meets
    // the single candidate, where lane and blocker both resolve to `n2` —
    // the gap set is empty, reason (d) alone.
    expect(segments[1]!.horizontal).toBe(false);
    expect(segments[1]!.threshold).toBe(size.height + 2 * margin);
    expect(segments[1]!.short).toBe(false);
    expect(segments[1]!.hitNodes).toEqual(["n2"]);
    expect(segments[1]!.crossNeeds).toEqual([35.5]);
    // Segment 2 is flow-aligned and short (`D_len = 31`, under cap 284) with
    // no crossing gap — (b) — and a cross deficit (12, under cap 96) whose
    // pairings all resolve to `n2` — (d).
    expect(segments[2]!.horizontal).toBe(true);
    expect(segments[2]!.short).toBe(true);
    expect(size.width + 2 * margin - segments[2]!.len).toBe(31);
    expect(segments[2]!.crossNeeds).toEqual([12]);
    // Segment 3 is vertical of length 8 under 24: short across the flow —
    // (a) — with a cross deficit (75.5, under cap 96) resolving to `n2` —
    // (d).
    expect(segments[3]!.horizontal).toBe(false);
    expect(segments[3]!.short).toBe(true);
    expect(segments[3]!.crossNeeds).toEqual([75.5]);
    // The lane/blocker pair shares one member at the tried rank: the only
    // corridor neighbour of segment 1's slab is its own member `n2`.
    const n1 = rectOf(view, "n1");
    expect(n1.y + n1.height).toBeLessThan(96);
    const corridor = Object.values(view.entityOccurrences)
      .filter((o) => o.geometry.x < 396 && o.geometry.x + o.geometry.width >= 388 && o.geometry.y < 134 && o.geometry.y + o.geometry.height > 96)
      .map((o) => o.entity)
      .sort();
    expect(corridor).toEqual(["entity:n2"]);
  });
});

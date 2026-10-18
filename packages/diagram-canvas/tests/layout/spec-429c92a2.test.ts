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
import {
  buildDocument,
  isOrthogonal,
  lay,
  measure,
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

describe("429c92a2 lexicographic cost — a route beyond the old BEND threshold", () => {
  // Weighted lengths past `BEND = 10^7` flip the old scalar
  // (`bends·BEND + length`) but never the `(bends, length)` pair: `r2`'s
  // straight 0-bend corridor is penalty-weighted to 72M, its 4-bend detour to
  // 24M. The scalar picks the detour (64M < 72M); the pair keeps the straight
  // route (0 bends < 4 bends).
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
          passable: new Set(),
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
    // `r1` detours around the `c,d` obstacles blocking its straight corridor
    // (4 bends, both old and new routers agree obstacle avoidance comes first).
    expect(bendCount(r1)).toBe(4);
    // The lexicographic router keeps `r2`'s straight corridor despite its 72M
    // penalty weight; the old scalar detours (4 bends, 64M < 72M).
    expect(bendCount(r2)).toBe(0);
    expect(r2).toEqual([{ x: 10 * M + 64, y: 16 }, { x: 34 * M, y: 16 }]);
  });
});

describe("429c92a2 transversal ban — a,b:A→B c:A→D d:C→B at W=320", () => {
  it("obstructs b while a stays clean", () => {
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

describe("429c92a2 finding 3 — independent gap enumeration for (a) and (b)", () => {
  it("(a) the longest segment runs across the flow and is shorter than the label", () => {
    const spec = { nodes: ["n"], containers: { k: ["n"] }, links: [["r1", "k", "n", "LLLLL"]] } as const;
    const document = buildDocument(spec);
    const { view, warnings } = lay(document, 8000);
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["label-unplaced", relationRef("r1")],
    ]);
    // Independently: the longest route segment is vertical (across the
    // left-to-right flow) and shorter than the 5-char label (35 px), so no
    // flow-aligned lengthening can ever hold it — reason (a) without trusting
    // `diagnoseLabels`.
    const route = routeOf(view, "r1");
    let longest = 0;
    let vertical = false;
    route.slice(1).forEach((point, index) => {
      const prev = route[index]!;
      const dx = Math.abs(point.x - prev.x);
      const dy = Math.abs(point.y - prev.y);
      if (dx + dy > longest) {
        longest = dx + dy;
        vertical = dy > dx;
      }
    });
    expect(vertical).toBe(true);
    expect(longest).toBeLessThan(measure("LLLLL", "edge-label").width);
  });

  it("(b) a lone self-loop lane has no rank gap to lengthen into", () => {
    const spec = { nodes: ["n1"], links: [["r1", "n1", "n1", "LLLL"]] } as const;
    const document = buildDocument(spec);
    const { view, warnings } = lay(document, 8000);
    expect(warnings.map((warning) => [warning.code, ...warning.refs])).toEqual([
      ["label-unplaced", relationRef("r1")],
    ]);
    // Independently: a single rank holds a single member, so the sibling-gap
    // set is empty at every level and no T-rank transform is admissible under
    // any cap — the (b) closure rebuilt from the final geometry, never from
    // `diagnoseLabels` reasons.
    const rects = Object.values(view.entityOccurrences).map((o) => o.geometry);
    const ranks = new Map<number, number>();
    for (const rect of rects) ranks.set(rect.x, (ranks.get(rect.x) ?? 0) + 1);
    // One rank, one member: zero rank gaps anywhere.
    expect(ranks.size).toBe(1);
    expect([...ranks.values()]).toEqual([1]);
    const route = routeOf(view, "r1");
    expect(isOrthogonal(route)).toBe(true);
  });
});

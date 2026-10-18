/**
 * Sol review regressions, pass 2 (SPEC §10.5 L-R10/L-R9 as amended in
 * `0b785150`): the two findings sol xhigh reproduced with the tests'
 * measurer, default metrics and `targetWidth=8000` (lengths are repetitions
 * of `L`). Both fail on `0b51215b` and pass after the fix. Every view is
 * validated by `diagram-core` inside `lay()`.
 */
import { occurrenceRef, relationRef } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_LAYOUT_METRICS,
  bendCount,
  rectsIntersect,
  type Rect,
} from "../../src/index.js";
import {
  buildDocument,
  isOrthogonal,
  lay,
  measure,
  minimalBends,
  rectOf,
  replayLabelBoxes,
  replayUnheldLabels,
  routeOf,
  sharesSegment,
} from "./fixtures.js";

const L = (count: number): string => "L".repeat(count);

/** A label box padded by `labelMargin`, as L-R10's hold test sees it. */
const padded = (box: Rect): Rect => {
  const margin = DEFAULT_LAYOUT_METRICS.labelMargin;
  return { x: box.x - margin, y: box.y - margin, width: box.width + 2 * margin, height: box.height + 2 * margin };
};

describe("sol pass 2 finding 1 — alignment keeps the L-R10 widenings", () => {
  // `kA` holds `n0,n1,n2`, `kB` holds `n4`; `r0:n5→n6` (21), `r1:n6→n7`
  // (14), `r2:n2→n1` unlabeled, `r3:n0→n4` (7), `r4:n7→n4` unlabeled,
  // `r6:n0→n6` (10). On `0b51215b` the engine reaches 842 px and reports
  // `r6` unplaced: the isotone spacing includes the requested `siblingExtra`,
  // but the move after container alignment restores only `nodeGap` (24 px),
  // so an extra 20 px leaves the real interval unchanged and `r6` never fits.
  // Keeping the extra separation through the post-alignment move places every
  // label in 736 px with no warning.
  const document = buildDocument({
    nodes: ["n0", "n1", "n2", "n4", "n5", "n6", "n7"],
    containers: { kA: ["n0", "n1", "n2"], kB: ["n4"] },
    links: [
      ["r0", "n5", "n6", L(21)],
      ["r1", "n6", "n7", L(14)],
      ["r2", "n2", "n1"],
      ["r3", "n0", "n4", L(7)],
      ["r4", "n7", "n4"],
      ["r6", "n0", "n6", L(10)],
    ],
  });

  it("places every label, r6 included, in 736 px", () => {
    const { fit, warnings } = lay(document, 8000);
    expect(warnings).toEqual([]);
    expect(fit.direction).toBe("left-to-right");
    expect(fit.width).toBe(736);
  });

  it("holds r6 clear of every shape on the final geometry", () => {
    const { view } = lay(document, 8000);
    expect(replayUnheldLabels(document, view, measure)).toEqual([]);
    const boxes = replayLabelBoxes(document, view, measure);
    const r6 = boxes.get(relationRef("r6"));
    expect(r6, "r6 placed").toBeDefined();
    for (const id of ["n0", "n1", "n2", "n4", "n5", "n6", "n7"]) {
      expect(rectsIntersect(padded(r6!), rectOf(view, id)), `r6 vs ${id}`).toBe(false);
    }
    for (const [id, box] of boxes) {
      if (id === relationRef("r6")) continue;
      expect(rectsIntersect(padded(r6!), box), `r6 vs ${id}`).toBe(false);
    }
  });

  it("routes every edge orthogonally with the minimum bend count", () => {
    const { view } = lay(document, 8000);
    const ends: Readonly<Record<string, readonly [string, string]>> = {
      r0: ["n5", "n6"],
      r1: ["n6", "n7"],
      r2: ["n2", "n1"],
      r3: ["n0", "n4"],
      r4: ["n7", "n4"],
      r6: ["n0", "n6"],
    };
    const obstacles = ["n0", "n1", "n2", "n4", "n5", "n6", "n7"].map((id) => rectOf(view, id));
    for (const [relation, [source, target]] of Object.entries(ends)) {
      const route = routeOf(view, relation);
      expect(isOrthogonal(route), relation).toBe(true);
      expect(bendCount(route), relation).toBe(
        minimalBends(route[0]!, rectOf(view, source), route[route.length - 1]!, rectOf(view, target), obstacles, DEFAULT_LAYOUT_METRICS.clearance),
      );
    }
  });
});

describe("sol pass 2 finding 2 — parallel relations keep distinct slots on a shared port", () => {
  // Two nodes `a,b`, ports `pa` on `a` and `pb` on `b`, two relations
  // `r1:pa→pb` and `r2:pa→pb`. On `0b51215b` the engine reports no warning
  // but both routes share the `(64,18)→(72,18)` and `(112,18)→(120,18)`
  // segments: grouping by port forces identical hook points and the grid-unit
  // ban never covers the terminal segments. After the fix each parallel end
  // takes its own slot — with one `PortOccurrence` per end identified by
  // relation and role — and the full routes share nothing.
  const document = buildDocument({
    nodes: ["a", "b"],
    ports: { pa: "a", pb: "b" },
    links: [["r1", "pa", "pb"], ["r2", "pa", "pb"]],
  });

  it("emits one PortOccurrence per parallel end with distinct slots", () => {
    const { fit, warnings, view } = lay(document, 8000);
    expect(warnings).toEqual([]);
    expect(fit.direction).toBe("left-to-right");
    expect(Object.keys(view.portOccurrences).sort()).toEqual(
      ["p.pa.r1.source", "p.pa.r2.source", "p.pb.r1.target", "p.pb.r2.target"].map((id) => occurrenceRef(id)).sort(),
    );
    const pa = [view.portOccurrences[occurrenceRef("p.pa.r1.source")]!, view.portOccurrences[occurrenceRef("p.pa.r2.source")]!];
    const pb = [view.portOccurrences[occurrenceRef("p.pb.r1.target")]!, view.portOccurrences[occurrenceRef("p.pb.r2.target")]!];
    for (const occurrence of pa) expect(occurrence.port).toBe("port:pa");
    for (const occurrence of pb) expect(occurrence.port).toBe("port:pb");
    // Distinct slots on both sides, symmetric about the side centre.
    expect(pa.map((occurrence) => occurrence.order).sort()).toEqual([0, 1]);
    expect(pb.map((occurrence) => occurrence.order).sort()).toEqual([0, 1]);
    expect(pa[0]!.anchor).not.toBe(pa[1]!.anchor);
    expect(pb[0]!.anchor).not.toBe(pb[1]!.anchor);
    expect(pa[0]!.anchor + pa[1]!.anchor).toBeCloseTo(1, 10);
    expect(pb[0]!.anchor + pb[1]!.anchor).toBeCloseTo(1, 10);
    // Each relation attaches to its own occurrences.
    for (const id of ["r1", "r2"]) {
      const relation = Object.values(view.relationOccurrences).find((occurrence) => occurrence.relation === relationRef(id))!;
      const ends = new Map(relation.endpoints.map((endpoint) => [endpoint.role, endpoint.occurrence]));
      expect(ends.get("source")).toBe(occurrenceRef(`p.pa.${id}.source`));
      expect(ends.get("target")).toBe(occurrenceRef(`p.pb.${id}.target`));
    }
  });

  it("shares no segment between the full routes", () => {
    const { view } = lay(document, 8000);
    const r1 = routeOf(view, "r1");
    const r2 = routeOf(view, "r2");
    expect(isOrthogonal(r1)).toBe(true);
    expect(isOrthogonal(r2)).toBe(true);
    // Straight lanes, one per relation: no detour, nothing in common.
    expect(bendCount(r1)).toBe(0);
    expect(bendCount(r2)).toBe(0);
    expect(sharesSegment(r1, r2)).toBe(false);
  });
});

describe("AC-L8 L-R2 — a port shared by a parallel pair and a third relation", () => {
  // `r1,r2: A.p→B.q` are parallel (same unordered entity pair); `r3: A.p→C`
  // and `r4: A.p→D` are not. The pair takes distinct slots in the same order
  // at both ends with one `PortOccurrence` per relation end for `p` and `q`;
  // the third and fourth relations keep the shared port slot, ordered by its
  // representative end — smallest by (relation id, role).
  const document = buildDocument({
    nodes: ["A", "B", "C", "D"],
    ports: { p: "A", q: "B" },
    links: [["r1", "p", "q"], ["r2", "p", "q"], ["r3", "p", "C"], ["r4", "p", "D"]],
  });

  it("splits the parallel ends and shares one slot for the rest", () => {
    const { warnings, view } = lay(document, 8000);
    expect(warnings).toEqual([]);
    expect(Object.keys(view.portOccurrences).sort()).toEqual(
      ["p.p.r1.source", "p.p.r2.source", "p.p", "p.q.r1.target", "p.q.r2.target"].map((id) => occurrenceRef(id)).sort(),
    );
    // The parallel pair keeps the same slot order at both ends, so the routes
    // cannot cross each other; the shared slot comes last on its side.
    const orderOf = (id: string): number => view.portOccurrences[occurrenceRef(id)]!.order;
    expect(orderOf("p.p.r1.source")).toBe(orderOf("p.q.r1.target"));
    expect(orderOf("p.p.r2.source")).toBe(orderOf("p.q.r2.target"));
    expect(orderOf("p.p.r1.source")).toBeLessThan(orderOf("p.p.r2.source"));
    const side = ["p.p.r1.source", "p.p.r2.source", "p.p"].map((id) => view.portOccurrences[occurrenceRef(id)]!);
    expect(side.map((occurrence) => occurrence.order).sort()).toEqual([0, 1, 2]);
    for (const occurrence of side) {
      expect(occurrence.port).toBe("port:p");
      expect(occurrence.side).toBe("east");
    }
    // `r3` and `r4` share the port slot: same hook point, entity endpoints
    // on the far side.
    expect(routeOf(view, "r3")[0]).toEqual(routeOf(view, "r4")[0]);
    const r3 = Object.values(view.relationOccurrences).find((occurrence) => occurrence.relation === relationRef("r3"))!;
    expect(new Map(r3.endpoints.map((endpoint) => [endpoint.role, endpoint.occurrence])).get("source")).toBe(
      occurrenceRef("p.p"),
    );
    expect(sharesSegment(routeOf(view, "r1"), routeOf(view, "r2"))).toBe(false);
  });
});

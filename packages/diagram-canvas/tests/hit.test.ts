/**
 * Hit testing: topmost follows the paint order, the marquee has two stated modes,
 * and a hit in device space agrees with a hit in world space at every zoom.
 */
import { describe, expect, it } from "vitest";

import { buildScene, sceneItemOf, type SceneEdge, type SceneNode } from "../src/scene.js";
import {
  DEFAULT_CSS_TOLERANCE,
  deviceToWorld,
  hitTest,
  hitTestAll,
  hitTestAtDevicePoint,
  hitTestRegion,
} from "../src/hit.js";
import { applyPoint, worldToDevice, type Camera, type Viewport } from "../src/transform.js";
import { OCC_A, OCC_B, OCC_C, OCC_E1, OCC_E2, OCC_PA, OCC_PB, VIEW, sampleState } from "./fixtures.js";

const frame = buildScene(sampleState(), VIEW);

describe("topmost is last painted", () => {
  it("returns the node over the container it sits on", () => {
    // (20,10) is inside A (0,0 40x20) and inside C (0,0 200x100). A has z = 1.
    expect(hitTest(frame, { x: 20, y: 10 })?.occurrence).toBe(OCC_A);
  });

  it("returns the port over the node it sits on", () => {
    // A's east port anchor is (40,10); its 8-unit square spans 36..44 x 6..14.
    // 42,10 is outside A's rect (which ends at x = 40) but inside the port.
    expect(hitTest(frame, { x: 42, y: 10 })?.occurrence).toBe(OCC_PA);
    // 38,10 is inside BOTH A and the port square: the port wins, being on top.
    expect(hitTest(frame, { x: 38, y: 10 })?.occurrence).toBe(OCC_PA);
  });

  it("lists every item under the point, topmost first, in the frame's own order", () => {
    // (38,10) is inside A, inside A's port square (36..44), 2 units off the e1
    // route (which the default 3-unit edge tolerance catches) and inside the
    // container. Four items, in exactly the reverse of the paint order. The
    // first version of this assertion listed three and omitted the edge - a
    // reading of the default tolerance, not a defect in the code.
    const hits = hitTestAll(frame, { x: 38, y: 10 });
    expect(hits.map((hit) => hit.occurrence)).toEqual([OCC_PA, OCC_A, OCC_E1, OCC_C]);
    for (let index = 1; index < hits.length; index += 1) {
      expect(hits[index]!.paintIndex).toBeLessThan(hits[index - 1]!.paintIndex);
    }
  });

  it("agrees with hitTest on the first entry, always", () => {
    for (const point of [{ x: 38, y: 10 }, { x: 150, y: 90 }, { x: 120, y: 10 }, { x: -5, y: -5 }]) {
      expect(hitTest(frame, point)?.occurrence).toBe(hitTestAll(frame, point)[0]?.occurrence);
    }
  });

  it("returns undefined outside every item", () => {
    expect(hitTest(frame, { x: -50, y: -50 })).toBeUndefined();
    expect(hitTestAll(frame, { x: -50, y: -50 })).toEqual([]);
  });

  it("carries the item itself, so a caller needs no second lookup", () => {
    const hit = hitTest(frame, { x: 20, y: 10 });
    expect(hit?.kind).toBe("node");
    expect((hit?.item as SceneNode).rect).toEqual({ x: 0, y: 0, width: 40, height: 20 });
    expect(frame.items[hit!.paintIndex]).toBe(hit!.item);
  });
});

describe("edges have no area, so they have a tolerance", () => {
  it("misses an edge with no tolerance and catches it with one", () => {
    // e1 runs from (40,10) to (100,10). The point (70,12) is 2 units off it, and
    // inside NO rectangle: only the container, which is why the assertion below
    // checks the edge is returned rather than merely something.
    expect(hitTest(frame, { x: 70, y: 12 }, { edgeTolerance: 0 })?.occurrence).toBe(OCC_C);
    expect(hitTest(frame, { x: 70, y: 12 }, { edgeTolerance: 3 })?.occurrence).toBe(OCC_E1);
  });

  it("does not catch an edge past its tolerance", () => {
    expect(hitTest(frame, { x: 70, y: 20 }, { edgeTolerance: 3 })?.occurrence).not.toBe(OCC_E1);
  });

  it("catches the edge nearest the point when two run close by", () => {
    // e2 passes through its waypoint (70,-40), far above e1's straight run.
    const onE2 = hitTest(frame, { x: 70, y: -39 }, { edgeTolerance: 3 });
    expect(onE2?.occurrence).toBe(OCC_E2);
  });

  it("grows a shape by the shape tolerance, and leaves it exact at zero", () => {
    // (20,22) is 2 units below A's bottom edge, 23 units from the e1 route and
    // 12 from the e2 route, so no edge tolerance reaches it: the only thing
    // under it is the container. A 3-unit shape tolerance brings A within reach
    // (half-open, so 2 is not enough: y < 20 + 2 excludes 22).
    const probe = { x: 20, y: 22 };
    expect(hitTest(frame, probe, { shapeTolerance: 0 })?.occurrence).toBe(OCC_C);
    expect(hitTest(frame, probe, { shapeTolerance: 2 })?.occurrence).toBe(OCC_C);
    expect(hitTest(frame, probe, { shapeTolerance: 3 })?.occurrence).toBe(OCC_A);
  });
});

describe("the marquee has two stated modes", () => {
  it("catches a partially covered node under intersect and not under contain", () => {
    const half = { x: -10, y: -10, width: 30, height: 30 };
    expect(hitTestRegion(frame, half, { mode: "intersect" }).map((hit) => hit.occurrence)).toContain(OCC_A);
    expect(hitTestRegion(frame, half, { mode: "contain" }).map((hit) => hit.occurrence)).not.toContain(OCC_A);
  });

  it("catches a wholly covered node under both", () => {
    const wide = { x: -10, y: -10, width: 80, height: 80 };
    expect(hitTestRegion(frame, wide, { mode: "contain" }).map((hit) => hit.occurrence)).toContain(OCC_A);
    expect(hitTestRegion(frame, wide, { mode: "intersect" }).map((hit) => hit.occurrence)).toContain(OCC_A);
  });

  it("returns the set in paint order, not topmost first", () => {
    const hits = hitTestRegion(frame, { x: -100, y: -100, width: 500, height: 500 }, { mode: "intersect" });
    expect(hits.map((hit) => hit.occurrence)).toEqual(frame.items.map((item) => item.occurrence));
    for (let index = 1; index < hits.length; index += 1) {
      expect(hits[index]!.paintIndex).toBeGreaterThan(hits[index - 1]!.paintIndex);
    }
  });

  it("tests an edge's POLYLINE under intersect, not its bounding box", () => {
    const e2 = sceneItemOf(frame, OCC_E2) as SceneEdge;
    // e2's bounding box is (20,-40) 100x50. This little square sits inside that
    // box, well away from the two straight runs of the route.
    const insideBoxOffRoute = { x: 25, y: -35, width: 6, height: 6 };
    expect(e2.bounds.x).toBeLessThan(insideBoxOffRoute.x);
    expect(hitTestRegion(frame, insideBoxOffRoute, { mode: "intersect" }).map((hit) => hit.occurrence)).not.toContain(
      OCC_E2,
    );
    // And it IS caught where the route really passes.
    expect(
      hitTestRegion(frame, { x: 66, y: -44, width: 8, height: 8 }, { mode: "intersect" }).map((hit) => hit.occurrence),
    ).toContain(OCC_E2);
  });

  it("catches nothing for a region away from the scene, rather than everything", () => {
    expect(hitTestRegion(frame, { x: 1000, y: 1000, width: 10, height: 10 }, { mode: "intersect" })).toEqual([]);
    expect(hitTestRegion(frame, { x: 1000, y: 1000, width: 10, height: 10 }, { mode: "contain" })).toEqual([]);
  });
});

describe("one transform for rendering and for selection (invariant 8)", () => {
  const CAMERAS: readonly Camera[] = [
    { x: 0, y: 0, zoom: 1 },
    { x: -30, y: 12, zoom: 0.25 },
    { x: 15, y: -7.5, zoom: 3 },
  ];
  const VIEWPORTS: readonly Viewport[] = [
    { cssWidth: 800, cssHeight: 600, devicePixelRatio: 1 },
    { cssWidth: 800, cssHeight: 600, devicePixelRatio: 2 },
    { cssWidth: 375, cssHeight: 812, devicePixelRatio: 3 },
  ];
  const WORLD_POINTS = [
    { x: 20, y: 10, expected: OCC_A },
    { x: 120, y: 10, expected: OCC_B },
    { x: 150, y: 90, expected: OCC_C },
    { x: 42, y: 10, expected: OCC_PA },
    { x: 98, y: 10, expected: OCC_PB },
  ] as const;

  it("names the same occurrence from a device point as from the world point it maps to", () => {
    for (const camera of CAMERAS) {
      for (const viewport of VIEWPORTS) {
        for (const probe of WORLD_POINTS) {
          const devicePoint = applyPoint(worldToDevice(camera, viewport), { x: probe.x, y: probe.y });
          const fromDevice = hitTestAtDevicePoint(frame, camera, viewport, devicePoint, {
            cssEdgeTolerance: 0,
            cssShapeTolerance: 0,
          });
          expect(fromDevice?.occurrence, `${JSON.stringify(camera)} ${JSON.stringify(probe)}`).toBe(probe.expected);
          expect(hitTest(frame, { x: probe.x, y: probe.y })?.occurrence).toBe(probe.expected);
        }
      }
    }
  });

  it("answers undefined for a singular camera instead of hitting the wrong thing", () => {
    const viewport = VIEWPORTS[0]!;
    expect(deviceToWorld({ x: 0, y: 0, zoom: 0 }, viewport)).toBeUndefined();
    expect(hitTestAtDevicePoint(frame, { x: 0, y: 0, zoom: 0 }, viewport, { x: 0, y: 0 })).toBeUndefined();
  });

  it("converts a CSS-pixel tolerance through the zoom, so the same slack covers more world at low zoom", () => {
    const viewport: Viewport = { cssWidth: 800, cssHeight: 600, devicePixelRatio: 1 };
    // 8 world units off the e1 route, at (70,18). With a 4 CSS px tolerance:
    //   zoom 1   -> 4 world units of slack: a MISS
    //   zoom 0.25 -> 16 world units of slack: a HIT
    const probe = { x: 70, y: 18 };
    const tight: Camera = { x: 0, y: 0, zoom: 1 };
    const loose: Camera = { x: 0, y: 0, zoom: 0.25 };
    const atTight = hitTestAtDevicePoint(frame, tight, viewport, applyPoint(worldToDevice(tight, viewport), probe));
    const atLoose = hitTestAtDevicePoint(frame, loose, viewport, applyPoint(worldToDevice(loose, viewport), probe));
    expect(atTight?.occurrence).not.toBe(OCC_E1);
    expect(atLoose?.occurrence).toBe(OCC_E1);
    expect(DEFAULT_CSS_TOLERANCE).toBe(4);
  });
});

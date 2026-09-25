/**
 * The one world -> view -> CSS pixel -> device pixel contract.
 *
 * The round trip is swept over several zooms and ratios rather than asserted at
 * zoom 1, where a great many wrong matrices are also right.
 */
import { describe, expect, it } from "vitest";

import {
  IDENTITY,
  applyPoint,
  applyRect,
  compose,
  invert,
  validateCamera,
  validateViewport,
  viewToDevice,
  visibleWorldRect,
  worldToDevice,
  worldToView,
  type Camera,
  type Viewport,
} from "../src/transform.js";

const ZOOMS = [0.25, 0.5, 1, 1.5, 2, 3.75] as const;
const RATIOS = [1, 1.25, 2, 3] as const;

describe("the affine algebra", () => {
  it("composes in the stated order: the inner transform is applied first", () => {
    const scale = { a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 };
    const translate = { a: 1, b: 0, c: 0, d: 1, e: 10, f: 0 };
    // Translate first, then scale: (1,0) -> (11,0) -> (22,0).
    expect(applyPoint(compose(scale, translate), { x: 1, y: 0 })).toEqual({ x: 22, y: 0 });
    // Scale first, then translate: (1,0) -> (2,0) -> (12,0). Different, as it must be.
    expect(applyPoint(compose(translate, scale), { x: 1, y: 0 })).toEqual({ x: 12, y: 0 });
  });

  it("leaves a point where it is under the identity, and inverts to the identity", () => {
    expect(applyPoint(IDENTITY, { x: 3, y: -7 })).toEqual({ x: 3, y: -7 });
    expect(invert(IDENTITY)).toEqual(IDENTITY);
  });

  it("returns the axis-aligned hull of a rotated rectangle, not the scaled extent", () => {
    // A 90 degree rotation: (x,y) -> (-y,x). A 10x2 rect must become 2x10.
    const rotate = { a: 0, b: 1, c: -1, d: 0, e: 0, f: 0 };
    expect(applyRect(rotate, { x: 0, y: 0, width: 10, height: 2 })).toEqual({ x: -2, y: 0, width: 2, height: 10 });
  });
});

describe("the camera contract", () => {
  it("draws the camera point at the view origin, at every zoom", () => {
    for (const zoom of ZOOMS) {
      const camera: Camera = { x: 17, y: -4, zoom };
      expect(applyPoint(worldToView(camera), { x: 17, y: -4 })).toEqual({ x: 0, y: 0 });
    }
  });

  it("scales by zoom in CSS pixels per world unit", () => {
    const camera: Camera = { x: 0, y: 0, zoom: 2.5 };
    expect(applyPoint(worldToView(camera), { x: 4, y: -2 })).toEqual({ x: 10, y: -5 });
  });

  it("keeps the device ratio a separate step, so a ratio change moves no world geometry", () => {
    const camera: Camera = { x: 5, y: 5, zoom: 2 };
    const view = applyPoint(worldToView(camera), { x: 9, y: 5 });
    for (const devicePixelRatio of RATIOS) {
      const viewport: Viewport = { cssWidth: 800, cssHeight: 600, devicePixelRatio };
      expect(applyPoint(worldToDevice(camera, viewport), { x: 9, y: 5 })).toEqual({
        x: view.x * devicePixelRatio,
        y: view.y * devicePixelRatio,
      });
      expect(applyPoint(viewToDevice(viewport), view)).toEqual({
        x: view.x * devicePixelRatio,
        y: view.y * devicePixelRatio,
      });
    }
  });

  it("round-trips world -> device -> world over a sweep of zooms and ratios", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 123.5, y: -47.25 },
      { x: -1000, y: 1000 },
    ];
    for (const zoom of ZOOMS) {
      for (const devicePixelRatio of RATIOS) {
        const camera: Camera = { x: -13.5, y: 22, zoom };
        const viewport: Viewport = { cssWidth: 640, cssHeight: 480, devicePixelRatio };
        const forward = worldToDevice(camera, viewport);
        const backward = invert(forward);
        expect(backward).toBeDefined();
        for (const point of points) {
          const returned = applyPoint(backward!, applyPoint(forward, point));
          expect(returned.x).toBeCloseTo(point.x, 9);
          expect(returned.y).toBeCloseTo(point.y, 9);
        }
      }
    }
  });

  it("has no inverse for a singular camera, and says so instead of producing Infinity", () => {
    // `zoom: 0` is refused by diagram-core's validateView, but an unvalidated
    // view can carry it, so this path must have an answer.
    expect(invert(worldToView({ x: 0, y: 0, zoom: 0 }))).toBeUndefined();
    expect(visibleWorldRect({ x: 0, y: 0, zoom: 0 }, { cssWidth: 10, cssHeight: 10, devicePixelRatio: 1 })).toBeUndefined();
  });

  it("reports the world rectangle a viewport shows", () => {
    const rect = visibleWorldRect({ x: 100, y: 50, zoom: 2 }, { cssWidth: 800, cssHeight: 600, devicePixelRatio: 3 });
    // 800 CSS px at 2 px per world unit is 400 world units wide, from x = 100.
    expect(rect).toEqual({ x: 100, y: 50, width: 400, height: 300 });
  });
});

describe("the diagnostics use diagram-core's own codes", () => {
  it("reports a non-finite camera number as value-not-finite", () => {
    const diagnostics = validateCamera({ x: Number.NaN, y: 0, zoom: 1 });
    expect(diagnostics.map((entry) => entry.code)).toEqual(["value-not-finite"]);
    expect(diagnostics[0]!.path).toBe("camera.x");
  });

  it("reports a non-positive zoom as limit-exceeded, exactly as validateView does", () => {
    expect(validateCamera({ x: 0, y: 0, zoom: 0 }).map((entry) => entry.code)).toEqual(["limit-exceeded"]);
    expect(validateCamera({ x: 0, y: 0, zoom: -2 }).map((entry) => entry.code)).toEqual(["limit-exceeded"]);
  });

  it("accepts a valid camera with no diagnostic at all", () => {
    expect(validateCamera({ x: -5, y: 5, zoom: 0.5 })).toEqual([]);
  });

  it("accepts a collapsed viewport but refuses a negative one and a zero ratio", () => {
    expect(validateViewport({ cssWidth: 0, cssHeight: 0, devicePixelRatio: 1 })).toEqual([]);
    expect(
      validateViewport({ cssWidth: -1, cssHeight: 10, devicePixelRatio: 1 }).map((entry) => entry.path),
    ).toEqual(["viewport.cssWidth"]);
    expect(
      validateViewport({ cssWidth: 10, cssHeight: 10, devicePixelRatio: 0 }).map((entry) => entry.code),
    ).toEqual(["limit-exceeded"]);
    expect(
      validateViewport({ cssWidth: 10, cssHeight: 10, devicePixelRatio: Number.POSITIVE_INFINITY }).map((e) => e.code),
    ).toEqual(["value-not-finite"]);
  });
});

describe("no negative zero leaves this module", () => {
  // Measured defect, not a hypothetical: the first run of the suite above had
  // `invert(IDENTITY)` return -0 in four of six components. `-0` hashes as `0`
  // through `canonicalise` while comparing unequal under `Object.is`, so a scene
  // revision could say "unchanged" about two frames a structural diff calls
  // different. `Object.is` is what makes this assertion mean anything: `toBe(0)`
  // would pass on -0.
  it("never returns -0 from invert, for any of the six components", () => {
    for (const transform of [IDENTITY, worldToView({ x: 0, y: 0, zoom: 2 }), worldToView({ x: -3, y: 4, zoom: 0.5 })]) {
      const inverse = invert(transform);
      expect(inverse).toBeDefined();
      for (const [name, value] of Object.entries(inverse!)) {
        expect(Object.is(value, -0), `${name} is -0`).toBe(false);
      }
    }
  });

  it("never returns -0 from applyPoint", () => {
    const point = applyPoint(worldToView({ x: 5, y: 5, zoom: 2 }), { x: 5, y: 5 });
    expect(Object.is(point.x, -0)).toBe(false);
    expect(Object.is(point.y, -0)).toBe(false);
    expect(point).toEqual({ x: 0, y: 0 });
  });
});

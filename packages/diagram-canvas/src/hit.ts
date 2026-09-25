/**
 * Hit testing over a `SceneFrame`. Pure arithmetic: no DOM, no event, no
 * pointer, no selection state. What is selected, and how a selection changes, is
 * GD-M2-CANVAS's NEXT slice; this module answers "what is under this point" and
 * "what does this rectangle catch", which is all a selection needs from geometry.
 *
 * ONE TRANSFORM, SHARED WITH RENDERING (study invariant 8). `hitTestAtDevicePoint`
 * does not derive its own matrix: it inverts the same `worldToDevice` composition
 * a renderer is handed, so a hit taken in device space and the same hit taken in
 * world space name the same occurrence at every zoom. A test asserts exactly
 * that, over a sweep of zoom values and device pixel ratios, because "we use the
 * same formula" is the kind of claim that stops being true silently.
 *
 * TOPMOST MEANS LAST PAINTED. `SceneFrame.items` is in paint order, bottom to
 * top, and a hit walks it BACKWARDS. So the answer follows the same total order a
 * renderer draws in - `comparePaintOrder` - and cannot disagree with what a user
 * sees on top.
 *
 * TOLERANCE HAS UNITS, and the two entry points take different ones. `hitTest`
 * knows no camera, so its tolerances are WORLD units. `hitTestAtDevicePoint`
 * takes CSS PIXELS, which is what a pointer tolerance actually is, and divides by
 * the zoom to reach world units: the same 4 CSS pixels of slack must cover more
 * world distance when the view is zoomed out. A test asserts that a point misses
 * at one zoom and hits at another for one unchanged CSS tolerance.
 */

import type { OccurrenceRef } from "@sentropic/diagram-core";

import { distanceToPolyline, polylineIntersectsRect, rectContainsPoint, rectContainsRect, rectsIntersect } from "./geometry.js";
import type { SceneFrame, SceneItem, SceneItemKind } from "./scene.js";
import { invert, worldToDevice, type Affine, type Camera, type Rect, type Vec2, type Viewport } from "./transform.js";
import { applyPoint } from "./transform.js";

export interface Hit {
  readonly kind: SceneItemKind;
  readonly occurrence: OccurrenceRef;
  /** The item's index in `SceneFrame.items`, so a caller can order two hits without re-sorting. */
  readonly paintIndex: number;
  readonly item: SceneItem;
}

export interface HitOptions {
  /** World-unit slack around an edge's polyline. An edge has no area of its own. */
  readonly edgeTolerance?: number;
  /** World-unit slack around a node rectangle and a port square. 0 keeps the shape exact. */
  readonly shapeTolerance?: number;
}

/** In world units. A stroke has width; zero tolerance would make an edge unhittable in practice. */
export const DEFAULT_EDGE_TOLERANCE = 3;

/** In CSS pixels, for the device-space entry point. */
export const DEFAULT_CSS_TOLERANCE = 4;

function itemContainsPoint(item: SceneItem, point: Vec2, options: HitOptions): boolean {
  const shapeTolerance = options.shapeTolerance ?? 0;
  if (item.kind === "edge") {
    return distanceToPolyline(point, item.path) <= (options.edgeTolerance ?? DEFAULT_EDGE_TOLERANCE);
  }
  if (shapeTolerance === 0) return rectContainsPoint(item.rect, point);
  return rectContainsPoint(
    {
      x: item.rect.x - shapeTolerance,
      y: item.rect.y - shapeTolerance,
      width: item.rect.width + 2 * shapeTolerance,
      height: item.rect.height + 2 * shapeTolerance,
    },
    point,
  );
}

/** Every item under a world point, TOPMOST FIRST. */
export function hitTestAll(frame: SceneFrame, point: Vec2, options: HitOptions = {}): readonly Hit[] {
  const hits: Hit[] = [];
  for (let index = frame.items.length - 1; index >= 0; index -= 1) {
    const item = frame.items[index]!;
    if (itemContainsPoint(item, point, options)) {
      hits.push({ kind: item.kind, occurrence: item.occurrence, paintIndex: index, item });
    }
  }
  return hits;
}

/** The topmost item under a world point, or `undefined`. */
export function hitTest(frame: SceneFrame, point: Vec2, options: HitOptions = {}): Hit | undefined {
  for (let index = frame.items.length - 1; index >= 0; index -= 1) {
    const item = frame.items[index]!;
    if (itemContainsPoint(item, point, options)) {
      return { kind: item.kind, occurrence: item.occurrence, paintIndex: index, item };
    }
  }
  return undefined;
}

export type RegionMode = "intersect" | "contain";

export interface RegionOptions {
  /**
   * `intersect` catches an item the rectangle touches; `contain` catches only an
   * item wholly inside it. Both exist because both are real marquee conventions
   * and no default can be right for the two of them - a caller states which.
   */
  readonly mode: RegionMode;
}

function itemInRegion(item: SceneItem, region: Rect, mode: RegionMode): boolean {
  if (item.kind === "edge") {
    return mode === "contain" ? rectContainsRect(region, item.bounds) : polylineIntersectsRect(item.path, region);
  }
  return mode === "contain" ? rectContainsRect(region, item.rect) : rectsIntersect(region, item.rect);
}

/**
 * Every item a world rectangle catches, in PAINT ORDER (bottom to top) rather
 * than topmost first: a region answer is a set, and returning it in the order it
 * is drawn keeps it comparable with the frame itself.
 *
 * `intersect` on an edge tests the POLYLINE, not its bounding box. A diagonal
 * edge's bounding box covers a large area it never crosses, and a marquee that
 * caught it there would select edges the user never touched.
 */
export function hitTestRegion(frame: SceneFrame, region: Rect, options: RegionOptions): readonly Hit[] {
  const hits: Hit[] = [];
  frame.items.forEach((item, index) => {
    if (itemInRegion(item, region, options.mode)) {
      hits.push({ kind: item.kind, occurrence: item.occurrence, paintIndex: index, item });
    }
  });
  return hits;
}

export interface DeviceHitOptions {
  /** Slack around an edge, in CSS pixels. Converted to world units through the zoom. */
  readonly cssEdgeTolerance?: number;
  /** Slack around a shape, in CSS pixels. */
  readonly cssShapeTolerance?: number;
}

/**
 * The inverse of the shared world -> view -> CSS pixel -> device pixel chain, or
 * `undefined` when the camera is singular (a `zoom` of 0, which `diagram-core`
 * refuses on a validated view but an unvalidated one can carry).
 */
export function deviceToWorld(camera: Camera, viewport: Viewport): Affine | undefined {
  return invert(worldToDevice(camera, viewport));
}

/**
 * The topmost item under a DEVICE point. Returns `undefined` both when nothing is
 * hit and when the transform has no inverse; a caller that needs to tell the two
 * apart validates the camera first with `validateCamera`.
 */
export function hitTestAtDevicePoint(
  frame: SceneFrame,
  camera: Camera,
  viewport: Viewport,
  devicePoint: Vec2,
  options: DeviceHitOptions = {},
): Hit | undefined {
  const inverse = deviceToWorld(camera, viewport);
  if (inverse === undefined) return undefined;
  const worldPoint = applyPoint(inverse, devicePoint);
  const cssEdge = options.cssEdgeTolerance ?? DEFAULT_CSS_TOLERANCE;
  const cssShape = options.cssShapeTolerance ?? 0;
  return hitTest(frame, worldPoint, {
    edgeTolerance: cssEdge / camera.zoom,
    shapeTolerance: cssShape / camera.zoom,
  });
}

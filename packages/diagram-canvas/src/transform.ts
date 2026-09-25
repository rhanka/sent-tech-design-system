/**
 * The ONE world -> view -> CSS pixel -> device pixel transform (study invariant 8,
 * second half, which `@sentropic/diagram-core` hands to this lot by name -
 * see its README, "What is not covered yet").
 *
 * WHY THIS MODULE IS THE FIRST ONE
 * Invariant 8 does not merely ask for a transform; it asks that ONE composition
 * serve rendering, selection and export. A selection path that rebuilt the
 * matrix its own way is how a click lands one pixel off a shape only at some
 * zoom levels. So the composition lives here, `hit.ts` calls it rather than
 * re-deriving it, and a test asserts that a hit taken at a device point and the
 * same hit taken in world coordinates name the same occurrence.
 *
 * WHAT `diagram-core` DOES AND DOES NOT SAY ABOUT THE CAMERA - measured, not
 * assumed. `PresentationState.camera` is `{ x, y, zoom }` and that is all:
 *   - `validateView` checks the three are finite and that `zoom > 0`
 *     (`packages/diagram-core/src/validate.ts`, the `finiteNumbers` call on
 *     `presentation.camera` and the `limit-exceeded` branch below it);
 *   - NOTHING in that package states what `x` and `y` MEAN. Neither `view.ts`,
 *     nor the README, nor a fixture says whether they are the world point at
 *     the viewport's top-left corner, the world point at its centre, or a
 *     translation already in view units. The comment on `PresentationState`
 *     says only that "a renderer adapter maps these three numbers to its own
 *     camera contract; that adapter is GD-M2-CANVAS work".
 * This module IS that contract, and it states the reading it fixes:
 *
 *   `camera.x`, `camera.y` are the WORLD point drawn at the view origin, and
 *   `camera.zoom` is CSS pixels per world unit.
 *
 * Chosen over "camera at the viewport centre" because it needs no viewport size:
 * `worldToView` is then a function of the camera alone, which is what lets a
 * scene be built, hit-tested and compared with no viewport at all - every test
 * in this package that does not concern device pixels runs without one. The
 * centre reading would have made the persisted camera meaningless on its own.
 *
 * `zoom > 0` is diagram-core's rule, so a VALIDATED view always yields an
 * invertible transform. This module does not assume validation: `invert`
 * returns `undefined` on a singular matrix instead of throwing or dividing by
 * zero, because a scene may be built from a view that was never validated.
 */

import { diagnostic, type Diagnostic } from "@sentropic/diagram-core";

export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

/** An axis-aligned rectangle. `width`/`height` MAY be negative here; see `geometry.ts`. */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** The three persisted numbers, structurally identical to `PresentationState.camera`. */
export interface Camera {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

/**
 * The host's surface. NOT persisted and not part of any view: a viewport is a
 * property of the window a view is being shown in, so it is passed in per call.
 * `devicePixelRatio` is a plain number here - this package never reads the
 * global of that name, which its `tsconfig.json` makes an unresolvable
 * identifier anyway.
 */
export interface Viewport {
  readonly cssWidth: number;
  readonly cssHeight: number;
  readonly devicePixelRatio: number;
}

/**
 * A 2D affine transform in the order SVG's `matrix(a b c d e f)` and Canvas2D's
 * `setTransform` use, so an adapter can hand it to either without reordering:
 *
 *   x' = a*x + c*y + e
 *   y' = b*x + d*y + f
 */
export interface Affine {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
  readonly f: number;
}

/**
 * NEGATIVE ZERO IS NORMALISED AWAY, everywhere this module produces a number.
 * Measured, not anticipated: `invert(IDENTITY)` returned
 * `{ a: 1, b: -0, c: -0, d: 1, e: -0, f: -0 }` on the first run of
 * tests/transform.test.ts, because every off-diagonal term is a negation of
 * zero. `-0 === 0` is true, so nothing misbehaved arithmetically - but
 * `Object.is(-0, 0)` is false, which is what a structural comparison uses, and
 * `canonicalise` writes both as `0`. So two frames could compare unequal while
 * hashing identically, which is the one thing a revision must never do. Adding
 * zero turns -0 into 0 and leaves every other value untouched, NaN included.
 */
const zeroed = (value: number): number => (value === 0 ? 0 : value);

export const IDENTITY: Affine = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

/** `compose(outer, inner)` applies `inner` first, then `outer`. */
export function compose(outer: Affine, inner: Affine): Affine {
  return {
    a: outer.a * inner.a + outer.c * inner.b,
    b: outer.b * inner.a + outer.d * inner.b,
    c: outer.a * inner.c + outer.c * inner.d,
    d: outer.b * inner.c + outer.d * inner.d,
    e: outer.a * inner.e + outer.c * inner.f + outer.e,
    f: outer.b * inner.e + outer.d * inner.f + outer.f,
  };
}

export function applyPoint(transform: Affine, point: Vec2): Vec2 {
  return {
    x: zeroed(transform.a * point.x + transform.c * point.y + transform.e),
    y: zeroed(transform.b * point.x + transform.d * point.y + transform.f),
  };
}

/**
 * The axis-aligned bounding box of a transformed rectangle, computed from the
 * FOUR corners and not from the origin plus a scaled extent. The four-corner
 * form is the same answer for the scale-and-translate transforms this module
 * builds today, and it stays correct the day a rotation is composed in; the
 * cheaper form would silently start returning a box that is not the hull.
 */
export function applyRect(transform: Affine, rect: Rect): Rect {
  const corners: readonly Vec2[] = [
    applyPoint(transform, { x: rect.x, y: rect.y }),
    applyPoint(transform, { x: rect.x + rect.width, y: rect.y }),
    applyPoint(transform, { x: rect.x, y: rect.y + rect.height }),
    applyPoint(transform, { x: rect.x + rect.width, y: rect.y + rect.height }),
  ];
  let minX = corners[0]!.x;
  let minY = corners[0]!.y;
  let maxX = minX;
  let maxY = minY;
  for (const corner of corners) {
    if (corner.x < minX) minX = corner.x;
    if (corner.x > maxX) maxX = corner.x;
    if (corner.y < minY) minY = corner.y;
    if (corner.y > maxY) maxY = corner.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * The inverse, or `undefined` when there is none. A `zoom` of 0 is refused by
 * `diagram-core`'s `validateView`, but an unvalidated view can carry one, and a
 * transform built from it is singular: answering `undefined` is what lets a
 * caller report that instead of propagating `Infinity` into a hit test.
 */
export function invert(transform: Affine): Affine | undefined {
  const determinant = transform.a * transform.d - transform.b * transform.c;
  if (!Number.isFinite(determinant) || determinant === 0) return undefined;
  const a = zeroed(transform.d / determinant);
  const b = zeroed(-transform.b / determinant);
  const c = zeroed(-transform.c / determinant);
  const d = zeroed(transform.a / determinant);
  return {
    a,
    b,
    c,
    d,
    e: zeroed(-(a * transform.e + c * transform.f)),
    f: zeroed(-(b * transform.e + d * transform.f)),
  };
}

/** World units -> CSS pixels, relative to the view origin. A function of the camera alone. */
export function worldToView(camera: Camera): Affine {
  return {
    a: camera.zoom,
    b: 0,
    c: 0,
    d: camera.zoom,
    e: -camera.x * camera.zoom,
    f: -camera.y * camera.zoom,
  };
}

/**
 * CSS pixels -> device pixels. A separate step, not folded into `worldToView`,
 * because the two have different lifetimes: the camera is persisted in the view
 * and the ratio belongs to the window, which can change under a scene that did
 * not move.
 */
export function viewToDevice(viewport: Viewport): Affine {
  return { a: viewport.devicePixelRatio, b: 0, c: 0, d: viewport.devicePixelRatio, e: 0, f: 0 };
}

/** The whole chain, and the only composition a renderer or a hit test should use. */
export function worldToDevice(camera: Camera, viewport: Viewport): Affine {
  return compose(viewToDevice(viewport), worldToView(camera));
}

/** The world rectangle a viewport shows under a camera. `undefined` if the camera is singular. */
export function visibleWorldRect(camera: Camera, viewport: Viewport): Rect | undefined {
  const inverse = invert(worldToView(camera));
  if (inverse === undefined) return undefined;
  return applyRect(inverse, { x: 0, y: 0, width: viewport.cssWidth, height: viewport.cssHeight });
}

/**
 * Camera diagnostics, using diagram-core's OWN codes and its own thresholds, so
 * a caller that already validated the view gets no second, differently worded
 * verdict: `value-not-finite` for a non-finite number and `limit-exceeded` for
 * `zoom <= 0` are exactly what `validateView` emits for the same two defects.
 */
export function validateCamera(camera: Camera, path = "camera"): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const [name, value] of [["x", camera.x], ["y", camera.y], ["zoom", camera.zoom]] as const) {
    if (!Number.isFinite(value)) {
      diagnostics.push(
        diagnostic({
          code: "value-not-finite",
          path: `${path}.${name}`,
          message: `${name} is ${String(value)}; geometry values are finite (study invariant 8)`,
        }),
      );
    }
  }
  if (Number.isFinite(camera.zoom) && camera.zoom <= 0) {
    diagnostics.push(
      diagnostic({
        code: "limit-exceeded",
        path: `${path}.zoom`,
        message: `zoom ${camera.zoom} must be strictly positive`,
        details: { zoom: camera.zoom },
      }),
    );
  }
  return diagnostics;
}

/** Viewport diagnostics. A viewport is this package's own type, so the rules are stated here. */
export function validateViewport(viewport: Viewport, path = "viewport"): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const numbers = [
    ["cssWidth", viewport.cssWidth],
    ["cssHeight", viewport.cssHeight],
    ["devicePixelRatio", viewport.devicePixelRatio],
  ] as const;
  for (const [name, value] of numbers) {
    if (!Number.isFinite(value)) {
      diagnostics.push(
        diagnostic({
          code: "value-not-finite",
          path: `${path}.${name}`,
          message: `${name} is ${String(value)}; a viewport is measured in finite pixels`,
        }),
      );
    }
  }
  // A zero-width viewport is legal (a panel collapsed to nothing still has a
  // camera); a NEGATIVE one is not, and neither is a ratio of zero, which would
  // make the device transform singular.
  if (Number.isFinite(viewport.cssWidth) && viewport.cssWidth < 0) {
    diagnostics.push(
      diagnostic({ code: "limit-exceeded", path: `${path}.cssWidth`, message: `cssWidth ${viewport.cssWidth} is negative` }),
    );
  }
  if (Number.isFinite(viewport.cssHeight) && viewport.cssHeight < 0) {
    diagnostics.push(
      diagnostic({ code: "limit-exceeded", path: `${path}.cssHeight`, message: `cssHeight ${viewport.cssHeight} is negative` }),
    );
  }
  if (Number.isFinite(viewport.devicePixelRatio) && viewport.devicePixelRatio <= 0) {
    diagnostics.push(
      diagnostic({
        code: "limit-exceeded",
        path: `${path}.devicePixelRatio`,
        message: `devicePixelRatio ${viewport.devicePixelRatio} must be strictly positive`,
        details: { devicePixelRatio: viewport.devicePixelRatio },
      }),
    );
  }
  return diagnostics;
}

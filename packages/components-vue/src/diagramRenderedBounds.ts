import { DEFAULT_MIN_READABLE_SCALE, type Rect } from '@sentropic/diagram-canvas';

/**
 * Steps per unit of the grid painted bounds are read on. Browsers lay out
 * and report rects on 1/64 CSS px (LayoutUnit), and `measureRenderedBounds`
 * rounds each outer edge outward to 1/64 world unit.
 */
export const RENDERED_BOUNDS_GRID_STEPS = 64;
const GRID = RENDERED_BOUNDS_GRID_STEPS;

/**
 * World-unit tolerance under which two painted-bounds reads are the same
 * bounds. It is the granularity of the measurement below, not a tuned
 * constant, which is why it lives with the measurement in the host:
 *
 * - a painted edge is read as `(edge − origin) / zoom`, both operands on the
 *   LayoutUnit grid, so a read places it within one LayoutUnit of screen
 *   space: `1 / (64 × zoom)` world unit;
 * - no read happens under the readability floor (the camera never applies
 *   a smaller zoom), where that step is at its widest: `1 / (64 × 0.45)`;
 * - the edge is then rounded outward to the 1/64 world-unit grid, which
 *   moves it by less than one more step;
 * - a stroke is added to its edge in world units, at one width for every
 *   zoom and interaction state (see `measureRenderedBounds`): it shifts
 *   both reads alike.
 *
 * Two reads of an unchanged edge, through any two transforms, therefore
 * differ by less than `(2 / 0.45 + 1) / 64` ≈ 0.085 world unit. On screen
 * that is more than `(1 + zoom) / 64` CSS px at every zoom the camera
 * applies: one LayoutUnit step read back through the outward rounding,
 * which spans up to `ceil(1 / zoom) / 64` world unit (2/64 at 0.62, 3/64 at
 * 0.45). A bare 1/64 CSS px is under that step: it refits on a flip of the
 * last grid step, and a fit then alternates between two transforms. At the
 * 0.62 cap the tolerance is 0.053 CSS px, far under the 1 CSS px paint
 * inset, so it cannot hide a real overflow.
 */
export const RENDERED_BOUNDS_REFIT_TOLERANCE = (2 / DEFAULT_MIN_READABLE_SCALE + 1) / GRID;

/**
 * Whether a painted-bounds read differs enough from the previous read of
 * the same scene to refit. The first read (`previous` absent) always fits:
 * the tolerance bounds the distance between two reads, not between a read
 * and the model geometry. From then on a fit is a fixed point: reading the
 * same paint again, through any transform, never moves it.
 */
export function shouldRefitRenderedBounds(previous: Rect | undefined, next: Rect): boolean {
  if (previous === undefined) return true;
  const delta = Math.max(
    Math.abs(next.x - previous.x),
    Math.abs(next.y - previous.y),
    Math.abs(next.x + next.width - previous.x - previous.width),
    Math.abs(next.y + next.height - previous.y - previous.height),
  );
  return delta > RENDERED_BOUNDS_REFIT_TOLERANCE;
}

/** Token default of a resting connector stroke, CSS px. */
const RESTING_EDGE_STROKE_WIDTH = 1.5;

/** Whether a computed colour paints nothing: `transparent` or a zero alpha. */
function isTransparent(color: string): boolean {
  const value = color.trim().toLowerCase();
  if (value === 'transparent') return true;
  // `rgb(0 0 0 / 0)` and the legacy four-component `rgba(0, 0, 0, 0)`; an
  // opaque `rgb(0, 0, 0)` has three components and no alpha.
  const alpha = /\/\s*([\d.]+%?)\s*\)$/.exec(value)?.[1] ?? /^(?:rgba|hsla)\([^,]+,[^,]+,[^,]+,\s*([\d.]+%?)\s*\)$/.exec(value)?.[1];
  return alpha !== undefined && parseFloat(alpha) === 0;
}

/** Whether an element removes itself and its subtree from the paint: not
 * rendered, fully transparent, or clipped to nothing (the screen-reader-only
 * idioms: `clip-path: inset(50%)`, `clip: rect(0 0 0 0)`, or an empty box
 * that clips its overflow). A client rect ignores all of these. */
function hidesSubtree(element: Element, style: CSSStyleDeclaration): boolean {
  if (style.display === 'none' || parseFloat(style.opacity) === 0) return true;
  if (style.clipPath === 'inset(50%)' || /^rect\((?:\s*0(?:px)?\s*,?){4}\)$/.test(style.clip ?? '')) return true;
  const overflow = style.overflowX || style.overflow;
  if (!overflow || overflow === 'visible') return false;
  const box = element.getBoundingClientRect();
  return box.width === 0 || box.height === 0;
}

/**
 * Resting width of a stroke, CSS px. A selected or hovered flow step is
 * drawn thicker (`data-flow-state`); that highlight is transient and must
 * not move the fit, so the read uses the width the connector rests at. The
 * thicker highlight stays inside the frame: the resting half-stroke is
 * framed at `zoom / DEFAULT_MIN_READABLE_SCALE` ≥ 1 times its size, next to
 * the 1 CSS px paint inset of the fit.
 */
function restingStrokeWidth(element: Element, style: CSSStyleDeclaration): number {
  const width = parseFloat(style.strokeWidth) || 0;
  const state = element.getAttribute('data-flow-state');
  if (state !== 'primary' && state !== 'related') return width;
  const token = element.hasAttribute('data-flow-step') ? '--st-component-diagramScene-flowStrokeWidth' : '--st-component-diagramZone-borderWidth';
  const resting = parseFloat(style.getPropertyValue(token));
  return Number.isFinite(resting) ? resting : Math.min(width, RESTING_EDGE_STROKE_WIDTH);
}

/**
 * Painted bounds in world units, after font/layout settling. DOM-free scene
 * geometry remains the SSR fallback. Include text ink and SVG strokes:
 * getBoundingClientRect alone excludes both text overshoot and stroke width.
 * `zoom` is the scale the world is painted at.
 *
 * The result does not depend on that scale, nor on a transient interaction
 * state, beyond the read granularity `RENDERED_BOUNDS_REFIT_TOLERANCE` covers:
 *
 * - a stroke that scales with the world has a constant world width;
 * - a `non-scaling-stroke` has a constant screen width, so its world width
 *   is `width / zoom`. It is framed at its widest, the one it has at the
 *   readability floor (`DEFAULT_MIN_READABLE_SCALE`, under which the camera
 *   never paints), at every zoom, and at its resting width;
 * - geometry that paints nothing is left out: flow hit targets
 *   (`[data-flow-hit]`, a transparent 16 px stroke), flow focus targets
 *   (`[data-flow-node]`, hidden at rest and sized in screen px), transparent
 *   strokes and text, shapes with neither stroke nor fill, and hidden or
 *   clipped subtrees.
 */
export function measureRenderedBounds(frame: HTMLElement, fallback: Rect | undefined, zoom: number): Rect | undefined {
  const world = frame.querySelector<HTMLElement>('.st-diagramSceneFigure-world');
  if (!world || !(zoom > 0)) return fallback;
  const first = world.querySelector('[data-scene-occurrence],[data-scene-label]')?.getBoundingClientRect();
  if (!first || first.width === 0 && first.height === 0) return fallback;
  const origin = world.getBoundingClientRect();
  let left = fallback?.x ?? Infinity, top = fallback?.y ?? Infinity;
  let right = fallback === undefined ? -Infinity : fallback.x + fallback.width;
  let bottom = fallback === undefined ? -Infinity : fallback.y + fallback.height;
  let measured = false;
  /** `pad` is the half-stroke around the box, world units. */
  const include = (box: DOMRect, pad = 0) => {
    if (box.width === 0 && box.height === 0) return;
    measured = true;
    left = Math.min(left, (box.left - origin.left) / zoom - pad);
    top = Math.min(top, (box.top - origin.top) / zoom - pad);
    right = Math.max(right, (box.right - origin.left) / zoom + pad);
    bottom = Math.max(bottom, (box.bottom - origin.top) / zoom + pad);
  };
  const styles = new Map<Element, CSSStyleDeclaration>();
  const styleOf = (element: Element) => {
    let style = styles.get(element);
    if (style === undefined) styles.set(element, style = getComputedStyle(element));
    return style;
  };
  const shown = new Map<Element, boolean>();
  /** No ancestor up to the world hides or clips the element away. */
  const inPaintedSubtree = (element: Element | null): boolean => {
    if (element === null || element === world) return true;
    let known = shown.get(element);
    if (known === undefined) shown.set(element, known = !hidesSubtree(element, styleOf(element)) && inPaintedSubtree(element.parentElement));
    return known;
  };
  // `visibility` is inherited and a descendant can restore it: only the
  // computed value of the painting element itself counts.
  const paints = (element: Element) => !element.closest('defs,[hidden],[data-flow-hit],[data-flow-node]')
    && styleOf(element).visibility !== 'hidden' && styleOf(element).visibility !== 'collapse' && inPaintedSubtree(element);
  for (const element of world.querySelectorAll('[data-scene-occurrence],.st-diagramCard,.st-diagramZone,[data-scene-label],[data-diagram-icon],.st-badge,[data-badge],.st-diagramCard-rule,.st-diagramZone-rule,.st-diagramZone-footerRule,button,svg polyline,svg path,svg line,svg rect,svg text')) {
    if (!paints(element)) continue;
    const style = styleOf(element);
    let pad = 0;
    const stroked = !!style.stroke && style.stroke !== 'none' && !isTransparent(style.stroke) && parseFloat(style.strokeOpacity) !== 0;
    // A shape with neither a painted stroke nor a painted fill is geometry only.
    if (!stroked && element instanceof SVGElement && (style.fill === 'none' || isTransparent(style.fill || '') || parseFloat(style.fillOpacity) === 0)) continue;
    if (stroked) {
      if (style.vectorEffect === 'non-scaling-stroke') pad = restingStrokeWidth(element, style) / 2 / DEFAULT_MIN_READABLE_SCALE;
      else {
        const matrix = (element as SVGGraphicsElement).getScreenCTM?.();
        const scale = matrix ? Math.max(Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d)) : zoom;
        pad = (parseFloat(style.strokeWidth) || 0) / 2 * scale / zoom;
      }
    }
    include(element.getBoundingClientRect(), pad);
  }
  const walker = frame.ownerDocument.createTreeWalker(world, 4);
  let text: Node | null;
  while ((text = walker.nextNode())) {
    const parent = text.parentElement;
    if (!text.textContent?.trim() || !parent || parent.closest('title,desc') || !paints(parent)) continue;
    const style = styleOf(parent);
    // SVG text is filled; HTML text takes `color`.
    if (isTransparent(parent instanceof SVGElement ? style.fill || '' : style.color || '')) continue;
    const range = frame.ownerDocument.createRange();
    range.selectNodeContents(text);
    if (typeof range.getClientRects === 'function') for (const box of range.getClientRects()) include(box);
  }
  if (!measured || !Number.isFinite(left)) return fallback;
  // CSS layout uses a 1/64 px grid. Always round the outer edges outward.
  // `RENDERED_BOUNDS_REFIT_TOLERANCE` is derived from this same grid.
  const x = Math.floor(left * GRID) / GRID, y = Math.floor(top * GRID) / GRID;
  const width = Math.ceil(right * GRID) / GRID - x, height = Math.ceil(bottom * GRID) / GRID - y;
  // Paint that stays inside the model bounds is the model bounds: hosts
  // compare by identity, so an unchanged rect must not look like a new read.
  if (fallback !== undefined && x === fallback.x && y === fallback.y && width === fallback.width && height === fallback.height) return fallback;
  return { x, y, width, height };
}

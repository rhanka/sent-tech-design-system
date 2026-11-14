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
 *   moves it by less than one more step.
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

/** Painted bounds in world units, after font/layout settling. DOM-free
 * scene geometry remains the SSR fallback. Include text ink and SVG strokes:
 * getBoundingClientRect alone excludes both text overshoot and stroke width.
 * `zoom` is the scale the world is painted at. */
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
  const include = (box: DOMRect, stroke = 0) => {
    if (box.width === 0 && box.height === 0) return;
    measured = true;
    left = Math.min(left, (box.left - origin.left - stroke) / zoom);
    top = Math.min(top, (box.top - origin.top - stroke) / zoom);
    right = Math.max(right, (box.right - origin.left + stroke) / zoom);
    bottom = Math.max(bottom, (box.bottom - origin.top + stroke) / zoom);
  };
  for (const element of world.querySelectorAll('[data-scene-occurrence],.st-diagramCard,.st-diagramZone,[data-scene-label],[data-diagram-icon],.st-badge,[data-badge],.st-diagramCard-rule,.st-diagramZone-rule,.st-diagramZone-footerRule,button,svg polyline,svg path,svg line,svg rect,svg text')) {
    if (element.closest('defs')) continue;
    const style = getComputedStyle(element);
    const width = style.stroke && style.stroke !== 'none' ? parseFloat(style.strokeWidth) || 0 : 0;
    const matrix = (element as SVGGraphicsElement).getScreenCTM?.();
    const scale = matrix ? Math.max(Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d)) : zoom;
    const stroke = width / 2 * (style.vectorEffect === 'non-scaling-stroke' ? 1 : scale);
    include(element.getBoundingClientRect(), stroke);
  }
  const walker = frame.ownerDocument.createTreeWalker(world, 4);
  let text: Node | null;
  while ((text = walker.nextNode())) {
    if (!text.textContent?.trim() || text.parentElement?.closest('defs,title,desc,[hidden]')) continue;
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

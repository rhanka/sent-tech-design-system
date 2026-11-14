import type { Rect } from '@sentropic/diagram-canvas';
import { RENDERED_BOUNDS_GRID_STEPS as GRID } from '@sentropic/diagram-canvas/diagramSceneModel';

/** Painted bounds in world units, after font/layout settling. DOM-free
 * scene geometry remains the SSR fallback. Include text ink and SVG strokes:
 * getBoundingClientRect alone excludes both text overshoot and stroke width. */
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

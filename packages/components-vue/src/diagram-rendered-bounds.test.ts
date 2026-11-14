import { afterEach, expect, it, vi } from 'vitest';
import type { Rect } from '@sentropic/diagram-canvas';
import * as svelteHost from '../../components-svelte/src/lib/diagramRenderedBounds.js';
import * as vueHost from './diagramRenderedBounds.js';
import { sceneFit, scenePlacement } from './diagramSceneModel.js';
afterEach(() => vi.restoreAllMocks());

/**
 * The scene hosts' fit loop over the pure model. The world is painted at
 * the fit transform (or at an interactive zoom), painted rects land on the
 * 1/64 CSS px grid, and a read divides them back by the painted scale,
 * unions them with the model bounds and rounds outward to 1/64 world unit,
 * as `measureRenderedBounds` does. `ajuster` returns the distance of the
 * read to the previous one, world units.
 */
function hostLoop(shouldRefit: typeof vueHost.shouldRefitRenderedBounds, model: Rect, initialPaint: Rect, viewWidth: number) {
  const snap = (px: number) => Math.round(px * 64) / 64;
  let painted = initialPaint;
  let read: Rect | undefined;
  const frame = () => {
    const bounds = read ?? model;
    const fit = sceneFit({ bounds, viewWidth, windowHeight: 900 });
    return { bounds, fit };
  };
  return {
    paint(next: Rect) { painted = next; },
    ajuster(interactiveZoom?: number): number {
      const { bounds, fit } = frame();
      const zoom = interactiveZoom ?? fit.zoom;
      const placement = scenePlacement(bounds, zoom, fit);
      const edge = (world: number, translate: number) => (snap(translate + world * zoom) - snap(translate)) / zoom;
      const left = Math.min(model.x, edge(painted.x, placement.translateX));
      const top = Math.min(model.y, edge(painted.y, placement.translateY));
      const right = Math.max(model.x + model.width, edge(painted.x + painted.width, placement.translateX));
      const bottom = Math.max(model.y + model.height, edge(painted.y + painted.height, placement.translateY));
      const x = Math.floor(left * 64) / 64, y = Math.floor(top * 64) / 64;
      const next = { x, y, width: Math.ceil(right * 64) / 64 - x, height: Math.ceil(bottom * 64) / 64 - y };
      const distance = read === undefined ? 0 : Math.max(Math.abs(next.x - read.x), Math.abs(next.y - read.y),
        Math.abs(next.x + next.width - read.x - read.width), Math.abs(next.y + next.height - read.y - read.height));
      if (shouldRefit(read, next)) read = next;
      return distance;
    },
    state() {
      const { bounds, fit } = frame();
      return { bounds, zoom: fit.zoom, fitHeight: fit.fitHeight, placement: scenePlacement(bounds, fit.zoom, fit) };
    },
  };
}

for (const [host, bounds] of [['Svelte', svelteHost], ['Vue', vueHost]] as const) {
  const { measureRenderedBounds: measure, shouldRefitRenderedBounds, RENDERED_BOUNDS_GRID_STEPS, RENDERED_BOUNDS_REFIT_TOLERANCE } = bounds;
  it(`should fit ${host} text, badges, toggles and non-scaling strokes, rounding outwards`, () => {
    const frame = document.createElement('div');
    frame.innerHTML = '<div class="st-diagramSceneFigure-world"><div data-scene-occurrence="card"><button>Toggle</button><svg data-diagram-icon="badge"><path/></svg></div><div data-scene-label="occurrence:rel-arch-16">appelle · MCP distant OAuth</div><svg><polyline style="stroke:black;stroke-width:1.5px;vector-effect:non-scaling-stroke"/></svg></div>';
    const world = frame.firstElementChild!;
    const screen = (x: number, y: number, width: number, height: number) => new DOMRect(100 + x * .62, 200 + y * .62, width * .62, height * .62);
    vi.spyOn(world, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 200, 0, 0));
    vi.spyOn(frame.querySelector('[data-scene-occurrence]')!, 'getBoundingClientRect').mockReturnValue(screen(0, 0, 460, 200));
    vi.spyOn(frame.querySelector('button')!, 'getBoundingClientRect').mockReturnValue(screen(421.001, -32.001, 32, 32));
    vi.spyOn(frame.querySelector('[data-diagram-icon]')!, 'getBoundingClientRect').mockReturnValue(screen(-10.001, 10, 70, 70));
    vi.spyOn(frame.querySelector('[data-scene-label]')!, 'getBoundingClientRect').mockReturnValue(screen(389.015625, -26, 237.953125, 22));
    vi.spyOn(frame.querySelector('polyline')!, 'getBoundingClientRect').mockReturnValue(screen(0, 204.001, 627.001, 0));
    const range = { selectNodeContents: vi.fn(), getClientRects: () => [screen(389.015625, -27, 237.953125, 24)] };
    vi.spyOn(frame.ownerDocument, 'createRange').mockReturnValue(range as unknown as Range);
    const bounds = measure(frame, { x: 0, y: -26, width: 627, height: 230.001 }, .62)!;
    expect(bounds.x).toBe(-10.015625);
    expect(bounds.y).toBe(-32.015625);
    expect(bounds.x + bounds.width).toBeGreaterThanOrEqual(627.001 + .75 / .62);
    expect(bounds.y + bounds.height).toBeGreaterThanOrEqual(204.001 + .75 / .62);
    expect(bounds.x * 64).toBe(Math.floor(bounds.x * 64));
    expect(bounds.y * 64).toBe(Math.floor(bounds.y * 64));
  });
  it(`should hand ${host} the model bounds back, by identity, when the paint stays inside them`, () => {
    const frame = document.createElement('div');
    frame.innerHTML = '<div class="st-diagramSceneFigure-world"><div data-scene-occurrence="card"></div></div>';
    const world = frame.firstElementChild!;
    vi.spyOn(world, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 200, 0, 0));
    const paint = vi.spyOn(frame.querySelector('[data-scene-occurrence]')!, 'getBoundingClientRect');
    // On the 1/64 world grid, as layout bounds are: nothing to round outward.
    const model = { x: -12.5, y: -26, width: 640.25, height: 230 };
    paint.mockReturnValue(new DOMRect(100, 200, 460 * .62, 200 * .62));
    expect(measure(frame, model, .62)).toBe(model);
    // Ink past the model bounds is a new rect, never the model object.
    paint.mockReturnValue(new DOMRect(100 - 20 * .62, 200, 460 * .62, 200 * .62));
    const grown = measure(frame, model, .62)!;
    expect(grown).not.toBe(model);
    expect(grown.x).toBeLessThan(model.x);
  });
  it(`should keep a single ${host} fixed point when Ajuster is repeated, at capped, uncapped and floored fits`, () => {
    // h-cond probe D1/D2 bounds. The painted bounds overshoot the model, as
    // text ink and strokes do.
    const model = { x: -634.6, y: -44, width: 1900, height: 300 };
    const zooms = new Set<number>();
    let widestFlipPx = 0;
    for (const viewWidth of [1440, 1206, 1000, 900, 700]) for (let step = 0; step < 40; step++) {
      const painted = { x: model.x - 3.2 - step * 0.37, y: model.y - 7.1 - step * 0.11,
        width: model.width + 9.3 + step * 0.53, height: model.height + 12.7 + step * 0.29 };
      const loop = hostLoop(shouldRefitRenderedBounds, model, painted, viewWidth);
      loop.ajuster();
      const settled = loop.state();
      zooms.add(settled.zoom);
      for (let repeat = 0; repeat < 6; repeat++) {
        widestFlipPx = Math.max(widestFlipPx, loop.ajuster() * settled.zoom);
        expect(loop.state(), `${viewWidth}/${step}/${repeat}`).toEqual(settled);
      }
      // « Ajuster » from an interactive zoom reads through another transform.
      loop.ajuster(0.62);
      expect(loop.state(), `${viewWidth}/${step}/zoomed`).toEqual(settled);
      // A real change of the paint still refits, once.
      loop.paint({ ...painted, width: painted.width + 1 });
      loop.ajuster();
      const grown = loop.state();
      expect(grown.bounds.width, `${viewWidth}/${step}/grown`).toBeGreaterThan(settled.bounds.width + 0.9);
      loop.ajuster();
      expect(loop.state(), `${viewWidth}/${step}/grown`).toEqual(grown);
    }
    // The sweep covers the cap, the floor and uncapped fits between them…
    expect(zooms.has(0.62) && zooms.has(0.45)).toBe(true);
    expect([...zooms].some(zoom => zoom > 0.45 && zoom < 0.62)).toBe(true);
    // …and reads that flip by more than 1/64 CSS px, the step a fit ignores.
    expect(widestFlipPx).toBeGreaterThan(1 / 64);
  });
  it(`should hold two ${host} reads of an unchanged edge within the refit tolerance at every grid alignment`, () => {
    const snap = (px: number) => Math.round(px * 64) / 64;
    const read = (edge: number, translate: number, zoom: number) =>
      Math.floor(((snap(translate + edge * zoom) - snap(translate)) / zoom) * 64) / 64;
    const widest = (zoomA: number, zoomB: number) => {
      let flip = 0;
      for (let i = 0; i < 4000; i++) {
        const edge = -700 + i * 0.3713;
        flip = Math.max(flip, Math.abs(read(edge, 392.713 + i * 0.0131, zoomA) - read(edge, 27.307 + i * 0.0173, zoomB)));
      }
      return flip;
    };
    // One LayoutUnit step read back at the same scale spans ceil(1 / zoom)
    // world steps: 2/64 at 0.62, 3/64 at 0.45, more than 1/64 CSS px.
    expect(widest(0.62, 0.62)).toBe(2 / 64);
    expect(widest(0.45, 0.45)).toBe(3 / 64);
    expect(widest(0.62, 0.62) * 0.62).toBeGreaterThan(1 / 64);
    expect(widest(0.45, 0.45) * 0.45).toBeGreaterThan(1 / 64);
    for (const [zoomA, zoomB] of [[0.45, 0.45], [0.5, 0.5], [0.521, 0.522], [0.62, 0.62], [0.45, 0.62], [0.62, 0.45]] as const) {
      expect(widest(zoomA, zoomB), `${zoomA}/${zoomB}`).toBeLessThan(RENDERED_BOUNDS_REFIT_TOLERANCE);
      // At least one LayoutUnit step after the outward rounding, in CSS px.
      expect(RENDERED_BOUNDS_REFIT_TOLERANCE * zoomB).toBeGreaterThan((1 + zoomB) / RENDERED_BOUNDS_GRID_STEPS);
    }
    expect(RENDERED_BOUNDS_GRID_STEPS).toBe(64);
    expect(RENDERED_BOUNDS_REFIT_TOLERANCE).toBe((2 / 0.45 + 1) / 64);
    const rect = { x: -634.6, y: -44, width: 1900, height: 300 };
    expect(shouldRefitRenderedBounds(undefined, rect)).toBe(true);
    expect(shouldRefitRenderedBounds(rect, { ...rect })).toBe(false);
    for (const edge of ['x', 'y', 'width', 'height'] as const) {
      expect(shouldRefitRenderedBounds(rect, { ...rect, [edge]: rect[edge] + 3 / 64 }), edge).toBe(false);
      expect(shouldRefitRenderedBounds(rect, { ...rect, [edge]: rect[edge] - 3 / 64 }), edge).toBe(false);
      expect(shouldRefitRenderedBounds(rect, { ...rect, [edge]: rect[edge] + 0.1 }), edge).toBe(true);
      expect(shouldRefitRenderedBounds(rect, { ...rect, [edge]: rect[edge] - 0.1 }), edge).toBe(true);
    }
  });
}

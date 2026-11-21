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

/**
 * A jsdom world painted through `translate(tx, ty) scale(zoom)`: every
 * element listed in `paint` reports its world rect through that transform,
 * on the 1/64 CSS px layout grid; a text node reports the rect listed for
 * its parent in `ink`. Strokes are not in a client rect: they come from the
 * computed style, as in a browser.
 */
function paintedWorld(html: string, paint: Record<string, Rect>, ink: Record<string, Rect> = {}) {
  const snap = (px: number) => Math.round(px * 64) / 64;
  const frame = document.createElement('div');
  frame.innerHTML = `<div class="st-diagramSceneFigure-world">${html}</div>`;
  document.body.append(frame);
  const world = frame.firstElementChild!;
  const camera = { tx: 100, ty: 200, zoom: 0.62 };
  const screen = (rect: Rect) => {
    const left = snap(camera.tx + rect.x * camera.zoom), top = snap(camera.ty + rect.y * camera.zoom);
    return new DOMRect(left, top, snap(camera.tx + (rect.x + rect.width) * camera.zoom) - left, snap(camera.ty + (rect.y + rect.height) * camera.zoom) - top);
  };
  const rectOf = (element: Element, rects: Record<string, Rect>) => Object.entries(rects).find(([selector]) => element.matches(selector))?.[1];
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function(this: Element) {
    if (this === world) return new DOMRect(snap(camera.tx), snap(camera.ty), 0, 0);
    const rect = rectOf(this, paint);
    return rect === undefined ? new DOMRect() : screen(rect);
  });
  vi.spyOn(document, 'createRange').mockImplementation(() => {
    let node: Node | undefined;
    return { selectNodeContents(selected: Node) { node = selected; },
      getClientRects() { const rect = node?.parentElement ? rectOf(node.parentElement, ink) : undefined; return rect === undefined ? [] : [screen(rect)]; } } as unknown as Range;
  });
  return { frame, world, camera, dispose: () => frame.remove() };
}
const within = (a: Rect, b: Rect) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y),
  Math.abs(a.x + a.width - b.x - b.width), Math.abs(a.y + a.height - b.y - b.height));

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
    // A screen-constant stroke is framed at the world width it has at the
    // readability floor, whatever the painted scale (.62 here).
    expect(bounds.x + bounds.width).toBe(Math.ceil((627.001 + .75 / .45) * 64) / 64);
    expect(bounds.y + bounds.height).toBe(Math.ceil((204.001 + .75 / .45) * 64) / 64);
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
  it(`should read ${host} non-scaling strokes at one world width at every zoom, and keep Ajuster a fixed point after an interactive zoom`, () => {
    // Connectors on the outer perimeter of the model bounds, as orthogonal
    // routes and self-relations are: the half-stroke is the outermost ink.
    const model = { x: 0, y: 0, width: 2398, height: 400 };
    const edge = 'class="st-diagramSceneFigure-edge" data-scene-edge="e" data-flow-step="r" style="stroke:rgb(100, 116, 139);stroke-width:1.5px;vector-effect:non-scaling-stroke"';
    const view = paintedWorld(`<div data-scene-occurrence="card"></div><svg><polyline ${edge}/></svg>`,
      { '[data-scene-occurrence]': { x: 40, y: 40, width: 460, height: 200 }, 'polyline': model });
    const pad = 0.75 / 0.45;
    const reads = [0.45, 0.499, 0.5, 0.54, 0.62].map(zoom => {
      Object.assign(view.camera, { zoom, tx: 12.3 + zoom, ty: 45.6 - zoom });
      return measure(view.frame, model, zoom)!;
    });
    for (const read of reads) {
      // The stroke was read: the bounds are wider than the model…
      expect(read).not.toBe(model);
      // …by the half-stroke at the readability floor, on each side.
      expect(within(read, { x: -pad, y: -pad, width: model.width + 2 * pad, height: model.height + 2 * pad })).toBeLessThan(RENDERED_BOUNDS_REFIT_TOLERANCE);
      // No zoom reads a narrower frame than the stroke needs on screen.
      expect(-read.x).toBeGreaterThanOrEqual(pad);
      for (const other of reads) expect(shouldRefitRenderedBounds(other, read)).toBe(false);
    }
    // The host loop over the real measurement: fit, zoom in, Ajuster.
    const polyline = view.world.querySelector<SVGElement>('polyline')!;
    for (const viewWidth of [1202, 1100, 1000, 900]) {
      let read: Rect | undefined;
      const state = () => {
        const bounds = read ?? model;
        const fit = sceneFit({ bounds, viewWidth, windowHeight: 900 });
        return { bounds, zoom: fit.zoom, fitHeight: fit.fitHeight, placement: scenePlacement(bounds, fit.zoom, fit) };
      };
      const ajuster = (interactiveZoom?: number) => {
        const { bounds, zoom: fitZoom } = state();
        const zoom = interactiveZoom ?? fitZoom;
        const placement = scenePlacement(bounds, zoom, sceneFit({ bounds, viewWidth, windowHeight: 900 }));
        Object.assign(view.camera, { zoom, tx: placement.translateX, ty: placement.translateY });
        const next = measure(view.frame, model, zoom)!;
        if (next !== model && shouldRefitRenderedBounds(read, next)) read = next;
      };
      ajuster();
      ajuster();
      const settled = state();
      expect(settled.bounds).not.toBe(model);
      for (const zoom of [0.54, 0.62, settled.zoom * 1.2, 0.62, undefined, 0.45]) {
        ajuster(zoom);
        expect(state(), `${viewWidth}/${zoom}`).toEqual(settled);
      }
      // A selected or hovered flow step is drawn thicker: transient, the
      // fit stays where it is, at the fit zoom and from an interactive one.
      for (const [flowState, width] of [['primary', '2.5px'], ['related', '2px']] as const) {
        polyline.setAttribute('data-flow-state', flowState);
        polyline.style.strokeWidth = width;
        for (const zoom of [undefined, 0.62, 0.45]) {
          ajuster(zoom);
          expect(state(), `${viewWidth}/${flowState}/${zoom}`).toEqual(settled);
        }
        polyline.removeAttribute('data-flow-state');
        polyline.style.strokeWidth = '1.5px';
      }
      // A resting stroke that really is wider still refits.
      polyline.style.strokeWidth = '6px';
      ajuster();
      expect(state().bounds.width).toBeGreaterThan(settled.bounds.width + 2 * (3 - 0.75) / 0.45 - 0.1);
      polyline.style.strokeWidth = '1.5px';
    }
    // Highlighted, the read is the resting read itself.
    Object.assign(view.camera, { zoom: 0.5, tx: 7, ty: 9 });
    const resting = measure(view.frame, model, 0.5);
    polyline.setAttribute('data-flow-state', 'primary');
    polyline.style.strokeWidth = '2.5px';
    expect(measure(view.frame, model, 0.5)).toEqual(resting);
    view.dispose();
  });
  it(`should leave ${host} hit targets, hidden focus targets, clipped descriptions and transparent ink out of the painted bounds`, () => {
    const model = { x: 10, y: 20, width: 640, height: 320 };
    const far = { x: -400, y: -300, width: 1600, height: 1200 };
    const html = (hit: string, node: string, description: string, toggle: string, extra = '') => `<div data-scene-occurrence="card"><button class="st-diagramErd-toggle" style="${toggle}">Entity</button></div>
      <svg><polyline class="st-diagramSceneFigure-edge" data-scene-edge="e" style="stroke:rgb(0, 0, 0);stroke-width:1.5px;vector-effect:non-scaling-stroke"/>
      <polyline class="st-diagramSceneFigure-flowHit" ${hit}/></svg>
      <button class="st-diagramSceneFigure-flowNode" ${node}></button>
      <span class="st-diagramSceneFigure-flowDescription" style="${description}">Step 1 from control to server</span>${extra}`;
    const paint = { '[data-scene-occurrence]': { x: 40, y: 40, width: 460, height: 200 }, '.st-diagramErd-toggle': { x: 40, y: 40, width: 460, height: 32 },
      '[data-scene-edge]': { x: 60, y: 60, width: 300, height: 100 },
      // The hit target follows the model perimeter: 8 world units of stroke would overflow it.
      '.st-diagramSceneFigure-flowHit': model, '.st-diagramSceneFigure-flowNode': far, '.probe': far };
    const ink = { '.st-diagramErd-toggle': far, '.st-diagramSceneFigure-flowDescription': far, '.probe': far, '.probe *': far };
    const read = (markup: string, zoom = 0.62) => {
      const view = paintedWorld(markup, paint, ink);
      view.camera.zoom = zoom;
      const bounds = measure(view.frame, model, zoom);
      view.dispose();
      vi.restoreAllMocks();
      return bounds;
    };
    const hit = 'data-flow-hit="e" style="stroke:rgba(0, 0, 0, 0);stroke-width:16px"';
    const node = 'data-flow-node="n" style="opacity:0"';
    const clipped = 'position:absolute;clip-path:inset(50%);width:0;height:0;overflow:hidden';
    const toggle = 'color:rgba(0, 0, 0, 0)';
    // Nothing of the above paints: the model bounds come back, by identity,
    // at every zoom.
    for (const zoom of [0.45, 0.54, 0.62]) expect(read(html(hit, node, clipped, toggle), zoom), String(zoom)).toBe(model);
    // Each exclusion on its own, through the computed style and not the
    // flow attributes or class names.
    const plain = html(hit, node, clipped, toggle);
    for (const [name, extra] of [
      ['transparent stroke', '<svg><path class="probe" style="fill:none;stroke:transparent;stroke-width:16px"/></svg>'],
      ['zero stroke opacity', '<svg><path class="probe" style="fill:none;stroke:rgb(0, 0, 0);stroke-opacity:0;stroke-width:16px"/></svg>'],
      ['slash alpha stroke', '<svg><path class="probe" style="fill:none;stroke:rgb(0 0 0 / 0);stroke-width:16px"/></svg>'],
      ['transparent fill', '<svg><rect class="probe" style="fill:rgba(0, 0, 0, 0)"/></svg>'],
      ['opacity 0', '<button class="probe" style="opacity:0">hidden</button>'],
      ['opacity 0 ancestor', '<div style="opacity:0"><button class="probe">hidden</button></div>'],
      ['display none', '<div style="display:none"><button class="probe">hidden</button></div>'],
      ['visibility hidden', '<button class="probe" style="visibility:hidden">hidden</button>'],
      ['clip-path', '<span class="probe" style="clip-path:inset(50%)">clipped</span>'],
      ['clip-path ancestor', '<div style="clip-path:inset(50%)"><span class="probe">clipped</span></div>'],
      ['legacy clip', '<span class="probe" style="position:absolute;clip:rect(0px, 0px, 0px, 0px)">clipped</span>'],
      ['transparent text', '<span class="probe" style="color:transparent">unpainted</span>'],
      ['hidden attribute', '<span class="probe" hidden>unpainted</span>'],
    ] as const) {
      expect(read(plain + extra), name).toBe(model);
    }
    // Discrimination: the same geometry, painted, is framed.
    const grownBy = (markup: string) => {
      const bounds = read(markup)!;
      expect(bounds).not.toBe(model);
      return { left: model.x - bounds.x, right: bounds.x + bounds.width - model.x - model.width };
    };
    // An opaque black stroke (three components, no alpha) is ink: 8 world units a side.
    const stroked = grownBy(html('data-flow-step="r" style="stroke:rgb(0, 0, 0);stroke-width:16px"', node, clipped, toggle));
    expect(stroked.left).toBe(8);
    expect(stroked.right).toBe(8);
    expect(grownBy(plain + '<svg><rect class="probe" style="fill:rgb(0, 0, 0)"/></svg>').left).toBeGreaterThanOrEqual(410);
    expect(grownBy(plain + '<svg><path class="probe" style="fill:none;stroke:rgb(0, 0, 0);stroke-width:2px"/></svg>').left).toBeGreaterThanOrEqual(410);
    expect(grownBy(plain + '<button class="probe" style="opacity:1">shown</button>').left).toBeGreaterThanOrEqual(410);
    expect(grownBy(plain + '<span class="probe" style="color:rgb(0, 0, 0)">painted</span>').left).toBeGreaterThanOrEqual(410);
    expect(grownBy(html(hit, node, 'position:absolute', toggle)).left).toBeGreaterThanOrEqual(410);
    expect(grownBy(html(hit, node, clipped, 'color:rgb(0, 0, 0)')).left).toBeGreaterThanOrEqual(410);
    // A focus target is sized in screen px (24 / zoom world units) and
    // painted only while focused: it never moves the fit.
    expect(read(html(hit, 'data-flow-node="n" style="opacity:1"', clipped, toggle))).toBe(model);
  });
  it(`should keep in the ${host} painted bounds what a fold transition is fading in: connectors, edge labels and entering nodes`, () => {
    const model = { x: 10, y: 20, width: 640, height: 320 };
    const far = { x: -400, y: -300, width: 1600, height: 1200 };
    const card = '<div class="st-diagramSceneFigure-node" data-scene-occurrence="card"></div>';
    const stroke = 'style="fill:none;stroke:rgb(0, 0, 0);stroke-width:1.5px;vector-effect:non-scaling-stroke"';
    const paint = { '[data-scene-occurrence="card"]': { x: 40, y: 40, width: 460, height: 200 }, '.probe': far };
    const read = (markup: string) => {
      const view = paintedWorld(card + markup, paint, { '.probe': far });
      const bounds = measure(view.frame, model, 0.62);
      view.dispose();
      vi.restoreAllMocks();
      return bounds!;
    };
    const pad = 1.5 / 2 / 0.45;
    // The first frame of a transition: the eased opacity is exactly 0.
    for (const [name, markup, stroked] of [
      ['connector layer', `<svg class="st-diagramSceneFigure-edges" style="opacity:0"><polyline class="probe st-diagramSceneFigure-edge" data-scene-edge="e" ${stroke}/></svg>`, true],
      ['edge label', '<div class="probe st-diagramSceneFigure-edgeLabel" data-scene-label="l" style="opacity:0"><span>label</span></div>', false],
      ['entering node', '<div class="probe st-diagramSceneFigure-node" data-scene-occurrence="entering" style="opacity:0"></div>', false],
      ['card of an entering node', '<div class="st-diagramSceneFigure-node" data-scene-occurrence="entering" style="opacity:0"><div class="probe st-diagramCard"></div></div>', false],
      ['link legend', '<aside class="probe st-diagramSceneFigure-legend" data-scene-legend="" style="opacity:0"><span>Legend</span></aside>', false],
    ] as const) {
      const bounds = read(markup);
      expect(bounds, name).not.toBe(model);
      expect(far.x - bounds.x, name).toBeGreaterThanOrEqual(stroked ? pad : 0);
      expect(far.x - bounds.x, name).toBeLessThan((stroked ? pad : 0) + RENDERED_BOUNDS_REFIT_TOLERANCE);
      expect(bounds.width, name).toBeGreaterThanOrEqual(far.width);
      // Mid-fade and settled, the same element reads the same bounds.
      expect(read(markup.replace('opacity:0', 'opacity:0.5')), name).toEqual(bounds);
      expect(read(markup.replace('opacity:0', 'opacity:1')), name).toEqual(bounds);
    }
    // Zero opacity anywhere else is still a hidden element, at rest.
    expect(read('<div class="probe" data-scene-label="l" style="opacity:0"><span>label</span></div>')).toBe(model);
    expect(read('<div style="opacity:0"><div class="probe st-diagramSceneFigure-edgeLabel" data-scene-label="l"></div></div>')).toBe(model);
    expect(read('<div class="st-diagramSceneFigure-node" data-scene-occurrence="n"><button class="probe" style="opacity:0">hidden</button></div>')).toBe(model);
  });
  it(`should divide ${host} painted rects by the scale committed on the world, not by a zoom the DOM has not caught up with`, () => {
    const model = { x: 10, y: 20, width: 640, height: 320 };
    const html = '<div data-scene-occurrence="card"></div><svg><polyline class="st-diagramSceneFigure-edge" data-scene-edge="e" style="fill:none;stroke:rgb(0, 0, 0);stroke-width:1.5px;vector-effect:non-scaling-stroke"/></svg>';
    const view = paintedWorld(html, { '[data-scene-occurrence]': { x: 40, y: 40, width: 460, height: 200 }, '[data-scene-edge]': { x: 0, y: 0, width: 700, height: 400 } });
    const reference = measure(view.frame, model, 0.62)!;
    expect(reference).not.toBe(model);
    // The host has the DOM's scale: the committed transform says the same.
    (view.world as HTMLElement).style.transform = 'translate(100px,200px) scale(0.62)';
    expect(measure(view.frame, model, 0.62)).toEqual(reference);
    // A camera input moved the host's zoom; the world still paints 0.62.
    for (const stale of [0.45, 0.5, 1, 1.4]) expect(measure(view.frame, model, stale), String(stale)).toEqual(reference);
    // The DOM follows: the read is the same bounds through the new scale.
    view.camera.zoom = 0.5;
    (view.world as HTMLElement).style.transform = 'translate(100px,200px) scale(0.5)';
    expect(within(measure(view.frame, model, 0.62)!, reference)).toBeLessThanOrEqual(RENDERED_BOUNDS_REFIT_TOLERANCE);
    view.dispose();
  });
  it(`should frame ${host} circles, the optional ERD cardinality markers`, () => {
    const model = { x: 10, y: 20, width: 640, height: 320 };
    const far = { x: -400, y: -300, width: 1600, height: 1200 };
    const read = (shape: string) => {
      const view = paintedWorld(`<div data-scene-occurrence="card"></div><svg>${shape}</svg>`, { '[data-scene-occurrence]': { x: 40, y: 40, width: 460, height: 200 }, '.probe': far });
      const bounds = measure(view.frame, model, 0.62);
      view.dispose();
      vi.restoreAllMocks();
      return bounds!;
    };
    const circle = read('<circle class="probe" style="fill:rgb(255, 255, 255);stroke:rgb(0, 0, 0);stroke-width:1.5px;vector-effect:non-scaling-stroke"/>');
    expect(circle).toEqual(read('<rect class="probe" style="fill:rgb(255, 255, 255);stroke:rgb(0, 0, 0);stroke-width:1.5px;vector-effect:non-scaling-stroke"/>'));
    expect(far.x - circle.x).toBeGreaterThanOrEqual(1.5 / 2 / 0.45);
    // Unpainted, it is geometry only.
    expect(read('<circle class="probe" style="fill:none"/>')).toBe(model);
  });
}

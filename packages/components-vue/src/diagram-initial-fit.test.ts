import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { readFileSync } from 'node:fs';
import { convertEngramErdScene, m3ProfileRegistry, shippedExecutorBindings, type EngramErdScene } from '@sentropic/diagram-core';
import { createLayoutCache } from '@sentropic/diagram-canvas';
import SvelteScene from '../../components-svelte/src/lib/DiagramSceneFigure.svelte';
import VueScene from './DiagramSceneFigure.vue';
import { hCondInput } from '../../diagram-canvas/tests/layout/dc2a/h-cond.js';
import { flowFixture } from '../../diagram-canvas/test-support/flowFixture.js';

const hosts = [
  { name: 'Svelte', async mount(props: Record<string, unknown>) {
    const view = render(SvelteScene, props as never); await tick();
    return { element: view.container, flush: tick, update: (props: Record<string, unknown>) => view.rerender(props), dispose: () => view.unmount() };
  } },
  { name: 'Vue', async mount(props: Record<string, unknown>) {
    const view = mount(VueScene, { props: props as never }); await nextTick();
    return { element: view.element, flush: nextTick, update: (props: Record<string, unknown>) => view.setProps(props), dispose: () => view.unmount() };
  } },
];
function smallInput() {
  const source = hCondInput('architecture', false);
  const ids = ['control', 'server', 'agent'];
  return { registry: source.registry, bindings: source.bindings,
    document: { ...source.document, documentId: 'document:initial-fit', profileRefs: ['generic@2'],
      typeDefinitions: {}, ports: {}, resources: {}, extensions: [],
      entities: Object.fromEntries(ids.map(id => [`entity:${id}`, { id: `entity:${id}`, profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: id } } }])),
      relations: Object.fromEntries(ids.slice(1).map((id, i) => [`relation:${id}`, { id: `relation:${id}`, profile: 'generic@2', type: 'link',
        endpoints: [{ role: 'source', target: `entity:${ids[i]}` }, { role: 'target', target: `entity:${id}` }],
        attributes: { label: { kind: 'text', value: i === 0 ? 'API control' : 'k3s agent' } } }])),
    },
    presentation: { ...source.presentation, entities: Object.fromEntries(ids.map(id => [`occurrence:e.${id}`, { form: 'card', text: { title: id, body: 'k3s component' } }])) },
  };
}
const cases = [
  { name: 'three cards', input: smallInput },
  { name: 'numbered flows', input: () => {
    const fixture = flowFixture(3, { labels: true });
    return { document: fixture.document, registry: fixture.options.registry, bindings: fixture.options.bindings, presentation: fixture.presentation };
  } },
  ...[3, 6].map(count => ({ name: `numbered flows/${count === 6 ? 'bundled' : 'container'}`, input: () => {
    const fixture = flowFixture(count, { labels: true, folded: true, reverse: true });
    return { document: fixture.document, registry: fixture.options.registry, bindings: fixture.options.bindings,
      presentation: fixture.presentation, flows: { fanOutMax: 4 } };
  } })),
  ...(['architecture', 'ontology'] as const).flatMap(name => [false, true].map(folded => ({
    name: `${name}/${folded ? 'folded' : 'unfolded'}`, input: () => ({ ...hCondInput(name, folded), measureLines: undefined }),
  }))),
  { name: 'ontology through the flow host', input: () => ({ ...hCondInput('ontology', false), measureLines: undefined, flows: {} }) },
];
const erdFixture = (JSON.parse(readFileSync('../diagram-core/tests/fixtures/erd/ERD-SCENES.json', 'utf8')).ontologies as EngramErdScene[])[0]!;
const erdInput = () => ({ ...convertEngramErdScene(erdFixture), registry: m3ProfileRegistry, bindings: shippedExecutorBindings });
const cardlessCases = [
  { name: 'ERD', input: erdInput, selector: '[data-scene-kind="erd"]' },
  { name: 'ERD with explicit flows', input: () => ({ ...erdInput(), flows: {} }), selector: '[data-scene-kind="erd"]' },
  { name: 'label-only numbered flow', input: () => {
    const input = cases.find(scene => scene.name === 'numbered flows')!.input();
    const entities = Object.fromEntries(Object.entries(input.presentation.entities).map(([id, entry]) =>
      [id, { ...entry, text: { body: entry.text.title } }]));
    return { ...input, presentation: { ...input.presentation, entities } };
  }, selector: '[data-scene-kind="label"]' },
];
const rect = (el: HTMLElement) => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), width: parseFloat(el.style.width), height: parseFloat(el.style.height) });
function geometry(element: Element) {
  const figure = element.matches('figure') ? element as HTMLElement : element.querySelector<HTMLElement>('figure')!;
  const viewport = element.querySelector<HTMLElement>('.st-diagramSceneFigure-viewport')!;
  const extent = element.querySelector<HTMLElement>('.st-diagramSceneFigure-extent')!;
  const world = element.querySelector<HTMLElement>('.st-diagramSceneFigure-world')!;
  const zoom = Number(figure.dataset.zoom);
  const [tx, ty] = /translate\(([-\d.e+]+)px,\s*([-\d.e+]+)px\)/.exec(world.style.transform)!.slice(1).map(Number);
  const boxes = [...element.querySelectorAll<HTMLElement>('[data-scene-occurrence],[data-scene-label]')].map(rect);
  const paths = [...element.querySelectorAll('[data-scene-edge]')].map(edge => edge.getAttribute('points')!.trim().split(/\s+/).map(point => {
    const [x, y] = point.split(',').map(Number); return { x, y };
  }));
  const all = [...boxes, ...paths.flat().map(point => ({ ...point, width: 0, height: 0 }))];
  const left = Math.min(...all.map(box => box.x)), top = Math.min(...all.map(box => box.y));
  const right = Math.max(...all.map(box => box.x + box.width)), bottom = Math.max(...all.map(box => box.y + box.height));
  return { viewport, extent, world, zoom, tx, ty, boxes, paths, left, top, right, bottom, height: parseFloat(viewport.style.height) };
}
const undo: (() => void)[] = [];
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete (document as Partial<Document>).fonts; for (const step of undo.splice(0)) step(); });

it('should publish numbered-flow content size once per change in world dimensions', async () => {
  const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(900);
  vi.stubGlobal('innerHeight', 900);
  const input = cases.find(scene => scene.name === 'numbered flows/container')!.input();
  const notifications: string[] = [];
  const view = mount(VueScene, { props: { ...input,
    onLayout: () => notifications.push('layout'),
    onSizeChange: () => notifications.push('sizeChange'),
  } });
  try {
    await nextTick();
    expect(notifications).toEqual(['layout', 'sizeChange']);
    const emitted = () => view.emitted('sizeChange');
    const initial = emitted()?.[0];
    expect(initial?.[0]).toMatchObject({ width: expect.any(Number), height: expect.any(Number) });
    expect.soft(emitted()).toEqual([initial]);
    expect.soft(view.emitted('update:contentSize')).toEqual([initial]);

    width.mockReturnValue(500);
    window.dispatchEvent(new Event('resize'));
    await nextTick();
    expect.soft(emitted()).toEqual([initial]);
    expect.soft(view.emitted('update:contentSize')).toEqual([initial]);

    await view.setProps({ collapsed: ['occurrence:e.zone'] });
    const folded = emitted()?.at(-1);
    expect(folded).not.toEqual(initial);
    expect(emitted()).toEqual([initial, folded]);
    expect(view.emitted('update:contentSize')).toEqual([initial, folded]);
    expect(notifications).toEqual(['layout', 'sizeChange', 'layout', 'sizeChange']);
  } finally {
    view.unmount();
  }
});

/**
 * Painted rects for the jsdom hosts, derived from the rendered world
 * transform and never from camera state: a host that paints one scale and
 * measures with another reads wrong bounds here, as it does in a browser.
 * Edges land on the 1/64 CSS px layout grid, labels carry ink the model
 * geometry lacks, and the world origin moves by one LayoutUnit on every
 * other read: two consecutive reads of the same paint never agree.
 *
 * Connectors run on the outer perimeter of the boxes, as orthogonal routes
 * and self-relations do, with the stroke the scene stylesheet gives them
 * (jsdom resolves no custom property: the token values are inlined). Once
 * `ghosts` is on, the geometry that paints nothing (flow hit targets,
 * hidden focus targets, clipped descriptions) reports rects far outside.
 */
function paintOnLayoutGrid() {
  const original = Element.prototype.getBoundingClientRect;
  const snap = (px: number) => Math.round(px * 64) / 64;
  let reads = 0;
  let ghosts = false;
  const sheet = document.createElement('style');
  sheet.textContent = `
    .st-diagramSceneFigure-edge { fill: none; stroke: rgb(100, 116, 139); stroke-width: 1.5px; vector-effect: non-scaling-stroke; }
    .st-diagramSceneFigure-edge[data-flow-state="primary"] { stroke-width: 2.5px !important; }
    .st-diagramSceneFigure-edge[data-flow-state="related"] { stroke-width: 2px !important; }
    .st-diagramSceneFigure-flowHit { fill: none; stroke: rgba(0, 0, 0, 0); stroke-width: 16px; }
    .st-diagramSceneFigure-flowNode { opacity: 0; }
    .st-diagramSceneFigure-flowDescription { position: absolute; clip-path: inset(50%); width: 0; height: 0; overflow: hidden; }`;
  document.head.append(sheet);
  undo.push(() => sheet.remove());
  const perimeter = (world: HTMLElement, margin: number) => {
    const boxes = [...world.querySelectorAll<HTMLElement>('[data-scene-occurrence],[data-scene-label]')].map(rect);
    const x = Math.min(...boxes.map(box => box.x)) - margin, y = Math.min(...boxes.map(box => box.y)) - margin;
    return { x, y, width: Math.max(...boxes.map(box => box.x + box.width)) + margin - x, height: Math.max(...boxes.map(box => box.y + box.height)) + margin - y };
  };
  const GHOST = '[data-flow-hit],.st-diagramSceneFigure-flowNode,.st-diagramSceneFigure-flowDescription';
  const transformOf = (world: HTMLElement) => /translate\(([-\d.e+]+)px,\s*([-\d.e+]+)px\)\s*scale\(([-\d.e+]+)\)/.exec(world.style.transform)!.slice(1).map(Number);
  const screen = (world: HTMLElement, box: { x: number; y: number; width: number; height: number }) => {
    const [tx, ty, scale] = transformOf(world);
    const left = snap(tx + box.x * scale), top = snap(ty + box.y * scale);
    return new DOMRect(left, top, snap(tx + (box.x + box.width) * scale) - left, snap(ty + (box.y + box.height) * scale) - top);
  };
  // jsdom has no Range#getClientRects: text ink is the ghosts' only.
  const range = Range.prototype as unknown as { getClientRects?: () => DOMRect[] };
  const hadClientRects = Object.getOwnPropertyDescriptor(range, 'getClientRects');
  range.getClientRects = function(this: Range) {
    const parent = this.startContainer instanceof Element ? this.startContainer : this.startContainer.parentElement;
    const world = parent?.closest<HTMLElement>('.st-diagramSceneFigure-world');
    return ghosts && world && parent?.closest(GHOST) ? [screen(world, perimeter(world, 200))] : [];
  };
  undo.push(() => { if (hadClientRects) Object.defineProperty(range, 'getClientRects', hadClientRects); else delete range.getClientRects; });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function(this: Element) {
    const world = this.closest<HTMLElement>('.st-diagramSceneFigure-world');
    if (!world) return original.call(this);
    const [tx, ty, scale] = /translate\(([-\d.e+]+)px,\s*([-\d.e+]+)px\)\s*scale\(([-\d.e+]+)\)/.exec(world.style.transform)!.slice(1).map(Number);
    if (this === world) { reads++; return new DOMRect(snap(tx) - (reads % 2) / 64, snap(ty) - (reads % 2) / 64, 0, 0); }
    if (this.matches('[data-scene-edge]')) return screen(world, perimeter(world, 0));
    if (this.matches(GHOST)) return ghosts ? screen(world, perimeter(world, 200)) : new DOMRect();
    if (!(this instanceof HTMLElement) || !this.matches('[data-scene-occurrence],[data-scene-label]')) return new DOMRect();
    const box = rect(this);
    // Independently supplied painted overshoot, absent from model geometry.
    const top = this.hasAttribute('data-scene-label') ? box.y - 300 : box.y;
    const left = snap(tx + box.x * scale), topPx = snap(ty + top * scale);
    return new DOMRect(left, topPx, snap(tx + (box.x + box.width) * scale) - left, snap(ty + (box.y + box.height) * scale) - topPx);
  });
  return { reads: () => reads, ghosts(on: boolean) { ghosts = on; },
    // jsdom caches computed styles per document and drops them on a change
    // of the document only; the Vue host renders detached from it.
    restyle() { document.head.append(sheet); } };
}
/** A frame width whose painted fit is neither capped at 0.62 nor floored at 0.30, for both scenes below. */
const UNCAPPED_WIDTH = 550;

function snapshot(element: Element) {
  const { zoom, tx, ty, boxes, paths, viewport, extent } = geometry(element);
  return { zoom, tx, ty, boxes, paths, viewport: viewport.style.cssText, extent: extent.style.cssText,
    bundles: [...element.querySelectorAll('.st-diagramSceneFigure-bundleHeader,.st-diagramSceneFigure-bundleRelation')].map(el => el.textContent),
    zoneContent: [...element.querySelectorAll<HTMLElement>('.st-diagramZone-content')].map(el => el.style.cssText) };
}

for (const scene of cases) for (const width of [1440, 340]) it(`should give Svelte and Vue equal ${scene.name} cameras and geometry at ${width}, before and after fonts.ready`, async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
  vi.stubGlobal('innerHeight', 900);
  let ready!: () => void;
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: new Promise<void>(resolve => { ready = resolve; }) } });
  const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ font: '', measureText: (text: string) => ({ width: text.length * 30, fontBoundingBoxAscent: 100, fontBoundingBoxDescent: 20 }) } as never);
  const cameras: unknown[][] = [[], []];
  const views = [];
  for (const [i, host] of hosts.entries()) views.push(await host.mount({ ...scene.input(), onCameraChange: (camera: unknown) => cameras[i].push(camera) }));
  const compare = () => {
    const labelTexts = (element: Element) => [...element.querySelectorAll('[data-scene-label]')].map(node => node.textContent);
    expect(labelTexts(views[1].element)).toEqual(labelTexts(views[0].element));
    const rows = (element: Element) => [...element.querySelectorAll('.st-diagramSceneFigure-fallback p')].map(row => row.textContent);
    expect(rows(views[0].element).length).toBeGreaterThan(0);
    expect(rows(views[1].element)).toEqual(rows(views[0].element));
    expect(cameras[1].at(-1)).toEqual(cameras[0].at(-1));
    expect(snapshot(views[1].element)).toEqual(snapshot(views[0].element));
  };
  compare();
  ready(); await Promise.resolve();
  for (const view of views) { await view.flush(); await view.flush(); }
  expect(canvas).toHaveBeenCalledTimes(2);
  compare();
  for (const view of views) view.dispose();
});

it('should apply all scene spacing tokens, metric overrides and bundle markup equally in numbered flows', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1440);
  vi.stubGlobal('innerHeight', 900);
  const tokens = { gapMin: 70, gapMinBlock: 75, gapBase: 80, gapBaseBlock: 85,
    trackSpacing: 36, trackSpacingBlock: 40, labelBand: 45, gapMax: 500,
    bundleLabelMaxWidth: 220, containerPadding: 63, labelPadding: 7 };
  const computedStyle = getComputedStyle;
  vi.spyOn(globalThis, 'getComputedStyle').mockImplementation(element => {
    const style = computedStyle(element);
    if (element.matches('.st-diagramSceneFigure-frame')) for (const [key, value] of Object.entries(tokens))
      style.setProperty(`--st-component-diagramScene-${key}`, `${value}px`);
    return style;
  });
  for (const bundled of [true, false]) {
    const input = bundled ? { ...hCondInput('architecture', true), measureLines: undefined, flows: {} }
      : cases.find(scene => scene.name === 'numbered flows/container')!.input();
    const views = [];
    for (const host of hosts) views.push(await host.mount({ ...input, metrics: { containerPadding: 71 } }));
    expect(snapshot(views[1].element)).toEqual(snapshot(views[0].element));
    for (const view of views) {
      if (bundled) expect(view.element.querySelectorAll('.st-diagramSceneFigure-bundleHeader').length).toBeGreaterThan(0);
      else {
        const content = view.element.querySelector<HTMLElement>('.st-diagramZone-content')!;
        expect(content.style.left).toBe('calc(71px - var(--st-component-diagramZone-borderWidth, 1.5px))');
      }
      view.dispose();
    }
  }
});

for (const host of hosts) describe(`${host.name} load without interaction`, () => {
  for (const name of ['three cards', 'numbered flows']) {
    it(`should layout ${name} once and fit on resize without touching the layout cache`, async () => {
      const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(900);
      vi.stubGlobal('innerHeight', 900);
      const layoutCache = createLayoutCache();
      const onLayout = vi.fn();
      const input = cases.find(scene => scene.name === name)!.input();
      const view = await host.mount({ ...input, layoutCache, onLayout });
      try {
        await view.flush();
        expect.soft(onLayout).toHaveBeenCalledTimes(1);
        expect.soft(layoutCache.stats()).toMatchObject({ entries: 1, misses: 1 });
        const initial = geometry(view.element).zoom;
        const stats = layoutCache.stats();

        width.mockReturnValue(340);
        window.dispatchEvent(new Event('resize'));
        await view.flush();
        expect(geometry(view.element).zoom).toBeLessThan(initial);
        expect.soft(onLayout).toHaveBeenCalledTimes(1);
        expect.soft(layoutCache.stats()).toEqual(stats);

        await view.update({ targetWidth: 1024 });
        await view.flush();
        expect(onLayout).toHaveBeenCalledTimes(2);
      } finally {
        view.dispose();
      }
    });
  }
  it('should use numbered-flow icon bindings and the supplied glyph resolver', async () => {
    const glyph = { face: 'M1 1H63V63H1Z' };
    const resolveGlyph = vi.fn(() => glyph);
    const view = await host.mount({ ...cases.find(scene => scene.name === 'numbered flows')!.input(),
      iconBindings: { node: { icon: 'pr291-custom' } }, resolveGlyph });
    expect(resolveGlyph).toHaveBeenCalledWith('pr291-custom');
    expect(view.element.querySelectorAll('[data-diagram-icon="pr291-custom"]')).toHaveLength(2);
    expect([...view.element.querySelectorAll('[data-diagram-icon="pr291-custom"] path')].map(path => path.getAttribute('d'))).toContain(glyph.face);
    view.dispose();
  });
  it('should suppress unresolved numbered-flow icons when strictIcons is false', async () => {
    const view = await host.mount({ ...cases.find(scene => scene.name === 'numbered flows')!.input(),
      iconBindings: { node: { role: 'unbound' } }, strictIcons: false });
    expect(view.element.querySelectorAll('[data-diagram-icon]')).toHaveLength(0);
    view.dispose();
  });
  for (const scene of cases.filter(scene => ['numbered flows', 'ontology/unfolded'].includes(scene.name))) it(`should follow the fitted ${scene.name} bounds when the initial font becomes ready`, async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(scene.name === 'numbered flows' ? 500 : 1800);
    vi.stubGlobal('innerHeight', 1000);
    let ready!: () => void;
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: new Promise<void>(resolve => { ready = resolve; }) } });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ font: '', measureText: (text: string) => ({ width: text.length * 30, fontBoundingBoxAscent: scene.name === 'numbered flows' ? 1000 : 100, fontBoundingBoxDescent: 20 }) } as never);
    const cameras: { zoom: number; fitZoom: number }[] = [];
    const view = await host.mount({ ...scene.input(),
      onCameraChange: (camera: { zoom: number; fitZoom: number }) => cameras.push(camera) });
    const initialFit = cameras.at(-1)!.fitZoom;
    const { viewport } = geometry(view.element);
    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    await view.flush();
    expect(geometry(view.element).zoom).toBeGreaterThan(initialFit);
    viewport.scrollLeft = 40;
    viewport.scrollTop = 20;
    ready(); await Promise.resolve(); await view.flush(); await view.flush();
    expect(cameras.at(-1)!.fitZoom).not.toBe(initialFit);
    expect(cameras.at(-1)!.zoom).toBe(cameras.at(-1)!.fitZoom);
    expect(viewport.scrollLeft).toBe(0);
    expect(viewport.scrollTop).toBe(0);
    const before = geometry(view.element).zoom;
    [...view.element.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Fit')!.click();
    await view.flush();
    expect(geometry(view.element).zoom).toBe(before);
    view.dispose();
  });
  for (const scene of cases) for (const width of [1206, 1440, 340]) {
    it(`should initially fit ${scene.name} at ${width}, with axis-only scrolling below the floor and an idempotent Ajuster`, async () => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
      vi.stubGlobal('innerHeight', 900);
      const view = await host.mount({ ...scene.input(), labels: { fit: 'Ajuster' } });
      const initial = geometry(view.element);
      const rawFit = Math.min(.62, (width - 2) / (initial.right - initial.left),
        (Math.min(width * 9 / 16, 900 * .85) - 2) / (initial.bottom - initial.top));
      expect(initial.zoom).toBeGreaterThanOrEqual(.30);
      expect(initial.zoom).toBeLessThanOrEqual(.62);
      const overX = (initial.right - initial.left) * initial.zoom > width + .5;
      const overY = (initial.bottom - initial.top) * initial.zoom > initial.height + .5;
      if (rawFit >= .30) {
        expect([overX, overY]).toEqual([false, false]);
        expect(initial.viewport.dataset.pans).toBe('false');
      } else expect(initial.zoom).toBe(.30);
      expect(initial.viewport.style.overflowX).toBe(overX ? 'auto' : 'hidden');
      expect(initial.viewport.style.overflowY).toBe(overY ? 'auto' : 'hidden');
      expect(initial.height - (initial.bottom - initial.top) * initial.zoom).toBeLessThanOrEqual(2.1 + 8 * initial.zoom);
      for (const label of view.element.querySelectorAll<HTMLElement>('[data-scene-label]')) {
        const box = rect(label);
        // On overflowing axes the scrollable frame must contain every label.
        expect(initial.tx + box.x * initial.zoom).toBeGreaterThanOrEqual(.75 + 4 * initial.zoom);
        expect(initial.ty + box.y * initial.zoom).toBeGreaterThanOrEqual(.75 + 4 * initial.zoom);
        expect(initial.tx + (box.x + box.width) * initial.zoom).toBeLessThanOrEqual(Math.max(width, parseFloat(initial.extent.style.width)) - .75 - 4 * initial.zoom);
        expect(initial.ty + (box.y + box.height) * initial.zoom).toBeLessThanOrEqual(Math.max(initial.height, parseFloat(initial.extent.style.height)) - .75 - 4 * initial.zoom);
      }
      const snapshot = () => [geometry(view.element).zoom, initial.viewport.style.cssText, initial.extent.style.cssText, initial.world.style.transform];
      const before = snapshot();
      [...view.element.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Ajuster')!.click();
      await view.flush();
      expect(snapshot()).toEqual(before);
      view.dispose();
    });
  }
  for (const scene of cases.filter(scene => ['three cards', 'numbered flows'].includes(scene.name))) it(`should stay at fit while initial ${scene.name} painted bounds settle, before Ajuster`, async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(900);
    vi.stubGlobal('innerHeight', 900);
    paintOnLayoutGrid();
    const cameras: { zoom: number; fitZoom: number }[] = [];
    const view = await host.mount({ ...scene.input(), onCameraChange: (camera: { zoom: number; fitZoom: number }) => cameras.push(camera) });
    await view.flush();
    expect(cameras.at(-1)!.zoom).toBe(cameras.at(-1)!.fitZoom);
    const before = geometry(view.element).zoom;
    [...view.element.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Fit')!.click();
    await view.flush();
    expect(geometry(view.element).zoom).toBe(before);
    view.dispose();
  });
  // Both Vue hosts: `three cards` renders through the base scene host,
  // `numbered flows` through the numbered one. 1206 px caps the fit at 0.62;
  // the narrower frame lands between the 0.30 floor and the cap.
  for (const [name, width, capped] of [['three cards', 1206, true], ['three cards', UNCAPPED_WIDTH, false],
    ['numbered flows', 1206, true], ['numbered flows', UNCAPPED_WIDTH, false]] as const) {
    it(`should keep one scale and a single fixed point across repeated Ajuster on ${name} at ${width}`, async () => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
      vi.stubGlobal('innerHeight', 900);
      const painted = paintOnLayoutGrid();
      const cameras: { zoom: number; fitZoom: number; minZoom: number }[] = [];
      const view = await host.mount({ ...cases.find(scene => scene.name === name)!.input(), labels: { fit: 'Ajuster' },
        onCameraChange: (camera: { zoom: number; fitZoom: number; minZoom: number }) => cameras.push(camera) });
      await view.flush(); await view.flush();
      const state = () => {
        const current = geometry(view.element);
        return { zoom: current.zoom, transform: current.world.style.transform, viewport: current.viewport.style.cssText,
          extent: current.extent.style.cssText, camera: cameras.at(-1) };
      };
      const ajuster = async () => {
        [...view.element.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Ajuster')!.click();
        await view.flush(); await view.flush();
      };
      const settled = state();
      // The painted overshoot was read: the fit is no longer the model fit.
      expect(painted.reads()).toBeGreaterThan(0);
      if (capped) expect(settled.zoom).toBe(.62);
      else {
        expect(settled.zoom).toBeGreaterThan(.30);
        expect(settled.zoom).toBeLessThan(.62);
      }
      for (let repeat = 0; repeat < 5; repeat++) {
        const reads = painted.reads();
        await ajuster();
        // Every click reads the paint again, one LayoutUnit away…
        expect(painted.reads()).toBe(reads + 1);
        // …and lands on the same fit.
        expect(state(), `Ajuster ${repeat + 1}`).toEqual(settled);
      }
      // One scale: the painted transform, data-zoom, the camera and the CSS
      // custom property all carry the same number, on the 1e-3 fit grid.
      const scale = Number(/scale\(([-\d.e+]+)\)/.exec(settled.transform)![1]);
      expect(scale).toBe(settled.zoom);
      expect(scale).toBe(Number(scale.toFixed(3)));
      expect([settled.camera!.zoom, settled.camera!.fitZoom, settled.camera!.minZoom]).toEqual([scale, scale, scale]);
      expect(geometry(view.element).viewport.style.getPropertyValue('--st-diagram-zoom')).toBe(String(scale));
      if (!capped) {
        // From an interactive zoom the read goes through another transform.
        geometry(view.element).viewport.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
        await view.flush();
        expect(geometry(view.element).zoom).toBeGreaterThan(settled.zoom);
        expect(Number(/scale\(([-\d.e+]+)\)/.exec(geometry(view.element).world.style.transform)![1])).toBe(geometry(view.element).zoom);
        await ajuster();
        expect(state(), 'Ajuster after zoom').toEqual(settled);
      }
      // The connector stroke is read, with the width the stylesheet gives it.
      const edges = [...view.element.querySelectorAll('[data-scene-edge]')];
      expect(edges.length).toBeGreaterThan(0);
      expect(getComputedStyle(edges[0]).vectorEffect).toBe('non-scaling-stroke');
      // Geometry that paints nothing does not move the fit, wherever it is.
      painted.ghosts(true);
      await ajuster();
      expect(state(), 'Ajuster over unpainted geometry').toEqual(settled);
      if (name === 'numbered flows') {
        expect(view.element.querySelectorAll('[data-flow-hit]').length).toBeGreaterThan(0);
        expect(view.element.querySelectorAll('.st-diagramSceneFigure-flowNode').length).toBeGreaterThan(0);
        expect(view.element.querySelectorAll('.st-diagramSceneFigure-flowDescription').length).toBeGreaterThan(0);
        // A selected flow step is drawn thicker: the highlight is transient
        // and « Ajuster » keeps the fit.
        view.element.querySelector<HTMLElement>('[data-flow-badge]')!.click();
        await view.flush();
        painted.restyle();
        const primary = view.element.querySelector('[data-scene-edge][data-flow-state="primary"]')!;
        expect(getComputedStyle(primary).strokeWidth).toBe('2.5px');
        const highlighted = state();
        expect([highlighted.zoom, highlighted.transform, highlighted.extent]).toEqual([settled.zoom, settled.transform, settled.extent]);
        await ajuster();
        expect(state(), 'Ajuster with a highlighted flow step').toEqual(highlighted);
        expect([state().zoom, state().transform, state().extent]).toEqual([settled.zoom, settled.transform, settled.extent]);
      }
      view.dispose();
    });
  }
  it('should keep a manual zoom through scrollbar changes and refit when the container resizes', async () => {
    let frameWidth = 500;
    let scrollbarWidth = 0;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.matches('.st-diagramSceneFigure-viewport') ? frameWidth - scrollbarWidth : frameWidth;
    });
    vi.stubGlobal('innerHeight', 900);
    let notifyResize = () => {};
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { notifyResize = callback; }
      observe() {}
      disconnect() {}
    });
    const view = await host.mount(cases.find(scene => scene.name === 'numbered flows')!.input());
    const initial = geometry(view.element);
    initial.viewport.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    await view.flush();
    const userZoom = geometry(view.element).zoom;
    expect(userZoom).toBeGreaterThan(initial.zoom);

    initial.viewport.scrollLeft = 40;
    initial.viewport.scrollTop = 20;
    scrollbarWidth = 15;
    notifyResize();
    await view.flush();
    expect(geometry(view.element).zoom).toBe(userZoom);
    expect(initial.viewport.scrollLeft).toBe(40);
    expect(initial.viewport.scrollTop).toBe(20);

    frameWidth = 550;
    notifyResize();
    await view.flush();
    const resized = geometry(view.element);
    expect(resized.zoom).not.toBe(userZoom);
    expect(resized.viewport.dataset.pans).toBe('false');
    expect(resized.tx + resized.right * resized.zoom).toBeLessThanOrEqual(frameWidth);
    expect(resized.viewport.scrollLeft).toBe(0);
    expect(resized.viewport.scrollTop).toBe(0);
    view.dispose();
  });

  it('should refit numbered flows and reset scrolling on a window resize', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(340);
    vi.stubGlobal('innerHeight', 900);
    let floor = '.30';
    const computedStyle = getComputedStyle;
    vi.spyOn(globalThis, 'getComputedStyle').mockImplementation(element => {
      const style = computedStyle(element);
      if (element.matches('.st-diagramSceneFigure-frame')) style.setProperty('--st-component-diagramScene-minReadableScale', floor);
      return style;
    });
    const view = await host.mount(cases.find(scene => scene.name === 'numbered flows')!.input());
    const initial = geometry(view.element);
    initial.viewport.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    await view.flush();
    expect(geometry(view.element).zoom).toBeGreaterThan(.30);
    expect(geometry(view.element).zoom).toBeLessThan(.6);
    floor = '.6'; window.dispatchEvent(new Event('resize')); await view.flush();
    expect(geometry(view.element).zoom).toBe(.6);
    initial.viewport.scrollLeft = 40;
    initial.viewport.scrollTop = 20;
    floor = '.30'; window.dispatchEvent(new Event('resize')); await view.flush();
    expect(geometry(view.element).zoom).toBe(initial.zoom);
    expect(initial.viewport.scrollLeft).toBe(0);
    expect(initial.viewport.scrollTop).toBe(0);
    view.dispose();
  });
  it('should reset numbered-flow font measurement and camera for a new document', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(340);
    vi.stubGlobal('innerHeight', 900);
    const fonts = { ready: Promise.resolve() };
    Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
    const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ font: '', measureText: (text: string) => ({ width: text.length * 30, fontBoundingBoxAscent: 100, fontBoundingBoxDescent: 20 }) } as never);
    const input = cases.find(scene => scene.name === 'numbered flows')!.input();
    const cameras: { zoom: number; fitZoom: number }[] = [];
    const view = await host.mount({ ...input, onCameraChange: (camera: { zoom: number; fitZoom: number }) => cameras.push(camera) });
    await Promise.resolve(); await view.flush(); await view.flush();
    expect(canvas).toHaveBeenCalledTimes(1);
    expect(geometry(view.element).viewport.style.getPropertyValue('--st-diagram-label-line-height')).toBe('90px');
    geometry(view.element).viewport.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    await view.flush();
    expect(cameras.at(-1)!.zoom).toBeGreaterThan(cameras.at(-1)!.fitZoom);
    let ready!: () => void;
    fonts.ready = new Promise<void>(resolve => { ready = resolve; });
    await view.update({ document: { ...input.document, documentId: 'document:next-numbered-flow' } });
    await view.flush();
    expect(cameras.at(-1)!.zoom).toBe(cameras.at(-1)!.fitZoom);
    expect(geometry(view.element).viewport.style.getPropertyValue('--st-diagram-label-line-height')).toBe('22px');
    ready(); await Promise.resolve(); await view.flush(); await view.flush();
    expect(canvas).toHaveBeenCalledTimes(2);
    expect(geometry(view.element).viewport.style.getPropertyValue('--st-diagram-label-line-height')).toBe('90px');
    expect(cameras.at(-1)!.zoom).toBe(cameras.at(-1)!.fitZoom);
    view.dispose();
  });
  for (const { name, input, selector } of cardlessCases) {
    it(`should preserve manual zoom and pan on ${name} until a new font load`, async () => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
      vi.stubGlobal('innerHeight', 900);
      const fonts = Object.assign(new EventTarget(), { ready: Promise.resolve() });
      Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
      const props = input();
      const view = await host.mount(props);
      try {
        await view.flush(); await view.flush();
        expect(view.element.querySelector(selector)).not.toBeNull();
        expect(view.element.querySelector('.st-diagramCard, .st-diagramZone--expanded')).toBeNull();
        const initial = geometry(view.element);
        const { viewport } = initial;
        viewport.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
        await view.flush();
        const manual = geometry(view.element).zoom;
        expect(manual).toBeGreaterThan(initial.zoom);
        viewport.scrollLeft = 40;
        viewport.scrollTop = 20;
        const camera = () => [geometry(view.element).zoom, viewport.scrollLeft, viewport.scrollTop];

        await view.update({ metrics: { labelMargin: 7 } });
        await view.flush(); await view.flush();
        expect.soft(camera()).toEqual([manual, 40, 20]);

        fonts.dispatchEvent(new Event('loadingdone'));
        await view.flush(); await view.flush();
        expect.soft(camera()).toEqual([manual, 40, 20]);

        fonts.ready = Promise.resolve();
        fonts.dispatchEvent(new Event('loadingdone'));
        await view.flush(); await view.flush();
        expect(camera()).toEqual([initial.zoom, 0, 0]);
      } finally {
        view.dispose();
      }
    });
  }
  for (const scene of cases) it(`should initially clear every connector from every ${scene.name} label`, async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1440);
    const view = await host.mount(scene.input());
    const { paths } = geometry(view.element);
    const labels = [...view.element.querySelectorAll<HTMLElement>('[data-scene-label]')];
    if (scene.name.startsWith('numbered flows')) expect(view.element.querySelectorAll('[data-flow-badge]').length).toBeGreaterThan(0);
    else expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      const box = rect(label);
      for (const path of paths) for (let i = 1; i < path.length; i++) {
        const a = path[i - 1]!, b = path[i]!;
        // All layout routes are orthogonal; include token clearance and stroke.
        const dx = Math.max(box.x - Math.max(a.x, b.x), Math.min(a.x, b.x) - box.x - box.width, 0);
        const dy = Math.max(box.y - Math.max(a.y, b.y), Math.min(a.y, b.y) - box.y - box.height, 0);
        expect(Math.hypot(dx, dy), `${label.dataset.sceneLabel} / segment ${i}`).toBeGreaterThanOrEqual(4);
      }
    }
    view.dispose();
  });
});

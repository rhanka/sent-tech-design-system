import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
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
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete (document as Partial<Document>).fonts; });

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
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1800);
    vi.stubGlobal('innerHeight', 1000);
    let ready!: () => void;
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: new Promise<void>(resolve => { ready = resolve; }) } });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ font: '', measureText: (text: string) => ({ width: text.length * 30, fontBoundingBoxAscent: scene.name === 'numbered flows' ? 1000 : 100, fontBoundingBoxDescent: 20 }) } as never);
    const cameras: { zoom: number; fitZoom: number }[] = [];
    const view = await host.mount({ ...scene.input(),
      onCameraChange: (camera: { zoom: number; fitZoom: number }) => cameras.push(camera) });
    const initialFit = cameras.at(-1)!.fitZoom;
    ready(); await Promise.resolve(); await view.flush(); await view.flush();
    expect(cameras.at(-1)!.fitZoom).not.toBe(initialFit);
    expect(cameras.at(-1)!.zoom).toBe(cameras.at(-1)!.fitZoom);
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
      expect(initial.zoom).toBeGreaterThanOrEqual(.45);
      expect(initial.zoom).toBeLessThanOrEqual(.62);
      const overX = (initial.right - initial.left) * initial.zoom > width + .5;
      const overY = (initial.bottom - initial.top) * initial.zoom > initial.height + .5;
      if (rawFit >= .45) {
        expect([overX, overY]).toEqual([false, false]);
        expect(initial.viewport.dataset.pans).toBe('false');
      } else expect(initial.zoom).toBe(.45);
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
    const original = Element.prototype.getBoundingClientRect;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function(this: Element) {
      const world = this.closest<HTMLElement>('.st-diagramSceneFigure-world');
      if (!world) return original.call(this);
      const [tx, ty] = /translate\(([-\d.e+]+)px,\s*([-\d.e+]+)px\)/.exec(world.style.transform)!.slice(1).map(Number);
      const zoom = Number(world.closest<HTMLElement>('figure')!.dataset.zoom);
      if (this === world) return new DOMRect(tx, ty, 0, 0);
      if (!(this instanceof HTMLElement) || !this.matches('[data-scene-occurrence],[data-scene-label]')) return new DOMRect();
      const box = rect(this);
      // Independently supplied painted overshoot, absent from model geometry.
      const top = this.hasAttribute('data-scene-label') ? box.y - 300 : box.y;
      return new DOMRect(tx + box.x * zoom, ty + top * zoom, box.width * zoom, (box.height + box.y - top) * zoom);
    });
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
  it('should retain the reclamped numbered-flow zoom when a resize restores the old range', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(340);
    vi.stubGlobal('innerHeight', 900);
    let floor = '.45';
    const computedStyle = getComputedStyle;
    vi.spyOn(globalThis, 'getComputedStyle').mockImplementation(element => {
      const style = computedStyle(element);
      if (element.matches('.st-diagramSceneFigure-frame')) style.setProperty('--st-component-diagramScene-minReadableScale', floor);
      return style;
    });
    const view = await host.mount(cases.find(scene => scene.name === 'numbered flows')!.input());
    geometry(view.element).viewport.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    await view.flush();
    expect(geometry(view.element).zoom).toBeGreaterThan(.45);
    expect(geometry(view.element).zoom).toBeLessThan(.6);
    floor = '.6'; window.dispatchEvent(new Event('resize')); await view.flush();
    expect(geometry(view.element).zoom).toBe(.6);
    floor = '.45'; window.dispatchEvent(new Event('resize')); await view.flush();
    expect(geometry(view.element).zoom).toBe(.6);
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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import SvelteScene from '../../components-svelte/src/lib/DiagramSceneFigure.svelte';
import VueScene from './DiagramSceneFigure.vue';
import { createLayoutCache, type LayoutResult } from '@sentropic/diagram-canvas';
import { hCondInput } from '../../diagram-canvas/tests/layout/dc2a/h-cond.js';
import { getDiagramGlyph } from './diagram-icons/registry.js';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete (document as Partial<Document>).fonts; });

const hosts = [
  { name: 'Svelte', async mount(props: Record<string, unknown>) {
    const view = render(SvelteScene, props as never); await tick();
    return { element: view.container, dispose: () => view.unmount(), flush: tick };
  } },
  { name: 'Vue', async mount(props: Record<string, unknown>) {
    const view = mount(VueScene, { props: props as never }); await nextTick();
    return { element: view.element, dispose: () => view.unmount(), flush: nextTick };
  } },
];

for (const host of hosts) describe(`${host.name} diagram defect regressions`, () => {
  for (const name of ['architecture', 'ontology'] as const) for (const folded of [false, true]) for (const width of [1440, 390]) {
    it(`should render complete ${name}/${folded ? 'folded' : 'unfolded'}/${width} cards`, async () => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
      const input = hCondInput(name, folded);
      const results: LayoutResult[] = [];
      const view = await host.mount({ ...input, measureLines: undefined, targetWidth: width,
        resolveGlyph: getDiagramGlyph, onLayout: (value: LayoutResult) => results.push(value) });
      expect([...view.element.querySelectorAll('[data-card-refused], [data-zone-refused]')].map(el => [el.getAttribute('data-entity'), el.getAttribute('data-card-refused'), el.getAttribute('data-zone-refused')])).toEqual([]);
      expect(view.element.querySelectorAll('.st-diagramCard')).not.toHaveLength(0);
      const result = results.at(-1)!;
      expect(result.status).toBe('laid-out');
      if (result.status !== 'laid-out') throw new Error('layout refused');
      for (const card of view.element.querySelectorAll<HTMLElement>('.st-diagramCard')) {
        const node = card.closest<HTMLElement>('[data-scene-occurrence]')!;
        expect(parseFloat(card.style.height)).toBeLessThanOrEqual(parseFloat(node.style.height));
        expect(card.querySelector('.st-diagramCard-title')?.textContent).toBeTruthy();
      }
      const viewport = view.element.querySelector<HTMLElement>('.st-diagramSceneFigure-viewport')!;
      const extent = view.element.querySelector<HTMLElement>('.st-diagramSceneFigure-extent')!;
      expect(parseFloat(extent.style.width)).toBeGreaterThan(0);
      if (viewport.dataset['pans'] === 'true') expect(parseFloat(extent.style.width) > width ||
        parseFloat(extent.style.height) > parseFloat(viewport.style.height)).toBe(true);
      view.dispose();
    });
  }

  it('should wait for fonts, truncate once with computed canvas metrics and invalidate the cache', async () => {
    let ready!: () => void;
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: new Promise<void>(resolve => { ready = resolve; }) } });
    const context = { font: '', measureText: vi.fn((text: string) => ({ width: text.length * 16.5 })) };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    const input = hCondInput('architecture', true);
    const cache = createLayoutCache();
    const results: LayoutResult[] = [];
    const view = await host.mount({ ...input, measureLines: undefined, layoutCache: cache,
      resolveGlyph: getDiagramGlyph, onLayout: (value: LayoutResult) => results.push(value) });
    expect(context.measureText).not.toHaveBeenCalled();
    const before = results.at(-1)!;
    ready(); await Promise.resolve(); await view.flush(); await view.flush();
    expect(context.measureText).toHaveBeenCalled();
    expect(context.font).toContain('px');
    expect(results).toHaveLength(2);
    expect(cache.stats().misses).toBe(2);
    const after = results.at(-1)!;
    if (before.status !== 'laid-out' || after.status !== 'laid-out') throw new Error('layout refused');
    expect(after.measurements).not.toEqual(before.measurements);
    const visible = [...view.element.querySelectorAll<HTMLElement>('[data-scene-occurrence]')].map(node => node.dataset['sceneOccurrence']!);
    for(const id of visible)expect(after.view.entityOccurrences[id]!.geometry.height).toBe(200);
    expect(view.element.querySelectorAll('[data-card-refused], [data-zone-refused]')).toHaveLength(0);
    window.dispatchEvent(new Event('resize')); await view.flush();
    expect(results).toHaveLength(2);
    view.dispose();
    expect(cache.stats().entries).toBe(2); // injected cache belongs to its caller
    cache.dispose();
  });

  it('should check newly unfolded content when the initial cards already fit the loaded font', async () => {
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    const context = { font: '', measureText: vi.fn((text: string) => ({
      width: [...text].reduce((width, char) => width + (/[漢字]/u.test(char) ? 28 : 6), 0),
    })) };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    const input = hCondInput('architecture', true);
    const child = Object.values(input.view.entityOccurrences).find(node => {
      const parent = node.group === undefined ? undefined : input.view.groups[node.group]?.occurrence;
      return parent !== undefined && input.view.entityOccurrences[parent]?.group === undefined
        && input.presentation.entities[node.id]?.form === 'card';
    })!;
    const parent = input.view.groups[child.group!]!.occurrence!;
    const entry = input.presentation.entities[child.id]!;
    const presentation = { ...input.presentation, entities: { ...input.presentation.entities,
      [child.id]: { ...entry, text: { ...entry.text, body: '漢字 '.repeat(100) } },
    } };
    const results: LayoutResult[] = [];
    const view = await host.mount({ ...input, presentation, measureLines: undefined, collapsed: undefined,
      defaultFolds: input.collapsed, resolveGlyph: getDiagramGlyph,
      onLayout: (value: LayoutResult) => results.push(value) });
    await Promise.resolve(); await view.flush(); await view.flush();
    expect(results).toHaveLength(2); // one initial correction for the loaded face
    view.element.querySelector<HTMLElement>(`[data-scene-occurrence="${parent}"] button[aria-expanded]`)!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await view.flush(); await Promise.resolve(); await view.flush(); await view.flush();
    expect(results).toHaveLength(3); // unfold, then one correction for the newly visible text
    const before = results[1]!, after = results[2]!;
    if (before.status !== 'laid-out' || after.status !== 'laid-out') throw new Error('layout refused');
    expect(after.view.entityOccurrences[child.id]!.geometry.height).toBe(200);
    expect(after.warnings.some(w=>w.code==='card-overflow'&&w.severity==='info')).toBe(true);
    view.dispose();
  });
});

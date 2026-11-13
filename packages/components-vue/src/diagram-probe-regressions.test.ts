import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SvelteScene from '../../components-svelte/src/lib/DiagramSceneFigure.svelte';
import VueScene from './DiagramSceneFigure.vue';
import { hCondInput } from '../../diagram-canvas/tests/layout/dc2a/h-cond.js';
import { layoutZone, projectZoneProps, defaultCardMeasure, sceneCardMeasure } from '@sentropic/diagram-canvas/diagramCardModel';

const fontMetrics = JSON.parse(readFileSync(new URL('../../diagram-canvas/tests/layout/dc2a/fixtures/h-cond/probe-font-metrics.json', import.meta.url).pathname.replace(/^\/@fs(?=\/)/, ''), 'utf8'));
function probeInput(name: 'architecture' | 'ontology', folded: boolean) {
  const input = hCondInput(name, folded);
  return { ...input, measureLines: Object.assign((request: Parameters<typeof input.measureLines>[0]) => {
    const recorded = fontMetrics.labelWidths[request.text] as number | undefined;
    const layout = input.measureLines(request);
    return request.role === 'edge-label'
      ? recorded !== undefined ? { lines: [request.text], width: recorded, height: 24, overflow: false }
        : { ...layout, height: layout.lines.length * 24 }
      : layout;
  }, { version: 'h-cond-probe-noto-sans-18-line24-v1' }) };
}
const records: Record<string, unknown>[] = [];
afterAll(() => { if (process.env.DC2A_PROBE_REPORT) writeFileSync(process.env.DC2A_PROBE_REPORT, JSON.stringify(records, null, 2) + '\n'); });

const hosts = [
  { name: 'Svelte', async mount(props: Record<string, unknown>) {
    const view = render(SvelteScene, props as never); await tick();
    return { element: view.container, flush: tick, dispose: () => view.unmount() };
  } },
  { name: 'Vue', async mount(props: Record<string, unknown>) {
    const view = mount(VueScene, { props: props as never }); await nextTick();
    return { element: view.element, flush: nextTick, dispose: () => view.unmount() };
  } },
];
const rect = (el: HTMLElement) => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), width: parseFloat(el.style.width), height: parseFloat(el.style.height) });
const intersection = (a: ReturnType<typeof rect>, b: ReturnType<typeof rect>) => ({
  width: Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x),
  height: Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y),
});
function footerBands(element: Element, input: ReturnType<typeof probeInput>) {
  const bands: ReturnType<typeof rect>[] = [];
  for (const node of element.querySelectorAll<HTMLElement>('[data-scene-kind="zone"]')) {
    if (!node.querySelector('.st-diagramZone--expanded')) continue;
    const box = rect(node), projected = projectZoneProps(input.presentation.entities[node.dataset.sceneOccurrence!], {
      entityId: node.dataset.sceneOccurrence!, collapsed: false, width: box.width, height: box.height, toggleLabel: 'Toggle',
    });
    if (projected.kind !== 'zone') throw new Error('missing zone');
    const header = layoutZone(projected.props, sceneCardMeasure(defaultCardMeasure)).header!;
    if (header.footerRuleY !== undefined) bands.push({ x: box.x, y: box.y + header.footerRuleY - .5, width: box.width, height: box.height - header.footerRuleY + .5 });
  }
  return bands;
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

for (const host of hosts) describe(`${host.name} h-cond probe regressions`, () => {
  for (const name of ['architecture', 'ontology'] as const) for (const folded of [false, true]) {
    for (const size of [{ width: 1206, height: 900 }, { width: 340, height: 844 }]) {
      it(`should frame all painted ${name}/${folded} content after Fit at ${size.width} (probe defect 1)`, async () => {
        vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(size.width);
        vi.stubGlobal('innerHeight', size.height);
        const input = probeInput(name, folded), view = await host.mount(input);
        const button = [...view.element.querySelectorAll('button')].find(el => el.textContent?.trim() === 'Fit')!;
        button.click(); await view.flush();
        const zoom = Number((view.element.matches('figure') ? view.element as HTMLElement : view.element.querySelector<HTMLElement>('figure')!).dataset.zoom);
        const viewport = view.element.querySelector<HTMLElement>('.st-diagramSceneFigure-viewport')!;
        const height = parseFloat(viewport.style.height);
        // Probe union, in diagram units; jsdom has no layout. Read mounted geometry
        // and reserve the non-scaling stroke in screen pixels independently.
        const boxes = [...view.element.querySelectorAll<HTMLElement>('[data-scene-occurrence],[data-scene-label]')].map(rect);
        // Routes are part of the probe's union too, including segments that
        // lie outside the node bbox. Markers dock inside endpoint cards.
        for (const edge of view.element.querySelectorAll('[data-scene-edge]')) for (const point of edge.getAttribute('points')!.split(' ')) {
          const [x, y] = point.split(',').map(Number); boxes.push({ x, y, width: 0, height: 0 });
        }
        const left = Math.min(...boxes.map(r => r.x));
        const top = Math.min(...boxes.map(r => r.y));
        const right = Math.max(...boxes.map(r => r.x + r.width));
        const bottom = Math.max(...boxes.map(r => r.y + r.height));
        expect((right - left) * zoom, 'painted width / viewport').toBeLessThanOrEqual(size.width + .5);
        expect((bottom - top) * zoom, 'painted height / viewport').toBeLessThanOrEqual(height + .5);
        expect(viewport.dataset.pans).toBe('false');
        const transform = view.element.querySelector<HTMLElement>('.st-diagramSceneFigure-world')!.style.transform;
        const [tx, ty] = /translate\(([-\d.e+]+)px,\s*([-\d.e+]+)px\)/.exec(transform)!.slice(1).map(Number);
        const margins = { left: tx + left * zoom - .75, top: ty + top * zoom - .75,
          right: size.width - tx - right * zoom - .75, bottom: height - ty - bottom * zoom - .75 };
        for (const margin of Object.values(margins)) expect(margin).toBeGreaterThanOrEqual(-.5);
        const nodes = [...view.element.querySelectorAll<HTMLElement>('[data-scene-occurrence]')];
        const cards = [...view.element.querySelectorAll<HTMLElement>('.st-diagramCard')];
        for (const card of cards) {
          expect(parseFloat(card.style.height)).toBe(200);
          expect(rect(card.closest<HTMLElement>('[data-scene-occurrence]')!).width).toBe(460);
          const description = card.querySelector('[hidden]')!.textContent!;
          expect(card.getAttribute('title')).toBe(description);
          expect(card.getAttribute('aria-describedby')).toBe(card.querySelector('[hidden]')!.id);
        }
        const labels = [...view.element.querySelectorAll<HTMLElement>('[data-scene-label]')];
        const bands = footerBands(view.element, input);
        let footerCollisions = 0;
        for (const label of labels) for (const band of bands) {
          const overlap = intersection(rect(label), band); if (overlap.width > .1 && overlap.height > .1) footerCollisions++;
        }
        expect(footerCollisions).toBe(0);
        let labelCardCollisions = 0, labelLabelCollisions = 0, textSpills = 0;
        for (const label of labels) for (const card of cards) {
          const overlap = intersection(rect(label), rect(card.closest<HTMLElement>('[data-scene-occurrence]')!));
          if (overlap.width > .1 && overlap.height > .1) labelCardCollisions++;
        }
        for (let i = 0; i < labels.length; i++) for (const other of labels.slice(i + 1)) {
          const overlap = intersection(rect(labels[i]!), rect(other));
          if (overlap.width > .1 && overlap.height > .1) labelLabelCollisions++;
        }
        const measure = sceneCardMeasure(defaultCardMeasure);
        for (const card of cards) {
          const headerWidth = parseFloat(card.querySelector<HTMLElement>('.st-diagramCardHeader-text')!.style.width);
          const bodyWidth = parseFloat(card.querySelector<HTMLElement>('.st-diagramCard-body')!.style.width);
          expect(Number.isFinite(headerWidth) && Number.isFinite(bodyWidth)).toBe(true);
          for (const [selector, role, width] of [
            ['.st-diagramCard-kicker', 'kicker', headerWidth], ['.st-diagramCard-title', 'title', headerWidth],
            ['.st-diagramCard-line,.st-diagramCard-detail', 'body', bodyWidth], ['.st-diagramCard-footerLine', 'footer', 434],
          ] as const) for (const line of card.querySelectorAll<HTMLElement>(selector)) {
            if (measure(line.textContent!, role, Number.MAX_SAFE_INTEGER, 1).lineWidths![0]! > width + .1) textSpills++;
            expect(parseFloat(line.style.height)).toBe(parseFloat(line.style.lineHeight));
          }
        }
        expect({ labelCardCollisions, labelLabelCollisions, textSpills }).toEqual({ labelCardCollisions: 0, labelLabelCollisions: 0, textSpills: 0 });
        for (const label of labels) {
          const groups = label.querySelectorAll('[data-bundle-relation]');
          const count = groups.length === 0 ? label.querySelectorAll(':scope > span').length
            : 1 + label.querySelectorAll('[data-bundle-relation] div > span').length;
          expect(rect(label).height).toBe(count * 24 + (groups.length === 0 ? 0 : 8 * (groups.length + 1)));
        }
        const parent = (id: string) => input.view.groups[input.view.entityOccurrences[id]?.group ?? '']?.occurrence;
        let minGap = Infinity;
        for (let i = 0; i < nodes.length; i++) for (const b of nodes.slice(i + 1)) {
          const a = nodes[i]!; if (parent(a.dataset.sceneOccurrence!) !== parent(b.dataset.sceneOccurrence!)) continue;
          const x = rect(a), y = rect(b);
          minGap = Math.min(minGap, Math.hypot(Math.max(0, x.x - y.x - y.width, y.x - x.x - x.width), Math.max(0, x.y - y.y - y.height, y.y - x.y - x.height)));
        }
        expect(minGap).toBeGreaterThanOrEqual(72 - .01);
        const icons = nodes.filter(node => node.querySelector('[data-diagram-icon]')).length;
        expect(icons).toBe(nodes.length);
        const fallback = view.element.querySelector('.st-diagramSceneFigure-fallback')!.textContent!.replace(/\s+/g, '');
        for (const node of nodes) for (const value of Object.values(input.presentation.entities[node.dataset.sceneOccurrence!]!.text)) {
          expect(fallback).toContain(value!.replace(/\s+/g, ''));
        }
        records.push({ host: host.name, view: name + '/' + (folded ? 'folded' : 'unfolded'), browserWidth: size.width === 340 ? 390 : 1440, viewportWidth: size.width,
          viewportHeight: height, zoom, bboxWidth: right - left, bboxHeight: bottom - top, margins, cards: cards.length,
          fixedCards: cards.length, labels: labels.length, footerBands: bands.length, footerCollisions, labelCardCollisions,
          labelLabelCollisions, textSpills, minGap, icons, nodes: nodes.length });
        view.dispose();
      });
    }
    it(`should keep ${name}/${folded} labels clear of every footer band and rule (probe defect 2)`, async () => {
      const input = probeInput(name, folded);
      const view = await host.mount(input);
      const labels = [...view.element.querySelectorAll<HTMLElement>('[data-scene-label]')];
      let checked = 0;
      for (const node of view.element.querySelectorAll<HTMLElement>('[data-scene-kind="zone"]')) {
        if (!node.querySelector('.st-diagramZone--expanded')) continue;
        const box = rect(node);
        const presentation = input.presentation.entities[node.dataset.sceneOccurrence!]!;
        const projected = projectZoneProps(presentation, { entityId: node.dataset.sceneOccurrence!, collapsed: false, width: box.width, height: box.height, toggleLabel: 'Toggle' });
        if (projected.kind !== 'zone') throw new Error('missing zone');
        const header = layoutZone(projected.props, sceneCardMeasure(defaultCardMeasure)).header!;
        if (header.footerRuleY === undefined) continue;
        const band = { x: box.x, y: box.y + header.footerRuleY - .5, width: box.width, height: box.height - header.footerRuleY + .5 };
        for (const label of labels) {
          const overlap = intersection(rect(label), band);
          expect(overlap.width > .1 && overlap.height > .1, `${label.dataset.sceneLabel} / ${node.dataset.sceneOccurrence}: ${overlap.width} × ${overlap.height}`).toBe(false);
          checked++;
        }
      }
      if (!folded) expect(checked).toBeGreaterThan(0);
      view.dispose();
    });
  }
});

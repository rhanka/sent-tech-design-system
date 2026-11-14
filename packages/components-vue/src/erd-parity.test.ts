import { withControlIconTokens } from './test-support/control-icon-contract.js';
import { readFileSync } from 'node:fs';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, it, expect } from 'vitest';
import { convertEngramErdScene, m3ProfileRegistry, shippedExecutorBindings, type EngramErdScene } from '../../diagram-core/dist/index.js';
import { flowFixture } from '../../diagram-canvas/test-support/flowFixture.js';
import VueFigure from './DiagramSceneFigure.vue';
import SvelteFigure from '../../components-svelte/src/lib/DiagramSceneFigure.svelte';
const scenes = JSON.parse(readFileSync('../diagram-core/tests/fixtures/erd/ERD-SCENES.json', 'utf8')).ontologies as EngramErdScene[];
afterEach(cleanup);
function dom(node: Element): unknown {
  const attributes = [...node.attributes].map(a => {
    if (a.name === 'class')
      return [a.name, a.value.split(/\s+/).filter(c => !c.startsWith('svelte-')).sort().join(' ')];
    if (a.name === 'style') {
      const s = (node as HTMLElement).style;
      return [a.name, Array.from({ length: s.length }, (_, i) => s.item(i)).sort().map(k => [k, s.getPropertyValue(k).trim()])];
    }
    return [a.name, a.value.replace(/diagram-arrow-[^\s)]+/g, 'diagram-arrow-instance')];
  }).filter(([name, value]) => !String(name).startsWith('data-v-') && !(name === 'class' && !value)).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  return { tag: node.tagName, attributes, children: [...node.childNodes].flatMap(n => n.nodeType === 1 ? [dom(n as Element)] : n.nodeType === 3 && n.textContent?.trim() ? [n.textContent.replace(/\s+/g, ' ').trim()] : []) };
}
describe('ERD Vue/Svelte DOM and ARIA parity', () => {
  it('should keep ERD and base scene token styles identical across both hosts', () => {
    // Vue delegates ordinary scenes to the base host; flow-only rules are separate.
    const styles = (path: string) => readFileSync(path, 'utf8').split('<style>')[1]!.split('</style>')[0]!;
    const rules = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '').split('}')
      .map(rule => rule.replace(/\s+/g, ' ').trim()).filter(Boolean).sort();
    const svelte = styles('../components-svelte/src/lib/DiagramSceneFigure.svelte');
    const fallback = svelte.match(/\.st-diagramSceneFigure-fallback\s*\{[^}]*\}/)?.[0] ?? '';
    const shared = styles('src/DiagramErdNode.vue') + styles('src/DiagramSceneFallback.vue');
    expect(rules(fallback + svelte.slice(svelte.indexOf('  .st-diagramErd-toggle')))).toEqual(
      rules(shared + styles('src/DiagramSceneFigureBase.vue')));
  });
  for (const source of scenes)
    it('should keep identical expanded and folded DOM for ' + source.id, async () => {
      const data = convertEngramErdScene(source), props = { ...data, registry: m3ProfileRegistry, bindings: shippedExecutorBindings, title: source.id };
      const vue = mount(VueFigure, { props, attachTo: document.body });
      const svelte = render(SvelteFigure, props);
      try {
        await nextTick();
        await tick();
        expect(vue.findAll('[data-scene-kind="erd"]')).toHaveLength(source.classes.length);
        expect(vue.findAll('[data-erd-field]')).toHaveLength(source.classes.reduce((n, c) => n + c.fields.length, 0));
        expect(vue.findAll('[data-scene-edge]')).toHaveLength(source.relations.length);
        expect(vue.findAll('[data-erd-marker]')).toHaveLength(2 * source.relations.length);
        expect(vue.findAll('[data-erd-table-field]')).toHaveLength(Object.keys(data.document.ports).length);
        expect(vue.findAll('[data-erd-table-relation]')).toHaveLength(source.relations.length);
        expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.querySelector('figure')!)));
        const vbutton = vue.find('.st-diagramErd-toggle');
        const sbutton = svelte.container.querySelector<HTMLButtonElement>('.st-diagramErd-toggle')!;
        expect(sbutton.style.position).toBe('');
        expect(sbutton.style.getPropertyValue('--st-erd-header-height')).not.toBe('');
        await vbutton.trigger('click');
        await fireEvent.click(sbutton);
        await nextTick();
        await tick();
        expect(vbutton.attributes('aria-expanded')).toBe('false');
        expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.querySelector('figure')!)));
        await vbutton.trigger('click');
        await fireEvent.click(sbutton);
        await nextTick();
        await tick();
        expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.querySelector('figure')!)));
      }
      finally {
        vue.unmount();
      }
    });
});

for (const source of scenes) it('should retain ERD overlays and accessible text through explicit flows for ' + source.id, async () => {
  const data = convertEngramErdScene(source);
  const props = { ...data, registry: m3ProfileRegistry, bindings: shippedExecutorBindings };
  const base = mount(VueFigure, { props });
  const vue = mount(VueFigure, { props: { ...props, flows: {} } });
  const svelte = render(SvelteFigure, { ...props, flows: {} });
  const selectors = ['.st-diagramSceneFigure-fallback', '.st-diagramErd-fallback', '.st-diagramErd-svg',
    '.st-diagramErd-toggle', '[data-erd-marker]', '[data-erd-label]', '.st-diagramSceneFigure-edges > polyline:not([data-scene-edge])'];
  const compare = () => {
    for (const selector of selectors) {
      const expected = [...base.element.querySelectorAll(selector)].map(dom);
      expect([...vue.element.querySelectorAll(selector)].map(dom), selector).toEqual(expected);
      expect([...svelte.container.querySelectorAll(selector)].map(dom), selector).toEqual(expected);
    }
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.querySelector('figure')!)));
    for (const host of [vue.element, svelte.container]) {
      const edges = [...host.querySelectorAll('[data-scene-edge]')];
      expect(edges).toHaveLength(source.relations.length);
      for (const edge of edges) expect(edge.getAttribute('marker-end')).toBeNull();
    }
    expect(vue.find('.st-diagramSceneFigure-fallback').text()).not.toBe('');
    expect(vue.findAll('[data-erd-marker]')).toHaveLength(2 * source.relations.length);
    expect(vue.findAll('[data-erd-field]')).toHaveLength(source.classes.reduce((n, c) => n + c.fields.length, 0));
  };
  try {
    await nextTick(); await tick(); compare();
    await base.find('.st-diagramErd-toggle').trigger('click');
    await vue.find('.st-diagramErd-toggle').trigger('click');
    await fireEvent.click(svelte.container.querySelector('.st-diagramErd-toggle')!);
    await nextTick(); await tick();
    // Collapsed cards intentionally omit their fields.
    for (const selector of selectors) {
      const expected = [...base.element.querySelectorAll(selector)].map(dom);
      expect([...vue.element.querySelectorAll(selector)].map(dom), selector).toEqual(expected);
      expect([...svelte.container.querySelectorAll(selector)].map(dom), selector).toEqual(expected);
    }
    expect(vue.find('.st-diagramErd-toggle').attributes('aria-expanded')).toBe('false');
  } finally { base.unmount(); vue.unmount(); }
});

it('should fold a container through captureClick with active flow-steps and suppress flow marker-ends', async () => {
  // An erd@1 document cannot also carry a flow-step relation (profile
  // validation refuses it), so the captureClick fold path is covered on
  // the generic flow host where steps exist.
  const fixture = flowFixture(3, { labels: true, folded: true, reverse: true });
  const props = { document: fixture.document, registry: fixture.options.registry, bindings: fixture.options.bindings,
    presentation: fixture.presentation, flows: { fanOutMax: 4 } };
  const vue = mount(VueFigure, { props });
  const svelte = render(SvelteFigure, props);
  const domFlow = (node: Element) => JSON.parse(JSON.stringify(dom(node)).replace(/"(?:c\d+|v-\d+)(?=["-])/g, '"host'));
  try {
    await nextTick(); await tick();
    expect(vue.findAll('[data-flow-step]')).toHaveLength(3);
    expect(domFlow(vue.element)).toEqual(domFlow(withControlIconTokens(svelte.container.querySelector('figure')!)));
    for (const host of [vue.element, svelte.container]) {
      for (const edge of host.querySelectorAll('[data-scene-edge]')) expect(edge.getAttribute('marker-end')).toBeNull();
    }
    const vtoggle = vue.find('[data-scene-occurrence] [aria-expanded]');
    const stoggle = svelte.container.querySelector<HTMLElement>('[data-scene-occurrence] [aria-expanded]')!;
    await vtoggle.trigger('click');
    await fireEvent.click(stoggle);
    await nextTick(); await tick();
    expect(vue.find('[data-scene-occurrence] [aria-expanded]').attributes('aria-expanded')).toBe('false');
    expect(svelte.container.querySelector('[data-scene-occurrence] [aria-expanded]')!.getAttribute('aria-expanded')).toBe('false');
    expect(vue.findAll('[data-flow-step]').length).toBeLessThan(3);
    const labelTexts = (host: Element) => [...host.querySelectorAll('[data-scene-label]')].map(node => node.textContent);
    expect(labelTexts(vue.element)).toEqual(labelTexts(svelte.container));
  } finally { vue.unmount(); }
});

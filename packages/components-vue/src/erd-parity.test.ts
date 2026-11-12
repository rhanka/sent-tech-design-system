import { readFileSync } from 'node:fs';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, it, expect } from 'vitest';
import { convertEngramErdScene, m3ProfileRegistry, shippedExecutorBindings, type EngramErdScene } from '../../diagram-core/dist/index.js';
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
    return [a.name, a.value];
  }).filter(([name, value]) => !String(name).startsWith('data-v-') && !(name === 'class' && !value)).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  return { tag: node.tagName, attributes, children: [...node.childNodes].flatMap(n => n.nodeType === 1 ? [dom(n as Element)] : n.nodeType === 3 && n.textContent?.trim() ? [n.textContent.replace(/\s+/g, ' ').trim()] : []) };
}
describe('ERD Vue/Svelte DOM and ARIA parity', () => {
  it('should keep token styles identical across both hosts', () => {
    const styles = ['../components-svelte/src/lib/DiagramSceneFigure.svelte', 'src/DiagramSceneFigure.vue'].map(path => readFileSync(path, 'utf8').split('<style>')[1]!.split('</style>')[0]!.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim());
    expect(styles[0]).toBe(styles[1]);
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
        expect(dom(vue.element)).toEqual(dom(svelte.container.querySelector('figure')!));
        const vbutton = vue.find('.st-diagramErd-toggle');
        const sbutton = svelte.container.querySelector<HTMLButtonElement>('.st-diagramErd-toggle')!;
        expect(sbutton.style.position).toBe('');
        expect(sbutton.style.getPropertyValue('--st-erd-header-height')).not.toBe('');
        await vbutton.trigger('click');
        await fireEvent.click(sbutton);
        await nextTick();
        await tick();
        expect(vbutton.attributes('aria-expanded')).toBe('false');
        expect(dom(vue.element)).toEqual(dom(svelte.container.querySelector('figure')!));
        await vbutton.trigger('click');
        await fireEvent.click(sbutton);
        await nextTick();
        await tick();
        expect(dom(vue.element)).toEqual(dom(svelte.container.querySelector('figure')!));
      }
      finally {
        vue.unmount();
      }
    });
});

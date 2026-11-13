import { component } from '../../tokens/dist/component.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { afterEach, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { cleanup, render } from '@testing-library/svelte';
import SvelteCard from '../../components-svelte/src/lib/DiagramCard.svelte';
import SvelteZone from '../../components-svelte/src/lib/DiagramZone.svelte';
import VueCard from './DiagramCard.vue';
import VueZone from './DiagramZone.vue';
import { CARD_GEOMETRY, defaultCardMeasure } from '@sentropic/diagram-canvas/diagramCardModel';

const path = new URL('../../diagram-canvas/contracts/diagram-anatomy.v1.json', import.meta.url).pathname.replace(/^\/@fs(?=\/)/, '');
const contract = JSON.parse(readFileSync(path, 'utf8'));
// Keep rendered tags, classes, slot positions, glyph geometry and control attributes.
// Framework scoping classes and comment anchors carry no anatomy.
function anatomy(element: Element): unknown {
  const style = getComputedStyle(element);
  return { ...(element.tagName === 'BUTTON' ? { buttonSize: { width: style.width, height: style.height, padding: style.padding, border: style.border, radius: style.borderRadius } } : {}), tag: element.tagName.toLowerCase(), attributes: Object.fromEntries([...element.attributes]
    .filter(a => !a.name.startsWith('data-v-'))
    .map(a => [a.name, a.name === 'id' || a.name === 'aria-describedby' ? 'description' : a.name === 'class' ? a.value.split(/\s+/).filter(c => !/^svelte-/.test(c)).join(' ') : a.value])
    .sort(([a], [b]) => a!.localeCompare(b!))),
    children: [...element.childNodes].filter(n => n.nodeType === 1 || n.nodeType === 3 && n.textContent?.trim())
      .map(n => n.nodeType === 1 ? anatomy(n as Element) : n.textContent!.trim()) };
}
afterEach(cleanup);
for (const host of ['svelte', 'vue'] as const) for (const variant of ['card', 'folded', 'expanded'] as const) {
  it(`should freeze ${host}/${variant} rendered anatomy and detect inline-slot and actual-button drift (A8)`, () => {
    const card = { entityId: 'contract', kicker: 'KICKER', title: 'Title', body: ['Body', 'Detail'], detailCount: 1, footer: 'Footer', toggle: { collapsed: true, label: 'Expand' } };
    const zone = { entityId: 'contract-zone', kicker: 'KICKER', title: 'Zone', subtitle: 'Subtitle', footer: 'Footer', collapsed: variant === 'folded', toggleLabel: 'Toggle', width: 600 };
    const view = host === 'svelte'
      ? render(variant === 'card' ? SvelteCard : SvelteZone, (variant === 'card' ? card : zone) as never)
      : mount(variant === 'card' ? VueCard : VueZone, { props: (variant === 'card' ? card : zone) as never });
    const cssPath=host==='svelte'?'../../components-svelte/src/lib/IconButton.svelte':'./styles.css';
    const source=readFileSync(new URL(cssPath,import.meta.url).pathname.replace(/^\/@fs(?=\/)/,''),'utf8');
    const css=(source.match(/\.st-iconButton[^{}]*\{[^}]*\}/g)??[]).join('\n').replace(/var\(--st-component-iconButton-(\w+), ([^)]+)\)/g,(_,key,fallback)=>(component.iconButton as Record<string,string>)[key]??fallback);
    const sheet=document.createElement('style');sheet.textContent=css;document.head.append(sheet);
    const root = 'container' in view ? view.container.firstElementChild! : view.element;
    const actual = anatomy(root);
    if (process.env.UPDATE_DIAGRAM_ANATOMY === '1') {
      const latest = JSON.parse(readFileSync(path, 'utf8'));
      latest.renderedAnatomy ??= {};
      latest.renderedAnatomy[`${host}/${variant}`] = actual;
      writeFileSync(path, JSON.stringify(latest, null, 2) + '\n');
    } else expect(actual).toEqual(contract.renderedAnatomy?.[`${host}/${variant}`]);
    const slot = root.querySelector<HTMLElement>('.st-diagramCard-body,.st-diagramZone-header')!;
    const before = slot.getAttribute('style');
    slot.style.marginLeft = '17px';
    expect(() => expect(anatomy(root)).toEqual(actual)).toThrow();
    slot.setAttribute('style', before ?? '');
    const button = root.querySelector<HTMLButtonElement>('button')!;
    expect(button).not.toBeNull();
    const size = getComputedStyle(button).width;
    expect(parseFloat(size) * (size.endsWith('rem') ? 16 : 1)).toBe(CARD_GEOMETRY.toggleBoxSize);
    const toggle = button.parentElement!;
    expect(toggle.style.top).toBe(toggle.style.right);
    for (const inset of [8, 20]) {
      const variables: Record<string, number> = { '--st-component-diagramZone-toggleInset': inset, '--st-component-diagramCard-borderWidth': 2, '--st-component-diagramZone-borderWidth': 1.5, '--st-component-diagramZone-headerInset': 16 };
      const expression = toggle.style.top.replace(/var\(([^,]+),[^)]+\)/g, (_, name) => String(variables[name])).replace(/^calc\(|\)$/g, '');
      const offset = (expression.match(/[+-]?\s*\d+(?:\.\d+)?/g) ?? []).reduce((sum, number) => sum + Number(number.replace(/\s/g, '')), 0);
      expect(offset + (variant === 'expanded' ? 17.5 : 2)).toBe(inset);
    }
    button.style.width = '48px';
    button.style.height = '48px';
    expect(anatomy(root)).not.toEqual(actual);
    view.unmount();sheet.remove();
  });
}

for (const host of ['svelte', 'vue'] as const) for (const variant of ['card', 'folded', 'expanded'] as const) {
  it(`should truncate every long identifier and retain full accessible text in default ${host}/${variant} text slots (A11)`, () => {
    const text = 'W'.repeat(100);
    const props = variant === 'card' ? { entityId: 'long', title: text, body: [text], footer: text }
      : { entityId: 'long', title: text, subtitle: text, footer: text, collapsed: variant === 'folded', width: 600 };
    const view = host === 'svelte' ? render(variant === 'card' ? SvelteCard : SvelteZone, props as never)
      : mount(variant === 'card' ? VueCard : VueZone, { props: props as never });
    const root = 'container' in view ? view.container : view.element;
    for (const [selector, role, width] of [['.st-diagramCard-title', 'title', variant === 'expanded' ? 492 : 358], ['.st-diagramCard-line,.st-diagramZone-subtitle', 'body', variant === 'expanded' ? 434 : variant === 'folded' ? 396 : 436], ['.st-diagramCard-footerLine,.st-diagramZone-footerLine', 'footer', variant === 'expanded' ? 568 : 434]] as const) {
      const lines = [...root.querySelectorAll(selector)].map(line => line.textContent!);
      expect(lines.at(-1)).toMatch(/…$/u);
      const group = root.matches('[role=group]') ? root : root.querySelector('[role=group]')!;
      expect(group.getAttribute('title')).toContain(text);
      expect(root.querySelector('[id]')?.textContent).toContain(text);
      for (const line of lines) expect(defaultCardMeasure(line, role, 10000).lineWidths![0]).toBeLessThanOrEqual(width);
    }
    view.unmount();
  });
}

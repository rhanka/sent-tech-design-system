import { withControlIconTokens } from './test-support/control-icon-contract.js';
import SceneFigure from './DiagramSceneFigure.vue';
import SvelteScene from '../../components-svelte/src/lib/DiagramSceneFigure.svelte';
import type { DiagramSceneFigureProps } from './DiagramSceneFigure.types.js';
import type { SceneDocument, ScenePresentation, SceneOccurrenceRef } from './diagramSceneModel.js';
import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN, m3ProfileRegistry, shippedExecutorBindings } from '../../diagram-canvas/tests/scene-host-fixtures.js';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, shallowRef } from 'vue';
import { render, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DiagramCard from './DiagramCard.vue';
import DiagramZone from './DiagramZone.vue';
import DiagramIcon from './diagram-icons/DiagramIcon.vue';
import GraphLegend from './GraphLegend.vue';
import ForceGraph from './ForceGraph.vue';
import SvelteCard from '../../components-svelte/src/lib/DiagramCard.svelte';
import SvelteZone from '../../components-svelte/src/lib/DiagramZone.svelte';
import SvelteIcon from '../../components-svelte/src/lib/diagram-icons/DiagramIcon.svelte';
import SvelteLegend from '../../components-svelte/src/lib/GraphLegend.svelte';
import SvelteForce from '../../components-svelte/src/lib/ForceGraph.svelte';
import { CORPUS_NODES } from '../../components-svelte/src/lib/diagram-card-parity/diagram-card-corpus.js';
import { COLLAPSED_ZONES, EXPANDED_PEOPLE } from '../../components-svelte/src/lib/diagram-zone-parity/diagram-zone-corpus.js';
import { DIAGRAM_GLYPH_NAMES, getDiagramGlyph } from './diagram-icons/registry.js';
import { projectCardProps, type DiagramCardProps } from './diagramCardModel.js';
import { renderCardSvg, renderZoneSvg } from './diagram-render/index.js';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

/** Compare every element/attribute and meaningful text, retaining DOM order.
 * Only framework markers, comments and equivalent CSS serialization differ. */
export function dom(node: Element): unknown {
  const attrs = [...node.attributes].filter(a => !/^data-v-/.test(a.name)).map(a => {
    if (a.name === 'aria-describedby' || a.name === 'id' && node.hasAttribute('hidden')) return [a.name, 'description'];
    if (a.name === 'class') return [a.name, a.value.split(/\s+/).filter(c => c && !c.startsWith('svelte-')).sort().join(' ')];
    if (a.name === 'style') {
      const style = (node as HTMLElement).style;
      return [a.name, Array.from({ length: style.length }, (_, index) => style.item(index)).sort().map(key => [key, style.getPropertyValue(key).trim()])];
    }
    return [a.name, a.value.replace(/diagram-arrow-[^\s)]+/g, 'diagram-arrow-instance')];
  }).filter(([name, value]) => !(name === 'class' && value === '')).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  return { tag: node.tagName, attrs, children: [...node.childNodes].flatMap(child => {
    if (child.nodeType === 1) return [dom(child as Element)];
    if (child.nodeType === 3 && child.textContent?.trim()) return [child.textContent.replace(/\s+/g, ' ').trim()];
    return [];
  }) };
}

describe('Svelte/Vue corpus DOM and ARIA parity', () => {
  it('should emit each collapsed-zone diagnostic once', async () => {
    for (const props of [
      { entityId: 'unknown-zone', title: 'Unknown', collapsed: true, icon: 'unmapped' },
      { entityId: 'growing-zone', title: 'Grows', collapsed: true, autoSize: true, subtitle: 'word '.repeat(50) },
    ]) {
      const vue = mount(DiagramZone, { props }); await nextTick();
      const diagnostics = vi.fn();
      const svelte = render(SvelteZone, { ...props, onDiagnostic: diagnostics }); await tick();
      const expected = renderZoneSvg(props).diagnostics;
      expect(vue.emitted('diagnostic')?.flat()).toEqual(expected);
      expect(diagnostics.mock.calls.map(call => call[0])).toEqual(expected);
      vue.unmount(); svelte.unmount();
    }
  });
  it('should invoke graph listeners once and restrict pointer activation to the dot', async () => {
    const onSelect = vi.fn(), onOpenEntity = vi.fn(), onNodeHover = vi.fn(), onEdgeHover = vi.fn();
    const vue = mount(ForceGraph, { props: { label: 'Graph', nodes: [{ id: 'a', shape: 'star' }, { id: 'b' }], edges: [{ source: 'a', target: 'b' }], iterations: 1, onSelect, onOpenEntity, onNodeHover, onEdgeHover } });
    for (const dot of vue.findAll('.st-forceGraph__dot')) {
      onSelect.mockClear(); onOpenEntity.mockClear(); onNodeHover.mockClear();
      await dot.trigger('click'); expect(onSelect).toHaveBeenCalledTimes(1);
      await dot.trigger('dblclick'); expect(onOpenEntity).toHaveBeenCalledTimes(1);
      onSelect.mockClear(); onOpenEntity.mockClear();
      await dot.trigger('keydown', { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledTimes(1); expect(onOpenEntity).toHaveBeenCalledTimes(1);
      await dot.trigger('focus'); expect(onNodeHover).toHaveBeenCalledTimes(1);
      await dot.trigger('blur'); expect(onNodeHover).toHaveBeenCalledTimes(2); expect(onNodeHover).toHaveBeenLastCalledWith(null);
    }
    await vue.find('.st-forceGraph__edgeHit').trigger('mouseenter'); expect(onEdgeHover).toHaveBeenCalledTimes(1);
    onSelect.mockClear(); onOpenEntity.mockClear();
    await vue.find('.st-forceGraph__label').trigger('click'); await vue.find('.st-forceGraph__label').trigger('dblclick');
    expect(onSelect).not.toHaveBeenCalled(); expect(onOpenEntity).not.toHaveBeenCalled(); vue.unmount();
  });
  it('should invoke template graph listeners once, including merge completion', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const listeners = { select: vi.fn(), open: vi.fn(), node: vi.fn(), edge: vi.fn(), merge: vi.fn() };
    const pair = shallowRef<{ id: string; from: string; into: string } | null>(null);
    const graph = { label: 'Graph', nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b' }], iterations: 1 };
    const Host = defineComponent({ components: { ForceGraph }, setup: () => ({ graph, listeners, pair }),
      template: '<ForceGraph v-bind="graph" :merge-pair="pair" @select="listeners.select" @open-entity="listeners.open" @node-hover="listeners.node" @edge-hover="listeners.edge" @merge-complete="listeners.merge" />' });
    const vue = mount(Host);
    await vue.find('.st-forceGraph__dot').trigger('click'); expect(listeners.select).toHaveBeenCalledExactlyOnceWith('a');
    await vue.find('.st-forceGraph__dot').trigger('dblclick'); expect(listeners.open).toHaveBeenCalledExactlyOnceWith('a');
    await vue.find('.st-forceGraph__dot').trigger('focus'); expect(listeners.node).toHaveBeenCalledTimes(1);
    await vue.find('.st-forceGraph__edgeHit').trigger('mouseenter'); expect(listeners.edge).toHaveBeenCalledTimes(1);
    const mergePair = { id: 'merge', from: 'a', into: 'b' };
    pair.value = mergePair; await nextTick(); await nextTick();
    expect(listeners.merge).toHaveBeenCalledExactlyOnceWith(mergePair); vue.unmount(); vi.unstubAllGlobals();
  });
  for (const card of CORPUS_NODES) for (const lang of ['fr', 'en'] as const) {
    it(`should match card ${card.id} in ${lang}`, async () => {
      const text = card[lang];
      const projected = projectCardProps({ form: 'card', text: { kicker: text.kicker, title: text.title, body: text.fn, detail: text.detail, footer: text.footer }, icon: card.icon, categoryRef: card.tone }, { entityId: card.id, resolveGlyph: getDiagramGlyph });
      if (projected.kind !== 'card') throw new Error('fixture has no card');
      const props = projected.props;
      const vue = mount(DiagramCard, { props });
      const svelte = render(SvelteCard, { props });
      await nextTick(); await tick();
      expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      expect(vue.emitted('diagnostic')?.flat() ?? []).toEqual(renderCardSvg(props).diagnostics);
      vue.unmount(); svelte.unmount();
    });
  }
  for (const zone of [...COLLAPSED_ZONES, EXPANDED_PEOPLE]) for (const collapsed of [true, false]) {
    it(`should match zone ${zone.id} with collapsed=${collapsed}`, async () => {
      const props = { entityId: zone.id, kicker: zone.kicker, title: zone.title, subtitle: zone.subtitle,
        icon: zone.icon, iconGlyph: getDiagramGlyph(zone.icon), tone: zone.tone,
        footer: 'footer' in zone ? zone.footer : undefined, collapsed, toggleLabel: 'Toggle', x: zone.x, y: zone.y,
        ...(collapsed ? {} : { width: 492, height: 975 }) };
      const vue = mount(DiagramZone, { props }); const svelte = render(SvelteZone, { props });
      await nextTick(); await tick();
      expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      expect(vue.emitted('diagnostic')?.flat() ?? []).toEqual(renderZoneSvg(props).diagnostics);
      const button = vue.find('button');
      if (button.exists()) { await button.trigger('click'); expect(vue.emitted('toggle')).toEqual([[{ entityId: zone.id, collapsed }]]); }
      vue.unmount(); svelte.unmount();
    });
  }
  for (const collapsed of [true, false]) {
    it(`should paint the depth surface on both hosts with collapsed=${collapsed} (addendum 1)`, async () => {
      const props = { entityId: 'depth-zone', title: 'Depth', collapsed, toggleLabel: 'Toggle', depth: 1, ...(collapsed ? {} : { width: 492 }) };
      const vue = mount(DiagramZone, { props }); const svelte = render(SvelteZone, { props });
      await nextTick(); await tick();
      expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      const frame = vue.element.querySelector('.st-diagramZone') ?? vue.element.querySelector('.st-diagramCard');
      expect(frame?.getAttribute('style') ?? '').toContain('--st-component-diagramZone-surface2');
      vue.unmount(); svelte.unmount();
    });
  }
  for (const props of [
    { entityId: 'overflow', title: 'X'.repeat(200), body: ['body'] },
    { entityId: 'unknown', title: 'Unknown', body: ['body'], icon: 'unmapped' },
    { entityId: 'proposed', title: 'Proposal', body: ['body'], proposed: true, align: 'center', toggle: { collapsed: true, label: 'Expand' } },
    { entityId: 'v2-default', title: 'Compact', body: ['Line'], anatomy: 'v2' },
    { entityId: 'v2-left', title: 'Compact left', body: ['Line'], anatomy: 'v2', align: 'left' },
    { entityId: 'v2-fallback', kicker: 'KICKER', title: 'Title', body: ['Body', 'Detail'], detailCount: 1, footer: 'Footer', anatomy: 'v2' },
  ] satisfies DiagramCardProps[]) {
    it(`should preserve ${props.entityId} state and diagnostics`, async () => {
      const vue = mount(DiagramCard, { props }); const svelte = render(SvelteCard, { props });
      await nextTick(); await tick(); expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      expect(vue.emitted('diagnostic')?.flat() ?? []).toEqual(renderCardSvg(props).diagnostics);
      if (props.anatomy === 'v2' && props.entityId !== 'v2-fallback') {
        expect(vue.element.getAttribute('style') ?? '').toContain('--st-component-diagramCard-iconTextGap: var(--st-component-diagramCardCompact-iconTextGap, 4px)');
      } else if (props.entityId === 'v2-fallback') {
        expect(vue.element.getAttribute('style') ?? '').not.toContain('--st-component-diagramCard-iconTextGap');
        expect(vue.element.getAttribute('style') ?? '').toContain('height: 200px');
      }
      await vue.trigger('click'); expect(vue.emitted('select')).toEqual([[{ entityId: props.entityId }]]);
      vue.unmount(); svelte.unmount();
    });
  }
  for (const collapsed of [true, false]) {
    it(`should match v2 zone anatomy and inline tokens on both hosts with collapsed=${collapsed}`, async () => {
      const props = { entityId: 'v2-zone', title: 'Zone', subtitle: 'Sub', collapsed, toggleLabel: 'Toggle', anatomy: 'v2' as const, ...(collapsed ? {} : { width: 492 }) };
      const vue = mount(DiagramZone, { props }); const svelte = render(SvelteZone, { props });
      await nextTick(); await tick();
      expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      expect(vue.emitted('diagnostic')?.flat() ?? []).toEqual(renderZoneSvg(props).diagnostics);
      const frame = vue.element.querySelector('.st-diagramZone') ?? vue.element.querySelector('.st-diagramCard');
      const style = frame?.getAttribute('style') ?? '';
      expect(style).toContain('--st-component-diagramCard-iconTextGap');
      if (collapsed) {
        expect(style).toContain('height: 154px');
      } else {
        expect(style).toContain('--st-component-diagramZone-headerInset');
        const header = vue.element.querySelector<HTMLElement>('.st-diagramZone-header');
        expect(header?.style.right).toBe(header?.style.left);
        const toggle = vue.element.querySelector<HTMLElement>('.st-diagramCard-toggle');
        expect(toggle?.style.top).toBe(toggle?.style.right);
      }
      vue.unmount(); svelte.unmount();
    });
  }
  it('should anchor expanded v2 zone header right to headerInset (12px) when containerPadding is 16px on both hosts', async () => {
    const props = {
      entityId: 'v2-zone-padded',
      title: 'Zone',
      subtitle: 'Sub',
      collapsed: false,
      toggleLabel: 'Collapse',
      anatomy: 'v2' as const,
      containerPadding: 16,
      width: 492,
      height: 400,
    };
    const vue = mount(DiagramZone, { props });
    const svelte = render(SvelteZone, { props });
    await nextTick(); await tick();
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
    for (const root of [vue.element, svelte.container]) {
      const header = root.querySelector<HTMLElement>('.st-diagramZone-header')!;
      const toggle = root.querySelector<HTMLElement>('.st-diagramCard-toggle')!;
      expect(header.style.left).toBe('calc(12px - var(--st-component-diagramZone-borderWidth, 1.5px))');
      expect(header.style.right).toBe('calc(12px - var(--st-component-diagramZone-borderWidth, 1.5px))');
      expect(header.style.top).toBe(header.style.right);
      expect(toggle.style.top).toBe(toggle.style.right);
    }
    vue.unmount(); svelte.unmount();
  });
  for (const name of DIAGRAM_GLYPH_NAMES) it(`should match icon ${name}`, () => {
    const vue = mount(DiagramIcon, { props: { name } }); const svelte = render(SvelteIcon, { props: { name } });
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!))); vue.unmount(); svelte.unmount();
  });
  it('should render no unknown icon', () => {
    const vue = mount(DiagramIcon, { props: { name: 'unmapped-glyph' } }); expect(vue.find('svg').exists()).toBe(false); vue.unmount();
  });
  const entries = [{ label: 'Star', shape: 'star' as const, tone: 'category2' as const },
    { label: 'Edge', dash: 'long-dash' as const }, { label: 'Weak', weak: true }];
  it('should match graph legend shapes and dash styles', () => {
    const props = { entries, title: 'Legend' };
    const vue = mount(GraphLegend, { props }); const svelte = render(SvelteLegend, { props });
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!))); vue.unmount();
  });
  it('should match force graph geometry and keyboard/hover intents', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const props = { nodes: [{ id: 'a', shape: 'star' as const }, { id: 'b', group: 'two' }], edges: [{ source: 'a', target: 'b', dash: 'dotted' as const }], label: 'Graph', legend: entries, selectedIds: ['a'], iterations: 5 };
    const vue = mount(ForceGraph, { props }); const svelte = render(SvelteForce, { props });
    await nextTick(); await tick(); expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
    const button = vue.find('[role="button"]'); await button.trigger('keydown', { key: 'Enter' });
    expect(vue.emitted('select')).toEqual([['a']]); expect(vue.emitted('openEntity')).toEqual([['a']]);
    await button.trigger('focus'); expect(vue.emitted('nodeHover')?.[0]?.[0]).toEqual(props.nodes[0]);
    vue.unmount(); vi.unstubAllGlobals();
  });
});

// Token fallbacks are valid CSS; only values outside a DS var() are literals.
function bareCss(css: string): string {
  let result = '', cursor = 0;
  for (let index = 0; index < css.length; index++) {
    if (!css.startsWith('var(--st-', index)) continue;
    let end = index + 4, depth = 1;
    for (; end < css.length && depth; end++) {
      if (css[end] === '(') depth++; else if (css[end] === ')') depth--;
    }
    result += css.slice(cursor, index) + 'token'; cursor = end; index = end - 1;
  }
  return result + css.slice(cursor);
}
it('should permit nested token fallbacks while retaining bare CSS values for the guard', () => {
  expect(bareCss('width:var(--st-width, 460px);color:var(--st-ink,var(--st-text,#fff));gap:3px')).toBe('width:token;color:token;gap:3px');
});

describe('official classic and Vapor SFC compilers', () => {
  const require = createRequire(import.meta.url);
  const compilers = [['classic', require('vue/compiler-sfc')], ['Vapor', require('@vue/compiler-sfc')]] as const;
  for (const [, compiler] of compilers) compiler.registerTS(() => require('typescript'));
  const root = resolve(import.meta.dirname);
  const files = readdirSync(root).filter(file => file.endsWith('.vue')).concat('diagram-icons/DiagramIcon.vue');
  for (const [mode, compiler] of compilers) for (const file of files) it(`should compile ${file} in ${mode}`, () => {
    const filename = resolve(root, file);
    const source = readFileSync(filename, 'utf8');
    const { descriptor, errors } = compiler.parse(mode === 'Vapor' ? source.replace(/^(<script\b[^>]*\bsetup\b)(?![^>]*\bvapor\b)/m, '$1 vapor') : source, { filename });
    expect(errors).toEqual([]);
    if (mode === 'Vapor') expect(descriptor.vapor).toBe(true);
    const output = compiler.compileScript(descriptor, { id: file, inlineTemplate: true,
      fs: { fileExists: existsSync, readFile: (path: string) => existsSync(path) ? readFileSync(path, 'utf8') : undefined },
    });
    expect(output.content.length).toBeGreaterThan(0);
    if (mode === 'Vapor') expect(output.content).toContain('defineVaporComponent');
    expect(source).not.toMatch(/\bh\s*\(/);
    const styles = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(bareCss(styles)).not.toMatch(/#[0-9a-fA-F]{3,8}\b|(?<![-\w])(?:[1-9]\d*|0?\.\d+)(?:px|rem|em|ch)\b/);
  });
});

interface CardSpec {
  readonly id: string;
  readonly parent?: string;
  readonly container?: boolean;
}

const occurrence = (id: string): SceneOccurrenceRef => `occurrence:e.${id}` as SceneOccurrenceRef;

function sceneOf(
  name: string,
  cards: readonly CardSpec[],
  links: readonly { readonly from: string; readonly to: string; readonly label?: string }[] = [],
): { document: SceneDocument; presentation: ScenePresentation; hints: NonNullable<DiagramSceneFigureProps["hints"]> } {
  const entities: Record<string, unknown> = {};
  const relations: Record<string, unknown> = {};
  const forms: Record<string, unknown> = {};
  const ordering: Record<string, string[]> = {};
  const rootOrder: string[] = [];
  for (const card of cards) {
    const ref = `entity:${card.id}`;
    entities[ref] = {
      id: ref,
      profile: "generic@2",
      type: card.container === true ? "container" : "node",
      attributes: { name: { kind: "text", value: card.id } },
    };
    forms[occurrence(card.id)] =
      card.container === true
        ? { form: "container", text: { kicker: "ZONE", title: `Zone ${card.id}`, subtitle: "Group" } }
        : { form: "card", text: { kicker: "CARD", title: `Card ${card.id}`, body: "Does one thing" } };
    if (card.parent === undefined) {
      rootOrder.push(ref);
      continue;
    }
    (ordering[`entity:${card.parent}`] ??= []).push(ref);
    relations[`relation:contains.${card.id}`] = {
      id: `relation:contains.${card.id}`,
      profile: "generic@2",
      type: "contains",
      endpoints: [
        { role: "parent", target: `entity:${card.parent}` },
        { role: "child", target: ref },
      ],
      attributes: {},
    };
  }
  for (const link of links) {
    const id = `relation:link.${link.from}.${link.to}`;
    relations[id] = {
      id,
      profile: "generic@2",
      type: "link",
      endpoints: [
        { role: "source", target: `entity:${link.from}` },
        { role: "target", target: `entity:${link.to}` },
      ],
      attributes: link.label === undefined ? {} : { label: { kind: "text", value: link.label } },
    };
  }
  return {
    document: {
      documentId: `document:${name}`,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SceneDocument,
    presentation: {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: forms,
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation,
    hints: { rootOrder, ordering } as unknown as NonNullable<DiagramSceneFigureProps["hints"]>,
  };
}

const children = (zone: string, count: number): CardSpec[] =>
  Array.from({ length: count }, (_, index) => ({ id: `${zone}${index + 1}`, parent: zone }));

/** Two zones of six cards and one free card, one labelled link: overflows any 16:9 box at 100 %. */
const WIDE = sceneOf(
  "wide",
  [
    { id: "a", container: true },
    ...children("a", 6),
    { id: "b", container: true },
    ...children("b", 6),
    { id: "c" },
  ],
  [{ from: "a1", to: "c", label: "calls" }],
);
const SINGLE = sceneOf("single", [{ id: "solo" }]);
/** Three root cards; the engine places the label of the p → r link. */
const LABELLED = sceneOf("labelled", [{ id: "p" }, { id: "q" }, { id: "r" }], [{ from: "p", to: "r", label: "ok" }]);
const EMPTY = sceneOf("empty", []);


describe('scene host DOM and camera/fold behavior', () => {
  function frame() {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1280);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
  }
  const host = { registry: m3ProfileRegistry, bindings: shippedExecutorBindings };
  it('should cancel browser pinch handling and remove the wheel listener on teardown', async () => {
    frame();
    const vue = mount(SceneFigure, { props: { ...host, ...WIDE } });
    const viewport = vue.find('.st-diagramSceneFigure-viewport');
    const remove = vi.spyOn(viewport.element, 'removeEventListener');
    for (const [pointerId, clientX] of [[1, 0], [2, 100]]) {
      const down = new Event('pointerdown', { bubbles: true });
      Object.assign(down, { pointerType: 'touch', pointerId, clientX, clientY: 0 }); viewport.element.dispatchEvent(down);
    }
    const event = new Event('pointermove', { bubbles: true, cancelable: true });
    Object.assign(event, { pointerType: 'touch', pointerId: 2, clientX: 150, clientY: 0 });
    viewport.element.dispatchEvent(event); await nextTick();
    expect(event.defaultPrevented).toBe(true);
    vue.unmount(); expect(remove).toHaveBeenCalledWith('wheel', expect.any(Function)); vi.unstubAllGlobals();
  });
  for (const fixture of [SINGLE, WIDE, LABELLED, EMPTY]) it('should match scene '+fixture.document.documentId, async () => {
    frame();
    const props = { ...host, ...fixture, title: 'Dossier' };
    const vue = mount(SceneFigure, { props }); const svelte = render(SvelteScene, { props });
    await nextTick(); await tick(); await nextTick();
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
    expect(vue.emitted('layout')).toHaveLength(1);
    const passCount = vue.emitted('layout')!.length;
    vue.vm.setZoom(Number.POSITIVE_INFINITY);
    vue.vm.setZoom(999); await nextTick();
    expect(vue.vm.getCamera().zoom).toBe(vue.vm.getCamera().maxZoom);
    expect(vue.emitted('layout')).toHaveLength(passCount);
    await vue.find('.st-diagramSceneFigure-viewport').trigger('keydown', { key: '-' });
    expect(vue.vm.getCamera().zoom).toBeLessThanOrEqual(vue.vm.getCamera().maxZoom);
    vue.vm.fitToFrame(); await nextTick();
    expect(vue.vm.getCamera().zoom).toBe(vue.vm.getCamera().fitZoom);
    vue.unmount(); svelte.unmount(); vi.unstubAllGlobals();
  });
  it('should emit folds, restore focus and honor controlled fold state', async () => {
    frame();
    const vue = mount(SceneFigure, { props: { ...host, ...WIDE, collapsed: [] }, attachTo: document.body });
    // A fold moves the zone from the frame plane to the box plane: find it by occurrence.
    const zone = `[data-scene-occurrence="${occurrence('a')}"] button`;
    const toggle = vue.find(zone);
    await toggle.trigger('click');
    expect(vue.emitted('foldChange')?.[0]?.[0]).toEqual([occurrence('a')]);
    expect(vue.find(zone).attributes('aria-expanded')).toBe('true');
    await vue.setProps({ collapsed: [occurrence('a')] });
    await nextTick();
    expect(vue.find(zone).attributes('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(vue.find(zone).element);
    expect(vue.emitted('layout')).toHaveLength(2); vue.unmount(); vi.unstubAllGlobals();
  });
  it('should display a refused scene accessibly', async () => {
    const vue = mount(SceneFigure, { props: { ...host, ...SINGLE, registry: { get: () => undefined, list: () => [] } as never } });
    expect(vue.find('[role="alert"]').text()).toContain('Diagram unavailable');
    expect(vue.attributes('data-scene-refused')).toBeTruthy(); vue.unmount();
  });
  it('should wire depthParityStart and stamp synthesized nested-zone surfaces identically on Svelte and Vue', async () => {
    frame();
    const nested = sceneOf('nested-depth', [
      { id: 'outer', container: true },
      { id: 'inner', container: true, parent: 'outer' },
      { id: 'leaf', parent: 'inner' },
    ]);
    for (const depthParityStart of [undefined, 1] as const) {
      for (const extra of [{}, { flows: {} }] as const) {
        const props = { ...host, ...nested, ...extra, ...(depthParityStart === undefined ? {} : { depthParityStart }) };
        const vue = mount(SceneFigure, { props }); const svelte = render(SvelteScene, { props });
        await nextTick(); await tick(); await nextTick();
        if (Object.keys(extra).length === 0) {
          expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
        }
        const outerFrame = vue.element.querySelector(`[data-scene-occurrence="${occurrence('outer')}"] .st-diagramZone`);
        const innerFrame = vue.element.querySelector(`[data-scene-occurrence="${occurrence('inner')}"] .st-diagramZone`);
        if (depthParityStart === undefined) {
          expect(innerFrame?.getAttribute('style') ?? '').toContain('--st-component-diagramZone-surface2');
        } else {
          expect(outerFrame?.getAttribute('style') ?? '').toContain('--st-component-diagramZone-surface2');
          expect(innerFrame?.getAttribute('style') ?? '').toContain('--st-component-diagramZone-surface1');
        }
        vue.unmount(); svelte.unmount();
      }
    }
    vi.unstubAllGlobals();
  });
  it('should keep icon none without unknown fallback or warning under strict DiagramSceneFigure on Svelte and Vue', async () => {
    frame();
    const base = sceneOf('icon-none-host', [
      { id: 'zone', container: true },
      { id: 'card', parent: 'zone' },
    ]);
    const presentation = {
      ...base.presentation,
      entities: {
        [occurrence('zone')]: { ...base.presentation.entities[occurrence('zone')], icon: 'none' },
        [occurrence('card')]: { ...base.presentation.entities[occurrence('card')], icon: 'none' },
      },
    } as unknown as ScenePresentation;
    const props = { ...host, ...base, presentation, strictIcons: true };
    const vue = mount(SceneFigure, { props }); const svelte = render(SvelteScene, { props });
    await nextTick(); await tick(); await nextTick();
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
    expect(vue.element.querySelector('[data-diagram-icon]')).toBeNull();
    expect(vue.element.querySelector('[data-card-icon-unknown]')).toBeNull();
    expect(vue.element.querySelector('[data-zone-icon-unknown]')).toBeNull();
    const layoutEvent = vue.emitted('layout')?.at(-1)?.[0] as { status?: string; warnings?: readonly { code: string }[] } | undefined;
    expect(layoutEvent?.status).toBe('laid-out');
    expect(layoutEvent?.warnings?.filter(w => w.code === 'card-icon-missing') ?? []).toEqual([]);
    vue.unmount(); svelte.unmount();
    vi.unstubAllGlobals();
  });
  it('should fold and unfold a v2 multi-container nested scene identically on Svelte and Vue without ejecting grandchildren', async () => {
    frame();
    const base = sceneOf(
      'v2-nested-parity',
      [
        { id: 'outerA', container: true },
        { id: 'innerA', container: true, parent: 'outerA' },
        { id: 'a1', parent: 'innerA' },
        { id: 'a2', parent: 'innerA' },
        { id: 'aSibling', parent: 'outerA' },
        { id: 'outerB', container: true },
        { id: 'b1', parent: 'outerB' },
        { id: 'ext' },
      ],
      [
        { from: 'a1', to: 'a2', label: 'inner' },
        { from: 'a1', to: 'aSibling', label: 'sibling' },
        { from: 'a1', to: 'b1', label: 'sync1' },
        { from: 'a2', to: 'b1', label: 'sync2' },
        { from: 'aSibling', to: 'b1', label: 'sync3' },
        { from: 'a2', to: 'ext', label: 'pub' },
      ],
    );
    const presentation = {
      ...base.presentation,
      entities: Object.fromEntries(
        Object.entries(base.presentation.entities).map(([id, entry]) => [
          id,
          entry.form === 'container'
            ? { form: 'container', text: { title: id.replace('occurrence:e.', ''), subtitle: 'Sub' }, anatomy: 'v2' }
            : { form: 'card', text: { title: id.replace('occurrence:e.', ''), body: 'Work' }, anatomy: 'v2' },
        ]),
      ),
    } as unknown as ScenePresentation;
    const props = { ...host, ...base, presentation };
    const vue = mount(SceneFigure, { props, attachTo: document.body });
    const svelte = render(SvelteScene, { props });
    await nextTick(); await tick(); await nextTick();
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));

    const occurrencesOf = (root: Element) =>
      [...root.querySelectorAll<HTMLElement>('[data-scene-occurrence]')].map(el => el.dataset['sceneOccurrence']!).sort();
    const rectOf = (root: Element, id: string) => {
      const el = root.querySelector<HTMLElement>(`[data-scene-occurrence="${occurrence(id)}"]`)!;
      return { x: parseFloat(el.style.left), y: parseFloat(el.style.top), width: parseFloat(el.style.width), height: parseFloat(el.style.height) };
    };

    expect(occurrencesOf(vue.element)).toEqual([
      occurrence('a1'), occurrence('a2'), occurrence('aSibling'), occurrence('b1'),
      occurrence('ext'), occurrence('innerA'), occurrence('outerA'), occurrence('outerB'),
    ]);
    expect(rectOf(vue.element, 'a1')).toMatchObject({ width: 352, height: 154 });
    expect(vue.element.querySelectorAll('path[data-scene-edge]')).toHaveLength(6);
    expect(vue.element.querySelector(`[data-scene-occurrence="${occurrence('innerA')}"] .st-diagramZone`)?.getAttribute('style') ?? '').toContain('--st-component-diagramZone-surface2');
    const outerHeader = vue.element.querySelector<HTMLElement>(`[data-scene-occurrence="${occurrence('outerA')}"] .st-diagramZone-header`)!;
    expect(outerHeader.style.left).toBe('calc(12px - var(--st-component-diagramZone-borderWidth, 1.5px))');
    expect(outerHeader.style.right).toBe(outerHeader.style.left);
    // Compact v2 cards and expanded v2 zones both apply host iconTextGap override.
    expect(vue.element.querySelector(`[data-scene-occurrence="${occurrence('a1')}"] .st-diagramCard`)?.getAttribute('style') ?? '').toContain('--st-component-diagramCard-iconTextGap');
    expect(vue.element.querySelector(`[data-scene-occurrence="${occurrence('outerA')}"] .st-diagramZone`)?.getAttribute('style') ?? '').toContain('--st-component-diagramCard-iconTextGap');
    const initialOuterB = rectOf(vue.element, 'outerB');
    const initialExt = rectOf(vue.element, 'ext');

    // Fold outerA on both hosts while innerA is expanded: all descendants hide, links re-route and bundle.
    await vue.find(`[data-scene-occurrence="${occurrence('outerA')}"] button[aria-expanded]`).trigger('click');
    svelte.container.querySelector<HTMLButtonElement>(`[data-scene-occurrence="${occurrence('outerA')}"] button[aria-expanded]`)!.click();
    await nextTick(); await tick(); await nextTick();

    expect(occurrencesOf(vue.element)).toEqual([
      occurrence('b1'), occurrence('ext'), occurrence('outerA'), occurrence('outerB'),
    ]);
    expect(occurrencesOf(svelte.container)).toEqual(occurrencesOf(vue.element));
    expect(rectOf(vue.element, 'outerA')).toMatchObject({ width: 352, height: 154 });
    const foldedOuterB = rectOf(vue.element, 'outerB');
    const foldedExt = rectOf(vue.element, 'ext');
    expect(
      initialOuterB.x !== foldedOuterB.x || initialOuterB.y !== foldedOuterB.y ||
      initialExt.x !== foldedExt.x || initialExt.y !== foldedExt.y,
    ).toBe(true);
    expect(vue.element.querySelectorAll('path[data-scene-edge]')).toHaveLength(2);
    expect(vue.element.querySelectorAll('[data-bundle-relation]')).toHaveLength(3);
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));

    // Unfold outerA on both hosts: exact same structure, geometry, edges and depth surfaces return.
    await vue.find(`[data-scene-occurrence="${occurrence('outerA')}"] button[aria-expanded]`).trigger('click');
    svelte.container.querySelector<HTMLButtonElement>(`[data-scene-occurrence="${occurrence('outerA')}"] button[aria-expanded]`)!.click();
    await nextTick(); await tick(); await nextTick();

    expect(occurrencesOf(vue.element)).toEqual([
      occurrence('a1'), occurrence('a2'), occurrence('aSibling'), occurrence('b1'),
      occurrence('ext'), occurrence('innerA'), occurrence('outerA'), occurrence('outerB'),
    ]);
    expect(vue.element.querySelectorAll('path[data-scene-edge]')).toHaveLength(6);
    expect(vue.element.querySelector(`[data-scene-occurrence="${occurrence('innerA')}"] .st-diagramZone`)?.getAttribute('style') ?? '').toContain('--st-component-diagramZone-surface2');
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(rectOf(vue.element, 'outerB')[key] - initialOuterB[key])).toBeLessThanOrEqual(1 / 64);
      expect(Math.abs(rectOf(vue.element, 'ext')[key] - initialExt[key])).toBeLessThanOrEqual(1 / 64);
    }
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));

    vue.unmount(); svelte.unmount();
    vi.unstubAllGlobals();
  });
  it('should match dash patterns, arrowheads and emphasis identically on Svelte and Vue across fold and unfold (DE-2)', async () => {
    frame();
    const base = sceneOf(
      'de2-connector-parity',
      [
        { id: 'zone', container: true },
        { id: 'a', parent: 'zone' },
        { id: 'b', parent: 'zone' },
        { id: 'ext' },
      ],
      [
        { from: 'a', to: 'b', label: 'dotted-open' },
        { from: 'b', to: 'ext', label: 'emphasis-none' },
        { from: 'a', to: 'ext', label: 'proposed-emphasis' },
      ],
    );
    const presentation = {
      ...base.presentation,
      relations: {
        'relation:link.a.b': { strokeStyle: 'dotted', arrowhead: 'open-triangle' },
        'relation:link.b.ext': { arrowhead: 'none', emphasis: 'emphasis' },
        'relation:link.a.ext': { strokeStyle: 'dashed', arrowhead: 'filled-triangle', emphasis: 'emphasis' },
      },
    } as unknown as ScenePresentation;
    const props = { ...host, ...base, presentation };
    const vue = mount(SceneFigure, { props, attachTo: document.body });
    const svelte = render(SvelteScene, { props });
    await nextTick(); await tick(); await nextTick();
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));

    for (const root of [vue.element, svelte.container]) {
      const ab = root.querySelector('path[data-scene-edge="occurrence:r.link.a.b"]')!;
      const be = root.querySelector('path[data-scene-edge="occurrence:r.link.b.ext"]')!;
      const ae = root.querySelector('path[data-scene-edge="occurrence:r.link.a.ext"]')!;
      expect(ab.getAttribute('stroke-dasharray')).toBe('2 5');
      expect(ab.getAttribute('marker-end')).toMatch(/-open\)$/);
      expect(be.getAttribute('stroke-dasharray')).toBeNull();
      expect(be.getAttribute('marker-end')).toBeNull();
      expect(be.getAttribute('data-edge-emphasis')).toBe('emphasis');
      expect(ae.getAttribute('stroke-dasharray')).toBe('8 6');
      expect(ae.getAttribute('marker-end')).toMatch(/-emphasis\)$/);
      expect(ae.getAttribute('data-edge-emphasis')).toBe('emphasis');
      const legend = root.querySelector('[data-scene-legend]');
      expect(legend).not.toBeNull();
      expect(legend!.getAttribute('data-legend-anchor')).toBe('right');
      expect([...root.querySelectorAll('[data-legend-style]')].map((el) => el.getAttribute('data-legend-style'))).toEqual([
        'solid:none:emphasis',
        'dashed:filled-triangle:emphasis',
        'dotted:open-triangle:default',
      ]);
    }

    await vue.find(`[data-scene-occurrence="${occurrence('zone')}"] button[aria-expanded]`).trigger('click');
    svelte.container.querySelector<HTMLButtonElement>(`[data-scene-occurrence="${occurrence('zone')}"] button[aria-expanded]`)!.click();
    await nextTick(); await tick(); await nextTick();
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
    // Lifted cross-zone edges with distinct styles stay separate instead of bundling into one style (REQ-R7-05 / REQ-R7-11 / REQ-R7-12).
    for (const root of [vue.element, svelte.container]) {
      expect(root.querySelectorAll('path[data-scene-edge]')).toHaveLength(2);
      expect([...root.querySelectorAll('[data-legend-style]')].map((el) => el.getAttribute('data-legend-style'))).toEqual([
        'solid:none:emphasis',
        'dashed:filled-triangle:emphasis',
      ]);
    }

    await vue.find(`[data-scene-occurrence="${occurrence('zone')}"] button[aria-expanded]`).trigger('click');
    svelte.container.querySelector<HTMLButtonElement>(`[data-scene-occurrence="${occurrence('zone')}"] button[aria-expanded]`)!.click();
    await nextTick(); await tick(); await nextTick();
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
    expect(vue.element.querySelectorAll('[data-legend-style]')).toHaveLength(3);
    expect(svelte.container.querySelectorAll('[data-legend-style]')).toHaveLength(3);

    vue.unmount(); svelte.unmount();
    vi.unstubAllGlobals();
  });
  it('should render default and overridden localized inclusion labels in the fallback text identically on Svelte and Vue (DE-1b)', async () => {
    frame();
    const rowsOf = (root: Element) => [...root.querySelectorAll('.st-diagramSceneFigure-fallback p')].map(p => p.textContent);
    for (const extra of [{}, { flows: {} }] as const) {
      for (const override of [undefined, 'contient'] as const) {
        const props = {
          ...host,
          ...WIDE,
          ...extra,
          ...(override === undefined ? {} : { labels: { contains: override } }),
        };
        const vue = mount(SceneFigure, { props });
        const svelte = render(SvelteScene, { props });
        await nextTick(); await tick(); await nextTick();
        const expectedLabel = override ?? 'includes';
        const vueRows = rowsOf(vue.element);
        const svelteRows = rowsOf(svelte.container);
        expect(vueRows).toEqual(svelteRows);
        expect(vueRows).toContain(`a → a1 · ${expectedLabel}`);
        expect(vueRows).toContain('a1 → c · calls');
        expect(vueRows.some(row => row?.includes('· contains'))).toBe(false);
        vue.unmount(); svelte.unmount();
      }
    }
    vi.unstubAllGlobals();
  });

  it('should apply opt-in fitToWindow identically on Svelte and Vue across fold/unfold (DE-2 ask 9)', async () => {
    frame();
    const props = { ...host, ...WIDE, fitToWindow: true };
    const vue = mount(SceneFigure, { props });
    const svelte = render(SvelteScene, { props });
    await nextTick(); await tick(); await nextTick();
    expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
    for (const root of [vue.element, svelte.container.firstElementChild!]) {
      expect(root.classList.contains('st-diagramSceneFigure--fitToWindow')).toBe(true);
      expect(root.getAttribute('data-fit-to-window')).toBe('true');
      const viewport = root.querySelector<HTMLElement>('.st-diagramSceneFigure-viewport')!;
      expect(viewport.style.maxHeight).toBe('calc(100vh - 24px)');
      expect(viewport.style.maxWidth).toBe('100%');
      expect(viewport.style.marginInline).toBe('auto');
    }
    vue.unmount(); svelte.unmount();
    vi.unstubAllGlobals();
  });
});

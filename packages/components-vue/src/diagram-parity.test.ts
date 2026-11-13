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
      expect(dom(vue.element)).toEqual(dom(svelte.container.firstElementChild!));
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
      expect(dom(vue.element)).toEqual(dom(svelte.container.firstElementChild!));
      expect(vue.emitted('diagnostic')?.flat() ?? []).toEqual(renderZoneSvg(props).diagnostics);
      const button = vue.find('button');
      if (button.exists()) { await button.trigger('click'); expect(vue.emitted('toggle')).toEqual([[{ entityId: zone.id, collapsed }]]); }
      vue.unmount(); svelte.unmount();
    });
  }
  for (const props of [
    { entityId: 'overflow', title: 'X'.repeat(200), body: ['body'] },
    { entityId: 'unknown', title: 'Unknown', body: ['body'], icon: 'unmapped' },
    { entityId: 'proposed', title: 'Proposal', body: ['body'], proposed: true, align: 'center', toggle: { collapsed: true, label: 'Expand' } },
  ] satisfies DiagramCardProps[]) {
    it(`should preserve ${props.entityId} state and diagnostics`, async () => {
      const vue = mount(DiagramCard, { props }); const svelte = render(SvelteCard, { props });
      await nextTick(); await tick(); expect(dom(vue.element)).toEqual(dom(svelte.container.firstElementChild!));
      expect(vue.emitted('diagnostic')?.flat() ?? []).toEqual(renderCardSvg(props).diagnostics);
      await vue.trigger('click'); expect(vue.emitted('select')).toEqual([[{ entityId: props.entityId }]]);
      vue.unmount(); svelte.unmount();
    });
  }
  for (const name of DIAGRAM_GLYPH_NAMES) it(`should match icon ${name}`, () => {
    const vue = mount(DiagramIcon, { props: { name } }); const svelte = render(SvelteIcon, { props: { name } });
    expect(dom(vue.element)).toEqual(dom(svelte.container.firstElementChild!)); vue.unmount(); svelte.unmount();
  });
  it('should render no unknown icon', () => {
    const vue = mount(DiagramIcon, { props: { name: 'unmapped-glyph' } }); expect(vue.find('svg').exists()).toBe(false); vue.unmount();
  });
  const entries = [{ label: 'Star', shape: 'star' as const, tone: 'category2' as const },
    { label: 'Edge', dash: 'long-dash' as const }, { label: 'Weak', weak: true }];
  it('should match graph legend shapes and dash styles', () => {
    const props = { entries, title: 'Legend' };
    const vue = mount(GraphLegend, { props }); const svelte = render(SvelteLegend, { props });
    expect(dom(vue.element)).toEqual(dom(svelte.container.firstElementChild!)); vue.unmount();
  });
  it('should match force graph geometry and keyboard/hover intents', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const props = { nodes: [{ id: 'a', shape: 'star' as const }, { id: 'b', group: 'two' }], edges: [{ source: 'a', target: 'b', dash: 'dotted' as const }], label: 'Graph', legend: entries, selectedIds: ['a'], iterations: 5 };
    const vue = mount(ForceGraph, { props }); const svelte = render(SvelteForce, { props });
    await nextTick(); await tick(); expect(dom(vue.element)).toEqual(dom(svelte.container.firstElementChild!));
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
    expect(dom(vue.element)).toEqual(dom(svelte.container.firstElementChild!));
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
    const toggle = vue.find('[data-scene-kind="zone"] button');
    await toggle.trigger('click');
    expect(vue.emitted('foldChange')?.[0]?.[0]).toEqual([occurrence('a')]);
    expect(vue.find('[data-scene-kind="zone"] button').attributes('aria-expanded')).toBe('true');
    await vue.setProps({ collapsed: [occurrence('a')] });
    await nextTick();
    expect(vue.find('[data-scene-kind="zone"] button').attributes('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(vue.find('[data-scene-kind="zone"] button').element);
    expect(vue.emitted('layout')).toHaveLength(2); vue.unmount(); vi.unstubAllGlobals();
  });
  it('should display a refused scene accessibly', async () => {
    const vue = mount(SceneFigure, { props: { ...host, ...SINGLE, registry: { get: () => undefined, list: () => [] } as never } });
    expect(vue.find('[role="alert"]').text()).toContain('Diagram unavailable');
    expect(vue.attributes('data-scene-refused')).toBeTruthy(); vue.unmount();
  });
});

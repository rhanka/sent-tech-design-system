import { withControlIconTokens } from './test-support/control-icon-contract.js';
import SceneFigure from './DiagramSceneFigure.vue';
import SvelteScene from '../../components-svelte/src/lib/DiagramSceneFigure.svelte';
import type { DiagramSceneFigureProps } from './DiagramSceneFigure.types.js';
import type { SceneDocument, ScenePresentation, SceneOccurrenceRef } from './diagramSceneModel.js';
import { CURRENT_SCHEMA_VERSION, DEFAULT_PRESENTATION, DIAGRAM_PRESENTATION_CONTRACT_PIN, createView, entityRef, m3ProfileRegistry, occurrenceRef, shippedExecutorBindings, viewRef } from '../../diagram-canvas/tests/scene-host-fixtures.js';
import { hCondInput } from '../../diagram-canvas/tests/layout/dc2a/h-cond.js';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, shallowRef } from 'vue';
import { render, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DiagramCard from './DiagramCard.vue';
import DiagramCardHeader from './DiagramCardHeader.vue';
import DiagramZone from './DiagramZone.vue';
import DiagramZoneHeader from './DiagramZoneHeader.vue';
import DiagramIcon from './diagram-icons/DiagramIcon.vue';
import GraphLegend from './GraphLegend.vue';
import ForceGraph from './ForceGraph.vue';
import SvelteCard from '../../components-svelte/src/lib/DiagramCard.svelte';
import SvelteCardHeader from '../../components-svelte/src/lib/DiagramCardHeader.svelte';
import SvelteZone from '../../components-svelte/src/lib/DiagramZone.svelte';
import SvelteZoneHeader from '../../components-svelte/src/lib/DiagramZoneHeader.svelte';
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
    { entityId: 'v1-pinned-center', kicker: 'KICKER', title: 'Pinned v1', body: ['Body', 'Detail'], detailCount: 1, footer: 'Footer', anatomy: 'v1', align: 'center' },
    { entityId: 'v2-default', title: 'Compact', body: ['Line'], anatomy: 'v2' },
    { entityId: 'v2-center', title: 'Compact center', body: ['Line'], anatomy: 'v2', align: 'center' },
    { entityId: 'v2-left', title: 'Compact left', body: ['Line'], anatomy: 'v2', align: 'left' },
    { entityId: 'v2-fallback', kicker: 'KICKER', title: 'Title', body: ['Body', 'Detail'], detailCount: 1, footer: 'Footer', anatomy: 'v2' },
    { entityId: 'v2-fallback-center', kicker: 'KICKER', title: 'Title', body: ['Body', 'Detail'], detailCount: 1, footer: 'Footer', anatomy: 'v2', align: 'center' },
  ] satisfies DiagramCardProps[]) {
    it(`should preserve ${props.entityId} state and diagnostics`, async () => {
      const vue = mount(DiagramCard, { props }); const svelte = render(SvelteCard, { props });
      await nextTick(); await tick(); expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      expect(vue.emitted('diagnostic')?.flat() ?? []).toEqual(renderCardSvg(props).diagnostics);
      if (props.anatomy === 'v2' && !props.entityId.startsWith('v2-fallback')) {
        expect(vue.element.getAttribute('style') ?? '').toContain('--st-component-diagramCard-iconTextGap: var(--st-component-diagramCardCompact-iconTextGap, 4px)');
        expect(vue.element.classList.contains('st-diagramCard--center')).toBe(props.align === 'center');
      } else if (props.entityId.startsWith('v2-fallback') || props.entityId === 'v1-pinned-center') {
        expect(vue.element.getAttribute('style') ?? '').not.toContain('--st-component-diagramCard-iconTextGap');
        expect(vue.element.getAttribute('style') ?? '').toContain('height: 200px');
        expect(vue.element.classList.contains('st-diagramCard--center')).toBe(false);
        expect(vue.element.classList.contains('st-diagramCard--v2')).toBe(false);
        // W1-19 / W1-40 / W1-52: clean fallback-v1 without truncation never sets data-card-overflow.
        expect(vue.element.getAttribute('data-card-overflow')).toBeNull();
        expect(svelte.container.querySelector('.st-diagramCard')?.getAttribute('data-card-overflow')).toBeNull();
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
      if (collapsed) {
        expect(style).toContain('--st-component-diagramCard-iconTextGap');
        expect(style).toContain('height: 154px');
      } else {
        // v2 header vars are scoped to .st-diagramZone-header so they never leak into nested v1 children.
        expect(style).not.toContain('--st-component-diagramZone-headerInset');
        expect(style).not.toContain('--st-component-diagramCard-iconTextGap');
        const header = vue.element.querySelector<HTMLElement>('.st-diagramZone-header');
        expect(header?.getAttribute('style') ?? '').toContain('--st-component-diagramZone-headerInset');
        expect(header?.getAttribute('style') ?? '').toContain('--st-component-diagramCard-iconTextGap');
        expect(header?.style.right).toBe(header?.style.left);
        const toggle = vue.element.querySelector<HTMLElement>('.st-diagramCard-toggle');
        expect(toggle?.style.top).toBe(toggle?.style.right);
      }
      vue.unmount(); svelte.unmount();
    });
  }
  it('should pin v1 expanded zone header inset and toggle geometry to 0.41.5 / next.7 on both hosts without v2 leakage', async () => {
    for (const anatomy of [undefined, 'v1'] as const) {
      const props = {
        entityId: 'v1-zone-padded',
        kicker: 'KICKER',
        title: 'Zone',
        subtitle: 'Sub',
        footer: 'Footer',
        collapsed: false,
        toggleLabel: 'Collapse',
        ...(anatomy === undefined ? {} : { anatomy }),
        containerPadding: 24,
        width: 492,
        height: 400,
      };
      const vue = mount(DiagramZone, { props });
      const svelte = render(SvelteZone, { props });
      await nextTick(); await tick();
      expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      for (const root of [vue.element, svelte.container]) {
        const frame = root.querySelector<HTMLElement>('.st-diagramZone')!;
        const header = root.querySelector<HTMLElement>('.st-diagramZone-header')!;
        const toggle = root.querySelector<HTMLElement>('.st-diagramCard-toggle')!;
        const button = toggle.querySelector<HTMLButtonElement>('button')!;
        expect(frame.getAttribute('style') ?? '').not.toContain('--st-component-diagramZone-headerInset');
        expect(header.getAttribute('style') ?? '').not.toContain('--st-component-diagramZone-headerInset');
        expect(header.style.top).toBe('calc(16px - var(--st-component-diagramZone-borderWidth, 1.5px))');
        expect(header.style.left).toBe('calc(16px - var(--st-component-diagramZone-borderWidth, 1.5px))');
        expect(header.style.right).toBe('calc(24px - var(--st-component-diagramZone-borderWidth, 1.5px))');
        expect(toggle.style.top).toBe(
          'calc(var(--st-component-diagramZone-toggleInset, 8px) - var(--st-component-diagramZone-headerInset, 16px) - var(--st-component-diagramZone-borderWidth, 1.5px))',
        );
        expect(toggle.style.right).toBe(toggle.style.top);
        expect(button.classList.contains('st-iconButton--sm')).toBe(true);
      }
      vue.unmount(); svelte.unmount();
    }
    // Collapsed fallback-v1 zone matches 0.41.5 / next.7 card toggle placement and size on both hosts.
    const fbProps = {
      entityId: 'v2-zone-fallback-toggle',
      kicker: 'KICKER',
      title: 'Zone',
      subtitle: 'Sub',
      footer: 'Footer',
      collapsed: true,
      toggleLabel: 'Expand',
      anatomy: 'v2' as const,
    };
    const vueFb = mount(DiagramZone, { props: fbProps });
    const svelteFb = render(SvelteZone, { props: fbProps });
    await nextTick(); await tick();
    expect(dom(vueFb.element)).toEqual(dom(withControlIconTokens(svelteFb.container.firstElementChild!)));
    for (const root of [vueFb.element, svelteFb.container]) {
      const toggle = root.querySelector<HTMLElement>('.st-diagramCard-toggle')!;
      expect(toggle.style.top).toBe(
        'calc(var(--st-component-diagramZone-toggleInset, 8px) - var(--st-component-diagramCard-borderWidth, 2px))',
      );
      expect(toggle.style.right).toBe(toggle.style.top);
      expect(toggle.querySelector('button')?.classList.contains('st-iconButton--sm')).toBe(true);
    }
    vueFb.unmount(); svelteFb.unmount();
  });
  it('should keep v1/surface1 +/- toggle hover byte-identical to 0.41.5 and apply W1-12 secondaryHoverBackground only on surface2 zones on both hosts', async () => {
    const vueHeader = readFileSync(resolve(import.meta.dirname, 'DiagramCardHeader.vue'), 'utf8');
    const svelteHeader = readFileSync(resolve(import.meta.dirname, '../../components-svelte/src/lib/DiagramCardHeader.svelte'), 'utf8');
    // Neither host's DiagramCardHeader <style> overrides :hover globally, preserving 0.41.5 / next.7 byte-for-byte.
    expect(vueHeader).not.toContain('--st-component-button-secondaryHoverBackground');
    expect(vueHeader).not.toMatch(/\.st-diagramCard-toggle[\s\S]*:hover/);
    expect(svelteHeader).not.toContain('--st-component-button-secondaryHoverBackground');
    expect(svelteHeader).not.toMatch(/\.st-diagramCard-toggle[\s\S]*:hover/);

    // Unnested v1 and surface1 (depth 0) zones (expanded & collapsed) emit zero hover overrides on both hosts.
    for (const variant of [
      { entityId: 'v1-exp', title: 'Zone', subtitle: 'Sub', collapsed: false, toggleLabel: 'Collapse', width: 492, height: 320 },
      { entityId: 's1-exp', title: 'Zone', subtitle: 'Sub', collapsed: false, toggleLabel: 'Collapse', depth: 0, width: 492, height: 320 },
      { entityId: 'v1-col', title: 'Zone', subtitle: 'Sub', collapsed: true, toggleLabel: 'Expand' },
      { entityId: 's1-col', title: 'Zone', subtitle: 'Sub', collapsed: true, toggleLabel: 'Expand', depth: 0 },
    ]) {
      const vue = mount(DiagramZone, { props: variant });
      const svelte = render(SvelteZone, { props: variant });
      await nextTick(); await tick();
      expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      for (const root of [vue.element, svelte.container]) {
        const target = (root.querySelector('.st-diagramZone-header') ?? root.querySelector('.st-diagramCard')) as HTMLElement;
        const style = target.getAttribute('style') ?? '';
        expect(style).not.toContain('--st-component-control-hoverBackground');
        expect(style).not.toContain('--st-component-iconButton-hoverBackground');
      }
      vue.unmount(); svelte.unmount();
    }

    // Surface2 zones (expanded & collapsed) apply W1-12 secondaryHoverBackground scoped to the zone header / folded card on both hosts.
    for (const variant of [
      { entityId: 's2-exp', title: 'Zone', subtitle: 'Sub', collapsed: false, toggleLabel: 'Collapse', depth: 1, width: 492, height: 320 },
      { entityId: 's2-exp-flip', title: 'Zone', subtitle: 'Sub', collapsed: false, toggleLabel: 'Collapse', depth: 0, depthParityStart: 1 as const, width: 492, height: 320 },
      { entityId: 's2-col', title: 'Zone', subtitle: 'Sub', collapsed: true, toggleLabel: 'Expand', depth: 1 },
      { entityId: 's2-col-flip', title: 'Zone', subtitle: 'Sub', collapsed: true, toggleLabel: 'Expand', depth: 0, depthParityStart: 1 as const },
    ]) {
      const vue = mount(DiagramZone, { props: variant });
      const svelte = render(SvelteZone, { props: variant });
      await nextTick(); await tick();
      expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      for (const root of [vue.element, svelte.container]) {
        if (!variant.collapsed) {
          const frameStyle = root.querySelector('.st-diagramZone')?.getAttribute('style') ?? '';
          expect(frameStyle).not.toContain('--st-component-control-hoverBackground');
          expect(frameStyle).not.toContain('--st-component-iconButton-hoverBackground');
        }
        const target = (root.querySelector('.st-diagramZone-header') ?? root.querySelector('.st-diagramCard')) as HTMLElement;
        const style = target.getAttribute('style') ?? '';
        expect(style).toMatch(/--st-component-control-hoverBackground:\s*var\(--st-component-button-secondaryHoverBackground/);
        expect(style).toMatch(/--st-component-iconButton-hoverBackground:\s*var\(--st-component-button-secondaryHoverBackground/);
      }
      vue.unmount(); svelte.unmount();
    }

    for (const theme of ['sent-tech', 'forge', 'entropic'] as const) {
      const css = readFileSync(resolve(import.meta.dirname, `../../themes/css/${theme}.css`), 'utf8');
      const tokenMatches = (name: string) =>
        [...css.matchAll(new RegExp(`${name}:\\s*([^;]+);`, 'g'))].map((m) => m[1]!.trim());
      const s1 = tokenMatches('--st-component-diagramZone-surface1');
      const s2 = tokenMatches('--st-component-diagramZone-surface2');
      const v1Hover = tokenMatches('--st-component-control-hoverBackground');
      const s2Hover = tokenMatches('--st-component-button-secondaryHoverBackground');
      expect(s1.length, theme).toBe(3);
      expect(s2.length, theme).toBe(3);
      expect(v1Hover.length, theme).toBe(3);
      expect(s2Hover.length, theme).toBe(3);
      for (let mode = 0; mode < 3; mode += 1) {
        expect(v1Hover[mode], `${theme} mode ${mode} v1 hover vs surface1`).not.toBe(s1[mode]);
        expect(v1Hover[mode], `${theme} mode ${mode} v1 hover collision on surface2`).toBe(s2[mode]);
        expect(s2Hover[mode], `${theme} mode ${mode} surface2 hover vs surface1`).not.toBe(s1[mode]);
        expect(s2Hover[mode], `${theme} mode ${mode} surface2 hover vs surface2`).not.toBe(s2[mode]);
      }
    }
  });
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
  it('should isolate expanded zone depth surface and v2 header vars from nested v1 children on both hosts (W1-45, W1-56)', async () => {
    const outerProps = {
      entityId: 'outer-v2-depth1',
      title: 'Outer',
      subtitle: 'Sub',
      collapsed: false,
      toggleLabel: 'Collapse',
      anatomy: 'v2' as const,
      depth: 1,
      width: 600,
      height: 500,
    };
    const vueOuter = mount(DiagramZone, { props: outerProps });
    const svelteOuter = render(SvelteZone, { props: outerProps });
    await nextTick(); await tick();
    expect(dom(vueOuter.element)).toEqual(dom(withControlIconTokens(svelteOuter.container.firstElementChild!)));
    for (const root of [vueOuter.element, svelteOuter.container]) {
      const frame = root.querySelector<HTMLElement>('.st-diagramZone')!;
      const frameStyle = frame.getAttribute('style') ?? '';
      expect(frameStyle).toContain('background:');
      expect(frameStyle).toContain('--st-component-diagramZone-surface2');
      // Never set inherited custom properties on .st-diagramZone (ancestor of slot/children).
      expect(frameStyle).not.toContain('--st-component-diagramZone-surface:');
      expect(frameStyle).not.toContain('--st-component-diagramZone-headerInset');
      expect(frameStyle).not.toContain('--st-component-diagramCard-iconSize');
      expect(frameStyle).not.toContain('--st-component-diagramCard-iconTextGap');
      expect(frameStyle).not.toContain('--st-component-control-hoverBackground');
      expect(frameStyle).not.toContain('--st-component-iconButton-hoverBackground');
    }
    // Vue slot composition: a nested v1 child DiagramZone inside a depth-1 v2 parent receives zero inherited surface/v2/hover vars.
    const Wrapper = defineComponent({
      components: { DiagramZone, DiagramCard },
      template: `<DiagramZone entityId="p" title="Parent" :collapsed="false" anatomy="v2" :depth="1" toggleLabel="Collapse" :width="600" :height="500">
        <DiagramZone entityId="c" title="Child" :collapsed="false" toggleLabel="Collapse" :containerPadding="24" :width="492" :height="240" />
        <DiagramCard entityId="leaf" title="Leaf" :body="['Line']" />
      </DiagramZone>`,
    });
    const nested = mount(Wrapper);
    await nextTick();
    const zones = nested.element.querySelectorAll<HTMLElement>('.st-diagramZone');
    expect(zones).toHaveLength(2);
    expect(zones[0]!.getAttribute('style') ?? '').toContain('--st-component-diagramZone-surface2');
    expect(zones[0]!.getAttribute('style') ?? '').not.toContain('--st-component-diagramZone-surface:');
    expect(zones[0]!.querySelector<HTMLElement>('.st-diagramZone-header')!.getAttribute('style') ?? '').toMatch(/--st-component-control-hoverBackground:\s*var\(--st-component-button-secondaryHoverBackground/);
    expect(zones[1]!.getAttribute('style') ?? '').not.toContain('surface2');
    const childHeader = zones[1]!.querySelector<HTMLElement>('.st-diagramZone-header')!;
    expect(childHeader.style.right).toBe('calc(24px - var(--st-component-diagramZone-borderWidth, 1.5px))');
    expect(childHeader.getAttribute('style') ?? '').not.toContain('--st-component-control-hoverBackground');
    expect(childHeader.getAttribute('style') ?? '').not.toContain('--st-component-iconButton-hoverBackground');
    expect(nested.element.querySelector<HTMLElement>('.st-diagramCard')?.getAttribute('style') ?? '').not.toContain('--st-component-control-hoverBackground');
    expect(nested.element.querySelector<SVGSVGElement>('.st-diagramCard .st-diagramCardHeader-icon')?.getAttribute('width')).toBe('70');
    nested.unmount();
    vueOuter.unmount(); svelteOuter.unmount();
  });
  it('should compute toggle offset from headerInset/toggleTopOffset without CSS var cascade identically on Svelte and Vue (W1-46, W1-58)', async () => {
    const zhProps = {
      kicker: [],
      title: [{ text: 'Zone', x: 0, baseline: 30, size: 32, weight: 700, secondary: false, anchor: 'start' as const }],
      subtitle: [],
      headerInset: 12,
      headerTextWidth: 300,
      headerBlockHeight: 52,
      subtitleWidth: 300,
      toggle: { collapsed: false, label: 'Collapse' },
      toggleTopInset: 8,
    };
    const vueZh = mount(DiagramZoneHeader, { props: zhProps });
    const svelteZh = render(SvelteZoneHeader, { props: zhProps });
    await nextTick(); await tick();
    expect(dom(vueZh.element)).toEqual(dom(withControlIconTokens(svelteZh.container.firstElementChild!)));
    for (const root of [vueZh.element, svelteZh.container]) {
      const toggle = root.querySelector<HTMLElement>('.st-diagramCard-toggle')!;
      expect(toggle.style.top).toBe('calc(var(--st-component-diagramZone-toggleInset, 8px) - 12px - var(--st-component-diagramZone-borderWidth, 1.5px))');
      expect(toggle.style.right).toBe(toggle.style.top);
    }
    vueZh.unmount(); svelteZh.unmount();

    const chProps = {
      kicker: [],
      title: [{ text: 'Card', x: 0, baseline: 30, size: 32, weight: 700, secondary: false, anchor: 'start' as const }],
      headerTextWidth: 300,
      headerBlockHeight: 70,
      toggle: { collapsed: false, label: 'Collapse' },
      toggleTopOffset: -6,
    };
    const vueCh = mount(DiagramCardHeader, { props: chProps });
    const svelteCh = render(SvelteCardHeader, { props: chProps });
    await nextTick(); await tick();
    expect(dom(vueCh.element)).toEqual(dom(withControlIconTokens(svelteCh.container.firstElementChild!)));
    for (const root of [vueCh.element, svelteCh.container]) {
      const toggle = root.querySelector<HTMLElement>('.st-diagramCard-toggle')!;
      expect(toggle.style.top).toBe('calc(-6px - var(--st-component-diagramZone-borderWidth, 1.5px))');
      expect(toggle.style.right).toBe(toggle.style.top);
    }
    vueCh.unmount(); svelteCh.unmount();
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
    expect(vue.element.querySelectorAll('polyline[data-scene-edge]')).toHaveLength(6);
    expect(vue.element.querySelector(`[data-scene-occurrence="${occurrence('innerA')}"] .st-diagramZone`)?.getAttribute('style') ?? '').toContain('--st-component-diagramZone-surface2');
    const outerHeader = vue.element.querySelector<HTMLElement>(`[data-scene-occurrence="${occurrence('outerA')}"] .st-diagramZone-header`)!;
    expect(outerHeader.style.left).toBe('calc(12px - var(--st-component-diagramZone-borderWidth, 1.5px))');
    expect(outerHeader.style.right).toBe(outerHeader.style.left);
    // Compact v2 cards and expanded v2 zone headers apply host iconTextGap override without leaking onto outer zone frames.
    expect(vue.element.querySelector(`[data-scene-occurrence="${occurrence('a1')}"] .st-diagramCard`)?.getAttribute('style') ?? '').toContain('--st-component-diagramCard-iconTextGap');
    expect(vue.element.querySelector(`[data-scene-occurrence="${occurrence('outerA')}"] .st-diagramZone`)?.getAttribute('style') ?? '').not.toContain('--st-component-diagramCard-iconTextGap');
    expect(vue.element.querySelector(`[data-scene-occurrence="${occurrence('outerA')}"] .st-diagramZone-header`)?.getAttribute('style') ?? '').toContain('--st-component-diagramCard-iconTextGap');
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
    expect(vue.element.querySelectorAll('polyline[data-scene-edge]')).toHaveLength(2);
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
    expect(vue.element.querySelectorAll('polyline[data-scene-edge]')).toHaveLength(6);
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
        'relation:link.a.b': { strokeStyle: 'dotted', arrowhead: 'arrow' },
        'relation:link.b.ext': { arrowhead: 'none', emphasis: 'emphasis' },
        'relation:link.a.ext': { strokeStyle: 'dashed', arrowhead: 'arrow', emphasis: 'emphasis' },
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
      expect(ab.getAttribute('marker-end')).toMatch(/^url\(#diagram-arrow-[^)]+\)$/);
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
        'dashed:arrow:emphasis',
        'dotted:arrow:default',
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
        'dashed:arrow:emphasis',
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

  it('should pin v1 figure max size and zoom bounds (maxDisplayScale 0.62, minReadableScale 0.45, fit) to 0.41.5 / next.7 on Svelte and Vue', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    vi.stubGlobal('innerHeight', 720);
    // Single v1 complete card and fallback-v1 card both cap at 0.62 (readout 100%, viewport height 126px).
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1280);
    const completeSingle = sceneOf('v1-zoom-single', [{ id: 'solo' }]);
    const completePres = (anatomy?: 'v1' | 'v2') => ({
      ...completeSingle.presentation,
      entities: {
        [occurrence('solo')]: {
          form: 'card',
          text: { kicker: 'KICKER', title: 'Complete card', body: 'Primary', detail: 'Detail', footer: 'Footer' },
          ...(anatomy === undefined ? {} : { anatomy }),
        },
      },
    }) as unknown as ScenePresentation;
    for (const anatomy of [undefined, 'v1', 'v2'] as const) {
      const props = { ...host, ...completeSingle, presentation: completePres(anatomy), title: 'Zoom bounds' };
      const vue = mount(SceneFigure, { props });
      const svelte = render(SvelteScene, { props });
      await nextTick(); await tick(); await nextTick();
      expect(dom(vue.element)).toEqual(dom(withControlIconTokens(svelte.container.firstElementChild!)));
      expect(vue.vm.getCamera()).toEqual({
        zoom: 0.62,
        readout: 100,
        minZoom: 0.62,
        maxZoom: 0.62,
        fitZoom: 0.62,
        pans: false,
      });
      const vpVue = vue.element.querySelector<HTMLElement>('.st-diagramSceneFigure-viewport')!;
      const vpSvelte = svelte.container.querySelector<HTMLElement>('.st-diagramSceneFigure-viewport')!;
      expect(vpVue.style.height).toBe('126px');
      expect(vpSvelte.style.height).toBe('126px');
      // Complete/fallback-v1 card keeps 0.41.5 alignment (no --center) and toggle-free 460x200 box.
      expect(vue.element.querySelector('.st-diagramCard')?.classList.contains('st-diagramCard--center')).toBe(false);
      expect(svelte.container.querySelector('.st-diagramCard')?.classList.contains('st-diagramCard--center')).toBe(false);
      vue.unmount(); svelte.unmount();
    }

    // W1-02 + W1-13: createView() without explicit anatomy keeps v1 (460x200, 126px fitHeight, 0.62 zoom) even for a compact-eligible card on both Svelte and Vue.
    expect(DEFAULT_PRESENTATION).toEqual({ camera: { x: 0, y: 0, zoom: 1 } });
    const defaultView = {
      ...createView({ viewId: viewRef('default-v1-parity'), semanticDocumentId: completeSingle.document.documentId, revision: 1 }),
      entityOccurrences: {
        [occurrence('solo')]: { id: occurrenceRef('e.solo'), entity: entityRef('solo'), geometry: { x: 0, y: 0, width: 460, height: 200 } },
      },
    } as unknown as NonNullable<DiagramSceneFigureProps['view']>;
    expect(defaultView.presentation.anatomy).toBeUndefined();
    const compactEligiblePres = {
      ...completeSingle.presentation,
      entities: { [occurrence('solo')]: { form: 'card', text: { title: 'Short', body: 'Line' } } },
    } as unknown as ScenePresentation;
    const defaultViewProps = { ...host, ...completeSingle, view: defaultView, presentation: compactEligiblePres, title: 'Default createView' };
    const vueDef = mount(SceneFigure, { props: defaultViewProps });
    const svelteDef = render(SvelteScene, { props: defaultViewProps });
    await nextTick(); await tick(); await nextTick();
    expect(dom(vueDef.element)).toEqual(dom(withControlIconTokens(svelteDef.container.firstElementChild!)));
    expect(vueDef.vm.getCamera()).toEqual({ zoom: 0.62, readout: 100, minZoom: 0.62, maxZoom: 0.62, fitZoom: 0.62, pans: false });
    expect(vueDef.element.querySelector<HTMLElement>('.st-diagramSceneFigure-viewport')!.style.height).toBe('126px');
    expect(vueDef.element.querySelector('.st-diagramCard')?.classList.contains('st-diagramCard--v2')).toBe(false);
    expect(svelteDef.container.querySelector('.st-diagramCard')?.classList.contains('st-diagramCard--v2')).toBe(false);
    vueDef.unmount(); svelteDef.unmount();

    // Wide v1 scene at phone width floors at 0.45 and caps at 0.62 identically on Svelte and Vue.
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(390);
    vi.stubGlobal('innerHeight', 844);
    const wideProps = { ...host, ...WIDE, title: 'Wide zoom bounds' };
    const vueWide = mount(SceneFigure, { props: wideProps });
    const svelteWide = render(SvelteScene, { props: wideProps });
    await nextTick(); await tick(); await nextTick();
    expect(dom(vueWide.element)).toEqual(dom(withControlIconTokens(svelteWide.container.firstElementChild!)));
    expect(vueWide.vm.getCamera()).toMatchObject({ zoom: 0.45, minZoom: 0.45, maxZoom: 0.62, fitZoom: 0.45, pans: true, readout: 73 });
    vueWide.vm.setZoom(10);
    await nextTick();
    expect(vueWide.vm.getCamera().zoom).toBe(0.62);
    vueWide.vm.setZoom(0.1);
    await nextTick();
    expect(vueWide.vm.getCamera().zoom).toBe(0.45);
    vueWide.vm.fitToFrame();
    await nextTick();
    expect(vueWide.vm.getCamera().zoom).toBe(0.45);
    vueWide.unmount(); svelteWide.unmount();
    vi.unstubAllGlobals();
  });
  it('should refit camera and frame height without overflow when unfolding the largest zone of a reference scene and refit back on folding (Svelte and Vue)', async () => {
    const snap = (px: number): number => Math.round(px * 64) / 64;
    const originalRect = Element.prototype.getBoundingClientRect;
    const sheet = document.createElement('style');
    sheet.textContent = '.st-diagramSceneFigure-edge { fill: none; stroke: rgb(100, 116, 139); stroke-width: 1.5px; vector-effect: non-scaling-stroke; }';
    document.head.append(sheet);
    const transitionTokens: Record<string, string> = {
      '--st-component-diagramScene-transitionDuration': '240ms',
      '--st-foundation-motion-easing': 'cubic-bezier(0.25, 0.25, 0.75, 0.75)',
    };
    const originalComputedStyle = window.getComputedStyle.bind(window);
    const computedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
      const style = originalComputedStyle(element, pseudo);
      return new Proxy(style, {
        get(target, key) {
          if (key === 'getPropertyValue') {
            return (name: string): string => transitionTokens[name] ?? target.getPropertyValue(name);
          }
          const value = Reflect.get(target, key) as unknown;
          return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(target) : value;
        },
      });
    });
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const world = this.closest<HTMLElement>('.st-diagramSceneFigure-world');
      if (world === null) return originalRect.call(this);
      const match = /translate\(([-\d.e+]+)px,\s*([-\d.e+]+)px\)\s*scale\(([-\d.e+]+)\)/.exec(world.style.transform);
      if (match === null) return new DOMRect();
      const [tx, ty, scale] = match.slice(1).map(Number) as [number, number, number];
      if (this === world) return new DOMRect(snap(tx), snap(ty), 0, 0);
      if (this.matches('[data-scene-edge]')) {
        const pts = (this.getAttribute('points') ?? '').trim().split(/\s+/).filter(Boolean).map(p => p.split(',').map(Number) as [number, number]);
        if (pts.length === 0) return new DOMRect();
        const xs = pts.map(([x]) => x), ys = pts.map(([, y]) => y);
        const left = snap(tx + Math.min(...xs) * scale), top = snap(ty + Math.min(...ys) * scale);
        return new DOMRect(left, top, snap(tx + Math.max(...xs) * scale) - left, snap(ty + Math.max(...ys) * scale) - top);
      }
      if (!(this instanceof HTMLElement) || !this.matches('[data-scene-occurrence],[data-scene-label]')) return new DOMRect();
      const x = parseFloat(this.style.left), y = parseFloat(this.style.top);
      const w = parseFloat(this.style.width), h = parseFloat(this.style.height);
      const left = snap(tx + x * scale), top = snap(ty + y * scale);
      return new DOMRect(left, top, snap(tx + (x + w) * scale) - left, snap(ty + (y + h) * scale) - top);
    });

    const assertNoOverflow = (root: Element, frameW: number, maxFrameH: number) => {
      const figure = (root.matches('figure') ? root : root.querySelector('figure')) as HTMLElement;
      const viewport = root.querySelector<HTMLElement>('.st-diagramSceneFigure-viewport')!;
      const extent = root.querySelector<HTMLElement>('.st-diagramSceneFigure-extent')!;
      const world = root.querySelector<HTMLElement>('.st-diagramSceneFigure-world')!;
      const zoom = Number(figure.dataset['zoom']);
      const height = parseFloat(viewport.style.height);
      const [tx, ty, scale] = /translate\(([-\d.e+]+)px,\s*([-\d.e+]+)px\)\s*scale\(([-\d.e+]+)\)/.exec(world.style.transform)!.slice(1).map(Number) as [number, number, number];
      expect(scale).toBe(zoom);
      expect(zoom).toBeGreaterThanOrEqual(0.45);
      expect(zoom).toBeLessThanOrEqual(0.62);
      expect(height).toBeLessThanOrEqual(maxFrameH + 1 / 64);
      expect(viewport.dataset['pans']).toBe('false');
      expect(viewport.style.overflowX).toBe('hidden');
      expect(viewport.style.overflowY).toBe('hidden');
      expect(parseFloat(extent.style.width)).toBeLessThanOrEqual(frameW + 0.5);
      expect(parseFloat(extent.style.height)).toBeLessThanOrEqual(height + 0.5);
      for (const node of root.querySelectorAll<HTMLElement>('[data-scene-occurrence],[data-scene-label]')) {
        const x = parseFloat(node.style.left), y = parseFloat(node.style.top);
        const w = parseFloat(node.style.width), h = parseFloat(node.style.height);
        expect(tx + x * zoom).toBeGreaterThanOrEqual(-0.5);
        expect(ty + y * zoom).toBeGreaterThanOrEqual(-0.5);
        expect(tx + (x + w) * zoom).toBeLessThanOrEqual(frameW + 0.5);
        expect(ty + (y + h) * zoom).toBeLessThanOrEqual(height + 0.5);
      }
      for (const edge of root.querySelectorAll('[data-scene-edge]')) {
        for (const pt of (edge.getAttribute('points') ?? '').trim().split(/\s+/).filter(Boolean)) {
          const [px, py] = pt.split(',').map(Number) as [number, number];
          expect(tx + px * zoom).toBeGreaterThanOrEqual(-0.5);
          expect(ty + py * zoom).toBeGreaterThanOrEqual(-0.5);
          expect(tx + px * zoom).toBeLessThanOrEqual(frameW + 0.5);
          expect(ty + py * zoom).toBeLessThanOrEqual(height + 0.5);
        }
      }
      return { height, zoom, transform: world.style.transform, viewport };
    };

    try {
      for (const [sceneName, width, winH, largestZone, extra, animated] of [
        ['architecture', 1280, 720, 'occurrence:zone-engram', {}, true],
        ['architecture', 1280, 720, 'occurrence:zone-engram', { flows: {} }, false],
        ['ontology', 1440, 900, 'occurrence:zone-normative', {}, false],
      ] as const) {
        if (animated) vi.useFakeTimers();
        else vi.useRealTimers();
        vi.stubGlobal('matchMedia', () => ({ matches: !animated, addEventListener() {}, removeEventListener() {} }));
        vi.stubGlobal('innerHeight', winH);
        vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
        const maxFrameH = Math.min((width * 9) / 16, 0.85 * winH);
        const { collapsed: allFolds, ...source } = hCondInput(sceneName, true);
        const props = { ...source, measureLines: undefined, defaultFolds: allFolds, ...extra };
        const vue = mount(SceneFigure, { props, attachTo: document.body });
        const svelte = render(SvelteScene, { props });
        await nextTick(); await tick(); await nextTick(); await tick();

        const vueFolded = assertNoOverflow(vue.element, width, maxFrameH);
        const svelteFolded = assertNoOverflow(svelte.container, width, maxFrameH);
        expect(vueFolded.zoom).toBe(0.62);
        expect(svelteFolded.zoom).toBe(0.62);
        expect(vueFolded.height).toBe(svelteFolded.height);

        const toggleIn = (root: Element) =>
          [...root.querySelectorAll<HTMLElement>('[data-scene-occurrence]')]
            .find(el => el.dataset['sceneOccurrence'] === largestZone)!
            .querySelector<HTMLButtonElement>('button[aria-expanded]')!;

        // Unfold the largest zone on both Vue and Svelte: both refit with zero overflow (exercising Vue's 240 ms animated transition -> settle() -> readRenderedBounds() path when animated is true).
        toggleIn(vue.element).click();
        toggleIn(svelte.container).click();
        await nextTick(); await tick();
        if (animated) {
          expect(vue.element.querySelector('.st-diagramSceneFigure-viewport')?.getAttribute('aria-busy')).toBe('true');
          expect(svelte.container.querySelector('.st-diagramSceneFigure-viewport')?.getAttribute('aria-busy')).toBe('true');
          await vi.advanceTimersByTimeAsync(300);
          await nextTick(); await tick();
          expect(vue.element.querySelector('.st-diagramSceneFigure-viewport')?.getAttribute('aria-busy')).toBe('false');
          expect(svelte.container.querySelector('.st-diagramSceneFigure-viewport')?.getAttribute('aria-busy')).toBe('false');
        }
        await nextTick(); await tick();

        const vueUnfolded = assertNoOverflow(vue.element, width, maxFrameH);
        const svelteUnfolded = assertNoOverflow(svelte.container, width, maxFrameH);
        expect(vueUnfolded.zoom).toBeLessThan(0.62);
        expect(vueUnfolded.zoom).toBe(vue.vm.getCamera().fitZoom);
        expect(vueUnfolded.zoom).toBe(svelteUnfolded.zoom);
        expect(vueUnfolded.height).toBeGreaterThan(vueFolded.height);
        expect(Math.abs(vueUnfolded.height - svelteUnfolded.height)).toBeLessThanOrEqual(0.5);

        // Explicit user zoom and pan are preserved before the next fold toggle, then refitted on fold.
        vue.vm.setZoom(0.62);
        svelte.component.setZoom(0.62);
        await nextTick(); await tick();
        vueUnfolded.viewport.scrollLeft = 60;
        vueUnfolded.viewport.scrollTop = 30;
        svelteUnfolded.viewport.scrollLeft = 60;
        svelteUnfolded.viewport.scrollTop = 30;
        expect(vue.vm.getCamera().zoom).toBe(0.62);
        expect(vueUnfolded.viewport.dataset['pans']).toBe('true');
        expect(svelteUnfolded.viewport.dataset['pans']).toBe('true');

        // Fold the largest zone back: drops user zoom/pan and refits back to the folded scene.
        toggleIn(vue.element).click();
        toggleIn(svelte.container).click();
        await nextTick(); await tick();
        if (animated) {
          expect(vue.element.querySelector('.st-diagramSceneFigure-viewport')?.getAttribute('aria-busy')).toBe('true');
          expect(svelte.container.querySelector('.st-diagramSceneFigure-viewport')?.getAttribute('aria-busy')).toBe('true');
          await vi.advanceTimersByTimeAsync(300);
          await nextTick(); await tick();
          expect(vue.element.querySelector('.st-diagramSceneFigure-viewport')?.getAttribute('aria-busy')).toBe('false');
          expect(svelte.container.querySelector('.st-diagramSceneFigure-viewport')?.getAttribute('aria-busy')).toBe('false');
        }
        await nextTick(); await tick();

        const vueRefolded = assertNoOverflow(vue.element, width, maxFrameH);
        const svelteRefolded = assertNoOverflow(svelte.container, width, maxFrameH);
        expect(vueRefolded.zoom).toBe(0.62);
        expect(svelteRefolded.zoom).toBe(0.62);
        expect(Math.abs(vueRefolded.height - vueFolded.height)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(svelteRefolded.height - svelteFolded.height)).toBeLessThanOrEqual(0.5);
        expect(vueRefolded.viewport.scrollLeft).toBe(0);
        expect(vueRefolded.viewport.scrollTop).toBe(0);
        expect(svelteRefolded.viewport.scrollLeft).toBe(0);
        expect(svelteRefolded.viewport.scrollTop).toBe(0);

        vue.unmount(); svelte.unmount();
      }

      // Controlled `collapsed` prop change on Vue also refits on unfold and fold.
      vi.useRealTimers();
      vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
      vi.stubGlobal('innerHeight', 720);
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1280);
      const maxFrameH = Math.min((1280 * 9) / 16, 0.85 * 720);
      const { collapsed: allFolds, ...source } = hCondInput('architecture', true);
      const vueCtrl = mount(SceneFigure, {
        props: { ...source, measureLines: undefined, collapsed: allFolds },
        attachTo: document.body,
      });
      await nextTick(); await nextTick();
      const ctrlFolded = assertNoOverflow(vueCtrl.element, 1280, maxFrameH);
      await vueCtrl.setProps({ collapsed: allFolds.filter(id => id !== 'occurrence:zone-engram') });
      await nextTick(); await nextTick();
      const ctrlUnfolded = assertNoOverflow(vueCtrl.element, 1280, maxFrameH);
      expect(ctrlUnfolded.zoom).toBeLessThan(ctrlFolded.zoom);
      expect(ctrlUnfolded.height).toBeGreaterThan(ctrlFolded.height);
      await vueCtrl.setProps({ collapsed: allFolds });
      await nextTick(); await nextTick();
      const ctrlRefolded = assertNoOverflow(vueCtrl.element, 1280, maxFrameH);
      expect(ctrlRefolded.zoom).toBe(ctrlFolded.zoom);
      expect(Math.abs(ctrlRefolded.height - ctrlFolded.height)).toBeLessThanOrEqual(0.5);
      vueCtrl.unmount();
    } finally {
      computedStyleSpy.mockRestore();
      vi.useRealTimers();
      sheet.remove();
      vi.unstubAllGlobals();
    }
  });
});

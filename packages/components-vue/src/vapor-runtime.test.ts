import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { createVaporApp, nextTick, type VaporComponent } from 'vue';
import { DiagramCard, DiagramZone, DiagramSceneFigure, ForceGraph, GraphCanvas, GraphLegend } from '../dist/vapor/index.js';
import { DiagramIcon, DIAGRAM_GLYPH_NAMES } from '../dist/vapor/diagram-icons/index.js';
import { BpmnCanvas } from '../dist/vapor/bpmn/index.js';
import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN, m3ProfileRegistry, shippedExecutorBindings } from '@sentropic/diagram-core';

const engine = vi.hoisted(() => ({ create: vi.fn(), destroy: vi.fn() }));
vi.mock('@sentropic/bpmn-canvas', () => ({ createBpmnCanvas: (...args: unknown[]) => engine.create(...args) }));
const apps: ReturnType<typeof createVaporApp>[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function mount(component: VaporComponent, props: Record<string, unknown>) {
  const root = document.createElement('div'); document.body.append(root);
  // Vapor raw props represent function-valued inputs as getter sources.
  const inputs = Object.fromEntries(Object.entries(props).map(([key, value]) => [key, typeof value === 'function' ? () => value : value]));
  const app = createVaporApp(component, inputs); apps.push(app);
  const vm = app.mount(root); return { root, vm };
}

it('should execute published Vapor card, zone, icon and legend modules and emit once', async () => {
  const onSelect = vi.fn();
  const card = mount(DiagramCard, { entityId: 'one', title: 'One', body: [], onSelect });
  card.root.querySelector('.st-diagramCard')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({ entityId: 'one' });
  const onDiagnostic = vi.fn();
  mount(DiagramZone, { entityId: 'zone', title: 'Zone', collapsed: true, icon: 'unmapped', onDiagnostic });
  await nextTick(); expect(onDiagnostic).toHaveBeenCalledTimes(1);
  const icon = mount(DiagramIcon, { name: DIAGRAM_GLYPH_NAMES[0] }); expect(icon.root.querySelector('svg')).not.toBeNull();
  const legend = mount(GraphLegend, { entries: [{ label: 'Nodes', shape: 'star' }] }); expect(legend.root.textContent).toContain('Nodes');
});

it('should execute published Vapor graph modules with native wheel and frame teardown', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  const onSelect = vi.fn(), onOpenEntity = vi.fn(), onNodeHover = vi.fn(), onEdgeHover = vi.fn();
  const graph = mount(ForceGraph, { label: 'Graph', nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b' }], iterations: 1, onSelect, onOpenEntity, onNodeHover, onEdgeHover });
  const dot = graph.root.querySelector('.st-forceGraph__dot')!;
  dot.dispatchEvent(new MouseEvent('click', { bubbles: true })); expect(onSelect).toHaveBeenCalledTimes(1);
  dot.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); expect(onOpenEntity).toHaveBeenCalledTimes(1);
  dot.dispatchEvent(new FocusEvent('focus')); expect(onNodeHover).toHaveBeenCalledTimes(1);
  graph.root.querySelector('.st-forceGraph__edgeHit')!.dispatchEvent(new MouseEvent('mouseenter')); expect(onEdgeHover).toHaveBeenCalledTimes(1);
  const svg = graph.root.querySelector('svg')!;
  vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 480, height: 360 } as DOMRect);
  const wheel = new WheelEvent('wheel', { cancelable: true, deltaY: -1 }); svg.dispatchEvent(wheel);
  await nextTick(); expect(wheel.defaultPrevented).toBe(true); expect(graph.root.querySelector('.st-forceGraph__resetBtn')).not.toBeNull();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  const frames = new Set<number>(); let sequence = 0;
  vi.stubGlobal('requestAnimationFrame', () => { frames.add(++sequence); return sequence; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  const canvas = mount(GraphCanvas, { label: 'Canvas', graph: { nodeIds: [], positions: new Float32Array(), edges: new Uint32Array() }, styles: {} });
  expect(canvas.root.querySelector('canvas')?.getAttribute('aria-label')).toBe('Canvas');
  expect(typeof canvas.vm.invalidateGraph).toBe('function'); expect(frames.size).toBe(1);
  apps.at(-1)!.unmount(); apps.pop(); expect(frames.size).toBe(0);
});

it('should preserve exposed scene camera and BPMN readiness in published Vapor modules', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const scene = mount(DiagramSceneFigure, {
    document: { documentId: 'document:runtime', schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1, profileRefs: ['generic@2'], typeDefinitions: {}, entities: {}, relations: {}, ports: {}, resources: {}, extensions: [] },
    presentation: { contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN, entities: {}, legends: {}, categoryTokens: [] },
    registry: m3ProfileRegistry, bindings: shippedExecutorBindings,
  });
  expect(typeof scene.vm.setZoom).toBe('function'); scene.vm.setZoom(1); expect(scene.vm.getCamera().zoom).toBeGreaterThan(0);
  let finish!: () => void;
  const ready = new Promise<void>(resolve => { finish = resolve; });
  engine.create.mockReturnValue({ ready, destroy: engine.destroy, getDiagnostics: () => [] });
  const envelope = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../elements/tests/fixtures/bpmn-order-process.json'), 'utf8'));
  const bpmn = mount(BpmnCanvas, { envelope }); const terminal = vi.fn(); void bpmn.vm.ready.then(terminal);
  await vi.waitFor(() => expect(engine.create).toHaveBeenCalledTimes(1));
  expect(bpmn.vm.state).toBe('rendering'); expect(terminal).not.toHaveBeenCalled();
  finish(); await vi.waitFor(() => expect(bpmn.vm.state).toBe('rendered'));
  expect(terminal).toHaveBeenCalledTimes(1);
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { createVaporApp, nextTick, vaporInteropPlugin, type VaporComponent } from 'vue';
import { DiagramCard, DiagramZone, DiagramSceneFigure, ForceGraph, GraphCanvas, GraphLegend, DataTable, LabelledIconButton, WebFrame, CopyButton, Toast, TreeView, Modal, Drawer } from '../dist/vapor/index.js';
import { ComposerEditor, RichTextEditor } from '../dist/vapor/rich-text-editor/index.js';
import { LockPresenceBadge } from '../dist/vapor/presence-badge/index.js';
import { parseFullMarkdown } from '@sentropic/design-system-rich-text';
import type { RichTextEditor as CoreEditor } from '@sentropic/design-system-rich-text/editor';
import { DiagramIcon, DIAGRAM_GLYPH_NAMES } from '../dist/vapor/diagram-icons/index.js';
import { BpmnCanvas } from '../dist/vapor/bpmn/index.js';
import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN, m3ProfileRegistry, shippedExecutorBindings } from '../../diagram-canvas/tests/scene-host-fixtures.js';

import { flowFixture, flowMeasure } from '../../diagram-canvas/test-support/flowFixture.js';

const engine = vi.hoisted(() => ({ create: vi.fn(), destroy: vi.fn() }));
const { createdCores } = vi.hoisted(() => ({ createdCores: [] as CoreEditor[] }));
vi.mock('@sentropic/design-system-rich-text/editor', async importOriginal => {
  const actual = await importOriginal<typeof import('@sentropic/design-system-rich-text/editor')>();
  return { ...actual, createRichTextEditor: (options: Parameters<typeof actual.createRichTextEditor>[0]) => {
    const result = actual.createRichTextEditor(options);
    if (result instanceof Promise) void result.then(core => createdCores.push(core));
    else createdCores.push(result);
    return result;
  } };
});
vi.mock('@sentropic/bpmn-canvas', () => ({ createBpmnCanvas: (...args: unknown[]) => engine.create(...args) }));
const apps: ReturnType<typeof createVaporApp>[] = [];
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function mount(component: VaporComponent, props: Record<string, unknown>, interop = false) {
  const root = document.createElement('div'); document.body.append(root);
  // Vapor raw props represent function-valued inputs as getter sources.
  const inputs = Object.fromEntries(Object.entries(props).map(([key, value]) => [key, typeof value === 'function' ? () => value : value]));
  const app = createVaporApp(component, inputs);
  if (interop) app.use(vaporInteropPlugin);
  apps.push(app);
  const vm = app.mount(root); return { root, vm };
}

it('should apply the V8 attribute, tooltip, fallback and icon contracts in native Vapor', async () => {
  const clicked = vi.fn(), table = mount(DataTable, { columns: [{ key: 'name' }], rows: [{ id: 'one', name: 'Ada' }], id: 'users', onClick: clicked });
  expect(table.root.querySelectorAll('#users')).toHaveLength(1);
  table.root.querySelector('td')!.dispatchEvent(new MouseEvent('click', { bubbles: true })); expect(clicked).toHaveBeenCalledTimes(1);
  const button = mount(LabelledIconButton, { label: 'Comments', icon: 'comment', id: 'comments' });
  expect(button.root.querySelector('button')?.id).toBe('comments');
  const tooltip = button.root.querySelector('[role=tooltip]')!;
  expect(tooltip.getAttribute('aria-hidden')).toBe('true');
  button.root.querySelector('button')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); await nextTick();
  expect(tooltip.getAttribute('aria-hidden')).toBe('false');
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  expect(mount(LabelledIconButton, { label: 'Unknown', icon: 'missing-icon' }).root.querySelector('svg.st-icon')).not.toBeNull(); expect(warn).toHaveBeenCalled();
  const frame = mount(WebFrame, { frame: { src: 'about:blank' }, id: 'preview', class: 'custom' }); expect(frame.root.querySelector('iframe.custom')?.id).toBe('preview');
  const badge = mount(LockPresenceBadge, { lock: null, presence: null, capabilities: { currentActorId: 'self', canAcquire: false, canRequestUnlock: false, canForceUnlock: false }, messages: {}, nowIso: '2026-11-13T12:00:00Z', id: 'badge', class: 'custom' }); expect(badge.root.querySelector('.st-presence-badge.custom')?.id).toBe('badge');
  expect(mount(CopyButton, { value: 'Copy' }).root.querySelector('svg.st-icon')?.getAttribute('stroke-width')).toBe('2.25');
});

it('should keep once listeners and merged listener arrays usable in native Vapor', async () => {
  const first = vi.fn(), second = vi.fn(), close = vi.fn(), selected = vi.fn();
  const merged = mount(Toast, { title: 'Saved', onClose: [first, second] }); merged.root.querySelector('button')!.click(); expect(first).toHaveBeenCalledTimes(1); expect(second).toHaveBeenCalledTimes(1);
  const once = mount(Toast, { title: 'Saved', onCloseOnce: close }); once.root.querySelector('button')!.click(); once.root.querySelector('button')!.click(); expect(close).toHaveBeenCalledTimes(1);
  const tree = mount(TreeView, { nodes: [{ id: 'one', label: 'One' }], onSelectOnce: selected });
  const item = tree.root.querySelector('[role=treeitem]')!; expect(item.getAttribute('tabindex')).toBe('0'); item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); expect(selected).toHaveBeenCalledExactlyOnceWith('one');
});

const editorMessages = { editorLabel: 'Editor', placeholder: 'Write', preservedBlockLabel: 'Preserved {kind}', externalConflictLabel: 'Conflict' };
it('should await the pending full-profile mount, edit one paragraph and omit only the synthetic trailing paragraph in native Vapor', async () => {
  const input = 'First\n\nHard  \nbreak\n\n- item';
  const composer = mount(ComposerEditor, { value: input, profile: 'full', messages: editorMessages });
  expect(composer.vm.readiness().ready).toBe(false);
  const capture = composer.vm.captureComposer();
  expect((await capture).text).toBe(input);
  const core = createdCores.at(-1)!;
  const blocks = core.getDocument().blocks;
  expect(blocks.at(-1)).toMatchObject({ kind: 'paragraph', segments: [] });
  const doc = core.view.state.doc;
  expect(doc.child(doc.childCount - 2).type.name).toBe('bulletList');
  core.typeText(blocks[0].paragraphId, '!');
  expect((await composer.vm.captureComposer()).text).toBe('First!\n\nHard  \nbreak\n\n- item');
  // Once typed, the trailing paragraph becomes real content and is retained.
  core.typeText(blocks.at(-1)!.paragraphId, 'Tail');
  expect((await composer.vm.captureComposer()).text).toBe('First!\n\nHard  \nbreak\n\n- item\n\nTail');
});

for (const component of [Modal, Drawer]) {
  it(`should initialize and clean up an initially open ${component.name} in native Vapor`, async () => {
    document.body.style.overflow = 'auto';
    const onClose = vi.fn(), view = mount(component, { open: true, onClose, 'aria-label': 'Consumer title' });
    expect(document.body.style.overflow).toBe('hidden');
    expect(view.root.querySelector('[role=dialog]')?.getAttribute('aria-label')).toBe('Consumer title');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    apps.pop()!.unmount();
    expect(document.body.style.overflow).toBe('auto');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    document.body.style.overflow = '';
    const labeled = mount(component, { open: true, 'aria-labelledby': 'consumer-heading' });
    const dialog = labeled.root.querySelector('[role=dialog]')!;
    expect(dialog.getAttribute('aria-labelledby')).toBe('consumer-heading');
    expect(dialog.hasAttribute('aria-label')).toBe(false);
  });
}
for (const profile of ['p0', 'full']) it(`should capture initialized ${profile} editors and intercept Enter before ProseMirror in native Vapor`, async () => {
  const onKeydown = vi.fn(() => true), input = profile === 'full' ? 'First\n\nHard  \nbreak\n\n- item' : 'Draft';
  const composer = mount(ComposerEditor, { value: input, profile, messages: editorMessages, onKeydown, class: 'custom', id: 'discard', role: 'textbox' });
  expect((await composer.vm.captureComposer()).text).toBe(input);
  const native = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }); composer.root.querySelector('.ProseMirror')!.dispatchEvent(native);
  expect(onKeydown).toHaveBeenCalledTimes(1); expect(onKeydown.mock.calls[0][0]).not.toBeInstanceOf(KeyboardEvent); expect(native.defaultPrevented).toBe(true); expect((await composer.vm.captureComposer()).text).toBe(input);
  expect(composer.root.querySelector('#discard')).toBeNull(); expect(composer.root.querySelectorAll('[role=textbox]')).toHaveLength(1);
  const value = profile === 'full' ? parseFullMarkdown('Draft', () => 'p:1').document : { format: 'focus.markdown.p0@1', blocks: [{ paragraphId: 'p:1', kind: 'paragraph', text: 'Draft' }] };
  const editor = mount(RichTextEditor, { value, profile, messages: editorMessages, id: 'discard', role: 'textbox', class: 'custom' });
  const block = (await editor.vm.captureDocument()).document.blocks[0];
  expect(block.text ?? block.segments?.map((segment: { text?: string }) => segment.text ?? '').join('')).toBe('Draft'); expect(editor.root.querySelectorAll('[role=textbox]')).toHaveLength(1);
});

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

it('should preserve numbered flow navigation through the published Vapor scene entry', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const fixture = flowFixture(2), onStepChange = vi.fn();
  const scene = mount(DiagramSceneFigure, {
    document: fixture.document, registry: fixture.options.registry,
    bindings: fixture.options.bindings, presentation: fixture.presentation,
    measureLines: flowMeasure, onStepChange,
  });
  await nextTick();
  expect(scene.root.querySelectorAll('[data-flow-badge]')).toHaveLength(2);
  const next = [...scene.root.querySelectorAll('button')].find(button => button.textContent === 'Next step')!;
  next.click(); await nextTick();
  expect(onStepChange).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ relation: 'relation:z' }));
  scene.vm.setZoom(1); expect(scene.vm.getCamera().zoom).toBeGreaterThan(0);
});

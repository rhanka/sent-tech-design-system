// @vitest-environment node
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, it, vi } from 'vitest';
import ForceGraph from './ForceGraph.vue';
import DiagramSceneFigure from './DiagramSceneFigure.vue';
import DiagramCard from './DiagramCard.vue';
import DiagramZone from './DiagramZone.vue';
import GraphCanvas from './GraphCanvas.vue';
import BpmnCanvas from './BpmnCanvas.vue';
import type { SceneDocument, ScenePresentation } from './diagramSceneModel.js';
import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN, m3ProfileRegistry, shippedExecutorBindings } from '@sentropic/diagram-core';

it('should render WebGL and BPMN shells without DOM globals or engine creation', async () => {
  expect(typeof window).toBe('undefined'); expect(typeof ResizeObserver).toBe('undefined');
  const graph = await renderToString(createSSRApp(GraphCanvas, { label: 'Graph', graph: { nodeIds: [], positions: new Float32Array(), edges: new Uint32Array() }, styles: {} as never }));
  expect(graph).toContain('<canvas'); expect(graph).toContain('aria-label="Graph"');
  const bpmn = await renderToString(createSSRApp(BpmnCanvas, { envelope: {} }));
  expect(bpmn).toContain('st-element__root'); expect(bpmn).not.toContain('st-element__body'); expect(bpmn).not.toContain('role="alert"');
});

it('should render a dossier scene on the server without DOM globals', async () => {
  expect(typeof window).toBe('undefined');
  const onLayout = vi.fn(); const onCameraChange = vi.fn();
  const document = {
    documentId: 'document:ssr', schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1,
    profileRefs: ['generic@2'], typeDefinitions: {}, relations: {}, ports: {}, resources: {}, extensions: [],
    entities: { 'entity:one': { id: 'entity:one', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'One' } } } },
  } as unknown as SceneDocument;
  const presentation = { contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN, legends: {}, categoryTokens: [],
    entities: { 'occurrence:e.one': { form: 'card', text: { title: 'Dossier card', body: 'One decision' } } },
  } as unknown as ScenePresentation;
  const html = await renderToString(createSSRApp(DiagramSceneFigure, {
    document, presentation, registry: m3ProfileRegistry, bindings: shippedExecutorBindings, title: 'Decision', onLayout, onCameraChange,
  }));
  expect(html).toContain('st-diagramSceneFigure');
  expect(html).toContain('Dossier card');
  expect(html).toContain('aria-keyshortcuts="+ - 0"');
  expect(onLayout).not.toHaveBeenCalled(); expect(onCameraChange).not.toHaveBeenCalled();
});

it('should render refusals without invoking client diagnostic listeners on the server', async () => {
  const onDiagnostic = vi.fn();
  const card = await renderToString(createSSRApp(DiagramCard, { entityId: 'wide', title: 'X'.repeat(200), body: [], onDiagnostic }));
  const zone = await renderToString(createSSRApp(DiagramZone, { entityId: 'wide-zone', title: 'X'.repeat(200), collapsed: false, width: 492, height: 400, onDiagnostic }));
  expect(card).toContain('data-card-refused'); expect(zone).toContain('data-zone-refused');
  expect(onDiagnostic).not.toHaveBeenCalled();
});

it('should keep ForceGraph merge intents client-only during server rendering', async () => {
  const onMergeComplete = vi.fn();
  const html = await renderToString(createSSRApp(ForceGraph, {
    nodes: [{ id: 'a' }, { id: 'b' }], edges: [], label: 'Graph', iterations: 1,
    mergePair: { id: 'merge', from: 'a', into: 'b' }, onMergeComplete,
  }));
  await Promise.resolve();
  expect(html).toContain('st-forceGraph__node');
  expect(onMergeComplete).not.toHaveBeenCalled();
});

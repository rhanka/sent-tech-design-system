import architecture from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-architecture.semantic.json';
import architectureView from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-architecture.view-architecture.json';
import ontology from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-ontology.semantic.json';
import ontologyView from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-ontology.view-ontology.json';
import schema13Fixture from '../../packages/diagram-core/tests/fixtures/layout-hints-2/schema-13.json';
import schema3Fixture from '../../packages/diagram-core/tests/fixtures/layout-hints-2/schema-3.json';
import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN, DIAGRAM_PRESENTATION_V2_CONTRACT_PIN, createView, entityRef, occurrenceRef, viewRef,
  m3ProfileRegistry, shippedExecutorBindings } from '@sentropic/diagram-core';
import { flowFixture } from '../../packages/diagram-canvas/test-support/flowFixture.ts';
import {
  H2_GENERIC_SCENE_SPECS,
  buildBrowserSafeGenericScene,
  buildH2Appctx16x9Fixture,
} from '../../packages/diagram-canvas/test-support/h2ReferenceFixtures.ts';
import { nestedZoneFixture } from '../../packages/diagram-canvas/test-support/nestedZoneFixture.ts';
import { r7ConnectorsFixture } from '../../packages/diagram-canvas/test-support/r7ConnectorsFixture.ts';

import { cases, expectedLegendAnchor, expectedLegendStyles } from './scenes.js';
export { cases, expectedLegendAnchor, expectedLegendStyles } from './scenes.js';

function r7NestedStylesFixture() {
  const document = {
    documentId: 'document:first-paint-r7-nested-styles',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: ['generic@2'],
    typeDefinitions: {},
    entities: {
      'entity:zone-platform': { id: 'entity:zone-platform', profile: 'generic@2', type: 'container', attributes: { name: { kind: 'text', value: 'Platform' } } },
      'entity:zone-core': { id: 'entity:zone-core', profile: 'generic@2', type: 'container', attributes: { name: { kind: 'text', value: 'Core' } } },
      'entity:engine': { id: 'entity:engine', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Engine' } } },
      'entity:store': { id: 'entity:store', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Store' } } },
      'entity:gateway': { id: 'entity:gateway', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Gateway' } } },
      'entity:client': { id: 'entity:client', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Client' } } },
      'entity:monitor': { id: 'entity:monitor', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Monitor' } } },
    },
    relations: {
      'relation:c.core': { id: 'relation:c.core', profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: 'entity:zone-platform' }, { role: 'child', target: 'entity:zone-core' }], attributes: {} },
      'relation:c.gateway': { id: 'relation:c.gateway', profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: 'entity:zone-platform' }, { role: 'child', target: 'entity:gateway' }], attributes: {} },
      'relation:c.engine': { id: 'relation:c.engine', profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: 'entity:zone-core' }, { role: 'child', target: 'entity:engine' }], attributes: {} },
      'relation:c.store': { id: 'relation:c.store', profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: 'entity:zone-core' }, { role: 'child', target: 'entity:store' }], attributes: {} },
      'relation:r-solid': { id: 'relation:r-solid', profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: 'entity:engine' }, { role: 'target', target: 'entity:store' }], attributes: { label: { kind: 'text', value: 'persists' } } },
      'relation:r-emph': { id: 'relation:r-emph', profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: 'entity:store' }, { role: 'target', target: 'entity:gateway' }], attributes: { label: { kind: 'text', value: 'publishes' } } },
      'relation:r-dotted': { id: 'relation:r-dotted', profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: 'entity:engine' }, { role: 'target', target: 'entity:gateway' }], attributes: { label: { kind: 'text', value: 'metrics' } } },
      'relation:r-dashed': { id: 'relation:r-dashed', profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: 'entity:gateway' }, { role: 'target', target: 'entity:client' }], attributes: { label: { kind: 'text', value: 'streams' } } },
      'relation:r-dashed-2': { id: 'relation:r-dashed-2', profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: 'entity:client' }, { role: 'target', target: 'entity:monitor' }], attributes: { label: { kind: 'text', value: 'reports' } } },
    },
    ports: {},
    resources: {},
    extensions: [],
  };
  const presentation = {
    contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    entities: {
      'occurrence:e.zone-platform': { form: 'container', anatomy: 'v2', text: { title: 'Platform', subtitle: 'System' } },
      'occurrence:e.zone-core': { form: 'container', anatomy: 'v2', text: { title: 'Core', subtitle: 'Domain' } },
      'occurrence:e.engine': { form: 'card', anatomy: 'v2', text: { title: 'Engine', body: 'Worker' } },
      'occurrence:e.store': { form: 'card', anatomy: 'v2', text: { title: 'Store', body: 'State' } },
      'occurrence:e.gateway': { form: 'card', anatomy: 'v2', text: { title: 'Gateway', body: 'Edge' } },
      'occurrence:e.client': { form: 'card', anatomy: 'v2', text: { title: 'Client', body: 'Consumer' } },
      'occurrence:e.monitor': { form: 'card', anatomy: 'v2', text: { title: 'Monitor', body: 'Telemetry' } },
    },
    relations: {
      'relation:r-solid': { strokeStyle: 'solid', arrowhead: 'arrow' },
      'relation:r-emph': { strokeStyle: 'solid', arrowhead: 'none', emphasis: 'emphasis' },
      'relation:r-dotted': { strokeStyle: 'dotted', arrowhead: 'arrow' },
      'relation:r-dashed': { strokeStyle: 'dashed', arrowhead: 'arrow' },
      'relation:r-dashed-2': { strokeStyle: 'dashed', arrowhead: 'arrow' },
    },
    legends: {},
    categoryTokens: [],
  };
  return { document, presentation, defaultFolds: [] };
}

export function fixture(name) {
  if (!cases.includes(name)) throw new Error(`Unknown scene: ${name}`);
  const common = { registry: m3ProfileRegistry, bindings: shippedExecutorBindings,
    labels: { fit: 'Ajuster' }, title: name };
  if (name === 'r7-connectors' || name === 'r7-connectors-folded') {
    return { ...common, ...r7ConnectorsFixture(name.endsWith('-folded')) };
  }
  if (name === 'r7-nested-styles') {
    return { ...common, ...r7NestedStylesFixture() };
  }
  if (name === 'h2-example-a' || name === 'h2-example-b') {
    const id = name === 'h2-example-a' ? 'schema-13' : 'schema-3';
    const payload = name === 'h2-example-a' ? schema13Fixture : schema3Fixture;
    const spec = H2_GENERIC_SCENE_SPECS[id];
    const built = buildBrowserSafeGenericScene({
      id,
      entities: spec.entities,
      relations: spec.relations,
      hintsV2: payload.hints,
    });
    return { ...common, document: built.document, presentation: built.presentation, hints: built.hints, collapsed: [] };
  }
  if (name === 'h2-aspect-16-9') {
    const built = buildH2Appctx16x9Fixture(architecture, architectureView);
    return { ...common, document: built.document, view: built.view, presentation: built.presentation, hints: built.hints, collapsed: [] };
  }
  if (name.startsWith('numbered-flows')) {
    const source = flowFixture(name.endsWith('-bundled') ? 6 : 3, { labels: true, folded: true, reverse: true });
    return { ...common, document: source.document, presentation: source.presentation, flows: { fanOutMax: 4 } };
  }
  if (name.startsWith('nested-zones')) {
    // Classes nested in an ontology zone inside a system zone: every relation
    // runs inside both zone surfaces (the consumer-reported ERD view shape).
    const source = nestedZoneFixture({ outside: name.endsWith('-outside') });
    return { ...common, document: source.document, view: source.view, presentation: source.presentation, collapsed: [] };
  }
  if (name === 'three-cards-compact') {
    const ids = ['a', 'b', 'c'];
    const document = { documentId: 'document:first-paint-compact', schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1,
      profileRefs: ['generic@2'], typeDefinitions: {}, ports: {}, resources: {}, extensions: [],
      entities: Object.fromEntries(ids.map(id => [`entity:${id}`, { id: `entity:${id}`,
        profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: id } } }])),
      relations: {} };
    // Compact v2 anatomy (352 × 154) is explicit opt-in on createView; compact
    // centring is opt-in via explicit align: "center" on diagram-presentation@2.
    const view = {
      ...createView({
        viewId: viewRef('compact'),
        semanticDocumentId: document.documentId,
        revision: 1,
        presentation: { camera: { x: 0, y: 0, zoom: 1 }, anatomy: 'v2' },
      }),
      entityOccurrences: Object.fromEntries(ids.map((id, index) => [`occurrence:e.${id}`, {
        id: occurrenceRef(`e.${id}`), entity: entityRef(id),
        geometry: { x: index * 400, y: 0, width: 352, height: 154 },
      }])),
    };
    return { ...common, document, view,
      presentation: { contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN }, legends: {}, categoryTokens: [],
        entities: Object.fromEntries(ids.map(id => [`occurrence:e.${id}`, { form: 'card', text: { title: `Card ${id}`, body: 'First paint' }, align: 'center' }])) } };
  }
  if (name !== 'three-cards') {
    const document = name.startsWith('architecture') ? architecture : ontology;
    const view = name.startsWith('architecture') ? architectureView : ontologyView;
    return { ...common, document, view, presentation: view.presentation.diagram,
      collapsed: name.endsWith('-folded') ? Object.values(view.groups).flatMap(group => group.occurrence === undefined ? [] : [group.occurrence]) : [] };
  }
  const ids = ['a', 'b', 'c'];
  return { ...common,
    document: { documentId: 'document:first-paint', schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1,
      profileRefs: ['generic@2'], typeDefinitions: {}, ports: {}, resources: {}, extensions: [],
      entities: Object.fromEntries(ids.map(id => [`entity:${id}`, { id: `entity:${id}`,
        profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: id } } }])),
      relations: {} },
    presentation: { contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN }, legends: {}, categoryTokens: [],
      entities: Object.fromEntries(ids.map(id => [`occurrence:e.${id}`, { form: 'card', text: { title: `Card ${id}`, body: 'First paint' } }])) },
  };
}

/** The exact boxes each connector of a scene joins, when the fixture states them; `null` otherwise. */
export function expectedRelations(name) {
  if (!name.startsWith('nested-zones')) return null;
  return nestedZoneFixture({ outside: name.endsWith('-outside') }).relations
    .map(relation => ({ occurrence: relation.occurrence, ends: [...relation.ends] }));
}

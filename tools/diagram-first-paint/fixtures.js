import architecture from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-architecture.semantic.json';
import architectureView from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-architecture.view-architecture.json';
import ontology from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-ontology.semantic.json';
import ontologyView from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-ontology.view-ontology.json';
import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN,
  m3ProfileRegistry, shippedExecutorBindings } from '@sentropic/diagram-core';
import { flowFixture } from '../../packages/diagram-canvas/test-support/flowFixture.ts';

import { cases } from './scenes.js';
export { cases } from './scenes.js';

export function fixture(name) {
  if (!cases.includes(name)) throw new Error(`Unknown scene: ${name}`);
  const common = { registry: m3ProfileRegistry, bindings: shippedExecutorBindings,
    labels: { fit: 'Ajuster' }, title: name };
  if (name.startsWith('numbered-flows')) {
    const source = flowFixture(name.endsWith('-bundled') ? 6 : 3, { labels: true, folded: true, reverse: true });
    return { ...common, document: source.document, presentation: source.presentation, flows: { fanOutMax: 4 } };
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

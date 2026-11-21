import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_V2_CONTRACT_PIN, occurrenceRef, type SemanticDocument } from "@sentropic/diagram-core";
import type { ScenePresentation } from "@sentropic/diagram-canvas/diagramSceneModel";

export function r7ConnectorsFixture(folded = false) {
  const document = {
    documentId: folded ? 'document:first-paint-r7-connectors-folded' : 'document:first-paint-r7-connectors',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1,
    profileRefs: ['generic@2'],
    typeDefinitions: {},
    entities: {
      'entity:zone-core': { id: 'entity:zone-core', profile: 'generic@2', type: 'container', attributes: { name: { kind: 'text', value: 'Core' } } },
      'entity:alpha': { id: 'entity:alpha', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Alpha' } } },
      'entity:beta': { id: 'entity:beta', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Beta' } } },
      'entity:gamma': { id: 'entity:gamma', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Gamma' } } },
      'entity:gateway': { id: 'entity:gateway', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Gateway' } } },
      'entity:audit': { id: 'entity:audit', profile: 'generic@2', type: 'node', attributes: { name: { kind: 'text', value: 'Audit' } } },
    },
    relations: {
      'relation:c.alpha': { id: 'relation:c.alpha', profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: 'entity:zone-core' }, { role: 'child', target: 'entity:alpha' }], attributes: {} },
      'relation:c.beta': { id: 'relation:c.beta', profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: 'entity:zone-core' }, { role: 'child', target: 'entity:beta' }], attributes: {} },
      'relation:c.gamma': { id: 'relation:c.gamma', profile: 'generic@2', type: 'contains', endpoints: [{ role: 'parent', target: 'entity:zone-core' }, { role: 'child', target: 'entity:gamma' }], attributes: {} },
      'relation:r-solid': { id: 'relation:r-solid', profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: 'entity:alpha' }, { role: 'target', target: 'entity:beta' }], attributes: { label: { kind: 'text', value: 'sync' } } },
      'relation:r-emph': { id: 'relation:r-emph', profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: 'entity:beta' }, { role: 'target', target: 'entity:gamma' }], attributes: { label: { kind: 'text', value: 'critical' } } },
      'relation:r-dashed': { id: 'relation:r-dashed', profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: 'entity:alpha' }, { role: 'target', target: 'entity:gateway' }], attributes: { label: { kind: 'text', value: 'proposed' } } },
      'relation:r-dotted': { id: 'relation:r-dotted', profile: 'generic@2', type: 'link', endpoints: [{ role: 'source', target: 'entity:gamma' }, { role: 'target', target: 'entity:audit' }], attributes: { label: { kind: 'text', value: 'audit' } } },
    },
    ports: {},
    resources: {},
    extensions: [],
  };
  const presentation: ScenePresentation = {
    contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
    entities: {
      'occurrence:e.zone-core': { form: 'container', anatomy: 'v2', text: { title: 'Core', subtitle: 'Services' } },
      'occurrence:e.alpha': { form: 'card', anatomy: 'v2', text: { title: 'Alpha', body: 'Service A' } },
      'occurrence:e.beta': { form: 'card', anatomy: 'v2', text: { title: 'Beta', body: 'Service B' } },
      'occurrence:e.gamma': { form: 'card', anatomy: 'v2', text: { title: 'Gamma', body: 'Service C' } },
      'occurrence:e.gateway': { form: 'card', anatomy: 'v2', text: { title: 'Gateway', body: 'Ingress' } },
      'occurrence:e.audit': { form: 'card', anatomy: 'v2', text: { title: 'Audit', body: 'Ledger' } },
    },
    relations: {
      'relation:r-solid': { strokeStyle: 'solid', arrowhead: 'arrow' },
      'relation:r-emph': { strokeStyle: 'solid', arrowhead: 'none', emphasis: 'emphasis' },
      'relation:r-dashed': { strokeStyle: 'dashed', arrowhead: 'arrow' },
      'relation:r-dotted': { strokeStyle: 'dotted', arrowhead: 'arrow' },
    },
    legends: {},
    categoryTokens: [],
  };
  return {
    document: document as unknown as SemanticDocument,
    presentation,
    defaultFolds: folded ? [occurrenceRef('e.zone-core')] : [],
  };
}

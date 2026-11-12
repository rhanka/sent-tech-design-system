import type { Profile } from '../profile.js';
export const ERD_PROFILE_ID = 'erd@1' as const;
export const ERD_CARDINALITIES = ['1', '0..1', '1..n', '0..n'] as const;
export type ErdCardinality = typeof ERD_CARDINALITIES[number];
export const erdProfile: Profile = {
  id: ERD_PROFILE_ID, name: 'ERD', version: 1, completeness: 'complete',
  entityTypes: [{ id: 'entity', label: 'Entity', foldable: true, attributes: [
        { name: 'name', kind: 'text', required: true }, { name: 'schema', kind: 'text' },
      ] }],
  portTypes: [{ id: 'field', label: 'Attribute row', directions: ['inout'], attributes: [
        { name: 'dataType', kind: 'text', required: true },
        { name: 'pk', kind: 'boolean', required: true },
        { name: 'fk', kind: 'reference', refKind: 'port' },
        { name: 'nullable', kind: 'boolean', required: true },
        { name: 'ordinal', kind: 'quantity', units: ['index'], integer: true, min: 0, required: true },
      ] }],
  relationTypes: [{ id: 'relationship', label: 'Relationship', direction: 'undirected',
      roles: ['from', 'to'].map(role => ({ role, cardinality: { min: 1, max: 1 }, targets: ['entity', 'port'] })),
      attributes: [
        { name: 'name', kind: 'text', required: true }, { name: 'label', kind: 'text' },
        ...['from', 'to'].flatMap(end => [
          { name: end + 'Cardinality', kind: 'enum' as const, values: ERD_CARDINALITIES, required: true },
          { name: end + 'Role', kind: 'text' as const, required: true },
        ]),
      ],
    }],
  constraints: [{ kind: 'erd-keys', maxFields: 17 }],
  limits: { maxEntities: 1000, maxRelations: 10000, maxEndpointsPerRelation: 2 },
  notes: ['Exactly one primary key per entity; no composite keys. Many-to-many remains one relationship.'],
};

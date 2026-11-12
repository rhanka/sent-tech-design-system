import { createDocument, type Entity, type SemanticPort, type Relation } from './document.js';
import { createView, type EntityOccurrence, type PortOccurrence, type RelationOccurrence } from './view.js';
import { documentRef, entityRef, portRef, relationRef, occurrenceRef, viewRef } from './refs.js';
import { DIAGRAM_PRESENTATION_CONTRACT_PIN, type DiagramPresentation, type EntityPresentation } from './presentation.js';
import type { ErdCardinality } from './profiles/erd.js';
export interface EngramErdField {
  readonly name: string;
  readonly type: string;
  readonly pk: boolean;
  readonly fk: {
    readonly class: string;
    readonly field: string;
  } | null;
  readonly nullable: boolean;
}
export interface EngramErdScene {
  readonly id: string;
  readonly container: string;
  readonly classes: readonly {
    readonly name: string;
    readonly fields: readonly EngramErdField[];
  }[];
  readonly relations: readonly {
    readonly name: string;
    readonly roleLabel: string;
    readonly from: {
      readonly class: string;
      readonly cardinality: ErdCardinality;
      readonly role?: string;
    };
    readonly to: {
      readonly class: string;
      readonly cardinality: ErdCardinality;
      readonly role?: string;
    };
  }[];
}
/** Injective encoding into the narrow local-reference grammar, including punctuation and Unicode. */
export const erdLocalId = (name: string): string => 'x' + Array.from(name).map(c => c.codePointAt(0)!.toString(16)).join('-');
export const erdEntityOccurrence = (entity: string) => occurrenceRef('e.' + entity.slice(7));
export const erdPortOccurrence = (port: string, side: 'east' | 'west' = 'east') => occurrenceRef('p.' + side + '.' + port.slice(5));
const text = (value: string) => ({ kind: 'text' as const, value });
/** One scene relation stays one semantic relation, including many-to-many and self references. */
export function convertEngramErdScene(scene: EngramErdScene) {
  const entities: Record<string, Entity> = {}, ports: Record<string, SemanticPort> = {}, relations: Record<string, Relation> = {};
  const entityOccurrences: Record<string, EntityOccurrence> = {}, portOccurrences: Record<string, PortOccurrence> = {}, relationOccurrences: Record<string, RelationOccurrence> = {};
  const forms: Record<string, EntityPresentation> = {};
  const entityId = (name: string) => entityRef(erdLocalId(name));
  const fieldId = (owner: string, field: string) => portRef(erdLocalId(owner) + '.' + erdLocalId(field));
  for (const cls of scene.classes) {
    const id = entityId(cls.name), occurrence = erdEntityOccurrence(id);
    if (entities[id])
      throw new Error('Duplicate ERD class: ' + cls.name);
    entities[id] = { id, profile: 'erd@1', type: 'entity', attributes: { name: text(cls.name), schema: text(scene.container) } };
    entityOccurrences[occurrence] = { id: occurrence, entity: id, geometry: { x: 0, y: 0, width: 1, height: 1 } };
    forms[occurrence] = { form: 'card', text: { title: cls.name } };
    cls.fields.forEach((field, index) => {
      const port = fieldId(cls.name, field.name), po = erdPortOccurrence(port);
      if (ports[port])
        throw new Error('Duplicate ERD field: ' + cls.name + '.' + field.name);
      ports[port] = { id: port, profile: 'erd@1', type: 'field', owner: id, name: field.name, direction: 'inout', attributes: {
          dataType: text(field.type), pk: { kind: 'boolean', value: field.pk }, nullable: { kind: 'boolean', value: field.nullable },
          ordinal: { kind: 'quantity', unit: 'index', value: index },
          ...(field.fk === null ? {} : { fk: { kind: 'reference' as const, value: fieldId(field.fk.class, field.fk.field) } }),
        } };
      portOccurrences[po] = { id: po, port, ownerOccurrence: occurrence, side: 'east', order: index, anchor: (index + 0.5) / cls.fields.length };
    });
  }
  scene.relations.forEach((relation, index) => {
    const id = relationRef('r.' + index + '.' + erdLocalId(relation.name)), occurrence = occurrenceRef(id.slice(9));
    const from = scene.classes.find(c => c.name === relation.from.class);
    const candidates = from?.fields.filter(f => f.fk?.class === relation.to.class) ?? [];
    const stem = (value: string) => value.toLowerCase().replace(/id$/, '').replace('owned', 'owner');
    const relationStem = stem(relation.name);
    const words = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace('owned', 'owner').split(' ');
    const score = (field: EngramErdField) => {
      if (relation.name === 'partOf' && field.name.startsWith('parent'))
        return 100;
      if (stem(field.name).startsWith(relationStem))
        return 100;
      return words(relation.name).filter(w => !['by', 'of', 'to'].includes(w) && words(field.name).includes(w)).length;
    };
    const fk = candidates.slice().sort((a, b) => score(b) - score(a))[0];
    const many = relation.from.cardinality.endsWith('n') && relation.to.cardinality.endsWith('n');
    const row = !many && fk?.fk !== null && fk?.fk !== undefined;
    const targets = row ? [fieldId(relation.from.class, fk!.name), fieldId(fk!.fk!.class, fk!.fk!.field)] : [entityId(relation.from.class), entityId(relation.to.class)];
    const endpoints = ['from', 'to'].map((role, i) => ({ role, target: targets[i]! }));
    relations[id] = { id, profile: 'erd@1', type: 'relationship', endpoints, attributes: {
        name: text(relation.name), label: text(relation.roleLabel),
        fromCardinality: { kind: 'enum', value: relation.from.cardinality }, toCardinality: { kind: 'enum', value: relation.to.cardinality },
        fromRole: text(relation.from.role ?? ''), toRole: text(relation.to.role ?? relation.roleLabel),
      } };
    relationOccurrences[occurrence] = { id: occurrence, relation: id, endpoints: endpoints.map(e => ({ role: e.role,
        occurrence: e.target.startsWith('port:') ? erdPortOccurrence(e.target) : erdEntityOccurrence(e.target),
      })) };
  });
  const document = { ...createDocument({ documentId: documentRef(erdLocalId(scene.id)), profileRefs: ['erd@1'] }), entities, ports, relations };
  const presentation: DiagramPresentation = { contractPin: DIAGRAM_PRESENTATION_CONTRACT_PIN, entities: forms, legends: {}, categoryTokens: [] };
  const view = { ...createView({ viewId: viewRef('erd'), semanticDocumentId: document.documentId }), entityOccurrences, portOccurrences, relationOccurrences };
  return { document, view, presentation };
}

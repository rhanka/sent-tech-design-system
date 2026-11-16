import { validateDocument, createView, occurrenceRef, viewRef, erdEntityOccurrence, erdPortOccurrence, type SemanticDocument, type ViewDocument, type EntityOccurrence, type PortOccurrence, type RelationOccurrence, type RelationOccurrenceEndpoint, type VisualGroup, type EntityRef } from '@sentropic/diagram-core';
import { ERD_GEOMETRY as T, measureErdCard, erdFields } from '../presentation/erd.js';
import { packRows } from './pack.js';
import { routeEdges, type RouteRequest } from './route.js';
import { resolveRowPack, validateRowPack, type LayoutOptions, type LayoutResult, type LayoutWarning } from './types.js';
import type { Rect, Vec2 } from '../transform.js';
/** ERD measurement plugs into the existing variable-size shelf packer and orthogonal router. */
export function layoutErd(document: SemanticDocument, options: LayoutOptions, source?: ViewDocument): LayoutResult {
  const diagnostics = validateDocument(document, { registry: options.registry, ...(options.bindings ? { bindings: options.bindings } : {}) });
  if (diagnostics.some(d => d.severity === 'error'))
    return { status: 'refused', refusals: [{ code: 'document-invalid', path: 'document', message: 'Invalid ERD document' }], diagnostics };
  if (!Number.isFinite(options.targetWidth) || options.targetWidth <= 0)
    return { status: 'refused', refusals: [{ code: 'target-width-invalid', path: 'targetWidth', message: 'Positive finite width required' }], diagnostics: [] };
  const objective = resolveRowPack(options.rowPack), refusals = validateRowPack(objective);
  if (refusals.length)
    return { status: 'refused', refusals, diagnostics: [] };
  const collapsed = new Set(options.collapsed ?? Object.values(source?.groups ?? {}).filter(g => g.collapsed).map(g => g.occurrence!));
  const entities = Object.values(document.entities).sort((a, b) => a.id < b.id ? -1 : 1);
  const ids = new Map(entities.map(e => [e.id, Object.values(source?.entityOccurrences ?? {}).find(o => o.entity === e.id)?.id ?? erdEntityOccurrence(e.id)]));
  const cards = entities.map(e => measureErdCard(document, e.id, collapsed.has(ids.get(e.id)!), options.measureLines));
  const packed = packRows(cards, { targetAspect: objective.targetAspect, tallBias: objective.tallBias, emptyPenaltyWeight: objective.emptyPenaltyWeight, gapX: Math.max(T.gapInline, options.metrics?.rowGapInline ?? 0), gapY: Math.max(T.gapBlock, options.metrics?.rowGapBlock ?? 0), chromeWidth: 0, chromeHeight: 0 });
  const entityOccurrences: Record<string, EntityOccurrence> = {}, portOccurrences: Record<string, PortOccurrence> = {}, relationOccurrences: Record<string, RelationOccurrence> = {}, groups: Record<string, VisualGroup> = {};
  const rects = new Map<EntityRef, Rect>(), headers = new Map<EntityRef, number>();
  entities.forEach((entity, index) => {
    const id = ids.get(entity.id)!, card = cards[index]!, pos = packed.positions[index]!;
    const geometry = { x: pos.x + T.gapInline, y: pos.y + T.gapBlock, width: card.width, height: card.height };
    entityOccurrences[id] = { id, entity: entity.id, geometry };
    rects.set(entity.id, geometry);
    headers.set(entity.id, card.headerHeight);
    groups['fold.' + id.slice(11)] = { id: 'fold.' + id.slice(11), occurrence: id, collapsed: collapsed.has(id) };
    for (const field of erdFields(document, entity.id))
      for (const side of ['west', 'east'] as const) {
        const row = card.rows.find(r => r.field.id === field.id), idp = erdPortOccurrence(field.id, side);
        portOccurrences[idp] = { id: idp, port: field.id, ownerOccurrence: id, side, order: row ? card.rows.indexOf(row) : 0, anchor: row ? (row.y + row.height / 2) / card.height : 0.5 };
      }
  });
  const relations = Object.values(document.relations).sort((a, b) => a.id < b.id ? -1 : 1);
  type End = {
    entity: EntityRef;
    side: 'east' | 'west';
    target: string;
    role: string;
    relation: string;
  };
  const ends: End[] = relations.flatMap(r => ['from', 'to'].map(role => {
    const end = r.endpoints.find(e => e.role === role)!, other = r.endpoints.find(e => e.role !== role)!;
    const entity = (document.ports[end.target]?.owner ?? end.target) as EntityRef, peer = (document.ports[other.target]?.owner ?? other.target) as EntityRef;
    const rect = rects.get(entity)!, rectOther = rects.get(peer)!;
    return { entity, side: rectOther.x + rectOther.width / 2 < rect.x + rect.width / 2 ? 'west' as const : 'east' as const, target: end.target, role, relation: r.id };
  }));
  const requests: RouteRequest[] = [], selfRoutes = new Map<string, readonly Vec2[]>();
  const selfCountByEntity = new Map<EntityRef, number>();
  for (const relation of relations) {
    const occurrence = Object.values(source?.relationOccurrences ?? {}).find(o => o.relation === relation.id)?.id ?? occurrenceRef(relation.id.slice(9));
    const points: Vec2[] = [], exits: Vec2[] = [], eps: RelationOccurrenceEndpoint[] = [];
    for (const end of ends.filter(e => e.relation === relation.id)) {
      const owner = ids.get(end.entity)!, rect = rects.get(end.entity)!, port = document.ports[end.target];
      const folded = collapsed.has(owner), po = port ? erdPortOccurrence(port.id, end.side) : undefined;
      const slots = ends.filter(e => e.entity === end.entity && e.side === end.side && (collapsed.has(owner) || !document.ports[e.target]));
      const slot = slots.indexOf(end), header = headers.get(end.entity)!;
      const y = port && !folded ? rect.y + portOccurrences[po!]!.anchor * rect.height : rect.y + T.markerHalfWidth + (slot + 1) * (header - 2 * T.markerHalfWidth) / (slots.length + 1);
      points.push({ x: rect.x + (end.side === 'east' ? rect.width : 0), y });
      exits.push({ x: end.side === 'east' ? 1 : -1, y: 0 });
      eps.push({ role: end.role, occurrence: port && !folded ? po! : owner, ...(port && folded ? { semanticTarget: port.id, sourceOccurrence: po! } : {}) });
    }
    relationOccurrences[occurrence] = { id: occurrence, relation: relation.id, endpoints: eps };
    const pair = ends.filter(e => e.relation === relation.id).map(e => e.entity);
    if (pair[0] === pair[1]) {
      const entity = pair[0]!, selfIndex = (selfCountByEntity.get(entity) ?? 0) + 1;
      selfCountByEntity.set(entity, selfIndex);
      const rect = rects.get(entity)!, lane = rect.x + rect.width + T.markerLength + T.markerGap * selfIndex * 2;
      const start = points[0]!, end = points[1]!;
      selfRoutes.set(relation.id, start.y === end.y
        ? [start, { x: lane, y: start.y }, { x: lane, y: start.y + T.rowHeight }, { x: lane + T.markerGap, y: start.y + T.rowHeight }, { x: lane + T.markerGap, y: end.y }, end]
        : [start, { x: lane, y: start.y }, { x: lane, y: end.y }, end]);
    }
    else
      // FK edges may converge on one PK row or have opposite row order. Reserve each
      // independently: overlap stays penalized, while the entity-pair crossing ban
      // (which assumes freely ordered header docks) does not apply to fixed rows.
      requests.push({ id: relation.id, pairKey: relation.id, start: points[0]!, end: points[1]!, startExit: exits[0]!, endExit: exits[1]!, passable: new Set() });
  }
  const routed = routeEdges({ rects, requests, clearance: T.markerLength + T.markerGap });
  const warnings: LayoutWarning[] = routed.obstructed.map(id => ({ code: 'route-obstructed', refs: [id], message: 'Dense ERD routing uses an elbow fallback' }));
  for (const o of Object.values(relationOccurrences)) {
    const route = selfRoutes.get(o.relation) ?? routed.routes.get(o.relation) ?? [];
    const fromPort = portOccurrences[o.endpoints[0]!.occurrence], toPort = portOccurrences[o.endpoints[1]!.occurrence];
    relationOccurrences[o.id] = { ...o, waypoints: route.slice(fromPort ? 1 : 0, toPort ? route.length - 1 : route.length) };
  }
  const view = { ...createView({ viewId: options.viewId ?? source?.viewId ?? viewRef('erd'), semanticDocumentId: document.documentId, revision: document.revision }), entityOccurrences, portOccurrences, relationOccurrences, groups };
  return { status: 'laid-out', view, fit: { direction: 'left-to-right', width: packed.width + 2 * T.gapInline, height: packed.height + 2 * T.gapBlock, zoom: 1, pans: packed.width > options.targetWidth, phone: options.targetWidth <= 390 }, warnings, orientations: { root: 'rows' } };
}

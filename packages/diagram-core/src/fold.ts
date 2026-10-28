/**
 * Fold binding, folded-edge projection and authored summary labels (M3 §4).
 *
 * `projectView` is the only folded projection: a pure function from a
 * retained source view to a projected `ViewDocument`, recomputed from the
 * retained source on every transition and never patched from a previous
 * projection (§4.4.3). Views without the §4.1/§4.4.2/§4.5.1 fields behave
 * exactly as before; `validateView` owns every refusal.
 */

import type { Relation, SemanticDocument } from "./document.js";
import type {
  RelationOccurrence,
  RelationOccurrenceEndpoint,
  SummaryDefinition,
  ViewDocument,
} from "./view.js";
import type { EntityRef, OccurrenceRef, PortRef, RelationRef } from "./refs.js";

/** The parent entity occurrence containing an occurrence in this view, if any. */
export function parentOccurrenceOf(view: ViewDocument, id: OccurrenceRef): OccurrenceRef | undefined {
  const entity = view.entityOccurrences[id];
  if (entity === undefined || entity.group === undefined) return undefined;
  const group = view.groups[entity.group];
  const parent = group?.occurrence;
  if (parent === undefined || view.entityOccurrences[parent] === undefined) return undefined;
  return parent;
}

/** The ancestor-occurrence chain from an entity occurrence up to its root. */
function ancestorChain(view: ViewDocument, id: OccurrenceRef): OccurrenceRef[] {
  const chain: OccurrenceRef[] = [];
  const seen = new Set<string>();
  let current: OccurrenceRef | undefined = id;
  while (current !== undefined && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    current = parentOccurrenceOf(view, current);
  }
  return chain;
}

/** Entity/port occurrences hidden by fold under a collapsed set. */
export function hiddenByFold(view: ViewDocument, collapsed: ReadonlySet<string>, id: OccurrenceRef): boolean {
  const port = view.portOccurrences[id];
  if (port !== undefined) {
    return hiddenByFold(view, collapsed, port.ownerOccurrence);
  }
  if (view.entityOccurrences[id] === undefined) return false;
  const chain = ancestorChain(view, id);
  return chain.slice(1).some((ancestor) => collapsed.has(ancestor));
}

/** The visible representative of an entity occurrence under a collapsed set. */
export function representativeOf(view: ViewDocument, collapsed: ReadonlySet<string>, id: OccurrenceRef): OccurrenceRef {
  const chain = ancestorChain(view, id);
  const folded = chain.filter((ancestor) => collapsed.has(ancestor));
  return folded.length === 0 ? id : (folded[folded.length - 1] as OccurrenceRef);
}

/**
 * The representative of a port occurrence: the representative of its owner,
 * drawn through the representative's counterpart port occurrence when exactly
 * one exists, otherwise through the representative entity occurrence (§4.4.6).
 */
export function portRepresentativeOf(
  view: ViewDocument,
  document: SemanticDocument,
  collapsed: ReadonlySet<string>,
  id: OccurrenceRef,
): OccurrenceRef {
  const port = view.portOccurrences[id];
  if (port === undefined) return id;
  const ownerRep = representativeOf(view, collapsed, port.ownerOccurrence);
  const ownerEntity = view.entityOccurrences[ownerRep]?.entity;
  const original = document.ports[port.port];
  const candidates = Object.values(view.portOccurrences).filter((candidate) => {
    if (candidate.ownerOccurrence !== ownerRep) return false;
    const semantic = document.ports[candidate.port];
    if (semantic === undefined || original === undefined) return false;
    if (semantic.owner !== ownerEntity) return false;
    return semantic.direction === original.direction;
  });
  return candidates.length === 1 ? (candidates[0] as { id: OccurrenceRef }).id : ownerRep;
}

/** The target an occurrence draws in the semantic document, if any. */
export function drawnTargetOf(
  view: ViewDocument,
  occurrenceId: OccurrenceRef,
): EntityRef | PortRef | RelationRef | undefined {
  const entity = view.entityOccurrences[occurrenceId];
  if (entity !== undefined) return entity.entity;
  const port = view.portOccurrences[occurrenceId];
  if (port !== undefined) return port.port;
  const relation = view.relationOccurrences[occurrenceId];
  if (relation !== undefined) return relation.relation;
  return undefined;
}

/** The semantic relation's endpoint target for a role matching a drawn target. */
function semanticTargetFor(
  document: SemanticDocument,
  relationId: RelationRef,
  role: string,
  drawn: EntityRef | PortRef | RelationRef,
): EntityRef | PortRef | RelationRef | undefined {
  const relation = document.relations[relationId] as Relation | undefined;
  if (relation === undefined) return undefined;
  return relation.endpoints.find((endpoint) => endpoint.role === role && endpoint.target === drawn)?.target;
}

/**
 * Internal relation occurrences mapped to their collapsed container (§4.4.1).
 * Finite worklist over the retained occurrence records; classification is
 * independent of record order and ends after at most as many rounds as there
 * are retained relation occurrences.
 */
export function classifyInternalRelations(
  view: ViewDocument,
  document: SemanticDocument,
  collapsed: ReadonlySet<string>,
): ReadonlyMap<OccurrenceRef, OccurrenceRef> {
  const internal = new Map<OccurrenceRef, OccurrenceRef>();
  let progressed = true;
  while (progressed) {
    progressed = false;
    const snapshot = new Map(internal);
    const repOf = (id: OccurrenceRef): OccurrenceRef => {
      if (view.relationOccurrences[id] !== undefined) return snapshot.get(id) ?? id;
      if (view.portOccurrences[id] !== undefined) return portRepresentativeOf(view, document, collapsed, id);
      return representativeOf(view, collapsed, id);
    };
    const dependent = (id: OccurrenceRef): boolean => {
      if (view.relationOccurrences[id] !== undefined) return snapshot.has(id);
      return hiddenByFold(view, collapsed, id);
    };
    for (const key of Object.keys(view.relationOccurrences).sort()) {
      const id = key as OccurrenceRef;
      if (snapshot.has(id)) continue;
      const occurrence = view.relationOccurrences[key] as RelationOccurrence;
      const representatives = new Set(occurrence.endpoints.map((endpoint) => repOf(endpoint.occurrence)));
      if (representatives.size !== 1) continue;
      const sole = [...representatives][0] as OccurrenceRef;
      if (!collapsed.has(sole) || view.entityOccurrences[sole] === undefined) continue;
      if (!occurrence.endpoints.some((endpoint) => dependent(endpoint.occurrence))) continue;
      internal.set(id, sole);
      progressed = true;
    }
  }
  return internal;
}

/** The collapsed set a view stores: occurrences its fold groups collapse. */
export function collapsedOf(view: ViewDocument): ReadonlySet<string> {
  return new Set(
    Object.values(view.groups)
      .filter((group) => group.collapsed === true && group.occurrence !== undefined)
      .map((group) => group.occurrence as string),
  );
}

/** Stamp fold groups for exactly a collapsed set; revision is never changed. */
function stampGroups(
  view: ViewDocument,
  collapsed: ReadonlySet<string>,
): Readonly<Record<string, import("./view.js").VisualGroup>> {
  const groups: Record<string, import("./view.js").VisualGroup> = {};
  for (const [key, group] of Object.entries(view.groups)) {
    groups[key] =
      group.occurrence === undefined ? group : { ...group, collapsed: collapsed.has(group.occurrence) };
  }
  for (const id of collapsed) {
    const bound = Object.keys(groups).find((key) => groups[key]?.occurrence === id);
    if (bound !== undefined) continue;
    groups[id] = { id, occurrence: id as OccurrenceRef, collapsed: true };
  }
  return groups;
}

/**
 * The only folded projection (§4.4.3). Pure: recomputed from the retained
 * source on every transition, never patched from a previous projection.
 * Relation records of hidden/internal occurrences stay retained with source
 * geometry; `strokeStyle` override presence is preserved byte-for-byte;
 * `summaryLabels` definitions carry through unchanged; `revision` is retained.
 */
export function projectView(
  document: SemanticDocument,
  sourceView: ViewDocument,
  collapsedOccurrenceIds: readonly OccurrenceRef[],
): ViewDocument {
  for (const occurrence of Object.values(sourceView.relationOccurrences)) {
    const projected = (occurrence as RelationOccurrence).endpoints.find(
      (endpoint) => endpoint.semanticTarget !== undefined,
    );
    if (projected !== undefined) {
      throw new Error(
        `projectView refuses projection-source-projected: source endpoint of ${occurrence.id} already carries semanticTarget`,
      );
    }
  }
  const collapsed = new Set<string>(collapsedOccurrenceIds);
  const internal = classifyInternalRelations(sourceView, document, collapsed);
  const relationOccurrences: Record<string, RelationOccurrence> = {};
  for (const key of Object.keys(sourceView.relationOccurrences).sort()) {
    const occurrence = sourceView.relationOccurrences[key] as RelationOccurrence;
    if (internal.has(occurrence.id)) {
      relationOccurrences[key] = {
        id: occurrence.id,
        relation: occurrence.relation,
        endpoints: occurrence.endpoints.map((endpoint) => ({
          role: endpoint.role,
          occurrence: endpoint.occurrence,
        })),
        ...(occurrence.waypoints === undefined
          ? {}
          : { waypoints: occurrence.waypoints.map((point) => ({ ...point })) }),
        ...(occurrence.strokeStyle === undefined ? {} : { strokeStyle: occurrence.strokeStyle }),
      };
      continue;
    }
    const endpoints: RelationOccurrenceEndpoint[] = occurrence.endpoints.map((endpoint) => {
      const original = endpoint.occurrence;
      const isRelation = sourceView.relationOccurrences[original] !== undefined;
      const hidden = isRelation ? internal.has(original) : hiddenByFold(sourceView, collapsed, original);
      if (!hidden) return { role: endpoint.role, occurrence: original };
      const representative: OccurrenceRef = isRelation
        ? (internal.get(original) as OccurrenceRef)
        : sourceView.portOccurrences[original] !== undefined
          ? portRepresentativeOf(sourceView, document, collapsed, original)
          : representativeOf(sourceView, collapsed, original);
      const drawn = drawnTargetOf(sourceView, original);
      const semantic =
        drawn === undefined ? undefined : semanticTargetFor(document, occurrence.relation, endpoint.role, drawn);
      if (semantic === undefined) return { role: endpoint.role, occurrence: original };
      return {
        role: endpoint.role,
        occurrence: representative,
        semanticTarget: semantic,
        sourceOccurrence: original,
      };
    });
    relationOccurrences[key] = {
      id: occurrence.id,
      relation: occurrence.relation,
      endpoints,
      ...(occurrence.waypoints === undefined
        ? {}
        : { waypoints: occurrence.waypoints.map((point) => ({ ...point })) }),
      ...(occurrence.strokeStyle === undefined ? {} : { strokeStyle: occurrence.strokeStyle }),
    };
  }
  return {
    ...sourceView,
    relationOccurrences,
    groups: stampGroups(sourceView, collapsed),
    filters: [...sourceView.filters],
    ...(sourceView.summaryLabels === undefined ? {} : { summaryLabels: { ...sourceView.summaryLabels } }),
    revision: sourceView.revision,
  };
}

/** Apply default folds when a view is first built: stamp exactly the given set. */
export function applyDefaultFolds(view: ViewDocument, defaults: readonly OccurrenceRef[]): ViewDocument {
  return { ...view, groups: stampGroups(view, new Set<string>(defaults)), revision: view.revision };
}

/** Expand every fold group; a view change that retains the revision. */
export function expandAll(view: ViewDocument): ViewDocument {
  return { ...view, groups: stampGroups(view, new Set<string>()), revision: view.revision };
}

/** Collapse every fold group whose occurrence has at least one child occurrence. */
export function collapseAll(view: ViewDocument): ViewDocument {
  const withChild = new Set<string>();
  for (const id of Object.keys(view.entityOccurrences)) {
    const parent = parentOccurrenceOf(view, id as OccurrenceRef);
    if (parent !== undefined) withChild.add(parent);
  }
  const collapsed = new Set<string>();
  for (const [key, group] of Object.entries(view.groups)) {
    if (group.occurrence !== undefined && withChild.has(group.occurrence)) collapsed.add(group.occurrence);
    void key;
  }
  return { ...view, groups: stampGroups(view, collapsed), revision: view.revision };
}

export interface FoldedSceneExclusion {
  readonly occurrence: OccurrenceRef;
  readonly kind: "group-collapsed" | "endpoint-hidden";
  readonly reason: "fold" | "filter";
  readonly cause?: "fold" | "filter";
}

export interface FoldedScene {
  readonly groupCollapsed: readonly OccurrenceRef[];
  readonly endpointHidden: readonly OccurrenceRef[];
  readonly drawnRelations: readonly OccurrenceRef[];
  readonly exclusions: readonly FoldedSceneExclusion[];
}

export interface FoldFilterState {
  readonly hiddenByFilter?: readonly OccurrenceRef[];
}

/**
 * Scene exclusions of a folded view (§4.4.6/§4.4.7). Hidden occurrences are
 * reported, never silently dropped; a relation already excluded by a filter
 * is still projected, so clearing either cause restores the drawing without
 * touching the other. Fold takes precedence with the filter cause retained.
 */
export function foldedScene(
  view: ViewDocument,
  document: SemanticDocument,
  collapsedOccurrenceIds?: readonly OccurrenceRef[],
  filters?: FoldFilterState,
): FoldedScene {
  const collapsed =
    collapsedOccurrenceIds === undefined
      ? new Set<string>(
          Object.values(view.groups)
            .filter((group) => group.collapsed === true && group.occurrence !== undefined)
            .map((group) => group.occurrence as string),
        )
      : new Set<string>(collapsedOccurrenceIds);
  const internal = classifyInternalRelations(view, document, collapsed);
  const filterHidden = new Set<string>(filters?.hiddenByFilter ?? []);
  const originalOf = (endpoint: RelationOccurrenceEndpoint): OccurrenceRef =>
    endpoint.sourceOccurrence ?? endpoint.occurrence;
  const groupCollapsed = Object.keys(view.entityOccurrences)
    .filter((key) => hiddenByFold(view, collapsed, key as OccurrenceRef))
    .sort()
    .map((key) => key as OccurrenceRef);
  const portHidden = Object.keys(view.portOccurrences)
    .filter((key) => hiddenByFold(view, collapsed, key as OccurrenceRef))
    .sort()
    .map((key) => key as OccurrenceRef);
  const endpointHidden = Object.keys(view.relationOccurrences)
    .filter((key) => internal.has(key as OccurrenceRef))
    .sort()
    .map((key) => key as OccurrenceRef);
  const drawnRelations = Object.keys(view.relationOccurrences)
    .filter((key) => !internal.has(key as OccurrenceRef))
    .sort()
    .map((key) => key as OccurrenceRef);
  const exclusions: FoldedSceneExclusion[] = [];
  for (const id of [...groupCollapsed, ...portHidden]) {
    exclusions.push({
      occurrence: id,
      kind: "group-collapsed",
      reason: "fold",
      ...(filterHidden.has(id) ? { cause: "filter" as const } : {}),
    });
  }
  for (const key of Object.keys(view.relationOccurrences).sort()) {
    const occurrence = view.relationOccurrences[key] as RelationOccurrence;
    const id = key as OccurrenceRef;
    const foldExcluded = internal.has(id);
    const filterExcluded = occurrence.endpoints.some((endpoint) => filterHidden.has(originalOf(endpoint)));
    const projected = occurrence.endpoints.some((endpoint) => endpoint.semanticTarget !== undefined);
    // One exclusion per occurrence: fold takes precedence with the filter
    // cause retained when an endpoint is hidden by both (§4.4.6). A projected
    // relation hidden only by a filter stays excluded without re-projection.
    if (foldExcluded && filterExcluded) {
      exclusions.push({ occurrence: id, kind: "endpoint-hidden", reason: "fold", cause: "filter" });
    } else if (foldExcluded) {
      exclusions.push({ occurrence: id, kind: "endpoint-hidden", reason: "fold" });
    } else if (filterExcluded && projected) {
      exclusions.push({ occurrence: id, kind: "endpoint-hidden", reason: "fold", cause: "filter" });
    } else if (filterExcluded) {
      exclusions.push({ occurrence: id, kind: "endpoint-hidden", reason: "filter" });
    }
  }
  return { groupCollapsed, endpointHidden, drawnRelations, exclusions };
}

export interface ActiveSummary {
  readonly key: string;
  readonly definitionId: string;
  readonly label: string;
  readonly members: readonly OccurrenceRef[];
  readonly relationIds: readonly RelationRef[];
}

/** Occurrence subtree rooted at an occurrence through the view fold groups. */
function occurrenceScope(view: ViewDocument, root: OccurrenceRef): ReadonlySet<string> {
  const scope = new Set<string>([root]);
  const ownerScope = new Map<string, string>();
  for (const [key, port] of Object.entries(view.portOccurrences)) {
    ownerScope.set(key, port.ownerOccurrence);
  }
  let grown = true;
  while (grown) {
    grown = false;
    for (const key of Object.keys(view.entityOccurrences)) {
      if (scope.has(key)) continue;
      const parent = parentOccurrenceOf(view, key as OccurrenceRef);
      if (parent !== undefined && scope.has(parent)) {
        scope.add(key);
        grown = true;
      }
    }
  }
  for (const [portId, owner] of ownerScope) {
    if (scope.has(owner)) scope.add(portId);
  }
  return scope;
}

interface SummaryCandidate {
  readonly occurrence: OccurrenceRef;
  readonly relation: RelationRef;
  readonly style: "solid" | "dashed";
}

/** Binary candidate occurrences whose ordered endpoints lie in the two scopes. */
function summaryCandidates(
  view: ViewDocument,
  source: OccurrenceRef,
  target: OccurrenceRef,
  style: "solid" | "dashed",
): SummaryCandidate[] {
  const sourceScope = occurrenceScope(view, source);
  const targetScope = occurrenceScope(view, target);
  const found: SummaryCandidate[] = [];
  for (const key of Object.keys(view.relationOccurrences).sort()) {
    const occurrence = view.relationOccurrences[key] as RelationOccurrence;
    if (occurrence.endpoints.length !== 2) continue;
    if ((occurrence.strokeStyle ?? "solid") !== style) continue;
    const [first, second] = occurrence.endpoints as [RelationOccurrenceEndpoint, RelationOccurrenceEndpoint];
    const firstOriginal = first.sourceOccurrence ?? first.occurrence;
    const secondOriginal = second.sourceOccurrence ?? second.occurrence;
    const directed = first.role !== second.role;
    const ordered =
      sourceScope.has(firstOriginal) && targetScope.has(secondOriginal);
    const swapped =
      !directed && sourceScope.has(secondOriginal) && targetScope.has(firstOriginal);
    if (!ordered && !swapped) continue;
    found.push({ occurrence: key as OccurrenceRef, relation: occurrence.relation, style });
  }
  return found;
}

export type SummaryCheck =
  | "summary-constituents-mismatch"
  | "summary-duplicate-key"
  | "summary-occurrence-ambiguous"
  | "summary-active-key-conflict";

export interface SummaryIssue {
  readonly id: string;
  readonly check: SummaryCheck;
  readonly firstId?: string;
  readonly relationId?: RelationRef;
  readonly sourceRepresentative?: OccurrenceRef;
  readonly targetRepresentative?: OccurrenceRef;
  readonly strokeStyle?: string;
}

export interface SummaryAnalysis {
  /** At most one source-validity issue per definition, in UTF-16 id order. */
  readonly sourceIssues: readonly SummaryIssue[];
  /** Active-key conflicts, in UTF-16 id order (one per loser). */
  readonly conflicts: readonly SummaryIssue[];
  /** Winning active summaries by aggregate key. */
  readonly actives: ReadonlyMap<string, ActiveSummary>;
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

/**
 * Full summary analysis (§4.5.1/§4.5.2): source validity of every definition,
 * then activation after occurrence projection with at most one candidate per
 * active key. A source-valid inactive definition reports nothing.
 */
export function analyzeSummaries(view: ViewDocument, document: SemanticDocument): SummaryAnalysis {
  const definitions = view.summaryLabels ?? {};
  const sourceIssues: SummaryIssue[] = [];
  const invalid = new Set<string>();
  const seenTriples = new Map<string, string>();
  const validSelections = new Map<string, OccurrenceRef[]>();
  for (const id of Object.keys(definitions).sort()) {
    const definition = definitions[id] as SummaryDefinition;
    const style = definition.strokeStyle ?? "solid";
    const triple = `${definition.sourceOccurrence}\u0000${definition.targetOccurrence}\u0000${style}`;
    const firstTriple = seenTriples.get(triple);
    if (firstTriple !== undefined) {
      sourceIssues.push({ id, check: "summary-duplicate-key", firstId: firstTriple });
      invalid.add(id);
      continue;
    }
    seenTriples.set(triple, id);
    if (
      view.entityOccurrences[definition.sourceOccurrence] === undefined ||
      view.entityOccurrences[definition.targetOccurrence] === undefined
    ) {
      sourceIssues.push({ id, check: "summary-constituents-mismatch" });
      invalid.add(id);
      continue;
    }
    if (definition.relationIds.length === 0) {
      sourceIssues.push({ id, check: "summary-constituents-mismatch" });
      invalid.add(id);
      continue;
    }
    if (definition.relationOccurrences !== undefined) {
      const listed = [...definition.relationOccurrences];
      if (!arraysEqual([...listed].sort(), listed) || new Set(listed).size !== listed.length) {
        sourceIssues.push({ id, check: "summary-constituents-mismatch" });
        invalid.add(id);
        continue;
      }
      const candidates = summaryCandidates(view, definition.sourceOccurrence, definition.targetOccurrence, style);
      const candidateSet = new Set(candidates.map((candidate) => candidate.occurrence));
      if (!listed.every((member) => candidateSet.has(member))) {
        sourceIssues.push({ id, check: "summary-constituents-mismatch" });
        invalid.add(id);
        continue;
      }
      const listedRelations = sortedUnique(
        listed.map((member) => (view.relationOccurrences[member] as RelationOccurrence).relation),
      );
      const complete = listedRelations.every((relation) =>
        candidates
          .filter((candidate) => candidate.relation === relation)
          .every((candidate) => listed.includes(candidate.occurrence)),
      );
      if (!complete || !arraysEqual(definition.relationIds as readonly string[], listedRelations)) {
        sourceIssues.push({ id, check: "summary-constituents-mismatch" });
        invalid.add(id);
        continue;
      }
      validSelections.set(id, [...listed].sort() as OccurrenceRef[]);
      continue;
    }
    const candidates = summaryCandidates(view, definition.sourceOccurrence, definition.targetOccurrence, style);
    const byRelation = new Map<string, OccurrenceRef[]>();
    for (const candidate of candidates) {
      const list = byRelation.get(candidate.relation) ?? [];
      list.push(candidate.occurrence);
      byRelation.set(candidate.relation, list);
    }
    const ambiguous = [...byRelation.entries()].filter(([, list]) => list.length > 1).map(([relation]) => relation).sort()[0];
    if (ambiguous !== undefined) {
      sourceIssues.push({ id, check: "summary-occurrence-ambiguous", relationId: ambiguous as RelationRef });
      invalid.add(id);
      continue;
    }
    const selectedRelations = sortedUnique(candidates.map((candidate) => candidate.relation));
    if (!arraysEqual(definition.relationIds as readonly string[], selectedRelations)) {
      sourceIssues.push({ id, check: "summary-constituents-mismatch" });
      invalid.add(id);
      continue;
    }
    validSelections.set(
      id,
      candidates.map((candidate) => candidate.occurrence).sort() as OccurrenceRef[],
    );
  }
  const collapsed = collapsedOf(view);
  const internal = classifyInternalRelations(view, document, collapsed);
  interface Aggregate {
    members: OccurrenceRef[];
    relationIds: string[];
    projected: boolean;
  }
  const aggregates = new Map<string, Aggregate>();
  for (const key of Object.keys(view.relationOccurrences).sort()) {
    const occurrence = view.relationOccurrences[key] as RelationOccurrence;
    if (internal.has(key as OccurrenceRef)) continue;
    if (occurrence.endpoints.length !== 2) continue;
    const [first, second] = occurrence.endpoints as [RelationOccurrenceEndpoint, RelationOccurrenceEndpoint];
    const directed = first.role !== second.role;
    const ordered: [string, string] = [first.occurrence, second.occurrence];
    const pair: [string, string] =
      directed || ordered[0] <= ordered[1] ? ordered : [ordered[1], ordered[0]];
    const style = occurrence.strokeStyle ?? "solid";
    const aggregateKey = `(${pair[0]},${pair[1]},${style})`;
    const aggregate = aggregates.get(aggregateKey) ?? { members: [], relationIds: [], projected: false };
    aggregate.members.push(key as OccurrenceRef);
    if (!aggregate.relationIds.includes(occurrence.relation)) aggregate.relationIds.push(occurrence.relation);
    if (first.semanticTarget !== undefined || second.semanticTarget !== undefined) aggregate.projected = true;
    aggregates.set(aggregateKey, aggregate);
  }
  for (const aggregate of aggregates.values()) {
    aggregate.members.sort();
    aggregate.relationIds.sort();
  }
  const active = new Map<string, ActiveSummary>();
  const winners = new Map<string, { id: string; definition: SummaryDefinition }[]>();
  for (const id of Object.keys(definitions).sort()) {
    if (invalid.has(id)) continue;
    const definition = definitions[id] as SummaryDefinition;
    const style = definition.strokeStyle ?? "solid";
    const sourceRep = representativeOfEndpoint(view, document, collapsed, internal, definition.sourceOccurrence);
    const targetRep = representativeOfEndpoint(view, document, collapsed, internal, definition.targetOccurrence);
    const key = `(${sourceRep},${targetRep},${style})`;
    const aggregate = aggregates.get(key);
    if (aggregate === undefined || !aggregate.projected) continue;
    const selected = validSelections.get(id) as OccurrenceRef[];
    if (selected.length !== aggregate.members.length) continue;
    if (!selected.every((member, index) => member === aggregate.members[index])) continue;
    const definitionRelations = [...definition.relationIds].sort();
    if (aggregate.relationIds.length !== definitionRelations.length) continue;
    if (!aggregate.relationIds.every((relation, index) => relation === definitionRelations[index])) continue;
    const list = winners.get(key) ?? [];
    list.push({ id, definition });
    winners.set(key, list);
  }
  const conflicts: SummaryIssue[] = [];
  for (const [key, list] of [...winners.entries()].sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  )) {
    const ordered = [...list].sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
    const winner = ordered[0] as { id: string; definition: SummaryDefinition };
    const aggregate = aggregates.get(key) as Aggregate;
    active.set(key, {
      key,
      definitionId: winner.id,
      label: winner.definition.label,
      members: [...aggregate.members],
      relationIds: [...aggregate.relationIds] as RelationRef[],
    });
    for (const loser of ordered.slice(1)) {
      const style = loser.definition.strokeStyle ?? "solid";
      const sourceRep = representativeOfEndpoint(view, document, collapsed, internal, loser.definition.sourceOccurrence);
      const targetRep = representativeOfEndpoint(view, document, collapsed, internal, loser.definition.targetOccurrence);
      conflicts.push({
        id: loser.id,
        check: "summary-active-key-conflict",
        firstId: winner.id,
        sourceRepresentative: sourceRep,
        targetRepresentative: targetRep,
        strokeStyle: style,
      });
    }
  }
  conflicts.sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  return { sourceIssues, conflicts, actives: active };
}

/**
 * Resolved active summaries of a folded view (§4.5.2): at most one authored
 * label per drawn binary aggregate key. Definitions remain retained
 * unchanged; partial overlaps stay inactive.
 */
export function resolveSummaries(view: ViewDocument, document: SemanticDocument): Map<string, ActiveSummary> {
  return new Map(analyzeSummaries(view, document).actives);
}

function representativeOfEndpoint(
  view: ViewDocument,
  document: SemanticDocument,
  collapsed: ReadonlySet<string>,
  internal: ReadonlyMap<OccurrenceRef, OccurrenceRef>,
  id: OccurrenceRef,
): OccurrenceRef {
  if (view.relationOccurrences[id] !== undefined) return internal.get(id) ?? id;
  if (view.portOccurrences[id] !== undefined) return portRepresentativeOf(view, document, collapsed, id);
  if (view.entityOccurrences[id] !== undefined) return representativeOf(view, collapsed, id);
  return id;
}

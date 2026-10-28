/**
 * Commands and transactions (SPEC 3.5).
 *
 * A transaction takes `(document, views, revision)` and returns either a new
 * state with its effects and its inverse, or a refusal with diagnostics. Four
 * rules, each of them tested:
 *
 *   1. NO PARTIAL SUCCESS. Commands are applied to a working copy; the FINAL
 *      state is validated once; any structural refusal or any validation error
 *      throws the whole working copy away. The caller's state is never mutated -
 *      every update here is a fresh object.
 *   2. REVISION CONFLICT IS EXPLICIT. `baseRevision` must be the state's
 *      revision. Otherwise `revision-conflict`, carrying `expected` (the state's)
 *      and `seen` (the command's).
 *   3. AN INVERSE, OR A REASON. Every command of this lot returns a logical
 *      inverse built from the PRE-IMAGE it captured. The `non-invertible` branch
 *      is not decoration: a cascade whose inverse would exceed the declared
 *      `inverseBudget` returns it, with the budget in the reason, because an
 *      unbounded inverse is an unbounded memory cost on the host's undo stack.
 *   4. NO SILENT POLICY. Deleting an entity requires an explicit policy for its
 *      occurrences, its relations and its ports - the type makes the field
 *      mandatory, and a malformed one is `delete-policy-required` at runtime.
 *
 * REVISION SEMANTICS. One counter for the whole state: a transaction bumps
 * `document.revision` by one and stamps every view it touched with that new
 * revision. A view is therefore never ahead of its document
 * (`revision-divergence`). Undo is a NEW transaction against the current
 * revision, never a rewrite of history, so after command + inverse the content
 * is identical and the revision is two ahead. That is why the byte-for-byte
 * comparison is made on `serialiseContent` (revisions normalised) and the
 * revision is asserted separately.
 */

import type { AttributeValue } from "./attributes.js";
import { type Diagnostic, diagnostic } from "./diagnostics.js";
import {
  type Entity,
  type ExtensionScope,
  type PreservedExtension,
  type Relation,
  type RelationEndpoint,
  type ResourceDescriptor,
  type SemanticDocument,
  type SemanticPort,
  sameExtensionIdentity,
} from "./document.js";
import type { PortDirection, ProfileRegistry } from "./profile.js";
import type { ExecutorProfileBindings } from "./bindings.js";
import type { EntityRef, OccurrenceRef, PortRef, RelationRef, ResourceRef, ViewRef } from "./refs.js";
import type { DiagramState } from "./state.js";
import { validateState } from "./validate.js";
import { canonicalise } from "./canonical.js";
import { reprojectRetained } from "./fold.js";
import type {
  EntityOccurrence,
  Geometry,
  Point,
  PortOccurrence,
  PortSide,
  RelationOccurrence,
  SummaryDefinition,
  ViewDocument,
  VisualGroup,
} from "./view.js";

/** No default. A caller decides what happens to the drawings and the relations. */
export type DeleteDisposition = "cascade" | "refuse";

export interface EntityDeletePolicy {
  readonly occurrences: DeleteDisposition;
  readonly relations: DeleteDisposition;
  readonly ports: DeleteDisposition;
}

export interface RelationDeletePolicy {
  readonly occurrences: DeleteDisposition;
}

export interface PortDeletePolicy {
  readonly occurrences: DeleteDisposition;
  readonly relations: DeleteDisposition;
}

export type OccurrenceInput =
  | { readonly of: "entity"; readonly occurrence: EntityOccurrence }
  | { readonly of: "relation"; readonly occurrence: RelationOccurrence }
  | { readonly of: "port"; readonly occurrence: PortOccurrence };

/** Moving means something different for the three occurrence kinds; it is explicit. */
export type Placement =
  | { readonly kind: "geometry"; readonly geometry: Geometry }
  | { readonly kind: "port"; readonly side: PortSide; readonly order: number; readonly anchor: number }
  /**
   * An ABSENT `waypoints` clears the route hint, which is not the same as an
   * empty list: `[]` says "no hint, explicitly", absence says "the renderer
   * routes it". The two produce different bytes, so the inverse restores
   * whichever of the two was there.
   */
  | { readonly kind: "waypoints"; readonly waypoints?: readonly Point[] };

/** A patch value of `null` REMOVES the attribute; absent means "leave it alone". */
export type AttributePatch = Readonly<Record<string, AttributeValue | null>>;

export type Command =
  | { readonly kind: "create-entity"; readonly entity: Entity }
  | { readonly kind: "update-entity-attributes"; readonly entity: EntityRef; readonly attributes: AttributePatch }
  | { readonly kind: "delete-entity"; readonly entity: EntityRef; readonly policy: EntityDeletePolicy }
  | { readonly kind: "create-relation"; readonly relation: Relation }
  | {
      readonly kind: "update-relation";
      readonly relation: RelationRef;
      readonly endpoints?: readonly RelationEndpoint[];
      readonly attributes?: AttributePatch;
    }
  | { readonly kind: "delete-relation"; readonly relation: RelationRef; readonly policy: RelationDeletePolicy }
  | { readonly kind: "create-port"; readonly port: SemanticPort }
  | {
      readonly kind: "update-port";
      readonly port: PortRef;
      readonly name?: string;
      readonly direction?: PortDirection;
      readonly attributes?: AttributePatch;
    }
  | { readonly kind: "delete-port"; readonly port: PortRef; readonly policy: PortDeletePolicy }
  | { readonly kind: "create-occurrence"; readonly view: ViewRef; readonly occurrence: OccurrenceInput }
  | {
      readonly kind: "move-occurrence";
      readonly view: ViewRef;
      readonly occurrence: OccurrenceRef;
      readonly placement: Placement;
    }
  | { readonly kind: "remove-occurrence"; readonly view: ViewRef; readonly occurrence: OccurrenceRef }
  | { readonly kind: "create-view"; readonly view: ViewDocument }
  | { readonly kind: "delete-view"; readonly view: ViewRef }
  | { readonly kind: "attach-resource"; readonly resource: ResourceDescriptor }
  | { readonly kind: "detach-resource"; readonly resource: ResourceRef }
  /**
   * §5.7 view-data commands. Groups, member references and summary
   * definitions are view data, so their cleanup needs commands whose
   * inverses restore every consumed field byte for byte. Hosts may use them
   * directly; the final transaction validation still owns every refusal.
   */
  | { readonly kind: "create-group"; readonly view: ViewRef; readonly group: VisualGroup }
  | { readonly kind: "remove-group"; readonly view: ViewRef; readonly group: string }
  | { readonly kind: "set-occurrence-group"; readonly view: ViewRef; readonly occurrence: OccurrenceRef; readonly group?: string }
  | { readonly kind: "set-summary-definition"; readonly view: ViewRef; readonly definition: SummaryDefinition }
  | { readonly kind: "remove-summary-definition"; readonly view: ViewRef; readonly id: string }
  | { readonly kind: "apply-preserved-extension"; readonly extension: PreservedExtension }
  /**
   * The eighteenth command, and an addition to SPEC 3.5's list of seventeen.
   * It exists because the spec demands an inverse for "appliquer une extension
   * conservee": adding an extension can only be undone by removing it, and no
   * command in the list removes one. Reported as a spec gap in the PR body.
   */
  | {
      readonly kind: "remove-preserved-extension";
      readonly namespace: string;
      readonly schemaVersion: string;
      readonly scope: ExtensionScope;
    };

export type CommandKind = Command["kind"];

/** Every command kind of this lot, in one place, so a test can assert coverage. */
export const COMMAND_KINDS: readonly CommandKind[] = [
  "create-entity",
  "update-entity-attributes",
  "delete-entity",
  "create-relation",
  "update-relation",
  "delete-relation",
  "create-port",
  "update-port",
  "delete-port",
  "create-occurrence",
  "move-occurrence",
  "remove-occurrence",
  "create-view",
  "delete-view",
  "attach-resource",
  "detach-resource",
  "apply-preserved-extension",
  "remove-preserved-extension",
  "create-group",
  "remove-group",
  "set-occurrence-group",
  "set-summary-definition",
  "remove-summary-definition",
];

export interface Transaction {
  /** Idempotence key of the submission. Echoed in the outcome, never interpreted here. */
  readonly commandId: string;
  /** The revision the author read. Compared, never adopted. */
  readonly baseRevision: number;
  /** The effective author, as the host resolved it. Authorisation is a host port. */
  readonly author?: string;
  readonly commands: readonly Command[];
}

export type Effect =
  | { readonly kind: "entity-created" | "entity-updated" | "entity-deleted"; readonly entity: EntityRef }
  | { readonly kind: "relation-created" | "relation-updated" | "relation-deleted"; readonly relation: RelationRef }
  | { readonly kind: "port-created" | "port-updated" | "port-deleted"; readonly port: PortRef }
  | {
      readonly kind: "occurrence-created" | "occurrence-moved" | "occurrence-removed";
      readonly view: ViewRef;
      readonly occurrence: OccurrenceRef;
    }
  | { readonly kind: "view-created" | "view-deleted"; readonly view: ViewRef }
  | { readonly kind: "resource-attached" | "resource-detached"; readonly resource: ResourceRef }
  | { readonly kind: "extension-applied" | "extension-removed"; readonly namespace: string; readonly schemaVersion: string }
  | { readonly kind: "revision-bumped"; readonly from: number; readonly to: number };

export type Inverse =
  | { readonly kind: "invertible"; readonly commands: readonly Command[] }
  | { readonly kind: "non-invertible"; readonly code: Diagnostic["code"]; readonly reason: string };

export type TransactionOutcome =
  | {
      readonly status: "applied";
      readonly commandId: string;
      readonly state: DiagramState;
      readonly effects: readonly Effect[];
      readonly inverse: Inverse;
    }
  | { readonly status: "rejected"; readonly commandId: string; readonly diagnostics: readonly Diagnostic[] };

export interface ApplyOptions {
  readonly registry: ProfileRegistry;
  /**
   * The `executor-profile-bindings@1` table (M3 §5.3.1). Absent means the
   * retained native run for exactly the four @1 identities; completed
   * profiles require their verified scoped rows, as in validation.
   */
  readonly bindings?: ExecutorProfileBindings;
  /**
   * Maximum number of operations an inverse may carry. A cascade above it
   * returns `non-invertible` rather than materialising an unbounded undo entry.
   * Bounded by default, like every collection in this package.
   */
  readonly inverseBudget?: number;
}

export const DEFAULT_INVERSE_BUDGET = 10_000;

// --- immutable record helpers -------------------------------------------------

function withKey<T>(record: Readonly<Record<string, T>>, key: string, value: T): Readonly<Record<string, T>> {
  return { ...record, [key]: value };
}

function withoutKey<T>(record: Readonly<Record<string, T>>, key: string): Readonly<Record<string, T>> {
  const copy: Record<string, T> = { ...record };
  delete copy[key];
  return copy;
}

function patchAttributes(
  current: Readonly<Record<string, AttributeValue>>,
  patch: AttributePatch,
): { readonly next: Readonly<Record<string, AttributeValue>>; readonly inverse: AttributePatch } {
  const next: Record<string, AttributeValue> = { ...current };
  const inverse: Record<string, AttributeValue | null> = {};
  for (const name of Object.keys(patch).sort()) {
    const value = patch[name] as AttributeValue | null;
    const previous = current[name];
    inverse[name] = previous === undefined ? null : previous;
    if (value === null) delete next[name];
    else next[name] = value;
  }
  return { next, inverse };
}

const isDisposition = (value: unknown): value is DeleteDisposition => value === "cascade" || value === "refuse";

// --- §5.7 fold and summary cleanup -------------------------------------------

/** The §5.7 view-data cleanup of one view after a removal, with its pre-images. */
interface FoldCleanup {
  readonly entityOccurrences: Readonly<Record<string, EntityOccurrence>>;
  readonly groups: Readonly<Record<string, VisualGroup>>;
  readonly droppedGroups: readonly VisualGroup[];
  readonly clearedRefs: readonly { readonly occurrence: OccurrenceRef; readonly previous: string }[];
  readonly summaryLabels: Readonly<Record<string, SummaryDefinition>> | undefined;
  readonly restoredSummaries: readonly SummaryDefinition[];
}

/**
 * Dependency-aware view-data cleanup (§5.7) over a view whose occurrences
 * were already removed: drop fold groups bound to a removed occurrence,
 * clear member references to dropped groups, and prune summary definitions
 * that lost their scope root, their selected occurrences or their semantic
 * relations. Empty definitions disappear; the rest is revalidated by the
 * transaction, which refuses atomically on any remaining violation.
 */
function cleanFoldBindings(
  view: ViewDocument,
  removedOccurrences: ReadonlySet<string>,
  removedRelations: ReadonlySet<string>,
): FoldCleanup {
  let groups = view.groups;
  const droppedGroups: VisualGroup[] = [];
  for (const key of Object.keys(view.groups).sort()) {
    const group = view.groups[key] as VisualGroup;
    if (group.occurrence !== undefined && removedOccurrences.has(group.occurrence)) {
      droppedGroups.push(group);
      groups = withoutKey(groups, key);
    }
  }
  const liveGroups = new Set(Object.keys(groups));
  let entityOccurrences = view.entityOccurrences;
  const clearedRefs: { occurrence: OccurrenceRef; previous: string }[] = [];
  for (const key of Object.keys(view.entityOccurrences).sort()) {
    const occurrence = view.entityOccurrences[key] as EntityOccurrence;
    if (occurrence.group !== undefined && !liveGroups.has(occurrence.group)) {
      clearedRefs.push({ occurrence: occurrence.id, previous: occurrence.group });
      const { group: _cleared, ...rest } = occurrence;
      void _cleared;
      entityOccurrences = withKey(entityOccurrences, key, rest);
    }
  }
  const previous = view.summaryLabels;
  let summaryLabels = previous;
  const restoredSummaries: SummaryDefinition[] = [];
  if (previous !== undefined) {
    const kept: Record<string, SummaryDefinition> = {};
    for (const id of Object.keys(previous).sort()) {
      const definition = previous[id] as SummaryDefinition;
      if (removedOccurrences.has(definition.sourceOccurrence) || removedOccurrences.has(definition.targetOccurrence)) {
        restoredSummaries.push(definition);
        continue;
      }
      const prunedOccurrences = definition.relationOccurrences?.filter((member) => !removedOccurrences.has(member));
      const prunedIds = definition.relationIds.filter((relation) => !removedRelations.has(relation));
      if (
        prunedIds.length === 0 ||
        (definition.relationOccurrences !== undefined && (prunedOccurrences as OccurrenceRef[]).length === 0)
      ) {
        restoredSummaries.push(definition);
        continue;
      }
      if (
        (prunedOccurrences !== undefined &&
          prunedOccurrences.length !== (definition.relationOccurrences as readonly OccurrenceRef[]).length) ||
        prunedIds.length !== definition.relationIds.length
      ) {
        restoredSummaries.push(definition);
        kept[id] = {
          ...definition,
          relationIds: [...prunedIds],
          ...(prunedOccurrences === undefined ? {} : { relationOccurrences: [...(prunedOccurrences as OccurrenceRef[])] }),
        };
        continue;
      }
      kept[id] = definition;
    }
    if (restoredSummaries.length > 0) {
      summaryLabels = Object.keys(kept).length === 0 ? undefined : kept;
    }
  }
  return { entityOccurrences, groups, droppedGroups, clearedRefs, summaryLabels, restoredSummaries };
}

/** The view with the cleanup applied, omitting an emptied summary record. */
function cleanedView(
  view: ViewDocument,
  cleanup: FoldCleanup,
  relationOccurrences: Readonly<Record<string, RelationOccurrence>>,
): ViewDocument {
  const base = {
    ...view,
    entityOccurrences: cleanup.entityOccurrences,
    relationOccurrences,
    groups: cleanup.groups,
  };
  if (cleanup.summaryLabels === undefined) {
    const { summaryLabels: _dropped, ...rest } = base;
    void _dropped;
    return rest;
  }
  return { ...base, summaryLabels: cleanup.summaryLabels };
}

/** Inverse commands restoring every field the cleanup consumed, in undo order. */
function restoreFoldCleanupInverse(view: ViewRef, cleanup: FoldCleanup): Command[] {
  const inverse: Command[] = [];
  for (const definition of cleanup.restoredSummaries) {
    inverse.push({ kind: "set-summary-definition", view, definition });
  }
  for (const ref of cleanup.clearedRefs) {
    inverse.push({ kind: "set-occurrence-group", view, occurrence: ref.occurrence, group: ref.previous });
  }
  for (const group of cleanup.droppedGroups) {
    inverse.push({ kind: "create-group", view, group });
  }
  return inverse;
}

// --- removal closure ---------------------------------------------------------

interface RemovalPlan {
  readonly entities: readonly EntityRef[];
  readonly ports: readonly PortRef[];
  readonly relations: readonly RelationRef[];
  /** Per view reference, the occurrence ids the removal takes with it. */
  readonly occurrences: Readonly<Record<string, readonly OccurrenceRef[]>>;
}

/**
 * The transitive closure of a removal: the ports an entity owns, the relations
 * that touch any removed element, and every occurrence that draws any of them -
 * including the port occurrences hanging off a removed entity occurrence and the
 * relation occurrences attached to a removed occurrence. Computed BEFORE
 * anything is removed, so the inverse can be built from it.
 */
function planRemoval(
  state: DiagramState,
  seed: { readonly entities?: readonly EntityRef[]; readonly ports?: readonly PortRef[]; readonly relations?: readonly RelationRef[] },
): RemovalPlan {
  const document = state.document;
  const entities = new Set<string>(seed.entities ?? []);
  const ports = new Set<string>(seed.ports ?? []);
  const relations = new Set<string>(seed.relations ?? []);

  for (const port of Object.values(document.ports)) {
    if (entities.has(port.owner)) ports.add(port.id);
  }
  // Relation closure to a fixpoint: a relation is taken when any endpoint
  // targets a removed element, including a removed relation (relation-target
  // chains, §3.9.1) and anything they in turn touch.
  let relationGrown = true;
  while (relationGrown) {
    relationGrown = false;
    for (const relation of Object.values(document.relations)) {
      if (relations.has(relation.id)) continue;
      if (
        relation.endpoints.some(
          (endpoint) => entities.has(endpoint.target) || ports.has(endpoint.target) || relations.has(endpoint.target),
        )
      ) {
        relations.add(relation.id);
        relationGrown = true;
      }
    }
  }

  // Occurrence closure to a fixpoint over every view: a drawing goes when it
  // draws a removed element, hangs off a removed drawing, attaches to a
  // removed drawing, or carries provenance from one (folded projections keep
  // their origin, §4.4.2, so removing the origin takes the projection).
  const removedByView = new Map<string, Set<string>>();
  for (const [viewKey] of Object.entries(state.views)) removedByView.set(viewKey, new Set<string>());
  let occurrenceGrown = true;
  while (occurrenceGrown) {
    occurrenceGrown = false;
    for (const [viewKey, view] of Object.entries(state.views)) {
      const removed = removedByView.get(viewKey) as Set<string>;
      for (const occurrence of Object.values(view.entityOccurrences)) {
        if (!removed.has(occurrence.id) && entities.has(occurrence.entity)) {
          removed.add(occurrence.id);
          occurrenceGrown = true;
        }
      }
      for (const occurrence of Object.values(view.portOccurrences)) {
        if (!removed.has(occurrence.id) && (ports.has(occurrence.port) || removed.has(occurrence.ownerOccurrence))) {
          removed.add(occurrence.id);
          occurrenceGrown = true;
        }
      }
      for (const occurrence of Object.values(view.relationOccurrences)) {
        if (removed.has(occurrence.id)) continue;
        if (
          relations.has(occurrence.relation) ||
          occurrence.endpoints.some(
            (endpoint) => removed.has(endpoint.occurrence) || (endpoint.sourceOccurrence !== undefined && removed.has(endpoint.sourceOccurrence)),
          )
        ) {
          removed.add(occurrence.id);
          occurrenceGrown = true;
        }
      }
    }
  }

  const occurrences: Record<string, readonly OccurrenceRef[]> = {};
  for (const [viewKey, removed] of removedByView) {
    if (removed.size > 0) {
      occurrences[viewKey] = [...removed].sort().map((id) => id as OccurrenceRef);
    }
  }

  return {
    entities: [...entities].sort().map((id) => id as EntityRef),
    ports: [...ports].sort().map((id) => id as PortRef),
    relations: [...relations].sort().map((id) => id as RelationRef),
    occurrences,
  };
}

interface AppliedRemoval {
  readonly state: DiagramState;
  readonly effects: readonly Effect[];
  readonly inverse: readonly Command[];
  readonly touchedViews: readonly ViewRef[];
}

function applyRemoval(state: DiagramState, plan: RemovalPlan): AppliedRemoval {
  const effects: Effect[] = [];
  const inverse: Command[] = [];

  let entities = state.document.entities;
  let ports = state.document.ports;
  let relations = state.document.relations;

  // The inverse re-creates in dependency order: entities, then their ports,
  // then the relations between them, then the drawings.
  for (const ref of plan.entities) {
    const entity = entities[ref];
    if (entity === undefined) continue;
    inverse.push({ kind: "create-entity", entity });
    entities = withoutKey(entities, ref);
    effects.push({ kind: "entity-deleted", entity: ref });
  }
  for (const ref of plan.ports) {
    const port = ports[ref];
    if (port === undefined) continue;
    inverse.push({ kind: "create-port", port });
    ports = withoutKey(ports, ref);
    effects.push({ kind: "port-deleted", port: ref });
  }
  for (const ref of plan.relations) {
    const relation = relations[ref];
    if (relation === undefined) continue;
    inverse.push({ kind: "create-relation", relation });
    relations = withoutKey(relations, ref);
    effects.push({ kind: "relation-deleted", relation: ref });
  }

  const views: Record<string, ViewDocument> = { ...state.views };
  const touchedViews: ViewRef[] = [];
  const removedRelations = new Set<string>(plan.relations);
  for (const [viewKey, removedIds] of Object.entries(plan.occurrences)) {
    const view = views[viewKey];
    if (view === undefined) continue;
    let entityOccurrences = view.entityOccurrences;
    let relationOccurrences = view.relationOccurrences;
    let portOccurrences = view.portOccurrences;
    const viewRef = viewKey as ViewRef;
    // Order is irrelevant here, and deliberately so: a `create-occurrence` has
    // no structural precondition on the occurrences it points at, and the
    // transaction validates the FINAL state once. Sorted ids keep the inverse
    // itself deterministic, which the byte-for-byte tests rely on.
    for (const id of removedIds) {
      const relationOccurrence = relationOccurrences[id];
      if (relationOccurrence !== undefined) {
        inverse.push({ kind: "create-occurrence", view: viewRef, occurrence: { of: "relation", occurrence: relationOccurrence } });
        relationOccurrences = withoutKey(relationOccurrences, id);
        effects.push({ kind: "occurrence-removed", view: viewRef, occurrence: id });
        continue;
      }
      const portOccurrence = portOccurrences[id];
      if (portOccurrence !== undefined) {
        inverse.push({ kind: "create-occurrence", view: viewRef, occurrence: { of: "port", occurrence: portOccurrence } });
        portOccurrences = withoutKey(portOccurrences, id);
        effects.push({ kind: "occurrence-removed", view: viewRef, occurrence: id });
        continue;
      }
      const entityOccurrence = entityOccurrences[id];
      if (entityOccurrence !== undefined) {
        inverse.push({ kind: "create-occurrence", view: viewRef, occurrence: { of: "entity", occurrence: entityOccurrence } });
        entityOccurrences = withoutKey(entityOccurrences, id);
        effects.push({ kind: "occurrence-removed", view: viewRef, occurrence: id });
      }
    }
    // §5.7: a removal also cleans the fold bindings and summary definitions
    // that named a removed drawing or relation, then reprojects the surviving
    // projected endpoints from their retained origins. Surviving occurrences
    // whose projection went stale are replaced (remove plus re-create), so
    // the inverse captures their pre-images with existing commands.
    const cleanup = cleanFoldBindings(
      { ...view, entityOccurrences, relationOccurrences, portOccurrences },
      new Set<string>(removedIds),
      removedRelations,
    );
    const candidate = cleanedView(
      { ...view, entityOccurrences, relationOccurrences, portOccurrences },
      cleanup,
      relationOccurrences,
    );
    const repaired = reprojectRetained(candidate, state.document);
    const staleIds: OccurrenceRef[] = [];
    for (const key of Object.keys(candidate.relationOccurrences).sort()) {
      if (canonicalise(repaired.relationOccurrences[key]) !== canonicalise(candidate.relationOccurrences[key])) {
        staleIds.push(key as OccurrenceRef);
      }
    }
    inverse.push(...restoreFoldCleanupInverse(viewRef, cleanup));
    for (const id of staleIds) {
      inverse.push({ kind: "remove-occurrence", view: viewRef, occurrence: id });
      effects.push({ kind: "occurrence-removed", view: viewRef, occurrence: id });
    }
    for (const id of staleIds) {
      inverse.push({
        kind: "create-occurrence",
        view: viewRef,
        occurrence: { of: "relation", occurrence: candidate.relationOccurrences[id] as RelationOccurrence },
      });
      effects.push({ kind: "occurrence-created", view: viewRef, occurrence: id });
    }
    views[viewKey] = repaired;
    touchedViews.push(viewRef);
  }

  return {
    state: { document: { ...state.document, entities, ports, relations }, views },
    effects,
    inverse,
    touchedViews,
  };
}

// --- single command ----------------------------------------------------------

interface CommandApplication {
  readonly state: DiagramState;
  readonly effects: readonly Effect[];
  readonly inverse: readonly Command[];
  readonly touchedViews: readonly ViewRef[];
}

type CommandResult = { readonly applied: CommandApplication } | { readonly diagnostics: readonly Diagnostic[] };

const missing = (path: string, message: string, refs: readonly string[]): CommandResult => ({
  diagnostics: [diagnostic({ code: "target-missing", path, message, refs })],
});

const exists = (path: string, message: string, refs: readonly string[]): CommandResult => ({
  diagnostics: [diagnostic({ code: "target-already-exists", path, message, refs })],
});

function withDocument(state: DiagramState, document: SemanticDocument): DiagramState {
  return { document, views: state.views };
}

function applyOne(state: DiagramState, command: Command, index: number): CommandResult {
  const path = `commands[${index}]`;
  const document = state.document;

  switch (command.kind) {
    case "create-entity": {
      const ref = command.entity.id;
      if (document.entities[ref] !== undefined) {
        return exists(path, `entity ${ref} already exists`, [ref]);
      }
      return {
        applied: {
          state: withDocument(state, { ...document, entities: withKey(document.entities, ref, command.entity) }),
          effects: [{ kind: "entity-created", entity: ref }],
          inverse: [
            // Nothing else can reference it yet, so a cascading delete restores
            // exactly the pre-image.
            { kind: "delete-entity", entity: ref, policy: { occurrences: "cascade", relations: "cascade", ports: "cascade" } },
          ],
          touchedViews: [],
        },
      };
    }

    case "update-entity-attributes": {
      const entity = document.entities[command.entity];
      if (entity === undefined) return missing(path, `entity ${command.entity} does not exist`, [command.entity]);
      const patched = patchAttributes(entity.attributes, command.attributes);
      return {
        applied: {
          state: withDocument(state, {
            ...document,
            entities: withKey(document.entities, command.entity, { ...entity, attributes: patched.next }),
          }),
          effects: [{ kind: "entity-updated", entity: command.entity }],
          inverse: [{ kind: "update-entity-attributes", entity: command.entity, attributes: patched.inverse }],
          touchedViews: [],
        },
      };
    }

    case "delete-entity": {
      const entity = document.entities[command.entity];
      if (entity === undefined) return missing(path, `entity ${command.entity} does not exist`, [command.entity]);
      const policy = command.policy as Partial<EntityDeletePolicy> | undefined;
      if (
        policy === undefined ||
        !isDisposition(policy.occurrences) ||
        !isDisposition(policy.relations) ||
        !isDisposition(policy.ports)
      ) {
        // SPEC 3.4: deleting an entity demands an explicit policy for its
        // occurrences and relations. There is no default, at the type level and
        // at runtime.
        return {
          diagnostics: [
            diagnostic({
              code: "delete-policy-required",
              path: `${path}.policy`,
              message:
                "deleting an entity requires an explicit policy for occurrences, relations and ports; each is 'cascade' or 'refuse'",
              refs: [command.entity],
            }),
          ],
        };
      }
      const plan = planRemoval(state, { entities: [command.entity] });
      const refused: Diagnostic[] = [];
      if (policy.relations === "refuse" && plan.relations.length > 0) {
        refused.push(
          diagnostic({
            code: "delete-policy-refused",
            path: `${path}.policy.relations`,
            message: `entity ${command.entity} carries ${plan.relations.length} relations and the policy refuses a cascade`,
            refs: [command.entity, ...plan.relations],
            details: { relations: plan.relations.length },
          }),
        );
      }
      if (policy.ports === "refuse" && plan.ports.length > 0) {
        refused.push(
          diagnostic({
            code: "delete-policy-refused",
            path: `${path}.policy.ports`,
            message: `entity ${command.entity} owns ${plan.ports.length} ports and the policy refuses a cascade`,
            refs: [command.entity, ...plan.ports],
            details: { ports: plan.ports.length },
          }),
        );
      }
      const occurrenceCount = Object.values(plan.occurrences).reduce((total, list) => total + list.length, 0);
      if (policy.occurrences === "refuse" && occurrenceCount > 0) {
        refused.push(
          diagnostic({
            code: "delete-policy-refused",
            path: `${path}.policy.occurrences`,
            message: `entity ${command.entity} is drawn by ${occurrenceCount} occurrences and the policy refuses a cascade`,
            refs: [command.entity],
            details: { occurrences: occurrenceCount },
          }),
        );
      }
      if (refused.length > 0) return { diagnostics: refused };
      const removal = applyRemoval(state, plan);
      return { applied: removal };
    }

    case "create-relation": {
      const ref = command.relation.id;
      if (document.relations[ref] !== undefined) return exists(path, `relation ${ref} already exists`, [ref]);
      return {
        applied: {
          state: withDocument(state, { ...document, relations: withKey(document.relations, ref, command.relation) }),
          effects: [{ kind: "relation-created", relation: ref }],
          inverse: [{ kind: "delete-relation", relation: ref, policy: { occurrences: "cascade" } }],
          touchedViews: [],
        },
      };
    }

    case "update-relation": {
      const relation = document.relations[command.relation];
      if (relation === undefined) return missing(path, `relation ${command.relation} does not exist`, [command.relation]);
      const patched = patchAttributes(relation.attributes, command.attributes ?? {});
      const next: Relation = {
        ...relation,
        ...(command.endpoints === undefined ? {} : { endpoints: command.endpoints }),
        attributes: patched.next,
      };
      return {
        applied: {
          state: withDocument(state, { ...document, relations: withKey(document.relations, command.relation, next) }),
          effects: [{ kind: "relation-updated", relation: command.relation }],
          inverse: [
            {
              kind: "update-relation",
              relation: command.relation,
              ...(command.endpoints === undefined ? {} : { endpoints: relation.endpoints }),
              attributes: patched.inverse,
            },
          ],
          touchedViews: [],
        },
      };
    }

    case "delete-relation": {
      const relation = document.relations[command.relation];
      if (relation === undefined) return missing(path, `relation ${command.relation} does not exist`, [command.relation]);
      if (!isDisposition(command.policy?.occurrences)) {
        return {
          diagnostics: [
            diagnostic({
              code: "delete-policy-required",
              path: `${path}.policy`,
              message: "deleting a relation requires an explicit policy for its occurrences ('cascade' or 'refuse')",
              refs: [command.relation],
            }),
          ],
        };
      }
      const plan = planRemoval(state, { relations: [command.relation] });
      const occurrenceCount = Object.values(plan.occurrences).reduce((total, list) => total + list.length, 0);
      if (command.policy.occurrences === "refuse" && occurrenceCount > 0) {
        return {
          diagnostics: [
            diagnostic({
              code: "delete-policy-refused",
              path: `${path}.policy.occurrences`,
              message: `relation ${command.relation} is drawn by ${occurrenceCount} occurrences and the policy refuses a cascade`,
              refs: [command.relation],
              details: { occurrences: occurrenceCount },
            }),
          ],
        };
      }
      return { applied: applyRemoval(state, plan) };
    }

    case "create-port": {
      const ref = command.port.id;
      if (document.ports[ref] !== undefined) return exists(path, `port ${ref} already exists`, [ref]);
      return {
        applied: {
          state: withDocument(state, { ...document, ports: withKey(document.ports, ref, command.port) }),
          effects: [{ kind: "port-created", port: ref }],
          inverse: [{ kind: "delete-port", port: ref, policy: { occurrences: "cascade", relations: "cascade" } }],
          touchedViews: [],
        },
      };
    }

    case "update-port": {
      const port = document.ports[command.port];
      if (port === undefined) return missing(path, `port ${command.port} does not exist`, [command.port]);
      const patched = patchAttributes(port.attributes, command.attributes ?? {});
      const next: SemanticPort = {
        ...port,
        ...(command.name === undefined ? {} : { name: command.name }),
        ...(command.direction === undefined ? {} : { direction: command.direction }),
        attributes: patched.next,
      };
      return {
        applied: {
          state: withDocument(state, { ...document, ports: withKey(document.ports, command.port, next) }),
          effects: [{ kind: "port-updated", port: command.port }],
          inverse: [
            {
              kind: "update-port",
              port: command.port,
              ...(command.name === undefined ? {} : { name: port.name }),
              ...(command.direction === undefined ? {} : { direction: port.direction }),
              attributes: patched.inverse,
            },
          ],
          touchedViews: [],
        },
      };
    }

    case "delete-port": {
      const port = document.ports[command.port];
      if (port === undefined) return missing(path, `port ${command.port} does not exist`, [command.port]);
      if (!isDisposition(command.policy?.occurrences) || !isDisposition(command.policy?.relations)) {
        return {
          diagnostics: [
            diagnostic({
              code: "delete-policy-required",
              path: `${path}.policy`,
              message: "deleting a port requires an explicit policy for its occurrences and its relations",
              refs: [command.port],
            }),
          ],
        };
      }
      const plan = planRemoval(state, { ports: [command.port] });
      const occurrenceCount = Object.values(plan.occurrences).reduce((total, list) => total + list.length, 0);
      const refused: Diagnostic[] = [];
      if (command.policy.relations === "refuse" && plan.relations.length > 0) {
        refused.push(
          diagnostic({
            code: "delete-policy-refused",
            path: `${path}.policy.relations`,
            message: `port ${command.port} carries ${plan.relations.length} relations and the policy refuses a cascade`,
            refs: [command.port, ...plan.relations],
            details: { relations: plan.relations.length },
          }),
        );
      }
      if (command.policy.occurrences === "refuse" && occurrenceCount > 0) {
        refused.push(
          diagnostic({
            code: "delete-policy-refused",
            path: `${path}.policy.occurrences`,
            message: `port ${command.port} is drawn by ${occurrenceCount} occurrences and the policy refuses a cascade`,
            refs: [command.port],
            details: { occurrences: occurrenceCount },
          }),
        );
      }
      if (refused.length > 0) return { diagnostics: refused };
      return { applied: applyRemoval(state, plan) };
    }

    case "create-occurrence": {
      const view = state.views[command.view];
      if (view === undefined) return missing(path, `view ${command.view} does not exist`, [command.view]);
      const id = command.occurrence.occurrence.id;
      if (
        view.entityOccurrences[id] !== undefined ||
        view.relationOccurrences[id] !== undefined ||
        view.portOccurrences[id] !== undefined
      ) {
        return exists(path, `occurrence ${id} already exists in view ${command.view}`, [id, command.view]);
      }
      const next: ViewDocument =
        command.occurrence.of === "entity"
          ? { ...view, entityOccurrences: withKey(view.entityOccurrences, id, command.occurrence.occurrence) }
          : command.occurrence.of === "relation"
            ? { ...view, relationOccurrences: withKey(view.relationOccurrences, id, command.occurrence.occurrence) }
            : { ...view, portOccurrences: withKey(view.portOccurrences, id, command.occurrence.occurrence) };
      return {
        applied: {
          state: { document, views: withKey(state.views, command.view, next) },
          effects: [{ kind: "occurrence-created", view: command.view, occurrence: id }],
          inverse: [{ kind: "remove-occurrence", view: command.view, occurrence: id }],
          touchedViews: [command.view],
        },
      };
    }

    case "move-occurrence": {
      const view = state.views[command.view];
      if (view === undefined) return missing(path, `view ${command.view} does not exist`, [command.view]);
      const entityOccurrence = view.entityOccurrences[command.occurrence];
      const portOccurrence = view.portOccurrences[command.occurrence];
      const relationOccurrence = view.relationOccurrences[command.occurrence];
      if (entityOccurrence === undefined && portOccurrence === undefined && relationOccurrence === undefined) {
        return missing(path, `occurrence ${command.occurrence} does not exist in view ${command.view}`, [
          command.occurrence,
          command.view,
        ]);
      }
      const mismatch = (expected: string): CommandResult => ({
        diagnostics: [
          diagnostic({
            code: "placement-kind-mismatch",
            path: `${path}.placement`,
            message: `occurrence ${command.occurrence} takes a ${expected} placement, got ${command.placement.kind}`,
            refs: [command.occurrence],
            details: { expected, seen: command.placement.kind },
          }),
        ],
      });

      if (entityOccurrence !== undefined) {
        if (command.placement.kind !== "geometry") return mismatch("geometry");
        const next: EntityOccurrence = { ...entityOccurrence, geometry: command.placement.geometry };
        return {
          applied: {
            state: {
              document,
              views: withKey(state.views, command.view, {
                ...view,
                entityOccurrences: withKey(view.entityOccurrences, command.occurrence, next),
              }),
            },
            effects: [{ kind: "occurrence-moved", view: command.view, occurrence: command.occurrence }],
            inverse: [
              {
                kind: "move-occurrence",
                view: command.view,
                occurrence: command.occurrence,
                placement: { kind: "geometry", geometry: entityOccurrence.geometry },
              },
            ],
            touchedViews: [command.view],
          },
        };
      }

      if (portOccurrence !== undefined) {
        if (command.placement.kind !== "port") return mismatch("port");
        const next: PortOccurrence = {
          ...portOccurrence,
          side: command.placement.side,
          order: command.placement.order,
          anchor: command.placement.anchor,
        };
        return {
          applied: {
            state: {
              document,
              views: withKey(state.views, command.view, {
                ...view,
                portOccurrences: withKey(view.portOccurrences, command.occurrence, next),
              }),
            },
            effects: [{ kind: "occurrence-moved", view: command.view, occurrence: command.occurrence }],
            inverse: [
              {
                kind: "move-occurrence",
                view: command.view,
                occurrence: command.occurrence,
                placement: {
                  kind: "port",
                  side: portOccurrence.side,
                  order: portOccurrence.order,
                  anchor: portOccurrence.anchor,
                },
              },
            ],
            touchedViews: [command.view],
          },
        };
      }

      const current = relationOccurrence as RelationOccurrence;
      if (command.placement.kind !== "waypoints") return mismatch("waypoints");
      const { waypoints: previousWaypoints, ...withoutWaypoints } = current;
      const next: RelationOccurrence =
        command.placement.waypoints === undefined
          ? withoutWaypoints
          : { ...current, waypoints: command.placement.waypoints };
      return {
        applied: {
          state: {
            document,
            views: withKey(state.views, command.view, {
              ...view,
              relationOccurrences: withKey(view.relationOccurrences, command.occurrence, next),
            }),
          },
          effects: [{ kind: "occurrence-moved", view: command.view, occurrence: command.occurrence }],
          inverse: [
            {
              kind: "move-occurrence",
              view: command.view,
              occurrence: command.occurrence,
              placement: {
                kind: "waypoints",
                ...(previousWaypoints === undefined ? {} : { waypoints: previousWaypoints }),
              },
            },
          ],
          touchedViews: [command.view],
        },
      };
    }

    case "remove-occurrence": {
      const view = state.views[command.view];
      if (view === undefined) return missing(path, `view ${command.view} does not exist`, [command.view]);
      if (
        view.entityOccurrences[command.occurrence] === undefined &&
        view.portOccurrences[command.occurrence] === undefined &&
        view.relationOccurrences[command.occurrence] === undefined
      ) {
        return missing(path, `occurrence ${command.occurrence} does not exist in view ${command.view}`, [
          command.occurrence,
          command.view,
        ]);
      }
      // Dependent drawings go with the named one: ports hung off a removed
      // entity occurrence, relations attached to a removed drawing, and folded
      // projections carrying a removed origin (§4.4.2 provenance). The
      // semantic entity, relation and port are untouched (study invariant 2);
      // the inverse re-creates every consumed drawing byte for byte.
      const consumed = new Set<string>([command.occurrence]);
      let consumedGrown = true;
      while (consumedGrown) {
        consumedGrown = false;
        for (const candidate of Object.values(view.portOccurrences)) {
          if (!consumed.has(candidate.id) && consumed.has(candidate.ownerOccurrence)) {
            consumed.add(candidate.id);
            consumedGrown = true;
          }
        }
        for (const candidate of Object.values(view.relationOccurrences)) {
          if (consumed.has(candidate.id)) continue;
          if (
            candidate.endpoints.some(
              (endpoint) => consumed.has(endpoint.occurrence) || (endpoint.sourceOccurrence !== undefined && consumed.has(endpoint.sourceOccurrence)),
            )
          ) {
            consumed.add(candidate.id);
            consumedGrown = true;
          }
        }
      }
      let entityOccurrences = view.entityOccurrences;
      let portOccurrences = view.portOccurrences;
      let relationOccurrences = view.relationOccurrences;
      const removed: { of: "entity" | "relation" | "port"; id: string; record: EntityOccurrence | RelationOccurrence | PortOccurrence }[] = [];
      for (const id of [...consumed].sort()) {
        const entityRemoved = entityOccurrences[id];
        if (entityRemoved !== undefined) {
          removed.push({ of: "entity", id, record: entityRemoved });
          entityOccurrences = withoutKey(entityOccurrences, id);
          continue;
        }
        const portRemoved = portOccurrences[id];
        if (portRemoved !== undefined) {
          removed.push({ of: "port", id, record: portRemoved });
          portOccurrences = withoutKey(portOccurrences, id);
          continue;
        }
        const relationRemoved = relationOccurrences[id];
        if (relationRemoved !== undefined) {
          removed.push({ of: "relation", id, record: relationRemoved });
          relationOccurrences = withoutKey(relationOccurrences, id);
        }
      }
      // §5.7: clean the fold bindings and summary definitions that named a
      // removed drawing, then reproject the surviving projected endpoints
      // from their retained origins. Stale survivors are replaced, so the
      // inverse captures their pre-images with existing commands.
      const cleanup = cleanFoldBindings(
        { ...view, entityOccurrences, relationOccurrences, portOccurrences },
        consumed,
        new Set<string>(),
      );
      const candidate = cleanedView(
        { ...view, entityOccurrences, relationOccurrences, portOccurrences },
        cleanup,
        relationOccurrences,
      );
      const repaired = reprojectRetained(candidate, document);
      const staleIds: OccurrenceRef[] = [];
      for (const key of Object.keys(candidate.relationOccurrences).sort()) {
        if (canonicalise(repaired.relationOccurrences[key]) !== canonicalise(candidate.relationOccurrences[key])) {
          staleIds.push(key as OccurrenceRef);
        }
      }
      const effects: Effect[] = [];
      for (const id of [...new Set<string>([...consumed, ...staleIds])].sort()) {
        effects.push({ kind: "occurrence-removed", view: command.view, occurrence: id as OccurrenceRef });
      }
      for (const id of staleIds) {
        effects.push({ kind: "occurrence-created", view: command.view, occurrence: id });
      }
      const inverse: Command[] = [
        ...restoreFoldCleanupInverse(command.view, cleanup),
        ...staleIds.map((id) => ({ kind: "remove-occurrence", view: command.view, occurrence: id }) as Command),
        ...staleIds.map(
          (id) =>
            ({
              kind: "create-occurrence",
              view: command.view,
              occurrence: { of: "relation", occurrence: candidate.relationOccurrences[id] as RelationOccurrence },
            }) as Command,
        ),
        ...removed.map(
          (entry) => ({ kind: "create-occurrence", view: command.view, occurrence: { of: entry.of, occurrence: entry.record } }) as Command,
        ),
      ];
      return {
        applied: {
          state: { document, views: withKey(state.views, command.view, repaired) },
          effects,
          inverse,
          touchedViews: [command.view],
        },
      };
    }

    case "create-group": {
      const view = state.views[command.view];
      if (view === undefined) return missing(path, `view ${command.view} does not exist`, [command.view]);
      if (view.groups[command.group.id] !== undefined) {
        return exists(path, `group ${command.group.id} already exists in view ${command.view}`, [command.group.id, command.view]);
      }
      return {
        applied: {
          state: { document, views: withKey(state.views, command.view, { ...view, groups: withKey(view.groups, command.group.id, command.group) }) },
          effects: [],
          inverse: [{ kind: "remove-group", view: command.view, group: command.group.id }],
          touchedViews: [command.view],
        },
      };
    }

    case "remove-group": {
      const view = state.views[command.view];
      if (view === undefined) return missing(path, `view ${command.view} does not exist`, [command.view]);
      const removed = view.groups[command.group];
      if (removed === undefined) return missing(path, `group ${command.group} does not exist in view ${command.view}`, [command.group, command.view]);
      return {
        applied: {
          state: { document, views: withKey(state.views, command.view, { ...view, groups: withoutKey(view.groups, command.group) }) },
          effects: [],
          inverse: [{ kind: "create-group", view: command.view, group: removed }],
          touchedViews: [command.view],
        },
      };
    }

    case "set-occurrence-group": {
      const view = state.views[command.view];
      if (view === undefined) return missing(path, `view ${command.view} does not exist`, [command.view]);
      const current = view.entityOccurrences[command.occurrence];
      if (current === undefined) {
        return missing(path, `occurrence ${command.occurrence} does not exist in view ${command.view}`, [command.occurrence, command.view]);
      }
      const next: EntityOccurrence =
        command.group === undefined
          ? (({ group: _cleared, ...rest }: EntityOccurrence & { group?: string }) => (void _cleared, rest))(current)
          : { ...current, group: command.group };
      return {
        applied: {
          state: {
            document,
            views: withKey(state.views, command.view, {
              ...view,
              entityOccurrences: withKey(view.entityOccurrences, command.occurrence, next),
            }),
          },
          effects: [],
          inverse: [
            current.group === undefined
              ? { kind: "set-occurrence-group", view: command.view, occurrence: command.occurrence }
              : { kind: "set-occurrence-group", view: command.view, occurrence: command.occurrence, group: current.group },
          ],
          touchedViews: [command.view],
        },
      };
    }

    case "set-summary-definition": {
      const view = state.views[command.view];
      if (view === undefined) return missing(path, `view ${command.view} does not exist`, [command.view]);
      const previous = view.summaryLabels?.[command.definition.id];
      const summaryLabels = { ...(view.summaryLabels ?? {}), [command.definition.id]: command.definition };
      return {
        applied: {
          state: { document, views: withKey(state.views, command.view, { ...view, summaryLabels }) },
          effects: [],
          inverse: [
            previous === undefined
              ? { kind: "remove-summary-definition", view: command.view, id: command.definition.id }
              : { kind: "set-summary-definition", view: command.view, definition: previous },
          ],
          touchedViews: [command.view],
        },
      };
    }

    case "remove-summary-definition": {
      const view = state.views[command.view];
      if (view === undefined) return missing(path, `view ${command.view} does not exist`, [command.view]);
      const removed = view.summaryLabels?.[command.id];
      if (removed === undefined) {
        return missing(path, `summary definition ${command.id} does not exist in view ${command.view}`, [command.id, command.view]);
      }
      const kept = withoutKey(view.summaryLabels as Readonly<Record<string, SummaryDefinition>>, command.id);
      const next: ViewDocument =
        Object.keys(kept).length === 0
          ? (({ summaryLabels: _dropped, ...rest }: ViewDocument) => (void _dropped, rest))(view)
          : { ...view, summaryLabels: kept };
      return {
        applied: {
          state: { document, views: withKey(state.views, command.view, next) },
          effects: [],
          inverse: [{ kind: "set-summary-definition", view: command.view, definition: removed }],
          touchedViews: [command.view],
        },
      };
    }

    case "create-view": {
      const ref = command.view.viewId;
      if (state.views[ref] !== undefined) {
        return {
          diagnostics: [
            diagnostic({ code: "view-already-exists", path, message: `view ${ref} already exists`, refs: [ref] }),
          ],
        };
      }
      return {
        applied: {
          state: { document, views: withKey(state.views, ref, command.view) },
          effects: [{ kind: "view-created", view: ref }],
          inverse: [{ kind: "delete-view", view: ref }],
          touchedViews: [ref],
        },
      };
    }

    case "delete-view": {
      const view = state.views[command.view];
      if (view === undefined) return missing(path, `view ${command.view} does not exist`, [command.view]);
      return {
        applied: {
          state: { document, views: withoutKey(state.views, command.view) },
          effects: [{ kind: "view-deleted", view: command.view }],
          // The whole view document comes back, occurrences included: deleting a
          // view deletes drawings, never business content.
          inverse: [{ kind: "create-view", view }],
          touchedViews: [],
        },
      };
    }

    case "attach-resource": {
      const ref = command.resource.id;
      if (document.resources[ref] !== undefined) return exists(path, `resource ${ref} already attached`, [ref]);
      return {
        applied: {
          state: withDocument(state, { ...document, resources: withKey(document.resources, ref, command.resource) }),
          effects: [{ kind: "resource-attached", resource: ref }],
          inverse: [{ kind: "detach-resource", resource: ref }],
          touchedViews: [],
        },
      };
    }

    case "detach-resource": {
      const resource = document.resources[command.resource];
      if (resource === undefined) return missing(path, `resource ${command.resource} is not attached`, [command.resource]);
      // No policy here, and none is needed: an attribute still pointing at the
      // detached resource makes the final state invalid (`dangling-reference`),
      // so the transaction refuses itself.
      return {
        applied: {
          state: withDocument(state, { ...document, resources: withoutKey(document.resources, command.resource) }),
          effects: [{ kind: "resource-detached", resource: command.resource }],
          inverse: [{ kind: "attach-resource", resource }],
          touchedViews: [],
        },
      };
    }

    case "apply-preserved-extension": {
      const extension = command.extension;
      if (extension.validation === "unsupported") {
        // D3-C: unsupported content is PRESERVED on import and never promoted by
        // a command. `migrate.ts`/an importer keeps it; a write refuses it.
        return {
          diagnostics: [
            diagnostic({
              code: "extension-unsupported",
              path: `${path}.extension`,
              message: `extension ${extension.namespace}@${extension.schemaVersion} is unsupported: it may be preserved on import, never applied by a command`,
              details: { namespace: extension.namespace, schemaVersion: extension.schemaVersion },
            }),
          ],
        };
      }
      const previousIndex = document.extensions.findIndex((candidate) => sameExtensionIdentity(candidate, extension));
      const previous = previousIndex === -1 ? undefined : (document.extensions[previousIndex] as PreservedExtension);
      const extensions =
        previous === undefined
          ? [...document.extensions, extension]
          : document.extensions.map((candidate, index) => (index === previousIndex ? extension : candidate));
      return {
        applied: {
          state: withDocument(state, { ...document, extensions }),
          effects: [
            { kind: "extension-applied", namespace: extension.namespace, schemaVersion: extension.schemaVersion },
          ],
          inverse: [
            previous === undefined
              ? {
                  kind: "remove-preserved-extension",
                  namespace: extension.namespace,
                  schemaVersion: extension.schemaVersion,
                  scope: extension.scope,
                }
              : { kind: "apply-preserved-extension", extension: previous },
          ],
          touchedViews: [],
        },
      };
    }

    case "remove-preserved-extension": {
      const index = document.extensions.findIndex(
        (candidate) =>
          candidate.namespace === command.namespace &&
          candidate.schemaVersion === command.schemaVersion &&
          candidate.scope.kind === command.scope.kind &&
          (candidate.scope.kind === "document" ||
            command.scope.kind === "document" ||
            candidate.scope.target === command.scope.target),
      );
      if (index === -1) {
        return missing(path, `no extension ${command.namespace}@${command.schemaVersion} in this scope`, [
          command.namespace,
        ]);
      }
      const removed = document.extensions[index] as PreservedExtension;
      return {
        applied: {
          state: withDocument(state, {
            ...document,
            extensions: document.extensions.filter((_, position) => position !== index),
          }),
          effects: [{ kind: "extension-removed", namespace: removed.namespace, schemaVersion: removed.schemaVersion }],
          inverse: [{ kind: "apply-preserved-extension", extension: removed }],
          touchedViews: [],
        },
      };
    }
  }
}

/**
 * Apply a transaction. The caller's state is never mutated; on refusal nothing
 * is returned but diagnostics, so there is no half-applied state to reason about.
 */
export function applyTransaction(
  state: DiagramState,
  transaction: Transaction,
  options: ApplyOptions,
): TransactionOutcome {
  const commandId = transaction.commandId;

  if (typeof commandId !== "string" || commandId.length === 0) {
    return {
      status: "rejected",
      commandId: String(commandId),
      diagnostics: [
        diagnostic({ code: "unknown-command", path: "commandId", message: "a transaction carries a non-empty commandId" }),
      ],
    };
  }
  if (transaction.commands.length === 0) {
    return {
      status: "rejected",
      commandId,
      diagnostics: [diagnostic({ code: "unknown-command", path: "commands", message: "a transaction carries at least one command" })],
    };
  }
  if (!Number.isInteger(transaction.baseRevision)) {
    return {
      status: "rejected",
      commandId,
      diagnostics: [
        diagnostic({
          code: "revision-conflict",
          path: "baseRevision",
          message: `baseRevision must be an integer, got ${String(transaction.baseRevision)}`,
          details: { expected: state.document.revision, seen: String(transaction.baseRevision) },
        }),
      ],
    };
  }
  if (transaction.baseRevision !== state.document.revision) {
    return {
      status: "rejected",
      commandId,
      diagnostics: [
        diagnostic({
          code: "revision-conflict",
          path: "baseRevision",
          message: `state is at revision ${state.document.revision}, the transaction was built on ${transaction.baseRevision}`,
          details: { expected: state.document.revision, seen: transaction.baseRevision },
        }),
      ],
    };
  }

  const unknown = transaction.commands.findIndex(
    (command) => !COMMAND_KINDS.includes((command as { readonly kind: CommandKind }).kind),
  );
  if (unknown !== -1) {
    return {
      status: "rejected",
      commandId,
      diagnostics: [
        diagnostic({
          code: "unknown-command",
          path: `commands[${unknown}]`,
          message: `unknown command kind ${JSON.stringify((transaction.commands[unknown] as { readonly kind?: unknown }).kind)}`,
        }),
      ],
    };
  }

  let working = state;
  const effects: Effect[] = [];
  const inverseCommands: Command[] = [];
  const touched = new Set<string>();

  for (const [index, command] of transaction.commands.entries()) {
    const result = applyOne(working, command, index);
    if ("diagnostics" in result) {
      // No partial success: the working copy is dropped whole.
      return { status: "rejected", commandId, diagnostics: result.diagnostics };
    }
    working = result.applied.state;
    effects.push(...result.applied.effects);
    // The inverse of a sequence is the reversed sequence of inverses.
    inverseCommands.unshift(...result.applied.inverse);
    for (const view of result.applied.touchedViews) touched.add(view);
  }

  const nextRevision = state.document.revision + 1;
  const views: Record<string, ViewDocument> = { ...working.views };
  for (const key of Object.keys(views)) {
    if (!touched.has(key)) continue;
    const view = views[key] as ViewDocument;
    views[key] = { ...view, revision: nextRevision };
  }
  const next: DiagramState = { document: { ...working.document, revision: nextRevision }, views };

  const diagnostics = validateState(
    next,
    options.bindings === undefined ? { registry: options.registry } : { registry: options.registry, bindings: options.bindings },
  ).filter((entry) => entry.severity === "error");
  if (diagnostics.length > 0) {
    return { status: "rejected", commandId, diagnostics };
  }

  const budget = options.inverseBudget ?? DEFAULT_INVERSE_BUDGET;
  const inverse: Inverse =
    inverseCommands.length > budget
      ? {
          kind: "non-invertible",
          code: "inverse-budget-exceeded",
          reason:
            `the inverse of this transaction needs ${inverseCommands.length} commands, above the declared budget of ${budget}; ` +
            "it is not returned because an unbounded inverse is an unbounded cost on the host's undo stack. " +
            "The state before the transaction is recoverable from the host's own snapshot, not from this outcome.",
        }
      : { kind: "invertible", commands: inverseCommands };

  return {
    status: "applied",
    commandId,
    state: next,
    effects: [...effects, { kind: "revision-bumped", from: state.document.revision, to: nextRevision }],
    inverse,
  };
}

/** One command as a transaction, for the common case and for the inverse tests. */
export function applyCommand(
  state: DiagramState,
  command: Command,
  envelope: { readonly commandId: string; readonly baseRevision: number; readonly author?: string },
  options: ApplyOptions,
): TransactionOutcome {
  return applyTransaction(
    state,
    {
      commandId: envelope.commandId,
      baseRevision: envelope.baseRevision,
      ...(envelope.author === undefined ? {} : { author: envelope.author }),
      commands: [command],
    },
    options,
  );
}

/**
 * Replay an inverse as a NEW transaction against the current state. This is what
 * "undo" is: a transaction, not a rewrite of the journal (study section 7).
 */
export function applyInverse(
  state: DiagramState,
  inverse: Inverse,
  envelope: { readonly commandId: string; readonly author?: string },
  options: ApplyOptions,
): TransactionOutcome {
  if (inverse.kind === "non-invertible") {
    return {
      status: "rejected",
      commandId: envelope.commandId,
      diagnostics: [diagnostic({ code: inverse.code, path: "inverse", message: inverse.reason })],
    };
  }
  return applyTransaction(
    state,
    {
      commandId: envelope.commandId,
      baseRevision: state.document.revision,
      ...(envelope.author === undefined ? {} : { author: envelope.author }),
      commands: inverse.commands,
    },
    options,
  );
}

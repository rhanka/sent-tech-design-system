/**
 * Filter EVALUATION, and the exclusion reasons it produces.
 *
 * `@sentropic/diagram-core` declares, validates and persists `ViewFilter`, and
 * says in as many words that it does not evaluate it: `src/view.ts` on
 * `ViewFilter` - "This lot VALIDATES and PERSISTS them; it does not evaluate
 * them. Deciding what a filter hides, and what happens to a relation whose
 * endpoint is hidden, is a presentation decision and belongs to GD-M2-CANVAS" -
 * and its README repeats it under "What is not covered yet". This module is that
 * decision, and it states the four points the persisted schema leaves open,
 * because each one has more than one defensible answer and a scene that guessed
 * silently would be impossible to review.
 *
 * DECISION 1 - SEVERAL FILTERS. Per KIND (`entity-type`, `relation-type`,
 * `attribute-equals`): the `include` filters of that kind form a whitelist an
 * element passes by matching ANY of them; the `exclude` filters of that kind
 * remove an element that matches ANY of them; exclusion wins over inclusion; and
 * the kinds are then combined with AND. Two same-kind whitelists intersected
 * instead of united would make almost every two-filter selection empty, which is
 * not what adding a second type to a legend can mean.
 *
 * DECISION 2 - WHAT `attribute-equals` APPLIES TO. `diagram-core` does not say
 * which elements it tests; the variant carries only `attribute`, `value` and
 * `mode`. It is applied here to BOTH entities and relations, since `Entity` and
 * `Relation` both carry `attributes` and nothing distinguishes them for this
 * purpose. An element that simply HAS NO such attribute matches nothing: it is
 * not excluded by an `exclude` filter and it does not pass an `include` one.
 *
 * DECISION 3 - COLLECTION ATTRIBUTES. The schema comment says the comparison is
 * "against the attribute value's own `value` field, as text". A `collection`
 * attribute value HAS NO `value` field - it has `items` (measured:
 * `packages/diagram-core/src/attributes.ts`, the `AttributeValue` union). So the
 * comment cannot be taken literally for collections. A collection matches when
 * ANY of its items' `value`, as text, equals the filter's value.
 *
 * DECISION 4 - THE CASCADE, which is the question `diagram-core` names
 * explicitly. A relation occurrence whose endpoint is not visible is EXCLUDED,
 * with reason `endpoint-hidden`, and it is REPORTED rather than dropped: study
 * invariant 1 forbids an edge disappearing silently, and an exclusion a caller
 * cannot enumerate is exactly that. A port occurrence whose owner is not visible
 * is excluded as `owner-hidden` for the same reason. A member of a `collapsed`
 * visual group is excluded as `group-collapsed`; this module evaluates the
 * `collapsed` flag and NOTHING MORE - it synthesises no group box and no
 * aggregate edge, which are later work.
 */

import type { Entity, Relation, SemanticDocument, ViewDocument, ViewFilter } from "@sentropic/diagram-core";
import type { AttributeValue, OccurrenceRef } from "@sentropic/diagram-core";

/** Why an occurrence is not in the scene. Additive; never renamed in place. */
export type ExclusionReason =
  /** Matched an `exclude` filter. */
  | "filtered-out"
  /** `include` filters of its kind exist and it matched none. */
  | "not-included"
  /** A relation occurrence with at least one endpoint that is not visible. */
  | "endpoint-hidden"
  /** A port occurrence whose owner entity occurrence is not visible. */
  | "owner-hidden"
  /** An entity occurrence in a visual group whose `collapsed` is true. */
  | "group-collapsed"
  /** A reference that resolves to nothing: the scene cannot place what it cannot resolve. */
  | "unresolved-reference"
  /** Geometry this scene cannot place, because a coordinate is not finite. */
  | "geometry-not-finite";

/**
 * Exhaustiveness is enforced by the COMPILER, not by a count in a test.
 *
 * Measured reason for this shape: the first version of this file was a literal
 * array with `satisfies readonly ExclusionReason[]`, and it silently omitted
 * `endpoint-hidden` - the very reason the cascade exists for. `satisfies`
 * rejects a member that is not in the union; it says nothing about a member that
 * is MISSING. A `Record<ExclusionReason, true>` is the assertion that has the
 * right shape: leave one key out and `npm run check` reports TS2741 naming it.
 */
const REASON_KEYS: Readonly<Record<ExclusionReason, true>> = {
  "endpoint-hidden": true,
  "filtered-out": true,
  "geometry-not-finite": true,
  "group-collapsed": true,
  "not-included": true,
  "owner-hidden": true,
  "unresolved-reference": true,
};

/** Every reason, sorted, so the list is stable whatever order the record is written in. */
export const EXCLUSION_REASONS: readonly ExclusionReason[] = (Object.keys(REASON_KEYS) as ExclusionReason[]).sort();

export interface SceneExclusion {
  readonly occurrence: OccurrenceRef;
  readonly kind: "entity" | "relation" | "port";
  readonly reason: ExclusionReason;
  /** The filter or the reference that caused it, when there is one to name. */
  readonly cause?: string;
}

/** The text a filter compares against, or `undefined` when the value has none. */
function textsOf(value: AttributeValue): readonly string[] {
  if (value.kind === "collection") return value.items.map((item) => String(item.value));
  return [String(value.value)];
}

function attributeMatches(
  attributes: Readonly<Record<string, AttributeValue>>,
  attribute: string,
  expected: string,
): boolean {
  const value = attributes[attribute];
  if (value === undefined) return false;
  return textsOf(value).includes(expected);
}

interface Verdict {
  readonly visible: boolean;
  readonly reason?: ExclusionReason;
  readonly cause?: string;
}

const VISIBLE: Verdict = { visible: true };

/**
 * Decision 1, applied to one element for one kind of filter. `matches` answers
 * whether the element matches a single filter of that kind.
 */
function verdictFor(
  filters: readonly ViewFilter[],
  matches: (filter: ViewFilter) => boolean,
): Verdict {
  let includeCount = 0;
  let included = false;
  for (const filter of filters) {
    if (filter.mode === "exclude") {
      if (matches(filter)) return { visible: false, reason: "filtered-out", cause: filter.id };
      continue;
    }
    includeCount += 1;
    if (matches(filter)) included = true;
  }
  if (includeCount > 0 && !included) return { visible: false, reason: "not-included" };
  return VISIBLE;
}

function combine(verdicts: readonly Verdict[]): Verdict {
  for (const verdict of verdicts) if (!verdict.visible) return verdict;
  return VISIBLE;
}

/** The filters of one kind, in the view's own order, which is content here (an array, not a record). */
function filtersOfKind(view: ViewDocument, kind: ViewFilter["kind"]): readonly ViewFilter[] {
  return view.filters.filter((filter) => filter.kind === kind);
}

export function entityVerdict(view: ViewDocument, entity: Entity): Verdict {
  return combine([
    verdictFor(filtersOfKind(view, "entity-type"), (filter) =>
      filter.kind === "entity-type" ? filter.types.includes(entity.type) : false,
    ),
    verdictFor(filtersOfKind(view, "attribute-equals"), (filter) =>
      filter.kind === "attribute-equals" ? attributeMatches(entity.attributes, filter.attribute, filter.value) : false,
    ),
  ]);
}

export function relationVerdict(view: ViewDocument, relation: Relation): Verdict {
  return combine([
    verdictFor(filtersOfKind(view, "relation-type"), (filter) =>
      filter.kind === "relation-type" ? filter.types.includes(relation.type) : false,
    ),
    verdictFor(filtersOfKind(view, "attribute-equals"), (filter) =>
      filter.kind === "attribute-equals"
        ? attributeMatches(relation.attributes, filter.attribute, filter.value)
        : false,
    ),
  ]);
}

export interface VisibilityInput {
  readonly document: SemanticDocument;
  readonly view: ViewDocument;
}

export interface Visibility {
  /** Occurrence references that reach the scene, as a set for the cascade to consult. */
  readonly visible: ReadonlySet<OccurrenceRef>;
  /** Every occurrence that does not, with its reason. Sorted by occurrence reference. */
  readonly exclusions: readonly SceneExclusion[];
}

/**
 * The three passes are ordered because the cascade needs them so: entity
 * occurrences first, then ports (whose owner is an entity occurrence), then
 * relations (whose endpoints are either of the two). A single pass would have to
 * guess at an owner it has not decided about yet.
 */
export function evaluateVisibility({ document, view }: VisibilityInput): Visibility {
  const visible = new Set<OccurrenceRef>();
  const exclusions: SceneExclusion[] = [];

  for (const key of Object.keys(view.entityOccurrences).sort()) {
    const occurrence = view.entityOccurrences[key]!;
    const entity = document.entities[occurrence.entity];
    if (entity === undefined) {
      exclusions.push({
        occurrence: occurrence.id,
        kind: "entity",
        reason: "unresolved-reference",
        cause: occurrence.entity,
      });
      continue;
    }
    const group = occurrence.group === undefined ? undefined : view.groups[occurrence.group];
    if (group !== undefined && group.collapsed === true) {
      exclusions.push({ occurrence: occurrence.id, kind: "entity", reason: "group-collapsed", cause: group.id });
      continue;
    }
    const verdict = entityVerdict(view, entity);
    if (!verdict.visible) {
      exclusions.push({
        occurrence: occurrence.id,
        kind: "entity",
        reason: verdict.reason!,
        ...(verdict.cause === undefined ? {} : { cause: verdict.cause }),
      });
      continue;
    }
    visible.add(occurrence.id);
  }

  for (const key of Object.keys(view.portOccurrences).sort()) {
    const occurrence = view.portOccurrences[key]!;
    if (document.ports[occurrence.port] === undefined) {
      exclusions.push({
        occurrence: occurrence.id,
        kind: "port",
        reason: "unresolved-reference",
        cause: occurrence.port,
      });
      continue;
    }
    if (!visible.has(occurrence.ownerOccurrence)) {
      exclusions.push({
        occurrence: occurrence.id,
        kind: "port",
        reason: "owner-hidden",
        cause: occurrence.ownerOccurrence,
      });
      continue;
    }
    visible.add(occurrence.id);
  }

  for (const key of Object.keys(view.relationOccurrences).sort()) {
    const occurrence = view.relationOccurrences[key]!;
    const relation = document.relations[occurrence.relation];
    if (relation === undefined) {
      exclusions.push({
        occurrence: occurrence.id,
        kind: "relation",
        reason: "unresolved-reference",
        cause: occurrence.relation,
      });
      continue;
    }
    const verdict = relationVerdict(view, relation);
    if (!verdict.visible) {
      exclusions.push({
        occurrence: occurrence.id,
        kind: "relation",
        reason: verdict.reason!,
        ...(verdict.cause === undefined ? {} : { cause: verdict.cause }),
      });
      continue;
    }
    const hidden = occurrence.endpoints.find((endpoint) => !visible.has(endpoint.occurrence));
    if (hidden !== undefined) {
      exclusions.push({
        occurrence: occurrence.id,
        kind: "relation",
        reason: "endpoint-hidden",
        cause: hidden.occurrence,
      });
      continue;
    }
    visible.add(occurrence.id);
  }

  exclusions.sort((left, right) => (left.occurrence < right.occurrence ? -1 : left.occurrence > right.occurrence ? 1 : 0));
  return { visible, exclusions };
}
